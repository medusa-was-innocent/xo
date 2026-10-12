import { i as __toESM } from "../_runtime.mjs";
import { A as RGBAFormat, D as Object3D, G as require_jsx_runtime, K as require_react, M as RingGeometry, N as SRGBColorSpace, V as Vector3, a as useFrame, b as LinearMipmapLinearFilter, d as ClampToEdgeWrapping, f as Color, j as RepeatWrapping, n as Line, o as useThree, p as DataTexture, r as Canvas, t as OrbitControls, y as LinearFilter } from "../_libs/@react-three/drei+[...].mjs";
import { c as SUN, s as PLANETS, u as bodyById } from "./router-CGpSkYs9.mjs";
import { a as minZoomDistance, i as framingDistance, n as audioEnergy, o as view, r as bodyPositions, s as useUniverse } from "./routes-ToyWMQR-.mjs";
import { n as EffectComposer, t as Bloom } from "../_libs/@react-three/postprocessing+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Universe-B2FWQfPv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var _offset = new Vector3();
var _desired = new Vector3();
var _lastBody = new Vector3();
var OVERVIEW = new Vector3(0, 22, 52);
var ORIGIN = new Vector3(0, 0, 0);
function CameraRig() {
	const controlsRef = (0, import_react.useRef)(null);
	const selectedId = useUniverse((s) => s.selectedId);
	const { camera, size } = useThree();
	const user = (0, import_react.useRef)(false);
	const panOffset = (0, import_react.useRef)(new Vector3());
	const anim = (0, import_react.useRef)(0);
	const hasLast = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		view.camera = camera;
		view.size = {
			w: size.width,
			h: size.height
		};
	}, [camera, size]);
	(0, import_react.useEffect)(() => {
		user.current = false;
		panOffset.current.set(0, 0, 0);
		anim.current = 1;
		hasLast.current = false;
		const body = bodyById(selectedId);
		const controls = controlsRef.current;
		if (!controls) return;
		controls.minDistance = body ? minZoomDistance(body.radius) : 12;
		controls.maxDistance = 280;
	}, [selectedId]);
	useFrame((_, delta) => {
		const controls = controlsRef.current;
		if (!controls) return;
		const d = Math.min(delta, .1);
		const body = bodyById(selectedId);
		const pos = selectedId ? bodyPositions.get(selectedId) : null;
		if (pos && body) {
			if (hasLast.current) {
				_offset.copy(pos).sub(_lastBody);
				camera.position.add(_offset);
				controls.target.add(_offset);
			}
			_lastBody.copy(pos);
			hasLast.current = true;
			if (user.current) panOffset.current.copy(controls.target).sub(pos);
			else {
				_desired.copy(pos).add(panOffset.current);
				controls.target.lerp(_desired, 1 - Math.exp(-d * 8.2));
			}
			if (anim.current > 0 && !user.current) {
				const dist = framingDistance(body.radius);
				_desired.set(pos.x + dist * .72, pos.y + dist * .34, pos.z + dist * .62);
				camera.position.lerp(_desired, 1 - Math.exp(-d * 2.8));
				anim.current = Math.max(0, anim.current - d / 1.05);
			}
		} else {
			hasLast.current = false;
			if (anim.current > 0 && !user.current) {
				controls.target.lerp(ORIGIN, 1 - Math.exp(-d * 3.8));
				camera.position.lerp(OVERVIEW, 1 - Math.exp(-d * 2.55));
				anim.current = Math.max(0, anim.current - d / 1.1);
			}
		}
		controls.update();
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitControls, {
		ref: controlsRef,
		makeDefault: true,
		enableDamping: true,
		dampingFactor: .12,
		enablePan: true,
		enableRotate: true,
		enableZoom: true,
		screenSpacePanning: true,
		zoomToCursor: false,
		rotateSpeed: .52,
		zoomSpeed: .72,
		panSpeed: .5,
		minPolarAngle: .22,
		maxPolarAngle: Math.PI - .28,
		minDistance: 12,
		maxDistance: 280,
		onStart: () => {
			user.current = true;
			anim.current = 0;
		},
		onEnd: () => {
			user.current = false;
		}
	});
}
var PLANET_KIND = {
	mdm: 0,
	idol: 1,
	hut: 2,
	"after-hours": 3,
	bbtm: 4,
	starboy: 5,
	"kiss-land": 6,
	"dawn-fm": 7,
	trilogy: 8
};
var PLANET_VERT = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec3 vView;
  varying vec3 vObj;
  void main() {
    vUv = uv;
    vObj = position;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mv = viewMatrix * world;
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
var PLANET_FRAG = `
  uniform sampler2D uMap;
  uniform sampler2D uNormal;
  uniform sampler2D uEmit;
  uniform float uTime;
  uniform float uPulse;
  uniform float uHasNormal;
  uniform float uHasEmit;
  uniform float uBump;
  uniform float uKind;
  uniform float uRough;
  uniform float uMetal;
  uniform vec3 uEmitColor;
  uniform float uEmitInt;
  uniform vec3 uAtmo;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec3 vView;
  varying vec3 vObj;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.07 + 13.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 albedo = pow(texture2D(uMap, vUv).rgb, vec3(2.2));
    vec3 emitTex = uHasEmit > 0.5 ? pow(texture2D(uEmit, vUv).rgb, vec3(2.2)) : vec3(0.0);
    vec3 N = normalize(vNormal);
    if (uHasNormal > 0.5) {
      vec3 nrm = texture2D(uNormal, vUv).xyz * 2.0 - 1.0;
      N = normalize(N + vec3(nrm.xy * uBump, 0.0));
    }

    vec3 V = normalize(cameraPosition - vWorld);
    vec3 L = normalize(-vWorld);
    vec3 H = normalize(L + V);
    float ndl = max(dot(N, L), 0.0);
    float wrap = ndl * 0.48 + 0.62;
    float night = pow(1.0 - ndl, 2.2);
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.4);
    float facing = max(dot(N, V), 0.0);

    float specStr = mix(0.08, 0.55, uMetal);
    float shin = mix(14.0, 72.0, uMetal);
    float kind = uKind;
    vec3 extra = vec3(0.0);
    vec3 p = normalize(vObj);

    if (kind < 0.5) {
      float crater = pow(1.0 - abs(fbm(p * 18.0) - 0.52) * 8.0, 4.0);
      albedo *= 0.92 + crater * 0.12;
      specStr = 0.06;
    } else if (kind < 1.5) {
      vec3 q = p * 2.4 + vec3(uTime * 0.035, 0.0, uTime * 0.02);
      float warp = fbm(q);
      float flow = fbm(q * 1.8 + warp * 2.4);
      extra = vec3(0.95, 0.72, 0.32) * flow * 0.22;
      albedo = mix(albedo, vec3(0.78, 0.48, 0.18), flow * 0.18);
      specStr = 0.12;
    } else if (kind < 2.5) {
      float ocean = smoothstep(0.38, 0.16, albedo.g) * smoothstep(0.12, 0.42, albedo.b);
      specStr = mix(0.1, 0.92, ocean);
      shin = mix(16.0, 96.0, ocean);
      albedo = mix(albedo, albedo * vec3(0.75, 0.9, 1.15), ocean * 0.22);
      extra += vec3(1.0, 0.78, 0.32) * emitTex * night * 1.8;
    } else if (kind < 3.5) {
      float dust = fbm(p * 7.0 + vec3(uTime * 0.01, 0.0, 0.0));
      albedo = mix(albedo, vec3(0.55, 0.16, 0.08), dust * 0.12);
      specStr = 0.08;
    } else if (kind < 4.5) {
      float bands = fbm(vec3(p.x * 2.2, p.y * 9.0 + uTime * 0.04, p.z * 2.2));
      float storm = fbm(p * 5.0 + vec3(uTime * 0.03, 0.0, 0.0));
      albedo *= 0.88 + bands * 0.22;
      albedo = mix(albedo, vec3(0.72, 0.28, 0.12), pow(storm, 3.0) * 0.18);
      specStr = 0.18;
    } else if (kind < 5.5) {
      float bands = 0.5 + 0.5 * sin(p.y * 18.0 + fbm(p * 3.0) * 2.0 + uTime * 0.05);
      albedo = mix(albedo, vec3(0.95, 0.28, 0.55), pow(bands, 3.0) * 0.12);
      specStr = 0.78;
      shin = 88.0;
      extra += vec3(1.0, 0.2, 0.55) * rim * 0.35;
    } else if (kind < 6.5) {
      float haze = fbm(p * 3.2 + vec3(0.0, uTime * 0.02, 0.0));
      albedo = mix(albedo, vec3(0.22, 0.95, 0.7), haze * 0.12);
      specStr = 0.28;
      extra += vec3(0.15, 0.9, 0.55) * rim * 0.4;
    } else if (kind < 7.5) {
      float streak = pow(fbm(vec3(p.x * 8.0, p.y * 2.4 - uTime * 0.09, p.z * 8.0)), 3.2);
      albedo = mix(albedo, vec3(0.78, 0.92, 1.0), streak * 0.38);
      specStr = 0.32;
    } else {
      float ice = smoothstep(0.42, 0.72, dot(albedo, vec3(0.33)));
      specStr = mix(0.1, 0.82, ice);
      shin = mix(12.0, 70.0, ice);
      albedo = mix(albedo, vec3(0.95, 0.93, 0.9), ice * 0.08);
    }

    float spec = pow(max(dot(N, H), 0.0), shin) * specStr * (1.0 - uRough * 0.55);
    vec3 sunCol = vec3(1.0, 0.9, 0.74);
    vec3 amb = vec3(0.34, 0.32, 0.38);
    vec3 col = albedo * (amb + wrap * sunCol * 0.92);
    col += albedo * facing * 0.28;
    col += extra;
    col += spec * mix(vec3(1.0), sunCol, 0.6);
    col += uAtmo * rim * 0.16;
    col += uEmitColor * emitTex * uEmitInt * (0.42 + night * 0.9) * uPulse;
    col += albedo * night * 0.08;

    gl_FragColor = vec4(col, 1.0);
  }
`;
var STAR_VERT = `
  attribute float aSize;
  attribute float aTwinkle;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vTw;
  varying float vBright;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = max(length(mv.xyz), 1.0);
    float tw = 0.78 + 0.22 * sin(uTime * aTwinkle + position.x * 0.31);
    vTw = tw;
    vBright = clamp(aSize / 4.2, 0.15, 1.0);
    gl_PointSize = clamp(aSize * uPixelRatio * (175.0 / dist), 1.05, 14.0) * tw;
    gl_Position = projectionMatrix * mv;
  }
`;
var STAR_FRAG = `
  varying vec3 vColor;
  varying float vTw;
  varying float vBright;
  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float d = dot(uv, uv);
    if (d > 1.0) discard;
    float core = pow(1.0 - d, 3.4);
    float halo = pow(1.0 - d, 1.15) * 0.38;
    float ax = abs(uv.x);
    float ay = abs(uv.y);
    float spike = pow(max(1.0 - (ax * 16.0 + ay * 0.55), 0.0), 7.0);
    spike += pow(max(1.0 - (ay * 16.0 + ax * 0.55), 0.0), 7.0);
    spike *= vBright * vBright * 0.55;
    vec3 col = vColor * (core * 1.45 + halo + spike) * vTw;
    float a = core + halo * 0.85 + spike * 0.35;
    gl_FragColor = vec4(col, a);
  }
`;
function PlanetSurface({ data, textures, meshRef }) {
	const mat = (0, import_react.useRef)(null);
	const rugged = data.id === "mdm" || data.id === "after-hours" || data.id === "trilogy";
	const uniforms = (0, import_react.useMemo)(() => ({
		uMap: { value: textures.map },
		uNormal: { value: textures.normalMap ?? textures.map },
		uEmit: { value: textures.emissiveMap ?? textures.map },
		uTime: { value: 0 },
		uPulse: { value: 1 },
		uHasNormal: { value: textures.normalMap ? 1 : 0 },
		uHasEmit: { value: textures.emissiveMap ? 1 : 0 },
		uBump: { value: rugged ? 1.6 : .85 },
		uKind: { value: PLANET_KIND[data.id] ?? 0 },
		uRough: { value: data.pbr.roughness },
		uMetal: { value: data.pbr.metalness },
		uEmitColor: { value: new Color(data.pbr.emission) },
		uEmitInt: { value: data.pbr.emissionIntensity },
		uAtmo: { value: new Color(data.pbr.detail) }
	}), [
		data,
		rugged,
		textures
	]);
	(0, import_react.useEffect)(() => {
		if (!mat.current) return;
		const u = mat.current.uniforms;
		u.uMap.value = textures.map;
		u.uNormal.value = textures.normalMap ?? textures.map;
		u.uEmit.value = textures.emissiveMap ?? textures.map;
		u.uHasNormal.value = textures.normalMap ? 1 : 0;
		u.uHasEmit.value = textures.emissiveMap ? 1 : 0;
	}, [textures]);
	useFrame((state) => {
		if (!mat.current) return;
		mat.current.uniforms.uTime.value = state.clock.elapsedTime;
		const live = audioEnergy.playingBodyId === data.id;
		mat.current.uniforms.uPulse.value = live ? 1 + audioEnergy.level * .32 : 1;
		const pulse = live ? audioEnergy.level : 0;
		meshRef.current?.scale.setScalar(1 + pulse * .04);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("shaderMaterial", {
		ref: mat,
		uniforms,
		vertexShader: PLANET_VERT,
		fragmentShader: PLANET_FRAG,
		toneMapped: false
	});
}
function StarPoints({ positions, colors, sizes, twinkles }) {
	const mat = (0, import_react.useRef)(null);
	const uniforms = (0, import_react.useMemo)(() => ({
		uTime: { value: 0 },
		uPixelRatio: { value: Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2) }
	}), []);
	useFrame((state) => {
		if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("points", {
		frustumCulled: false,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("bufferGeometry", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferAttribute", {
				attach: "attributes-position",
				args: [positions, 3]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferAttribute", {
				attach: "attributes-color",
				args: [colors, 3]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferAttribute", {
				attach: "attributes-aSize",
				args: [sizes, 1]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferAttribute", {
				attach: "attributes-aTwinkle",
				args: [twinkles, 1]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("shaderMaterial", {
			ref: mat,
			uniforms,
			vertexShader: STAR_VERT,
			fragmentShader: STAR_FRAG,
			vertexColors: true,
			transparent: true,
			depthWrite: false,
			blending: 2
		})]
	});
}
function hexRgb(hex) {
	const n = parseInt(hex.replace("#", ""), 16);
	return {
		r: n >> 16 & 255,
		g: n >> 8 & 255,
		b: n & 255
	};
}
function lerp(a, b, t) {
	return a + (b - a) * t;
}
function clamp(v, a = 0, b = 1) {
	return Math.max(a, Math.min(b, v));
}
function fade(t) {
	return t * t * (3 - 2 * t);
}
function hash3(x, y, z) {
	const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
	return s - Math.floor(s);
}
function noise3(x, y, z) {
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
	return lerp(lerp(lerp(aaa, baa, u), lerp(aba, bba, u), v), lerp(lerp(aab, bab, u), lerp(abb, bbb, u), v), w);
}
function fbm3(x, y, z, oct = 5) {
	let sum = 0;
	let amp = .5;
	let freq = 1;
	for (let i = 0; i < oct; i++) {
		sum += amp * noise3(x * freq, y * freq, z * freq);
		freq *= 2.05;
		amp *= .5;
	}
	return sum;
}
function mixRgb(a, b, t) {
	return {
		r: lerp(a.r, b.r, t),
		g: lerp(a.g, b.g, t),
		b: lerp(a.b, b.b, t)
	};
}
function rgbByte(c, a = 1) {
	return {
		r: clamp(c.r, 0, 255) | 0,
		g: clamp(c.g, 0, 255) | 0,
		b: clamp(c.b, 0, 255) | 0,
		a: clamp(a, 0, 1)
	};
}
function seedFrom(id) {
	let h = 2166136261;
	for (let i = 0; i < id.length; i++) {
		h ^= id.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function mulberry32$1(a) {
	return () => {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function texFromImageData(img, srgb, wrapS = RepeatWrapping, wrapT = ClampToEdgeWrapping) {
	const data = new Uint8Array(img.data.length);
	data.set(img.data);
	const tex = new DataTexture(data, img.width, img.height, RGBAFormat);
	if (srgb) tex.colorSpace = SRGBColorSpace;
	tex.anisotropy = 8;
	tex.wrapS = wrapS;
	tex.wrapT = wrapT;
	tex.generateMipmaps = true;
	tex.minFilter = LinearMipmapLinearFilter;
	tex.magFilter = LinearFilter;
	tex.flipY = true;
	tex.needsUpdate = true;
	return tex;
}
function makeImage(w, h) {
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
function isMobileGpu() {
	if (typeof window === "undefined") return true;
	return window.innerWidth < 720 || navigator.maxTouchPoints > 1 && window.innerWidth < 1100;
}
function mapSize(_body, quality) {
	if (quality === "low") return [96, 48];
	if (isMobileGpu()) return [384, 192];
	return [512, 256];
}
function solidFallback(body) {
	const c = hexRgb(body.pbr.detail);
	const data = new Uint8Array([
		c.r,
		c.g,
		c.b,
		255
	]);
	const tex = new DataTexture(data, 1, 1);
	tex.colorSpace = SRGBColorSpace;
	tex.needsUpdate = true;
	return {
		map: tex,
		roughnessMap: null,
		normalMap: null,
		emissiveMap: null,
		clouds: null
	};
}
function getPreviewTextures(body) {
	return solidFallback(body);
}
var planetCache = /* @__PURE__ */ new Map();
var ringCache = /* @__PURE__ */ new Map();
function getPlanetTextures(body, quality) {
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
function makePlanetTextures(body, quality = "high") {
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
	const offset = mulberry32$1(seedFrom(body.id))() * 40;
	const sample = (x, y) => {
		const u = x / w;
		const v = y / (h - 1);
		const lon = u * Math.PI * 2;
		const lat = (.5 - v) * Math.PI;
		const cl = Math.cos(lat);
		return {
			px: cl * Math.cos(lon),
			py: Math.sin(lat),
			pz: cl * Math.sin(lon),
			lat,
			lon,
			v
		};
	};
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
		const i = (y * w + x) * 4;
		const { px, py, pz, lat, v } = sample(x, y);
		const n1 = fbm3(px * 2.2 + offset, py * 2.2, pz * 2.2 + offset, 4);
		const n2 = fbm3(px * 6.4 + 8, py * 6.4, pz * 6.4, 3);
		const n3 = fbm3(px * 14, py * 14, pz * 14, 2);
		const pole = clamp((Math.abs(lat) - .95) / .55);
		let col = { ...base };
		let height = n1;
		let er = 0;
		let eg = 0;
		let eb = 0;
		switch (body.id) {
			case "mdm": {
				const c1 = Math.pow(clamp(1 - Math.abs(n2 - .62) * 6.2), 3);
				const c2 = Math.pow(clamp(1 - Math.abs(n3 - .47) * 12), 4);
				const c3 = Math.pow(clamp(1 - Math.abs(fbm3(px * 28, py * 28, pz * 28, 2) - .54) * 16), 5);
				const caloris = clamp(1 - Math.hypot(px - .38, py + .1, pz - .18) * 2.6);
				const rim = Math.pow(clamp(1 - Math.abs(Math.hypot(px - .38, py + .1, pz - .18) - .4) * 16), 2);
				const scarps = Math.pow(Math.abs(Math.sin(px * 24 + n1 * 7 + pz * 8)), 10);
				const rays = Math.pow(clamp(Math.cos(Math.atan2(pz, px) * 8 + n2)), 12) * c1;
				col = mixRgb({
					r: 126,
					g: 108,
					b: 92
				}, {
					r: 68,
					g: 38,
					b: 24
				}, n1);
				col = mixRgb(col, {
					r: 46,
					g: 26,
					b: 16
				}, c1 * .78);
				col = mixRgb(col, {
					r: 32,
					g: 20,
					b: 12
				}, (c2 + c3) * .45);
				col = mixRgb(col, {
					r: 168,
					g: 132,
					b: 96
				}, caloris * .38);
				col = mixRgb(col, {
					r: 92,
					g: 58,
					b: 36
				}, rim * .6);
				col = mixRgb(col, {
					r: 214,
					g: 176,
					b: 128
				}, rays * .5);
				col = mixRgb(col, detail, scarps * .2);
				col = mixRgb(col, {
					r: 214,
					g: 206,
					b: 196
				}, pole * .45);
				height = n1 * .38 + c1 * .9 + c2 * .5 + rim * .45 + scarps * .22;
				er = emit.r * (c1 * .35 + rays * .25);
				eg = emit.g * c1 * .2;
				c1 * .28;
				break;
			}
			case "idol": {
				const swirl = fbm3(px * 2.6 + n1 * 2.1, py * .55, pz * 2.6, 5);
				const band = .5 + .5 * Math.sin(py * 11 + swirl * 3.2);
				const vortex = clamp(1 - Math.hypot(px, pz) * 1.2) * clamp((Math.abs(lat) - .98) / .5);
				const highland = smoothstep(.52, .74, n1 + n2 * .12);
				col = mixRgb({
					r: 214,
					g: 170,
					b: 96
				}, {
					r: 164,
					g: 88,
					b: 44
				}, swirl);
				col = mixRgb(col, {
					r: 118,
					g: 42,
					b: 86
				}, band * .38);
				col = mixRgb(col, {
					r: 82,
					g: 22,
					b: 92
				}, highland * .42);
				col = mixRgb(col, {
					r: 255,
					g: 214,
					b: 148
				}, vortex * .55);
				col = mixRgb(col, detail, Math.pow(n1, 2) * .22);
				height = swirl * .2 + highland * .14 + vortex * .08;
				er = emit.r * (.28 + swirl * .2);
				eg = emit.g * .16;
				eb = emit.b * (.4 + vortex * .35);
				.22 + n1 * .14;
				break;
			}
			case "hut": {
				const land = smoothstep(.46, .58, n1 + n2 * .15);
				col = mixRgb(mixRgb({
					r: 8,
					g: 42,
					b: 78
				}, {
					r: 18,
					g: 88,
					b: 118
				}, n2), mixRgb(mixRgb({
					r: 42,
					g: 92,
					b: 38
				}, {
					r: 229,
					g: 91,
					b: 19
				}, n2), {
					r: 210,
					g: 170,
					b: 70
				}, n3), land);
				const ice = clamp((Math.abs(lat) - 1.12) / .32);
				col = mixRgb(col, {
					r: 230,
					g: 240,
					b: 255
				}, ice);
				col = mixRgb(col, {
					r: 255,
					g: 200,
					b: 90
				}, pole * .08);
				height = land * .55 + n3 * .2;
				const cities = land * Math.pow(n3, 6) * (1 - ice);
				er = 255 * cities;
				eg = 170 * cities;
				eb = 60 * cities;
				cities * .85;
				break;
			}
			case "after-hours": {
				const dust = fbm3(px * 3.2, py * 3.2, pz * 3.2, 4);
				const canyon = Math.pow(clamp(1 - Math.abs(lat + .08 - n2 * .2) * 8), 2) * (n1 > .4 ? 1 : 0);
				col = mixRgb({
					r: 92,
					g: 28,
					b: 14
				}, {
					r: 168,
					g: 52,
					b: 22
				}, dust);
				col = mixRgb(col, {
					r: 48,
					g: 16,
					b: 10
				}, n2 * .4);
				col = mixRgb(col, {
					r: 220,
					g: 90,
					b: 40
				}, canyon * .55);
				const ice = clamp((Math.abs(lat) - 1.18) / .28);
				col = mixRgb(col, {
					r: 236,
					g: 228,
					b: 214
				}, ice);
				height = dust * .45 + canyon * .85 + n3 * .2;
				const vents = Math.pow(n3, 5);
				er = emit.r * (.2 + vents);
				eg = emit.g * vents * .5;
				.15 + vents * .7;
				break;
			}
			case "bbtm": {
				const warped = py * 7 + fbm3(px * 2.4, py * .6, pz * 2.4, 3) * 1.8;
				const band = .5 + .5 * Math.sin(warped);
				const storm = fbm3(px * 4.5, py * 3.2, pz * 4.5, 3);
				col = mixRgb({
					r: 168,
					g: 128,
					b: 78
				}, {
					r: 214,
					g: 186,
					b: 132
				}, band);
				col = mixRgb(col, {
					r: 120,
					g: 78,
					b: 42
				}, storm * .35);
				const spotX = px - .55;
				const spotY = py + .08;
				const spot = clamp(1 - Math.hypot(spotX * 2.4, spotY * 4.2));
				col = mixRgb(col, {
					r: 176,
					g: 62,
					b: 32
				}, Math.pow(spot, 1.6) * .9);
				col = mixRgb(col, {
					r: 255,
					g: 224,
					b: 170
				}, Math.pow(n3, 3) * .25);
				height = band * .2 + storm * .25 + spot * .15;
				er = emit.r * (.12 + spot * .4);
				eg = emit.g * .1;
				.12 + spot * .25;
				break;
			}
			case "starboy": {
				const warped = py * 6.2 + fbm3(px * 2.1, py * .5, pz * 2.1, 3) * 1.2;
				const band = .5 + .5 * Math.sin(warped);
				col = mixRgb({
					r: 18,
					g: 16,
					b: 22
				}, {
					r: 58,
					g: 44,
					b: 62
				}, band);
				col = mixRgb(col, {
					r: 210,
					g: 186,
					b: 140
				}, band * .28);
				col = mixRgb(col, detail, Math.pow(n2, 2) * .22);
				const hex = Math.abs(Math.cos(6 * Math.atan2(pz, px))) * clamp((lat - .95) / .4);
				col = mixRgb(col, {
					r: 255,
					g: 70,
					b: 150
				}, hex * .55);
				height = band * .18 + n2 * .12;
				const glow = Math.pow(n3, 4) + hex * .6;
				er = emit.r * glow;
				eg = emit.g * glow * .4;
				eb = emit.b * glow * .7;
				.2 + glow * .55;
				break;
			}
			case "kiss-land": {
				const band = .5 + .5 * Math.sin(py * 9 + n1 * 2);
				col = mixRgb({
					r: 12,
					g: 78,
					b: 70
				}, {
					r: 36,
					g: 210,
					b: 150
				}, n1);
				col = mixRgb(col, {
					r: 6,
					g: 32,
					b: 28
				}, band * .35);
				col = mixRgb(col, detail, Math.pow(n2, 2) * .3);
				height = n1 * .22 + band * .08;
				const neon = Math.pow(n3, 5);
				er = 40 * neon;
				eg = emit.g * (.3 + neon);
				eb = 80 * neon;
				.22 + neon * .6;
				break;
			}
			case "dawn-fm": {
				const warped = py * 11 + fbm3(px * 1.9, py * .38, pz * 1.9, 4) * 2.3;
				const band = .5 + .5 * Math.sin(warped);
				const streak = Math.pow(clamp(n2 * 1.12), 3.2);
				const spot = clamp(1 - Math.hypot(px + .44, (py - .16) * 1.7) * 3.05);
				const spotCore = Math.pow(spot, 2.1);
				const cirrus = Math.pow(clamp(n3 - .32), 2.1) * (1 - band * .28);
				col = mixRgb({
					r: 4,
					g: 26,
					b: 70
				}, {
					r: 36,
					g: 152,
					b: 214
				}, n1);
				col = mixRgb(col, {
					r: 6,
					g: 14,
					b: 44
				}, band * .58);
				col = mixRgb(col, {
					r: 186,
					g: 232,
					b: 255
				}, cirrus * .58);
				col = mixRgb(col, {
					r: 4,
					g: 8,
					b: 28
				}, spotCore * .88);
				col = mixRgb(col, {
					r: 36,
					g: 84,
					b: 132
				}, spot * .4);
				col = mixRgb(col, {
					r: 150,
					g: 214,
					b: 255
				}, pole * .38);
				height = n1 * .14 + streak * .24 + spot * .2 + cirrus * .12;
				er = 48;
				eg = emit.g * (.38 + streak * .2);
				eb = emit.b * (.75 + cirrus * .2);
				.3 + streak * .22;
				break;
			}
			case "trilogy": {
				const ice = smoothstep(.4, .64, n1);
				const dark = smoothstep(.26, .5, 1 - n1 + n2 * .22);
				const cthulhu = clamp(1 - Math.abs(lat) * 2.35) * smoothstep(.32, .56, 1 - n1);
				const crater = Math.pow(clamp(1 - Math.abs(n2 - .58) * 7.5), 3);
				const heart = heartMask(px, py, pz);
				const mtn = Math.pow(n3, 2) * ice * (1 - heart);
				col = mixRgb({
					r: 20,
					g: 24,
					b: 30
				}, {
					r: 198,
					g: 210,
					b: 220
				}, ice);
				col = mixRgb(col, {
					r: 8,
					g: 10,
					b: 14
				}, dark * .68);
				col = mixRgb(col, {
					r: 14,
					g: 12,
					b: 16
				}, cthulhu * .8);
				col = mixRgb(col, {
					r: 232,
					g: 218,
					b: 204
				}, heart * .94);
				col = mixRgb(col, {
					r: 42,
					g: 40,
					b: 44
				}, crater * .55);
				col = mixRgb(col, {
					r: 236,
					g: 242,
					b: 248
				}, mtn * .45);
				col = mixRgb(col, detail, n3 * .1);
				height = ice * .28 + heart * .06 + crater * .62 + mtn * .5 + cthulhu * .12;
				er = emit.r * (.12 + heart * .2);
				eg = emit.g * .22;
				eb = emit.b * (.38 + ice * .15);
				.14 + ice * .12;
				break;
			}
			default:
				col = mixRgb(base, detail, n1);
				height = n1;
		}
		const grain = (n3 - .5) * 18;
		col = {
			r: col.r + grain,
			g: col.g + grain,
			b: col.b + grain
		};
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
	}
	const skipExtras = quality === "low";
	let roughnessMap = null;
	let normalMap = null;
	if (!skipExtras) {
		const rimg = makeImage(w, h);
		const nimg = makeImage(w, h);
		if (rimg && nimg) {
			const rd = rimg.data;
			const nd = nimg.data;
			const strength = body.id === "mdm" || body.id === "after-hours" || body.id === "trilogy" ? 5.1 : 2.6;
			const baseRough = body.pbr.roughness;
			for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
				const i = (y * w + x) * 4;
				const h00 = heightMap[y * w + x];
				const hx1 = heightMap[y * w + (x + 1) % w];
				const hx0 = heightMap[y * w + (x - 1 + w) % w];
				const hy1 = heightMap[Math.min(h - 1, y + 1) * w + x];
				const hy0 = heightMap[Math.max(0, y - 1) * w + x];
				let nx = (hx0 - hx1) * strength;
				let ny = (hy0 - hy1) * strength;
				let nz = 1;
				const inv = 1 / Math.hypot(nx, ny, nz);
				nx *= inv;
				ny *= inv;
				nz *= inv;
				nd[i] = (nx * .5 + .5) * 255;
				nd[i + 1] = (ny * .5 + .5) * 255;
				nd[i + 2] = (nz * .5 + .5) * 255;
				nd[i + 3] = 255;
				const rb = clamp(baseRough * .7 + h00 * .45 + (body.pbr.metalness > .5 ? 0 : .08)) * 255 | 0;
				rd[i] = rb;
				rd[i + 1] = rb;
				rd[i + 2] = rb;
				rd[i + 3] = 255;
			}
			roughnessMap = texFromImageData(rimg, false);
			normalMap = texFromImageData(nimg, false);
		}
	}
	return {
		map: texFromImageData(img, true),
		roughnessMap,
		normalMap,
		emissiveMap: texFromImageData(emitImg, true),
		clouds: null
	};
}
function smoothstep(e0, e1, x) {
	const t = clamp((x - e0) / (e1 - e0));
	return t * t * (3 - 2 * t);
}
function heartMask(px, py, pz) {
	const x = (px - .12) * 1.7;
	const y = (pz + .05) * 1.5;
	const latFade = clamp(1 - Math.abs(py - .12) * 2.6);
	return clamp(1 - (x * x + Math.pow(y - Math.sqrt(Math.abs(x)), 2)) * .85) * latFade;
}
function makeRadialRingGeometry(inner, outer, theta = 256, radial = 28) {
	const geo = new RingGeometry(inner, outer, theta, radial);
	const pos = geo.attributes.position;
	const uv = geo.attributes.uv;
	for (let i = 0; i < pos.count; i++) {
		const x = pos.getX(i);
		const y = pos.getY(i);
		const t = clamp((Math.hypot(x, y) - inner) / Math.max(1e-5, outer - inner));
		const a = Math.atan2(y, x);
		uv.setXY(i, t, a / (Math.PI * 2) + .5);
	}
	uv.needsUpdate = true;
	geo.computeVertexNormals();
	return geo;
}
function getRingTexture(body, quality = "high") {
	const key = `${body.id}:${quality}`;
	const hit = ringCache.get(key);
	if (hit) return hit;
	const tex = makeRingTexture(body, quality);
	ringCache.set(key, tex);
	return tex;
}
function makeRingTexture(body, quality = "high") {
	const mobile = isMobileGpu();
	const w = quality === "low" || mobile ? 512 : 1024;
	const h = quality === "low" || mobile ? 48 : 64;
	const img = makeImage(w, h);
	if (!img) {
		const data = new Uint8Array([
			220,
			214,
			200,
			80,
			220,
			214,
			200,
			80,
			220,
			214,
			200,
			80,
			220,
			214,
			200,
			80
		]);
		const tex = new DataTexture(data, 2, 2);
		tex.needsUpdate = true;
		return tex;
	}
	const data = img.data;
	const c = hexRgb(body.pbr.detail);
	const ice = {
		r: 232,
		g: 226,
		b: 214
	};
	const rng = mulberry32$1(seedFrom(body.id + "-ring"));
	const densityAt = (t) => {
		if (body.id === "starboy") {
			let d = 0;
			if (t < .08) d = .05;
			else if (t < .22) d = .22 + .18 * Math.sin(t * 80);
			else if (t < .46) d = .92;
			else if (t < .53) d = .02;
			else if (t < .7) d = .78;
			else if (t < .73) d = .06;
			else if (t < .82) d = .62;
			else if (t > .86 && t < .875) d = .9;
			else d = Math.max(0, (1 - t) * .18);
			if (Math.abs(t - .495) < .018) d = .015;
			if (Math.abs(t - .715) < .008) d = .04;
			return d;
		}
		if (body.id === "bbtm") {
			let d = .05 + .08 * (.5 + .5 * Math.sin(t * 70));
			if (t > .12 && t < .38) d = .42 + .18 * Math.sin(t * 90);
			if (t > .46 && t < .78) d = .28 + .12 * Math.sin(t * 50);
			if (Math.abs(t - .41) < .015) d = .04;
			return d * (1 - t * .22);
		}
		if (body.id === "kiss-land") {
			const rings = [
				.12,
				.28,
				.41,
				.55,
				.69,
				.84
			];
			let d = .03;
			for (const p of rings) {
				const g = Math.abs(t - p);
				if (g < .012) d = Math.max(d, .82 - g * 40);
				else if (g < .03) d = Math.max(d, .18);
			}
			return d;
		}
		if (body.id === "dawn-fm") return t > .22 && t < .78 ? .08 + .05 * Math.sin(t * 90) : .02;
		return .08 + .12 * (.5 + .5 * Math.sin(t * 42)) * (1 - t * .35);
	};
	for (let x = 0; x < w; x++) {
		const t = x / (w - 1);
		const d0 = densityAt(t);
		const grain = rng() * .12;
		for (let y = 0; y < h; y++) {
			const a = y / (h - 1);
			const spoke = .82 + .18 * Math.sin(a * Math.PI * 12 + t * 40);
			const clump = .9 + .1 * hash3(t * 80, a * 24, 2.2);
			const d = clamp(d0 * spoke * clump + (rng() - .5) * .04);
			const col = mixRgb(ice, c, body.id === "starboy" ? .55 : body.id === "kiss-land" ? .3 : .4);
			const i = (y * w + x) * 4;
			const lit = .75 + grain;
			data[i] = clamp(col.r * lit, 0, 255) | 0;
			data[i + 1] = clamp(col.g * lit, 0, 255) | 0;
			data[i + 2] = clamp(col.b * lit, 0, 255) | 0;
			data[i + 3] = clamp(d) * 255 | 0;
		}
	}
	return texFromImageData(img, true, ClampToEdgeWrapping, RepeatWrapping);
}
var RING_VERT = `
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
var RING_FRAG = `
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
var circleCache = null;
function getSoftCircleTexture() {
	if (circleCache) return circleCache;
	const size = 128;
	const data = /* @__PURE__ */ new Uint8Array(65536);
	const c = 63.5;
	for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
		const dx = (x - c) / c;
		const dy = (y - c) / c;
		const d = Math.hypot(dx, dy);
		const a = d >= 1 ? 0 : Math.pow(1 - d, 2.35);
		const i = (y * size + x) * 4;
		data[i] = 255;
		data[i + 1] = 255;
		data[i + 2] = 255;
		data[i + 3] = Math.min(1, a * 1.4) * 255 | 0;
	}
	const tex = new DataTexture(data, size, size, RGBAFormat);
	tex.needsUpdate = true;
	tex.premultiplyAlpha = true;
	tex.minFilter = LinearFilter;
	tex.magFilter = LinearFilter;
	tex.generateMipmaps = false;
	circleCache = tex;
	return tex;
}
var START_ANGLE = {
	mdm: .62,
	idol: 1.28,
	hut: 1.95,
	"after-hours": 2.62,
	bbtm: 3.35,
	starboy: 3.55,
	"kiss-land": 5.22,
	"dawn-fm": .35,
	trilogy: 1.55
};
function PlanetaryRings({ data, inner, outer, upgrade }) {
	const mat = (0, import_react.useRef)(null);
	const [quality, setQuality] = (0, import_react.useState)("low");
	const tex = (0, import_react.useMemo)(() => getRingTexture(data, quality), [data, quality]);
	const geo = (0, import_react.useMemo)(() => makeRadialRingGeometry(inner, outer, 160, 16), [inner, outer]);
	const uniforms = (0, import_react.useMemo)(() => ({
		uMap: { value: tex },
		uColor: { value: new Color(data.pbr.detail) },
		uPulse: { value: 1 }
	}), [tex, data.pbr.detail]);
	(0, import_react.useEffect)(() => {
		uniforms.uMap.value = tex;
	}, [tex, uniforms]);
	(0, import_react.useEffect)(() => {
		if (!upgrade) return;
		let dead = false;
		const t = window.setTimeout(() => {
			if (!dead) setQuality("high");
		}, 80);
		return () => {
			dead = true;
			window.clearTimeout(t);
		};
	}, [data.id, upgrade]);
	useFrame(() => {
		const live = audioEnergy.playingBodyId === data.id;
		if (mat.current) mat.current.uniforms.uPulse.value = live ? 1 + audioEnergy.level * .18 : 1;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		rotation: [
			Math.PI / 2,
			0,
			0
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			geometry: geo,
			frustumCulled: false,
			renderOrder: 2,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("shaderMaterial", {
				ref: mat,
				uniforms,
				vertexShader: RING_VERT,
				fragmentShader: RING_FRAG,
				transparent: true,
				depthWrite: false,
				side: 2
			})
		})
	});
}
function Planet({ data }) {
	const group = (0, import_react.useRef)(null);
	const mesh = (0, import_react.useRef)(null);
	const lightRef = (0, import_react.useRef)(null);
	const angle = (0, import_react.useRef)(START_ANGLE[data.id] ?? .8);
	const down = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const [quality, setQuality] = (0, import_react.useState)("low");
	const [mapped, setMapped] = (0, import_react.useState)(false);
	const selectedId = useUniverse((s) => s.selectedId);
	const select = useUniverse((s) => s.select);
	const speed = useUniverse((s) => s.speed);
	const paused = useUniverse((s) => s.orbitsPaused);
	const showOrbits = useUniverse((s) => s.showOrbits);
	const selected = selectedId === data.id;
	(0, import_react.useEffect)(() => {
		const t = window.setTimeout(() => setMapped(true), 24 + data.distance * 6);
		return () => window.clearTimeout(t);
	}, [data.distance]);
	const textures = (0, import_react.useMemo)(() => mapped ? getPlanetTextures(data, quality) : getPreviewTextures(data), [
		data,
		quality,
		mapped
	]);
	(0, import_react.useEffect)(() => {
		if (!selected) return;
		let dead = false;
		const t = window.setTimeout(() => {
			if (!dead) setQuality("high");
		}, 90);
		return () => {
			dead = true;
			window.clearTimeout(t);
		};
	}, [selected, data.id]);
	const orbitPts = (0, import_react.useMemo)(() => {
		const pts = [];
		for (let i = 0; i <= 96; i++) {
			const a = i / 96 * Math.PI * 2;
			pts.push([
				Math.cos(a) * data.distance,
				0,
				Math.sin(a) * data.distance
			]);
		}
		return pts;
	}, [data.distance]);
	const tiltRad = data.tilt * (Math.PI / 180);
	useFrame((_, delta) => {
		const d = Math.min(delta, .1);
		if (!paused) angle.current += data.orbitalSpeed * speed * d * .085;
		if (group.current) {
			group.current.position.set(Math.cos(angle.current) * data.distance, 0, Math.sin(angle.current) * data.distance);
			let stored = bodyPositions.get(data.id);
			if (!stored) {
				stored = new Vector3();
				bodyPositions.set(data.id, stored);
			}
			stored.copy(group.current.position);
		}
		if (mesh.current && !paused) mesh.current.rotation.y += data.rotationSpeed * speed * d * .35;
		const live = audioEnergy.playingBodyId === data.id;
		const pulse = live ? audioEnergy.level : 0;
		if (lightRef.current) {
			lightRef.current.intensity = live ? .55 + pulse * 1.1 : 0;
			lightRef.current.distance = data.radius * (live ? 8 : 4);
		}
	});
	const inner = (data.ringInner ?? 1.3) * data.radius;
	const outer = (data.ringOuter ?? 2.2) * data.radius;
	const segs = quality === "high" ? 80 : 48;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [showOrbits && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
		points: orbitPts,
		color: selected ? data.pbr.detail : "#243044",
		transparent: true,
		opacity: selected ? .92 : .42,
		lineWidth: selected ? 1.8 : 1
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		ref: group,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			rotation: [
				tiltRad,
				0,
				0
			],
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					ref: mesh,
					onPointerDown: (e) => {
						down.current = {
							x: e.clientX,
							y: e.clientY
						};
					},
					onPointerUp: (e) => {
						const dx = e.clientX - down.current.x;
						const dy = e.clientY - down.current.y;
						if (dx * dx + dy * dy > 36) return;
						e.stopPropagation();
						select(selected ? null : data.id);
					},
					onPointerOver: () => {
						document.body.style.cursor = "pointer";
					},
					onPointerOut: () => {
						document.body.style.cursor = "grab";
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						data.radius,
						segs,
						segs
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanetSurface, {
						data,
						textures,
						meshRef: mesh
					})]
				}),
				data.hasRings && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanetaryRings, {
					data,
					inner,
					outer,
					upgrade: selected
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
					ref: lightRef,
					color: data.pbr.detail,
					intensity: 0,
					distance: data.radius * 4,
					decay: 2
				})
			]
		})
	})] });
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function blackbody(tempK) {
	const t = tempK / 100;
	let r;
	let g;
	let b;
	if (t <= 66) {
		r = 255;
		g = 99.4708025861 * Math.log(t) - 161.1195681661;
		b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
	} else {
		r = 329.698727446 * Math.pow(t - 60, -.1332047592);
		g = 288.1221695283 * Math.pow(t - 60, -.0755148492);
		b = 255;
	}
	return [
		Math.min(1, Math.max(0, r / 255)),
		Math.min(1, Math.max(0, g / 255)),
		Math.min(1, Math.max(0, b / 255))
	];
}
function starTemp(r) {
	if (r < .004) return 22e3 + r * 2e6;
	if (r < .015) return 1e4 + r * 4e5;
	if (r < .05) return 7500 + r * 8e4;
	if (r < .14) return 6e3 + r * 25e3;
	if (r < .3) return 5200 + r * 1e4;
	if (r < .56) return 3700 + r * 5e3;
	return 2400 + r * 2e3;
}
function makeStars(count, r0, r1, sizeMin, sizeMax, seed) {
	const rand = mulberry32(seed);
	const positions = new Float32Array(count * 3);
	const colors = new Float32Array(count * 3);
	const sizes = new Float32Array(count);
	const twinkles = new Float32Array(count);
	for (let i = 0; i < count; i++) {
		const band = rand() < .42;
		const theta = rand() * Math.PI * 2;
		const phi = band ? Math.PI * .5 + (rand() - .5) * .42 : Math.acos(2 * rand() - 1);
		const r = r0 + Math.pow(rand(), .65) * (r1 - r0);
		positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
		positions[i * 3 + 1] = r * Math.cos(phi) * (band ? .38 : .78);
		positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
		const mag = Math.pow(rand(), .38);
		const col = blackbody(starTemp(rand()));
		const boost = .55 + mag * .7;
		colors[i * 3] = Math.min(1.4, col[0] * boost);
		colors[i * 3 + 1] = Math.min(1.4, col[1] * boost);
		colors[i * 3 + 2] = Math.min(1.4, col[2] * boost);
		sizes[i] = sizeMin + Math.pow(mag, 1.6) * (sizeMax - sizeMin);
		if (rand() < .018) sizes[i] *= 1.85;
		twinkles[i] = .35 + rand() * 2.6;
	}
	return {
		positions,
		colors,
		sizes,
		twinkles
	};
}
var VOL_VERT = `
  varying vec3 vLocal;
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vLocal = position;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
var VOL_FRAG = `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec3 vLocal;
  varying vec3 vWorld;
  varying vec3 vNormal;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.07;
      a *= 0.52;
    }
    return v;
  }

  void main() {
    float n = fbm(vLocal * 2.15 + vec3(uTime * 0.035, 0.12, uTime * 0.02));
    float shell = 1.0 - length(vLocal);
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(cameraPosition - vWorld))), 1.65);
    float dens = smoothstep(0.22, 0.78, n) * smoothstep(-0.15, 0.45, shell);
    float a = dens * (0.18 + rim * 0.42);
    if (a < 0.012) discard;
    vec3 col = uColor * (0.35 + n * 0.9 + rim * 0.55);
    gl_FragColor = vec4(col, a);
  }
