import Icon from '../icons/Icon';
import { Button, Input } from '../ui';
import IconPreviewPanel from './IconPreviewPanel';

interface BrandingIconSettingsProps {
  canEdit: boolean;
  urlInput: string;
  onUrlChange: (value: string) => void;
  onPreviewErrorReset: () => void;
  onPreview: () => void;
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
  activePreviewUrl: string;
  previewError: boolean;
  showingCustom: boolean;
  onPreviewError: () => void;
}

export default function BrandingIconSettings({
  canEdit,
  urlInput,
  onUrlChange,
  onPreviewErrorReset,
  onPreview,
  onSave,
  onReset,
  isSaving,
  activePreviewUrl,
  previewError,
  showingCustom,
  onPreviewError,
}: BrandingIconSettingsProps) {
  return (
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
              onUrlChange(e.target.value);
              onPreviewErrorReset();
            }}
            placeholder="https://example.com/polizei-logo.png"
            disabled={!canEdit || isSaving}
          />

          {canEdit && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={onPreview} disabled={isSaving}>
                <Icon name="eye" size={16} />
                Vorschau
              </Button>
              <Button type="button" onClick={onSave} disabled={isSaving}>
                {isSaving ? 'Speichern…' : 'Speichern'}
              </Button>
              <Button type="button" variant="ghost" onClick={onReset} disabled={isSaving}>
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

        <IconPreviewPanel
          activePreviewUrl={activePreviewUrl}
          previewError={previewError}
          showingCustom={showingCustom}
          onPreviewError={onPreviewError}
        />
      </div>
    </div>
  );
}
