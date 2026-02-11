// src/shared/sync/syncRegistry.ts
import { SyncHandler, SyncOp } from "./syncTypes";

const registry = new Map<string, SyncHandler>();

export const registerSyncHandler = (
  feature: string,
  type: string,
  handler: SyncHandler,
) => {
  registry.set(`${feature}:${type}`, handler);
};

export const getSyncHandler = (op: SyncOp) => {
  return registry.get(`${op.feature}:${op.type}`);
};
