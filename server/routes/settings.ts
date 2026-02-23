import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { apiResponse, logAction } from "./_helpers";

export function registerSettingRoutes(app: Express) {
  app.get(
    "/api/admin/dashboard",
    async (req: Request, res: Response) => {
      try {
        const stats = await storage.getDashboardStats();
        const allTickets = await storage.getAllTickets();
        const allDraws = await storage.getAllDraws();

        const totalTicketsSold = allTickets.filter(
          (t) => t.status === "active" || t.status === "won",
        ).length;
        const totalTicketsCancelled = allTickets.filter(
          (t) => t.status === "cancelled" || t.status === "refunded",
        ).length;
        const totalTicketsAvailable = allDraws.reduce(
          (sum, d) => sum + d.maxTickets,
          0,
        );
        const totalTicketsRemaining = totalTicketsAvailable - totalTicketsSold;

        res.json({
          ...stats,
          totalTicketsSold,
          totalTicketsCancelled,
          totalTicketsRemaining: Math.max(0, totalTicketsRemaining),
          totalTicketsAvailable,
        });
      } catch (error) {
        res.json({
          totalUsers: 0,
          activeDraws: 0,
          totalTicketsSold: 0,
          totalTicketsCancelled: 0,
          totalTicketsRemaining: 0,
          totalTicketsAvailable: 0,
          totalRevenue: "0.00",
          recentUsers: [],
          recentTickets: [],
        });
      }
    },
  );

  app.get("/api/admin/audit-logs", async (req: Request, res: Response) => {
    try {
      const logs = await storage.getAllAuditLogs();
      res.json(logs);
    } catch (error) {
      res.json([]);
    }
  });

  app.get(
    "/api/admin/system-definitions",
    async (req: Request, res: Response) => {
      try {
        const { category } = req.query;
        const definitions = await storage.getSystemDefinitions(
          category as string | undefined,
        );
        res.json(apiResponse(true, definitions));
      } catch (error) {
        res.json(
          apiResponse(false, null, "Failed to fetch system definitions"),
        );
      }
    },
  );

  app.get(
    "/api/admin/system-definitions/:id",
    async (req: Request, res: Response) => {
      try {
        const definition = await storage.getSystemDefinition(req.params.id);
        if (!definition) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Definition not found"));
        }
        res.json(apiResponse(true, definition));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to fetch system definition"));
      }
    },
  );

  app.post(
    "/api/admin/system-definitions",
    async (req: Request, res: Response) => {
      try {
        const { adminId, ...data } = req.body;
        const definition = await storage.createSystemDefinition(data);

        await logAction(
          adminId || "admin",
          "System Definition Created",
          "system_definitions",
          definition.id,
          null,
          definition,
        );

        res.json(apiResponse(true, definition));
      } catch (error) {
        res.json(
          apiResponse(false, null, "Failed to create system definition"),
        );
      }
    },
  );

  app.patch(
    "/api/admin/system-definitions/:id",
    async (req: Request, res: Response) => {
      try {
        const existingDef = await storage.getSystemDefinition(req.params.id);
        if (!existingDef) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Definition not found"));
        }

        const { adminId, ...data } = req.body;
        const definition = await storage.updateSystemDefinition(
          req.params.id,
          data,
        );

        await logAction(
          adminId || "admin",
          "System Definition Updated",
          "system_definitions",
          req.params.id,
          existingDef,
          definition,
        );

        res.json(apiResponse(true, definition));
      } catch (error) {
        res.json(
          apiResponse(false, null, "Failed to update system definition"),
        );
      }
    },
  );

  app.patch(
    "/api/admin/system-definitions/:id/toggle",
    async (req: Request, res: Response) => {
      try {
        const existingDef = await storage.getSystemDefinition(req.params.id);
        if (!existingDef) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Definition not found"));
        }

        const { adminId } = req.body;
        const definition = await storage.updateSystemDefinition(req.params.id, {
          isActive: !existingDef.isActive,
        });

        await logAction(
          adminId || "admin",
          existingDef.isActive
            ? "System Definition Deactivated"
            : "System Definition Activated",
          "system_definitions",
          req.params.id,
          { isActive: existingDef.isActive },
          { isActive: definition?.isActive },
        );

        res.json(apiResponse(true, definition));
      } catch (error) {
        res.json(
          apiResponse(false, null, "Failed to toggle system definition"),
        );
      }
    },
  );

  app.delete(
    "/api/admin/system-definitions/:id",
    async (req: Request, res: Response) => {
      try {
        const existingDef = await storage.getSystemDefinition(req.params.id);
        if (!existingDef) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Definition not found"));
        }

        const { adminId } = req.body;
        await storage.deleteSystemDefinition(req.params.id);

        await logAction(
          adminId || "admin",
          "System Definition Deleted",
          "system_definitions",
          req.params.id,
          existingDef,
          null,
        );

        res.json(apiResponse(true, null));
      } catch (error) {
        res.json(
          apiResponse(false, null, "Failed to delete system definition"),
        );
      }
    },
  );

  app.post(
    "/api/admin/system-definitions/seed",
    async (req: Request, res: Response) => {
      try {
        await storage.seedSystemDefinitions();
        const definitions = await storage.getSystemDefinitions();
        res.json(apiResponse(true, definitions));
      } catch (error) {
        console.error("Error seeding system definitions:", error);
        res.json(apiResponse(false, null, "Failed to seed system definitions"));
      }
    },
  );

  app.get("/api/admin/custom-settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getCustomSettings();
      res.json(apiResponse(true, settings));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to fetch custom settings"));
    }
  });

  app.get(
    "/api/admin/custom-settings/:id",
    async (req: Request, res: Response) => {
      try {
        const setting = await storage.getCustomSetting(req.params.id);
        if (!setting) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Setting not found"));
        }
        res.json(apiResponse(true, setting));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to fetch custom setting"));
      }
    },
  );

  app.post(
    "/api/admin/custom-settings",
    async (req: Request, res: Response) => {
      try {
        const { adminId, ...data } = req.body;

        const existing = await storage.getCustomSettingByKey(data.key);
        if (existing) {
          return res
            .status(400)
            .json(apiResponse(false, null, "Setting key already exists"));
        }

        const setting = await storage.createCustomSetting(data);

        await logAction(
          adminId || "admin",
          "Custom Setting Created",
          "custom_settings",
          setting.id,
          null,
          setting,
        );

        res.json(apiResponse(true, setting));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to create custom setting"));
      }
    },
  );

  app.patch(
    "/api/admin/custom-settings/:id",
    async (req: Request, res: Response) => {
      try {
        const existingSetting = await storage.getCustomSetting(req.params.id);
        if (!existingSetting) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Setting not found"));
        }

        const { adminId, ...data } = req.body;
        const setting = await storage.updateCustomSetting(req.params.id, data);

        await logAction(
          adminId || "admin",
          "Custom Setting Updated",
          "custom_settings",
          req.params.id,
          existingSetting,
          setting,
        );

        res.json(apiResponse(true, setting));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to update custom setting"));
      }
    },
  );

  app.patch(
    "/api/admin/custom-settings/:id/toggle",
    async (req: Request, res: Response) => {
      try {
        const existingSetting = await storage.getCustomSetting(req.params.id);
        if (!existingSetting) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Setting not found"));
        }

        const { adminId } = req.body;
        const setting = await storage.updateCustomSetting(req.params.id, {
          isActive: !existingSetting.isActive,
        });

        await logAction(
          adminId || "admin",
          existingSetting.isActive
            ? "Custom Setting Deactivated"
            : "Custom Setting Activated",
          "custom_settings",
          req.params.id,
          { isActive: existingSetting.isActive },
          { isActive: setting?.isActive },
        );

        res.json(apiResponse(true, setting));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to toggle custom setting"));
      }
    },
  );

  app.delete(
    "/api/admin/custom-settings/:id",
    async (req: Request, res: Response) => {
      try {
        const existingSetting = await storage.getCustomSetting(req.params.id);
        if (!existingSetting) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Setting not found"));
        }

        const { adminId } = req.body;
        await storage.deleteCustomSetting(req.params.id);

        await logAction(
          adminId || "admin",
          "Custom Setting Deleted",
          "custom_settings",
          req.params.id,
          existingSetting,
          null,
        );

        res.json(apiResponse(true, null));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to delete custom setting"));
      }
    },
  );

  app.get("/api/admin/card-settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getCardSettings();
      res.json(apiResponse(true, settings || null));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to fetch card settings"));
    }
  });

  app.patch("/api/admin/card-settings", async (req: Request, res: Response) => {
    try {
      const { adminId, ...data } = req.body;
      const oldSettings = await storage.getCardSettings();
      const updated = await storage.updateCardSettings(data);

      await logAction(
        adminId || "admin",
        "Card Settings Updated",
        "card_settings",
        updated.id,
        oldSettings || null,
        updated,
      );

      res.json(apiResponse(true, updated));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to update card settings"));
    }
  });

  app.get("/api/admin/prizes", async (req: Request, res: Response) => {
    try {
      const prizes = await storage.getAllPrizes();
      res.json(apiResponse(true, prizes));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to fetch prizes"));
    }
  });

  app.get("/api/admin/prizes/:id", async (req: Request, res: Response) => {
    try {
      const prize = await storage.getPrize(req.params.id);
      if (!prize) {
        return res
          .status(404)
          .json(apiResponse(false, null, "Prize not found"));
      }
      res.json(apiResponse(true, prize));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to fetch prize"));
    }
  });

  app.post("/api/admin/prizes", async (req: Request, res: Response) => {
    try {
      const { adminId, ...data } = req.body;
      const prize = await storage.createPrize(data);

      await logAction(
        adminId || "admin",
        "Prize Created",
        "prizes",
        prize.id,
        null,
        prize,
      );

      res.json(apiResponse(true, prize));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to create prize"));
    }
  });

  app.patch("/api/admin/prizes/:id", async (req: Request, res: Response) => {
    try {
      const existingPrize = await storage.getPrize(req.params.id);
      if (!existingPrize) {
        return res
          .status(404)
          .json(apiResponse(false, null, "Prize not found"));
      }

      const { adminId, ...data } = req.body;
      const prize = await storage.updatePrize(req.params.id, data);

      await logAction(
        adminId || "admin",
        "Prize Updated",
        "prizes",
        req.params.id,
        existingPrize,
        prize,
      );

      res.json(apiResponse(true, prize));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to update prize"));
    }
  });

  app.patch(
    "/api/admin/prizes/:id/toggle",
    async (req: Request, res: Response) => {
      try {
        const existingPrize = await storage.getPrize(req.params.id);
        if (!existingPrize) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Prize not found"));
        }

        const { adminId } = req.body;
        const prize = await storage.updatePrize(req.params.id, {
          isActive: !existingPrize.isActive,
        });

        await logAction(
          adminId || "admin",
          existingPrize.isActive ? "Prize Deactivated" : "Prize Activated",
          "prizes",
          req.params.id,
          { isActive: existingPrize.isActive },
          { isActive: prize?.isActive },
        );

        res.json(apiResponse(true, prize));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to toggle prize"));
      }
    },
  );

  app.delete("/api/admin/prizes/:id", async (req: Request, res: Response) => {
    try {
      const existingPrize = await storage.getPrize(req.params.id);
      if (!existingPrize) {
        return res
          .status(404)
          .json(apiResponse(false, null, "Prize not found"));
      }

      const { adminId } = req.body;
      await storage.deletePrize(req.params.id);

      await logAction(
        adminId || "admin",
        "Prize Deleted",
        "prizes",
        req.params.id,
        existingPrize,
        null,
      );

      res.json(apiResponse(true, null));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to delete prize"));
    }
  });

  app.get(
    "/api/admin/system-categories",
    async (_req: Request, res: Response) => {
      try {
        const categories = await storage.getAllSystemCategories();
        res.json(apiResponse(true, categories));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to fetch system categories"));
      }
    },
  );

  app.get(
    "/api/admin/system-categories/:id",
    async (req: Request, res: Response) => {
      try {
        const category = await storage.getSystemCategory(req.params.id);
        if (!category) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Category not found"));
        }
        res.json(apiResponse(true, category));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to fetch category"));
      }
    },
  );

  app.post(
    "/api/admin/system-categories",
    async (req: Request, res: Response) => {
      try {
        const { adminId, ...data } = req.body;
        const category = await storage.createSystemCategory(data);

        await logAction(
          adminId || "admin",
          "System Category Created",
          "system-categories",
          category.id,
          null,
          category,
        );

        res.json(apiResponse(true, category));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to create category"));
      }
    },
  );

  app.patch(
    "/api/admin/system-categories/:id",
    async (req: Request, res: Response) => {
      try {
        const existingCategory = await storage.getSystemCategory(req.params.id);
        if (!existingCategory) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Category not found"));
        }

        const { adminId, ...data } = req.body;
        const category = await storage.updateSystemCategory(
          req.params.id,
          data,
        );

        await logAction(
          adminId || "admin",
          "System Category Updated",
          "system-categories",
          req.params.id,
          existingCategory,
          category,
        );

        res.json(apiResponse(true, category));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to update category"));
      }
    },
  );

  app.delete(
    "/api/admin/system-categories/:id",
    async (req: Request, res: Response) => {
      try {
        const existingCategory = await storage.getSystemCategory(req.params.id);
        if (!existingCategory) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Category not found"));
        }

        const { adminId } = req.body;
        await storage.deleteSystemCategory(req.params.id);

        await logAction(
          adminId || "admin",
          "System Category Deleted",
          "system-categories",
          req.params.id,
          existingCategory,
          null,
        );

        res.json(apiResponse(true, null));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to delete category"));
      }
    },
  );
}
