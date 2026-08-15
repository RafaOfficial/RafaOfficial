<div align="center">

# <img src="https://cdn.simpleicons.org/starship/5b7cfa" width="28" height="28" style="vertical-align:middle;"> **RafaXMods**

> **Blue-Cyber Web Toolkit** — Pure HTML/CSS/JS, zero dependencies, maximum vibes

[![HTML5](https://img.shields.io/badge/HTML5-%23E34F26.svg?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-%231572B6.svg?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JS-ES6%2B-%23F7DF1E.svg?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Status](https://img.shields.io/badge/API-Online-7dd3a8?style=flat-square&logo=vercel&logoColor=white)](https://rafaxmods.eu.org)
[![Size](https://img.shields.io/badge/Size-~22KB-5b7cfa?style=flat-square)](.)
[![License](https://img.shields.io/badge/License-MIT-5b7cfa?style=flat-square)](LICENSE)

</div>

---

## 🧬 Arsitektur

```
┌─────────────────────────────────────────┐
│  index.html  →  Dashboard (entry point) │
├─────────────────────────────────────────┤
│  waifu.html  →  Waifu Generator         │
│  music.html  →  Search Music            │
├─────────────────────────────────────────┤
│  Zero Framework  ·  Vanilla ES6+        │
│  CSS Variables   ·  GPU Accelerated     │
│  Single File     ·  No Build Step       │
└─────────────────────────────────────────┘
```

---

## 🎨 Waifu Generator — Deep Dive

### API Endpoint
```javascript
const endpoint = `https://api.nexray.eu.cc/random/anime?type=${encodeURIComponent(type)}&t=${Date.now()}`;
```
- `type` — kategori gambar (waifu, neko, shinobu, ...)
- `t` — cache-buster timestamp agar selalu random

### Core Logic
```javascript
async function generateWaifu(type, attempt = 1) {
  const maxAttempts = 3;

  // UI State: loading
  toggleLoading(true);
  setStage("loading");

  const img = document.getElementById("resultImage");

  img.onload = () => {
    toggleLoading(false);
    setStage("done");
    imageUrl = endpoint; // simpan untuk download
  };

  img.onerror = () => {
    if (attempt < maxAttempts) {
      setTimeout(() => generateWaifu(type, attempt + 1), 900 * attempt);
    } else {
      setStage("error"); // fallback ke placeholder
    }
  };

  img.src = endpoint; // trigger fetch
}
```

### Download Handler
```javascript
async function downloadImage() {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "RafaXMods-Waifu.jpg";
  a.click();

  URL.revokeObjectURL(url); // cleanup memory
}
```

---

## 🎨 CSS Architecture

### Design Tokens
```css
:root {
  --primary:       #5b7cfa;
  --primary-dark:  #324adf;
  --accent:        #a5b4ff;
  --success:       #7dd3a8;
  --bg:            #05060d;
  --panel:         rgba(16, 20, 44, .75);
  --border:        rgba(124, 147, 255, .22);
  --glow:          rgba(91, 124, 250, .4);
}
```

### Layered Background
```css
body::before {
  /* Layer 1: Radial glow orbs */
  background:
    radial-gradient(ellipse 55% 40% at 20% -10%, rgba(91,124,250,.28), transparent 60%),
    radial-gradient(ellipse 60% 45% at 100% 20%, rgba(124,147,255,.18), transparent 55%),
    radial-gradient(ellipse 70% 50% at 30% 110%, rgba(91,124,250,.14), transparent 60%);
}

body::after {
  /* Layer 2: Subtle grid overlay */
  background-image:
    linear-gradient(rgba(124,147,255,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124,147,255,.04) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(ellipse 90% 70% at 50% 0%, #000 20%, transparent 80%);
}
```

### Glassmorphism Panel
```css
.panel {
  background: linear-gradient(165deg, rgba(16,20,44,.8), rgba(7,10,24,.9));
  border: 1px solid var(--border);
  box-shadow: 0 0 40px rgba(91,124,250,.1), 0 16px 40px rgba(0,0,0,.5);
  backdrop-filter: blur(16px);
}
```

### Animated Top Bar
```css
.panel::before {
  content: '';
  height: 2px;
  background: linear-gradient(90deg, transparent, #5b7cfa, #a5b4ff, #5b7cfa, transparent);
  background-size: 200% 100%;
  animation: barShift 3s ease infinite;
}

@keyframes barShift {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
```

### Button Shine Effect
```css
.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 30%,
    rgba(255,255,255,.25) 50%,
    transparent 70%
  );
  transform: translateX(-120%);
  transition: transform .6s ease;
}
.btn:hover::before {
  transform: translateX(120%); /* sweep across */
}
```

### Cyber Corners (Stage)
```css
.stage::before, .stage::after,
.corner-bl, .corner-br {
  position: absolute;
  width: 18px; height: 18px;
  border: 2px solid rgba(124,147,255,.4);
  box-shadow: 0 0 12px rgba(91,124,250,.2);
}
.stage::before { top: 12px; left: 12px;  border-right: none; border-bottom: none; border-radius: 6px 0 0 0; }
.stage::after  { top: 12px; right: 12px; border-left: none;  border-bottom: none; border-radius: 0 6px 0 0; }
```

### Scanline Loader
```css
.loading::before {
  content: '';
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #5b7cfa, #a5b4ff, transparent);
  box-shadow: 0 0 12px 1px rgba(91,124,250,.5);
  animation: scanline 2s ease-in-out infinite;
}

@keyframes scanline {
  0%   { top: 14%; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 86%; opacity: 0; }
}
```

### Checkerboard Pattern (Image Preview)
```css
.checker {
  background:
    linear-gradient(45deg, #0d1226 25%, transparent 25%) -8px 0 / 16px 16px,
    linear-gradient(-45deg, #0d1226 25%, transparent 25%) -8px 0 / 16px 16px,
    linear-gradient(45deg, transparent 75%, #0d1226 75%) 0 0 / 16px 16px,
    linear-gradient(-45deg, transparent 75%, #0d1226 75%) 0 0 / 16px 16px,
    #080b18;
}
```

---

## ⚡ Animations Breakdown

| Animasi | Durasi | Property | GPU? |
|---------|--------|----------|------|
| `barShift` | 3s | `background-position` | ✅ |
| `scanline` | 2s | `top`, `opacity` | ✅ |
| `spin` | 1s | `transform: rotate` | ✅ |
| `shine` | 4s | `transform: translateX` | ✅ |
| `pop` | 0.5s | `transform`, `opacity` | ✅ |
| Hover transitions | 0.2–0.3s | `transform`, `box-shadow` | ✅ |

> Semua animasi pakai **transform & opacity only** — no layout thrashing, 60fps smooth.

---

## 📂 File Structure

```
RafaXMods/
├── 📄 index.html          # Dashboard — card grid, click counter
├── 📄 waifu.html          # Waifu Generator — full tool
├── 📄 music.html          # Search Music — full tool
├── 📄 README.md           # Dokumentasi ini
└── 📄 LICENSE             # MIT License
```

> **Single-file architecture** — tiap tool standalone, bisa dibuka langsung tanpa build step.

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/username/RafaXMods.git
cd RafaXMods

# Buka langsung (no server needed)
open index.html

# Atau serve lokal
npx serve .        # atau python3 -m http.server 8080
```

Deploy ke **Vercel**, **Netlify**, **GitHub Pages**, atau hosting statis mana aja.

---

## 🎯 Performance Notes

- **Zero Dependencies** — No React, no Vue, no jQuery
- **No Build Step** — Buka file HTML langsung jalan
- **CSS-only Effects** — Semua animasi pakai GPU layer
- **Preconnect Fonts** — `rel="preconnect"` ke Google Fonts
- **Optimized Images** — `max-height` + `object-fit: contain`
- **Memory Clean** — `URL.revokeObjectURL()` setelah download

---

## 🛠️ Tech Specs

| Aspek | Detail |
|-------|--------|
| **Markup** | HTML5 Semantic |
| **Styling** | CSS3 Custom Properties, Flexbox, CSS Grid, `backdrop-filter` |
| **Script** | Vanilla JS ES6+ (arrow functions, const/let, template literals) |
| **API** | NexRay Random Anime API |
| **Fonts** | Sora (display), Inter (body), JetBrains Mono (code) |
| **Size** | ~22KB per file (unminified) |
| **Compatibility** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |

---

## 🤝 Contributing

1. Fork repo
2. `git checkout -b feature/nama-fitur`
3. `git commit -m "feat: deskripsi singkat"`
4. `git push origin feature/nama-fitur`
5. Open Pull Request

---

## 📜 License

```
MIT License
Copyright (c) 2026 RafaXMods

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

<div align="center">

**Crafted with 💙 by RafaXMods — Blue-Cyber Series**

</div>
