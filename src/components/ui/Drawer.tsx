
import { ReactNode } from 'react';
import { Card } from './Card';

export function Drawer({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
      <Card className="w-96 h-full shadow-xl overflow-y-auto">
        <div className="p-4 border-b flex justify-between">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="p-4">{children}</div>
      </Card>
    </div>
  );
}
