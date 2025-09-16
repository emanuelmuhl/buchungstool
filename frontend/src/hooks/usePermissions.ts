import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  const isViewer = (): boolean => {
    return hasRole(UserRole.VIEWER);
  };

  const canEdit = (): boolean => {
    return isAdmin();
  };

  const canCreate = (): boolean => {
    return isAdmin();
  };

  const canDelete = (): boolean => {
    return isAdmin();
  };

  const canManageUsers = (): boolean => {
    return isAdmin();
  };

  const canAccessSettings = (): boolean => {
    return isAdmin();
  };

  return {
    user,
    hasRole,
    isAdmin,
    isViewer,
    canEdit,
    canCreate,
    canDelete,
    canManageUsers,
    canAccessSettings,
  };
};
