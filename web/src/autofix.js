// Small, safe corrections made in code, before (and after) asking the AI to repair a guide.
// Each candidate edit is tried on a copy and kept only if the check clearly gets better:
// the targeted problem is gone, errors do not grow and errors + warnings shrink. Anything else is left to the AI.
import { rotate, shapeBoxes, PANEL, camLockSpot } from './guide.js';
import { unrotate } from './collide.js';
import { checkGuide, countIssues } from './check.js';

const AX = { '+x': [1, 0, 0], '-x': [-1, 0, 0], '+y': [0, 1, 0], '-y': [0, -1, 0], '+z': [0, 0, 1], '-z': [0, 0, -1] };
const FLIP = { '+x': '-x', '-x': '+x', '+y': '-y', '-y': '+y', '+z': '-z', '-z': '+z' };
const NEAR = 10;  // mm: a part this close in front of a screw is the one it was meant for
const MOVE = 60;  // mm: never move a part further than this
const add = (a, b) => a.map((v, i) => v + b[i]);
const scale = (a, s) => a.map(v => v * s);
const toDir = v => { const i = [0, 1, 2].reduce((m, k) => (Math.abs(v[k]) > Math.abs(v[m]) ? k : m), 0); return (v[i] > 0 ? '+' : '-') + 'xyz'[i]; };
const sameIssue = (a, b) => a.code === b.code && a.refs.slice().sort().join() === b.refs.slice().sort().join();
const better = (now, was) => {
  const n = countIssues(now), w = countIssues(was);
  return n.error <= w.error && n.error + n.warn < w.error + w.warn;
};

/* World boxes of every board, for following a screw's line (same idea as the check, simpler). */
function layout(g) {
  const boards = g.panels.map(p => {
    const part = g.parts[p.part];
    const local = part.shape ? shapeBoxes(part.shape) : [{ min: part.size_mm.map(v => -v / 2), max: part.size_mm.map(v => v / 2) }];
    return { p, part, local, toWorld: v => add(rotate(v, p.rot), p.pos), toLocal: v => unrotate(v.map((x, i) => x - p.pos[i]), p.rot) };
  });
  const inside = (b, pt) => { const q = b.toLocal(pt); return b.local.some(x => [0, 1, 2].every(i => q[i] > x.min[i] - 0.5 && q[i] < x.max[i] + 0.5)); };
  // where a piece of hardware sits, in the world (on a box board the point is on the face named by dir, as in the check)
  const seat = h => {
    const b = boards.find(o => o.p.key === h.panel);
    const at = h.at.slice();
    if (!b.part.shape) { const i = 'xyz'.indexOf(h.dir[1]); at[i] = (h.dir[0] === '+' ? 1 : -1) * b.part.size_mm[i] / 2; }
    return { b, world: b.toWorld(at), d: rotate(AX[h.dir], b.p.rot) };
  };
  // first other board along a line, and how far away
  const ahead = (from, d, skip, max) => {
    for (let t = 0; t <= max; t += 1) { const pt = add(from, scale(d, t)); const o = boards.find(x => x !== skip && inside(x, pt)); if (o) return { o, t }; }
    return null;
  };
  const exit = (b, from, d) => { let t = 0; while (t < 400 && inside(b, add(from, scale(d, t + 1)))) t++; return t; };
  return { boards, seat, ahead, exit };
}

/* Screws, bolts, dowels that miss: put them where they were evidently meant to go. */
function hardwareCandidates(g, issue) {
  const L = layout(g);
  const group = issue.refs.map(k => g.hardware.find(h => h.key === k)).filter(Boolean);
  if (!group.length) return [];
  const out = [];
  const front = group.map(h => { const s = L.seat(h); return { h, s, hit: L.ahead(s.world, s.d, s.b, NEAR) }; });
  // only on shaped parts, where the spot stays put; on a flat board turning a screw moves its head to the other face,
  // which is a real change of instruction and is left to the AI
  if (front.every(f => f.hit && f.s.b.part.shape && ['screw', 'bolt', 'allen_bolt', 'nail'].includes(g.parts[f.h.part].kind))) {
    // it points at the part it should join, so it is the wrong way round: turn it (same spot, same part)
    out.push({
      say: `${group.length} × ${g.parts[group[0].part].name} on ${group[0].panel}: turned round so it goes into ${front[0].hit.o.p.key}`,
      apply: c => { for (const f of front) { const h = c.hardware.find(x => x.key === f.h.key); h.dir = FLIP[h.dir]; } return c; },
    });
    // or it belongs to that other part: screws go in from the far side, so put it on that part's far face
    const fits = front.every(f => {
      const len = g.parts[f.h.part].len_mm || 40;
      const entry = add(f.s.world, scale(f.s.d, f.hit.t));
      return L.exit(f.hit.o, entry, f.s.d) < len;
    });
    if (fits) out.push({
      say: `${group.length} × ${g.parts[group[0].part].name}: moved from ${group[0].panel} to the far side of ${front[0].hit.o.p.key}, where it goes in`,
      apply: c => {
        for (const f of front) {
          const h = c.hardware.find(x => x.key === f.h.key), o = f.hit.o;
          const entry = add(f.s.world, scale(f.s.d, f.hit.t)), far = add(entry, scale(f.s.d, L.exit(o, entry, f.s.d)));
          h.panel = o.p.key; h.at = o.toLocal(far); h.dir = toDir(unrotate(f.s.d, o.p.rot));
        }
        return c;
      },
    });
  }
  return out;
}

