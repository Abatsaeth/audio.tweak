/* ============================================================
   SONIQ STUDIO — script.js
   Audio processing engine: Web Audio API + FFmpeg.wasm
   ============================================================ */

'use strict';

// ── State ────────────────────────────────────────────────────
const state = {
  files: [],
  activeIndex: -1,
  isPlaying: false,
  isLooping: false,
  isMuted: false,
  zoom: 1,

  // Processing params
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

  // FFmpeg & WaveSurfer refs
  ffmpegReady: false,
  wsReady: false,
  duration: 0,
  sampleRate: 44100,
  channels: 2,
  fileSize: 0,
  audioBuffer: null,
};

// ── FFmpeg ────────────────────────────────────────────────────
let ffmpeg = null;
let fetchFileFn = null;
let toBlobURLFn = null;

// ── WaveSurfer ────────────────────────────────────────────────
let wavesurfer = null;

// ── Web Audio (spectrum only) ─────────────────────────────────
let audioCtx = null;
let analyser = null;
let spectrumSource = null;
let spectrumAnimFrame = null;

// ── DOM refs ─────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelector(sel);

// ── Init ─────────────────────────────────────────────────────
(async () => {
  registerServiceWorker();
  initLucide();
  initDropZone();
  initTransportControls();
  initKnobs();
  initSliders();
  initPresets();
  initEffects();
  initTrim();
  initExport();
  await initFFmpeg();
})();

// ── Service Worker ────────────────────────────────────────────
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// ── Lucide Icons ──────────────────────────────────────────────
function initLucide() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// ── FFmpeg Init ───────────────────────────────────────────────
async function initFFmpeg() {
  const dot = $('ffmpegDot');
  const label = $('ffmpegLabel');

  dot.className = 'status-dot loading';
  label.textContent = 'Loading FFmpeg';

  try {
    // Resolve globals from UMD bundles
    const FFmpegNS = window.FFmpegWASM || window.FFmpeg || {};
    const FFmpegUtilNS = window.FFmpegUtil || {};

    const FFmpegClass = FFmpegNS.FFmpeg;
    fetchFileFn = FFmpegUtilNS.fetchFile || FFmpegNS.fetchFile;
    toBlobURLFn = FFmpegUtilNS.toBlobURL || FFmpegNS.toBlobURL;

    if (!FFmpegClass) throw new Error('FFmpeg class not found');
    if (!fetchFileFn) throw new Error('fetchFile not found');

    ffmpeg = new FFmpegClass();

    ffmpeg.on('log', ({ message }) => {
      // Optionally log progress messages
      parseFFmpegProgress(message);
    });

    const BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/';

    if (toBlobURLFn) {
      const coreURL = await toBlobURLFn(BASE + 'ffmpeg-core.js', 'text/javascript');
      const wasmURL = await toBlobURLFn(BASE + 'ffmpeg-core.wasm', 'application/wasm');
      await ffmpeg.load({ coreURL, wasmURL });
    } else {
      // Fallback: direct URL (may fail without service worker COOP/COEP headers)
      await ffmpeg.load({
        coreURL: BASE + 'ffmpeg-core.js',
        wasmURL: BASE + 'ffmpeg-core.wasm',
      });
    }

    state.ffmpegReady = true;
    dot.className = 'status-dot ready';
    label.textContent = 'FFmpeg Ready';
    const badge = $('ffmpegStatus');
    badge.classList.add('ready');
    updateExportInfo();
  } catch (err) {
    console.error('FFmpeg load error:', err);
    dot.className = 'status-dot error';
    label.textContent = 'FFmpeg Unavailable';
    // Still allow export button (will show error)
  }
}

let ffmpegProgressDuration = 0;
function parseFFmpegProgress(msg) {
  const timeMatch = msg.match(/time=(\d+):(\d+):(\d+\.\d+)/);
  if (timeMatch) {
    const sec = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseFloat(timeMatch[3]);
    const totalEst = ffmpegProgressDuration || state.duration;
    if (totalEst > 0) {
      const pct = Math.min(100, (sec / totalEst) * 100);
      setProcessingProgress(pct);
    }
  }
}

// ── Drop Zone ─────────────────────────────────────────────────
function initDropZone() {
  const zone = $('dropzone');
  const fileInput = $('fileInput');
  const browseBtn = $('browseBtn');
  const addMoreBtn = $('addMoreBtn');

  zone.addEventListener('click', () => fileInput.click());
  browseBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
  addMoreBtn.addEventListener('click', () => fileInput.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(isAudioFile);
    if (files.length) addFiles(files);
  });

  fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files).filter(isAudioFile);
    if (files.length) addFiles(files);
    fileInput.value = '';
  });
}

function isAudioFile(f) {
  return f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|aac|m4a|aiff|opus|wma)$/i.test(f.name);
}

function addFiles(files) {
  files.forEach((f) => {
    if (!state.files.find((x) => x.name === f.name && x.size === f.size)) {
      state.files.push(f);
    }
  });
  renderFileQueue();
  if (state.activeIndex === -1) loadFile(0);
  show($('fileQueueSection'));
  show($('panelsRow'));
  show($('trimSection'));
  show($('exportSection'));
  show($('infoBar'));
  updateFileCount();
}

