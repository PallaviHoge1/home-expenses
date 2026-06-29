export default function Badge({ children, color, className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: color + "18", color, border: `1px solid ${color}30` }}
    >
      {children}
    </span>
  );
}
