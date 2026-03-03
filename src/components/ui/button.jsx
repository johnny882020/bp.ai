import { forwardRef } from 'react';

const variants = {
  default:     'bg-slate-900 text-white shadow hover:bg-slate-800',
  destructive: 'bg-red-600 text-white shadow hover:bg-red-700',
  outline:     'border border-slate-200 bg-white hover:bg-slate-50 text-slate-900',
  secondary:   'bg-slate-100 text-slate-900 hover:bg-slate-200',
  ghost:       'hover:bg-slate-100 text-slate-900',
};

const sizes = {
  default: 'h-9 px-4 py-2',
  sm:      'h-8 px-3 text-xs',
  lg:      'h-11 px-8',
  icon:    'h-9 w-9',
};

const Button = forwardRef(({ className = '', variant = 'default', size = 'default', ...props }, ref) => (
  <button
    ref={ref}
    className={`inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors
      focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
      disabled:pointer-events-none disabled:opacity-50
      ${variants[variant] ?? variants.default}
      ${sizes[size] ?? sizes.default}
      ${className}`}
    {...props}
  />
));

Button.displayName = 'Button';
export { Button };
