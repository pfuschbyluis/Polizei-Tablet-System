import { Clock, UserCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFiveM } from '../../context/FiveMContext';
import { RANK_LABELS, type Rank } from '../../types';
import Badge from '../ui/Badge';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function Header() {
  const { currentOfficer, rankLabel, switchRank, isDevMode } = useAuth();
  const { close, isInGame } = useFiveM();
  const now = new Date().toLocaleString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!currentOfficer) return null;

  return (
    <header
      className={`flex shrink-0 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-md ${
        isInGame ? 'px-4 py-2' : 'px-5 py-2.5'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="whitespace-nowrap">{now}</span>
        </div>
        <Badge variant="blue">{currentOfficer.unit}</Badge>
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
            <UserCircle className="h-5 w-5 text-accent-light" />
          </div>
          {isInGame && (
            <Button variant="ghost" size="sm" onClick={close} title="Schließen (ESC)" className="!p-1.5">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
