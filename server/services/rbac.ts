import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { logSecurityEvent } from './security';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define user roles with hierarchy
export enum UserRole {
  GUEST = 'guest',
  VIEWER = 'viewer',
  USER = 'user',
  ACCOUNTANT = 'accountant',
  MANAGER = 'manager',
  ADMIN = 'admin',
  OWNER = 'owner',
  SYSTEM = 'system'
}

// Role hierarchy - higher roles inherit permissions from lower roles
export const roleHierarchy: Record<UserRole, UserRole[]> = {
  [UserRole.GUEST]: [],
  [UserRole.VIEWER]: [UserRole.GUEST],
  [UserRole.USER]: [UserRole.VIEWER],
  [UserRole.ACCOUNTANT]: [UserRole.USER],
  [UserRole.MANAGER]: [UserRole.ACCOUNTANT],
  [UserRole.ADMIN]: [UserRole.MANAGER],
  [UserRole.OWNER]: [UserRole.ADMIN],
  [UserRole.SYSTEM]: [UserRole.OWNER]
};

// Define permission types
export enum PermissionScope {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  APPROVE = 'approve',
  EXPORT = 'export',
  IMPORT = 'import',
  ADMIN = 'admin'
}

// Define resources that can have permissions
export enum Resource {
  DASHBOARD = 'dashboard',
  INVOICES = 'invoices',
  EXPENSES = 'expenses',
  CLIENTS = 'clients',
  EMPLOYEES = 'employees',
  INVENTORY = 'inventory',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  USERS = 'users',
  BANKING = 'banking',
  TAXES = 'taxes',
  PAYROLL = 'payroll',
  SUBSCRIPTIONS = 'subscriptions',
  BILLING = 'billing',
  AUDIT_LOGS = 'audit_logs',
  BACKUP = 'backup'
}

// Structure for a permission
export interface Permission {
  resource: Resource;
  scope: PermissionScope;
}

// Define role permissions
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.GUEST]: [
    { resource: Resource.DASHBOARD, scope: PermissionScope.VIEW },
  ],
  [UserRole.VIEWER]: [
    { resource: Resource.INVOICES, scope: PermissionScope.VIEW },
    { resource: Resource.EXPENSES, scope: PermissionScope.VIEW },
    { resource: Resource.CLIENTS, scope: PermissionScope.VIEW },
    { resource: Resource.REPORTS, scope: PermissionScope.VIEW },
  ],
  [UserRole.USER]: [
    { resource: Resource.INVOICES, scope: PermissionScope.CREATE },
    { resource: Resource.EXPENSES, scope: PermissionScope.CREATE },
    { resource: Resource.CLIENTS, scope: PermissionScope.CREATE },
    { resource: Resource.INVENTORY, scope: PermissionScope.VIEW },
  ],
  [UserRole.ACCOUNTANT]: [
    { resource: Resource.INVOICES, scope: PermissionScope.EDIT },
    { resource: Resource.INVOICES, scope: PermissionScope.APPROVE },
    { resource: Resource.EXPENSES, scope: PermissionScope.EDIT },
    { resource: Resource.EXPENSES, scope: PermissionScope.APPROVE },
    { resource: Resource.BANKING, scope: PermissionScope.VIEW },
    { resource: Resource.BANKING, scope: PermissionScope.EDIT },
    { resource: Resource.TAXES, scope: PermissionScope.VIEW },
    { resource: Resource.REPORTS, scope: PermissionScope.EXPORT },
  ],
  [UserRole.MANAGER]: [
    { resource: Resource.INVOICES, scope: PermissionScope.DELETE },
    { resource: Resource.EXPENSES, scope: PermissionScope.DELETE },
    { resource: Resource.CLIENTS, scope: PermissionScope.EDIT },
    { resource: Resource.CLIENTS, scope: PermissionScope.DELETE },
    { resource: Resource.EMPLOYEES, scope: PermissionScope.VIEW },
    { resource: Resource.EMPLOYEES, scope: PermissionScope.CREATE },
    { resource: Resource.EMPLOYEES, scope: PermissionScope.EDIT },
    { resource: Resource.INVENTORY, scope: PermissionScope.EDIT },
    { resource: Resource.PAYROLL, scope: PermissionScope.VIEW },
    { resource: Resource.SETTINGS, scope: PermissionScope.VIEW },
  ],
  [UserRole.ADMIN]: [
    { resource: Resource.USERS, scope: PermissionScope.VIEW },
    { resource: Resource.USERS, scope: PermissionScope.CREATE },
    { resource: Resource.USERS, scope: PermissionScope.EDIT },
    { resource: Resource.EMPLOYEES, scope: PermissionScope.DELETE },
    { resource: Resource.SETTINGS, scope: PermissionScope.EDIT },
    { resource: Resource.AUDIT_LOGS, scope: PermissionScope.VIEW },
    { resource: Resource.BACKUP, scope: PermissionScope.VIEW },
    { resource: Resource.SUBSCRIPTIONS, scope: PermissionScope.VIEW },
    { resource: Resource.BILLING, scope: PermissionScope.VIEW },
  ],
  [UserRole.OWNER]: [
    { resource: Resource.USERS, scope: PermissionScope.DELETE },
    { resource: Resource.SETTINGS, scope: PermissionScope.ADMIN },
    { resource: Resource.BACKUP, scope: PermissionScope.ADMIN },
    { resource: Resource.SUBSCRIPTIONS, scope: PermissionScope.ADMIN },
    { resource: Resource.BILLING, scope: PermissionScope.ADMIN },
  ],
  [UserRole.SYSTEM]: [
    // System has all permissions
  ]
};

