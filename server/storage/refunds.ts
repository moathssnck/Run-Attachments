import { randomUUID } from "crypto";
import type { Refund, InsertRefund, RefundWithDetails, User, Ticket, Payment } from "./types";

export async function getAllRefunds(
  refunds: Map<string, Refund>,
  tickets: Map<string, Ticket>,
  payments: Map<string, Payment>,
  users: Map<string, User>
): Promise<RefundWithDetails[]> {
  const allRefunds = Array.from(refunds.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return allRefunds.map((refund) => ({
    ...refund,
    ticket: tickets.get(refund.ticketId),
    payment: payments.get(refund.paymentId),
    user: users.get(refund.userId),
    requestedByUser: users.get(refund.requestedBy),
    approvedByUser: refund.approvedBy
      ? users.get(refund.approvedBy)
      : undefined,
  }));
}

export function getRefund(refunds: Map<string, Refund>, id: string): Refund | undefined {
  return refunds.get(id);
}

export function createRefund(refunds: Map<string, Refund>, insertRefund: InsertRefund): Refund {
  const id = randomUUID();
  const refund: Refund = {
    id,
    ticketId: insertRefund.ticketId,
    paymentId: insertRefund.paymentId,
    userId: insertRefund.userId,
    amount: insertRefund.amount,
    reason: insertRefund.reason,
    status: insertRefund.status || "pending",
    requestedBy: insertRefund.requestedBy,
    approvedBy: null,
    approvedAt: null,
    createdAt: new Date(),
  };
  refunds.set(id, refund);
  return refund;
}

export function updateRefund(
  refunds: Map<string, Refund>,
  id: string,
  data: Partial<Refund>
): Refund | undefined {
  const refund = refunds.get(id);
  if (!refund) return undefined;
  const updated = { ...refund, ...data };
  refunds.set(id, updated);
  return updated;
}
