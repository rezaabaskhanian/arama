#!/usr/bin/env node
// Driver for the Aramina app (Go API on :8086 + Next.js frontend on :3000, via docker compose).
//
// Two modes:
//   node driver.mjs api                       → smoke-test the backend API (register→login→exercises→mood→supervision)
//   node driver.mjs shot <path> [--auth] [--admin] [--out file.png] [--w 430] [--h 1600]
//                                             → screenshot a frontend page. --auth injects a fresh user's
//                                               token into localStorage (needed for every page except /login,
//                                               because the API client redirects to /login on 401).
//
// Screenshots land in .claude/skills/run-aramina/shots/ by default.
//
// Env overrides: API_BASE (default http://localhost:8086), WEB_BASE (default http://localhost:3000),
//                CHROME (path to Chrome/Chromium binary).

import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const API = process.env.API_BASE || 'http://localhost:8086';
const WEB = process.env.WEB_BASE || 'http://localhost:3000';
const CHROME = process.env.CHROME ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rnd = () => Math.random().toString().slice(2, 8);

// ---------- API helpers ----------
async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

// register + login a throwaway user, return { token, phone, id, role }
async function makeUser(nickname = 'driver') {
  const phone = ('0912' + rnd() + rnd()).slice(0, 11);
  const reg = await api('/users/register', {
    method: 'POST',
    body: { nickname, phone, password_hash: 'Driver1234' },
  });
  if (reg.status >= 400) throw new Error('register failed: ' + JSON.stringify(reg.json));
  const login = await api('/users/login', {
    method: 'POST',
    body: { phone_number: phone, password_hash: 'Driver1234' },
  });
  const t = login.json?.tokens?.access_token;
  if (!t) throw new Error('login failed: ' + JSON.stringify(login.json));
  return { token: t, phone, id: reg.json.user.id, role: reg.json.user.role || '' };
}

// Promote a user to admin in the DB (the JWT role is baked at login, so we re-login after).
async function promoteToAdmin(user) {
  execFileSync('docker', ['exec', 'aramina_postgres', 'psql', '-U', 'aramina', '-d', 'mental_health_db',
    '-c', `UPDATE users SET role='admin' WHERE id='${user.id}';`], { stdio: 'ignore' });
  const login = await api('/users/login', {
    method: 'POST', body: { phone_number: user.phone, password_hash: 'Driver1234' },
  });
  const t = login.json?.tokens?.access_token;
  if (!t) throw new Error('admin re-login failed: ' + JSON.stringify(login.json));
  return { ...user, token: t, role: 'admin' };
}

async function smoke() {
  const ok = [];
  const fail = [];
  const check = (name, cond, extra = '') => (cond ? ok : fail).push(name + (extra ? ' — ' + extra : ''));

  const health = await api('/health');
  check('GET /health = 200', health.status === 200, `got ${health.status}`);

  const u = await makeUser();
  check('register + login', !!u.token);

  const list = await api('/exercises/by-trauma/mild', { token: u.token });
  check('exercises by-trauma', Array.isArray(list.json) && list.json.length > 0, `${list.json?.length} items`);
  const firstId = list.json?.[0]?.exercise_info?.id;

  const prog0 = await api('/exercises/user_progress?trauma_type=mild', { token: u.token });
  check('user_progress before', prog0.json?.completed_exercises === 0);

  const done = await api(`/exercises/${firstId}/complete`, { method: 'POST', token: u.token, body: { trauma_type: 'mild' } });
  check('complete first exercise', done.status === 200 && done.json?.completed_exercises === 1, `status ${done.status}`);

  const dup = await api(`/exercises/${firstId}/complete`, { method: 'POST', token: u.token, body: { trauma_type: 'mild' } });
  check('daily-drip blocks 2nd today', dup.status === 400, `status ${dup.status}`);

  const mood = await api('/journal/upsert-mood-add', { method: 'POST', token: u.token, body: { mood: 4 } });
  check('save today mood', mood.status === 200 && mood.json?.success === true);
  const today = await api('/journal/today-mood', { token: u.token });
  check('read today mood = 4', today.json === 4, `got ${JSON.stringify(today.json)}`);

  const sup = await api('/supervision/toggle', { method: 'POST', token: u.token, body: { wants: true } });
  check('supervision opt-in', sup.json?.wants_supervision === true);

  console.log('\n  PASS:');
  ok.forEach((x) => console.log('   ✓ ' + x));
  if (fail.length) {
    console.log('\n  FAIL:');
    fail.forEach((x) => console.log('   ✗ ' + x));
  }
  console.log(`\n  ${ok.length} passed, ${fail.length} failed\n`);
  process.exit(fail.length ? 1 : 0);
}

