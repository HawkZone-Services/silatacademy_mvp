import apiClient from "@/shared/api/apiClient";

const eventService = {
  list: () => apiClient.get("/events"),
  getById: (id) => apiClient.get(`/events/${id}`),
  create: (body) => apiClient.post("/events", body),
  update: (id, body) => apiClient.patch(`/events/${id}`, body),
  register: (body) => apiClient.post("/events/register", body),
};

export default eventService;
