import { useEffect, type ReactNode } from 'react';
import Icon from '../icons/Icon';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-y-auto rounded-xl border border-border-strong bg-surface-secondary shadow-2xl animate-flux-fade-up`}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border px-5 py-4 bg-surface-secondary">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="!p-1.5">
            <Icon name="close" size={16} />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