/* Two parts that sink into each other a little: slide one of them out, the smallest move first. */
function overlapCandidates(g, issue) {
  const [ka, kb] = issue.refs;
  const pa = g.panels.find(p => p.key === ka), pb = g.panels.find(p => p.key === kb);
  if (!pa || !pb) return [];
  const depth = Number(issue.msg.match(/by (\d+) mm/)?.[1]) || 10;
  // the part fitted later moves first; if both come in the same step, the smaller one
  const vol = p => g.parts[p.part].size_mm.reduce((a, b) => a * b, 1);
  const movers = [pa, pb].sort((a, b) => b.step - a.step || vol(a) - vol(b));
  const amounts = [...new Set([depth + 1, Math.round(depth * 1.5) + 1, depth * 2 + 1])].filter(a => a <= MOVE);
  const out = [];
  for (const a of amounts) for (const p of movers) for (const dir of Object.keys(AX)) out.push({
    say: `${p.key} moved ${a} mm ${dir} so it no longer goes through ${p === pa ? kb : ka}`,
    apply: c => { const q = c.panels.find(x => x.key === p.key); q.pos = add(q.pos, scale(AX[dir], a)); return c; },
  });
  return out;
}

/* Cam locks that no cam screw reaches: move them, board by board, to where the cam screws pointing into that board end.
   Locks already in a right spot stay; the rest go to the nearest free spot. Counts never change. */
function camCandidates(g) {
  const kindOf = h => g.parts[h.part].kind;
  const spots = g.hardware.filter(h => kindOf(h) === 'cam_screw').map(h => camLockSpot(g, h)).filter(Boolean);
  const out = [];
  for (const panel of [...new Set(spots.map(s => s.panel))]) {
    const free = spots.filter(s => s.panel === panel);
    const locks = g.hardware.filter(h => kindOf(h) === 'cam_lock' && h.panel === panel);
    const dist = (l, s) => (l.dir === s.dir ? Math.hypot(...l.at.map((v, i) => v - s.at[i])) : Infinity);
    const loose = locks.filter(l => { const i = free.findIndex(s => dist(l, s) < 8); if (i < 0) return true; free.splice(i, 1); return false; });
    const moves = [];
    for (const l of loose) {
      if (!free.length) break;
      const i = free.reduce((m, s, j) => (Math.hypot(...l.at.map((v, k) => v - s.at[k])) < Math.hypot(...l.at.map((v, k) => v - free[m].at[k])) ? j : m), 0);
      moves.push([l.key, free.splice(i, 1)[0]]);
    }
    if (moves.length) out.push({
      say: `${moves.length} cam lock${moves.length > 1 ? 's' : ''} on ${panel}: moved to where the cam screws end`,
      apply: c => { for (const [key, s] of moves) { const h = c.hardware.find(x => x.key === key); h.at = s.at; h.dir = s.dir; } return c; },
    });
  }
  return out;
}

/**
 * Try the safe corrections on a normalized guide.
 * Returns { guide, issues, fixes: [plain-language line per change] }. The input guide is not changed.
 */
export function autoFix(guide, { rounds = 3 } = {}) {
  let g = structuredClone(guide), issues = checkGuide(g);
  const fixes = [];
  if (!g.panels.every(p => g.parts[p.part]?.kind === PANEL && g.parts[p.part].size_mm)) return { guide: g, issues, fixes };
  // boards placed by a joint: if the model's own estimate fits better, the joint was wrong
  for (const p of g.panels.filter(p => p.est)) {
    const g2 = structuredClone(g), q = g2.panels.find(x => x.key === p.key);
    q.pos = q.est; delete q.est;
    const i2 = checkGuide(g2);
    if (better(i2, issues)) { g = g2; issues = i2; fixes.push(`${p.key}: placed where the model estimated, not by its joint`); }
  }
  for (const t of camCandidates(g)) {
    const g2 = t.apply(structuredClone(g)), i2 = checkGuide(g2);
    if (better(i2, issues)) { g = g2; issues = i2; fixes.push(t.say); }
  }
  for (let r = 0; r < rounds; r++) {
    let changed = false;
    for (const issue of issues.filter(i => i.code === 'overlap' || i.code === 'hw-no-partner')) {
      if (!issues.some(i => sameIssue(i, issue))) continue; // fixed by an earlier change
      const tries = issue.code === 'overlap' ? overlapCandidates(g, issue) : hardwareCandidates(g, issue);
      for (const t of tries) {
        const g2 = t.apply(structuredClone(g)), i2 = checkGuide(g2);
        if (!i2.some(i => sameIssue(i, issue)) && better(i2, issues)) { g = g2; issues = i2; fixes.push(t.say); changed = true; break; }
      }
    }
    if (!changed) break;
  }
  return { guide: g, issues, fixes };
}
