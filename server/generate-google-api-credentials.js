import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('Generating Google API credentials...');

const credentials = {
  type: "service_account",
  project_id: "e-commerce-anime",
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com"
}

try {
  fs.writeFileSync(
    'google-api-credentials.json',
    JSON.stringify(credentials, null, 2)
  );
  console.log('Google API credentials generated successfully');
} catch (error) {
  console.error('Error generating credentials:', error);
  process.exit(1);
}