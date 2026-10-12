import type { BodyId } from "./catalog";

const DB_NAME = "xo-universe-covers";
const STORE = "covers";
const MAX_EDGE = 1024;
const ACCEPT = /^image\/(jpeg|jpg|png|webp|gif|bmp|avif)$/i;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export function isImageFile(file: File) {
  if (ACCEPT.test(file.type)) return true;
  return /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);
}

export async function readAllCovers(): Promise<Record<string, Blob>> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAllKeys();
      req.onsuccess = () => {
        const keys = req.result as IDBValidKey[];
        if (!keys.length) {
          resolve({});
          return;
        }
        const out: Record<string, Blob> = {};
        let left = keys.length;
        keys.forEach((key) => {
          const get = tx.objectStore(STORE).get(key);
          get.onsuccess = () => {
            const val = get.result;
            if (val instanceof Blob) out[String(key)] = val;
            left -= 1;
            if (left === 0) resolve(out);
          };
          get.onerror = () => {
            left -= 1;
            if (left === 0) resolve(out);
          };
        });
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return {};
  }
}

export async function writeCover(id: BodyId, blob: Blob) {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(blob, id);
  await txDone(tx);
}

export async function deleteCover(id: BodyId) {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(id);
  await txDone(tx);
}

export async function fileToCoverBlob(file: File): Promise<Blob> {
  if (!isImageFile(file)) throw new Error("pictures-only");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("canvas");
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  if (!blob) throw new Error("encode");
  return blob;
}
