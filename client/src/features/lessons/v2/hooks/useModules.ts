import { useEffect, useState } from "react";
import { ModulesAPI, ModuleOption } from "../api/modules.api";

export function useModules() {
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    ModulesAPI.getModules()
      .then((data) => {
        if (mounted) setModules(data);
      })
      .catch(() => {
        if (mounted) setError("Failed to load modules");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { modules, loading, error };
}
