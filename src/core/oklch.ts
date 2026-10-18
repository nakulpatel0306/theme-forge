import { hexToRgb, rgbToHex } from './color'

// OKLCH: perceptual lightness (0-1), chroma (0-~0.37), hue (degrees).
// Equal L looks equally bright across hues, which plain HSL does not, so
// generated accents sit at a consistent weight next to each other.
export type Oklch = { l: number; c: number; h: number }

const toLinear = (v: number) => {
  const s = v / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const fromLinear = (v: number) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)

export function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)]
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function oklabToLinear(L: number, a: number, b: number): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

export function labToLch([l, a, b]: [number, number, number]): Oklch {
  const h = (Math.atan2(b, a) * 180) / Math.PI
  return { l, c: Math.hypot(a, b), h: (h + 360) % 360 }
}

export function hexToOklch(hex: string): Oklch {
  const { r, g, b } = hexToRgb(hex)
  return labToLch(rgbToOklab(r, g, b))
}

// Out-of-gamut colors keep their lightness and hue and lose chroma until they
// fit, instead of clipping channels and shifting hue
export function oklchToHex({ l, c, h }: Oklch): string {
  const rad = (h * Math.PI) / 180
  const lightness = Math.min(1, Math.max(0, l))
  let chroma = Math.max(0, c)
  for (let i = 0; i < 24; i++) {
    const rgb = oklabToLinear(lightness, chroma * Math.cos(rad), chroma * Math.sin(rad))
    if (rgb.every((v) => v >= -0.0001 && v <= 1.0001)) {
      const [r, g, b] = rgb.map(fromLinear)
      return rgbToHex({ r, g, b })
    }
    chroma *= 0.9
  }
  const [r, g, b] = oklabToLinear(lightness, 0, 0).map(fromLinear)
  return rgbToHex({ r, g, b })
}

export const hueDistance = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}
