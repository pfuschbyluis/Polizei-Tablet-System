import { Bell, Clock, UserCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFiveM } from '../../context/FiveMContext';
import { RANK_LABELS, type Rank } from '../../types';
import Badge from '../ui/Badge';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function Header() {
  const { currentOfficer, rankLabel, switchRank, login, allOfficers, isDevMode } = useAuth();
  const { close, isInGame } = useFiveM();
  const now = new Date().toLocaleString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="flex items-center justify-between border-b border-police-700/50 bg-police-950/60 px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-police-400">
          <Clock className="h-3.5 w-3.5" />
          <span>{now}</span>
        </div>
        <Badge variant="blue">{currentOfficer.unit}</Badge>
        {isInGame && (
          <Badge variant="green">FiveM</Badge>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-police-400 hover:bg-police-800/60 hover:text-police-200 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3 border-l border-police-700/50 pl-4">
          {isDevMode && (
            <>
              <div className="hidden md:block w-40">
                <Select
                  label=""
                  value={currentOfficer.id}
                  onChange={(e) => login(e.target.value)}
                  options={allOfficers.map((o) => ({
                    value: o.id,
                    label: o.name.split(' ').slice(-1)[0],
                  }))}
                  className="!py-1.5 !text-xs"
                />
              </div>
              <div className="hidden lg:block w-36">
                <Select
                  label=""
                  value={currentOfficer.rank}
                  onChange={(e) => switchRank(e.target.value as Rank)}
                  options={Object.entries(RANK_LABELS).map(([value, label]) => ({ value, label }))}
                  className="!py-1.5 !text-xs"
                />
              </div>
            </>
          )}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-police-100">{currentOfficer.name}</p>
              <p className="text-[11px] text-police-400">
                {rankLabel} · {currentOfficer.badgeNumber}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-police-accent/20">
              <UserCircle className="h-6 w-6 text-police-accent" />
            </div>
          </div>
          {isInGame && (
            <Button variant="ghost" size="sm" onClick={close} title="Schließen (ESC)">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
