import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useFiveM } from '../../context/FiveMContext';
import { useShell } from '../../context/ShellContext';
import TitleBar from './TitleBar';
import PoliceIcon from '../icons/PoliceIcon';
import SnapLayoutOverlay from './SnapLayoutOverlay';

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
    setWindowFocused,
  } = useShell();

  const frameRef = useRef<HTMLDivElement>(null);
  const [snapZone, setSnapZone] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);

  const isMaximized = windowState === 'maximized';
  const isMinimized = windowState === 'minimized';

  useEffect(() => {
    if (windowBounds.width === 0 && frameRef.current) {
      const w = Math.min(1280, window.innerWidth * 0.88);
      const h = Math.min(860, window.innerHeight * 0.78);
      setWindowBounds({
        x: Math.max(0, (window.innerWidth - w) / 2),
        y: Math.max(0, (window.innerHeight - h - 52) / 2),
        width: w,
        height: h,
      });
    }
  }, [windowBounds.width, setWindowBounds]);

  const handleMinimize = useCallback(() => {
    setWindowState('minimized');
  }, [setWindowState]);

  const handleMaximize = useCallback(() => {
    setWindowState(isMaximized ? 'normal' : 'maximized');
  }, [isMaximized, setWindowState]);

  const handleClose = useCallback(() => {
    if (isInGame) close();
    else setWindowState('minimized');
  }, [isInGame, close, setWindowState]);

  const onDragStart = useCallback(
    (clientX: number, clientY: number) => {
      if (isMaximized || isMinimized) return;
      dragRef.current = {
        startX: clientX,
        startY: clientY,
        origX: windowBounds.x,
        origY: windowBounds.y,
      };
      setWindowFocused(true);
    },
    [isMaximized, isMinimized, windowBounds, setWindowFocused]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        let nx = dragRef.current.origX + dx;
        let ny = dragRef.current.origY + dy;
        const w = window.innerWidth;
        if (nx < 8) setSnapZone('left');
        else if (nx > w - 120) setSnapZone('right');
        else setSnapZone(null);
        setWindowBounds({ ...windowBounds, x: nx, y: Math.max(0, ny) });
      }
      if (resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        setWindowBounds({
          ...windowBounds,
          width: Math.max(480, resizeRef.current.origW + dx),
          height: Math.max(360, resizeRef.current.origH + dy),
        });
      }
    };
    const onUp = () => {
      if (snapZone === 'left') {
        setWindowBounds({ x: 0, y: 0, width: window.innerWidth / 2, height: window.innerHeight - 56 });
      } else if (snapZone === 'right') {
        setWindowBounds({
          x: window.innerWidth / 2,
          y: 0,
          width: window.innerWidth / 2,
          height: window.innerHeight - 56,
        });
      }
      dragRef.current = null;
      resizeRef.current = null;
      setSnapZone(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [windowBounds, setWindowBounds, snapZone]);

  if (isMinimized) {
    return (
      <div className="flux-window flux-window-minimized animate-flux-minimize">
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
          onClick={() => setWindowState('normal')}
        >
          <div className="flux-app-icon flux-app-icon-sm">
            <PoliceIcon size={18} />
          </div>
          <span className="text-sm font-medium text-text-primary">{title}</span>
          <span className="ml-auto text-xs text-text-muted">Wiederherstellen</span>
        </button>
      </div>
    );
  }

  const style =
    !isMaximized && windowBounds.width > 0
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
      <SnapLayoutOverlay activeZone={snapZone} />
      <div
        ref={frameRef}
        style={style}
        className={`flux-window animate-flux-open ${isMaximized ? 'flux-window-maximized' : 'flux-window-floating'} ${
          isInGame ? 'flux-window-in-game' : ''
        }`}
        onMouseDown={() => setWindowFocused(true)}
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
        {!isMaximized && (
          <div
            className="flux-window-resize-handle"
            onMouseDown={(e) => {
              e.preventDefault();
              resizeRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                origW: windowBounds.width || frameRef.current?.offsetWidth || 900,
                origH: windowBounds.height || frameRef.current?.offsetHeight || 640,
              };
            }}
          />
        )}
      </div>
    </>
  );
}
