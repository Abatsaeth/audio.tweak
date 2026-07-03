/* ============================================================
   SONIQ STUDIO — script.js  v2.0
   Audio engine: Web Audio API preview + FFmpeg.wasm export
   ============================================================ */

'use strict';

// ── State ────────────────────────────────────────────────────
const S = {
  files: [],
  activeIndex: -1,
  isPlaying: false,
  isLooping: false,
  isMuted: false,
  zoom: 1,

  speed: 1,
  pitch: 0,
  volume: 100,
  bass: 0,
  mid: 0,
  treble: 0,
  reverb: false,
  reverbAmount: 4,
  echo: false,
  echoDelay: 300,
  normalize: false,
  fadeIn: false,
  fadeInDur: 2,
  fadeOut: false,
  fadeOutDur: 2,
  mono: false,
  trimEnabled: false,
  trimStart: 0,
  trimEnd: 0,
  exportFormat: 'mp3',
  exportQuality: { mp3: '192k', ogg: '6', wav: 'pcm_s16le', flac: '5' },

  ffmpegReady: false,
  wsReady: false,
  duration: 0,
  sampleRate: 44100,
  channels: 2,
  fileSize: 0,
};

// ── Globals ───────────────────────────────────────────────────
let ffmpeg = null;
let fetchFileFn = null;
let toBlobURLFn = null;
let wavesurfer = null;
let specAnimFrame = null;
let activeKnobDrag = null;

const specBars = [];
const $ = (id) => document.getElementById(id);

// ── Bootstrap ─────────────────────────────────────────────────
(async () => {
  loadSettings();
  initLucide();
  initDropZone();
  initTransport();
  initKnobs();
  initSliders();
  initPresets();
  initEffects();
  initTrim();
  initExport();
  initHeaderScroll();
  initRipple();
  updateVolWarning();
  await initFFmpeg();
})();

// ── LocalStorage ─────────────────────────────────────────────
const SETTINGS_KEY = 'soniq_settings';
const PERSISTED = ['speed','pitch','volume','bass','mid','treble',
  'reverbAmount','echoDelay','fadeInDur','fadeOutDur','exportFormat','exportQuality'];

function saveSettings() {
  const data = {};
  PERSISTED.forEach(k => { data[k] = S[k]; });
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(data)); } catch (e) {}
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    PERSISTED.forEach(k => { if (data[k] !== undefined) S[k] = data[k]; });
  } catch (e) {}
}

// ── Lucide ───────────────────────────────────────────────────
function initLucide() {
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ── FFmpeg Init ───────────────────────────────────────────────
async function initFFmpeg() {
  const dot   = $('ffmpegDot');
  const label = $('ffmpegLabel');
  dot.className = 'status-dot loading';
  label.textContent = 'Loading FFmpeg';

  try {
    // @ffmpeg/ffmpeg@0.12.x UMD exposes window.FFmpegWASM = { FFmpeg }
    // @ffmpeg/util@0.12.x UMD exposes window.FFmpegUtil = { fetchFile, toBlobURL, ... }
    const FWASM = window.FFmpegWASM || window.FFmpeg_WASM || {};
    const FUTIL = window.FFmpegUtil  || window.FFmpeg_Util  || {};

    const FFmpegClass = FWASM.FFmpeg;
    fetchFileFn  = FUTIL.fetchFile  || FWASM.fetchFile;
    toBlobURLFn  = FUTIL.toBlobURL  || FWASM.toBlobURL;

    if (!FFmpegClass) throw new Error(
      'FFmpeg class not found. This requires crossOriginIsolated = true.\n' +
      'The service worker (sw.js) handles this automatically — make sure it\'s in the same folder and you\'re serving over HTTP (not file://).'
    );
    if (!fetchFileFn) throw new Error('fetchFile not found in FFmpegUtil');

    ffmpeg = new FFmpegClass();
    ffmpeg.on('log', ({ message }) => parseFFmpegProgress(message));

    const BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/';
    if (toBlobURLFn) {
      const [coreURL, wasmURL] = await Promise.all([
        toBlobURLFn(BASE + 'ffmpeg-core.js',   'text/javascript'),
        toBlobURLFn(BASE + 'ffmpeg-core.wasm', 'application/wasm'),
      ]);
      await ffmpeg.load({ coreURL, wasmURL });
    } else {
      await ffmpeg.load({ coreURL: BASE + 'ffmpeg-core.js', wasmURL: BASE + 'ffmpeg-core.wasm' });
    }

    S.ffmpegReady = true;
    dot.className = 'status-dot ready';
    label.textContent = 'FFmpeg Ready';
    $('ffmpegStatus').classList.add('ready');
    updateExportInfo();
  } catch (err) {
    console.error('[SONIQ] FFmpeg init error:', err);
    dot.className = 'status-dot error';
    label.textContent = 'FFmpeg Offline';
    // Show hint if not cross-origin-isolated
    if (!window.crossOriginIsolated) {
      console.warn(
        '[SONIQ] crossOriginIsolated is false. The service worker may not have activated yet.\n' +
        'Hard-refresh the page (Ctrl+Shift+R / Cmd+Shift+R) to activate it.'
      );
    }
  }
}

let ffmpegProgressDuration = 0;
function parseFFmpegProgress(msg) {
  const m = msg.match(/time=(\d+):(\d+):(\d+\.\d+)/);
  if (m) {
    const sec = +m[1] * 3600 + +m[2] * 60 + parseFloat(m[3]);
    const total = ffmpegProgressDuration || S.duration;
    if (total > 0) setProgress(Math.min(95, (sec / total) * 90 + 5));
  }
}

// ── Ripple Effect ─────────────────────────────────────────────
function initRipple() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, .preset-btn, .format-btn, .quality-btn, .file-chip');
    if (!target) return;
    const r = document.createElement('span');
    r.className = 'ripple-effect';
    const rect = target.getBoundingClientRect();
    r.style.left = `${e.clientX - rect.left}px`;
    r.style.top  = `${e.clientY - rect.top}px`;
    target.style.position = target.style.position || 'relative';
    target.style.overflow = 'hidden';
    target.appendChild(r);
    setTimeout(() => r.remove(), 560);
  });
}

