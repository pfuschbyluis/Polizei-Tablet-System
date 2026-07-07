import Icon from '../icons/Icon';
import { Button } from '../ui';
import type { Evidence } from '../../types';
import { isImageEvidence, isVideoEvidence } from '../../utils/evidence';

interface EvidenceItemProps {
  evidence: Evidence;
}

export default function EvidenceItem({ evidence }: EvidenceItemProps) {
  const url = evidence.fileUrl?.trim();
  const hasMedia = Boolean(url);

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-surface-tertiary/40 p-4 sm:flex-row sm:items-start">
      <div className="shrink-0">
        {url && isImageEvidence(url) ? (
          <img
            src={url}
            alt={evidence.name}
            className="h-24 w-32 rounded-md border border-border object-cover bg-black/20"
          />
        ) : (
          <div className="flex h-24 w-32 items-center justify-center rounded-md border border-border bg-surface/60">
            <Icon name={url && isVideoEvidence(url) ? 'file' : 'file'} size={28} className="text-accent-light" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">{evidence.name}</p>
        {evidence.description && (
          <p className="mt-1 text-xs text-text-secondary">{evidence.description}</p>
        )}
        <p className="mt-2 text-[10px] text-text-muted">
          {evidence.type} · {evidence.uploadedBy} · {evidence.uploadedAt}
          {evidence.source === 'upload' && ' · Hochgeladen'}
          {evidence.source === 'link' && ' · Link'}
        </p>
        {hasMedia && (
          <div className="mt-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            >
              <Icon name="eye" size={14} />
              {isImageEvidence(url) || isVideoEvidence(url) ? 'Ansehen' : 'Datei öffnen'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
