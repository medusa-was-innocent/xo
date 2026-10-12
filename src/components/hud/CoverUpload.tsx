import { useRef, useState, type MouseEvent } from "react";
import { ImagePlus, RotateCcw } from "lucide-react";
import type { BodyId } from "@/lib/catalog";
import { deleteCover, fileToCoverBlob, writeCover } from "@/lib/covers";
import { useUniverse } from "@/lib/store";

export function CoverUpload({ id, compact }: { id: BodyId; compact?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const custom = useUniverse((s) => s.customCovers[id]);
  const setCustomCover = useUniverse((s) => s.setCustomCover);
  const clearCustomCover = useUniverse((s) => s.clearCustomCover);
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file || busy) return;
    setBusy(true);
    try {
      const blob = await fileToCoverBlob(file);
      await writeCover(id, blob);
      setCustomCover(id, URL.createObjectURL(blob));
    } catch {
      /* pictures only */
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const reset = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteCover(id);
    clearCustomCover(id);
  };

  return (
    <div
      className={`cover-upload ${compact ? "is-compact" : ""} ${busy ? "is-busy" : ""}`}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <button
        type="button"
        className="cover-upload-btn"
        aria-label="Upload cover picture"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        <ImagePlus className={compact ? "size-3.5" : "size-4"} />
      </button>
      {custom ? (
        <button type="button" className="cover-upload-btn" aria-label="Reset cover" onClick={(e) => void reset(e)}>
          <RotateCcw className={compact ? "size-3.5" : "size-4"} />
        </button>
      ) : null}
    </div>
  );
}
