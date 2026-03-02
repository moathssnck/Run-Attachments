import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { apiResponse, logAction } from "./_helpers";

export function registerIssueRoutes(app: Express) {
  app.get("/api/admin/issues", async (req: Request, res: Response) => {
    try {
      const issues = await storage.getAllIssues();
      res.json(apiResponse(true, issues));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to fetch issues"));
    }
  });

  app.get("/api/admin/issues/:id", async (req: Request, res: Response) => {
    try {
      const issue = await storage.getIssue(req.params.id);
      if (!issue) {
        return res
          .status(404)
          .json(apiResponse(false, null, "Issue not found"));
      }
      res.json(apiResponse(true, issue));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to fetch issue"));
    }
  });

  app.post("/api/admin/issues", async (req: Request, res: Response) => {
    try {
      const {
        issueNumber,
        issueType,
        startDate,
        endDate,
        totalTickets,
        ticketsPerBook,
        bookPrice,
        startTicketNumber,
        prizesAccountNumber,
        createdBy,
      } = req.body;

      const calculatedTotalBooks = Math.ceil(totalTickets / ticketsPerBook);
      const calculatedEndTicketNumber = startTicketNumber + totalTickets - 1;

      const issue = await storage.createIssue({
        issueNumber,
        issueType: issueType || "regular",
        startDate,
        endDate,
        totalTickets,
        ticketsPerBook: ticketsPerBook || 10,
        totalBooks: calculatedTotalBooks,
        bookPrice,
        startTicketNumber: startTicketNumber || 1,
        endTicketNumber: calculatedEndTicketNumber,
        prizesAccountNumber: prizesAccountNumber || null,
        isClosed: false,
        createdBy: createdBy || "admin",
      });

      await logAction(
        createdBy || "admin",
        "Issue Created",
        "issues",
        issue.id,
        null,
        { issueNumber, issueType, totalTickets },
      );

      res.json(apiResponse(true, issue));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to create issue"));
    }
  });

  app.patch("/api/admin/issues/:id", async (req: Request, res: Response) => {
    try {
      const existingIssue = await storage.getIssue(req.params.id);
      if (!existingIssue) {
        return res
          .status(404)
          .json(apiResponse(false, null, "Issue not found"));
      }

      const { adminId, ...updateData } = req.body;

      if (
        updateData.totalTickets ||
        updateData.ticketsPerBook ||
        updateData.startTicketNumber
      ) {
        const totalTickets =
          updateData.totalTickets || existingIssue.totalTickets;
        const ticketsPerBook =
          updateData.ticketsPerBook || existingIssue.ticketsPerBook;
        const startTicketNumber =
          updateData.startTicketNumber || existingIssue.startTicketNumber;
        updateData.totalBooks = Math.ceil(totalTickets / ticketsPerBook);
        updateData.endTicketNumber = startTicketNumber + totalTickets - 1;
      }

      const issue = await storage.updateIssue(req.params.id, updateData);

      await logAction(
        adminId || "admin",
        "Issue Updated",
        "issues",
        req.params.id,
        existingIssue,
        updateData,
      );

      res.json(apiResponse(true, issue));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to update issue"));
    }
  });

  app.patch(
    "/api/admin/issues/:id/close",
    async (req: Request, res: Response) => {
      try {
        const existingIssue = await storage.getIssue(req.params.id);
        if (!existingIssue) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Issue not found"));
        }

        const { adminId } = req.body;
        const issue = await storage.updateIssue(req.params.id, {
          isClosed: true,
        });

        await logAction(
          adminId || "admin",
          "Issue Closed",
          "issues",
          req.params.id,
          { isClosed: false },
          { isClosed: true },
        );

        res.json(apiResponse(true, issue));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to close issue"));
      }
    },
  );

  app.patch(
    "/api/admin/issues/:id/reopen",
    async (req: Request, res: Response) => {
      try {
        const existingIssue = await storage.getIssue(req.params.id);
        if (!existingIssue) {
          return res
            .status(404)
            .json(apiResponse(false, null, "Issue not found"));
        }

        const { adminId } = req.body;
        const issue = await storage.updateIssue(req.params.id, {
          isClosed: false,
        });

        await logAction(
          adminId || "admin",
          "Issue Reopened",
          "issues",
          req.params.id,
          { isClosed: true },
          { isClosed: false },
        );

        res.json(apiResponse(true, issue));
      } catch (error) {
        res.json(apiResponse(false, null, "Failed to reopen issue"));
      }
    },
  );

  app.delete("/api/admin/issues/:id", async (req: Request, res: Response) => {
    try {
      const existingIssue = await storage.getIssue(req.params.id);
      if (!existingIssue) {
        return res
          .status(404)
          .json(apiResponse(false, null, "Issue not found"));
      }

      const { adminId } = req.body;
      await storage.deleteIssue(req.params.id);

      await logAction(
        adminId || "admin",
        "Issue Deleted",
        "issues",
        req.params.id,
        existingIssue,
        null,
      );

      res.json(apiResponse(true, null));
    } catch (error) {
      res.json(apiResponse(false, null, "Failed to delete issue"));
    }
  });
}
