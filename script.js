function loadSettings() {
  return fetch('settings.md', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status))))
    .then((text) => {
      // Only the ``` code blocks are settings; the rest is notes. Each block
      // runs on its own, so a mistake in one only skips that block.
      const blocks = [...text.replace(/\r\n?/g, '\n').matchAll(/^```[^\n]*\n([\s\S]*?)^```/gm)];
      for (const [, code] of blocks) {
        try {
          (0, eval)(code); // runs as plain page-wide code: NAME = value sets NAME
        } catch (err) {
          console.error('settings.md: skipped a code block with a mistake (' + err.message + '):\n' + code);
        }
      }
    })
    .catch((err) => console.warn('settings.md could not be loaded (' + err.message + '); using the built-in defaults.'));
}

function setting(name, fallback) {
  const value = window[name];
  if (value === undefined || typeof value !== typeof fallback) return fallback;
  return value;
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const root = document.documentElement;
const sidebar = document.querySelector('.sidebar');
const thermometer = document.querySelector('.thermometer');
const fill = document.querySelector('.fill');
const scale = document.querySelector('.scale');
const raisedEl = document.querySelector('.raised');
const goalEl = document.querySelector('.goal');
const donorsEl = document.querySelector('.donors');

function applySettings() {
  root.style.setProperty('--accent', setting('ACCENT_COLOR', '#6ABF4B'));
  root.style.setProperty('--thermometer-width', setting('THERMOMETER_WIDTH', 56) + 'px');
  root.style.setProperty('--pay-width', setting('PAY_PANEL_WIDTH', 420) + 'px');
  root.style.setProperty('--fill-duration', setting('FILL_ANIMATION_MS', 1600) + 'ms');
  sidebar.classList.toggle('scrolls', !setting('STAY_IN_PLACE', true));
  document.body.classList.toggle('panel-right', setting('PANEL_SIDE', 'right') !== 'left');
}

function countUp(to, duration) {
  const start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    raisedEl.textContent = money.format(Math.round(to * eased));
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function drawScale(goal) {
  const step = setting('SCALE_STEP', 2500);
  scale.innerHTML = '';
  if (step <= 0) return;
  for (let amount = step; amount <= goal; amount += step) {
    const mark = document.createElement('div');
    mark.className = 'mark';
    mark.style.bottom = `${(amount / goal) * 100}%`;
    mark.innerHTML = `<span>${money.format(amount)}</span>`;
    scale.appendChild(mark);
  }
}

function render({ raised = 0, goal = setting('DEFAULT_GOAL', 10000), donors = 0 }) {
  const pct = Math.min(raised / goal, 1) * 100;
  const animate = setting('ANIMATE_ON_LOAD', true);
  const duration = setting('FILL_ANIMATION_MS', 1600);

  goalEl.textContent = money.format(goal);
  thermometer.setAttribute('aria-valuemax', goal);
  thermometer.setAttribute('aria-valuenow', raised);
  thermometer.setAttribute('aria-valuetext', `${money.format(raised)} of ${money.format(goal)}`);
  if (donors > 0) donorsEl.textContent = `${donors} ${donors === 1 ? 'donor' : 'donors'}`;
  drawScale(goal);

  if (!animate) {
    fill.style.transition = 'none';
    fill.style.height = `${pct}%`;
    raisedEl.textContent = money.format(raised);
    return;
  }
  // Next frame so the height transition actually runs
  requestAnimationFrame(() => { fill.style.height = `${pct}%`; });
  countUp(raised, duration);
}

// Cache-bust: GitHub Pages caches files for ~10 minutes
const progress = fetch(`progress.json?t=${Date.now()}`)
  .then((res) => (res.ok ? res.json() : {}))
  .catch(() => ({}));

loadSettings().then(() => {
  applySettings();
  return progress;
}).then(render);
