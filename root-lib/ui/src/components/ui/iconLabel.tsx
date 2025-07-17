import { DynamicIcon } from './dynamicIcon';
import { IconName } from '../../lib/icon-registry';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../utils';

const iconVariants = cva(
  "flex items-center justify-center rounded-lg  p-2",
  {
    variants: {
      variant: {
        default: "bg-primary-default text-primary-default ",
        primary: "bg-blue-500/20 text-blue-500",
        secondary: "bg-purple-500/20 text-purple-500",
        tertiary: "bg-green-500/20 text-green-500",
      },
      size: {
        default: "h-9 w-9",
        sm: "h-8 w-8",

        lg: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export const IconLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof iconVariants> & {
      icon: IconName;
      text?: string;
    }
>(({ className, icon, text, variant, size, ...props }, ref) => {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      ref={ref}
      {...props}
    >
      <span className={cn(iconVariants({ variant, size }))}>
        <DynamicIcon name={icon} />
      </span>
      {text && <span>{text}</span>}
    </div>
  );
});

IconLabel.displayName = "IconLabel";
