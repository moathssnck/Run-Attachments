import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { createDrawSchema } from "@shared/schema";
import { z } from "zod";
import { apiResponse, logAction } from "./_helpers";

export function registerDrawRoutes(app: Express) {
  app.get("/api/draws/active", async (req: Request, res: Response) => {
    try {
      const draws = await storage.getActiveDraws();
      res.json(draws);
    } catch (error) {
      res.json([]);
    }
  });

  app.get("/api/admin/draws", async (req: Request, res: Response) => {
    try {
      const draws = await storage.getAllDraws();
      const allTickets = await storage.getAllTickets();

      const drawsWithStats = draws.map((draw) => {
        const drawTickets = allTickets.filter((t) => t.drawId === draw.id);
        const ticketsSold = drawTickets.filter(
          (t) => t.status === "active" || t.status === "won",
        ).length;
        const ticketsCancelled = drawTickets.filter(
          (t) => t.status === "cancelled" || t.status === "refunded",
        ).length;
        const ticketsRemaining = draw.maxTickets - ticketsSold;
        const revenue = drawTickets
          .filter((t) => t.status === "active" || t.status === "won")
          .reduce((sum, t) => sum + parseFloat(draw.ticketPrice), 0);

        return {
          ...draw,
          ticketsSold,
          ticketsCancelled,
          ticketsRemaining: Math.max(0, ticketsRemaining),
          revenue: revenue.toFixed(2),
        };
      });

      res.json(drawsWithStats);
    } catch (error) {
      res.json([]);
    }
  });

  app.post("/api/admin/draws", async (req: Request, res: Response) => {
    try {
      const data = createDrawSchema.parse(req.body);

      const users = await storage.getAllUsers();
      const admin = users.find(
        (u) => u.role === "system_admin" || u.role === "admin",
      );

      const draw = await storage.createDraw({
        name: data.name,
        description: data.description || null,
        ticketPrice: data.ticketPrice,
        drawDate: new Date(data.drawDate),
        status: "new",
        maxTickets: data.maxTickets,
        prizePool: data.prizePool || "0",
        createdBy: admin?.id || "system",
      });

      await logAction(
        admin?.id || "system",
        "Draw Created",
        "draws",
        draw.id,
        null,
        { name: draw.name },
      );

      res.json(apiResponse(true, draw));
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
      res.json(apiResponse(false, null, "Creation failed"));
    }
  });

  app.patch("/api/admin/draws/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const oldDraw = await storage.getDraw(id);

      if (!oldDraw) {
        return res.json(apiResponse(false, null, "Draw not found"));
      }

      const updated = await storage.updateDraw(id, req.body);

      if (updated) {
        await logAction(
          "admin",
          "Draw Updated",
          "draws",
          id,
          { status: oldDraw.status },
          { status: updated.status },
        );
      }

      res.json(apiResponse(true, updated));
    } catch (error) {
      res.json(apiResponse(false, null, "Update failed"));
    }
  });

  // Draw Prizes
  app.get(
    "/api/admin/draws/:drawId/prizes",
    async (req: Request, res: Response) => {
      try {
        const { drawId } = req.params;
        const prizes = await storage.getDrawPrizes(drawId);
        res.json(prizes);
      } catch (error) {
        res.json([]);
      }
    },
  );

  app.post(
    "/api/admin/draws/:drawId/prizes",
    async (req: Request, res: Response) => {
      try {
        const { drawId } = req.params;
        const { category, prizeAmount, winnerCount, description } = req.body;

        const draw = await storage.getDraw(drawId);
        if (!draw) {
          return res.json(apiResponse(false, null, "Draw not found"));
        }

        const prize = await storage.createDrawPrize({
          drawId,
          category,
          prizeAmount,
          winnerCount: winnerCount || 1,
          description: description || null,
        });

        await logAction("admin", "Prize Created", "draws", drawId, null, {
          category: prize.category,
          amount: prize.prizeAmount,
        });

        res.json(apiResponse(true, prize));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to create prize"));
      }
    },
  );

  // Draw Results
  app.get(
    "/api/admin/draws/:drawId/results",
    async (req: Request, res: Response) => {
      try {
        const { drawId } = req.params;
        const results = await storage.getDrawResults(drawId);
        res.json(results);
      } catch (error) {
        res.json([]);
      }
    },
  );

  app.post(
    "/api/admin/draws/:drawId/results",
    async (req: Request, res: Response) => {
      try {
        const { drawId } = req.params;
        const { ticketId, prizeId, winAmount } = req.body;

        const draw = await storage.getDraw(drawId);
        if (!draw) {
          return res.json(apiResponse(false, null, "Draw not found"));
        }

        const result = await storage.createDrawResult({
          drawId,
          ticketId,
          prizeId,
          winAmount,
          status: "pending",
        });

        await storage.updateTicket(ticketId, {
          status: "won",
          prizeAmount: winAmount,
        });

        await logAction("admin", "Result Published", "draws", drawId, null, {
          ticketId,
          winAmount,
        });

        res.json(apiResponse(true, result));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to create result"));
      }
    },
  );

  app.patch(
    "/api/admin/results/:id/credit",
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const result = await storage.updateDrawResult(id, {
          status: "credited",
          creditedAt: new Date(),
        });

        if (!result) {
          return res.json(apiResponse(false, null, "Result not found"));
        }

        const ticket = await storage.getTicket(result.ticketId);
        if (ticket) {
          const wallet = await storage.getWallet(ticket.userId);
          if (wallet) {
            await storage.updateWalletBalance(
              ticket.userId,
              parseFloat(result.winAmount),
            );
            await storage.createWalletTransaction({
              walletId: wallet.id,
              type: "prize",
              amount: result.winAmount,
              description: "فوز بجائزة السحب",
              referenceId: result.id,
            });
          }
        }

        res.json(apiResponse(true, result));
      } catch (error) {
        res.json(apiResponse(false, null, "Credit failed"));
      }
    },
  );
}
