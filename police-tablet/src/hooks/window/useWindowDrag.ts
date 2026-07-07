import { useCallback, useEffect, useRef, useState } from 'react';
import type { WindowBounds } from '../../types/shell';

interface DragState {
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

export function useWindowDrag(
  isMaximized: boolean,
  isMinimized: boolean,
  windowBounds: WindowBounds,
  setWindowBounds: (bounds: WindowBounds) => void,
  setWindowFocused: (focused: boolean) => void
) {
  const dragRef = useRef<DragState | null>(null);
  const [snapZone, setSnapZone] = useState<string | null>(null);

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
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const nx = dragRef.current.origX + dx;
      const ny = dragRef.current.origY + dy;
      const w = window.innerWidth;
      if (nx < 8) setSnapZone('left');
      else if (nx > w - 120) setSnapZone('right');
      else setSnapZone(null);
      setWindowBounds({ ...windowBounds, x: nx, y: Math.max(0, ny) });
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
      setSnapZone(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [windowBounds, setWindowBounds, snapZone]);

  return { onDragStart, snapZone };
}
