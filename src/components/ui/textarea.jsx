import { forwardRef } from 'react';

const Textarea = forwardRef(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm
      placeholder:text-muted-foreground
      focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
      disabled:cursor-not-allowed disabled:opacity-50
      ${className}`}
    {...props}
  />
));

Textarea.displayName = 'Textarea';
export { Textarea };
