import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-brand-text mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`block w-full rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white ${
              error 
                ? 'border-brand-danger focus:border-brand-danger' 
                : 'border-gray-200 focus:border-brand-primary'
            } ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-brand-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