// ── Header scroll effect ──────────────────────────────────────
function initHeaderScroll() {
  const header = $('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ── Drop Zone ─────────────────────────────────────────────────
function initDropZone() {
  const zone      = $('dropzone');
  const fileInput = $('fileInput');
  const browseBtn = $('browseBtn');
  const addMoreBtn = $('addMoreBtn');

  zone.addEventListener('click', () => fileInput.click());
  browseBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
  addMoreBtn.addEventListener('click', () => fileInput.click());

  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', (e) => { if (!zone.contains(e.relatedTarget)) zone.classList.remove('dragover'); });
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const files = [...e.dataTransfer.files].filter(isAudio);
    if (files.length) addFiles(files);
  });

  fileInput.addEventListener('change', () => {
    const files = [...fileInput.files].filter(isAudio);
    if (files.length) addFiles(files);
    fileInput.value = '';
  });
}

const AUDIO_EXTS = /\.(mp3|wav|ogg|flac|aac|m4a|aiff|opus|wma|mp4|webm)$/i;
function isAudio(f) {
  return f.type.startsWith('audio/') || AUDIO_EXTS.test(f.name);
}

function addFiles(files) {
  files.forEach(f => {
    if (!S.files.find(x => x.name === f.name && x.size === f.size)) S.files.push(f);
  });
  renderQueue();
  if (S.activeIndex === -1) loadFile(0);
  showUI();
  updateFileCount();
}

function showUI() {
  [$('fileQueueSection'), $('panelsRow'), $('trimSection'), $('exportSection'), $('infoBar')].forEach(el => {
    if (el) el.classList.remove('hidden');
  });
  $('dropzone').classList.add('hidden');
}

function renderQueue() {
  const queue = $('fileQueue');
  queue.innerHTML = '';
  S.files.forEach((f, i) => {
    const chip = document.createElement('div');
    chip.className = 'file-chip' + (i === S.activeIndex ? ' active' : '');
    chip.innerHTML = `
      <span class="chip-icon"><i data-lucide="music"></i></span>
      <span class="chip-name" title="${esc(f.name)}">${esc(truncate(f.name, 22))}</span>
      <span class="chip-size">${fmtBytes(f.size)}</span>
      <button class="chip-remove" data-i="${i}" title="Remove"><i data-lucide="x"></i></button>
    `;
    chip.addEventListener('click', e => { if (!e.target.closest('.chip-remove')) loadFile(i); });
    chip.querySelector('.chip-remove').addEventListener('click', e => {
      e.stopPropagation();
      removeFile(+e.currentTarget.dataset.i);
    });
    queue.appendChild(chip);
  });
  lucide.createIcons();
}

function removeFile(i) {
  S.files.splice(i, 1);
  if (!S.files.length) {
    S.activeIndex = -1;
    [$('fileQueueSection'), $('waveformSection'), $('panelsRow'),
      $('trimSection'), $('exportSection'), $('infoBar')].forEach(el => el && el.classList.add('hidden'));
    $('dropzone').classList.remove('hidden');
    if (wavesurfer) { wavesurfer.destroy(); wavesurfer = null; }
    updateFileCount();
    return;
  }
  if (S.activeIndex >= S.files.length) S.activeIndex = S.files.length - 1;
  renderQueue();
  loadFile(S.activeIndex);
  updateFileCount();
}

