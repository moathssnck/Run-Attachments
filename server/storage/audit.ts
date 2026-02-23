import { randomUUID } from "crypto";
import type { AuditLog, InsertAuditLog, User } from "./types";

export async function getAllAuditLogs(
  auditLogs: Map<string, AuditLog>,
  users: Map<string, User>
): Promise<(AuditLog & { user?: User })[]> {
  const logs = Array.from(auditLogs.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return logs.map((log) => ({
    ...log,
    user: users.get(log.userId),
  }));
}

export function createAuditLog(
  auditLogs: Map<string, AuditLog>,
  insertLog: InsertAuditLog
): AuditLog {
  const id = randomUUID();
  const log: AuditLog = {
    id,
    userId: insertLog.userId,
    action: insertLog.action,
    module: insertLog.module,
    entityId: insertLog.entityId ?? null,
    oldValues: insertLog.oldValues ?? null,
    newValues: insertLog.newValues ?? null,
    ipAddress: insertLog.ipAddress ?? null,
    createdAt: new Date(),
  };
  auditLogs.set(id, log);
  return log;
}
