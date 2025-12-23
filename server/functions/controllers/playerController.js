import asyncHandler from "express-async-handler";
import Player from "../models/Player.js";
import PlayerProfile from "../models/Profile.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import BeltHistory from "../models/BeltHistory.js";
import Notification from "../models/Notification.js";
import Program from "../models/Program.js";
import LessonProgress from "../models/LessonProgress.js";
import ExamAttempt from "../models/ExamAttempt.js";
import Lesson from "../models/Lesson.js";
import Certificate from "../models/Certificate.js";
import BeltRanking from "../models/BeltRanking.js";
import PDFDocument from "pdfkit";
import { assertObjectId, httpError } from "../utils/validation.js";
import { Types } from "mongoose";
import { getMyBeltProgress } from "../services/beltProgressService.js";

/* ============================================================
   LIST PLAYERS
============================================================= */
export const listPlayers = asyncHandler(async (req, res) => {
  const players = await Player.find({})
    .populate("user", "name email phone nationalId gender role")
    .lean();

  res.status(200).json({
    success: true,
    data: {
      players,
    },
  });
});
/* ============================================================
   GET PLAYER BY ID
============================================================= */
export const getPlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid player id");
  }

  const player = await Player.findById(id)
    .populate("user", "name email phone nationalId gender role")
    .lean();

  if (!player) {
    throw httpError(404, "Player not found");
  }

  res.status(200).json({
    success: true,
    data: {
      player,
    },
  });
});
/* ============================================================
   UPDATE PLAYER
============================================================= */
export const updatePlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid player id");
  }

  const player = await Player.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!player) {
    throw httpError(404, "Player not found");
  }

  res.json({
    success: true,
    data: { player },
  });
});

/* ============================================================
   DELETE PLAYER
============================================================= */
export const deletePlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const player = await Player.findById(id);
  if (!player) throw httpError(404, "Player not found");

  // Delete Player
  await Player.deleteOne({ _id: id });

  // Delete Profile
  await Profile.deleteOne({ user: player.user });

  // Delete User
  await User.findByIdAndDelete(player.user);

  res.json({
    success: true,
    data: { message: "Player, profile and user deleted successfully" },
  });
});

/* ============================================================
   ADD ATTENDANCE ENTRY
============================================================= */
export const addAttendance = asyncHandler(async (req, res) => {
  const { sessionId, date, coachId, status, notes } = req.body;
  const { id: playerId } = req.params;

  if (!Types.ObjectId.isValid(playerId)) {
    throw httpError(400, "Invalid player id");
  }

  const attendance = await Attendance.create({
    player: playerId,
    sessionId,
    sessionDate: date || new Date(),
    coach: coachId,
    status,
    notes,
  });

  // مفيش training.attendanceCount في Player schema حالياً، فمش هنزود حاجة هنا

  res.status(201).json({
    success: true,
    data: { attendance },
  });
});

/* ============================================================
   GET PLAYER ATTENDANCE LOG
============================================================= */
export const getAttendance = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const { id: playerId } = req.params;

  if (!Types.ObjectId.isValid(playerId)) {
    throw httpError(400, "Invalid player id");
  }

  const filter = { player: playerId };

  if (from || to) filter.sessionDate = {};
  if (from) filter.sessionDate.$gte = new Date(from);
  if (to) filter.sessionDate.$lte = new Date(to);

  const logs = await Attendance.find(filter).sort({ sessionDate: -1 });

  res.json({
    success: true,
    data: { attendance: logs },
  });
});

/* ============================================================
   GENERATE PLAYER REPORT PDF
============================================================= */
export const playerReportPdf = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid player id");
  }

  const player = await Player.findById(id)
    .populate("user", "name email")
    .lean();

  if (!player) throw httpError(404, "Player not found");

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");

  doc.fontSize(18).text(`Player Report`, { underline: true });
  doc.moveDown();
  doc.fontSize(14).text(`Player: ${player.user?.name || "N/A"}`);
  doc.text(`Email: ${player.user?.email || "N/A"}`);
  doc.text(`Belt: ${player.beltLabel || player.beltLevel}`);
  doc.moveDown();
  doc.text(
    `Stats: Power ${player.stats?.power || 0}, Flexibility ${
      player.stats?.flexibility || 0
    }, Endurance ${player.stats?.endurance || 0}, Speed ${
      player.stats?.speed || 0
    }`
  );

  doc.pipe(res);
  doc.end();
});

