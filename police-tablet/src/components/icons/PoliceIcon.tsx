import { useId, useState, useEffect, type HTMLAttributes } from 'react';
import { useBranding } from '../../context/BrandingContext';

interface PoliceIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  size?: number;
  /** Größere Darstellung für Login und Hero-Bereiche */
  prominent?: boolean;
  /** Temporäre URL für Vorschau (z. B. Einstellungsseite) */
  overrideUrl?: string;
}

function DefaultPoliceBadge({ size, prominent }: { size: number; prominent?: boolean }) {
  const gradientId = useId().replace(/:/g, '');
  const shineId = `${gradientId}-shine`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={prominent ? 'police-icon-default police-icon-default--prominent' : 'police-icon-default'}
    >
      <defs>
        <linearGradient id={gradientId} x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="45%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={shineId} x1="8" y1="4" x2="16" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.75L4.5 5.25v6.1c0 4.85 3.15 9.15 7.5 10.15 4.35-1 7.5-5.3 7.5-10.15V5.25L12 1.75z"
        fill={`url(#${gradientId})`}
        stroke="#bfdbfe"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M12 1.75L4.5 5.25v6.1c0 4.85 3.15 9.15 7.5 10.15 4.35-1 7.5-5.3 7.5-10.15V5.25L12 1.75z"
        fill={`url(#${shineId})`}
        stroke="none"
      />
      <path
        d="M12 6.5l1.55 3.14 3.47.5-2.51 2.45.59 3.46L12 14.77l-3.1 1.63.59-3.46-2.51-2.45 3.47-.5L12 6.5z"
        fill="#eff6ff"
        stroke="#dbeafe"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11.25" r="1.15" fill="#1e3a8a" opacity="0.35" />
    </svg>
  );
}

export default function PoliceIcon({
  size = 20,
  prominent = false,
  overrideUrl,
  className = '',
  style,
  ...props
}: PoliceIconProps) {
  const { customIconUrl } = useBranding();
  const [imageFailed, setImageFailed] = useState(false);

  const activeUrl = (overrideUrl !== undefined ? overrideUrl : customIconUrl).trim();
  const showCustom = Boolean(activeUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [activeUrl]);

  return (
    <span
      className={`police-icon ${showCustom ? 'police-icon--custom' : ''} ${prominent ? 'police-icon--prominent' : ''} ${className}`.trim()}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      {showCustom ? (
        <img
          src={activeUrl}
          alt=""
          className={`police-icon-image ${prominent ? 'police-icon-image--cover' : ''}`.trim()}
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <DefaultPoliceBadge size={size} prominent={prominent} />
      )}
    </span>
  );
}
