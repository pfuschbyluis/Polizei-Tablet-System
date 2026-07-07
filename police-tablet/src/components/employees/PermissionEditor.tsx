import type { Permission } from '../../types';
import { PERMISSION_GROUPS, PERMISSION_LABELS } from '../../types';

interface PermissionEditorProps {
  permissions: Permission;
  onChange: (permissions: Permission) => void;
  disabled?: boolean;
}

export default function PermissionEditor({ permissions, onChange, disabled }: PermissionEditorProps) {
  const toggle = (key: keyof Permission) => {
    if (disabled) return;
    onChange({ ...permissions, [key]: !permissions[key] });
  };

  return (
    <div className="space-y-4">
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.title} className="rounded-xl border border-border bg-surface-tertiary/30 p-3">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-text-muted">{group.title}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.keys.map((key) => (
              <label
                key={key}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  permissions[key]
                    ? 'border-accent/40 bg-accent-subtle text-text-primary'
                    : 'border-border bg-surface-secondary/60 text-text-secondary hover:border-border-strong'
                } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={permissions[key]}
                  onChange={() => toggle(key)}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-border accent-accent"
                />
                <span className="leading-snug">{PERMISSION_LABELS[key]}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
