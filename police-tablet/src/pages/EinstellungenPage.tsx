import { useEffect, useState } from 'react';
import PoliceIcon from '../components/icons/PoliceIcon';
import Icon from '../components/icons/Icon';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useNotify } from '../context/NotifyContext';
import { Card, Button, Input } from '../components/ui';

function isValidIconUrl(url: string): boolean {
  return url === '' || /^https?:\/\/.+/i.test(url);
}

export default function EinstellungenPage() {
  const { permissions } = useAuth();
  const { customIconUrl, updateBranding } = useBranding();
  const { notify } = useNotify();
  const [urlInput, setUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = permissions.adminFunctions;
  const activePreviewUrl = previewUrl ?? (urlInput.trim() || customIconUrl);

  useEffect(() => {
    setUrlInput(customIconUrl);
    setPreviewUrl(null);
    setPreviewError(false);
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
    if (trimmed && !isValidIconUrl(trimmed)) {
      notify('Bitte eine gültige http(s)-URL eingeben.', 'warning');
      return;
    }
    setPreviewError(false);
    setPreviewUrl(trimmed);
  };

  const handleSave = async () => {
    const trimmed = urlInput.trim();
    if (trimmed && !isValidIconUrl(trimmed)) {
      notify('Bitte eine gültige http(s)-URL eingeben.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateBranding(trimmed);
      if (result.success) {
        notify(trimmed ? 'Polizei-Icon gespeichert.' : 'Standard-Icon wiederhergestellt.', 'success');
        setPreviewUrl(null);
        setPreviewError(false);
      } else {
        notify(result.error ?? 'Speichern fehlgeschlagen.', 'error');
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Speichern fehlgeschlagen.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setUrlInput('');
    setPreviewUrl('');
    setPreviewError(false);
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

          <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
            <div className="flex-1 space-y-4">
              <Input
                label="Bild-URL"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setPreviewError(false);
                }}
                placeholder="https://example.com/polizei-logo.png"
                disabled={!canEdit || isSaving}
              />

              {canEdit && (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={handlePreview} disabled={isSaving}>
                    <Icon name="eye" size={16} />
                    Vorschau
                  </Button>
                  <Button type="button" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Speichern…' : 'Speichern'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleReset} disabled={isSaving}>
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

            <div className="settings-icon-preview xl:w-[420px]">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">Vorschau</p>

              {activePreviewUrl && !previewError ? (
                <div className="settings-icon-preview-hero">
                  <img
                    key={activePreviewUrl}
                    src={activePreviewUrl}
                    alt="Icon-Vorschau"
                    className="settings-icon-preview-hero-image"
                    referrerPolicy="no-referrer"
                    onError={() => setPreviewError(true)}
                  />
                </div>
              ) : (
                <div className="settings-icon-preview-hero settings-icon-preview-hero--empty">
                  {previewError ? (
                    <p className="text-sm text-amber-400">Bild konnte nicht geladen werden.</p>
                  ) : (
                    <PoliceIcon size={72} prominent />
                  )}
                </div>
              )}

              <div className="settings-icon-preview-grid mt-4">
                <div className="settings-icon-preview-item">
                  <div className="settings-icon-preview-login">
                    {activePreviewUrl && !previewError ? (
                      <img
                        src={activePreviewUrl}
                        alt=""
                        className="settings-icon-preview-slot-image settings-icon-preview-slot-image--lg"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <PoliceIcon size={52} prominent />
                    )}
                  </div>
                  <span className="text-[11px] text-text-muted">Login</span>
                </div>
                <div className="settings-icon-preview-item">
                  <div className="settings-icon-preview-titlebar">
                    {activePreviewUrl && !previewError ? (
                      <img
                        src={activePreviewUrl}
                        alt=""
                        className="settings-icon-preview-slot-image"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <PoliceIcon size={22} />
                    )}
                  </div>
                  <span className="text-[11px] text-text-muted">Titelleiste</span>
                </div>
                <div className="settings-icon-preview-item">
                  <div className="settings-icon-preview-toast">
                    {activePreviewUrl && !previewError ? (
                      <img
                        src={activePreviewUrl}
                        alt=""
                        className="settings-icon-preview-slot-image settings-icon-preview-slot-image--sm"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <PoliceIcon size={20} />
                    )}
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
