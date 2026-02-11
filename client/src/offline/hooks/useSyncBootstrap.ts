// src/app/providers/useSyncBootstrap.ts
import { useEffect } from "react";
import { onNetworkChange } from "@/offline/utils/network";
import { runSyncOnce } from "@/offline/sync/syncWorker";

export const useSyncBootstrap = () => {
  useEffect(() => {
    // initial attempt
    runSyncOnce();

    // on back online
    const unsub = onNetworkChange((online) => {
      if (online) runSyncOnce();
    });

    // periodic safety (اختياري)
    const timer = window.setInterval(() => runSyncOnce(), 15000);

    return () => {
      unsub();
      window.clearInterval(timer);
    };
  }, []);
};
