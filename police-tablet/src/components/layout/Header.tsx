import { Bell, Clock, UserCircle, X } from 'lucide-react';
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

  return (
    <header
      className={`flex shrink-0 items-center justify-between border-b border-police-700/50 bg-police-950/80 backdrop-blur-md ${
        isInGame ? 'px-4 py-2' : 'px-6 py-3'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-police-400">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="whitespace-nowrap">{now}</span>
        </div>
        <Badge variant="blue">{currentOfficer.unit}</Badge>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="relative hidden rounded-lg p-2 text-police-400 hover:bg-police-800/60 hover:text-police-200 transition-colors sm:block"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 border-l border-police-700/50 pl-2 sm:gap-3 sm:pl-3">
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
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="max-w-[140px] truncate text-sm font-medium text-police-100">
                {currentOfficer.name}
              </p>
              <p className="text-[10px] text-police-400">
                {rankLabel} · {currentOfficer.badgeNumber}
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-police-accent/20">
              <UserCircle className="h-5 w-5 text-police-accent" />
            </div>
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