`;
function CloudVolume({ color, origin, count, spread, scale, seed }) {
	const mesh = (0, import_react.useRef)(null);
	const mat = (0, import_react.useRef)(null);
	const dummy = (0, import_react.useMemo)(() => new Object3D(), []);
	const uniforms = (0, import_react.useMemo)(() => ({
		uColor: { value: new Color(color) },
		uTime: { value: 0 }
	}), [color]);
	const poses = (0, import_react.useMemo)(() => {
		const rand = mulberry32(seed);
		return Array.from({ length: count }, () => {
			const a = rand() * Math.PI * 2;
			const b = (rand() - .5) * 1.4;
			const r = rand() * spread;
			return {
				x: Math.cos(a) * r,
				y: b * spread * .38,
				z: Math.sin(a) * r,
				sx: scale * (.55 + rand() * 1.15),
				sy: scale * (.22 + rand() * .42),
				sz: scale * (.45 + rand() * .95),
				rx: rand() * Math.PI,
				ry: rand() * Math.PI,
				rz: (rand() - .5) * .8
			};
		});
	}, [
		count,
		spread,
		scale,
		seed
	]);
	(0, import_react.useLayoutEffect)(() => {
		if (!mesh.current) return;
		poses.forEach((p, i) => {
			dummy.position.set(p.x, p.y, p.z);
			dummy.rotation.set(p.rx, p.ry, p.rz);
			dummy.scale.set(p.sx, p.sy, p.sz);
			dummy.updateMatrix();
			mesh.current.setMatrixAt(i, dummy.matrix);
		});
		mesh.current.instanceMatrix.needsUpdate = true;
	}, [dummy, poses]);
	useFrame((state) => {
		if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		position: origin,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
			ref: mesh,
			args: [
				void 0,
				void 0,
				count
			],
			frustumCulled: false,
			renderOrder: -3,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [1, 2] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("shaderMaterial", {
				ref: mat,
				uniforms,
				vertexShader: VOL_VERT,
				fragmentShader: VOL_FRAG,
				transparent: true,
				depthWrite: false,
				blending: 2,
				side: 0,
				toneMapped: false
			})]
		})
	});
}
function Nebulae() {
	const group = (0, import_react.useRef)(null);
	useFrame((_, delta) => {
		if (group.current) group.current.rotation.y += delta * .0012;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref: group,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudVolume, {
				color: "#ff4a7a",
				origin: [
					-110,
					16,
					-150
				],
				count: 22,
				spread: 38,
				scale: 18,
				seed: 11
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudVolume, {
				color: "#ffb24a",
				origin: [
					130,
					-22,
					-155
				],
				count: 18,
				spread: 34,
				scale: 16,
				seed: 29
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudVolume, {
				color: "#4ec8ff",
				origin: [
					36,
					32,
					175
				],
				count: 24,
				spread: 42,
				scale: 20,
				seed: 47
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudVolume, {
				color: "#9b6cff",
				origin: [
					-155,
					-8,
					70
				],
				count: 16,
				spread: 30,
				scale: 15,
				seed: 63
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudVolume, {
				color: "#3dffb0",
				origin: [
					165,
					6,
					48
				],
				count: 14,
				spread: 26,
				scale: 14,
				seed: 81
			})
		]
	});
}
function Starfield() {
	const near = (0, import_react.useMemo)(() => makeStars(1800, 70, 160, 1.05, 4.4, 57606), []);
	const far = (0, import_react.useMemo)(() => makeStars(3200, 160, 430, .8, 3.2, 368925), []);
	const group = (0, import_react.useRef)(null);
	useFrame((_, delta) => {
		if (group.current) group.current.rotation.y += delta * .0022;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref: group,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nebulae, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StarPoints, { ...near }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StarPoints, { ...far })
		]
	});
}
function RockBelt({ count, r0, r1, ySpread, size0, size1, speed }) {
	const mesh = (0, import_react.useRef)(null);
	const dummy = (0, import_react.useMemo)(() => new Object3D(), []);
	const color = (0, import_react.useMemo)(() => new Color(), []);
	const seeds = (0, import_react.useMemo)(() => Array.from({ length: count }, () => ({
		a: Math.random() * Math.PI * 2,
		r: r0 + Math.random() * (r1 - r0),
		y: (Math.random() - .5) * ySpread,
		sx: size0 + Math.random() * (size1 - size0),
		sy: size0 + Math.random() * (size1 - size0),
		sz: size0 + Math.random() * (size1 - size0),
		spin: .08 + Math.random() * .45,
		tilt: Math.random() * Math.PI,
		hue: Math.random()
	})), [
		count,
		r0,
		r1,
		ySpread,
		size0,
		size1
	]);
	(0, import_react.useLayoutEffect)(() => {
		if (!mesh.current) return;
		seeds.forEach((s, i) => {
			if (s.hue < .2) color.setRGB(.55, .42, .32);
			else if (s.hue < .55) color.setRGB(.48, .44, .4);
			else if (s.hue < .8) color.setRGB(.72, .68, .6);
			else color.setRGB(.38, .36, .34);
			mesh.current.setColorAt(i, color);
		});
		if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
	}, [color, seeds]);
	useFrame((_, delta) => {
		if (!mesh.current) return;
		const d = Math.min(delta, .1);
		seeds.forEach((s, i) => {
			s.a += d * speed * s.spin;
			dummy.position.set(Math.cos(s.a) * s.r, s.y, Math.sin(s.a) * s.r);
			dummy.rotation.set(s.tilt + s.a * .4, s.a, s.tilt * .5);
			dummy.scale.set(s.sx, s.sy, s.sz);
			dummy.updateMatrix();
			mesh.current.setMatrixAt(i, dummy.matrix);
		});
		mesh.current.instanceMatrix.needsUpdate = true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: mesh,
		args: [
			void 0,
			void 0,
			count
		],
		frustumCulled: false,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [1, 1] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			vertexColors: true,
			roughness: .94,
			metalness: .08
		})]
	});
}
function DustRing({ count, r0, r1, ySpread, color, size, speed }) {
	const points = (0, import_react.useRef)(null);
	const { positions, seeds } = (0, import_react.useMemo)(() => {
		return {
			positions: new Float32Array(count * 3),
			seeds: Array.from({ length: count }, () => ({
				a: Math.random() * Math.PI * 2,
				r: r0 + Math.random() * (r1 - r0),
				y: (Math.random() - .5) * ySpread,
				spin: .4 + Math.random() * .8
			}))
		};
	}, [
		count,
		r0,
		r1,
		ySpread
	]);
	useFrame((_, delta) => {
		if (!points.current) return;
		const d = Math.min(delta, .1);
		const attr = points.current.geometry.getAttribute("position");
		seeds.forEach((s, i) => {
			s.a += d * speed * s.spin * .02;
			attr.setXYZ(i, Math.cos(s.a) * s.r, s.y, Math.sin(s.a) * s.r);
		});
		attr.needsUpdate = true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("points", {
		ref: points,
		frustumCulled: false,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferGeometry", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferAttribute", {
			attach: "attributes-position",
			args: [positions, 3]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointsMaterial", {
			map: getSoftCircleTexture(),
			color,
			size: Math.min(size, .05),
			sizeAttenuation: true,
			transparent: true,
			opacity: .72,
			depthWrite: false,
			alphaTest: .04
		})]
	});
}
function AsteroidBelt() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RockBelt, {
			count: 420,
			r0: 27.2,
			r1: 30.4,
			ySpread: .85,
			size0: .08,
			size1: .32,
			speed: .018
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RockBelt, {
			count: 140,
			r0: 27.5,
			r1: 30.1,
			ySpread: .4,
			size0: .2,
			size1: .46,
			speed: .014
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DustRing, {
			count: 900,
			r0: 26.8,
			r1: 31,
			ySpread: .7,
			color: "#c4b49a",
			size: .055,
			speed: .9
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DustRing, {
			count: 600,
			r0: 12,
			r1: 22,
			ySpread: .35,
			color: "#8aa0c8",
			size: .04,
			speed: 1.1
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DustRing, {
			count: 480,
			r0: 46,
			r1: 52,
			ySpread: 1.1,
			color: "#d48ab0",
			size: .048,
			speed: .55
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RockBelt, {
			count: 240,
			r0: 76,
			r1: 86,
			ySpread: 1.8,
			size0: .05,
			size1: .18,
			speed: .006
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DustRing, {
			count: 640,
			r0: 75,
			r1: 88,
			ySpread: 2,
			color: "#9ab4c8",
			size: .045,
			speed: .4
		})
	] });
}
var SUN_VERT = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
var SUN_FRAG = `
  uniform float uTime;
  uniform float uPulse;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = normalize(vPos) * 2.0;
    float n = fbm(p * 2.1 + vec3(0.0, uTime * 0.16, uTime * 0.1));
    float flare = pow(fbm(p * 4.4 + vec3(uTime * 0.22, 0.0, -uTime * 0.14)), 3.2);
    vec3 dark = vec3(0.16, 0.02, 0.01);
    vec3 ember = vec3(0.95, 0.14, 0.04);
    vec3 core = vec3(1.0, 0.55, 0.18);
    vec3 col = mix(dark, ember, smoothstep(0.12, 0.78, n));
    col = mix(col, core, pow(n, 1.45) * uPulse);
    col += core * 0.12 * uPulse;
    col += vec3(1.0, 0.7, 0.2) * flare * 0.18 * uPulse;
    float rim = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.2);
    col += vec3(1.0, 0.28, 0.06) * rim * 0.22 * uPulse;
    gl_FragColor = vec4(col, 1.0);
  }
