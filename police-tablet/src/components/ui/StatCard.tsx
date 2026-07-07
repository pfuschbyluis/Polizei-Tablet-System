import type { IconName } from '../icons/Icon';
import Icon from '../icons/Icon';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: IconName;
  trend?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const iconColors = {
  blue: 'text-accent-light bg-accent-subtle',
  green: 'text-emerald-400 bg-success/15',
  yellow: 'text-amber-300 bg-amber-500/15 ring-1 ring-amber-500/20',
  red: 'text-red-400 bg-danger/15',
  purple: 'text-purple-400 bg-purple-500/15',
};

export default function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-card/60 p-4 transition-colors hover:bg-surface-hover/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-secondary">{title}</p>
          <p className="mt-1.5 text-2xl font-semibold text-text-primary">{value}</p>
          {trend && <p className="mt-0.5 text-xs text-text-muted">{trend}</p>}
        </div>
        <div className={`rounded-lg p-2 ${iconColors[color]}`}>
          <Icon name={icon} size={16} />
        </div>
      </div>
    </div>
  );
}
