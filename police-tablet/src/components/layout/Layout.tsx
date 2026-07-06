import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useFiveM } from '../../context/FiveMContext';

export default function Layout() {
  const { isInGame } = useFiveM();

  return (
    <div
      className={`flex min-h-0 w-full overflow-hidden bg-surface-base ${
        isInGame ? 'h-full' : 'h-screen'
      }`}
    >
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className={`min-h-0 flex-1 overflow-y-auto ${isInGame ? 'p-4' : 'p-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
