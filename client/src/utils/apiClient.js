export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:5001/silatacademy-7c2a5/us-central1/api/api/"
    : "https://api-f3rwhuz64a-uc.a.run.app/api/";

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const res = await fetch(API_BASE_URL + endpoint, config);

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid JSON response");
  }

  if (!res.ok) {
    throw new Error(data.message || "API Error");
  }

  return data;
};
