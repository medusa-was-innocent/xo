import * as THREE from "three";
import type { CelestialBody } from "@/lib/catalog";

function hexRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(v: number, a = 0, b = 1) {
  return Math.max(a, Math.min(b, v));
}

function fade(t: number) {
  return t * t * (3 - 2 * t);
}

function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}

function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;
  const u = fade(xf);
  const v = fade(yf);
  const w = fade(zf);
  const aaa = hash3(xi, yi, zi);
  const aba = hash3(xi, yi + 1, zi);
  const aab = hash3(xi, yi, zi + 1);
  const abb = hash3(xi, yi + 1, zi + 1);
  const baa = hash3(xi + 1, yi, zi);
  const bba = hash3(xi + 1, yi + 1, zi);
  const bab = hash3(xi + 1, yi, zi + 1);
  const bbb = hash3(xi + 1, yi + 1, zi + 1);
  return lerp(
    lerp(lerp(aaa, baa, u), lerp(aba, bba, u), v),
    lerp(lerp(aab, bab, u), lerp(abb, bbb, u), v),
    w,
  );
}

function fbm3(x: number, y: number, z: number, oct = 5) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < oct; i++) {
    sum += amp * noise3(x * freq, y * freq, z * freq);
    freq *= 2.05;
    amp *= 0.5;
  }
  return sum;
}

function mixRgb(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
) {
  return {
    r: lerp(a.r, b.r, t),
    g: lerp(a.g, b.g, t),
    b: lerp(a.b, b.b, t),
  };
}

function rgbByte(c: { r: number; g: number; b: number }, a = 1) {
  return {
    r: clamp(c.r, 0, 255) | 0,
    g: clamp(c.g, 0, 255) | 0,
    b: clamp(c.b, 0, 255) | 0,
    a: clamp(a, 0, 1),
  };
}

