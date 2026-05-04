/* =============================================
   CALC∞ — JavaScript Engine + Effects
   ============================================= */

'use strict';

// ── STATE ─────────────────────────────────────
const state = {
  current:     '0',
  previous:    '',
  operator:    null,
  shouldReset: false,
  history:     '',
  expression:  '',
  justEqualed: false,
};

// ── DOM ───────────────────────────────────────
const display     = document.getElementById('display');
const historyEl   = document.getElementById('history');
const expressionEl= document.getElementById('expression');
const calculator  = document.getElementById('calculator');
const rippleCont  = document.getElementById('ripple-container');
const canvas      = document.getElementById('particle-canvas');
const ctx         = canvas.getContext('2d');

// ── CANVAS PARTICLE SYSTEM ────────────────────
const particles = [];
const NUM_PARTICLES = 120;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x    = Math.random() * canvas.width;
    this.y    = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.life  = Math.random();
    this.maxLife = Math.random() * 0.015 + 0.003;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.opacity = Math.random() * 0.6 + 0.1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life += this.maxLife;
    if (this.life > 1 || this.x < 0 || this.x > canvas.width ||
        this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }

  draw() {
    const alpha = Math.sin(this.life * Math.PI) * this.opacity;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = this.color;
    ctx.shadowBlur  = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const COLORS = ['#00ffe7','#0099ff','#a855f7','#ff2d78','#ffd700','#ff6a00'];

for (let i = 0; i < NUM_PARTICLES; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ── CUSTOM CURSOR ─────────────────────────────
document.addEventListener('mousemove', e => {
  document.documentElement.style.setProperty('--cx', e.clientX + 'px');
  document.documentElement.style.setProperty('--cy', e.clientY + 'px');
});

// ── 3D TILT ───────────────────────────────────
calculator.addEventListener('mousemove', e => {
  const rect = calculator.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;
  const dx   = (e.clientX - cx) / (rect.width  / 2);
  const dy   = (e.clientY - cy) / (rect.height / 2);
  const rx   = -dy * 6;
  const ry   =  dx * 6;
  calculator.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
});

calculator.addEventListener('mouseleave', () => {
  calculator.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
});

// ── BUTTON CLICK EFFECTS ──────────────────────
function spawnBtnRing(btn) {
  const ring = document.createElement('div');
  ring.className = 'btn-press-ring';
  btn.appendChild(ring);
  ring.addEventListener('animationend', () => ring.remove());
}

function spawnGlobalRipple(x, y) {
  const r = document.createElement('div');
  r.className = 'ripple';
  const size = 80;
  r.style.cssText = `
    left: ${x}px; top: ${y}px;
    width: ${size}px; height: ${size}px;
  `;
  rippleCont.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
}

function spawnBurstParticles(x, y, color = '#00ffe7') {
  const count = 10;
  for (let i = 0; i < count; i++) {
    const p   = document.createElement('div');
    p.className = 'burst-particle';
    const angle  = (i / count) * Math.PI * 2;
    const dist   = 50 + Math.random() * 60;
    const tx     = Math.cos(angle) * dist;
    const ty     = Math.sin(angle) * dist;
    p.style.cssText = `
      left: ${x}px; top: ${y}px;
      background: ${color};
      box-shadow: 0 0 8px ${color};
      --tx: ${tx}px; --ty: ${ty}px;
      animation-duration: ${0.5 + Math.random() * 0.4}s;
    `;
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

// ── DISPLAY HELPERS ───────────────────────────
function updateDisplay(value, animate = 'pop') {
  // Auto-size font
  const len = String(value).length;
  if      (len <= 8)  display.style.fontSize = '52px';
  else if (len <= 12) display.style.fontSize = '38px';
  else if (len <= 16) display.style.fontSize = '28px';
  else                display.style.fontSize = '22px';

  display.textContent = value;

  if (animate === 'pop') {
    display.classList.remove('digit-pop');
    void display.offsetWidth;
    display.classList.add('digit-pop');
  } else if (animate === 'equal') {
    display.classList.remove('equal-flash');
    void display.offsetWidth;
    display.classList.add('equal-flash');
  } else if (animate === 'error') {
    display.classList.remove('error-shake');
    void display.offsetWidth;
    display.classList.add('error-shake');
  } else if (animate === 'glitch') {
    display.classList.remove('glitch');
    void display.offsetWidth;
    display.classList.add('glitch');
  }
}

function updateHistory(txt) {
  historyEl.textContent = txt || '';
}

function updateExpression(txt) {
  expressionEl.textContent = txt || '';
}

function formatNumber(n) {
  if (n === 'Error' || n === 'Infinity' || n === '-Infinity') return n;
  const num = parseFloat(n);
  if (isNaN(num)) return n;
  if (!isFinite(num)) return num > 0 ? '∞' : '-∞';
  // Limit display precision
  const str = String(num);
  if (str.includes('e')) return num.toPrecision(6);
  if (str.length > 12)   return parseFloat(num.toPrecision(10)).toString();
  return str;
}

// ── CALCULATOR LOGIC ──────────────────────────
function calculate(a, b, op) {
  const fa = parseFloat(a);
  const fb = parseFloat(b);
  switch (op) {
    case '+': return fa + fb;
    case '−': return fa - fb;
    case '×': return fa * fb;
    case '÷': return fb === 0 ? 'Error' : fa / fb;
    default:  return fb;
  }
}

function handleNumber(val) {
  if (state.shouldReset) {
    state.current    = val;
    state.shouldReset = false;
  } else {
    if (state.current === '0' && val !== '.') {
      state.current = val;
    } else {
      if (state.current.length >= 16) return;
      state.current += val;
    }
  }
  state.justEqualed = false;
  updateDisplay(state.current);
  if (state.operator) {
    updateExpression(`${state.previous} ${state.operator} ${state.current}`);
  }
}

function handleDecimal() {
  if (state.shouldReset) {
    state.current     = '0.';
    state.shouldReset = false;
  } else if (!state.current.includes('.')) {
    state.current += '.';
  }
  state.justEqualed = false;
  updateDisplay(state.current);
}

function handleOperator(op) {
  if (state.operator && !state.shouldReset) {
    // Chain operations
    const result = calculate(state.previous, state.current, state.operator);
    const formatted = formatNumber(result);
    state.previous = String(result);
    state.current  = formatted;
    updateDisplay(formatted, 'glitch');
    updateHistory(`${state.previous} ${state.operator}`);
  } else {
    state.previous = state.current;
  }

  state.operator    = op;
  state.shouldReset = true;
  state.justEqualed = false;

  updateExpression(`${formatNumber(state.previous)} ${op}`);
  updateHistory(`${formatNumber(state.previous)} ${op}`);

  // Highlight active operator button
  document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('is-active'));
  document.querySelectorAll('.btn-op').forEach(b => {
    if (b.dataset.value === op) b.classList.add('is-active');
  });
}

function handleEquals(btnEl) {
  if (!state.operator) return;

  const a   = state.previous;
  const b   = state.current;
  const op  = state.operator;
  const res = calculate(a, b, op);
  const fmt = res === 'Error' ? 'Error' : formatNumber(res);

  updateHistory(`${formatNumber(a)} ${op} ${formatNumber(b)} =`);
  updateExpression('');
  updateDisplay(fmt, res === 'Error' ? 'error' : 'equal');

  // Burst particles on equals
  if (res !== 'Error' && btnEl) {
    const rect = btnEl.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    spawnBurstParticles(cx, cy, '#ff2d78');
    spawnBurstParticles(cx, cy, '#ffd700');
  }

  // 🤸 MORTAL quando o resultado for 67
  if (parseFloat(fmt) === 67) {
    triggerMortal();
  }

  state.current     = fmt;
  state.previous    = '';
  state.operator    = null;
  state.shouldReset = true;
  state.justEqualed = true;

  document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('is-active'));
}

function handleClear() {
  state.current     = '0';
  state.previous    = '';
  state.operator    = null;
  state.shouldReset = false;
  state.justEqualed = false;
  updateDisplay('0', 'glitch');
  updateHistory('');
  updateExpression('');
  document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('is-active'));
  document.getElementById('btn-clear').textContent = 'AC';
}

function handleSign() {
  const n = parseFloat(state.current);
  if (isNaN(n) || n === 0) return;
  state.current = String(-n);
  updateDisplay(state.current, 'pop');
}

function handlePercent() {
  const n = parseFloat(state.current);
  if (isNaN(n)) return;
  if (state.operator && state.previous) {
    state.current = String(parseFloat(state.previous) * n / 100);
  } else {
    state.current = String(n / 100);
  }
  updateDisplay(state.current, 'glitch');
}

// ── MORTAL (resultado = 67) ───────────────────
function triggerMortal() {
  const wrapper = document.querySelector('.calc-wrapper');

  // Desativa o tilt enquanto faz o mortal
  calculator.style.transform = '';
  calculator.style.transition = 'none';

  // Dispara a animação de mortal
  wrapper.classList.remove('doing-mortal');
  void wrapper.offsetWidth;
  wrapper.classList.add('doing-mortal');

  // Label gigante "67" no centro da tela
  const label = document.createElement('div');
  label.className = 'sixty-seven-label';
  label.textContent = '67 🤸';
  document.body.appendChild(label);
  label.addEventListener('animationend', () => label.remove());

  // Chuva de partículas douradas por toda a tela
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const sx = Math.random() * window.innerWidth;
      const sy = Math.random() * window.innerHeight;
      spawnBurstParticles(sx, sy, '#ffd700');
      spawnBurstParticles(sx, sy, '#ff6a00');
      spawnBurstParticles(sx, sy, '#ff2d78');
    }, i * 150);
  }

  // Remove classe após animação terminar
  wrapper.addEventListener('animationend', () => {
    wrapper.classList.remove('doing-mortal');
  }, { once: true });
}

