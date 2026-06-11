/**
 * Shared helper functions for Cloud Functions.
 * DRY auth verification and active-project counting.
 */

const functions = require("firebase-functions");

/**
 * Verify the caller is authenticated. Throws if not.
 * @returns {{ uid: string }}
 */
function verifyAuthenticated(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
  return { uid: context.auth.uid };
}

/**
 * Verify the caller is an authenticated freelancer. Throws if not.
 * @returns {{ uid: string, userData: object }}
 */
async function verifyFreelancer(context, db) {
  const { uid } = verifyAuthenticated(context);

  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      "User profile not found."
    );
  }

  const userData = userDoc.data();
  if (userData.role !== "freelancer") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only freelancers can perform this action."
    );
  }

  return { uid, userData };
}

/**
 * Count active (non-completed) projects for a freelancer.
 * @returns {number}
 */
async function getActiveProjectCount(uid, db) {
  const snapshot = await db
    .collection("projects")
    .where("freelancerId", "==", uid)
    .where("status", "!=", "completed")
    .get();

  return snapshot.size;
}

module.exports = { verifyAuthenticated, verifyFreelancer, getActiveProjectCount };