function renderFileQueue() {
  const queue = $('fileQueue');
  queue.innerHTML = '';
  state.files.forEach((f, i) => {
    const chip = document.createElement('div');
    chip.className = 'file-chip' + (i === state.activeIndex ? ' active' : '');
    chip.innerHTML = `
      <span class="chip-icon"><i data-lucide="music"></i></span>
      <span class="chip-name" title="${esc(f.name)}">${esc(truncateName(f.name))}</span>
      <span class="chip-size">${formatBytes(f.size)}</span>
      <button class="chip-remove" data-index="${i}" title="Remove"><i data-lucide="x"></i></button>
    `;
    chip.addEventListener('click', (e) => {
      if (!e.target.closest('.chip-remove')) loadFile(i);
    });
    chip.querySelector('.chip-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      removeFile(parseInt(e.currentTarget.dataset.index));
    });
    queue.appendChild(chip);
  });
  lucide.createIcons();
}

function removeFile(index) {
  state.files.splice(index, 1);
  if (state.files.length === 0) {
    state.activeIndex = -1;
    hide($('fileQueueSection'));
    hide($('waveformSection'));
    hide($('panelsRow'));
    hide($('trimSection'));
    hide($('exportSection'));
    hide($('infoBar'));
    show($('dropzone'));
    if (wavesurfer) { wavesurfer.empty(); }
    updateFileCount();
    return;
  }
  if (state.activeIndex >= state.files.length) {
    state.activeIndex = state.files.length - 1;
  }
  renderFileQueue();
  loadFile(state.activeIndex);
  updateFileCount();
}

function updateFileCount() {
  const badge = $('fileCountBadge');
  const label = $('fileCountLabel');
  if (state.files.length > 0) {
    label.textContent = `${state.files.length} File${state.files.length > 1 ? 's' : ''}`;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// ── File Loading / WaveSurfer ─────────────────────────────────
async function loadFile(index) {
  state.activeIndex = index;
  const file = state.files[index];
  renderFileQueue();

  show($('waveformSection'));
  $('wfmFilename').textContent = file.name;
  $('wfmTime').textContent = '0:00 / 0:00';
  $('wfmSize').textContent = formatBytes(file.size);
  state.fileSize = file.size;
  state.wsReady = false;
  state.isPlaying = false;

  updatePlayIcon();
  hide($('dropzone'));
  updateInfoBar({});

  initWaveSurfer(file);
  decodeFileInfo(file);
}

function initWaveSurfer(file) {
  if (wavesurfer) {
    wavesurfer.destroy();
    wavesurfer = null;
  }

  wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'rgba(180, 20, 20, 0.55)',
    progressColor: 'rgba(220, 38, 38, 0.9)',
    cursorColor: 'rgba(255,255,255,0.7)',
    cursorWidth: 1.5,
    height: 120,
    barWidth: 2,
    barGap: 1.5,
    barRadius: 2,
    normalize: true,
    interact: true,
    minPxPerSec: 50,
    fillParent: true,
  });

  wavesurfer.on('ready', () => {
    state.wsReady = true;
    state.duration = wavesurfer.getDuration();
    state.isPlaying = false;
    updatePlayIcon();
    updateTimeDisplay();
    updateTrimEnd();
    renderRuler();
    updateInfoBar({});
    updateExportInfo();
    initSpectrum();
  });

  wavesurfer.on('audioprocess', () => {
    updateTimeDisplay();
  });

  wavesurfer.on('seeking', () => {
    updateTimeDisplay();
  });

  wavesurfer.on('play', () => {
    state.isPlaying = true;
    updatePlayIcon();
    resumeAudioCtx();
  });

  wavesurfer.on('pause', () => {
    state.isPlaying = false;
    updatePlayIcon();
  });

  wavesurfer.on('finish', () => {
    state.isPlaying = false;
    updatePlayIcon();
    if (state.isLooping) wavesurfer.play();
  });

  const url = URL.createObjectURL(file);
  wavesurfer.load(url);

  // Apply current speed/volume
  wavesurfer.on('ready', () => {
    applyPreviewParams();
  });
}

function applyPreviewParams() {
  if (!wavesurfer || !state.wsReady) return;
  wavesurfer.setPlaybackRate(state.speed, true); // preservePitch = true
  const vol = state.isMuted ? 0 : (state.volume / 100);
  wavesurfer.setVolume(Math.min(3, vol));
}

async function decodeFileInfo(file) {
  try {
    const arrayBuf = await file.arrayBuffer();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const decoded = await ctx.decodeAudioData(arrayBuf);
    state.sampleRate = decoded.sampleRate;
    state.channels = decoded.numberOfChannels;
    ctx.close();
    updateInfoBar({});
  } catch (e) {
    // fallback
  }
}

