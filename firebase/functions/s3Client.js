/**
 * Shared S3 Client for all Cloud Functions.
 *
 * AWS credentials are loaded from Firebase Functions config (production)
 * or environment variables (emulator/local development).
 *
 * To set credentials for deployment, run:
 *   firebase functions:config:set \
 *     aws.access_key_id="AKIA..." \
 *     aws.secret_access_key="YOUR_SECRET" \
 *     aws.s3_bucket_name="middly-bucket" \
 *     aws.region="eu-central-1" \
 *     aws.max_file_size_bytes="104857600"
 *
 * For local emulator, create a .runtimeconfig.json file in the functions/ directory:
 *   {
 *     "aws": {
 *       "access_key_id": "AKIA...",
 *       "secret_access_key": "YOUR_SECRET",
 *       "s3_bucket_name": "middly-bucket",
 *       "region": "eu-central-1",
 *       "max_file_size_bytes": "104857600"
 *     }
 *   }
 */

const { S3Client } = require("@aws-sdk/client-s3");
const functions = require("firebase-functions");

// Resolve config: Firebase Functions config (production) > env vars (fallback)
function getConfig(key, fallback) {
  try {
    const config = functions.config();
    const keys = key.split(".");
    let value = config;
    for (const k of keys) {
      value = value[k];
    }
    if (value) return value;
  } catch (_e) {
    // config not available (e.g. during local testing outside emulator)
  }
  return process.env[key.replace(/\./g, "_").toUpperCase()] || fallback;
}

const AWS_REGION = getConfig("aws.region", "eu-central-1");
const AWS_ACCESS_KEY_ID = getConfig("aws.access_key_id", "");
const AWS_SECRET_ACCESS_KEY = getConfig("aws.secret_access_key", "");
const BUCKET = getConfig("aws.s3_bucket_name", "");

// Configurable max file size in bytes (default: 100 MB)
const MAX_FILE_SIZE_BYTES = parseInt(
  getConfig("aws.max_file_size_bytes", "104857600"),
  10
);

const s3 = new S3Client({
  region: AWS_REGION || "eu-central-1",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || "MISSING_KEY",
    secretAccessKey: AWS_SECRET_ACCESS_KEY || "MISSING_SECRET",
  },
});

module.exports = { s3, BUCKET, MAX_FILE_SIZE_BYTES };
