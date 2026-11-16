// Small touches only; every page works without this file.
(() => {
  const header = document.querySelector(".top");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Sections fade up as they come into view. Anything already on screen shows at once.
  const reveals = document.querySelectorAll(".reveal");
  const onScreen = (el) => el.getBoundingClientRect().top < window.innerHeight;
  reveals.forEach((el) => onScreen(el) && el.classList.add("in"));
  if ("IntersectionObserver" in window) {
    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            seen.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => seen.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // A soft light follows the pointer across cards.
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - box.left}px`);
      card.style.setProperty("--my", `${event.clientY - box.top}px`);
    });
  });

  // The drifting orbs on the hero strings are SVG animations: hold them still for people who
  // turn animations off.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("svg.waves").forEach((svg) => svg.pauseAnimations());
  }

  // Hero bubbles: coloured soap bubbles appear at random free spots around the text, wobble
  // and drift up, tremble, then pop (a ring bursts, droplets fly). Click one to pop it.
  // Same idea as the app's sign-in screen. Off for people who turn animations off.
  const canvas = document.querySelector(".stage canvas.bubbles");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (canvas && !still && canvas.getContext) {
    const stage = canvas.parentElement;
    const keepClear = stage.querySelector(".stage-content");
    const ctx = canvas.getContext("2d");
    const colours = ["#8B5CF6", "#B9A6F6", "#E879F9", "#60A5FA", "#818CF8", "#F9A8D4"];
    const bubbles = [];
    let width = 0;
    let height = 0;
    let clear = null;
    let untilNext = 0.2;
    let last = 0;
    let time = 0;
    let running = false;

    const rgba = (hex, a) => {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
    };
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = stage.clientWidth;
      height = stage.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const box = keepClear.getBoundingClientRect();
      const base = stage.getBoundingClientRect();
      clear = {
        left: box.left - base.left - 16,
        right: box.right - base.left + 16,
        top: box.top - base.top - 16,
        bottom: box.bottom - base.top + 16,
      };
    };
    const spawn = () => {
      const max = width < 700 ? 6 : 11;
      if (bubbles.filter((b) => b.popped == null).length >= max) return;
      for (let attempt = 0; attempt < 14; attempt++) {
        const r = (width < 700 ? 8 : 12) + Math.random() * (width < 700 ? 18 : 30);
        const x = r + Math.random() * (width - 2 * r);
        const y = r + 24 + Math.random() * (height - 2 * r - 140); // clear of the top, above the strings
        const inClear =
          x + r > clear.left && x - r < clear.right && y + r > clear.top && y - r < clear.bottom;
        const crowded = bubbles.some(
          (b) => b.popped == null && Math.hypot(b.x - x, b.y - y) < b.r + r + 10
        );
        if (inClear || crowded) continue;
        const c = Math.floor(Math.random() * colours.length);
        bubbles.push({
          x,
          y,
          r,
          colour: colours[c],
          rim: colours[(c + 1 + Math.floor(Math.random() * (colours.length - 1))) % colours.length],
          life: 2.4 + Math.random() * 3.4,
          rise: 6 + Math.random() * 16,
          phase: Math.random() * Math.PI * 2,
          age: 0,
          popped: null,
          drops: [],
        });
        return;
      }
    };
    const pop = (b) => {
      b.popped = 0;
      const count = 7 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 60 + Math.random() * 120;
        b.drops.push({
          x: b.x + Math.cos(a) * b.r,
          y: b.y + Math.sin(a) * b.r,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
        });
      }
    };
    const elastic = (t) =>
      t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;

    const drawBubble = (b) => {
      const grow = elastic(Math.min(b.age / 0.55, 1));
      const r = b.r * grow;
      if (r < 0.5) return;
      const wobble = Math.sin(time * 3.1 + b.phase) * 0.04;
      const shiver = b.life - b.age < 0.25 ? Math.sin(b.age * 70) * 1.2 : 0;
      const x = b.x + shiver;
      ctx.save();
      ctx.translate(x, b.y);
      ctx.scale(1 + wobble, 1 - wobble);
      const body = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      body.addColorStop(0, rgba(b.colour, 0.04));
      body.addColorStop(0.62, rgba(b.colour, 0.1));
      body.addColorStop(0.93, rgba(b.colour, 0.38));
      body.addColorStop(1, rgba(b.colour, 0));
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      // Rim: two colours chasing round, like light on a soap film.
      let rim;
      if (ctx.createConicGradient) {
        rim = ctx.createConicGradient(time * 0.9 + b.phase, 0, 0);
        rim.addColorStop(0, rgba(b.colour, 0.85));
        rim.addColorStop(0.25, rgba(b.rim, 0.75));
        rim.addColorStop(0.5, rgba(b.colour, 0.2));
        rim.addColorStop(0.75, rgba(b.rim, 0.7));
        rim.addColorStop(1, rgba(b.colour, 0.85));
      } else {
        rim = rgba(b.colour, 0.7);
      }
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, r - 0.8, 0, Math.PI * 2);
      ctx.stroke();
      // Window highlight, top left, and a faint one bottom right.
      ctx.save();
      ctx.translate(-r * 0.38, -r * 0.42);
      ctx.rotate(-0.6);
      ctx.scale(1, 0.58);
      const shine = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.31);
      shine.addColorStop(0, "rgba(244,242,248,0.7)");
      shine.addColorStop(1, "rgba(244,242,248,0)");
      ctx.fillStyle = shine;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.31, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "rgba(244,242,248,0.25)";
      ctx.beginPath();
      ctx.arc(r * 0.42, r * 0.46, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    const drawBurst = (b) => {
      const t = b.popped / 0.42;
      const fade = Math.max(0, 1 - t);
      const ease = 1 - Math.pow(1 - Math.min(t, 1), 3);
      ctx.strokeStyle = rgba(b.colour, 0.75 * fade);
      ctx.lineWidth = 2.2 * fade;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * (1 + 0.55 * ease), 0, Math.PI * 2);
      ctx.stroke();
      if (t < 0.3) {
        const flash = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 0.9);
        flash.addColorStop(0, `rgba(244,242,248,${0.35 * (1 - t / 0.3)})`);
        flash.addColorStop(1, "rgba(244,242,248,0)");
        ctx.fillStyle = flash;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = rgba(b.colour, fade);
      for (const d of b.drops) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.8 * fade + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const frame = () => {
      if (!running) return;
      const now = performance.now();
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      time += dt;
      untilNext -= dt;
      if (untilNext <= 0) {
        spawn();
        untilNext = 0.3 + Math.random() * 0.6;
      }
      for (const b of bubbles) {
        b.age += dt;
        if (b.popped != null) {
          b.popped += dt;
          for (const d of b.drops) {
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            d.vx *= 0.96;
            d.vy = d.vy * 0.96 + 260 * dt;
          }
        } else {
          b.x += Math.sin(time * 1.7 + b.phase) * 6 * dt;
          b.y -= b.rise * dt;
          if (b.age >= b.life) pop(b);
        }
      }
      for (let i = bubbles.length - 1; i >= 0; i--) {
        if (bubbles[i].popped != null && bubbles[i].popped > 0.42) bubbles.splice(i, 1);
      }
      ctx.clearRect(0, 0, width, height);
      for (const b of bubbles) (b.popped == null ? drawBubble : drawBurst)(b);
      requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    canvas.addEventListener("pointerdown", (event) => {
      const box = canvas.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        if (b.popped == null && Math.hypot(b.x - x, b.y - y) <= b.r * 1.15) {
          pop(b);
          break;
        }
      }
    });
    // Only animate while the hero is on screen.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        for (const entry of entries) (entry.isIntersecting ? start : stop)();
      }).observe(stage);
    } else {
      start();
    }
  }

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
