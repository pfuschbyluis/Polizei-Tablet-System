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
      className={`rounded-xl border border-police-700/50 bg-police-900/60 backdrop-blur-sm ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-police-700/40 px-5 py-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-police-100">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-police-400">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </div>
  );
}
