import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './views/DashboardView';
import { CertificacionesView } from './views/CertificacionesView';
import { CapacitacionesView } from './views/CapacitacionesView';
import { NovedadesView } from './views/NovedadesView';
import { ReportesView } from './views/ReportesView';
import { ImportarView } from './views/ImportarView';
import { AdminView } from './views/AdminView';
import { LoginView } from './views/LoginView';
import { dbService } from './services/dbStore';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentSubView, setCurrentSubView] = useState<string>('general');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [, setDbVersion] = useState(0);

  // Subscribe to central DB store state changes
  useEffect(() => {
    const unsubscribe = dbService.subscribe(() => {
      setDbVersion((v) => v + 1);
    });
    return () => unsubscribe();
  }, []);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleNavigate = (view: string, subView?: string) => {
    setCurrentView(view);
    if (subView) {
      setCurrentSubView(subView);
    } else {
      // Defaults
      if (view === 'dashboard') setCurrentSubView('general');
      else if (view === 'certificaciones') setCurrentSubView('todos');
      else if (view === 'formacion') setCurrentSubView('capacitados');
      else if (view === 'novedades') setCurrentSubView('todas');
      else if (view === 'reportes') setCurrentSubView('capacitacion');
      else if (view === 'importar') setCurrentSubView('asistente');
      else if (view === 'admin') setCurrentSubView('aplicativos');
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard General';
      case 'certificaciones':
        return 'Gestión de Certificaciones';
      case 'formacion':
        return 'Gestión de Formación y Capacitación';
      case 'novedades':
        return 'Control de Novedades del Personal';
      case 'reportes':
        return 'Módulo de Reportes & Exportación';
      case 'importar':
        return 'Importación Masiva de Datos';
      case 'admin':
        return 'Administración de la Plataforma';
      default:
        return 'Gestión de Formación';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col antialiased">
      {/* Sidebar navigation */}
      <Sidebar
        currentView={currentView}
        currentSubView={currentSubView}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Content Area (offset on desktop by sidebar width) */}
      <div className="lg:pl-72 flex-1 flex flex-col">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentViewTitle={getTitle()}
          onNavigate={handleNavigate}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView onNavigate={handleNavigate} />
          )}

          {currentView === 'certificaciones' && (
            <CertificacionesView
              subView={currentSubView}
              onSubViewChange={(sub) => setCurrentSubView(sub)}
            />
          )}

          {currentView === 'formacion' && (
            <CapacitacionesView
              subView={currentSubView}
              onSubViewChange={(sub) => setCurrentSubView(sub)}
            />
          )}

          {currentView === 'novedades' && (
            <NovedadesView
              subView={currentSubView}
              onSubViewChange={(sub) => setCurrentSubView(sub)}
            />
          )}

          {currentView === 'reportes' && (
            <ReportesView
              subView={currentSubView}
              onSubViewChange={(sub) => setCurrentSubView(sub)}
            />
          )}

          {currentView === 'importar' && <ImportarView />}

          {currentView === 'admin' && (
            <AdminView
              subView={currentSubView}
              onSubViewChange={(sub) => setCurrentSubView(sub)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
