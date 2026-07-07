import { useEffect, useState } from 'react';
import { useBranding } from '../context/BrandingContext';
import { useNotify } from '../context/NotifyContext';
import { isValidIconUrl } from '../utils/iconUrl';

export function useBrandingIconEditor() {
  const { customIconUrl, updateBranding } = useBranding();
  const { notify } = useNotify();
  const [urlInput, setUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activePreviewUrl = previewUrl ?? (urlInput.trim() || customIconUrl);
  const showingCustom = Boolean(activePreviewUrl) && !previewError;

  useEffect(() => {
    setUrlInput(customIconUrl);
    setPreviewUrl(null);
    setPreviewError(false);
  }, [customIconUrl]);

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

  return {
    urlInput,
    setUrlInput,
    previewError,
    setPreviewError,
    isSaving,
    activePreviewUrl,
    showingCustom,
    handlePreview,
    handleSave,
    handleReset,
  };
}
