import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { apiResponse, logAction } from "./_helpers";

const roleSchema = z.object({
  name: z.string().min(1, "اسم الدور مطلوب").max(50),
  description: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
  adminId: z.string().min(1, "Admin ID is required"),
});

const roleUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
  adminId: z.string().min(1, "Admin ID is required"),
});

const roleDeleteSchema = z.object({
  adminId: z.string().min(1, "Admin ID is required"),
});

export function registerRoleRoutes(app: Express) {
  app.get("/api/admin/roles", async (req: Request, res: Response) => {
    try {
      const roles = await storage.getAllRoles();
      const rolesWithCount = await Promise.all(
        roles.map(async (role) => {
          const userIds = await storage.getUsersByRoleId(role.id);
          return {
            ...role,
            usersCount: userIds.length,
          };
        }),
      );
      res.json(rolesWithCount);
    } catch (error) {
      res.json([]);
    }
  });

  app.post("/api/admin/roles", async (req: Request, res: Response) => {
    try {
      const { name, description, status, adminId } = req.body;

      const validation = roleSchema.safeParse({
        name,
        description,
        status,
        adminId,
      });
      if (!validation.success) {
        return res.json(
          apiResponse(
            false,
            null,
            validation.error.errors[0]?.message || "Validation failed",
          ),
        );
      }

      const admin = await storage.getUser(adminId);
      if (!admin || admin.role !== "system_admin") {
        return res.json(apiResponse(false, null, "غير مصرح لك بإنشاء الأدوار"));
      }

      const role = await storage.createRole({
        name,
        description: description || null,
        isSystem: false,
        status: status || "active",
      });

      await logAction(adminId, "Role Created", "roles", role.id, null, {
        name,
      });

      res.json(apiResponse(true, role));
    } catch (error) {
      res.json(apiResponse(false, null, "فشل في إنشاء الدور"));
    }
  });

  app.patch("/api/admin/roles/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const validation = roleUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(
            false,
            null,
            validation.error.errors[0]?.message || "Validation failed",
          ),
        );
      }

      const { name, description, status, adminId } = validation.data;

      const admin = await storage.getUser(adminId);
      if (!admin || admin.role !== "system_admin") {
        return res.json(apiResponse(false, null, "غير مصرح لك بتعديل الأدوار"));
      }

      const role = await storage.getRole(id);
      if (!role) {
        return res.json(apiResponse(false, null, "الدور غير موجود"));
      }

      if (role.isSystem) {
        return res.json(apiResponse(false, null, "لا يمكن تعديل أدوار النظام"));
      }

      const updated = await storage.updateRole(id, {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      });

      await logAction(
        adminId,
        "Role Updated",
        "roles",
        id,
        { name: role.name },
        { name: updated?.name },
      );

      res.json(apiResponse(true, updated));
    } catch (error) {
      res.json(apiResponse(false, null, "فشل في تحديث الدور"));
    }
  });

  app.delete("/api/admin/roles/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const validation = roleDeleteSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(
            false,
            null,
            validation.error.errors[0]?.message || "Validation failed",
          ),
        );
      }

      const { adminId } = validation.data;

      const admin = await storage.getUser(adminId);
      if (!admin || admin.role !== "system_admin") {
        return res.json(apiResponse(false, null, "غير مصرح لك بحذف الأدوار"));
      }

      const role = await storage.getRole(id);
      if (!role) {
        return res.json(apiResponse(false, null, "الدور غير موجود"));
      }

      if (role.isSystem) {
        return res.json(apiResponse(false, null, "لا يمكن حذف أدوار النظام"));
      }

      await storage.deleteRole(id);

      await logAction(
        adminId,
        "Role Deleted",
        "roles",
        id,
        { name: role.name },
        null,
      );

      res.json(apiResponse(true, { message: "تم حذف الدور بنجاح" }));
    } catch (error) {
      res.json(apiResponse(false, null, "فشل في حذف الدور"));
    }
  });

  app.get("/api/admin/roles/:id/users", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const role = await storage.getRole(id);
      if (!role) {
        return res.json(apiResponse(false, null, "Role not found"));
      }

      const userRoles = await storage.getUsersByRoleId(id);
      res.json(apiResponse(true, userRoles));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to get role users"));
    }
  });

  app.post(
    "/api/admin/roles/:id/users",
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { userIds, adminId } = req.body;

        if (!Array.isArray(userIds)) {
          return res.json(apiResponse(false, null, "userIds must be an array"));
        }

        const role = await storage.getRole(id);
        if (!role) {
          return res.json(apiResponse(false, null, "Role not found"));
        }

        await storage.removeAllUsersFromRole(id);

        for (const userId of userIds) {
          await storage.assignUserRole({
            userId,
            roleId: id,
            assignedBy: adminId || null,
          });
        }

        await logAction(
          adminId || "admin",
          "Users Assigned to Role",
          "user_roles",
          id,
          null,
          {
            roleId: id,
            userCount: userIds.length,
          },
        );

        res.json(apiResponse(true, { assignedCount: userIds.length }));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to assign users to role"));
      }
    },
  );
}
