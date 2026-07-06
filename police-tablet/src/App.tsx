import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { FiveMProvider, useFiveM } from './context/FiveMContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuditProvider } from './context/AuditContext';
import { DataProvider } from './context/DataContext';
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

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SessionReset />
      <AuditProvider>
        <DataProvider>{children}</DataProvider>
      </AuditProvider>
    </AuthProvider>
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
        <AppProviders>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </AppProviders>
      </WindowFrame>
    </div>
  );
}

export default function App() {
  return (
    <FiveMProvider>
      <ThemeProvider>
        <TabletShell />
      </ThemeProvider>
    </FiveMProvider>
  );
}
