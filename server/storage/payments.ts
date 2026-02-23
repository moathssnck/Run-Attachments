import { randomUUID } from "crypto";
import type { Payment, InsertPayment, User, Ticket } from "./types";

export function getPayment(payments: Map<string, Payment>, id: string): Payment | undefined {
  return payments.get(id);
}

export function getPaymentsByUser(payments: Map<string, Payment>, userId: string): Payment[] {
  return Array.from(payments.values()).filter(
    (p) => p.userId === userId
  );
}

export async function getAllPayments(
  payments: Map<string, Payment>,
  users: Map<string, User>,
  tickets: Map<string, Ticket>
): Promise<(Payment & { user?: User; ticket?: Ticket })[]> {
  const allPayments = Array.from(payments.values());
  return allPayments.map((payment) => ({
    ...payment,
    user: users.get(payment.userId),
    ticket: tickets.get(payment.ticketId),
  }));
}

export function createPayment(payments: Map<string, Payment>, insertPayment: InsertPayment): Payment {
  const id = randomUUID();
  const payment: Payment = {
    id,
    ticketId: insertPayment.ticketId,
    userId: insertPayment.userId,
    amount: insertPayment.amount,
    status: insertPayment.status || "pending",
    paymentMethod: insertPayment.paymentMethod ?? null,
    transactionId:
      insertPayment.transactionId ??
      `TXN${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date(),
  };
  payments.set(id, payment);
  return payment;
}

export function updatePayment(
  payments: Map<string, Payment>,
  id: string,
  data: Partial<Payment>
): Payment | undefined {
  const payment = payments.get(id);
  if (!payment) return undefined;
  const updated = { ...payment, ...data };
  payments.set(id, updated);
  return updated;
}
