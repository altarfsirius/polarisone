#!/usr/bin/env node
// Polaris One · contract polaris-hub/1 · conformance check for a PEER app (Altair Aero Engineering, Altair Auto).
// Run it against your TEST copy of the peer, before Polaris One is ever connected. It sends signed calls exactly as Polaris One will.
//   node polaris-hub-conformance.js --base https://peer.example/functions/v1/polaris-sync --link <uuid> --secret-env POLARIS_HUB_SECRET
// The secret is read from an environment variable (never from the command line). It creates ONE test activity (ref starts with "conf-")
// and removes it again (soft delete). Do not run it against real data.
const crypto = require('crypto');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const base = (arg('base') || '').replace(/\/+$/, ''), link = arg('link'), env = arg('secret-env', 'POLARIS_HUB_SECRET'), secret = process.env[env] || '';
if (!/^https?:\/\//.test(base) || !/^[0-9a-f-]{36}$/i.test(link || '') || secret.length < 16) { console.log('Usage: node polaris-hub-conformance.js --base <url> --link <uuid> [--secret-env NAME]  (the secret must be in that environment variable, 16+ characters)'); process.exit(2); }
let bad = 0, n = 0;
const ok = (c, m, x) => { n++; if (!c) { bad++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x)); } else console.log('ok  ', m); };
const sign = (ts, nonce, body, s = secret) => crypto.createHmac('sha256', s).update(`${ts}.${nonce}.${body}`).digest('hex');
async function call(method, path, bodyObj, o = {}) {
  const body = bodyObj === undefined ? '' : JSON.stringify(bodyObj);
  const ts = String(o.ts || Math.floor(Date.now() / 1000)), nonce = o.nonce || crypto.randomUUID();
  const h = { 'content-type': 'application/json' };
  if (!o.unsigned) Object.assign(h, { 'x-hub-link': link, 'x-hub-timestamp': ts, 'x-hub-nonce': nonce, 'x-hub-signature': o.sig || sign(ts, nonce, body, o.secret) });
  const r = await fetch(base + path, { method, headers: h, body: method === 'GET' ? undefined : body });
  let j = null; try { j = await r.json(); } catch (e) {}
  return { status: r.status, j, ts, nonce, body };
}
const ev = (o) => ({ entity: 'activity', op: 'upsert', ref: 'conf-' + RUN, level: 1, data: { title: 'Conformance test', priority: 'medium', status: 'not_started', progress: 0 }, ft: {}, updated_at: new Date().toISOString(), ...o });
const env1 = (events) => ({ contract: 'polaris-hub/1', link_id: link, sent_at: new Date().toISOString(), events });
const RUN = crypto.randomBytes(4).toString('hex'), TX = '2000-01-01T00:00:00.000000Z';
(async () => {
  console.log('Base', base, '· run', RUN);
  // 1. authentication
  let r = await call('POST', '/events', env1([ev({})]), { unsigned: true }); ok(r.status === 401, 'no signature → 401', r.status);
  r = await call('POST', '/events', env1([ev({})]), { sig: 'a'.repeat(64) }); ok(r.status === 401, 'wrong signature → 401', r.status);
  r = await call('POST', '/events', env1([ev({})]), { secret: 'x'.repeat(32) }); ok(r.status === 401, 'wrong secret → 401', r.status);
  r = await call('POST', '/events', env1([ev({})]), { ts: Math.floor(Date.now() / 1000) - 3600 }); ok(r.status === 401, 'timestamp one hour old → 401', r.status);
  const good = await call('POST', '/events', env1([ev({})]));
  ok(good.status === 200 && good.j && good.j.contract === 'polaris-hub/1' && Array.isArray(good.j.results) && good.j.results.length === 1, 'valid call → 200 with contract and one result per event', good.j);
  const g0 = good.j && good.j.results && good.j.results[0] || {};
  ok(g0.ref === 'conf-' + RUN && ['applied', 'merged', 'unchanged'].includes(g0.result) && g0.peer_ref, 'the test activity is created and its own id comes back as peer_ref', g0);
  const peerRef = g0.peer_ref;
  // replay of the same nonce
  const body = JSON.stringify(env1([ev({})]));
  const a = await fetch(base + '/events', { method: 'POST', headers: { 'content-type': 'application/json', 'x-hub-link': link, 'x-hub-timestamp': String(Math.floor(Date.now() / 1000)), 'x-hub-nonce': 'replay-' + RUN, 'x-hub-signature': sign(String(Math.floor(Date.now() / 1000)), 'replay-' + RUN, body) }, body });
  const b = await fetch(base + '/events', { method: 'POST', headers: { 'content-type': 'application/json', 'x-hub-link': link, 'x-hub-timestamp': String(Math.floor(Date.now() / 1000)), 'x-hub-nonce': 'replay-' + RUN, 'x-hub-signature': sign(String(Math.floor(Date.now() / 1000)), 'replay-' + RUN, body) }, body });
  ok(a.status === 200 && b.status === 401, 'the same nonce twice → second call is 401', [a.status, b.status]);
  // 2. idempotency, update, merge
  r = await call('POST', '/events', env1([ev({ peer_ref: peerRef })])); ok(r.j && r.j.results[0].result === 'unchanged', 'same event again → unchanged', r.j);
  r = await call('POST', '/events', env1([ev({ peer_ref: peerRef, data: { status: 'in_progress', progress: 40 }, ft: { status: new Date().toISOString(), progress: new Date().toISOString() }, updated_at: new Date().toISOString() })]));
  ok(r.j && ['applied', 'merged'].includes(r.j.results[0].result), 'status and progress update is applied', r.j);
  r = await call('POST', '/events', env1([ev({ peer_ref: peerRef, data: { status: 'completed' }, ft: { status: TX }, updated_at: TX })]));
  ok(r.j && ['merged', 'unchanged'].includes(r.j.results[0].result), 'an OLDER edit does not overwrite a newer one (per-field, later wins)', r.j);
  // 3. validation
  r = await call('POST', '/events', env1([ev({ ref: 'conf-bad1-' + RUN, data: { title: 'x', priority: 'urgent' } })])); ok(r.j && r.j.results[0].result === 'rejected', 'unknown priority → rejected', r.j);
  r = await call('POST', '/events', env1([ev({ ref: 'conf-bad2-' + RUN, data: { title: 'x', progress: 150 } })])); ok(r.j && r.j.results[0].result === 'rejected', 'progress 150 → rejected', r.j);
  r = await call('POST', '/events', env1([ev({ ref: 'conf-bad3-' + RUN, data: { title: 'x', planned_start: '31/12/2026' } })])); ok(r.j && r.j.results[0].result === 'rejected', 'a date that is not YYYY-MM-DD → rejected', r.j);
  r = await call('POST', '/events', env1([ev({ ref: 'conf-sub-' + RUN, level: 2, data: { title: 'child', parent_ref: 'conf-does-not-exist' } })])); ok(r.j && ['parked', 'rejected'].includes(r.j.results[0].result), 'a sub-activity whose parent is unknown → parked (not a crash)', r.j);
  // 4. pull
  r = await call('GET', '/changes?since=1970-01-01T00:00:00Z&limit=50'); ok(r.status === 200 && r.j && r.j.contract === 'polaris-hub/1' && Array.isArray(r.j.events) && !Number.isNaN(Date.parse(r.j.cursor)), 'GET /changes → 200 with events and an ISO cursor', r.status);
  const e0 = r.j && r.j.events && r.j.events[0];
  if (e0) ok(e0.ref && ['activity', 'action'].includes(e0.entity) && e0.data && e0.updated_at, 'each change has entity, ref, data and updated_at', e0); else console.log('note: /changes returned no events (fine if nothing is marked for sync)');
  // 5. delete = soft delete
  r = await call('POST', '/events', env1([{ entity: 'activity', op: 'delete', ref: 'conf-' + RUN, peer_ref: peerRef, updated_at: new Date().toISOString() }])); ok(r.j && ['applied', 'unchanged'].includes(r.j.results[0].result), 'delete is accepted (soft delete: cancelled, never removed)', r.j);
  console.log(bad ? `FAILED ${bad} of ${n}` : `ALL ${n} PASSED`); process.exit(bad ? 1 : 0);
})().catch((e) => { console.log('ERROR', e.message); process.exit(2); });
