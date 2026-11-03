// Builds the Dragomir theme family: wallpaper, shortcut icons, theme.css and theme.json per variant.
// Run: node build-dragomir.cjs
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/cytv/toolkit/node_modules/playwright');

const ROOT = path.join(__dirname, 'themes');

const PALETTES = {
  rose: {
    bg: '#09090b', text: '#f4f4f5', strong: '#ffffff', muted: '#a1a1aa', icon: '#a1a1aa',
    accentRgb: '244, 63, 94', accent: '#f43f5e', engineAccent: '#f4f4f5',
    glow: 'rgba(244, 63, 94, 0.26)', glow2: 'rgba(244, 63, 94, 0.06)',
    glass: 'rgba(18, 18, 22, 0.55)', glassHi: 'rgba(255, 255, 255, 0.07)', glassLo: 'rgba(255, 255, 255, 0.015)',
    border: 'rgba(255, 255, 255, 0.1)', cardBorder: 'rgba(255, 255, 255, 0.08)',
    shadow: 'rgba(0, 0, 0, 0.45)', deepShadow: 'rgba(0, 0, 0, 0.6)',
    focusBg: '#fafafa', focusHi: '#ffffff', focusLo: '#e4e4e7', focusText: '#09090b', focusRing: '#ffffff',
    panel: 'rgba(18, 18, 22, 0.94)', scrim: 'rgba(0, 0, 0, 0.75)', divider: 'rgba(255, 255, 255, 0.08)',
    wallpaper: true,
  },
};
PALETTES.green = {
  ...PALETTES.rose,
  accentRgb: '29, 185, 84', accent: '#1db954',
  glow: 'rgba(29, 185, 84, 0.22)', glow2: 'rgba(29, 185, 84, 0.05)',
};
PALETTES.oled = {
  ...PALETTES.rose,
  bg: '#000000', glass: 'rgba(0, 0, 0, 1)', glassHi: 'rgba(255, 255, 255, 0.05)', glassLo: 'rgba(255, 255, 255, 0)',
  panel: 'rgba(0, 0, 0, 0.98)', scrim: 'rgba(0, 0, 0, 0.85)', shadow: 'rgba(0, 0, 0, 0)', deepShadow: 'rgba(0, 0, 0, 0)',
  wallpaper: false,
};
PALETTES.light = {
  bg: '#fafafa', text: '#18181b', strong: '#09090b', muted: '#52525b', icon: '#71717a',
  accentRgb: '244, 63, 94', accent: '#f43f5e', engineAccent: '#09090b',
  glow: 'rgba(244, 63, 94, 0.14)', glow2: 'rgba(244, 63, 94, 0.04)',
  glass: 'rgba(255, 255, 255, 0.75)', glassHi: 'rgba(255, 255, 255, 0.9)', glassLo: 'rgba(244, 244, 245, 0.6)',
  border: 'rgba(9, 9, 11, 0.1)', cardBorder: 'rgba(9, 9, 11, 0.08)',
  shadow: 'rgba(9, 9, 11, 0.1)', deepShadow: 'rgba(9, 9, 11, 0.18)', heroShadow: 'rgba(9, 9, 11, 0)',
  focusBg: '#09090b', focusHi: '#27272a', focusLo: '#09090b', focusText: '#fafafa', focusRing: '#09090b',
  panel: 'rgba(255, 255, 255, 0.96)', scrim: 'rgba(250, 250, 250, 0.7)', divider: 'rgba(9, 9, 11, 0.1)',
  wallpaper: true,
};

const VARIANTS = [
  { dir: 'dragomir', palette: 'rose', layout: { preset: 'dock-grid', columns: 6 },
    description: 'Minimal near-black theme inspired by dragomir.xyz: white bold type, a soft rose glow from the top, glass buttons with custom icons and a clean white focus ring.' },
  { dir: 'dragomir-green', palette: 'green', layout: { preset: 'dock-grid', columns: 6 },
    description: 'The Dragomir theme with a green glow and green highlights instead of rose.' },
  { dir: 'dragomir-light', palette: 'light', layout: { preset: 'dock-grid', columns: 6 },
    description: 'A light version of Dragomir: off-white background, dark bold type, a faint rose glow and black selected buttons.' },
  { dir: 'dragomir-oled', palette: 'oled', layout: { preset: 'dock-grid', columns: 6 },
    description: 'Dragomir on pure black for OLED screens: no background glow or shadows, thin outlines and rose highlights.' },
  { dir: 'dragomir-sidebar', palette: 'rose', layout: { preset: 'side-grid', columns: 5 },
    description: 'Dragomir with the clock and buttons in a left sidebar and apps in a grid on the right.' },
  { dir: 'dragomir-ribbon', palette: 'rose', layout: { preset: 'scenic-grid', columns: 8, allowColumnOverride: false },
    description: 'Dragomir with a big clock and a single looping row of apps along the bottom.' },
];

