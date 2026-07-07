import Icon from '../icons/Icon';
import { useAuth } from '../../context/AuthContext';
import { RANK_LABELS, type Rank } from '../../types';
import Select from '../ui/Select';

export default function Header() {
  const { currentOfficer, rankLabel, switchRank, isDevMode } = useAuth();
  const now = new Date().toLocaleString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!currentOfficer) return null;

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Icon name="clock" size={14} className="shrink-0" />
          <span className="whitespace-nowrap">{now}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {isDevMode && (
          <div className="hidden w-32 lg:block">
            <Select
              label=""
              value={currentOfficer.rank}
              onChange={(e) => switchRank(e.target.value as Rank)}
              options={Object.entries(RANK_LABELS).map(([value, label]) => ({ value, label }))}
              className="!py-1.5 !text-xs"
            />
          </div>
        )}
        <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-[140px] truncate text-sm font-medium text-text-primary">
              {currentOfficer.name}
            </p>
            <p className="text-[10px] text-text-muted">
              {rankLabel} · {currentOfficer.badgeNumber}
            </p>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-subtle ring-1 ring-accent/20">
            <Icon name="user" size={20} className="text-accent-light" />
          </div>
        </div>
      </div>
    </header>
  );
}
