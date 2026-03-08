import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary',
        urgent: 'border-transparent bg-red-100 text-red-700',
        important: 'border-transparent bg-yellow-100 text-yellow-700',
        normal: 'border-transparent bg-green-100 text-green-700',
        spam: 'border-transparent bg-slate-100 text-slate-500',
        success: 'border-transparent bg-green-100 text-green-700',
        warning: 'border-transparent bg-yellow-100 text-yellow-700',
        error: 'border-transparent bg-red-100 text-red-700',
        outline: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
