import { ACCENT_PRESETS, WALLPAPERS } from './constants';
import type { ShellSettings } from '../types/shell';

export function applyShellCss(settings: ShellSettings) {
  const root = document.documentElement;
  const accent = ACCENT_PRESETS[settings.accent];
  root.style.setProperty('--flux-accent', accent.accent);
  root.style.setProperty('--flux-accent-hover', accent.hover);
  root.style.setProperty('--flux-accent-light', accent.light);
  root.style.setProperty('--flux-accent-subtle', accent.subtle);
  root.style.setProperty('--flux-shell-transparency', String(settings.transparency / 100));
  root.style.setProperty('--flux-wallpaper', WALLPAPERS[settings.wallpaperIndex]?.css ?? WALLPAPERS[0].css);
  root.setAttribute('data-font-scale', settings.fontScale);
  root.setAttribute('data-taskbar-position', settings.taskbarPosition);
  root.setAttribute('data-taskbar-align', settings.taskbarAlign);
}
