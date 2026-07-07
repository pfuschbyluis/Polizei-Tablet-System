import PoliceIcon from '../../icons/PoliceIcon';

interface MinimizedWindowBarProps {
  title: string;
  onRestore: () => void;
}

export default function MinimizedWindowBar({ title, onRestore }: MinimizedWindowBarProps) {
  return (
    <div className="flux-window flux-window-minimized animate-flux-minimize">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
        onClick={onRestore}
      >
        <div className="flux-app-icon flux-app-icon-sm">
          <PoliceIcon size={18} />
        </div>
        <span className="text-sm font-medium text-text-primary">{title}</span>
        <span className="ml-auto text-xs text-text-muted">Wiederherstellen</span>
      </button>
    </div>
  );
}
