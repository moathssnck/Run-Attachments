import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { apiResponse, logAction } from "./_helpers";

export function registerRefundRoutes(app: Express) {
  app.get("/api/admin/refunds", async (req: Request, res: Response) => {
    try {
      const refunds = await storage.getAllRefunds();
      res.json(refunds);
    } catch (error) {
      res.json([]);
    }
  });

  app.post("/api/admin/refunds", async (req: Request, res: Response) => {
    try {
      const { ticketId, paymentId, userId, amount, reason, requestedBy } =
        req.body;

      if (!reason || reason.trim() === "") {
        return res.json(apiResponse(false, null, "Refund reason is required"));
      }

      const refund = await storage.createRefund({
        ticketId,
        paymentId,
        userId,
        amount,
        reason,
        status: "pending",
        requestedBy,
      });

      await logAction(
        requestedBy,
        "Refund Requested",
        "refunds",
        refund.id,
        null,
        {
          amount,
          reason,
        },
      );

      res.json(apiResponse(true, refund));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to create refund request"));
    }
  });

  app.patch(
    "/api/admin/refunds/:id/approve",
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { approvedBy } = req.body;

        const refund = await storage.getRefund(id);
        if (!refund) {
          return res.json(apiResponse(false, null, "Refund not found"));
        }

        if (refund.status !== "pending") {
          return res.json(apiResponse(false, null, "Refund already processed"));
        }

        const updated = await storage.updateRefund(id, {
          status: "approved",
          approvedBy,
          approvedAt: new Date(),
        });

        await storage.updateWalletBalance(
          refund.userId,
          parseFloat(refund.amount),
        );

        const wallet = await storage.getWallet(refund.userId);
        if (wallet) {
          await storage.createWalletTransaction({
            walletId: wallet.id,
            type: "refund",
            amount: refund.amount,
            description: `Refund for ticket`,
            referenceId: refund.ticketId,
          });
        }

        await storage.updatePayment(refund.paymentId, { status: "refunded" });

        await logAction(
          approvedBy,
          "Refund Approved",
          "refunds",
          id,
          { status: "pending" },
          { status: "approved" },
        );

        res.json(apiResponse(true, updated));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to approve refund"));
      }
    },
  );

  app.patch(
    "/api/admin/refunds/:id/reject",
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { approvedBy } = req.body;

        const refund = await storage.getRefund(id);
        if (!refund) {
          return res.json(apiResponse(false, null, "Refund not found"));
        }

        if (refund.status !== "pending") {
          return res.json(apiResponse(false, null, "Refund already processed"));
        }

        const updated = await storage.updateRefund(id, {
          status: "rejected",
          approvedBy,
          approvedAt: new Date(),
        });

        await logAction(
          approvedBy,
          "Refund Rejected",
          "refunds",
          id,
          { status: "pending" },
          { status: "rejected" },
        );

        res.json(apiResponse(true, updated));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to reject refund"));
      }
    },
  );
}
