// server/functions/controllers/examController.js
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import {
  assertObjectId,
  toObjectId,
  httpError,
  asNumber,
} from "../utils/validation.js";

import Notification from "../models/Notification.js";
import Exam from "../models/Exam.js";
import ExamAttempt from "../models/ExamAttempt.js";
import FinalExamResult from "../models/FinalExamResult.js";
import PracticalEvaluation from "../models/PracticalEvaluation.js";
import ExamRegistration from "../models/ExamRegistration.js";
import Certificate from "../models/Certificate.js";
import Player from "../models/Player.js";
import { awardXpForEvent } from "../utils/xp.js";
import { attachExamEligibility } from "../services/eligibilityService.js";
import BeltHistory from "../models/BeltHistory.js";
import { getNextBelt, normalizeBelt } from "../utils/belt.js";

// =============================
//  CONSTANTS & HELPERS
// =============================
const { ObjectId } = mongoose.Types;
const PRACTICAL_COMPONENT_MAX = 100;
const PRACTICAL_COMPONENTS = [
  "morality",
  "practicalMethod",
  "technique",
  "physical",
  "mental",
];

const normalizeQuestions = (questions = []) =>
  questions.map((q) => ({
    ...q,
    maxScore: typeof q.maxScore === "number" ? q.maxScore : 1,
    _id: toObjectId(q._id) ?? new ObjectId(),
  }));

const computeMaxTheoryScore = (questions, explicitMax) => {
  const derived = normalizeQuestions(questions).reduce(
    (sum, q) => sum + asNumber(q.maxScore, 1),
    0
  );
  return typeof explicitMax === "number" ? explicitMax : derived;
};

const computeTheoryPassMark = (exam) => {
  if (typeof exam.passMark === "number") return exam.passMark;
  const maxTheory = asNumber(exam.maxTheoryScore, 0);
  return Math.round(maxTheory * 0.6);
};

const computeFinalPassMark = (exam) => {
  if (typeof exam.passMarkFinal === "number") return exam.passMarkFinal;
  const theoryMax = asNumber(exam.maxTheoryScore, 0);
  const practicalMax = PRACTICAL_COMPONENTS.length * PRACTICAL_COMPONENT_MAX;
  return Math.round((theoryMax + practicalMax) * 0.6);
};

const mapPracticalScores = (body = {}) => {
  const s = body.scores || {};
  return {
    morality: asNumber(s.morality),
    practicalMethod: asNumber(s.practicalMethod),
    technique: asNumber(s.technique),
    physical: asNumber(s.physical),
    mental: asNumber(s.mental),
  };
};

// =====================================================
//   STUDENT - MY ATTEMPTS (WITH THEORY + FINAL)
// =====================================================
export const getMyAttempts = asyncHandler(async (req, res) => {
  const userId = assertObjectId(req.user._id, "userId");

  const attempts = await ExamAttempt.find({ student: userId })
    .sort({ submittedAt: -1, createdAt: -1 })
    .populate({
      path: "exam",
      select: "title beltLevel timeLimit maxTheoryScore passMark",
    })
    .lean();

  if (!attempts.length) {
    return res.json({ success: true, data: { attempts: [] } });
  }

  const examIds = attempts.map((a) => a.exam?._id).filter(Boolean);

  const finalResults = await FinalExamResult.find({
    exam: { $in: examIds },
    student: userId,
  })
    .sort({ finalizedAt: -1, date: -1, _id: -1 })
    .lean();

  const finalResultsMap = new Map(
    finalResults.map((fr) => [String(fr.exam), fr])
  );

  const certificates = await Certificate.find({
    user: userId,
    examId: { $in: examIds },
  })
    .sort({ issuedAt: -1, createdAt: -1, _id: -1 })
    .lean();

  const certificateMap = new Map(
    certificates.map((c) => [String(c.examId), c])
  );

  const enriched = attempts.map((attempt) => {
    const eid = String(attempt.exam?._id);
    const final = finalResultsMap.get(eid) || null;
    const cert = certificateMap.get(eid) || null;

    const theoryScore = attempt.theoryScore ?? attempt.autoScore ?? null;
    const theoryPassed =
      typeof attempt.pass === "boolean" ? attempt.pass : null;

    const theoryPassMark =
      attempt.exam?.passMark ?? computeTheoryPassMark(attempt.exam || {});

    return {
      _id: attempt._id,
      exam: attempt.exam,

      // ✅ THEORY
      autoScore: attempt.autoScore,
      manualScore: attempt.manualScore,
      theoryScore,
      theoryPassed,
      theoryPassMark,
      maxTheoryScore: attempt.exam?.maxTheoryScore ?? null,

      submittedAt: attempt.submittedAt,
      answers: attempt.answers,

      // ✅ FINAL (may be null until admin finalizes)
      finalPracticalScores: final?.practicalScores || null,
      finalMethodTotal: final?.methodTotal ?? null,
      finalTotalScore: final?.totalScore ?? null,
      finalPassed: final?.passed ?? null,
      finalizedAt: final?.finalizedAt ?? final?.date ?? null,

      certificate: cert
        ? {
            _id: cert._id,
            issuedAt: cert.issuedAt || cert.createdAt,
            beltLevel: attempt.exam?.beltLevel,
          }
        : null,
    };
  });

  res.json({
    success: true,
    data: { attempts: enriched },
  });
});

