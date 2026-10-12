import { Canvas } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { PLANETS } from "@/lib/catalog";
import { useUniverse } from "@/lib/store";
import { view } from "@/lib/runtime";
import { CameraRig } from "./CameraRig";
import { Planet } from "./Planet";
import { Starfield, AsteroidBelt } from "./Starfield";
import { Sun } from "./Sun";

function ViewSync() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useLayoutEffect(() => {
    view.camera = camera;
    view.size = { w: size.width, h: size.height };
  }, [camera, size]);

  return null;
}

function Effects() {
  const mobile =
    typeof window !== "undefined" &&
    (window.innerWidth < 720 || (navigator.maxTouchPoints > 1 && window.innerWidth < 1100));
  if (mobile) return null;
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom luminanceThreshold={0.86} luminanceSmoothing={0.32} intensity={0.32} mipmapBlur />
    </EffectComposer>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#030306"]} />
      <fog attach="fog" args={["#030306", 480, 920]} />
      <ambientLight intensity={0.38} color="#b8b4c4" />
      <hemisphereLight args={["#6a7a98", "#1a120e", 0.62]} />
      <ViewSync />
      <Starfield />
      <Sun />
      <AsteroidBelt />
      {PLANETS.map((p) => (
        <Planet key={p.id} data={p} />
      ))}
      <CameraRig />
      <Effects />
    </>
  );
}

export default function Universe() {
  const select = useUniverse((s) => s.select);
  const down = useRef({ x: 0, y: 0 });
  const mobile =
    typeof window !== "undefined" &&
    (window.innerWidth < 720 || (navigator.maxTouchPoints > 1 && window.innerWidth < 1100));
  return (
    <Canvas
      camera={{ position: [0, 22, 52], fov: 50, near: 0.1, far: 1100 }}
      dpr={mobile ? [1, 1.25] : [1, 1.6]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.12,
        alpha: false,
      }}
      onPointerDown={(e) => {
        down.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMissed={(e) => {
        const dx = e.clientX - down.current.x;
        const dy = e.clientY - down.current.y;
        if (dx * dx + dy * dy > 25) return;
        select(null);
      }}
      onCreated={({ gl }) => {
        gl.domElement.style.touchAction = "none";
        gl.domElement.style.cursor = "grab";
        gl.setClearColor("#030306");
      }}
      style={{ width: "100%", height: "100%", display: "block", background: "#030306" }}
    >
      <Scene />
    </Canvas>
  );
}
