import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { bodyById } from "@/lib/catalog";
import { useUniverse } from "@/lib/store";
import { bodyPositions, framingDistance, minZoomDistance, view } from "@/lib/runtime";

const _offset = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _lastBody = new THREE.Vector3();
const OVERVIEW = new THREE.Vector3(0, 22, 52);
const ORIGIN = new THREE.Vector3(0, 0, 0);

export function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const selectedId = useUniverse((s) => s.selectedId);
  const { camera, size } = useThree();
  const user = useRef(false);
  const panOffset = useRef(new THREE.Vector3());
  const anim = useRef(0);
  const hasLast = useRef(false);

  useEffect(() => {
    view.camera = camera;
    view.size = { w: size.width, h: size.height };
  }, [camera, size]);

  useEffect(() => {
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
    const d = Math.min(delta, 0.1);
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

      if (user.current) {
        panOffset.current.copy(controls.target).sub(pos);
      } else {
        _desired.copy(pos).add(panOffset.current);
        controls.target.lerp(_desired, 1 - Math.exp(-d * 8.2));
      }

      if (anim.current > 0 && !user.current) {
        const dist = framingDistance(body.radius);
        _desired.set(
          pos.x + dist * 0.72,
          pos.y + dist * 0.34,
          pos.z + dist * 0.62,
        );
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

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.12}
      enablePan
      enableRotate
      enableZoom
      screenSpacePanning
      zoomToCursor={false}
      rotateSpeed={0.52}
      zoomSpeed={0.72}
      panSpeed={0.5}
      minPolarAngle={0.22}
      maxPolarAngle={Math.PI - 0.28}
      minDistance={12}
      maxDistance={280}
      onStart={() => {
        user.current = true;
        anim.current = 0;
      }}
      onEnd={() => {
        user.current = false;
      }}
    />
  );
}
