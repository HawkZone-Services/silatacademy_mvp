import { ObjectId } from "mongodb";
import { getDb } from "../utils/mongodb.js";

const beltColorMap = {
  white: "#ffffff",
  yellow: "#f5e642",
  blue: "#1e90ff",
  brown: "#8b4513",
  red: "#ff4d4f",
  black: "#000000",
};

const normalizeBeltLevel = (belt = "") => {
  const raw = String(belt || "").trim().toLowerCase();
  if (!raw) return null;
  const cleaned = raw.replace(/\s*belt$/, "");
  const allowed = ["white", "yellow", "blue", "brown", "red", "black"];
  return allowed.includes(cleaned) ? cleaned : null;
};

const beltLabelFor = (level) => {
  if (!level) return null;
  return `${level.charAt(0).toUpperCase()}${level.slice(1)} Belt`;
};

const migrateProfile = async (db, profile) => {
  const users = db.collection("users");
  const players = db.collection("players");

  if (!profile?.user) {
    return { status: "skipped", reason: "missing user ref", profileId: profile?._id };
  }

  const userId = profile.user instanceof ObjectId ? profile.user : new ObjectId(profile.user);
  const user = await users.findOne({ _id: userId });
  if (!user) {
    return { status: "skipped", reason: "user not found", profileId: profile?._id, userId };
  }

  const existing = await players.findOne({ user: userId });

  const beltLevel = normalizeBeltLevel(profile.belt) || existing?.beltLevel || "white";
  const beltLabel = profile.belt || existing?.beltLabel || beltLabelFor(beltLevel);
  const beltColor = profile.beltColor || existing?.beltColor || beltColorMap[beltLevel] || beltColorMap.white;

  const profileFields = {
    beltLevel,
    beltLabel,
    beltColor,
    age: profile.age ?? existing?.age ?? null,
    height: profile.height ?? existing?.height ?? null,
    weight: profile.weight ?? existing?.weight ?? null,
    coach: profile.coach ?? existing?.coach ?? null,
    trainingStartDate: profile.trainingStartDate ?? existing?.trainingStartDate ?? null,
    trainingYears: profile.trainingYears ?? existing?.trainingYears ?? 0,
    stats: profile.stats ?? existing?.stats ?? null,
    currentFocus: profile.currentFocus ?? existing?.currentFocus ?? null,
    achievements: profile.achievements ?? existing?.achievements ?? [],
    health: profile.health ?? existing?.health ?? null,
    trainingLogs: profile.trainingLogs ?? existing?.trainingLogs ?? [],
    updatedAt: new Date(),
  };

  if (existing) {
    await players.updateOne({ _id: existing._id }, { $set: profileFields });
    return { status: "updated", playerId: existing._id, userId };
  }

  const insertDoc = {
    user: userId,
    ...profileFields,
    exams: [],
    createdAt: new Date(),
  };
  const insert = await players.insertOne(insertDoc);
  return { status: "created", playerId: insert.insertedId, userId };
};

const run = async () => {
  const db = await getDb();
  const profiles = await db.collection("playerProfiles").find({}).toArray();

  let created = 0;
  let updated = 0;
  const skipped = [];

  for (const profile of profiles) {
    const result = await migrateProfile(db, profile);
    if (result.status === "created") created += 1;
    if (result.status === "updated") updated += 1;
    if (result.status === "skipped") skipped.push(result);
  }

  console.log({
    processed: profiles.length,
    created,
    updated,
    skipped: skipped.length,
    skippedDetails: skipped,
  });
};

run()
  .then(() => {
    console.log("Migration script completed.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed", err);
    process.exit(1);
  });
