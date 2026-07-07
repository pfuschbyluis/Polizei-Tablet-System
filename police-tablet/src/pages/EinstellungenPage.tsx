import PoliceIcon from '../components/icons/PoliceIcon';
import { useAuth } from '../context/AuthContext';
import { useBrandingIconEditor } from '../hooks/useBrandingIconEditor';
import BrandingIconSettings from '../components/settings/BrandingIconSettings';
import ShellPersonalizationSettings from '../components/settings/ShellPersonalizationSettings';
import { Card } from '../components/ui';

export default function EinstellungenPage() {
  const { permissions } = useAuth();
  const canEdit = permissions.adminFunctions;
  const editor = useBrandingIconEditor();

  if (!permissions.viewSettings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PoliceIcon size={48} prominent />
        <p className="mt-4 text-text-secondary">Kein Zugriff auf Einstellungen</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Einstellungen</h1>
        <p className="page-subtitle">Erscheinungsbild und System-Branding anpassen</p>
      </div>

      <Card>
        <BrandingIconSettings
          canEdit={canEdit}
          urlInput={editor.urlInput}
          onUrlChange={editor.setUrlInput}
          onPreviewErrorReset={() => editor.setPreviewError(false)}
          onPreview={editor.handlePreview}
          onSave={editor.handleSave}
          onReset={editor.handleReset}
          isSaving={editor.isSaving}
          activePreviewUrl={editor.activePreviewUrl}
          previewError={editor.previewError}
          showingCustom={editor.showingCustom}
          onPreviewError={() => editor.setPreviewError(true)}
        />
      </Card>

      <Card title="Personalisierung">
        <ShellPersonalizationSettings />
      </Card>
    </div>
  );
}
