import asyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import { getDb } from "../utils/mongodb.js";

// ============================================
// 1) CREATE THEORY EXAM (ADMIN)
// ============================================
export const createExam = asyncHandler(async (req, res) => {
  const db = await getDb();
  const { title, beltLevel, schedule, maxTheoryScore, questions, createdBy } =
    req.body;

  const exam = {
    title,
    beltLevel,
    type: "theory",
    schedule,
    maxTheoryScore: maxTheoryScore || 40,
    questions: questions || [],
    createdBy: new ObjectId(createdBy),
    status: "draft",
    createdAt: new Date(),
  };

  const result = await db.collection("exams").insertOne(exam);

  res.json({
    success: true,
    examId: result.insertedId,
  });
});

// ============================================
// 2) LIST ALL EXAMS (ADMIN)
// ============================================
export const listExams = asyncHandler(async (req, res) => {
  const db = await getDb();
  const exams = await db.collection("exams").find({}).toArray();
  res.json({ success: true, exams });
});

// ============================================
// 3) GET SINGLE EXAM
// ============================================
export const getExam = asyncHandler(async (req, res) => {
  const db = await getDb();
  const exam = await db
    .collection("exams")
    .findOne({ _id: new ObjectId(req.params.id) });

  if (!exam) return res.status(404).json({ message: "Exam not found" });

  res.json({ success: true, exam });
});

// ============================================
// 4) UPDATE EXAM (ADMIN)
// ============================================
export const updateExam = asyncHandler(async (req, res) => {
  const db = await getDb();
  const update = req.body;

  await db
    .collection("exams")
    .updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });

  res.json({ success: true, message: "Exam updated" });
});

// ============================================
// 5) PUBLISH EXAM (ADMIN)
// ============================================
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

// ============================================
// 6) EXAMS FOR PLAYER (BY BELT)
// ============================================
export const getExamsByBeltLevel = asyncHandler(async (req, res) => {
  const db = await getDb();
  const belt = req.params.beltLevel;

  const exams = await db
    .collection("exams")
    .find({ beltLevel: belt, status: "published" })
    .toArray();

  res.json({ success: true, exams });
});

// ============================================
// 7) REGISTER FOR EXAM (STUDENT)
// ============================================
export const ExamRegisteration = asyncHandler(async (req, res) => {
  const db = await getDb();
  const { examId, playerId } = req.body;

  const exists = await db.collection("examRegistrations").findOne({
    exam: new ObjectId(examId),
    player: new ObjectId(playerId),
  });

  if (exists) {
    return res.json({ success: false, message: "Already registered" });
  }

  const reg = await db.collection("examRegistrations").insertOne({
    exam: new ObjectId(examId),
    player: new ObjectId(playerId),
    status: "pending",
    createdAt: new Date(),
  });

  res.json({ success: true, registrationId: reg.insertedId });
});

// ============================================
// 8) APPROVE REGISTRATION (ADMIN)
// ============================================
export const approveRegistration = asyncHandler(async (req, res) => {
  const db = await getDb();
  const id = req.params.id;

  await db
    .collection("examRegistrations")
    .updateOne({ _id: new ObjectId(id) }, { $set: { status: "approved" } });

  res.json({ success: true, message: "Registration approved" });
});

// ============================================
// 9) START THEORY ATTEMPT
// ============================================
export const startAttempt = asyncHandler(async (req, res) => {
  const db = await getDb();
  const { examId, studentId } = req.body;

  const attempt = {
    exam: new ObjectId(examId),
    student: new ObjectId(studentId),
    startedAt: new Date(),
    answers: [],
  };

  const result = await db.collection("examAttempts").insertOne(attempt);

  res.json({ success: true, attemptId: result.insertedId });
});

