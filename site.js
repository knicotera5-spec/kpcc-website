/* KP Charter Kollective — site.js */

(function () {
  'use strict';

  // ── Sticky nav shadow
  const nav = document.getElementById('site-nav');
  if (nav) {
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 30), { passive: true });
  }

  // ── Mobile nav toggle
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.classList.toggle('open');
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
      }
    });
  }

  // ── Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), +(e.target.dataset.d || 0));
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    // Stagger children inside grid parents
    document.querySelectorAll(
      '.stats-grid,.testi-grid,.svc-full-grid,.atl-features,.team-grid,.portfolio-grid,.blog-grid,.process-steps,.why-points,.journey-timeline,.photo-strip,.serve-list,.schools-grid'
    ).forEach(parent => {
      [...parent.children].forEach((child, i) => {
        const r = child.classList.contains('reveal') ? child : child.querySelector('.reveal');
        if (r) r.dataset.d = i * 85;
      });
    });

    reveals.forEach(el => io.observe(el));
  }

  // ── Schools carousel
  const carousel = document.getElementById('schools-carousel');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (carousel && prevBtn && nextBtn) {
    const scrollAmt = () => carousel.querySelector('.school-card')?.offsetWidth + 40 || 220;
    prevBtn.addEventListener('click', () => carousel.scrollBy({ left: -scrollAmt(), behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => carousel.scrollBy({ left: scrollAmt(), behavior: 'smooth' }));
  }

  // ── FAQ accordion
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ── Active nav link highlight
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === currentPage) a.style.color = 'var(--navy)';
  });

})();
