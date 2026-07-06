import type { IconName } from '../icons/Icon';
import Icon from '../icons/Icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-xl bg-surface-tertiary/60 p-4">
        <Icon name={icon} size={32} className="text-text-muted" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-text-secondary">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-text-muted">{description}</p>}
    </div>
  );
}
