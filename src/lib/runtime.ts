import * as THREE from "three";

export const bodyPositions = new Map<string, THREE.Vector3>();

export const audioEnergy = {
  level: 0,
  bass: 0,
  mid: 0,
  playingBodyId: null as string | null,
};

export const view = {
  camera: null as THREE.Camera | null,
  size: { w: 1, h: 1 },
};

export function framingDistance(radius: number) {
  return Math.max(10, radius * 6.8);
}

export function minZoomDistance(radius: number) {
  return Math.max(6.4, radius * 4.2);
}
