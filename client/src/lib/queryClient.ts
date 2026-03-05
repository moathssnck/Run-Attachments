import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { env } from "process";

export async function tryRefreshToken(): Promise<boolean> {
  const storedRefresh = localStorage.getItem("lottery_refresh_token");
  if (!storedRefresh) return false;
  try {
    const res = await fetch("/api/Auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: storedRefresh,
        token: process.env.DEFAULT_API_TOKEN,
      }),
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

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const buildHeaders = (): Record<string, string> => {
    const h: Record<string, string> = {};
    if (data !== undefined) h["Content-Type"] = "application/json";
    // const token = localStorage.getItem("lottery_token");
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEwMDEyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoibXV0MTIzNDU2MjFAZXhhbXBsZS5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoibXV0MTIzNDU2MjFAZXhhbXBsZS5jb20iLCJqdGkiOiIzMDljZjMzMS0zM2JhLTQxNjUtYmUwNS01NmM0OWI3MzlmNzEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJVU0VSIiwiZXhwIjoxNzc1MzAwNjQzLCJpc3MiOiJJVGhpbmsiLCJhdWQiOiJJVGhpbmsifQ.L4P7-WKWSjMZLpsHkSRJmMylkPEqYTFiwQ7nB7Cyfa4";

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
      const token = localStorage.getItem("lottery_token");
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
