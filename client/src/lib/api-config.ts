type ApiEntityId = string | number;

export const API_CONFIG = {
  cards: {
    paged1000: "/api/Card/paged?pageNumber=1&pageSize=1000",
    byId: (id: ApiEntityId) => `/api/Card/${id}`,
    byQr: (qrCode: string) => `/api/Card/qr/${qrCode}`,
    all: "/api/Card/all",
    paged: (pageNumber: number, pageSize: number) =>
      `/api/Card/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    search: "/api/Card/search",
    sell: "/api/Card/sell",
    decodeQr: "/api/Card/decode-qr",
    generateNotebooksCards: "/api/Card/generate-notebooks-cards",
    quickPay: "/api/Card/quick-pay",
    transfer: "/api/Card/transfer",
    myCards: "/api/Card/my-cards",
  },
  payments: {
    retrieve3dsTest:
      "/api/payments/3ds/retrieve?orderId=TEST-ORDER-3&transactionId=1",
    // Admin endpoints
    adminList: "/api/admin/payments",
    adminPaged: (page: number, pageSize: number) =>
      `/api/admin/payments?page=${page}&pageSize=${pageSize}`,
    adminById: (id: ApiEntityId) => `/api/admin/payments/${id}`,
    adminByOrderId: (orderId: string) => `/api/admin/payments/order/${orderId}`,
    // 3DS endpoints
    initiate3ds: "/api/mpgs/3ds/initiate",
    authenticate3ds: "/api/payments/3ds/authenticate",
    redirect3ds: "/api/payments/3ds/redirect",
    retrieve3ds: "/api/payments/3ds/retrieve",
    pay: "/api/payments/pay",
    // Checkout
    checkoutStart: "/api/checkout/start",
    checkoutStartWallet: "/api/checkout/start-wallet",
    // OTP
    otpSmsSend: "/api/v1/otp/sms/send",
    otpSmsVerify: "/api/v1/otp/sms/verify",
    otpEmailSend: "/api/v1/otp/email/send",
    otpEmailVerify: "/api/v1/otp/email/verify",
    otpWhatsappSend: "/api/v1/otp/whatsapp/send",
    otpWhatsappVerify: "/api/v1/otp/whatsapp/verify",
    // CliQ
    cliqQr: "/api/v1/cliq/qr",
    cliqStatus: (qrRefNo: string) => `/api/v1/cliq/qr/${qrRefNo}/status`,
    cliqInquiry: (qrRefNo: string) => `/api/v1/cliq/qr/${qrRefNo}/inquiry`,
  },
  cardTransfer: {
    byId: (id: ApiEntityId) => `/api/CardTransfer/${id}`,
    paged: "/api/CardTransfer/paged",
    pagedWithParams: (params: string) => `/api/CardTransfer/paged?${params}`,
    sentBy: (userId: ApiEntityId, pageNumber = 1, pageSize = 10) =>
      `/api/CardTransfer/sent-by/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    receivedBy: (userId: ApiEntityId, pageNumber = 1, pageSize = 10) =>
      `/api/CardTransfer/received-by/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    byCard: (cardId: ApiEntityId, pageNumber = 1, pageSize = 10) =>
      `/api/CardTransfer/by-card/${cardId}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
  },
  userActivities: {
    byUser: (userId: ApiEntityId) => `/api/user/${userId}/activities`,
    cardDetail: (userId: ApiEntityId, cardId: ApiEntityId) =>
      `/api/user/${userId}/activities/card/${cardId}`,
  },
  auth: {
    register: "/api/Auth/register",
    login: "/api/Auth/login",
    refresh: "/api/Auth/refresh",
    changePassword: "/api/Auth/change-password",
    forgotPassword: "/api/Auth/forgot-password",
    resetPassword: "/api/Auth/reset-password",
    revoke: "/api/Auth/revoke",
    googleSignin: "/api/Auth/google-signin",
    searchByPhone: "/api/Auth/search-by-phone",
  },
  profile: {
    byId: (id: ApiEntityId) => `/api/Profile/${id}`,
    update: (id: ApiEntityId) => `/api/Profile/${id}`,
    image: (id: ApiEntityId) => `/uploads/profiles/profile-${id}.png`,
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
  mixture: {
    base: "/api/Mixture",
    list: "/api/Mixture",
    availableNotebooks: "/api/Mixture/available-notebooks",
    availableNotebooksByIssue: (issueId: ApiEntityId) =>
      `/api/Mixture/available-notebooks/${issueId}`,
    activate: (id: ApiEntityId) => `/api/Mixture/${id}/activate`,
    changeStatus: (id: ApiEntityId) => `/api/Mixture/${id}/change-status`,
    byNotebook: (notebookNo: ApiEntityId, issueId: ApiEntityId) =>
      `/api/Mixture/notebook/${notebookNo}?issueId=${issueId}`,
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