/* ============================================================
   PROMOTE PLAYER BELT
============================================================= */
export const promotePlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nextBelt } = req.body;

  if (!Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid player id");
  }

  const player = await Player.findByIdAndUpdate(
    id,
    { beltLevel: nextBelt },
    { new: true }
  );

  if (!player) throw httpError(404, "Player not found");

  res.json({
    success: true,
    data: { player },
  });
});

/* ============================================================
   ADD EXAM HISTORY TO PLAYER
============================================================= */
export const addExamToPlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid player id");
  }

  const player = await Player.findById(id);
  if (!player) throw httpError(404, "Player not found");

  player.exams.push(req.body);
  await player.save();

  res.json({
    success: true,
    data: { player },
  });
});

/* ============================================================
   MARK BELT UPGRADE AS PENDING
============================================================= */
export const markPendingUpgrade = asyncHandler(async (req, res) => {
  const { examId, attemptId } = req.body;
  const playerId = assertObjectId(req.params.id, "playerId");

  const player = await Player.findById(playerId);
  if (!player) throw httpError(404, "Player not found");

  const entry = await BeltHistory.create({
    player: playerId,
    user: player.user,
    fromBelt: player.beltLevel,
    toBelt: player.beltLevel,
    status: "pending",
    examId: examId ? assertObjectId(examId, "examId") : undefined,
    attemptId: attemptId ? assertObjectId(attemptId, "attemptId") : undefined,
    note: "Exam passed pending coach approval",
  });

  res.json({
    success: true,
    data: { pendingUpgrade: entry },
  });
});

/* ============================================================
   APPROVE BELT UPGRADE
============================================================= */
export const approveUpgrade = asyncHandler(async (req, res) => {
  const { toBelt, note } = req.body;

  const entryId = assertObjectId(req.params.historyId, "historyId");
  const coachId = req.user?._id
    ? assertObjectId(req.user._id, "coachId")
    : null;

  const history = await BeltHistory.findById(entryId);
  if (!history) throw httpError(404, "Upgrade request not found");

  const player = await Player.findById(history.player);
  if (!player) throw httpError(404, "Player not found");

  const newBelt = toBelt || player.beltLevel;

  player.beltLevel = newBelt;
  await player.save();

  history.status = "approved";
  history.toBelt = newBelt;
  history.approvedAt = new Date();
  if (coachId) history.approvedBy = coachId;
  if (note) history.note = note;
  await history.save();

  await Notification.create({
    user: player.user,
    title: "Belt Upgraded",
    message: `Your belt has been upgraded to ${newBelt}.`,
    type: "belt",
  });

  res.json({
    success: true,
    data: { history, player },
  });
});

