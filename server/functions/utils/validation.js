import { ObjectId } from "mongodb";

export const isObjectId = (value) => Boolean(value) && ObjectId.isValid(value);

export const toObjectId = (value) =>
  isObjectId(value) ? new ObjectId(value) : null;

export const assertObjectId = (value, fieldName = "id") => {
  const id = toObjectId(value);
  if (!id) {
    throw httpError(400, `${fieldName} is invalid`);
  }
  return id;
};

export const httpError = (status, message, details) => {
  const err = new Error(message);
  err.statusCode = status;
  if (details) err.details = details;
  return err;
};

export const asNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};
