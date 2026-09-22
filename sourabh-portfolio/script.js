/* =========================================================
   SOURABH RAMTEKE — PORTFOLIO
   Cinematic intro (plays on every load) + site interactions
========================================================= */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice  = window.matchMedia("(hover: none)").matches;

  if (prefersReduced) document.body.classList.add("no-cine");


  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ─────────────────────────────────────────────
     LENIS SMOOTH SCROLL
  ───────────────────────────────────────────── */
  let lenis = null;
  if (!prefersReduced && window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })();
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ─────────────────────────────────────────────
     CUSTOM CURSOR — dot + trailing ring
     transform-only, revealed on first real pointer move
  ───────────────────────────────────────────── */
  (function customCursor() {
    if (!window.gsap || prefersReduced || isTouchDevice) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot  = document.getElementById("curDot");
    const ring = document.getElementById("curRing");
    if (!dot || !ring) return;

    // centre both on the pointer via transform, so x/y stay pure translate
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    gsap.set(ring, { scale: 0.8 });          // 40px art * 0.8 = 32px resting

    const dx = gsap.quickTo(dot,  "x", { duration: 0.12, ease: "power3.out" });
    const dy = gsap.quickTo(dot,  "y", { duration: 0.12, ease: "power3.out" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3.out" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3.out" });

    let live = false;
    window.addEventListener("mousemove", (e) => {
      if (!live) {
        live = true;
        document.body.classList.add("cursor-live");
        // jump into place on the first move so it never animates in from 0,0
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
      }
      document.body.classList.remove("cursor-away");
      dx(e.clientX); dy(e.clientY);
      rx(e.clientX); ry(e.clientY);
    }, { passive: true });

    // fade out when the pointer leaves the window
    document.addEventListener("mouseleave", () => document.body.classList.add("cursor-away"));
    document.addEventListener("mouseenter", () => document.body.classList.remove("cursor-away"));

    // grow on interactive elements
    const hot = "a, button, .skill-tag, .showcase-shelf li, .pillar, .feat-card, .ach-card, .cmd-item, .tl-card, .about-stat-card, .tl-tags span";
    document.querySelectorAll(hot).forEach((el) => {
      el.addEventListener("mouseenter", () => {
        ring.classList.add("is-hot");
        gsap.to(ring, { scale: 1.2, duration: 0.3, ease: "power3.out", overwrite: "auto" });
        gsap.to(dot,  { scale: 0.5, duration: 0.3, ease: "power3.out", overwrite: "auto" });
      });
      el.addEventListener("mouseleave", () => {
        ring.classList.remove("is-hot");
        gsap.to(ring, { scale: 0.8, duration: 0.35, ease: "power3.out", overwrite: "auto" });
        gsap.to(dot,  { scale: 1,   duration: 0.35, ease: "power3.out", overwrite: "auto" });
      });
    });

    // hide entirely over text fields, where the native caret matters
    document.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-away"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-away"));
    });

    // click feedback
    window.addEventListener("mousedown", () => gsap.to(ring, { scale: 0.62, duration: 0.18, overwrite: "auto" }), { passive: true });
    window.addEventListener("mouseup",   () => gsap.to(ring, { scale: ring.classList.contains("is-hot") ? 1.2 : 0.8, duration: 0.28, overwrite: "auto" }), { passive: true });
  })();

  /* ─────────────────────────────────────────────
     MAGNETIC BUTTONS
  ───────────────────────────────────────────── */
  if (!isTouchDevice) {
    document.querySelectorAll(".mag-btn").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) * 0.26;
        const dy = (e.clientY - (r.top  + r.height / 2)) * 0.26;
        btn.style.transform = "translate(" + dx + "px," + dy + "px)";
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = "translate(0,0)"; });
    });
  }

  /* ─────────────────────────────────────────────
     COMMAND PALETTE
  ───────────────────────────────────────────── */
  const cmdOverlay = document.getElementById("cmdOverlay");
  const cmdInput   = document.getElementById("cmdInput");
  const navCmd     = document.getElementById("navCmd");
  const cmdItems   = Array.from(document.querySelectorAll(".cmd-item"));

  function openCmd()  {
    cmdOverlay.classList.add("open");
    cmdOverlay.setAttribute("aria-hidden", "false");
    setTimeout(() => cmdInput && cmdInput.focus(), 80);
  }
  function closeCmd() {
    cmdOverlay.classList.remove("open");
    cmdOverlay.setAttribute("aria-hidden", "true");
    if (cmdInput) cmdInput.value = "";
    cmdItems.forEach((i) => { i.style.display = ""; });
  }
  function goTo(sel) {
    const el = document.querySelector(sel);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth" });
  }

  if (navCmd)     navCmd.addEventListener("click", openCmd);
  if (cmdOverlay) cmdOverlay.addEventListener("click", (e) => { if (e.target === cmdOverlay) closeCmd(); });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openCmd(); }
    if (e.key === "Escape" && cmdOverlay.classList.contains("open")) closeCmd();
    if (e.key === "Escape" && intro && !intro.classList.contains("hidden")) closeIntro();
  });

  if (cmdInput) {
    cmdInput.addEventListener("input", () => {
      const q = cmdInput.value.toLowerCase();
      cmdItems.forEach((i) => { i.style.display = i.textContent.toLowerCase().includes(q) ? "" : "none"; });
    });
  }
  cmdItems.forEach((item) => {
    item.addEventListener("click", () => {
      const t = item.dataset.target, a = item.dataset.action;
      closeCmd();
      if (t) setTimeout(() => goTo(t), 90);
      else if (a === "resume") window.open("assets/sourabhramteke.pdf");
    });
  });

  /* ═════════════════════════════════════════════
     CINEMATIC INTRO — plays once per session
     1. Closed laptop settles down onto the floor
     2. Lid slowly opens, screen still blank
     3. Hero content assembles on the display
     4. Camera zooms out, PORTFOLIO reveals, site takes over
  ═════════════════════════════════════════════ */
  const intro      = document.getElementById("intro");
  const introEnter = document.getElementById("introEnter");
  const introSkip  = document.getElementById("introSkip");

  let introTl = null;

  function closeIntro() {
    if (!intro || intro.classList.contains("hidden")) return;
    if (introTl) introTl.kill();
    intro.classList.add("hidden");
    document.body.style.overflow = "";
    setTimeout(() => {
      intro.style.display = "none";
      if (window.ScrollTrigger) ScrollTrigger.refresh();
      const main = document.getElementById("top");
      if (main) { main.setAttribute("tabindex", "-1"); main.focus({ preventScroll: true }); }
    }, 1000);
  }

  if (intro) {
    {
      document.body.style.overflow = "hidden";

      if (introSkip)  introSkip.addEventListener("click", closeIntro);
      if (introEnter) introEnter.addEventListener("click", closeIntro);

      if (window.gsap && !document.body.classList.contains("no-cine")) {
        const TYPE_TEXT = "PORTFOLIO";
        const typedEl = document.getElementById("siTypedText");
        const caretEl = document.getElementById("siCaret");
        const typeState = { n: 0 };

        // ── starting state: closed laptop, off-screen LEFT, straight (no tilt)
        gsap.set("#cineCamera",   { opacity: 0, xPercent: -135, y: 0, scale: 0.97, rotateY: 0, rotateX: 4 });
        gsap.set("#cineClosed",   { opacity: 1 });
        gsap.set("#clLid",        { rotateX: -90 });
        gsap.set(".cl-screen-glow", { opacity: 0 });
        gsap.set("#clBoot",       { opacity: 0 });
        gsap.set("#clReflection", { xPercent: -14, opacity: 0.5 });
        gsap.set("#siTopbar",     { opacity: 0, y: -6 });
        gsap.set("#siTypedSub",   { opacity: 0, y: 8 });
        gsap.set("#siCaret",      { opacity: 0 });
        gsap.set("#cineSparkle",  { opacity: 0, scale: 0.6, rotate: -60 });
        gsap.set("#cineShadow",   { opacity: 0, scaleX: 0.6 });
        if (typedEl) typedEl.textContent = "";

        introTl = gsap.timeline({ delay: 0.2 });

        introTl
          // ── PHASE 1 — laptop glides in from the left and settles (0 → 1.6s)
          .to("#cineCamera", {
            opacity: 1, xPercent: 0, scale: 1,
            duration: 1.6, ease: "power3.out",
          })
          .to("#cineShadow", { opacity: 1, scaleX: 1, duration: 1.1, ease: "power2.out" }, "-=1.1")
          .to("#cineSparkle", { opacity: 1, scale: 1, rotate: 0, duration: 0.7, ease: "back.out(2.2)" }, "-=0.5")

          // ── PHASE 2 — lid hinges open, display wakes (1.6 → 3.1s)
          .to("#clLid", { rotateX: 0, duration: 1.45, ease: "back.out(1.1)" }, "+=0.2")
          .to("#cineCamera", { rotateX: 0, duration: 1.45, ease: "power2.inOut" }, "<")
          .to("#cineClosed", { opacity: 0, duration: 0.4, ease: "power2.in" }, "<+=0.12")
          .to("#clBoot", { opacity: 0.88, duration: 0.14, ease: "power2.out" }, "-=0.5")
          .to("#clBoot", { opacity: 0, duration: 0.5, ease: "power2.in" })
          .to(".cl-screen-glow", { opacity: 1, duration: 0.6, ease: "power2.out" }, "<")

          // ── PHASE 3 — browser chrome, then PORTFOLIO types out (3.1 → 5.2s)
          .to("#siTopbar", { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, "-=0.15")
          .to("#siCaret", { opacity: 1, duration: 0.2 })
          .call(() => { if (caretEl) caretEl.classList.add("blink"); })
          .to(typeState, {
            n: TYPE_TEXT.length,
            duration: 1.25,
            ease: "steps(" + TYPE_TEXT.length + ")",
            onUpdate: () => {
              if (typedEl) typedEl.textContent = TYPE_TEXT.slice(0, Math.round(typeState.n));
            },
          }, "+=0.15")
          .call(() => { if (caretEl) caretEl.classList.remove("blink"); })
          .to("#siTypedSub", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "+=0.1")
          .to("#siCaret", { opacity: 0, duration: 0.3 }, "<")
          .to("#clReflection", { xPercent: 16, opacity: 0.75, duration: 1.0, ease: "power1.inOut" }, "<")

          // ── PHASE 4 — camera pushes INTO the screen; the site opens inside it
          .to("#cineCamera", {
            scale: 4.6,
            duration: 2.0, ease: "power2.inOut",
          }, "+=0.5")
          // the surroundings drop away as we enter the display
          .to(["#cineShadow", "#cineSparkle", ".cine-floor", ".cine-glow-a", ".cine-glow-b"],
              { opacity: 0, duration: 1.0, ease: "power2.in" }, "<")
          .to(".intro", { backgroundColor: "#07070b", duration: 1.4, ease: "power2.inOut" }, "<")
          // bezel dissolves so the screen edge stops reading as a frame
          .to("#clLid", { padding: 0, borderRadius: 0, duration: 1.2, ease: "power2.inOut" }, "<")
          .to(".cl-screen", { borderRadius: 0, duration: 1.2, ease: "power2.inOut" }, "<")
          // screen contents fade, leaving the real page behind
          .to("#screenInner", { opacity: 0, duration: 0.7, ease: "power2.in" }, "-=0.95")
          .to(".cl-screen-glow", { opacity: 0, duration: 0.7 }, "<")
          .to("#clReflection", { opacity: 0, duration: 0.6 }, "<")

          .to("#introEnter", { opacity: 1, y: 0, duration: 0.4 }, "-=0.45")
          .call(() => { if (introEnter) introEnter.classList.add("visible"); })
          .call(() => { setTimeout(closeIntro, 700); });

      } else {
        if (introEnter) introEnter.classList.add("visible");
        setTimeout(closeIntro, 2400);
      }
    }
  }
  /* ─────────────────────────────────────────────
     NAV
  ───────────────────────────────────────────── */
  const nav = document.getElementById("nav");
  const navBurger = document.getElementById("navBurger");
  const navDrawer = document.getElementById("navDrawer");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  });
  if (navBurger) {
    navBurger.addEventListener("click", () => navDrawer.classList.toggle("open"));
    navDrawer.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => navDrawer.classList.remove("open"))
    );
  }

  /* ─────────────────────────────────────────────
     SCROLL PROGRESS
  ───────────────────────────────────────────── */
  const progress = document.getElementById("scrollProgress");
  function updateProgress() {
    const h = document.documentElement;
    const height = h.scrollHeight - h.clientHeight;
    const pct = height > 0 ? (h.scrollTop / height) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress);
  updateProgress();

  /* ─────────────────────────────────────────────
     BACK TO TOP
  ───────────────────────────────────────────── */
  const backTop = document.getElementById("backTop");
  if (backTop) {
    backTop.addEventListener("click", () => {
      if (lenis) lenis.scrollTo(0, { duration: 1.4 });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ─────────────────────────────────────────────
     COUNT-UP STATS
  ───────────────────────────────────────────── */
  const counters = document.querySelectorAll(".stat-num");
  if (counters.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const dur = 1400, start = performance.now();
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target).toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target.toLocaleString();
        })(start);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => obs.observe(c));
  }

  /* ─────────────────────────────────────────────
     HERO REVEAL (static section, plays on load/scroll)
  ───────────────────────────────────────────── */
  if (window.gsap && !prefersReduced) {
    const heroTl = gsap.timeline();

    // 1. background  2. eyebrow  3. kicker  4. name  5. tagline  6. sub  7. CTAs  8. social
    heroTl
      .from(".hero-media", { opacity: 0, scale: 1.045, duration: 1.4, ease: "power3.out" })
      .from(".hero-eyebrow", { y: -14, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.35)
      .from(".hero-kicker", { y: 12, opacity: 0, duration: 0.55, ease: "power3.out" }, 0.5)
      // name lifts in with a soft focus-pull (blur → sharp) for a premium feel
      .from(".hero-name", { y: 34, opacity: 0, filter: "blur(14px)", duration: 1.1, ease: "power4.out" }, 0.6)
      .from(".hero-tagline", { y: 22, opacity: 0, filter: "blur(8px)", duration: 0.9, ease: "power4.out" }, 0.85)
      .from(".hero-sub", { y: 18, opacity: 0, duration: 0.8, ease: "power3.out" }, 1.05)
      .from(".hero-actions", { y: 16, opacity: 0, duration: 0.7, ease: "power3.out" }, 1.2)
      .from(".hero-social a", { y: 14, opacity: 0, duration: 0.55, stagger: 0.08, ease: "power3.out" }, 1.32)
      // clear any lingering blur so text stays crisp for the rest of the session
      .set([".hero-name", ".hero-tagline"], { clearProps: "filter" });
  }

  /* ═════════════════════════════════════════════
     HERO PHOTO — subtle life on the baked-in artwork
     (tech cards are part of the image now, so no orbit engine)
  ═════════════════════════════════════════════ */
  (function heroPhoto() {
    if (!window.gsap) return;
    const media = document.getElementById("heroMedia");
    const hero  = document.getElementById("hero");
    if (!media || !hero) return;

    // very slow breathing so the whole scene feels alive, not static
    if (!prefersReduced) {
      gsap.to(media, {
        yPercent: 0.9, scale: 1.012,
        duration: 7, ease: "sine.inOut",
        repeat: -1, yoyo: true,
      });
    }

    // subtle mouse parallax on the photo (5-8px), disabled on touch / reduced motion
    if (!isTouchDevice && !prefersReduced) {
      const mX = gsap.quickTo(media, "x", { duration: 1.1, ease: "power3.out" });
      const mY = gsap.quickTo(media, "y", { duration: 1.1, ease: "power3.out" });
      window.addEventListener("mousemove", (e) => {
        const r = hero.getBoundingClientRect();
        if (e.clientY < r.top || e.clientY > r.bottom) return;
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / r.height) * 2 - 1;
        mX(nx * -7);
        mY(ny * -5);
      }, { passive: true });
    }

    // scroll away — photo eases down and out, copy lifts, next section takes over
    if (window.ScrollTrigger && !prefersReduced) {
      gsap.to(media, {
        scale: 0.94, ease: "none", immediateRender: false,
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-inner", {
        y: -50, opacity: 0.25, ease: "none", immediateRender: false,
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
      });
    }
  })();

  /* ═════════════════════════════════════════════
     WORK — six-project stage + horizontal strip
     click a card / use prev-next → info + screenshot
     crossfade, active card syncs, GSAP entrance
  ═════════════════════════════════════════════ */
  (function workSection() {
    if (!document.getElementById("workStage")) return;

    const PROJECTS = [
      {
        idx: "01 / 06",
        meta: "May &ndash; Jun 2026 &middot; Personal Project",
        title: "PlantVision AI &mdash; Plant Disease Detection",
        desc: "An AI web app that detects 38 disease classes across 14 plant species using ResNet50, achieving 97.3% accuracy. Real-time image inference via FastAPI returns confidence scores and Top-5 predictions in under 200ms.",
        points: [
          "97.3% accuracy across 38 disease classes, 14 plant species",
          "FastAPI inference endpoints, Top-5 predictions &lt;200ms",
          "CNN vs. ResNet50 model comparison dashboard in React.js",
        ],
        stack: ["Python", "FastAPI", "PyTorch", "ResNet50", "React", "Tailwind CSS"],
        url: "plantvision-ai.vercel.app",
        img: "assets/projects/plant_vision.webp",
        link: "https://github.com/maa101-hub/plant_ui",
      },
      {
        idx: "02 / 06",
        meta: "Feb &ndash; May 2026 &middot; Personal Project",
        title: "SkyWays &mdash; Airline Booking System",
        desc: "A scalable airline booking platform on Spring Boot microservices &mdash; independent flight, booking, payment, and notification services with JWT role-based access and a live Razorpay integration.",
        points: [
          "JWT RBAC with Admin &amp; Customer roles across every service",
          "Apache Kafka for decoupled async notifications",
          "Razorpay payment gateway, Spring Cloud orchestration",
        ],
        stack: ["Java", "Spring Boot", "Spring Cloud", "React", "MySQL", "Kafka"],
        url: "skyways-airline.vercel.app",
        img: "assets/projects/skyways.webp",
        link: "https://github.com/maa101-hub/SkyWaysAirline_Project",
        demo: "https://www.linkedin.com/feed/update/urn:li:activity:7504070055815643136/",
        demoLabel: "Demo Video",
      },
      {
        idx: "03 / 06",
        meta: "Nov 2025 &ndash; Apr 2026 &middot; Personal Project",
        title: "Campus Connect &mdash; Social Networking Platform",
        desc: "A full-stack social platform with posts, comments, likes, a follow system, and real-time chat via WebSocket. Redis caching for session management and feed performance; Kafka for async push notifications.",
        points: [
          "Real-time WebSocket chat and live feed",
          "Redis caching for sessions and feed performance",
          "Zustand-managed React frontend, JWT auth",
        ],
        stack: ["Java", "Spring Boot", "React", "PostgreSQL", "Redis", "Kafka"],
        url: "campus-connect.vercel.app",
        img: "assets/projects/campus-connect.webp",
        link: "https://github.com/maa101-hub/campus-connect",
        demo: "https://www.linkedin.com/feed/update/urn:li:activity:7480291485754540032/",
        demoLabel: "Demo Video",
      },
      {
        idx: "04 / 06",
        meta: "Personal Project",
        title: "Job Portal &mdash; Recruitment Platform",
        desc: "A recruitment platform connecting job seekers and recruiters &mdash; role-based dashboards, application tracking, and secure authentication built on a Spring Boot and React stack.",
        points: [
          "JWT-secured role-based access for candidates and recruiters",
          "Application tracking with status updates end-to-end",
          "Responsive React dashboard backed by a relational schema",
        ],
        stack: ["Java", "Spring Boot", "React", "MySQL", "JWT"],
        url: "jobportal.vercel.app",
        img: "assets/projects/jobportal.webp",
        link: "https://github.com/maa101-hub/jobportal",
      },
      {
        idx: "05 / 06",
        meta: "Personal Project",
        title: "MplyChek &mdash; Employee Management System",
        desc: "An employee management system for HR teams &mdash; onboarding, attendance, and record management with role-based access, built for real operational workflows.",
        points: [
          "Role-based access for HR, managers, and employees",
          "Centralized employee records and attendance tracking",
          "PostgreSQL-backed Spring Boot API with a React front end",
        ],
        stack: ["Node.js", "Express.js", "Angular", "PostgreSQL", "JWT"],
        url: "mlpoycheck-challenge.vercel.app",
        img: "assets/projects/mplychek.webp",
        link: "https://github.com/maa101-hub/mlpoycheck_challenge",
        demo: "https://mlpoycheck-challenge.vercel.app/",
        demoLabel: "Live Demo",
      },
      {
        idx: "06 / 06",
        meta: "Personal Project",
        title: "Free Fire Arena &mdash; Tournament Platform",
        desc: "A live tournament platform for competitive gaming &mdash; player registration, match scheduling, and real-time leaderboard updates for organized esports events.",
        points: [
          "Real-time leaderboard updates via WebSocket",
          "Player registration and match scheduling workflows",
          "MongoDB-backed Node.js API with a React front end",
        ],
        stack: ["React", "Node.js", "MongoDB", "Socket.io"],
        url: "free-fire-tournament.vercel.app",
        img: "assets/projects/ff.webp",
        link: "https://github.com/maa101-hub/free_fire_tournament",
        demo: "https://vercel.com/maa101-hubs-projects/free-fire-tournament",
        demoLabel: "Live Demo",
      },
    ];

    const els = {
      counter: document.getElementById("wsCounter"),
      meta:    document.getElementById("wsMeta"),
      title:   document.getElementById("wsTitle"),
      desc:    document.getElementById("wsDesc"),
      points:  document.getElementById("wsPoints"),
      stack:   document.getElementById("wsStack"),
      links:   document.getElementById("wsLinks"),
      demoLink:  document.getElementById("wsDemoLink"),
      demoLabel: document.getElementById("wsDemoLabel"),
      img:     document.getElementById("wsImg"),
      urlBar:  document.getElementById("wsUrlBar"),
      navLabel:document.getElementById("wsNavLabel"),
      prev:    document.getElementById("wsPrev"),
      next:    document.getElementById("wsNext"),
      info:    document.getElementById("wsInfo"),
      screen:  document.getElementById("wsScreen"),
      strip:   document.getElementById("workStrip"),
    };
    const cards = gsap.utils.toArray(".ws-card", els.strip);

    let current = 0;
    let animating = false;

    function render(i, { instant = false } = {}) {
      const p = PROJECTS[i];

      // active card + strip sync
      cards.forEach((c, ci) => {
        c.classList.toggle("active", ci === i);
        c.setAttribute("aria-selected", ci === i ? "true" : "false");
      });
      cards[i] && cards[i].scrollIntoView({ behavior: instant ? "auto" : "smooth", inline: "center", block: "nearest" });

      const fillText = () => {
        els.counter.textContent = p.idx;
        els.meta.innerHTML = p.meta;
        els.title.innerHTML = p.title;
        els.desc.innerHTML = p.desc;
        els.points.innerHTML = p.points.map((pt) => "<li>" + pt + "</li>").join("");
        els.stack.innerHTML = p.stack.map((s) => "<span>" + s + "</span>").join("");
        els.links.querySelector(".ws-github").href = p.link;
        if (els.demoLink) {
          if (p.demo) {
            els.demoLink.href = p.demo;
            els.demoLabel.textContent = p.demoLabel || "Live Demo";
            els.demoLink.hidden = false;
          } else {
            els.demoLink.hidden = true;
          }
        }
        els.urlBar.textContent = p.url;
        els.navLabel.textContent = p.idx;
      };

      if (instant || !window.gsap) {
        fillText();
        els.img.src = p.img;
        els.img.alt = p.title.replace(/&mdash;/g, "—") + " screenshot";
        return;
      }

      if (animating) return;
      animating = true;

      // Preload the next screenshot in parallel with the fade-out so the
      // swapped image is decoded before we fade the panel back in — no flash.
      let imgReady = false;
      const pre = new Image();
      pre.onload = pre.onerror = () => { imgReady = true; };
      pre.src = p.img;

      const fadeIn = () => {
        els.img.src = p.img;
        els.img.alt = p.title.replace(/&mdash;/g, "—") + " screenshot";
        gsap.fromTo([els.info, els.screen],
          { opacity: 0, y: prefersReduced ? 0 : 12 },
          {
            opacity: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.05,
            onComplete: () => { animating = false; },
          }
        );
      };

      gsap.to([els.info, els.screen], {
        opacity: 0, y: prefersReduced ? 0 : 10, duration: 0.22, ease: "power2.in",
        onComplete: () => {
          fillText();
          // Wait for the preloaded image (cap the wait so we never hang).
          if (imgReady) {
            fadeIn();
          } else {
            let waited = 0;
            const iv = setInterval(() => {
              waited += 40;
              if (imgReady || waited >= 400) { clearInterval(iv); fadeIn(); }
            }, 40);
          }
        },
      });
    }

    function go(i) {
      current = (i + PROJECTS.length) % PROJECTS.length;
      render(current);
    }

    cards.forEach((c) => {
      c.addEventListener("click", () => go(parseInt(c.dataset.idx, 10)));
    });
    if (els.prev) els.prev.addEventListener("click", () => go(current - 1));
    if (els.next) els.next.addEventListener("click", () => go(current + 1));

    // keyboard arrows when the stage is in view
    document.addEventListener("keydown", (e) => {
      const stage = document.getElementById("workStage");
      if (!stage) return;
      const r = stage.getBoundingClientRect();
      const inView = r.top < window.innerHeight * 0.8 && r.bottom > 0;
      if (!inView) return;
      if (e.key === "ArrowRight") go(current + 1);
      if (e.key === "ArrowLeft") go(current - 1);
    });

    // entrance on scroll
    if (window.gsap && window.ScrollTrigger) {
      const stage = document.getElementById("workStage");
      if (prefersReduced) {
        gsap.set([els.info, els.screen, cards], { opacity: 1, y: 0 });
      } else {
        gsap.set(els.info, { opacity: 0, x: -24 });
        gsap.set(els.screen, { opacity: 0, x: 24, scale: 0.97 });
        gsap.set(cards, { opacity: 0, y: 18 });

        gsap.timeline({
          scrollTrigger: { trigger: stage, start: "top 75%", once: true },
        })
          .to(els.info, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" })
          .to(els.screen, { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: "power3.out" }, "-=0.5")
          .to(cards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, "-=0.3");
      }
    }
  })();

  /* ─────────────────────────────────────────────
     SHOWCASE BAND — slow parallax on the artwork
  ───────────────────────────────────────────── */
  /* ═════════════════════════════════════════════
     PILLARS — cards settle in from their own side,
     as if assembling around a shared center
  ═════════════════════════════════════════════ */
  (function pillarsReveal() {
    if (!window.gsap) return;
    const section = document.querySelector(".pillars");
    if (!section) return;

    const heading = section.querySelectorAll(".pillars-head > *");
    const cards   = gsap.utils.toArray(".pillar", section);
    const ghosts  = gsap.utils.toArray(".pillar-ghost", section);

    if (prefersReduced) {
      gsap.set([heading, cards, ghosts], { opacity: 1, x: 0, y: 0 });
      return;
    }

    const dirOffset = {
      left:  { x: -44, y: 18 },
      up:    { x: 0,   y: -36 },
      right: { x: 44,  y: 18 },
    };

    gsap.set(heading, { opacity: 0, y: 18 });
    cards.forEach((card) => {
      const d = dirOffset[card.dataset.dir] || dirOffset.up;
      gsap.set(card, { opacity: 0, x: d.x, y: d.y, scale: 0.96 });
    });
    gsap.set(ghosts, { opacity: 0, scale: 0.85 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 72%", once: true },
    });

    tl.to(heading, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" })
      .to(cards, {
        opacity: 1, x: 0, y: 0, scale: 1,
        duration: 0.75, stagger: 0.15, ease: "power4.out",
      }, "-=0.2")
      .to(ghosts, {
        opacity: 0.05, scale: 1,
        duration: 0.6, stagger: 0.15, ease: "power2.out",
      }, "-=0.5");
  })();

  (function showcaseBand() {
    if (!window.gsap) return;
    const band = document.querySelector(".showcase");
    if (!band) return;

    const media   = document.getElementById("showcaseMedia");
    const kicker  = band.querySelector(".section-kicker");
    const lines   = gsap.utils.toArray(".sc-line-in", band);
    const sub     = band.querySelector(".showcase-sub");
    const chips   = gsap.utils.toArray(".showcase-shelf li", band);
    const sign    = document.getElementById("showcaseSign");
    const screenA = band.querySelector(".sc-screen-a");
    const screenB = band.querySelector(".sc-screen-b");
    const lamp    = band.querySelector(".sc-lamp");

    const signText = sign ? sign.textContent : "";

    if (prefersReduced) {
      gsap.set([kicker, lines, sub, chips], { opacity: 1, x: 0, y: 0, rotate: 0 });
      gsap.set([screenA, screenB, lamp], { opacity: 1 });
      return;
    }

    /* ---- initial states ---- */
    gsap.set(kicker, { opacity: 0, y: 14 });
    gsap.set(lines,  { yPercent: 108 });                 // hidden inside their mask
    gsap.set(sub,    { opacity: 0, y: 16 });
    gsap.set(chips,  { opacity: 0, x: 26, y: 8, rotate: 2 });  // sliding off the shelf
    if (sign) sign.textContent = "";

    /* ---- entrance timeline ---- */
    const tl = gsap.timeline({
      scrollTrigger: { trigger: band, start: "top 68%", once: true },
    });

    tl.to(kicker, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
      // headline wipes up, line by line
      .to(lines, { yPercent: 0, duration: 1.0, stagger: 0.14, ease: "power4.out" }, "-=0.25")
      .to(sub,   { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.5")
      // chips slide in from the shelf side and settle straight
      .to(chips, {
        opacity: 1, x: 0, y: 0, rotate: 0,
        duration: 0.6, stagger: 0.07, ease: "power3.out",
      }, "-=0.35");

    // signature types itself, like the code comment it is
    if (sign) {
      const typer = { n: 0 };
      tl.to(typer, {
        n: signText.length,
        duration: Math.min(1.6, signText.length * 0.022),
        ease: "none",
        onUpdate: () => { sign.textContent = signText.slice(0, Math.round(typer.n)); },
      }, "-=0.1");
    }

    /* ---- monitors wake, then breathe on their own rhythms ---- */
    if (screenA) {
      tl.to(screenA, { opacity: 1, duration: 0.9, ease: "power2.out" }, 0.5);
      gsap.to(screenA, { opacity: 0.62, duration: 3.4, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.6 });
    }
    if (screenB) {
      tl.to(screenB, { opacity: 1, duration: 0.9, ease: "power2.out" }, 0.72);
      gsap.to(screenB, { opacity: 0.68, duration: 4.1, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 2.1 });
    }
    if (lamp) {
      tl.to(lamp, { opacity: 1, duration: 1.1, ease: "power2.out" }, 0.3);
      gsap.to(lamp, { opacity: 0.74, duration: 5.2, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.2 });
    }

    /* ---- camera: scroll parallax + subtle mouse drift ---- */
    if (window.ScrollTrigger && media) {
      gsap.set(media, { scale: 1.12 });
      gsap.to(media, {
        yPercent: 7, scale: 1.02, ease: "none",
        scrollTrigger: { trigger: band, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });

      if (!isTouchDevice) {
        const pX = gsap.quickTo(media, "x", { duration: 1.2, ease: "power3.out" });
        const pY = gsap.quickTo(media, "y", { duration: 1.2, ease: "power3.out" });
        window.addEventListener("mousemove", (e) => {
          const r = band.getBoundingClientRect();
          if (e.clientY < r.top || e.clientY > r.bottom) return;
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
          pX(nx * -9);
          pY(ny * -6);
        }, { passive: true });
      }
    }
  })();

  /* ═════════════════════════════════════════════
     TECHNICAL ARSENAL — premium scroll choreography
     heading first → categories from varied directions
     → devicon pills stagger in with scale 0.85 → 1
  ═════════════════════════════════════════════ */
  if (window.gsap && window.ScrollTrigger) {
    const skills = document.querySelector(".skills");
    if (skills) {
      const heading = skills.querySelectorAll(".skills-head > *");
      const groups  = gsap.utils.toArray(".skill-group", skills);
      const core    = skills.querySelector(".skills-core");

      // offsets per entry direction, kept subtle
      const dirOffset = {
        left:  { x: -46, y: 0 },
        right: { x: 46,  y: 0 },
        up:    { x: 0,   y: -40 },
        down:  { x: 0,   y: 40 },
      };

      if (prefersReduced) {
        // static: everything visible, no motion
        gsap.set([heading, groups, ".skill-tag"], { opacity: 1, x: 0, y: 0, scale: 1 });
        if (core) gsap.set(core, { opacity: 1, scale: 1 });
      } else {
        // initial hidden states
        gsap.set(heading, { opacity: 0, y: 22 });
        groups.forEach((g) => {
          const d = dirOffset[g.dataset.dir] || dirOffset.up;
          gsap.set(g, { opacity: 0, x: d.x, y: d.y });
        });
        gsap.set(".skill-tag", { opacity: 0, y: 12, scale: 0.85 });
        if (core) gsap.set(core, { opacity: 0, scale: 0.4 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: skills, start: "top 72%", once: true },
        });

        // 1. heading reveals
        tl.to(heading, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" });

        // 2. center core fades in behind the grid
        if (core) tl.to(core, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, "-=0.3");

        // 3. categories settle in one by one from their own direction
        tl.to(groups, {
          opacity: 1, x: 0, y: 0,
          duration: 0.7, stagger: 0.14, ease: "power4.out",
        }, "-=0.35");

        // 4. devicon pills stagger within each category as it lands
        groups.forEach((g, i) => {
          tl.to(g.querySelectorAll(".skill-tag"), {
            opacity: 1, y: 0, scale: 1,
            duration: 0.5, stagger: 0.05, ease: "power3.out",
          }, "-=" + (i === 0 ? 0.45 : 0.55));
        });
      }
    }
  }

  /* ─────────────────────────────────────────────
     SKILLS CONSTELLATION — faint lines link each
     category to the center core, with a pulse that
     travels inward. Redrawn on resize.
  ───────────────────────────────────────────── */
  (function skillsConstellation() {
    const grid = document.querySelector(".skills-grid");
    const core = document.querySelector(".skills-core");
    if (!grid || !core) return;
    // core is hidden < 980px; skip there and under reduced motion
    if (prefersReduced) return;

    const SVGNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "skills-net");
    svg.setAttribute("aria-hidden", "true");
    grid.insertBefore(svg, grid.firstChild);

    const groups = Array.from(grid.querySelectorAll(".skill-group"));

    const draw = () => {
      if (window.matchMedia("(max-width: 980px)").matches) {
        svg.style.display = "none";
        return;
      }
      svg.style.display = "";
      const gr = grid.getBoundingClientRect();
      svg.setAttribute("viewBox", "0 0 " + gr.width + " " + gr.height);
      svg.setAttribute("width", gr.width);
      svg.setAttribute("height", gr.height);
      const cr = core.getBoundingClientRect();
      const cx = cr.left - gr.left + cr.width / 2;
      const cy = cr.top - gr.top + cr.height / 2;

      // clear
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      groups.forEach((g, i) => {
        const r = g.getBoundingClientRect();
        const gx = r.left - gr.left + r.width / 2;
        const gy = r.top - gr.top + r.height / 2;

        const line = document.createElementNS(SVGNS, "line");
        line.setAttribute("x1", gx); line.setAttribute("y1", gy);
        line.setAttribute("x2", cx); line.setAttribute("y2", cy);
        line.setAttribute("class", "skills-net-line");
        svg.appendChild(line);

        // traveling pulse dot from the category toward the core
        const dot = document.createElementNS(SVGNS, "circle");
        dot.setAttribute("r", "2.4");
        dot.setAttribute("class", "skills-net-dot");
        svg.appendChild(dot);
        if (window.gsap) {
          gsap.fromTo(dot,
            { attr: { cx: gx, cy: gy }, opacity: 0 },
            {
              attr: { cx: cx, cy: cy }, opacity: 1,
              duration: 1.8, ease: "power1.inOut",
              repeat: -1, repeatDelay: 1.1, delay: i * 0.5,
              yoyo: false,
              onRepeat: () => gsap.set(dot, { attr: { cx: gx, cy: gy } }),
            }
          );
        }
      });
    };

    // draw after layout settles, and on resize (debounced)
    const kick = () => requestAnimationFrame(draw);
    window.addEventListener("load", kick);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(kick);
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(draw, 150); }, { passive: true });
    kick();
  })();

  /* ─────────────────────────────────────────────
     SKILL PILLS — magnetic tilt toward the cursor
     (pointer:fine only; cheap transform-only).
  ───────────────────────────────────────────── */
  (function skillPillMagnet() {
    if (isTouchDevice || prefersReduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.querySelectorAll(".skill-tag").forEach((pill) => {
      pill.addEventListener("mousemove", (e) => {
        const r = pill.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;   // -0.5..0.5
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        pill.style.transform =
          "translate(" + (dx * 6) + "px," + (dy * 4 - 3) + "px) rotate(" + (dx * 3) + "deg) scale(1.06)";
      });
      pill.addEventListener("mouseleave", () => { pill.style.transform = ""; });
    });
  })();

  /* ─────────────────────────────────────────────
     GENERIC SCROLL REVEALS
  ───────────────────────────────────────────── */
  if (window.gsap && window.ScrollTrigger) {
    [
      ".story-copy > *", ".tl-item",
      ".work-item", ".feat-card", ".ach-card",
      ".cta-headline, .cta-sub", ".stat",
    ].forEach((sel) => {
      gsap.utils.toArray(sel).forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 28 },
          {
            opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }
        );
      });
    });
  } else {
    document.querySelectorAll(".pillar, .work-item, .feat-card, .ach-card")
      .forEach((el) => { el.style.opacity = 1; });
  }

  /* ─────────────────────────────────────────────
     CONTACT FORM  (set FORMSPREE_ID to go live)
  ───────────────────────────────────────────── */
  const FORMSPREE_ID = "";

  const ctaForm    = document.getElementById("ctaForm");
  const ctaSuccess = document.getElementById("ctaSuccess");
  const ctaError   = document.getElementById("ctaError");
  const cfSubmit   = document.getElementById("cf-submit");

  if (ctaForm) {
    ctaForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name    = document.getElementById("cf-name").value.trim();
      const email   = document.getElementById("cf-email").value.trim();
      const message = document.getElementById("cf-message").value.trim();
      if (!name || !email || !message) return;

      ctaSuccess.classList.remove("visible");
      ctaError.classList.remove("visible");
      cfSubmit.disabled = true;
      cfSubmit.querySelector("span").textContent = "Sending...";

      if (FORMSPREE_ID) {
        try {
          const res = await fetch("https://formspree.io/f/" + FORMSPREE_ID, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ name, email, message }),
          });
          if (res.ok) { ctaSuccess.classList.add("visible"); ctaForm.reset(); }
          else        { ctaError.classList.add("visible"); }
        } catch (_) { ctaError.classList.add("visible"); }
      } else {
        ctaSuccess.classList.add("visible");
        ctaForm.reset();
      }

      cfSubmit.disabled = false;
      cfSubmit.querySelector("span").textContent = "Send message";
    });
  }

  /* ─────────────────────────────────────────────
     CONTACT SECTION — column reveal + paper-plane flight
     along its dotted trail, handwriting fade-in.
  ───────────────────────────────────────────── */
  (function contactReveal() {
    const cta = document.getElementById("contact");
    if (!cta) return;
    if (!window.gsap || !window.ScrollTrigger) return;

    const intentCards = gsap.utils.toArray(".cta-intent-card, .cta-status", cta);
    const elLinks     = gsap.utils.toArray(".cta-el-link", cta);
    const formPanel   = cta.querySelector(".cta-form-panel");
    const handLeft    = cta.querySelector(".cta-hand-left");
    const planeWrap   = cta.querySelector(".cta-plane-wrap");
    const plane       = document.getElementById("ctaPlane");
    const trail       = document.getElementById("ctaTrailPath");

    if (prefersReduced) {
      gsap.set([intentCards, elLinks, formPanel, handLeft, planeWrap], { opacity: 1, x: 0, y: 0 });
      return;
    }

    gsap.set(intentCards, { opacity: 0, x: -22 });
    gsap.set(elLinks,     { opacity: 0, x: 22 });
    gsap.set(formPanel,   { opacity: 0, y: 26 });
    if (handLeft)  gsap.set(handLeft,  { opacity: 0, y: 10 });
    if (planeWrap) gsap.set(planeWrap, { opacity: 0 });

    // dotted trail draws in
    let trailLen = 0;
    if (trail) {
      trailLen = trail.getTotalLength ? trail.getTotalLength() : 260;
      gsap.set(trail, { strokeDasharray: "4 7", strokeDashoffset: trailLen });
    }

    const tl = gsap.timeline({
      scrollTrigger: { trigger: cta, start: "top 68%", once: true },
    });

    tl.to(formPanel,   { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
      .to(intentCards, { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "-=0.45")
      .to(elLinks,     { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "-=0.55")
      .to(handLeft,    { opacity: 0.9, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.4");

    // plane + trail: the trail draws, the plane rides in behind it
    if (planeWrap) {
      tl.to(planeWrap, { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.5");
      if (trail) {
        tl.to(trail, { strokeDashoffset: 0, duration: 1.0, ease: "power2.out" }, "-=0.4");
      }
      if (plane) {
        tl.from(plane, {
          x: -120, y: 60, rotate: -18, opacity: 0,
          duration: 1.0, ease: "power3.out",
        }, "-=0.9");
        // gentle idle float once it lands
        tl.add(() => {
          gsap.to(plane, {
            y: "-=6", rotate: "+=3",
            duration: 2.6, ease: "sine.inOut", repeat: -1, yoyo: true,
          });
        });
      }
    }
  })();

  /* ─────────────────────────────────────────────
     TIMELINE LINE DRAW-IN — the vertical connector
     draws downward as the Story timeline enters view.
  ───────────────────────────────────────────── */
  (function timelineDraw() {
    const timeline = document.querySelector(".story-timeline");
    if (!timeline) return;
    if (prefersReduced || !window.gsap || !window.ScrollTrigger) return;

    // Mark ready so the CSS seeds --tl-draw to 0 (line collapsed at top).
    timeline.classList.add("tl-draw-ready");

    ScrollTrigger.create({
      trigger: timeline,
      start: "top 78%",
      once: true,
      onEnter: () => {
        gsap.to(timeline, {
          "--tl-draw": 1,
          duration: 1.1,
          ease: "power3.out",
        });
      },
    });
  })();

  /* ─────────────────────────────────────────────
     STAT COUNTERS — numbers count up when the About
     section scrolls into view. Non-numeric values
     (e.g. "Consistent") are left untouched.
  ───────────────────────────────────────────── */
  (function statCounters() {
    const vals = Array.from(document.querySelectorAll(".about-stat-card .stat-val"));
    if (!vals.length) return;

    // Parse "1000+" / "1,700+" into { target, prefix, suffix }. Skip non-numeric.
    const parse = (raw) => {
      const m = raw.match(/^([^\d]*)([\d,]+)(.*)$/);
      if (!m) return null;
      const target = parseInt(m[2].replace(/,/g, ""), 10);
      if (!Number.isFinite(target)) return null;
      const grouped = m[2].includes(",");
      return { prefix: m[1], target, suffix: m[3], grouped };
    };

    const format = (n, grouped) =>
      grouped ? n.toLocaleString("en-US") : String(n);

    const items = vals
      .map((el) => ({ el, spec: parse(el.textContent.trim()) }))
      .filter((it) => it.spec);

    if (!items.length) return;

    // Reduced motion / no GSAP: leave the final text as-is (already correct).
    if (prefersReduced || !window.gsap || !window.ScrollTrigger) return;

    // Seed to starting value so the count-up reads from 0.
    items.forEach(({ el, spec }) => {
      el.textContent = spec.prefix + format(0, spec.grouped) + spec.suffix;
    });

    const run = () => {
      items.forEach(({ el, spec }, i) => {
        const obj = { n: 0 };
        gsap.to(obj, {
          n: spec.target,
          duration: 1.6,
          delay: i * 0.12,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = spec.prefix + format(Math.round(obj.n), spec.grouped) + spec.suffix;
          },
          onComplete: () => {
            el.textContent = spec.prefix + format(spec.target, spec.grouped) + spec.suffix;
          },
        });
      });
    };

    const trigger = document.querySelector(".about-stats-row") ||
                    items[0].el.closest(".story");
    ScrollTrigger.create({
      trigger,
      start: "top 85%",
      once: true,
      onEnter: run,
    });
  })();

  /* ─────────────────────────────────────────────
     REFRESH TRIGGERS ONCE FONTS/LAYOUT SETTLE
  ───────────────────────────────────────────── */
  window.addEventListener("load", () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  }

})();
















