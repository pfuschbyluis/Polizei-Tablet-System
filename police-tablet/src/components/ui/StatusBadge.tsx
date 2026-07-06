import Badge from './Badge';

type StatusType =
  | 'offen'
  | 'in_bearbeitung'
  | 'abgeschlossen'
  | 'geplant'
  | 'aktiv'
  | 'abgebrochen'
  | 'gültig'
  | 'abgelaufen'
  | 'entzogen'
  | 'gesucht'
  | 'zugelassen'
  | 'abgemeldet'
  | 'gesperrt'
  | 'unbekannt'
  | 'niedrig'
  | 'mittel'
  | 'hoch'
  | 'kritisch';

const statusConfig: Record<StatusType, { label: string; variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray' }> = {
  offen: { label: 'Offen', variant: 'blue' },
  in_bearbeitung: { label: 'In Bearbeitung', variant: 'yellow' },
  abgeschlossen: { label: 'Abgeschlossen', variant: 'green' },
  geplant: { label: 'Geplant', variant: 'gray' },
  aktiv: { label: 'Aktiv', variant: 'red' },
  abgebrochen: { label: 'Abgebrochen', variant: 'gray' },
  gültig: { label: 'Gültig', variant: 'green' },
  abgelaufen: { label: 'Abgelaufen', variant: 'yellow' },
  entzogen: { label: 'Entzogen', variant: 'red' },
  gesucht: { label: 'Gesucht', variant: 'red' },
  zugelassen: { label: 'Zugelassen', variant: 'green' },
  abgemeldet: { label: 'Abgemeldet', variant: 'gray' },
  gesperrt: { label: 'Gesperrt', variant: 'red' },
  unbekannt: { label: 'Unbekannt', variant: 'gray' },
  niedrig: { label: 'Niedrig', variant: 'gray' },
  mittel: { label: 'Mittel', variant: 'yellow' },
  hoch: { label: 'Hoch', variant: 'red' },
  kritisch: { label: 'Kritisch', variant: 'red' },
};

interface StatusBadgeProps {
  status: StatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'gray' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
