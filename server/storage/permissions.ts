import type { Permission } from "./types";

export function getAllPermissions(permissions: Map<string, Permission>): Permission[] {
  return Array.from(permissions.values());
}

export function createPermission(permissions: Map<string, Permission>, permission: any): Permission {
  const newPerm: Permission = {
    id: permission.id,
    code: permission.code,
    name: permission.name,
    nameEn: permission.nameEn || null,
    nameAr: permission.nameAr || null,
    descriptionEn: permission.descriptionEn || null,
    descriptionAr: permission.descriptionAr || null,
    module: permission.module,
    action: permission.action,
    parentId: permission.parentId || null,
  };
  permissions.set(permission.id, newPerm);
  return newPerm;
}

export function clearAllPermissions(permissions: Map<string, Permission>): void {
  permissions.clear();
}
