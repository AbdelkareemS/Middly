/**
 * getDownloadLink — HTTPS Callable Cloud Function
 *
 * Generates a 15-minute presigned GET URL with Content-Disposition: attachment
 * to force the browser to download the file.
 *
 * Strict access control:
 * - Only the assigned clientId may call this
 * - Project status must be 'approved' or 'completed'
 * - Does NOT auto-mark the project as completed (separate action required)
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3, BUCKET } = require("./s3Client");
const { verifyAuthenticated } = require("./helpers");

const db = admin.firestore();

const getDownloadLink = functions.https.onCall(async (data, context) => {
  // 1. Verify authenticated
  const { uid } = verifyAuthenticated(context);

  // 2. Validate input
  const { projectId } = data;
  if (!projectId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required field: projectId."
    );
  }

  // 3. Fetch the project document
  const projectDoc = await db.collection("projects").doc(projectId).get();
  if (!projectDoc.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      "Project not found."
    );
  }

  const project = projectDoc.data();

  // 4. Verify the project status allows download
  if (project.status !== "approved" && project.status !== "completed") {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "This project has not been approved for download yet. Current status: " + project.status
    );
  }

  // 5. Verify the caller is the assigned client
  if (project.clientId !== uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only the assigned client can download this file."
    );
  }

  // 6. Extract the original filename from the S3 key
  // S3 key format: projects/{uid}/{uuid}_{originalFileName}
  const keyParts = project.fileS3Key.split("/");
  const fileNameWithUuid = keyParts[keyParts.length - 1] || "download";
  // Remove the uuid_ prefix to get the original filename
  const underscoreIndex = fileNameWithUuid.indexOf("_");
  const originalFileName =
    underscoreIndex !== -1
      ? fileNameWithUuid.substring(underscoreIndex + 1)
      : fileNameWithUuid;

  // 7. Generate presigned GET URL (15 minutes, attachment disposition)
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: project.fileS3Key,
    ResponseContentDisposition: `attachment; filename="${originalFileName}"`,
  });

  try {
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 minutes

    return { downloadUrl };
  } catch (error) {
    functions.logger.error("Failed to generate presigned download URL:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate download link. Please try again."
    );
  }
});

module.exports = { getDownloadLink };
