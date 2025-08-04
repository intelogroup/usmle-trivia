import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient';
  size?: 'default' | 'sm' | 'lg' | 'large' | 'icon';
  children: React.ReactNode;
}

const buttonVariants = {
  variant: {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-custom hover:shadow-custom-md',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-custom hover:shadow-custom-md',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-custom hover:shadow-custom-md',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-custom hover:shadow-custom-md',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
    gradient: 'gradient-primary text-white shadow-custom hover:shadow-custom-md hover:opacity-90',
  },
  size: {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-lg px-3',
    lg: 'h-11 rounded-lg px-8',
    large: 'h-12 rounded-lg px-10 text-base',
    icon: 'h-10 w-10',
  },
};

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};