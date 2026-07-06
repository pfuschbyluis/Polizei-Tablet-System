import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  padding?: boolean;
}

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  padding = true,
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface-card/80 backdrop-blur-sm ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div>
            {title && <h3 className="text-sm font-semibold text-text-primary">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </div>
  );
}
