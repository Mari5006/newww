const weddingDateString = "2026-05-28T07:35:00+05:30";
const RSVP_FORM_ENDPOINT = "https://formspree.io/f/xqegjvyp";

function getCountdownElements() {
  return {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
  };
}

function setCountdownValues(countdownEls, values) {
  if (!countdownEls.days || !countdownEls.hours || !countdownEls.minutes || !countdownEls.seconds) {
    return;
  }

  countdownEls.days.textContent = values.days;
  countdownEls.hours.textContent = values.hours;
  countdownEls.minutes.textContent = values.minutes;
  countdownEls.seconds.textContent = values.seconds;
}

function startCountdown() {
  const countdownEls = getCountdownElements();
  const weddingTime = new Date(weddingDateString).getTime();

  if (Number.isNaN(weddingTime)) {
    setCountdownValues(countdownEls, {
      days: "---",
      hours: "--",
      minutes: "--",
      seconds: "--",
    });
    return;
  }

  function updateCountdown() {
    const distance = weddingTime - Date.now();

    if (distance <= 0) {
      setCountdownValues(countdownEls, {
        days: "000",
        hours: "00",
        minutes: "00",
        seconds: "00",
      });
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    setCountdownValues(countdownEls, {
      days: String(days).padStart(3, "0"),
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    });
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

function setupRevealAnimation() {
  const revealEls = document.querySelectorAll(".reveal");

  if (!revealEls.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function setupSlideFocus() {
  const slideEls = document.querySelectorAll(".site-header, main > section, .footer");

  if (!slideEls.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    slideEls.forEach((el, index) => {
      if (index === 0) {
        el.classList.add("is-current");
      }
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-current", entry.isIntersecting);
      });
    },
    {
      threshold: 0.55,
      rootMargin: "-10% 0px -10% 0px",
    }
  );

  slideEls.forEach((el) => observer.observe(el));
}

function setupNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!navToggle || !navLinks) {
    return;
  }

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupForm() {
  const form = document.getElementById("rsvpForm");
  const formStatus = document.getElementById("formStatus");

  if (!form || !formStatus) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      attendance: String(data.get("attendance") || "").trim(),
      submittedAt: new Date().toISOString(),
    };

    formStatus.textContent = "Submitting your RSVP...";

    fetch(RSVP_FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Formspree submission failed");
        }

        formStatus.textContent = `Thank you, ${payload.name}. Your RSVP has been saved successfully.`;
        form.reset();
      })
      .catch(() => {
        formStatus.textContent = "Could not save your RSVP right now. Please try again.";
      });
  });
}

function setupMusicPlayer() {
  const audio = document.getElementById("weddingSong");
  const toggle = document.getElementById("musicToggle");
  const toggleIcon = document.getElementById("musicToggleIcon");
  const source = audio ? audio.querySelector("source") : null;

  if (!audio || !toggle || !toggleIcon) {
    return;
  }

  function setMusicButtonState(isPlaying) {
    toggle.setAttribute("aria-pressed", String(isPlaying));
    toggle.setAttribute("aria-label", isPlaying ? "Pause wedding music" : "Play wedding music");
    toggleIcon.textContent = isPlaying ? "❚❚" : "▶";
  }

  toggle.addEventListener("click", async () => {
    const hasSource = Boolean(audio.currentSrc || (source && source.getAttribute("src")));

    if (!hasSource) {
      toggleIcon.textContent = "♪";
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
        setMusicButtonState(true);
      } else {
        audio.pause();
        setMusicButtonState(false);
      }
    } catch (error) {
      setMusicButtonState(false);
    }
  });

  audio.addEventListener("play", () => {
    setMusicButtonState(true);
  });
  audio.addEventListener("pause", () => {
    if (!audio.ended) {
      setMusicButtonState(false);
    }
  });
  audio.addEventListener("ended", () => {
    setMusicButtonState(false);
  });

  window.addEventListener("load", async () => {
    try {
      await audio.play();
    } catch (error) {
      setMusicButtonState(false);
    }
  });
}

function setupThreeDDepth() {
  const depthCards = document.querySelectorAll(
    ".hero-card, .invitation-panel, .signature-scene, .countdown-grid, .rsvp-shell, .venue-panel"
  );

  if (!depthCards.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  if (prefersReducedMotion || isTouchDevice) {
    return;
  }

  depthCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 10;
      const rotateX = (0.5 - y) * 10;
      const shiftX = (x - 0.5) * 18;
      const shiftY = (y - 0.5) * 18;

      card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
      card.style.setProperty("--glow-x", `${(x * 100).toFixed(2)}%`);
      card.style.setProperty("--glow-y", `${(y * 100).toFixed(2)}%`);
      card.style.setProperty("--shift-x", `${shiftX.toFixed(2)}px`);
      card.style.setProperty("--shift-y", `${shiftY.toFixed(2)}px`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--glow-x", "50%");
      card.style.setProperty("--glow-y", "30%");
      card.style.setProperty("--shift-x", "0px");
      card.style.setProperty("--shift-y", "0px");
    });
  });
}

function setupScrollDepth() {
  const root = document.documentElement;
  let ticking = false;

  function updateScrollDepth() {
    const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    const drift = (progress * 28 - 14).toFixed(2);
    const spotlight = (18 + progress * 64).toFixed(2);

    root.style.setProperty("--scroll-progress", progress.toFixed(4));
    root.style.setProperty("--scroll-drift", `${drift}px`);
    root.style.setProperty("--spotlight-y", `${spotlight}%`);
    ticking = false;
  }

  function requestScrollDepthUpdate() {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateScrollDepth);
  }

  updateScrollDepth();
  window.addEventListener("scroll", requestScrollDepthUpdate, { passive: true });
  window.addEventListener("resize", requestScrollDepthUpdate);
}

function setupIllustrationOrb() {
  const orb = document.querySelector(".illustration-orb");

  if (!orb) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  if (prefersReducedMotion || isTouchDevice) {
    return;
  }

  orb.addEventListener("pointermove", (event) => {
    const rect = orb.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 18;
    const rotateX = (0.5 - y) * 18;

    orb.style.setProperty("--illus-tilt-x", `${rotateX.toFixed(2)}deg`);
    orb.style.setProperty("--illus-tilt-y", `${rotateY.toFixed(2)}deg`);
  });

  orb.addEventListener("pointerleave", () => {
    orb.style.setProperty("--illus-tilt-x", "0deg");
    orb.style.setProperty("--illus-tilt-y", "0deg");
  });
}

function initPage() {
  document.body.classList.add("page-loaded");
  startCountdown();
  setupRevealAnimation();
  setupSlideFocus();
  setupThreeDDepth();
  setupScrollDepth();
  setupIllustrationOrb();
  setupNav();
  setupForm();
  setupMusicPlayer();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}
