import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-squircle-sm border bg-input px-3.5 py-2.5 text-sm text-foreground',
        'placeholder:text-muted-foreground/40 transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-foreground/12 focus:border-foreground/25',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error
          ? 'border-destructive ring-1 ring-destructive/20'
          : 'border-border',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
