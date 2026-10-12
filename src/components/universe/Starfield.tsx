import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { StarPoints } from "./shaders";
import { getSoftCircleTexture } from "./textures";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blackbody(tempK: number): [number, number, number] {
  const t = tempK / 100;
  let r: number;
  let g: number;
  let b: number;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }
  return [
    Math.min(1, Math.max(0, r / 255)),
    Math.min(1, Math.max(0, g / 255)),
    Math.min(1, Math.max(0, b / 255)),
  ];
}

function starTemp(r: number) {
  if (r < 0.004) return 22000 + r * 2e6;
  if (r < 0.015) return 10000 + r * 4e5;
  if (r < 0.05) return 7500 + r * 8e4;
  if (r < 0.14) return 6000 + r * 2.5e4;
  if (r < 0.3) return 5200 + r * 1e4;
  if (r < 0.56) return 3700 + r * 5e3;
  return 2400 + r * 2e3;
}

function makeStars(count: number, r0: number, r1: number, sizeMin: number, sizeMax: number, seed: number) {
  const rand = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const twinkles = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const band = rand() < 0.42;
    const theta = rand() * Math.PI * 2;
    const phi = band
      ? Math.PI * 0.5 + (rand() - 0.5) * 0.42
      : Math.acos(2 * rand() - 1);
    const r = r0 + Math.pow(rand(), 0.65) * (r1 - r0);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * (band ? 0.38 : 0.78);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    const mag = Math.pow(rand(), 0.38);
    const col = blackbody(starTemp(rand()));
    const boost = 0.55 + mag * 0.7;
    colors[i * 3] = Math.min(1.4, col[0] * boost);
    colors[i * 3 + 1] = Math.min(1.4, col[1] * boost);
    colors[i * 3 + 2] = Math.min(1.4, col[2] * boost);
    sizes[i] = sizeMin + Math.pow(mag, 1.6) * (sizeMax - sizeMin);
    if (rand() < 0.018) sizes[i] *= 1.85;
    twinkles[i] = 0.35 + rand() * 2.6;
  }
  return { positions, colors, sizes, twinkles };
}

const VOL_VERT = /* glsl */ `
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

const VOL_FRAG = /* glsl */ `
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

function CloudVolume({
  color,
  origin,
  count,
  spread,
  scale,
  seed,
}: {
  color: string;
  origin: [number, number, number];
  count: number;
  spread: number;
  scale: number;
  seed: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
    }),
    [color],
  );
  const poses = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, () => {
      const a = rand() * Math.PI * 2;
      const b = (rand() - 0.5) * 1.4;
      const r = rand() * spread;
      return {
        x: Math.cos(a) * r,
        y: b * spread * 0.38,
        z: Math.sin(a) * r,
        sx: scale * (0.55 + rand() * 1.15),
        sy: scale * (0.22 + rand() * 0.42),
        sz: scale * (0.45 + rand() * 0.95),
        rx: rand() * Math.PI,
        ry: rand() * Math.PI,
        rz: (rand() - 0.5) * 0.8,
      };
    });
  }, [count, spread, scale, seed]);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    poses.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rx, p.ry, p.rz);
      dummy.scale.set(p.sx, p.sy, p.sz);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [dummy, poses]);

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group position={origin}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false} renderOrder={-3}>
        <icosahedronGeometry args={[1, 2]} />
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          vertexShader={VOL_VERT}
          fragmentShader={VOL_FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}

function Nebulae() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.0012;
  });
  return (
    <group ref={group}>
      <CloudVolume color="#ff4a7a" origin={[-110, 16, -150]} count={22} spread={38} scale={18} seed={11} />
      <CloudVolume color="#ffb24a" origin={[130, -22, -155]} count={18} spread={34} scale={16} seed={29} />
      <CloudVolume color="#4ec8ff" origin={[36, 32, 175]} count={24} spread={42} scale={20} seed={47} />
      <CloudVolume color="#9b6cff" origin={[-155, -8, 70]} count={16} spread={30} scale={15} seed={63} />
      <CloudVolume color="#3dffb0" origin={[165, 6, 48]} count={14} spread={26} scale={14} seed={81} />
    </group>
  );
}