function updateFileCount() {
  const badge = $('fileCountBadge');
  const lbl   = $('fileCountLabel');
  if (S.files.length) {
    lbl.textContent = `${S.files.length} File${S.files.length > 1 ? 's' : ''}`;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// ── File Loading ───────────────────────────────────────────────
async function loadFile(index) {
  S.activeIndex = index;
  const f = S.files[index];
  renderQueue();

  $('waveformSection').classList.remove('hidden');
  $('wfmFilename').textContent = f.name;
  $('wfmTime').textContent = '0:00 / 0:00';
  $('wfmSize').textContent = fmtBytes(f.size);
  S.fileSize = f.size;
  S.wsReady  = false;
  S.isPlaying = false;
  updatePlayIcon();

  initWaveSurfer(f);
  decodeFileInfo(f);
}

function initWaveSurfer(file) {
  if (wavesurfer) { wavesurfer.destroy(); wavesurfer = null; }

  wavesurfer = WaveSurfer.create({
    container:     '#waveform',
    waveColor:     'rgba(160, 18, 18, 0.55)',
    progressColor: 'rgba(220, 38, 38, 0.92)',
    cursorColor:   'rgba(255,255,255,0.75)',
    cursorWidth:   1.5,
    height:        120,
    barWidth:      2,
    barGap:        1.5,
    barRadius:     2,
    normalize:     true,
    interact:      true,
    fillParent:    true,
  });

  wavesurfer.on('ready', () => {
    S.wsReady   = true;
    S.duration  = wavesurfer.getDuration();
    S.isPlaying = false;
    updatePlayIcon();
    updateTimeDisplay();
    updateTrimEnd();
    renderRuler();
    updateInfoBar();
    updateExportInfo();
    initSpectrum();
    applyPreview();
  });

  wavesurfer.on('audioprocess', updateTimeDisplay);
  wavesurfer.on('seeking',      updateTimeDisplay);

  wavesurfer.on('play',   () => { S.isPlaying = true;  updatePlayIcon(); });
  wavesurfer.on('pause',  () => { S.isPlaying = false; updatePlayIcon(); });
  wavesurfer.on('finish', () => {
    S.isPlaying = false;
    updatePlayIcon();
    if (S.isLooping) wavesurfer.play();
  });

  wavesurfer.on('ready', () => applyPreview());

  wavesurfer.load(URL.createObjectURL(file));
}

function applyPreview() {
  if (!wavesurfer || !S.wsReady) return;
  wavesurfer.setPlaybackRate(S.speed, true); // preservePitch = true
  wavesurfer.setVolume(S.isMuted ? 0 : Math.min(3, S.volume / 100));
}

async function decodeFileInfo(file) {
  try {
    const buf = await file.arrayBuffer();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const decoded = await ctx.decodeAudioData(buf);
    S.sampleRate = decoded.sampleRate;
    S.channels   = decoded.numberOfChannels;
    ctx.close();
    updateInfoBar();
  } catch (_) {}
}

function updateInfoBar() {
  $('infoSampleRate').textContent  = S.sampleRate ? `${S.sampleRate.toLocaleString()}Hz` : '—';
  $('infoChannels').textContent    = S.channels === 1 ? 'Mono' : S.channels === 2 ? 'Stereo' : S.channels ? `${S.channels}ch` : '—';
  $('infoOrigDuration').textContent = S.duration ? fmtTime(S.duration) : '—';
  $('infoProcDuration').textContent = S.duration ? fmtTime(calcProcDur()) : '—';
  $('infoFileSize').textContent    = S.fileSize ? fmtBytes(S.fileSize) : '—';
  $('infoFormat').textContent      = S.files[S.activeIndex] ? ext(S.files[S.activeIndex].name).toUpperCase() : '—';
}

function calcProcDur() {
  if (!S.duration) return 0;
  const te = S.trimEnabled && S.trimEnd > S.trimStart ? S.trimEnd : S.duration;
  const ts = S.trimEnabled ? S.trimStart : 0;
  return (te - ts) / S.speed;
}

// ── Spectrum Analyzer ─────────────────────────────────────────
function initSpectrum() {
  if (specAnimFrame) cancelAnimationFrame(specAnimFrame);
  const COUNT = 64;
  specBars.length = 0;
  for (let i = 0; i < COUNT; i++) {
    specBars.push({ h: Math.random() * 0.04 + 0.005, target: 0, phase: i * 0.38, freq: 0.5 + Math.random() * 0.5 });
  }
  drawSpectrum();
}

function drawSpectrum() {
  const canvas = $('spectrumCanvas');
  if (!canvas) return;
  const pw = canvas.parentElement ? canvas.parentElement.offsetWidth : 800;
  const ph = canvas.parentElement ? canvas.parentElement.offsetHeight : 54;
  if (canvas.width !== pw) canvas.width = pw;
  if (canvas.height !== ph) canvas.height = ph;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, pw, ph);

  const now  = Date.now() / 1000;
  const bars = specBars.length;
  const barW = pw / bars;
  const gap  = 1.5;

  for (let i = 0; i < bars; i++) {
    const b = specBars[i];
    const env = Math.pow(Math.sin((i / bars) * Math.PI), 0.6);
    if (S.isPlaying) {
      b.target = (Math.random() * 0.5 + Math.sin(now * b.freq * 3.5 + b.phase) * 0.3 + 0.3) * env * 0.82 + 0.02;
    } else {
      b.target = (Math.sin(now * b.freq + b.phase) * 0.5 + 0.5) * env * 0.07 + 0.005;
    }
    b.h += (b.target - b.h) * (b.target > b.h ? 0.3 : 0.1);

    const bh = b.h * ph;
    if (bh < 0.5) continue;
    const x = i * barW + gap / 2;
    const y = ph - bh;

    const g = ctx.createLinearGradient(0, ph, 0, y);
    g.addColorStop(0,   'rgba(176, 20, 20, 0.95)');
    g.addColorStop(0.4, 'rgba(220, 38, 38, 0.7)');
    g.addColorStop(1,   'rgba(239, 68, 68, 0.1)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, barW - gap, bh);
  }

  specAnimFrame = requestAnimationFrame(drawSpectrum);
}

// ── Ruler ─────────────────────────────────────────────────────
function renderRuler() {
  const ruler = $('waveformRuler');
  if (!ruler || !S.duration) return;
  ruler.innerHTML = '';
  const step = S.duration <= 30 ? 5 : S.duration <= 90 ? 10 : S.duration <= 300 ? 30 : S.duration <= 900 ? 60 : 120;
  for (let t = 0; t <= S.duration; t += step) {
    const el = document.createElement('div');
    el.className = 'ruler-tick';
    el.style.left = `${(t / S.duration) * 100}%`;
    el.innerHTML = `<div class="ruler-tick-line"></div><span class="ruler-tick-label">${fmtTime(t)}</span>`;
    ruler.appendChild(el);
  }
}

// ── Transport ─────────────────────────────────────────────────
function initTransport() {
  $('playBtn').addEventListener('click', togglePlay);
  $('stopBtn').addEventListener('click', stop);
  $('restartBtn').addEventListener('click', restart);
  $('rewind5Btn').addEventListener('click', () => seek(-5));
  $('fastforward5Btn').addEventListener('click', () => seek(5));
  $('loopBtn').addEventListener('click', toggleLoop);
  $('muteBtn').addEventListener('click', toggleMute);
  $('zoomInBtn').addEventListener('click', () => changeZoom(1));
  $('zoomOutBtn').addEventListener('click', () => changeZoom(-1));

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space')       { e.preventDefault(); togglePlay(); }
    if (e.code === 'ArrowLeft')   { e.preventDefault(); seek(-5); }
    if (e.code === 'ArrowRight')  { e.preventDefault(); seek(5); }
    if (e.key === 'm' || e.key === 'M') toggleMute();
  });
}

