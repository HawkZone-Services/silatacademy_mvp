import { S3Client } from "@aws-sdk/client-s3";
import { defineSecret } from "firebase-functions/params";
import dotenv from "dotenv";

dotenv.config();

// Detect Firebase environment
const isFirebase =
  process.env.FUNCTIONS_EMULATOR === "true" || !!process.env.K_SERVICE;

// Unified secrets config
const secrets = {
  AWS_REGION: isFirebase ? defineSecret("AWS_REGION") : process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: isFirebase
    ? defineSecret("AWS_ACCESS_KEY_ID")
    : process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: isFirebase
    ? defineSecret("AWS_SECRET_ACCESS_KEY")
    : process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: isFirebase
    ? defineSecret("AWS_S3_BUCKET")
    : process.env.AWS_S3_BUCKET,
};

// Resolve secret values whether from Firebase or env
const resolveSecret = async (secret) => {
  if (typeof secret === "string") return secret;
  return await secret.value();
};

// Centralized config resolver
const resolveConfig = async () => {
  try {
    const [region, accessKeyId, secretAccessKey, bucketName] =
      await Promise.all([
        resolveSecret(secrets.AWS_REGION),
        resolveSecret(secrets.AWS_ACCESS_KEY_ID),
        resolveSecret(secrets.AWS_SECRET_ACCESS_KEY),
        resolveSecret(secrets.AWS_S3_BUCKET),
      ]);

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error("Missing one or more required AWS configurations.");
    }

    return { region, accessKeyId, secretAccessKey, bucketName };
  } catch (err) {
    console.error("AWS Config Resolution Error:", err);
    throw new Error("Could not resolve AWS configuration.");
  }
};

// Export reusable S3 client + bucket info
export const getS3Instance = async () => {
  try {
    const { region, accessKeyId, secretAccessKey, bucketName } =
      await resolveConfig();

    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    return { s3, bucketName };
  } catch (error) {
    console.error("S3 Initialization Error:", error);
    throw error;
  }
};
