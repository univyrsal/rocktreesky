// Pulls the campaign total from Givebutter and writes progress.json.
// Run by .github/workflows/update-progress.yml on a schedule.
import { readFile, writeFile } from 'node:fs/promises';

const FILE = new URL('../progress.json', import.meta.url);
const { GIVEBUTTER_API_KEY, GIVEBUTTER_CAMPAIGN_ID } = process.env;

if (!GIVEBUTTER_API_KEY || !GIVEBUTTER_CAMPAIGN_ID) {
  console.log('Givebutter secrets not set yet; skipping.');
  process.exit(0);
}

const res = await fetch(`https://api.givebutter.com/v1/campaigns/${GIVEBUTTER_CAMPAIGN_ID}`, {
  headers: {
    Authorization: `Bearer ${GIVEBUTTER_API_KEY}`,
    Accept: 'application/json',
  },
});

if (!res.ok) {
  console.error(`Givebutter API returned ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const body = await res.json();
const campaign = body.data ?? body;
const current = JSON.parse(await readFile(FILE, 'utf8'));

const next = {
  raised: Math.round(Number(campaign.raised) || 0),
  goal: Math.round(Number(campaign.goal) || current.goal),
  donors: Number(campaign.donors) || 0,
};

console.log('Givebutter:', next);
await writeFile(FILE, JSON.stringify(next, null, 2) + '\n');