function togglePlay() {
  if (!wavesurfer || !S.wsReady) return;
  wavesurfer.playPause();
}

function stop() {
  if (!wavesurfer || !S.wsReady) return;
  wavesurfer.stop();
  S.isPlaying = false;
  updatePlayIcon();
}

function restart() {
  if (!wavesurfer || !S.wsReady) return;
  wavesurfer.setTime(0);
  if (!S.isPlaying) wavesurfer.play();
}

function seek(delta) {
  if (!wavesurfer || !S.wsReady) return;
  wavesurfer.setTime(clamp(wavesurfer.getCurrentTime() + delta, 0, S.duration));
}

function toggleLoop() {
  S.isLooping = !S.isLooping;
  $('loopBtn').classList.toggle('active', S.isLooping);
}

function toggleMute() {
  S.isMuted = !S.isMuted;
  $('muteIcon').setAttribute('data-lucide', S.isMuted ? 'volume-x' : 'volume-2');
  $('muteBtn').classList.toggle('active', S.isMuted);
  lucide.createIcons();
  applyPreview();
}

function changeZoom(dir) {
  const lvls = [1, 2, 4, 8, 16, 32];
  let i = lvls.indexOf(S.zoom);
  i = clamp(i + dir, 0, lvls.length - 1);
  S.zoom = lvls[i];
  $('zoomLabel').textContent = `${S.zoom}x`;
  if (wavesurfer) wavesurfer.zoom(50 * S.zoom);
}

function updatePlayIcon() {
  const icon = $('playIcon');
  const btn  = $('playBtn');
  if (!icon) return;
  icon.setAttribute('data-lucide', S.isPlaying ? 'pause' : 'play');
  btn.classList.toggle('playing', S.isPlaying);
  lucide.createIcons();
}

function updateTimeDisplay() {
  if (!wavesurfer || !S.wsReady) return;
  $('wfmTime').textContent = `${fmtTime(wavesurfer.getCurrentTime())} / ${fmtTime(S.duration)}`;
}

// ── Knobs ─────────────────────────────────────────────────────
function initKnobs() {
  // Global drag handlers (set once)
  document.addEventListener('mousemove', (e) => {
    if (!activeKnobDrag) return;
    const { update, startY, startVal, min, max } = activeKnobDrag;
    const delta = (startY - e.clientY) * ((max - min) / 220);
    update(startVal + delta);
  });
  document.addEventListener('mouseup', () => {
    if (!activeKnobDrag) return;
    activeKnobDrag.canvas.classList.remove('dragging');
    activeKnobDrag = null;
    document.body.style.cursor = '';
  });
  document.addEventListener('touchend', () => {
    if (!activeKnobDrag) return;
    activeKnobDrag.canvas.classList.remove('dragging');
    activeKnobDrag = null;
  });

  mountKnob('speedKnob',  'speedSlider',  'speedKnobVal',  'speedSliderVal',  fmtSpeed, v => {
    S.speed = v; applyPreview(); updateInfoBar(); updateExportInfo(); saveSettings();
  });
  mountKnob('pitchKnob',  'pitchSlider',  'pitchKnobVal',  'pitchSliderVal',  fmtPitch, v => {
    S.pitch = v; updateExportInfo(); saveSettings();
  });
  mountKnob('volumeKnob', 'volumeSlider', 'volumeKnobVal', 'volumeSliderVal', fmtVol, v => {
    S.volume = v; applyPreview(); updateVolWarning(); updateExportInfo(); saveSettings();
  });
}

