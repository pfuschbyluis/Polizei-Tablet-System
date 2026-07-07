export default function SnapLayoutOverlay({ activeZone }: { activeZone: string | null }) {
  if (!activeZone) return null;
  return (
    <div className="flux-snap-overlay">
      <div className={`flux-snap-zone flux-snap-zone--${activeZone}`} />
    </div>
  );
}
