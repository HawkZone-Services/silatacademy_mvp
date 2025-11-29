import mongoose from "mongoose";
import dotenv from "dotenv";
import Program from "../models/Program.js";
import Module from "../models/Module.js";

dotenv.config();

const programsMock = [
  {
    title: "Beginner Program",
    level: "Beginner",
    duration: "3-6 months",
    description:
      "Foundation building with basic stances, Jurus 1-3, coordination drills, and breathing techniques",
    targetAudience: "Ages 8+, No prior experience required",
    classSchedule: "Mon/Wed/Fri: 5:00 PM - 6:30 PM",
    modules: [
      {
        title: "Month 1-2: Foundations",
        topics: [
          "Fundamental stances & postures",
          "Basic footwork patterns",
          "Respect, discipline, and etiquette",
          "Body awareness and coordination",
        ],
      },
      {
        title: "Month 3-4: Jurus Introduction",
        topics: [
          "Jurus 1: Basic movement patterns",
          "Jurus 2: Directional changes",
          "Basic blocking techniques",
          "Breathing and rhythm basics",
        ],
      },
      {
        title: "Month 5-6: Integration",
        topics: [
          "Jurus 3: Combining techniques",
          "Partner coordination drills",
          "Flexibility training",
          "Preparation for yellow belt test",
        ],
      },
    ],
    learningOutcomes: [
      "Proper stance and posture",
      "Basic self-defense awareness",
      "Improved coordination and flexibility",
      "Understanding of Silat principles",
    ],
  },

  {
    title: "Intermediate Program",
    level: "Intermediate",
    duration: "6-12 months",
    description:
      "Advanced combinations, sparring introduction, Jurus 4-7, and rhythm mastery",
    targetAudience: "Yellow/Green belt holders",
    classSchedule: "Mon/Wed/Fri: 6:45 PM - 8:15 PM",
    modules: [
      {
        title: "Months 1-3: Technique Expansion",
        topics: [
          "Jurus 4-5: Advanced patterns",
          "Combination techniques",
          "Elbow and knee strikes",
          "Defensive movements",
        ],
      },
      {
        title: "Months 4-6: Combat Introduction",
        topics: [
          "Controlled sparring basics",
          "Attack-defense sequences",
          "Timing and distance management",
          "Speed and agility drills",
        ],
      },
      {
        title: "Months 7-12: Mastery Development",
        topics: [
          "Jurus 6-7: Complex movements",
          "Free-form sparring practice",
          "Breathing control under pressure",
          "Competition preparation (optional)",
        ],
      },
    ],
    learningOutcomes: [
      "Complete Jurus 4-7 proficiency",
      "Effective sparring techniques",
      "Enhanced speed and power",
      "Strategic thinking in combat",
    ],
  },

  {
    title: "Advanced Program",
    level: "Advanced",
    duration: "12+ months",
    description:
      "Complete mastery with weapons training, philosophy, competition prep, and teaching skills",
    targetAudience: "Blue/Brown belt holders",
    classSchedule: "Tue/Thu: 7:00 PM - 9:00 PM, Sat: 9:00 AM - 12:00 PM",
    modules: [
      {
        title: "Phase 1: Weapons Mastery",
        topics: [
          "Staff (Tongkat) techniques",
          "Kerambit forms and application",
          "Improvised weapon awareness",
          "Weapon vs. empty hand",
        ],
      },
      {
        title: "Phase 2: Philosophy & Ethics",
        topics: [
          "Silat philosophy deep dive",
          "Cultural and historical context",
          "Ethics of martial arts",
          "Spiritual aspects of training",
        ],
      },
      {
        title: "Phase 3: Competition & Teaching",
        topics: [
          "Competition strategy and prep",
          "Tournament experience",
          "Teaching methodology",
          "Instructor development training",
        ],
      },
    ],
    learningOutcomes: [
      "Weapon proficiency",
      "Deep philosophical understanding",
      "Competition readiness",
      "Teaching capabilities",
    ],
  },
];

async function seedPrograms() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb+srv://admin:P%40%24%24w0rd%40M%40zen%402025@cluster0.dvvixke.mongodb.net/silatacademy?retryWrites=true&w=majority"
    );

    console.log("🔥 Dropping existing Programs & Modules...");
    await Program.deleteMany({});
    await Module.deleteMany({});

    console.log("🌱 Seeding Programs & Modules...");
    for (const program of programsMock) {
      const createdProgram = await Program.create({
        title: program.title,
        level: program.level,
        duration: program.duration,
        description: program.description,
        targetAudience: program.targetAudience,
        classSchedule: program.classSchedule,
        learningOutcomes: program.learningOutcomes,
      });

      for (const mod of program.modules) {
        await Module.create({
          program: createdProgram._id,
          title: mod.title,
          topics: mod.topics,
        });
      }

      console.log(`✅ Program seeded: ${createdProgram.title}`);
    }

    console.log("🎉 SEED COMPLETE");
    process.exit(0);
  } catch (error) {
    console.error("❌ SEED ERROR:", error);
    process.exit(1);
  }
}

seedPrograms();
