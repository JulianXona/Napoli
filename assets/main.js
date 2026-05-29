/* ============================================================
   HUMANIDAD COMPARTIDA — motor de scroll cinematográfico
   · Parallax + zoom lento de cada media
   · Reveal de texto al entrar en viewport
   · Índice de capítulos: estado activo + scroll-to
   · Barra de progreso de lectura
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ÍNDICE de capítulos ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-chapter]'));
  var indexEl = document.getElementById('index');
  var items = [];

  sections.forEach(function (sec, i) {
    var num = String(i + 1).padStart(2, '0');
    var label = sec.getAttribute('data-label') || '';
    var btn = document.createElement('button');
    btn.className = 'index__item';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Ir a ' + label);
    btn.innerHTML = '<span class="index__label">' + label + '</span><span class="index__dot"></span>';
    btn.addEventListener('click', function () {
      sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
    indexEl.appendChild(btn);
    items.push(btn);
  });

  function setActive(idx) {
    items.forEach(function (b, i) { b.classList.toggle('is-active', i === idx); });
  }

  if ('IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var idx = sections.indexOf(e.target);
          if (idx >= 0) setActive(idx);
        }
      });
    }, { threshold: 0, rootMargin: '-50% 0px -50% 0px' });
    sections.forEach(function (s) { navObs.observe(s); });
  }
  setActive(0);

  /* ---------- REVEAL de texto ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); revObs.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -2% 0px' });
    reveals.forEach(function (el) { revObs.observe(el); });

    // Primer pase: revela lo que ya está en pantalla, sin esperar al
    // callback async del observer. Se corre varias veces para cubrir
    // restauración de scroll, carga de fuentes y layout tardío.
    function firstPass() {
      var vh = window.innerHeight;
      reveals.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.98 && r.bottom > 0) el.classList.add('is-in');
      });
    }
    firstPass();
    requestAnimationFrame(firstPass);
    setTimeout(firstPass, 120);
    window.addEventListener('load', firstPass);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(firstPass); }
  }

  /* ---------- PARALLAX + ZOOM lento ---------- */
  // Cada .media__img se desplaza y escala según el progreso de su sección
  // a través del viewport. Ligero: un solo loop rAF, solo elementos visibles.
  var parImgs = Array.prototype.slice.call(document.querySelectorAll('[data-parallax] .media__img'));
  var progressBar = document.getElementById('progress');
  var ticking = false;

  function update() {
    var vh = window.innerHeight;

    parImgs.forEach(function (img) {
      var holder = img.closest('.media');
      if (!holder) return;
      var r = holder.getBoundingClientRect();
      // descartar si está lejos del viewport
      if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) return;
      // progreso 0 (entrando por abajo) → 1 (saliendo por arriba)
      var prog = (vh - r.top) / (vh + r.height);
      prog = Math.max(0, Math.min(1, prog));
      var shift = (prog - 0.5) * 13;      // % de desplazamiento vertical (parallax)
      var zoom = 1.16 - prog * 0.13;       // zoom lento (1.16 → 1.03)
      img.style.transform = 'translate3d(0,' + shift + '%,0) scale(' + zoom + ')';
    });

    // progreso global
    if (progressBar) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - vh;
      var p = max > 0 ? (doc.scrollTop || window.pageYOffset) / max : 0;
      progressBar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')';
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  if (!reduce) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ---------- VIDEOS: play/pause según visibilidad ---------- */
  var videos = Array.prototype.slice.call(document.querySelectorAll('video.media__img'));
  if (videos.length > 0 && 'IntersectionObserver' in window) {
    var vidObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.play(); } else { e.target.pause(); }
      });
    }, { threshold: 0.1 });
    videos.forEach(function (v) { vidObs.observe(v); });
  }

  if (progressBar && reduce) {
    // sin parallax, mantener barra de progreso
    window.addEventListener('scroll', function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? (doc.scrollTop || window.pageYOffset) / max : 0;
      progressBar.style.transform = 'scaleX(' + p + ')';
    }, { passive: true });
  }
})();
