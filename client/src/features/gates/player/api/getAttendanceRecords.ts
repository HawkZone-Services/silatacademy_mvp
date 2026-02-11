import apiClient from "@/shared/api/apiClient";
export const getMyAttendance = () => apiClient.get("/attendance/my/logs");
