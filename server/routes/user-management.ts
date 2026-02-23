import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { apiResponse } from "./_helpers";

export function registerUserManagementRoutes(app: Express) {
  app.get("/api/UserManagement/get-all-users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const sanitized = users.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        mobile: u.mobile,
        phoneCode: u.phoneCode,
        status: u.status,
        role: u.role,
        gender: u.gender,
        dateOfBirth: u.dateOfBirth,
        country: u.country,
        city: u.city,
        address: u.address,
        region: u.region,
        nationalId: u.nationalId,
        profilePhoto: u.profilePhoto,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
      }));
      res.json(apiResponse(true, sanitized));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to get users"));
    }
  });

  app.get("/api/UserManagement/get-user-info", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.json(apiResponse(false, null, "userId is required"));
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.json(apiResponse(false, null, "User not found"));
      }

      const userRoles = await storage.getUserRoles(userId);
      const roles = await Promise.all(
        userRoles.map(async (ur) => {
          const role = await storage.getRole(ur.roleId);
          return {
            roleId: ur.roleId,
            roleName: role?.name || null,
            assignedAt: ur.assignedAt,
          };
        })
      );

      const wallet = await storage.getWallet(userId);

      res.json(
        apiResponse(true, {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          mobile: user.mobile,
          phoneCode: user.phoneCode,
          status: user.status,
          role: user.role,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          country: user.country,
          city: user.city,
          address: user.address,
          region: user.region,
          nationalId: user.nationalId,
          profilePhoto: user.profilePhoto,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          mfaEnabled: user.mfaEnabled,
          roles,
          walletBalance: wallet?.balance || "0.00",
        })
      );
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to get user info"));
    }
  });
}