// ── BUTTON EVENTS ─────────────────────────────
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const { action, value } = btn.dataset;
    const rect = btn.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;

    // Visual effects
    spawnBtnRing(btn);
    spawnGlobalRipple(e.clientX, e.clientY);

    // Number burst particles
    if (action === 'equals') {
      // Handled inside handleEquals
    } else if (action === 'number' || action === 'decimal') {
      spawnBurstParticles(cx, cy, '#00ffe7');
    } else if (action === 'operator') {
      spawnBurstParticles(cx, cy, '#0099ff');
    }

    // Update AC/C label
    if (action !== 'clear') {
      document.getElementById('btn-clear').textContent =
        state.current !== '0' || state.previous ? 'C' : 'AC';
    }

    switch (action) {
      case 'number':   handleNumber(value);      break;
      case 'decimal':  handleDecimal();           break;
      case 'operator': handleOperator(value);     break;
      case 'equals':   handleEquals(btn);         break;
      case 'clear':    handleClear();             break;
      case 'sign':     handleSign();              break;
      case 'percent':  handlePercent();           break;
    }
  });
});

// ── KEYBOARD SUPPORT ──────────────────────────
const keyMap = {
  '0':'number:0','1':'number:1','2':'number:2','3':'number:3',
  '4':'number:4','5':'number:5','6':'number:6','7':'number:7',
  '8':'number:8','9':'number:9',
  '.':'decimal',',':'decimal',
  '+':'operator:+','-':'operator:−','*':'operator:×','/':'operator:÷',
  'Enter':'equals','=':'equals',
  'Backspace':'backspace','Escape':'clear','Delete':'clear',
  '%':'percent',
};

