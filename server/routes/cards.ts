import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { apiResponse, logAction } from "./_helpers";

const transferCardSchema = z.object({
  CardId: z.union([z.string(), z.number()]).transform(String),
  newOwnerId: z.union([z.string(), z.number()]).transform(String),
  transferReason: z.string().optional(),
});

const sellCardSchema = z.object({
  cardId: z.union([z.string(), z.number()]).transform(String),
  customerId: z.union([z.string(), z.number()]).transform(String),
});

const decodeQrSchema = z.object({
  qrCode: z.string().min(1, "QR code is required"),
});

const generateNotebooksSchema = z.object({
  issueFrom: z.number().int().min(1),
  issueTo: z.number().int().min(1),
  issueSead: z.number().int().min(1),
  issueDate: z.string(),
  issueDrawingDate: z.string(),
  issueTypeId: z.number().int(),
  createdByUserId: z.union([z.string(), z.number()]).transform(String),
});

function ticketToCard(ticket: any, draw?: any, user?: any) {
  return {
    cardId: ticket.id,
    cardNo: ticket.ticketNumber,
    cardStatusId: ticket.status === "active" ? 7 : ticket.status === "void" ? 8 : ticket.status === "won" ? 9 : 10,
    cardStatusName: ticket.status === "active" ? "Available" : ticket.status === "void" ? "Void" : ticket.status === "won" ? "Won" : ticket.status,
    cardDirectionId: 9,
    cardDirectionName: "A",
    cardNoteBookId: 31,
    noteBookName: "1",
    cardQR: "",
    selectedNumbers: ticket.selectedNumbers,
    prizeAmount: ticket.prizeAmount,
    purchasedAt: ticket.purchasedAt,
    drawId: ticket.drawId,
    drawName: draw?.name || null,
    userId: ticket.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : null,
  };
}

