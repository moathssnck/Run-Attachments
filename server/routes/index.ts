import type { Express } from "express";
import { type Server } from "http";
import { registerObjectStorageRoutes } from "../replit_integrations/object_storage";
import { registerPublicCardsRoute } from "./public-cards";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Keep only non-database local routes. All business APIs are proxied externally.
  registerObjectStorageRoutes(app);
  registerPublicCardsRoute(app);

  return httpServer;
}
