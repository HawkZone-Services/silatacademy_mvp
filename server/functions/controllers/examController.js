import asyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";

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
import User from "../models/User.js";
import Player from "../models/Player.js";

import { awardXpForEvent } from "../utils/xp.js";
import {
  attachExamEligibility,
  buildExamEligibility,
} from "../services/eligibilityService.js";

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
  const scores = body.scores || body;
  return {
    morality: asNumber(scores.discipline ?? scores.morality),
    practicalMethod: asNumber(scores.performance ?? scores.practicalMethod),
    technique: asNumber(scores.technique),
    physical: asNumber(scores.physical ?? 0),
    mental: asNumber(scores.mental ?? 0),
  };
};

const findCompletedExamIdsForStudent = async (studentId) => {
  const [finalized, submittedAttempts] = await Promise.all([
    FinalExamResult.find({ student: studentId }).select("exam"),
    ExamAttempt.find({
      student: studentId,
      submittedAt: { $ne: null },
    }).select("exam"),
  ]);

  const ids = [...finalized, ...submittedAttempts]
    .map((item) => toObjectId(item.exam))
    .filter(Boolean);

  return Array.from(new Set(ids.map((id) => id.toString()))).map(
    (id) => new ObjectId(id)
  );
};
/* =====================================================
   STUDENT - MY ATTEMPTS (WITH FINAL RESULT)
===================================================== */
export const getMyAttempts = asyncHandler(async (req, res) => {
  const studentId = assertObjectId(req.user._id, "studentId");

  // 1) هات كل الـ attempts
  const attempts = await ExamAttempt.find({ student: studentId })
    .sort({ submittedAt: -1 })
    .populate({
      path: "exam",
      select: "title beltLevel timeLimit maxTheoryScore",
    })
    .lean();

  if (!attempts.length) {
    return res.json({ success: true, data: { attempts: [] } });
  }

  const examIds = attempts.map((a) => a.exam?._id).filter(Boolean);

  // 2) هات كل finalResults لهذا الطالب
  const finalResults = await FinalExamResult.find({
    exam: { $in: examIds },
    student: studentId,
  })
    .sort({ finalizedAt: -1, date: -1, _id: -1 })
    .lean();

  const finalResultsMap = new Map(
    finalResults.map((fr) => [String(fr.exam), fr])
  );

  // 3) هات كل certificates
  const certificates = await Certificate.find({
    user: studentId,
    examId: { $in: examIds },
  })
    .sort({ issuedAt: -1, createdAt: -1, _id: -1 })
    .lean();

  const certificateMap = new Map(
    certificates.map((c) => [String(c.examId), c])
  );

  // 4) Combine everything per attempt
  const enriched = attempts.map((attempt) => {
    const eid = String(attempt.exam?._id);
    const final = finalResultsMap.get(eid) || null;
    const cert = certificateMap.get(eid) || null;

    return {
      _id: attempt._id,
      exam: attempt.exam,
      autoScore: attempt.autoScore,
      manualScore: attempt.manualScore,
      theoryScore: attempt.theoryScore,
      pass: attempt.pass,
      submittedAt: attempt.submittedAt,
      answers: attempt.answers,

      // Final
      finalPracticalScores: final?.practicalScores || null,
      finalMethodTotal: final?.methodTotal ?? null,
      finalTotalScore: final?.totalScore ?? null,
      finalPassed: final?.passed ?? null,
      finalizedAt: final?.finalizedAt ?? final?.date ?? null,

      // Certificate
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
})

/* =====================================================
   REGISTRATION STATUS (STUDENT)
   uses ExamRegistration + FinalExamResult models only
===================================================== */
export const getRegistrationStatus = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.params.examId, "examId");
  const studentId = assertObjectId(req.user?._id, "studentId");

  // 🔸 ملاحظة: هنا player = userId (نفس اللي كنت بتعمله في النسخة القديمة)
  const [registration, finalResult] = await Promise.all([
    ExamRegistration.findOne({ exam: examId, player: studentId }).lean(),
    FinalExamResult.findOne({ exam: examId, student: studentId }).lean(),
  ]);

  res.json({
    success: true,
    data: {
      status: registration?.status || "none",
      finalized: Boolean(finalResult),
    },
  });
});

/* =====================================================
   CREATE EXAM (ADMIN) — pure Mongoose
===================================================== */
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

  const creatorId = assertObjectId(
    req.user?._id || req.body.createdBy,
    "createdBy"
  );

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