function seedFrom(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function texFromImageData(
  img: ImageData,
  srgb: boolean,
  wrapS: THREE.Wrapping = THREE.RepeatWrapping,
  wrapT: THREE.Wrapping = THREE.ClampToEdgeWrapping,
) {
  const data = new Uint8Array(img.data.length);
  data.set(img.data);
  const tex = new THREE.DataTexture(data, img.width, img.height, THREE.RGBAFormat);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = wrapS;
  tex.wrapT = wrapT;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.flipY = true;
  tex.needsUpdate = true;
  return tex;
}

function makeImage(w: number, h: number) {
  try {
    return new ImageData(w, h);
  } catch {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return ctx.createImageData(w, h);
  }
}

export type TexQuality = "low" | "high";

function isMobileGpu() {
  if (typeof window === "undefined") return true;
  return window.innerWidth < 720 || (navigator.maxTouchPoints > 1 && window.innerWidth < 1100);
}

function mapSize(_body: CelestialBody, quality: TexQuality): [number, number] {
  if (quality === "low") return [96, 48];
  if (isMobileGpu()) return [384, 192];
  return [512, 256];
}

export type PlanetTextures = {
  map: THREE.Texture;
  roughnessMap: THREE.Texture | null;
  normalMap: THREE.Texture | null;
  emissiveMap: THREE.Texture | null;
  clouds: THREE.Texture | null;
};

function solidFallback(body: CelestialBody): PlanetTextures {
  const c = hexRgb(body.pbr.detail);
  const data = new Uint8Array([c.r, c.g, c.b, 255]);
  const tex = new THREE.DataTexture(data, 1, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return { map: tex, roughnessMap: null, normalMap: null, emissiveMap: null, clouds: null };
}

export function getPreviewTextures(body: CelestialBody): PlanetTextures {
  return solidFallback(body);
}

const planetCache = new Map<string, PlanetTextures>();
const ringCache = new Map<string, THREE.Texture>();

export function getPlanetTextures(body: CelestialBody, quality: TexQuality): PlanetTextures {
  const key = `${body.id}:${quality}:${isMobileGpu() ? "m" : "d"}`;
  const hit = planetCache.get(key);
  if (hit) return hit;
  try {
    const made = makePlanetTextures(body, quality);
    planetCache.set(key, made);
    return made;
  } catch {
    const fb = solidFallback(body);
    planetCache.set(key, fb);
    return fb;
  }
}

export function makePlanetTextures(body: CelestialBody, quality: TexQuality = "high"): PlanetTextures {
  const [w, h] = mapSize(body, quality);
  const img = makeImage(w, h);
  const emitImg = makeImage(w, h);
  if (!img || !emitImg) return solidFallback(body);
  const data = img.data;
  const heightMap = new Float32Array(w * h);
  const ed = emitImg.data;

  const base = hexRgb(body.pbr.base);
  const detail = hexRgb(body.pbr.detail);
  const emit = hexRgb(body.pbr.emission);
  const rng = mulberry32(seedFrom(body.id));
  const offset = rng() * 40;

  const sample = (x: number, y: number) => {
    const u = x / w;
    const v = y / (h - 1);
    const lon = u * Math.PI * 2;
    const lat = (0.5 - v) * Math.PI;
    const cl = Math.cos(lat);
    return {
      px: cl * Math.cos(lon),
      py: Math.sin(lat),
      pz: cl * Math.sin(lon),
      lat,
      lon,
      v,
    };
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const { px, py, pz, lat, v } = sample(x, y);
      const n1 = fbm3(px * 2.2 + offset, py * 2.2, pz * 2.2 + offset, 4);
      const n2 = fbm3(px * 6.4 + 8, py * 6.4, pz * 6.4, 3);
      const n3 = fbm3(px * 14.0, py * 14.0, pz * 14.0, 2);
      const pole = clamp((Math.abs(lat) - 0.95) / 0.55);
      let col = { ...base };
      let height = n1;
      let er = 0;
      let eg = 0;
      let eb = 0;
      let ea = 0;

      switch (body.id) {
        case "mdm": {
          const c1 = Math.pow(clamp(1 - Math.abs(n2 - 0.62) * 6.2), 3);
          const c2 = Math.pow(clamp(1 - Math.abs(n3 - 0.47) * 12), 4);
          const c3 = Math.pow(clamp(1 - Math.abs(fbm3(px * 28, py * 28, pz * 28, 2) - 0.54) * 16), 5);
          const caloris = clamp(1 - Math.hypot(px - 0.38, py + 0.1, pz - 0.18) * 2.6);
          const rim = Math.pow(
            clamp(1 - Math.abs(Math.hypot(px - 0.38, py + 0.1, pz - 0.18) - 0.4) * 16),
            2,
          );
          const scarps = Math.pow(Math.abs(Math.sin(px * 24 + n1 * 7 + pz * 8)), 10);
          const rays = Math.pow(clamp(Math.cos(Math.atan2(pz, px) * 8 + n2)), 12) * c1;
          col = mixRgb({ r: 126, g: 108, b: 92 }, { r: 68, g: 38, b: 24 }, n1);
          col = mixRgb(col, { r: 46, g: 26, b: 16 }, c1 * 0.78);
          col = mixRgb(col, { r: 32, g: 20, b: 12 }, (c2 + c3) * 0.45);
          col = mixRgb(col, { r: 168, g: 132, b: 96 }, caloris * 0.38);
          col = mixRgb(col, { r: 92, g: 58, b: 36 }, rim * 0.6);
          col = mixRgb(col, { r: 214, g: 176, b: 128 }, rays * 0.5);
          col = mixRgb(col, detail, scarps * 0.2);
          col = mixRgb(col, { r: 214, g: 206, b: 196 }, pole * 0.45);
          height = n1 * 0.38 + c1 * 0.9 + c2 * 0.5 + rim * 0.45 + scarps * 0.22;
          er = emit.r * (c1 * 0.35 + rays * 0.25);
          eg = emit.g * c1 * 0.2;
          ea = c1 * 0.28;
          break;
        }
        case "idol": {
          const swirl = fbm3(px * 2.6 + n1 * 2.1, py * 0.55, pz * 2.6, 5);
          const band = 0.5 + 0.5 * Math.sin(py * 11 + swirl * 3.2);
          const vortex = clamp(1 - Math.hypot(px, pz) * 1.2) * clamp((Math.abs(lat) - 0.98) / 0.5);
          const highland = smoothstep(0.52, 0.74, n1 + n2 * 0.12);
          col = mixRgb({ r: 214, g: 170, b: 96 }, { r: 164, g: 88, b: 44 }, swirl);
          col = mixRgb(col, { r: 118, g: 42, b: 86 }, band * 0.38);
          col = mixRgb(col, { r: 82, g: 22, b: 92 }, highland * 0.42);
          col = mixRgb(col, { r: 255, g: 214, b: 148 }, vortex * 0.55);
          col = mixRgb(col, detail, Math.pow(n1, 2) * 0.22);
          height = swirl * 0.2 + highland * 0.14 + vortex * 0.08;
          er = emit.r * (0.28 + swirl * 0.2);
          eg = emit.g * 0.16;
          eb = emit.b * (0.4 + vortex * 0.35);
          ea = 0.22 + n1 * 0.14;
          break;
        }
        case "hut": {
          const land = smoothstep(0.46, 0.58, n1 + n2 * 0.15);
          const ocean = mixRgb({ r: 8, g: 42, b: 78 }, { r: 18, g: 88, b: 118 }, n2);
          const soil = mixRgb({ r: 42, g: 92, b: 38 }, { r: 229, g: 91, b: 19 }, n2);
          const desert = mixRgb(soil, { r: 210, g: 170, b: 70 }, n3);
          col = mixRgb(ocean, desert, land);
          const ice = clamp((Math.abs(lat) - 1.12) / 0.32);
          col = mixRgb(col, { r: 230, g: 240, b: 255 }, ice);
          col = mixRgb(col, { r: 255, g: 200, b: 90 }, pole * 0.08);
          height = land * 0.55 + n3 * 0.2;
          const cities = land * Math.pow(n3, 6) * (1 - ice);
          er = 255 * cities;
          eg = 170 * cities;
          eb = 60 * cities;
          ea = cities * 0.85;
          break;
        }
        case "after-hours": {
          const dust = fbm3(px * 3.2, py * 3.2, pz * 3.2, 4);
          const canyon = Math.pow(clamp(1 - Math.abs(lat + 0.08 - n2 * 0.2) * 8), 2) * (n1 > 0.4 ? 1 : 0);
          col = mixRgb({ r: 92, g: 28, b: 14 }, { r: 168, g: 52, b: 22 }, dust);
          col = mixRgb(col, { r: 48, g: 16, b: 10 }, n2 * 0.4);
          col = mixRgb(col, { r: 220, g: 90, b: 40 }, canyon * 0.55);
          const ice = clamp((Math.abs(lat) - 1.18) / 0.28);
          col = mixRgb(col, { r: 236, g: 228, b: 214 }, ice);
          height = dust * 0.45 + canyon * 0.85 + n3 * 0.2;
          const vents = Math.pow(n3, 5);
          er = emit.r * (0.2 + vents);
          eg = emit.g * vents * 0.5;
          ea = 0.15 + vents * 0.7;
          break;
        }
        case "bbtm": {
          const warped = py * 7 + fbm3(px * 2.4, py * 0.6, pz * 2.4, 3) * 1.8;
          const band = 0.5 + 0.5 * Math.sin(warped);
          const storm = fbm3(px * 4.5, py * 3.2, pz * 4.5, 3);
          col = mixRgb({ r: 168, g: 128, b: 78 }, { r: 214, g: 186, b: 132 }, band);
          col = mixRgb(col, { r: 120, g: 78, b: 42 }, storm * 0.35);
          const spotX = px - 0.55;
          const spotY = py + 0.08;
          const spot = clamp(1 - Math.hypot(spotX * 2.4, spotY * 4.2));
          col = mixRgb(col, { r: 176, g: 62, b: 32 }, Math.pow(spot, 1.6) * 0.9);
          col = mixRgb(col, { r: 255, g: 224, b: 170 }, Math.pow(n3, 3) * 0.25);
          height = band * 0.2 + storm * 0.25 + spot * 0.15;
          er = emit.r * (0.12 + spot * 0.4);
          eg = emit.g * 0.1;
          ea = 0.12 + spot * 0.25;
          break;
        }
        case "starboy": {
          const warped = py * 6.2 + fbm3(px * 2.1, py * 0.5, pz * 2.1, 3) * 1.2;
          const band = 0.5 + 0.5 * Math.sin(warped);
          col = mixRgb({ r: 18, g: 16, b: 22 }, { r: 58, g: 44, b: 62 }, band);
          col = mixRgb(col, { r: 210, g: 186, b: 140 }, band * 0.28);
          col = mixRgb(col, detail, Math.pow(n2, 2) * 0.22);
          const hex = Math.abs(Math.cos(6 * Math.atan2(pz, px))) * clamp((lat - 0.95) / 0.4);
          col = mixRgb(col, { r: 255, g: 70, b: 150 }, hex * 0.55);
          height = band * 0.18 + n2 * 0.12;
          const glow = Math.pow(n3, 4) + hex * 0.6;
          er = emit.r * glow;
          eg = emit.g * glow * 0.4;
          eb = emit.b * glow * 0.7;
          ea = 0.2 + glow * 0.55;
          break;
        }
        case "kiss-land": {
          const band = 0.5 + 0.5 * Math.sin(py * 9 + n1 * 2);
          col = mixRgb({ r: 12, g: 78, b: 70 }, { r: 36, g: 210, b: 150 }, n1);
          col = mixRgb(col, { r: 6, g: 32, b: 28 }, band * 0.35);
          col = mixRgb(col, detail, Math.pow(n2, 2) * 0.3);
          height = n1 * 0.22 + band * 0.08;
          const neon = Math.pow(n3, 5);
          er = 40 * neon;
          eg = emit.g * (0.3 + neon);
          eb = 80 * neon;
          ea = 0.22 + neon * 0.6;
          break;
        }
        case "dawn-fm": {
          const warped = py * 11 + fbm3(px * 1.9, py * 0.38, pz * 1.9, 4) * 2.3;
          const band = 0.5 + 0.5 * Math.sin(warped);
          const streak = Math.pow(clamp(n2 * 1.12), 3.2);
          const spot = clamp(1 - Math.hypot(px + 0.44, (py - 0.16) * 1.7) * 3.05);
          const spotCore = Math.pow(spot, 2.1);
          const cirrus = Math.pow(clamp(n3 - 0.32), 2.1) * (1 - band * 0.28);
          col = mixRgb({ r: 4, g: 26, b: 70 }, { r: 36, g: 152, b: 214 }, n1);
          col = mixRgb(col, { r: 6, g: 14, b: 44 }, band * 0.58);
          col = mixRgb(col, { r: 186, g: 232, b: 255 }, cirrus * 0.58);
          col = mixRgb(col, { r: 4, g: 8, b: 28 }, spotCore * 0.88);
          col = mixRgb(col, { r: 36, g: 84, b: 132 }, spot * 0.4);
          col = mixRgb(col, { r: 150, g: 214, b: 255 }, pole * 0.38);
          height = n1 * 0.14 + streak * 0.24 + spot * 0.2 + cirrus * 0.12;
          er = 48;
          eg = emit.g * (0.38 + streak * 0.2);
          eb = emit.b * (0.75 + cirrus * 0.2);
          ea = 0.3 + streak * 0.22;
          break;
        }
        case "trilogy": {
          const ice = smoothstep(0.4, 0.64, n1);
          const dark = smoothstep(0.26, 0.5, 1 - n1 + n2 * 0.22);
          const cthulhu = clamp(1 - Math.abs(lat) * 2.35) * smoothstep(0.32, 0.56, 1 - n1);
          const crater = Math.pow(clamp(1 - Math.abs(n2 - 0.58) * 7.5), 3);
          const heart = heartMask(px, py, pz);
          const mtn = Math.pow(n3, 2) * ice * (1 - heart);
          col = mixRgb({ r: 20, g: 24, b: 30 }, { r: 198, g: 210, b: 220 }, ice);
          col = mixRgb(col, { r: 8, g: 10, b: 14 }, dark * 0.68);
          col = mixRgb(col, { r: 14, g: 12, b: 16 }, cthulhu * 0.8);
          col = mixRgb(col, { r: 232, g: 218, b: 204 }, heart * 0.94);
          col = mixRgb(col, { r: 42, g: 40, b: 44 }, crater * 0.55);
          col = mixRgb(col, { r: 236, g: 242, b: 248 }, mtn * 0.45);
          col = mixRgb(col, detail, n3 * 0.1);
          height = ice * 0.28 + heart * 0.06 + crater * 0.62 + mtn * 0.5 + cthulhu * 0.12;
          er = emit.r * (0.12 + heart * 0.2);
          eg = emit.g * 0.22;
          eb = emit.b * (0.38 + ice * 0.15);
          ea = 0.14 + ice * 0.12;
          break;
        }
        default: {
          col = mixRgb(base, detail, n1);
          height = n1;
        }
      }

      const grain = (n3 - 0.5) * 18;
      col = { r: col.r + grain, g: col.g + grain, b: col.b + grain };
      const px4 = rgbByte(col);
      data[i] = px4.r;
      data[i + 1] = px4.g;
      data[i + 2] = px4.b;
      data[i + 3] = 255;
      heightMap[y * w + x] = height;
      ed[i] = clamp(er, 0, 255) | 0;
      ed[i + 1] = clamp(eg, 0, 255) | 0;
      ed[i + 2] = clamp(eb, 0, 255) | 0;
      ed[i + 3] = 255;
      void ea;
    }
  }

  const skipExtras = quality === "low";
  let roughnessMap: THREE.Texture | null = null;
  let normalMap: THREE.Texture | null = null;

  if (!skipExtras) {
    const rimg = makeImage(w, h);
    const nimg = makeImage(w, h);
    if (rimg && nimg) {
      const rd = rimg.data;
      const nd = nimg.data;
      const strength =
        body.id === "mdm" || body.id === "after-hours" || body.id === "trilogy" ? 5.1 : 2.6;
      const baseRough = body.pbr.roughness;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const h00 = heightMap[y * w + x];
          const hx1 = heightMap[y * w + ((x + 1) % w)];
          const hx0 = heightMap[y * w + ((x - 1 + w) % w)];
          const hy1 = heightMap[Math.min(h - 1, y + 1) * w + x];
          const hy0 = heightMap[Math.max(0, y - 1) * w + x];
          let nx = (hx0 - hx1) * strength;
          let ny = (hy0 - hy1) * strength;
          let nz = 1;
          const inv = 1 / Math.hypot(nx, ny, nz);
          nx *= inv;
          ny *= inv;
          nz *= inv;
          nd[i] = (nx * 0.5 + 0.5) * 255;
          nd[i + 1] = (ny * 0.5 + 0.5) * 255;
          nd[i + 2] = (nz * 0.5 + 0.5) * 255;
          nd[i + 3] = 255;
          const rough = clamp(baseRough * 0.7 + h00 * 0.45 + (body.pbr.metalness > 0.5 ? 0 : 0.08));
          const rb = (rough * 255) | 0;
          rd[i] = rb;
          rd[i + 1] = rb;
          rd[i + 2] = rb;
          rd[i + 3] = 255;
        }
      }
      roughnessMap = texFromImageData(rimg, false);
      normalMap = texFromImageData(nimg, false);
    }
  }

  let clouds: THREE.Texture | null = null;

  return {
    map: texFromImageData(img, true),
    roughnessMap,
    normalMap,
    emissiveMap: texFromImageData(emitImg, true),
    clouds,
  };
}

