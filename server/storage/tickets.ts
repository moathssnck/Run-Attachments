import { randomUUID } from "crypto";
import type { Ticket, InsertTicket, TicketWithDetails, Draw, User } from "./types";

export function getTicket(tickets: Map<string, Ticket>, id: string): Ticket | undefined {
  return tickets.get(id);
}

export async function getTicketsByUser(
  tickets: Map<string, Ticket>,
  draws: Map<string, Draw>,
  userId: string
): Promise<TicketWithDetails[]> {
  const userTickets = Array.from(tickets.values()).filter(
    (t) => t.userId === userId
  );
  return userTickets.map((ticket) => ({
    ...ticket,
    draw: draws.get(ticket.drawId),
  }));
}

export function getTicketsByDraw(tickets: Map<string, Ticket>, drawId: string): Ticket[] {
  return Array.from(tickets.values()).filter((t) => t.drawId === drawId);
}

export async function getAllTickets(
  tickets: Map<string, Ticket>,
  draws: Map<string, Draw>,
  users: Map<string, User>
): Promise<TicketWithDetails[]> {
  const allTickets = Array.from(tickets.values());
  return allTickets.map((ticket) => ({
    ...ticket,
    draw: draws.get(ticket.drawId),
    user: users.get(ticket.userId),
  }));
}

export function createTicket(tickets: Map<string, Ticket>, insertTicket: InsertTicket): Ticket {
  const id = randomUUID();
  const ticketNumber = `TKT${Date.now()
    .toString(36)
    .toUpperCase()}${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;
  const ticket: Ticket = {
    id,
    ticketNumber,
    drawId: insertTicket.drawId,
    userId: insertTicket.userId,
    selectedNumbers: insertTicket.selectedNumbers,
    status: insertTicket.status || "pending",
    prizeAmount: null,
    purchasedAt: new Date(),
  };
  tickets.set(id, ticket);
  return ticket;
}

export function updateTicket(
  tickets: Map<string, Ticket>,
  id: string,
  data: Partial<Ticket>
): Ticket | undefined {
  const ticket = tickets.get(id);
  if (!ticket) return undefined;
  const updated = { ...ticket, ...data };
  tickets.set(id, updated);
  return updated;
}

export function getTicketCount(tickets: Map<string, Ticket>, drawId: string): number {
  return Array.from(tickets.values()).filter((t) => t.drawId === drawId).length;
}
