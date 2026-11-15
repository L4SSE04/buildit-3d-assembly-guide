// Signs the test scripts in as the first admin (ADMIN_EMAILS in .env), straight through the database, no email needed.
import 'dotenv/config';
import { userByEmail, createSession } from '../server/db.js';

export function adminSession() {
  const email = (process.env.ADMIN_EMAILS || '').split(',')[0].trim().toLowerCase();
  if (!email) { console.log('Set ADMIN_EMAILS in .env (your own email) so the scripts can sign in.'); process.exit(1); }
  return { name: '__Host-bi_session', value: createSession(userByEmail(email, true).id) };
}
