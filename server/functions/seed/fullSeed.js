import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("❌ MONGO_URI missing in environment");
  process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("silatacademy");

    console.log("🌱 Connected to silatacademy");

    // 🧹 مسح الداتا القديمة في الكيانات اللي شغالين عليها
    const toClear = [
      "users",
      "playerProfiles",
      "players",
      "coaches",
      "programs",
      "modules",
      "lessons",
      "exams",
      "examRegistrations",
      "examAttempts",
      "practicalEvaluations",
      "finalExamResults",
      "certificates",
      "attendance",
      "beltRankings",
      "events",
      "libraryitems",
      "notifications",
      "trainingtasks",
    ];

    for (const col of toClear) {
      try {
        await db.collection(col).deleteMany({});
        console.log(`✔ cleared ${col}`);
      } catch {
        console.log(`(skip) ${col}`);
      }
    }

    // =========================
    // 1) USERS
    // =========================
    const usersRes = await db.collection("users").insertMany([
      {
        name: "Admin User",
        email: "admin@silatacademy.net",
        nationalId: "10000000000000",
        passwordHash: "dev-only-hash",
        gender: "male",
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Coach Mazen",
        email: "coach.mazen@silatacademy.net",
        nationalId: "20000000000001",
        passwordHash: "dev-only-hash",
        gender: "male",
        role: "instructor",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Coach Ayman",
        email: "coach.ayman@silatacademy.net",
        nationalId: "20000000000002",
        passwordHash: "dev-only-hash",
        gender: "male",
        role: "instructor",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Omar Khaled",
        email: "omar@student.silatacademy.net",
        nationalId: "30000000000001",
        passwordHash: "dev-only-hash",
        gender: "male",
        role: "student",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Ali Hassan",
        email: "ali@student.silatacademy.net",
        nationalId: "30000000000002",
        passwordHash: "dev-only-hash",
        gender: "male",
        role: "student",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Yousef Mahmoud",
        email: "yousef@student.silatacademy.net",
        nationalId: "30000000000003",
        passwordHash: "dev-only-hash",
        gender: "male",
        role: "student",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const [adminId, coachMazenId, coachAymanId, omarId, aliId, yousefId] =
      Object.values(usersRes.insertedIds);

    // =========================
    // 2) COACHES
    // =========================
    await db.collection("coaches").insertMany([
      {
        user: coachMazenId,
        bio: "Head coach and technical director of Silat Academy.",
        specialties: ["fundamentals", "competition prep", "testing"],
        galleryUrls: [],
        achievements: ["National Champion 2018", "Asian Championship Medalist"],
        certifications: [
          "Level 3 Pencak Silat Coach",
          "Sports Science Diploma",
        ],
        name: "Coach Mazen",
        title: "Head Coach",
        specialization: "Technical Director & Head Instructor",
        experience: "15+ years of coaching & competition experience",
        email: "coach.mazen@silatacademy.net",
        phone: "+201000000001",
        gallery: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user: coachAymanId,
        bio: "Assistant coach focused on conditioning and weapons.",
        specialties: ["conditioning", "weapons", "mobility"],
        galleryUrls: [],
        achievements: ["National Team Coach Assistant"],
        certifications: ["Strength & Conditioning Specialist"],
        name: "Coach Ayman",
        title: "Assistant Coach",
        specialization: "Conditioning & Weapons",
        experience: "8+ years experience",
        email: "coach.ayman@silatacademy.net",
        phone: "+201000000002",
        gallery: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // =========================
    // 3) BELT RANKINGS (Rankings.tsx)
    // =========================
    const belts = [
      {
        name: "White Belt",
        color: "#FFFFFF",
        level: "Beginner",
        duration: "3-6 months",
        requirements: [
          "Basic warm-up routine",
          "Familiarity with training etiquette",
          "Knowledge of basic stance and guard",
          "Minimum 20 training hours",
        ],
        testingCriteria:
          "Demonstrate basic stance, guard, and simple footwork drills with control.",
      },
      {
        name: "Yellow Belt",
        color: "#FACC15",
        level: "Beginner",
        duration: "6-9 months",
        requirements: [
          "Jurus 1-2 with clean technique",
          "Application of basic strikes and blocks",
          "Understanding of basic rules and scoring",
          "40+ training hours",
        ],
        testingCriteria:
          "Perform Jurus 1–2, show basic combinations, and demonstrate control in partner drills.",
      },
      {
        name: "Blue Belt",
        color: "#1E40AF",
        level: "Intermediate",
        duration: "12-15 months",
        requirements: [
          "Jurus 3-4 mastery",
          "Intermediate level combinations",
          "Endurance and speed drills",
          "100+ training hours",
        ],
        testingCriteria:
          "Jurus 3–4, intermediate sparring drills, tactical movement and timing.",
      },
      {
        name: "Brown Belt",
        color: "#92400E",
        level: "Advanced",
        duration: "15-18 months",
        requirements: [
          "Advanced forms and variations",
          "Tactical sparring application",
          "Coaching junior students in basics",
        ],
        testingCriteria:
          "Advanced Jurus, controlled full-contact sparring, and teaching demonstration.",
      },
      {
        name: "Red Belt",
        color: "#DC2626",
        level: "Advanced",
        duration: "18-24 months",
        requirements: [
          "High performance in competition or testing",
          "Tactical understanding of offense and defense",
        ],
        testingCriteria:
          "Full exam including theory, physical test, advanced sparring and leadership.",
      },
      {
        name: "Black Belt",
        color: "#000000",
        level: "Mastery",
        duration: "24+ months",
        requirements: [
          "Demonstrated mastery of technical curriculum",
          "Leadership in academy events and seminars",
        ],
        testingCriteria:
          "Comprehensive technical, tactical, and teaching exam with panel evaluation.",
      },
    ];

    await db.collection("beltRankings").insertMany(
      belts.map((b, idx) => ({
        ...b,
        order: idx,
        createdAt: new Date(),
      }))
    );

    // =========================
    // 4) PLAYER PROFILES + PLAYERS
    // =========================
    const playerProfilesRes = await db.collection("playerProfiles").insertMany([
      {
        user: omarId,
        name: "Omar Khaled",
        belt: "Yellow Belt",
        beltColor: "#FACC15",
        age: 15,
        height: "165 cm",
        weight: "55 kg",
        coach: "Coach Mazen",
        trainingStartDate: "2023-01-10",
        trainingYears: 1,
        currentFocus: "Foundations and balance",
        stats: { power: 60, flexibility: 55, endurance: 50, speed: 52 },
        achievements: [],
        health: {
          status: "excellent",
          lastCheckup: "2024-01-01",
          injuries: [],
          nutritionPlan: "General athlete nutrition plan",
          restSchedule: "8 hours sleep / night",
          medicalNotes: "",
        },
        trainingLogs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user: aliId,
        name: "Ali Hassan",
        belt: "White Belt",
        beltColor: "#FFFFFF",
        age: 14,
        height: "160 cm",
        weight: "50 kg",
        coach: "Coach Ayman",
        trainingStartDate: "2023-05-01",
        trainingYears: 0.5,
        currentFocus: "Footwork and coordination",
        stats: { power: 50, flexibility: 48, endurance: 45, speed: 47 },
        achievements: [],
        health: {
          status: "excellent",
          lastCheckup: "2024-02-01",
          injuries: [],
          nutritionPlan: "Basic youth athlete guidelines",
          restSchedule: "8–9 hours sleep",
          medicalNotes: "",
        },
        trainingLogs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user: yousefId,
        name: "Yousef Mahmoud",
        belt: "Blue Belt",
        beltColor: "#1E40AF",
        age: 17,
        height: "173 cm",
        weight: "62 kg",
        coach: "Coach Mazen",
        trainingStartDate: "2022-09-01",
        trainingYears: 2,
        currentFocus: "Competition preparation",
        stats: { power: 72, flexibility: 65, endurance: 70, speed: 68 },
        achievements: [],
        health: {
          status: "good",
          lastCheckup: "2023-12-10",
          injuries: ["Mild ankle sprain (recovered)"],
          nutritionPlan: "Competition prep meal plan",
          restSchedule: "7–8 hours / night",
          medicalNotes: "",
        },
        trainingLogs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await db.collection("players").insertMany([
      {
        user: omarId,
        beltLevel: "yellow",
        beltLabel: "Yellow Belt",
        beltColor: "#FACC15",
        trainingStartDate: "2023-01-10",
        trainingYears: 1,
        stats: { power: 60, flexibility: 55, endurance: 50, speed: 52 },
        currentFocus: "Foundations and balance",
        achievements: [],
        health: {},
        trainingLogs: [],
        exams: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user: aliId,
        beltLevel: "white",
        beltLabel: "White Belt",
        beltColor: "#FFFFFF",
        trainingStartDate: "2023-05-01",
        trainingYears: 0.5,
        stats: { power: 50, flexibility: 48, endurance: 45, speed: 47 },
        currentFocus: "Footwork and coordination",
        achievements: [],
        health: {},
        trainingLogs: [],
        exams: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user: yousefId,
        beltLevel: "blue",
        beltLabel: "Blue Belt",
        beltColor: "#1E40AF",
        trainingStartDate: "2022-09-01",
        trainingYears: 2,
        stats: { power: 72, flexibility: 65, endurance: 70, speed: 68 },
        currentFocus: "Competition preparation",
        achievements: [],
        health: {},
        trainingLogs: [],
        exams: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // =========================
    // 5) PROGRAMS + MODULES + LESSONS
    // =========================
    const programsRes = await db.collection("programs").insertMany([
      {
        level: "beginner",
        title: "Beginner Program",
        description:
          "Build solid foundations in stance, balance, and basic strikes.",
        duration: "3–6 months",
        targetAudience: "New students with no prior experience.",
        classSchedule: "2x weekly • 60–75 min / session",
        learningOutcomes: [
          "Understand basic rules and safety",
          "Perform core stance and guard",
          "Execute basic hand and leg techniques with control",
        ],
        modules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        level: "intermediate",
        title: "Intermediate Program",
        description:
          "Develop combinations, footwork, and tactical thinking for sparring.",
        duration: "9–15 months",
        targetAudience: "Students who passed yellow belt requirements.",
        classSchedule: "3x weekly • 75–90 min / session",
        learningOutcomes: [
          "Build intermediate-level combinations",
          "Improve footwork and timing",
          "Prepare for local competitions",
        ],
        modules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        level: "advanced",
        title: "Advanced Program",
        description:
          "High performance training for advanced exams and competition.",
        duration: "18–24 months",
        targetAudience: "Committed athletes on advanced belt track.",
        classSchedule: "4x weekly • 90 min / session",
        learningOutcomes: [
          "Refine advanced forms and tactics",
          "Perform under pressure in testing and competition",
        ],
        modules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const [beginnerProgramId, intermediateProgramId, advancedProgramId] =
      Object.values(programsRes.insertedIds);

    const modulesRes = await db.collection("modules").insertMany([
      {
        program: beginnerProgramId,
        title: "Beginner Fundamentals",
        objectives: ["Foundations", "Basic positions"],
        anatomyFocus: ["ankles", "knees"],
        repetitionGoal: "3x per week",
        commonMistakes: ["Locked knees", "Poor stance width"],
        lessons: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        program: beginnerProgramId,
        title: "Beginner Striking",
        objectives: ["Basic punches", "Basic kicks"],
        anatomyFocus: ["hips", "shoulders"],
        repetitionGoal: "50 strikes / session",
        commonMistakes: ["Overextending", "Lack of guard"],
        lessons: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const [fundamentalsModuleId, strikingModuleId] = Object.values(
      modulesRes.insertedIds
    );

    const lessonsRes = await db.collection("lessons").insertMany([
      {
        title: "Stance & Guard 101",
        summary: "Learn the basic fighting stance and guard position.",
        videoUrl: "",
        content:
          "Introduction to balance, weight distribution, and guard hand positioning.",
        technicalContent: "",
        medicalContent: "",
        psychologyContent: "",
        resources: [],
        durationMinutes: 30,
        order: 1,
        quiz: [],
        module: fundamentalsModuleId,
        program: beginnerProgramId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Basic Straight Punch",
        summary: "Foundational straight punch mechanics.",
        videoUrl: "",
        content: "Hip rotation, shoulder alignment, and guard recovery.",
        technicalContent: "",
        medicalContent: "",
        psychologyContent: "",
        resources: [],
        durationMinutes: 30,
        order: 2,
        quiz: [],
        module: strikingModuleId,
        program: beginnerProgramId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // =========================
    // 6) EXAMS (basic skeleton)
    // =========================
    await db.collection("exams").insertMany([
      {
        title: "Yellow Belt Theory Exam",
        beltLevel: "yellow",
        description: "Covers basic rules, safety, and foundational techniques.",
        maxScore: 40,
        passMark: 24,
        questions: [],
        attempts: [],
        createdBy: adminId,
        status: "draft",
      },
      {
        title: "Blue Belt Theory Exam",
        beltLevel: "blue",
        description: "Intermediate theory exam.",
        maxScore: 50,
        passMark: 30,
        questions: [],
        attempts: [],
        createdBy: adminId,
        status: "draft",
      },
    ]);

    // =========================
    // 7) EVENTS (لـ Events.tsx)
    // =========================
    await db.collection("events").insertMany([
      {
        title: "Inter-Academy Friendly Tournament",
        type: "tournament",
        description:
          "A friendly competition to give students experience under light-contact conditions.",
        location: "Silat Academy Main Hall",
        startAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endAt: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
        ),
        coverUrl: "",
        isRegistrationOpen: true,
        registeredPlayers: [],
        beltLevel: "All belts",
        capacity: 40,
        instructor: "Coach Mazen",
        status: "upcoming",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Yellow Belt Grading Day",
        type: "grading",
        description: "Formal testing for white belts attempting yellow belt.",
        location: "Silat Academy Dojo 1",
        startAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        endAt: new Date(
          Date.now() + 21 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
        ),
        coverUrl: "",
        isRegistrationOpen: true,
        registeredPlayers: [],
        beltLevel: "White Belt+",
        capacity: 25,
        instructor: "Testing Committee",
        status: "upcoming",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log("✅ Seed completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
