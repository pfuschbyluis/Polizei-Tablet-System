import { useEffect, useState } from 'react';
import PoliceIcon from '../components/icons/PoliceIcon';
import Icon from '../components/icons/Icon';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useNotify } from '../context/NotifyContext';
import { Card, Button, Input } from '../components/ui';

export default function EinstellungenPage() {
  const { permissions } = useAuth();
  const { customIconUrl, updateBranding } = useBranding();
  const { notify } = useNotify();
  const [urlInput, setUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = permissions.adminFunctions;
  const displayUrl = previewUrl !== undefined ? previewUrl : customIconUrl;

  useEffect(() => {
    setUrlInput(customIconUrl);
    setPreviewUrl(undefined);
  }, [customIconUrl]);

  if (!permissions.viewSettings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PoliceIcon size={48} prominent />
        <p className="mt-4 text-text-secondary">Kein Zugriff auf Einstellungen</p>
      </div>
    );
  }

  const handlePreview = () => {
    const trimmed = urlInput.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      notify('Bitte eine gültige http(s)-URL eingeben.', 'warning');
      return;
    }
    setPreviewUrl(trimmed);
  };

  const handleSave = async () => {
    const trimmed = urlInput.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      notify('Bitte eine gültige http(s)-URL eingeben.', 'warning');
      return;
    }

    setIsSaving(true);
    const result = await updateBranding(trimmed);
    setIsSaving(false);

    if (result.success) {
      notify(trimmed ? 'Polizei-Icon gespeichert.' : 'Standard-Icon wiederhergestellt.', 'success');
      setPreviewUrl(undefined);
    } else {
      notify(result.error ?? 'Speichern fehlgeschlagen.', 'error');
    }
  };

  const handleReset = () => {
    setUrlInput('');
    setPreviewUrl('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Einstellungen</h1>
        <p className="page-subtitle">Erscheinungsbild und System-Branding anpassen</p>
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Polizei-Icon</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Hinterlegen Sie ein eigenes Icon per Bild-URL. Es ersetzt das Standard-Icon systemweit
              (Login, Titelleiste, Benachrichtigungen).
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex-1 space-y-4">
              <Input
                label="Bild-URL"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/polizei-logo.png"
                disabled={!canEdit}
              />

              {canEdit && (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={handlePreview}>
                    <Icon name="eye" size={16} />
                    Vorschau
                  </Button>
                  <Button type="button" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Speichern…' : 'Speichern'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleReset}>
                    Zurücksetzen
                  </Button>
                </div>
              )}

              {!canEdit && (
                <p className="text-xs text-text-muted">
                  Nur Benutzer mit Administrationsrechten können das Icon ändern.
                </p>
              )}
            </div>

            <div className="settings-icon-preview">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">Vorschau</p>
              <div className="settings-icon-preview-grid">
                <div className="settings-icon-preview-item">
                  <div className="settings-icon-preview-login">
                    <PoliceIcon size={36} prominent overrideUrl={displayUrl} />
                  </div>
                  <span className="text-[11px] text-text-muted">Login</span>
                </div>
                <div className="settings-icon-preview-item">
                  <div className="flux-app-icon">
                    <PoliceIcon size={16} overrideUrl={displayUrl} />
                  </div>
                  <span className="text-[11px] text-text-muted">Titelleiste</span>
                </div>
                <div className="settings-icon-preview-item">
                  <div className="flux-os-toast-app-icon settings-icon-preview-toast">
                    <PoliceIcon size={15} overrideUrl={displayUrl} />
                  </div>
                  <span className="text-[11px] text-text-muted">Benachrichtigung</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
