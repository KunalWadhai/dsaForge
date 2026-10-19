/**
 * API boundary for the Node.js backend.
 *
 * Auth contract:
 * - Access token: short-lived (15min), stored in memory
 * - Refresh token: long-lived (7 days), HttpOnly + Secure cookie
 * - Never store tokens in localStorage/sessionStorage
 *
 * Flow:
 * 1. Login/Register returns access token in JSON + refresh token in cookie
 * 2. Store access token in memory (module variable)
 * 3. Send access token in Authorization header
 * 4. On 401, try refresh ONCE using the HttpOnly cookie
 * 5. If refresh succeeds, update access token and retry original request
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

export type ApiError = { message: string; status?: number };

// Store access token in memory (cleared on page refresh - that's intentional)
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: { retryOnUnauthorized?: boolean; skipAuth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> || {}),
  };

  // Add access token if available and not skipped
  if (accessToken && !options.skipAuth) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include", // Important: sends HttpOnly cookies
    headers,
  });

  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401 && options.retryOnUnauthorized !== false && path !== "/auth/refresh") {
    console.log("Access token expired, attempting refresh...");
    
    try {
      // Try to refresh using the HttpOnly cookie
      const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.success && refreshData.data.accessToken) {
          // Update access token in memory
          setAccessToken(refreshData.data.accessToken);
          console.log("Access token refreshed successfully");
          
          // Retry original request with new token
          return apiRequest<T>(path, init, { retryOnUnauthorized: false });
        }
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    // If refresh failed, clear token and throw error
    clearAccessToken();
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {}
    throw Object.assign(new Error(message), { status: response.status } as ApiError);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiRequest<{ success: true; data: { user: { id: string; name: string; email: string }; accessToken: string } }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      { retryOnUnauthorized: false, skipAuth: true }
    );
    
    // Store access token in memory
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await apiRequest<{ success: true; data: { user: { id: string; name: string; email: string }; accessToken: string } }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      },
      { retryOnUnauthorized: false, skipAuth: true }
    );
    
    // Store access token in memory
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    
    return response.data;
  },
  
  me: async () => {
    const response = await apiRequest<{ success: true; data: { user: { id: string; name: string; email: string } } }>("/auth/me");
    return response.data;
  },
  
  logout: async () => {
    // Always clear the in-memory token first so no further authenticated
    // requests can be made, regardless of whether the server call succeeds.
    clearAccessToken();
    try {
      // Fire-and-forget the server-side session invalidation.
      // We skip auth (token already cleared) and never retry on 401.
      // The server returns 204 No Content on success; errors are swallowed
      // intentionally — the user is logged out client-side either way.
      await apiRequest<void>(
        "/auth/logout",
        { method: "POST" },
        { retryOnUnauthorized: false, skipAuth: true },
      );
    } catch {
      // Silently ignore — client is already logged out.
    }
  },
  
  // Manual refresh (usually not needed - automatic on 401)
  refresh: async () => {
    const response = await apiRequest<{ success: true; data: { user: { id: string; name: string; email: string }; accessToken: string } }>(
      "/auth/refresh",
      { method: "POST" },
      { retryOnUnauthorized: false, skipAuth: true }
    );
    
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    
    return response.data;
  },
};

export const chatApi = {
  listConversations: async () => {
    const response = await apiRequest<{ success: true; data: Array<{ id: string; title: string; updatedAt: string }> }>("/conversations");
    return response.data;
  },
  createConversation: async (title = "New conversation") => {
    const response = await apiRequest<{ success: true; data: { id: string; title: string } }>("/conversations", { 
      method: "POST", 
      body: JSON.stringify({ title }) 
    });
    return response.data;
  },
  sendMessage: async (conversationId: string, message: string) => {
    const response = await apiRequest<{ success: true; data: { id: string; answer: string; sources?: Array<{ title: string; score?: number }> } }>(
      `/conversations/${conversationId}/messages`, 
      { method: "POST", body: JSON.stringify({ message }) }
    );
    return response.data;
  },
  deleteConversation: async (conversationId: string) => {
    const response = await apiRequest<{ success: true; message: string }>(
      `/conversations/${conversationId}`,
      { method: "DELETE" }
    );
    return response;
  },
};
