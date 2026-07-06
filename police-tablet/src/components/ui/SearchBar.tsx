import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Suchen...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-police-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-police-600/50 bg-police-800/60 py-2 pl-10 pr-4 text-sm text-police-100 placeholder:text-police-500 focus:border-police-accent focus:outline-none focus:ring-1 focus:ring-police-accent/50"
      />
    </div>
  );
}