function updateInfoBar(override) {
  const sr = override.sampleRate ?? state.sampleRate;
  const ch = override.channels ?? state.channels;
  const dur = override.duration ?? state.duration;
  const procDur = computeProcessedDuration();

  $('infoSampleRate').textContent = sr ? `${sr.toLocaleString()}Hz` : '—';
  $('infoChannels').textContent = ch === 1 ? 'Mono' : ch === 2 ? 'Stereo' : ch ? `${ch}ch` : '—';
  $('infoOrigDuration').textContent = dur ? formatTime(dur) : '—';
  $('infoProcDuration').textContent = procDur ? formatTime(procDur) : '—';
  $('infoFileSize').textContent = state.fileSize ? formatBytes(state.fileSize) : '—';
  $('infoFormat').textContent = state.files[state.activeIndex]
    ? getFileExt(state.files[state.activeIndex].name).toUpperCase()
    : '—';
}

function computeProcessedDuration() {
  if (!state.duration) return 0;
  const trimEnd = state.trimEnabled && state.trimEnd > state.trimStart ? state.trimEnd : state.duration;
  const trimStart = state.trimEnabled ? state.trimStart : 0;
  const clippedDur = trimEnd - trimStart;
  return clippedDur / state.speed;
}

// ── Spectrum Analyzer ─────────────────────────────────────────
const spectrumState = {
  bars: [],
  initialized: false,
};

function initSpectrum() {
  if (spectrumAnimFrame) cancelAnimationFrame(spectrumAnimFrame);

  const canvas = $('spectrumCanvas');
  if (!canvas) return;

  const bars = 64;
  spectrumState.bars = Array.from({ length: bars }, (_, i) => ({
    height: Math.random() * 0.08 + 0.01,
    target: 0,
    phase: i * 0.35,
    freq: 0.6 + Math.random() * 0.4,
  }));
  spectrumState.initialized = true;

  drawSpectrum();
}

function resumeAudioCtx() {}

function drawSpectrum() {
  const canvas = $('spectrumCanvas');
  if (!canvas) return;

  const parent = canvas.parentElement;
  const w = parent ? parent.offsetWidth : 800;
  const h = parent ? parent.offsetHeight : 52;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  const bars = spectrumState.bars;
  if (!bars || bars.length === 0) {
    spectrumAnimFrame = requestAnimationFrame(drawSpectrum);
    return;
  }

  const barW = w / bars.length;
  const gap = 1.5;
  const now = Date.now() / 1000;
  const playing = state.isPlaying;

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];

    // Simulate frequency spectrum envelope (lower freqs higher, rolloff at top)
    const freqEnv = Math.pow(1 - i / bars.length, 0.5);

    if (playing) {
      const noise = Math.random() * 0.4;
      const wave = Math.sin(now * bar.freq * 3 + bar.phase) * 0.25 + 0.25;
      bar.target = (noise * 0.5 + wave * 0.5) * freqEnv * 0.85 + 0.03;
    } else {
      bar.target = (Math.sin(now * bar.freq + bar.phase) * 0.5 + 0.5) * freqEnv * 0.08 + 0.008;
    }

    // Smooth movement (attack fast, decay slow)
    const lerpRate = bar.target > bar.height ? 0.35 : 0.12;
    bar.height += (bar.target - bar.height) * lerpRate;

    const barH = bar.height * h;
    const x = i * barW + gap / 2;
    const y = h - barH;

    if (barH < 1) continue;

    const gradient = ctx.createLinearGradient(0, h, 0, y);
    gradient.addColorStop(0, 'rgba(185, 28, 28, 0.95)');
    gradient.addColorStop(0.5, 'rgba(220, 38, 38, 0.7)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.15)');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barW - gap, barH);
  }

  spectrumAnimFrame = requestAnimationFrame(drawSpectrum);
}

// ── Waveform Ruler ────────────────────────────────────────────
function renderRuler() {
  const ruler = $('waveformRuler');
  if (!ruler || !state.duration) return;
  ruler.innerHTML = '';

  const containerW = ruler.offsetWidth;
  const dur = state.duration;
  const step = calculateTickStep(dur);

  for (let t = 0; t <= dur; t += step) {
    const pct = (t / dur) * 100;
    const tick = document.createElement('div');
    tick.className = 'ruler-tick';
    tick.style.left = `${pct}%`;
    tick.style.position = 'absolute';
    tick.innerHTML = `<div class="ruler-tick-line"></div><span class="ruler-tick-label">${formatTime(t)}</span>`;
    ruler.appendChild(tick);
  }
}

function calculateTickStep(dur) {
  if (dur <= 30) return 5;
  if (dur <= 60) return 10;
  if (dur <= 180) return 30;
  if (dur <= 600) return 60;
  return 120;
}

// ── Transport ─────────────────────────────────────────────────
function initTransportControls() {
  $('playBtn').addEventListener('click', togglePlay);
  $('stopBtn').addEventListener('click', stopPlay);
  $('restartBtn').addEventListener('click', restartPlay);
  $('rewind5Btn').addEventListener('click', () => seekRelative(-5));
  $('fastforward5Btn').addEventListener('click', () => seekRelative(5));
  $('loopBtn').addEventListener('click', toggleLoop);
  $('muteBtn').addEventListener('click', toggleMute);
  $('zoomInBtn').addEventListener('click', () => changeZoom(1));
  $('zoomOutBtn').addEventListener('click', () => changeZoom(-1));

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    if (e.code === 'ArrowLeft') seekRelative(-5);
    if (e.code === 'ArrowRight') seekRelative(5);
  });
}

