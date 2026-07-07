import PoliceIcon from '../icons/PoliceIcon';

interface TaskbarWindowPreviewProps {
  title: string;
  subtitle: string;
  visible: boolean;
  anchorRect: DOMRect | null;
}

export default function TaskbarWindowPreview({
  title,
  subtitle,
  visible,
  anchorRect,
}: TaskbarWindowPreviewProps) {
  if (!visible || !anchorRect) return null;

  const left = anchorRect.left + anchorRect.width / 2;

  return (
    <div
      className="flux-taskbar-preview"
      style={{ left, bottom: window.innerHeight - anchorRect.top + 8 }}
      role="tooltip"
    >
      <div className="flux-taskbar-preview__thumb">
        <div className="flux-taskbar-preview__thumb-bar">
          <PoliceIcon size={12} />
          <span>{title}</span>
        </div>
        <div className="flux-taskbar-preview__thumb-body" />
      </div>
      <p className="flux-taskbar-preview__title">{title}</p>
      <p className="flux-taskbar-preview__subtitle">{subtitle}</p>
    </div>
  );
}
