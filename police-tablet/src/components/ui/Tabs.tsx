interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-police-800/40 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-md px-4 py-2 text-xs font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-police-accent text-white shadow-sm'
              : 'text-police-400 hover:text-police-200 hover:bg-police-700/50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