/* =====================================================
   LIST EXAMS — with eligibility
===================================================== */
export const listExams = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user?.role === "student") {
    const studentId = assertObjectId(req.user._id, "studentId");
    const excludedIds = await findCompletedExamIdsForStudent(studentId);

    filter = {
      status: "published",
      ...(excludedIds.length ? { _id: { $nin: excludedIds } } : {}),
    };
  }

  const exams = await Exam.find(filter).sort({ createdAt: -1 }).lean();

  const enriched = await attachExamEligibility(exams, req.user?._id);

  res.json({ success: true, data: { exams: enriched } });
});

/* =====================================================
   GET SINGLE EXAM
===================================================== */
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

/* =====================================================
   UPDATE EXAM  (Mongoose updateOne)
===================================================== */
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

/* =====================================================
   PUBLISH EXAM
===================================================== */
export const publishExam = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.params.examId, "examId");

  const result = await Exam.updateOne(
    { _id: examId },
    { $set: { status: "published", updatedAt: new Date() } }
  );

  if (!result.matchedCount) throw httpError(404, "Exam not found");

  res.json({ success: true, data: { message: "Exam published" } });
});

/* =====================================================
   GET EXAMS BY BELT (STUDENT)
===================================================== */
export const getExamsByBeltLevel = asyncHandler(async (req, res) => {
  const beltLevel = req.params.beltLevel;
  const studentId = assertObjectId(req.user?._id, "studentId");

  const excludedIds = await findCompletedExamIdsForStudent(studentId);

  const exams = await Exam.find({
    beltLevel,
    status: "published",
    ...(excludedIds.length ? { _id: { $nin: excludedIds } } : {}),
  })
    .sort({ createdAt: -1 })
    .lean();

  const enriched = await attachExamEligibility(exams, studentId);

  res.json({ success: true, data: { exams: enriched } });
});

