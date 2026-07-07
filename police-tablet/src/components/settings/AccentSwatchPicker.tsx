import { ACCENT_PRESETS } from '../../shell/constants';
import type { AccentPreset } from '../../types/shell';

interface AccentSwatchPickerProps {
  value: AccentPreset;
  onChange: (accent: AccentPreset) => void;
  className?: string;
}

const ACCENTS = Object.keys(ACCENT_PRESETS) as AccentPreset[];

export default function AccentSwatchPicker({ value, onChange, className = '' }: AccentSwatchPickerProps) {
  return (
    <div className={`flux-accent-row ${className}`.trim()}>
      {ACCENTS.map((accent) => (
        <button
          key={accent}
          type="button"
          className={`flux-accent-swatch ${value === accent ? 'flux-accent-swatch--active' : ''}`}
          style={{ background: ACCENT_PRESETS[accent].accent }}
          onClick={() => onChange(accent)}
          title={accent}
        />
      ))}
    </div>
  );
}
