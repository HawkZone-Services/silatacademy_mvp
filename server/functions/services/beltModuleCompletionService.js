import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";

/**
 * Returns completion per module (A/B/P) within a specific beltLevel.
 * This does NOT lock anything by itself. It's a pure calculation.
 *
 * Assumptions:
 * - Lesson has: beltLevel (string) AND moduleType (A/B/P/E)
 * - LessonProgress tracks: user, lesson, completed, beltLevel (optional)
 */

export const getBeltModuleCompletion = async ({ userId, beltLevel }) => {
  // 1) Get modules for this belt
  const modules = await Module.find({ beltLevel }).populate("lessons").lean();

  const result = {
    A: true,
    B: true,
    P: true,
  };

  for (const m of modules) {
    if (!["A", "B", "P"].includes(m.moduleType)) continue;

    const lessonIds = (m.lessons || []).map((l) => l._id);

    if (!lessonIds.length) continue;

    const completedCount = await LessonProgress.countDocuments({
      user: userId,
      lesson: { $in: lessonIds },
      completed: true,
    });

    if (completedCount !== lessonIds.length) {
      result[m.moduleType] = false;
    }
  }

  return result;
};
/**
 * Derives ordered gates for belt progression (A -> B -> P -> E).
 * Phase 1: This is informational only. Phase 2 will enforce it.
 */
export const getOrderedGatesForBelt = async ({ userId, beltLevel }) => {
  const mod = await getBeltModuleCompletion({ userId, beltLevel });

  const A_done = mod.completion.A;
  const B_done = A_done ? mod.completion.B : false;
  const P_done = A_done && B_done ? mod.completion.P : false;

  return {
    beltLevel,
    module: mod,
    gates: {
      A_open: true,
      B_open: A_done, // B opens after A complete
      P_open: A_done && B_done, // P opens after A & B complete
      E_open: A_done && B_done && P_done, // E opens after A,B,P complete
    },
  };
};
