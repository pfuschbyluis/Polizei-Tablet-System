import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-police-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-police-600/50 bg-police-800/80 px-3 py-2 text-sm text-police-100 placeholder:text-police-500 focus:border-police-accent focus:outline-none focus:ring-1 focus:ring-police-accent/50 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
