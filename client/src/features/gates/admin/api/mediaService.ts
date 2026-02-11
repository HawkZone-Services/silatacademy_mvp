import apiClient from "@/shared/api/apiClient";

const uploadCoachGallery = (coachId: string, formData: FormData) => {
  return apiClient.post(`/coaches/${coachId}/gallery`, formData);
};

export default {
  uploadCoachGallery,
};
