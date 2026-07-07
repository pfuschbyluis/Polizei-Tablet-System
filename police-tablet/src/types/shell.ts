import type { IconName } from '../components/icons/Icon';

export type TaskbarPosition = 'bottom' | 'top' | 'left' | 'right';
export type TaskbarAlign = 'center' | 'start';
export type AccentPreset = 'blue' | 'purple' | 'teal' | 'amber' | 'rose';
export type FontScale = 'sm' | 'md' | 'lg';
export type WindowChromeState = 'normal' | 'maximized' | 'minimized';

export interface ShellSettings {
  taskbarPosition: TaskbarPosition;
  taskbarAlign: TaskbarAlign;
  transparency: number;
  wallpaperIndex: number;
  accent: AccentPreset;
  fontScale: FontScale;
  autoWallpaper: boolean;
  doNotDisturb: boolean;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesktopShortcut {
  id: string;
  label: string;
  icon: IconName;
  route: string;
  pinned: boolean;
}

export interface NotificationRecord {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
  timestamp: number;
}

export interface SystemStatus {
  wifi: boolean;
  bluetooth: boolean;
  volume: number;
  brightness: number;
  battery: number;
  location: boolean;
}
