(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile menu ---------- */
  const menu = $("#menu");
  const links = $("#links");
  menu.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    menu.setAttribute("aria-expanded", open);
    menu.textContent = open ? "✕" : "☰";
  });
  $$("#links a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
      menu.textContent = "☰";
    })
  );

  /* ---------- Scroll progress + back-to-top ---------- */
  const progress = $("#progress");
  const topBtn = $("#top");
  addEventListener(
    "scroll",
    () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      progress.style.width = p * 100 + "%";
      topBtn.classList.toggle("show", h.scrollTop > 500);
    },
    { passive: true }
  );
  topBtn.addEventListener("click", () =>
    scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
  );

  /* ---------- Cursor glow (desktop only) ---------- */
  const glow = $("#glow");
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    addEventListener("mousemove", (e) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    });
  } else {
    glow.style.display = "none";
  }

  /* ---------- Typing effect ---------- */
  const roleEl = $("#role");
  const roles = ["Web Developer", "UI Designer", "Node.js Developer", "Freelancer"];
  let ri = 0, ci = 0, deleting = false;

  function type() {
    const word = roles[ri];
    roleEl.textContent = word.slice(0, ci);
    if (!deleting && ci === word.length) {
      deleting = true;
      return setTimeout(type, 1400);
    }
    if (deleting && ci === 0) {
      deleting = false;
      ri = (ri + 1) % roles.length;
    }
    ci += deleting ? -1 : 1;
    setTimeout(type, deleting ? 45 : 90);
  }
  if (!reduce) {
    roleEl.classList.add("typing");
    type();
  }

  /* ---------- Scroll reveal, skill bars, counters ---------- */
  const fills = $$(".fill");
  fills.forEach((f) => {
    f.dataset.w = f.style.width;           // remember the real width
    if (!reduce) f.style.width = "0";
  });

  function countUp(el) {
    const target = +el.dataset.count;
    const start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(target * p) + (p === 1 ? "+" : "");
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("in");
        $$(".fill", el).forEach((f) => (f.style.width = f.dataset.w));
        $$("[data-count]", el).forEach(countUp);
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );
  $$(".rv").forEach((el) => revealObserver.observe(el));

  /* ---------- Active nav link ---------- */
  const navLinks = $$("#links a");
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
          );
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  ["home", "about", "skills", "projects", "achievements", "contact"].forEach((id) => {
    const sec = document.getElementById(id);
    if (sec) navObserver.observe(sec);
  });

  /* ---------- Project filter ---------- */
  const filterBtns = $$(".filters button");
  filterBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.toggle("on", b === btn));
      $$(".card").forEach((card) => {
        const hide = btn.dataset.f !== "all" && card.dataset.c !== btn.dataset.f;
        card.classList.toggle("hide", hide);
      });
    })
  );

  /* ---------- 3D tilt on cards ---------- */
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    $$(".card, .ach-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
    });
  }

  /* ---------- Certificate lightbox ---------- */
  const lightbox = $("#lightbox");
  const lightImg = $("img", lightbox);
  $$(".ach-img").forEach((img) =>
    img.addEventListener("click", () => {
      lightImg.src = img.src;
      lightImg.alt = img.alt;
      lightbox.classList.add("open");
    })
  );
  lightbox.addEventListener("click", () => lightbox.classList.remove("open"));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") lightbox.classList.remove("open");
  });

  /* ---------- Hero particle network ---------- */
  const canvas = $("#net");
  const ctx = canvas.getContext("2d");
  const colors = ["#ff3eb5", "#df54f4", "#3b82f6"];
  let pts = [], mx = -999, my = -999;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const count = Math.min(60, Math.floor(canvas.width / 18));
    pts = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      c: colors[i % 3],
    }));
  }
  resize();
  addEventListener("resize", resize);

  const hero = $("#home");
  hero.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  });
  hero.addEventListener("mouseleave", () => (mx = my = -999));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.globalAlpha = 0.8;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 110) {
          ctx.globalAlpha = (1 - d / 110) * 0.35;
          ctx.strokeStyle = p.c;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      const dm = Math.hypot(p.x - mx, p.y - my);
      if (dm < 150) {
        ctx.globalAlpha = (1 - dm / 150) * 0.7;
        ctx.strokeStyle = "#f8fafc";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mx, my);
        ctx.stroke();
      }
    });
    requestAnimationFrame(draw);
  }
  if (!reduce) draw();

  /* ---------- Contact form ---------- */
  $("#send").addEventListener("click", () => {
    const fields = ["n", "e", "m"].map((id) => document.getElementById(id));
    const status = $("#status");
    let ok = true;

    fields.forEach((f) => {
      const bad =
        !f.value.trim() ||
        (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle("bad", bad);
      if (bad) ok = false;
    });

    if (!ok) {
      status.textContent = "Please fill in all fields with a valid email.";
      return;
    }

    const [name, email, message] = fields.map((f) => f.value.trim());
    window.location.href =
      "mailto:befikirgizachew1@gmail.com?subject=" +
      encodeURIComponent("Portfolio message from " + name) +
      "&body=" +
      encodeURIComponent(message + "\n\nFrom: " + name + " (" + email + ")");
    status.textContent = "Opening your email app…";
  });
})();