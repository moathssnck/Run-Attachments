import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { apiResponse, logAction } from "./_helpers";

export function registerWalletRoutes(app: Express) {
  app.get("/api/wallet", async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const endUser = users.find((u) => u.role === "end_user");

      if (!endUser) {
        return res.json({ wallet: { balance: "0.00" }, transactions: [] });
      }

      const wallet = await storage.getWallet(endUser.id);
      if (!wallet) {
        return res.json({ wallet: { balance: "0.00" }, transactions: [] });
      }

      const transactions = await storage.getWalletTransactions(wallet.id);
      res.json({ wallet, transactions });
    } catch (error) {
      res.json({ wallet: { balance: "0.00" }, transactions: [] });
    }
  });

  app.post("/api/wallet/deposit", async (req: Request, res: Response) => {
    try {
      const { amount, paymentMethod } = req.body;

      if (!amount || parseFloat(amount) <= 0) {
        return res.json(apiResponse(false, null, "يجب إدخال مبلغ صحيح"));
      }

      const users = await storage.getAllUsers();
      const endUser = users.find((u) => u.role === "end_user");

      if (!endUser) {
        return res.json(apiResponse(false, null, "المستخدم غير موجود"));
      }

      let wallet = await storage.getWallet(endUser.id);
      if (!wallet) {
        wallet = await storage.createWallet({
          userId: endUser.id,
          balance: "0.00",
        });
      }

      await storage.updateWalletBalance(endUser.id, parseFloat(amount));

      await storage.createWalletTransaction({
        walletId: wallet.id,
        type: "credit",
        amount: amount.toString(),
        description: `إيداع عبر ${paymentMethod === "cliq" ? "CliQ" : "بطاقة ائتمان"}`,
      });

      await storage.createPayment({
        userId: endUser.id,
        ticketId: "deposit",
        amount: amount.toString(),
        paymentMethod: paymentMethod || "credit_card",
        status: "completed",
        transactionId: `DEP-${Date.now()}`,
      });

      await logAction(
        endUser.id,
        "wallet_deposit",
        "wallet",
        wallet.id.toString(),
        null,
        { amount, paymentMethod },
        req.ip,
      );

      res.json(apiResponse(true, { message: "تم الإيداع بنجاح" }));
    } catch (error) {
      console.error("Deposit error:", error);
      res.json(apiResponse(false, null, "فشل في عملية الإيداع"));
    }
  });

  app.post("/api/wallet/withdraw", async (req: Request, res: Response) => {
    try {
      const { amount, withdrawMethod, accountDetails } = req.body;

      if (!amount || parseFloat(amount) <= 0) {
        return res.json(apiResponse(false, null, "يجب إدخال مبلغ صحيح"));
      }

      const users = await storage.getAllUsers();
      const endUser = users.find((u) => u.role === "end_user");

      if (!endUser) {
        return res.json(apiResponse(false, null, "المستخدم غير موجود"));
      }

      const wallet = await storage.getWallet(endUser.id);
      if (!wallet) {
        return res.json(apiResponse(false, null, "المحفظة غير موجودة"));
      }

      if (parseFloat(wallet.balance) < parseFloat(amount)) {
        return res.json(apiResponse(false, null, "الرصيد غير كافٍ"));
      }

      await storage.updateWalletBalance(endUser.id, -parseFloat(amount));

      await storage.createWalletTransaction({
        walletId: wallet.id,
        type: "debit",
        amount: amount.toString(),
        description: `سحب إلى ${withdrawMethod === "cliq" ? "CliQ" : "الحساب البنكي"}`,
      });

      await logAction(
        endUser.id,
        "wallet_withdraw",
        "wallet",
        wallet.id.toString(),
        null,
        { amount, withdrawMethod, accountDetails },
        req.ip,
      );

      res.json(apiResponse(true, { message: "تم السحب بنجاح" }));
    } catch (error) {
      console.error("Withdraw error:", error);
      res.json(apiResponse(false, null, "فشل في عملية السحب"));
    }
  });
}
