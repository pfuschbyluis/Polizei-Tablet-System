import { toastTypeTitles } from './toast/toastConfig';
import Icon from '../icons/Icon';
import { useShell } from '../../context/ShellContext';

export default function NotificationCenter() {
  const { notificationsOpen, notificationHistory, clearNotifications, settings, closeAllOverlays } = useShell();

  if (!notificationsOpen) return null;

  return (
    <div className="flux-flyout flux-notification-center" onClick={(e) => e.stopPropagation()}>
      <div className="flux-flyout__header">
        <h3>Benachrichtigungen</h3>
        {settings.doNotDisturb && <span className="flux-flyout__badge">Nicht stören</span>}
        <button type="button" className="flux-shell-icon-btn" onClick={clearNotifications} title="Alle löschen">
          <Icon name="trash" size={14} />
        </button>
      </div>
      <div className="flux-notification-center__list">
        {notificationHistory.length === 0 ? (
          <p className="flux-flyout__empty">Keine Benachrichtigungen</p>
        ) : (
          notificationHistory.map((item) => (
            <div key={item.id} className={`flux-notification-item flux-notification-item--${item.type}`}>
              <p className="flux-notification-item__title">{toastTypeTitles[item.type]}</p>
              <p className="flux-notification-item__message">{item.message}</p>
              <p className="flux-notification-item__time">
                {new Date(item.timestamp).toLocaleString('de-DE')}
              </p>
            </div>
          ))
        )}
      </div>
      <button type="button" className="flux-flyout__close" onClick={closeAllOverlays}>
        Schließen
      </button>
    </div>
  );
}
