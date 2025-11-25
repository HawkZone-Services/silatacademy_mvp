import apiClient from "@/lib/apiClient";

const programService = {
  getPrograms: () => apiClient.get("/programs"),
  getProgramById: (id) => apiClient.get(`/programs/${id}`),
  createProgram: (body) => apiClient.post("/programs", { body }),
  updateProgram: (id, body) => apiClient.patch(`/programs/${id}`, { body }),
};

export default programService;
