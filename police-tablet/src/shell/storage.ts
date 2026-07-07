import { DEFAULT_SHELL_SETTINGS, DEFAULT_SHORTCUTS } from './constants';
import type { DesktopShortcut, ShellSettings } from '../types/shell';

const STORAGE_KEY = 'polis-shell-settings';
const SHORTCUTS_KEY = 'polis-desktop-shortcuts';

export function loadSettings(): ShellSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SHELL_SETTINGS;
    return { ...DEFAULT_SHELL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SHELL_SETTINGS;
  }
}

export function saveSettings(settings: ShellSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function loadShortcuts(): DesktopShortcut[] {
  try {
    const raw = localStorage.getItem(SHORTCUTS_KEY);
    if (!raw) return DEFAULT_SHORTCUTS;
    return JSON.parse(raw) as DesktopShortcut[];
  } catch {
    return DEFAULT_SHORTCUTS;
  }
}

export function saveShortcuts(shortcuts: DesktopShortcut[]) {
  localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
}