// ============================================
// 10) SUBMIT THEORY ATTEMPT (AUTO SCORING)
// ============================================
export const submitAttempt = asyncHandler(async (req, res) => {
  const db = await getDb();
  const { attemptId, answers } = req.body;

  // Fetch attempt + exam
  const attempt = await db
    .collection("examAttempts")
    .findOne({ _id: new ObjectId(attemptId) });

  const exam = await db.collection("exams").findOne({ _id: attempt.exam });

  let autoScore = 0;

  answers.forEach((ans, i) => {
    const q = exam.questions[i];

    if (q.type === "mcq" && ans.selectedIndex === q.correctIndex) {
      autoScore += q.maxScore;
    }

    if (q.type === "truefalse" && ans.booleanAnswer === q.correctBoolean) {
      autoScore += q.maxScore;
    }
  });

  await db.collection("examAttempts").updateOne(
    { _id: new ObjectId(attemptId) },
    {
      $set: {
        answers,
        autoScore,
        theoryScore: autoScore,
        submittedAt: new Date(),
      },
    }
  );

  res.json({ success: true, autoScore });
});

// ============================================
// 11) PRACTICAL SCORING (COACH)
// ============================================
export const gradeManual2 = asyncHandler(async (req, res) => {
  const db = await getDb();
  const {
    examId,
    studentId,
    morality,
    practicalMethod,
    technique,
    physical,
    mental,
  } = req.body;

  const evaluation = {
    exam: new ObjectId(examId),
    student: new ObjectId(studentId),
    morality,
    practicalMethod,
    technique,
    physical,
    mental,
    createdAt: new Date(),
  };

  await db.collection("practicalEvaluations").insertOne(evaluation);

  res.json({ success: true, message: "Practical scores saved" });
});

// ============================================
// 12) COMBINE SCORES → FINAL RESULT
// ============================================
export const combineScores = asyncHandler(async (req, res) => {
  const db = await getDb();
  const { examId, studentId } = req.body;

  const attempt = await db
    .collection("examAttempts")
    .findOne({ exam: new ObjectId(examId), student: new ObjectId(studentId) });

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

// ============================================
// 13) LIST ALL ATTEMPTS (ADMIN)
// ============================================
export const listSubmissions = asyncHandler(async (req, res) => {
  const db = await getDb();
  const examId = req.params.id;

  const submissions = await db
    .collection("examAttempts")
    .find({ exam: new ObjectId(examId) })
    .toArray();

  res.json({ success: true, submissions });
});

// ============================================
// 14) MANUAL GRADE (ESSAY QUESTIONS)
// ============================================
export const gradeManual = asyncHandler(async (req, res) => {
  const db = await getDb();

  const { attemptId, manualScores } = req.body;

  const attempt = await db
    .collection("examAttempts")
    .findOne({ _id: new ObjectId(attemptId) });

  const finalScore = attempt.autoScore + manualScores;

  await db
    .collection("examAttempts")
    .updateOne(
      { _id: new ObjectId(attemptId) },
      { $set: { manualScore: manualScores, theoryScore: finalScore } }
    );

  res.json({ success: true, finalScore });
});

export const listRegistrations = asyncHandler(async (req, res) => {
  const db = await getDb();

  const regs = await db
    .collection("examRegistrations")
    .aggregate([
      {
        $lookup: {
          from: "playerProfiles",
          localField: "player",
          foreignField: "user",
          as: "playerInfo",
        },
      },
      { $unwind: "$playerInfo" },
    ])
    .toArray();

  res.json(regs);
});
export const rejectRegistration = asyncHandler(async (req, res) => {
  const db = await getDb();

  await db
    .collection("examRegistrations")
    .updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: "rejected" } }
    );

  res.json({ success: true, message: "Registration rejected" });
});
// ============================================
// 15) STUDENT - MY ATTEMPTS
// ============================================
export const getMyAttempts = asyncHandler(async (req, res) => {
  try {
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
            answers: 1,
            autoScore: 1,
            manualScore: 1,
            theoryScore: 1,
            pass: 1,
            submittedAt: 1,
          },
        },
      ])
      .toArray();

    return res.json({ success: true, attempts });
  } catch (error) {
    console.error("My Attempts Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load attempts",
      error: error.message,
    });
  }
});
