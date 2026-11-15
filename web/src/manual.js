// The manual page a step comes from, shown next to the step so the 3D view can be checked against the paper.
// A guide keeps its manual on the server (see /api/guides/:id/manual.pdf and /page/:n): the PDF, rendered here
// page by page with pdf.js, or page pictures that were made from a PDF.
const cache = new Map();
let doc = null, docFor = null;

/** First page number in a step's "page" field ("9", 9, "9-10"), or null. */
export const pageNumber = page => { const n = parseInt(String(page ?? ''), 10); return Number.isFinite(n) && n > 0 ? n : null; };

/** Does this guide have its manual stored? */
export const hasManual = g => !!(g?.id && (g.manual?.pdf || g.manual?.images));

/** URL of an image of page n of the guide's manual, or null. */
export async function manualPage(g, n) {
  if (!hasManual(g) || !n) return null;
  const key = `${g.id}|${n}`;
  if (!cache.has(key)) cache.set(key, load(g, n).catch(e => { console.warn('Manual page not shown:', e); return null; }));
  return cache.get(key);
}

async function load(g, n) {
  if (g.manual.images) return n <= g.manual.images ? `/api/guides/${encodeURIComponent(g.id)}/page/${n}` : null;
  if (docFor !== g.id) {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    doc = await pdfjs.getDocument(`/api/guides/${encodeURIComponent(g.id)}/manual.pdf`).promise; docFor = g.id;
  }
  if (n > doc.numPages) return null;
  const page = await doc.getPage(n), base = page.getViewport({ scale: 1 });
  const vp = page.getViewport({ scale: 1400 / Math.max(base.width, base.height) });
  const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  const blob = await new Promise(done => c.toBlob(done, 'image/jpeg', 0.85));
  return URL.createObjectURL(blob);
}