// =====================================================
//   REGISTRATION STATUS (STUDENT) — FIXED
// =====================================================
export const getRegistrationStatus = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.params.examId, "examId");
  const userId = assertObjectId(req.user?._id, "userId");

  const player = await Player.findOne({ user: userId }).select("_id").lean();

  const [registration, finalResult] = await Promise.all([
    player?._id
      ? ExamRegistration.findOne({ exam: examId, player: player._id }).lean()
      : null,
    FinalExamResult.findOne({ exam: examId, student: userId }).lean(),
  ]);

  res.json({
    success: true,
    data: {
      status: registration?.status || "none",
      finalized: Boolean(finalResult),
    },
  });
});

// =====================================================
//   CREATE EXAM (ADMIN)
// =====================================================
export const createExam = asyncHandler(async (req, res) => {
  const {
    title,
    beltLevel,
    schedule,
    timeLimit,
    passMark,
    maxTheoryScore,
    questions = [],
  } = req.body;

  if (!title || !beltLevel) {
    throw httpError(400, "title and beltLevel are required");
  }

  const creatorId = assertObjectId(req.user?._id, "createdBy");

  const questionsWithMeta = normalizeQuestions(questions);
  const computedMaxTheory = computeMaxTheoryScore(
    questionsWithMeta,
    maxTheoryScore
  );

  const finalPassMark =
    typeof passMark === "number"
      ? passMark
      : Math.round(computedMaxTheory * 0.6);

  const exam = await Exam.create({
    title,
    beltLevel,
    schedule,
    timeLimit: timeLimit || 20,
    passMark: finalPassMark,
    maxTheoryScore: computedMaxTheory,
    questions: questionsWithMeta,
    createdBy: creatorId,
    status: "draft",
  });

  res.status(201).json({
    success: true,
    data: { exam },
  });
});

// =====================================================
//   LIST EXAMS — student includes eligibility
// =====================================================
export const listExams = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user?.role === "student") {
    filter.status = "published";

    const userId = assertObjectId(req.user._id, "userId");
    const exams = await Exam.find(filter).sort({ createdAt: -1 }).lean();

    const enriched = await attachExamEligibility(exams, userId);

    return res.json({
      success: true,
      data: { exams: enriched },
    });
  }

  const exams = await Exam.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: { exams } });
});

// =====================================================
//   GET SINGLE EXAM
// =====================================================
export const getExam = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.params.id, "id");

  const filter = { _id: examId };
  if (req.user?.role === "student") {
    filter.status = "published";
  }

  const exam = await Exam.findOne(filter).lean();
  if (!exam) throw httpError(404, "Exam not found");

  res.json({ success: true, data: { exam } });
});

// =====================================================
//   UPDATE EXAM
// =====================================================
export const updateExam = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.params.id, "id");

  const payload = {
    ...req.body,
    updatedAt: new Date(),
  };

  const result = await Exam.updateOne({ _id: examId }, { $set: payload });

  if (!result.matchedCount) throw httpError(404, "Exam not found");

  res.json({ success: true, data: { message: "Exam updated" } });
});

// =====================================================
//   PUBLISH EXAM
// =====================================================
export const publishExam = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.params.examId, "examId");

  const result = await Exam.updateOne(
    { _id: examId },
    { $set: { status: "published", updatedAt: new Date() } }
  );

  if (!result.matchedCount) throw httpError(404, "Exam not found");

  res.json({ success: true, data: { message: "Exam published" } });
});

