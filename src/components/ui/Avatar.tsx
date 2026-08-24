import React from 'react';

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  src?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
};

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  fallback, 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full shrink-0 ${sizes[size]} ${className}`}
      {...props}
    >
      {src ? (
        <img src={src} alt={fallback} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
          {fallback}
        </div>
      )}
    </div>
  );
};
