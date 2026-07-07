import { useRef, type ReactNode } from 'react';
import { useFiveM } from '../../../context/FiveMContext';
import { useShell } from '../../../context/ShellContext';
import { useWindowChromeActions } from '../../../hooks/window/useWindowChromeActions';
import { useWindowDrag } from '../../../hooks/window/useWindowDrag';
import { useWindowInitialBounds } from '../../../hooks/window/useWindowInitialBounds';
import { useWindowResize } from '../../../hooks/window/useWindowResize';
import TitleBar from '../TitleBar';
import SnapLayoutOverlay from '../SnapLayoutOverlay';

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
  const {
    windowState,
    setWindowState,
    windowBounds,
    setWindowBounds,
    isWindowFocused,
    setWindowFocused,
  } = useShell();

  const frameRef = useRef<HTMLDivElement>(null);
  const isMaximized = windowState === 'maximized';
  const isMinimized = windowState === 'minimized';

  useWindowInitialBounds(frameRef, windowBounds, setWindowBounds);
  const { handleMinimize, handleMaximize, handleClose } = useWindowChromeActions(
    isInGame,
    isMaximized,
    close,
    setWindowState
  );
  const { onDragStart, snapZone } = useWindowDrag(
    isMaximized,
    isMinimized,
    windowBounds,
    setWindowBounds,
    setWindowFocused
  );
  const { onResizeStart } = useWindowResize(isMaximized, windowBounds, setWindowBounds, frameRef);

  const style =
    !isMaximized && !isMinimized && windowBounds.width > 0
      ? {
          position: 'absolute' as const,
          left: windowBounds.x,
          top: windowBounds.y,
          width: windowBounds.width,
          height: windowBounds.height,
        }
      : undefined;

  return (
    <>
      {!isMinimized && <SnapLayoutOverlay activeZone={snapZone} />}
      <div
        ref={frameRef}
        style={style}
        className={`flux-window ${isMinimized ? 'flux-window--minimized' : 'animate-flux-open'} ${
          isMaximized ? 'flux-window-maximized' : 'flux-window-floating'
        } ${isInGame ? 'flux-window-in-game' : ''} ${
          isWindowFocused ? 'flux-window--focused' : 'flux-window--unfocused'
        }`}
        onMouseDown={() => setWindowFocused(true)}
        aria-hidden={isMinimized}
      >
        <div id="flux-notify-root" className="flux-notify-root" aria-live="polite" />
        <TitleBar
          title={title}
          subtitle={subtitle}
          isMaximized={isMaximized}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
          onClose={handleClose}
          onDragStart={onDragStart}
        />
        <div className="flux-window-content">{children}</div>
        {!isMaximized && !isMinimized && (
          <div
            className="flux-window-resize-handle"
            onMouseDown={(e) => {
              e.preventDefault();
              onResizeStart(e.clientX, e.clientY);
            }}
          />
        )}
      </div>
    </>
  );
}
