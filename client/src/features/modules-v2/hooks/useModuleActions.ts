import { useState } from "react";
import moduleServices from "../api/modules.api";

export function useModuleActions(moduleId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await moduleServices.activate(moduleId);
      return res.data.module;
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to activate module");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const archive = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ModulesV2API.archive(moduleId);
      return res.data.module;
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to archive module");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    activate,
    archive,
    loading,
    error,
  };
}
