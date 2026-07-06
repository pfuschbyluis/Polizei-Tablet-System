import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  size?: 'sm' | 'md';
}

const variants = {
  default: 'bg-police-700/50 text-police-200 border-police-600/50',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  yellow: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
  gray: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
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
