/* =========================================================================
   main.js — shared site behavior (runs on every page)
   Sections: theme toggle, mobile nav, sticky header, hero role cycler,
   scroll reveal, stat counters, back-to-top, footer year, loader.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Theme toggle (persisted in localStorage, respects OS preference)
     ------------------------------------------------------------------- */
  const THEME_KEY = "abdb-theme";
  const root = document.documentElement;

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#060b14" : "#f6f8fb");
  }

  applyTheme(getPreferredTheme());

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
      });
    }

    /* ---------------------------------------------------------------
       Mobile nav
       ----------------------------------------------------------- */
    const navToggle = document.querySelector("[data-nav-toggle]");
    const navLinks = document.querySelector("[data-nav-links]");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("is-open");
        navToggle.classList.toggle("is-open", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));
      });
      navLinks.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          navLinks.classList.remove("is-open");
          navToggle.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
        })
      );
    }

    /* ---------------------------------------------------------------
       Active nav link (matches current file name)
       ----------------------------------------------------------- */
    const currentPage = (location.pathname.split("/").pop() || "index.html") || "index.html";
    document.querySelectorAll("[data-nav-links] a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === currentPage || (currentPage === "" && href === "index.html")) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });

    /* ---------------------------------------------------------------
       Sticky header shadow on scroll
       ----------------------------------------------------------- */
    const header = document.querySelector(".site-header");
    if (header) {
      const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ---------------------------------------------------------------
       Hero role cycler
       ----------------------------------------------------------- */
    const roleEl = document.querySelector("[data-role-cycler]");
    if (roleEl) {
      let roles = [];
      try {
        roles = JSON.parse(roleEl.getAttribute("data-roles") || "[]");
      } catch (e) {
        roles = [];
      }
      if (roles.length) {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const textSpan = document.createElement("span");
        const cursor = document.createElement("span");
        cursor.className = "role-cursor";
        cursor.setAttribute("aria-hidden", "true");
        roleEl.textContent = "";
        roleEl.appendChild(textSpan);
        roleEl.appendChild(cursor);

        if (prefersReduced) {
          textSpan.textContent = roles[0];
        } else {
          let roleIndex = 0;
          let charIndex = 0;
          let deleting = false;

          const TYPE_SPEED = 55;
          const DELETE_SPEED = 30;
          const HOLD_TIME = 1600;

          function tick() {
            const current = roles[roleIndex];
            if (!deleting) {
              charIndex++;
              textSpan.textContent = current.slice(0, charIndex);
              if (charIndex === current.length) {
                deleting = true;
                setTimeout(tick, HOLD_TIME);
                return;
              }
              setTimeout(tick, TYPE_SPEED);
            } else {
              charIndex--;
              textSpan.textContent = current.slice(0, charIndex);
              if (charIndex === 0) {
                deleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                setTimeout(tick, 300);
                return;
              }
              setTimeout(tick, DELETE_SPEED);
            }
          }
          setTimeout(tick, 400);
        }
      }
    }

    /* ---------------------------------------------------------------
       Scroll reveal (IntersectionObserver)
       ----------------------------------------------------------- */
    const revealTargets = document.querySelectorAll(".reveal, .reveal-stagger");
    if ("IntersectionObserver" in window && revealTargets.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );
      revealTargets.forEach((el) => io.observe(el));
    } else {
      revealTargets.forEach((el) => el.classList.add("is-visible"));
    }

    /* ---------------------------------------------------------------
       Animated stat counters
       ----------------------------------------------------------- */
    const counters = document.querySelectorAll("[data-count]");
    if (counters.length) {
      const animateCount = (el) => {
        const target = parseFloat(el.getAttribute("data-count"));
        const suffix = el.getAttribute("data-suffix") || "";
        const duration = 1400;
        const start = performance.now();
        function frame(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = target * eased;
          el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
          if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      };

      if ("IntersectionObserver" in window) {
        const counterIo = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                animateCount(entry.target);
                counterIo.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.6 }
        );
        counters.forEach((el) => counterIo.observe(el));
      } else {
        counters.forEach(animateCount);
      }
    }

    /* ---------------------------------------------------------------
       Back to top
       ----------------------------------------------------------- */
    const backToTop = document.querySelector("[data-back-to-top]");
    if (backToTop) {
      window.addEventListener(
        "scroll",
        () => backToTop.classList.toggle("is-visible", window.scrollY > 480),
        { passive: true }
      );
      backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }

    /* ---------------------------------------------------------------
       Footer year
       ----------------------------------------------------------- */
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });

    /* ---------------------------------------------------------------
       Loader removal
       ----------------------------------------------------------- */
    const loader = document.querySelector("[data-loader]");
    if (loader) {
      window.addEventListener("load", () => {
        setTimeout(() => loader.classList.add("is-hidden"), 250);
      });
    }

    /* ---------------------------------------------------------------
       Contact form (static hosting — no backend wired up yet)
       ----------------------------------------------------------- */
    const contactForm = document.querySelector("[data-contact-form]");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const status = contactForm.querySelector("[data-form-status]");
        const email = "abderahmen.boudabous@example.com"; // TODO: replace with real address
        const name = contactForm.querySelector("#name")?.value || "";
        const message = contactForm.querySelector("#message")?.value || "";
        const subject = encodeURIComponent(`Portfolio contact from ${name}`);
        const body = encodeURIComponent(message);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        if (status) {
          status.textContent = "Opening your email client…";
          status.hidden = false;
        }
      });
    }
  });
})();
