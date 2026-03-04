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
    list: "/api/CustomeSettingSystem?includeDeleted=false",
    base: "/api/CustomeSettingSystem",
    byId: (id: ApiEntityId) => `/api/CustomeSettingSystem/${id}`,
    activeById: (id: ApiEntityId) => `/api/CustomeSettingSystem/active/${id}`,
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
  lookupCategory: {
    list: "/api/LookupCategory?includeDeleted=false",
    base: "/api/LookupCategory",
    byId: (id: ApiEntityId) => `/api/LookupCategory/${id}`,
  },
} as const;
