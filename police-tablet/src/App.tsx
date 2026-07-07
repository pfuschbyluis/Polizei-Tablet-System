import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { FiveMProvider, useFiveM } from './context/FiveMContext';
import { ThemeProvider } from './context/ThemeContext';
import { BrandingProvider } from './context/BrandingContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuditProvider } from './context/AuditContext';
import { DataProvider } from './context/DataContext';
import { NotifyProvider } from './context/NotifyContext';
import ProtectedLayout from './components/ProtectedRoute';
import WindowFrame from './components/shell/WindowFrame';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import PersonenPage from './pages/PersonenPage';
import PersonDetailPage from './pages/PersonDetailPage';
import AktenPage from './pages/AktenPage';
import AkteDetailPage from './pages/AkteDetailPage';
import AkteCreatePage from './pages/AkteCreatePage';
import WaffenPage from './pages/WaffenPage';
import FahrzeugePage from './pages/FahrzeugePage';
import FahndungPage from './pages/FahndungPage';
import AuditLogPage from './pages/AuditLogPage';
import MitarbeiterPage from './pages/MitarbeiterPage';
import EinstellungenPage from './pages/EinstellungenPage';

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-surface-base">
      <NotifyProvider>
        <AuthProvider>
          <SessionReset />
          <AuditProvider>
            <DataProvider>{children}</DataProvider>
          </AuditProvider>
        </AuthProvider>
      </NotifyProvider>
    </div>
  );
}

function SessionReset() {
  const { visible, isInGame } = useFiveM();
  const { logout, isAuthenticated } = useAuth();
  useEffect(() => {
    if (isInGame && !visible && isAuthenticated) {
      logout();
    }
  }, [visible, isInGame, isAuthenticated, logout]);
  return null;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedLayout />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="personen" element={<PersonenPage />} />
          <Route path="personen/:id" element={<PersonDetailPage />} />
          <Route path="akten" element={<AktenPage />} />
          <Route path="akten/neu" element={<AkteCreatePage />} />
          <Route path="akten/:id" element={<AkteDetailPage />} />
          <Route path="waffen" element={<WaffenPage />} />
          <Route path="waffen/:id" element={<WaffenPage />} />
          <Route path="fahrzeuge" element={<FahrzeugePage />} />
          <Route path="fahrzeuge/:id" element={<FahrzeugePage />} />
          <Route path="fahndung" element={<FahndungPage />} />
          <Route path="mitarbeiter" element={<MitarbeiterPage />} />
          <Route path="einstellungen" element={<EinstellungenPage />} />
          <Route path="protokoll" element={<AuditLogPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

function TabletShell() {
  const { visible, isInGame } = useFiveM();

  if (isInGame && !visible) {
    return null;
  }

  return (
    <div className={isInGame ? 'fivem-tablet-shell' : 'dev-shell'}>
      <WindowFrame>
        <HashRouter>
          <AppProviders>
            <AppRoutes />
          </AppProviders>
        </HashRouter>
      </WindowFrame>
    </div>
  );
}

export default function App() {
  return (
    <FiveMProvider>
      <ThemeProvider>
        <BrandingProvider>
          <TabletShell />
        </BrandingProvider>
      </ThemeProvider>
    </FiveMProvider>
  );
}
