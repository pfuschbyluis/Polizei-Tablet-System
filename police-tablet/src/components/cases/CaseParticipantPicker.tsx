import { useState } from 'react';
import Icon from '../icons/Icon';
import PersonSelect from './PersonSelect';
import { Badge, Button, Select } from '../ui';
import type { CaseParticipant, Person } from '../../types';
import { PARTICIPANT_ROLE_OPTIONS } from '../../types';

interface CaseParticipantPickerProps {
  persons: Person[];
  participants: CaseParticipant[];
  onChange: (participants: CaseParticipant[]) => void;
  disabled?: boolean;
}

export default function CaseParticipantPicker({
  persons,
  participants,
  onChange,
  disabled = false,
}: CaseParticipantPickerProps) {
  const [draft, setDraft] = useState<CaseParticipant>({ personId: '', role: 'verdächtig' });

  const getPersonName = (personId: string) => {
    const person = persons.find((p) => p.id === personId);
    return person ? `${person.firstName} ${person.lastName}` : personId;
  };

  const handleAdd = () => {
    if (!draft.personId) return;
    if (participants.some((p) => p.personId === draft.personId)) return;
    onChange([...participants, draft]);
    setDraft({ personId: '', role: 'verdächtig' });
  };

  const handleRemove = (personId: string) => {
    onChange(participants.filter((p) => p.personId !== personId));
  };

  return (
    <div className="space-y-4">
      <PersonSelect
        label="Person aus dem System"
        persons={persons}
        value={draft.personId}
        onChange={(personId) => setDraft((prev) => ({ ...prev, personId }))}
        excludeIds={participants.map((p) => p.personId)}
        disabled={disabled}
      />

      <Select
        label="Rolle"
        value={draft.role}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, role: e.target.value as CaseParticipant['role'] }))
        }
        options={PARTICIPANT_ROLE_OPTIONS}
        disabled={disabled}
      />

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={disabled || !draft.personId}
        onClick={handleAdd}
      >
        <Icon name="user-plus" size={16} />
        Person hinzufügen
      </Button>

      {participants.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Hinzugefügt ({participants.length})
          </p>
          {participants.map((p) => (
            <div
              key={p.personId}
              className="flex items-center justify-between gap-3 rounded-lg bg-surface-tertiary/40 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{getPersonName(p.personId)}</p>
                <Badge variant="blue">{p.role}</Badge>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(p.personId)}
                  className="flux-action-btn flux-action-btn--delete shrink-0 !px-2 !py-1.5"
                  title="Entfernen"
                >
                  <Icon name="trash" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
