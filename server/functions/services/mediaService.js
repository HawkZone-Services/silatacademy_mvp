import { bucket } from "../config/firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";
import Media from "../models/Media.js";
import { optimizeGalleryImage } from "./imageService.js";
import { deleteAvatarByUrl } from "./storageService.js"; // reuse helper

export const uploadGalleryImage = async ({
  userId,
  buffer,
  visibility = "public",
  uploadedBy,
}) => {
  const optimized = await optimizeGalleryImage(buffer);

  const path = `gallery/${userId}/${uuidv4()}.webp`;
  const file = bucket.file(path);

  await file.save(optimized, {
    metadata: { contentType: "image/webp" },
    resumable: false,
  });

  await file.makePublic();

  const media = await Media.create({
    user: userId,
    url: file.publicUrl(),
    visibility,
    uploadedBy,
    category: "gallery",
  });

  return media;
};

export const deleteMedia = async (media) => {
  // Best effort delete from Firebase
  if (media.url) {
    await deleteAvatarByUrl(media.url);
  }

  await Media.deleteOne({ _id: media._id });
};
