import PoliceIcon from '../icons/PoliceIcon';

interface IconPreviewPanelProps {
  activePreviewUrl: string;
  previewError: boolean;
  showingCustom: boolean;
  onPreviewError: () => void;
}

export default function IconPreviewPanel({
  activePreviewUrl,
  previewError,
  showingCustom,
  onPreviewError,
}: IconPreviewPanelProps) {
  return (
    <div className="settings-icon-preview xl:w-[420px]">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">Vorschau</p>

      {activePreviewUrl && !previewError ? (
        <div className="settings-icon-preview-hero settings-icon-preview-slot--custom">
          <img
            key={activePreviewUrl}
            src={activePreviewUrl}
            alt="Icon-Vorschau"
            className="settings-icon-preview-hero-image"
            referrerPolicy="no-referrer"
            onError={onPreviewError}
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
        <IconPreviewSlot
          label="Login"
          slotClass="settings-icon-preview-login"
          imageClass="settings-icon-preview-slot-image settings-icon-preview-slot-image--lg"
          activePreviewUrl={activePreviewUrl}
          previewError={previewError}
          showingCustom={showingCustom}
          fallbackSize={52}
        />
        <IconPreviewSlot
          label="Titelleiste"
          slotClass="settings-icon-preview-titlebar"
          imageClass="settings-icon-preview-slot-image"
          activePreviewUrl={activePreviewUrl}
          previewError={previewError}
          showingCustom={showingCustom}
          fallbackSize={22}
        />
        <IconPreviewSlot
          label="Benachrichtigung"
          slotClass="settings-icon-preview-toast"
          imageClass="settings-icon-preview-slot-image settings-icon-preview-slot-image--sm"
          activePreviewUrl={activePreviewUrl}
          previewError={previewError}
          showingCustom={showingCustom}
          fallbackSize={20}
        />
      </div>
    </div>
  );
}

interface IconPreviewSlotProps {
  label: string;
  slotClass: string;
  imageClass: string;
  activePreviewUrl: string;
  previewError: boolean;
  showingCustom: boolean;
  fallbackSize: number;
}

function IconPreviewSlot({
  label,
  slotClass,
  imageClass,
  activePreviewUrl,
  previewError,
  showingCustom,
  fallbackSize,
}: IconPreviewSlotProps) {
  return (
    <div className="settings-icon-preview-item">
      <div className={`${slotClass} ${showingCustom ? 'settings-icon-preview-slot--custom' : ''}`}>
        {activePreviewUrl && !previewError ? (
          <img src={activePreviewUrl} alt="" className={imageClass} referrerPolicy="no-referrer" />
        ) : (
          <PoliceIcon size={fallbackSize} prominent={fallbackSize >= 52} />
        )}
      </div>
      <span className="text-[11px] text-text-muted">{label}</span>
    </div>
  );
}
