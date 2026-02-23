import { randomUUID } from "crypto";
import type {
  Draw,
  InsertDraw,
  DrawWithStats,
  Ticket,
  DrawPrize,
  InsertDrawPrize,
  DrawResult,
  InsertDrawResult,
  DrawResultWithDetails,
  User,
} from "./types";

export function getDraw(draws: Map<string, Draw>, id: string): Draw | undefined {
  return draws.get(id);
}

export async function getAllDraws(
  draws: Map<string, Draw>,
  tickets: Map<string, Ticket>
): Promise<DrawWithStats[]> {
  const allDraws = Array.from(draws.values());
  return Promise.all(
    allDraws.map(async (draw) => {
      const drawTickets = Array.from(tickets.values()).filter((t) => t.drawId === draw.id);
      const ticketsCancelled = drawTickets.filter(
        (t) => t.status === "voided"
      ).length;
      const ticketsSold = drawTickets.length - ticketsCancelled;
      const ticketsRemaining = Math.max(
        0,
        (draw.maxTickets ?? 0) - ticketsSold
      );
      const revenue = ticketsSold * parseFloat(draw.ticketPrice);
      return {
        ...draw,
        ticketsSold,
        ticketsCancelled,
        ticketsRemaining,
        revenue: revenue.toFixed(2),
      };
    })
  );
}

export function getActiveDraws(draws: Map<string, Draw>): Draw[] {
  return Array.from(draws.values()).filter((d) => d.status === "active");
}

export function createDraw(draws: Map<string, Draw>, insertDraw: InsertDraw): Draw {
  const id = randomUUID();
  const draw: Draw = {
    id,
    name: insertDraw.name,
    description: insertDraw.description ?? null,
    ticketPrice: insertDraw.ticketPrice,
    drawDate: new Date(insertDraw.drawDate),
    status: insertDraw.status || "scheduled",
    maxTickets: insertDraw.maxTickets ?? 1000,
    winningNumbers: null,
    prizePool: insertDraw.prizePool || "0",
    createdBy: insertDraw.createdBy,
    createdAt: new Date(),
  };
  draws.set(id, draw);
  return draw;
}

export function updateDraw(draws: Map<string, Draw>, id: string, data: Partial<Draw>): Draw | undefined {
  const draw = draws.get(id);
  if (!draw) return undefined;
  const updated = { ...draw, ...data };
  draws.set(id, updated);
  return updated;
}

export function getDrawPrizes(drawPrizes: Map<string, DrawPrize>, drawId: string): DrawPrize[] {
  return Array.from(drawPrizes.values())
    .filter((p) => p.drawId === drawId)
    .sort((a, b) => {
      const categoryOrder = [
        "grand",
        "first",
        "second",
        "third",
        "consolation",
      ];
      return (
        categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
      );
    });
}

export function createDrawPrize(drawPrizes: Map<string, DrawPrize>, insertPrize: InsertDrawPrize): DrawPrize {
  const id = randomUUID();
  const prize: DrawPrize = {
    id,
    drawId: insertPrize.drawId,
    category: insertPrize.category,
    prizeAmount: insertPrize.prizeAmount,
    winnerCount: insertPrize.winnerCount ?? 1,
    description: insertPrize.description ?? null,
    createdAt: new Date(),
  };
  drawPrizes.set(id, prize);
  return prize;
}

export function updateDrawPrize(
  drawPrizes: Map<string, DrawPrize>,
  id: string,
  data: Partial<DrawPrize>
): DrawPrize | undefined {
  const prize = drawPrizes.get(id);
  if (!prize) return undefined;
  const updated = { ...prize, ...data };
  drawPrizes.set(id, updated);
  return updated;
}

export function deleteDrawPrize(drawPrizes: Map<string, DrawPrize>, id: string): void {
  drawPrizes.delete(id);
}

export async function getDrawResults(
  drawResults: Map<string, DrawResult>,
  drawPrizes: Map<string, DrawPrize>,
  tickets: Map<string, Ticket>,
  users: Map<string, User>,
  drawId: string
): Promise<DrawResultWithDetails[]> {
  const results = Array.from(drawResults.values())
    .filter((r) => r.drawId === drawId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return Promise.all(
    results.map(async (result) => {
      const ticket = tickets.get(result.ticketId);
      const prize = drawPrizes.get(result.prizeId);
      const user = ticket ? users.get(ticket.userId) : undefined;
      return {
        ...result,
        ticket,
        prize,
        user,
      };
    })
  );
}

export function createDrawResult(drawResults: Map<string, DrawResult>, insertResult: InsertDrawResult): DrawResult {
  const id = randomUUID();
  const result: DrawResult = {
    id,
    drawId: insertResult.drawId,
    ticketId: insertResult.ticketId,
    prizeId: insertResult.prizeId,
    winAmount: insertResult.winAmount,
    status: insertResult.status || "pending",
    creditedAt: null,
    createdAt: new Date(),
  };
  drawResults.set(id, result);
  return result;
}

export function updateDrawResult(
  drawResults: Map<string, DrawResult>,
  id: string,
  data: Partial<DrawResult>
): DrawResult | undefined {
  const result = drawResults.get(id);
  if (!result) return undefined;
  const updated = { ...result, ...data };
  drawResults.set(id, updated);
  return updated;
}
