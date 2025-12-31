import apiClient from "@/shared/api/apiClient";
export const uploadAvatar = async (file: string | Blob) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await apiClient.patch("/users/me/avatar", formData);

  return res.data;
};
