import { HashRouter } from 'react-router-dom';
import { useFiveM } from '../../context/FiveMContext';
import { ShellProvider } from '../../context/ShellContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

function ShellKeyboardLayer({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return <>{children}</>;
}

export function TabletShell({ children }: { children: React.ReactNode }) {
  const { visible, isInGame } = useFiveM();

  if (isInGame && !visible) {
    return null;
  }

  return (
    <div className={isInGame ? 'fivem-tablet-shell' : 'dev-shell'}>
      <ShellProvider>
        <HashRouter>
          <ShellKeyboardLayer>{children}</ShellKeyboardLayer>
        </HashRouter>
      </ShellProvider>
    </div>
  );
}
