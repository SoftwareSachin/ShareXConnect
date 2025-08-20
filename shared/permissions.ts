/**
 * Role-based access control permissions for ShareXConnect
 * Defines what each user role can access and do
 */

export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN' | 'GUEST';

export interface Permission {
  // Project Management
  canCreateProject: boolean;
  canEditOwnProject: boolean;
  canDeleteOwnProject: boolean;
  canViewAllProjects: boolean;
  canViewPublicProjects: boolean;
  canViewInstitutionProjects: boolean;
  
  // Collaboration
  canCollaborate: boolean;
  canInviteCollaborators: boolean;
  canCommentOnProjects: boolean;
  canSuggestOnProjects: boolean;
  canStarProjects: boolean;
  
  // Faculty/Assignment Features
  canAssignToFaculty: boolean;
  canReceiveAssignments: boolean;
  canGradeProjects: boolean;
  canProvideFeedback: boolean;
  canViewAssignedProjects: boolean;
  
  // Admin Features
  canManageUsers: boolean;
  canManageFaculty: boolean;
  canManageStudents: boolean;
  canManageCollegeDomains: boolean;
  canViewAllInstitutionData: boolean;
  canModifyUserRoles: boolean;
  canRemoveUsers: boolean;
  
  // Filtering and Search
  canFilterByTechStack: boolean;
  canFilterByDepartment: boolean;
  canFilterByInstitution: boolean;
  canAdvancedSearch: boolean;
}

// Permission definitions for each role
export const ROLE_PERMISSIONS: Record<Role, Permission> = {
  STUDENT: {
    // Project Management - Full access
    canCreateProject: true,
    canEditOwnProject: true,
    canDeleteOwnProject: true,
    canViewAllProjects: true,
    canViewPublicProjects: true,
    canViewInstitutionProjects: true,
    
    // Collaboration - Full access
    canCollaborate: true,
    canInviteCollaborators: true,
    canCommentOnProjects: true,
    canSuggestOnProjects: true,
    canStarProjects: true,
    
    // Faculty/Assignment Features
    canAssignToFaculty: true,
    canReceiveAssignments: false,
    canGradeProjects: false,
    canProvideFeedback: false,
    canViewAssignedProjects: false,
    
    // Admin Features - No access
    canManageUsers: false,
    canManageFaculty: false,
    canManageStudents: false,
    canManageCollegeDomains: false,
    canViewAllInstitutionData: false,
    canModifyUserRoles: false,
    canRemoveUsers: false,
    
    // Filtering and Search - Full access
    canFilterByTechStack: true,
    canFilterByDepartment: true,
    canFilterByInstitution: true,
    canAdvancedSearch: true,
  },

  FACULTY: {
    // Project Management - View only
    canCreateProject: false,
    canEditOwnProject: false,
    canDeleteOwnProject: false,
    canViewAllProjects: true,
    canViewPublicProjects: true,
    canViewInstitutionProjects: true,
    
    // Collaboration - Limited (suggestions and comments only)
    canCollaborate: false,
    canInviteCollaborators: false,
    canCommentOnProjects: true,
    canSuggestOnProjects: true,
    canStarProjects: true,
    
    // Faculty/Assignment Features - Full access
    canAssignToFaculty: false,
    canReceiveAssignments: true,
    canGradeProjects: true,
    canProvideFeedback: true,
    canViewAssignedProjects: true,
    
    // Admin Features - No access
    canManageUsers: false,
    canManageFaculty: false,
    canManageStudents: false,
    canManageCollegeDomains: false,
    canViewAllInstitutionData: false,
    canModifyUserRoles: false,
    canRemoveUsers: false,
    
    // Filtering and Search - Full access
    canFilterByTechStack: true,
    canFilterByDepartment: true,
    canFilterByInstitution: true,
    canAdvancedSearch: true,
  },

  ADMIN: {
    // Project Management - View only
    canCreateProject: false,
    canEditOwnProject: false,
    canDeleteOwnProject: false,
    canViewAllProjects: true,
    canViewPublicProjects: true,
    canViewInstitutionProjects: true,
    
    // Collaboration - No access
    canCollaborate: false,
    canInviteCollaborators: false,
    canCommentOnProjects: false,
    canSuggestOnProjects: false,
    canStarProjects: true,
    
    // Faculty/Assignment Features - View only
    canAssignToFaculty: false,
    canReceiveAssignments: false,
    canGradeProjects: false,
    canProvideFeedback: false,
    canViewAssignedProjects: true,
    
    // Admin Features - Full access to their college
    canManageUsers: true,
    canManageFaculty: true,
    canManageStudents: true,
    canManageCollegeDomains: true,
    canViewAllInstitutionData: true,
    canModifyUserRoles: true,
    canRemoveUsers: true,
    
    // Filtering and Search - Full access
    canFilterByTechStack: true,
    canFilterByDepartment: true,
    canFilterByInstitution: true,
    canAdvancedSearch: true,
  },

  GUEST: {
    // Project Management - View public projects only
    canCreateProject: false,
    canEditOwnProject: false,
    canDeleteOwnProject: false,
    canViewAllProjects: false,
    canViewPublicProjects: true,
    canViewInstitutionProjects: false,
    
    // Collaboration - No access
    canCollaborate: false,
    canInviteCollaborators: false,
    canCommentOnProjects: false,
    canSuggestOnProjects: false,
    canStarProjects: false,
    
    // Faculty/Assignment Features - No access
    canAssignToFaculty: false,
    canReceiveAssignments: false,
    canGradeProjects: false,
    canProvideFeedback: false,
    canViewAssignedProjects: false,
    
    // Admin Features - No access
    canManageUsers: false,
    canManageFaculty: false,
    canManageStudents: false,
    canManageCollegeDomains: false,
    canViewAllInstitutionData: false,
    canModifyUserRoles: false,
    canRemoveUsers: false,
    
    // Filtering and Search - Limited access
    canFilterByTechStack: true,
    canFilterByDepartment: false,
    canFilterByInstitution: false,
    canAdvancedSearch: false,
  },
};

/**
 * Get permissions for a specific role
 */
export function getPermissions(role: Role): Permission {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(role: Role, permission: keyof Permission): boolean {
  return getPermissions(role)[permission];
}

/**
 * Check multiple permissions at once
 */
export function hasAllPermissions(role: Role, permissions: (keyof Permission)[]): boolean {
  const userPermissions = getPermissions(role);
  return permissions.every(permission => userPermissions[permission]);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: (keyof Permission)[]): boolean {
  const userPermissions = getPermissions(role);
  return permissions.some(permission => userPermissions[permission]);
}

/**
 * Get readable role name
 */
export function getRoleName(role: Role): string {
  const roleNames = {
    STUDENT: 'Student',
    FACULTY: 'Faculty',
    ADMIN: 'College Admin',
    GUEST: 'Guest User'
  };
  return roleNames[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: Role): string {
  const descriptions = {
    STUDENT: 'Full access to create, collaborate, and manage projects. Can assign projects to faculty.',
    FACULTY: 'Can view all projects, provide feedback, grade assignments, and give collaboration suggestions.',
    ADMIN: 'Can manage faculty and students within their college. View all institutional data.',
    GUEST: 'Can only view public projects. No collaboration or creation features.'
  };
  return descriptions[role];
}