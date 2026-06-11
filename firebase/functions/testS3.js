require("dotenv").config();
const { s3, BUCKET } = require("./s3Client");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

async function test() {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: "test.txt",
      ContentType: "text/plain",
    });
    console.log("Generating URL...");
    const url = await getSignedUrl(s3, command, { expiresIn: 600 });
    console.log("Success:", url);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
