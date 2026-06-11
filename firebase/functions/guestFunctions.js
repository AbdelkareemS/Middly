/**
 * guestFunctions.js — Unauthenticated HTTPS Callables
 *
 * Functions for clients accessing via the public `/view/:projectId?token=...` URL.
 * Validation is strictly based on comparing the provided token with the project's accessToken.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3, BUCKET } = require("./s3Client");
const { v4: uuidv4 } = require("uuid");

const db = admin.firestore();

// Helper to verify project and token
async function verifyProjectToken(projectId, token) {
  if (!projectId || !token) {
    throw new functions.https.HttpsError("invalid-argument", "Missing projectId or token");
  }

  const projectDoc = await db.collection("projects").doc(projectId).get();
  if (!projectDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Project not found.");
  }

  const project = projectDoc.data();
  if (project.accessToken !== token) {
    throw new functions.https.HttpsError("permission-denied", "Invalid access token.");
  }

  return { projectDoc, project };
}

// 1. getGuestPreview
exports.getGuestPreview = functions.https.onCall(async (data) => {
  const { projectId, token } = data;
  const { project } = await verifyProjectToken(projectId, token);

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: project.fileS3Key,
    ResponseContentDisposition: "inline",
  });

  try {
    const previewUrl = await getSignedUrl(s3, command, { expiresIn: 180 }); // 3 mins

    return {
      previewUrl,
      fileType: project.fileType,
      title: project.title,
      price: project.price,
      status: project.status,
      paymentInstructions: project.paymentInstructions,
      clientEmail: project.clientEmail,
    };
  } catch (error) {
    functions.logger.error("Failed to generate presigned guest preview URL:", error);
    throw new functions.https.HttpsError("internal", "Failed to generate preview link.");
  }
});

// 2. getGuestDownload
exports.getGuestDownload = functions.https.onCall(async (data) => {
  const { projectId, token } = data;
  const { project } = await verifyProjectToken(projectId, token);

  if (project.status !== "approved" && project.status !== "completed") {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "This project has not been approved for download yet."
    );
  }

  const keyParts = project.fileS3Key.split("/");
  const fileNameWithUuid = keyParts[keyParts.length - 1] || "download";
  const underscoreIndex = fileNameWithUuid.indexOf("_");
  const originalFileName =
    underscoreIndex !== -1 ? fileNameWithUuid.substring(underscoreIndex + 1) : fileNameWithUuid;

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: project.fileS3Key,
    ResponseContentDisposition: `attachment; filename="${originalFileName}"`,
  });

  try {
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 mins
    return { downloadUrl };
  } catch (error) {
    functions.logger.error("Failed to generate guest download URL:", error);
    throw new functions.https.HttpsError("internal", "Failed to generate download link.");
  }
});

// 3. submitReceipt (Uploads base64 image to Firebase Storage via Admin SDK)
exports.submitReceipt = functions.https.onCall(async (data) => {
  const { projectId, token, base64Image } = data;
  const { project, projectDoc } = await verifyProjectToken(projectId, token);

  if (!base64Image) {
    throw new functions.https.HttpsError("invalid-argument", "Missing receipt image.");
  }

  try {
    // 1. Decode base64
    const mimeMatch = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!mimeMatch) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid image format.");
    }
    const contentType = mimeMatch[1];
    const imageBuffer = Buffer.from(mimeMatch[2], "base64");

    // 2. Upload to Firebase Storage
    const bucket = admin.storage().bucket("middly-e3454.firebasestorage.app");
    const filePath = `receipts/${projectId}_${Date.now()}.jpg`;
    const file = bucket.file(filePath);
    const downloadToken = uuidv4();

    await file.save(imageBuffer, {
      metadata: { 
        contentType,
        metadata: {
          firebaseStorageDownloadTokens: downloadToken
        }
      },
    });

    const receiptImageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;

    // 3. Update Firestore status
    await projectDoc.ref.update({
      receiptImageUrl,
      status: "receipt_uploaded",
    });

    return { success: true, receiptImageUrl };
  } catch (error) {
    functions.logger.error("Failed to upload receipt:", error);
    throw new functions.https.HttpsError("internal", "Failed to process receipt upload.");
  }
});
