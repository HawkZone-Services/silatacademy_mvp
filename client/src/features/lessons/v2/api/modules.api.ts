import apiClient from "@/shared/api/apiClient";

export type ModuleOption = {
  _id: string;
  title: string;
  moduleType: "A" | "B" | "P" | "E";
  beltLevel: string;
  program: {
    _id: string;
    title: string;
  };
};

export const ModulesAPI = {
  async getModules(): Promise<ModuleOption[]> {
    const res = await apiClient.get("/modules");
    return res.data.data;
  },
};
