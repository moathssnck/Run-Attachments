import type { Express } from "express";
import { type Server } from "http";
import { registerObjectStorageRoutes } from "../replit_integrations/object_storage";
import { registerAuthRoutes } from "./auth";
import { registerUserRoutes } from "./users";
import { registerUserManagementRoutes } from "./user-management";
import { registerDrawRoutes } from "./draws";
import { registerTicketRoutes } from "./tickets";
import { registerPaymentRoutes } from "./payments";
import { registerWalletRoutes } from "./wallets";
import { registerRefundRoutes } from "./refunds";
import { registerRoleRoutes } from "./roles";
import { registerUserRoleRoutes } from "./user-roles";
import { registerPermissionRoutes } from "./permissions";
import { registerIssueRoutes } from "./issues";
import { registerSettingRoutes } from "./settings";
import { registerCardSettingRoutes } from "./card-settings";
import { registerCardRoutes } from "./cards";
import { registerSystemContentRoutes } from "./system-content";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  registerObjectStorageRoutes(app);

  registerAuthRoutes(app);
  registerUserRoutes(app);
  registerUserManagementRoutes(app);
  registerDrawRoutes(app);
  registerTicketRoutes(app);
  registerPaymentRoutes(app);
  registerWalletRoutes(app);
  registerRefundRoutes(app);
  registerRoleRoutes(app);
  registerUserRoleRoutes(app);
  registerPermissionRoutes(app);
  registerIssueRoutes(app);
  registerSettingRoutes(app);
  registerCardSettingRoutes(app);
  registerCardRoutes(app);
  registerSystemContentRoutes(app);

  return httpServer;
}
