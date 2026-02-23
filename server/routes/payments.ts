import type { Express, Request, Response } from "express";
import { storage } from "../storage";

export function registerPaymentRoutes(app: Express) {
  app.get("/api/admin/payments", async (req: Request, res: Response) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.json([]);
    }
  });
}
