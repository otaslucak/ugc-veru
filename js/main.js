/* ==========================================================================
   UGC Webinar Landing Page — JavaScript
   Countdown, sticky header, FAQ accordion, form AJAX, sticky mobile CTA
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     COUNTDOWN TIMER — 8.4.2026 10:00 CET (Europe/Prague)
     ------------------------------------------------------------------ */
  const WEBINAR_DATE = new Date('2026-04-08T10:00:00+02:00');

  const countdownEl = document.getElementById('countdown');
  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');
  const expiredEl = document.getElementById('expired-state');

  function updateCountdown() {
    const now = Date.now();
    const diff = WEBINAR_DATE.getTime() - now;

    if (diff <= 0) {
      // Webinar has passed
      if (countdownEl) countdownEl.style.display = 'none';
      if (expiredEl) expiredEl.classList.add('is-visible');
      // Hide final CTA forms
      var finalForm = document.getElementById('final-form');
      if (finalForm) finalForm.style.display = 'none';
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ------------------------------------------------------------------
     STICKY HEADER
     ------------------------------------------------------------------ */
  var header = document.getElementById('header');
  var scrollThreshold = 50;

  function onScroll() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------------------------------------------------------------------
     FAQ ACCORDION
     ------------------------------------------------------------------ */
  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-item__question');
    var answer = item.querySelector('.faq-item__answer');

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      // Close all other items
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-item__answer').style.maxHeight = null;
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ------------------------------------------------------------------
     FORM AJAX SUBMISSION
     ------------------------------------------------------------------ */
  var forms = document.querySelectorAll('[data-form="register"]');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var formData = new FormData(form);
      var honeypot = formData.get('website');

      // Honeypot check
      if (honeypot) return;

      var name = formData.get('name');
      var email = formData.get('email');

      if (!name || !email) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var successEl = form.querySelector('.form__success');
      var errorEl = form.querySelector('.form__error');

      // Reset states
      successEl.classList.remove('is-visible');
      errorEl.classList.remove('is-visible');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Odesílám...';

      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim()
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Server error');
          return res.json();
        })
        .then(function () {
          // Success
          successEl.classList.add('is-visible');
          form.reset();

          // Fire Meta Pixel Lead event
          if (typeof fbq === 'function') {
            fbq('track', 'Lead');
          }

          // Hide form fields
          var inputs = form.querySelectorAll('.form__row, .form__micro, button[type="submit"]');
          inputs.forEach(function (el) { el.style.display = 'none'; });

          // Redirect to thank-you page (300ms delay for Pixel event)
          setTimeout(function () {
            window.location.href = '/dekujeme';
          }, 300);
        })
        .catch(function () {
          errorEl.textContent = 'Něco se pokazilo. Zkuste to prosím znovu.';
          errorEl.classList.add('is-visible');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Registrovat se zdarma';
        });
    });
  });

  /* ------------------------------------------------------------------
     LAZY VIDEO AUTOPLAY
     Videos start playing only when visible (hoisted for tab reuse).
     Loads video data first to avoid black-frame flash on mobile.
     ------------------------------------------------------------------ */
  var videoObserver = null;

  function playWhenReady(video) {
    // Already has enough data — play immediately
    if (video.readyState >= 3) {
      video.play();
      return;
    }
    // Trigger loading if not started yet
    if (video.preload === 'none') {
      video.preload = 'auto';
      video.load();
    }
    // Wait for enough data before playing (keeps poster visible until then)
    video.addEventListener('canplay', function handler() {
      video.removeEventListener('canplay', handler);
      video.play();
    });
  }

  if ('IntersectionObserver' in window) {
    videoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            playWhenReady(entry.target);
          } else {
            entry.target.pause();
          }
        });
      },
      { threshold: 0.3 }
    );

    var allVideos = document.querySelectorAll('.video-card__video');
    allVideos.forEach(function (video) {
      video.removeAttribute('autoplay');
      video.pause();
      // Only observe videos in visible panels (not hidden tabs)
      var panel = video.closest('.tabs__panel');
      if (!panel || panel.classList.contains('is-active')) {
        videoObserver.observe(video);
      }
    });
  }

  /* ------------------------------------------------------------------
     TAB SWITCHING (Video showcase)
     ------------------------------------------------------------------ */
  var tabBtns = document.querySelectorAll('.tabs__btn');
  var tabPanels = document.querySelectorAll('.tabs__panel');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('aria-controls');

      // Deactivate all tabs
      tabBtns.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });

      // Hide all panels, pause & unobserve their videos
      tabPanels.forEach(function (panel) {
        panel.classList.remove('is-active');
        panel.setAttribute('hidden', '');
        if (videoObserver) {
          panel.querySelectorAll('.video-card__video').forEach(function (v) {
            v.pause();
            videoObserver.unobserve(v);
          });
        }
      });

      // Activate clicked tab
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      // Show target panel, observe its videos
      var targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('is-active');
        targetPanel.removeAttribute('hidden');
        if (videoObserver) {
          targetPanel.querySelectorAll('.video-card__video').forEach(function (v) {
            videoObserver.observe(v);
          });
        }
      }
    });
  });

  /* ------------------------------------------------------------------
     STICKY MOBILE CTA (IntersectionObserver)
     Shows when no form is visible on screen
     ------------------------------------------------------------------ */
  var stickyCta = document.getElementById('sticky-cta');

  if (stickyCta && 'IntersectionObserver' in window) {
    var formSections = document.querySelectorAll('[data-form="register"]');
    var visibleForms = new Set();

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            visibleForms.add(entry.target);
          } else {
            visibleForms.delete(entry.target);
          }
        });

        if (visibleForms.size === 0) {
          stickyCta.classList.add('is-visible');
        } else {
          stickyCta.classList.remove('is-visible');
        }
      },
      { threshold: 0.1 }
    );

    formSections.forEach(function (form) {
      observer.observe(form);
    });
  }

  /* ------------------------------------------------------------------
     SMOOTH SCROLL for anchor links
     ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
