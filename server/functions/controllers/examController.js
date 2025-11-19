import asyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import { getDb } from "../utils/mongodb.js";

/* =====================================================
   1) CREATE THEORY EXAM (ADMIN)
===================================================== */
export const getRegistrationStatus = asyncHandler(async (req, res) => {
  const db = await getDb();
  const examId = new ObjectId(req.params.examId);
  const studentId = new ObjectId(req.user._id);

  const reg = await db.collection("examRegistrations").findOne({
    exam: examId,
    player: studentId,
  });

  if (!reg) {
    return res.json({ status: "none" });
  }

  return res.json({ status: reg.status }); // pending / approved / rejected
});

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
    questions = [],
    createdBy,
  } = req.body;

  // تأمين الأسئلة + maxScore
  const questionsWithMeta = questions.map((q) => ({
    ...q,
    maxScore: q.maxScore ?? 1,
    _id: new ObjectId(), // لازم ID لكل سؤال
  }));

  // حساب مجموع درجات النظري من الأسئلة
  const computedMaxTheory = questionsWithMeta.reduce(
    (sum, q) => sum + (q.maxScore || 0),
    0
  );

  // لو مش مبعوت، خليه يساوي مجموع درجات الأسئلة
  const finalMaxTheoryScore = maxTheoryScore ?? computedMaxTheory;

  // لو مش مبعوت، خليه 60% من الدرجة الكاملة
  const finalPassMark = passMark ?? Math.round(finalMaxTheoryScore * 0.6);

  const exam = {
    title,
    beltLevel,
    schedule, // ممكن تبقى string ISO أو أي فورمات متفق عليه
    timeLimit: timeLimit || 20,
    passMark: finalPassMark,
    maxTheoryScore: finalMaxTheoryScore,
    questions: questionsWithMeta,
    createdBy: new ObjectId(createdBy),
    status: "draft",
    createdAt: new Date(),
  };

  const result = await db.collection("exams").insertOne(exam);

  res.json({ success: true, examId: result.insertedId, exam });
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

  if (!examId || !playerId) {
    return res.status(400).json({
      success: false,
      message: "examId and playerId are required",
    });
  }

  const examObjectId = new ObjectId(examId);
  const playerObjectId = new ObjectId(playerId);

  const exists = await db.collection("examRegistrations").findOne({
    exam: examObjectId,
    player: playerObjectId,
  });

  if (exists) {
    return res.json({
      success: false,
      message: "Already registered",
      registrationId: exists._id,
      status: exists.status,
    });
  }

  const reg = await db.collection("examRegistrations").insertOne({
    exam: examObjectId,
    player: playerObjectId,
    status: "pending",
    createdAt: new Date(),
  });

  res.json({
    success: true,
    registrationId: reg.insertedId,
    status: "pending",
  });
});
/* =====================================================
   13) LIST SUBMISSIONS
===================================================== */
/* =====================================================
   LIST SUBMISSIONS (ADMIN) — FIXED & ENHANCED
===================================================== */
export const listSubmissions = asyncHandler(async (req, res) => {
  const db = await getDb();
  const examId = req.params.examId;

  const submissions = await db
    .collection("examAttempts")
    .aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { exam: new ObjectId(examId) }, // exam stored as ObjectId
                { exam: examId }, // exam stored as string
              ],
            },
            { submittedAt: { $ne: null } },
          ],
        },
      },
      {
        $lookup: {
          from: "playerProfiles", // <-- HERE is the correct collection
          localField: "student", // examAttempts.student = userId
          foreignField: "user", // playerProfiles.user = same userId
          as: "studentProfile",
        },
      },
      { $unwind: "$studentProfile" },
      {
        $project: {
          _id: 1,
          exam: 1,
          student: {
            _id: "$studentProfile.user",
            name: "$studentProfile.name",
            email: "$studentProfile.email",
            belt: "$studentProfile.belt",
          },
          autoScore: 1,
          submittedAt: 1,
        },
      },
    ])
    .toArray();

  res.json({ success: true, submissions });
});

