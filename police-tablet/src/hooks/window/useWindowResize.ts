import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { WindowBounds } from '../../types/shell';

interface ResizeState {
  startX: number;
  startY: number;
  origW: number;
  origH: number;
}

export function useWindowResize(
  isMaximized: boolean,
  windowBounds: WindowBounds,
  setWindowBounds: (bounds: WindowBounds) => void,
  frameRef: RefObject<HTMLDivElement | null>
) {
  const resizeRef = useRef<ResizeState | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      setWindowBounds({
        ...windowBounds,
        width: Math.max(480, resizeRef.current.origW + dx),
        height: Math.max(360, resizeRef.current.origH + dy),
      });
    };

    const onUp = () => {
      resizeRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [windowBounds, setWindowBounds]);

  const onResizeStart = (clientX: number, clientY: number) => {
    if (isMaximized) return;
    resizeRef.current = {
      startX: clientX,
      startY: clientY,
      origW: windowBounds.width || frameRef.current?.offsetWidth || 900,
      origH: windowBounds.height || frameRef.current?.offsetHeight || 640,
    };
  };

  return { onResizeStart };
}