/* ============================================================
   GET EXAM ELIGIBILITY FOR CURRENT STUDENT
============================================================= */
export const getEligibility = asyncHandler(async (req, res) => {
  const studentId = req.user._id; // User._id

  // 1️⃣ Get Player → belt level
  const player = await Player.findOne({ user: studentId });
  if (!player) throw httpError(404, "Player not found");

  const belt = player.beltLevel;

  const mapBeltToProgram = {
    white: "beginner",
    yellow: "beginner",
    blue: "intermediate",
    brown: "intermediate",
    red: "advanced",
    black: "advanced",
  };

  const programLevel = mapBeltToProgram[belt];

  // 2️⃣ Attendance Summary (player _id)
  const attendance = await Attendance.aggregate([
    { $match: { player: player._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        present: {
          $sum: {
            $cond: [{ $eq: ["$status", "present"] }, 1, 0],
          },
        },
      },
    },
  ]);

  const totalSessions = attendance[0]?.total || 0;
  const attended = attendance[0]?.present || 0;
  const attendanceRate = totalSessions
    ? Math.round((attended / totalSessions) * 100)
    : 0;

  const requiredAttendance =
    programLevel === "beginner"
      ? 50
      : programLevel === "intermediate"
      ? 60
      : 70;

  // 3️⃣ Lesson progress
  const program = await Program.findOne({ level: programLevel });
  const totalLessons = program
    ? await Lesson.countDocuments({ program: program._id })
    : 0;

  const completedLessons = await LessonProgress.countDocuments({
    user: studentId,
    completed: true,
  });

  const lessonsRemaining = totalLessons - completedLessons;

  // 4️⃣ Quiz pass rate
  const quizzes = await QuizResult.find({ student: studentId });
  const passed = quizzes.filter((q) => q.passed).length;
  const quizRate = quizzes.length
    ? Math.round((passed / quizzes.length) * 100)
    : 0;

  const quizNeeded = 70;

  // 5️⃣ Determine final eligibility
  const lockedReasons = [];

  if (attendanceRate < requiredAttendance)
    lockedReasons.push("Attendance below required percentage.");

  if (completedLessons < totalLessons)
    lockedReasons.push("Not all lessons are completed.");

  if (quizRate < quizNeeded) lockedReasons.push("Quiz pass rate is too low.");

  const eligibleForExam = lockedReasons.length === 0;

  res.json({
    success: true,
    data: {
      attendanceRate,
      requiredAttendance,

      completedLessons,
      totalLessons,
      lessonsRemaining,

      quizRate,
      quizNeeded,

      eligibleForExam,
      lockedReasons,
    },
  });
});
/* ============================================================
   GET FULL PLAYER DASHBOARD FOR CURRENT STUDENT
============================================================= */
export const getPlayerFull = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const player = await Player.findOne({ user: userId })
    .populate("user", "name email phone gender")
    .lean();

  if (!player) throw httpError(404, "Player not found");

  const [attendance, lessons, exams, certificates] = await Promise.all([
    Attendance.find({ player: player._id }).sort({ sessionDate: -1 }).lean(),
    LessonProgress.find({ user: userId }).populate("lesson").lean(),
    ExamAttempt.find({ student: userId }).lean(),
    Certificate.find({ student: userId }).lean(),
  ]);

  res.json({
    success: true,
    data: {
      player,
      stats: {
        xp: player.xp,
        level: player.level,
        streak: player.streakDays,
        lessonsCompleted: player.totalLessonsCompleted,
        examsPassed: player.totalExamsPassed,
      },
      attendance,
      lessons,
      exams,
      certificates,
      timeline: buildTimeline(attendance, lessons, exams, certificates),
    },
  });
});

const buildTimeline = (attendance, lessons, exams, certificates) => {
  const items = [];

  attendance.forEach((a) =>
    items.push({
      type: "attendance",
      date: a.sessionDate,
      title: "Training Attendance",
      detail: a.status,
    })
  );

  lessons.forEach((l) =>
    items.push({
      type: "lesson",
      date: l.completedAt,
      title: `Completed Lesson: ${l.lesson?.title || "Lesson"}`,
      detail: "Lesson Completed",
    })
  );

  exams.forEach((e) =>
    items.push({
      type: "exam",
      date: e.submittedAt,
      title: `Exam Attempt`,
      detail: `Theory Score: ${e.theoryScore ?? 0}`,
    })
  );

  certificates.forEach((c) =>
    items.push({
      type: "certificate",
      date: c.issuedAt,
      title: `Certificate Issued`,
      detail: c.title,
    })
  );

  return items.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const getStudentBeltProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const player = await Player.findOne({ user: userId });
  if (!player) throw httpError(404, "Player not found");

  const progress = await computeBeltProgress(player);

  res.json({
    success: true,
    data: progress,
  });
});

const beltNameByLevel = (beltLevel) => {
  const map = {
    white: "White Belt",
    yellow: "Yellow Belt",
    blue: "Blue Belt",
    brown: "Brown Belt",
    red: "Red Belt",
    black: "Black Belt",
  };
  return map[(beltLevel || "white").toLowerCase()] || "White Belt";
};

