import { useEffect, type RefObject } from 'react';
import type { WindowBounds } from '../../types/shell';

export function useWindowInitialBounds(
  frameRef: RefObject<HTMLDivElement | null>,
  windowBounds: WindowBounds,
  setWindowBounds: (bounds: WindowBounds) => void
) {
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
  }, [windowBounds.width, setWindowBounds, frameRef]);
}
