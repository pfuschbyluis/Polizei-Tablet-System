interface ActiveStatusPillProps {
  active: boolean;
}

export default function ActiveStatusPill({ active }: ActiveStatusPillProps) {
  return (
    <span className={`flux-status-pill ${active ? 'flux-status-pill--active' : 'flux-status-pill--inactive'}`}>
      <span className="flux-status-pill__dot" aria-hidden />
      {active ? 'Aktiv' : 'Inaktiv'}
    </span>
  );
}
