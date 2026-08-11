// api/proxy.js — Vercel Serverless Function (bypass CORS Pinterest)
export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: 'Parameter ?url= wajib diisi' });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Referer': 'https://www.pinterest.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': '*/*',
      },
    });

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    // Jangan cache m3u8/ts supaya selalu fresh
    if (targetUrl.includes('.m3u8') || targetUrl.includes('.ts')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    res.status(response.status);
    res.setHeader('Content-Type', contentType);
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
