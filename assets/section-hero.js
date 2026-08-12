(function () {
  'use strict';

  var AUTOPLAY_MS = 3800;

  function initStage(stage) {
    if (stage.dataset.plInit === 'true') return;
    stage.dataset.plInit = 'true';

    var slides = Array.prototype.slice.call(stage.querySelectorAll('[data-pl-slide]'));
    var wrapper = stage.closest('.pl-stage-outer');
    var dots = wrapper ? Array.prototype.slice.call(wrapper.querySelectorAll('[data-pl-dot]')) : [];
    if (slides.length < 2) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var index = 0;
    var timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        var active = n === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, n) {
        dot.setAttribute('aria-current', n === index ? 'true' : 'false');
      });
    }

    function play() {
      if (reduceMotion || timer) return;
      timer = setInterval(function () {
        show(index + 1);
      }, AUTOPLAY_MS);
    }

    function pause() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, n) {
      dot.addEventListener('click', function () {
        pause();
        show(n);
        play();
      });
    });

    stage.addEventListener('mouseenter', pause);
    stage.addEventListener('mouseleave', play);
    stage.addEventListener('focusin', pause);
    stage.addEventListener('focusout', play);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              play();
            } else {
              pause();
            }
          });
        },
        { threshold: 0.2 }
      );
      io.observe(stage);
    } else {
      play();
    }
  }

  function initAll() {
    document.querySelectorAll('[data-pl-stage]').forEach(initStage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Theme editor: re-run when this section (or a block inside it) is added,
  // removed, reordered, or reloaded, so the carousel keeps working live.
  document.addEventListener('shopify:section:load', function (event) {
    var stage = event.target.querySelector && event.target.querySelector('[data-pl-stage]');
    if (stage) {
      stage.dataset.plInit = 'false';
      initStage(stage);
    }
  });
})();
