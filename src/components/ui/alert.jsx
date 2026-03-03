export function Alert({ className = '', variant = 'default', children }) {
  const variantClass = variant === 'destructive'
    ? 'border-red-200 bg-red-50 text-red-900'
    : 'border-blue-200 bg-blue-50 text-blue-900';

  return (
    <div className={`relative w-full rounded-lg border p-4 ${variantClass} ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ className = '', children }) {
  return <div className={`text-sm ${className}`}>{children}</div>;
}
