import type { AccentPreset, DesktopShortcut, ShellSettings } from '../types/shell';

export const DEFAULT_SHELL_SETTINGS: ShellSettings = {
  taskbarPosition: 'bottom',
  taskbarAlign: 'center',
  transparency: 72,
  wallpaperIndex: 0,
  accent: 'blue',
  fontScale: 'md',
  autoWallpaper: false,
  doNotDisturb: false,
};

export const WALLPAPERS: { id: string; label: string; css: string }[] = [
  {
    id: 'police-dark',
    label: 'POLIS Nacht',
    css: 'radial-gradient(ellipse at 20% 20%, #1a1a2e 0%, #0f0f14 50%, #121218 100%)',
  },
  {
    id: 'police-blue',
    label: 'Blau',
    css: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #312e81 100%)',
  },
  {
    id: 'police-city',
    label: 'Stadt',
    css: 'linear-gradient(160deg, #111827 0%, #374151 40%, #1f2937 100%)',
  },
  {
    id: 'police-light',
    label: 'Hell',
    css: 'linear-gradient(135deg, #dce4f5 0%, #c8d4ea 50%, #b8c8e0 100%)',
  },
  {
    id: 'police-aurora',
    label: 'Aurora',
    css: 'linear-gradient(125deg, #0c1222 0%, #1a3a5c 35%, #2d1b4e 70%, #0c1222 100%)',
  },
];

export const ACCENT_PRESETS: Record<AccentPreset, { accent: string; hover: string; light: string; subtle: string }> = {
  blue: { accent: '#4f7cff', hover: '#3d6bef', light: '#7ea4ff', subtle: 'rgba(79, 124, 255, 0.14)' },
  purple: { accent: '#8b5cf6', hover: '#7c3aed', light: '#a78bfa', subtle: 'rgba(139, 92, 246, 0.14)' },
  teal: { accent: '#14b8a6', hover: '#0d9488', light: '#2dd4bf', subtle: 'rgba(20, 184, 166, 0.14)' },
  amber: { accent: '#f59e0b', hover: '#d97706', light: '#fbbf24', subtle: 'rgba(245, 158, 11, 0.14)' },
  rose: { accent: '#f43f5e', hover: '#e11d48', light: '#fb7185', subtle: 'rgba(244, 63, 94, 0.14)' },
};

export const DEFAULT_SHORTCUTS: DesktopShortcut[] = [
  { id: 'polis', label: 'POLIS', icon: 'shield', route: '/', pinned: true },
  { id: 'personen', label: 'Personen', icon: 'users', route: '/personen', pinned: true },
  { id: 'akten', label: 'Akten', icon: 'folder', route: '/akten', pinned: true },
  { id: 'fahndung', label: 'Fahndung', icon: 'wanted', route: '/fahndung', pinned: true },
  { id: 'settings', label: 'Einstellungen', icon: 'settings', route: '/einstellungen', pinned: false },
];

export const DEFAULT_WINDOW_BOUNDS = { x: 0, y: 0, width: 0, height: 0 };
