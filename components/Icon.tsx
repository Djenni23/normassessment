export function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <span
      className={`material-symbols ${className}`}
      style={{ fontSize: size, lineHeight: 1 }}
      aria-hidden
    >
      {name}
    </span>
  );
}
