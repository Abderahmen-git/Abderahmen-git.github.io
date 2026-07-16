/* =========================================================================
   data-loader.js — renders content from /data/*.json so pages can be
   updated by editing JSON only, never the HTML markup.
   ========================================================================= */
(function () {
  "use strict";

  /* Small inline icon set (no external icon font/dependency) */
  const ICONS = {
    shield: '<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    cloud: '<path d="M17.5 19H8a5 5 0 1 1 .7-9.96A6 6 0 0 1 20 11.5a3.5 3.5 0 0 1-2.5 7.5Z"/>',
    devsecops: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M12 6l-2 12"/>',
    network: '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6.7 7.4 11 16M17.3 7.4 13 16M7 6h10"/>',
    os: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    monitor: '<path d="M3 12h4l2-7 4 14 2-7h6"/>',
    cert: '<circle cx="12" cy="8" r="5"/><path d="m8.5 12.5-1.5 8 5-2.5 5 2.5-1.5-8"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
    external: '<path d="M14 4h6v6M20 4 10 14M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>',
    star: '<path d="m12 3 2.7 5.9 6.3.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.1 1.4-6.3-4.8-4.3 6.3-.6L12 3Z"/>',
    fork: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6 8v2a4 4 0 0 0 4 4M18 8v2a4 4 0 0 1-4 4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  };

  function icon(name, cls) {
    const paths = ICONS[name] || ICONS.shield;
    return `<svg class="${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  async function fetchJSON(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Failed to load ${path}`);
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  const escapeHTML = (str = "") =>
    str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------------------------------------------------------------
     PROJECTS — used on index.html (featured) and projects.html (full grid
     with filtering + search)
     ------------------------------------------------------------------- */
  function projectCardHTML(p) {
    const statusClass = p.status === "live" ? "is-live" : p.status === "in-progress" ? "is-progress" : "";
    const statusLabel = p.status === "live" ? "Live" : p.status === "in-progress" ? "In progress" : "Planned";
    const techTags = p.technologies.map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join("");
    const githubBtn =
      p.status === "planned"
        ? `<span class="form-note">Publishing soon</span>`
        : `<a class="btn btn--ghost btn--sm" href="${escapeHTML(p.github)}" target="_blank" rel="noopener">${icon("folder")} View on GitHub</a>`;

    return `
      <article class="card project-card reveal" data-category="${escapeHTML(p.category)}" data-title="${escapeHTML(p.title.toLowerCase())}" data-tech="${escapeHTML(p.technologies.join(" ").toLowerCase())}">
        <div class="project-media">
          ${icon("shield")}
          <span class="project-status ${statusClass}">${statusLabel}</span>
        </div>
        <div class="project-body">
          <span class="project-category">${escapeHTML(p.category)}</span>
          <h3>${escapeHTML(p.title)}</h3>
          <p>${escapeHTML(p.description)}</p>
          <div class="tag-list">${techTags}</div>
          <div class="project-skills"><strong>Skills demonstrated:</strong> ${escapeHTML(p.skillsDemonstrated.join(", "))}</div>
          <div class="project-footer">${githubBtn}</div>
        </div>
      </article>`;
  }

  async function renderProjects() {
    const grid = document.querySelector("[data-projects-grid]");
    const featuredGrid = document.querySelector("[data-featured-projects]");
    if (!grid && !featuredGrid) return;

    const projects = await fetchJSON("data/projects.json");
    if (!projects) return;

    if (featuredGrid) {
      const featured = projects.slice(0, 3);
      featuredGrid.innerHTML = featured.map(projectCardHTML).join("");
    }

    if (grid) {
      grid.innerHTML = projects.map(projectCardHTML).join("");
      setupProjectFilters(projects, grid);
      observeNewReveals(grid);
    } else if (featuredGrid) {
      observeNewReveals(featuredGrid);
    }
  }

  function setupProjectFilters(projects, grid) {
    const chipContainer = document.querySelector("[data-filter-chips]");
    const searchInput = document.querySelector("[data-project-search]");
    const emptyState = document.querySelector("[data-empty-state]");
    if (!chipContainer) return;

    const categories = ["All", ...new Set(projects.map((p) => p.category))];
    chipContainer.innerHTML = categories
      .map((c, i) => `<button class="chip ${i === 0 ? "is-active" : ""}" data-filter="${escapeHTML(c)}" type="button">${escapeHTML(c)}</button>`)
      .join("");

    let activeFilter = "All";

    function applyFilters() {
      const query = (searchInput?.value || "").trim().toLowerCase();
      const cards = grid.querySelectorAll(".project-card");
      let visibleCount = 0;

      cards.forEach((card) => {
        const matchesCategory = activeFilter === "All" || card.dataset.category === activeFilter;
        const haystack = `${card.dataset.title} ${card.dataset.tech}`;
        const matchesQuery = !query || haystack.includes(query);
        const show = matchesCategory && matchesQuery;
        card.style.display = show ? "" : "none";
        if (show) visibleCount++;
      });

      if (emptyState) emptyState.hidden = visibleCount !== 0;
    }

    chipContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      chipContainer.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeFilter = btn.dataset.filter;
      applyFilters();
    });

    if (searchInput) searchInput.addEventListener("input", applyFilters);
  }

  /* ---------------------------------------------------------------------
     SKILLS — skills.html
     ------------------------------------------------------------------- */
  async function renderSkills() {
    const container = document.querySelector("[data-skills-grid]");
    if (!container) return;
    const groups = await fetchJSON("data/skills.json");
    if (!groups) return;

    container.innerHTML = groups
      .map(
        (g) => `
        <div class="card skill-card reveal">
          <h3><span class="skill-icon">${icon(g.icon)}</span>${escapeHTML(g.category)}</h3>
          <div class="skill-pills">
            ${g.items.map((item) => `<span class="skill-pill">${escapeHTML(item)}</span>`).join("")}
          </div>
        </div>`
      )
      .join("");
    observeNewReveals(container);
  }

  /* ---------------------------------------------------------------------
     CERTIFICATIONS — certifications.html
     ------------------------------------------------------------------- */
  async function renderCertifications() {
    const container = document.querySelector("[data-certs-grid]");
    if (!container) return;
    const certs = await fetchJSON("data/certifications.json");
    if (!certs) return;

    container.innerHTML = certs
      .map(
        (c) => `
        <div class="card cert-card reveal">
          <div class="cert-mark">${icon("cert")}</div>
          <div>
            <h3>${escapeHTML(c.name)}</h3>
            <div class="cert-issuer">${escapeHTML(c.issuer)}</div>
            <p>${escapeHTML(c.description)}</p>
            <span class="cert-date mono">${escapeHTML(c.date)}</span>
          </div>
        </div>`
      )
      .join("");
    observeNewReveals(container);
  }

  /* ---------------------------------------------------------------------
     TIMELINE — about.html / experience.html / education.html
     ------------------------------------------------------------------- */
  async function renderTimeline() {
    const nodes = document.querySelectorAll("[data-timeline]");
    if (!nodes.length) return;
    const data = await fetchJSON("data/timeline.json");
    if (!data) return;

    nodes.forEach((node) => {
      const key = node.getAttribute("data-timeline");
      const entries = data[key] || [];
      node.innerHTML = entries
        .map(
          (e) => `
          <div class="timeline-item reveal">
            <span class="timeline-date mono">${escapeHTML(e.date)}</span>
            <h3>${escapeHTML(e.title)}${e.org ? ` <span style="color:var(--text-faint);font-weight:500;">— ${escapeHTML(e.org)}</span>` : ""}</h3>
            <p>${escapeHTML(e.description)}</p>
          </div>`
        )
        .join("");
      observeNewReveals(node);
    });
  }

  /* ---------------------------------------------------------------------
     GITHUB — latest public repos (index.html), best-effort, fails quietly
     ------------------------------------------------------------------- */
  async function renderGithubRepos() {
    const container = document.querySelector("[data-github-repos]");
    if (!container) return;
    const username = container.getAttribute("data-github-user") || "AbderahmenBoudabous";
    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=3`);
      if (!res.ok) throw new Error("GitHub API unavailable");
      const repos = await res.json();
      if (!Array.isArray(repos) || repos.length === 0) throw new Error("No repos");
      container.innerHTML = repos
        .map(
          (r) => `
          <div class="card repo-card reveal">
            <span class="repo-name mono">${icon("folder")} ${escapeHTML(r.name)}</span>
            <p>${escapeHTML(r.description || "No description provided yet.")}</p>
            <div class="repo-meta">
              <span>${icon("star")} ${r.stargazers_count}</span>
              <span>${icon("fork")} ${r.forks_count}</span>
              <span>${r.language || "—"}</span>
            </div>
            <a class="btn btn--ghost btn--sm" href="${r.html_url}" target="_blank" rel="noopener">${icon("external")} View repository</a>
          </div>`
        )
        .join("");
      observeNewReveals(container);
    } catch (err) {
      container.innerHTML = `<div class="empty-state">GitHub activity will appear here once repositories are public. <a class="btn btn--ghost btn--sm" style="margin-top:14px" href="https://github.com/${username}" target="_blank" rel="noopener">${icon("external")} Visit GitHub profile</a></div>`;
    }
  }

  /* Re-run the reveal-on-scroll observer for elements injected after the
     initial DOMContentLoaded pass in main.js */
  function observeNewReveals(scope) {
    const targets = scope.querySelectorAll(".reveal, .reveal-stagger");
    if (!targets.length) return;
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );
      targets.forEach((el) => io.observe(el));
    } else {
      targets.forEach((el) => el.classList.add("is-visible"));
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderProjects();
    renderSkills();
    renderCertifications();
    renderTimeline();
    renderGithubRepos();
  });
})();
