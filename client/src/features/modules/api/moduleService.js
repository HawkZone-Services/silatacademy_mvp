import apiClient from "@/shared/api/legacy/apiClient";

const moduleService = {
  // List all modules
  getModules: () => apiClient.get("/modules"),

  // Modules for specific program
  getModulesByProgram: (programId) =>
    apiClient.get(`/programs/${programId}/modules`),

  // Single module
  getModuleById: (id) => apiClient.get(`/modules/${id}`),

  // Create
  createModule: (body) => apiClient.post("/modules", body),

  // Update
  updateModule: (id, body) => apiClient.patch(`/modules/${id}`, body),

  // Delete
  deleteModule: (id) => apiClient.delete(`/modules/${id}`),
};

export default moduleService;
