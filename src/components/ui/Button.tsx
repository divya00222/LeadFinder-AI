import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-brand-primary hover:bg-brand-secondary text-white focus:ring-brand-primary/50 shadow-sm',
      secondary: 'bg-brand-secondary hover:bg-brand-primary text-white focus:ring-brand-secondary/50 shadow-sm',
      outline: 'border border-gray-200 bg-white text-brand-text hover:bg-gray-50 focus:ring-gray-200 shadow-sm',
      ghost: 'text-brand-muted hover:text-brand-text hover:bg-gray-100 focus:ring-gray-200',
      danger: 'bg-brand-danger hover:bg-red-600 text-white focus:ring-red-500 shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
