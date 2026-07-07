import type { SVGProps, ReactNode } from 'react';

export type IconName =
  | 'dashboard'
  | 'users'
  | 'folder'
  | 'crosshair'
  | 'car'
  | 'search'
  | 'wanted'
  | 'shield'
  | 'scroll'
  | 'user-cog'
  | 'logout'
  | 'chevron-left'
  | 'chevron-right'
  | 'close'
  | 'minimize'
  | 'maximize'
  | 'restore'
  | 'sun'
  | 'moon'
  | 'eye'
  | 'eye-off'
  | 'loader'
  | 'clock'
  | 'user'
  | 'plus'
  | 'arrow-left'
  | 'arrow-right'
  | 'alert'
  | 'inbox'
  | 'megaphone'
  | 'file'
  | 'upload'
  | 'message'
  | 'pencil'
  | 'trash'
  | 'filter'
  | 'map-pin'
  | 'phone'
  | 'bell'
  | 'user-plus'
  | 'check'
  | 'settings';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

const paths: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="2" fill="none" />
      <rect x="13" y="3" width="8" height="5" rx="2" fill="none" />
      <rect x="13" y="10" width="8" height="11" rx="2" fill="none" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="none" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" fill="none" />
      <path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" fill="none" />
      <path d="M15 19c0-2.5 1.5-4.5 4-4.5" />
    </>
  ),
  folder: (
    <path d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" fill="none" />
  ),
  crosshair: (
    <>
      <circle cx="12" cy="12" r="8" fill="none" />
      <circle cx="12" cy="12" r="2.5" fill="none" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </>
  ),
  car: (
    <>
      <path d="M5 15l1.5-5a2 2 0 0 1 1.9-1.4h8.2a2 2 0 0 1 1.9 1.4L19 15" fill="none" />
      <path d="M3 15h18v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3z" fill="none" />
      <circle cx="7.5" cy="18" r="1.5" fill="none" />
      <circle cx="16.5" cy="18" r="1.5" fill="none" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" fill="none" />
      <path d="M20 20l-3.5-3.5" fill="none" />
    </>
  ),
  wanted: (
    <>
      <circle cx="9" cy="8" r="3.5" fill="none" strokeWidth="2" />
      <path d="M3.5 18.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" fill="none" strokeWidth="2" />
      <circle cx="16.5" cy="16.5" r="3.5" fill="none" strokeWidth="2" />
      <path d="M19 19l2.5 2.5" fill="none" strokeWidth="2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3L5 6v6c0 4.5 3 8.5 7 9.5 4-.5 7-5 7-9.5V6l-7-3z" fill="none" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  scroll: (
    <>
      <path d="M8 4h8a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2z" fill="none" />
      <path d="M10 9h4M10 13h4" />
    </>
  ),
  'user-cog': (
    <>
      <circle cx="9" cy="8" r="3" fill="none" />
      <path d="M3 19c0-3 2.5-5 6-5" />
      <circle cx="18" cy="14" r="2.5" fill="none" />
      <path d="M18 12v4M16 14h4" />
    </>
  ),
  logout: (
    <>
      <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" fill="none" />
      <path d="M16 12H9M20 12l-3-3M20 12l-3 3" fill="none" />
    </>
  ),
  'chevron-left': <path d="M15 6l-6 6 6 6" fill="none" />,
  'chevron-right': <path d="M9 6l6 6-6 6" fill="none" />,
  close: <path d="M6 6l12 12M18 6L6 18" fill="none" />,
  minimize: <path d="M5 17h14" fill="none" />,
  maximize: <rect x="5" y="5" width="14" height="14" rx="2" fill="none" />,
  restore: (
    <>
      <rect x="8" y="8" width="11" height="11" rx="2" fill="none" />
      <path d="M5 16V7a2 2 0 0 1 2-2h9" fill="none" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" fill="none" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>
  ),
  moon: (
    <path d="M21 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 21 14.5z" fill="none" />
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" fill="none" />
      <circle cx="12" cy="12" r="3" fill="none" />
    </>
  ),
  'eye-off': (
    <>
      <path d="M2 12s3.5-7 10-7c2 0 3.7.7 5 1.8" fill="none" />
      <path d="M22 12s-3.5 7-10 7c-1.5 0-2.9-.3-4.2-.8" fill="none" />
      <path d="M3 3l18 18" fill="none" />
    </>
  ),
  loader: (
    <path
      d="M12 3a9 9 0 1 1-6.36 2.64"
      fill="none"
      strokeLinecap="round"
    />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" />
      <path d="M12 7v5l3 2" fill="none" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" fill="none" />
      <path d="M5 20c0-4 3.5-7 7-7s7 3 7 7" fill="none" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" fill="none" />,
  'arrow-left': <path d="M19 12H5M11 6l-6 6 6 6" fill="none" />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" fill="none" />,
  alert: (
    <>
      <path d="M12 3L2 20h20L12 3z" fill="none" />
      <path d="M12 10v4" fill="none" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 4h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" fill="none" />
      <path d="M4 12h4l2 3h4l2-3h4" fill="none" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 10v4l8 4V6L4 10z" fill="none" />
      <path d="M16 9a3 3 0 0 1 0 6" fill="none" />
      <path d="M19 11h1a1 1 0 0 1 0 2h-1" fill="none" />
    </>
  ),
  file: (
    <>
      <path d="M8 3h6l4 4v14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="none" />
      <path d="M14 3v4h4" fill="none" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V6M8 10l4-4 4 4" fill="none" />
      <path d="M4 18h16" fill="none" />
    </>
  ),
  message: (
    <path d="M4 5h16v11a1 1 0 0 1-1 1H8l-4 3V5a1 1 0 0 1 1-1z" fill="none" />
  ),
  pencil: (
    <>
      <path d="M4 18l1-1 10-10 3 3L8 20H4v-4z" fill="none" />
      <path d="M13 7l3 3" fill="none" />
    </>
  ),
  trash: (
    <>
      <path d="M5 7h14M9 7V5h6v2M8 7v12h8V7" fill="none" />
      <path d="M10 10v6M14 10v6" fill="none" />
    </>
  ),
  filter: (
    <path d="M4 6h16M7 12h10M10 18h4" fill="none" />
  ),
  'map-pin': (
    <>
      <path d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11z" fill="none" />
      <circle cx="12" cy="10" r="2.5" fill="none" />
    </>
  ),
  phone: (
    <path
      d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5L17.5 12 21 13.5v3A2.5 2.5 0 0 1 18.5 19C10.5 19 5 13.5 5 5.5A2.5 2.5 0 0 1 6.5 4z"
      fill="none"
    />
  ),
  bell: (
    <>
      <path d="M12 3a5 5 0 0 1 5 5v3l2 3H5l2-3V8a5 5 0 0 1 5-5z" fill="none" />
      <path d="M10 19a2 2 0 0 0 4 0" fill="none" />
    </>
  ),
  'user-plus': (
    <>
      <circle cx="9" cy="8" r="3.5" fill="none" />
      <path d="M3 19c0-3.3 2.7-6 6-6" fill="none" />
      <path d="M16 11v6M13 14h6" fill="none" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" />
      <path d="M8 12.5l2.5 2.5L16 9" fill="none" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" fill="none" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M19.8 19.8l-1.4-1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M19.8 4.2l-1.4 1.4" fill="none" />
    </>
  ),
};

export default function Icon({ name, size = 20, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

export function IconSpinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return <Icon name="loader" size={size} className={`animate-spin ${className}`} />;
}
