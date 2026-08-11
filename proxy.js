// netlify/functions/proxy.js
// Proxy sederhana: browser -> function ini -> server tujuan -> balik ke browser
// dengan header CORS terbuka, jadi browser tidak pernah kena blokir CORS
// karena request "sebenarnya" ke Pinterest/API dilakukan di server, bukan di browser.

const ALLOWED_HOSTS = [
  "api.nexray.eu.cc",
  "pinimg.com",
  "pinterest.com",
];

function isAllowedHost(hostname) {
  return ALLOWED_HOSTS.some(
    (h) => hostname === h || hostname.endsWith("." + h)
  );
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400",
  };
}

exports.handler = async function (event) {
  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  const rawUrl = event.queryStringParameters && event.queryStringParameters.url;
  if (!rawUrl) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Parameter 'url' wajib diisi. Contoh: /api/proxy?url=..." }),
    };
  }

  let targetUrl;
  try {
    targetUrl = decodeURIComponent(rawUrl);
    const parsed = new URL(targetUrl);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Protokol tidak diizinkan");
    }
    if (!isAllowedHost(parsed.hostname)) {
      return {
        statusCode: 403,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Domain '${parsed.hostname}' tidak diizinkan diproxy.` }),
      };
    }
  } catch (err) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ error: "URL tidak valid", detail: err.message }),
    };
  }

  try {
    // Teruskan Range header supaya video/video seeking tetap berfungsi
    const upstreamHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      Accept: "*/*",
    };
    if (event.headers && (event.headers.range || event.headers.Range)) {
      upstreamHeaders["Range"] = event.headers.range || event.headers.Range;
    }

    const upstream = await fetch(targetUrl, { headers: upstreamHeaders });

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const contentRange = upstream.headers.get("content-range");
    const acceptRanges = upstream.headers.get("accept-ranges");

    const arrayBuffer = await upstream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Kalau ini playlist .m3u8, ubah semua URL segmen di dalamnya
    // supaya ikut lewat proxy juga (jaga-jaga kalau frontend tidak
    // menangani rewrite via HLS loader).
    let bodyBuffer = buffer;
    let isBase64 = true;

    if (contentType.includes("mpegurl") || targetUrl.endsWith(".m3u8")) {
      const text = buffer.toString("utf-8");
      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);
      const proxyBase = `${getSelfBase(event)}/api/proxy?url=`;

      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) return line;
          const absolute = trimmed.startsWith("http")
            ? trimmed
            : baseUrl + trimmed;
          return proxyBase + encodeURIComponent(absolute);
        })
        .join("\n");

      bodyBuffer = Buffer.from(rewritten, "utf-8");
      isBase64 = false;
    }

    const headers = {
      ...corsHeaders(),
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=300",
    };
    if (contentRange) headers["Content-Range"] = contentRange;
    if (acceptRanges) headers["Accept-Ranges"] = acceptRanges;

    return {
      statusCode: upstream.status,
      headers,
      body: isBase64 ? bodyBuffer.toString("base64") : bodyBuffer.toString("utf-8"),
      isBase64Encoded: isBase64,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Gagal mengambil data dari server tujuan", detail: err.message }),
    };
  }
};

function getSelfBase(event) {
  const proto = (event.headers && (event.headers["x-forwarded-proto"] || "https")) || "https";
  const host = event.headers && (event.headers.host || event.headers.Host);
  return `${proto}://${host}`;
}
