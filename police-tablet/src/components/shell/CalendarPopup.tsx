import { useShell } from '../../context/ShellContext';

interface CalendarPopupProps {
  now: Date;
}

export default function CalendarPopup({ now }: CalendarPopupProps) {
  const { calendarOpen, closeAllOverlays } = useShell();

  if (!calendarOpen) return null;

  const monthLabel = now.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  const weekday = now.toLocaleDateString('de-DE', { weekday: 'long' });
  const day = now.getDate();

  return (
    <div className="flux-flyout flux-calendar-popup" onClick={(e) => e.stopPropagation()}>
      <div className="flux-calendar-popup__hero">
        <p className="flux-calendar-popup__weekday">{weekday}</p>
        <p className="flux-calendar-popup__day">{day}</p>
        <p className="flux-calendar-popup__month">{monthLabel}</p>
      </div>
      <div className="flux-calendar-popup__events">
        <p className="flux-flyout__empty">Keine Termine für heute</p>
      </div>
      <button type="button" className="flux-flyout__close" onClick={closeAllOverlays}>
        Schließen
      </button>
    </div>
  );
}
