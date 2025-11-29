import apiClient from "../lib/apiClient";

const programService = {
  // ⚡ Get all programs (simple list)
  getPrograms: () => apiClient.get("/programs"),

  // ⚡ Get program by id
  getProgramById: (id) => apiClient.get(`/programs/${id}`),

  // ⚡ Create program
  createProgram: (body) => apiClient.post("/programs", body),

  // ⚡ Update program
  updateProgram: (id, body) => apiClient.patch(`/programs/${id}`, body),

  // ⚡ Delete program
  deleteProgram: (id) => apiClient.delete(`/programs/${id}`),

  // ⚡ NEW: full programs including modules (for Programs.tsx)
  getProgramsFull: () => apiClient.get("/programs/full"),

  // ⚡ NEW: Get modules by program (for AddLessonDialog)
  getModulesByProgram: (programId) =>
    apiClient.get(`/programs/${programId}/modules`),
};

export default programService;
