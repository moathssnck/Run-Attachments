import { randomUUID } from "crypto";
import type {
  Role,
  InsertRole,
  UserRoleAssignment,
  InsertUserRole,
  RolePermission,
  InsertRolePermission,
} from "./types";

export function getAllRoles(roles: Map<string, Role>): Role[] {
  return Array.from(roles.values());
}

export function getRole(roles: Map<string, Role>, id: string): Role | undefined {
  return roles.get(id);
}

export function createRole(roles: Map<string, Role>, insertRole: InsertRole): Role {
  const id = randomUUID();
  const role: Role = {
    id,
    name: insertRole.name,
    description: insertRole.description ?? null,
    isSystem: insertRole.isSystem ?? false,
    status: insertRole.status || "active",
  };
  roles.set(id, role);
  return role;
}

export function updateRole(roles: Map<string, Role>, id: string, data: Partial<Role>): Role | undefined {
  const role = roles.get(id);
  if (!role) return undefined;
  const updated = { ...role, ...data };
  roles.set(id, updated);
  return updated;
}

export function deleteRole(roles: Map<string, Role>, id: string): void {
  roles.delete(id);
}

export function getUserRoles(userRolesMap: Map<string, UserRoleAssignment>, userId: string): UserRoleAssignment[] {
  return Array.from(userRolesMap.values()).filter(
    (ur) => ur.userId === userId
  );
}

export function getAllUserRoleAssignments(userRolesMap: Map<string, UserRoleAssignment>): UserRoleAssignment[] {
  return Array.from(userRolesMap.values());
}

export function assignUserRole(
  userRolesMap: Map<string, UserRoleAssignment>,
  assignment: InsertUserRole
): UserRoleAssignment {
  const existing = Array.from(userRolesMap.values()).find(
    (ur) => ur.userId === assignment.userId && ur.roleId === assignment.roleId
  );
  if (existing) {
    return existing;
  }

  const id = randomUUID();
  const userRole: UserRoleAssignment = {
    id,
    userId: assignment.userId,
    roleId: assignment.roleId,
    assignedAt: new Date(),
    assignedBy: assignment.assignedBy ?? null,
  };
  userRolesMap.set(id, userRole);
  return userRole;
}

export function removeUserRole(userRolesMap: Map<string, UserRoleAssignment>, userId: string, roleId: string): void {
  const entries = Array.from(userRolesMap.entries());
  for (const [key, ur] of entries) {
    if (ur.userId === userId && ur.roleId === roleId) {
      userRolesMap.delete(key);
      break;
    }
  }
}

export function checkUserHasRole(userRolesMap: Map<string, UserRoleAssignment>, userId: string, roleId: string): boolean {
  return Array.from(userRolesMap.values()).some(
    (ur) => ur.userId === userId && ur.roleId === roleId
  );
}

export function getUsersByRoleId(userRolesMap: Map<string, UserRoleAssignment>, roleId: string): string[] {
  return Array.from(userRolesMap.values())
    .filter((ur) => ur.roleId === roleId)
    .map((ur) => ur.userId);
}

export function removeAllUsersFromRole(userRolesMap: Map<string, UserRoleAssignment>, roleId: string): void {
  const entries = Array.from(userRolesMap.entries());
  for (const [key, ur] of entries) {
    if (ur.roleId === roleId) {
      userRolesMap.delete(key);
    }
  }
}

export function removeAllRolesFromUser(userRolesMap: Map<string, UserRoleAssignment>, userId: string): void {
  const entries = Array.from(userRolesMap.entries());
  for (const [key, ur] of entries) {
    if (ur.userId === userId) {
      userRolesMap.delete(key);
    }
  }
}

export function getRolePermissions(rolePermissionsMap: Map<string, RolePermission>, roleId: string): RolePermission[] {
  return Array.from(rolePermissionsMap.values()).filter(
    (rp) => rp.roleId === roleId
  );
}

export function assignRolePermission(
  rolePermissionsMap: Map<string, RolePermission>,
  assignment: InsertRolePermission
): RolePermission {
  const id = randomUUID();
  const rolePermission: RolePermission = {
    id,
    roleId: assignment.roleId,
    permissionId: assignment.permissionId,
    createdAt: new Date(),
  };
  rolePermissionsMap.set(id, rolePermission);
  return rolePermission;
}

export function removeRolePermission(
  rolePermissionsMap: Map<string, RolePermission>,
  roleId: string,
  permissionId: string
): void {
  const entries = Array.from(rolePermissionsMap.entries());
  for (const [key, rp] of entries) {
    if (rp.roleId === roleId && rp.permissionId === permissionId) {
      rolePermissionsMap.delete(key);
      break;
    }
  }
}

export function getAllRolePermissions(rolePermissionsMap: Map<string, RolePermission>): RolePermission[] {
  return Array.from(rolePermissionsMap.values());
}
