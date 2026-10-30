// Fallback goal if progress.json doesn't have one yet
const DEFAULT_GOAL = 10000;
// How long the dollar count-up takes (keep in step with --fill-duration in style.css)
const COUNT_DURATION_MS = 1600;

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const thermometer = document.querySelector('.thermometer');
const fill = document.querySelector('.fill');
const raisedEl = document.querySelector('.raised');
const goalEl = document.querySelector('.goal');
const donorsEl = document.querySelector('.donors');

function countUp(to) {
  const start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / COUNT_DURATION_MS, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    raisedEl.textContent = money.format(Math.round(to * eased));
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function render({ raised = 0, goal = DEFAULT_GOAL, donors = 0 }) {
  const pct = Math.min(raised / goal, 1) * 100;

  goalEl.textContent = money.format(goal);
  thermometer.setAttribute('aria-valuemax', goal);
  thermometer.setAttribute('aria-valuenow', raised);
  thermometer.setAttribute('aria-valuetext', `${money.format(raised)} of ${money.format(goal)}`);
  if (donors > 0) donorsEl.textContent = `${donors} ${donors === 1 ? 'donor' : 'donors'}`;

  // Next frame so the width transition actually runs
  requestAnimationFrame(() => { fill.style.width = `${pct}%`; });
  countUp(raised);
}

// Cache-bust: GitHub Pages caches files for ~10 minutes
fetch(`progress.json?t=${Date.now()}`)
  .then((res) => (res.ok ? res.json() : {}))
  .catch(() => ({}))
  .then(render);
