/**
 * deleteS3ProjectAsset — HTTPS Callable Cloud Function
 *
 * Deletes the file from Amazon S3 and removes the project document from Firestore.
 * This frees up the freelancer's 10-project quota.
 *
 * Only the project's freelancerId can call this function.
 * Uses Admin SDK to bypass Firestore security rules (which deny client-side delete).
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3, BUCKET } = require("./s3Client");
const { verifyAuthenticated } = require("./helpers");

const db = admin.firestore();

const deleteS3ProjectAsset = functions.https.onCall(async (data, context) => {
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

  // 4. Verify the caller is the freelancer who owns this project
  if (project.freelancerId !== uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only the project owner can delete this project."
    );
  }

  // 5. Delete the file from S3
  if (project.fileS3Key) {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: project.fileS3Key,
    });

    try {
      await s3.send(command);
      functions.logger.info(
        `S3 file deleted: ${project.fileS3Key} for project ${projectId}`
      );
    } catch (error) {
      functions.logger.error("Failed to delete S3 file:", error);
      // Continue to delete the Firestore doc even if S3 deletion fails.
      // The file can be cleaned up manually or via a scheduled function later.
    }
  }

  // 6. Delete the project document from Firestore (Admin SDK bypasses rules)
  try {
    await db.collection("projects").doc(projectId).delete();
    functions.logger.info(`Firestore project deleted: ${projectId}`);
  } catch (error) {
    functions.logger.error("Failed to delete Firestore project document:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete project record. Please try again."
    );
  }

  return { success: true };
});

module.exports = { deleteS3ProjectAsset };