document.addEventListener('keydown', e => {
  const mapped = keyMap[e.key];
  if (!mapped) return;
  e.preventDefault();

  if (mapped === 'backspace') {
    if (state.shouldReset || state.current === '0') return;
    state.current = state.current.length > 1
      ? state.current.slice(0, -1)
      : '0';
    updateDisplay(state.current, 'pop');
    return;
  }

  const [action, value] = mapped.split(':');

  // Flash corresponding button
  const sel = value
    ? `[data-action="${action}"][data-value="${value}"]`
    : `[data-action="${action}"]`;
  const matchBtn = document.querySelector(sel);
  if (matchBtn) {
    matchBtn.classList.add('is-active');
    setTimeout(() => matchBtn.classList.remove('is-active'), 120);
    spawnBtnRing(matchBtn);
  }

  switch (action) {
    case 'number':   handleNumber(value);      break;
    case 'decimal':  handleDecimal();           break;
    case 'operator': handleOperator(value);     break;
    case 'equals':   handleEquals(matchBtn);    break;
    case 'clear':    handleClear();             break;
    case 'percent':  handlePercent();           break;
  }
});

// ── INITIAL DISPLAY ───────────────────────────
updateDisplay('0');
updateHistory('READY');
setTimeout(() => updateHistory(''), 1200);

// ── EASTER EGG: KONAMI CODE ───────────────────
const konami = [38,38,40,40,37,39,37,39,66,65];
let  konamiIdx = 0;
document.addEventListener('keydown', e => {
  if (e.keyCode === konami[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === konami.length) {
      konamiIdx = 0;
      // Rainbow mode
      document.body.style.animation = 'none';
      document.querySelectorAll('.btn').forEach((b, i) => {
        b.style.animation = `eq-gradient ${0.5 + i * 0.1}s ease infinite`;
        b.style.background = `hsl(${i * 30}, 80%, 40%)`;
      });
      updateDisplay('∞∞∞', 'equal');
      updateHistory('🌈 CHEAT CODE');
      setTimeout(() => {
        document.querySelectorAll('.btn').forEach(b => {
          b.style.animation = '';
          b.style.background = '';
        });
        handleClear();
      }, 3000);
    }
  } else {
    konamiIdx = 0;
  }
});