function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

function heartMask(px: number, py: number, pz: number) {
  const x = (px - 0.12) * 1.7;
  const y = (pz + 0.05) * 1.5;
  const latFade = clamp(1 - Math.abs(py - 0.12) * 2.6);
  const heart = x * x + Math.pow(y - Math.sqrt(Math.abs(x)), 2);
  return clamp(1 - heart * 0.85) * latFade;
}

export function makeRadialRingGeometry(inner: number, outer: number, theta = 256, radial = 28) {
  const geo = new THREE.RingGeometry(inner, outer, theta, radial);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.hypot(x, y);
    const t = clamp((r - inner) / Math.max(1e-5, outer - inner));
    const a = Math.atan2(y, x);
    uv.setXY(i, t, a / (Math.PI * 2) + 0.5);
  }
  uv.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function getRingTexture(body: CelestialBody, quality: TexQuality = "high") {
  const key = `${body.id}:${quality}`;
  const hit = ringCache.get(key);
  if (hit) return hit;
  const tex = makeRingTexture(body, quality);
  ringCache.set(key, tex);
  return tex;
}

export function makeRingTexture(body: CelestialBody, quality: TexQuality = "high") {
  const mobile = isMobileGpu();
  const w = quality === "low" || mobile ? 512 : 1024;
  const h = quality === "low" || mobile ? 48 : 64;
  const img = makeImage(w, h);
  if (!img) {
    const data = new Uint8Array([220, 214, 200, 80, 220, 214, 200, 80, 220, 214, 200, 80, 220, 214, 200, 80]);
    const tex = new THREE.DataTexture(data, 2, 2);
    tex.needsUpdate = true;
    return tex;
  }
  const data = img.data;
  const c = hexRgb(body.pbr.detail);
  const ice = { r: 232, g: 226, b: 214 };
  const rng = mulberry32(seedFrom(body.id + "-ring"));

  const densityAt = (t: number) => {
    if (body.id === "starboy") {
      let d = 0;
      if (t < 0.08) d = 0.05;
      else if (t < 0.22) d = 0.22 + 0.18 * Math.sin(t * 80);
      else if (t < 0.46) d = 0.92;
      else if (t < 0.53) d = 0.02;
      else if (t < 0.7) d = 0.78;
      else if (t < 0.73) d = 0.06;
      else if (t < 0.82) d = 0.62;
      else if (t > 0.86 && t < 0.875) d = 0.9;
      else d = Math.max(0, (1 - t) * 0.18);
      if (Math.abs(t - 0.495) < 0.018) d = 0.015;
      if (Math.abs(t - 0.715) < 0.008) d = 0.04;
      return d;
    }
    if (body.id === "bbtm") {
      let d = 0.05 + 0.08 * (0.5 + 0.5 * Math.sin(t * 70));
      if (t > 0.12 && t < 0.38) d = 0.42 + 0.18 * Math.sin(t * 90);
      if (t > 0.46 && t < 0.78) d = 0.28 + 0.12 * Math.sin(t * 50);
      if (Math.abs(t - 0.41) < 0.015) d = 0.04;
      return d * (1 - t * 0.22);
    }
    if (body.id === "kiss-land") {
      const rings = [0.12, 0.28, 0.41, 0.55, 0.69, 0.84];
      let d = 0.03;
      for (const p of rings) {
        const g = Math.abs(t - p);
        if (g < 0.012) d = Math.max(d, 0.82 - g * 40);
        else if (g < 0.03) d = Math.max(d, 0.18);
      }
      return d;
    }
    if (body.id === "dawn-fm") {
      return t > 0.22 && t < 0.78 ? 0.08 + 0.05 * Math.sin(t * 90) : 0.02;
    }
    return 0.08 + 0.12 * (0.5 + 0.5 * Math.sin(t * 42)) * (1 - t * 0.35);
  };

  for (let x = 0; x < w; x++) {
    const t = x / (w - 1);
    const d0 = densityAt(t);
    const grain = rng() * 0.12;
    for (let y = 0; y < h; y++) {
      const a = y / (h - 1);
      const spoke = 0.82 + 0.18 * Math.sin(a * Math.PI * 12 + t * 40);
      const clump = 0.9 + 0.1 * hash3(t * 80, a * 24, 2.2);
      const d = clamp(d0 * spoke * clump + (rng() - 0.5) * 0.04);
      const mixT = body.id === "starboy" ? 0.55 : body.id === "kiss-land" ? 0.3 : 0.4;
      const col = mixRgb(ice, c, mixT);
      const i = (y * w + x) * 4;
      const lit = 0.75 + grain;
      data[i] = clamp(col.r * lit, 0, 255) | 0;
      data[i + 1] = clamp(col.g * lit, 0, 255) | 0;
      data[i + 2] = clamp(col.b * lit, 0, 255) | 0;
      data[i + 3] = (clamp(d) * 255) | 0;
    }
  }
  const tex = texFromImageData(img, true, THREE.ClampToEdgeWrapping, THREE.RepeatWrapping);
  return tex;
}

