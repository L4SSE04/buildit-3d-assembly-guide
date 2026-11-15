// The landing page's live preview: the example bookcase, building itself step by step while it slowly turns.
// Not interactive on purpose: on the landing page a drag or a pinch must scroll the page, not move the model.
import { Viewer } from './viewer/Viewer.js';
import { hardwareReady } from './viewer/parts3d.js';
import { normalizeGuide } from './guide.js';

const $ = id => document.getElementById(id);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const tok = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
let viewer = null, guide = null, step = 0, timer = null, shown = false, onScreen = true;

async function start() {
  if (viewer) return;
  const [g] = await Promise.all([fetch('/examples/bookcase.json').then(r => r.json()), hardwareReady]);
  guide = normalizeGuide(g);
  viewer = new Viewer($('hero-canvas'), $('hero-labels'), { colors: { wood: tok('--wood'), accent: tok('--accent'), edge: tok('--edge') }, reducedMotion: RM });
  viewer.load(guide); viewer.resize(); viewer.setLabels(true);
  viewer.ctrl.enabled = false; // no drag, zoom or tap: the page scrolls past it
  if (!RM) { viewer.ctrl.autoRotate = true; viewer.ctrl.autoRotateSpeed = 0.7; }
  $('hero-prog').innerHTML = guide.steps.map(() => '<i></i>').join('');
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }).observe($('hero-stage'));
  document.addEventListener('visibilitychange', sync);
  go(RM ? guide.steps.length : FIRST, true);
  sync();
}
// the loop starts where the piece stands up (steps 1-2 lie flat on the floor and fill the view with boards)
const FIRST = 3;
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function go(s, first) {
  // the wide view of the whole piece, not the build screen's close-up; glide there unless it is the first view
  step = s; viewer.setStep(s, true); viewer.detail = false; viewer.goCam(!!first);
  $('hero-step').textContent = `Step ${s} of ${guide.steps.length}`;
  $('hero-title').textContent = guide.steps[s - 1].title;
  [...$('hero-prog').children].forEach((el, i) => (el.className = i < s - 1 ? 'done' : i === s - 1 ? 'cur' : ''));
  // the parts this step asks for, with the letters and numbers the manual uses
  const need = guide.steps[s - 1].need || [];
  $('hero-parts').innerHTML = need.length
    ? need.map(([id, n]) => `<li><b>${esc(id)}</b>${n} × ${esc(guide.parts[id]?.name || id)}</li>`).join('')
    : '<li class="none">No new parts: join the ones already placed</li>';
}
// next step every few seconds, round and round; still when the visitor prefers less motion
function tick() {
  clearTimeout(timer);
  if (RM || !running()) return;
  timer = setTimeout(() => { go(step >= guide.steps.length ? FIRST : step + 1); tick(); }, 4600);
}
const running = () => shown && onScreen && document.visibilityState === 'visible';
function sync() { if (!viewer) return; viewer.paused = !running(); if (running()) tick(); else clearTimeout(timer); }

export function showLanding(v) {
  shown = v;
  if (v && !viewer) start().catch(e => { console.warn('Preview not shown:', e); $('hero-stage').hidden = true; });
  else { if (v) { viewer.resize(); viewer.goCam(true); } sync(); }
}
