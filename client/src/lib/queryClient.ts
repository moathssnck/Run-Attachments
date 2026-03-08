import { QueryClient, QueryFunction } from "@tanstack/react-query";

export async function tryRefreshToken(): Promise<boolean> {
  const storedRefresh = localStorage.getItem("lottery_refresh_token");
  const currentToken = localStorage.getItem("lottery_token");
  if (!storedRefresh) return false;
  if (isTokenExpired(storedRefresh)) {
    clearAuthAndRedirect();
    return false;
  }
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept-Language": localStorage.getItem("language") || "ar",
    };
    if (currentToken) headers["Authorization"] = `Bearer ${currentToken}`;
    const res = await fetch("/api/Auth/refresh", {
      method: "POST",
      headers,
      body: JSON.stringify({ refreshToken: storedRefresh }),
    });
    if (!res.ok) return false;
    const result = await res.json();
    const newToken =
      result.token ||
      result.accessToken ||
      result.data?.token ||
      result.data?.accessToken;
    const newRefresh = result.refreshToken || result.data?.refreshToken;
    if (!newToken) return false;
    localStorage.setItem("lottery_token", newToken);
    if (newRefresh) localStorage.setItem("lottery_refresh_token", newRefresh);
    return true;
  } catch {
    return false;
  }
}

function clearAuthAndRedirect() {
  localStorage.removeItem("lottery_user");
  localStorage.removeItem("lottery_token");
  localStorage.removeItem("lottery_refresh_token");
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function getStoredToken(): string | null {
  const token = localStorage.getItem("lottery_token");
  if (!token) return null;
  if (isTokenExpired(token)) {
    localStorage.removeItem("lottery_token");
    localStorage.removeItem("lottery_refresh_token");
    localStorage.removeItem("lottery_user");
    return null;
  }
  return token;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const buildHeaders = (): Record<string, string> => {
    const h: Record<string, string> = {};
    if (data !== undefined) h["Content-Type"] = "application/json";
    const token = getStoredToken();
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  };

  let res = await fetch(url, {
    method,
    headers: buildHeaders(),
    body: data !== undefined ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      res = await fetch(url, {
        method,
        headers: buildHeaders(),
        body: data !== undefined ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
    }
    if (res.status === 401) {
      throw new Error("401: Unauthorized");
    }
  }

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const buildHeaders = (): Record<string, string> => {
      const h: Record<string, string> = {};
      const token = getStoredToken();
      if (token) h["Authorization"] = `Bearer ${token}`;
      return h;
    };

    const url = queryKey.join("/") as string;
    let res = await fetch(url, {
      credentials: "include",
      headers: buildHeaders(),
    });

    if (res.status === 401) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        res = await fetch(url, {
          credentials: "include",
          headers: buildHeaders(),
        });
      }
      if (res.status === 401) {
        if (unauthorizedBehavior === "returnNull") return null;
        clearAuthAndRedirect();
        throw new Error("401: Session expired. Please log in again.");
      }
    }

    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }

    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