// =====================================================
//   GET EXAMS BY BELT (STUDENT)
// =====================================================
export const getExamsByBeltLevel = asyncHandler(async (req, res) => {
  const beltLevel = req.params.beltLevel;
  const userId = assertObjectId(req.user?._id, "userId");

  const exams = await Exam.find({
    beltLevel,
    status: "published",
  })
    .sort({ createdAt: -1 })
    .lean();

  const enriched = await attachExamEligibility(exams, userId);

  res.json({
    success: true,
    data: { exams: enriched },
  });
});

// =====================================================
//   REGISTER FOR EXAM (STUDENT) — FIXED (Player._id)
// =====================================================
export const ExamRegisteration = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.body.examId, "examId");

  const userId = assertObjectId(req.user?._id || req.body.userId, "userId");

  const player = await Player.findOne({ user: userId });
  if (!player) throw httpError(404, "Player not found for this user");

  const exam = await Exam.findOne({ _id: examId, status: "published" });
  if (!exam) throw httpError(404, "Exam not found or not published");

  const finalResult = await FinalExamResult.findOne({
    exam: examId,
    student: userId,
  });
  if (finalResult)
    throw httpError(409, "Exam already finalized for this student");

  let existing = await ExamRegistration.findOne({
    exam: examId,
    player: player._id,
  });

  if (existing) {
    existing.updatedAt = new Date();
    await existing.save();

    return res.json({
      success: true,
      data: {
        registrationId: existing._id,
        status: existing.status,
        alreadyRegistered: true,
      },
    });
  }

  const registration = await ExamRegistration.create({
    exam: examId,
    player: player._id,
    status: "pending",
    createdAt: new Date(),
  });

  res.status(201).json({
    success: true,
    data: {
      registrationId: registration._id,
      status: registration.status,
      alreadyRegistered: false,
    },
  });
});

// =====================================================
//   LIST SUBMISSIONS (ADMIN) — includes THEORY PASS/FAIL
// =====================================================
export const listSubmissions = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.params.examId, "examId");

  const attempts = await ExamAttempt.find({
    exam: examId,
    submittedAt: { $ne: null },
  })
    .populate({
      path: "student",
      select: "name email beltLevel",
    })
    .populate({
      path: "exam",
      select: "title beltLevel passMark maxTheoryScore",
    })
    .sort({ submittedAt: -1 })
    .lean();

  if (!attempts.length) {
    return res.json({ success: true, data: { submissions: [] } });
  }

  const studentIds = attempts.map((a) => a.student?._id);
  const examIds = attempts.map((a) => a.exam?._id);

  const finals = await FinalExamResult.find({
    exam: { $in: examIds },
    student: { $in: studentIds },
  })
    .sort({ finalizedAt: -1, date: -1, _id: -1 })
    .lean();

  const finalMap = new Map(finals.map((r) => [`${r.exam}_${r.student}`, r]));

  const practicals = await PracticalEvaluation.find({
    exam: { $in: examIds },
    student: { $in: studentIds },
  })
    .sort({ createdAt: -1 })
    .lean();

  const practicalMap = new Map(
    practicals.map((p) => [`${p.exam}_${p.student}`, p])
  );

  const submissions = attempts.map((att) => {
    const key = `${att.exam._id}_${att.student._id}`;
    const final = finalMap.get(key) || null;
    const practical = practicalMap.get(key) || null;

    const theoryScore = att.theoryScore ?? att.autoScore ?? 0;
    const theoryPassed = Boolean(att.pass);
    const theoryPassMark =
      att.exam?.passMark ?? computeTheoryPassMark(att.exam || {});

    return {
      _id: att._id,
      exam: att.exam
        ? {
            _id: att.exam._id,
            title: att.exam.title,
            beltLevel: att.exam.beltLevel,
            passMark: theoryPassMark,
            maxTheoryScore: att.exam.maxTheoryScore ?? null,
          }
        : null,
      student: att.student
        ? {
            _id: att.student._id,
            name: att.student.name,
            email: att.student.email,
            belt: att.student.beltLevel,
          }
        : null,

      // ✅ THEORY visible to admin
      theoryScore,
      theoryPassed,
      submittedAt: att.submittedAt,

      practicalRecorded: Boolean(practical),
      finalPassed: final?.passed ?? null,
      finalTotalScore: final?.totalScore ?? null,
      finalPracticalScores: final?.practicalScores ?? null,
      finalizedAt: final?.finalizedAt ?? null,
    };
  });

  res.json({
    success: true,
    data: { submissions },
  });
});

