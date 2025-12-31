import sharp from "sharp";

export const optimizeAvatarImage = async ({ buffer }) => {
  return sharp(buffer)
    .resize(256, 256, {
      fit: "cover",
      position: "center",
    })
    .toFormat("webp", {
      quality: 70, // 👈 توازن ممتاز
      effort: 4, // سرعة كويسة
    })
    .toBuffer();
};

export const optimizeGalleryImage = async (buffer) => {
  return sharp(buffer)
    .resize(1280, 1280, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFormat("webp", {
      quality: 75,
      effort: 4,
    })
    .toBuffer();
};
