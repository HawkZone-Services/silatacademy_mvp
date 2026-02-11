import apiClient from "@/shared/api/apiClient";

const eligibilityService = {
  get: () => apiClient.get("/student/eligibility"),
};

export default eligibilityService;
