import apiClient from "@/lib/apiClient";

const authService = {
  login: (body) => apiClient.post("/auth/login", body),
  register: (body) => apiClient.post("/auth/register", body),
  me: () => apiClient.get("/auth/me"),
};

export default authService;
