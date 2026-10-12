import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { CelestialBody } from "@/lib/catalog";
import { useUniverse } from "@/lib/store";
import { audioEnergy, bodyPositions } from "@/lib/runtime";
import { PlanetSurface } from "./shaders";
import {
  RING_FRAG,
  RING_VERT,
  getPlanetTextures,
  getPreviewTextures,
  getRingTexture,
  makeRadialRingGeometry,
  type TexQuality,
} from "./textures";

const START_ANGLE: Record<string, number> = {
  mdm: 0.62,
  idol: 1.28,
  hut: 1.95,
  "after-hours": 2.62,
  bbtm: 3.35,
  starboy: 3.55,
  "kiss-land": 5.22,
  "dawn-fm": 0.35,
  trilogy: 1.55,
};

function PlanetaryRings({
  data,
  inner,
  outer,
  upgrade,
}: {
  data: CelestialBody;
  inner: number;
  outer: number;
  upgrade: boolean;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const [quality, setQuality] = useState<TexQuality>("low");
  const tex = useMemo(() => getRingTexture(data, quality), [data, quality]);
  const geo = useMemo(() => makeRadialRingGeometry(inner, outer, 160, 16), [inner, outer]);
  const uniforms = useMemo(
    () => ({
      uMap: { value: tex },
      uColor: { value: new THREE.Color(data.pbr.detail) },
      uPulse: { value: 1 },
    }),
    [tex, data.pbr.detail],
  );

  useEffect(() => {
    uniforms.uMap.value = tex;
  }, [tex, uniforms]);

  useEffect(() => {
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
    if (mat.current) mat.current.uniforms.uPulse.value = live ? 1 + audioEnergy.level * 0.18 : 1;
  });

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh geometry={geo} frustumCulled={false} renderOrder={2}>
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          vertexShader={RING_VERT}
          fragmentShader={RING_FRAG}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function Planet({ data }: { data: CelestialBody }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const angle = useRef(START_ANGLE[data.id] ?? 0.8);
  const down = useRef({ x: 0, y: 0 });
  const [quality, setQuality] = useState<TexQuality>("low");
  const [mapped, setMapped] = useState(false);

  const selectedId = useUniverse((s) => s.selectedId);
  const select = useUniverse((s) => s.select);
  const speed = useUniverse((s) => s.speed);
  const paused = useUniverse((s) => s.orbitsPaused);
  const showOrbits = useUniverse((s) => s.showOrbits);
  const selected = selectedId === data.id;

  useEffect(() => {
    const t = window.setTimeout(() => setMapped(true), 24 + data.distance * 6);
    return () => window.clearTimeout(t);
  }, [data.distance]);

  const textures = useMemo(
    () => (mapped ? getPlanetTextures(data, quality) : getPreviewTextures(data)),
    [data, quality, mapped],
  );

  useEffect(() => {
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

  const orbitPts = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push([Math.cos(a) * data.distance, 0, Math.sin(a) * data.distance]);
    }
    return pts;
  }, [data.distance]);

  const tiltRad = data.tilt * (Math.PI / 180);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1);
    if (!paused) {
      angle.current += data.orbitalSpeed * speed * d * 0.085;
    }
    if (group.current) {
      group.current.position.set(
        Math.cos(angle.current) * data.distance,
        0,
        Math.sin(angle.current) * data.distance,
      );
      let stored = bodyPositions.get(data.id);
      if (!stored) {
        stored = new THREE.Vector3();
        bodyPositions.set(data.id, stored);
      }
      stored.copy(group.current.position);
    }
    if (mesh.current && !paused) {
      mesh.current.rotation.y += data.rotationSpeed * speed * d * 0.35;
    }

    const live = audioEnergy.playingBodyId === data.id;
    const pulse = live ? audioEnergy.level : 0;
    if (lightRef.current) {
      lightRef.current.intensity = live ? 0.55 + pulse * 1.1 : 0;
      lightRef.current.distance = data.radius * (live ? 8 : 4);
    }
  });

  const inner = (data.ringInner ?? 1.3) * data.radius;
  const outer = (data.ringOuter ?? 2.2) * data.radius;
  const segs = quality === "high" ? 80 : 48;

  return (
    <>
      {showOrbits && (
        <Line
          points={orbitPts}
          color={selected ? data.pbr.detail : "#243044"}
          transparent
          opacity={selected ? 0.92 : 0.42}
          lineWidth={selected ? 1.8 : 1}
        />
      )}
      <group ref={group}>
        <group rotation={[tiltRad, 0, 0]}>
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
              select(selected ? null : data.id);
            }}
            onPointerOver={() => {
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "grab";
            }}
          >
            <sphereGeometry args={[data.radius, segs, segs]} />
            <PlanetSurface data={data} textures={textures} meshRef={mesh} />
          </mesh>
          {data.hasRings && <PlanetaryRings data={data} inner={inner} outer={outer} upgrade={selected} />}
          <pointLight
            ref={lightRef}
            color={data.pbr.detail}
            intensity={0}
            distance={data.radius * 4}
            decay={2}
          />
        </group>
      </group>
    </>
  );
}
