import { useEffect } from 'react';
import { useShell } from '../context/ShellContext';

export function useKeyboardShortcuts() {
  const {
    setStartOpen,
    setSearchOpen,
    setQuickSettingsOpen,
    setNotificationsOpen,
    closeAllOverlays,
    startOpen,
    searchOpen,
    quickSettingsOpen,
    notificationsOpen,
    calendarOpen,
  } = useShell();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === 'Escape') {
        if (startOpen || searchOpen || quickSettingsOpen || notificationsOpen || calendarOpen) {
          e.preventDefault();
          closeAllOverlays();
        }
        return;
      }
      if (!mod) return;
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        closeAllOverlays();
        setSearchOpen(true);
      }
      if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        closeAllOverlays();
        setQuickSettingsOpen(true);
      }
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        closeAllOverlays();
        setNotificationsOpen(true);
      }
      if (e.key === ' ' || e.key.toLowerCase() === 'e') {
        e.preventDefault();
        closeAllOverlays();
        setStartOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    closeAllOverlays,
    setStartOpen,
    setSearchOpen,
    setQuickSettingsOpen,
    setNotificationsOpen,
    startOpen,
    searchOpen,
    quickSettingsOpen,
    notificationsOpen,
    calendarOpen,
  ]);
}