function togglePlay() {
  if (!wavesurfer || !state.wsReady) return;
  wavesurfer.playPause();
}

function stopPlay() {
  if (!wavesurfer || !state.wsReady) return;
  wavesurfer.stop();
  state.isPlaying = false;
  updatePlayIcon();
}

function restartPlay() {
  if (!wavesurfer || !state.wsReady) return;
  wavesurfer.setTime(0);
  if (!state.isPlaying) wavesurfer.play();
}

function seekRelative(sec) {
  if (!wavesurfer || !state.wsReady) return;
  const t = Math.max(0, Math.min(state.duration, wavesurfer.getCurrentTime() + sec));
  wavesurfer.setTime(t);
}

function toggleLoop() {
  state.isLooping = !state.isLooping;
  $('loopBtn').classList.toggle('active', state.isLooping);
}

function toggleMute() {
  state.isMuted = !state.isMuted;
  const icon = $('muteIcon');
  if (state.isMuted) {
    icon.setAttribute('data-lucide', 'volume-x');
    $('muteBtn').classList.add('active');
  } else {
    icon.setAttribute('data-lucide', 'volume-2');
    $('muteBtn').classList.remove('active');
  }
  lucide.createIcons();
  applyPreviewParams();
}

function changeZoom(dir) {
  const levels = [1, 2, 4, 8, 16, 32];
  let idx = levels.indexOf(state.zoom);
  idx = Math.max(0, Math.min(levels.length - 1, idx + dir));
  state.zoom = levels[idx];
  $('zoomLabel').textContent = `${state.zoom}x`;
  if (wavesurfer) wavesurfer.zoom(50 * state.zoom);
}

function updatePlayIcon() {
  const icon = $('playIcon');
  if (!icon) return;
  icon.setAttribute('data-lucide', state.isPlaying ? 'pause' : 'play');
  lucide.createIcons();
}

function updateTimeDisplay() {
  if (!wavesurfer || !state.wsReady) return;
  const cur = wavesurfer.getCurrentTime();
  const dur = wavesurfer.getDuration();
  $('wfmTime').textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
}

// ── Knobs ─────────────────────────────────────────────────────
// Active drag state — one at a time
let activeKnobDrag = null;

function initKnobs() {
  initKnob('speedKnob', 'speedSlider', 'speedKnobVal', 'speedSliderVal', formatSpeed, (v) => {
    state.speed = v;
    applyPreviewParams();
    updateInfoBar({});
    updateExportInfo();
  });

  initKnob('pitchKnob', 'pitchSlider', 'pitchKnobVal', 'pitchSliderVal', formatPitch, (v) => {
    state.pitch = v;
    updateExportInfo();
  });

  initKnob('volumeKnob', 'volumeSlider', 'volumeKnobVal', 'volumeSliderVal', formatVolume, (v) => {
    state.volume = v;
    applyPreviewParams();
    updateExportInfo();
  });

  // Global mouse/touch up handler
  document.addEventListener('mouseup', () => { activeKnobDrag = null; document.body.style.cursor = ''; });
  document.addEventListener('touchend', () => { activeKnobDrag = null; });

  document.addEventListener('mousemove', (e) => {
    if (!activeKnobDrag) return;
    const { update, dragStartY, dragStartVal, min, max } = activeKnobDrag;
    const delta = (dragStartY - e.clientY) * ((max - min) / 200);
    update(dragStartVal + delta);
  });
}

function initKnob(knobId, sliderId, knobValId, sliderValId, formatter, onChange) {
  const canvas = $(knobId);
  const slider = $(sliderId);
  const knobVal = $(knobValId);
  const sliderVal = $(sliderValId);

  const min = parseFloat(canvas.dataset.min);
  const max = parseFloat(canvas.dataset.max);
  const step = parseFloat(canvas.dataset.step);
  let value = parseFloat(canvas.dataset.value);

  function update(v) {
    value = clamp(snapToStep(v, step), min, max);
    canvas.dataset.value = value;
    drawKnob(canvas, value, min, max);
    const fmt = formatter(value);
    knobVal.textContent = fmt;
    sliderVal.textContent = fmt;
    slider.value = value;
    updateSliderFill(slider);
    onChange(value);
  }

  drawKnob(canvas, value, min, max);

  // Slider sync
  slider.addEventListener('input', () => update(parseFloat(slider.value)));

  // Mouse drag on knob
  canvas.addEventListener('mousedown', (e) => {
    activeKnobDrag = {
      update,
      min,
      max,
      dragStartY: e.clientY,
      dragStartVal: parseFloat(canvas.dataset.value),
    };
    document.body.style.cursor = 'ns-resize';
    e.preventDefault();
  });

  // Touch support
  canvas.addEventListener('touchstart', (e) => {
    activeKnobDrag = {
      update,
      min,
      max,
      dragStartY: e.touches[0].clientY,
      dragStartVal: parseFloat(canvas.dataset.value),
    };
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (!activeKnobDrag || activeKnobDrag.update !== update) return;
    const { dragStartY, dragStartVal } = activeKnobDrag;
    const delta = (dragStartY - e.touches[0].clientY) * ((max - min) / 200);
    update(dragStartVal + delta);
    e.preventDefault();
  }, { passive: false });

  // Scroll wheel
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const dir = e.deltaY < 0 ? 1 : -1;
    update(parseFloat(canvas.dataset.value) + dir * step);
  }, { passive: false });

  // Double-click to reset
  canvas.addEventListener('dblclick', () => {
    const defaults = { speedKnob: 1, pitchKnob: 0, volumeKnob: 100 };
    update(defaults[knobId] ?? 1);
  });
}

