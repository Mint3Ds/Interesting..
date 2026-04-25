/* ============================================================
   main.js — Happy Birthday Interactive Logic
   ============================================================ */

// ─── CONFIG from API ─────────────────────────────────────────
let CONFIG = {
  birthdayPerson: "You",
  message: "Wishing you a day filled with joy, laughter, and all the things that make you smile! 🎉",
  balloonCount: 20,
  confettiCount: 200,
  candleCount: 7,
};

async function loadConfig() {
  CONFIG = {
    birthdayPerson: "Steph",
    message: "Happy Birthday Steph! 🎉 Wishing you a day filled with joy, laughter, and all the amazing things that make you smile. You deserve all the happiness in the world! 💖",
    balloonCount: 20,
    confettiCount: 200,
    candleCount: 25,
  };
}

// ─── UTILS ───────────────────────────────────────────────────
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));
const pick = (arr) => arr[randInt(0, arr.length)];

// ─── LOADER ───────────────────────────────────────────────────
function hideLoader() {
  const loader = document.getElementById("loader");
  loader.classList.add("hidden");
}

// ─── STARS ───────────────────────────────────────────────────
function createStars() {
  const container = document.querySelector(".stars");
  if (!container) return;
  for (let i = 0; i < 120; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = rand(1, 3.5);
    star.style.cssText = `
      width: ${size}px; height: ${size}px;
      top: ${rand(0, 100)}%; left: ${rand(0, 100)}%;
      animation-duration: ${rand(2, 6)}s;
      animation-delay: ${rand(0, 5)}s;
      opacity: ${rand(0.2, 1)};
    `;
    container.appendChild(star);
  }
}

// ─── BALLOONS ────────────────────────────────────────────────
const BALLOON_COLORS = [
  "#ffffff", // Pearl White
  "#ff8fab", // Soft Pink
  "#ff0000", // Hello Kitty Red
  "#ffccd5", // Blossom Pink
  "#fff0f3", // Creamy White
];

function createBalloons() {
  const container = document.getElementById("balloons-container");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < CONFIG.balloonCount; i++) {
    const b = document.createElement("div");
    b.className = "balloon";
    const dur = rand(8, 18);
    const delay = rand(0, 12);
    b.style.cssText = `
      left: ${rand(2, 98)}%;
      background: ${pick(BALLOON_COLORS)};
      width: ${rand(40, 65)}px; height: ${rand(52, 78)}px;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      opacity: ${rand(0.7, 1)};
    `;
    container.appendChild(b);
  }
}

// ─── CANDLES ─────────────────────────────────────────────────
// Number candles "1" and "9" are baked into HTML.

function setupCandleInteractions() {
  const cake = document.getElementById("cake-wrapper");
  if (!cake) return;

  cake.addEventListener("click", (e) => {
    // Check if we clicked a candle or the digit specifically
    const candle = e.target.closest(".num-candle");
    if (candle) {
      e.preventDefault();
      e.stopPropagation();
      const flame = candle.querySelector(".flame");
      if (flame && !flame.classList.contains("out")) {
        flame.classList.add("out");
        createSmoke(candle);

        // check if all candles are blown
        const allFlames = document.querySelectorAll(".flame:not(.out)");
        if (allFlames.length === 0) {
          setTimeout(() => launchConfetti(160), 400);
        }
        return; // Stop here if we hit a candle
      }
    }

    // Otherwise, use the fallback: blow any remaining flames
    blowCandles();
  });
}

function blowCandles() {
  const flames = document.querySelectorAll(".flame:not(.out)");
  if (flames.length === 0) return;

  flames.forEach((f, i) => {
    setTimeout(() => {
      f.classList.add("out");
      const candle = f.closest(".num-candle");
      if (candle) createSmoke(candle);

      if (i === flames.length - 1) {
        setTimeout(() => launchConfetti(160), 400);
      }
    }, i * 300);
  });
}

function createSmoke(parent) {
  const smoke = document.createElement("div");
  smoke.className = "smoke";
  parent.appendChild(smoke);
  setTimeout(() => smoke.remove(), 1600);
}

// ─── CONFETTI CANVAS ─────────────────────────────────────────
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let confettiPieces = [];
let animationId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = [
  "#ff6b9d", "#ff0000", "#ffffff", "#ff8fab", "#ffc1e3",
];