// =====================================================
//   LIST REGISTRATIONS FOR EXAM (ADMIN)
// =====================================================
export const listRegistrations = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.params.examId, "examId");

  const registrations = await ExamRegistration.find({ exam: examId })
    .populate({
      path: "player",
      populate: {
        path: "user",
        model: "User",
        select: "name email beltLevel",
      },
    })
    .populate({
      path: "exam",
      model: "Exam",
      select: "title beltLevel schedule",
    })
    .lean();

  const resultsMap = {};
  const finalResults = await FinalExamResult.find({ exam: examId }).lean();
  finalResults.forEach((r) => {
    resultsMap[r.student.toString()] = r;
  });

  const formatted = registrations.map((reg) => {
    const user = reg.player?.user;
    const fr = resultsMap[user?._id?.toString()] || null;

    return {
      _id: reg._id,
      exam: reg.exam,
      player: reg.player?._id,
      student: user
        ? {
            _id: user._id,
            name: user.name,
            email: user.email,
            belt: reg.player?.beltLevel,
          }
        : null,
      status: reg.status,
      createdAt: reg.createdAt,
      updatedAt: reg.updatedAt,
      finalPassed: fr?.passed ?? null,
      finalTotalScore: fr?.totalScore ?? null,
      finalizedAt: fr?.finalizedAt ?? null,
    };
  });

  res.json({ success: true, data: { registrations: formatted } });
});

// =====================================================
//   APPROVE / REJECT REGISTRATION
// =====================================================
export const approveRegistration = asyncHandler(async (req, res) => {
  const id = assertObjectId(req.params.id, "registrationId");

  const reg = await ExamRegistration.findOneAndUpdate(
    { _id: id, status: "pending" },
    {
      $set: {
        status: "approved",
        approvedAt: new Date(),
        updatedAt: new Date(),
        approvedBy: req.user?._id,
      },
    },
    { new: true }
  );

  if (!reg) throw httpError(404, "Registration not found or already processed");

  res.json({ success: true, data: { message: "Registration approved" } });
});

export const rejectRegistration = asyncHandler(async (req, res) => {
  const id = assertObjectId(req.params.id, "registrationId");

  const reg = await ExamRegistration.findOneAndUpdate(
    { _id: id, status: "pending" },
    {
      $set: {
        status: "rejected",
        rejectedAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!reg) throw httpError(404, "Registration not found or already processed");

  res.json({ success: true, data: { message: "Registration rejected" } });
});

// =====================================================
//   START ATTEMPT (STUDENT) — requires approved registration
// =====================================================
export const startAttempt = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.body.examId, "examId");
  const userId = assertObjectId(req.user._id, "userId");

  const player = await Player.findOne({ user: userId });
  if (!player) throw httpError(404, "Player not found for this user");

  const exam = await Exam.findOne({ _id: examId, status: "published" }).lean();
  if (!exam) throw httpError(403, "Exam is not available to start");

  const registration = await ExamRegistration.findOne({
    exam: examId,
    player: player._id,
    status: "approved",
  });

  if (!registration) {
    throw httpError(403, "You are not approved to start this exam", {
      reason: "REGISTRATION_REQUIRED",
    });
  }

  const existingFinal = await FinalExamResult.findOne({
    exam: examId,
    student: userId,
  });
  if (existingFinal) throw httpError(409, "Exam already finalized");

  const alreadySubmitted = await ExamAttempt.findOne({
    exam: examId,
    student: userId,
    submittedAt: { $ne: null },
  });
  if (alreadySubmitted) throw httpError(400, "Attempt already submitted");

  let attempt = await ExamAttempt.findOne({
    exam: examId,
    student: userId,
    submittedAt: null,
  });

  if (!attempt) {
    attempt = await ExamAttempt.create({
      exam: examId,
      student: userId,
      player: player._id,
      startedAt: new Date(),
      autoScore: 0,
      manualScore: 0,
      theoryScore: 0,
      pass: false,
      answers: [],
    });
  }

  res.json({
    success: true,
    data: {
      attemptId: attempt._id,
      exam: {
        _id: exam._id,
        title: exam.title,
        beltLevel: exam.beltLevel,
        timeLimit: exam.timeLimit,
        maxTheoryScore: exam.maxTheoryScore,
        passMark: exam.passMark ?? computeTheoryPassMark(exam),
      },
      questions: exam.questions || [],
    },
  });
});

