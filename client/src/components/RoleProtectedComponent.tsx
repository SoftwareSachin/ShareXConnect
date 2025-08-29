import React from 'react';
import { useAuthStore } from '@/lib/auth';
import type { Permission } from '@shared/permissions';

interface RoleProtectedComponentProps {
  children: React.ReactNode;
  permissions: (keyof Permission)[];
  requireAll?: boolean; // If true, requires ALL permissions. If false, requires ANY permission.
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function RoleProtectedComponent({
  children,
  permissions,
  requireAll = false,
  fallback = null,
  showFallback = false,
}: RoleProtectedComponentProps) {
  const { user, getPermissions } = useAuthStore();
  
  if (!user) {
    return showFallback ? <>{fallback}</> : null;
  }
  
  const userPermissions = getPermissions();
  if (!userPermissions) {
    return showFallback ? <>{fallback}</> : null;
  }
  
  const hasAccess = requireAll
    ? permissions.every(permission => userPermissions[permission])
    : permissions.some(permission => userPermissions[permission]);
  
  if (!hasAccess) {
    return showFallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
}

/**
 * Hook for checking permissions in components
 */
export function usePermissions() {
  const { user, getPermissions, hasPermission, canAccess } = useAuthStore();
  
  return {
    user,
    permissions: getPermissions(),
    hasPermission,
    canAccess,
    isStudent: user?.role === 'STUDENT',
    isFaculty: user?.role === 'FACULTY',
    isAdmin: user?.role === 'ADMIN',
    isGuest: user?.role === 'GUEST',
  };
}

/**
 * Component for role-specific navigation items
 */
interface RoleBasedMenuItemProps {
  role?: string | string[];
  permissions?: (keyof Permission)[];
  children: React.ReactNode;
  requireAll?: boolean;
}

export function RoleBasedMenuItem({
  role,
  permissions = [],
  children,
  requireAll = false,
}: RoleBasedMenuItemProps) {
  const { user } = usePermissions();
  
  if (!user) return null;
  
  // Check role if specified
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role)) {
      return null;
    }
  }
  
  // Check permissions if specified
  if (permissions.length > 0) {
    return (
      <RoleProtectedComponent
        permissions={permissions}
        requireAll={requireAll}
      >
        {children}
      </RoleProtectedComponent>
    );
  }
  
  return <>{children}</>;
}