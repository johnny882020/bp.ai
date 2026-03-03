import { forwardRef } from 'react';

const Select = forwardRef(({ className = '', children, ...props }, ref) => (
  <select
    ref={ref}
    className={`flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm
      focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
      disabled:cursor-not-allowed disabled:opacity-50
      ${className}`}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = 'Select';
export { Select };
