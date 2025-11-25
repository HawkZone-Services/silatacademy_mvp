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

const request = (
  method: string,
  url: string,
  options: ApiClientOptions = {}
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const headers: Record<string, string> = {
    Authorization: token ? `Bearer ${token}` : "",
    ...(options.headers as Record<string, string>),
  };

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

  return fetch(url, config);
};

const apiClient = {
  get: (url: string, options?: ApiClientOptions) =>
    request("GET", url, options),
  post: (url: string, options?: ApiClientOptions) =>
    request("POST", url, options),
  put: (url: string, options?: ApiClientOptions) =>
    request("PUT", url, options),
  patch: (url: string, options?: ApiClientOptions) =>
    request("PATCH", url, options),
  delete: (url: string, options?: ApiClientOptions) =>
    request("DELETE", url, options),
};

export default apiClient;
