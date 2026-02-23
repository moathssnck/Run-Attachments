import { randomUUID } from "crypto";
import type {
  User,
  Draw,
  Ticket,
  Payment,
  Wallet,
  WalletTransaction,
  AuditLog,
  Role,
  Permission,
  Refund,
  RolePermission,
  UserRoleAssignment,
  DrawPrize,
  Issue,
  SystemDefinition,
  Prize,
  SystemCategory,
  CustomSetting,
  CardSetting,
  SystemContent,
} from "./types";

export interface SeedMaps {
  users: Map<string, User>;
  draws: Map<string, Draw>;
  tickets: Map<string, Ticket>;
  payments: Map<string, Payment>;
  wallets: Map<string, Wallet>;
  walletTransactions: Map<string, WalletTransaction>;
  auditLogs: Map<string, AuditLog>;
  roles: Map<string, Role>;
  permissions: Map<string, Permission>;
  refunds: Map<string, Refund>;
  userRolesMap: Map<string, UserRoleAssignment>;
  rolePermissionsMap: Map<string, RolePermission>;
  drawPrizes: Map<string, DrawPrize>;
  issues: Map<string, Issue>;
  systemDefinitions: Map<string, SystemDefinition>;
  prizesMap: Map<string, Prize>;
  systemCategoriesMap: Map<string, SystemCategory>;
  customSettingsMap: Map<string, CustomSetting>;
  cardSettingsMap: Map<string, CardSetting>;
  systemContentMap: Map<string, SystemContent>;
}

