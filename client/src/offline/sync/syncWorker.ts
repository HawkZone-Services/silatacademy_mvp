// src/shared/sync/syncWorker.ts
import { syncQueue } from "../queue/syncQueue";
import { getSyncHandler } from "./syncRegistry";
import { isOnline } from "../utils/network";

let running = false;

export const runSyncOnce = async () => {
  if (running) return;
  if (!isOnline()) return;

  running = true;
  try {
    const pending = syncQueue
      .listPending()
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

    for (const op of pending) {
      const handler = getSyncHandler(op);
      if (!handler) {
        syncQueue.update(op.id, { status: "failed", lastError: "NO_HANDLER" });
        continue;
      }

      syncQueue.update(op.id, { status: "syncing" });

      try {
        const headers = {
          "Idempotency-Key": op.idempotencyKey,
        };

        await handler({ op, headers });

        syncQueue.update(op.id, { status: "done", lastError: undefined });
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || err?.message || "SYNC_FAILED";
        const retryCount = (op.retryCount || 0) + 1;
        syncQueue.update(op.id, {
          status: "failed",
          retryCount,
          lastError: msg,
        });

        // stop on first failure to keep order (important for exams/lessons)
        break;
      }
    }
  } finally {
    running = false;
  }
};
