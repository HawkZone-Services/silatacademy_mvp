import asyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import { getDb } from "../utils/mongodb.js";

/* =====================================================
   1) CREATE THEORY EXAM (ADMIN)
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
    questions,
    createdBy,
  } = req.body;

  const exam = {
    title,
    beltLevel,
    schedule,
    timeLimit: timeLimit || 20,
    passMark: passMark || 24,
    maxTheoryScore: maxTheoryScore || 40,

    questions: (questions || []).map((q) => ({
      ...q,
      _id: new ObjectId(), // ضروري
      maxScore: q.maxScore ?? 1,
    })),

    createdBy: new ObjectId(createdBy),
    status: "draft",
    createdAt: new Date(),
  };

  const result = await db.collection("exams").insertOne(exam);

  res.json({ success: true, examId: result.insertedId });
});

/* =====================================================
   2) LIST EXAMS
===================================================== */
export const listExams = asyncHandler(async (req, res) => {
  const db = await getDb();
  const exams = await db.collection("exams").find({}).toArray();
  res.json({ success: true, exams });
});

/* =====================================================
   3) GET SINGLE EXAM
===================================================== */
export const getExam = asyncHandler(async (req, res) => {
  const db = await getDb();
  const exam = await db
    .collection("exams")
    .findOne({ _id: new ObjectId(req.params.id) });

  if (!exam) return res.status(404).json({ message: "Exam not found" });
  res.json({ success: true, exam });
});

/* =====================================================
   4) UPDATE EXAM
===================================================== */
export const updateExam = asyncHandler(async (req, res) => {
  const db = await getDb();

  await db
    .collection("exams")
    .updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });

  res.json({ success: true, message: "Exam updated" });
});

/* =====================================================
   5) PUBLISH EXAM
===================================================== */
export const publishExam = asyncHandler(async (req, res) => {
  const db = await getDb();

  await db
    .collection("exams")
    .updateOne(
      { _id: new ObjectId(req.params.examId) },
      { $set: { status: "published" } }
    );

  res.json({ success: true, message: "Exam published" });
});

/* =====================================================
   6) GET EXAMS BY BELT
===================================================== */
export const getExamsByBeltLevel = asyncHandler(async (req, res) => {
  const db = await getDb();
  const exams = await db
    .collection("exams")
    .find({ beltLevel: req.params.beltLevel, status: "published" })
    .toArray();

  res.json({ success: true, exams });
});

/* =====================================================
   7) REGISTER FOR EXAM
===================================================== */
export const ExamRegisteration = asyncHandler(async (req, res) => {
  const db = await getDb();

  const { examId, playerId } = req.body;

  const exists = await db.collection("examRegistrations").findOne({
    exam: new ObjectId(examId),
    player: new ObjectId(playerId),
  });

  if (exists)
    return res.json({ success: false, message: "Already registered" });

  const reg = await db.collection("examRegistrations").insertOne({
    exam: new ObjectId(examId),
    player: new ObjectId(playerId),
    status: "pending",
    createdAt: new Date(),
  });

  res.json({ success: true, registrationId: reg.insertedId });
});

/* =====================================================
   8) APPROVE REGISTRATION
===================================================== */
export const approveRegistration = asyncHandler(async (req, res) => {
  const db = await getDb();

  await db
    .collection("examRegistrations")
    .updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: "approved" } }
    );

  res.json({ success: true, message: "Registration approved" });
});

// ============================================
//  REJECT REGISTRATION (ADMIN)
// ============================================
export const rejectRegistration = asyncHandler(async (req, res) => {
  const db = await getDb();

  const id = req.params.id;

  const result = await db
    .collection("examRegistrations")
    .updateOne({ _id: new ObjectId(id) }, { $set: { status: "rejected" } });

  if (!result.modifiedCount) {
    return res
      .status(404)
      .json({ success: false, message: "Registration not found" });
  }

  res.json({ success: true, message: "Registration rejected" });
});

/* =====================================================
   9) START ATTEMPT
===================================================== */
export const startAttempt = asyncHandler(async (req, res) => {
  const db = await getDb();

  const { examId } = req.body;
  const studentId = new ObjectId(req.user._id);

  // Check if active attempt exists
  let attempt = await db.collection("examAttempts").findOne({
    exam: new ObjectId(examId),
    student: studentId,
    submittedAt: null,
  });

  if (!attempt) {
    const newAttempt = await db.collection("examAttempts").insertOne({
      exam: new ObjectId(examId),
      student: studentId,
      startedAt: new Date(),
      answers: [],
      autoScore: 0,
      manualScore: 0,
      theoryScore: 0,
      pass: false,
    });
    attempt = { _id: newAttempt.insertedId };
  }

  res.json({ success: true, attemptId: attempt._id });
});

