import React, { useState, useRef } from 'react';
import {
  Boxes,
  Users,
  Shield,
  Briefcase,
  Building,
  GraduationCap,
  Sliders,
  History,
  Plus,
  Save,
  Search,
  Sparkles,
  HardDrive,
  Download,
  Upload,
  KeyRound,
  Edit2,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  FileText,
  FileCheck,
  CheckCircle2,
  Database,
  RotateCcw,
  UserCheck,
  FolderOpen,
  Filter,
} from 'lucide-react';
import { dbService } from '../services/dbStore';
import { useAuth } from '../context/AuthContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AppModule, User, StoredFile } from '../types/database';

interface AdminViewProps {
  subView: string;
  onSubViewChange: (sub: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  subView,
  onSubViewChange,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(subView || 'aplicativos');

  // Database collections
  const appModules = dbService.getAppModules();
  const users = dbService.getUsers();
  const roles = dbService.getRoles();
  const proyectos = dbService.getProyectos();
  const areas = dbService.getAreas();
  const formadores = dbService.getFormadores();
  const auditoria = dbService.getAuditoria();
  const storedFiles = dbService.getStoredFiles();
  const [parametros, setParametros] = useState(dbService.getParametros());

  // ----------------- USER MANAGEMENT STATE -----------------
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    nombreCompleto: '',
    roleId: 'role-formador',
    password: '',
    cargo: '',
    telefono: '',
    formadorId: '',
    activo: true,
  });
  const [userError, setUserError] = useState<string | null>(null);

  // Password reset modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Delete user modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ----------------- FILE & BACKUP STATE -----------------
  const [searchFile, setSearchFile] = useState('');
  const [fileModuleFilter, setFileModuleFilter] = useState('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fileUploadForm, setFileUploadForm] = useState({
    nombre: '',
    modulo: 'general' as StoredFile['modulo'],
    observaciones: '',
    contenidoUrl: '',
    tamanoBytes: 0,
    tipo: 'application/pdf',
  });
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreJson, setRestoreJson] = useState('');
  const [restoreFileName, setRestoreFileName] = useState('');
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  // Toggle Module
  const handleToggleModule = (moduleId: string) => {
    const mod = appModules.find((m) => m.id === moduleId);
    if (mod) {
      dbService.toggleAppModule(moduleId, !mod.activo, currentUser);
    }
  };

  // Save Global Parameters
  const handleSaveParametros = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.updateParametros(parametros, currentUser);
    alert('Parámetros actualizados exitosamente.');
  };

  // Tabs definition
  const tabs = [
    { id: 'aplicativos', label: 'Administración de Aplicativos', icon: Boxes },
    { id: 'usuarios', label: 'Usuarios y Cuentas', icon: Users },
    { id: 'archivos', label: 'Bases y Archivos', icon: HardDrive },
    { id: 'roles', label: 'Roles & Permisos', icon: Shield },
    { id: 'proyectos', label: 'Proyectos', icon: Briefcase },
    { id: 'areas', label: 'Áreas', icon: Building },
    { id: 'formadores', label: 'Formadores', icon: GraduationCap },
    { id: 'parametros', label: 'Parámetros', icon: Sliders },
    { id: 'auditoria', label: 'Pista de Auditoría', icon: History },
  ];

  const handleTabSelect = (id: string) => {
    setActiveTab(id);
    onSubViewChange(id);
  };

  // ----------------- USER HANDLERS -----------------
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      username: '',
      email: '',
      nombreCompleto: '',
      roleId: 'role-formador',
      password: '',
      cargo: '',
      telefono: '',
      formadorId: '',
      activo: true,
    });
    setUserError(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setUserForm({
      username: u.username,
      email: u.email,
      nombreCompleto: u.nombreCompleto,
      roleId: u.roleId,
      password: '',
      cargo: u.cargo || '',
      telefono: u.telefono || '',
      formadorId: u.formadorId || '',
      activo: u.activo,
    });
    setUserError(null);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);

    if (!userForm.username.trim() || !userForm.email.trim() || !userForm.nombreCompleto.trim()) {
      setUserError('Nombre completo, usuario y correo corporativo son obligatorios.');
      return;
    }

    if (editingUser) {
      // Update
      const partial: Partial<User> = {
        username: userForm.username.trim(),
        email: userForm.email.trim(),
        nombreCompleto: userForm.nombreCompleto.trim(),
        roleId: userForm.roleId,
        cargo: userForm.cargo.trim(),
        telefono: userForm.telefono.trim(),
        formadorId: userForm.formadorId || undefined,
        activo: userForm.activo,
      };
      if (userForm.password.trim()) {
        partial.password = userForm.password.trim();
      }

      const res = dbService.updateUser(editingUser.id, partial, currentUser);
      if (!res.success) {
        setUserError(res.error || 'Error al actualizar usuario.');
        return;
      }
    } else {
      // Create
      if (!userForm.password.trim()) {
        setUserError('Debe ingresar una contraseña para la nueva cuenta.');
        return;
      }

      const res = dbService.createUser(
        {
          username: userForm.username.trim(),
          email: userForm.email.trim(),
          nombreCompleto: userForm.nombreCompleto.trim(),
          roleId: userForm.roleId,
          password: userForm.password.trim(),
          cargo: userForm.cargo.trim(),
          telefono: userForm.telefono.trim(),
          formadorId: userForm.formadorId || undefined,
          activo: userForm.activo,
        },
        currentUser
      );

      if (!res.success) {
        setUserError(res.error || 'Error al registrar nuevo usuario.');
        return;
      }
    }

    setIsUserModalOpen(false);
  };

  const handleToggleStatus = (u: User) => {
    const res = dbService.toggleUserStatus(u.id, currentUser);
    if (!res.success) {
      alert(res.error);
    }
  };

  const handleOpenChangePassword = (u: User) => {
    setPasswordTargetUser(u);
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser) return;
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }
    const res = dbService.changeUserPassword(passwordTargetUser.id, newPassword, currentUser);
    if (!res.success) {
      alert(res.error);
      return;
    }
    alert('Contraseña actualizada exitosamente.');
    setIsPasswordModalOpen(false);
  };

  const handleOpenDeleteUser = (u: User) => {
    setUserToDelete(u);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    const res = dbService.deleteUser(userToDelete.id, currentUser);
    if (!res.success) {
      setDeleteError(res.error || 'Error al eliminar usuario.');
      return;
    }
    setIsDeleteModalOpen(false);
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.roleId !== roleFilter) return false;
    if (!searchUser.trim()) return true;
    const q = searchUser.toLowerCase();
    return (
      u.nombreCompleto.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.cargo && u.cargo.toLowerCase().includes(q))
    );
  });

  // ----------------- FILE & BACKUP HANDLERS -----------------
  const handleExportBackup = () => {
    const jsonStr = dbService.exportDatabaseBackup(currentUser);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_formacion_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelectForUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFileUploadForm({
        nombre: file.name,
        modulo: 'general',
        observaciones: '',
        contenidoUrl: reader.result as string,
        tamanoBytes: file.size,
        tipo: file.type || 'application/octet-stream',
      });
      setIsUploadModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUploadForm.nombre.trim()) return;

    dbService.uploadStoredFile(
      {
        nombre: fileUploadForm.nombre.trim(),
        modulo: fileUploadForm.modulo,
        observaciones: fileUploadForm.observaciones.trim(),
        contenidoUrl: fileUploadForm.contenidoUrl || 'https://example.com/doc',
        tamanoBytes: fileUploadForm.tamanoBytes || 1024,
        tipo: fileUploadForm.tipo,
        subidoPor: currentUser.nombreCompleto,
      },
      currentUser
    );

    setIsUploadModalOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteFile = (fileId: string) => {
    if (window.confirm('¿Desea eliminar este archivo del repositorio institucional?')) {
      dbService.deleteStoredFile(fileId, currentUser);
    }
  };

  const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFileName(file.name);
    setRestoreError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRestoreJson(content);
      setIsRestoreModalOpen(true);
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!restoreJson) return;
    const res = dbService.importDatabaseBackup(restoreJson, currentUser);
    if (!res.success) {
      setRestoreError(res.error || 'Error al restaurar respaldo.');
      return;
    }
    alert('Base de datos restaurada satisfactoriamente.');
    setIsRestoreModalOpen(false);
    if (restoreInputRef.current) restoreInputRef.current.value = '';
  };

  const filteredStoredFiles = storedFiles.filter((f) => {
    if (fileModuleFilter !== 'ALL' && f.modulo !== fileModuleFilter) return false;
    if (!searchFile.trim()) return true;
    const q = searchFile.toLowerCase();
    return (
      f.nombre.toLowerCase().includes(q) ||
      (f.observaciones && f.observaciones.toLowerCase().includes(q)) ||
      f.subidoPor.toLowerCase().includes(q)
    );
  });

  // Audit columns
  const auditColumns: Column<any>[] = [
    {
      key: 'fechaHora',
      header: 'Fecha & Hora',
      sortable: true,
      render: (a) => (
        <span className="font-mono text-slate-700 text-xs">
          {new Date(a.fechaHora).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'usuarioNombre',
      header: 'Usuario',
      sortable: true,
      render: (a) => (
        <div>
          <p className="font-bold text-slate-900">{a.usuarioNombre}</p>
          <p className="text-[11px] text-slate-500">{a.rol}</p>
        </div>
      ),
    },
    {
      key: 'accion',
      header: 'Acción',
      sortable: true,
      render: (a) => {
        let color = 'bg-blue-50 text-blue-700 border-blue-200';
        if (a.accion === 'CREAR') color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (a.accion === 'ELIMINAR') color = 'bg-rose-50 text-rose-700 border-rose-200';
        if (a.accion === 'LOGIN') color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        if (a.accion === 'LOGOUT') color = 'bg-slate-100 text-slate-700 border-slate-300';
        if (a.accion === 'BACKUP') color = 'bg-amber-50 text-amber-700 border-amber-200';
        if (a.accion === 'RESTAURAR') color = 'bg-purple-50 text-purple-700 border-purple-200';

        return (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${color}`}>
            {a.accion}
          </span>
        );
      },
    },
    {
      key: 'modulo',
      header: 'Módulo',
      sortable: true,
      render: (a) => <span className="font-semibold text-slate-700">{a.modulo}</span>,
    },
    {
      key: 'registroDescripcion',
      header: 'Detalle del Evento',
      render: (a) => <span className="text-slate-600 text-xs">{a.registroDescripcion}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-700" />
            <span>Centro de Administración del Sistema</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión corporativa de usuarios, almacenamiento de bases y archivos, catálogos y auditoría
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('¿Restablecer toda la base de datos a los valores de demostración iniciales?')) {
                dbService.resetToDemoData();
                alert('Datos de prueba restablecidos.');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Demo</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabSelect(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB: USUARIOS Y CUENTAS */}
      {/* ============================================================== */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          {/* Header Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar usuario por nombre, correo, usuario o cargo..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="ALL">Todos los Roles</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleOpenCreateUser}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          {/* Users Table / Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Directorio de Cuentas ({filteredUsers.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Control de credenciales, roles institucionales y permisos de acceso
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const role = roles.find((r) => r.id === u.roleId);
                const isCurrent = u.id === currentUser.id;

                let roleColor = 'bg-blue-50 text-blue-700 border-blue-200';
                if (role?.codigo === 'ADMIN') roleColor = 'bg-purple-50 text-purple-700 border-purple-200';
                if (role?.codigo === 'FORMADOR') roleColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (role?.codigo === 'CONSULTA') roleColor = 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <div
                    key={u.id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-700 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                        {u.nombreCompleto.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm">{u.nombreCompleto}</p>
                          {isCurrent && (
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              Tú (Sesión Actual)
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${roleColor}`}>
                            {role?.nombre || u.roleId}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                          <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            @{u.username}
                          </span>
                          <span>{u.email}</span>
                          {u.cargo && <span>• {u.cargo}</span>}
                          {u.telefono && <span>• Tel: {u.telefono}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-wrap">
                      {/* Status badge & toggle */}
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={isCurrent}
                        title={isCurrent ? 'No puedes desactivar tu propia cuenta' : 'Cambiar estado'}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                          u.activo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        } ${isCurrent ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{u.activo ? 'Activo' : 'Inactivo'}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditUser(u)}
                        className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                        title="Modificar datos del usuario"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>

                      {/* Password Button */}
                      <button
                        onClick={() => handleOpenChangePassword(u)}
                        className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                        title="Cambiar contraseña de acceso"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Clave</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleOpenDeleteUser(u)}
                        disabled={isCurrent}
                        className={`p-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                          isCurrent
                            ? 'text-slate-300 border border-slate-100 cursor-not-allowed'
                            : 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                        }`}
                        title={isCurrent ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No se encontraron usuarios con los criterios de búsqueda.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: BASES Y ARCHIVOS (ALMACENAMIENTO) */}
      {/* ============================================================== */}
      {activeTab === 'archivos' && (
        <div className="space-y-6">
          {/* Section 1: Backup & Database Storage */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-700" />
                  <span>Respaldo y Restauración de la Base de Datos</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Descarga instantánea en formato JSON y restauración íntegra con todas las tablas del sistema
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Respaldo (.json)</span>
                </button>

                <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>Restaurar Base (.json)</span>
                  <input
                    ref={restoreInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Inventory badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Personal</span>
                <span className="text-lg font-black text-slate-900">{dbService.getColaboradores().length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Certificaciones</span>
                <span className="text-lg font-black text-blue-700">{dbService.getPersonalCertificaciones().length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Capacitaciones</span>
                <span className="text-lg font-black text-emerald-700">{dbService.getCapacitaciones().length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Novedades</span>
                <span className="text-lg font-black text-amber-700">{dbService.getNovedades().length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Usuarios</span>
                <span className="text-lg font-black text-purple-700">{users.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Archivos Digitales</span>
                <span className="text-lg font-black text-indigo-700">{storedFiles.length}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Digital Documents & File Repository */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-indigo-600" />
                  <span>Repositorio de Archivos y Evidencias Digitales</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Almacenamiento de actas de capacitación, certificados oficiales, dictámenes médicos y manuales
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Subir Archivo al Repositorio</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelectForUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Filter and search for files */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar archivo por nombre, observaciones o responsable..."
                  value={searchFile}
                  onChange={(e) => setSearchFile(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <select
                value={fileModuleFilter}
                onChange={(e) => setFileModuleFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">Todos los Módulos</option>
                <option value="capacitaciones">Capacitaciones</option>
                <option value="certificaciones">Certificaciones</option>
                <option value="novedades">Novedades</option>
                <option value="general">General / Políticas</option>
              </select>
            </div>

            {/* Stored files list */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              {filteredStoredFiles.map((file) => {
                const formatSize = (bytes: number) => {
                  if (bytes < 1024) return `${bytes} B`;
                  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
                  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
                };

                return (
                  <div key={file.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{file.nombre}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap mt-0.5">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                            {formatSize(file.tamanoBytes)}
                          </span>
                          <span>• Módulo: <strong className="capitalize text-slate-700">{file.modulo}</strong></span>
                          {file.subidoPor && <span>• Subido por: {file.subidoPor}</span>}
                          <span>• {new Date(file.fechaSubida).toLocaleDateString()}</span>
                        </div>
                        {file.observaciones && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5 truncate">
                            {file.observaciones}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={file.contenidoUrl}
                        download={file.nombre}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Descargar</span>
                      </a>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar archivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredStoredFiles.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  No hay archivos almacenados con los filtros seleccionados.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: APLICATIVOS */}
      {/* ============================================================== */}
      {activeTab === 'aplicativos' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Catálogo de Aplicativos Corporativos</h4>
                <p className="text-xs text-slate-500">
                  Habilite o deshabilite módulos en tiempo real sin requerir reconstrucción de la plataforma
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appModules.map((mod) => (
                <div
                  key={mod.id}
                  className={`p-4 rounded-xl border transition-all ${
                    mod.activo
                      ? 'bg-white border-slate-200 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      v{mod.version || '1.0'}
                    </span>
                    <button
                      onClick={() => handleToggleModule(mod.id)}
                      className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                        mod.activo
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {mod.activo ? 'Activado' : 'Desactivado'}
                    </button>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm mb-1">{mod.nombre}</h5>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{mod.descripcion}</p>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Acceso Roles:</span>
                    <span className="font-semibold text-slate-700">
                      {(mod.rolesPermitidos?.length ?? 3) === 3 ? 'Todos los roles' : 'Restringido'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: ROLES & PERMISOS */}
      {/* ============================================================== */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-900 text-sm">{r.nombre}</h5>
                <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                  {r.codigo}
                </span>
              </div>
              <p className="text-xs text-slate-500">{r.descripcion}</p>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Permisos Otorgados ({r.permisos.length}):
                </span>
                <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
                  {r.permisos.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-100"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: PROYECTOS */}
      {/* ============================================================== */}
      {activeTab === 'proyectos' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Proyectos y Frentes de Operación</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {proyectos.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {p.codigo}
                  </span>
                  <Badge status={p.activo ? 'activo' : 'inactivo'} />
                </div>
                <h5 className="font-bold text-slate-900 text-sm">{p.nombre}</h5>
                <p className="text-xs text-slate-500">Ubicación: {p.ubicacion || 'Principal'}</p>
                <p className="text-xs text-slate-500">Líder: {p.responsable || 'Gerencia de Proyecto'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: AREAS */}
      {/* ============================================================== */}
      {activeTab === 'areas' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Áreas Organizacionales y Departamentos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {areas.map((a) => (
              <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-600">{a.codigo}</span>
                  <Badge status={a.activo ? 'activo' : 'inactivo'} />
                </div>
                <h5 className="font-bold text-slate-900 text-sm">{a.nombre}</h5>
                <p className="text-xs text-slate-500">Líder de Área: {a.responsable || 'Dirección de Área'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: FORMADORES */}
      {/* ============================================================== */}
      {activeTab === 'formadores' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Plantilla de Formadores y Capacitadores</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formadores.map((f) => (
              <div key={f.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-500">Doc: {f.documento}</span>
                  <Badge status={f.activo ? 'activo' : 'inactivo'} />
                </div>
                <h5 className="font-bold text-slate-900 text-sm">{f.nombreCompleto}</h5>
                <p className="text-xs text-blue-700 font-semibold">{f.especialidad}</p>
                <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-200">
                  <p>Email: {f.email}</p>
                  <p>Tel: {f.telefono}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: PARÁMETROS */}
      {/* ============================================================== */}
      {activeTab === 'parametros' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl">
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Configuración de Parámetros Globales
          </h4>
          <p className="text-xs text-slate-500 mb-5">
            Ajusta los plazos de vencimiento, alertas preventivas y metas anuales de formación
          </p>

          <form onSubmit={handleSaveParametros} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Días de Anticipación para Alerta de Vencimiento de Certificación
              </label>
              <input
                type="number"
                min={5}
                max={90}
                value={parametros.diasAlertaVencimiento}
                onChange={(e) =>
                  setParametros({ ...parametros, diasAlertaVencimiento: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Meta Anual de Horas de Capacitación por Colaborador
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={parametros.metaHorasFormacionAnual}
                onChange={(e) =>
                  setParametros({ ...parametros, metaHorasFormacionAnual: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Calificación Mínima Aprobatoria (%)
              </label>
              <input
                type="number"
                min={60}
                max={100}
                value={parametros.calificacionMinimaAprobacion}
                onChange={(e) =>
                  setParametros({
                    ...parametros,
                    calificacionMinimaAprobacion: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Parámetros</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: AUDITORÍA */}
      {/* ============================================================== */}
      {activeTab === 'auditoria' && (
        <DataTable
          columns={auditColumns}
          data={auditoria}
          keyExtractor={(a) => a.id}
          title="Trazabilidad y Pista de Auditoría Corporativa"
          subtitle="Registro inmutable de todas las acciones de autenticación, creación, modificación, importación y eliminación"
          exportFileName="pista_auditoria_sistema"
          searchableFields={['usuarioNombre', 'accion', 'modulo', 'registroDescripcion']}
        />
      )}

      {/* ============================================================== */}
      {/* MODAL: CREAR / EDITAR USUARIO */}
      {/* ============================================================== */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? `Editar Usuario: ${editingUser.nombreCompleto}` : 'Crear Nuevo Usuario para la Plataforma'}
        size="lg"
      >
        <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
          {userError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{userError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                placeholder="ej: Ing. Mario Santos Pardo"
                value={userForm.nombreCompleto}
                onChange={(e) => setUserForm({ ...userForm, nombreCompleto: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Usuario de Acceso (Username) *</label>
              <input
                type="text"
                required
                placeholder="ej: mario.santos"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Correo Electrónico Corporativo *</label>
              <input
                type="email"
                required
                placeholder="ej: mario.santos@empresa.com"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {editingUser ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña Inicial *'}
              </label>
              <input
                type="password"
                required={!editingUser}
                placeholder="••••••••••••"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Rol en el Sistema *</label>
              <select
                value={userForm.roleId}
                onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} ({r.codigo})
                  </option>
                ))}
              </select>
            </div>

            {userForm.roleId === 'role-formador' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vincular con Formador en Catálogo</label>
                <select
                  value={userForm.formadorId}
                  onChange={(e) => setUserForm({ ...userForm, formadorId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="">Sin vinculación específica</option>
                  {formadores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nombreCompleto} ({f.especialidad})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cargo / Especialidad</label>
              <input
                type="text"
                placeholder="ej: Supervisor SST, Formador Eléctrico..."
                value={userForm.cargo}
                onChange={(e) => setUserForm({ ...userForm, cargo: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Teléfono de Contacto</label>
              <input
                type="text"
                placeholder="ej: +57 310 123 4567"
                value={userForm.telefono}
                onChange={(e) => setUserForm({ ...userForm, telefono: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={userForm.activo}
                onChange={(e) => setUserForm({ ...userForm, activo: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span>Cuenta Activa (permite el inicio de sesión del usuario)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{editingUser ? 'Guardar Cambios' : 'Crear Usuario'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: CAMBIAR CONTRASEÑA */}
      {/* ============================================================== */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title={`Cambiar Contraseña: ${passwordTargetUser?.nombreCompleto || ''}`}
        size="md"
      >
        <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
          <p className="text-slate-500">
            Asigna una nueva clave para el usuario <strong className="text-slate-800">@{passwordTargetUser?.username}</strong>.
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nueva Contraseña</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                minLength={4}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 pr-10 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
            <input
              type={showPwd ? 'text' : 'password'}
              required
              minLength={4}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Actualizar Contraseña</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: ELIMINAR USUARIO */}
      {/* ============================================================== */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación de Usuario"
        size="md"
      >
        <div className="space-y-4 text-xs">
          {deleteError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <p className="text-slate-600">
            ¿Está seguro de que desea eliminar la cuenta de usuario de{' '}
            <strong className="text-slate-900">{userToDelete?.nombreCompleto}</strong> (
            <span className="font-mono">@{userToDelete?.username}</span>)?
          </p>

          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
            Esta acción revocará de inmediato cualquier acceso futuro a la plataforma y quedará registrada en la pista de auditoría.
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDeleteUser}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar Definitivamente</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: SUBIR ARCHIVO */}
      {/* ============================================================== */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Registrar Archivo en el Repositorio Digital"
        size="md"
      >
        <form onSubmit={handleConfirmUploadFile} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nombre del Archivo *</label>
            <input
              type="text"
              required
              value={fileUploadForm.nombre}
              onChange={(e) => setFileUploadForm({ ...fileUploadForm, nombre: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Módulo Asociado *</label>
            <select
              value={fileUploadForm.modulo}
              onChange={(e) =>
                setFileUploadForm({
                  ...fileUploadForm,
                  modulo: e.target.value as StoredFile['modulo'],
                })
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="capacitaciones">Capacitaciones</option>
              <option value="certificaciones">Certificaciones</option>
              <option value="novedades">Novedades</option>
              <option value="general">General / Políticas</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Observaciones / Descripción</label>
            <textarea
              rows={2}
              placeholder="Detalle o propósito del documento..."
              value={fileUploadForm.observaciones}
              onChange={(e) =>
                setFileUploadForm({ ...fileUploadForm, observaciones: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar en Repositorio</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: RESTAURAR RESPALDO */}
      {/* ============================================================== */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Confirmar Restauración de Respaldo"
        size="md"
      >
        <div className="space-y-4 text-xs">
          {restoreError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{restoreError}</span>
            </div>
          )}

          <p className="text-slate-600">
            ¿Desea restaurar la base de datos a partir del archivo{' '}
            <strong className="text-slate-900 font-mono">{restoreFileName}</strong>?
          </p>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
            <strong>Advertencia:</strong> Esta acción sobrescribirá las tablas actuales (colaboradores, capacitaciones, certificaciones, novedades y usuarios) con los datos contenidos en el respaldo.
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRestoreModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmRestore}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Restauración</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
