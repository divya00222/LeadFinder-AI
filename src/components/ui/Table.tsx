import React from 'react';

export function Table({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`w-full overflow-auto ${className}`}>
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="text-xs text-brand-muted uppercase bg-gray-50/50 border-b border-gray-100">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-50">{children}</tbody>;
}

export function TableRow({ children, className = '', ...props }: { children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`hover:bg-gray-50/50 transition-colors ${className}`} {...props}>{children}</tr>;
}

export function TableHead({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <th className={`px-6 py-4 font-semibold tracking-wider ${className}`}>{children}</th>;
}

export function TableCell({ children, className = '', ...props }: { children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-6 py-4 ${className}`} {...props}>{children}</td>;
}