/* =====================================================
   7b) LIST REGISTRATIONS FOR EXAM (ADMIN)
===================================================== */
export const listRegistrations = asyncHandler(async (req, res) => {
  const db = await getDb();
  const examId = new ObjectId(req.params.examId);

  const registrations = await db
    .collection("examRegistrations")
    .aggregate([
      { $match: { exam: examId } },
      {
        $lookup: {
          from: "players", // لو اسم الكولكشن مختلف عدّله
          localField: "player",
          foreignField: "_id",
          as: "player",
        },
      },
      {
        $unwind: {
          path: "$player",
          preserveNullAndEmptyArrays: true,
        },
      },
    ])
    .toArray();

  res.json({ success: true, registrations });
});

/* =====================================================
   8) APPROVE REGISTRATION
===================================================== */
export const approveRegistration = asyncHandler(async (req, res) => {
  const db = await getDb();

  const id = new ObjectId(req.params.id);

  const result = await db.collection("examRegistrations").updateOne(
    { _id: id },
    {
      $set: {
        status: "approved",
        approvedAt: new Date(),
      },
    }
  );

  if (!result.modifiedCount) {
    return res
      .status(404)
      .json({ success: false, message: "Registration not found" });
  }

  res.json({ success: true, message: "Registration approved" });
});

// ============================================
//  REJECT REGISTRATION (ADMIN)
// ============================================
export const rejectRegistration = asyncHandler(async (req, res) => {
  const db = await getDb();

  const id = new ObjectId(req.params.id);

  const result = await db.collection("examRegistrations").updateOne(
    { _id: id },
    {
      $set: {
        status: "rejected",
        rejectedAt: new Date(),
      },
    }
  );

  if (!result.modifiedCount) {
    return res
      .status(404)
      .json({ success: false, message: "Registration not found" });
  }

  res.json({ success: true, message: "Registration rejected" });
});

/* =====================================================
   9) START ATTEMPT (ONLY IF APPROVED)
===================================================== */
export const startAttempt = asyncHandler(async (req, res) => {
  const db = await getDb();

  const { examId } = req.body;
  if (!examId) {
    return res
      .status(400)
      .json({ success: false, message: "examId is required" });
  }

  const examObjectId = new ObjectId(examId);
  const studentId = new ObjectId(req.user._id);

  // 1) تأكد إن الامتحان Published
  const exam = await db.collection("exams").findOne({ _id: examObjectId });
  if (!exam || exam.status !== "published") {
    return res.status(403).json({
      success: false,
      message: "Exam is not available to start",
    });
  }

  // 2) تأكد إن الطالب Approved على الامتحان
  const registration = await db.collection("examRegistrations").findOne({
    exam: examObjectId,
    player: studentId,
  });

  if (!registration || registration.status !== "approved") {
    return res.status(403).json({
      success: false,
      message: "You are not approved to start this exam.",
    });
  }

  // 3) Check if active attempt exists (لم يُقدَّم بعد)
  let attempt = await db.collection("examAttempts").findOne({
    exam: examObjectId,
    student: studentId,
    submittedAt: null,
  });

  if (!attempt) {
    const newAttempt = await db.collection("examAttempts").insertOne({
      exam: examObjectId,
      student: studentId,
      startedAt: new Date(),
      submittedAt: null,
      answers: [],
      autoScore: 0,
      manualScore: 0,
      theoryScore: 0,
      pass: false, // pass للنظري فقط
      antiCheat: null,
    });
    attempt = { _id: newAttempt.insertedId };
  }

  res.json({ success: true, attemptId: attempt._id });
});

