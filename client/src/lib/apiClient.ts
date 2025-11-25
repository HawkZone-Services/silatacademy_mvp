export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (typeof process !== "undefined" && process.env?.NODE_ENV === "development"
    ? "http://127.0.0.1:5001/silatacademy-7c2a5/us-central1/api/api/v1"
    : "https://api-f3rwhuz64a-uc.a.run.app/api/v1");

type ApiClientOptions = RequestInit & {
  body?: BodyInit | Record<string, unknown> | null;
};

const isJsonLike = (body: unknown): body is Record<string, unknown> =>
  body !== null &&
  typeof body === "object" &&
  !(body instanceof FormData) &&
  !(body instanceof Blob) &&
  !(body instanceof ArrayBuffer) &&
  !(body instanceof URLSearchParams);

const buildBody = (body: ApiClientOptions["body"]) => {
  if (body === undefined || body === null) return undefined;
  if (isJsonLike(body)) return JSON.stringify(body);
  return body as BodyInit;
};

const resolveUrl = (endpoint: string) => {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  const base = API_BASE_URL.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

const request = (
  method: string,
  endpoint: string,
  options: ApiClientOptions = {}
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
    if (
      preparedBody &&
      !(preparedBody instanceof FormData) &&
      !(preparedBody instanceof Blob) &&
      !(preparedBody instanceof ArrayBuffer) &&
      !(preparedBody instanceof URLSearchParams)
    ) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }
    config.body = preparedBody;
  } else {
    delete (config as any).body;
  }

  return fetch(resolveUrl(endpoint), config);
};

const apiClient = {
  get: (endpoint: string, options?: ApiClientOptions) =>
    request("GET", endpoint, options),
  post: (endpoint: string, options?: ApiClientOptions) =>
    request("POST", endpoint, options),
  put: (endpoint: string, options?: ApiClientOptions) =>
    request("PUT", endpoint, options),
  patch: (endpoint: string, options?: ApiClientOptions) =>
    request("PATCH", endpoint, options),
  delete: (endpoint: string, options?: ApiClientOptions) =>
    request("DELETE", endpoint, options),
};

export default apiClient;
