import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../icons/Icon';
import PoliceIcon from '../icons/PoliceIcon';
import StartMenu from './StartMenu';
import TaskbarSearch from './TaskbarSearch';
import SystemTray from './SystemTray';
import TaskbarWindowPreview from './TaskbarWindowPreview';
import { useShell } from '../../context/ShellContext';

export default function Taskbar() {
  const navigate = useNavigate();
  const {
    settings,
    startOpen,
    setStartOpen,
    searchOpen,
    setSearchOpen,
    windowState,
    setWindowState,
    closeAllOverlays,
    shortcuts,
  } = useShell();

  const windowBtnRef = useRef<HTMLButtonElement>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null);

  const pinned = shortcuts.filter((s) => s.pinned);

  const toggleStart = () => {
    closeAllOverlays();
    setStartOpen(!startOpen);
  };

  const toggleSearch = () => {
    closeAllOverlays();
    setSearchOpen(!searchOpen);
  };

  const openApp = (route: string) => {
    closeAllOverlays();
    navigate(route);
    setWindowState('normal');
  };

  const showWindowPreview = () => {
    if (windowBtnRef.current) {
      setPreviewRect(windowBtnRef.current.getBoundingClientRect());
      setPreviewVisible(true);
    }
  };

  const hideWindowPreview = () => {
    setPreviewVisible(false);
  };

  const togglePolisWindow = () => {
    closeAllOverlays();
    if (windowState === 'minimized') setWindowState('normal');
    else navigate('/');
  };

  return (
    <>
      <div className={`flux-taskbar flux-taskbar--${settings.taskbarPosition} flux-taskbar--align-${settings.taskbarAlign}`}>
        <div className="flux-taskbar__cluster flux-taskbar__cluster--start">
          <button
            type="button"
            className={`flux-taskbar-btn flux-start-btn ${startOpen ? 'flux-taskbar-btn--active' : ''}`}
            onClick={toggleStart}
            title="Start"
          >
            <PoliceIcon size={22} />
          </button>
          <button type="button" className="flux-taskbar-btn" onClick={toggleSearch} title="Suchen">
            <Icon name="search" size={18} />
          </button>
        </div>

        <div className="flux-taskbar__cluster flux-taskbar__cluster--apps">
          {pinned.map((app) => (
            <button
              key={app.id}
              type="button"
              className="flux-taskbar-btn flux-taskbar-btn--app"
              title={app.label}
              onClick={() => openApp(app.route)}
            >
              {app.id === 'polis' ? <PoliceIcon size={20} /> : <Icon name={app.icon} size={18} />}
            </button>
          ))}
          <button
            ref={windowBtnRef}
            type="button"
            className={`flux-taskbar-btn flux-taskbar-btn--window ${windowState !== 'minimized' ? 'flux-taskbar-btn--active' : ''}`}
            title="POLIS"
            onClick={togglePolisWindow}
            onMouseEnter={showWindowPreview}
            onMouseLeave={hideWindowPreview}
            onFocus={showWindowPreview}
            onBlur={hideWindowPreview}
          >
            <PoliceIcon size={20} />
            <span className="flux-taskbar-btn__label">POLIS</span>
            {windowState !== 'minimized' && <span className="flux-taskbar-btn__indicator" />}
          </button>
        </div>

        <SystemTray />
      </div>
      <TaskbarWindowPreview
        title="POLIS"
        subtitle="Polizei Information System"
        visible={previewVisible && windowState !== 'minimized'}
        anchorRect={previewRect}
      />
      <StartMenu />
      <TaskbarSearch />
    </>
  );
}
