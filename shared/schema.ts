import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User status enum
export const userStatuses = [
  "active",
  "suspended",
  "locked",
  "pending",
] as const;
export type UserStatus = (typeof userStatuses)[number];

// User roles enum
export const userRoles = [
  "end_user",
  "admin",
  "finance_admin",
  "system_admin",
  "auditor",
] as const;
export type UserRole = (typeof userRoles)[number];

// Draw status enum
export const drawStatuses = [
  "new",
  "approved",
  "scheduled",
  "active",
  "closed",
  "completed",
] as const;
export type DrawStatus = (typeof drawStatuses)[number];

// Prize category enum
export const prizeCategories = [
  "grand",
  "first",
  "second",
  "third",
  "consolation",
] as const;
export type PrizeCategory = (typeof prizeCategories)[number];

// Ticket status enum
export const ticketStatuses = [
  "pending",
  "active",
  "won",
  "lost",
  "voided",
] as const;
export type TicketStatus = (typeof ticketStatuses)[number];

// Payment status enum
export const paymentStatuses = [
  "pending",
  "completed",
  "failed",
  "refunded",
] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

// Wallet transaction types
export const transactionTypes = [
  "credit",
  "debit",
  "prize",
  "refund",
  "purchase",
] as const;
export type TransactionType = (typeof transactionTypes)[number];

