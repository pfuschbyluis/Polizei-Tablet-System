import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-surface-base">
      <Sidebar />
      <main className="relative min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
