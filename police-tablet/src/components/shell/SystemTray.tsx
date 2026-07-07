import { useEffect, useState } from 'react';
import Icon from '../icons/Icon';
import CalendarPopup from './CalendarPopup';
import QuickSettings from './QuickSettings';
import NotificationCenter from './NotificationCenter';
import { useShell } from '../../context/ShellContext';

export default function SystemTray() {
  const {
    systemStatus,
    setQuickSettingsOpen,
    quickSettingsOpen,
    setNotificationsOpen,
    notificationsOpen,
    setCalendarOpen,
    calendarOpen,
    closeAllOverlays,
    settings,
    notificationHistory,
  } = useShell();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });

  const unread = settings.doNotDisturb ? 0 : notificationHistory.length;

  return (
    <div className="flux-system-tray">
      <div className="flux-system-tray__status">
        <Icon name="wifi" size={15} className={systemStatus.wifi ? 'text-accent-light' : 'text-text-muted'} />
        <Icon name="bluetooth" size={15} className={systemStatus.bluetooth ? 'text-accent-light' : 'text-text-muted'} />
        <Icon name="volume" size={15} className="text-text-secondary" />
        <Icon name="battery" size={15} className="text-text-secondary" />
        {systemStatus.location && <Icon name="map-pin" size={14} className="text-text-muted" />}
      </div>

      <button
        type="button"
        className={`flux-shell-icon-btn ${quickSettingsOpen ? 'flux-shell-icon-btn--active' : ''}`}
        title="Schnelleinstellungen"
        onClick={() => {
          closeAllOverlays();
          setQuickSettingsOpen(!quickSettingsOpen);
        }}
      >
        <Icon name="settings" size={16} />
      </button>

      <button
        type="button"
        className={`flux-shell-icon-btn flux-tray-bell ${notificationsOpen ? 'flux-shell-icon-btn--active' : ''}`}
        title="Benachrichtigungen"
        onClick={() => {
          closeAllOverlays();
          setNotificationsOpen(!notificationsOpen);
        }}
      >
        <Icon name="bell" size={16} />
        {unread > 0 && <span className="flux-tray-bell__badge">{Math.min(unread, 9)}</span>}
      </button>

      <button
        type="button"
        className={`flux-tray-clock ${calendarOpen ? 'flux-tray-clock--active' : ''}`}
        onClick={() => {
          closeAllOverlays();
          setCalendarOpen(!calendarOpen);
        }}
      >
        <span className="flux-tray-clock__time">{time}</span>
        <span className="flux-tray-clock__date">{date}</span>
      </button>

      <QuickSettings />
      <NotificationCenter />
      <CalendarPopup now={now} />
    </div>
  );
}