/* =====================================================
   REGISTER FOR EXAM
===================================================== */
export const ExamRegisteration = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.body.examId, "examId");
  const studentId = assertObjectId(
    req.user?._id || req.body.playerId,
    "studentId"
  );

  // exam must be published
  const exam = await Exam.findOne({ _id: examId, status: "published" });
  if (!exam) throw httpError(404, "Exam not found or not published");

  // final result? => cannot register again
  const finalResult = await FinalExamResult.findOne({
    exam: examId,
    student: studentId,
  });
  if (finalResult)
    throw httpError(409, "Exam already finalized for this student");

  // register or return existing record
  let existing = await ExamRegistration.findOne({
    exam: examId,
    player: studentId,
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

  // create new registration
  const registration = await ExamRegistration.create({
    exam: examId,
    player: studentId,
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

/* =====================================================
   LIST SUBMISSIONS (ADMIN)
===================================================== */
export const listSubmissions = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.params.examId, "examId");

  // 1) هات كل الـ attempts اللي اتسلمت
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
      select: "title beltLevel",
    })
    .sort({ submittedAt: -1 })
    .lean();

  if (!attempts.length) {
    return res.json({ success: true, data: { submissions: [] } });
  }

  const studentIds = attempts.map((a) => a.student?._id);
  const examIds = attempts.map((a) => a.exam?._id);

  // 2) هات آخر FinalExamResult لكل طالب
  const finals = await FinalExamResult.find({
    exam: { $in: examIds },
    student: { $in: studentIds },
  })
    .sort({ finalizedAt: -1, date: -1, _id: -1 })
    .lean();

  const finalMap = new Map(
    finals.map((r) => [`${r.exam}_${r.student}`, r])
  );

  // 3) هات آخر PracticalEvaluation لكل طالب
  const practicals = await PracticalEvaluation.find({
    exam: { $in: examIds },
    student: { $in: studentIds },
  })
    .sort({ createdAt: -1 })
    .lean();

  const practicalMap = new Map(
    practicals.map((p) => [`${p.exam}_${p.student}`, p])
  );

  // 4) Combine all data into final result
  const submissions = attempts.map((att) => {
    const key = `${att.exam._id}_${att.student._id}`;

    const final = finalMap.get(key) || null;
    const practical = practicalMap.get(key) || null;

    return {
      _id: att._id,

      exam: att.exam
        ? {
            _id: att.exam._id,
            title: att.exam.title,
            beltLevel: att.exam.beltLevel,
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

      autoScore: att.autoScore,
      manualScore: att.manualScore,
      theoryScore: att.theoryScore,
      pass: att.pass,
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

/* =====================================================
   LIST REGISTRATIONS FOR EXAM (ADMIN)
===================================================== */
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

  // attach final result for each registration
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

/* =====================================================
   APPROVE REGISTRATION
===================================================== */
export const approveRegistration = asyncHandler(async (req, res) => {
  const id = assertObjectId(req.params.id, "registrationId");

  const reg = await ExamRegistration.findOneAndUpdate(
    { _id: id, status: "pending" },
    {
      $set: {
        status: "approved",
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!reg) {
    throw httpError(404, "Registration not found or already processed");
  }

  res.json({ success: true, data: { message: "Registration approved" } });
});

/* =====================================================
   REJECT REGISTRATION
===================================================== */
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

  if (!reg) {
    throw httpError(404, "Registration not found or already processed");
  }

  res.json({ success: true, data: { message: "Registration rejected" } });
});

/* =====================================================
   START ATTEMPT (APPROVED STUDENTS)
===================================================== */
export const startAttempt = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.body.examId, "examId");
  const studentId = assertObjectId(req.user._id, "studentId");

  // 1) exam must be published
  const exam = await Exam.findOne({
    _id: examId,
    status: "published",
  }).lean();

  if (!exam) {
    throw httpError(403, "Exam is not available to start");
  }

  // 2) check registration
  const registration = await ExamRegistration.findOne({
    exam: examId,
    player: studentId,
    status: "approved",
  });

  if (!registration) {
    throw httpError(403, "You are not approved to start this exam", {
      reason: "REGISTRATION_REQUIRED",
    });
  }

  // 3) check final result (already passed/finalized)
  const existingFinal = await FinalExamResult.findOne({
    exam: examId,
    student: studentId,
  });

  if (existingFinal) {
    throw httpError(409, "Exam already finalized for this student");
  }

  // 4) check if theory was already submitted
  const alreadySubmitted = await ExamAttempt.findOne({
    exam: examId,
    student: studentId,
    submittedAt: { $ne: null },
  });

  if (alreadySubmitted) {
    throw httpError(400, "Attempt already submitted for this exam");
  }

  // 5) eligibility servi

/* =====================================================
   SUBMIT ATTEMPT (THEORY)
===================================================== */
export const submitAttempt = asyncHandler(async (req, res) => {
  const attemptId = assertObjectId(req.body.attemptId, "attemptId");
  const studentId = assertObjectId(req.user._id, "studentId");

  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  const { focusLosses, forcedSubmitReason } = req.body;

  if (!answers.length) {
    throw httpError(400, "answers are required");
  }

  // 1) load attempt
  const attempt = await ExamAttempt.findById(attemptId);
  if (!attempt) throw httpError(404, "Attempt not found");

  if (attempt.student.toString() !== studentId.toString()) {
    throw httpError(403, "Not your attempt");
  }

  if (attempt.submittedAt) {
    throw httpError(400, "Attempt already submitted");
  }

  // 2) check no final result exists
  const existingFinal = await FinalExamResult.findOne({
    exam: attempt.exam,
    student: studentId,
  });
  if (existingFinal) {
    throw httpError(409, "Exam already finalized for this student");
  }

  // 3) load exam
  const exam = await Exam.findById(attempt.exam).lean();
  if (!exam) throw httpError(404, "Exam not found");

  // 4) auto scoring
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

  // 5) update attempt
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
      theoryPass: pass,
      message: "Theory submitted. Awaiting practical evaluation.",
    },
  });
});


/* =====================================================
   PRACTICAL SCORING
===================================================== */
export const gradeManual2 = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.body.examId, "examId");
  const studentId = assertObjectId(req.body.studentId, "studentId");

  // 1) لو النتيجة النهائية موجودة → ماينفعش تضيف practical جديد
  const existingFinal = await FinalExamResult.findOne({
    exam: examId,
    student: studentId,
  });
  if (existingFinal) {
    throw httpError(409, "Result already finalized");
  }

  // 2) لازم يكون فيه attempt submitted للنظري
  const attempt = await ExamAttempt.findOne({
    exam: examId,
    student: studentId,
    submittedAt: { $ne: null },
  });

  if (!attempt) {
    throw httpError(404, "Submitted theory attempt not found");
  }

  // 3) لو فيه practicalEvaluation موجود → ممنوع إعادة الإدخال
  const existingEval = await PracticalEvaluation.findOne({
    exam: examId,
    student: studentId,
  });

  if (existingEval) {
    throw httpError(409, "Practical evaluation already exists");
  }

  // 4) إنشاء practicalEvaluation جديد
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

