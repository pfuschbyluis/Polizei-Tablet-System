import { useFiveM } from '../../context/FiveMContext';
import Icon from '../icons/Icon';

interface WindowControlsProps {
  isMaximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export default function WindowControls({
  isMaximized,
  onMinimize,
  onMaximize,
  onClose,
}: WindowControlsProps) {
  const { isInGame } = useFiveM();

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={onMinimize}
        className="flux-win-btn flux-win-btn-min"
        title="Minimieren"
        aria-label="Minimieren"
      >
        <Icon name="minimize" size={14} />
      </button>
      <button
        type="button"
        onClick={onMaximize}
        className="flux-win-btn flux-win-btn-max"
        title={isMaximized ? 'Wiederherstellen' : 'Maximieren'}
        aria-label={isMaximized ? 'Wiederherstellen' : 'Maximieren'}
      >
        <Icon name={isMaximized ? 'restore' : 'maximize'} size={13} />
      </button>
      <button
        type="button"
        onClick={onClose}
        className="flux-win-btn flux-win-btn-close"
        title={isInGame ? 'Schließen (ESC)' : 'Schließen'}
        aria-label="Schließen"
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}