`;
function Sun() {
	const mesh = (0, import_react.useRef)(null);
	const mat = (0, import_react.useRef)(null);
	const down = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const selected = useUniverse((s) => s.selectedId) === "sun";
	const select = useUniverse((s) => s.select);
	const uniforms = (0, import_react.useMemo)(() => ({
		uTime: { value: 0 },
		uPulse: { value: 1 }
	}), []);
	useFrame((state, delta) => {
		const d = Math.min(delta, .1);
		if (mesh.current) mesh.current.rotation.y += d * .08;
		const pulse = 1 + (audioEnergy.playingBodyId === "sun" ? audioEnergy.level * .55 : .08 * Math.sin(state.clock.elapsedTime * 1.4));
		if (mat.current) {
			mat.current.uniforms.uTime.value = state.clock.elapsedTime;
			mat.current.uniforms.uPulse.value = pulse;
		}
		let stored = bodyPositions.get("sun");
		if (!stored) {
			stored = new Vector3();
			bodyPositions.set("sun", stored);
		}
		stored.set(0, 0, 0);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			ref: mesh,
			onPointerDown: (e) => {
				down.current = {
					x: e.clientX,
					y: e.clientY
				};
			},
			onPointerUp: (e) => {
				const dx = e.clientX - down.current.x;
				const dy = e.clientY - down.current.y;
				if (dx * dx + dy * dy > 36) return;
				e.stopPropagation();
				select(selected ? null : "sun");
			},
			onPointerOver: () => {
				document.body.style.cursor = "pointer";
			},
			onPointerOut: () => {
				document.body.style.cursor = "grab";
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				SUN.radius,
				64,
				64
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("shaderMaterial", {
				ref: mat,
				uniforms,
				vertexShader: SUN_VERT,
				fragmentShader: SUN_FRAG
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			color: "#ff6a3a",
			intensity: 14,
			distance: 160,
			decay: 2
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			color: "#ff8a50",
			intensity: 5,
			distance: 40,
			decay: 2
		})
	] });
}
function ViewSync() {
	const camera = useThree((s) => s.camera);
	const size = useThree((s) => s.size);
	(0, import_react.useLayoutEffect)(() => {
		view.camera = camera;
		view.size = {
			w: size.width,
			h: size.height
		};
	}, [camera, size]);
	return null;
}
function Effects() {
	if (typeof window !== "undefined" && (window.innerWidth < 720 || navigator.maxTouchPoints > 1 && window.innerWidth < 1100)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectComposer, {
		enableNormalPass: false,
		multisampling: 0,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bloom, {
			luminanceThreshold: .86,
			luminanceSmoothing: .32,
			intensity: .32,
			mipmapBlur: true
		})
	});
}
function Scene() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
			attach: "background",
			args: ["#030306"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
			attach: "fog",
			args: [
				"#030306",
				480,
				920
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", {
			intensity: .38,
			color: "#b8b4c4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
			"#6a7a98",
			"#1a120e",
			.62
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewSync, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Starfield, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AsteroidBelt, {}),
		PLANETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Planet, { data: p }, p.id)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraRig, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Effects, {})
	] });
}
function Universe() {
	const select = useUniverse((s) => s.select);
	const down = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const mobile = typeof window !== "undefined" && (window.innerWidth < 720 || navigator.maxTouchPoints > 1 && window.innerWidth < 1100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
		camera: {
			position: [
				0,
				22,
				52
			],
			fov: 50,
			near: .1,
			far: 1100
		},
		dpr: mobile ? [1, 1.25] : [1, 1.6],
		gl: {
			antialias: true,
			powerPreference: "high-performance",
			toneMapping: 4,
			toneMappingExposure: 1.12,
			alpha: false
		},
		onPointerDown: (e) => {
			down.current = {
				x: e.clientX,
				y: e.clientY
			};
		},
		onPointerMissed: (e) => {
			const dx = e.clientX - down.current.x;
			const dy = e.clientY - down.current.y;
			if (dx * dx + dy * dy > 25) return;
			select(null);
		},
		onCreated: ({ gl }) => {
			gl.domElement.style.touchAction = "none";
			gl.domElement.style.cursor = "grab";
			gl.setClearColor("#030306");
		},
		style: {
			width: "100%",
			height: "100%",
			display: "block",
			background: "#030306"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, {})
	});
}
//#endregion
export { Universe as default };
