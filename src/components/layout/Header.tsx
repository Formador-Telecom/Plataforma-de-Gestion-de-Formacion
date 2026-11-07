import React, { useState } from 'react';
import {
  Menu,
  Bell,
  UserCheck,
  RotateCcw,
  Shield,
  ChevronDown,
  AlertTriangle,
  Clock,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbStore';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentViewTitle: string;
  onNavigate: (view: string, subView?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentViewTitle,
  onNavigate,
}) => {
  const { currentUser, currentRole, users, switchUser, isAdmin, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const personalCerts = dbService.getPersonalCertificaciones();
  const certsProximas = personalCerts.filter((c) => c.estado === 'proximo_vencer');
  const certsVencidas = personalCerts.filter((c) => c.estado === 'vencido');
  const novedadesAbiertas = dbService.getNovedades().filter((n) => n.estado === 'abierta');

  const totalAlerts = certsProximas.length + certsVencidas.length + novedadesAbiertas.length;

  const handleResetDemo = () => {
    if (window.confirm('¿Deseas restaurar todos los datos a la demostración inicial (20 colaboradores, 3 proyectos, 5 formadores, capacitaciones y novedades)?')) {
      dbService.resetToDemoData();
      alert('Datos de prueba restaurados satisfactoriamente.');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left section: Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          title="Alternar navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {currentViewTitle}
            </h2>
            <span className="hidden sm:inline-block bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200">
              {currentRole?.nombre || 'Operador'}
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden md:block">
            Consorcio Empresarial • Sistema Central de Información de Formación
          </p>
        </div>
      </div>

      {/* Right section: Profile Switcher, Notifications, Demo Reset */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset Demo Data Button */}
        <button
          onClick={handleResetDemo}
          title="Restaurar datos iniciales de prueba"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Restaurar Demo</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative transition-colors"
            title="Alertas del Sistema"
          >
            <Bell className="w-5 h-5" />
            {totalAlerts > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {totalAlerts}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Notificaciones & Alertas ({totalAlerts})
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Tiempo real</span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                {certsProximas.length > 0 && (
                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('certificaciones', 'proximos');
                    }}
                    className="p-3 hover:bg-amber-50/60 cursor-pointer transition-colors flex items-start gap-2.5"
                  >
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        {certsProximas.length} Certificaciones Próximas a Vencer
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Plazo menor a 30 días para renovación de estándares obligatorios.
                      </p>
                    </div>
                  </div>
                )}

                {certsVencidas.length > 0 && (
                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('certificaciones', 'vencidos');
                    }}
                    className="p-3 hover:bg-rose-50/60 cursor-pointer transition-colors flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-800">
                        {certsVencidas.length} Certificaciones Vencidas
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Colaboradores sin habilitación activa para trabajo de alto riesgo.
                      </p>
                    </div>
                  </div>
                )}

                {novedadesAbiertas.length > 0 && (
                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('novedades', 'abiertas');
                    }}
                    className="p-3 hover:bg-blue-50/60 cursor-pointer transition-colors flex items-start gap-2.5"
                  >
                    <UserCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        {novedadesAbiertas.length} Novedades en Estado Abierto
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Incapacidades, re-evaluaciones o traslados pendientes de atención.
                      </p>
                    </div>
                  </div>
                )}

                {totalAlerts === 0 && (
                  <div className="p-6 text-center text-slate-400">
                    No hay alertas críticas en este momento.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role & User Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white font-bold flex items-center justify-center text-xs shadow-xs overflow-hidden">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.nombreCompleto}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser?.nombreCompleto.charAt(0) || 'U'
              )}
            </div>

            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                {currentUser?.nombreCompleto.split(' ')[0]} {currentUser?.nombreCompleto.split(' ')[1] || ''}
              </div>
              <div className="text-[10px] font-semibold text-blue-600 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                <span>{currentRole?.nombre.split(' ')[0] || 'Usuario'}</span>
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser?.nombreCompleto}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Rol: {currentRole?.nombre}</span>
                </div>
              </div>

              {/* Fast User Switcher */}
              <div className="p-2">
                <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Cambiar Perfil para Pruebas:
                </span>
                <div className="space-y-1">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser?.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-semibold">{u.nombreCompleto}</p>
                          <p className="text-[10px] text-slate-400">
                            {u.roleId === 'role-admin' ? 'Administrador' : u.roleId === 'role-formador' ? 'Formador' : 'Consulta'}
                          </p>
                        </div>
                        {isSelected && <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logout Action */}
              <div className="pt-2 border-t border-slate-100 px-2 pb-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
