import asyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import { getDb } from "../utils/mongodb.js";
import {
  assertObjectId,
  toObjectId,
  httpError,
  asNumber,
} from "../utils/validation.js";

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

const mapPracticalScores = (body = {}) => ({
  morality: asNumber(body.morality),
  practicalMethod: asNumber(body.practicalMethod),
  technique: asNumber(body.technique),
  physical: asNumber(body.physical),
  mental: asNumber(body.mental),
});

/* =====================================================
   REGISTRATION STATUS (STUDENT)
===================================================== */
export const getRegistrationStatus = asyncHandler(async (req, res) => {
  const db = await getDb();
  const examId = assertObjectId(req.params.examId, "examId");
  const studentId = assertObjectId(req.user?._id, "studentId");

  const [registration, finalResult] = await Promise.all([
    db.collection("examRegistrations").findOne({
      exam: examId,
      player: studentId,
    }),
    db.collection("finalExamResults").findOne({
      exam: examId,
      student: studentId,
    }),
  ]);

  res.json({
    success: true,
    status: registration?.status || "none",
    finalized: Boolean(finalResult),
  });
});

/* =====================================================
   CREATE EXAM (ADMIN)
===================================================== */
export const createExam = asyncHandler(async (req, res) => {
  const db = await getDb();

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

  const exam = {
    title,
    beltLevel,
    schedule,
    timeLimit: timeLimit || 20,
    passMark: finalPassMark,
    maxTheoryScore: computedMaxTheory,
    questions: questionsWithMeta,
    createdBy: creatorId,
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("exams").insertOne(exam);

  res.status(201).json({
    success: true,
    exam: { ...exam, _id: result.insertedId },
  });
});

/* =====================================================
   LIST EXAMS
===================================================== */
export const listExams = asyncHandler(async (req, res) => {
  const db = await getDb();
  let filter = {};

  if (req.user?.role === "student") {
    const studentId = assertObjectId(req.user._id, "studentId");
    const completed = await db
      .collection("finalExamResults")
      .find({ student: studentId })
      .project({ exam: 1 })
      .toArray();
    const excludedIds = completed.map((c) => c.exam);

    filter = {
      status: "published",
      ...(excludedIds.length ? { _id: { $nin: excludedIds } } : {}),
    };
  }

  const exams = await db
    .collection("exams")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  res.json({ success: true, exams });
});

/* =====================================================
   GET SINGLE EXAM
===================================================== */
export const getExam = asyncHandler(async (req, res) => {
  const db = await getDb();
  const examId = assertObjectId(req.params.id, "id");

  const filter = { _id: examId };
  if (req.user?.role === "student") {
    filter.status = "published";
  }

  const exam = await db.collection("exams").findOne(filter);

  if (!exam) throw httpError(404, "Exam not found");

  res.json({ success: true, exam });
});

/* =====================================================
   UPDATE EXAM
===================================================== */
export const updateExam = asyncHandler(async (req, res) => {
  const db = await getDb();
  const examId = assertObjectId(req.params.id, "id");

  const payload = { ...req.body, updatedAt: new Date() };

  const result = await db
    .collection("exams")
    .updateOne({ _id: examId }, { $set: payload });

  if (!result.matchedCount) throw httpError(404, "Exam not found");

  res.json({ success: true, message: "Exam updated" });
});

/* =====================================================
   PUBLISH EXAM
===================================================== */
export const publishExam = asyncHandler(async (req, res) => {
  const db = await getDb();
  const examId = assertObjectId(req.params.examId, "examId");

  const result = await db
    .collection("exams")
    .updateOne(
      { _id: examId },
      { $set: { status: "published", updatedAt: new Date() } }
    );

  if (!result.matchedCount) throw httpError(404, "Exam not found");

  res.json({ success: true, message: "Exam published" });
});

/* =====================================================
   GET EXAMS BY BELT
===================================================== */
export const getExamsByBeltLevel = asyncHandler(async (req, res) => {
  const db = await getDb();
  const beltLevel = req.params.beltLevel;
  const studentId = assertObjectId(req.user?._id, "studentId");

  const completed = await db
    .collection("finalExamResults")
    .find({ student: studentId })
    .project({ exam: 1 })
    .toArray();
  const excludedIds = completed.map((c) => c.exam);

  const exams = await db
    .collection("exams")
    .find({
      beltLevel,
      status: "published",
      ...(excludedIds.length ? { _id: { $nin: excludedIds } } : {}),
    })
    .sort({ createdAt: -1 })
    .toArray();

  res.json({ success: true, exams });
});

/* =====================================================
   REGISTER FOR EXAM
===================================================== */
export const ExamRegisteration = asyncHandler(async (req, res) => {
  const db = await getDb();

  const examObjectId = assertObjectId(req.body.examId, "examId");
  const studentId = assertObjectId(
    req.user?._id || req.body.playerId,
    "studentId"
  );

  const exam = await db
    .collection("exams")
    .findOne({ _id: examObjectId, status: "published" });
  if (!exam) throw httpError(404, "Exam not found or not published");

  const finalResult = await db.collection("finalExamResults").findOne({
    exam: examObjectId,
    student: studentId,
  });
  if (finalResult) {
    throw httpError(409, "Exam already finalized for this student");
  }

  const registration = await db.collection("examRegistrations").findOneAndUpdate(
    { exam: examObjectId, player: studentId },
    {
      $set: { updatedAt: new Date() },
      $setOnInsert: { status: "pending", createdAt: new Date() },
    },
    { upsert: true, returnDocument: "after" }
  );

  const alreadyRegistered = registration?.lastErrorObject?.updatedExisting;
  const regDoc =
    registration.value ||
    (await db.collection("examRegistrations").findOne({
      _id: registration.lastErrorObject?.upsertedId,
    }));

  res.status(alreadyRegistered ? 200 : 201).json({
    success: true,
    registrationId: regDoc?._id,
    status: regDoc?.status || "pending",
    alreadyRegistered: Boolean(alreadyRegistered),
  });
});

/* =====================================================
   LIST SUBMISSIONS (ADMIN)
===================================================== */
export const listSubmissions = asyncHandler(async (req, res) => {
  const db = await getDb();
  const examObjId = assertObjectId(req.params.examId, "examId");

  const submissions = await db
    .collection("examAttempts")
    .aggregate([
      {
        $match: {
          exam: examObjId,
          submittedAt: { $ne: null },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "student",
          foreignField: "_id",
          as: "studentDoc",
        },
      },
      {
        $unwind: {
          path: "$studentDoc",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "examDoc",
        },
      },
      {
        $unwind: {
          path: "$examDoc",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "finalExamResults",
          let: { examId: "$exam", studentId: "$student" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$exam", "$$examId"] },
                    { $eq: ["$student", "$$studentId"] },
                  ],
                },
              },
            },
            { $sort: { finalizedAt: -1, date: -1, _id: -1 } },
            { $limit: 1 },
          ],
          as: "finalResult",
        },
      },
      {
        $unwind: {
          path: "$finalResult",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "practicalEvaluations",
          let: { examId: "$exam", studentId: "$student" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$exam", "$$examId"] },
                    { $eq: ["$student", "$$studentId"] },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: "practicalEval",
        },
      },
      {
        $unwind: {
          path: "$practicalEval",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          exam: {
            $cond: [
              { $ifNull: ["$examDoc", false] },
              {
                _id: "$examDoc._id",
                title: "$examDoc.title",
                beltLevel: "$examDoc.beltLevel",
              },
              "$exam",
            ],
          },
          student: {
            _id: "$studentDoc._id",
            name: "$studentDoc.name",
            email: "$studentDoc.email",
            belt: "$studentDoc.beltLevel",
          },
          autoScore: 1,
          manualScore: 1,
          theoryScore: 1,
          pass: 1,
          submittedAt: 1,
          practicalRecorded: { $cond: [{ $ifNull: ["$practicalEval", false] }, true, false] },
          finalPassed: {
            $cond: [{ $ifNull: ["$finalResult", false] }, "$finalResult.passed", null],
          },
          finalTotalScore: "$finalResult.totalScore",
          finalPracticalScores: "$finalResult.practicalScores",
          finalizedAt: "$finalResult.finalizedAt",
        },
      },
      { $sort: { submittedAt: -1 } },
    ])
    .toArray();

  res.json({ success: true, submissions });
});