function drawKnob(canvas, value, min, max) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const r = W * 0.38;

  ctx.clearRect(0, 0, W, H);

  // Outer glow ring
  const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.1);
  glowGrad.addColorStop(0, 'transparent');
  glowGrad.addColorStop(1, 'rgba(220,38,38,0.06)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
  ctx.fill();

  const startAngle = (Math.PI * 3) / 4;  // 135°
  const endAngle   = Math.PI * 9 / 4;    // 405° (135° + 270°)
  const fraction   = (value - min) / (max - min);
  const currentAngle = startAngle + fraction * (endAngle - startAngle);

  // Track arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Value arc
  if (fraction > 0) {
    const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    grad.addColorStop(0, 'rgba(185,28,28,0.9)');
    grad.addColorStop(1, 'rgba(239,68,68,1)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, currentAngle);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Knob body
  const bodyGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r * 0.72);
  bodyGrad.addColorStop(0, '#2a2a2a');
  bodyGrad.addColorStop(1, '#111111');
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.68, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Knob border
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.68, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Indicator dot
  const indX = cx + Math.cos(currentAngle) * r * 0.48;
  const indY = cy + Math.sin(currentAngle) * r * 0.48;
  ctx.beginPath();
  ctx.arc(indX, indY, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.shadowBlur = 6;
  ctx.shadowColor = 'rgba(239,68,68,0.8)';
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ── Sliders ───────────────────────────────────────────────────
function initSliders() {
  // Speed slider already linked to knob above; still update bar fill
  function linkSlider(id, valId, formatter, onChange) {
    const slider = $(id);
    const val = $(valId);
    if (!slider) return;

    function update() {
      const v = parseFloat(slider.value);
      val.textContent = formatter(v);
      updateSliderFill(slider);
      onChange(v);
    }

    slider.addEventListener('input', update);
    updateSliderFill(slider);
  }

  // These sliders are for EQ (not linked to knobs)
  linkSlider('bassSlider', 'bassSliderVal', (v) => `${v >= 0 ? '+' : ''}${v} dB`, (v) => {
    state.bass = v;
    updateExportInfo();
  });
  linkSlider('midSlider', 'midSliderVal', (v) => `${v >= 0 ? '+' : ''}${v} dB`, (v) => {
    state.mid = v;
    updateExportInfo();
  });
  linkSlider('trebleSlider', 'trebleSliderVal', (v) => `${v >= 0 ? '+' : ''}${v} dB`, (v) => {
    state.treble = v;
    updateExportInfo();
  });
  linkSlider('reverbAmount', 'reverbAmountVal', (v) => `${v}`, (v) => { state.reverbAmount = v; });
  linkSlider('echoDelay', 'echoDelayVal', (v) => `${v}ms`, (v) => { state.echoDelay = v; });
  linkSlider('fadeInDur', 'fadeInDurVal', (v) => `${parseFloat(v).toFixed(1)}s`, (v) => { state.fadeInDur = v; });
  linkSlider('fadeOutDur', 'fadeOutDurVal', (v) => `${parseFloat(v).toFixed(1)}s`, (v) => { state.fadeOutDur = v; });

  // Also update fill on all sliders initially
  document.querySelectorAll('.styled-slider').forEach(updateSliderFill);
}

function updateSliderFill(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);
  const pct = ((val - min) / (max - min)) * 100;

  if (slider.classList.contains('slider-eq')) {
    // Center-based fill for EQ sliders
    const center = ((0 - min) / (max - min)) * 100;
    const left = Math.min(pct, center);
    const right = Math.max(pct, center);
    slider.style.background = `linear-gradient(to right, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.07) ${left}%, rgba(255,255,255,0.25) ${left}%, rgba(255,255,255,0.25) ${right}%, rgba(255,255,255,0.07) ${right}%, rgba(255,255,255,0.07) 100%)`;
  } else {
    slider.style.background = `linear-gradient(to right, rgba(185,28,28,0.8) 0%, rgba(239,68,68,0.8) ${pct}%, rgba(255,255,255,0.07) ${pct}%, rgba(255,255,255,0.07) 100%)`;
  }
}

// ── Presets ───────────────────────────────────────────────────
function initPresets() {
  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const speed = parseFloat(btn.dataset.speed);
      const pitch = parseFloat(btn.dataset.pitch);
      const volume = parseFloat(btn.dataset.volume);
      const reverb = parseInt(btn.dataset.reverb) === 1;
      const echo = parseInt(btn.dataset.echo) === 1;

      applyPreset({ speed, pitch, volume, reverb, echo });

      // Animate active state
      document.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 600);
    });
  });
}

