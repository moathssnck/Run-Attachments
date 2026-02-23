import { randomUUID } from "crypto";
import type { Wallet, InsertWallet, WalletTransaction, InsertWalletTransaction } from "./types";

export function getWallet(wallets: Map<string, Wallet>, userId: string): Wallet | undefined {
  return wallets.get(userId);
}

export function createWallet(wallets: Map<string, Wallet>, insertWallet: InsertWallet): Wallet {
  const id = randomUUID();
  const wallet: Wallet = {
    ...insertWallet,
    id,
    balance: insertWallet.balance || "0.00",
    updatedAt: new Date(),
  };
  wallets.set(insertWallet.userId, wallet);
  return wallet;
}

export function updateWalletBalance(
  wallets: Map<string, Wallet>,
  userId: string,
  amount: number
): Wallet | undefined {
  const wallet = wallets.get(userId);
  if (!wallet) return undefined;
  const newBalance = parseFloat(wallet.balance) + amount;
  const updated = {
    ...wallet,
    balance: newBalance.toFixed(2),
    updatedAt: new Date(),
  };
  wallets.set(userId, updated);
  return updated;
}

export function getWalletTransactions(
  walletTransactions: Map<string, WalletTransaction>,
  walletId: string
): WalletTransaction[] {
  return Array.from(walletTransactions.values())
    .filter((t) => t.walletId === walletId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function createWalletTransaction(
  walletTransactions: Map<string, WalletTransaction>,
  insertTransaction: InsertWalletTransaction
): WalletTransaction {
  const id = randomUUID();
  const transaction: WalletTransaction = {
    id,
    walletId: insertTransaction.walletId,
    type: insertTransaction.type,
    amount: insertTransaction.amount,
    description: insertTransaction.description ?? null,
    referenceId: insertTransaction.referenceId ?? null,
    createdAt: new Date(),
  };
  walletTransactions.set(id, transaction);
  return transaction;
}
