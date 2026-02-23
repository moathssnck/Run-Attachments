import { randomUUID } from "crypto";
import type { Issue, InsertIssue } from "./types";

export function getAllIssues(issues: Map<string, Issue>): Issue[] {
  return Array.from(issues.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getIssue(issues: Map<string, Issue>, id: string): Issue | undefined {
  return issues.get(id);
}

export function createIssue(issues: Map<string, Issue>, insertIssue: InsertIssue): Issue {
  const id = randomUUID();
  const issue: Issue = {
    id,
    issueNumber: insertIssue.issueNumber,
    issueType: insertIssue.issueType || "regular",
    startDate: new Date(insertIssue.startDate),
    endDate: new Date(insertIssue.endDate),
    totalTickets: insertIssue.totalTickets,
    ticketsPerBook: insertIssue.ticketsPerBook || 10,
    totalBooks: insertIssue.totalBooks,
    bookPrice: insertIssue.bookPrice,
    startTicketNumber: insertIssue.startTicketNumber || 1,
    endTicketNumber: insertIssue.endTicketNumber,
    prizesAccountNumber: insertIssue.prizesAccountNumber || null,
    isClosed: insertIssue.isClosed || false,
    createdBy: insertIssue.createdBy,
    createdAt: new Date(),
  };
  issues.set(id, issue);
  return issue;
}

export function updateIssue(
  issues: Map<string, Issue>,
  id: string,
  data: Partial<Issue>
): Issue | undefined {
  const issue = issues.get(id);
  if (!issue) return undefined;
  const updated = { ...issue, ...data };
  issues.set(id, updated);
  return updated;
}

export function deleteIssue(issues: Map<string, Issue>, id: string): void {
  issues.delete(id);
}
