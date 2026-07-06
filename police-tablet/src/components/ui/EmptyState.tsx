import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-police-800/50 p-4">
        <Icon className="h-8 w-8 text-police-500" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-police-300">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-police-500">{description}</p>}
    </div>
  );
}
