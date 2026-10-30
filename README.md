# Rock Tree Sky fundraiser

A single fundraising page hosted on GitHub Pages: a thermometer tracking progress toward $10,000 and a Givebutter donation widget.

## Files

- `index.html`, `style.css`, `script.js`: the page
- `settings.md`: colors, sizes and toggles you can edit (see the notes inside)
- `progress.json`: raised / goal / donors, read by the thermometer
- `scripts/fetch-progress.mjs` + `.github/workflows/update-progress.yml`: every 15 minutes, pulls the total from Givebutter and commits `progress.json` if it changed

## Setup

1. **Givebutter widget.** In Givebutter, open the campaign → Sharing → Widgets, create a form widget, and copy its embed code. Replace the `<div class="widget-placeholder">` in `index.html` with the `<givebutter-widget ...>` tag, and add the `<script src="https://widgets.givebutter.com/...">` tag in `<head>`.
2. **API secrets.** In Givebutter go to Settings → Integrations → API and create a key. In the GitHub repo go to Settings → Secrets and variables → Actions and add:
   - `GIVEBUTTER_API_KEY`: the key
   - `GIVEBUTTER_CAMPAIGN_ID`: the campaign's numeric ID (shown in the campaign URL in the Givebutter dashboard)
3. **Test the sync.** Actions tab → "Update fundraising progress" → Run workflow. `progress.json` should update.
4. **GitHub Pages.** Settings → Pages → Deploy from branch → `main` / root.
5. **Subdomain.** Add a `CNAME` file containing the subdomain (e.g. `give.rocktreesky.org`), and at your DNS provider add a CNAME record pointing that subdomain to `<github-username>.github.io`. Then tick "Enforce HTTPS" in Pages settings once it's available.

## Notes

- The total is Givebutter's `raised` figure, so donor tips (which go to Givebutter) aren't counted toward the goal.
- GitHub may delay scheduled runs by a few minutes, and pauses schedules on repos with no activity for 60 days (the bot's own commits count as activity).
- The goal comes from the Givebutter campaign once synced; `DEFAULT_GOAL` in `settings.md` is only a fallback.
