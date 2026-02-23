import { randomUUID } from "crypto";
import type { User, InsertUser } from "./types";

export function getUser(users: Map<string, User>, id: string): User | undefined {
  return users.get(id);
}

export function getUserByEmail(users: Map<string, User>, email: string): User | undefined {
  return Array.from(users.values()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

export function getUserByMobile(users: Map<string, User>, mobile: string): User | undefined {
  return Array.from(users.values()).find((u) => u.mobile === mobile);
}

export function getAllUsers(users: Map<string, User>): User[] {
  return Array.from(users.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createUser(users: Map<string, User>, insertUser: InsertUser): User {
  const id = randomUUID();
  const user: User = {
    id,
    email: insertUser.email,
    passwordHash: insertUser.passwordHash,
    firstName: insertUser.firstName,
    lastName: insertUser.lastName,
    mobile: insertUser.mobile,
    status: insertUser.status || "pending",
    role: insertUser.role || "end_user",
    mfaEnabled: insertUser.mfaEnabled ?? false,
    failedLoginAttempts: 0,
    passwordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    lastLogin: null,
    createdAt: new Date(),
    dateOfBirth: insertUser.dateOfBirth
      ? new Date(insertUser.dateOfBirth)
      : null,
    nationalId: insertUser.nationalId || null,
    gender: insertUser.gender || null,
    address: insertUser.address || null,
    city: insertUser.city || null,
    country: insertUser.country || "Jordan",
    postalCode: insertUser.postalCode || null,
    region: insertUser.region || null,
    street: insertUser.street || null,
    phoneCode: insertUser.phoneCode || null,
    passportOrIdNumber: insertUser.passportOrIdNumber || null,
    secondaryPhone: insertUser.secondaryPhone || null,
    workEmail: insertUser.workEmail || null,
    emergencyContact: insertUser.emergencyContact || null,
    emergencyPhone: insertUser.emergencyPhone || null,
    profilePhoto: insertUser.profilePhoto || null,
  };
  users.set(id, user);
  return user;
}

export function updateUser(users: Map<string, User>, id: string, data: Partial<User>): User | undefined {
  const user = users.get(id);
  if (!user) return undefined;
  const updated = { ...user, ...data };
  users.set(id, updated);
  return updated;
}
