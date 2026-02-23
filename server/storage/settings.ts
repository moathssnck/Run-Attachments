import { randomUUID } from "crypto";
import type {
  SystemDefinition,
  InsertSystemDefinition,
  SystemCategory,
  InsertSystemCategory,
  Prize,
  InsertPrize,
  CustomSetting,
  InsertCustomSetting,
  CardSetting,
  DashboardStats,
  Draw,
  DrawWithStats,
  Ticket,
  TicketWithDetails,
  User,
  SystemContent,
  InsertSystemContent,
} from "./types";

export function getSystemDefinitions(
  systemDefinitions: Map<string, SystemDefinition>,
  category?: string
): SystemDefinition[] {
  const definitions = Array.from(systemDefinitions.values());
  if (category) {
    return definitions.filter((d) => d.category === category);
  }
  return definitions.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getSystemDefinition(
  systemDefinitions: Map<string, SystemDefinition>,
  id: string
): SystemDefinition | undefined {
  return systemDefinitions.get(id);
}

export function createSystemDefinition(
  systemDefinitions: Map<string, SystemDefinition>,
  data: InsertSystemDefinition
): SystemDefinition {
  const id = randomUUID();
  const now = new Date();
  const definition: SystemDefinition = {
    id,
    category: data.category,
    code: data.code,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    descriptionAr: data.descriptionAr || null,
    descriptionEn: data.descriptionEn || null,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    parentId: data.parentId || null,
    createdAt: now,
    updatedAt: now,
  };
  systemDefinitions.set(id, definition);
  return definition;
}

export function updateSystemDefinition(
  systemDefinitions: Map<string, SystemDefinition>,
  id: string,
  data: Partial<SystemDefinition>
): SystemDefinition | undefined {
  const definition = systemDefinitions.get(id);
  if (!definition) return undefined;
  const updated = { ...definition, ...data, updatedAt: new Date() };
  systemDefinitions.set(id, updated);
  return updated;
}

export function deleteSystemDefinition(
  systemDefinitions: Map<string, SystemDefinition>,
  id: string
): void {
  systemDefinitions.delete(id);
}

export function seedSystemDefinitions(
  systemDefinitions: Map<string, SystemDefinition>
): void {
  systemDefinitions.clear();
}

export function getAllSystemCategories(
  systemCategoriesMap: Map<string, SystemCategory>
): SystemCategory[] {
  return Array.from(systemCategoriesMap.values()).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function getSystemCategory(
  systemCategoriesMap: Map<string, SystemCategory>,
  id: string
): SystemCategory | undefined {
  return systemCategoriesMap.get(id);
}

export function createSystemCategory(
  systemCategoriesMap: Map<string, SystemCategory>,
  data: InsertSystemCategory
): SystemCategory {
  const id = randomUUID();
  const now = new Date();
  const category: SystemCategory = {
    id,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    description: data.description || null,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  systemCategoriesMap.set(id, category);
  return category;
}

export function updateSystemCategory(
  systemCategoriesMap: Map<string, SystemCategory>,
  id: string,
  data: Partial<SystemCategory>
): SystemCategory | undefined {
  const category = systemCategoriesMap.get(id);
  if (!category) return undefined;
  const updated = { ...category, ...data, updatedAt: new Date() };
  systemCategoriesMap.set(id, updated);
  return updated;
}

export function deleteSystemCategory(
  systemCategoriesMap: Map<string, SystemCategory>,
  id: string
): void {
  systemCategoriesMap.delete(id);
}

export function getAllPrizes(prizesMap: Map<string, Prize>): Prize[] {
  return Array.from(prizesMap.values()).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function getPrize(prizesMap: Map<string, Prize>, id: string): Prize | undefined {
  return prizesMap.get(id);
}

export function createPrize(prizesMap: Map<string, Prize>, data: InsertPrize): Prize {
  const id = randomUUID();
  const now = new Date();
  const prize: Prize = {
    id,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    descriptionAr: data.descriptionAr || null,
    descriptionEn: data.descriptionEn || null,
    value: data.value,
    category: data.category,
    level: data.level ?? 1,
    imageUrl: data.imageUrl || null,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  prizesMap.set(id, prize);
  return prize;
}

export function updatePrize(
  prizesMap: Map<string, Prize>,
  id: string,
  data: Partial<Prize>
): Prize | undefined {
  const prize = prizesMap.get(id);
  if (!prize) return undefined;
  const updated = { ...prize, ...data, updatedAt: new Date() };
  prizesMap.set(id, updated);
  return updated;
}

export function deletePrize(prizesMap: Map<string, Prize>, id: string): void {
  prizesMap.delete(id);
}

export function getCustomSettings(customSettingsMap: Map<string, CustomSetting>): CustomSetting[] {
  return Array.from(customSettingsMap.values()).sort((a, b) =>
    a.key.localeCompare(b.key)
  );
}

export function getCustomSetting(
  customSettingsMap: Map<string, CustomSetting>,
  id: string
): CustomSetting | undefined {
  return customSettingsMap.get(id);
}

export function getCustomSettingByKey(
  customSettingsMap: Map<string, CustomSetting>,
  key: string
): CustomSetting | undefined {
  return Array.from(customSettingsMap.values()).find(
    (s) => s.key === key
  );
}

export function createCustomSetting(
  customSettingsMap: Map<string, CustomSetting>,
  data: InsertCustomSetting
): CustomSetting {
  const id = randomUUID();
  const now = new Date();
  const setting: CustomSetting = {
    id,
    key: data.key,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    value: data.value,
    descriptionAr: data.descriptionAr ?? null,
    descriptionEn: data.descriptionEn ?? null,
    isActive: data.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
  customSettingsMap.set(id, setting);
  return setting;
}

export function updateCustomSetting(
  customSettingsMap: Map<string, CustomSetting>,
  id: string,
  data: Partial<CustomSetting>
): CustomSetting | undefined {
  const existing = customSettingsMap.get(id);
  if (!existing) return undefined;
  const updated: CustomSetting = {
    ...existing,
    ...data,
    updatedAt: new Date(),
  };
  customSettingsMap.set(id, updated);
  return updated;
}

export function deleteCustomSetting(
  customSettingsMap: Map<string, CustomSetting>,
  id: string
): void {
  customSettingsMap.delete(id);
}

export function getCardSettings(cardSettingsMap: Map<string, CardSetting>): CardSetting | undefined {
  const settings = Array.from(cardSettingsMap.values());
  return settings.length > 0 ? settings[0] : undefined;
}

export function updateCardSettings(
  cardSettingsMap: Map<string, CardSetting>,
  data: Partial<CardSetting>,
  currentSettings: CardSetting | undefined
): CardSetting {
  let settings = currentSettings;

  if (!settings) {
    const id = randomUUID();
    const now = new Date();

    settings = {
      id,
      topbarImage: null,
      backgroundImage: null,
      imageDescription: null,
      imageDescriptionEn: null,
      cardPrice: "5.00",
      managerSignature: null,
      managerName: null,
      managerNameEn: null,
      managerTitle: null,
      managerTitleEn: null,
      chairmanSignature: null,
      chairmanName: null,
      chairmanNameEn: null,
      chairmanTitle: null,
      chairmanTitleEn: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  const updated: CardSetting = {
    ...settings,
    ...data,
    updatedAt: new Date(),
  };

  cardSettingsMap.set(updated.id, updated);
  return updated;
}

export async function getDashboardStats(
  users: Map<string, User>,
  draws: Map<string, Draw>,
  tickets: Map<string, Ticket>,
  getAllDrawsFn: () => Promise<DrawWithStats[]>,
  getAllTicketsFn: () => Promise<TicketWithDetails[]>
): Promise<DashboardStats> {
  const allUsers = Array.from(users.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const allDraws = await getAllDrawsFn();
  const allTickets = await getAllTicketsFn();

  const activeDraws = allDraws.filter((d) => d.status === "active").length;
  const totalRevenue = allDraws.reduce(
    (sum, d) => sum + parseFloat(d.revenue),
    0
  );

  const totalTicketsSold = allDraws.reduce((sum, d) => sum + d.ticketsSold, 0);
  const totalTicketsCancelled = allDraws.reduce(
    (sum, d) => sum + d.ticketsCancelled,
    0
  );
  const totalTicketsRemaining = allDraws.reduce(
    (sum, d) => sum + d.ticketsRemaining,
    0
  );
  const totalTicketsAvailable = allDraws.reduce(
    (sum, d) => sum + (d.maxTickets ?? 0),
    0
  );

  return {
    totalUsers: allUsers.length,
    activeDraws,
    totalTicketsSold,
    totalTicketsCancelled,
    totalTicketsRemaining,
    totalTicketsAvailable,
    totalRevenue: totalRevenue.toFixed(2),
    recentUsers: allUsers.slice(0, 5),
    recentTickets: allTickets.slice(0, 5),
  };
}

export function getAllSystemContent(
  systemContentMap: Map<string, SystemContent>
): SystemContent[] {
  return Array.from(systemContentMap.values()).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function getSystemContent(
  systemContentMap: Map<string, SystemContent>,
  id: string
): SystemContent | undefined {
  return systemContentMap.get(id);
}

export function getSystemContentBySlug(
  systemContentMap: Map<string, SystemContent>,
  slug: string
): SystemContent | undefined {
  return Array.from(systemContentMap.values()).find((c) => c.slug === slug);
}

export function createSystemContent(
  systemContentMap: Map<string, SystemContent>,
  data: InsertSystemContent
): SystemContent {
  const id = randomUUID();
  const now = new Date();
  const content: SystemContent = {
    id,
    slug: data.slug,
    titleAr: data.titleAr,
    titleEn: data.titleEn,
    contentAr: data.contentAr ?? "",
    contentEn: data.contentEn ?? "",
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  systemContentMap.set(id, content);
  return content;
}

export function updateSystemContent(
  systemContentMap: Map<string, SystemContent>,
  id: string,
  data: Partial<SystemContent>
): SystemContent | undefined {
  const existing = systemContentMap.get(id);
  if (!existing) return undefined;
  const updated: SystemContent = {
    ...existing,
    ...data,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date(),
  };
  systemContentMap.set(id, updated);
  return updated;
}

export function deleteSystemContent(
  systemContentMap: Map<string, SystemContent>,
  id: string
): void {
  systemContentMap.delete(id);
}