/* =====================================================
   10) SUBMIT ATTEMPT (THEORY ONLY)
===================================================== */
export const submitAttempt = asyncHandler(async (req, res) => {
  const db = await getDb();

  const { attemptId, answers, focusLosses, forcedSubmitReason } = req.body;

  if (!attemptId || !Array.isArray(answers)) {
    return res.status(400).json({
      success: false,
      message: "attemptId and answers are required",
    });
  }

  const attemptObjectId = new ObjectId(attemptId);

  // 1) Get attempt
  const attempt = await db
    .collection("examAttempts")
    .findOne({ _id: attemptObjectId });

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
    if (!ans.questionId || ans.questionId.trim() === "") return;

    let qid;
    try {
      qid = new ObjectId(ans.questionId);
    } catch {
      return;
    }

    const q = exam.questions.find((qq) => qq._id.toString() === qid.toString());
    if (!q) return;

    // MCQ
    if (q.type === "mcq") {
      if (
        typeof ans.selectedIndex === "number" &&
        ans.selectedIndex === q.correctIndex
      ) {
        autoScore += q.maxScore ?? 1;
      }
    }

    // TRUE / FALSE
    if (q.type === "truefalse") {
      if (
        typeof ans.booleanAnswer === "boolean" &&
        ans.booleanAnswer === q.correctBoolean
      ) {
        autoScore += q.maxScore ?? 1;
      }
    }

    // ESSAY → manual later
  });

  const theoryScore = autoScore;
  const theoryPass = theoryScore >= (exam.passMark ?? 0);

  await db.collection("examAttempts").updateOne(
    { _id: attemptObjectId },
    {
      $set: {
        answers,
        autoScore: theoryScore,
        theoryScore,
        pass: theoryPass, // ده Pass للنظري فقط
        submittedAt: new Date(),
        antiCheat: { focusLosses, forcedSubmitReason },
      },
    }
  );

  return res.json({
    success: true,
    attemptId,
    theoryScore,
    theoryPass,
    message: "Theory submitted. Awaiting practical evaluation.",
  });
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
   12) COMBINE SCORES (FINAL RESULT)
===================================================== */
export const combineScores = asyncHandler(async (req, res) => {
  const db = await getDb();

  const { examId, studentId } = req.body;

  if (!examId || !studentId) {
    return res
      .status(400)
      .json({ success: false, message: "examId and studentId are required" });
  }

  const examObjectId = new ObjectId(examId);
  const studentObjectId = new ObjectId(studentId);

  const attempt = await db.collection("examAttempts").findOne({
    exam: examObjectId,
    student: studentObjectId,
  });

  if (!attempt) {
    return res.status(404).json({
      success: false,
      message: "Theory attempt not found",
    });
  }

  const practical = await db.collection("practicalEvaluations").findOne({
    exam: examObjectId,
    student: studentObjectId,
  });

  if (!practical) {
    return res.status(404).json({
      success: false,
      message: "Practical evaluation not found",
    });
  }

  const exam = await db.collection("exams").findOne({ _id: examObjectId });
  if (!exam) {
    return res.status(404).json({
      success: false,
      message: "Exam not found",
    });
  }

  const methodTotal =
    (attempt.theoryScore || 0) + (practical.practicalMethod || 0);

  const totalScore =
    (practical.morality || 0) +
    methodTotal +
    (practical.technique || 0) +
    (practical.physical || 0) +
    (practical.mental || 0);

  const passed = totalScore >= (exam.passMark ?? 0);

  const finalResult = {
    exam: examObjectId,
    student: studentObjectId,
    theoryScore: attempt.theoryScore || 0,
    practicalScores: {
      morality: practical.morality || 0,
      practicalMethod: practical.practicalMethod || 0,
      technique: practical.technique || 0,
      physical: practical.physical || 0,
      mental: practical.mental || 0,
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
   15) STUDENT – MY ATTEMPTS (WITH FINAL RESULT)
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
            { $sort: { date: -1 } },
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
          pass: 1, // Pass للنظري
          submittedAt: 1,
          answers: 1,

          finalTotalScore: "$finalResult.totalScore",
          finalPassed: "$finalResult.passed",
        },
      },
    ])
    .sort({ submittedAt: -1 })
    .toArray();

  res.json({ success: true, attempts });
});