// ---------- CDP (Chrome DevTools Protocol) ----------
async function cdpConnect(port) {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://localhost:${port}/json/version`);
      const j = await r.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(200);
  }
  throw new Error('Chrome DevTools endpoint never came up');
}

function cdpClient(ws) {
  let nextId = 1;
  const pending = new Map();
  const waiters = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      for (let i = waiters.length - 1; i >= 0; i--) {
        if (waiters[i].method === msg.method) { waiters[i].resolve(msg.params); waiters.splice(i, 1); }
      }
    }
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  const waitEvent = (method, timeout = 15000) =>
    new Promise((resolve, reject) => {
      const w = { method, resolve };
      waiters.push(w);
      setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) { waiters.splice(i, 1); reject(new Error('timeout ' + method)); } }, timeout);
    });
  return { send, waitEvent };
}

async function shot(path, { auth, admin, out, w, h }) {
  const width = w || 430;
  const height = h || 1600;
  const port = 9333 + Math.floor(Math.random() * 400);
  const userDir = join('/tmp', 'aramina-chrome-' + rnd());

  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--no-default-browser-check', `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDir}`, `--window-size=${width},${height}`, 'about:blank',
  ], { stdio: 'ignore' });

  try {
    const browserWS = await cdpConnect(port);
    const ws = new WebSocket(browserWS);
    await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
    const { send, waitEvent } = cdpClient(ws);

    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

    await send('Page.enable', {}, sessionId);
    await send('Runtime.enable', {}, sessionId);
    await send('Emulation.setDeviceMetricsOverride',
      { width, height, deviceScaleFactor: 1, mobile: false }, sessionId);

    // Land on the origin so we can write localStorage, then optionally seed a token.
    const loaded1 = waitEvent('Page.loadEventFired');
    await send('Page.navigate', { url: WEB + '/login' }, sessionId);
    await loaded1;

    if (auth) {
      const nick = admin ? 'مدیر تست' : 'کاربر تست';
      let u = await makeUser(nick);
      // Give the account a trauma type + a completed exercise so pages have data to show.
      const list = await api('/exercises/by-trauma/mild', { token: u.token });
      const firstId = list.json?.[0]?.exercise_info?.id;
      if (firstId) await api(`/exercises/${firstId}/complete`, { method: 'POST', token: u.token, body: { trauma_type: 'mild' } });
      await api('/journal/upsert-mood-add', { method: 'POST', token: u.token, body: { mood: 4 } });
      if (admin) u = await promoteToAdmin(u); // real admin JWT so /admin/* API calls succeed
      const seed = {
        access_token: u.token, refresh_token: u.token,
        userId: u.id, userName: nick, userRole: admin ? 'admin' : (u.role || 'user'),
        traumaType: 'mild',
      };
      await send('Runtime.evaluate', {
        expression: `Object.entries(${JSON.stringify(seed)}).forEach(([k,v])=>localStorage.setItem(k,v));`,
      }, sessionId);
    }

    const loaded2 = waitEvent('Page.loadEventFired');
    await send('Page.navigate', { url: WEB + path }, sessionId);
    await loaded2;
    await sleep(2500); // let client-side fetches + animations settle

    const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, sessionId);
    const outPath = out || join(HERE, 'shots', (path.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home') + '.png');
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, Buffer.from(data, 'base64'));
    console.log('screenshot →', outPath);

    await send('Target.closeTarget', { targetId });
    ws.close();
  } finally {
    chrome.kill('SIGKILL');
  }
}

// ---------- CLI ----------
const [, , mode, ...rest] = process.argv;
const flag = (name) => { const i = rest.indexOf('--' + name); return i >= 0 ? rest[i + 1] : undefined; };
const has = (name) => rest.includes('--' + name);

if (mode === 'api') {
  await smoke();
} else if (mode === 'shot') {
  const path = rest.find((a) => a.startsWith('/')) || '/';
  await shot(path, { auth: has('auth'), admin: has('admin'), out: flag('out'), w: +flag('w') || 0, h: +flag('h') || 0 });
} else {
  console.log('usage:\n  node driver.mjs api\n  node driver.mjs shot <path> [--auth] [--admin] [--out f.png] [--w 430] [--h 1600]');
  process.exit(1);
}