function applyPreset({ speed, pitch, volume, reverb, echo }) {
  // Update speed
  setKnobValue('speedKnob', speed);
  setKnobValue('pitchKnob', pitch);
  setKnobValue('volumeKnob', volume);

  // Update state
  state.speed = speed;
  state.pitch = pitch;
  state.volume = volume;

  // Update sliders
  const speedSlider = $('speedSlider');
  const pitchSlider = $('pitchSlider');
  const volumeSlider = $('volumeSlider');

  speedSlider.value = speed;
  pitchSlider.value = pitch;
  volumeSlider.value = volume;

  updateSliderFill(speedSlider);
  updateSliderFill(pitchSlider);
  updateSliderFill(volumeSlider);

  $('speedSliderVal').textContent = formatSpeed(speed);
  $('pitchSliderVal').textContent = formatPitch(pitch);
  $('volumeSliderVal').textContent = formatVolume(volume);

  // Effects
  $('reverbToggle').checked = reverb;
  $('echoToggle').checked = echo;
  state.reverb = reverb;
  state.echo = echo;

  applyPreviewParams();
  updateInfoBar({});
  updateExportInfo();
}

function setKnobValue(knobId, value) {
  const canvas = $(knobId);
  if (!canvas) return;
  const min = parseFloat(canvas.dataset.min);
  const max = parseFloat(canvas.dataset.max);
  const clamped = clamp(value, min, max);
  canvas.dataset.value = clamped;
  drawKnob(canvas, clamped, min, max);

  const valId = knobId.replace('Knob', 'KnobVal');
  const el = $(valId);
  if (el) {
    if (knobId === 'speedKnob') el.textContent = formatSpeed(clamped);
    else if (knobId === 'pitchKnob') el.textContent = formatPitch(clamped);
    else if (knobId === 'volumeKnob') el.textContent = formatVolume(clamped);
  }
}

// ── Effects ───────────────────────────────────────────────────
function initEffects() {
  linkToggle('reverbToggle', 'reverbSub', (v) => { state.reverb = v; });
  linkToggle('echoToggle', 'echoSub', (v) => { state.echo = v; });
  linkToggle('fadeInToggle', 'fadeInSub', (v) => { state.fadeIn = v; });
  linkToggle('fadeOutToggle', 'fadeOutSub', (v) => { state.fadeOut = v; });
  $('normalizeToggle').addEventListener('change', (e) => { state.normalize = e.target.checked; });
  $('monoToggle').addEventListener('change', (e) => { state.mono = e.target.checked; });
}

function linkToggle(toggleId, subId, onChange) {
  const toggle = $(toggleId);
  const sub = subId ? $(subId) : null;

  function update() {
    const v = toggle.checked;
    onChange(v);
    if (sub) {
      if (v) {
        sub.style.display = 'grid';
      } else {
        sub.style.display = 'none';
      }
    }
  }

  toggle.addEventListener('change', update);
  // Init
  if (sub) sub.style.display = toggle.checked ? 'grid' : 'none';
}

// ── Trim ──────────────────────────────────────────────────────
function initTrim() {
  const trimToggle = $('trimToggle');
  const trimControls = $('trimControls');
  const trimStart = $('trimStart');
  const trimEnd = $('trimEnd');
  const trimDurVal = $('trimDurVal');
  const trimSetPlayhead = $('trimSetPlayhead');
  const trimSetAll = $('trimSetAll');

  trimToggle.addEventListener('change', () => {
    state.trimEnabled = trimToggle.checked;
    trimControls.style.display = trimToggle.checked ? 'block' : 'none';
    updateInfoBar({});
    updateExportInfo();
  });

  trimControls.style.display = 'none';

  function updateTrimDur() {
    const s = parseFloat(trimStart.value) || 0;
    const e = parseFloat(trimEnd.value) || 0;
    state.trimStart = s;
    state.trimEnd = e;
    if (e > s) {
      trimDurVal.textContent = formatTime(e - s);
    } else {
      trimDurVal.textContent = '—';
    }
    updateInfoBar({});
    updateExportInfo();
  }

  trimStart.addEventListener('input', updateTrimDur);
  trimEnd.addEventListener('input', updateTrimDur);

  trimSetPlayhead.addEventListener('click', () => {
    if (!wavesurfer || !state.wsReady) return;
    const cur = wavesurfer.getCurrentTime().toFixed(2);
    trimStart.value = cur;
    state.trimStart = parseFloat(cur);
    updateTrimDur();
  });

  trimSetAll.addEventListener('click', () => {
    trimStart.value = '0';
    trimEnd.value = state.duration.toFixed(2);
    state.trimStart = 0;
    state.trimEnd = state.duration;
    updateTrimDur();
  });
}

function updateTrimEnd() {
  const trimEnd = $('trimEnd');
  if (trimEnd && state.duration) {
    trimEnd.value = state.duration.toFixed(2);
    trimEnd.max = state.duration;
    state.trimEnd = state.duration;
    $('trimStart').max = state.duration;
  }
}