export const ATMOSPHERE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

export const ATMOSPHERE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), uPower);
    float a = f * uIntensity * uPulse;
    gl_FragColor = vec4(uColor, a);
  }
`;

export const GLOW_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.4);
    float a = f * 0.48 * uIntensity * min(uPulse, 1.35);
    gl_FragColor = vec4(uColor * a, a);
  }
`;

export const RING_VERT = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vWorldN;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vWorldN = normalize((modelMatrix * vec4(0.0, 0.0, 1.0, 0.0)).xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const RING_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uPulse;
  varying vec3 vWorld;
  varying vec3 vWorldN;
  varying vec2 vUv;
  void main() {
    vec4 tex = texture2D(uMap, vUv);
    float alpha = tex.a;
    if (alpha < 0.015) discard;
    vec3 N = normalize(vWorldN);
    vec3 L = normalize(-vWorld);
    vec3 V = normalize(cameraPosition - vWorld);
    float ndl = abs(dot(N, L));
    float facing = abs(dot(N, V));
    float fill = 0.34 + 0.66 * ndl;
    float edge = pow(1.0 - facing, 2.4);
    float scatter = pow(max(dot(V, -L), 0.0), 7.0);
    float backlight = scatter * (0.55 + edge);
    vec3 col = tex.rgb * mix(vec3(1.0), uColor, 0.42) * fill * uPulse;
    col += vec3(1.0, 0.94, 0.84) * backlight * alpha * 1.45;
    col += uColor * edge * 0.35 * alpha;
    float thick = mix(1.55, 1.0, facing);
    gl_FragColor = vec4(col, clamp(alpha * 0.96 * thick, 0.0, 1.0));
  }
`;

let circleCache: THREE.Texture | null = null;

export function getSoftCircleTexture() {
  if (circleCache) return circleCache;
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  const c = (size - 1) * 0.5;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - c) / c;
      const dy = (y - c) / c;
      const d = Math.hypot(dx, dy);
      const a = d >= 1 ? 0 : Math.pow(1 - d, 2.35);
      const i = (y * size + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = (Math.min(1, a * 1.4) * 255) | 0;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.needsUpdate = true;
  tex.premultiplyAlpha = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  circleCache = tex;
  return tex;
}

const nebulaCache = new Map<string, THREE.Texture>();

export function getNebulaTexture(key: string, r: number, g: number, b: number) {
  const hit = nebulaCache.get(key);
  if (hit) return hit;
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  const blobs = [
    { x: 0.42, y: 0.48, s: 0.42, w: 1 },
    { x: 0.62, y: 0.4, s: 0.32, w: 0.8 },
    { x: 0.32, y: 0.58, s: 0.28, w: 0.7 },
    { x: 0.55, y: 0.62, s: 0.22, w: 0.55 },
  ];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1);
      const v = y / (size - 1);
      let a = 0;
      for (const blob of blobs) {
        const dx = (u - blob.x) / blob.s;
        const dy = (v - blob.y) / (blob.s * 0.62);
        const d = dx * dx + dy * dy;
        a += blob.w * Math.exp(-d * 2.4);
      }
      const edge = Math.min(u, v, 1 - u, 1 - v);
      a *= Math.min(1, edge * 3.4);
      a = Math.min(1, a * 0.55);
      const i = (y * size + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = (a * 255) | 0;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  nebulaCache.set(key, tex);
  return tex;
}
