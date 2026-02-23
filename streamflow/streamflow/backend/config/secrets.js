// backend/config/secrets.js
// Fetches secrets from AWS Secrets Manager.
// Caches the result in memory to avoid repeated API calls.
// EC2 instance must have IAM role with secretsmanager:GetSecretValue permission.

const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });
const cache  = {};

async function getSecret(secretName) {
  if (cache[secretName]) return cache[secretName];

  const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
  const value    = response.SecretString;
  cache[secretName] = value;
  return value;
}

module.exports = { getSecret };
