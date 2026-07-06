import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FiveMProvider, useFiveM } from './context/FiveMContext';
import { AuthProvider } from './context/AuthContext';
import { AuditProvider } from './context/AuditContext';
import { DataProvider } from './context/DataContext';
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
import EinsaetzePage from './pages/EinsaetzePage';
import AuditLogPage from './pages/AuditLogPage';

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuditProvider>
        <DataProvider>{children}</DataProvider>
      </AuditProvider>
    </AuthProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
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
        <Route path="einsaetze" element={<EinsaetzePage />} />
        <Route path="einsaetze/:id" element={<EinsaetzePage />} />
        <Route path="protokoll" element={<AuditLogPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
      <div className={`fivem-tablet-screen ${isInGame ? 'in-game' : ''}`}>
        <AppProviders>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </AppProviders>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <FiveMProvider>
      <TabletShell />
    </FiveMProvider>
  );
}