class Confetti {
  constructor(x, y) {
    this.x = x ?? rand(0, canvas.width);
    this.y = y ?? rand(-20, -5);
    this.w = rand(6, 14);
    this.h = rand(4, 10);
    this.color = pick(CONFETTI_COLORS);
    this.vx = rand(-3, 3);
    this.vy = rand(2, 6);
    this.angle = rand(0, Math.PI * 2);
    this.spin = rand(-0.12, 0.12);
    this.alpha = 1;
    this.shape = pick(["rect", "circle", "star"]);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.04;
    this.angle += this.spin;
    if (this.y > canvas.height + 20) this.alpha = 0;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    if (this.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === "star") {
      drawStar(ctx, 0, 0, 5, this.w / 2, this.w / 4);
    } else {
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    }
    ctx.restore();
  }
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
  ctx.fill();
}

function launchConfetti(count = 100) {
  for (let i = 0; i < count; i++) {
    confettiPieces.push(new Confetti());
  }
  if (!animationId) startCanvasLoop();
}

// ─── FIREWORKS ───────────────────────────────────────────────
let fireworks = [];
let particles = [];

class Firework {
  constructor() {
    this.x = rand(canvas.width * 0.2, canvas.width * 0.8);
    this.y = canvas.height;
    this.tx = this.x + rand(-80, 80);
    this.ty = rand(canvas.height * 0.1, canvas.height * 0.45);
    this.speed = rand(8, 14);
    this.color = pick(CONFETTI_COLORS);
    this.dx = (this.tx - this.x) / 30;
    this.dy = (this.ty - this.y) / 30;
    this.alpha = 1;
    this.exploded = false;
    this.trail = [];
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 12) this.trail.shift();
    this.x += this.dx;
    this.y += this.dy;
    if (Math.abs(this.y - this.ty) < 15) this.explode();
  }
  draw() {
    this.trail.forEach((p, i) => {
      ctx.save();
      ctx.globalAlpha = (i / this.trail.length) * 0.6;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
  explode() {
    const count = randInt(80, 130);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(this.x, this.y, this.color));
    }
    this.exploded = true;
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x; this.y = y;
    this.color = color;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(1, 8);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.decay = rand(0.015, 0.03);
    this.r = rand(2, 4);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.09;
    this.vx *= 0.98;
    this.alpha -= this.decay;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8; ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

let fireworksActive = false;
let fireworkInterval = null;

function launchFireworks() {
  fireworksActive = true;

  // Launch first one immediately for better responsiveness and to keep the loop alive
  fireworks.push(new Firework());

  fireworkInterval = setInterval(() => {
    if (fireworksActive) fireworks.push(new Firework());
  }, 280);
  setTimeout(() => {
    clearInterval(fireworkInterval);
    fireworksActive = false;
  }, 7000);
  if (!animationId) startCanvasLoop();
}

// ─── CANVAS LOOP ─────────────────────────────────────────────
function startCanvasLoop() {
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Confetti
    confettiPieces = confettiPieces.filter(c => c.alpha > 0);
    confettiPieces.forEach(c => { c.update(); c.draw(); });

    // Fireworks
    fireworks = fireworks.filter(f => !f.exploded);
    fireworks.forEach(f => { f.update(); f.draw(); });

    particles = particles.filter(p => p.alpha > 0);
    particles.forEach(p => { p.update(); p.draw(); });

    const hasActivity = confettiPieces.length || fireworks.length || particles.length || fireworksActive;
    animationId = hasActivity ? requestAnimationFrame(loop) : null;
  }
  animationId = requestAnimationFrame(loop);
}

// ─── AMBIENT MUSIC (MP3) ───────────────────────────────────
let audio = null;
let musicPlaying = false;

function startExperience() {
  const overlay = document.getElementById("play-overlay");
  if (overlay) overlay.classList.add("hidden");

  // Start Music
  if (!audio) {
    audio = new Audio("bd_music.mp3");
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Audio playback error:", e));
    musicPlaying = true;
  }

  // Start Loader
  const loader = document.getElementById("loader");
  if (loader) loader.classList.remove("hidden");

  // Run the celebration flow after a delay
  setTimeout(() => {
    hideLoader();
    createStars();
    createBalloons();
    setTimeout(setupAnimateIn, 200);
    setTimeout(() => launchConfetti(80), 400);
  }, 2200);
}

// ─── WISH MODAL ────────────────────────────────────────────────
function openModal() {
  const modal = document.getElementById("wish-modal");
  const msg = document.getElementById("modal-message");
  msg.textContent = CONFIG.message;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  launchConfetti(60);
}
function closeModal() {
  document.getElementById("wish-modal").hidden = true;
  document.body.style.overflow = "";
}

// ─── GALLERY MODAL & SLIDESHOW ───────────────────────────────
let slideIndex = 0;
let slides = [];
let dots = [];
let slideInterval = null;

function resetSlideInterval() {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    changeSlide(1);
  }, 2500); // Change image every 3.5 seconds
}

