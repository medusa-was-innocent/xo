import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SUN } from "@/lib/catalog";
import { useUniverse } from "@/lib/store";
import { audioEnergy, bodyPositions } from "@/lib/runtime";

const SUN_VERT = /* glsl */ `
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

const SUN_FRAG = /* glsl */ `
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

export function Sun() {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const down = useRef({ x: 0, y: 0 });
  const selected = useUniverse((s) => s.selectedId) === "sun";
  const select = useUniverse((s) => s.select);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPulse: { value: 1 } }),
    [],
  );

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);
    if (mesh.current) mesh.current.rotation.y += d * 0.08;
    const pulse =
      1 +
      (audioEnergy.playingBodyId === "sun" ? audioEnergy.level * 0.55 : 0.08 * Math.sin(state.clock.elapsedTime * 1.4));
    if (mat.current) {
      mat.current.uniforms.uTime.value = state.clock.elapsedTime;
      mat.current.uniforms.uPulse.value = pulse;
    }
    let stored = bodyPositions.get("sun");
    if (!stored) {
      stored = new THREE.Vector3();
      bodyPositions.set("sun", stored);
    }
    stored.set(0, 0, 0);
  });

  return (
    <group>
      <mesh
        ref={mesh}
        onPointerDown={(e) => {
          down.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const dx = e.clientX - down.current.x;
          const dy = e.clientY - down.current.y;
          if (dx * dx + dy * dy > 36) return;
          e.stopPropagation();
          select(selected ? null : "sun");
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "grab";
        }}
      >
        <sphereGeometry args={[SUN.radius, 64, 64]} />
        <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={SUN_VERT} fragmentShader={SUN_FRAG} />
      </mesh>
      <pointLight color="#ff6a3a" intensity={14} distance={160} decay={2} />
      <pointLight color="#ff8a50" intensity={5} distance={40} decay={2} />
    </group>
  );
}
