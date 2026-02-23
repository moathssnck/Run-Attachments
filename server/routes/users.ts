import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { apiResponse, hashPassword, logAction } from "./_helpers";

export function registerUserRoutes(app: Express) {
  app.get(
    "/api/admin/users",
    async (req: Request, res: Response) => {
      try {
        const users = await storage.getAllUsers();
        res.json(users.map((u) => ({ ...u, passwordHash: undefined })));
      } catch (error) {
        res.json([]);
      }
    },
  );

  const adminCreateUserSchema = z.object({
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    firstName: z.string().min(1, "الاسم الأول مطلوب"),
    lastName: z.string().min(1, "الاسم الأخير مطلوب"),
    mobile: z.string().min(1, "رقم الجوال مطلوب"),
    role: z
      .enum(["end_user", "admin", "finance_admin", "system_admin", "auditor"])
      .default("end_user"),
    status: z
      .enum(["active", "pending", "suspended", "locked"])
      .default("active"),
    adminId: z.string().min(1, "Admin ID is required"),
  });

  app.post("/api/admin/users", async (req: Request, res: Response) => {
    try {
      const validation = adminCreateUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(
            false,
            null,
            validation.error.errors[0]?.message || "Validation failed",
          ),
        );
      }

      const {
        email,
        password,
        firstName,
        lastName,
        mobile,
        role,
        status,
        adminId,
      } = validation.data;

      const admin = await storage.getUser(adminId);
      if (!admin || (admin.role !== "system_admin" && admin.role !== "admin")) {
        return res.json(
          apiResponse(false, null, "غير مصرح لك بإنشاء المستخدمين"),
        );
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.json(
          apiResponse(false, null, "البريد الإلكتروني مستخدم بالفعل"),
        );
      }

      const user = await storage.createUser({
        email,
        passwordHash: Buffer.from(password).toString("base64"),
        firstName,
        lastName,
        mobile,
        role,
        status,
        mfaEnabled: false,
      });

      await logAction(adminId, "User Created", "users", user.id, null, {
        email,
        role,
      });

      res.json(apiResponse(true, { ...user, passwordHash: undefined }));
    } catch (error) {
      res.json(apiResponse(false, null, "فشل في إنشاء المستخدم"));
    }
  });

  app.patch("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const oldUser = await storage.getUser(id);

      if (!oldUser) {
        return res.json(apiResponse(false, null, "User not found"));
      }

      const updated = await storage.updateUser(id, req.body);

      if (updated) {
        await logAction(
          "admin",
          "User Updated",
          "users",
          id,
          { status: oldUser.status, role: oldUser.role },
          { status: updated.status, role: updated.role },
        );
      }

      res.json(apiResponse(true, { ...updated, passwordHash: undefined }));
    } catch (error) {
      res.json(apiResponse(false, null, "Update failed"));
    }
  });

  app.patch("/api/users/:id/profile", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const sessionUser = (req as any).session?.user;

      if (!sessionUser || sessionUser.id !== id) {
        return res.json(apiResponse(false, null, "Unauthorized"));
      }

      const oldUser = await storage.getUser(id);
      if (!oldUser) {
        return res.json(apiResponse(false, null, "User not found"));
      }

      const safeFields = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        mobile: req.body.mobile,
        dateOfBirth: req.body.dateOfBirth,
        nationalId: req.body.nationalId,
        gender: req.body.gender,
        address: req.body.address,
        city: req.body.city,
        country: req.body.country,
        postalCode: req.body.postalCode,
        region: req.body.region,
        street: req.body.street,
        secondaryPhone: req.body.secondaryPhone,
        workEmail: req.body.workEmail,
        emergencyContact: req.body.emergencyContact,
        emergencyPhone: req.body.emergencyPhone,
        profilePhoto: req.body.profilePhoto,
      };

      const updated = await storage.updateUser(id, safeFields);

      if (updated) {
        await logAction(id, "Profile Updated", "users", id, null, null);
      }

      res.json(apiResponse(true, { ...updated, passwordHash: undefined }));
    } catch (error) {
      res.json(apiResponse(false, null, "Update failed"));
    }
  });
}
