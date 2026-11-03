# Dragomir themes for Clean Your TV

Six themes for [Clean Your TV](https://github.com/Razdva122/clean-your-tv-lg-webos), inspired by [dragomir.xyz](https://dragomir.xyz).

| Theme | Look |
| --- | --- |
| Dragomir | Near-black with a soft rose glow, white bold type, glass buttons |
| Dragomir Green | The same with a green glow and highlights |
| Dragomir Light | Off-white background, dark type, black selected buttons |
| Dragomir OLED | Pure black, no background glow, thin outlines |
| Dragomir Sidebar | Clock and buttons in a left sidebar, apps in a grid |
| Dragomir Ribbon | Big clock and one looping row of apps |

## Install on the TV

On the TV open **Settings → Appearance → Add by URL**, enter

```
https://github.com/DragomirFr/cytv-themes
```

choose **Load**, then pick a theme. Repeat for each theme you want.

## Layout

- `themes/` – editable sources (`theme.json`, `theme.css`, images, license, credits)
- `distributions/` – built packages the TV downloads
- `cytv-themes.json` – index that lets the TV find every theme from the repository URL
- `build-dragomir.cjs` – regenerates the wallpapers, icons and CSS for all variants
