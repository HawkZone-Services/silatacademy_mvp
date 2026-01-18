import apiClient from "@/shared/api/apiClient";

const moduleServices = {
  // List all modules (admin sees all, student backend filters later)
  getModules() {
    return apiClient.get("/modules");
  },

  // Modules for specific program
  getModulesByProgram: (programId: string) =>
    apiClient.get(`/programs/${programId}/modules`),

  // Single module
  getModuleById: (id: string) => apiClient.get(`/modules/${id}`),
  // Create (backend sets: status=draft, isActive=false)
  createModule: (body: any) => apiClient.post("/modules", body),
  // Update (backend guards based on status)
  updateModule: (id: string, body: any) =>
    apiClient.patch(`/modules/${id}`, body),

  // ✅ NEW: Activate module (admin only)
  activateModule: (id: string) => apiClient.post(`/modules/${id}/activate`),

  // ✅ NEW: Archive module (admin only)
  archiveModule: (id: string) => apiClient.post(`/modules/${id}/archive`),

  // ⚠️ Legacy: "delete" becomes archive (soft delete)
  // keep the name to avoid breaking old UI calls
  deleteModule: (id: string) => apiClient.post(`/modules/${id}/archive`),
};

export default moduleServices;