// ── Export ────────────────────────────────────────────────────
function initExport() {
  // Format buttons
  document.querySelectorAll('.format-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.format-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.exportFormat = btn.dataset.format;
      updateQualityVisibility();
      updateExportInfo();
    });
  });

  // Quality buttons per format
  document.querySelectorAll('.quality-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.quality-row');
      row.querySelectorAll('.quality-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const format = row.id.replace('Quality', '');
      state.exportQuality[format] = btn.dataset.quality;
      updateExportInfo();
    });
  });

  $('exportBtn').addEventListener('click', exportAudio);
  updateQualityVisibility();
}

function updateQualityVisibility() {
  const formats = ['mp3', 'ogg', 'wav', 'flac'];
  formats.forEach((f) => {
    const row = $(`${f}Quality`);
    if (row) {
      row.classList.toggle('hidden', f !== state.exportFormat);
    }
  });
}

function updateExportInfo() {
  const el = $('exportInfoText');
  if (!el) return;
  const dur = computeProcessedDuration();
  const parts = [];
  if (state.exportFormat === 'mp3') parts.push(`MP3 ${state.exportQuality.mp3}`);
  else if (state.exportFormat === 'ogg') parts.push(`OGG Q${state.exportQuality.ogg}`);
  else if (state.exportFormat === 'wav') parts.push(`WAV ${state.exportQuality.wav}`);
  else if (state.exportFormat === 'flac') parts.push(`FLAC Level ${state.exportQuality.flac}`);

  if (state.speed !== 1) parts.push(`Speed: ${formatSpeed(state.speed)}`);
  if (state.pitch !== 0) parts.push(`Pitch: ${formatPitch(state.pitch)}`);
  if (state.volume !== 100) parts.push(`Volume: ${formatVolume(state.volume)}`);
  if (dur) parts.push(`Output: ${formatTime(dur)}`);

  el.textContent = parts.join(' · ') || 'Select a file and configure settings above';
}

async function exportAudio() {
  if (!state.ffmpegReady || !state.files[state.activeIndex]) {
    if (!state.ffmpegReady) {
      alert('FFmpeg is not ready. Please wait or refresh the page.\n\nNote: This site requires serving over HTTP(S) with a service worker for FFmpeg to function. Open index.html from a local HTTP server (e.g., python -m http.server) or host it online.');
    }
    return;
  }

  const file = state.files[state.activeIndex];
  const format = state.exportFormat;
  const outputName = `soniq_${getBaseName(file.name)}.${format}`;

  showProcessing(`Exporting as ${format.toUpperCase()}...`, 'Building FFmpeg filter chain');

  try {
    // Write input
    const inputExt = getFileExt(file.name) || 'mp3';
    const inputName = `input.${inputExt}`;
    const fileData = await fetchFileFn(file);
    await ffmpeg.writeFile(inputName, fileData);

    // Build filter chain
    const filters = buildFilterChain();
    const args = buildFFmpegArgs(inputName, outputName, filters);

    ffmpegProgressDuration = computeProcessedDuration() || state.duration;
    setProcessingProgress(5);

    await ffmpeg.exec(args);

    setProcessingProgress(90);
    $('processingSub').textContent = 'Reading output file...';

    const outputData = await ffmpeg.readFile(outputName);
    const mimeTypes = {
      mp3: 'audio/mpeg',
      ogg: 'audio/ogg',
      wav: 'audio/wav',
      flac: 'audio/flac',
    };
    const blob = new Blob([outputData.buffer], { type: mimeTypes[format] || 'audio/mpeg' });

    // Download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    setProcessingProgress(100);

    // Cleanup
    try { await ffmpeg.deleteFile(inputName); } catch (e) {}
    try { await ffmpeg.deleteFile(outputName); } catch (e) {}

    setTimeout(hideProcessing, 600);
  } catch (err) {
    console.error('Export error:', err);
    hideProcessing();
    alert(`Export failed: ${err.message || err}\n\nCheck the browser console for details.`);
  }
}