// Line icons (24px grid) adapted from Lucide, ISC license.
const ICONS = {
  inputs: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="m9 10 3 3 3-3"/><path d="M12 6v7"/>',
  network: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.86a10 10 0 0 1 14 0"/><path d="M8.5 16.43a5 5 0 0 1 7 0"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
};

function iconHtml(body, color) {
  return `<html><body style="margin:0;background:transparent">
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none"
 stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</svg></body></html>`;
}

function wallpaperHtml(p) {
  return `<html><body style="margin:0;width:1920px;height:1080px;background-color:${p.bg};
background-image:
 radial-gradient(85% 60% at 50% -18%, ${p.glow}, rgba(0,0,0,0) 70%),
 radial-gradient(60% 45% at 50% 115%, ${p.glow2}, rgba(0,0,0,0) 70%),
 radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02), rgba(0,0,0,0) 70%);"></body></html>`;
}

function css(p, hasWallpaper) {
  const ring = `rgba(${p.accentRgb}, 0.25)`;
  const glowA = `rgba(${p.accentRgb}, 0.4)`;
  return `/* Generated by build-dragomir.cjs. Edit the build script, not this file. */

.ctv-home { color: ${p.text}; background-color: ${p.bg}; }
.ctv-ambient { background-image: linear-gradient(0deg, transparent 0%, transparent 100%); }

.ctv-header { color: ${p.text}; }
.ctv-greeting { color: ${p.muted}; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; }
.ctv-clock { color: ${p.strong}; font-weight: 700; letter-spacing: 1px; text-shadow: 0 0 30px rgba(${p.accentRgb}, 0.18); }
.ctv-period { color: ${p.muted}; font-weight: 500; }
.ctv-date { color: ${p.muted}; font-weight: 500; }
.ctv-divider { background-color: ${p.divider}; }

.ctv-shortcut {
  color: ${p.text};
  background-color: ${p.glass};
  background-image: linear-gradient(180deg, ${p.glassHi} 0%, ${p.glassLo} 100%);
  border-style: solid;
  border-width: 1px;
  border-color: ${p.border};
  border-radius: 24px;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 6px 18px ${p.shadow};
  transition: background-color 150ms ease-out;
}
.ctv-shortcut.is-focused {
  color: ${p.focusText};
  background-color: ${p.focusBg};
  background-image: linear-gradient(180deg, ${p.focusHi} 0%, ${p.focusLo} 100%);
  border-color: ${p.focusRing};
  box-shadow: 0 0 0 3px ${ring}, 0 0 28px ${glowA}, 0 8px 20px ${p.deepShadow};
}

.ctv-input-icon { color: transparent; background-image: url(assets/icon-inputs.png); }
.ctv-network-icon { color: transparent; background-image: url(assets/icon-network.png); }
.ctv-settings-icon { color: transparent; background-image: url(assets/icon-settings.png); }
.ctv-shortcut.is-focused .ctv-input-icon { background-image: url(assets/icon-inputs-focused.png); }
.ctv-shortcut.is-focused .ctv-network-icon { background-image: url(assets/icon-network-focused.png); }
.ctv-shortcut.is-focused .ctv-settings-icon { background-image: url(assets/icon-settings-focused.png); }

.ctv-dock { background-color: ${p.glass}; border-color: ${p.cardBorder}; }
.ctv-hero { color: ${p.strong}; font-weight: 700; letter-spacing: 1px; text-shadow: 0 4px 24px ${p.heroShadow || p.deepShadow}; }
.ctv-icon { color: #fafafa; }

.ctv-card {
  border-style: solid;
  border-width: 1px;
  border-color: ${p.cardBorder};
  border-radius: 16px;
  box-shadow: 0 8px 24px ${p.shadow};
  transition: box-shadow 200ms ease-out;
}
.ctv-card.is-focused {
  border-color: ${p.focusRing};
  box-shadow: 0 0 0 1px ${ring}, 0 0 34px rgba(${p.accentRgb}, 0.35), 0 14px 30px ${p.deepShadow};
}
.ctv-card.is-moving { border-color: ${p.accent}; box-shadow: 0 0 30px rgba(${p.accentRgb}, 0.55); }

.ctv-label { color: ${p.muted}; font-weight: 500; }
.ctv-label.is-focused { color: ${p.strong}; font-weight: 700; }
.ctv-focus { border-color: ${p.focusRing}; border-radius: 18px; }

.ctv-library { background-color: ${p.scrim}; }
.ctv-library-panel {
  color: ${p.text};
  background-color: ${p.panel};
  border-color: ${p.border};
  border-radius: 24px;
  box-shadow: 0 24px 40px ${p.deepShadow};
}
.ctv-library-row { color: ${p.muted}; border-radius: 14px; }
.ctv-library-row.is-focused { color: ${p.focusText}; background-color: ${p.focusBg}; }
.ctv-library-close { color: ${p.text}; border-radius: 24px; }
.ctv-library-close.is-focused { color: ${p.focusText}; background-color: ${p.focusBg}; }

.ctv-inputs {
  color: ${p.text};
  background-color: ${p.panel};
  border-color: ${p.border};
  border-radius: 16px;
  box-shadow: 0 16px 36px ${p.deepShadow};
}
.ctv-input-row { color: ${p.muted}; border-radius: 10px; }
.ctv-input-row.is-focused { color: ${p.focusText}; background-color: ${p.focusBg}; }
`;
}