/* =====================================================
   LIST REGISTRATIONS FOR EXAM (ADMIN)
===================================================== */
export const listRegistrations = asyncHandler(async (req, res) => {
  const db = await getDb();
  const examId = assertObjectId(req.params.examId, "examId");

  const registrations = await db
    .collection("examRegistrations")
    .aggregate([
      { $match: { exam: examId } },
      {
        $lookup: {
          from: "users",
          localField: "player",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: { path: "$student", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "examDoc",
        },
      },
      {
        $unwind: { path: "$examDoc", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "finalExamResults",
          let: { examId: "$exam", studentId: "$player" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$exam", "$$examId"] },
                    { $eq: ["$student", "$$studentId"] },
                  ],
                },
              },
            },
            { $sort: { finalizedAt: -1, date: -1, _id: -1 } },
            { $limit: 1 },
          ],
          as: "finalResult",
        },
      },
      {
        $unwind: {
          path: "$finalResult",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          exam: {
            _id: "$examDoc._id",
            title: "$examDoc.title",
            beltLevel: "$examDoc.beltLevel",
          },
          player: "$player",
          student: {
            _id: "$student._id",
            name: "$student.name",
            email: "$student.email",
            belt: "$student.beltLevel",
          },
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          finalPassed: "$finalResult.passed",
          finalTotalScore: "$finalResult.totalScore",
          finalizedAt: "$finalResult.finalizedAt",
        },
      },
      { $sort: { createdAt: -1 } },
    ])
    .toArray();

  res.json({ success: true, registrations });
});

