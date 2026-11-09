// Color math with no dependencies. All functions take and return sRGB hex strings
// ("#rrggbb") unless the name says otherwise.

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const normHue = (h) => ((h % 360) + 360) % 360;

export const hexToRgb = (hex) => {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

export const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

export const hexToHsl = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === rn) h = 60 * (((gn - bn) / d) % 6);
  else if (max === gn) h = 60 * ((bn - rn) / d + 2);
  else h = 60 * ((rn - gn) / d + 4);
  return { h: normHue(h), s, l };
};

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

const hexToLinear = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  return [r, g, b].map((v) => toLinear(v / 255));
};

const linearToHex = ([r, g, b]) =>
  rgbToHex({
    r: clamp01(fromLinear(r)) * 255,
    g: clamp01(fromLinear(g)) * 255,
    b: clamp01(fromLinear(b)) * 255,
  });

// OKLab, from Björn Ottosson's reference implementation.
const linearToOklab = ([r, g, b]) => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const oklabToLinear = ([L, a, b]) => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
};

export const hexToOklch = (hex) => {
  const [L, a, b] = linearToOklab(hexToLinear(hex));
  return { l: L, c: Math.hypot(a, b), h: normHue((Math.atan2(b, a) * 180) / Math.PI) };
};

// Converts to hex. Out-of-gamut colors are reduced in chroma (hue and lightness kept)
// until they fit in sRGB.
export const oklchToHex = ({ l, c, h }) => {
  const toLin = (chroma) => {
    const rad = (h * Math.PI) / 180;
    return oklabToLinear([l, chroma * Math.cos(rad), chroma * Math.sin(rad)]);
  };
  const inGamut = (lin) => lin.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
  if (inGamut(toLin(c))) return linearToHex(toLin(c));
  let lo = 0;
  let hi = c;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(toLin(mid))) lo = mid;
    else hi = mid;
  }
  return linearToHex(toLin(lo));
};

// CIE LCh(ab), D65 white point. Used only for the ANSI bright derivation.
const D65 = [0.95047, 1, 1.08883];
const labF = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
const labFInv = (t) => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27));

const hexToLch = (hex) => {
  const [r, g, b] = hexToLinear(hex);
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / D65[0];
  const y = (0.2126729 * r + 0.7151522 * g + 0.072175 * b) / D65[1];
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / D65[2];
  const [fx, fy, fz] = [labF(x), labF(y), labF(z)];
  const L = 116 * fy - 16;
  const A = 500 * (fx - fy);
  const B = 200 * (fy - fz);
  return { l: L, c: Math.hypot(A, B), h: normHue((Math.atan2(B, A) * 180) / Math.PI) };
};

const lchToHex = ({ l, c, h }) => {
  const rad = (h * Math.PI) / 180;
  const fy = (l + 16) / 116;
  const fx = fy + (c * Math.cos(rad)) / 500;
  const fz = fy - (c * Math.sin(rad)) / 200;
  const [x, y, z] = [labFInv(fx) * D65[0], labFInv(fy) * D65[1], labFInv(fz) * D65[2]];
  return linearToHex([
    3.2404542 * x - 1.5371385 * y - 0.4985314 * z,
    -0.969266 * x + 1.8760108 * y + 0.041556 * z,
    0.0556434 * x - 0.2040259 * y + 1.0572252 * z,
  ]);
};

// Style guide footnote for dark flavors: lightness * 0.94, chroma + 8, hue + 2,
// applied in CIE LCh(ab). This gives Mocha red bright as #f37899 (official #f37799).
export const brightVariant = (hex) => {
  const { l, c, h } = hexToLch(hex);
  return lchToHex({ l: l * 0.94, c: c + 8, h: normHue(h + 2) });
};

const luminance = (hex) => {
  const [r, g, b] = hexToLinear(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// WCAG 2.x contrast ratio, 1 to 21.
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Euclidean distance in OKLab.
export const oklchDistance = (a, b) => {
  const [l1, a1, b1] = linearToOklab(hexToLinear(a));
  const [l2, a2, b2] = linearToOklab(hexToLinear(b));
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
};