// Helper function to get all permissions for a role, including inherited permissions
export function getAllPermissionsForRole(role: UserRole): Permission[] {
  // Get direct permissions for this role
  const directPermissions = rolePermissions[role] || [];
  
  // Get all inherited roles
  const inheritedRoles = getInheritedRoles(role);
  
  // Get permissions from inherited roles
  const inheritedPermissions = inheritedRoles.flatMap(
    inheritedRole => rolePermissions[inheritedRole] || []
  );
  
  // Combine and deduplicate permissions
  return [...directPermissions, ...inheritedPermissions].filter(
    (permission, index, self) => 
      index === self.findIndex(p => 
        p.resource === permission.resource && p.scope === permission.scope
      )
  );
}

// Get all roles that a role inherits from
function getInheritedRoles(role: UserRole): UserRole[] {
  const directInherits = roleHierarchy[role] || [];
  const indirectInherits = directInherits.flatMap(inheritedRole => 
    getInheritedRoles(inheritedRole)
  );
  
  // Combine and deduplicate roles
  return [...directInherits, ...indirectInherits].filter(
    (r, index, self) => self.indexOf(r) === index
  );
}

// Check if a user has permission for a specific action
export function hasPermission(
  userRole: UserRole, 
  resource: Resource, 
  scope: PermissionScope
): boolean {
  // System role has all permissions
  if (userRole === UserRole.SYSTEM) {
    return true;
  }
  
  // Get all permissions for the user's role
  const permissions = getAllPermissionsForRole(userRole);
  
  // Check if the specific permission exists
  return permissions.some(
    p => p.resource === resource && p.scope === scope
  );
}

