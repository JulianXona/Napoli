# Resumen de cambios — Humanidad Compartida

Refinamiento visual sobre el scrollytelling armado por Claude Code.
Solo se tocó **`css/styles.css`** y el `<link>` de fuentes en **`index.html`**.
No se modificó `js/main.js`, ni la estructura HTML de las secciones, ni el orden/contenido
de los textos, ni la proporción 21:9, ni la lógica de IntersectionObserver / loop de video.

---

## ⚠️ Conflicto resuelto antes de empezar — idioma

El brief (punto 1) pedía refinar una **jerarquía trilingüe** (IT dominante arriba, ES
intermedio, EN abajo). Pero el `HANDOFF-TO-DESIGN.md` y el HTML actual dicen lo contrario:
la versión trilingüe **se descartó a propósito** por recarga visual, y la pieza es **solo en
español** (única excepción: las cuatro citas napolitanas de la sección 3, sin traducir).

Las dos instrucciones no podían convivir, y reintroducir tres idiomas habría exigido **agregar
contenido y tocar la estructura HTML** — algo explícitamente prohibido en el "NO toques".

**Decisión (confirmada con vos): se mantiene solo español.** El trabajo de jerarquía se redirigió
a los tres registros que sí existen dentro del español: cuerpo, líneas de apertura (`.lead`) y
rótulos (`<strong>`).

---

## 1. Tipografía

- **Fuentes nuevas** (Google Fonts, cambiadas en el `<link>` del `index.html`):
  - **EB Garamond** → cuerpo. Garalda clásica, más cálida y legible que Cormorant, con ese
    aire editorial italiano sin caer en el alto contraste filoso. Reemplaza `--font-serif`.
  - **Petit Formal Script** → citas napolitanas (ver §2).
  - **Inter** → se mantiene solo para detalles sans (rótulo del CTA, etiqueta del indicador).
- **Jerarquía dentro del español** (los "tres registros" que reemplazan al trilingüe):
  - **Cuerpo:** peso 400, interlineado subido a `1.5` (antes 1.3) y un tracking mínimo, para
    que respire. `text-wrap: pretty` para cortes de línea más parejos.
  - **`.lead`** (aperturas de sección): cuerpo mayor (1.16em), peso 500, color blanco cálido
    pleno, con margen propio arriba/abajo para separarse del párrafo.
  - **`.copy strong`** (etiquetas VIDEO / EVENTO / PR, días): pasan a leerse como **rótulos
    editoriales** — versalitas (`text-transform: uppercase`), tamaño 0.84em y tracking 0.11em.
    Dejan de ser una negrita pesada y arman ritmo de pie de imprenta.
- **Color de texto:** de `#FAFAFA` (blanco puro) a `#F4F0E7` (blanco cálido, papel). Más filmico,
  menos clínico, sin perder legibilidad sobre el video.

## 2. Citas napolitanas (sección 3) — tratamiento manuscrito

- Fuente **Petit Formal Script**: caligrafía de pluma, registro de carta real de principios de
  siglo. La cursiva sola no alcanzaba; ahora se sienten escritas a mano, en tinta cálida
  (`#ECE4D2`) sobre el video.
- Cada cita lleva una **inclinación y desfase propios** (`--rot` / `--tx`, ±0.5–0.9°) para que
  parezcan colocadas a mano, no alineadas a máquina.
- **Rúbrica de tinta azul Napoli** bajo cada cita: un trazo corto, levemente torcido, que entra
  como acento (es el único lugar, junto al punto activo del indicador, donde aparece el azul).
- **`text-shadow`** suave para sostener la legibilidad de la tinta clara sobre cualquier frame.
- Se mantienen las comillas `«»` del contenido original (son, además, las correctas en italiano).
- **Aparecen una por una** al entrar en viewport (stagger de ~320 ms entre cada una), para un
  ritmo de lectura íntimo.

## 3. Indicador lateral (14 puntos)

- Puntos **diminutos (5px) y casi imperceptibles** en reposo (opacidad 0.22).
- Al **hover/foco** crecen (escala 2×) y se aclaran, con una transición lenta y elegante.
- El **punto activo** se marca en **azul Napoli** con un halo sutil.
- El punto visible vive en un `::before`; el botón mantiene un **área de clic de 20px** cómoda
  sin agrandar el punto. Sin cambios en la lógica JS que los genera.

## 4. Overlay sobre el video — gradiente vertical tunable

- El velo plano uniforme se reemplazó por un **degradé vertical** con tres tokens por sección:
  `--ov-top`, `--ov-bottom` (oscurecimiento de cada borde) y `--ov-floor` (piso plano del
  centro, donde vive el texto). El video sigue siendo el protagonista; el texto pesa donde tiene
  que pesar.
- Hay un **bloque de overrides por sección** al final del CSS (`#section-NN { --ov-... }`),
  editable sin tocar HTML ni JS.
- **Pendiente para tu round final:** al cerrar esto solo existían los videos de las secciones
  **1 y 6**; el resto quedó en un default balanceado y seguro. Cuando entren los `.mp4` finales,
  ajustá cada bloque según dónde caiga la luz/el sujeto de cada plano (es un número por lado).

## 5. Microinteracciones de entrada

- Fade + translación Y **lenta** (1400 ms, easing suave), **escalonada por párrafo** (~130 ms
  entre cada uno). Como ahora hay un solo idioma, el escalonado que el brief pedía "por idioma"
  se aplicó **por párrafo**, que es el equivalente natural dentro del español.
- El stagger se **topea** para que las secciones largas (8 y 12) no acumulen un retraso
  interminable.
- Nada de bouncing ni efectos llamativos. Se respeta `prefers-reduced-motion`.

## 6. Espaciado (la pieza respira)

- `--content-padding-y`: de `clamp(2rem, 6vh, 5rem)` → `clamp(3rem, 9vh, 7rem)`.
- `--para-gap`: de `0.45em` → `0.9em`.
- Citas con `gap` mayor entre sí (`clamp(2.2rem, 6.5vh, 5rem)`).
- `--content-max-width`: 56rem → 54rem (medida de lectura algo más contenida).

## 7. CTA (sección 14)

- Solo refinamiento (como pediste): más aire (padding), **rótulo en versalitas con tracking**
  (0.18em → 0.22em en hover), transición más larga y elegante. Se mantiene la inversión de color
  en hover.
- **Pendiente:** el `mailto` sigue apuntando al placeholder `hola@xona.example`. Reemplazar por
  el correo real antes de entregar.

---

## Lo que NO se tocó (por las reglas del handoff)

- `js/main.js` completo (observers, generación de dots, loop de video, autoplay).
- Estructura HTML de las secciones, orden y contenido de los textos, comillas `«»`.
- Proporción 21:9 y `object-fit: cover` de los videos.
- Las reglas de layout `.section`, `.section--tall`, posicionamiento de `.section__video` y
  `.section__content`, y el mecanismo `[data-animate]` / `.is-visible`.

## Propuestas dejadas como nota (fuera de alcance, no aplicadas)

- **Dirección del overlay por video:** definida pero pendiente de afinar con los 12 videos que
  faltan (ver §4). Es lo único que recomiendo revisar sí o sí en el round final.
- **Crossfade del overlay entre secciones / scroll-scrubbing:** el handoff (§5) lo dejó fuera a
  propósito por chocar con los IntersectionObserver. No lo agregué. Si lo querés, hay que
  coordinar el cambio en JS.
- **Reanimación al volver al viewport:** sigue desactivada (línea comentada en `main.js`), como
  estaba. El texto anima una sola vez.
