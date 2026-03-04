import { QueryClient, QueryFunction } from "@tanstack/react-query";

function clearAuthAndRedirect() {
  localStorage.removeItem("lottery_user");
  localStorage.removeItem("lottery_token");
  localStorage.removeItem("lottery_refresh_token");
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

async function throwIfResNotOk(res: Response) {
  if (res.status === 401) {
    clearAuthAndRedirect();
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
    clearAuthAndRedirect();
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
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers,
    });

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      clearAuthAndRedirect();
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
