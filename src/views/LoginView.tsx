import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Building2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbStore';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const users = dbService.getUsers().filter((u) => u.activo);
  const roles = dbService.getRoles();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Por favor ingrese su usuario o correo corporativo.');
      return;
    }
    if (!password) {
      setError('Por favor ingrese su contraseña.');
      return;
    }

    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(identifier, password);
      if (!res.success) {
        setError(res.error || 'Credenciales no válidas.');
        setLoading(false);
      }
    }, 300);
  };

  const handleQuickLogin = (userItem: any) => {
    const pwd = userItem.password || 'admin123';
    setIdentifier(userItem.username);
    setPassword(pwd);
    setError(null);
    setLoading(true);

    setTimeout(() => {
      login(userItem.username, pwd);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Container Card */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-700/30">
        {/* Left Col: Brand Presentation & Quick Roles */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 to-indigo-900 p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200">
                  Consorcio Empresarial
                </span>
                <h1 className="text-lg font-black tracking-tight leading-tight">
                  Plataforma de Formación
                </h1>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-tight text-white mb-2">
                Gestión Centralizada del Conocimiento & Certificación
              </h2>
              <p className="text-xs text-blue-100/90 leading-relaxed">
                Sistema modular de alto rendimiento para el control normativo, horas de capacitación, seguimiento de personal e indicadores ejecutivos.
              </p>
            </div>

            {/* Quick Demo Access Buttons */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Acceso Rápido por Perfil (Demo):</span>
              </div>

              <div className="space-y-2">
                {users.slice(0, 4).map((u) => {
                  const role = roles.find((r) => r.id === u.roleId);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u)}
                      className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs shrink-0 text-white">
                          {u.nombreCompleto.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-amber-200 transition-colors">
                            {u.nombreCompleto}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-blue-200">
                            <span className="font-semibold">{role?.nombre.split(' ')[0]}</span>
                            <span>•</span>
                            <span className="font-mono text-blue-300">{u.username}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-200 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-200">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Seguridad RBAC v2.0
            </span>
            <span>Auditoría Activa</span>
          </div>
        </div>

        {/* Right Col: Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
                <Building2 className="w-3 h-3" />
                Acceso Corporativo Seguro
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Iniciar Sesión
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ingrese sus credenciales de usuario o correo corporativo para continuar.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-900">Error de Autenticación</p>
                  <p className="text-xs text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Usuario o Correo Institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="ej: admin.formacion o correo@empresa.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Contraseña
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Demo: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">admin123</code>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span>Recordar sesión en este equipo</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Ingresar a la Plataforma</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick credentials reference table */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-2">
              <p className="font-bold text-slate-700 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Credenciales configuradas por rol:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div className="p-2 rounded bg-white border border-slate-200">
                  <p className="font-bold text-slate-900">Administrador</p>
                  <p className="font-mono text-slate-500">admin.formacion</p>
                  <p className="text-[10px] text-blue-600 font-mono">admin123</p>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <p className="font-bold text-slate-900">Formadores</p>
                  <p className="font-mono text-slate-500">carlos.mendoza / laura.morales</p>
                  <p className="text-[10px] text-blue-600 font-mono">formador123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer notes */}
      <div className="mt-6 text-center text-xs text-slate-400 max-w-md">
        <p>Sistema protegido bajo estándares de ciberseguridad corporativa y control de auditoría.</p>
      </div>
    </div>
  );
};