// ── IDLE GLITCH ───────────────────────────────
let idleTimer;
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    display.classList.remove('glitch');
    void display.offsetWidth;
    display.classList.add('glitch');
  }, 8000);
}
document.addEventListener('mousemove', resetIdle);
document.addEventListener('keydown',   resetIdle);
document.addEventListener('click',     resetIdle);
resetIdle();

// ── BOOT SEQUENCE ─────────────────────────────
(function bootSequence() {
  const msgs = ['INIT…', 'SYS OK', 'READY'];
  let i = 0;
  const iv = setInterval(() => {
    if (i >= msgs.length) { clearInterval(iv); updateHistory(''); return; }
    updateHistory(msgs[i++]);
  }, 400);
})();


/* ═══════════════════════════════════════════
   MODE SWITCHER
═══════════════════════════════════════════ */
function switchMode(mode) {
  const panelCalc = document.getElementById('panel-calc');
  const panelSlot = document.getElementById('panel-slot');
  const btnCalc   = document.getElementById('switch-calc');
  const btnSlot   = document.getElementById('switch-slot');

  if (mode === 'calc') {
    panelCalc.classList.remove('hidden');
    panelSlot.classList.add('hidden');
    btnCalc.classList.add('active');
    btnSlot.classList.remove('active');
  } else {
    panelCalc.classList.add('hidden');
    panelSlot.classList.remove('hidden');
    btnCalc.classList.remove('active');
    btnSlot.classList.add('active');
    initSlot();
  }
}

document.getElementById('switch-calc').addEventListener('click', () => switchMode('calc'));
document.getElementById('switch-slot').addEventListener('click', () => switchMode('slot'));

/* ═══════════════════════════════════════════
   SLOT MACHINE ENGINE
═══════════════════════════════════════════ */
const SYMBOLS = ['6️⃣7️⃣','💎','🍒','⭐','🔔','🍋','🍉','🍊'];
const WEIGHTS  = [20, 2, 4, 5, 6, 8, 9, 10]; // raridade (menor = mais raro)
const MULTIPLIERS = { '6️⃣7️⃣':50,'💎':30,'🍒':20,'⭐':15,'🔔':10,'🍋':8,'🍉':5,'🍊':4 };
const REEL_HEIGHT = 66; // px per symbol
const VISIBLE = 3;      // visible rows

let slotState = {
  credits: 100,
  bet: 5,
  spinning: false,
  initialized: false,
  jackpot: 777777,
};

// Weighted random symbol pick
function pickSymbol() {
  const totalWeight = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < SYMBOLS.length; i++) {
    r -= WEIGHTS[i];
    if (r <= 0) return SYMBOLS[i];
  }
  return SYMBOLS[SYMBOLS.length - 1];
}

// Build a reel strip of N symbols
function buildStrip(n = 30) {
  const strip = [];
  for (let i = 0; i < n; i++) strip.push(pickSymbol());
  return strip;
}

// Reel strip data (3 reels)
let reelData = [buildStrip(), buildStrip(), buildStrip()];
// Current top index for each reel
let reelPositions = [0, 0, 0];

function initSlot() {
  if (slotState.initialized) return;
  slotState.initialized = true;

  // Render strips
  for (let r = 0; r < 3; r++) {
    const strip = document.getElementById('strip-' + r);
    strip.innerHTML = '';
    // repeat strip 3x for seamless loop feel
    const full = [...reelData[r], ...reelData[r], ...reelData[r]];
    full.forEach(sym => {
      const el = document.createElement('div');
      el.className = 'reel-symbol';
      el.textContent = sym;
      strip.appendChild(el);
    });
    // position at middle copy
    const startOffset = reelData[r].length * REEL_HEIGHT;
    strip.style.transform = `translateY(-${startOffset}px)`;
    reelPositions[r] = reelData[r].length;
  }

  updateSlotUI();
  startJackpotCounter();

  // Bet buttons
  document.getElementById('bet-up').addEventListener('click', () => {
    if (slotState.spinning) return;
    slotState.bet = Math.min(slotState.bet + 5, Math.min(50, slotState.credits));
    document.getElementById('bet-display').textContent = slotState.bet;
  });
  document.getElementById('bet-down').addEventListener('click', () => {
    if (slotState.spinning) return;
    slotState.bet = Math.max(slotState.bet - 5, 1);
    document.getElementById('bet-display').textContent = slotState.bet;
  });

  // Spin button
  document.getElementById('spin-btn').addEventListener('click', doSpin);

  // Paytable toggle
  document.getElementById('pt-toggle').addEventListener('click', () => {
    document.getElementById('paytable').classList.toggle('hidden');
  });
}

