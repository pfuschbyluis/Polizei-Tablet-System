import { WALLPAPERS } from '../../shell/constants';

export default function DesktopWidgets() {
  return (
    <div className="flux-desktop-widgets">
      <div className="flux-desktop-widget">
        <p className="flux-desktop-widget__title">Wetter</p>
        <p className="flux-desktop-widget__value">12°C · Bewölkt</p>
        <p className="flux-desktop-widget__sub">Los Santos</p>
      </div>
      <div className="flux-desktop-widget">
        <p className="flux-desktop-widget__title">System</p>
        <p className="flux-desktop-widget__value">POLIS v2</p>
        <p className="flux-desktop-widget__sub">{WALLPAPERS.length} Hintergründe</p>
      </div>
    </div>
  );
}
