import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function tryRefreshToken(): Promise<boolean> {
  const storedRefresh = localStorage.getItem("lottery_refresh_token");
  if (!storedRefresh) return false;
  try {
    const res = await fetch("/api/Auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: storedRefresh }),
    });
    if (!res.ok) return false;
    const result = await res.json();
    const newToken =
      result.token ||
      result.accessToken ||
      result.data?.token ||
      result.data?.accessToken;
    const newRefresh =
      result.refreshToken ||
      result.data?.refreshToken;
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

async function handle401(): Promise<boolean> {
  const refreshed = await tryRefreshToken();
  if (!refreshed) {
    clearAuthAndRedirect();
  }
  return refreshed;
}

async function throwIfResNotOk(res: Response) {
  if (res.status === 401) {
    await handle401();
    throw new Error("401: Session expired. Please log in again.");
  }
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (data !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("lottery_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshed = await handle401();
    if (refreshed) {
      const newToken = localStorage.getItem("lottery_token");
      if (newToken) headers["Authorization"] = `Bearer ${newToken}`;
      const retried = await fetch(url, {
        method,
        headers,
        body: data !== undefined ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      await throwIfResNotOk(retried);
      return retried;
    }
    throw new Error("401: Session expired. Please log in again.");
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem("lottery_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const url = queryKey.join("/") as string;
    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          const newToken = localStorage.getItem("lottery_token");
          const retryHeaders: Record<string, string> = {};
          if (newToken) retryHeaders["Authorization"] = `Bearer ${newToken}`;
          const retried = await fetch(url, { credentials: "include", headers: retryHeaders });
          if (retried.ok) return await retried.json();
        }
        return null;
      }
      const refreshed = await handle401();
      if (refreshed) {
        const newToken = localStorage.getItem("lottery_token");
        const retryHeaders: Record<string, string> = {};
        if (newToken) retryHeaders["Authorization"] = `Bearer ${newToken}`;
        const retried = await fetch(url, { credentials: "include", headers: retryHeaders });
        if (retried.ok) return await retried.json();
      }
      throw new Error("401: Session expired. Please log in again.");
    }

    await throwIfResNotOk(res);
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
