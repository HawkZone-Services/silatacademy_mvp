import AWS from "aws-sdk";

export async function generatePresignedUrl({
  bucket,
  key,
  contentType,
  region,
}) {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region,
    signatureVersion: "v4",
  });

  const params = {
    Bucket: bucket,
    Key: key,
    Expires: 300, // 5 دقائق
    ContentType: contentType,
    ServerSideEncryption: "AES256",
  };

  const signedUrl = await s3.getSignedUrlPromise("putObject", params);
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return { signedUrl, url };
}
