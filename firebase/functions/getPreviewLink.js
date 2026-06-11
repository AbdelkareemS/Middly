/**
 * getPreviewLink — HTTPS Callable Cloud Function
 *
 * Generates a very short-lived (3 min) presigned GET URL for file previewing.
 * Content-Disposition is set to 'inline' to prevent direct download.
 * Only the project's freelancerId or clientId may request this.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3, BUCKET } = require("./s3Client");
const { verifyAuthenticated } = require("./helpers");

const db = admin.firestore();

const getPreviewLink = functions.https.onCall(async (data, context) => {
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

  // 4. Verify the caller is either the freelancer or the assigned client
  if (project.freelancerId !== uid && project.clientId !== uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You do not have access to preview this project."
    );
  }

  // 5. Generate presigned GET URL (3 minutes, inline disposition)
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: project.fileS3Key,
    ResponseContentDisposition: "inline",
  });

  try {
    const previewUrl = await getSignedUrl(s3, command, { expiresIn: 180 }); // 3 minutes

    return {
      previewUrl,
      fileType: project.fileType,
      title: project.title,
    };
  } catch (error) {
    functions.logger.error("Failed to generate presigned preview URL:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate preview link. Please try again."
    );
  }
});

module.exports = { getPreviewLink };
