import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { registrationSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import {
  apiResponse,
  verifyRecaptcha,
  hashPassword,
  verifyPassword,
  logAction,
  generateToken,
  generateRefreshToken,
  phoneCodeMap,
  countryMap,
  resetTokens,
  refreshTokens,
} from "./_helpers";

export function registerAuthRoutes(app: Express) {
  app.post(
    "/api/Auth/register",
    async (req: Request, res: Response) => {
      try {
        const { recaptchaToken, ...formData } = req.body;

        const recaptchaResult = await verifyRecaptcha(recaptchaToken || "");
        if (!recaptchaResult.success) {
          return res.json(
            apiResponse(
              false,
              null,
              "فشل التحقق من reCAPTCHA. يرجى المحاولة مرة أخرى.",
            ),
          );
        }

        const data = registrationSchema.parse(formData);

        const existingEmail = await storage.getUserByEmail(data.email);
        if (existingEmail) {
          return res.json(apiResponse(false, null, "Email already registered"));
        }

        const existingMobile = await storage.getUserByMobile(data.phoneNumber);
        if (existingMobile) {
          return res.json(
            apiResponse(false, null, "Phone number already registered"),
          );
        }

        const phoneCode = phoneCodeMap[data.codePhoneNumberId] || "+962";
        const country = countryMap[data.countryId] || "Jordan";

        const user = await storage.createUser({
          email: data.email,
          passwordHash: hashPassword(data.password),
          firstName: data.firstName,
          lastName: data.lastName,
          mobile: data.phoneNumber,
          phoneCode: phoneCode,
          country: country,
          city: data.city || null,
          address: data.Address || null,
          region: data.area || null,
          passportOrIdNumber: data.documentOrPassportNumber,
          dateOfBirth: data.Birthday ? new Date(data.Birthday) : null,
          gender:
            data.gender !== undefined
              ? data.gender === 1
                ? "male"
                : data.gender === 2
                  ? "female"
                  : null
              : null,
          profilePhoto: data.profileImage || null,
          status: "active",
          role: "end_user",
          mfaEnabled: false,
        });

        await storage.createWallet({
          userId: user.id,
          balance: "0.00",
        });

        await logAction(user.id, "User Registered", "users", user.id, null, {
          email: user.email,
        });

        const token = generateToken();
        const refreshToken = generateRefreshToken();
        refreshTokens.set(refreshToken, {
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        res.json(
          apiResponse(true, {
            user: { ...user, passwordHash: undefined },
            token,
            refreshToken,
          }),
        );
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.json(
            apiResponse(
              false,
              null,
              error.errors[0]?.message || "Validation failed",
            ),
          );
        }
        res.json(apiResponse(false, null, "Registration failed"));
      }
    },
  );

  app.post(
    "/api/Auth/login",
    async (req: Request, res: Response) => {
      try {
        const { recaptchaToken, ...formData } = req.body;

        const recaptchaResult = await verifyRecaptcha(recaptchaToken || "");
        if (!recaptchaResult.success) {
          return res.json(
            apiResponse(
              false,
              null,
              "فشل التحقق من reCAPTCHA. يرجى المحاولة مرة أخرى.",
            ),
          );
        }

        const data = loginSchema.parse(formData);

        let user = await storage.getUserByEmail(data.email);
        if (!user && data.phoneNumber) {
          user = await storage.getUserByMobile(data.phoneNumber);
        }
        if (!user) {
          return res.json(
            apiResponse(false, null, "Invalid email or password"),
          );
        }

        if (user.status === "locked") {
          return res.json(
            apiResponse(
              false,
              null,
              "Account is locked. Please contact support.",
            ),
          );
        }

        if (user.status === "suspended") {
          return res.json(apiResponse(false, null, "Account is suspended."));
        }

        if (!verifyPassword(data.password, user.passwordHash)) {
          const attempts = user.failedLoginAttempts + 1;
          const updateData: any = { failedLoginAttempts: attempts };

          if (attempts >= 3) {
            updateData.status = "locked";
          }

          await storage.updateUser(user.id, updateData);

          if (attempts >= 3) {
            return res.json(
              apiResponse(
                false,
                null,
                "Account locked after 3 failed attempts",
              ),
            );
          }

          return res.json(
            apiResponse(false, null, "Invalid email or password"),
          );
        }

        await storage.updateUser(user.id, {
          failedLoginAttempts: 0,
          lastLogin: new Date(),
        });

        await logAction(user.id, "User Login", "auth", user.id);

        const token = generateToken();
        const refreshToken = generateRefreshToken();
        refreshTokens.set(refreshToken, {
          userId: user.id,
          expiresAt: new Date(
            Date.now() + (data.rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000,
          ),
        });

        res.json(
          apiResponse(true, {
            user: { ...user, passwordHash: undefined },
            token,
            refreshToken,
          }),
        );
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.json(
            apiResponse(
              false,
              null,
              error.errors[0]?.message || "Validation failed",
            ),
          );
        }
        res.json(apiResponse(false, null, "Login failed"));
      }
    },
  );

  app.post("/api/Auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const data = forgotPasswordSchema.parse(req.body);

      let user = await storage.getUserByEmail(data.email);
      if (!user && data.phoneNumber) {
        user = await storage.getUserByMobile(data.phoneNumber);
      }

      if (!user) {
        return res.json(apiResponse(true, null, undefined));
      }

      const resetToken = generateToken();
      resetTokens.set(resetToken, {
        email: user.email,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      console.log(`Password reset token for ${user.email}: ${resetToken}`);

      await logAction(user.id, "Password Reset Requested", "auth", user.id);

      res.json(
        apiResponse(true, {
          message: "If the account exists, a reset link has been sent.",
        }),
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.json(
          apiResponse(
            false,
            null,
            error.errors[0]?.message || "Validation failed",
          ),
        );
      }
      res.json(apiResponse(false, null, "Failed to process request"));
    }
  });

  app.post("/api/Auth/reset-password", async (req: Request, res: Response) => {
    try {
      const data = resetPasswordSchema.parse(req.body);

      const tokenData = resetTokens.get(data.resetToken);
      if (!tokenData || tokenData.expiresAt < new Date()) {
        return res.json(
          apiResponse(false, null, "Invalid or expired reset token"),
        );
      }

      if (tokenData.email !== data.email) {
        return res.json(
          apiResponse(false, null, "Invalid reset token for this email"),
        );
      }

      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.json(apiResponse(false, null, "User not found"));
      }

      await storage.updateUser(user.id, {
        passwordHash: hashPassword(data.newPassword),
        failedLoginAttempts: 0,
        status: user.status === "locked" ? "active" : user.status,
      });

      resetTokens.delete(data.resetToken);

      await logAction(user.id, "Password Reset", "auth", user.id);

      res.json(
        apiResponse(true, { message: "Password has been reset successfully" }),
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.json(
          apiResponse(
            false,
            null,
            error.errors[0]?.message || "Validation failed",
          ),
        );
      }
      res.json(apiResponse(false, null, "Failed to reset password"));
    }
  });

  app.post("/api/Auth/refresh", async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.json(apiResponse(false, null, "Refresh token is required"));
      }

      const tokenData = refreshTokens.get(refreshToken);
      if (!tokenData || tokenData.expiresAt < new Date()) {
        refreshTokens.delete(refreshToken);
        return res.json(
          apiResponse(false, null, "Invalid or expired refresh token"),
        );
      }

      refreshTokens.delete(refreshToken);

      const newToken = generateToken();
      const newRefreshToken = generateRefreshToken();
      refreshTokens.set(newRefreshToken, {
        userId: tokenData.userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      res.json(
        apiResponse(true, { token: newToken, refreshToken: newRefreshToken }),
      );
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to refresh token"));
    }
  });

  app.post("/api/Auth/revoke", async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.json(apiResponse(false, null, "Refresh token is required"));
      }

      refreshTokens.delete(refreshToken);

      res.json(apiResponse(true, { message: "Token revoked successfully" }));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to revoke token"));
    }
  });

  app.post("/api/Auth/google-signin", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.json(apiResponse(false, null, "ID token is required"));
      }

      let payload: any;
      try {
        const parts = idToken.split(".");
        if (parts.length !== 3) {
          return res.json(apiResponse(false, null, "Invalid ID token format"));
        }
        payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      } catch {
        return res.json(apiResponse(false, null, "Invalid ID token"));
      }

      const email = payload.email;
      const firstName = payload.given_name || payload.name?.split(" ")[0] || "";
      const lastName =
        payload.family_name ||
        payload.name?.split(" ").slice(1).join(" ") ||
        "";

      if (!email) {
        return res.json(
          apiResponse(false, null, "Email not found in ID token"),
        );
      }

      let user = await storage.getUserByEmail(email);

      if (!user) {
        user = await storage.createUser({
          email,
          passwordHash: hashPassword(crypto.randomBytes(32).toString("hex")),
          firstName,
          lastName,
          mobile: `google-${payload.sub}`,
          phoneCode: "+000",
          country: "Unknown",
          profilePhoto: payload.picture || null,
          status: "active",
          role: "end_user",
          mfaEnabled: false,
        });

        await storage.createWallet({
          userId: user.id,
          balance: "0.00",
        });
      }

      await storage.updateUser(user.id, { lastLogin: new Date() });
      await logAction(user.id, "Google Sign-In", "auth", user.id);

      const token = generateToken();
      const refreshToken = generateRefreshToken();
      refreshTokens.set(refreshToken, {
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      res.json(
        apiResponse(true, {
          user: { ...user, passwordHash: undefined },
          token,
          refreshToken,
        }),
      );
    } catch (error) {
      res.json(apiResponse(false, null, "Google sign-in failed"));
    }
  });
}
