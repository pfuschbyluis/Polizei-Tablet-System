import PoliceIcon from '../icons/PoliceIcon';
import WindowControls from './WindowControls';

interface TitleBarProps {
  title: string;
  subtitle?: string;
  isMaximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onDragStart: (clientX: number, clientY: number) => void;
}

export default function TitleBar({
  title,
  subtitle,
  isMaximized,
  onMinimize,
  onMaximize,
  onClose,
  onDragStart,
}: TitleBarProps) {
  return (
    <div
      className="flux-titlebar flux-titlebar--draggable"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onDragStart(e.clientX, e.clientY);
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flux-app-icon flux-app-icon--lg">
          <PoliceIcon size={22} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">{title}</p>
          {subtitle && <p className="truncate text-[11px] text-text-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <WindowControls
          isMaximized={isMaximized}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
