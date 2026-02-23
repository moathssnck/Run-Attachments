import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { apiResponse, logAction } from "./_helpers";

const assignSingleSchema = z.object({
  userId: z.union([z.string(), z.number()]).transform(String),
  roleId: z.union([z.string(), z.number()]).transform(String),
  assignedByUserId: z.union([z.string(), z.number()]).transform(String).optional(),
});

const assignRolesToUserSchema = z.object({
  userId: z.union([z.string(), z.number()]).transform(String),
  roleIds: z.array(z.union([z.string(), z.number()]).transform(String)),
});

const assignRoleToUsersSchema = z.object({
  roleId: z.union([z.string(), z.number()]).transform(String),
  userIds: z.array(z.union([z.string(), z.number()]).transform(String)),
});

const bulkAssignSchema = z.object({
  assignments: z.array(
    z.object({
      userId: z.union([z.string(), z.number()]).transform(String),
      roleId: z.union([z.string(), z.number()]).transform(String),
    })
  ),
});

const suspendUserSchema = z.object({
  userId: z.union([z.string(), z.number()]).transform(String),
  isActive: z.boolean(),
});

export function registerUserRoleRoutes(app: Express) {
  app.get("/api/UserRoles", async (req: Request, res: Response) => {
    try {
      const pageNumber = parseInt(req.query.pageNumber as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const allAssignments = await storage.getAllUserRoleAssignments();

      const total = allAssignments.length;
      const start = (pageNumber - 1) * pageSize;
      const paged = allAssignments.slice(start, start + pageSize);

      const enriched = await Promise.all(
        paged.map(async (ur) => {
          const user = await storage.getUser(ur.userId);
          const role = await storage.getRole(ur.roleId);
          return {
            id: ur.id,
            userId: ur.userId,
            roleId: ur.roleId,
            assignedAt: ur.assignedAt,
            assignedBy: ur.assignedBy,
            userName: user ? `${user.firstName} ${user.lastName}` : null,
            userEmail: user?.email || null,
            roleName: role?.name || null,
          };
        })
      );

      res.json(
        apiResponse(true, {
          items: enriched,
          totalCount: total,
          pageNumber,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        })
      );
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to get user roles"));
    }
  });

  app.post("/api/UserRoles", async (req: Request, res: Response) => {
    try {
      const validation = assignSingleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(false, null, validation.error.errors[0]?.message || "Validation failed")
        );
      }

      const { userId, roleId, assignedByUserId } = validation.data;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.json(apiResponse(false, null, "User not found"));
      }

      const role = await storage.getRole(roleId);
      if (!role) {
        return res.json(apiResponse(false, null, "Role not found"));
      }

      const assignment = await storage.assignUserRole({
        userId,
        roleId,
        assignedBy: assignedByUserId || null,
      });

      await logAction(
        assignedByUserId || "system",
        "User Role Assigned",
        "user_roles",
        assignment.id,
        null,
        { userId, roleId, roleName: role.name }
      );

      res.json(apiResponse(true, assignment));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to assign user role"));
    }
  });

  app.delete("/api/UserRoles/:userId/:roleId", async (req: Request, res: Response) => {
    try {
      const { userId, roleId } = req.params;

      const hasRole = await storage.checkUserHasRole(userId, roleId);
      if (!hasRole) {
        return res.json(apiResponse(false, null, "User does not have this role"));
      }

      await storage.removeUserRole(userId, roleId);

      await logAction(
        "system",
        "User Role Removed",
        "user_roles",
        `${userId}-${roleId}`,
        { userId, roleId },
        null
      );

      res.json(apiResponse(true, { message: "User role deleted successfully" }));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to delete user role"));
    }
  });

  app.get("/api/UserRoles/user/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.json(apiResponse(false, null, "User not found"));
      }

      const userRoles = await storage.getUserRoles(userId);

      const enriched = await Promise.all(
        userRoles.map(async (ur) => {
          const role = await storage.getRole(ur.roleId);
          return {
            ...ur,
            roleName: role?.name || null,
            roleDescription: role?.description || null,
            roleStatus: role?.status || null,
          };
        })
      );

      res.json(apiResponse(true, enriched));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to get user roles"));
    }
  });

  app.get("/api/UserRoles/role/:roleId", async (req: Request, res: Response) => {
    try {
      const { roleId } = req.params;

      const role = await storage.getRole(roleId);
      if (!role) {
        return res.json(apiResponse(false, null, "Role not found"));
      }

      const userIds = await storage.getUsersByRoleId(roleId);

      const users = await Promise.all(
        userIds.map(async (uid) => {
          const user = await storage.getUser(uid);
          if (!user) return null;
          return {
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            status: user.status,
          };
        })
      );

      res.json(apiResponse(true, users.filter(Boolean)));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to get users by role"));
    }
  });

  app.get("/api/UserRoles/check/:userId/:roleId", async (req: Request, res: Response) => {
    try {
      const { userId, roleId } = req.params;

      const hasRole = await storage.checkUserHasRole(userId, roleId);

      res.json(apiResponse(true, { hasRole }));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to check user role"));
    }
  });

  app.post("/api/UserRoles/assign-roles-to-user", async (req: Request, res: Response) => {
    try {
      const validation = assignRolesToUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(false, null, validation.error.errors[0]?.message || "Validation failed")
        );
      }

      const { userId, roleIds } = validation.data;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.json(apiResponse(false, null, "User not found"));
      }

      await storage.removeAllRolesFromUser(userId);

      const assigned: any[] = [];
      for (const roleId of roleIds) {
        const role = await storage.getRole(roleId);
        if (role) {
          const assignment = await storage.assignUserRole({
            userId,
            roleId,
            assignedBy: null,
          });
          assigned.push({ ...assignment, roleName: role.name });
        }
      }

      await logAction(
        "system",
        "Roles Assigned to User",
        "user_roles",
        userId,
        null,
        { roleIds, assignedCount: assigned.length }
      );

      res.json(apiResponse(true, { assignedCount: assigned.length, assignments: assigned }));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to assign roles to user"));
    }
  });

  app.post("/api/UserRoles/assign-role-to-users", async (req: Request, res: Response) => {
    try {
      const validation = assignRoleToUsersSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(false, null, validation.error.errors[0]?.message || "Validation failed")
        );
      }

      const { roleId, userIds } = validation.data;

      const role = await storage.getRole(roleId);
      if (!role) {
        return res.json(apiResponse(false, null, "Role not found"));
      }

      const assigned: any[] = [];
      for (const userId of userIds) {
        const user = await storage.getUser(userId);
        if (user) {
          const assignment = await storage.assignUserRole({
            userId,
            roleId,
            assignedBy: null,
          });
          assigned.push(assignment);
        }
      }

      await logAction(
        "system",
        "Role Assigned to Users",
        "user_roles",
        roleId,
        null,
        { roleId, userCount: assigned.length }
      );

      res.json(apiResponse(true, { assignedCount: assigned.length, assignments: assigned }));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to assign role to users"));
    }
  });

  app.post("/api/UserRoles/bulk-assign", async (req: Request, res: Response) => {
    try {
      const validation = bulkAssignSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(false, null, validation.error.errors[0]?.message || "Validation failed")
        );
      }

      const { assignments } = validation.data;
      const results: any[] = [];

      for (const { userId, roleId } of assignments) {
        const user = await storage.getUser(userId);
        const role = await storage.getRole(roleId);

        if (user && role) {
          const assignment = await storage.assignUserRole({
            userId,
            roleId,
            assignedBy: null,
          });
          results.push(assignment);
        }
      }

      await logAction(
        "system",
        "Bulk Role Assignment",
        "user_roles",
        "bulk",
        null,
        { totalRequested: assignments.length, totalAssigned: results.length }
      );

      res.json(
        apiResponse(true, {
          totalRequested: assignments.length,
          totalAssigned: results.length,
          assignments: results,
        })
      );
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to bulk assign roles"));
    }
  });

  app.post("/api/UserRoles/suspend-user", async (req: Request, res: Response) => {
    try {
      const validation = suspendUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(false, null, validation.error.errors[0]?.message || "Validation failed")
        );
      }

      const { userId, isActive } = validation.data;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.json(apiResponse(false, null, "User not found"));
      }

      const newStatus = isActive ? "active" : "suspended";
      const updated = await storage.updateUser(userId, { status: newStatus });

      await logAction(
        "system",
        isActive ? "User Activated" : "User Suspended",
        "users",
        userId,
        { status: user.status },
        { status: newStatus }
      );

      res.json(
        apiResponse(true, {
          userId: updated?.id,
          status: updated?.status,
          message: isActive ? "User activated successfully" : "User suspended successfully",
        })
      );
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to update user status"));
    }
  });
}
