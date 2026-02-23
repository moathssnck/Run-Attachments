import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { insertSystemContentSchema } from "@shared/schema";
import { z } from "zod";
import { apiResponse, logAction } from "./_helpers";

const updateSystemContentSchema = z.object({
  slug: z.string().optional(),
  titleAr: z.string().optional(),
  titleEn: z.string().optional(),
  contentAr: z.string().optional(),
  contentEn: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export function registerSystemContentRoutes(app: Express) {
  app.get("/api/system-content", async (req: Request, res: Response) => {
    try {
      const items = await storage.getAllSystemContent();
      res.json(apiResponse(true, items));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to get system content"));
    }
  });

  app.get("/api/system-content/:id", async (req: Request, res: Response) => {
    try {
      const item = await storage.getSystemContent(req.params.id);
      if (!item) {
        return res.json(apiResponse(false, null, "Content not found"));
      }
      res.json(apiResponse(true, item));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to get system content"));
    }
  });

  app.get("/api/system-content/slug/:slug", async (req: Request, res: Response) => {
    try {
      const item = await storage.getSystemContentBySlug(req.params.slug);
      if (!item) {
        return res.json(apiResponse(false, null, "Content not found"));
      }
      res.json(apiResponse(true, item));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to get system content"));
    }
  });

  app.post("/api/system-content", async (req: Request, res: Response) => {
    try {
      const validation = insertSystemContentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(false, null, validation.error.errors[0]?.message || "Validation failed")
        );
      }

      const item = await storage.createSystemContent(validation.data);

      await logAction(
        "system",
        "System Content Created",
        "system_content",
        item.id,
        null,
        { slug: item.slug, titleAr: item.titleAr }
      );

      res.json(apiResponse(true, item));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to create system content"));
    }
  });

  app.put("/api/system-content/:id", async (req: Request, res: Response) => {
    try {
      const existing = await storage.getSystemContent(req.params.id);
      if (!existing) {
        return res.json(apiResponse(false, null, "Content not found"));
      }

      const validation = updateSystemContentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(false, null, validation.error.errors[0]?.message || "Validation failed")
        );
      }

      const updated = await storage.updateSystemContent(req.params.id, validation.data);

      await logAction(
        "system",
        "System Content Updated",
        "system_content",
        req.params.id,
        { titleAr: existing.titleAr },
        { titleAr: updated?.titleAr }
      );

      res.json(apiResponse(true, updated));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to update system content"));
    }
  });

  app.delete("/api/system-content/:id", async (req: Request, res: Response) => {
    try {
      const existing = await storage.getSystemContent(req.params.id);
      if (!existing) {
        return res.json(apiResponse(false, null, "Content not found"));
      }

      await storage.deleteSystemContent(req.params.id);

      await logAction(
        "system",
        "System Content Deleted",
        "system_content",
        req.params.id,
        { slug: existing.slug, titleAr: existing.titleAr },
        null
      );

      res.json(apiResponse(true, { message: "Content deleted successfully" }));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to delete system content"));
    }
  });
}
