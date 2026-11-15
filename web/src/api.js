// Calls to the Buildit server. Every request carries the x-buildit header: the server refuses changes without it,
// so other websites cannot act with a signed-in user's session.
export class ApiError extends Error {
  constructor(message, status, code) { super(message); this.status = status; this.code = code; }
}

/** fetch() for /api: JSON in and out. `body` that is FormData is sent as is. */
export async function api(path, { method = 'GET', body, signal } = {}) {
  const headers = { 'x-buildit': '1' };
  if (body && !(body instanceof FormData)) { headers['content-type'] = 'application/json'; body = JSON.stringify(body); }
  let r;
  // one quiet retry when the request did not get through at all (flaky mobile data, the server restarting)
  for (let tries = 0; ; tries++) {
    try { r = await fetch(path, { method, body, headers, signal, credentials: 'same-origin' }); break; }
    catch (e) {
      if (e.name === 'AbortError') throw e;
      if (tries < 1) { await new Promise(done => setTimeout(done, 1200)); continue; }
      throw new ApiError('Could not reach the Buildit server. Check your connection and try again in a moment.', 0);
    }
  }
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new ApiError(j.error || `Something went wrong (error ${r.status}).`, r.status, j.code);
  }
  return r;
}
export const apiJson = async (path, opts) => (await api(path, opts)).json();
