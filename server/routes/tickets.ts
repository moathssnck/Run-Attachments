import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { apiResponse, logAction } from "./_helpers";

export function registerTicketRoutes(app: Express) {
  app.get("/api/tickets", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        const tickets = await storage.getAllTickets();
        return res.json(tickets);
      }
      const tickets = await storage.getTicketsByUser(userId);
      res.json(tickets);
    } catch (error) {
      res.json([]);
    }
  });

  app.post("/api/tickets/purchase", async (req: Request, res: Response) => {
    try {
      const { drawId, numbers, userId } = req.body;

      const draw = await storage.getDraw(drawId);
      if (!draw) {
        return res.json(apiResponse(false, null, "Draw not found"));
      }

      if (draw.status !== "active") {
        return res.json(apiResponse(false, null, "Draw is not active"));
      }

      const ticketCount = await storage.getTicketCount(drawId);
      if (ticketCount >= draw.maxTickets) {
        return res.json(apiResponse(false, null, "Draw is sold out"));
      }

      let purchaseUserId = userId;
      if (!purchaseUserId) {
        const users = await storage.getAllUsers();
        const endUser = users.find((u) => u.role === "end_user");
        purchaseUserId = endUser?.id;
      }

      if (!purchaseUserId) {
        return res.json(apiResponse(false, null, "User not found"));
      }

      const ticket = await storage.createTicket({
        ticketNumber: "",
        drawId,
        userId: purchaseUserId,
        selectedNumbers: JSON.stringify(numbers),
        status: "active",
      });

      const payment = await storage.createPayment({
        ticketId: ticket.id,
        userId: purchaseUserId,
        amount: draw.ticketPrice,
        status: "completed",
        paymentMethod: "wallet",
      });

      await storage.updateWalletBalance(
        purchaseUserId,
        -parseFloat(draw.ticketPrice),
      );

      const wallet = await storage.getWallet(purchaseUserId);
      if (wallet) {
        await storage.createWalletTransaction({
          walletId: wallet.id,
          type: "purchase",
          amount: draw.ticketPrice,
          description: `Ticket purchase for ${draw.name}`,
          referenceId: ticket.id,
        });
      }

      await logAction(
        purchaseUserId,
        "Ticket Purchased",
        "tickets",
        ticket.id,
        null,
        {
          drawName: draw.name,
          numbers,
        },
      );

      res.json(apiResponse(true, ticket));
    } catch (error) {
      console.error("Purchase error:", error);
      res.json(apiResponse(false, null, "Purchase failed"));
    }
  });

  app.get("/api/admin/tickets", async (req: Request, res: Response) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error) {
      res.json([]);
    }
  });

  app.post(
    "/api/admin/tickets/:id/void",
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const ticket = await storage.getTicket(id);

        if (!ticket) {
          return res.json(apiResponse(false, null, "Ticket not found"));
        }

        if (ticket.status === "voided") {
          return res.json(apiResponse(false, null, "Ticket already voided"));
        }

        const draw = await storage.getDraw(ticket.drawId);
        if (draw && draw.status === "completed") {
          return res.json(
            apiResponse(
              false,
              null,
              "Cannot void ticket after draw completion",
            ),
          );
        }

        const updated = await storage.updateTicket(id, { status: "voided" });

        await logAction(
          "admin",
          "Ticket Voided",
          "tickets",
          id,
          { status: ticket.status },
          { status: "voided" },
        );

        res.json(apiResponse(true, updated));
      } catch (error) {
        res.json(apiResponse(false, null, "Void failed"));
      }
    },
  );
}
