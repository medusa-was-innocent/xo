import { BODIES } from "./catalog";
import { useUniverse } from "./store";

function yieldFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function loadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export async function preloadAssets() {
  const setBoot = useUniverse.getState().setBoot;
  setBoot(22, "Opening the night", false);
  await yieldFrame();
  setBoot(64, "Cueing the system", false);
  const first = BODIES.slice(0, 3).map((b) => loadImage(b.cover));
  await Promise.race([Promise.all(first), new Promise<void>((r) => window.setTimeout(r, 180))]);
  void Promise.all(BODIES.map((b) => loadImage(b.cover)));
  await yieldFrame();
  setBoot(100, "Ready", true);
}