function updateSlotUI() {
  document.getElementById('credits-display').textContent = slotState.credits;
  document.getElementById('bet-display').textContent = slotState.bet;
}

function startJackpotCounter() {
  setInterval(() => {
    slotState.jackpot += Math.floor(Math.random() * 7) + 1;
    const formatted = slotState.jackpot.toLocaleString('pt-BR');
    document.getElementById('jackpot-value').textContent = formatted;
  }, 200);
}

function getVisibleSymbols(reelIdx) {
  const pos = reelPositions[reelIdx];
  const full = [...reelData[reelIdx], ...reelData[reelIdx], ...reelData[reelIdx]];
  const symbols = [];
  for (let i = 0; i < VISIBLE; i++) {
    symbols.push(full[(pos + i) % full.length]);
  }
  return symbols;
}

function checkWin(results) {
  // results = [centerSym0, centerSym1, centerSym2]
  const [a, b, c] = results;
  if (a === b && b === c) {
    const mult = MULTIPLIERS[a] || 1;
    return { type: 'triple', symbol: a, mult };
  }
  if (a === b || b === c || a === c) {
    return { type: 'pair', mult: 2 };
  }
  return null;
}

function animateReel(reelIdx, targetPos, duration, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      const strip = document.getElementById('strip-' + reelIdx);
      const full  = [...reelData[reelIdx], ...reelData[reelIdx], ...reelData[reelIdx]];
      const totalSymbols = full.length;
      const current = reelPositions[reelIdx];

      // How many positions to spin (always forward, at least 2 full loops)
      const minSpins = reelData[reelIdx].length * 2;
      let target = current + minSpins + Math.floor(Math.random() * reelData[reelIdx].length);
      // Adjust target to land on targetPos
      target = target - (target % reelData[reelIdx].length) + targetPos + reelData[reelIdx].length;
      if (target <= current + minSpins) target += reelData[reelIdx].length;

      const finalOffset = target * REEL_HEIGHT;

      // Fast spin via CSS transition with easing
      strip.style.transition = `transform ${duration}ms cubic-bezier(0.15, 0, 0.1, 1)`;
      strip.style.transform  = `translateY(-${finalOffset}px)`;

      // Update state position (mod strip length)
      reelPositions[reelIdx] = target % reelData[reelIdx].length;

      // Re-wrap to middle copy to avoid overflow
      strip.addEventListener('transitionend', () => {
        strip.style.transition = 'none';
        const normalPos = reelPositions[reelIdx];
        const baseOffset = (normalPos + reelData[reelIdx].length) * REEL_HEIGHT;
        strip.style.transform = `translateY(-${baseOffset}px)`;
        reelPositions[reelIdx] = normalPos + reelData[reelIdx].length;
        resolve();
      }, { once: true });
    }, delay);
  });
}