function mountKnob(cid, sid, cvid, svid, fmt, onChange) {
  const canvas = $(cid);
  const slider = $(sid);
  const cval   = $(cvid);
  const sval   = $(svid);

  const min  = parseFloat(canvas.dataset.min);
  const max  = parseFloat(canvas.dataset.max);
  const step = parseFloat(canvas.dataset.step);

  // Apply loaded settings to initial value
  const settingMap = { speedKnob: 'speed', pitchKnob: 'pitch', volumeKnob: 'volume' };
  const stateKey = settingMap[cid];
  let cur = S[stateKey] !== undefined ? S[stateKey] : parseFloat(canvas.dataset.value);

  function set(v) {
    cur = clamp(snap(v, step), min, max);
    canvas.dataset.value = cur;
    drawKnob(canvas, cur, min, max);
    const f = fmt(cur);
    cval.textContent  = f;
    sval.textContent  = f;
    slider.value      = cur;
    fillSlider(slider);
    onChange(cur);
  }

  // Initialize
  set(cur);

  slider.value = cur;
  slider.addEventListener('input', () => set(parseFloat(slider.value)));

  canvas.addEventListener('mousedown', (e) => {
    activeKnobDrag = { update: set, startY: e.clientY, startVal: cur, min, max, canvas };
    canvas.classList.add('dragging');
    document.body.style.cursor = 'ns-resize';
    e.preventDefault();
  });

  canvas.addEventListener('touchstart', (e) => {
    activeKnobDrag = { update: set, startY: e.touches[0].clientY, startVal: cur, min, max, canvas };
    canvas.classList.add('dragging');
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (!activeKnobDrag || activeKnobDrag.canvas !== canvas) return;
    const delta = (activeKnobDrag.startY - e.touches[0].clientY) * ((max - min) / 220);
    set(activeKnobDrag.startVal + delta);
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    set(cur + (e.deltaY < 0 ? 1 : -1) * step);
  }, { passive: false });

  canvas.addEventListener('dblclick', () => {
    const defaults = { speedKnob: 1, pitchKnob: 0, volumeKnob: 100 };
    set(defaults[cid] ?? 1);
  });
}

function drawKnob(canvas, value, min, max) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R = W * 0.37;

  ctx.clearRect(0, 0, W, H);

  const startA = (Math.PI * 3) / 4;  // -225°
  const endA   = Math.PI * 9 / 4;    // +45° (=405°)
  const frac   = (value - min) / (max - min);
  const curA   = startA + frac * (endA - startA);

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, R, startA, endA);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Value arc
  if (frac > 0.001) {
    const arcGrad = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
    arcGrad.addColorStop(0, 'rgba(153,27,27,0.9)');
    arcGrad.addColorStop(1, 'rgba(239,68,68,1)');
    ctx.beginPath();
    ctx.arc(cx, cy, R, startA, curA);
    ctx.strokeStyle = arcGrad;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Knob body — subtle radial gradient
  const bodyGrad = ctx.createRadialGradient(cx - R * 0.18, cy - R * 0.18, 0, cx, cy, R * 0.66);
  bodyGrad.addColorStop(0, '#2c2c2c');
  bodyGrad.addColorStop(1, '#111111');
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.64, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Knob rim
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.64, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Indicator line
  const ix = cx + Math.cos(curA) * R * 0.42;
  const iy = cy + Math.sin(curA) * R * 0.42;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(ix, iy);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Indicator dot
  ctx.beginPath();
  ctx.arc(ix, iy, 2.8, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.shadowBlur  = 8;
  ctx.shadowColor = 'rgba(239,68,68,0.9)';
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ── Sliders ───────────────────────────────────────────────────
function initSliders() {
  function bind(sid, valId, fmt, cb) {
    const sl  = $(sid);
    const val = $(valId);
    if (!sl) return;
    function update() {
      const v = parseFloat(sl.value);
      if (val) val.textContent = fmt(v);
      fillSlider(sl);
      cb(v);
    }
    sl.addEventListener('input', update);
    fillSlider(sl);
  }

  // Apply stored values to all non-knob sliders
  const sliderInits = {
    bassSlider: S.bass, midSlider: S.mid, trebleSlider: S.treble,
    reverbAmount: S.reverbAmount, echoDelay: S.echoDelay,
    fadeInDur: S.fadeInDur, fadeOutDur: S.fadeOutDur,
  };
  Object.entries(sliderInits).forEach(([id, val]) => {
    const el = $(id);
    if (el) el.value = val;
  });

  bind('bassSlider',   'bassSliderVal',   v => `${v>=0?'+':''}${v} dB`, v => { S.bass   = v; updateExportInfo(); saveSettings(); });
  bind('midSlider',    'midSliderVal',    v => `${v>=0?'+':''}${v} dB`, v => { S.mid    = v; updateExportInfo(); saveSettings(); });
  bind('trebleSlider', 'trebleSliderVal', v => `${v>=0?'+':''}${v} dB`, v => { S.treble = v; updateExportInfo(); saveSettings(); });
  bind('reverbAmount', 'reverbAmountVal', v => `${v}`,   v => { S.reverbAmount = v; });
  bind('echoDelay',    'echoDelayVal',    v => `${v}ms`, v => { S.echoDelay = v; });
  bind('fadeInDur',    'fadeInDurVal',    v => `${parseFloat(v).toFixed(1)}s`, v => { S.fadeInDur  = v; });
  bind('fadeOutDur',   'fadeOutDurVal',   v => `${parseFloat(v).toFixed(1)}s`, v => { S.fadeOutDur = v; });

  // Init all slider fills (including knob-linked ones)
  document.querySelectorAll('.styled-slider').forEach(fillSlider);
}

function fillSlider(sl) {
  const min = parseFloat(sl.min);
  const max = parseFloat(sl.max);
  const val = parseFloat(sl.value);
  const pct = ((val - min) / (max - min)) * 100;

  if (sl.classList.contains('slider-eq')) {
    const center = ((0 - min) / (max - min)) * 100;
    const lo = Math.min(pct, center), hi = Math.max(pct, center);
    sl.style.background = `linear-gradient(to right,
      rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.07) ${lo}%,
      rgba(255,255,255,0.28) ${lo}%, rgba(255,255,255,0.28) ${hi}%,
      rgba(255,255,255,0.07) ${hi}%, rgba(255,255,255,0.07) 100%)`;
  } else {
    sl.style.background = `linear-gradient(to right,
      rgba(176,28,28,0.85) 0%, rgba(239,68,68,0.85) ${pct}%,
      rgba(255,255,255,0.07) ${pct}%, rgba(255,255,255,0.07) 100%)`;
  }
}

function updateVolWarning() {
  const warning = $('volWarning');
  if (warning) warning.classList.toggle('hidden', S.volume <= 100);
}

// ── Presets ───────────────────────────────────────────────────
function initPresets() {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyPreset({
        speed:  parseFloat(btn.dataset.speed),
        pitch:  parseFloat(btn.dataset.pitch),
        volume: parseFloat(btn.dataset.volume),
        reverb: +btn.dataset.reverb === 1,
        echo:   +btn.dataset.echo   === 1,
      });
      btn.classList.add('flash');
      setTimeout(() => btn.classList.remove('flash'), 220);
    });
  });
}

