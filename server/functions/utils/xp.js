// utils/xp.js
import Player from "../models/Player.js";

// نقاط لكل حدث
export const XP_RULES = {
  ATTENDANCE: 5,
  LESSON_COMPLETE: 10,
  QUIZ_PASS: 15,
  EXAM_PASS: 50,
  STREAK_DAILY_BONUS: 5,
};

// مستويات بناء على الـ XP
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000];

export const calculateLevelFromXp = (xp = 0) => {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
};

const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const isYesterday = (d1, d2) => {
  const diff =
    (new Date(d1.toDateString()) - new Date(d2.toDateString())) /
    (1000 * 60 * 60 * 24);
  return diff === 1;
};

// 🔥 الدالة الرئيسية: تستدعى من attendance/lesson/exam
export const awardXpForEvent = async (playerId, eventType) => {
  const player = await Player.findById(playerId);
  if (!player) return null;

  const baseXp = XP_RULES[eventType] || 0;
  let extraStreakXp = 0;

  const now = new Date();
  const last = player.lastActiveDate;

  // تحديث الـ streak
  if (!last) {
    player.streakDays = 1;
  } else if (isSameDay(now, last)) {
    // نفس اليوم → لا نكرر زيادة streak
  } else if (isYesterday(now, last)) {
    player.streakDays += 1;
  } else {
    // انقطاع
    player.streakDays = 1;
  }

  // bonus بسيط مع كل streak active
  if (player.streakDays > 1) {
    extraStreakXp = XP_RULES.STREAK_DAILY_BONUS;
  }

  player.xp = (player.xp || 0) + baseXp + extraStreakXp;
  player.level = calculateLevelFromXp(player.xp);
  player.lastActiveDate = now;

  await player.save();
  return player;
};
