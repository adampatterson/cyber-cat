# Cyber Cat

* [style-guide](https://github.com/catppuccin/catppuccin/blob/main/docs/style-guide.md)
* [palette](https://github.com/catppuccin/palette)

A single dark flavor in the Catppuccin format. The 12 neutrals (crust to text) use the green handheld-screen colors below. The accents are Catppuccin Mocha values. Green, teal and sky are changed so that they stay different from the green UI text.

## Build

Requires Node 24. There are no dependencies.

```sh
npm test        # conversion, contrast and schema checks
npm run build   # writes dist/
```

| File | Contents |
|---|---|
| `dist/palette.json` | catppuccin/palette v1.8.0 schema, flavor key `cybercat` |
| `dist/cyber-cat.css` | `--ctp-<name>` (hex) and `--ctp-<name>-rgb` (`r g b`) on `:root` |
| `dist/_cyber-cat.scss` | `$<name>` variables and a `$colors` map |
| `dist/preview.html` | Swatches, terminal, code, diff and UI samples |

To change a color, edit `src/seeds.mjs`, then run `npm test` and `npm run build`.

## Seed colors


```json
{
  "colors": {
    "lightest_green": "#d0e4b3",
    "light_mid_green": "#8bb07c",
    "dark_mid_green": "#4b6c52",
    "darkest_green": "#1e332c",
    "outer_background": "#192631",
    "border_black": "#000000"
  }
}
```
