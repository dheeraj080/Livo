import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary:   'bg-foreground text-background hover:opacity-80 active:opacity-70',
      secondary: 'bg-muted text-foreground hover:bg-muted/70',
      outline:   'border border-border bg-transparent text-foreground hover:bg-muted',
      ghost:     'bg-transparent text-foreground hover:bg-muted',
      danger:    'bg-destructive text-white hover:opacity-90',
    };

    const sizes = {
      sm:   'px-3 py-1.5 text-xs rounded-squircle-sm',
      md:   'px-4 py-2.5 text-sm rounded-squircle-sm',
      lg:   'px-6 py-3.5 text-sm rounded-[16px]',
      icon: 'h-9 w-9 rounded-squircle-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
