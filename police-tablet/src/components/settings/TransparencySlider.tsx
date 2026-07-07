interface TransparencySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export default function TransparencySlider({
  value,
  onChange,
  min = 40,
  max = 100,
  label = 'Transparenz',
  className = 'mt-4',
}: TransparencySliderProps) {
  return (
    <label className={`flex flex-col gap-2 text-sm text-text-secondary ${className}`.trim()}>
      {label} ({value}%)
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