// =====================================================
//   SUBMIT ATTEMPT (THEORY)
// =====================================================
export const submitAttempt = asyncHandler(async (req, res) => {
  const attemptId = assertObjectId(req.body.attemptId, "attemptId");
  const userId = assertObjectId(req.user._id, "userId");

  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  const { focusLosses, forcedSubmitReason } = req.body;

  if (!answers.length) throw httpError(400, "answers are required");

  const attempt = await ExamAttempt.findById(attemptId);
  if (!attempt) throw httpError(404, "Attempt not found");

  if (String(attempt.student) !== String(userId))
    throw httpError(403, "Not your attempt");
  if (attempt.submittedAt) throw httpError(400, "Attempt already submitted");

  const existingFinal = await FinalExamResult.findOne({
    exam: attempt.exam,
    student: userId,
  });
  if (existingFinal) throw httpError(409, "Exam already finalized");

  const exam = await Exam.findById(attempt.exam).lean();
  if (!exam) throw httpError(404, "Exam not found");

  let autoScore = 0;

  answers.forEach((ans) => {
    const q = exam.questions.find(
      (qq) => qq._id.toString() === String(ans.questionId)
    );
    if (!q) return;

    if (q.type === "mcq") {
      if (ans.selectedIndex === q.correctIndex) {
        autoScore += q.maxScore ?? 1;
      }
    }

    if (q.type === "truefalse") {
      if (ans.booleanAnswer === q.correctBoolean) {
        autoScore += q.maxScore ?? 1;
      }
    }
  });

  const theoryScore = autoScore;
  const pass = theoryScore >= computeTheoryPassMark(exam);

  attempt.answers = answers;
  attempt.autoScore = theoryScore;
  attempt.theoryScore = theoryScore;
  attempt.pass = pass;
  attempt.submittedAt = new Date();
  attempt.antiCheat = { focusLosses, forcedSubmitReason };

  await attempt.save();

  res.json({
    success: true,
    data: {
      attemptId,
      theoryScore,
      theoryPassed: pass,
      passMark: computeTheoryPassMark(exam),
      message: pass
        ? "Theory submitted. Awaiting practical evaluation."
        : "Theory submitted. You did not pass the theory stage.",
    },
  });
});

// =====================================================
//   PRACTICAL SCORING (ADMIN) — Option 3: require theory pass
// =====================================================
export const gradeManual2 = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.body.examId, "examId");
  const studentId = assertObjectId(req.body.studentId, "studentId");

  const existingFinal = await FinalExamResult.findOne({
    exam: examId,
    student: studentId,
  });
  if (existingFinal) throw httpError(409, "Result already finalized");

  const attempt = await ExamAttempt.findOne({
    exam: examId,
    student: studentId,
    submittedAt: { $ne: null },
  });
  if (!attempt) throw httpError(404, "Submitted theory attempt not found");

  // ✅ Option 3 gate
  if (!attempt.pass) {
    throw httpError(400, "Cannot grade practical: student did not pass theory");
  }

  const existingEval = await PracticalEvaluation.findOne({
    exam: examId,
    student: studentId,
  });
  if (existingEval) throw httpError(409, "Practical evaluation already exists");

  /* =========================
     MAP PRACTICAL SCORES
  ========================= */

  const practicalScores = mapPracticalScores(req.body);

  const evaluation = await PracticalEvaluation.create({
    exam: examId,
    student: studentId,
    evaluator: req.user?._id || undefined,
    ...practicalScores,
    createdAt: new Date(),
  });

  res.status(201).json({
    success: true,
    data: {
      message: "Practical scores saved",
      evaluation,
    },
  });
});

