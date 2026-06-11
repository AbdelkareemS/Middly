/**
 * Middly — Cloud Functions Entry Point
 *
 * Thin re-export hub. Each function is implemented in its own module
 * for maintainability. Firebase Admin is initialized once here.
 */

const admin = require("firebase-admin");
admin.initializeApp();

// Import individual functions
const { createProject } = require("./createProject");
const { generateUploadUrl } = require("./generateUploadUrl");
const { getPreviewLink } = require("./getPreviewLink");
const { getDownloadLink } = require("./getDownloadLink");
const { deleteS3ProjectAsset } = require("./deleteS3ProjectAsset");
const { getGuestPreview, getGuestDownload, submitReceipt } = require("./guestFunctions");

// Export all functions
exports.createProject = createProject;
exports.generateUploadUrl = generateUploadUrl;
exports.getPreviewLink = getPreviewLink;
exports.getDownloadLink = getDownloadLink;
exports.deleteS3ProjectAsset = deleteS3ProjectAsset;

// Guest unauthenticated functions
exports.getGuestPreview = getGuestPreview;
exports.getGuestDownload = getGuestDownload;
exports.submitReceipt = submitReceipt;