export function initializeDefaultData(maps: SeedMaps) {
  const defaultRoles = [
    {
      id: "role-1",
      name: "مستخدم عادي",
      nameEn: "End User",
      nameAr: "مستخدم عادي",
      description: "مشترك في اليانصيب",
      descriptionEn: "Lottery participant",
      descriptionAr: "مشترك في اليانصيب",
      isSystem: false,
      status: "active",
    },
    {
      id: "role-2",
      name: "مدير",
      nameEn: "Admin",
      nameAr: "مدير",
      description: "إدارة العمليات",
      descriptionEn: "Operational management",
      descriptionAr: "إدارة العمليات",
      isSystem: false,
      status: "active",
    },
    {
      id: "role-3",
      name: "مدير مالي",
      nameEn: "Finance Admin",
      nameAr: "مدير مالي",
      description: "المدفوعات والاستردادات",
      descriptionEn: "Payments and refunds",
      descriptionAr: "المدفوعات والاستردادات",
      isSystem: false,
      status: "active",
    },
    {
      id: "role-4",
      name: "مدير النظام",
      nameEn: "System Admin",
      nameAr: "مدير النظام",
      description: "صلاحيات كاملة",
      descriptionEn: "Full permissions",
      descriptionAr: "صلاحيات كاملة",
      isSystem: true,
      status: "active",
    },
    {
      id: "role-5",
      name: "مدقق",
      nameEn: "Auditor",
      nameAr: "مدقق",
      description: "صلاحيات القراءة فقط",
      descriptionEn: "Read-only audit access",
      descriptionAr: "صلاحيات القراءة فقط",
      isSystem: false,
      status: "active",
    },
  ];
  defaultRoles.forEach((role) => maps.roles.set(role.id, role as Role));

  const defaultPermissions = [
    {
      id: "perm-1",
      code: "users.view",
      name: "عرض المستخدمين",
      nameEn: "View Users",
      nameAr: "عرض المستخدمين",
      descriptionEn: "View user list and details",
      descriptionAr: "عرض قائمة المستخدمين وتفاصيلهم",
      module: "users",
      action: "view",
      parentId: null,
    },
    {
      id: "perm-2",
      code: "users.create",
      name: "إنشاء مستخدم",
      nameEn: "Create User",
      nameAr: "إنشاء مستخدم",
      descriptionEn: "Create new user accounts",
      descriptionAr: "إنشاء حسابات مستخدمين جديدة",
      module: "users",
      action: "create",
      parentId: null,
    },
    {
      id: "perm-3",
      code: "users.edit",
      name: "تعديل مستخدم",
      nameEn: "Edit User",
      nameAr: "تعديل مستخدم",
      descriptionEn: "Modify user information",
      descriptionAr: "تعديل معلومات المستخدم",
      module: "users",
      action: "edit",
      parentId: null,
    },
    {
      id: "perm-4",
      code: "users.delete",
      name: "حذف مستخدم",
      nameEn: "Delete User",
      nameAr: "حذف مستخدم",
      descriptionEn: "Remove user accounts",
      descriptionAr: "حذف حسابات المستخدمين",
      module: "users",
      action: "delete",
      parentId: null,
    },
    {
      id: "perm-1-1",
      code: "users.view.basic",
      name: "عرض المعلومات الأساسية",
      nameEn: "View Basic Info",
      nameAr: "عرض المعلومات الأساسية",
      descriptionEn: "View basic user information",
      descriptionAr: "عرض المعلومات الأساسية للمستخدم",
      module: "users",
      action: "view",
      parentId: "perm-1",
    },
    {
      id: "perm-1-2",
      code: "users.view.contact",
      name: "عرض معلومات الاتصال",
      nameEn: "View Contact Info",
      nameAr: "عرض معلومات الاتصال",
      descriptionEn: "View contact details",
      descriptionAr: "عرض تفاصيل الاتصال",
      module: "users",
      action: "view",
      parentId: "perm-1",
    },
    {
      id: "perm-1-3",
      code: "users.view.security",
      name: "عرض معلومات الأمان",
      nameEn: "View Security Info",
      nameAr: "عرض معلومات الأمان",
      descriptionEn: "View security settings",
      descriptionAr: "عرض إعدادات الأمان",
      module: "users",
      action: "view",
      parentId: "perm-1",
    },
    {
      id: "perm-1-1-1",
      code: "users.view.basic.name",
      name: "عرض الاسم",
      nameEn: "View Name",
      nameAr: "عرض الاسم",
      descriptionEn: "View user name",
      descriptionAr: "عرض اسم المستخدم",
      module: "users",
      action: "view",
      parentId: "perm-1-1",
    },
    {
      id: "perm-1-1-2",
      code: "users.view.basic.email",
      name: "عرض البريد الإلكتروني",
      nameEn: "View Email",
      nameAr: "عرض البريد الإلكتروني",
      descriptionEn: "View email address",
      descriptionAr: "عرض البريد الإلكتروني",
      module: "users",
      action: "view",
      parentId: "perm-1-1",
    },
    {
      id: "perm-1-1-3",
      code: "users.view.basic.status",
      name: "عرض الحالة",
      nameEn: "View Status",
      nameAr: "عرض الحالة",
      descriptionEn: "View user status",
      descriptionAr: "عرض حالة المستخدم",
      module: "users",
      action: "view",
      parentId: "perm-1-1",
    },
    {
      id: "perm-3-1",
      code: "users.edit.profile",
      name: "تعديل الملف الشخصي",
      nameEn: "Edit Profile",
      nameAr: "تعديل الملف الشخصي",
      descriptionEn: "Edit user profile",
      descriptionAr: "تعديل الملف الشخصي",
      module: "users",
      action: "edit",
      parentId: "perm-3",
    },
    {
      id: "perm-3-2",
      code: "users.edit.status",
      name: "تعديل الحالة",
      nameEn: "Edit Status",
      nameAr: "تعديل الحالة",
      descriptionEn: "Change user status",
      descriptionAr: "تغيير حالة المستخدم",
      module: "users",
      action: "edit",
      parentId: "perm-3",
    },
    {
      id: "perm-3-3",
      code: "users.edit.role",
      name: "تعديل الدور",
      nameEn: "Edit Role",
      nameAr: "تعديل الدور",
      descriptionEn: "Change user role",
      descriptionAr: "تغيير دور المستخدم",
      module: "users",
      action: "edit",
      parentId: "perm-3",
    },
    {
      id: "perm-3-1-1",
      code: "users.edit.profile.name",
      name: "تعديل الاسم",
      nameEn: "Edit Name",
      nameAr: "تعديل الاسم",
      descriptionEn: "Edit user name",
      descriptionAr: "تعديل اسم المستخدم",
      module: "users",
      action: "edit",
      parentId: "perm-3-1",
    },
    {
      id: "perm-3-1-2",
      code: "users.edit.profile.photo",
      name: "تعديل الصورة",
      nameEn: "Edit Photo",
      nameAr: "تعديل الصورة",
      descriptionEn: "Edit profile photo",
      descriptionAr: "تعديل صورة الملف الشخصي",
      module: "users",
      action: "edit",
      parentId: "perm-3-1",
    },
    {
      id: "perm-5",
      code: "draws.view",
      name: "عرض السحوبات",
      nameEn: "View Draws",
      nameAr: "عرض السحوبات",
      descriptionEn: "View draw list and details",
      descriptionAr: "عرض قائمة السحوبات وتفاصيلها",
      module: "draws",
      action: "view",
      parentId: null,
    },
    {
      id: "perm-6",
      code: "draws.create",
      name: "إنشاء سحب",
      nameEn: "Create Draw",
      nameAr: "إنشاء سحب",
      descriptionEn: "Create new draws",
      descriptionAr: "إنشاء سحوبات جديدة",
      module: "draws",
      action: "create",
      parentId: null,
    },
    {
      id: "perm-7",
      code: "draws.edit",
      name: "تعديل سحب",
      nameEn: "Edit Draw",
      nameAr: "تعديل سحب",
      descriptionEn: "Modify draw settings",
      descriptionAr: "تعديل إعدادات السحب",
      module: "draws",
      action: "edit",
      parentId: null,
    },
    {
      id: "perm-8",
      code: "draws.publish",
      name: "نشر نتائج السحب",
      nameEn: "Publish Results",
      nameAr: "نشر نتائج السحب",
      descriptionEn: "Publish draw results",
      descriptionAr: "نشر نتائج السحب",
      module: "draws",
      action: "approve",
      parentId: null,
    },
    {
      id: "perm-5-1",
      code: "draws.view.list",
      name: "عرض القائمة",
      nameEn: "View List",
      nameAr: "عرض القائمة",
      descriptionEn: "View draws list",
      descriptionAr: "عرض قائمة السحوبات",
      module: "draws",
      action: "view",
      parentId: "perm-5",
    },
    {
      id: "perm-5-2",
      code: "draws.view.details",
      name: "عرض التفاصيل",
      nameEn: "View Details",
      nameAr: "عرض التفاصيل",
      descriptionEn: "View draw details",
      descriptionAr: "عرض تفاصيل السحب",
      module: "draws",
      action: "view",
      parentId: "perm-5",
    },
    {
      id: "perm-5-3",
      code: "draws.view.results",
      name: "عرض النتائج",
      nameEn: "View Results",
      nameAr: "عرض النتائج",
      descriptionEn: "View draw results",
      descriptionAr: "عرض نتائج السحب",
      module: "draws",
      action: "view",
      parentId: "perm-5",
    },
    {
      id: "perm-5-2-1",
      code: "draws.view.details.prizes",
      name: "عرض الجوائز",
      nameEn: "View Prizes",
      nameAr: "عرض الجوائز",
      descriptionEn: "View prize details",
      descriptionAr: "عرض تفاصيل الجوائز",
      module: "draws",
      action: "view",
      parentId: "perm-5-2",
    },
    {
      id: "perm-5-2-2",
      code: "draws.view.details.stats",
      name: "عرض الإحصائيات",
      nameEn: "View Statistics",
      nameAr: "عرض الإحصائيات",
      descriptionEn: "View draw statistics",
      descriptionAr: "عرض إحصائيات السحب",
      module: "draws",
      action: "view",
      parentId: "perm-5-2",
    },
    {
      id: "perm-9",
      code: "tickets.view",
      name: "عرض التذاكر",
      nameEn: "View Tickets",
      nameAr: "عرض التذاكر",
      descriptionEn: "View ticket list and details",
      descriptionAr: "عرض قائمة التذاكر وتفاصيلها",
      module: "tickets",
      action: "view",
      parentId: null,
    },
    {
      id: "perm-10",
      code: "tickets.void",
      name: "إلغاء تذكرة",
      nameEn: "Void Ticket",
      nameAr: "إلغاء تذكرة",
      descriptionEn: "Cancel and void tickets",
      descriptionAr: "إلغاء التذاكر",
      module: "tickets",
      action: "delete",
      parentId: null,
    },
    {
      id: "perm-11",
      code: "payments.view",
      name: "عرض المدفوعات",
      nameEn: "View Payments",
      nameAr: "عرض المدفوعات",
      descriptionEn: "View payment transactions",
      descriptionAr: "عرض معاملات الدفع",
      module: "payments",
      action: "view",
      parentId: null,
    },
    {
      id: "perm-12",
      code: "refunds.view",
      name: "عرض الاستردادات",
      nameEn: "View Refunds",
      nameAr: "عرض الاستردادات",
      descriptionEn: "View refund requests",
      descriptionAr: "عرض طلبات الاسترداد",
      module: "refunds",
      action: "view",
      parentId: null,
    },
    {
      id: "perm-13",
      code: "refunds.create",
      name: "طلب استرداد",
      nameEn: "Request Refund",
      nameAr: "طلب استرداد",
      descriptionEn: "Create refund requests",
      descriptionAr: "إنشاء طلبات استرداد",
      module: "refunds",
      action: "create",
      parentId: null,
    },
    {
      id: "perm-14",
      code: "refunds.approve",
      name: "الموافقة على استرداد",
      nameEn: "Approve Refund",
      nameAr: "الموافقة على استرداد",
      descriptionEn: "Approve or reject refunds",
      descriptionAr: "الموافقة على الاستردادات أو رفضها",
      module: "refunds",
      action: "approve",
      parentId: null,
    },
    {
      id: "perm-15",
      code: "roles.view",
      name: "عرض الأدوار",
      nameEn: "View Roles",
      nameAr: "عرض الأدوار",
      descriptionEn: "View role list",
      descriptionAr: "عرض قائمة الأدوار",
      module: "roles",
      action: "view",
      parentId: null,
    },
    {
      id: "perm-16",
      code: "roles.manage",
      name: "إدارة الأدوار",
      nameEn: "Manage Roles",
      nameAr: "إدارة الأدوار",
      descriptionEn: "Create, edit and delete roles",
      descriptionAr: "إنشاء وتعديل وحذف الأدوار",
      module: "roles",
      action: "edit",
      parentId: null,
    },
    {
      id: "perm-17",
      code: "audit.view",
      name: "عرض سجلات التدقيق",
      nameEn: "View Audit Logs",
      nameAr: "عرض سجلات التدقيق",
      descriptionEn: "View system audit logs",
      descriptionAr: "عرض سجلات تدقيق النظام",
      module: "audit",
      action: "view",
      parentId: null,
    },
    {
      id: "perm-18",
      code: "settings.view",
      name: "عرض الإعدادات",
      nameEn: "View Settings",
      nameAr: "عرض الإعدادات",
      descriptionEn: "View system settings",
      descriptionAr: "عرض إعدادات النظام",
      module: "settings",
      action: "view",
      parentId: null,
    },
    {
      id: "perm-19",
      code: "settings.edit",
      name: "تعديل الإعدادات",
      nameEn: "Edit Settings",
      nameAr: "تعديل الإعدادات",
      descriptionEn: "Modify system settings",
      descriptionAr: "تعديل إعدادات النظام",
      module: "settings",
      action: "edit",
      parentId: null,
    },
  ];
  defaultPermissions.forEach((perm) =>
    maps.permissions.set(perm.id, perm as Permission)
  );

  const rolePermissionMappings = [
    ...defaultPermissions.map((p) => ({
      roleId: "role-4",
      permissionId: p.id,
    })),
    { roleId: "role-2", permissionId: "perm-1" },
    { roleId: "role-2", permissionId: "perm-3" },
    { roleId: "role-2", permissionId: "perm-5" },
    { roleId: "role-2", permissionId: "perm-6" },
    { roleId: "role-2", permissionId: "perm-7" },
    { roleId: "role-2", permissionId: "perm-8" },
    { roleId: "role-2", permissionId: "perm-9" },
    { roleId: "role-2", permissionId: "perm-10" },
    { roleId: "role-3", permissionId: "perm-11" },
    { roleId: "role-3", permissionId: "perm-12" },
    { roleId: "role-3", permissionId: "perm-13" },
    { roleId: "role-3", permissionId: "perm-14" },
    { roleId: "role-5", permissionId: "perm-1" },
    { roleId: "role-5", permissionId: "perm-5" },
    { roleId: "role-5", permissionId: "perm-9" },
    { roleId: "role-5", permissionId: "perm-11" },
    { roleId: "role-5", permissionId: "perm-12" },
    { roleId: "role-5", permissionId: "perm-17" },
  ];
  rolePermissionMappings.forEach((rp, index) => {
    const id = `rp-${index + 1}`;
    maps.rolePermissionsMap.set(id, {
      id,
      roleId: rp.roleId,
      permissionId: rp.permissionId,
      createdAt: new Date(),
    } as RolePermission);
  });

  const adminId = randomUUID();
  const adminUser: User = {
    id: adminId,
    email: "admin@jclottery.jo",
    passwordHash: "YWRtaW4=",
    firstName: "أحمد",
    lastName: "المدير",
    mobile: "+962791234567",
    status: "active",
    role: "system_admin",
    mfaEnabled: true,
    failedLoginAttempts: 0,
    passwordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    lastLogin: new Date(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    dateOfBirth: null,
    nationalId: null,
    gender: null,
    address: null,
    city: "عمان",
    country: "Jordan",
    postalCode: null,
    region: null,
    street: null,
    phoneCode: "+962",
    passportOrIdNumber: null,
    secondaryPhone: null,
    workEmail: null,
    emergencyContact: null,
    emergencyPhone: null,
    profilePhoto: null,
  };
  maps.users.set(adminId, adminUser);

  const financeAdminId = randomUUID();
  const financeAdmin: User = {
    id: financeAdminId,
    email: "finance@jclottery.jo",
    passwordHash: "$2a$10$demo",
    firstName: "سارة",
    lastName: "المالية",
    mobile: "+962792345678",
    status: "active",
    role: "finance_admin",
    mfaEnabled: true,
    failedLoginAttempts: 0,
    passwordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    dateOfBirth: null,
    nationalId: null,
    gender: null,
    address: null,
    city: "عمان",
    country: "Jordan",
    postalCode: null,
    region: null,
    street: null,
    phoneCode: "+962",
    passportOrIdNumber: null,
    secondaryPhone: null,
    workEmail: null,
    emergencyContact: null,
    emergencyPhone: null,
    profilePhoto: null,
  };
  maps.users.set(financeAdminId, financeAdmin);

  const auditorId = randomUUID();
  const auditor: User = {
    id: auditorId,
    email: "auditor@jclottery.jo",
    passwordHash: "$2a$10$demo",
    firstName: "خالد",
    lastName: "المدقق",
    mobile: "+962793456789",
    status: "active",
    role: "auditor",
    mfaEnabled: false,
    failedLoginAttempts: 0,
    passwordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    dateOfBirth: null,
    nationalId: null,
    gender: null,
    address: null,
    city: "عمان",
    country: "Jordan",
    postalCode: null,
    region: null,
    street: null,
    phoneCode: "+962",
    passportOrIdNumber: null,
    secondaryPhone: null,
    workEmail: null,
    emergencyContact: null,
    emergencyPhone: null,
    profilePhoto: null,
  };
  maps.users.set(auditorId, auditor);

  const userIds: string[] = [];
  const demoUsers = [
    { firstName: "محمد", lastName: "العلي", email: "user@demo.com", mobile: "+962794567890", status: "active" as const },
    { firstName: "فاطمة", lastName: "الحسن", email: "fatima@demo.com", mobile: "+962795678901", status: "active" as const },
    { firstName: "عمر", lastName: "الخطيب", email: "omar@demo.com", mobile: "+962796789012", status: "active" as const },
    { firstName: "نور", lastName: "السعيد", email: "nour@demo.com", mobile: "+962797890123", status: "suspended" as const },
    { firstName: "ياسر", lastName: "الأحمد", email: "yaser@demo.com", mobile: "+962798901234", status: "active" as const },
    { firstName: "ريم", lastName: "الكريم", email: "reem@demo.com", mobile: "+962799012345", status: "active" as const },
    { firstName: "سامي", lastName: "البكر", email: "sami@demo.com", mobile: "+962790123456", status: "locked" as const },
    { firstName: "دانا", lastName: "الشمري", email: "dana@demo.com", mobile: "+962791234568", status: "active" as const },
  ];

  demoUsers.forEach((u, index) => {
    const id = randomUUID();
    userIds.push(id);
    const user: User = {
      id,
      email: u.email,
      passwordHash: "$2a$10$demo",
      firstName: u.firstName,
      lastName: u.lastName,
      mobile: u.mobile,
      status: u.status,
      role: "end_user",
      mfaEnabled: index % 3 === 0,
      failedLoginAttempts: u.status === "locked" ? 5 : 0,
      passwordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
      createdAt: new Date(
        Date.now() - (30 + index * 5) * 24 * 60 * 60 * 1000
      ),
      dateOfBirth: null,
      nationalId: null,
      gender: null,
      address: null,
      city: "عمان",
      country: "Jordan",
      postalCode: null,
      region: null,
      street: null,
      phoneCode: "+962",
      passportOrIdNumber: null,
      secondaryPhone: null,
      workEmail: null,
      emergencyContact: null,
      emergencyPhone: null,
      profilePhoto: null,
    };
    maps.users.set(id, user);
  });

  userIds.forEach((userId, index) => {
    const walletId = randomUUID();
    const wallet: Wallet = {
      id: walletId,
      userId: userId,
      balance: ((index + 1) * 50 + Math.random() * 200).toFixed(2),
      updatedAt: new Date(),
    };
    maps.wallets.set(userId, wallet);
  });

  const drawIds: string[] = [];

  const pastDrawDate = new Date();
  pastDrawDate.setDate(pastDrawDate.getDate() - 7);
  const pastDraw: Draw = {
    id: randomUUID(),
    name: "سحب الأسبوع الماضي",
    description: "سحب مكتمل مع فائزين",
    ticketPrice: "5.00",
    drawDate: pastDrawDate,
    status: "completed",
    maxTickets: 1000,
    winningNumbers: "7,14,21,28,35,42",
    prizePool: "50000.00",
    createdBy: adminId,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  };
  maps.draws.set(pastDraw.id, pastDraw);
  drawIds.push(pastDraw.id);

  const drawDate1 = new Date();
  drawDate1.setDate(drawDate1.getDate() + 7);
  const draw1: Draw = {
    id: randomUUID(),
    name: "السحب الأسبوعي الكبير",
    description: "فرصتك للفوز بجائزة كبرى هذا الأسبوع",
    ticketPrice: "5.00",
    drawDate: drawDate1,
    status: "active",
    maxTickets: 1000,
    winningNumbers: null,
    prizePool: "50000.00",
    createdBy: adminId,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  };
  maps.draws.set(draw1.id, draw1);
  drawIds.push(draw1.id);

  const drawDate2 = new Date();
  drawDate2.setDate(drawDate2.getDate() + 3);
  const draw2: Draw = {
    id: randomUUID(),
    name: "سحب الجمعة المباركة",
    description: "سحب خاص بجوائز إضافية",
    ticketPrice: "10.00",
    drawDate: drawDate2,
    status: "active",
    maxTickets: 500,
    winningNumbers: null,
    prizePool: "25000.00",
    createdBy: adminId,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  };
  maps.draws.set(draw2.id, draw2);
  drawIds.push(draw2.id);

  const drawDate3 = new Date();
  drawDate3.setDate(drawDate3.getDate() + 14);
  const draw3: Draw = {
    id: randomUUID(),
    name: "الجائزة الكبرى الشهرية",
    description: "أكبر جائزة في الشهر",
    ticketPrice: "20.00",
    drawDate: drawDate3,
    status: "scheduled",
    maxTickets: 2000,
    winningNumbers: null,
    prizePool: "100000.00",
    createdBy: adminId,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  };
  maps.draws.set(draw3.id, draw3);
  drawIds.push(draw3.id);

  const closedDrawDate = new Date();
  closedDrawDate.setDate(closedDrawDate.getDate() + 5);
  const closedDraw: Draw = {
    id: randomUUID(),
    name: "سحب مغلق",
    description: "تم إغلاق هذا السحب",
    ticketPrice: "15.00",
    drawDate: closedDrawDate,
    status: "closed",
    maxTickets: 300,
    winningNumbers: null,
    prizePool: "30000.00",
    createdBy: adminId,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  };
  maps.draws.set(closedDraw.id, closedDraw);

  const demoPrizes: Prize[] = [
    { id: randomUUID(), nameAr: "الجائزة الكبرى", nameEn: "Grand Prize", descriptionAr: "الجائزة الكبرى للفائز الأول", descriptionEn: "Grand prize for the first winner", value: "100000.00", category: "cash", level: 1, imageUrl: null, isActive: true, sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), nameAr: "الجائزة الثانية", nameEn: "Second Prize", descriptionAr: "جائزة نقدية للفائز الثاني", descriptionEn: "Cash prize for second place winner", value: "50000.00", category: "cash", level: 2, imageUrl: null, isActive: true, sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), nameAr: "الجائزة الثالثة", nameEn: "Third Prize", descriptionAr: "جائزة نقدية للفائز الثالث", descriptionEn: "Cash prize for third place winner", value: "25000.00", category: "cash", level: 3, imageUrl: null, isActive: true, sortOrder: 3, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), nameAr: "سيارة فاخرة", nameEn: "Luxury Car", descriptionAr: "سيارة BMW X5 موديل 2026", descriptionEn: "BMW X5 2026 Model", value: "75000.00", category: "car", level: 1, imageUrl: null, isActive: true, sortOrder: 4, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), nameAr: "هاتف ذكي", nameEn: "Smartphone", descriptionAr: "آيفون 16 برو ماكس", descriptionEn: "iPhone 16 Pro Max", value: "1500.00", category: "electronics", level: 4, imageUrl: null, isActive: true, sortOrder: 5, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), nameAr: "لابتوب", nameEn: "Laptop", descriptionAr: "ماك بوك برو 16 إنش", descriptionEn: "MacBook Pro 16 inch", value: "3000.00", category: "electronics", level: 4, imageUrl: null, isActive: true, sortOrder: 6, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), nameAr: "رحلة سياحية", nameEn: "Travel Package", descriptionAr: "رحلة لشخصين إلى دبي لمدة أسبوع", descriptionEn: "Trip for two to Dubai for a week", value: "5000.00", category: "travel", level: 3, imageUrl: null, isActive: true, sortOrder: 7, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), nameAr: "قسيمة تسوق", nameEn: "Shopping Voucher", descriptionAr: "قسيمة شراء بقيمة 500 دينار", descriptionEn: "Shopping voucher worth 500 JOD", value: "500.00", category: "voucher", level: 5, imageUrl: null, isActive: true, sortOrder: 8, createdAt: new Date(), updatedAt: new Date() },
  ];
  demoPrizes.forEach((prize) => maps.prizesMap.set(prize.id, prize));

  const demoCustomSettings: CustomSetting[] = [
    { id: randomUUID(), key: "max_tickets_per_user", nameAr: "الحد الأقصى للتذاكر لكل مستخدم", nameEn: "Max Tickets Per User", value: "10", descriptionAr: "الحد الأقصى لعدد التذاكر التي يمكن للمستخدم شراؤها في السحب الواحد", descriptionEn: "Maximum number of tickets a user can purchase per draw", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), key: "min_withdrawal_amount", nameAr: "الحد الأدنى للسحب", nameEn: "Minimum Withdrawal Amount", value: "50", descriptionAr: "الحد الأدنى للمبلغ الذي يمكن سحبه من المحفظة", descriptionEn: "Minimum amount that can be withdrawn from wallet", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), key: "maintenance_mode", nameAr: "وضع الصيانة", nameEn: "Maintenance Mode", value: "false", descriptionAr: "تفعيل وضع الصيانة للموقع", descriptionEn: "Enable maintenance mode for the website", isActive: false, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), key: "support_email", nameAr: "بريد الدعم الفني", nameEn: "Support Email", value: "support@jclottery.jo", descriptionAr: "البريد الإلكتروني للدعم الفني", descriptionEn: "Technical support email address", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), key: "auto_close_draws", nameAr: "إغلاق السحوبات تلقائياً", nameEn: "Auto Close Draws", value: "true", descriptionAr: "إغلاق السحوبات تلقائياً عند انتهاء وقتها", descriptionEn: "Automatically close draws when their time expires", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ];
  demoCustomSettings.forEach((setting) =>
    maps.customSettingsMap.set(setting.id, setting)
  );

  const defaultCardSetting: CardSetting = {
    id: "card-settings-1",
    topbarImage: null,
    backgroundImage: null,
    imageDescription: "بطاقة اليانصيب الخيري الأردني - فرصتك للفوز بجوائز قيمة",
    imageDescriptionEn: "Jordan Charity Lottery Card - Your chance to win valuable prizes",
    cardPrice: "5.00",
    managerSignature: null,
    managerName: "أحمد محمد الخالدي",
    managerNameEn: "Ahmed Mohammad Al-Khalidi",
    managerTitle: "مدير اليانصيب الخيري",
    managerTitleEn: "Charitable Lottery Manager",
    chairmanSignature: null,
    chairmanName: "د. محمد عبد الرحمن",
    chairmanNameEn: "Dr. Mohammad Abdulrahman",
    chairmanTitle: "رئيس اللجنة الوطنية",
    chairmanTitleEn: "National Committee Chairman",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  maps.cardSettingsMap.set(defaultCardSetting.id, defaultCardSetting);

  const ticketStatuses = ["active", "pending", "won", "lost"] as const;
  const paymentMethods = ["cliq", "credit_card", "wallet"] as const;

  userIds.forEach((userId, userIndex) => {
    const numTickets = (userIndex % 3) + 1;
    for (let i = 0; i < numTickets; i++) {
      const drawId = drawIds[i % drawIds.length];
      const draw = maps.draws.get(drawId);
      if (!draw) continue;

      const ticketId = randomUUID();
      const ticketNumber = `TKT${(
        1000 +
        userIndex * 10 +
        i
      ).toString()}${String.fromCharCode(65 + i)}`;
      const selectedNumbers = Array.from(
        { length: 6 },
        (_, idx) => ((userIndex + idx + i) % 49) + 1
      ).join(",");

      let status: "active" | "pending" | "won" | "lost" =
        ticketStatuses[i % ticketStatuses.length];
      let prizeAmount: string | null = null;

      if (draw.status === "completed") {
        status = userIndex === 0 ? "won" : "lost";
        prizeAmount = userIndex === 0 ? "5000.00" : null;
      }

      const ticket: Ticket = {
        id: ticketId,
        ticketNumber,
        userId,
        drawId,
        selectedNumbers,
        status,
        prizeAmount,
        purchasedAt: new Date(
          Date.now() - (userIndex + i) * 24 * 60 * 60 * 1000
        ),
      };
      maps.tickets.set(ticketId, ticket);

      const paymentId = randomUUID();
      const paymentStatus =
        status === "pending"
          ? "pending"
          : i === 2 && userIndex === 3
          ? "failed"
          : "completed";
      const payment: Payment = {
        id: paymentId,
        userId,
        ticketId,
        amount: draw.ticketPrice,
        paymentMethod: paymentMethods[i % paymentMethods.length],
        status: paymentStatus,
        transactionId: `TXN${Date.now()
          .toString(36)
          .toUpperCase()}${userIndex}${i}`,
        createdAt: new Date(
          Date.now() - (userIndex + i) * 24 * 60 * 60 * 1000
        ),
      };
      maps.payments.set(paymentId, payment);

      const wallet = maps.wallets.get(userId);
      if (wallet && paymentStatus === "completed") {
        const transactionId = randomUUID();
        const transaction: WalletTransaction = {
          id: transactionId,
          walletId: wallet.id,
          type: "purchase",
          amount: `-${draw.ticketPrice}`,
          description: `شراء تذكرة - ${draw.name}`,
          referenceId: ticketId,
          createdAt: new Date(
            Date.now() - (userIndex + i) * 24 * 60 * 60 * 1000
          ),
        };
        maps.walletTransactions.set(transactionId, transaction);
      }
    }
  });

  userIds.slice(0, 4).forEach((userId, index) => {
    const wallet = maps.wallets.get(userId);
    if (wallet) {
      const depositId = randomUUID();
      const deposit: WalletTransaction = {
        id: depositId,
        walletId: wallet.id,
        type: "deposit",
        amount: ((index + 1) * 100).toFixed(2),
        description: "إيداع عبر CliQ",
        referenceId: null,
        createdAt: new Date(Date.now() - (index + 5) * 24 * 60 * 60 * 1000),
      };
      maps.walletTransactions.set(depositId, deposit);
    }
  });

  const demoIssues = [
    { issueNumber: "1/2026", issueType: "regular" as const, startDate: new Date("2026-01-01"), endDate: new Date("2026-03-31"), totalTickets: 100000, ticketsPerBook: 10, totalBooks: 10000, bookPrice: "25.00", startTicketNumber: 1, endTicketNumber: 100000, prizesAccountNumber: "702022801", isClosed: false, createdBy: adminId },
    { issueNumber: "2/2026", issueType: "special" as const, startDate: new Date("2026-02-01"), endDate: new Date("2026-04-30"), totalTickets: 50000, ticketsPerBook: 5, totalBooks: 10000, bookPrice: "50.00", startTicketNumber: 100001, endTicketNumber: 150000, prizesAccountNumber: "702022802", isClosed: false, createdBy: adminId },
    { issueNumber: "3/2025", issueType: "regular" as const, startDate: new Date("2025-07-01"), endDate: new Date("2025-09-30"), totalTickets: 200000, ticketsPerBook: 20, totalBooks: 10000, bookPrice: "40.00", startTicketNumber: 1, endTicketNumber: 200000, prizesAccountNumber: "702022803", isClosed: true, createdBy: adminId },
    { issueNumber: "4/2025", issueType: "support" as const, startDate: new Date("2025-10-01"), endDate: new Date("2025-12-31"), totalTickets: 30000, ticketsPerBook: 10, totalBooks: 3000, bookPrice: "15.00", startTicketNumber: 200001, endTicketNumber: 230000, prizesAccountNumber: "702022804", isClosed: true, createdBy: adminId },
    { issueNumber: "5/2026", issueType: "regular" as const, startDate: new Date("2026-04-01"), endDate: new Date("2026-06-30"), totalTickets: 150000, ticketsPerBook: 15, totalBooks: 10000, bookPrice: "30.00", startTicketNumber: 1, endTicketNumber: 150000, prizesAccountNumber: "702022805", isClosed: false, createdBy: adminId },
    { issueNumber: "6/2025", issueType: "special" as const, startDate: new Date("2025-04-01"), endDate: new Date("2025-06-30"), totalTickets: 80000, ticketsPerBook: 8, totalBooks: 10000, bookPrice: "60.00", startTicketNumber: 1, endTicketNumber: 80000, prizesAccountNumber: "702022806", isClosed: true, createdBy: adminId },
    { issueNumber: "7/2026", issueType: "support" as const, startDate: new Date("2026-03-01"), endDate: new Date("2026-05-31"), totalTickets: 25000, ticketsPerBook: 5, totalBooks: 5000, bookPrice: "20.00", startTicketNumber: 300001, endTicketNumber: 325000, prizesAccountNumber: "702022807", isClosed: false, createdBy: adminId },
    { issueNumber: "8/2025", issueType: "regular" as const, startDate: new Date("2025-01-01"), endDate: new Date("2025-03-31"), totalTickets: 120000, ticketsPerBook: 12, totalBooks: 10000, bookPrice: "35.00", startTicketNumber: 1, endTicketNumber: 120000, prizesAccountNumber: "702022808", isClosed: true, createdBy: adminId },
  ];

  demoIssues.forEach((issue, index) => {
    const id = randomUUID();
    const issueRecord = {
      id,
      ...issue,
      createdAt: new Date(
        Date.now() - (index + 1) * 10 * 24 * 60 * 60 * 1000
      ),
    };
    maps.issues.set(id, issueRecord as any);
  });

  const auditActions = [
    { action: "login", module: "auth", entityId: null, oldValues: null, newValues: '{"success":true}', userId: adminId },
    { action: "login", module: "auth", entityId: null, oldValues: null, newValues: '{"success":true}', userId: userIds[0] },
    { action: "create", module: "draws", entityId: draw1.id, oldValues: null, newValues: JSON.stringify({ name: draw1.name }), userId: adminId },
    { action: "create", module: "draws", entityId: draw2.id, oldValues: null, newValues: JSON.stringify({ name: draw2.name }), userId: adminId },
    { action: "purchase", module: "tickets", entityId: draw1.id, oldValues: null, newValues: null, userId: userIds[0] },
    { action: "purchase", module: "tickets", entityId: draw2.id, oldValues: null, newValues: null, userId: userIds[1] },
    { action: "process", module: "payments", entityId: null, oldValues: null, newValues: '{"amount":"5.00","method":"cliq"}', userId: userIds[0] },
    { action: "deposit", module: "wallet", entityId: null, oldValues: null, newValues: '{"amount":"100.00"}', userId: userIds[2] },
    { action: "status_change", module: "users", entityId: userIds[3], oldValues: '{"status":"active"}', newValues: '{"status":"suspended"}', userId: adminId },
    { action: "status_change", module: "draws", entityId: pastDraw.id, oldValues: '{"status":"active"}', newValues: '{"status":"completed"}', userId: adminId },
    { action: "mfa_enable", module: "users", entityId: userIds[3], oldValues: null, newValues: null, userId: userIds[3] },
    { action: "update", module: "settings", entityId: null, oldValues: null, newValues: '{"maintenance_mode":false}', userId: adminId },
    { action: "permission_update", module: "roles", entityId: "role-3", oldValues: null, newValues: null, userId: adminId },
    { action: "refund", module: "payments", entityId: null, oldValues: null, newValues: '{"amount":"10.00","reason":"طلب العميل"}', userId: financeAdminId },
    { action: "export", module: "audit", entityId: null, oldValues: null, newValues: '{"format":"csv","range":"last_30_days"}', userId: auditorId },
  ];

  auditActions.forEach((log, index) => {
    const auditId = randomUUID();
    const auditLog: AuditLog = {
      id: auditId,
      userId: log.userId,
      action: log.action,
      module: log.module,
      entityId: log.entityId,
      oldValues: log.oldValues,
      newValues: log.newValues,
      ipAddress: `192.168.1.${100 + index}`,
      createdAt: new Date(Date.now() - index * 3 * 60 * 60 * 1000),
    };
    maps.auditLogs.set(auditId, auditLog);
  });

  const demoCategories: SystemCategory[] = [
    { id: randomUUID(), nameAr: "أنواع السحوبات", nameEn: "Draw Types", description: "تصنيفات أنواع السحوبات المختلفة", isActive: true, sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), nameAr: "طرق الدفع", nameEn: "Payment Methods", description: "طرق الدفع المتاحة للمستخدمين", isActive: true, sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), nameAr: "فئات الجوائز", nameEn: "Prize Categories", description: "تصنيفات مستويات الجوائز", isActive: true, sortOrder: 3, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), nameAr: "حالات البطاقات", nameEn: "Ticket Statuses", description: "حالات البطاقات المختلفة في النظام", isActive: true, sortOrder: 4, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), nameAr: "المناطق", nameEn: "Regions", description: "المناطق الجغرافية للمبيعات والتوزيع", isActive: true, sortOrder: 5, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), nameAr: "أنواع الإصدارات", nameEn: "Issue Types", description: "أنواع إصدارات اليانصيب", isActive: true, sortOrder: 6, createdAt: new Date(), updatedAt: new Date() },
  ];
  demoCategories.forEach((cat) => maps.systemCategoriesMap.set(cat.id, cat));

  const demoDefinitions: SystemDefinition[] = [
    { id: randomUUID(), category: "draw_type", code: "weekly", nameAr: "أسبوعي", nameEn: "Weekly", descriptionAr: "سحب أسبوعي منتظم", descriptionEn: "Regular weekly draw", isActive: true, sortOrder: 1, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "draw_type", code: "monthly", nameAr: "شهري", nameEn: "Monthly", descriptionAr: "سحب شهري كبير", descriptionEn: "Large monthly draw", isActive: true, sortOrder: 2, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "draw_type", code: "special", nameAr: "خاص", nameEn: "Special", descriptionAr: "سحب خاص بالمناسبات", descriptionEn: "Special occasion draw", isActive: true, sortOrder: 3, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "payment_method", code: "wallet", nameAr: "المحفظة", nameEn: "Wallet", descriptionAr: "الدفع من رصيد المحفظة", descriptionEn: "Pay from wallet balance", isActive: true, sortOrder: 1, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "payment_method", code: "cliq", nameAr: "كليك", nameEn: "CliQ", descriptionAr: "الدفع عبر نظام كليك", descriptionEn: "Pay via CliQ system", isActive: true, sortOrder: 2, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "payment_method", code: "credit_card", nameAr: "بطاقة ائتمان", nameEn: "Credit Card", descriptionAr: "الدفع ببطاقة ائتمان", descriptionEn: "Pay with credit card", isActive: true, sortOrder: 3, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "payment_method", code: "bank_transfer", nameAr: "تحويل بنكي", nameEn: "Bank Transfer", descriptionAr: "الدفع بتحويل بنكي", descriptionEn: "Pay via bank transfer", isActive: true, sortOrder: 4, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "region", code: "amman", nameAr: "عمّان", nameEn: "Amman", descriptionAr: "العاصمة عمّان", descriptionEn: "Capital city Amman", isActive: true, sortOrder: 1, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "region", code: "irbid", nameAr: "إربد", nameEn: "Irbid", descriptionAr: "محافظة إربد", descriptionEn: "Irbid governorate", isActive: true, sortOrder: 2, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "region", code: "zarqa", nameAr: "الزرقاء", nameEn: "Zarqa", descriptionAr: "محافظة الزرقاء", descriptionEn: "Zarqa governorate", isActive: true, sortOrder: 3, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "region", code: "aqaba", nameAr: "العقبة", nameEn: "Aqaba", descriptionAr: "محافظة العقبة", descriptionEn: "Aqaba governorate", isActive: true, sortOrder: 4, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "region", code: "mafraq", nameAr: "المفرق", nameEn: "Mafraq", descriptionAr: "محافظة المفرق", descriptionEn: "Mafraq governorate", isActive: true, sortOrder: 5, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "region", code: "karak", nameAr: "الكرك", nameEn: "Karak", descriptionAr: "محافظة الكرك", descriptionEn: "Karak governorate", isActive: true, sortOrder: 6, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "ticket_status", code: "active", nameAr: "نشط", nameEn: "Active", descriptionAr: "بطاقة نشطة وصالحة", descriptionEn: "Active and valid ticket", isActive: true, sortOrder: 1, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "ticket_status", code: "won", nameAr: "فائز", nameEn: "Won", descriptionAr: "بطاقة فائزة بجائزة", descriptionEn: "Winning ticket", isActive: true, sortOrder: 2, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "ticket_status", code: "lost", nameAr: "خاسر", nameEn: "Lost", descriptionAr: "بطاقة لم تفز", descriptionEn: "Non-winning ticket", isActive: true, sortOrder: 3, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "ticket_status", code: "voided", nameAr: "ملغي", nameEn: "Voided", descriptionAr: "بطاقة ملغاة", descriptionEn: "Cancelled ticket", isActive: true, sortOrder: 4, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "prize_category", code: "cash", nameAr: "نقدي", nameEn: "Cash", descriptionAr: "جائزة نقدية مباشرة", descriptionEn: "Direct cash prize", isActive: true, sortOrder: 1, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "prize_category", code: "car", nameAr: "سيارة", nameEn: "Car", descriptionAr: "جائزة سيارة", descriptionEn: "Car prize", isActive: true, sortOrder: 2, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "prize_category", code: "electronics", nameAr: "إلكترونيات", nameEn: "Electronics", descriptionAr: "أجهزة إلكترونية", descriptionEn: "Electronic devices", isActive: true, sortOrder: 3, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "prize_category", code: "travel", nameAr: "سفر", nameEn: "Travel", descriptionAr: "رحلات سياحية", descriptionEn: "Travel packages", isActive: true, sortOrder: 4, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "prize_category", code: "voucher", nameAr: "قسيمة", nameEn: "Voucher", descriptionAr: "قسائم شراء وهدايا", descriptionEn: "Shopping and gift vouchers", isActive: true, sortOrder: 5, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "issue_type", code: "regular", nameAr: "عادي", nameEn: "Regular", descriptionAr: "إصدار عادي منتظم", descriptionEn: "Regular standard issue", isActive: true, sortOrder: 1, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "issue_type", code: "special", nameAr: "خاص", nameEn: "Special", descriptionAr: "إصدار خاص بالمناسبات", descriptionEn: "Special occasion issue", isActive: true, sortOrder: 2, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    { id: randomUUID(), category: "issue_type", code: "support", nameAr: "دعم", nameEn: "Support", descriptionAr: "إصدار لدعم الأعمال الخيرية", descriptionEn: "Charitable support issue", isActive: true, sortOrder: 3, parentId: null, createdAt: new Date(), updatedAt: new Date() },
  ];
  demoDefinitions.forEach((def) => maps.systemDefinitions.set(def.id, def));

  const drawPrizeSets = [
    { drawId: draw1.id, prizes: [
      { category: "grand", prizeAmount: "25000.00", winnerCount: 1, description: "الجائزة الكبرى" },
      { category: "first", prizeAmount: "10000.00", winnerCount: 2, description: "المركز الأول" },
      { category: "second", prizeAmount: "5000.00", winnerCount: 5, description: "المركز الثاني" },
      { category: "consolation", prizeAmount: "500.00", winnerCount: 20, description: "جوائز تعزية" },
    ]},
    { drawId: draw2.id, prizes: [
      { category: "grand", prizeAmount: "12500.00", winnerCount: 1, description: "الجائزة الكبرى" },
      { category: "first", prizeAmount: "5000.00", winnerCount: 3, description: "المركز الأول" },
      { category: "second", prizeAmount: "2500.00", winnerCount: 5, description: "المركز الثاني" },
    ]},
    { drawId: draw3.id, prizes: [
      { category: "grand", prizeAmount: "50000.00", winnerCount: 1, description: "الجائزة الكبرى الشهرية" },
      { category: "first", prizeAmount: "20000.00", winnerCount: 2, description: "المركز الأول" },
      { category: "second", prizeAmount: "10000.00", winnerCount: 5, description: "المركز الثاني" },
      { category: "third", prizeAmount: "5000.00", winnerCount: 10, description: "المركز الثالث" },
      { category: "consolation", prizeAmount: "1000.00", winnerCount: 50, description: "جوائز تعزية" },
    ]},
    { drawId: pastDraw.id, prizes: [
      { category: "grand", prizeAmount: "25000.00", winnerCount: 1, description: "الجائزة الكبرى" },
      { category: "first", prizeAmount: "10000.00", winnerCount: 2, description: "المركز الأول" },
      { category: "second", prizeAmount: "5000.00", winnerCount: 5, description: "المركز الثاني" },
    ]},
  ];
  drawPrizeSets.forEach((set) => {
    set.prizes.forEach((prize) => {
      const id = randomUUID();
      maps.drawPrizes.set(id, {
        id,
        drawId: set.drawId,
        category: prize.category,
        prizeAmount: prize.prizeAmount,
        winnerCount: prize.winnerCount,
        description: prize.description,
        createdAt: new Date(),
      } as DrawPrize);
    });
  });

  const completedPayments = Array.from(maps.payments.values()).filter(p => p.status === "completed");
  if (completedPayments.length >= 3) {
    const refundData = [
      { status: "approved", reason: "تم شراء التذكرة بالخطأ" },
      { status: "pending", reason: "لم أعد أرغب في المشاركة في هذا السحب" },
      { status: "rejected", reason: "أريد استرداد المبلغ" },
    ];
    refundData.forEach((rd, index) => {
      const payment = completedPayments[index];
      if (!payment) return;
      const id = randomUUID();
      const refund: Refund = {
        id,
        ticketId: payment.ticketId,
        paymentId: payment.id,
        userId: payment.userId,
        amount: payment.amount,
        reason: rd.reason,
        status: rd.status,
        requestedBy: payment.userId,
        approvedBy: rd.status === "approved" ? financeAdminId : rd.status === "rejected" ? financeAdminId : null,
        approvedAt: rd.status !== "pending" ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : null,
        createdAt: new Date(Date.now() - (index + 3) * 24 * 60 * 60 * 1000),
      };
      maps.refunds.set(id, refund);
    });
  }

  const defaultSystemContent: SystemContent[] = [
    {
      id: randomUUID(),
      slug: "terms-and-conditions",
      titleAr: "الشروط والأحكام",
      titleEn: "Terms and Conditions",
      contentAr: "<h2>الشروط والأحكام</h2><p>مرحبًا بكم في اليانصيب الخيري الأردني. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط والأحكام التالية.</p><h3>أهلية المشاركة</h3><p>يجب أن يكون عمر المشارك 18 عامًا أو أكثر للمشاركة في اليانصيب.</p><h3>شراء البطاقات</h3><p>يمكن شراء بطاقات اليانصيب عبر الإنترنت أو من نقاط البيع المعتمدة.</p>",
      contentEn: "<h2>Terms and Conditions</h2><p>Welcome to the Jordanian Charitable Lottery. By using this website, you agree to comply with the following terms and conditions.</p><h3>Eligibility</h3><p>Participants must be 18 years of age or older to participate in the lottery.</p><h3>Ticket Purchase</h3><p>Lottery tickets can be purchased online or from authorized points of sale.</p>",
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: randomUUID(),
      slug: "privacy-policy",
      titleAr: "سياسة الخصوصية",
      titleEn: "Privacy Policy",
      contentAr: "<h2>سياسة الخصوصية</h2><p>نحن في اليانصيب الخيري الأردني نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p><h3>جمع البيانات</h3><p>نقوم بجمع البيانات اللازمة لتقديم خدماتنا بشكل فعال.</p><h3>استخدام البيانات</h3><p>نستخدم بياناتك فقط للأغراض المحددة في هذه السياسة.</p>",
      contentEn: "<h2>Privacy Policy</h2><p>At the Jordanian Charitable Lottery, we respect your privacy and are committed to protecting your personal data.</p><h3>Data Collection</h3><p>We collect the data necessary to provide our services effectively.</p><h3>Data Usage</h3><p>We use your data only for the purposes specified in this policy.</p>",
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: randomUUID(),
      slug: "about-us",
      titleAr: "من نحن",
      titleEn: "About Us",
      contentAr: "<h2>من نحن</h2><p>اليانصيب الخيري الأردني هو مؤسسة وطنية تهدف إلى دعم المشاريع الخيرية والتنموية في المملكة الأردنية الهاشمية.</p><h3>رسالتنا</h3><p>تقديم فرص متساوية للجميع للفوز بجوائز قيمة مع المساهمة في دعم المجتمع.</p>",
      contentEn: "<h2>About Us</h2><p>The Jordanian Charitable Lottery is a national institution aimed at supporting charitable and developmental projects in the Hashemite Kingdom of Jordan.</p><h3>Our Mission</h3><p>Providing equal opportunities for everyone to win valuable prizes while contributing to community support.</p>",
      isActive: true,
      sortOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: randomUUID(),
      slug: "faq",
      titleAr: "الأسئلة الشائعة",
      titleEn: "FAQ",
      contentAr: "<h2>الأسئلة الشائعة</h2><h3>كيف يمكنني شراء بطاقة يانصيب؟</h3><p>يمكنك شراء بطاقات اليانصيب من خلال موقعنا الإلكتروني أو من أي نقطة بيع معتمدة.</p><h3>كيف أعرف إذا فزت؟</h3><p>سيتم إخطارك عبر البريد الإلكتروني ورسالة نصية في حال فوزك بأي جائزة.</p>",
      contentEn: "<h2>FAQ</h2><h3>How can I buy a lottery ticket?</h3><p>You can buy lottery tickets through our website or from any authorized point of sale.</p><h3>How do I know if I won?</h3><p>You will be notified via email and SMS if you win any prize.</p>",
      isActive: true,
      sortOrder: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: randomUUID(),
      slug: "refund-policy",
      titleAr: "سياسة الاسترداد",
      titleEn: "Refund Policy",
      contentAr: "<h2>سياسة الاسترداد</h2><p>يمكن طلب استرداد المبلغ خلال 24 ساعة من عملية الشراء، بشرط عدم إجراء السحب بعد.</p><h3>كيفية طلب الاسترداد</h3><p>قم بالتواصل مع خدمة العملاء أو تقديم طلب من خلال حسابك الشخصي.</p>",
      contentEn: "<h2>Refund Policy</h2><p>A refund can be requested within 24 hours of purchase, provided the draw has not yet taken place.</p><h3>How to Request a Refund</h3><p>Contact customer service or submit a request through your personal account.</p>",
      isActive: true,
      sortOrder: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  defaultSystemContent.forEach((content) => {
    maps.systemContentMap.set(content.id, content);
  });
}