export const getMyBeltProgressTestLogicBeforeDeletion = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;
    if (!userId) throw httpError(401, "Unauthorized");

    // ✅ IMPORTANT: Attendance مربوط بـ Player._id (مش userId)
    const player = await Player.findOne({ user: userId })
      .populate("user", "name")
      .lean();
    if (!player) throw httpError(404, "Player profile not found");

    const beltLevel = (player.beltLevel || "white").toLowerCase();
    const beltName = beltNameByLevel(beltLevel);

    // 1) Load belt ranking rules
    let ranking =
      (await BeltRanking.findOne({ name: beltName }).lean()) ||
      (await BeltRanking.findOne({ order: 0 }).sort({ order: 1 }).lean()); // fallback

    if (!ranking) {
      // لو لسه مفيش ranks في الداتابيز
      ranking = {
        name: beltName,
        level: "Beginner",
        attendance: { requiredSessions: 0, requiredHours: 0, minRate: 0 },
        lessons: { totalLessons: 0, unlockEvery: 5 },
        requirements: [],
      };
    }

    const requiredSessions = ranking?.attendance?.requiredSessions ?? 0;
    const minRate = ranking?.attendance?.minRate ?? 0;
    const totalLessonsRule = ranking?.lessons?.totalLessons ?? 0;
    const unlockEvery = ranking?.lessons?.unlockEvery ?? 5;

    // 2) Attendance counts (present vs total)
    const [totalSessions, attendedSessions, lastAttendance] = await Promise.all(
      [
        Attendance.countDocuments({ player: player._id }),
        Attendance.countDocuments({ player: player._id, status: "present" }),
        Attendance.findOne({ player: player._id })
          .sort({ sessionDate: -1 })
          .lean(),
      ]
    );

    // ✅ Progress rate vs required sessions (مش vs total)
    const progressRate =
      requiredSessions > 0
        ? Math.round((attendedSessions / requiredSessions) * 100)
        : 0;

    const attendanceEligible =
      requiredSessions === 0 ? true : progressRate >= minRate;

    // 3) Lessons progress (MVP)
    // هنجيب عدد الدروس المتاحة (active) ونحدد unlocked طبقًا لقواعد الحزام
    const unlockedLessons =
      unlockEvery > 0
        ? Math.min(
            totalLessonsRule,
            Math.floor(attendedSessions / unlockEvery) * 3
          )
        : totalLessonsRule;

    // لو totalLessonsRule = 0، نقدر نfallback بعدّ الدروس الفعلية من DB
    const totalLessonsFromDb = totalLessonsRule
      ? totalLessonsRule
      : await Lesson.countDocuments({ isActive: true });

    // completed lessons (كل اللي الطالب خلصه)
    const completedLessons = await LessonProgress.countDocuments({
      user: userId,
      completed: true,
    });

    // ✅ شرط الدروس: 70% من إجمالي دروس الحزام
    const lessonsRequiredToUnlockExam =
      totalLessonsFromDb > 0 ? Math.ceil(totalLessonsFromDb * 0.7) : 0;

    const lessonsEligible =
      lessonsRequiredToUnlockExam === 0
        ? true
        : completedLessons >= lessonsRequiredToUnlockExam;

    // 4) Exam unlock decision (attendance + lessons)
    const examUnlocked = attendanceEligible && lessonsEligible;

    let examReason = null;
    if (!attendanceEligible) {
      examReason = `Attendance locked: ${progressRate}% (min ${minRate}%)`;
    } else if (!lessonsEligible) {
      examReason = `Lessons locked: ${completedLessons}/${lessonsRequiredToUnlockExam} required`;
    }

    return res.json({
      success: true,
      data: {
        player: {
          playerId: player._id,
          name: player.user?.name,
          beltLevel,
        },
        belt: {
          name: ranking.name,
          level: ranking.level,
          order: ranking.order ?? 0,
          requirements: ranking.requirements || [],
        },
        attendance: {
          totalSessions,
          attendedSessions,
          requiredSessions,
          minRate,
          attendanceRate: progressRate, // progress vs requirement
          eligible: attendanceEligible,
          lastSessionDate: lastAttendance?.sessionDate || null,
        },
        lessons: {
          completed: completedLessons,
          total: totalLessonsFromDb,
          unlocked: unlockedLessons,
          unlockEvery,
          requiredToUnlockExam: lessonsRequiredToUnlockExam,
          eligible: lessonsEligible,
        },
        exam: {
          unlocked: examUnlocked,
          reason: examReason,
        },
      },
    });
  }
);

export const myBeltProgress = asyncHandler(async (req, res) => {
  const data = await getMyBeltProgress(req.user._id);
  res.json({ success: true, data });
});
