import type {
  User,
  InsertUser,
  Draw,
  InsertDraw,
  Ticket,
  InsertTicket,
  Payment,
  InsertPayment,
  Wallet,
  InsertWallet,
  WalletTransaction,
  InsertWalletTransaction,
  AuditLog,
  InsertAuditLog,
  Role,
  InsertRole,
  Permission,
  Refund,
  InsertRefund,
  RefundWithDetails,
  UserRoleAssignment,
  InsertUserRole,
  RolePermission,
  InsertRolePermission,
  DashboardStats,
  TicketWithDetails,
  DrawWithStats,
  DrawPrize,
  InsertDrawPrize,
  DrawResult,
  InsertDrawResult,
  DrawResultWithDetails,
  Issue,
  InsertIssue,
  SystemDefinition,
  InsertSystemDefinition,
  Prize,
  InsertPrize,
  SystemCategory,
  InsertSystemCategory,
  CustomSetting,
  InsertCustomSetting,
  CardSetting,
  SystemContent,
  InsertSystemContent,
} from "@shared/schema";

import * as userFns from "./users";
import * as drawFns from "./draws";
import * as ticketFns from "./tickets";
import * as paymentFns from "./payments";
import * as walletFns from "./wallets";
import * as auditFns from "./audit";
import * as roleFns from "./roles";
import * as permissionFns from "./permissions";
import * as refundFns from "./refunds";
import * as issueFns from "./issues";
import * as settingFns from "./settings";
import { initializeDefaultData } from "./seed";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMobile(mobile: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  getDraw(id: string): Promise<Draw | undefined>;
  getAllDraws(): Promise<DrawWithStats[]>;
  getActiveDraws(): Promise<Draw[]>;
  createDraw(draw: InsertDraw): Promise<Draw>;
  updateDraw(id: string, data: Partial<Draw>): Promise<Draw | undefined>;

  getTicket(id: string): Promise<Ticket | undefined>;
  getTicketsByUser(userId: string): Promise<TicketWithDetails[]>;
  getTicketsByDraw(drawId: string): Promise<Ticket[]>;
  getAllTickets(): Promise<TicketWithDetails[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket | undefined>;
  getTicketCount(drawId: string): Promise<number>;

  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  getAllPayments(): Promise<(Payment & { user?: User; ticket?: Ticket })[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(
    id: string,
    data: Partial<Payment>
  ): Promise<Payment | undefined>;

  getWallet(userId: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(
    userId: string,
    amount: number
  ): Promise<Wallet | undefined>;

  getWalletTransactions(walletId: string): Promise<WalletTransaction[]>;
  createWalletTransaction(
    transaction: InsertWalletTransaction
  ): Promise<WalletTransaction>;

  getAllAuditLogs(): Promise<(AuditLog & { user?: User })[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  getAllRoles(): Promise<Role[]>;
  getRole(id: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, data: Partial<Role>): Promise<Role | undefined>;
  deleteRole(id: string): Promise<void>;

  getAllPermissions(): Promise<Permission[]>;
  createPermission(permission: any): Promise<Permission>;
  clearAllPermissions(): Promise<void>;

  getAllRefunds(): Promise<RefundWithDetails[]>;
  getRefund(id: string): Promise<Refund | undefined>;
  createRefund(refund: InsertRefund): Promise<Refund>;
  updateRefund(id: string, data: Partial<Refund>): Promise<Refund | undefined>;

  getUserRoles(userId: string): Promise<UserRoleAssignment[]>;
  getAllUserRoleAssignments(): Promise<UserRoleAssignment[]>;
  assignUserRole(assignment: InsertUserRole): Promise<UserRoleAssignment>;
  removeUserRole(userId: string, roleId: string): Promise<void>;
  checkUserHasRole(userId: string, roleId: string): Promise<boolean>;
  getUsersByRoleId(roleId: string): Promise<string[]>;
  removeAllUsersFromRole(roleId: string): Promise<void>;
  removeAllRolesFromUser(userId: string): Promise<void>;

  getRolePermissions(roleId: string): Promise<RolePermission[]>;
  assignRolePermission(
    assignment: InsertRolePermission
  ): Promise<RolePermission>;
  removeRolePermission(roleId: string, permissionId: string): Promise<void>;
  getAllRolePermissions(): Promise<RolePermission[]>;

  getDrawPrizes(drawId: string): Promise<DrawPrize[]>;
  createDrawPrize(prize: InsertDrawPrize): Promise<DrawPrize>;
  updateDrawPrize(
    id: string,
    data: Partial<DrawPrize>
  ): Promise<DrawPrize | undefined>;
  deleteDrawPrize(id: string): Promise<void>;

  getDrawResults(drawId: string): Promise<DrawResultWithDetails[]>;
  createDrawResult(result: InsertDrawResult): Promise<DrawResult>;
  updateDrawResult(
    id: string,
    data: Partial<DrawResult>
  ): Promise<DrawResult | undefined>;

  getAllIssues(): Promise<Issue[]>;
  getIssue(id: string): Promise<Issue | undefined>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: string, data: Partial<Issue>): Promise<Issue | undefined>;
  deleteIssue(id: string): Promise<void>;

  getSystemDefinitions(category?: string): Promise<SystemDefinition[]>;
  getSystemDefinition(id: string): Promise<SystemDefinition | undefined>;
  createSystemDefinition(
    data: InsertSystemDefinition
  ): Promise<SystemDefinition>;
  updateSystemDefinition(
    id: string,
    data: Partial<SystemDefinition>
  ): Promise<SystemDefinition | undefined>;
  deleteSystemDefinition(id: string): Promise<void>;
  seedSystemDefinitions(): Promise<void>;

  getAllSystemCategories(): Promise<SystemCategory[]>;
  getSystemCategory(id: string): Promise<SystemCategory | undefined>;
  createSystemCategory(data: InsertSystemCategory): Promise<SystemCategory>;
  updateSystemCategory(
    id: string,
    data: Partial<SystemCategory>
  ): Promise<SystemCategory | undefined>;
  deleteSystemCategory(id: string): Promise<void>;

  getAllPrizes(): Promise<Prize[]>;
  getPrize(id: string): Promise<Prize | undefined>;
  createPrize(data: InsertPrize): Promise<Prize>;
  updatePrize(id: string, data: Partial<Prize>): Promise<Prize | undefined>;
  deletePrize(id: string): Promise<void>;

  getCustomSettings(): Promise<CustomSetting[]>;
  getCustomSetting(id: string): Promise<CustomSetting | undefined>;
  getCustomSettingByKey(key: string): Promise<CustomSetting | undefined>;
  createCustomSetting(data: InsertCustomSetting): Promise<CustomSetting>;
  updateCustomSetting(id: string, data: Partial<CustomSetting>): Promise<CustomSetting | undefined>;
  deleteCustomSetting(id: string): Promise<void>;

  getCardSettings(): Promise<CardSetting | undefined>;
  updateCardSettings(data: Partial<CardSetting>): Promise<CardSetting>;

  getAllSystemContent(): Promise<SystemContent[]>;
  getSystemContent(id: string): Promise<SystemContent | undefined>;
  getSystemContentBySlug(slug: string): Promise<SystemContent | undefined>;
  createSystemContent(data: InsertSystemContent): Promise<SystemContent>;
  updateSystemContent(id: string, data: Partial<SystemContent>): Promise<SystemContent | undefined>;
  deleteSystemContent(id: string): Promise<void>;

  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private draws: Map<string, Draw>;
  private tickets: Map<string, Ticket>;
  private payments: Map<string, Payment>;
  private wallets: Map<string, Wallet>;
  private walletTransactions: Map<string, WalletTransaction>;
  private auditLogs: Map<string, AuditLog>;
  private roles: Map<string, Role>;
  private permissions: Map<string, Permission>;
  private refunds: Map<string, Refund>;
  private userRolesMap: Map<string, UserRoleAssignment>;
  private rolePermissionsMap: Map<string, RolePermission>;
  private drawPrizes: Map<string, DrawPrize>;
  private drawResults: Map<string, DrawResult>;
  private issues: Map<string, Issue>;
  private systemDefinitions: Map<string, SystemDefinition>;
  private prizesMap: Map<string, Prize>;
  private customSettingsMap: Map<string, CustomSetting>;
  private cardSettingsMap: Map<string, CardSetting>;
  private systemCategoriesMap: Map<string, SystemCategory>;
  private systemContentMap: Map<string, SystemContent>;

  constructor() {
    this.users = new Map();
    this.draws = new Map();
    this.tickets = new Map();
    this.payments = new Map();
    this.wallets = new Map();
    this.walletTransactions = new Map();
    this.auditLogs = new Map();
    this.roles = new Map();
    this.permissions = new Map();
    this.refunds = new Map();
    this.userRolesMap = new Map();
    this.rolePermissionsMap = new Map();
    this.drawPrizes = new Map();
    this.drawResults = new Map();
    this.issues = new Map();
    this.systemDefinitions = new Map();
    this.prizesMap = new Map();
    this.customSettingsMap = new Map();
    this.cardSettingsMap = new Map();
    this.systemCategoriesMap = new Map();
    this.systemContentMap = new Map();

    initializeDefaultData({
      users: this.users,
      draws: this.draws,
      tickets: this.tickets,
      payments: this.payments,
      wallets: this.wallets,
      walletTransactions: this.walletTransactions,
      auditLogs: this.auditLogs,
      roles: this.roles,
      permissions: this.permissions,
      refunds: this.refunds,
      userRolesMap: this.userRolesMap,
      rolePermissionsMap: this.rolePermissionsMap,
      drawPrizes: this.drawPrizes,
      issues: this.issues,
      systemDefinitions: this.systemDefinitions,
      prizesMap: this.prizesMap,
      systemCategoriesMap: this.systemCategoriesMap,
      customSettingsMap: this.customSettingsMap,
      cardSettingsMap: this.cardSettingsMap,
      systemContentMap: this.systemContentMap,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return userFns.getUser(this.users, id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return userFns.getUserByEmail(this.users, email);
  }

  async getUserByMobile(mobile: string): Promise<User | undefined> {
    return userFns.getUserByMobile(this.users, mobile);
  }

  async getAllUsers(): Promise<User[]> {
    return userFns.getAllUsers(this.users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return userFns.createUser(this.users, insertUser);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    return userFns.updateUser(this.users, id, data);
  }

  async getDraw(id: string): Promise<Draw | undefined> {
    return drawFns.getDraw(this.draws, id);
  }

  async getAllDraws(): Promise<DrawWithStats[]> {
    return drawFns.getAllDraws(this.draws, this.tickets);
  }

  async getActiveDraws(): Promise<Draw[]> {
    return drawFns.getActiveDraws(this.draws);
  }

  async createDraw(insertDraw: InsertDraw): Promise<Draw> {
    return drawFns.createDraw(this.draws, insertDraw);
  }

  async updateDraw(id: string, data: Partial<Draw>): Promise<Draw | undefined> {
    return drawFns.updateDraw(this.draws, id, data);
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    return ticketFns.getTicket(this.tickets, id);
  }

  async getTicketsByUser(userId: string): Promise<TicketWithDetails[]> {
    return ticketFns.getTicketsByUser(this.tickets, this.draws, userId);
  }

  async getTicketsByDraw(drawId: string): Promise<Ticket[]> {
    return ticketFns.getTicketsByDraw(this.tickets, drawId);
  }

  async getAllTickets(): Promise<TicketWithDetails[]> {
    return ticketFns.getAllTickets(this.tickets, this.draws, this.users);
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    return ticketFns.createTicket(this.tickets, insertTicket);
  }

  async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket | undefined> {
    return ticketFns.updateTicket(this.tickets, id, data);
  }

  async getTicketCount(drawId: string): Promise<number> {
    return ticketFns.getTicketCount(this.tickets, drawId);
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    return paymentFns.getPayment(this.payments, id);
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return paymentFns.getPaymentsByUser(this.payments, userId);
  }

  async getAllPayments(): Promise<(Payment & { user?: User; ticket?: Ticket })[]> {
    return paymentFns.getAllPayments(this.payments, this.users, this.tickets);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    return paymentFns.createPayment(this.payments, insertPayment);
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined> {
    return paymentFns.updatePayment(this.payments, id, data);
  }

  async getWallet(userId: string): Promise<Wallet | undefined> {
    return walletFns.getWallet(this.wallets, userId);
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    return walletFns.createWallet(this.wallets, insertWallet);
  }

  async updateWalletBalance(userId: string, amount: number): Promise<Wallet | undefined> {
    return walletFns.updateWalletBalance(this.wallets, userId, amount);
  }

  async getWalletTransactions(walletId: string): Promise<WalletTransaction[]> {
    return walletFns.getWalletTransactions(this.walletTransactions, walletId);
  }

  async createWalletTransaction(insertTransaction: InsertWalletTransaction): Promise<WalletTransaction> {
    return walletFns.createWalletTransaction(this.walletTransactions, insertTransaction);
  }

  async getAllAuditLogs(): Promise<(AuditLog & { user?: User })[]> {
    return auditFns.getAllAuditLogs(this.auditLogs, this.users);
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    return auditFns.createAuditLog(this.auditLogs, insertLog);
  }

  async getAllRoles(): Promise<Role[]> {
    return roleFns.getAllRoles(this.roles);
  }

  async getRole(id: string): Promise<Role | undefined> {
    return roleFns.getRole(this.roles, id);
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    return roleFns.createRole(this.roles, insertRole);
  }

  async updateRole(id: string, data: Partial<Role>): Promise<Role | undefined> {
    return roleFns.updateRole(this.roles, id, data);
  }

  async deleteRole(id: string): Promise<void> {
    roleFns.deleteRole(this.roles, id);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return permissionFns.getAllPermissions(this.permissions);
  }

  async createPermission(permission: any): Promise<Permission> {
    return permissionFns.createPermission(this.permissions, permission);
  }

  async clearAllPermissions(): Promise<void> {
    permissionFns.clearAllPermissions(this.permissions);
  }

  async getAllRefunds(): Promise<RefundWithDetails[]> {
    return refundFns.getAllRefunds(this.refunds, this.tickets, this.payments, this.users);
  }

  async getRefund(id: string): Promise<Refund | undefined> {
    return refundFns.getRefund(this.refunds, id);
  }

  async createRefund(insertRefund: InsertRefund): Promise<Refund> {
    return refundFns.createRefund(this.refunds, insertRefund);
  }

  async updateRefund(id: string, data: Partial<Refund>): Promise<Refund | undefined> {
    return refundFns.updateRefund(this.refunds, id, data);
  }

  async getUserRoles(userId: string): Promise<UserRoleAssignment[]> {
    return roleFns.getUserRoles(this.userRolesMap, userId);
  }

  async getAllUserRoleAssignments(): Promise<UserRoleAssignment[]> {
    return roleFns.getAllUserRoleAssignments(this.userRolesMap);
  }

  async assignUserRole(assignment: InsertUserRole): Promise<UserRoleAssignment> {
    return roleFns.assignUserRole(this.userRolesMap, assignment);
  }

  async removeUserRole(userId: string, roleId: string): Promise<void> {
    roleFns.removeUserRole(this.userRolesMap, userId, roleId);
  }

  async checkUserHasRole(userId: string, roleId: string): Promise<boolean> {
    return roleFns.checkUserHasRole(this.userRolesMap, userId, roleId);
  }

  async getUsersByRoleId(roleId: string): Promise<string[]> {
    return roleFns.getUsersByRoleId(this.userRolesMap, roleId);
  }

  async removeAllUsersFromRole(roleId: string): Promise<void> {
    roleFns.removeAllUsersFromRole(this.userRolesMap, roleId);
  }

  async removeAllRolesFromUser(userId: string): Promise<void> {
    roleFns.removeAllRolesFromUser(this.userRolesMap, userId);
  }

  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return roleFns.getRolePermissions(this.rolePermissionsMap, roleId);
  }

  async assignRolePermission(assignment: InsertRolePermission): Promise<RolePermission> {
    return roleFns.assignRolePermission(this.rolePermissionsMap, assignment);
  }

  async removeRolePermission(roleId: string, permissionId: string): Promise<void> {
    roleFns.removeRolePermission(this.rolePermissionsMap, roleId, permissionId);
  }

  async getAllRolePermissions(): Promise<RolePermission[]> {
    return roleFns.getAllRolePermissions(this.rolePermissionsMap);
  }

  async getDrawPrizes(drawId: string): Promise<DrawPrize[]> {
    return drawFns.getDrawPrizes(this.drawPrizes, drawId);
  }

  async createDrawPrize(insertPrize: InsertDrawPrize): Promise<DrawPrize> {
    return drawFns.createDrawPrize(this.drawPrizes, insertPrize);
  }

  async updateDrawPrize(id: string, data: Partial<DrawPrize>): Promise<DrawPrize | undefined> {
    return drawFns.updateDrawPrize(this.drawPrizes, id, data);
  }

  async deleteDrawPrize(id: string): Promise<void> {
    drawFns.deleteDrawPrize(this.drawPrizes, id);
  }

  async getDrawResults(drawId: string): Promise<DrawResultWithDetails[]> {
    return drawFns.getDrawResults(this.drawResults, this.drawPrizes, this.tickets, this.users, drawId);
  }

  async createDrawResult(insertResult: InsertDrawResult): Promise<DrawResult> {
    return drawFns.createDrawResult(this.drawResults, insertResult);
  }

  async updateDrawResult(id: string, data: Partial<DrawResult>): Promise<DrawResult | undefined> {
    return drawFns.updateDrawResult(this.drawResults, id, data);
  }

  async getAllIssues(): Promise<Issue[]> {
    return issueFns.getAllIssues(this.issues);
  }

  async getIssue(id: string): Promise<Issue | undefined> {
    return issueFns.getIssue(this.issues, id);
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    return issueFns.createIssue(this.issues, insertIssue);
  }

  async updateIssue(id: string, data: Partial<Issue>): Promise<Issue | undefined> {
    return issueFns.updateIssue(this.issues, id, data);
  }

  async deleteIssue(id: string): Promise<void> {
    issueFns.deleteIssue(this.issues, id);
  }

  async getSystemDefinitions(category?: string): Promise<SystemDefinition[]> {
    return settingFns.getSystemDefinitions(this.systemDefinitions, category);
  }

  async getSystemDefinition(id: string): Promise<SystemDefinition | undefined> {
    return settingFns.getSystemDefinition(this.systemDefinitions, id);
  }

  async createSystemDefinition(data: InsertSystemDefinition): Promise<SystemDefinition> {
    return settingFns.createSystemDefinition(this.systemDefinitions, data);
  }

  async updateSystemDefinition(id: string, data: Partial<SystemDefinition>): Promise<SystemDefinition | undefined> {
    return settingFns.updateSystemDefinition(this.systemDefinitions, id, data);
  }

  async deleteSystemDefinition(id: string): Promise<void> {
    settingFns.deleteSystemDefinition(this.systemDefinitions, id);
  }

  async seedSystemDefinitions(): Promise<void> {
    settingFns.seedSystemDefinitions(this.systemDefinitions);
  }

  async getAllSystemCategories(): Promise<SystemCategory[]> {
    return settingFns.getAllSystemCategories(this.systemCategoriesMap);
  }

  async getSystemCategory(id: string): Promise<SystemCategory | undefined> {
    return settingFns.getSystemCategory(this.systemCategoriesMap, id);
  }

  async createSystemCategory(data: InsertSystemCategory): Promise<SystemCategory> {
    return settingFns.createSystemCategory(this.systemCategoriesMap, data);
  }

  async updateSystemCategory(id: string, data: Partial<SystemCategory>): Promise<SystemCategory | undefined> {
    return settingFns.updateSystemCategory(this.systemCategoriesMap, id, data);
  }

  async deleteSystemCategory(id: string): Promise<void> {
    settingFns.deleteSystemCategory(this.systemCategoriesMap, id);
  }

  async getAllPrizes(): Promise<Prize[]> {
    return settingFns.getAllPrizes(this.prizesMap);
  }

  async getPrize(id: string): Promise<Prize | undefined> {
    return settingFns.getPrize(this.prizesMap, id);
  }

  async createPrize(data: InsertPrize): Promise<Prize> {
    return settingFns.createPrize(this.prizesMap, data);
  }

  async updatePrize(id: string, data: Partial<Prize>): Promise<Prize | undefined> {
    return settingFns.updatePrize(this.prizesMap, id, data);
  }

  async deletePrize(id: string): Promise<void> {
    settingFns.deletePrize(this.prizesMap, id);
  }

  async getCustomSettings(): Promise<CustomSetting[]> {
    return settingFns.getCustomSettings(this.customSettingsMap);
  }

  async getCustomSetting(id: string): Promise<CustomSetting | undefined> {
    return settingFns.getCustomSetting(this.customSettingsMap, id);
  }

  async getCustomSettingByKey(key: string): Promise<CustomSetting | undefined> {
    return settingFns.getCustomSettingByKey(this.customSettingsMap, key);
  }

  async createCustomSetting(data: InsertCustomSetting): Promise<CustomSetting> {
    return settingFns.createCustomSetting(this.customSettingsMap, data);
  }

  async updateCustomSetting(id: string, data: Partial<CustomSetting>): Promise<CustomSetting | undefined> {
    return settingFns.updateCustomSetting(this.customSettingsMap, id, data);
  }

  async deleteCustomSetting(id: string): Promise<void> {
    settingFns.deleteCustomSetting(this.customSettingsMap, id);
  }

  async getCardSettings(): Promise<CardSetting | undefined> {
    return settingFns.getCardSettings(this.cardSettingsMap);
  }

  async updateCardSettings(data: Partial<CardSetting>): Promise<CardSetting> {
    const current = await this.getCardSettings();
    return settingFns.updateCardSettings(this.cardSettingsMap, data, current);
  }

  async getAllSystemContent(): Promise<SystemContent[]> {
    return settingFns.getAllSystemContent(this.systemContentMap);
  }

  async getSystemContent(id: string): Promise<SystemContent | undefined> {
    return settingFns.getSystemContent(this.systemContentMap, id);
  }

  async getSystemContentBySlug(slug: string): Promise<SystemContent | undefined> {
    return settingFns.getSystemContentBySlug(this.systemContentMap, slug);
  }

  async createSystemContent(data: InsertSystemContent): Promise<SystemContent> {
    return settingFns.createSystemContent(this.systemContentMap, data);
  }

  async updateSystemContent(id: string, data: Partial<SystemContent>): Promise<SystemContent | undefined> {
    return settingFns.updateSystemContent(this.systemContentMap, id, data);
  }

  async deleteSystemContent(id: string): Promise<void> {
    settingFns.deleteSystemContent(this.systemContentMap, id);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return settingFns.getDashboardStats(
      this.users,
      this.draws,
      this.tickets,
      () => this.getAllDraws(),
      () => this.getAllTickets()
    );
  }
}

export const storage = new MemStorage();
