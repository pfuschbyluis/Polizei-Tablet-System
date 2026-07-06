import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  size?: 'sm' | 'md';
}

const variants = {
  default: 'bg-surface-hover text-text-secondary border-border',
  blue: 'bg-accent-subtle text-accent-light border-accent/20',
  green: 'bg-success/15 text-success border-success/25',
  yellow: 'bg-warning/15 text-warning border-warning/25',
  red: 'bg-danger/15 text-danger border-danger/25',
  gray: 'bg-surface-hover text-text-muted border-border',
};

export default function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium ${variants[variant]} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      {children}
    </span>
  );
}
