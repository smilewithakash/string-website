# String website

A static site (plain HTML and CSS, no build step) for GitHub Pages: the landing page plus the
pages Google Play needs: privacy policy, account deletion and child safety standards.

```
index.html            landing page
privacy.html          privacy policy (Play: privacy policy URL)
terms.html            terms of use
delete-account.html   account deletion (Play: "Delete account" URL)
child-safety.html     child safety standards (Play: required for social apps)
404.html              not found
assets/               css, js, Inter font (SIL OFL, licence included), images
```

Brand: colours from `app/lib/core/theme/app_colors.dart`, the Inter font the app ships and
the logo redrawn as `assets/img/logo.svg`. The hero is the brand banner drawn live in SVG and
CSS (radar rings, a sweeping beam, people lighting up as it passes, strings with drifting
orbs, the logo drawing itself in), so it is sharp at any size, smooth, a few kilobytes, and
still for people who turn animations off. `og.png` (the link preview image) is a frame of the
original banner GIF. The site loads nothing from other servers: no fonts, analytics or
trackers.

## Contact and operator details

Live at `string.social` (the `CNAME` file). Every contact link is `info@string.social`. The
pages say "the String team" where an operator would be named. Before the Play submission, add
the legal operator name and postal address (privacy, terms), a named Grievance Officer
(privacy) and a named child-safety contact (child-safety); a red `<span class="todo">` marks
anything still to fill, and `Select-String -Path website\*.html -Pattern 'todo'` finds them.

Have the privacy policy and terms read by someone qualified before launch. They describe what
the app does today (checked against the code on 2026-11-16) and make two commitments that the
server set-up must keep: server logs kept for at most 14 days, and data requests answered within
30 days.

## Preview locally

Open `website/index.html` in a browser, or serve the folder:

```powershell
cd website
python -m http.server 8080   # then open http://127.0.0.1:8080
```

## Live site (2026-11-16)

Published at **https://string.social** (and `www`), HTTPS enforced, from the public repository
`smilewithakash/string-website` (branch `main`, root). It holds only this folder's files; the
app's code stays private. DNS at GoDaddy: four `A` records for `@` to GitHub Pages
(185.199.108.153 / .109 / .110 / .111) and `www` CNAME to `smilewithakash.github.io`.

To publish changes: copy this folder's contents over a clone of `string-website`, commit and
push (`gh repo clone smilewithakash/string-website`; GitHub Pages redeploys in about a minute).
Keep the `CNAME` file.

## Host on GitHub Pages (how it was set up)

Simplest: a separate public repository that holds only this folder.

1. Create a repository (for example `string-website`) and push the contents of `website/` to
   its `main` branch, with `index.html` at the root.
2. In the repository: Settings › Pages › Build and deployment › Source: "Deploy from a branch",
   Branch: `main`, folder `/ (root)`. Save.
3. The site appears at `https://<your-user>.github.io/string-website/` within a minute or two.

`.nojekyll` makes Pages serve the files as they are.

### Custom domain (later)

1. Buy the domain, then in Settings › Pages › Custom domain enter it (for example
   `string.example`). GitHub adds a `CNAME` file to the repository.
2. At your DNS provider: for the apex domain add `A` records to GitHub Pages' IP addresses
   (listed in GitHub's "Managing a custom domain" guide); for `www`, a `CNAME` to
   `<your-user>.github.io`.
3. Tick "Enforce HTTPS" once the certificate is issued.
4. Replace `your-domain.example` everywhere, and set up those mailboxes.

Then use these URLs in the Play Console: `/privacy.html` (privacy policy),
`/delete-account.html` (account deletion), `/child-safety.html` (child safety standards).
