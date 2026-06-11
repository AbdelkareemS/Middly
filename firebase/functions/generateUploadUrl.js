/**
 * generateUploadUrl — HTTPS Callable Cloud Function
 *
 * Generates a short-lived (10 min) presigned PUT URL so the freelancer
 * can upload a file directly from the browser to a private S3 bucket.
 *
 * AWS credentials never leave the server.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const { s3, BUCKET, MAX_FILE_SIZE_BYTES } = require("./s3Client");
const { verifyFreelancer, getActiveProjectCount } = require("./helpers");

const db = admin.firestore();

const generateUploadUrl = functions.https.onCall(async (data, context) => {
  // 1. Verify freelancer role
  const { uid } = await verifyFreelancer(context, db);

  // 2. Re-check the 10-project limit (defence in depth)
  const activeCount = await getActiveProjectCount(uid, db);
  if (activeCount >= 10) {
    throw new functions.https.HttpsError(
      "resource-exhausted",
      "You have reached the maximum of 10 active projects. Complete or delete existing projects first."
    );
  }

  // 3. Validate input
  const { fileName, contentType } = data;
  if (!fileName || !contentType) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: fileName, contentType."
    );
  }

  // 4. Generate a unique S3 key scoped to the user
  const uniqueId = uuidv4();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileS3Key = `projects/${uid}/${uniqueId}_${sanitizedFileName}`;

  // 5. Create presigned PUT URL (10 minutes expiry)
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileS3Key,
    ContentType: contentType,
  });

  try {
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 }); // 10 minutes

    return {
      uploadUrl,
      fileS3Key,
      maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
    };
  } catch (error) {
    functions.logger.error("Failed to generate presigned upload URL:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate upload URL. Please try again."
    );
  }
});

module.exports = { generateUploadUrl };
