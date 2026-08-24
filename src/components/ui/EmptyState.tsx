import React from 'react';

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-gray-200 rounded-xl bg-white ${className}`}>
      <div className="w-12 h-12 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-brand-text mb-1">{title}</h3>
      <p className="text-sm text-brand-muted max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
