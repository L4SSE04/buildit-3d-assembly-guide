// The one email early-access sign-ups were promised: "scanning is open". Sent once per account (table notices),
// only to accounts that could not scan before. Run it after setting SCAN_ACCESS=everyone:
//   node scripts/notify-scan-open.mjs          (shows who would get it)
//   node scripts/notify-scan-open.mjs --send   (sends it; needs SMTP_URL, MAIL_FROM, APP_URL)
import 'dotenv/config';
import nodemailer from 'nodemailer';
import { db } from '../server/db.js';

const admins = new Set((process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
const todo = db.prepare("SELECT id, email FROM users WHERE id NOT IN (SELECT user_id FROM notices WHERE kind = 'scan-open')").all().filter(u => !admins.has(u.email));
console.log(`${todo.length} account(s) to tell.`);
if (!process.argv.includes('--send')) { todo.forEach(u => console.log(' ', u.email)); process.exit(0); }
for (const k of ['SMTP_URL', 'MAIL_FROM', 'APP_URL']) if (!process.env[k]) { console.log(`Set ${k} first.`); process.exit(1); }

const mail = nodemailer.createTransport(process.env.SMTP_URL), url = process.env.APP_URL.replace(/\/$/, '') + '/#/app';
const mark = db.prepare("INSERT INTO notices (user_id, kind, sent) VALUES (?, 'scan-open', ?)");
for (const u of todo) {
  try {
    await mail.sendMail({ from: process.env.MAIL_FROM, to: u.email, subject: 'You can now scan your own manual on Buildit',
      text: `Hello,\n\nyou signed up for early access to Buildit. Scanning your own assembly manual is now open:\n\n${url}\n\nThis is the one email we promised; we won't send more unless you use Buildit.\n` });
    mark.run(u.id, new Date().toISOString());
    console.log('sent:', u.email);
  } catch (e) { console.log('failed:', u.email, e.message); }
}
