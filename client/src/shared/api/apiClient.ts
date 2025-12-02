const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? "http://127.0.0.1:5001/silatacademy-7c2a5/us-central1/api/api/v1"
    : "/api/v1");
type RequestOptions = RequestInit & { body?: any };

const isJsonBody = (body: any) =>
  body &&
  typeof body === "object" &&
  !(body instanceof FormData) &&
  !(body instanceof Blob) &&
  !(body instanceof URLSearchParams);

const resolveUrl = (endpoint: string) => {
  if (/^https?:\/\//.test(endpoint)) return endpoint;
  return `${API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;
};

const normalize = async (response: Response) => {
  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  return {
    success: response.ok && payload?.success !== false,
    status: response.status,
    data: payload?.data ?? payload ?? null,
    error: response.ok ? null : payload?.error || payload?.message || null,
    raw: payload,
  };
};

const withAuthHeaders = (headers: HeadersInit = {}) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
};

const request = async (
  method: string,
  endpoint: string,
  options: RequestOptions = {}
) => {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  let body = options.body;
  if (method !== "GET" && method !== "HEAD" && isJsonBody(body)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const res = await fetch(resolveUrl(endpoint), {
    ...options,
    method,
    headers: withAuthHeaders(headers),
    body,
  });

  return normalize(res);
};

const apiClient = {
  get: (endpoint: string, options?: RequestOptions) =>
    request("GET", endpoint, options),
  post: (endpoint: string, body?: any, options?: RequestOptions) =>
    request("POST", endpoint, { ...options, body }),
  put: (endpoint: string, body?: any, options?: RequestOptions) =>
    request("PUT", endpoint, { ...options, body }),
  patch: (endpoint: string, body?: any, options?: RequestOptions) =>
    request("PATCH", endpoint, { ...options, body }),
  delete: (endpoint: string, options?: RequestOptions) =>
    request("DELETE", endpoint, options),
};

export default apiClient;
export { API_BASE_URL };
