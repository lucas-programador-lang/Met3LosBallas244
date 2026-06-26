/* =================================================================
   MET3LOSBALLAS244 — Bandeira Oficial · Federação Los 13 (L13)
   script.js — interatividade
   ================================================================= */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. Loader ---------- */
  function initLoader() {
    const MIN_DISPLAY = 900; // ms — tempo mínimo do loader na tela
    const start = performance.now();

    function reveal() {
      const elapsed = performance.now() - start;
      const wait = Math.max(MIN_DISPLAY - elapsed, 0);
      setTimeout(() => {
        document.body.classList.add('loaded');
      }, wait);
    }

    if (document.readyState === 'complete') {
      reveal();
    } else {
      window.addEventListener('load', reveal);
      // segurança: nunca trava o site caso 'load' demore demais
      setTimeout(reveal, 3500);
    }
  }

  /* ---------- 2. Navbar: estado de rolagem + menu mobile ---------- */
  function initNav() {
    const nav = document.getElementById('siteNav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const navLinkEls = Array.from(document.querySelectorAll('[data-nav]'));

    function onScroll() {
      if (window.scrollY > 24) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    function closeMenu() {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }
    function openMenu() {
      links.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('nav-open');
    }

    toggle.addEventListener('click', () => {
      const isOpen = links.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });

    navLinkEls.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    /* destaca o link ativo conforme a seção visível */
    const sections = navLinkEls
      .map((l) => document.querySelector(l.getAttribute('href')))
      .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = '#' + entry.target.id;
            navLinkEls.forEach((l) => {
              l.classList.toggle('active', l.getAttribute('href') === id);
            });
          });
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
      );
      sections.forEach((s) => obs.observe(s));
    }
  }

  /* ---------- 3. Scroll reveal ---------- */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -40px 0px' }
    );
    items.forEach((el) => obs.observe(el));
  }

  /* ---------- 4. Tilt 3D nos cartões ---------- */
  function initTilt() {
    if (!canHover || reduceMotion) return;
    const cards = document.querySelectorAll('.tilt');

    cards.forEach((card) => {
      const strength = 10; // graus máximos de rotação

      function onMove(e) {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;  // 0..1
        const py = (e.clientY - rect.top) / rect.height;  // 0..1
        const rotY = (px - 0.5) * strength * 2;
        const rotX = (0.5 - py) * strength * 2;
        card.style.transform =
          'perspective(700px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) translateY(-4px)';
      }
      function onLeave() {
        card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
      }

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  /* ---------- 5. Partículas de brasa (fundo) ---------- */
  function initEmbers() {
    const canvas = document.getElementById('emberCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w, h, particles, rafId;
    const COLORS = ['201,162,75', '154,37,48', '139,108,192'];
    const COUNT = reduceMotion ? 0 : Math.min(46, Math.floor((window.innerWidth * window.innerHeight) / 42000));

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function makeParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h + h * 0.2,
        r: Math.random() * 1.6 + 0.5,
        speed: Math.random() * 0.32 + 0.08,
        drift: Math.random() * 0.6 - 0.3,
        alpha: Math.random() * 0.45 + 0.12,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        flicker: Math.random() * 0.02 + 0.005,
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: COUNT }, makeParticle);
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(p.y * 0.01) * p.drift * 0.3;
        p.alpha += (Math.random() - 0.5) * p.flicker;
        if (p.alpha < 0.05) p.alpha = 0.05;
        if (p.alpha > 0.55) p.alpha = 0.55;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + p.color + ',' + p.alpha.toFixed(2) + ')';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      rafId = requestAnimationFrame(tick);
    }

    init();
    if (COUNT > 0) tick();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(rafId);
        init();
        if (COUNT > 0) tick();
      }, 220);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else if (COUNT > 0) tick();
    });
  }

  /* ---------- 6. Copiar modelo de tag ---------- */
  function initTagCopy() {
    const btn = document.getElementById('copyTagBtn');
    const sample = document.getElementById('tagSample');
    const toast = document.getElementById('toast');
    if (!btn || !sample) return;

    let toastTimer;
    function showToast(message) {
      toast.textContent = message;
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
    }

    btn.addEventListener('click', async () => {
      const text = sample.textContent.trim();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        showToast('Modelo de tag copiado!');
      } catch (err) {
        showToast('Não foi possível copiar. Copie manualmente.');
      }
    });
  }

  /* ---------- 7. Ano atual no rodapé ---------- */
  function initYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Inicialização ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initNav();
    initReveal();
    initTilt();
    initEmbers();
    initTagCopy();
    initYear();
  });
})();