function applyPreset({ speed, pitch, volume, reverb, echo }) {
  S.speed  = speed;
  S.pitch  = pitch;
  S.volume = volume;
  S.reverb = reverb;
  S.echo   = echo;

  setKnob('speedKnob',  speed,  fmtSpeed);
  setKnob('pitchKnob',  pitch,  fmtPitch);
  setKnob('volumeKnob', volume, fmtVol);

  ['speed', 'pitch', 'volume'].forEach(key => {
    const sl = $(`${key}Slider`);
    sl.value = S[key];
    fillSlider(sl);
    $(`${key}SliderVal`).textContent = ({ speed: fmtSpeed, pitch: fmtPitch, volume: fmtVol }[key])(S[key]);
  });

  $('reverbToggle').checked = reverb;
  $('echoToggle').checked   = echo;
  $('reverbToggle').dispatchEvent(new Event('change'));
  $('echoToggle').dispatchEvent(new Event('change'));

  applyPreview();
  updateVolWarning();
  updateInfoBar();
  updateExportInfo();
  saveSettings();
}

function setKnob(cid, value, fmt) {
  const canvas = $(cid);
  if (!canvas) return;
  const min = parseFloat(canvas.dataset.min);
  const max = parseFloat(canvas.dataset.max);
  const v = clamp(value, min, max);
  canvas.dataset.value = v;
  drawKnob(canvas, v, min, max);
  const vid = cid.replace('Knob', 'KnobVal');
  const el = $(vid);
  if (el) el.textContent = fmt(v);
}

// ── Effects ───────────────────────────────────────────────────
function initEffects() {
  bindToggle('reverbToggle',   'reverbSub',   v => { S.reverb    = v; });
  bindToggle('echoToggle',     'echoSub',     v => { S.echo      = v; });
  bindToggle('fadeInToggle',   'fadeInSub',   v => { S.fadeIn    = v; });
  bindToggle('fadeOutToggle',  'fadeOutSub',  v => { S.fadeOut   = v; });
  $('normalizeToggle').addEventListener('change', e => { S.normalize = e.target.checked; });
  $('monoToggle').addEventListener('change',      e => { S.mono      = e.target.checked; });
}

function bindToggle(tid, subId, cb) {
  const tog = $(tid);
  const sub = subId ? $(subId) : null;
  tog.addEventListener('change', () => {
    cb(tog.checked);
    if (sub) sub.style.display = tog.checked ? 'grid' : 'none';
  });
  if (sub) sub.style.display = tog.checked ? 'grid' : 'none';
}

// ── Trim ──────────────────────────────────────────────────────
function initTrim() {
  const tog = $('trimToggle');
  const controls = $('trimControls');
  controls.style.display = 'none';

  tog.addEventListener('change', () => {
    S.trimEnabled = tog.checked;
    controls.style.display = tog.checked ? 'block' : 'none';
    updateInfoBar();
    updateExportInfo();
  });

  function onTrimChange() {
    S.trimStart = parseFloat($('trimStart').value) || 0;
    S.trimEnd   = parseFloat($('trimEnd').value)   || 0;
    const dur = S.trimEnd > S.trimStart ? S.trimEnd - S.trimStart : 0;
    $('trimDurVal').textContent = dur ? fmtTime(dur) : '—';
    updateInfoBar();
    updateExportInfo();
  }

  $('trimStart').addEventListener('input', onTrimChange);
  $('trimEnd').addEventListener('input',   onTrimChange);

  $('trimSetPlayhead').addEventListener('click', () => {
    if (!wavesurfer || !S.wsReady) return;
    $('trimStart').value = wavesurfer.getCurrentTime().toFixed(2);
    onTrimChange();
  });

  $('trimSetAll').addEventListener('click', () => {
    $('trimStart').value = '0';
    $('trimEnd').value   = S.duration.toFixed(2);
    onTrimChange();
  });
}

