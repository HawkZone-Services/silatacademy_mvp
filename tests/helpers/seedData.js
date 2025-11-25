const fs = require("fs");
const path = require("path");
const request = require("supertest");

const DATA_PATH = path.join(__dirname, "..", "data.json");
const API_ROOT =
  process.env.API_BASE ||
  "http://127.0.0.1:5001/silatacademy-7c2a5/us-central1/api";
const API = `${API_ROOT}/api/v1`;
const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || "Passw0rd!";

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });
const ok = (label, res) => {
  if (![200, 201].includes(res.status)) {
    throw new Error(`${label} failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
};

const writeData = (payload) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(payload, null, 2));
};

const readData = () => {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const registerUser = async ({ name, email, role, nationalId, phone }) => {
  const res = await request(API).post("/auth/register").send({
    name,
    email,
    password: DEFAULT_PASSWORD,
    role,
    nationalId,
    phone,
    gender: "na",
  });
  ok("register user", res);
  return res.body;
};

const loginUser = async (username) => {
  const res = await request(API).post("/auth/login").send({
    username,
    password: DEFAULT_PASSWORD,
  });
  ok("login user", res);
  return {
    token: res.body?.token,
    userId: res.body?.user?._id,
    user: res.body?.user,
  };
};

const createPlayerProfile = async (adminToken, payload) => {
  const res = await request(API)
    .post("/admin/players")
    .set(authHeader(adminToken))
    .send(payload);
  ok("create player profile", res);
  return {
    userId: res.body?.userId,
    profileId: res.body?.profileId,
  };
};

const createCoachDoc = async (adminToken, coachUserId, stamp) => {
  const res = await request(API)
    .post("/coach")
    .set(authHeader(adminToken))
    .send({
      user: coachUserId,
      bio: `Seed coach ${stamp}`,
      specialties: ["forms", "conditioning"],
      achievements: ["seed badge"],
    });
  ok("create coach doc", res);
  return res.body?._id || res.body?.id;
};

const createProgram = async (adminToken, stamp) => {
  const res = await request(API)
    .post("/programs")
    .set(authHeader(adminToken))
    .send({
      level: "beginner",
      description: `Seed program ${stamp}`,
      modules: [
        {
          title: `Module ${stamp}`,
          objectives: ["balance", "stance"],
          anatomyFocus: ["legs"],
          repetitionGoal: "10",
          commonMistakes: ["slouch"],
        },
      ],
    });
  ok("create program", res);
  return res.body?._id || res.body?.program?._id || res.body?.id;
};

const createLesson = async (adminToken, programId, stamp) => {
  const res = await request(API)
    .post("/lessons")
    .set(authHeader(adminToken))
    .send({
      title: `Seed Lesson ${stamp}`,
      summary: "Intro lesson",
      content: "Lesson content",
      videoUrl: "https://example.com/video",
      program: programId,
      quiz: [
        { prompt: "Q1", options: ["a", "b"], correctIndex: 0 },
        { prompt: "Q2", options: ["x", "y"], correctIndex: 1 },
      ],
    });
  ok("create lesson", res);
  const lesson = res.body?.lesson || res.body;
  return lesson?._id || lesson?.id;
};

const createExam = async (adminToken, stamp) => {
  const res = await request(API)
    .post("/exams/admin")
    .set(authHeader(adminToken))
    .send({
      title: `Seed Exam ${stamp}`,
      beltLevel: "white",
      schedule: { startsAt: new Date().toISOString() },
      timeLimit: 20,
      questions: [
        {
          text: "Seed MCQ",
          type: "mcq",
          choices: ["yes", "no"],
          correctIndex: 0,
          maxScore: 2,
        },
        {
          text: "Seed True/False",
          type: "truefalse",
          correctBoolean: true,
          maxScore: 1,
        },
      ],
    });
  ok("create exam", res);
  const exam = res.body?.exam || res.body;
  const questions = exam?.questions || [];
  return {
    examId: exam?._id || exam?.id,
    questionIds: questions.map((q) => q._id || q.id),
  };
};

const publishExam = async (adminToken, examId) => {
  const res = await request(API)
    .patch(`/exams/admin/${examId}/publish`)
    .set(authHeader(adminToken));
  ok("publish exam", res);
};

const registerForExam = async (playerToken, examId) => {
  const res = await request(API)
    .post("/exams/register")
    .set(authHeader(playerToken))
    .send({ examId });
  ok("register exam", res);
  return res.body?.registrationId;
};

const approveRegistration = async (adminToken, registrationId) => {
  const res = await request(API)
    .patch(`/exams/admin/registration/${registrationId}/approve`)
    .set(authHeader(adminToken));
  ok("approve registration", res);
};

const startAttempt = async (playerToken, examId) => {
  const res = await request(API)
    .post("/exams/attempt/start")
    .set(authHeader(playerToken))
    .send({ examId });
  ok("start attempt", res);
  return res.body?.attemptId || res.body?.attempt?._id;
};

const submitAttempt = async (playerToken, attemptId, questionIds) => {
  const res = await request(API)
    .post("/exams/attempt/submit")
    .set(authHeader(playerToken))
    .send({
      attemptId,
      answers: [
        { questionId: questionIds[0], selectedIndex: 0 },
        { questionId: questionIds[1], booleanAnswer: true },
      ],
    });
  ok("submit attempt", res);
};

const savePractical = async (adminToken, examId, studentId) => {
  const res = await request(API)
    .post("/exams/admin/practical/score")
    .set(authHeader(adminToken))
    .send({
      examId,
      studentId,
      morality: 80,
      practicalMethod: 85,
      technique: 88,
      physical: 82,
      mental: 90,
    });
  ok("practical score", res);
};

const finalizeExam = async (adminToken, examId, studentId) => {
  const res = await request(API)
    .post("/exams/admin/finalize")
    .set(authHeader(adminToken))
    .send({ examId, studentId });
  ok("finalize exam", res);
};

const generateCertificate = async (adminToken, examId, studentId) => {
  const res = await request(API)
    .post("/certificates/generate")
    .set(authHeader(adminToken))
    .send({ examId, studentId });
  ok("generate certificate", res);
  return res.body?.certificate?._id || res.body?.certificateId;
};

const createAttendance = async (adminToken, playerId, stamp) => {
  const res = await request(API)
    .post("/attendance")
    .set(authHeader(adminToken))
    .send({
      player: playerId,
      coach: undefined,
      status: "present",
      sessionId: `seed-${stamp}`,
      notes: "seed attendance",
    });
  ok("create attendance", res);
  return res.body?._id || res.body?.id;
};

const createRanking = async (adminToken, stamp) => {
  const res = await request(API)
    .post("/ranking")
    .set(authHeader(adminToken))
    .send({
      name: `Seed White ${stamp}`,
      color: "#ffffff",
      order: Number(String(stamp).slice(-2)),
      requirements: {
        jurus: ["basic stance"],
        combat: "light sparring",
        flexibility: "toe touch",
        minHours: 1,
      },
      references: { videos: ["https://example.com/video"] },
    });
  ok("create ranking", res);
  return res.body?._id || res.body?.id;
};

const createLibraryItem = async (adminToken, stamp) => {
  const res = await request(API)
    .post("/library")
    .set(authHeader(adminToken))
    .send({
      type: "manual",
      title: `Seed Manual ${stamp}`,
      description: "Seeded library item",
      lang: "en",
      category: "technique",
      fileUrl: "https://example.com/manual.pdf",
    });
  ok("create library", res);
  return res.body?._id || res.body?.id;
};

const createEvent = async (adminToken, stamp) => {
  const res = await request(API)
    .post("/events")
    .set(authHeader(adminToken))
    .send({
      title: `Seed Event ${stamp}`,
      type: "workshop",
      description: "Seed workshop",
      location: "HQ",
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 3600000).toISOString(),
    });
  ok("create event", res);
  const event = res.body?.event || res.body;
  return event?._id || event?.id;
};

const registerEvent = async (token, eventId, userId) => {
  const res = await request(API)
    .post("/events/register")
    .set(authHeader(token))
    .send({ eventId, userId });
  ok("register event", res);
};

const sendNotification = async (token, userId, stamp) => {
  const res = await request(API)
    .post("/notifications")
    .set(authHeader(token))
    .send({
      user: userId,
      title: `Seed Notice ${stamp}`,
      message: "Welcome aboard",
      type: "system",
    });
  ok("send notification", res);
  return res.body?.notification?._id || res.body?._id || res.body?.id;
};

async function runSeed() {
  const stamp = Date.now();

  // Create admin and coach via auth.
  const adminEmail = `seed.admin.${stamp}@mail.com`;
  await registerUser({
    name: "Seed Admin",
    email: adminEmail,
    role: "admin",
    nationalId: `9${stamp}`,
  });
  const adminAuth = await loginUser(adminEmail);

  const coachEmail = `seed.coach.${stamp}@mail.com`;
  await registerUser({
    name: "Seed Coach",
    email: coachEmail,
    role: "instructor",
    nationalId: `8${stamp}`,
  });
  const coachAuth = await loginUser(coachEmail);

  // Create player via admin route to ensure profile exists.
  const playerEmail = `seed.player.${stamp}@mail.com`;
  const playerProfile = await createPlayerProfile(adminAuth.token, {
    name: "Seed Player",
    email: playerEmail,
    password: DEFAULT_PASSWORD,
    nationalId: `7${stamp}`,
    phone: `55${stamp.toString().slice(-6)}`,
    playerData: {
      belt: "white",
      beltColor: "#ffffff",
      stats: { power: 1, flexibility: 1, endurance: 1, speed: 1 },
      achievements: [],
      trainingLogs: [],
    },
  });
  const playerAuth = await loginUser(playerEmail);

  const coachDocId = await createCoachDoc(
    adminAuth.token,
    coachAuth.userId,
    stamp
  );
  const programId = await createProgram(adminAuth.token, stamp);
  const lessonId = await createLesson(adminAuth.token, programId, stamp);
  const exam = await createExam(adminAuth.token, stamp);
  await publishExam(adminAuth.token, exam.examId);
  const registrationId = await registerForExam(
    playerAuth.token,
    exam.examId
  );
  await approveRegistration(adminAuth.token, registrationId);
  const attemptId = await startAttempt(playerAuth.token, exam.examId);
  await submitAttempt(playerAuth.token, attemptId, exam.questionIds);
  await savePractical(adminAuth.token, exam.examId, playerAuth.userId);
  await finalizeExam(adminAuth.token, exam.examId, playerAuth.userId);
  const certificateId = await generateCertificate(
    adminAuth.token,
    exam.examId,
    playerAuth.userId
  );

  const attendanceId = await createAttendance(
    adminAuth.token,
    playerProfile.profileId,
    stamp
  );
  const rankingId = await createRanking(adminAuth.token, stamp);
  const libraryId = await createLibraryItem(adminAuth.token, stamp);
  const eventId = await createEvent(adminAuth.token, stamp);
  await registerEvent(playerAuth.token, eventId, playerAuth.userId);
  const notificationId = await sendNotification(
    adminAuth.token,
    playerAuth.userId,
    stamp
  );

  const payload = {
    meta: {
      apiRoot: API_ROOT,
      apiBase: API,
      password: DEFAULT_PASSWORD,
      stamp,
    },
    users: {
      admin: { email: adminEmail, userId: adminAuth.userId, token: adminAuth.token },
      coach: { email: coachEmail, userId: coachAuth.userId, token: coachAuth.token, coachId: coachDocId },
      player: {
        email: playerEmail,
        userId: playerAuth.userId,
        token: playerAuth.token,
        profileId: playerProfile.profileId,
      },
    },
    program: { id: programId },
    lesson: { id: lessonId },
    exam: {
      id: exam.examId,
      registrationId,
      attemptId,
      questions: exam.questionIds,
    },
    attendance: { id: attendanceId },
    ranking: { id: rankingId },
    library: { id: libraryId },
    event: { id: eventId },
    notification: { id: notificationId },
    certificate: { id: certificateId },
  };

  global.seedData = payload;
  writeData(payload);
  return payload;
}

module.exports = {
  runSeed,
  readData,
  DATA_PATH,
};