function openGallery() {
  const modal = document.getElementById("gallery-modal");
  if (!modal) return;
  modal.hidden = false;
  document.body.style.overflow = "hidden";

  // Switch to waybackhome.mp3 for memories
  if (audio) {
    audio.src = "waybackhome.mp3";
    audio.play().catch(e => console.error("Audio playback error:", e));
  }

  if (slides.length === 0) {
    slides = document.querySelectorAll(".slide");
    dots = document.querySelectorAll(".dot");
    showSlide(0);
  }

  // Start or reset the auto-rotate timer whenever opened
  resetSlideInterval();
}

function closeGallery() {
  const modal = document.getElementById("gallery-modal");
  if (modal) modal.hidden = true;
  document.body.style.overflow = "";
  if (slideInterval) clearInterval(slideInterval);
  
  // Switch back to the main birthday music
  if (audio) {
    audio.src = "bd_music.mp3";
    audio.play().catch(e => console.error("Audio playback error:", e));
  }
}

function changeSlide(n) {
  showSlide(slideIndex + n);
  resetSlideInterval(); // Reset timer when manually navigating
}

function currentSlide(n) {
  showSlide(n);
  resetSlideInterval(); // Reset timer when clicking a dot
}

function showSlide(n) {
  if (slides.length === 0) return;

  if (n >= slides.length) slideIndex = 0;
  else if (n < 0) slideIndex = slides.length - 1;
  else slideIndex = n;

  slides.forEach(slide => slide.style.display = "none");
  dots.forEach(dot => dot.classList.remove("active"));

  slides[slideIndex].style.display = "block";
  if (dots[slideIndex]) dots[slideIndex].classList.add("active");
}

// ─── HERO NAME ────────────────────────────────────────────────
// (name is now baked directly into the h1 HTML)

// ─── ANIMATE IN ──────────────────────────────────────────────
function setupAnimateIn() {
  const items = document.querySelectorAll(".animate-in");
  items.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.18}s`;
    el.classList.add("visible");
  });
}

// ─── SCROLL OBSERVER ──────────────────────────────────────────
function setupScrollObserver() {
  const cards = document.querySelectorAll(".card");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.15 }
  );
  cards.forEach(c => {
    c.style.opacity = "0";
    c.style.transform = "translateY(40px)";
    c.style.transition = "opacity 0.7s ease, transform 0.7s ease";
    observer.observe(c);
  });
}

// ─── FOOTER YEAR ─────────────────────────────────────────────
function setYear() {
  const el = document.getElementById("footer-year");
  if (el) el.textContent = new Date().getFullYear();
}

// ─── INIT ────────────────────────────────────────────────────
async function init() {
  await loadConfig();
  setYear();

  // Setup Start Interaction
  document.getElementById("start-btn")?.addEventListener("click", startExperience);

  // Setup Candle Interactions
  setupCandleInteractions();

  // Cards scroll observer
  setupScrollObserver();

  // Wish modal
  document.getElementById("wish-btn")?.addEventListener("click", openModal);
  document.getElementById("modal-close")?.addEventListener("click", closeModal);
  document.getElementById("modal-backdrop")?.addEventListener("click", closeModal);

  // Gallery modal
  document.getElementById("open-gallery-btn")?.addEventListener("click", openGallery);
  document.getElementById("gallery-close")?.addEventListener("click", closeGallery);
  document.getElementById("gallery-backdrop")?.addEventListener("click", closeGallery);

  // Slideshow controls
  document.getElementById("prev-slide")?.addEventListener("click", () => changeSlide(-1));
  document.getElementById("next-slide")?.addEventListener("click", () => changeSlide(1));
  document.querySelectorAll(".dot").forEach((dot, index) => {
    dot.addEventListener("click", () => currentSlide(index));
  });

  // Fireworks button inside modal
  document.getElementById("fireworks-btn")?.addEventListener("click", () => {
    closeModal();
    setTimeout(launchFireworks, 300);
  });

  // Keyboard escape to close modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeGallery();
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
