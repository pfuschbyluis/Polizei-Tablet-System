import { useState, useCallback, type ReactNode } from 'react';
import { useFiveM } from '../../context/FiveMContext';
import TitleBar from './TitleBar';
import Icon from '../icons/Icon';

type WindowState = 'normal' | 'maximized' | 'minimized';

interface WindowFrameProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function WindowFrame({
  children,
  title = 'POLIS',
  subtitle = 'Polizei Information System',
}: WindowFrameProps) {
  const { isInGame, close } = useFiveM();
  const [windowState, setWindowState] = useState<WindowState>('normal');

  const isMaximized = windowState === 'maximized';
  const isMinimized = windowState === 'minimized';

  const handleMinimize = useCallback(() => {
    setWindowState((s) => (s === 'minimized' ? 'normal' : 'minimized'));
  }, []);

  const handleMaximize = useCallback(() => {
    setWindowState((s) => (s === 'maximized' ? 'normal' : 'maximized'));
  }, []);

  const handleClose = useCallback(() => {
    if (isInGame) {
      close();
    } else {
      setWindowState('minimized');
    }
  }, [isInGame, close]);

  if (isMinimized) {
    return (
      <div className="flux-window flux-window-minimized animate-flux-minimize">
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
          onClick={() => setWindowState('normal')}
        >
          <div className="flux-app-icon flux-app-icon-sm">
            <Icon name="shield" size={14} className="text-accent" />
          </div>
          <span className="text-sm font-medium text-text-primary">{title}</span>
          <span className="ml-auto text-xs text-text-muted">Klicken zum Öffnen</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flux-window animate-flux-open ${isMaximized ? 'flux-window-maximized' : ''} ${
        isInGame ? 'flux-window-in-game' : ''
      }`}
    >
      <TitleBar
        title={title}
        subtitle={subtitle}
        isMaximized={isMaximized}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onClose={handleClose}
      />
      <div className="flux-window-content">{children}</div>
    </div>
  );
}