/* =====================================================
   COMBINE SCORES (FINAL RESULT)
===================================================== */
export const combineScores = asyncHandler(async (req, res) => {
  const examId = assertObjectId(req.body.examId, "examId");
  const studentId = assertObjectId(req.body.studentId, "studentId");

  // 1) النتيجة النهائية موجودة؟
  const existingFinal = await FinalExamResult.findOne({
    exam: examId,
    student: studentId,
  });

  if (existingFinal) {
    throw httpError(409, "Result already finalized");
  }

  // 2) attempt النظري
  const attempt = await ExamAttempt.findOne({
    exam: examId,
    student: studentId,
    submittedAt: { $ne: null },
  });

  if (!attempt) {
    throw httpError(404, "Theory attempt not found");
  }

  // 3) تقييم الـ practical
  const practical = await PracticalEvaluation.findOne({
    exam: examId,
    student: studentId,
  });

  if (!practical) {
    throw httpError(404, "Practical evaluation not found");
  }

  // 4) بيانات الامتحان
  const exam = await Exam.findById(examId).lean();
  if (!exam) {
    throw httpError(404, "Exam not found");
  }

  // 5) حساب النظري
  const theoryScore = asNumber(attempt.theoryScore, 0);
  const theoryPass = theoryScore >= computeTheoryPassMark(exam);

  // 6) حساب الـ practical و الـ totals
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

  // 7) إنشاء FinalExamResult
  const finalResult = await FinalExamResult.create({
    exam: examId,
    student: studentId,
    theoryScore,
    practicalScores,
    methodTotal,
    totalScore,
    passed,
    date: now,
  });

  // 8) لو نجح الطالب → حدّث Player + XP
  if (passed) {
    const player = await Player.findOne({ user: studentId });
    if (player) {
      player.totalExamsPassed = (player.totalExamsPassed || 0) + 1;
      await player.save();
      await awardXpForEvent(player._id, "EXAM_PASS");
    }
  }

  // 9) تحديث attempt بالفينال (finalPassed, finalTotalScore..)
  await ExamAttempt.updateOne(
    { _id: attempt._id },
    {
      $set: {
        finalPassed: passed,
        finalTotalScore: totalScore,
        finalPracticalScores: practicalScores,
        finalizedAt: now,
      },
    }
  );

  // 10) إنشاء Certificate لو نجح
  let certificate = null;

  if (passed) {
    certificate = await Certificate.create({
      user: studentId,
      examId,
      type: "exam",
      title: `${exam.title} Certificate`,
      description: `Passed final exam for ${exam.beltLevel} belt`,
      issuedBy: req.user?._id,
      issuedAt: now,
    });
  }

  // 11) Notifications
  try {
    await Notification.create({
      user: studentId,
      title: passed ? "Exam Passed" : "Exam Graded",
      message: passed
        ? "Congratulations! You passed your exam."
        : "Your exam has been graded.",
      type: "result",
    });

    if (certificate?._id) {
      await Notification.create({
        user: studentId,
        title: "Certificate Ready",
        message: "Your certificate is ready for download.",
        type: "certificate",
      });
    }
  } catch (err) {
    console.error("Failed to send notifications", err);
  }

  res.json({
    success: true,
    data: {
      finalResult,
      certificate,
    },
  });
});

/* =====================================================
   GRADE ESSAY MANUALLY
===================================================== */
export const gradeManual = asyncHandler(async (req, res) => {
  const attemptId = assertObjectId(
    req.params.id || req.body.attemptId,
    "attemptId"
  );

  const manualScore = asNumber(
    req.body.manualScores ?? req.body.manualScore,
    0
  );

  const attempt = await ExamAttempt.findById(attemptId);
  if (!attempt) {
    throw httpError(404, "Attempt not found");
  }

  const exam = await Exam.findById(attempt.exam).lean();
  if (!exam) {
    throw httpError(404, "Exam not found");
  }

  const finalScore = asNumber(attempt.autoScore, 0) + manualScore;
  const pass = finalScore >= computeTheoryPassMark(exam);

  attempt.manualScore = manualScore;
  attempt.theoryScore = finalScore;
  attempt.pass = pass;
  attempt.updatedAt = new Date();

  await attempt.save();

  res.json({
    success: true,
    data: {
      finalScore,
      pass,
    },
  });
});

