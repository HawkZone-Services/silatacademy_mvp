import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import { fromEnv } from "@aws-sdk/credential-provider-env";

// Initialize S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: fromEnv(), // Using environment credentials
});

// Configure multer-s3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "thisability",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});

export { upload };
