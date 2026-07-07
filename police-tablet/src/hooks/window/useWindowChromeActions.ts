import { useCallback } from 'react';
import type { WindowChromeState } from '../../types/shell';

export function useWindowChromeActions(
  isInGame: boolean,
  isMaximized: boolean,
  close: () => void,
  setWindowState: (state: WindowChromeState) => void
) {
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

  return { handleMinimize, handleMaximize, handleClose };
}