/* =====================================================
   10) SUBMIT ATTEMPT
===================================================== */
export const submitAttempt = asyncHandler(async (req, res) => {
  const db = await getDb();

  const { attemptId, answers, focusLosses, forcedSubmitReason } = req.body;

  // 1) Get attempt
  const attempt = await db
    .collection("examAttempts")
    .findOne({ _id: new ObjectId(attemptId) });

  if (!attempt) {
    return res
      .status(404)
      .json({ success: false, message: "Attempt not found" });
  }

  // 2) Get exam
  const exam = await db
    .collection("exams")
    .findOne({ _id: new ObjectId(attempt.exam) });

  if (!exam) {
    return res.status(404).json({ success: false, message: "Exam not found" });
  }

  let autoScore = 0;

  // 3) Process each answer safely
  answers.forEach((ans) => {
    // Skip invalid questionId
    if (!ans.questionId || ans.questionId.trim() === "") {
      console.log("❌ Skipped answer with missing questionId:", ans);
      return;
    }

    // Defensive: Ensure ID is valid
    let qid;
    try {
      qid = new ObjectId(ans.questionId);
    } catch {
      console.log("❌ Invalid questionId format:", ans.questionId);
      return;
    }

    // Find question in DB
    const q = exam.questions.find((qq) => qq._id.toString() === qid.toString());

    if (!q) {
      console.log("❌ Question not found in exam for ID:", ans.questionId);
      return;
    }

    // ===============================
    // SCORING LOGIC
    // ===============================

    // MCQ
    if (q.type === "mcq") {
      if (ans.selectedIndex !== null && ans.selectedIndex === q.correctIndex) {
        autoScore += q.maxScore;
      }
    }

    // TRUE / FALSE
    if (q.type === "truefalse") {
      if (
        ans.booleanAnswer !== null &&
        ans.booleanAnswer === q.correctBoolean
      ) {
        autoScore += q.maxScore;
      }
    }

    // ESSAY is manually graded, no autoScore
  });

  const pass = autoScore >= exam.passMark;

  // 4) Update attempt record
  await db.collection("examAttempts").updateOne(
    { _id: new ObjectId(attemptId) },
    {
      $set: {
        answers,
        autoScore,
        theoryScore: autoScore,
        pass,
        submittedAt: new Date(),
        antiCheat: { focusLosses, forcedSubmitReason },
      },
    }
  );

  return res.json({ success: true, pass, autoScore, attemptId });
});

/* =====================================================
   11) PRACTICAL SCORING
===================================================== */
export const gradeManual2 = asyncHandler(async (req, res) => {
  const db = await getDb();

  const evaluation = {
    exam: new ObjectId(req.body.examId),
    student: new ObjectId(req.body.studentId),
    morality: req.body.morality,
    practicalMethod: req.body.practicalMethod,
    technique: req.body.technique,
    physical: req.body.physical,
    mental: req.body.mental,
    createdAt: new Date(),
  };

  await db.collection("practicalEvaluations").insertOne(evaluation);

  res.json({ success: true, message: "Practical scores saved" });
});

/* =====================================================
   12) COMBINE SCORES
===================================================== */
export const combineScores = asyncHandler(async (req, res) => {
  const db = await getDb();

  const { examId, studentId } = req.body;

  const attempt = await db.collection("examAttempts").findOne({
    exam: new ObjectId(examId),
    student: new ObjectId(studentId),
  });

  const practical = await db.collection("practicalEvaluations").findOne({
    exam: new ObjectId(examId),
    student: new ObjectId(studentId),
  });

  const exam = await db
    .collection("exams")
    .findOne({ _id: new ObjectId(examId) });

  const methodTotal = attempt.theoryScore + practical.practicalMethod;

  const totalScore =
    practical.morality +
    methodTotal +
    practical.technique +
    practical.physical +
    practical.mental;

  const passed = totalScore >= exam.passMark;

  const finalResult = {
    exam: new ObjectId(examId),
    student: new ObjectId(studentId),
    theoryScore: attempt.theoryScore,
    practicalScores: {
      morality: practical.morality,
      practicalMethod: practical.practicalMethod,
      technique: practical.technique,
      physical: practical.physical,
      mental: practical.mental,
    },
    methodTotal,
    totalScore,
    passed,
    date: new Date(),
  };

  await db.collection("finalExamResults").insertOne(finalResult);

  res.json({ success: true, finalResult });
});

/* =====================================================
   13) LIST SUBMISSIONS
===================================================== */
export const listSubmissions = asyncHandler(async (req, res) => {
  const db = await getDb();

  const submissions = await db
    .collection("examAttempts")
    .find({ exam: new ObjectId(req.params.examId) })
    .toArray();

  res.json({ success: true, submissions });
});

/* =====================================================
   14) GRADE ESSAY MANUALLY
===================================================== */
export const gradeManual = asyncHandler(async (req, res) => {
  const db = await getDb();

  const { attemptId, manualScores } = req.body;

  const attempt = await db
    .collection("examAttempts")
    .findOne({ _id: new ObjectId(attemptId) });

  const finalScore = attempt.autoScore + manualScores;

  await db.collection("examAttempts").updateOne(
    { _id: new ObjectId(attemptId) },
    {
      $set: {
        manualScore: manualScores,
        theoryScore: finalScore,
      },
    }
  );

  res.json({ success: true, finalScore });
});

/* =====================================================
   15) STUDENT – MY ATTEMPTS (AGGREGATE)
===================================================== */
export const getMyAttempts = asyncHandler(async (req, res) => {
  const db = await getDb();
  const studentId = new ObjectId(req.user._id);

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
        $project: {
          _id: 1,
          exam: {
            _id: "$exam._id",
            title: "$exam.title",
            beltLevel: "$exam.beltLevel",
            timeLimit: "$exam.timeLimit",
          },
          autoScore: 1,
          manualScore: 1,
          theoryScore: 1,
          pass: 1,
          submittedAt: 1,
          answers: 1,
        },
      },
    ])
    .sort({ submittedAt: -1 })
    .toArray();

  res.json({ success: true, attempts });
});
