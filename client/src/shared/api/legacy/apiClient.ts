export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (typeof process !== "undefined" && process.env?.NODE_ENV === "development"
    ? "http://127.0.0.1:5001/silatacademy-7c2a5/us-central1/api/api/v1"
    : "https://api-f3rwhuz64a-uc.a.run.app/api/v1");

type ApiClientOptions = RequestInit & {
  body?: any;
};

const isJson = (body: any) =>
  body &&
  typeof body === "object" &&
  !(body instanceof FormData) &&
  !(body instanceof Blob) &&
  !(body instanceof URLSearchParams);

const buildBody = (body: any) => {
  if (!body) return undefined;
  return isJson(body) ? JSON.stringify(body) : body;
};

// Normalize URL
const resolveUrl = (endpoint: string) => {
  if (/^https?:\/\//.test(endpoint)) return endpoint;
  return `${API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;
};

// Normalize fetch response (this is the magic)
const normalizeResponse = async (response: Response) => {
  let data = null;

  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    ...data, // success, message, programs, etc.
  };
};

const request = (
  method: string,
  endpoint: string,
  options: ApiClientOptions = {},
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config: RequestInit = {
    ...options,
    method,
    headers,
  };

  if (method !== "GET" && method !== "HEAD") {
    const preparedBody = buildBody(options.body);
    config.body = preparedBody;

    if (preparedBody && isJson(options.body)) {
      headers["Content-Type"] = "application/json";
    }
  }

  return fetch(resolveUrl(endpoint), config).then(normalizeResponse);
};

const apiClient = {
  get: (endpoint: string, options?: ApiClientOptions) =>
    request("GET", endpoint, options),
  post: (endpoint: string, body?: any, options?: ApiClientOptions) =>
    request("POST", endpoint, { ...options, body }),
  put: (endpoint: string, body?: any, options?: ApiClientOptions) =>
    request("PUT", endpoint, { ...options, body }),
  patch: (endpoint: string, body?: any, options?: ApiClientOptions) =>
    request("PATCH", endpoint, { ...options, body }),
  delete: (endpoint: string, options?: ApiClientOptions) =>
    request("DELETE", endpoint, options),
};

export default apiClient;
