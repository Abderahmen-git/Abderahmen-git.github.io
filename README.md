# Abderahmen Boudabous — Cybersecurity Portfolio

A static, dependency-light portfolio site (HTML/CSS/vanilla JS) built for GitHub Pages.

## Structure

```
index.html            Home
about.html             About
projects.html          Projects (filterable, JSON-driven)
skills.html             Skills
certifications.html     Certifications
experience.html        Experience
education.html          Education
contact.html            Contact
404.html                GitHub Pages 404
css/style.css            All styles (design tokens at the top)
js/main.js                Theme toggle, nav, hero animation, reveal-on-scroll, stats, back-to-top
js/data-loader.js         Renders data/*.json into cards/timelines, project filtering & search
data/projects.json        Project cards (add a new object here to add a project — no HTML edits needed)
data/skills.json          Skill categories
data/certifications.json  Certification cards
data/timeline.json        About/experience/education timeline entries
assets/cv/                CV source (build_cv.py) + generated PDF
assets/favicon.svg        Favicon / brand mark
assets/social-preview.png Open Graph image
```

## Things to personalize before publishing

1. **Photo** — replace the placeholder avatar in `index.html`'s `.portrait-frame` with a real `<img>` pointing at `assets/profile-photo.jpg`.
2. **CV** — edit `assets/cv/build_cv.py` (dates, employer/institution names currently say "Add employer name" / "Add dates") and re-run `python3 build_cv.py` to regenerate the PDF.
3. **Contact details** — swap the placeholder email (`abderahmen.boudabous@example.com`) for your real address in every HTML file's footer/contact section and in `js/main.js`.
4. **Timeline data** — fill in real dates/employers/institutions in `data/timeline.json`.
5. **Certification dates** — fill in real issue dates in `data/certifications.json`.
6. **Project links** — update `github` URLs in `data/projects.json` once repos are public, and flip `"status"` from `"planned"` to `"in-progress"` or `"live"` as you ship them.
7. **Social preview image** — regenerate `assets/social-preview.png` if you change branding (script not included by default; a plain image editor works fine too).

## Adding a new project

Add an object to `data/projects.json`:

```json
{
  "id": "unique-id",
  "title": "Project Title",
  "category": "Category Name",
  "status": "planned",
  "description": "One or two sentences.",
  "technologies": ["Tool A", "Tool B"],
  "skillsDemonstrated": ["Skill A", "Skill B"],
  "github": "https://github.com/AbderahmenBoudabous/repo-name"
}
```

`status` accepts `"live"`, `"in-progress"`, or `"planned"` and controls the badge + whether the GitHub button shows.

## Deploying to GitHub Pages

1. Push this folder to a repository (e.g. `AbderahmenBoudabous/AbderahmenBoudabous.github.io` for a user site, or any repo for a project site).
2. In the repo, go to **Settings → Pages**, set the source branch (usually `main`) and root folder.
3. GitHub Pages serves static files directly — no build step required.

## Local preview

Because the site fetches JSON via `fetch()`, opening `index.html` directly (`file://`) will fail JSON loading in some browsers. Serve it locally instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Dark/light mode

Persisted in `localStorage` under the key `abdb-theme`; falls back to the visitor's OS preference on first visit.
