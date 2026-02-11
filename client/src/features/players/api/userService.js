import apiClient from "@/shared/api/apiClient";

const userService = {
  // -----------------------------
  //  GET ALL USERS (Admin only)
  // -----------------------------
  getAll: () => apiClient.get("/users"),

  // -----------------------------
  //  GET ALL STUDENTS ONLY
  // -----------------------------
  getAllStudents: () => apiClient.get("/users/students"),

  // -----------------------------
  //  GET ALL INSTRUCTORS
  // -----------------------------
  getAllInstructors: () => apiClient.get("/users/instructors"),

  // -----------------------------
  //  GET USER BY ID
  // -----------------------------
  getById: (id) => apiClient.get(`/users/${id}`),

  // -----------------------------
  //  UPDATE USER
  // -----------------------------
  updateUser: (id, body) => apiClient.patch(`/users/${id}`, body),

  // -----------------------------
  //  DELETE USER
  // -----------------------------
  deleteUser: (id) => apiClient.delete(`/users/${id}`),

  // -----------------------------
  //  SEARCH (name, email, nationalId)
  // -----------------------------
  search: (query) =>
    apiClient.get(`/users/search?q=${encodeURIComponent(query)}`),

  // -----------------------------
  //  GET USER PROFILE (authenticated)
  // -----------------------------
  myProfile: () => apiClient.get("/users/me"),

  // -----------------------------
  //  UPDATE PROFILE (self)
  // -----------------------------
  updateProfile: (body) => apiClient.patch("/users/me", body),

  // -----------------------------
  //  CHANGE PASSWORD
  // -----------------------------
  changePassword: (body) => apiClient.post("/users/change-password", body),

  // -----------------------------
  //  ADMIN CREATE USER
  // -----------------------------
  createUser: (body) => apiClient.post("/auth/register", body),
};

export default userService;
