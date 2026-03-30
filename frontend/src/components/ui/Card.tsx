import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('rounded-squircle border border-border bg-card text-card-foreground', className)}>
    {children}
  </div>
);

const CardHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('flex flex-col space-y-1 p-6', className)}>{children}</div>
);

const CardTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={cn('text-lg font-semibold tracking-tight', className)}>{children}</h3>
);

const CardDescription = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <p className={cn('text-sm text-muted-foreground leading-relaxed', className)}>{children}</p>
);

const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('p-6 pt-0', className)}>{children}</div>
);

const CardFooter = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('flex items-center p-6 pt-0', className)}>{children}</div>
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