export function registerCardRoutes(app: Express) {
  app.get("/api/Card/all", async (req: Request, res: Response) => {
    try {
      const allTickets = await storage.getAllTickets();

      const cards = await Promise.all(
        allTickets.map(async (t) => {
          const draw = await storage.getDraw(t.drawId);
          const user = await storage.getUser(t.userId);
          return ticketToCard(t, draw, user);
        })
      );

      res.json({
        success: true,
        message: `Cards retrieved successfully (${cards.length} records)`,
        cards,
      });
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to get all cards"));
    }
  });

  app.get("/api/Card/paged", async (req: Request, res: Response) => {
    try {
      const pageNumber = parseInt(req.query.pageNumber as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 100;

      const allTickets = await storage.getAllTickets();

      const total = allTickets.length;
      const start = (pageNumber - 1) * pageSize;
      const paged = allTickets.slice(start, start + pageSize);

      const cards = await Promise.all(
        paged.map(async (t) => {
          const draw = await storage.getDraw(t.drawId);
          const user = await storage.getUser(t.userId);
          return ticketToCard(t, draw, user);
        })
      );

      res.json(
        apiResponse(true, {
          cards,
          totalCount: total,
          pageNumber,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        })
      );
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to get paged cards"));
    }
  });

  app.get("/api/Card/search", async (req: Request, res: Response) => {
    try {
      const {
        searchTerm,
        cardNumber,
        fromIssueDate,
        toIssueDrawingDate,
        cardStatusId,
        pageNumber: pn,
        pageSize: ps,
      } = req.query;

      const pageNumber = parseInt(pn as string) || 1;
      const pageSize = parseInt(ps as string) || 100;

      let allTickets = await storage.getAllTickets();

      if (searchTerm) {
        const term = (searchTerm as string).toLowerCase();
        allTickets = allTickets.filter(
          (t) =>
            t.ticketNumber.toLowerCase().includes(term) ||
            t.id.toLowerCase().includes(term)
        );
      }

      if (cardNumber) {
        allTickets = allTickets.filter((t) =>
          t.ticketNumber.includes(cardNumber as string)
        );
      }

      if (fromIssueDate) {
        const from = new Date(fromIssueDate as string);
        allTickets = allTickets.filter(
          (t) => new Date(t.purchasedAt) >= from
        );
      }

      if (toIssueDrawingDate) {
        const to = new Date(toIssueDrawingDate as string);
        allTickets = allTickets.filter(
          (t) => new Date(t.purchasedAt) <= to
        );
      }

      if (cardStatusId) {
        const statusMap: Record<string, string> = {
          "7": "active",
          "8": "void",
          "9": "won",
          "11": "pending",
        };
        const status = statusMap[cardStatusId as string];
        if (status) {
          allTickets = allTickets.filter((t) => t.status === status);
        }
      }

      const total = allTickets.length;
      const start = (pageNumber - 1) * pageSize;
      const paged = allTickets.slice(start, start + pageSize);

      const cards = await Promise.all(
        paged.map(async (t) => {
          const draw = await storage.getDraw(t.drawId);
          const user = await storage.getUser(t.userId);
          return ticketToCard(t, draw, user);
        })
      );

      res.json(
        apiResponse(true, {
          cards,
          totalCount: total,
          pageNumber,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        })
      );
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to search cards"));
    }
  });

  app.get("/api/Card/qr/:qrCode", async (req: Request, res: Response) => {
    try {
      const { qrCode } = req.params;

      const allTickets = await storage.getAllTickets();
      const ticket = allTickets.find((t) => {
        const encoded = Buffer.from(
          `${t.id}|${t.ticketNumber}|${t.drawId}`
        ).toString("base64");
        return encoded === qrCode || t.ticketNumber === qrCode;
      });

      if (!ticket) {
        return res.json(apiResponse(false, null, "Card not found for QR code"));
      }

      const draw = await storage.getDraw(ticket.drawId);
      const user = await storage.getUser(ticket.userId);

      res.json(apiResponse(true, ticketToCard(ticket, draw, user)));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to get card by QR"));
    }
  });

  app.get("/api/Card/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const ticket = await storage.getTicket(id);
      if (!ticket) {
        return res.json(apiResponse(false, null, "Card not found"));
      }

      const draw = await storage.getDraw(ticket.drawId);
      const user = await storage.getUser(ticket.userId);

      res.json(apiResponse(true, ticketToCard(ticket, draw, user)));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to get card"));
    }
  });

  app.post("/api/Card/transfer", async (req: Request, res: Response) => {
    try {
      const validation = transferCardSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(false, null, validation.error.errors[0]?.message || "Validation failed")
        );
      }

      const { CardId, newOwnerId, transferReason } = validation.data;

      const ticket = await storage.getTicket(CardId);
      if (!ticket) {
        return res.json(apiResponse(false, null, "Card not found"));
      }

      const newOwner = await storage.getUser(newOwnerId);
      if (!newOwner) {
        return res.json(apiResponse(false, null, "New owner not found"));
      }

      const oldUserId = ticket.userId;
      const updated = await storage.updateTicket(CardId, { userId: newOwnerId });

      await logAction(
        "system",
        "Card Transferred",
        "tickets",
        CardId,
        { userId: oldUserId },
        { userId: newOwnerId, reason: transferReason }
      );

      res.json(apiResponse(true, { message: "Card transferred successfully", card: updated }));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to transfer card"));
    }
  });

  app.post("/api/Card/sell", async (req: Request, res: Response) => {
    try {
      const validation = sellCardSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(false, null, validation.error.errors[0]?.message || "Validation failed")
        );
      }

      const { cardId, customerId } = validation.data;

      const ticket = await storage.getTicket(cardId);
      if (!ticket) {
        return res.json(apiResponse(false, null, "Card not found"));
      }

      const customer = await storage.getUser(customerId);
      if (!customer) {
        return res.json(apiResponse(false, null, "Customer not found"));
      }

      const updated = await storage.updateTicket(cardId, {
        userId: customerId,
        status: "active",
      });

      await logAction(
        "system",
        "Card Sold",
        "tickets",
        cardId,
        { status: ticket.status },
        { userId: customerId, status: "active" }
      );

      res.json(apiResponse(true, { message: "Card sold successfully", card: updated }));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to sell card"));
    }
  });

  app.post("/api/Card/decode-qr", async (req: Request, res: Response) => {
    try {
      const validation = decodeQrSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(false, null, validation.error.errors[0]?.message || "Validation failed")
        );
      }

      const { qrCode } = validation.data;

      try {
        const decoded = Buffer.from(qrCode, "base64").toString("utf-8");
        const parts = decoded.split("|");

        res.json(
          apiResponse(true, {
            decoded,
            parts,
            cardId: parts[0] || null,
            ticketNumber: parts[1] || null,
            drawId: parts[2] || null,
          })
        );
      } catch {
        res.json(apiResponse(false, null, "Invalid QR code format"));
      }
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to decode QR"));
    }
  });

  app.post("/api/Card/generate-notebooks-cards", async (req: Request, res: Response) => {
    try {
      const validation = generateNotebooksSchema.safeParse(req.body);
      if (!validation.success) {
        return res.json(
          apiResponse(false, null, validation.error.errors[0]?.message || "Validation failed")
        );
      }

      const { issueFrom, issueTo, issueSead, issueDate, issueDrawingDate, issueTypeId, createdByUserId } = validation.data;

      const draws = await storage.getAllDraws();
      let targetDraw = draws[0];

      if (!targetDraw) {
        return res.json(apiResponse(false, null, "No draw available for card generation"));
      }

      const generatedCards: any[] = [];
      let cardNumber = issueFrom;

      while (cardNumber <= issueTo) {
        const notebookSize = issueSead;
        const notebookEnd = Math.min(cardNumber + notebookSize - 1, issueTo);

        for (let i = cardNumber; i <= notebookEnd; i++) {
          const ticket = await storage.createTicket({
            ticketNumber: String(i),
            drawId: targetDraw.id,
            userId: createdByUserId,
            selectedNumbers: "",
            status: "pending",
          });
          generatedCards.push(ticketToCard(ticket, targetDraw));
        }

        cardNumber = notebookEnd + 1;
      }

      await logAction(
        createdByUserId,
        "Notebooks & Cards Generated",
        "tickets",
        "bulk",
        null,
        {
          issueFrom,
          issueTo,
          issueSead,
          totalGenerated: generatedCards.length,
        }
      );

      res.json(
        apiResponse(true, {
          message: `Generated ${generatedCards.length} cards successfully`,
          totalGenerated: generatedCards.length,
          cards: generatedCards.slice(0, 100),
        })
      );
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to generate notebooks and cards"));
    }
  });
}
