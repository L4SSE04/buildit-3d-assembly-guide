// The signed-in user (or null), the sign-in screen (email → link → continue) and the account menu.
import { api, apiJson } from './api.js';

const $ = id => document.getElementById(id);
let user = null;
const listeners = new Set();
export const currentUser = () => user;
export const onUserChange = fn => listeners.add(fn);
function setUser(u) { user = u; listeners.forEach(fn => fn(u)); renderMenu(); }

export async function loadUser() {
  try { setUser((await apiJson('/api/me')).user); } catch { setUser(null); }
  return user;
}

/* ---------- where to go after signing in ---------- */
const NEXT = 'bi-next';
// kept in localStorage for an hour: the link in the email usually opens in a new tab
export function rememberNext(hash) { try { localStorage.setItem(NEXT, JSON.stringify({ hash, until: Date.now() + 36e5 })); } catch { /* storage blocked */ } }
function takeNext() {
  let h = null;
  try { const v = JSON.parse(localStorage.getItem(NEXT) || 'null'); localStorage.removeItem(NEXT); if (v?.until > Date.now()) h = v.hash; } catch { /* storage blocked */ }
  return typeof h === 'string' && /^#\/(app|guide\/[\w-]+)$/.test(h) ? h : '#/app';
}

/* ---------- sign-in screen ---------- */
let lastEmail = '', resendTimer = null;
function showPart(part) { for (const p of ['si-form-box', 'si-sent', 'si-verify']) $(p).hidden = p !== part; }

/** #/signin shows the email form; #/signin/<token> (the link from the email) asks to continue. */
export function showSignin(token) {
  $('si-err').textContent = ''; $('si-verr').textContent = '';
  $('si-new')?.remove(); $('si-continue').hidden = false;
  if (token) {
    // Continue waits until the screen shows whose account the link opens
    showPart('si-verify'); $('si-continue').disabled = true; $('si-continue').dataset.token = token;
    $('si-vtext').textContent = 'Checking your sign-in link…';
    // show whose account this link opens, so a link someone else sent you is noticed
    apiJson('/api/auth/peek', { method: 'POST', body: { token } }).then(({ email }) => {
      $('si-vtext').textContent = `This link signs you in as ${email}.${user ? ` You are now signed in as ${user.email}; continuing switches account.` : ''} Not your email? Don't continue.`;
      $('si-continue').disabled = false; $('si-continue').focus();
    }).catch(e => {
      if (e.code === 'expired') expired();
      else { $('si-vtext').textContent = ''; $('si-verr').textContent = `${e.message} Reload the page to try again.`; }
    });
    return;
  }
  showPart('si-form-box');
  if (lastEmail) $('si-email').value = lastEmail;
  setTimeout(() => $('si-email').focus(), 0);
}

$('si-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('si-email').value.trim(), err = $('si-err');
  err.textContent = ''; $('si-email').removeAttribute('aria-invalid');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = 'Enter your email address, like name@example.com.'; $('si-email').setAttribute('aria-invalid', 'true'); $('si-email').focus(); return; }
  await send(email);
});
async function send(email) {
  const btn = $('si-send'); btn.disabled = true; btn.textContent = 'Sending…';
  try {
    await api('/api/auth/start', { method: 'POST', body: { email } });
    lastEmail = email; $('si-to').textContent = email; showPart('si-sent');
    // "send again" waits 30 s so a slow email is not sent twice by an impatient tap
    $('si-resend').disabled = true; clearTimeout(resendTimer);
    resendTimer = setTimeout(() => ($('si-resend').disabled = false), 30000);
  } catch (e) { $('si-err').textContent = e.message; $('si-email').setAttribute('aria-invalid', 'true'); }
  finally { btn.disabled = false; btn.textContent = 'Email me a sign-in link'; }
}
$('si-again').onclick = () => { showPart('si-form-box'); $('si-email').select(); };
$('si-resend').onclick = async () => { $('si-resend').disabled = true; await send(lastEmail); };

$('si-continue').onclick = async () => {
  const b = $('si-continue'); b.disabled = true; b.textContent = 'Signing in…'; $('si-verr').textContent = '';
  try {
    const { user: u } = await apiJson('/api/auth/verify', { method: 'POST', body: { token: b.dataset.token } });
    setUser(u);
    location.replace(takeNext()); // replace: the used link should not stay in the back history
  } catch (e) {
    $('si-verr').textContent = e.message;
    if (e.code === 'expired') expired(); else b.disabled = false;
  } finally { b.textContent = 'Continue'; }
};

function expired() {
  $('si-continue').hidden = true; $('si-vtext').textContent = '';
  $('si-verr').textContent = user ? `This link was already used or has expired. You're signed in as ${user.email}.` : 'This link has expired or was already used. Ask for a new one.';
  if (!$('si-new')) $('si-verify').insertAdjacentHTML('beforeend', user
    ? '<a class="btn primary wide" href="#/app" id="si-new">Go to my guides</a>'
    : '<a class="btn primary wide" href="#/signin" id="si-new">Get a new link</a>');
}

/* ---------- account menu ---------- */
function renderMenu() {
  $('acct').hidden = !user; $('nav-signin').hidden = !!user;
  if (user) { $('acct-email').textContent = user.email; $('acct-initial').textContent = user.email[0].toUpperCase(); }
}
const menu = $('acct-menu'), menuBtn = $('acct-btn');
function openMenu(v) {
  menu.hidden = !v; menuBtn.setAttribute('aria-expanded', v);
  if (v) menu.querySelector('[role=menuitem]').focus();
}
menuBtn.onclick = () => openMenu(menu.hidden);
document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('#acct')) openMenu(false); });
menu.addEventListener('click', e => { if (e.target.closest('a')) openMenu(false); });
$('acct').addEventListener('focusout', e => { if (!menu.hidden && !$('acct').contains(e.relatedTarget)) openMenu(false); });
document.addEventListener('keydown', e => {
  if (menu.hidden) return;
  const items = [...menu.querySelectorAll('[role=menuitem]')], i = items.indexOf(document.activeElement);
  if (e.key === 'Escape') { openMenu(false); menuBtn.focus(); }
  if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
});
async function signOut(everywhere) {
  openMenu(false);
  try { await api('/api/auth/signout', { method: 'POST', body: { everywhere } }); } catch { /* signed out locally anyway */ }
  setUser(null); location.hash = '#/';
}
$('signout').onclick = () => signOut(false);
$('signout-all').onclick = () => signOut(true);
$('delete-acct').onclick = async () => {
  openMenu(false);
  if (!confirm(`Delete the account ${user.email}?\n\nAll your guides and the manual pages you uploaded are deleted for good. This cannot be undone.`)) return;
  try { await api('/api/me', { method: 'DELETE' }); setUser(null); location.hash = '#/'; }
  catch (e) { alert(e.message); }
};
