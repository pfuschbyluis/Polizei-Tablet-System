import { useShell } from '../../context/ShellContext';

export default function ShellOverlayBackdrop() {
  const {
    startOpen,
    searchOpen,
    quickSettingsOpen,
    notificationsOpen,
    calendarOpen,
    closeAllOverlays,
  } = useShell();

  const visible =
    startOpen || searchOpen || quickSettingsOpen || notificationsOpen || calendarOpen;

  if (!visible) return null;

  return (
    <div
      className="flux-shell-backdrop"
      onClick={closeAllOverlays}
      aria-hidden="true"
    />
  );
}
