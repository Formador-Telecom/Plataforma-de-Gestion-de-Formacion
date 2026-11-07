import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types/database';
import { dbService } from '../services/dbStore';

interface AuthContextType {
  currentUser: User | null;
  currentRole: Role | undefined;
  isAuthenticated: boolean;
  users: User[];
  roles: Role[];
  isAdmin: boolean;
  isFormador: boolean;
  isConsulta: boolean;
  login: (identifier: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  hasPermission: (permissionCode: string) => boolean;
  canAccessModule: (moduleRoute: string) => boolean;
}

const SESSION_KEY = 'formacion_active_session_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(dbService.getUsers());
  const [roles, setRoles] = useState<Role[]>(dbService.getRoles());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_KEY) || null;
  });

  useEffect(() => {
    const unsubscribe = dbService.subscribe(() => {
      const updatedUsers = dbService.getUsers();
      setUsers(updatedUsers);
      setRoles(dbService.getRoles());

      // If active user was deactivated or deleted, log out
      if (currentUserId) {
        const found = updatedUsers.find((u) => u.id === currentUserId && u.activo);
        if (!found) {
          setCurrentUserId(null);
          localStorage.removeItem(SESSION_KEY);
        }
      }
    });
    return unsubscribe;
  }, [currentUserId]);

  const currentUser = currentUserId ? users.find((u) => u.id === currentUserId && u.activo) || null : null;
  const currentRole = roles.find((r) => r.id === currentUser?.roleId);

  const isAuthenticated = !!currentUser;
  const isAdmin = currentRole?.codigo === 'ADMIN';
  const isFormador = currentRole?.codigo === 'FORMADOR';
  const isConsulta = currentRole?.codigo === 'CONSULTA';

  const login = (identifier: string, password: string): { success: boolean; error?: string } => {
    const result = dbService.login(identifier, password);
    if (result.success && result.user) {
      setCurrentUserId(result.user.id);
      localStorage.setItem(SESSION_KEY, result.user.id);
      return { success: true };
    }
    return { success: false, error: result.error || 'Credenciales inválidas' };
  };

  const logout = () => {
    if (currentUser) {
      dbService.logout(currentUser);
    }
    setCurrentUserId(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const switchUser = (userId: string) => {
    const selected = users.find((u) => u.id === userId && u.activo);
    if (selected) {
      setCurrentUserId(userId);
      localStorage.setItem(SESSION_KEY, userId);
      dbService.logAudit({
        usuarioId: selected.id,
        usuarioNombre: selected.nombreCompleto,
        rol: selected.roleId,
        accion: 'LOGIN',
        modulo: 'Autenticación',
        registroAfectadoId: selected.id,
        registroDescripcion: `Cambio rápido de sesión activo a usuario ${selected.nombreCompleto} (${selected.roleId})`,
      });
    }
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!currentRole) return false;
    if (isAdmin) return true; // Administrator has all privileges
    return currentRole.permisos.includes(permissionCode);
  };

  const canAccessModule = (moduleRoute: string): boolean => {
    if (isAdmin) return true;
    if (moduleRoute.startsWith('/admin')) {
      return false; // Only admin
    }
    if (moduleRoute === '/importar') {
      return isAdmin;
    }
    // Formador and Consulta can access core operational modules
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        users,
        roles,
        isAdmin,
        isFormador,
        isConsulta,
        login,
        logout,
        switchUser,
        hasPermission,
        canAccessModule,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