// =====================================================
//   COMBINE SCORES (FINAL RESULT) — Option 3: require theory pass
// =====================================================
export const combineScores = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.body.examId, "examId");
  const studentId = assertObjectId(req.body.studentId, "studentId");

  const existingFinal = await FinalExamResult.findOne({
    exam: examId,
    student: studentId,
  });
  if (existingFinal) throw httpError(409, "Result already finalized");

  const attempt = await ExamAttempt.findOne({
    exam: examId,
    student: studentId,
    submittedAt: { $ne: null },
  });
  if (!attempt) throw httpError(404, "Theory attempt not found");

  // ✅ Gate: theory must be passed
  if (!attempt.pass) {
    throw httpError(400, "Cannot finalize: student did not pass theory");
  }

  const practical = await PracticalEvaluation.findOne({
    exam: examId,
    student: studentId,
  });
  if (!practical) throw httpError(404, "Practical evaluation not found");

  const exam = await Exam.findById(examId).lean();
  if (!exam) throw httpError(404, "Exam not found");

  const theoryScore = asNumber(attempt.theoryScore, 0);
  const theoryPass = theoryScore >= computeTheoryPassMark(exam);

  const practicalScores = mapPracticalScores(practical);
  const methodTotal = theoryScore + practicalScores.practicalMethod;

  const totalScore =
    practicalScores.morality +
    methodTotal +
    practicalScores.technique +
    practicalScores.physical +
    practicalScores.mental;

  const passed = theoryPass && totalScore >= computeFinalPassMark(exam);
  const now = new Date();

  const finalResult = await FinalExamResult.create({
    exam: examId,
    student: studentId,
    theoryScore,
    practicalScores,
    methodTotal,
    totalScore,
    passed,
    date: now,
    finalizedAt: now,
  });

  let beltUpgradeRequest = null;
  let player = null;

  if (certificate && beltUpgradeRequest) {
    await Certificate.findByIdAndUpdate(certificate._id, {
      beltHistory: beltUpgradeRequest._id,
    });
  }
  if (passed) {
    player = await Player.findOne({ user: studentId });
    if (player) {
      player.totalExamsPassed = (player.totalExamsPassed || 0) + 1;
      await player.save();
      await awardXpForEvent(player._id, "EXAM_PASS");

      // =========================
      // BELT UPGRADE (PENDING)
      // =========================
      try {
        const playerBelt = normalizeBelt(player.beltLevel || exam?.beltLevel);
        const examBelt = normalizeBelt(exam?.beltLevel);

        if (playerBelt && examBelt && playerBelt === examBelt) {
          const nextBelt = getNextBelt(playerBelt);

          if (nextBelt) {
            const existingUpgrade = await BeltHistory.findOne({
              player: player._id,
              examId,
              status: { $in: ["pending", "approved"] },
            }).lean();

            if (!existingUpgrade) {
              beltUpgradeRequest = await BeltHistory.create({
                player: player._id,
                user: player.user,
                fromBelt: playerBelt,
                toBelt: nextBelt,
                status: "pending",
                examId,
                attemptId: attempt._id,
                note: `Auto-created after PASS in ${exam.title}`,
              });

              await Notification.create({
                user: player.user,
                title: "Belt Upgrade Pending",
                message: `You passed your exam. Your upgrade to ${nextBelt} is pending coach approval.`,
                type: "belt",
              });
            } else {
              beltUpgradeRequest = existingUpgrade;
            }
          }
        }
      } catch (err) {
        // ❗ Never block exam finalization
        console.error("Failed to create pending belt upgrade", err);
      }
    }
  }

  // =========================
  // CERTIFICATE (IDEMPOTENT)
  // =========================
  let certificate = null;

  if (passed && player) {
    const existingCert = await Certificate.findOne({
      player: player._id,
      exam: examId,
    }).lean();

    if (!existingCert) {
      certificate = await Certificate.create({
        player: player._id,
        user: player.user,
        exam: examId,
        finalResult: finalResult._id,
        beltLevel: exam.beltLevel || player.beltLevel,
        beltHistory: beltUpgradeRequest?._id,
      });

      await Notification.create({
        user: player.user,
        title: "Certificate Issued",
        message: `Your certificate for ${exam.title} has been issued.`,
        type: "certificate",
      });
    } else {
      certificate = existingCert;
    }
  }

  // =========================
  // FINAL RESULT NOTIFICATION
  // =========================
  try {
    await Notification.create({
      user: studentId,
      title: passed ? "Exam Passed" : "Exam Result",
      message: passed
        ? "Congratulations! You passed your exam."
        : "Your final exam result is ready.",
      type: "result",
    });
  } catch (err) {
    console.error("Failed to send notifications", err);
  }

  res.json({
    success: true,
    data: {
      finalResult,
      certificate,
      beltUpgradeRequest,
    },
  });
});

// =====================================================
//   gradeManual
// =====================================================
export const gradeManual = asyncHandler(async (req, res) => {
  const attemptId = assertObjectId(req.params.id, "attemptId");
  const score = asNumber(req.body.score, null);

  const attempt = await ExamAttempt.findById(attemptId);
  if (!attempt) throw httpError(404, "Attempt not found");

  attempt.manualScore = score;
  await attempt.save();

  res.json({
    success: true,
    data: attempt,
  });
});
