export function Badge({ className = '', style, children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
