import Icon from '../icons/Icon';
import { useTheme } from '../../context/ThemeContext';
import WindowControls from './WindowControls';

interface TitleBarProps {
  title: string;
  subtitle?: string;
  isMaximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export default function TitleBar({
  title,
  subtitle,
  isMaximized,
  onMinimize,
  onMaximize,
  onClose,
}: TitleBarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flux-titlebar">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flux-app-icon">
          <Icon name="shield" size={16} className="text-accent" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">{title}</p>
          {subtitle && (
            <p className="truncate text-[11px] text-text-muted">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="flux-icon-btn"
          title={theme === 'dark' ? 'Helles Design' : 'Dunkles Design'}
          aria-label="Design wechseln"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
        </button>
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
