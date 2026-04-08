/* ==========================================================================
   UGC Webinar Landing Page — JavaScript
   Sticky header, FAQ accordion, lazy video, tab switching, smooth scroll
   ========================================================================== */

(function () {
  'use strict';

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
