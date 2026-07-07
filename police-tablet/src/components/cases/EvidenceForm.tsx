import { useRef, useState } from 'react';
import Icon from '../icons/Icon';
import { Button, Input, Select, Tabs } from '../ui';
import type { Evidence } from '../../types';
import { EVIDENCE_TYPE_OPTIONS } from '../../types';
import {
  formatFileSize,
  inferEvidenceType,
  isImageEvidence,
  isValidEvidenceLink,
  MAX_EVIDENCE_FILE_BYTES,
  readFileAsDataUrl,
} from '../../utils/evidence';

type SourceMode = 'link' | 'upload';

export interface EvidenceFormValues {
  name: string;
  type: string;
  description: string;
  fileUrl: string;
  source: SourceMode;
}

const emptyForm = (): EvidenceFormValues => ({
  name: '',
  type: 'Dokument',
  description: '',
  fileUrl: '',
  source: 'link',
});

interface EvidenceFormProps {
  onSubmit: (values: Omit<Evidence, 'id' | 'uploadedBy' | 'uploadedAt'>) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export default function EvidenceForm({ onSubmit, onCancel, isSaving = false }: EvidenceFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceMode, setSourceMode] = useState<SourceMode>('link');
  const [form, setForm] = useState(emptyForm);
  const [linkInput, setLinkInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  const handleSourceChange = (mode: string) => {
    setSourceMode(mode as SourceMode);
    setError('');
    setPreviewUrl('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const applyLinkPreview = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) {
      setPreviewUrl('');
      setForm((prev) => ({ ...prev, fileUrl: '', source: 'link' }));
      return;
    }
    if (!isValidEvidenceLink(trimmed)) {
      setError('Bitte eine gültige http(s)-URL eingeben.');
      return;
    }
    setError('');
    setPreviewUrl(trimmed);
    setForm((prev) => ({
      ...prev,
      fileUrl: trimmed,
      source: 'link',
      name: prev.name || trimmed.split('/').pop()?.split('?')[0] || 'Beweis-Link',
      type: inferEvidenceType('', trimmed),
    }));
  };

  const handleFileSelect = async (file: File | null) => {
    setSelectedFile(file);
    setError('');
    if (!file) {
      setPreviewUrl('');
      setForm((prev) => ({ ...prev, fileUrl: '', source: 'upload' }));
      return;
    }

    if (file.size > MAX_EVIDENCE_FILE_BYTES) {
      setError(`Datei zu groß (max. ${formatFileSize(MAX_EVIDENCE_FILE_BYTES)}).`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPreviewUrl(dataUrl);
      setForm((prev) => ({
        ...prev,
        fileUrl: dataUrl,
        source: 'upload',
        name: prev.name || file.name,
        type: inferEvidenceType(file.type, file.name),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Datei konnte nicht gelesen werden.');
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setError('Bitte einen Dateinamen angeben.');
      return;
    }
    if (!form.fileUrl.trim()) {
      setError(sourceMode === 'link' ? 'Bitte einen Link hinterlegen.' : 'Bitte eine Datei auswählen.');
      return;
    }
    if (form.source === 'link' && !isValidEvidenceLink(form.fileUrl)) {
      setError('Bitte eine gültige http(s)-URL eingeben.');
      return;
    }

    onSubmit({
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      fileUrl: form.fileUrl.trim(),
      source: form.source,
    });
  };

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { id: 'link', label: 'Link hinterlegen' },
          { id: 'upload', label: 'Datei hochladen' },
        ]}
        activeTab={sourceMode}
        onChange={handleSourceChange}
      />

      {sourceMode === 'link' ? (
        <div className="space-y-3">
          <Input
            label="Datei-Link (URL)"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="https://example.com/beweis.jpg"
          />
          <Button type="button" variant="secondary" className="w-full" onClick={applyLinkPreview}>
            <Icon name="eye" size={16} />
            Link prüfen
          </Button>
          <p className="text-xs text-text-muted">
            Bild-, Video- oder Dokument-Links von öffentlich erreichbaren URLs.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-tertiary/30 px-4 py-8 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:bg-surface-hover/40"
          >
            <Icon name="upload" size={24} className="text-accent-light" />
            <span>{selectedFile ? selectedFile.name : 'Datei auswählen'}</span>
            {selectedFile && (
              <span className="text-xs text-text-muted">{formatFileSize(selectedFile.size)}</span>
            )}
          </button>
          <p className="text-xs text-text-muted">
            Bilder, Videos oder PDFs · max. {formatFileSize(MAX_EVIDENCE_FILE_BYTES)}
          </p>
        </div>
      )}

      {(previewUrl || form.fileUrl) && (
        <div className="rounded-lg border border-border bg-surface-tertiary/40 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">Vorschau</p>
          {isImageEvidence(previewUrl || form.fileUrl) ? (
            <img
              src={previewUrl || form.fileUrl}
              alt=""
              className="max-h-40 w-full rounded-md object-contain bg-black/20"
              onError={() => setError('Vorschau konnte nicht geladen werden.')}
            />
          ) : (
            <div className="flex items-center gap-3 rounded-md bg-surface/60 px-3 py-4">
              <Icon name="file" size={22} className="text-accent-light shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {form.name || selectedFile?.name || 'Anhang'}
                </p>
                <p className="truncate text-xs text-text-muted">{previewUrl || form.fileUrl}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <Input
        label="Dateiname"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="z.B. Tatort-Foto_01.jpg"
      />
      <Select
        label="Typ"
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        options={[...EVIDENCE_TYPE_OPTIONS]}
      />
      <Input
        label="Beschreibung"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Kurze Beschreibung des Beweismittels..."
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
            Abbrechen
          </Button>
        )}
        <Button type="button" className="flex-1" disabled={isSaving} onClick={handleSubmit}>
          {isSaving ? 'Speichern…' : 'Beweis speichern'}
        </Button>
      </div>
    </div>
  );
}

export { emptyForm as emptyEvidenceForm };
