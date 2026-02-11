// src/shared/sync/syncTypes.ts
export type SyncFeature = "attendance" | "lessons" | "exams";

export type SyncStatus = "pending" | "syncing" | "done" | "failed";

export type SyncOp<TPayload = any> = {
  id: string; // uuid
  feature: SyncFeature;
  type: string; // e.g. ATTENDANCE_MARK
  payload: TPayload;

  idempotencyKey: string; // header key
  createdAt: string; // ISO
  status: SyncStatus;
  retryCount: number;
  lastError?: string;
};

export type SyncHandler = (args: {
  op: SyncOp;
  headers: Record<string, string>;
}) => Promise<any>;
