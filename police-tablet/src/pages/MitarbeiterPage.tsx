import { useMemo, useState } from 'react';
import Icon from '../components/icons/Icon';
import PermissionEditor from '../components/employees/PermissionEditor';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotifyContext';
import {
  type Permission,
  type RoleTemplate,
  type EmployeeInput,
  emptyPermissions,
  countActivePermissions,
  getTemplateById,
} from '../types';
import {
  Card,
  Button,
  Input,
  Select,
  Modal,
  Badge,
  EmptyState,
  SearchBar,
  ConfirmDialog,
  Tabs,
} from '../components/ui';

type FormTab = 'stammdaten' | 'berechtigungen';
type PageTab = 'mitarbeiter' | 'rollen';

const emptyForm = (): EmployeeInput & { permissions: Permission } => ({
  badgeNumber: '',
  password: '',
  name: '',
  rank: 'beamter',
  active: true,
  roleTemplateId: 'tpl-praktikant',
  permissions: emptyPermissions(),
});

export default function MitarbeiterPage() {
  const {
    employees,
    roleTemplates,
    permissions,
    currentOfficer,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    createRoleTemplate,
    deleteRoleTemplate,
  } = useAuth();
  const { notify } = useNotify();

  const [pageTab, setPageTab] = useState<PageTab>('mitarbeiter');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTab, setFormTab] = useState<FormTab>('stammdaten');
  const [form, setForm] = useState(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: emptyPermissions() });

  const selectedTemplate = useMemo(
    () => getTemplateById(roleTemplates, form.roleTemplateId),
    [roleTemplates, form.roleTemplateId]
  );

  if (!permissions.viewEmployees) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Icon name="shield" size={40} className="text-text-muted" />
        <p className="mt-4 text-text-secondary">Kein Zugriff auf Mitarbeiterverwaltung</p>
      </div>
    );
  }

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const tpl = getTemplateById(roleTemplates, e.roleTemplateId);
    return (
      e.name.toLowerCase().includes(q) ||
      e.badgeNumber.toLowerCase().includes(q) ||
      (tpl?.name.toLowerCase().includes(q) ?? false)
    );
  });

  const applyTemplate = (templateId: string | null) => {
    const tpl = getTemplateById(roleTemplates, templateId);
    setForm((prev) => ({
      ...prev,
      roleTemplateId: templateId,
      permissions: tpl ? { ...tpl.permissions } : emptyPermissions(),
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setFormTab('stammdaten');
    const initial = emptyForm();
    const tpl = getTemplateById(roleTemplates, initial.roleTemplateId);
    if (tpl) initial.permissions = { ...tpl.permissions };
    setForm(initial);
    setShowModal(true);
  };

  const openEdit = (emp: (typeof employees)[0]) => {
    setEditingId(emp.id);
    setFormTab('stammdaten');
    setForm({
      badgeNumber: emp.badgeNumber,
      password: '',
      name: emp.name,
      rank: emp.rank,
      active: emp.active,
      roleTemplateId: emp.roleTemplateId,
      permissions: { ...emp.permissions },
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setShowModal(false);
  };

  const handleSubmit = async () => {
    if (!form.badgeNumber.trim() || !form.name.trim()) {
      notify('Fehlende Daten eingeben', 'warning');
      return;
    }
    if (!editingId && !form.password) {
      notify('Passwort ist erforderlich', 'warning');
      return;
    }

    setIsSaving(true);

    try {
      const payload: EmployeeInput = {
        badgeNumber: form.badgeNumber,
        password: form.password,
        name: form.name,
        rank: form.rank,
        active: form.active,
        roleTemplateId: form.roleTemplateId,
        permissions: form.permissions,
      };

      const result = editingId
        ? await updateEmployee(editingId, (() => {
            const p: Partial<EmployeeInput> = { ...payload };
            if (!p.password) delete p.password;
            return p;
          })())
        : await createEmployee(payload);

      if (result.success) {
        notify(editingId ? 'Mitarbeiter gespeichert' : 'Mitarbeiter angelegt', 'success');
        setShowModal(false);
        setForm(emptyForm());
      } else {
        notify(result.error ?? 'Speichern fehlgeschlagen.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteConfirm = (id: string) => {
    if (id === currentOfficer?.id) {
      notify('Eigener Account kann nicht gelöscht werden.', 'warning');
      return;
    }
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const result = await deleteEmployee(deleteTargetId);
      if (result.success) {
        notify('Mitarbeiter gelöscht', 'success');
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
      } else {
        notify(result.error ?? 'Löschen fehlgeschlagen.', 'error');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateRole = async () => {
    if (!roleForm.name.trim()) {
      notify('Rollenname erforderlich', 'warning');
      return;
    }
    const result = await createRoleTemplate(roleForm);
    if (result.success) {
      notify('Rollenvorlage erstellt', 'success');
      setShowRoleModal(false);
      setRoleForm({ name: '', description: '', permissions: emptyPermissions() });
    } else {
      notify(result.error ?? 'Erstellen fehlgeschlagen', 'error');
    }
  };

  const handleDeleteRole = async (tpl: RoleTemplate) => {
    if (tpl.isSystem) {
      notify('Systemvorlagen können nicht gelöscht werden', 'warning');
      return;
    }
    const result = await deleteRoleTemplate(tpl.id);
    if (result.success) notify('Vorlage gelöscht', 'success');
    else notify(result.error ?? 'Löschen fehlgeschlagen', 'error');
  };

  const pageTabs = [
    { id: 'mitarbeiter', label: `Mitarbeiter (${employees.length})` },
    ...(permissions.manageRoles ? [{ id: 'rollen', label: `Rollenvorlagen (${roleTemplates.length})` }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Mitarbeiterverwaltung</h1>
          <p className="page-subtitle">Benutzer, Rollen und Berechtigungen zentral verwalten</p>
        </div>
        {permissions.manageEmployees && pageTab === 'mitarbeiter' && (
          <Button onClick={openCreate} size="sm" className="flux-btn-primary">
            <Icon name="user-plus" size={16} /> Neuer Mitarbeiter
          </Button>
        )}
        {permissions.manageRoles && pageTab === 'rollen' && (
          <Button onClick={() => setShowRoleModal(true)} size="sm" className="flux-btn-primary">
            <Icon name="plus" size={16} /> Neue Vorlage
          </Button>
        )}
      </div>

      {permissions.manageRoles && (
        <Tabs tabs={pageTabs} activeTab={pageTab} onChange={(id) => setPageTab(id as PageTab)} />
      )}

      {pageTab === 'mitarbeiter' && (
        <>
          <SearchBar value={search} onChange={setSearch} placeholder="Name, Dienstnummer oder Rolle..." />

          {employees.length === 0 ? (
            <Card>
              <EmptyState
                icon="user-cog"
                title="Keine Mitarbeiter"
                description="Lege den ersten Mitarbeiter an, um Zugänge zu verwalten."
              />
            </Card>
          ) : filtered.length === 0 ? (
            <Card>
              <EmptyState icon="user-cog" title="Keine Treffer" description="Passen Sie die Suche an." />
            </Card>
          ) : (
            <Card padding={false} className="overflow-hidden !p-0">
              <div className="overflow-x-auto">
                <table className="flux-employee-table w-full min-w-[720px]">
                  <thead>
                    <tr>
                      <th>Mitarbeiter</th>
                      <th>Rolle / Vorlage</th>
                      <th>Rechte</th>
                      <th>Status</th>
                      {permissions.manageEmployees && <th className="text-right">Aktionen</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((emp) => {
                      const tpl = getTemplateById(roleTemplates, emp.roleTemplateId);
                      const permCount = countActivePermissions(emp.permissions);
                      return (
                        <tr key={emp.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="flux-employee-avatar">
                                <Icon name="user" size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-text-primary">{emp.name}</p>
                                <p className="font-mono text-xs text-accent-light">{emp.badgeNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge variant="blue">{tpl?.name ?? 'Individuell'}</Badge>
                          </td>
                          <td>
                            <span className="text-sm text-text-secondary">{permCount} aktiv</span>
                          </td>
                          <td>
                            <Badge variant={emp.active ? 'green' : 'red'}>{emp.active ? 'Aktiv' : 'Inaktiv'}</Badge>
                          </td>
                          {permissions.manageEmployees && (
                            <td>
                              <div className="flex justify-end gap-2">
                                <button type="button" className="flux-action-btn flux-action-btn--edit" onClick={() => openEdit(emp)}>
                                  <Icon name="pencil" size={14} />
                                  <span>Bearbeiten</span>
                                </button>
                                <button
                                  type="button"
                                  className="flux-action-btn flux-action-btn--delete"
                                  onClick={() => openDeleteConfirm(emp.id)}
                                  disabled={emp.id === currentOfficer?.id}
                                >
                                  <Icon name="trash" size={14} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {pageTab === 'rollen' && permissions.manageRoles && (
        <div className="grid gap-3 md:grid-cols-2">
          {roleTemplates.map((tpl) => (
            <Card key={tpl.id} padding className="!p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text-primary">{tpl.name}</h3>
                    {tpl.isSystem && <Badge variant="gray">System</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">{tpl.description}</p>
                  <p className="mt-2 text-xs text-text-muted">{countActivePermissions(tpl.permissions)} Berechtigungen</p>
                </div>
                {!tpl.isSystem && (
                  <button type="button" className="flux-action-btn flux-action-btn--delete" onClick={() => handleDeleteRole(tpl)}>
                    <Icon name="trash" size={14} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingId ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
        size="lg"
      >
        <Tabs
          tabs={[
            { id: 'stammdaten', label: 'Stammdaten' },
            { id: 'berechtigungen', label: 'Berechtigungen' },
          ]}
          activeTab={formTab}
          onChange={(id) => setFormTab(id as FormTab)}
        />

        <div className="mt-4 space-y-4">
          {formTab === 'stammdaten' && (
            <>
              <Input label="Vollständiger Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Max Mustermann" />
              <Input label="Dienstnummer" value={form.badgeNumber} onChange={(e) => setForm({ ...form, badgeNumber: e.target.value })} placeholder="PD-0000" disabled={!!editingId} />
              <Input
                label={editingId ? 'Neues Passwort (leer = unverändert)' : 'Passwort'}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
              <Select
                label="Rollenvorlage"
                value={form.roleTemplateId ?? ''}
                onChange={(e) => applyTemplate(e.target.value || null)}
                options={roleTemplates.map((t) => ({ value: t.id, label: t.name }))}
              />
              {selectedTemplate && (
                <p className="rounded-lg border border-border bg-surface-tertiary/40 px-3 py-2 text-xs text-text-secondary">
                  {selectedTemplate.description} — Vorlage übernehmen und bei Bedarf unter „Berechtigungen“ anpassen.
                </p>
              )}
              {editingId && (
                <Select
                  label="Status"
                  value={form.active ? 'active' : 'inactive'}
                  onChange={(e) => setForm({ ...form, active: e.target.value === 'active' })}
                  options={[
                    { value: 'active', label: 'Aktiv' },
                    { value: 'inactive', label: 'Inaktiv' },
                  ]}
                />
              )}
            </>
          )}

          {formTab === 'berechtigungen' && (
            <>
              <p className="text-sm text-text-secondary">
                Individuelle Rechte für diesen Mitarbeiter. Änderungen betreffen nur diesen Account, nicht die Vorlage „{selectedTemplate?.name ?? '—'}“.
              </p>
              <PermissionEditor
                permissions={form.permissions}
                onChange={(permissions) => setForm({ ...form, permissions })}
              />
              <Button variant="secondary" size="sm" onClick={() => applyTemplate(form.roleTemplateId ?? null)}>
                Vorlage erneut anwenden
              </Button>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={closeModal} disabled={isSaving}>
              Abbrechen
            </Button>
            <Button className="flex-1 flux-btn-primary" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Speichern...' : editingId ? 'Speichern' : 'Anlegen'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="Neue Rollenvorlage" size="lg">
        <div className="space-y-4">
          <Input label="Name" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="z.B. Einsatzleitung" />
          <Input label="Beschreibung" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="Kurzbeschreibung der Rolle" />
          <PermissionEditor permissions={roleForm.permissions} onChange={(permissions) => setRoleForm({ ...roleForm, permissions })} />
          <Button className="w-full flux-btn-primary" onClick={handleCreateRole}>
            Vorlage erstellen
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Mitarbeiter löschen"
        message="Möchten Sie diesen Mitarbeiter wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        confirmLabel={isDeleting ? 'Löschen...' : 'Löschen'}
        onConfirm={handleDelete}
        onCancel={() => {
          if (isDeleting) return;
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}
