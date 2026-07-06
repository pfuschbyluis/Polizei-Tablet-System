import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const colors = {
  blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
  green: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
  yellow: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
  red: 'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400',
  purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
};

export default function StatCard({ title, value, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border bg-gradient-to-br p-5 ${colors[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-police-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-police-50">{value}</p>
          {trend && <p className="mt-1 text-xs text-police-400">{trend}</p>}
        </div>
        <div className={`rounded-lg bg-police-900/50 p-2.5 ${colors[color].split(' ').pop()}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
