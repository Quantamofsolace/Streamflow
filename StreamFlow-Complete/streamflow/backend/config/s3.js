// backend/config/s3.js
// Creates the S3 client.
// On EC2, the IAM Role attached to the instance provides credentials
// automatically — no keys needed in code.

const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  // No credentials needed when running on EC2 with an IAM Role.
  // The AWS SDK reads the role from the instance metadata service.
});

module.exports = s3;
