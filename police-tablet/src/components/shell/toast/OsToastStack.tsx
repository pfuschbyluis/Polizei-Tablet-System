import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../icons/Icon';
import PoliceIcon from '../../icons/PoliceIcon';
import type { NotifyType } from '../../../context/NotifyContext';
import { toastTypeClass, toastTypeIcons, toastTypeTitles } from './toastConfig';

export interface ToastItem {
  id: string;
  message: string;
  type: NotifyType;
}

interface OsToastStackProps {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}

export default function OsToastStack({ items, onDismiss }: OsToastStackProps) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setRoot(document.getElementById('flux-notify-root'));
  }, []);

  if (!root || items.length === 0) return null;

  return createPortal(
    <div className="flux-os-toast-stack">
      {items.map((item) => (
        <div key={item.id} className={`flux-os-toast ${toastTypeClass[item.type]}`} role="alert">
          <div className="flux-os-toast-accent" aria-hidden />
          <div className="flux-os-toast-app-icon">
            <PoliceIcon size={16} />
          </div>
          <div className="flux-os-toast-body">
            <p className="flux-os-toast-title">{toastTypeTitles[item.type]}</p>
            <p className="flux-os-toast-message">{item.message}</p>
          </div>
          <div className="flux-os-toast-type-icon" aria-hidden>
            <Icon name={toastTypeIcons[item.type]} size={16} />
          </div>
          <button
            type="button"
            onClick={() => onDismiss(item.id)}
            className="flux-os-toast-close"
            aria-label="Schließen"
          >
            <Icon name="close" size={12} />
          </button>
        </div>
      ))}
    </div>,
    root
  );
}
