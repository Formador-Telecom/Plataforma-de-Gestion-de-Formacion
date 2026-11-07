import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Award,
  AlertCircle,
  FileBarChart,
  Settings,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  Boxes,
  CalendarDays,
  FileCheck2,
  TrendingUp,
  FolderLock,
  CheckSquare,
  MessageSquareText,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbStore';

interface SidebarProps {
  currentView: string;
  currentSubView: string;
  onNavigate: (view: string, subView?: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  currentSubView,
  onNavigate,
  isOpen,
  onCloseMobile,
}) => {
  const { isAdmin, isFormador, currentUser, currentRole, logout } = useAuth();
  const appModules = dbService.getAppModules().filter((m) => m.activo);

  const iconMap: Record<string, any> = {
    Award,
    GraduationCap,
    AlertCircle,
    CheckSquare,
    FileCheck2,
    Calendar: CalendarDays,
    TrendingUp,
    MessageSquareText,
    FolderLock,
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Inicio',
      icon: LayoutDashboard,
      subItems: [{ id: 'general', label: 'Dashboard General' }],
    },
    {
      id: 'certificaciones',
      label: 'Certificaciones',
      icon: Award,
      subItems: [
        { id: 'todos', label: 'Todos los Colaboradores' },
        { id: 'certificados', label: 'Personal Certificado' },
        { id: 'no_certificados', label: 'Personal No Certificado' },
        { id: 'proximos', label: 'Próximas a Vencer' },
        { id: 'vencidos', label: 'Certificaciones Vencidas' },
        { id: 'catalogo', label: 'Catálogo de Estándares' },
      ],
    },
    {
      id: 'formacion',
      label: 'Formación',
      icon: GraduationCap,
      subItems: [
        { id: 'capacitados', label: 'Personal Capacitado' },
        { id: 'registrar', label: 'Registrar Capacitación' },
        { id: 'historial', label: 'Historial de Sesiones' },
        { id: 'plan', label: 'Plan y Metas de Horas' },
      ],
    },
    {
      id: 'novedades',
      label: 'Novedades',
      icon: AlertCircle,
      subItems: [
        { id: 'todas', label: 'Todas las Novedades' },
        { id: 'registrar', label: 'Registrar Novedad' },
        { id: 'abiertas', label: 'Novedades Abiertas' },
        { id: 'seguimiento', label: 'En Seguimiento' },
        { id: 'cerradas', label: 'Novedades Cerradas' },
      ],
    },
    {
      id: 'reportes',
      label: 'Reportes & Análisis',
      icon: FileBarChart,
      subItems: [
        { id: 'capacitacion', label: 'Reporte de Capacitación' },
        { id: 'certificaciones', label: 'Reporte de Certificaciones' },
        { id: 'novedades', label: 'Reporte de Novedades' },
        { id: 'formador', label: 'Métricas por Formador' },
        { id: 'proyecto', label: 'Métricas por Proyecto' },
        { id: 'area', label: 'Métricas por Área' },
      ],
    },
    {
      id: 'importar',
      label: 'Importación Masiva',
      icon: UploadCloud,
      subItems: [
        { id: 'asistente', label: 'Asistente Excel / CSV (10 Pasos)' },
        { id: 'plantillas', label: 'Descarga de Plantillas' },
      ],
    },
  ];

  const adminSubItems = [
    { id: 'aplicativos', label: 'Administración de Aplicativos' },
    { id: 'usuarios', label: 'Usuarios y Cuentas' },
    { id: 'roles', label: 'Roles y Permisos' },
    { id: 'proyectos', label: 'Proyectos Organizacionales' },
    { id: 'areas', label: 'Áreas de la Empresa' },
    { id: 'formadores', label: 'Plantilla de Formadores' },
    { id: 'tipos_novedad', label: 'Tipos de Novedad' },
    { id: 'parametros', label: 'Parámetros Generales' },
    { id: 'auditoria', label: 'Pista de Auditoría' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm tracking-tight leading-tight">
                SGI Formación
              </h1>
              <p className="text-[11px] text-blue-400 font-medium">
                Gestión Empresarial
              </p>
            </div>
          </div>
        </div>

        {/* Navigation list with scroll */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Main Navigation */}
          <div>
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Gestión de Procesos
            </span>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <div key={item.id} className="space-y-0.5">
                    <button
                      onClick={() => {
                        onNavigate(item.id, item.subItems[0].id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isActive ? 'rotate-90 text-white' : 'text-slate-500'
                        }`}
                      />
                    </button>

                    {/* Subitems */}
                    {isActive && (
                      <div className="ml-5 pl-3 border-l border-slate-700/60 py-1 space-y-1">
                        {item.subItems.map((sub) => {
                          const isSubActive = currentSubView === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                onNavigate(item.id, sub.id);
                                onCloseMobile();
                              }}
                              className={`w-full text-left text-[11.5px] py-1 px-2 rounded font-medium transition-colors ${
                                isSubActive
                                  ? 'text-blue-300 bg-blue-950/60 font-semibold'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                              }`}
                            >
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extensible Modules Preview */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Aplicativos Activos ({appModules.length})
              </span>
              <Boxes className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="space-y-1">
              {appModules.map((mod) => {
                const Icon = iconMap[mod.icono] || Boxes;
                return (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/30 border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{mod.nombre}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-1.5 py-0.2 rounded shrink-0">
                      ON
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Administration Section (Visible strictly for Administrators) */}
          {isAdmin && (
            <div>
              <span className="px-3 text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
                Administración General
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    onNavigate('admin', adminSubItems[0].id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    currentView === 'admin'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className={`w-4 h-4 ${currentView === 'admin' ? 'text-white' : 'text-amber-400'}`} />
                    <span>Panel de Control</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      currentView === 'admin' ? 'rotate-90 text-white' : 'text-slate-500'
                    }`}
                  />
                </button>

                {currentView === 'admin' && (
                  <div className="ml-5 pl-3 border-l border-amber-500/40 py-1 space-y-1">
                    {adminSubItems.map((sub) => {
                      const isSubActive = currentSubView === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            onNavigate('admin', sub.id);
                            onCloseMobile();
                          }}
                          className={`w-full text-left text-[11.5px] py-1 px-2 rounded font-medium transition-colors ${
                            isSubActive
                              ? 'text-amber-300 bg-amber-950/60 font-semibold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card & Logout in Sidebar Footer */}
        {currentUser && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/80">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {currentUser.nombreCompleto.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {currentUser.nombreCompleto}
                  </p>
                  <p className="text-[10px] text-blue-400 truncate">
                    {currentRole?.nombre || 'Usuario'}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span>SGI Formación v2.4</span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Conectado
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
