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

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