// ============ USERS TABLE ============
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  mobile: varchar("mobile", { length: 20 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  role: varchar("role", { length: 20 }).notNull().default("end_user"),
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  passwordExpiryDate: timestamp("password_expiry_date"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Personal information
  dateOfBirth: timestamp("date_of_birth"),
  nationalId: varchar("national_id", { length: 20 }),
  gender: varchar("gender", { length: 10 }),
  // Address information
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Jordan"),
  postalCode: varchar("postal_code", { length: 20 }),
  region: varchar("region", { length: 100 }),
  street: varchar("street", { length: 255 }),
  // Additional contact information
  phoneCode: varchar("phone_code", { length: 10 }),
  secondaryPhone: varchar("secondary_phone", { length: 20 }),
  workEmail: varchar("work_email", { length: 255 }),
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  passportOrIdNumber: varchar("passport_id_number", { length: 50 }),
  profilePhoto: text("profile_photo"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  failedLoginAttempts: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Registration schema with validation
export const registrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(7, "Phone number must be at least 7 digits"),
  codePhoneNumberId: z.number().int().min(1, "Country code is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  Birthday: z.string().optional(),
  gender: z.number().int().min(0).max(2).optional(),
  countryId: z.number().int().min(1, "Country is required"),
  city: z.string().optional(),
  area: z.string().optional(),
  Address: z.string().optional(),
  documentOrPassportNumber: z.string().min(1, "ID or passport number is required").max(50),
  profileImage: z.string().optional(),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "You must accept terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegistrationData = z.infer<typeof registrationSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
  Language: z.string().optional(),
});

export type LoginData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  resetToken: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ============ ROLES TABLE ============
export const roles = pgTable("roles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  isSystem: boolean("is_system").notNull().default(false),
  status: varchar("status", { length: 20 }).notNull().default("active"),
});

export const insertRoleSchema = createInsertSchema(roles).omit({ id: true });
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// ============ PERMISSIONS TABLE ============
export const permissions = pgTable("permissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  nameAr: varchar("name_ar", { length: 100 }),
  descriptionEn: varchar("description_en", { length: 255 }),
  descriptionAr: varchar("description_ar", { length: 255 }),
  module: varchar("module", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  parentId: varchar("parent_id", { length: 36 }),
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
});
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissions.$inferSelect;

// ============ USER_ROLES JUNCTION TABLE ============
export const userRolesTable = pgTable("user_roles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  roleId: varchar("role_id", { length: 36 }).notNull(),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  assignedBy: varchar("assigned_by", { length: 36 }),
});

export const insertUserRoleSchema = createInsertSchema(userRolesTable).omit({
  id: true,
  assignedAt: true,
});
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRoleAssignment = typeof userRolesTable.$inferSelect;

// ============ ROLE_PERMISSIONS JUNCTION TABLE ============
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  roleId: varchar("role_id", { length: 36 }).notNull(),
  permissionId: varchar("permission_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRolePermissionSchema = createInsertSchema(
  rolePermissions,
).omit({ id: true, createdAt: true });
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;

// ============ DRAWS TABLE ============
export const draws = pgTable("draws", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).notNull(),
  drawDate: timestamp("draw_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("scheduled"),
  maxTickets: integer("max_tickets").notNull().default(1000),
  winningNumbers: text("winning_numbers"),
  prizePool: decimal("prize_pool", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  createdBy: varchar("created_by", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDrawSchema = createInsertSchema(draws).omit({
  id: true,
  createdAt: true,
  winningNumbers: true,
});

export type InsertDraw = z.infer<typeof insertDrawSchema>;
export type Draw = typeof draws.$inferSelect;

// Create draw form schema
export const createDrawSchema = z.object({
  name: z.string().min(1, "Draw name is required").max(200),
  description: z.string().optional(),
  ticketPrice: z.string().min(1, "Ticket price is required"),
  drawDate: z.string().min(1, "Draw date is required"),
  maxTickets: z.number().min(1, "Must have at least 1 ticket"),
  prizePool: z.string().optional(),
});

export type CreateDrawData = z.infer<typeof createDrawSchema>;

// ============ DRAW PRIZES TABLE ============
export const drawPrizes = pgTable("draw_prizes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  drawId: varchar("draw_id", { length: 36 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  prizeAmount: decimal("prize_amount", { precision: 12, scale: 2 }).notNull(),
  winnerCount: integer("winner_count").notNull().default(1),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDrawPrizeSchema = createInsertSchema(drawPrizes).omit({
  id: true,
  createdAt: true,
});

export type InsertDrawPrize = z.infer<typeof insertDrawPrizeSchema>;
export type DrawPrize = typeof drawPrizes.$inferSelect;

// ============ PRIZES TABLE (Prize Templates) ============
export const prizes = pgTable("prizes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  level: integer("level").notNull().default(1),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPrizeSchema = createInsertSchema(prizes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPrize = z.infer<typeof insertPrizeSchema>;
export type Prize = typeof prizes.$inferSelect;

// ============ DRAW RESULTS TABLE ============
export const drawResults = pgTable("draw_results", {
  id: varchar("id", { length: 36 }).primaryKey(),
  drawId: varchar("draw_id", { length: 36 }).notNull(),
  ticketId: varchar("ticket_id", { length: 36 }).notNull(),
  prizeId: varchar("prize_id", { length: 36 }).notNull(),
  winAmount: decimal("win_amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  creditedAt: timestamp("credited_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDrawResultSchema = createInsertSchema(drawResults).omit({
  id: true,
  createdAt: true,
  creditedAt: true,
});

export type InsertDrawResult = z.infer<typeof insertDrawResultSchema>;
export type DrawResult = typeof drawResults.$inferSelect;

// Draw Result with details
export interface DrawResultWithDetails extends DrawResult {
  ticket?: Ticket;
  prize?: DrawPrize;
  user?: User;
}

// ============ TICKETS TABLE ============
export const tickets = pgTable("tickets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 20 }).notNull(),
  drawId: varchar("draw_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  selectedNumbers: text("selected_numbers").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  prizeAmount: decimal("prize_amount", { precision: 10, scale: 2 }),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  purchasedAt: true,
  prizeAmount: true,
});

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

// ============ PAYMENTS TABLE ============
export const payments = pgTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ticketId: varchar("ticket_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// ============ WALLETS TABLE ============
export const wallets = pgTable("wallets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  updatedAt: true,
});

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

// ============ WALLET TRANSACTIONS TABLE ============
export const walletTransactions = pgTable("wallet_transactions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  walletId: varchar("wallet_id", { length: 36 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  referenceId: varchar("reference_id", { length: 36 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWalletTransactionSchema = createInsertSchema(
  walletTransactions,
).omit({
  id: true,
  createdAt: true,
});

export type InsertWalletTransaction = z.infer<
  typeof insertWalletTransactionSchema
>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;

// ============ AUDIT LOGS TABLE ============
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  module: varchar("module", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 36 }),
  oldValues: text("old_values"),
  newValues: text("new_values"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ============ REFUNDS TABLE ============
export const refundStatuses = [
  "pending",
  "approved",
  "rejected",
  "processed",
] as const;
export type RefundStatus = (typeof refundStatuses)[number];

export const refunds = pgTable("refunds", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ticketId: varchar("ticket_id", { length: 36 }).notNull(),
  paymentId: varchar("payment_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  requestedBy: varchar("requested_by", { length: 36 }).notNull(),
  approvedBy: varchar("approved_by", { length: 36 }),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRefundSchema = createInsertSchema(refunds).omit({
  id: true,
  createdAt: true,
  approvedBy: true,
  approvedAt: true,
});

export type InsertRefund = z.infer<typeof insertRefundSchema>;
export type Refund = typeof refunds.$inferSelect;

// Refund with related entities
export interface RefundWithDetails extends Refund {
  ticket?: Ticket;
  payment?: Payment;
  user?: User;
  requestedByUser?: User;
  approvedByUser?: User;
}

// ============ ISSUES TABLE (الإصدارات) ============
export const issueTypes = ["regular", "special", "support"] as const;
export type IssueType = (typeof issueTypes)[number];

export const issues = pgTable("issues", {
  id: varchar("id", { length: 36 }).primaryKey(),
  issueNumber: varchar("issue_number", { length: 20 }).notNull().unique(),
  issueType: varchar("issue_type", { length: 20 }).notNull().default("regular"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalTickets: integer("total_tickets").notNull(),
  ticketsPerBook: integer("tickets_per_book").notNull().default(10),
  totalBooks: integer("total_books").notNull(),
  bookPrice: decimal("book_price", { precision: 10, scale: 2 }).notNull(),
  startTicketNumber: integer("start_ticket_number").notNull().default(1),
  endTicketNumber: integer("end_ticket_number").notNull(),
  prizesAccountNumber: varchar("prizes_account_number", { length: 50 }),
  isClosed: boolean("is_closed").notNull().default(false),
  createdBy: varchar("created_by", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertIssueSchema = createInsertSchema(issues).omit({
  id: true,
  createdAt: true,
});

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;

// Create issue form schema
export const createIssueSchema = z.object({
  issueNumber: z.string().min(1, "رقم الإصدار مطلوب").max(20),
  issueType: z.enum(issueTypes),
  startDate: z.string().min(1, "تاريخ البداية مطلوب"),
  endDate: z.string().min(1, "تاريخ النهاية مطلوب"),
  totalTickets: z.number().min(1, "يجب أن يكون عدد البطاقات أكبر من 0"),
  ticketsPerBook: z
    .number()
    .min(1, "يجب أن يكون عدد البطاقات في الدفتر أكبر من 0"),
  bookPrice: z.string().min(1, "سعر الدفتر مطلوب"),
  startTicketNumber: z.number().min(1, "رقم بداية البطاقات مطلوب"),
  prizesAccountNumber: z.string().optional(),
});

export type CreateIssueData = z.infer<typeof createIssueSchema>;

// ============ SYSTEM DEFINITIONS TABLE ============
export const systemDefinitions = pgTable("system_definitions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  code: varchar("code", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  parentId: varchar("parent_id", { length: 36 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSystemDefinitionSchema = createInsertSchema(
  systemDefinitions,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSystemDefinition = z.infer<
  typeof insertSystemDefinitionSchema
>;
export type SystemDefinition = typeof systemDefinitions.$inferSelect;

// ============ API RESPONSE TYPES ============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============ SESSION/AUTH TYPES ============
export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface DashboardStats {
  totalUsers: number;
  activeDraws: number;
  totalTicketsSold: number;
  totalTicketsCancelled: number;
  totalTicketsRemaining: number;
  totalTicketsAvailable: number;
  totalRevenue: string;
  recentUsers: User[];
  recentTickets: (Ticket & { draw?: Draw; user?: User })[];
}

// ============ SYSTEM CATEGORIES TABLE ============
export const systemCategories = pgTable("system_categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertSystemCategorySchema = createInsertSchema(
  systemCategories,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSystemCategory = z.infer<typeof insertSystemCategorySchema>;
export type SystemCategory = typeof systemCategories.$inferSelect;

// Draw with additional computed fields
export interface DrawWithStats extends Draw {
  ticketsSold: number;
  ticketsCancelled: number;
  ticketsRemaining: number;
  revenue: string;
  prizes?: DrawPrize[];
}

// Ticket with related entities
export interface TicketWithDetails extends Ticket {
  draw?: Draw;
  user?: User;
  payment?: Payment;
}

// ============ CUSTOM SETTINGS TABLE ============
export const customSettings = pgTable("custom_settings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  value: text("value").notNull(),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCustomSettingSchema = createInsertSchema(
  customSettings,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomSetting = z.infer<typeof insertCustomSettingSchema>;
export type CustomSetting = typeof customSettings.$inferSelect;

// ============ CARD SETTINGS TABLE ============
export const cardSettings = pgTable("card_settings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  topbarImage: text("topbar_image"),
  backgroundImage: text("background_image"),
  imageDescription: text("image_description"),
  imageDescriptionEn: text("image_description_en"),
  cardPrice: decimal("card_price", { precision: 10, scale: 2 }).notNull().default("5.00"),
  managerSignature: text("manager_signature"),
  managerName: varchar("manager_name", { length: 255 }),
  managerNameEn: varchar("manager_name_en", { length: 255 }),
  managerTitle: varchar("manager_title", { length: 255 }),
  managerTitleEn: varchar("manager_title_en", { length: 255 }),
  chairmanSignature: text("chairman_signature"),
  chairmanName: varchar("chairman_name", { length: 255 }),
  chairmanNameEn: varchar("chairman_name_en", { length: 255 }),
  chairmanTitle: varchar("chairman_title", { length: 255 }),
  chairmanTitleEn: varchar("chairman_title_en", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCardSettingSchema = createInsertSchema(cardSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCardSetting = z.infer<typeof insertCardSettingSchema>;
export type CardSetting = typeof cardSettings.$inferSelect;

// ============ SYSTEM CONTENT TABLE ============
export const systemContent = pgTable("system_content", {
  id: varchar("id", { length: 36 }).primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  titleAr: varchar("title_ar", { length: 255 }).notNull(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  contentAr: text("content_ar").notNull().default(""),
  contentEn: text("content_en").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSystemContentSchema = createInsertSchema(systemContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSystemContent = z.infer<typeof insertSystemContentSchema>;
export type SystemContent = typeof systemContent.$inferSelect;