// Express middleware to check permissions
export function requirePermission(resource: Resource, scope: PermissionScope) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userRole = req.user.role || UserRole.USER;
    
    if (hasPermission(userRole, resource, scope)) {
      // Log access for sensitive resources
      if (
        resource === Resource.USERS || 
        resource === Resource.SETTINGS || 
        resource === Resource.AUDIT_LOGS || 
        resource === Resource.BACKUP ||
        scope === PermissionScope.DELETE ||
        scope === PermissionScope.ADMIN
      ) {
        logSecurityEvent({
          type: 'data_access',
          userId: req.user.id,
          ip: req.ip,
          details: { resource, scope, action: 'access_granted' }
        });
      }
      
      return next();
    }
    
    // Log access denied
    logSecurityEvent({
      type: 'data_access',
      userId: req.user.id,
      ip: req.ip,
      details: { resource, scope, action: 'access_denied' }
    });
    
    return res.status(403).json({ 
      message: 'Forbidden: Insufficient permissions'
    });
  };
}

// Export common middleware combinations
export const permissions = {
  viewDashboard: requirePermission(Resource.DASHBOARD, PermissionScope.VIEW),
  viewInvoices: requirePermission(Resource.INVOICES, PermissionScope.VIEW),
  createInvoices: requirePermission(Resource.INVOICES, PermissionScope.CREATE),
  editInvoices: requirePermission(Resource.INVOICES, PermissionScope.EDIT),
  deleteInvoices: requirePermission(Resource.INVOICES, PermissionScope.DELETE),
  approveInvoices: requirePermission(Resource.INVOICES, PermissionScope.APPROVE),
  
  viewExpenses: requirePermission(Resource.EXPENSES, PermissionScope.VIEW),
  createExpenses: requirePermission(Resource.EXPENSES, PermissionScope.CREATE),
  editExpenses: requirePermission(Resource.EXPENSES, PermissionScope.EDIT),
  deleteExpenses: requirePermission(Resource.EXPENSES, PermissionScope.DELETE),
  approveExpenses: requirePermission(Resource.EXPENSES, PermissionScope.APPROVE),
  
  viewBanking: requirePermission(Resource.BANKING, PermissionScope.VIEW),
  editBanking: requirePermission(Resource.BANKING, PermissionScope.EDIT),
  
  viewReports: requirePermission(Resource.REPORTS, PermissionScope.VIEW),
  exportReports: requirePermission(Resource.REPORTS, PermissionScope.EXPORT),
  
  viewUsers: requirePermission(Resource.USERS, PermissionScope.VIEW),
  createUsers: requirePermission(Resource.USERS, PermissionScope.CREATE),
  editUsers: requirePermission(Resource.USERS, PermissionScope.EDIT),
  deleteUsers: requirePermission(Resource.USERS, PermissionScope.DELETE),
  
  viewSettings: requirePermission(Resource.SETTINGS, PermissionScope.VIEW),
  editSettings: requirePermission(Resource.SETTINGS, PermissionScope.EDIT),
  adminSettings: requirePermission(Resource.SETTINGS, PermissionScope.ADMIN),
  
  viewBackup: requirePermission(Resource.BACKUP, PermissionScope.VIEW),
  adminBackup: requirePermission(Resource.BACKUP, PermissionScope.ADMIN),
};

// Middleware to restrict access to admin-only routes
export function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userRole = req.user.role || UserRole.USER;
  
  if (userRole === UserRole.ADMIN || userRole === UserRole.OWNER || userRole === UserRole.SYSTEM) {
    return next();
  }
  
  // Log access denied
  logSecurityEvent({
    type: 'data_access',
    userId: req.user.id,
    ip: req.ip,
    details: { resource: 'admin', action: 'access_denied' }
  });
  
  return res.status(403).json({ 
    message: 'Forbidden: Admin access required'
  });
}

// Middleware to restrict access to owner-only routes
export function requireOwner(req: any, res: any, next: any) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userRole = req.user.role || UserRole.USER;
  
  if (userRole === UserRole.OWNER || userRole === UserRole.SYSTEM) {
    return next();
  }
  
  // Log access denied
  logSecurityEvent({
    type: 'data_access',
    userId: req.user.id,
    ip: req.ip,
    details: { resource: 'owner', action: 'access_denied' }
  });
  
  return res.status(403).json({ 
    message: 'Forbidden: Owner access required'
  });
}