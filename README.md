# Rock Tree Sky fundraiser

A single fundraising page hosted on GitHub Pages: an animated route map and a Zeffy donation form. (The progress thermometer is cut for now; it is in git history up to commit a370088.)

## Files

- `index.html`, `style.css`, `script.js`, `markdown.js`: the page
- `map.js`: the animated route map (top left of the page; the route is in `settings.md`), drawn over `images/California-Satellite-Map.jpg`. `images/California-Satellite-Map-mask.png` marks the land, so the sea and background show the page color
- `text/`: the words for each text section, one file each, named for where it sits (`title.md`, `beside-form.md`, `beside-picture.md`, `bottom-left.md`, `bottom-right.md`). How to write them is in `settings.md`
- `settings.md`: colors, sizes and toggles you can edit (see the notes inside)
- `progress.json`: raised / goal / donors, read by the thermometer (not on the page for now)
- `scripts/fetch-progress.mjs` + `.github/workflows/update-progress.yml`: every 15 minutes, pulls the total from Zeffy and commits `progress.json` if it changed

## Setup

1. **Zeffy form.** In Zeffy, open the campaign → Share, copy its link, and paste it into `ZEFFY_FORM_LINK` in `settings.md`. The page turns it into Zeffy's embedded form by itself.
2. **API secrets.** In Zeffy go to Settings → Integrations → API Key → Generate (only an org admin can). In the GitHub repo go to Settings → Secrets and variables → Actions and add:
   - `ZEFFY_API_KEY`: the key. Keep it secret: it can read the organization's donor data, so it never goes in the page itself.
   - `ZEFFY_CAMPAIGN_ID`: the campaign's ID in the Zeffy API
3. **Test the sync.** Actions tab → "Update fundraising progress" → Run workflow. `progress.json` should update. Open the run's log: it prints the whole campaign as Zeffy sends it. Check that the amount raised and goal look right. If a $10,000 goal shows as 1000000, set `AMOUNTS_IN_CENTS = true` at the top of `scripts/fetch-progress.mjs`.
4. **GitHub Pages.** Settings → Pages → Deploy from branch → `main` / root.
5. **Subdomain.** Add a `CNAME` file containing the subdomain (e.g. `give.rocktreesky.org`), and at your DNS provider add a CNAME record pointing that subdomain to `<github-username>.github.io`. Then tick "Enforce HTTPS" in Pages settings once it's available.

## Notes

- Zeffy is free for the organization: at checkout it asks donors for an optional contribution to Zeffy, which goes to Zeffy and isn't counted toward the goal.
- Zeffy's embedded form is a simplified version: it leaves out the campaign's description, pictures and logo, which is why those live on the page itself.
- GitHub may delay scheduled runs by a few minutes, and pauses schedules on repos with no activity for 60 days (the bot's own commits count as activity).
- The goal comes from the Zeffy campaign once synced (if it has one); `DEFAULT_GOAL` in `settings.md` is only a fallback.
