/** Real, scannable QR (modules computed server-side, 4-module quiet zone). */
export function Qr({
  modules,
  label,
  size = 120,
}: {
  modules: boolean[][];
  label: string;
  size?: number;
}) {
  const n = modules.length;
  const q = 4;
  let d = "";
  modules.forEach((row, y) =>
    row.forEach((on, x) => {
      if (on) d += `M${x + q} ${y + q}h1v1h-1z`;
    }),
  );
  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`0 0 ${n + q * 2} ${n + q * 2}`}
      shapeRendering="crispEdges"
      className="rounded-sm"
    >
      <rect width="100%" height="100%" fill="#f5f5f5" />
      <path d={d} fill="#070707" />
    </svg>
  );
}
