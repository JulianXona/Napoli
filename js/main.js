/* ============================================================
   HUMANIDAD COMPARTIDA — lógica de la scroll-experience
   ============================================================

   Responsabilidades de este archivo (Claude Design NO debería tocarlo):
   1. Construir el indicador lateral (14 puntos) y el scroll-to-section.
   2. IntersectionObserver para animaciones de entrada del texto.
   3. IntersectionObserver para marcar el punto activo del indicador.
   4. Manejo de videos: reproducción continua en loop sin pausar al salir
      del viewport, y ocultado del placeholder cuando el .mp4 real carga.

   Todo el estilado (colores, fonts, tamaños, animación) vive en styles.css
   vía variables CSS. Acá solo se agregan/quitan clases.
   ============================================================ */

(function () {
  'use strict';

  const sections = Array.from(document.querySelectorAll('.section'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------
     1. INDICADOR LATERAL — un punto por sección.
     -------------------------------------------------------- */
  const navList = document.getElementById('sidenav-list');

  // Mapa sección.id -> botón, para sincronizar el estado activo.
  const dotsBySectionId = new Map();

  sections.forEach((section) => {
    const number = section.getAttribute('data-section-number') || '';
    const item = document.createElement('li');

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'sidenav__dot';
    dot.setAttribute('aria-label', 'Ir a la sección ' + number);
    dot.dataset.target = section.id;

    dot.addEventListener('click', () => {
      section.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });

    item.appendChild(dot);
    navList.appendChild(item);
    dotsBySectionId.set(section.id, dot);
  });

  function setActiveDot(sectionId) {
    dotsBySectionId.forEach((dot, id) => {
      dot.classList.toggle('is-active', id === sectionId);
    });
  }

  /* --------------------------------------------------------
     2. ANIMACIONES DE ENTRADA del texto (fade + translateY).
     Observa los contenedores [data-animate] y les agrega
     .is-visible al entrar en viewport.
     -------------------------------------------------------- */
  const animatedBlocks = document.querySelectorAll('[data-animate]');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // Sin animación: mostrar todo de una.
    animatedBlocks.forEach((el) => el.classList.add('is-visible'));
  } else {
    const animObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
          // Si se quisiera re-animar al volver a entrar, descomentar:
          // else { entry.target.classList.remove('is-visible'); }
        });
      },
      {
        // threshold 0 + rootMargin inferior negativo: dispara cuando el borde
        // superior del bloque cruza el ~85% del viewport al subir. Con threshold
        // 0 funciona también con bloques más altos que la pantalla (8 y 12),
        // que nunca alcanzarían un ratio fijo del 25%.
        threshold: 0,
        rootMargin: '0px 0px -15% 0px',
      }
    );

    animatedBlocks.forEach((el) => animObserver.observe(el));
  }

  /* --------------------------------------------------------
     3. PUNTO ACTIVO del indicador según la sección visible.
     Observa las secciones y marca como activa la más centrada.
     -------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    // La sección "activa" es la que cruza una línea horizontal en el centro
    // del viewport. Usamos un root de altura cero (rootMargin -50%/-50%) y
    // threshold 0: así funciona también con las secciones altas (8 y 12),
    // que nunca alcanzarían un ratio alto contra el viewport completo.
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveDot(entry.target.id);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '-50% 0px -50% 0px',
      }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  // Estado inicial: primera sección activa.
  if (sections.length) {
    setActiveDot(sections[0].id);
  }

  /* --------------------------------------------------------
     4. MEDIA — fondo blur + ocultar placeholder.
     Funciona con <img> y con <video>.
     Por cada sección se crea un clon del media que actúa como
     fondo borroso (object-fit: cover + filter: blur).
     -------------------------------------------------------- */
  sections.forEach((section) => {
    const media = section.querySelector('.section__video');
    if (!media) return;

    const isVideo = media.tagName === 'VIDEO';

    // --- Clon de fondo borroso ---
    const bgMedia = media.cloneNode(true);
    bgMedia.className = 'section__video-bg';
    bgMedia.setAttribute('aria-hidden', 'true');
    if (isVideo) bgMedia.removeAttribute('poster');
    section.insertBefore(bgMedia, media);

    // --- Marcar sección con media real (oculta el placeholder) ---
    function markLoaded() {
      section.classList.add('has-video');
    }

    if (isVideo) {
      if (media.readyState >= 2) {
        markLoaded();
      } else {
        media.addEventListener('loadeddata', markLoaded, { once: true });
      }

      function tryPlay(v) {
        const p = v.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
      }

      [media, bgMedia].forEach((v) => {
        if (v.readyState >= 2) tryPlay(v);
        else v.addEventListener('canplay', () => tryPlay(v), { once: true });
      });

    } else {
      // <img>: marcar como cargada cuando el src esté listo
      if (media.complete) {
        markLoaded();
      } else {
        media.addEventListener('load', markLoaded, { once: true });
      }
    }
  });
})();