/* =====================================================
   APPROVE REGISTRATION
===================================================== */
export const approveRegistration = asyncHandler(async (req, res) => {
  const db = await getDb();
  const id = assertObjectId(req.params.id, "registrationId");

  const result = await db.collection("examRegistrations").updateOne(
    { _id: id, status: "pending" },
    {
      $set: {
        status: "approved",
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );

  if (!result.matchedCount) {
    throw httpError(404, "Registration not found or already processed");
  }

  res.json({ success: true, message: "Registration approved" });
});

/* =====================================================
   REJECT REGISTRATION
===================================================== */
export const rejectRegistration = asyncHandler(async (req, res) => {
  const db = await getDb();
  const id = assertObjectId(req.params.id, "registrationId");

  const result = await db.collection("examRegistrations").updateOne(
    { _id: id, status: "pending" },
    {
      $set: {
        status: "rejected",
        rejectedAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );

  if (!result.matchedCount) {
    throw httpError(404, "Registration not found or already processed");
  }

  res.json({ success: true, message: "Registration rejected" });
});

/* =====================================================
   START ATTEMPT (APPROVED STUDENTS)
===================================================== */
export const startAttempt = asyncHandler(async (req, res) => {
  const db = await getDb();

  const examObjectId = assertObjectId(req.body.examId, "examId");
  const studentId = assertObjectId(req.user?._id, "studentId");

  const exam = await db
    .collection("exams")
    .findOne({ _id: examObjectId, status: "published" });
  if (!exam) {
    throw httpError(403, "Exam is not available to start");
  }

  const [registration, finalResult, submittedAttempt] = await Promise.all([
    db.collection("examRegistrations").findOne({
      exam: examObjectId,
      player: studentId,
      status: "approved",
    }),
    db.collection("finalExamResults").findOne({
      exam: examObjectId,
      student: studentId,
    }),
    db.collection("examAttempts").findOne({
      exam: examObjectId,
      student: studentId,
      submittedAt: { $ne: null },
    }),
  ]);

  if (!registration) {
    throw httpError(403, "You are not approved to start this exam");
  }

  if (finalResult) {
    throw httpError(409, "Exam already finalized for this student");
  }

  if (submittedAttempt) {
    throw httpError(400, "Attempt already submitted for this exam");
  }

  const attempt = await db.collection("examAttempts").findOneAndUpdate(
    { exam: examObjectId, student: studentId, submittedAt: null },
    {
      $setOnInsert: {
        exam: examObjectId,
        student: studentId,
        startedAt: new Date(),
        submittedAt: null,
        answers: [],
        autoScore: 0,
        manualScore: 0,
        theoryScore: 0,
        pass: false,
        antiCheat: null,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  res.json({ success: true, attemptId: attempt.value._id, attempt: attempt.value });
});

/* =====================================================
   SUBMIT ATTEMPT (THEORY)
===================================================== */
export const submitAttempt = asyncHandler(async (req, res) => {
  const db = await getDb();

  const attemptObjectId = assertObjectId(req.body.attemptId, "attemptId");
  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  const { focusLosses, forcedSubmitReason } = req.body;

  if (!answers.length) {
    throw httpError(400, "answers are required");
  }

  const attempt = await db
    .collection("examAttempts")
    .findOne({ _id: attemptObjectId });

  if (!attempt) {
    throw httpError(404, "Attempt not found");
  }

  if (attempt.student.toString() !== req.user._id.toString()) {
    throw httpError(403, "Not your attempt");
  }

  if (attempt.submittedAt) {
    throw httpError(400, "Attempt already submitted");
  }

  const finalResult = await db.collection("finalExamResults").findOne({
    exam: attempt.exam,
    student: attempt.student,
  });
  if (finalResult) {
    throw httpError(409, "Exam already finalized for this student");
  }

  const exam = await db
    .collection("exams")
    .findOne({ _id: new ObjectId(attempt.exam) });

  if (!exam) {
    throw httpError(404, "Exam not found");
  }

  let autoScore = 0;

  answers.forEach((ans) => {
    const qid = toObjectId(ans.questionId);
    if (!qid) return;

    const q = exam.questions.find((qq) => qq._id.toString() === qid.toString());
    if (!q) return;

    if (q.type === "mcq") {
      if (
        typeof ans.selectedIndex === "number" &&
        ans.selectedIndex === q.correctIndex
      ) {
        autoScore += q.maxScore ?? 1;
      }
    }

    if (q.type === "truefalse") {
      if (
        typeof ans.booleanAnswer === "boolean" &&
        ans.booleanAnswer === q.correctBoolean
      ) {
        autoScore += q.maxScore ?? 1;
      }
    }
  });

  const theoryScore = autoScore;
  const theoryPass = theoryScore >= computeTheoryPassMark(exam);

  await db.collection("examAttempts").updateOne(
    { _id: attemptObjectId },
    {
      $set: {
        answers,
        autoScore: theoryScore,
        theoryScore,
        pass: theoryPass,
        submittedAt: new Date(),
        antiCheat: { focusLosses, forcedSubmitReason },
      },
    }
  );

  return res.json({
    success: true,
    attemptId: attemptObjectId,
    theoryScore,
    theoryPass,
    message: "Theory submitted. Awaiting practical evaluation.",
  });
});

/* =====================================================
   PRACTICAL SCORING
===================================================== */
export const gradeManual2 = asyncHandler(async (req, res) => {
  const db = await getDb();

  const examId = assertObjectId(req.body.examId, "examId");
  const studentId = assertObjectId(req.body.studentId, "studentId");

  const existingFinal = await db.collection("finalExamResults").findOne({
    exam: examId,
    student: studentId,
  });
  if (existingFinal) {
    throw httpError(409, "Result already finalized");
  }

  const attempt = await db
    .collection("examAttempts")
    .findOne({ exam: examId, student: studentId, submittedAt: { $ne: null } });
  if (!attempt) {
    throw httpError(404, "Submitted theory attempt not found");
  }

  const evaluation = {
    exam: examId,
    student: studentId,
    ...mapPracticalScores(req.body),
    createdAt: new Date(),
  };

  const writeResult = await db.collection("practicalEvaluations").updateOne(
    { exam: examId, student: studentId },
    { $setOnInsert: evaluation },
    { upsert: true }
  );

  if (!writeResult.upsertedCount) {
    throw httpError(409, "Practical evaluation already exists");
  }

  res.status(201).json({
    success: true,
    message: "Practical scores saved",
    evaluation: { ...evaluation, _id: writeResult.upsertedId },
  });
});

/* =====================================================
   COMBINE SCORES (FINAL RESULT)
===================================================== */
export const combineScores = asyncHandler(async (req, res) => {
  const db = await getDb();

  const examId = assertObjectId(req.body.examId, "examId");
  const studentId = assertObjectId(req.body.studentId, "studentId");

  const existingFinal = await db
    .collection("finalExamResults")
    .findOne({ exam: examId, student: studentId });
  if (existingFinal) {
    throw httpError(409, "Result already finalized");
  }

  const attempt = await db.collection("examAttempts").findOne({
    exam: examId,
    student: studentId,
    submittedAt: { $ne: null },
  });

  if (!attempt) {
    throw httpError(404, "Theory attempt not found");
  }

  const practical = await db.collection("practicalEvaluations").findOne({
    exam: examId,
    student: studentId,
  });

  if (!practical) {
    throw httpError(404, "Practical evaluation not found");
  }

  const exam = await db.collection("exams").findOne({ _id: examId });
  if (!exam) {
    throw httpError(404, "Exam not found");
  }

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

  const finalResult = {
    exam: examId,
    student: studentId,
    theoryScore,
    theoryPass,
    practicalScores,
    methodTotal,
    totalScore,
    passed,
    date: new Date(),
    finalizedAt: new Date(),
  };

  const insertResult = await db.collection("finalExamResults").updateOne(
    { exam: examId, student: studentId },
    { $setOnInsert: finalResult },
    { upsert: true }
  );

  if (!insertResult.upsertedCount) {
    throw httpError(409, "Result already finalized");
  }

  await db.collection("examAttempts").updateOne(
    { _id: attempt._id, finalizedAt: { $exists: false } },
    {
      $set: {
        finalPassed: passed,
        finalTotalScore: totalScore,
        finalPracticalScores: practicalScores,
        finalizedAt: finalResult.finalizedAt,
      },
    }
  );

  res.json({ success: true, finalResult });
});

/* =====================================================
   GRADE ESSAY MANUALLY
===================================================== */
export const gradeManual = asyncHandler(async (req, res) => {
  const db = await getDb();

  const attemptId = assertObjectId(
    req.params.id || req.body.attemptId,
    "attemptId"
  );
  const manualScore = asNumber(
    req.body.manualScores ?? req.body.manualScore,
    0
  );

  const attempt = await db
    .collection("examAttempts")
    .findOne({ _id: attemptId });

  if (!attempt) {
    throw httpError(404, "Attempt not found");
  }

  const exam = await db.collection("exams").findOne({ _id: attempt.exam });
  if (!exam) {
    throw httpError(404, "Exam not found");
  }

  const finalScore = asNumber(attempt.autoScore, 0) + manualScore;
  const pass = finalScore >= computeTheoryPassMark(exam);

  await db.collection("examAttempts").updateOne(
    { _id: attemptId },
    {
      $set: {
        manualScore,
        theoryScore: finalScore,
        pass,
        updatedAt: new Date(),
      },
    }
  );

  res.json({ success: true, finalScore, pass });
});

/* =====================================================
   STUDENT - MY ATTEMPTS (WITH FINAL RESULT)
===================================================== */
export const getMyAttempts = asyncHandler(async (req, res) => {
  const db = await getDb();
  const studentId = assertObjectId(req.user._id, "studentId");

  const attempts = await db
    .collection("examAttempts")
    .aggregate([
      { $match: { student: studentId } },
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "exam",
        },
      },
      { $unwind: "$exam" },
      {
        $lookup: {
          from: "finalExamResults",
          let: { examId: "$exam._id", studentId: "$student" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$exam", "$$examId"] },
                    { $eq: ["$student", "$$studentId"] },
                  ],
                },
              },
            },
            { $sort: { finalizedAt: -1, date: -1, _id: -1 } },
            { $limit: 1 },
          ],
          as: "finalResult",
        },
      },
      {
        $unwind: {
          path: "$finalResult",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          exam: {
            _id: "$exam._id",
            title: "$exam.title",
            beltLevel: "$exam.beltLevel",
            timeLimit: "$exam.timeLimit",
            maxTheoryScore: "$exam.maxTheoryScore",
          },
          autoScore: 1,
          manualScore: 1,
          theoryScore: 1,
          pass: 1,
          submittedAt: 1,
          answers: 1,
          finalPracticalScores: "$finalResult.practicalScores",
          finalMethodTotal: "$finalResult.methodTotal",
          finalTotalScore: "$finalResult.totalScore",
          finalPassed: "$finalResult.passed",
          finalizedAt: "$finalResult.finalizedAt",
        },
      },
      { $sort: { submittedAt: -1 } },
    ])
    .toArray();

  res.json({ success: true, attempts });
});
