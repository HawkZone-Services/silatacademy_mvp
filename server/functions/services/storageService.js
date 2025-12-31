import { bucket } from "../config/firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/* =====================================
   Helpers
===================================== */
const getFilePathFromPublicUrl = (url) => {
  try {
    const decoded = decodeURIComponent(url);

    // Firebase token URL
    const match = decoded.match(/\/o\/(.+)\?/);
    if (match?.[1]) return match[1];

    // publicUrl fallback
    const parts = decoded.split("/");
    const index = parts.indexOf("avatars");
    if (index === -1) return null;

    return parts.slice(index).join("/");
  } catch {
    return null;
  }
};

/* =====================================
   Delete old avatar
===================================== */
export const deleteAvatarByUrl = async (avatarUrl) => {
  if (!avatarUrl) return;

  const filePath = getFilePathFromPublicUrl(avatarUrl);
  if (!filePath) return;

  try {
    await bucket.file(filePath).delete({ ignoreNotFound: true });
  } catch (err) {
    console.error("Avatar delete failed:", err);
  }
};

/* =====================================
   Image optimization
===================================== */
const optimizeAvatarImage = async (buffer) => {
  return sharp(buffer)
    .resize(256, 256, {
      fit: "cover",
      position: "center",
    })
    .toFormat("webp", {
      quality: 70, // 👈 توازن ممتاز (حجم صغير + جودة كويسة)
      effort: 4,
    })
    .toBuffer();
};

/* =====================================
   Upload avatar
===================================== */
export const uploadAvatar = async ({
  fileBuffer,
  mimeType,
  fileSize,
  userId,
  oldAvatarUrl,
}) => {
  if (!fileBuffer) throw new Error("Missing file buffer");
  if (!userId) throw new Error("Missing userId");

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error("Unsupported image type");
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("Image exceeds max size (5MB)");
  }

  // 🔥 delete old avatar first
  await deleteAvatarByUrl(oldAvatarUrl);

  // 🔥 optimize image (resize + compress)
  const optimizedBuffer = await optimizeAvatarImage(fileBuffer);

  const filePath = `avatars/${userId}/${uuidv4()}.webp`;
  const file = bucket.file(filePath);

  await file.save(optimizedBuffer, {
    metadata: {
      contentType: "image/webp",
      metadata: {
        uploadedBy: userId,
        purpose: "avatar",
      },
    },
    resumable: false,
  });

  await file.makePublic();

  return file.publicUrl();
};
