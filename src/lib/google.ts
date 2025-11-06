import { google } from 'googleapis';

export const getGoogleAuth = () => {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!email || !key) throw new Error('Missing Google service account envs');
  return new google.auth.JWT({
    email,
    key,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
  });
};

export const sheetsClient = (auth?: any) =>
  google.sheets({ version: 'v4', auth: auth ?? getGoogleAuth() });
