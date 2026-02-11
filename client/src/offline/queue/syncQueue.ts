// src/shared/sync/syncQueue.ts
import { localStore } from "../utils/localStore";
import { SyncOp } from "../sync/syncTypes";

const KEY = "sync_ops_v1";

const readAll = (): SyncOp[] => localStore.getJSON<SyncOp[]>(KEY, []);
const writeAll = (ops: SyncOp[]) => localStore.setJSON(KEY, ops);

export const syncQueue = {
  list(): SyncOp[] {
    return readAll();
  },

  listPending(): SyncOp[] {
    return readAll().filter(
      (o) => o.status === "pending" || o.status === "failed",
    );
  },

  add(op: SyncOp) {
    const ops = readAll();
    ops.push(op);
    writeAll(ops);
  },

  update(id: string, patch: Partial<SyncOp>) {
    const ops = readAll();
    const idx = ops.findIndex((o) => o.id === id);
    if (idx === -1) return;
    ops[idx] = { ...ops[idx], ...patch };
    writeAll(ops);
  },

  remove(id: string) {
    const ops = readAll().filter((o) => o.id !== id);
    writeAll(ops);
  },

  clearDone() {
    const ops = readAll().filter((o) => o.status !== "done");
    writeAll(ops);
  },
};
