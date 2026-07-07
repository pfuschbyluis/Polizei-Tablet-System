import Icon from '../icons/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useShell } from '../../context/ShellContext';
import { WALLPAPERS } from '../../shell/constants';
import AccentSwatchPicker from '../settings/AccentSwatchPicker';
import TransparencySlider from '../settings/TransparencySlider';

export default function QuickSettings() {
  const { quickSettingsOpen, settings, updateSettings, systemStatus, setSystemStatus, closeAllOverlays } =
    useShell();
  const { theme, setTheme } = useTheme();

  if (!quickSettingsOpen) return null;

  return (
    <div className="flux-flyout flux-quick-settings" onClick={(e) => e.stopPropagation()}>
      <div className="flux-quick-settings__grid">
        <button
          type="button"
          className={`flux-quick-tile ${systemStatus.wifi ? 'flux-quick-tile--on' : ''}`}
          onClick={() => setSystemStatus({ wifi: !systemStatus.wifi })}
        >
          <Icon name="wifi" size={20} />
          <span>WLAN</span>
        </button>
        <button
          type="button"
          className={`flux-quick-tile ${systemStatus.bluetooth ? 'flux-quick-tile--on' : ''}`}
          onClick={() => setSystemStatus({ bluetooth: !systemStatus.bluetooth })}
        >
          <Icon name="bluetooth" size={20} />
          <span>Bluetooth</span>
        </button>
        <button type="button" className="flux-quick-tile flux-quick-tile--on">
          <Icon name="volume" size={20} />
          <span>Lautstärke</span>
        </button>
        <button
          type="button"
          className={`flux-quick-tile ${settings.doNotDisturb ? 'flux-quick-tile--on' : ''}`}
          onClick={() => updateSettings({ doNotDisturb: !settings.doNotDisturb })}
        >
          <Icon name="bell" size={20} />
          <span>Nicht stören</span>
        </button>
      </div>

      <label className="flux-quick-slider">
        <span>Helligkeit</span>
        <input
          type="range"
          min={20}
          max={100}
          value={systemStatus.brightness}
          onChange={(e) => setSystemStatus({ brightness: Number(e.target.value) })}
        />
      </label>
      <label className="flux-quick-slider">
        <span>Lautstärke</span>
        <input
          type="range"
          min={0}
          max={100}
          value={systemStatus.volume}
          onChange={(e) => setSystemStatus({ volume: Number(e.target.value) })}
        />
      </label>

      <TransparencySlider
        value={settings.transparency}
        onChange={(transparency) => updateSettings({ transparency })}
        label="Transparenz"
        className="flux-quick-slider"
      />

      <div className="flux-quick-settings__row">
        <button type="button" className="flux-quick-chip" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
          {theme === 'dark' ? 'Hell' : 'Dunkel'}
        </button>
        <button
          type="button"
          className="flux-quick-chip"
          onClick={() => updateSettings({ wallpaperIndex: (settings.wallpaperIndex + 1) % WALLPAPERS.length })}
        >
          <Icon name="layout" size={16} />
          Hintergrund
        </button>
      </div>

      <AccentSwatchPicker
        value={settings.accent}
        onChange={(accent) => updateSettings({ accent })}
      />

      <button type="button" className="flux-flyout__close" onClick={closeAllOverlays}>
        Schließen
      </button>
    </div>
  );
}
