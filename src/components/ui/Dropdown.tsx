import React, { useState, useRef, useEffect } from 'react';

type DropdownProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
};

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`absolute z-50 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${className}`}
          onClick={() => setIsOpen(false)}
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}> = ({ children, onClick, icon, danger }) => {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center px-4 py-2 text-sm transition-colors ${
        danger 
          ? 'text-brand-danger hover:bg-brand-danger/5' 
          : 'text-brand-text hover:bg-gray-50'
      }`}
    >
      {icon && (
        <span className={`mr-3 ${danger ? 'text-brand-danger' : 'text-gray-400 group-hover:text-brand-primary'}`}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};
