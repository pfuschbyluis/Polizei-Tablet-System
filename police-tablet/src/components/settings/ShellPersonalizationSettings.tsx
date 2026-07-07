import { useShell } from '../../context/ShellContext';
import { WALLPAPERS } from '../../shell/constants';
import type { FontScale, TaskbarAlign, TaskbarPosition } from '../../types/shell';
import { Select } from '../ui';
import AccentSwatchPicker from './AccentSwatchPicker';
import TransparencySlider from './TransparencySlider';

export default function ShellPersonalizationSettings() {
  const { settings, updateSettings } = useShell();

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Taskleiste Position"
          value={settings.taskbarPosition}
          onChange={(e) => updateSettings({ taskbarPosition: e.target.value as TaskbarPosition })}
          options={[
            { value: 'bottom', label: 'Unten' },
            { value: 'top', label: 'Oben' },
            { value: 'left', label: 'Links' },
            { value: 'right', label: 'Rechts' },
          ]}
        />
        <Select
          label="Taskleiste Ausrichtung"
          value={settings.taskbarAlign}
          onChange={(e) => updateSettings({ taskbarAlign: e.target.value as TaskbarAlign })}
          options={[
            { value: 'center', label: 'Zentriert' },
            { value: 'start', label: 'Links' },
          ]}
        />
        <Select
          label="Schriftgröße"
          value={settings.fontScale}
          onChange={(e) => updateSettings({ fontScale: e.target.value as FontScale })}
          options={[
            { value: 'sm', label: 'Klein' },
            { value: 'md', label: 'Normal' },
            { value: 'lg', label: 'Groß' },
          ]}
        />
        <Select
          label="Hintergrund"
          value={String(settings.wallpaperIndex)}
          onChange={(e) => updateSettings({ wallpaperIndex: Number(e.target.value) })}
          options={WALLPAPERS.map((w, i) => ({ value: String(i), label: w.label }))}
        />
      </div>

      <TransparencySlider
        value={settings.transparency}
        onChange={(transparency) => updateSettings({ transparency })}
      />

      <AccentSwatchPicker
        value={settings.accent}
        onChange={(accent) => updateSettings({ accent })}
      />

      <label className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={settings.autoWallpaper}
          onChange={(e) => updateSettings({ autoWallpaper: e.target.checked })}
        />
        Hintergrund automatisch wechseln
      </label>
    </>
  );
}
