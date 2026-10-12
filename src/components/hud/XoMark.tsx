export function XoMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`xo-mark ${className}`}
      style={{ width: size, height: Math.round(size * 1.05) }}
      aria-hidden
    >
      <img src="/xo-logo.png" alt="" draggable={false} />
    </span>
  );
}

export function XoHero({ className = "" }: { className?: string }) {
  return (
    <div className={`xo-hero ${className}`}>
      <img src="/xo-logo.png" alt="XO" draggable={false} />
    </div>
  );
}