async function doSpin() {
  if (slotState.spinning) return;
  if (slotState.credits < slotState.bet) {
    showBanner('SEM CREDITOS! 😢', false);
    // Refill
    slotState.credits = 100;
    updateSlotUI();
    return;
  }

  slotState.spinning = true;
  slotState.credits -= slotState.bet;
  document.getElementById('win-display').textContent = '0';
  document.getElementById('win-display').classList.remove('gold-num');
  clearBanner();
  clearWinHighlights();

  const spinBtn = document.getElementById('spin-btn');
  spinBtn.disabled = true;
  updateSlotUI();

  // Shake the machine
  const slotEl = document.querySelector('.slot-machine');
  slotEl.style.animation = 'error-shake 0.3s ease';
  setTimeout(() => slotEl.style.animation = '', 300);

  // Decide outcome BEFORE animating (for fairness)
  const targetSymbols = [pickSymbol(), pickSymbol(), pickSymbol()];

  // Find target positions in reel data
  const targetPositions = targetSymbols.map((sym, ri) => {
    const idx = reelData[ri].indexOf(sym);
    if (idx === -1) {
      // Symbol not in reel? push it
      reelData[ri][0] = sym;
      return 0;
    }
    // We show position such that sym is the MIDDLE visible row
    return Math.max(0, idx - 1);
  });

  // Animate reels sequentially with stagger
  const durations = [1200, 1600, 2000];
  const delays    = [0, 200, 400];

  const animations = [0,1,2].map(i =>
    animateReel(i, targetPositions[i], durations[i], delays[i])
  );
  await Promise.all(animations);

  // Small bounce effect
  slotEl.style.transition = 'transform 0.15s';
  slotEl.style.transform  = 'translateY(4px)';
  setTimeout(() => {
    slotEl.style.transform = 'translateY(0)';
    setTimeout(() => slotEl.style.transition = '', 200);
  }, 100);

  // Evaluate win
  const win = checkWin(targetSymbols);
  let winAmount = 0;

  if (win) {
    winAmount = slotState.bet * win.mult;
    slotState.credits += winAmount;

    // Highlight win symbols
    highlightWinSymbols(win.type === 'triple' ? [0,1,2] : findPairs(targetSymbols));

    if (win.type === 'triple' && targetSymbols[0] === '7️⃣') {
      // JACKPOT!
      winAmount += Math.floor(slotState.jackpot * 0.1);
      slotState.credits += Math.floor(slotState.jackpot * 0.1);
      showBanner('🎰 JACKPOT!! 🎰', true);
      triggerJackpotExplosion();
    } else if (win.type === 'triple') {
      showBanner('TRES IGUAIS! +' + winAmount + ' 🎉', false);
      triggerWinExplosion();
    } else {
      showBanner('PAR! +' + winAmount, false);
    }

    document.getElementById('win-display').textContent = winAmount;
    document.getElementById('win-display').classList.add('gold-num');

    // Win line flash
    document.querySelector('.win-line-top').classList.add('flash');
    document.querySelector('.win-line-bot').classList.add('flash');
    setTimeout(() => {
      document.querySelector('.win-line-top').classList.remove('flash');
      document.querySelector('.win-line-bot').classList.remove('flash');
    }, 2000);
  } else {
    showBanner('TENTE NOVAMENTE...', false);
  }

  updateSlotUI();
  spinBtn.disabled = false;
  slotState.spinning = false;
}

function findPairs(syms) {
  if (syms[0] === syms[1]) return [0,1];
  if (syms[1] === syms[2]) return [1,2];
  if (syms[0] === syms[2]) return [0,2];
  return [];
}

function highlightWinSymbols(reelIndices) {
  reelIndices.forEach(ri => {
    const strip = document.getElementById('strip-' + ri);
    const pos   = reelPositions[ri];
    // The center visible symbol is at index pos+1 in the rendered strip
    const allSyms = strip.querySelectorAll('.reel-symbol');
    const centerIdx = pos + 1; // middle of 3 visible
    if (allSyms[centerIdx]) {
      allSyms[centerIdx].classList.add('winner');
      setTimeout(() => allSyms[centerIdx].classList.remove('winner'), 2000);
    }
  });
}

function clearWinHighlights() {
  document.querySelectorAll('.reel-symbol.winner').forEach(el => el.classList.remove('winner'));
}

function showBanner(msg, isJackpot) {
  const banner = document.getElementById('win-banner');
  banner.textContent = msg;
  banner.className = 'win-banner' + (isJackpot ? ' jackpot' : '');
}

function clearBanner() {
  const banner = document.getElementById('win-banner');
  banner.textContent = '';
  banner.className = 'win-banner';
}

function triggerWinExplosion() {
  const rect = document.querySelector('.reels-viewport').getBoundingClientRect();
  const cx   = rect.left + rect.width / 2;
  const cy   = rect.top + rect.height / 2;
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      spawnBurstParticles(cx + (Math.random()-0.5)*100, cy + (Math.random()-0.5)*60, '#ffd700');
      spawnBurstParticles(cx + (Math.random()-0.5)*100, cy + (Math.random()-0.5)*60, '#ff6a00');
    }, i * 150);
  }
}

function triggerJackpotExplosion() {
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      spawnBurstParticles(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight,
        COLORS[Math.floor(Math.random() * COLORS.length)]
      );
    }, i * 100);
  }
  // Label
  const label = document.createElement('div');
  label.className = 'sixty-seven-label';
  label.style.fontSize = '72px';
  label.textContent = '🎰 JACKPOT!! 🎰';
  document.body.appendChild(label);
  label.addEventListener('animationend', () => label.remove());
}