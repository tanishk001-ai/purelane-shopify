(function () {
  'use strict';
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll reveal. Elements start hidden only once JS confirms it can reveal
     them, so the page is never stuck invisible if this script fails to load. */
  function reveal() {
    var els = document.querySelectorAll('.rv:not(.in)');
    if (!('IntersectionObserver' in window) || REDUCE) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  }

  function initStage(stage) {
    if (stage.dataset.init === 'true') return;
    stage.dataset.init = 'true';

    var slides = [].slice.call(stage.querySelectorAll('[data-slide]'));
    var dots = [].slice.call(stage.querySelectorAll('[data-dots] button'));
    var label = stage.querySelector('[data-stage-label]');
    var price = stage.querySelector('[data-stage-price]');
    if (!slides.length) return;

    var i = 0, timer = null;

    function paint(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, x) {
        s.classList.toggle('on', x === i);
        s.setAttribute('aria-hidden', x === i ? 'false' : 'true');
      });
      dots.forEach(function (d, x) { d.setAttribute('aria-current', x === i ? 'true' : 'false'); });
      var cur = slides[i];
      if (label) label.textContent = cur.dataset.label || '';
      if (price) {
        var compare = cur.dataset.compare;
        price.innerHTML = (cur.dataset.price || '') + (compare ? ' <s>' + compare + '</s>' : '');
      }
    }
    function play() { if (REDUCE || timer || slides.length < 2) return; timer = setInterval(function () { paint(i + 1); }, 4200); }
    function stop() { clearInterval(timer); timer = null; }

    dots.forEach(function (d, n) { d.addEventListener('click', function () { stop(); paint(n); play(); }); });
    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', play);
    stage.addEventListener('focusin', stop);
    stage.addEventListener('focusout', play);

    paint(0);
    play();
  }

  function initTabs(group) {
    if (group.dataset.init === 'true') return;
    group.dataset.init = 'true';
    var tabs = [].slice.call(group.querySelectorAll('[data-tab]'));
    var grid = document.querySelector(group.dataset.target);
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
        tab.setAttribute('aria-selected', 'true');
        if (!grid) return;
        var want = tab.dataset.tab;
        [].slice.call(grid.children).forEach(function (card) {
          var type = card.dataset.type || '';
          card.hidden = !(want === 'all' || type === want);
        });
      });
    });
  }

  function boot() {
    reveal();
    document.querySelectorAll('[data-stage]').forEach(initStage);
    document.querySelectorAll('[data-tabs]').forEach(initTabs);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* Theme editor: re-init when a section is added, reordered or reloaded. */
  document.addEventListener('shopify:section:load', function (e) {
    e.target.querySelectorAll('[data-stage]').forEach(function (s) { s.dataset.init = 'false'; initStage(s); });
    e.target.querySelectorAll('[data-tabs]').forEach(function (t) { t.dataset.init = 'false'; initTabs(t); });
    e.target.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
  });
})();
