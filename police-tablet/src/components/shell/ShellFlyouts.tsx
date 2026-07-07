import CalendarPopup from './CalendarPopup';
import NotificationCenter from './NotificationCenter';
import QuickSettings from './QuickSettings';

interface ShellFlyoutsProps {
  now: Date;
}

export default function ShellFlyouts({ now }: ShellFlyoutsProps) {
  return (
    <>
      <QuickSettings />
      <NotificationCenter />
      <CalendarPopup now={now} />
    </>
  );
}