export function Starfield() {
  const near = useMemo(() => makeStars(1800, 70, 160, 1.05, 4.4, 0x0e106), []);
  const far = useMemo(() => makeStars(3200, 160, 430, 0.8, 3.2, 0x5a11d), []);
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.0022;
  });

  return (
    <group ref={group}>
      <Nebulae />
      <StarPoints {...near} />
      <StarPoints {...far} />
    </group>
  );
}

function RockBelt({
  count,
  r0,
  r1,
  ySpread,
  size0,
  size1,
  speed,
}: {
  count: number;
  r0: number;
  r1: number;
  ySpread: number;
  size0: number;
  size1: number;
  speed: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        a: Math.random() * Math.PI * 2,
        r: r0 + Math.random() * (r1 - r0),
        y: (Math.random() - 0.5) * ySpread,
        sx: size0 + Math.random() * (size1 - size0),
        sy: size0 + Math.random() * (size1 - size0),
        sz: size0 + Math.random() * (size1 - size0),
        spin: 0.08 + Math.random() * 0.45,
        tilt: Math.random() * Math.PI,
        hue: Math.random(),
      })),
    [count, r0, r1, ySpread, size0, size1],
  );

  useLayoutEffect(() => {
    if (!mesh.current) return;
    seeds.forEach((s, i) => {
      if (s.hue < 0.2) color.setRGB(0.55, 0.42, 0.32);
      else if (s.hue < 0.55) color.setRGB(0.48, 0.44, 0.4);
      else if (s.hue < 0.8) color.setRGB(0.72, 0.68, 0.6);
      else color.setRGB(0.38, 0.36, 0.34);
      mesh.current!.setColorAt(i, color);
    });
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [color, seeds]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const d = Math.min(delta, 0.1);
    seeds.forEach((s, i) => {
      s.a += d * speed * s.spin;
      dummy.position.set(Math.cos(s.a) * s.r, s.y, Math.sin(s.a) * s.r);
      dummy.rotation.set(s.tilt + s.a * 0.4, s.a, s.tilt * 0.5);
      dummy.scale.set(s.sx, s.sy, s.sz);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial vertexColors roughness={0.94} metalness={0.08} />
    </instancedMesh>
  );
}

function DustRing({
  count,
  r0,
  r1,
  ySpread,
  color,
  size,
  speed,
}: {
  count: number;
  r0: number;
  r1: number;
  ySpread: number;
  color: string;
  size: number;
  speed: number;
}) {
  const points = useRef<THREE.Points>(null);
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = Array.from({ length: count }, () => ({
      a: Math.random() * Math.PI * 2,
      r: r0 + Math.random() * (r1 - r0),
      y: (Math.random() - 0.5) * ySpread,
      spin: 0.4 + Math.random() * 0.8,
    }));
    return { positions, seeds };
  }, [count, r0, r1, ySpread]);

  useFrame((_, delta) => {
    if (!points.current) return;
    const d = Math.min(delta, 0.1);
    const attr = points.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    seeds.forEach((s, i) => {
      s.a += d * speed * s.spin * 0.02;
      attr.setXYZ(i, Math.cos(s.a) * s.r, s.y, Math.sin(s.a) * s.r);
    });
    attr.needsUpdate = true;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={getSoftCircleTexture()}
        color={color}
        size={Math.min(size, 0.05)}
        sizeAttenuation
        transparent
        opacity={0.72}
        depthWrite={false}
        alphaTest={0.04}
      />
    </points>
  );
}

export function AsteroidBelt() {
  return (
    <group>
      <RockBelt count={420} r0={27.2} r1={30.4} ySpread={0.85} size0={0.08} size1={0.32} speed={0.018} />
      <RockBelt count={140} r0={27.5} r1={30.1} ySpread={0.4} size0={0.2} size1={0.46} speed={0.014} />
      <DustRing count={900} r0={26.8} r1={31} ySpread={0.7} color="#c4b49a" size={0.055} speed={0.9} />
      <DustRing count={600} r0={12} r1={22} ySpread={0.35} color="#8aa0c8" size={0.04} speed={1.1} />
      <DustRing count={480} r0={46} r1={52} ySpread={1.1} color="#d48ab0" size={0.048} speed={0.55} />
      <RockBelt count={240} r0={76} r1={86} ySpread={1.8} size0={0.05} size1={0.18} speed={0.006} />
      <DustRing count={640} r0={75} r1={88} ySpread={2} color="#9ab4c8" size={0.045} speed={0.4} />
    </group>
  );
}
