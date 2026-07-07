import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/icons/Icon';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotifyContext';
import { Card, SearchBar, EmptyState, Badge, Button, Modal, Input } from '../components/ui';

const emptyForm = () => ({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  address: '',
  city: '',
  phone: '',
});

export default function PersonenPage() {
  const { persons, createPerson } = useData();
  const { permissions } = useAuth();
  const { notify } = useNotify();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [isSaving, setIsSaving] = useState(false);

  const filtered = persons.filter((p) => {
    const q = search.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(q) || p.address.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.dateOfBirth || !form.address.trim() || !form.city.trim()) {
      notify('Bitte alle Pflichtfelder ausfüllen.', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      const id = await createPerson({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth,
        address: form.address.trim(),
        city: form.city.trim(),
        phone: form.phone.trim() || undefined,
      });
      setShowModal(false);
      setForm(emptyForm());
      notify('Person erfolgreich angelegt.', 'success');
      navigate(`/personen/${id}`);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Personenakte</h1>
          <p className="page-subtitle">{persons.length} Personen im Register</p>
        </div>
        {permissions.editPersons && (
          <Button onClick={() => { setForm(emptyForm()); setShowModal(true); }}>
            <Icon name="plus" size={16} /> Person anlegen
          </Button>
        )}
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Name, Adresse oder Stadt suchen..." />

      {persons.length === 0 ? (
        <Card>
          <EmptyState
            icon="user"
            title="Keine Personen registriert"
            description={permissions.editPersons ? 'Legen Sie die erste Person an.' : 'Keine Personen im Register.'}
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon="user" title="Keine Personen gefunden" description="Passen Sie Ihre Suche an." />
        </Card>
      ) : (
        <div className="grid gap-2">
          {filtered.map((person) => {
            const hasWarrant = person.arrestWarrants.some((w) => w.active);
            return (
              <Link
                key={person.id}
                to={`/personen/${person.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-card/60 p-4 hover:border-accent/30 transition-all"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-tertiary text-text-secondary">
                    <Icon name="user" size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-text-primary">
                        {person.firstName} {person.lastName}
                      </h3>
                      {hasWarrant && (
                        <span className="flex items-center gap-1 text-xs text-danger">
                          <Icon name="alert" size={12} /> Haftbefehl
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-text-secondary">
                      *{new Date(person.dateOfBirth).toLocaleDateString('de-DE')} · {person.address}, {person.city}
                    </p>
                    <div className="mt-1 flex gap-2">
                      {person.priorConvictions.length > 0 && (
                        <Badge variant="yellow">Vorbestraft</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Icon name="chevron-right" size={20} className="shrink-0 text-text-muted" />
              </Link>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Person anlegen" size="md">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Vorname *"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="Max"
            />
            <Input
              label="Nachname *"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="Mustermann"
            />
          </div>
          <Input
            label="Geburtsdatum *"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
          />
          <Input
            label="Adresse *"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Hauptstraße 1"
          />
          <Input
            label="Stadt *"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="Los Santos"
          />
          <Input
            label="Telefon"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="555-0100"
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? 'Speichern…' : 'Anlegen'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
