import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CelestialBody } from "@/lib/catalog";
import { audioEnergy } from "@/lib/runtime";
import type { PlanetTextures } from "./textures";

export const PLANET_KIND: Record<string, number> = {
  mdm: 0,
  idol: 1,
  hut: 2,
  "after-hours": 3,
  bbtm: 4,
  starboy: 5,
  "kiss-land": 6,
  "dawn-fm": 7,
  trilogy: 8,
};

const PLANET_VERT = /* glsl */ `
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

const PLANET_FRAG = /* glsl */ `
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

export const CLOUD_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uDisplace;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying float vLift;

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
      p *= 2.12;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vUv = uv;
    float n = fbm(position * 3.4 + vec3(uTime * 0.045, 0.0, uTime * 0.03));
    vLift = n;
    vec3 p = position + normal * n * uDisplace;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const CLOUD_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uKind;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying float vLift;

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
      p *= 2.08;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime;
    if (uKind < 1.5) {
      uv += vec2(t * 0.008, sin(t * 0.05) * 0.01);
    } else if (uKind < 2.5) {
      uv += vec2(t * 0.004, 0.0);
    } else {
      uv += vec2(t * 0.01, 0.0);
    }
    vec4 tex = texture2D(uMap, uv);
    vec3 L = normalize(-vWorld);
    float ndl = max(dot(normalize(vNormal), L), 0.0);
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(cameraPosition - vWorld))), 2.2);
    float a = tex.a * uOpacity * (0.28 + ndl * 0.55 + vLift * 0.45 + rim * 0.25);
    if (a < 0.02) discard;
    vec3 col = tex.rgb * (0.32 + ndl * 0.75 + rim * 0.4);
    gl_FragColor = vec4(col, a);
  }
`;

const STAR_VERT = /* glsl */ `
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

const STAR_FRAG = /* glsl */ `
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

export function PlanetSurface({
  data,
  textures,
  meshRef,
}: {
  data: CelestialBody;
  textures: PlanetTextures;
  meshRef: RefObject<THREE.Mesh | null>;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const rugged = data.id === "mdm" || data.id === "after-hours" || data.id === "trilogy";
  const uniforms = useMemo(
    () => ({
      uMap: { value: textures.map },
      uNormal: { value: textures.normalMap ?? textures.map },
      uEmit: { value: textures.emissiveMap ?? textures.map },
      uTime: { value: 0 },
      uPulse: { value: 1 },
      uHasNormal: { value: textures.normalMap ? 1 : 0 },
      uHasEmit: { value: textures.emissiveMap ? 1 : 0 },
      uBump: { value: rugged ? 1.6 : 0.85 },
      uKind: { value: PLANET_KIND[data.id] ?? 0 },
      uRough: { value: data.pbr.roughness },
      uMetal: { value: data.pbr.metalness },
      uEmitColor: { value: new THREE.Color(data.pbr.emission) },
      uEmitInt: { value: data.pbr.emissionIntensity },
      uAtmo: { value: new THREE.Color(data.pbr.detail) },
    }),
    [data, rugged, textures],
  );

  useEffect(() => {
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
    mat.current.uniforms.uPulse.value = live ? 1 + audioEnergy.level * 0.32 : 1;
    const pulse = live ? audioEnergy.level : 0;
    meshRef.current?.scale.setScalar(1 + pulse * 0.04);
  });

  return (
    <shaderMaterial
      ref={mat}
      uniforms={uniforms}
      vertexShader={PLANET_VERT}
      fragmentShader={PLANET_FRAG}
      toneMapped={false}
    />
  );
}

export function CloudLayer({
  data,
  map,
  radius,
  meshRef,
}: {
  data: CelestialBody;
  map: THREE.Texture;
  radius: number;
  meshRef: RefObject<THREE.Group | null>;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uMap: { value: map },
      uTime: { value: 0 },
      uKind: { value: PLANET_KIND[data.id] ?? 0 },
      uOpacity: { value: data.id === "idol" ? 0.92 : data.id === "bbtm" ? 0.78 : data.id === "dawn-fm" ? 0.52 : 0.7 },
      uDisplace: { value: data.radius * (data.id === "idol" || data.id === "bbtm" ? 0.11 : 0.07) },
    }),
    [data.id, data.radius, map],
  );
  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <group ref={meshRef}>
      <mesh scale={data.id === "idol" ? 1.04 : 1.03}>
        <sphereGeometry args={[radius, 48, 32]} />
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          vertexShader={CLOUD_VERT}
          fragmentShader={CLOUD_FRAG}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh scale={data.id === "idol" || data.id === "bbtm" ? 1.085 : 1.062} rotation={[0, 0.4, 0]}>
        <sphereGeometry args={[radius, 32, 24]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={CLOUD_VERT}
          fragmentShader={CLOUD_FRAG}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
}

export function StarPoints({
  positions,
  colors,
  sizes,
  twinkles,
}: {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  twinkles: Float32Array;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2) },
    }),
    [],
  );
  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aTwinkle" args={[twinkles, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={STAR_VERT}
        fragmentShader={STAR_FRAG}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
