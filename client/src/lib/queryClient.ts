import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
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
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add authorization header if we have a token (unless it's a registration/login request)
  if (typeof window !== 'undefined' && !url.includes('/auth/register') && !url.includes('/auth/login')) {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        if (state?.token) {
          headers["Authorization"] = `Bearer ${state.token}`;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

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
    
    // Add authorization header if we have a token
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        try {
          const { state } = JSON.parse(authData);
          if (state?.token) {
            headers["Authorization"] = `Bearer ${state.token}`;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }

    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
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
