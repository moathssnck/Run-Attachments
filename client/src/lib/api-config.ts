type ApiEntityId = string | number;

export const API_CONFIG = {
  cards: {
    paged1000: "/api/Card/paged?pageNumber=1&pageSize=1000",
  },
  payments: {
    retrieve3dsTest:
      "/api/payments/3ds/retrieve?orderId=TEST-ORDER-3&transactionId=1",
  },
  cardSettings: {
    get: "/api/CardSetting",
    upsert: "/api/CardSetting",
  },
  customSettingSystem: {
    list: "/api/SystemContent?includeDeleted=false",
    upsert: "/api/SystemContent/upsert",
    byId: (id: ApiEntityId) => `/api/SystemContent/${id}`,
    byLookupId: (id: ApiEntityId) => `/api/SystemContent/lookup/${id}`,
  },
  systemContent: {
    list: "/api/SystemContent?includeDeleted=false",
    upsert: "/api/SystemContent/upsert",
    byId: (id: ApiEntityId) => `/api/SystemContent/${id}`,
    byLookupId: (id: ApiEntityId) => `/api/SystemContent/lookup/${id}`,
  },
  issues: {
    base: "/api/Issue",
    all: "/api/Issue/all",
    paged: "/api/Issue/paged?pageNumber=1&pageSize=100",
    byId: (id: ApiEntityId) => `/api/Issue/${id}`,
    byType: (id: ApiEntityId) => `/api/Issue/by-type/${id}`,
    byStatus: (id: ApiEntityId) => `/api/Issue/by-status/${id}`,
    currentYear: "/api/Issue/current-year",
    statistics: "/api/Issue/statistics",
    createWithCards: "/api/Issue/issue/create-with-cards",
    search: "/api/Issue/search",
  },
  notebooks: {
    base: "/api/NoteBook",
    all: "/api/NoteBook/all",
    paged: "/api/NoteBook/paged?pageNumber=1&pageSize=100",
    byId: (id: ApiEntityId) => `/api/NoteBook/${id}`,
    byStatus: (id: ApiEntityId) => `/api/NoteBook/by-status/${id}`,
    byIssue: (id: ApiEntityId) => `/api/NoteBook/by-issue/${id}`,
    search: "/api/NoteBook/search",
  },
  prizes: {
    base: "/api/Prize",
    byId: (id: ApiEntityId) => `/api/Prize/${id}`,
    byCategory: (id: ApiEntityId) => `/api/Prize/category/${id}`,
    byLevel: (level: ApiEntityId) => `/api/Prize/level/${level}`,
  },
  roles: {
    list: "/api/Roles?includeDeleted=false",
    base: "/api/Roles",
    byId: (id: ApiEntityId) => `/api/Roles/${id}`,
    permissions: (id: ApiEntityId) => `/api/Roles/${id}/permissions`,
    users: (id: ApiEntityId) => `/api/Roles/${id}/users`,
  },
  userManagement: {
    all: "/api/UserManagement/get-all-users",
  },
  auditLog: {
    list: "/api/AuditLog",
    today: "/api/AuditLog/today",
    failed: "/api/AuditLog/failed",
    logins: "/api/AuditLog/logins",
    byUser: (userId: ApiEntityId) => `/api/AuditLog/user/${userId}`,
  },
  lookupCategory: {
    list: "/api/LookupCategory?includeDeleted=false",
    base: "/api/LookupCategory",
    byId: (id: ApiEntityId) => `/api/LookupCategory/${id}`,
  },
  lookup: {
    list: "/api/Lookup?includeDeleted=false",
    base: "/api/Lookup",
    byId: (id: ApiEntityId) => `/api/Lookup/${id}`,
    byCategory: (id: ApiEntityId) => `/api/Lookup/active/${id}`,
  },
} as const;
