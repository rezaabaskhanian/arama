// موتور صدای محیطی آرامینا — امواج آلفا (بای‌نورال ~۸ هرتز) + نویز ملایم باران/باد.
// کاملاً سمت‌کلاینت با Web Audio API؛ بدون فایل صوتی و بدون بک‌اند.
// یک نمونه‌ی مشترک (singleton) که هم صفحه‌ی تنفس و هم اسلایدر پروفایل از آن استفاده می‌کنند.

let ctx = null;
let master = null;
let liveNodes = [];
let running = false;
let currentVolume = 0.75; // ۰..۱

function ensureContext() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }
  return ctx;
}

// سقف ملایم تا صدا آرام‌بخش بماند، نه بلند
function targetGain() {
  const v = Math.max(0, Math.min(1, currentVolume));
  return v * 0.18;
}

export function setAmbientVolume(v01) {
  currentVolume = Math.max(0, Math.min(1, v01));
  if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(running ? targetGain() : 0, ctx.currentTime + 0.12);
  }
}

export async function startAmbient(v01) {
  if (typeof window === 'undefined') return;
  if (typeof v01 === 'number') currentVolume = Math.max(0, Math.min(1, v01));
  const context = ensureContext();
  if (!context) return;
  // مرورگرها نیاز به یک تعامل کاربر دارند؛ این تابع از داخل کلیک صدا زده می‌شود
  if (context.state === 'suspended') {
    try { await context.resume(); } catch {}
  }
  if (running) {
    setAmbientVolume(currentVolume);
    return;
  }

  // --- امواج آلفا: دو نوسان‌گر با اختلاف ۸ هرتز روی دو گوش ---
  const merger = context.createChannelMerger(2);
  const oscL = context.createOscillator();
  const oscR = context.createOscillator();
  oscL.type = 'sine';
  oscR.type = 'sine';
  oscL.frequency.value = 196; // گوش چپ
  oscR.frequency.value = 204; // گوش راست → بیت ۸ هرتز (آلفا)
  const toneGain = context.createGain();
  toneGain.gain.value = 0.32;
  oscL.connect(merger, 0, 0);
  oscR.connect(merger, 0, 1);
  merger.connect(toneGain).connect(master);
  oscL.start();
  oscR.start();

  // --- نویز ملایم (حس باران/باد) از عبور نویز سفید از فیلتر پایین‌گذر ---
  const bufferSize = 2 * context.sampleRate;
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const lp = context.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 480;
  const noiseGain = context.createGain();
  noiseGain.gain.value = 0.55;
  noise.connect(lp).connect(noiseGain).connect(master);
  noise.start();

  liveNodes = [oscL, oscR, noise];
  running = true;

  master.gain.cancelScheduledValues(context.currentTime);
  master.gain.linearRampToValueAtTime(targetGain(), context.currentTime + 0.4);
}

export function stopAmbient() {
  if (!ctx || !running) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
  const toStop = liveNodes;
  setTimeout(() => {
    toStop.forEach((n) => {
      try { n.stop(); } catch {}
      try { n.disconnect(); } catch {}
    });
  }, 350);
  liveNodes = [];
  running = false;
}

export function isAmbientRunning() {
  return running;
}

// خواندن ولوم ذخیره‌شده در تنظیمات (۰..۱)
export function readSavedVolume() {
  try {
    const p = JSON.parse(localStorage.getItem('aramina_prefs'));
    if (p && typeof p.volume === 'number') return p.volume / 100;
  } catch {}
  return 0.75;
}
