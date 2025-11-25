import apiClient from "@/lib/apiClient";

const coachService = {
  getPlayers: () => apiClient.get("/coach/players"),
  getApprovals: () => apiClient.get("/coach/approvals"),
  approveBelt: (playerId, examId) =>
    apiClient.post("/coach/approve", { body: { playerId, examId } }),
  recordAttendance: (playerId, date, status) =>
    apiClient.post("/coach/attendance", {
      body: { playerId, date, status },
    }),
};

export default coachService;