function updateTrimEnd() {
  const el = $('trimEnd');
  if (el && S.duration) {
    el.value = S.duration.toFixed(2);
    S.trimEnd = S.duration;
    $('trimDurVal').textContent = fmtTime(S.duration);
  }
}

// ── Export ────────────────────────────────────────────────────
function initExport() {
  // Format buttons
  document.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.exportFormat = btn.dataset.format;
      ['mp3','ogg','wav','flac'].forEach(f => {
        const row = $(`${f}Quality`);
        if (row) row.classList.toggle('hidden', f !== S.exportFormat);
      });
      updateExportInfo();
      saveSettings();
    });
    // Set initial active state from loaded settings
    if (btn.dataset.format === S.exportFormat) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Sync format quality panel visibility
  ['mp3','ogg','wav','flac'].forEach(f => {
    const row = $(`${f}Quality`);
    if (row) row.classList.toggle('hidden', f !== S.exportFormat);
  });

  // Quality buttons
  document.querySelectorAll('.quality-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.quality-row');
      row.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const fmt = row.id.replace('Quality', '');
      S.exportQuality[fmt] = btn.dataset.quality;
      updateExportInfo();
      saveSettings();
    });
  });

  $('exportBtn').addEventListener('click', exportAudio);
  updateExportInfo();
}

function updateExportInfo() {
  const el = $('exportInfoText');
  if (!el) return;
  const dur = calcProcDur();
  const parts = [];
  const fmtNames = { mp3: `MP3 ${S.exportQuality.mp3}`, ogg: `OGG Q${S.exportQuality.ogg}`, wav: `WAV ${S.exportQuality.wav}`, flac: `FLAC Level ${S.exportQuality.flac}` };
  parts.push(fmtNames[S.exportFormat] || S.exportFormat.toUpperCase());
  if (S.speed !== 1)   parts.push(`Speed: ${fmtSpeed(S.speed)}`);
  if (S.pitch !== 0)   parts.push(`Pitch: ${fmtPitch(S.pitch)}`);
  if (S.volume !== 100) parts.push(`Volume: ${fmtVol(S.volume)}`);
  if (S.volume > 100)  parts.push('Limiter: ON');
  if (dur)             parts.push(`Output: ~${fmtTime(dur)}`);
  el.textContent = parts.join('  ·  ');
}

async function exportAudio() {
  if (!S.ffmpegReady) {
    alert('FFmpeg is not ready.\n\nIf you\'re on GitHub Pages or a static host, the service worker (sw.js) needs one page reload to activate.\n\nSteps:\n1. Make sure sw.js is in the same folder as index.html\n2. Reload the page (the SW activates after first load)\n3. Try exporting again\n\nIf serving locally, use a local HTTP server — not file:// protocol.');
    return;
  }
  const file = S.files[S.activeIndex];
  if (!file) return;

  const fmt = S.exportFormat;
  const outName = `soniq_${baseName(file.name)}.${fmt}`;

  showOverlay(`Exporting as ${fmt.toUpperCase()}…`, 'Building FFmpeg filter chain…');

  try {
    const inputExt  = ext(file.name) || 'mp3';
    const inputName = `input.${inputExt}`;
    await ffmpeg.writeFile(inputName, await fetchFileFn(file));

    const filters = buildFilters();
    const args    = buildArgs(inputName, outName, filters);

    ffmpegProgressDuration = calcProcDur() || S.duration;
    setProgress(5);

    await ffmpeg.exec(args);

    setProgress(92);
    $('processingSub').textContent = 'Reading output…';

    const data = await ffmpeg.readFile(outName);
    const mime = { mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', flac: 'audio/flac' }[fmt] || 'audio/mpeg';
    const blob = new Blob([data.buffer], { type: mime });

    const url = URL.createObjectURL(blob);
    const a   = Object.assign(document.createElement('a'), { href: url, download: outName });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 15000);

    setProgress(100);
    try { await ffmpeg.deleteFile(inputName); } catch (_) {}
    try { await ffmpeg.deleteFile(outName);   } catch (_) {}
    setTimeout(hideOverlay, 700);
  } catch (err) {
    console.error('[SONIQ] Export error:', err);
    hideOverlay();
    alert(`Export failed:\n${err.message || err}`);
  }
}