const CREDITS = `Dragomir theme family by Dragomir.

assets/wallpaper.png - original gradient artwork generated by build-dragomir.cjs. License: MIT.
assets/icon-*.png - rendered from Lucide icon paths (https://lucide.dev), ISC License,
  Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT).
  All other copyright (c) for Lucide are held by Lucide Contributors 2022. Recoloured and rasterised.
assets/preview.png - screenshot of this theme in the Clean Your TV theme preview.
`;

async function shot(page, html, out, size, transparent) {
  await page.setViewportSize(size);
  await page.setContent(html);
  await page.screenshot({ path: out, omitBackground: transparent, clip: { x: 0, y: 0, ...size } });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const v of VARIANTS) {
    const p = PALETTES[v.palette];
    const dir = path.join(ROOT, v.dir);
    const assets = path.join(dir, 'assets');
    fs.mkdirSync(assets, { recursive: true });

    const manifestPath = path.join(dir, 'theme.json');
    const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const keep = m.assets.filter(a => a.id === 'preview');
    const list = [...keep];

    for (const [name, body] of Object.entries(ICONS)) {
      await shot(page, iconHtml(body, p.icon), path.join(assets, `icon-${name}.png`), { width: 96, height: 96 }, true);
      await shot(page, iconHtml(body, p.accent), path.join(assets, `icon-${name}-focused.png`), { width: 96, height: 96 }, true);
      list.push({ id: `icon-${name}`, path: `assets/icon-${name}.png`, mediaType: 'image/png', width: 96, height: 96 });
      list.push({ id: `icon-${name}-focused`, path: `assets/icon-${name}-focused.png`, mediaType: 'image/png', width: 96, height: 96 });
    }

    if (p.wallpaper) {
      await shot(page, wallpaperHtml(p), path.join(assets, 'wallpaper.png'), { width: 1920, height: 1080 }, false);
      list.push({ id: 'wallpaper', path: 'assets/wallpaper.png', mediaType: 'image/png', width: 1920, height: 1080 });
    } else {
      fs.rmSync(path.join(assets, 'wallpaper.png'), { force: true });
    }

    m.description = v.description;
    m.layout = { preset: v.layout.preset, columns: v.layout.columns, spacingScale: 1, textScale: 1, focusScale: 1.1 };
    if (v.layout.allowColumnOverride === false) m.layout.allowColumnOverride = false;
    m.defaults = { wallpaperAssetId: p.wallpaper ? 'wallpaper' : null, dim: 0, accent: p.engineAccent };
    m.assets = list;
    fs.writeFileSync(manifestPath, JSON.stringify(m, null, 2) + '\n');
    fs.writeFileSync(path.join(dir, 'theme.css'), css(p, p.wallpaper));
    fs.writeFileSync(path.join(dir, 'CREDITS.txt'), CREDITS);

    const wp = p.wallpaper ? (fs.statSync(path.join(assets, 'wallpaper.png')).size / 1024).toFixed(0) + ' KiB wallpaper' : 'no wallpaper';
    console.log(`${v.dir}: ${v.layout.preset}, ${wp}`);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
