import Busboy from "busboy";
import { httpError } from "../utils/validation.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const avatarUploadBusboy = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    return next(httpError(400, "Content-Type must be multipart/form-data"));
  }

  const busboy = Busboy({
    headers: req.headers,
    limits: { files: 1, fileSize: MAX_FILE_SIZE },
  });

  let finished = false;
  let gotFile = false;

  let originalname = "";
  let mimetype = "";
  let size = 0;
  const chunks = [];

  const bail = (err) => {
    if (finished) return;
    finished = true;
    return next(err);
  };

  busboy.on("file", (fieldname, file, info, encoding, legacyMimetype) => {
    gotFile = true;

    // Busboy v1: (fieldname, file, info)
    // Busboy v0: (fieldname, file, filename, encoding, mimetype)
    if (typeof info === "object" && info) {
      originalname = info.filename || "";
      mimetype = info.mimeType || "";
    } else {
      originalname = info || "";
      mimetype = legacyMimetype || "";
    }

    if (fieldname !== "avatar") {
      file.resume();
      return bail(httpError(400, 'Expected field name "avatar"'));
    }

    if (!ALLOWED_MIME_TYPES.has(mimetype)) {
      file.resume();
      return bail(httpError(400, "Only jpeg, png or webp images are allowed"));
    }

    file.on("data", (data) => {
      size += data.length;
      chunks.push(data);
    });

    file.on("limit", () => {
      file.resume();
      return bail(httpError(413, "Image exceeds max size (5MB)"));
    });

    file.on("error", (err) =>
      bail(httpError(400, "Upload stream error", err?.message))
    );
  });

  busboy.on("finish", () => {
    if (finished) return;

    if (!gotFile) {
      return bail(httpError(400, "Avatar image is required"));
    }

    req.file = {
      fieldname: "avatar",
      originalname,
      mimetype,
      size,
      buffer: Buffer.concat(chunks),
    };

    finished = true;
    next();
  });

  busboy.on("error", (err) =>
    bail(httpError(400, "Invalid multipart form data", err?.message))
  );

  // ✅ Cloud Functions: feed buffered body
  // Google’s own sample uses busboy.end(req.rawBody) in Functions environment. :contentReference[oaicite:4]{index=4}
  if (req.rawBody) {
    busboy.end(req.rawBody);
  } else {
    // fallback لو بيئة Express عادية
    req.pipe(busboy);
  }
};
