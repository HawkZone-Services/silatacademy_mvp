import Module from "../models/Module.js";

export const recomputeModuleStatus = async (moduleId) => {
  const mod = await Module.findById(moduleId).populate("lessons").lean();
  if (!mod) return null;

  // archived stays archived
  if (mod.status === "archived") return mod;

  const hasLessons = (mod.lessons || []).length > 0;

  // If active -> keep active (but still validate lessons existence optionally)
  if (mod.status === "active") return mod;

  const nextStatus = hasLessons ? "ready" : "draft";

  await Module.updateOne(
    { _id: moduleId },
    { $set: { status: nextStatus, isActive: false } }
  );

  return await Module.findById(moduleId).lean();
};
