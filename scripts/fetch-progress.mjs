// Pulls the campaign total from Zeffy and writes progress.json.
// Run by .github/workflows/update-progress.yml on a schedule.
//
// Zeffy's public API is read-only and free: https://www.zeffy.com/api/docs
// The campaign's field names below weren't confirmed against a real response
// when this was written, so the first run prints the whole campaign to the
// Actions log. Check it there (see README, "Test the sync").
import { readFile, writeFile } from 'node:fs/promises';

// Set to true if the log shows amounts in cents (a $10,000 goal as 1000000)
const AMOUNTS_IN_CENTS = false;

const FILE = new URL('../progress.json', import.meta.url);
const { ZEFFY_API_KEY, ZEFFY_CAMPAIGN_ID } = process.env;

if (!ZEFFY_API_KEY || !ZEFFY_CAMPAIGN_ID) {
  console.log('Zeffy secrets not set yet; skipping.');
  process.exit(0);
}

const res = await fetch(`https://api.zeffy.com/api/v1/campaigns/${encodeURIComponent(ZEFFY_CAMPAIGN_ID)}`, {
  headers: {
    Authorization: `Bearer ${ZEFFY_API_KEY}`,
    Accept: 'application/json',
  },
});

if (!res.ok) {
  console.error(`Zeffy API returned ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const body = await res.json();
const campaign = body.data ?? body;
console.log('Zeffy campaign:', JSON.stringify(campaign, null, 2));

// First of these names that's a number
const pick = (...names) => {
  for (const name of names) {
    const value = Number(campaign[name]);
    if (campaign[name] != null && Number.isFinite(value)) return value;
  }
  return undefined;
};
const dollars = (n) => (n === undefined ? undefined : Math.round(AMOUNTS_IN_CENTS ? n / 100 : n));

const raised = dollars(pick('amountRaised', 'amount_raised', 'totalRaised', 'raised'));
if (raised === undefined) {
  console.error('No amount raised found in the campaign above; progress.json left as it was.');
  process.exit(1);
}

const current = JSON.parse(await readFile(FILE, 'utf8'));
const goal = dollars(pick('goal', 'target', 'goalAmount'));

const next = {
  raised,
  goal: goal > 0 ? goal : current.goal,
  // The campaign doesn't say how many people gave; 0 hides the donors line
  donors: Math.round(pick('donorCount', 'donors', 'numberOfDonors') ?? 0),
};

console.log('progress.json:', next);
await writeFile(FILE, JSON.stringify(next, null, 2) + '\n');