function buildFilterChain() {
  const filters = [];

  // Trim (via atrim before other effects)
  if (state.trimEnabled && state.trimEnd > state.trimStart) {
    filters.push(`atrim=start=${state.trimStart}:end=${state.trimEnd}`);
    filters.push('asetpts=PTS-STARTPTS');
  }

  // Pitch shift (asetrate changes sample rate → pitch change, aresample brings it back)
  const sr = state.sampleRate || 44100;
  if (state.pitch !== 0) {
    const pitchFactor = Math.pow(2, state.pitch / 12);
    const newSampleRate = Math.round(sr * pitchFactor);
    filters.push(`asetrate=${newSampleRate}`);
    filters.push(`aresample=${sr}`);
  }

  // Speed (atempo - handles values by chaining if out of 0.5-2.0 range)
  if (state.speed !== 1) {
    const atempoFilters = buildAtempoChain(state.speed);
    filters.push(...atempoFilters);
  }

  // Volume
  if (state.volume !== 100) {
    filters.push(`volume=${(state.volume / 100).toFixed(4)}`);
  }

  // EQ - Bass (100Hz), Mid (1kHz), Treble (8kHz)
  if (state.bass !== 0) {
    filters.push(`equalizer=f=100:width_type=o:width=2:g=${state.bass}`);
  }
  if (state.mid !== 0) {
    filters.push(`equalizer=f=1000:width_type=o:width=2:g=${state.mid}`);
  }
  if (state.treble !== 0) {
    filters.push(`equalizer=f=8000:width_type=o:width=2:g=${state.treble}`);
  }

  // Reverb (approximated with aecho)
  if (state.reverb) {
    const intensity = Math.min(state.reverbAmount / 10, 0.9);
    const delays = [60, 120, 200].map(d => d + Math.round(intensity * 100));
    const decays = [0.4, 0.3, 0.2].map(d => d + intensity * 0.3);
    filters.push(`aecho=0.8:0.88:${delays[0]}|${delays[1]}|${delays[2]}:${decays[0].toFixed(2)}|${decays[1].toFixed(2)}|${decays[2].toFixed(2)}`);
  }

  // Echo / Delay
  if (state.echo) {
    const echoMs = state.echoDelay;
    filters.push(`aecho=0.7:0.85:${echoMs}:0.5`);
  }

  // Normalize
  if (state.normalize) {
    filters.push('dynaudnorm=p=0.95:m=30');
  }

  // Fade In
  if (state.fadeIn && state.fadeInDur > 0) {
    filters.push(`afade=t=in:ss=0:d=${state.fadeInDur}`);
  }

  // Fade Out
  if (state.fadeOut && state.fadeOutDur > 0 && state.duration > 0) {
    const procDur = computeProcessedDuration();
    const fadeStart = Math.max(0, procDur - state.fadeOutDur);
    filters.push(`afade=t=out:st=${fadeStart.toFixed(2)}:d=${state.fadeOutDur}`);
  }

  // Mono mix
  if (state.mono) {
    filters.push('pan=mono|c0=0.5*c0+0.5*c1');
  }

  return filters;
}

function buildAtempoChain(speed) {
  const filters = [];
  let s = speed;
  if (s < 0.5) {
    while (s < 0.5) {
      filters.push('atempo=0.5');
      s /= 0.5;
    }
    if (Math.abs(s - 1) > 0.001) filters.push(`atempo=${s.toFixed(6)}`);
  } else if (s > 2.0) {
    while (s > 2.0) {
      filters.push('atempo=2.0');
      s /= 2.0;
    }
    if (Math.abs(s - 1) > 0.001) filters.push(`atempo=${s.toFixed(6)}`);
  } else {
    filters.push(`atempo=${s.toFixed(6)}`);
  }
  return filters;
}

function buildFFmpegArgs(inputName, outputName, filters) {
  const args = ['-i', inputName];

  // Add filter chain if any
  if (filters.length > 0) {
    args.push('-af', filters.join(','));
  }

  // Format-specific codec args
  const fmt = state.exportFormat;
  if (fmt === 'mp3') {
    args.push('-c:a', 'libmp3lame', '-b:a', state.exportQuality.mp3);
    args.push('-ar', String(state.sampleRate || 44100));
  } else if (fmt === 'ogg') {
    args.push('-c:a', 'libvorbis', '-q:a', state.exportQuality.ogg);
  } else if (fmt === 'wav') {
    args.push('-c:a', state.exportQuality.wav);
  } else if (fmt === 'flac') {
    args.push('-c:a', 'flac', '-compression_level', state.exportQuality.flac);
  }

  args.push('-y', outputName);
  return args;
}

// ── Processing Overlay ────────────────────────────────────────
function showProcessing(label, sub) {
  $('processingLabel').textContent = label;
  $('processingSub').textContent = sub;
  setProcessingProgress(0);
  $('processingOverlay').classList.remove('hidden');
}

function hideProcessing() {
  $('processingOverlay').classList.add('hidden');
}

function setProcessingProgress(pct) {
  $('processingBar').style.width = `${pct}%`;
}

// ── UI helpers ────────────────────────────────────────────────
function show(el) {
  if (el) el.classList.remove('hidden');
}

function hide(el) {
  if (el) el.classList.add('hidden');
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSpeed(v) {
  return `${parseFloat(v).toFixed(2)}x`;
}

function formatPitch(v) {
  const n = parseFloat(v);
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)} st`;
}

function formatVolume(v) {
  return `${Math.round(v)}%`;
}

function truncateName(name, max = 22) {
  if (name.length <= max) return name;
  const ext = getFileExt(name);
  const base = name.slice(0, name.length - ext.length - 1);
  return base.slice(0, max - ext.length - 4) + '...' + (ext ? `.${ext}` : '');
}

function getFileExt(name) {
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function getBaseName(name) {
  const parts = name.split('.');
  return parts.slice(0, -1).join('.') || name;
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function snapToStep(v, step) {
  return Math.round(v / step) * step;
}

// ── Window resize — redraw ruler & spectrum ───────────────────
window.addEventListener('resize', debounce(() => {
  if (state.wsReady) renderRuler();
  const canvas = $('spectrumCanvas');
  if (canvas) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
}, 150));

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