/* ── FFmpeg Filter Chain ─────────────────────────────────────── */
function buildFilters() {
  const sr = S.sampleRate || 44100;
  const inner = [];

  // Trim
  if (S.trimEnabled && S.trimEnd > S.trimStart) {
    inner.push(`atrim=start=${S.trimStart}:end=${S.trimEnd}`);
    inner.push('asetpts=PTS-STARTPTS');
  }

  // Pitch (asetrate changes the "source" sample rate → shifts pitch)
  if (S.pitch !== 0) {
    const newSR = Math.round(sr * Math.pow(2, S.pitch / 12));
    inner.push(`asetrate=${newSR}`);
    inner.push(`aresample=${sr}:resampler=swr:precision=28`);
  }

  // Speed / Tempo
  if (Math.abs(S.speed - 1) > 0.001) {
    atempoChain(S.speed).forEach(s => inner.push(s));
  }

  // Volume — with hard limiter above 100% to prevent clipping
  if (S.volume !== 100) {
    inner.push(`volume=${(S.volume / 100).toFixed(4)}`);
    if (S.volume > 100) {
      inner.push('alimiter=level_in=1:level_out=1:limit=1:attack=7:release=50:asc=1');
    }
  }

  // EQ — 3-band parametric equalizer
  if (S.bass   !== 0) inner.push(`equalizer=f=100:width_type=o:width=2:g=${S.bass}`);
  if (S.mid    !== 0) inner.push(`equalizer=f=1000:width_type=o:width=2:g=${S.mid}`);
  if (S.treble !== 0) inner.push(`equalizer=f=8000:width_type=o:width=2:g=${S.treble}`);

  // Reverb (multi-tap echo approximation)
  if (S.reverb) {
    const intensity = Math.min(S.reverbAmount / 10, 0.9);
    const d  = [60, 120, 200].map(n => n + Math.round(intensity * 100));
    const dc = [0.4, 0.3, 0.2].map(n => +(n + intensity * 0.3).toFixed(2));
    inner.push(`aecho=0.8:0.88:${d[0]}|${d[1]}|${d[2]}:${dc[0]}|${dc[1]}|${dc[2]}`);
  }

  // Echo / Delay
  if (S.echo) inner.push(`aecho=0.7:0.85:${S.echoDelay}:0.5`);

  // Dynamic normalization
  if (S.normalize) inner.push('dynaudnorm=p=0.95:m=30');

  // Fade in/out
  if (S.fadeIn  && S.fadeInDur  > 0) inner.push(`afade=t=in:ss=0:d=${S.fadeInDur}`);
  if (S.fadeOut && S.fadeOutDur > 0) {
    const start = Math.max(0, calcProcDur() - S.fadeOutDur);
    inner.push(`afade=t=out:st=${start.toFixed(2)}:d=${S.fadeOutDur}`);
  }

  // Stereo → Mono
  if (S.mono) inner.push('pan=mono|c0=0.5*c0+0.5*c1');

  // Wrap with float precision + quality resample when doing any processing
  if (inner.length === 0) return [];

  const needsResample = S.pitch !== 0;
  const out = ['aformat=sample_fmts=fltp', ...inner];

  // Final resample only if not already done by pitch shift step
  if (!needsResample) out.push(`aresample=${sr}:resampler=swr:precision=28`);

  return out;
}

function atempoChain(speed) {
  const filters = [];
  let s = speed;
  if (s < 0.5) {
    while (s < 0.5) { filters.push('atempo=0.5'); s /= 0.5; }
    if (Math.abs(s - 1) > 0.001) filters.push(`atempo=${s.toFixed(6)}`);
  } else if (s > 2) {
    while (s > 2) { filters.push('atempo=2.0'); s /= 2; }
    if (Math.abs(s - 1) > 0.001) filters.push(`atempo=${s.toFixed(6)}`);
  } else {
    filters.push(`atempo=${s.toFixed(6)}`);
  }
  return filters;
}

function buildArgs(inputName, outName, filters) {
  const args = ['-i', inputName];
  if (filters.length) args.push('-af', filters.join(','));
  const fmt = S.exportFormat;
  const q   = S.exportQuality;
  if (fmt === 'mp3')  args.push('-c:a', 'libmp3lame',  '-b:a', q.mp3, '-ar', String(S.sampleRate || 44100));
  if (fmt === 'ogg')  args.push('-c:a', 'libvorbis',   '-q:a', q.ogg);
  if (fmt === 'wav')  args.push('-c:a', q.wav);
  if (fmt === 'flac') args.push('-c:a', 'flac', '-compression_level', q.flac);
  args.push('-y', outName);
  return args;
}

/* ── Overlay ─────────────────────────────────────────────────── */
function showOverlay(label, sub) {
  $('processingLabel').textContent = label;
  $('processingSub').textContent   = sub;
  setProgress(0);
  $('processingOverlay').classList.remove('hidden');
}

function hideOverlay() { $('processingOverlay').classList.add('hidden'); }

function setProgress(pct) { $('processingBar').style.width = `${pct}%`; }

/* ── Utilities ─────────────────────────────────────────────────── */
function fmtTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function fmtBytes(b) {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1048576).toFixed(1)} MB`;
}

function fmtSpeed(v) { return `${parseFloat(v).toFixed(2)}x`; }
function fmtPitch(v) { const n = parseFloat(v); return `${n>=0?'+':''}${n.toFixed(1)} st`; }
function fmtVol(v)   { return `${Math.round(v)}%`; }

function truncate(s, max) {
  if (s.length <= max) return s;
  const e = ext(s);
  return s.slice(0, max - e.length - 4) + '…' + (e ? `.${e}` : '');
}

function ext(name)      { const p = name.split('.'); return p.length > 1 ? p[p.length-1].toLowerCase() : ''; }
function baseName(name) { const p = name.split('.'); return p.slice(0, -1).join('.') || name; }
function esc(s)         { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function snap(v, step)  { return Math.round(v / step) * step; }

/* ── Resize ────────────────────────────────────────────────────── */
window.addEventListener('resize', debounce(() => {
  if (S.wsReady) renderRuler();
  const c = $('spectrumCanvas');
  if (c && c.parentElement) {
    c.width  = c.parentElement.offsetWidth;
    c.height = c.parentElement.offsetHeight;
  }
}, 160));

function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
