/**
 * createProject — HTTPS Callable Cloud Function
 *
 * Creates a new project document in Firestore after verifying:
 * 1. Caller is authenticated
 * 2. Caller is a freelancer
 * 3. Freelancer has fewer than 10 active projects
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const { verifyFreelancer, getActiveProjectCount } = require("./helpers");

const db = admin.firestore();

const createProject = functions.https.onCall(async (data, context) => {
  // 1. Verify freelancer role
  const { uid } = await verifyFreelancer(context, db);

  // 2. Check active project count
  const activeCount = await getActiveProjectCount(uid, db);
  if (activeCount >= 10) {
    throw new functions.https.HttpsError(
      "resource-exhausted",
      "Freelancers can only have up to 10 active projects."
    );
  }

  // 3. Validate incoming data
  const { title, price, fileType, fileS3Key, clientEmail, paymentInstructions } = data;
  if (!title || price === undefined || !fileType || !fileS3Key) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required project fields: title, price, fileType, fileS3Key."
    );
  }

  // 4. Create the project document
  const projectsRef = db.collection("projects");
  const newProjectRef = projectsRef.doc();
  const accessToken = uuidv4(); // Generate secure token
  
  const projectData = {
    projectId: newProjectRef.id,
    freelancerId: uid,
    clientId: "",
    title: title,
    price: Number(price),
    status: "pending_preview",
    fileType: fileType,
    fileS3Key: fileS3Key,
    receiptImageUrl: "",
    accessToken: accessToken,
    clientEmail: clientEmail || "",
    paymentInstructions: paymentInstructions || "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await newProjectRef.set(projectData);

  return { projectId: newProjectRef.id, accessToken };
});

module.exports = { createProject };
