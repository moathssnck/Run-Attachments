import { API_CONFIG } from "./api-config";

type RawApiCard = Record<string, unknown>;
type RawApiNotebook = Record<string, unknown>;

export const CARD_PAGED_QUERY_KEY = API_CONFIG.cards.paged1000;
export const NOTEBOOK_PAGED_QUERY_KEY = API_CONFIG.notebooks.paged;

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function extractDigits(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDate(value: unknown): string {
  const raw = asString(value);
  if (!raw) {
    return new Date().toISOString().slice(0, 10);
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

function dateRange(dates: string[]): { min: string; max: string } {
  if (dates.length === 0) {
    const today = new Date().toISOString().slice(0, 10);
    return { min: today, max: today };
  }
  const sorted = [...dates].sort((a, b) => a.localeCompare(b));
  return { min: sorted[0], max: sorted[sorted.length - 1] };
}

function isCardActive(card: RawApiCard): boolean {
  const statusName = asString(card.cardStatusName ?? card.status).toLowerCase();
  const statusId = asNumber(card.cardStatusId);

  if (statusName.includes("void") || statusName.includes("cancel") || statusName.includes("inactive")) {
    return false;
  }

  if (statusId !== null) {
    return [7, 9, 11].includes(statusId);
  }

  return true;
}

function extractCardArray(payload: unknown): RawApiCard[] {
  if (Array.isArray(payload)) {
    return payload as RawApiCard[];
  }

  if (payload && typeof payload === "object") {
    const asObj = payload as Record<string, unknown>;

    if (Array.isArray(asObj.cards)) {
      return asObj.cards as RawApiCard[];
    }

    if (asObj.data && typeof asObj.data === "object") {
      const dataObj = asObj.data as Record<string, unknown>;
      if (Array.isArray(dataObj.cards)) {
        return dataObj.cards as RawApiCard[];
      }
      if (Array.isArray(dataObj.items)) {
        return dataObj.items as RawApiCard[];
      }
      if (Array.isArray(dataObj.data)) {
        return dataObj.data as RawApiCard[];
      }
    }

    if (Array.isArray(asObj.items)) {
      return asObj.items as RawApiCard[];
    }
  }

  return [];
}

function extractNotebookArray(payload: unknown): RawApiNotebook[] {
  if (Array.isArray(payload)) {
    return payload as RawApiNotebook[];
  }

  if (payload && typeof payload === "object") {
    const asObj = payload as Record<string, unknown>;

    if (Array.isArray(asObj.noteBooks)) {
      return asObj.noteBooks as RawApiNotebook[];
    }
    if (Array.isArray(asObj.notebooks)) {
      return asObj.notebooks as RawApiNotebook[];
    }
    if (Array.isArray(asObj.books)) {
      return asObj.books as RawApiNotebook[];
    }
    if (Array.isArray(asObj.items)) {
      return asObj.items as RawApiNotebook[];
    }

    if (asObj.data && typeof asObj.data === "object") {
      const dataObj = asObj.data as Record<string, unknown>;
      if (Array.isArray(dataObj.noteBooks)) {
        return dataObj.noteBooks as RawApiNotebook[];
      }
      if (Array.isArray(dataObj.notebooks)) {
        return dataObj.notebooks as RawApiNotebook[];
      }
      if (Array.isArray(dataObj.books)) {
        return dataObj.books as RawApiNotebook[];
      }
      if (Array.isArray(dataObj.items)) {
        return dataObj.items as RawApiNotebook[];
      }
      if (Array.isArray(dataObj.data)) {
        return dataObj.data as RawApiNotebook[];
      }
    }

    // Some APIs return a single notebook object.
    if (
      asObj.noteBookId !== undefined ||
      asObj.noteBookNo !== undefined ||
      asObj.noteBookNoFrom !== undefined ||
      asObj.noteBookNoTo !== undefined
    ) {
      return [asObj as RawApiNotebook];
    }
  }

  return [];
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("lottery_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type LotteryCardView = {
  id: number;
  cardNumber: string;
  fromDate: string;
  toDate: string;
  bookNumber: string;
  issueNumber: string;
  issueDate: string;
  drawDate: string;
  cardSide: "left" | "right";
  isActive: boolean;
  barcode?: string;
  createdAt: string;
};

export type LotteryBookView = {
  id: number;
  bookNumber: string;
  fromNumber: number;
  toNumber: number;
  date: string;
  fromDate: string;
  toDate: string;
  isActive: boolean;
  qrCode?: string;
  barcode?: string;
  createdAt: string;
};

export type TicketBookView = {
  id: number;
  bookNumber: string;
  fromNumber: number;
  toNumber: number;
  date: string;
  isActive: boolean;
  qrCode?: string;
  barcode?: string;
  createdAt: string;
};

export async function fetchCardApiRecords(): Promise<RawApiCard[]> {
  const response = await fetch(CARD_PAGED_QUERY_KEY, {
    credentials: "include",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to load cards (${response.status})`);
  }

  const payload = await response.json();
  return extractCardArray(payload);
}

export async function fetchNotebookApiRecords(): Promise<RawApiNotebook[]> {
  const response = await fetch(NOTEBOOK_PAGED_QUERY_KEY, {
    credentials: "include",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to load notebooks (${response.status})`);
  }

  const payload = await response.json();
  return extractNotebookArray(payload);
}

export function mapRawCardToLotteryCard(card: RawApiCard, index: number): LotteryCardView {
  const issueDate = normalizeDate(card.issueDate ?? card.createdAt ?? card.purchasedAt);
  const drawDate = normalizeDate(card.issueDrawingDate ?? card.drawDate ?? card.createdAt ?? card.purchasedAt);
  const direction = asString(card.cardDirectionName ?? card.cardDirection).toLowerCase();

  return {
    id: asNumber(card.cardId ?? card.id) ?? index + 1,
    cardNumber: asString(card.cardNo ?? card.cardNumber ?? card.ticketNumber, `CARD-${index + 1}`),
    fromDate: issueDate,
    toDate: drawDate,
    bookNumber: asString(card.noteBookName ?? card.cardNoteBookName ?? card.cardNoteBookId, "N/A"),
    issueNumber: asString(card.issueNumber ?? card.issueTypeId ?? card.cardNoteBookId, "1"),
    issueDate,
    drawDate,
    cardSide: direction === "r" || direction.includes("right") ? "right" : "left",
    isActive: isCardActive(card),
    barcode: asString(card.barcode ?? card.cardBarcode ?? card.cardNo),
    createdAt: asString(card.createdAt ?? card.purchasedAt, new Date().toISOString()),
  };
}

type GroupedBook = {
  id: number;
  bookNumber: string;
  numbers: number[];
  issueDates: string[];
  drawDates: string[];
  isActive: boolean;
  qrCode?: string;
  barcode?: string;
  createdAt: string;
};

function groupCardsIntoBooks(cards: RawApiCard[]): GroupedBook[] {
  const grouped = new Map<string, GroupedBook>();

  cards.forEach((raw, index) => {
    const bookNumber = asString(
      raw.noteBookName ?? raw.cardNoteBookName ?? raw.cardNoteBookId ?? raw.bookNumber,
      `BOOK-${index + 1}`,
    );
    const key = bookNumber;
    const id =
      asNumber(raw.cardNoteBookId ?? raw.noteBookId ?? raw.bookId ?? raw.id) ??
      index + 1;
    const cardNumber = asString(raw.cardNo ?? raw.cardNumber ?? raw.ticketNumber);
    const cardNumeric = extractDigits(cardNumber);
    const issueDate = normalizeDate(raw.issueDate ?? raw.createdAt ?? raw.purchasedAt);
    const drawDate = normalizeDate(raw.issueDrawingDate ?? raw.drawDate ?? raw.createdAt ?? raw.purchasedAt);

    if (!grouped.has(key)) {
      grouped.set(key, {
        id,
        bookNumber,
        numbers: [],
        issueDates: [],
        drawDates: [],
        isActive: false,
        qrCode: asString(raw.cardQR),
        barcode: cardNumber || asString(raw.barcode ?? raw.cardBarcode),
        createdAt: asString(raw.createdAt ?? raw.purchasedAt, new Date().toISOString()),
      });
    }

    const bucket = grouped.get(key)!;
    if (cardNumeric !== null) {
      bucket.numbers.push(cardNumeric);
    }
    bucket.issueDates.push(issueDate);
    bucket.drawDates.push(drawDate);
    bucket.isActive = bucket.isActive || isCardActive(raw);
    if (!bucket.qrCode) {
      bucket.qrCode = asString(raw.cardQR);
    }
    if (!bucket.barcode) {
      bucket.barcode = cardNumber || asString(raw.barcode ?? raw.cardBarcode);
    }
  });

  return Array.from(grouped.values()).sort((a, b) => a.id - b.id);
}

export function mapRawCardsToLotteryBooks(cards: RawApiCard[]): LotteryBookView[] {
  return groupCardsIntoBooks(cards).map((book, index) => {
    const fromNumber = book.numbers.length > 0 ? Math.min(...book.numbers) : 1;
    const toNumber = book.numbers.length > 0 ? Math.max(...book.numbers) : fromNumber;
    const issueRange = dateRange(book.issueDates);
    const drawRange = dateRange(book.drawDates);

    return {
      id: Number.isFinite(book.id) ? book.id : index + 1,
      bookNumber: book.bookNumber,
      fromNumber,
      toNumber,
      date: issueRange.min,
      fromDate: issueRange.min,
      toDate: drawRange.max,
      isActive: book.isActive,
      qrCode: book.qrCode,
      barcode: book.barcode,
      createdAt: book.createdAt,
    };
  });
}

export function mapRawCardsToTicketBooks(cards: RawApiCard[]): TicketBookView[] {
  return groupCardsIntoBooks(cards).map((book, index) => {
    const fromNumber = book.numbers.length > 0 ? Math.min(...book.numbers) : 1;
    const toNumber = book.numbers.length > 0 ? Math.max(...book.numbers) : fromNumber;
    const issueRange = dateRange(book.issueDates);

    return {
      id: Number.isFinite(book.id) ? book.id : index + 1,
      bookNumber: book.bookNumber,
      fromNumber,
      toNumber,
      date: issueRange.min,
      isActive: book.isActive,
      qrCode: book.qrCode,
      barcode: book.barcode,
      createdAt: book.createdAt,
    };
  });
}

function isNotebookActive(notebook: RawApiNotebook): boolean {
  const explicit = notebook.isActive ?? notebook.active ?? notebook.status;
  if (typeof explicit === "boolean") {
    return explicit;
  }

  const statusName = asString(
    notebook.noteBookStatusName ?? notebook.statusName ?? notebook.status,
  ).toLowerCase();
  if (
    statusName.includes("inactive") ||
    statusName.includes("closed") ||
    statusName.includes("delete") ||
    statusName.includes("void")
  ) {
    return false;
  }

  return true;
}

function mapRawNotebookBase(
  notebook: RawApiNotebook,
  index: number,
): Omit<LotteryBookView, "fromDate" | "toDate"> & { fromDate: string; toDate: string } {
  const id = asNumber(notebook.noteBookId ?? notebook.id) ?? index + 1;
  const bookNumber = asString(
    notebook.noteBookNo ?? notebook.bookNumber ?? notebook.noteBookNumber,
    `BOOK-${index + 1}`,
  );
  const fromNumber = asNumber(
    notebook.noteBookNoFrom ?? notebook.fromNumber ?? notebook.startNumber,
  ) ?? 1;
  const toNumber = asNumber(
    notebook.noteBookNoTo ?? notebook.toNumber ?? notebook.endNumber,
  ) ?? fromNumber;
  const fromDate = normalizeDate(
    notebook.issueDate ?? notebook.noteBookIssueDate ?? notebook.createdAt,
  );
  const toDate = normalizeDate(
    notebook.issueDrawingDate ??
      notebook.drawDate ??
      notebook.updatedAt ??
      notebook.issueDate ??
      notebook.createdAt,
  );

  return {
    id,
    bookNumber,
    fromNumber,
    toNumber,
    date: fromDate,
    fromDate,
    toDate,
    isActive: isNotebookActive(notebook),
    qrCode: asString(notebook.noteBookQR ?? notebook.qrCode),
    barcode: asString(notebook.noteBookBarcode ?? notebook.barcode),
    createdAt: asString(notebook.createdAt ?? notebook.issueDate, new Date().toISOString()),
  };
}

export function mapRawNotebooksToLotteryBooks(
  notebooks: RawApiNotebook[],
): LotteryBookView[] {
  return notebooks
    .map((notebook, index) => mapRawNotebookBase(notebook, index))
    .sort((a, b) => a.id - b.id);
}

export function mapRawNotebooksToTicketBooks(
  notebooks: RawApiNotebook[],
): TicketBookView[] {
  return notebooks
    .map((notebook, index) => {
      const mapped = mapRawNotebookBase(notebook, index);
      return {
        id: mapped.id,
        bookNumber: mapped.bookNumber,
        fromNumber: mapped.fromNumber,
        toNumber: mapped.toNumber,
        date: mapped.date,
        isActive: mapped.isActive,
        qrCode: mapped.qrCode,
        barcode: mapped.barcode,
        createdAt: mapped.createdAt,
      };
    })
    .sort((a, b) => a.id - b.id);
}
