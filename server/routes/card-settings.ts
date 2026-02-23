import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { apiResponse, logAction } from "./_helpers";

export function registerCardSettingRoutes(app: Express) {
  app.get("/api/CardSetting", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getCardSettings();
      res.json(apiResponse(true, settings || null));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to fetch card settings"));
    }
  });

  app.post("/api/CardSetting", async (req: Request, res: Response) => {
    try {
      const data = req.body;

      const oldSettings = await storage.getCardSettings();
      const updated = await storage.updateCardSettings({
        ...(data.cardHeaderImage !== undefined && { headerImage: data.cardHeaderImage }),
        ...(data.cardBackground !== undefined && { backgroundImage: data.cardBackground }),
        ...(data.chairmanSign !== undefined && { chairmanSignature: data.chairmanSign }),
        ...(data.directorSign !== undefined && { directorSignature: data.directorSign }),
        ...(data.cardPrice !== undefined && { cardPrice: data.cardPrice }),
        ...(data.chairmanName !== undefined && { chairmanName: data.chairmanName }),
        ...(data.directorName !== undefined && { directorName: data.directorName }),
        ...(data.lotteryName !== undefined && { lotteryName: data.lotteryName }),
        ...(data.lotteryTitle !== undefined && { lotteryTitle: data.lotteryTitle }),
      });

      await logAction(
        "system",
        "Card Settings Updated via API",
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
}
