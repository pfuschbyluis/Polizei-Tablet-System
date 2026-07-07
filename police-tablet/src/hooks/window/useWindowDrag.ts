import { useCallback, useEffect, useRef, useState } from 'react';
import type { WindowBounds } from '../../types/shell';

interface DragState {
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

function getTaskbarSize(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--flux-taskbar-size');
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 52;
}

export function useWindowDrag(
  isMaximized: boolean,
  isMinimized: boolean,
  windowBounds: WindowBounds,
  setWindowBounds: (bounds: WindowBounds) => void,
  setWindowFocused: (focused: boolean) => void
) {
  const dragRef = useRef<DragState | null>(null);
  const boundsRef = useRef(windowBounds);
  const snapZoneRef = useRef<string | null>(null);
  const [snapZone, setSnapZone] = useState<string | null>(null);

  useEffect(() => {
    boundsRef.current = windowBounds;
  }, [windowBounds]);

  const onDragStart = useCallback(
    (clientX: number, clientY: number) => {
      if (isMaximized || isMinimized) return;
      dragRef.current = {
        startX: clientX,
        startY: clientY,
        origX: boundsRef.current.x,
        origY: boundsRef.current.y,
      };
      setWindowFocused(true);
    },
    [isMaximized, isMinimized, setWindowFocused]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const taskbar = getTaskbarSize();
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const nx = dragRef.current.origX + dx;
      const ny = dragRef.current.origY + dy;
      const viewportW = window.innerWidth;
      const height = boundsRef.current.height;

      if (nx < 8) {
        snapZoneRef.current = 'left';
        setSnapZone('left');
      } else if (nx + boundsRef.current.width > viewportW - 8) {
        snapZoneRef.current = 'right';
        setSnapZone('right');
      } else {
        snapZoneRef.current = null;
        setSnapZone(null);
      }

      const maxY = Math.max(0, window.innerHeight - taskbar - height);
      const next = {
        ...boundsRef.current,
        x: nx,
        y: Math.max(0, Math.min(ny, maxY)),
      };
      boundsRef.current = next;
      setWindowBounds(next);
    };

    const onUp = () => {
      if (!dragRef.current) return;
      const zone = snapZoneRef.current;
      const taskbar = getTaskbarSize();
      if (zone === 'left') {
        setWindowBounds({
          x: 0,
          y: 0,
          width: window.innerWidth / 2,
          height: window.innerHeight - taskbar,
        });
      } else if (zone === 'right') {
        setWindowBounds({
          x: window.innerWidth / 2,
          y: 0,
          width: window.innerWidth / 2,
          height: window.innerHeight - taskbar,
        });
      }
      dragRef.current = null;
      snapZoneRef.current = null;
      setSnapZone(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [setWindowBounds]);

  return { onDragStart, snapZone };
}
