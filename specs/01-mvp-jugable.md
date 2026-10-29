# SPEC 01 — MVP jugable de Arkanoid

> **Estado:** Aprobado
> **Depende de:** ninguna
> **Fecha:** 2026-10-29
> **Objetivo:** Un Arkanoid de un solo nivel, jugable en el navegador con HTML, CSS y JavaScript sin dependencias, que use los sprites y sonidos existentes.

---

## Alcance

**Dentro:**

- `index.html` en la raíz del proyecto, con `style.css` y `game.js`, sin dependencias externas ni build.
- Canvas 2D de 800×600 px, centrado en la página.
- Un nivel de 6 filas × 10 columnas (60 bloques de 80×40 px, que llenan los 800 px de ancho y mantienen la proporción 2:1 del sprite). Cada fila tiene un color: `red`, `yellow`, `cyan`, `magenta`, `green`, `hotpink`. Cada bloque se rompe de 1 golpe.
- Pala controlada con teclado (flechas o A/D) y con ratón.
- Bola que sale pegada a la pala y se lanza con espacio o clic.
- Física de rebote simple y predecible, como en el Arkanoid clásico: velocidad constante de la bola, rebote especular en paredes, techo y bloques (sin aleatoriedad ni rozamiento), y ángulo de rebote en la pala según el punto de impacto.
- 3 vidas y puntuación de 10 puntos por bloque, visibles en pantalla (HUD).
- Una sola pantalla: el juego no tiene pantallas aparte. Victoria y game over se muestran como un overlay de texto sobre el mismo canvas, con reinicio mediante espacio o clic.
- Sonidos: `ball-bounce.mp3` al rebotar en paredes, techo o pala, y `break-sound.mp3` al romper un bloque.
- Cambio de una línea en `assets/assets/spritesheet.js` para que la ruta del PNG sea `assets/assets/spritesheet-breakout.png`.

**Fuera de alcance (para otras specs):**

- Animación de explosión de los bloques (`EXPLOSION_FRAMES`): en el MVP el bloque simplemente desaparece.
- Varios niveles y progresión.
- Power-ups, bloques de varios golpes o indestructibles (el sprite `gray` no se usa).
- Persistencia (récords, `localStorage`).
- Pantallas separadas (menú principal, victoria, game over) y pausa u opciones (volumen, mute).
- Velocidad creciente de la bola.
- Controles táctiles y versión móvil.
- Multijugador.

## Modelo de datos

Estructuras nuevas, todas en `game.js`. Coordenadas con origen arriba a la izquierda y velocidades en píxeles por segundo (se usa `dt` en segundos).

```js
const CONFIG = {
  width: 800, height: 600,
  paddle: { w: 120, h: 16, y: 560, speed: 600 },
  ball:   { size: 16, speed: 400, maxBounceAngle: 60 }, // grados desde la vertical
  block:  { w: 80, h: 40, rows: ['red', 'yellow', 'cyan', 'magenta', 'green', 'hotpink'], cols: 10, top: 80 },
  lives: 3,
  pointsPerBlock: 10,
};

const state = {
  phase: 'ready',   // 'ready' | 'playing' | 'won' | 'lost'
  score: 0,
  lives: 3,
  paddle: { x: 0 },
  ball:   { x: 0, y: 0, vx: 0, vy: 0 },
  blocks: [/* { x, y, color, alive } */],
};
```

Convenciones:

- `ready`: la bola va pegada a la pala y espera el lanzamiento.
- `playing`: la bola se mueve.
- `won`: no quedan bloques vivos.
- `lost`: las vidas llegaron a 0.
- Un bloque con `alive = false` desaparece al instante: no se dibuja y no colisiona.
- Reglas de rebote:
  - Paredes laterales y techo: se invierte `vx` o `vy` y la bola se recoloca dentro del límite.
  - Pala: `vx = speed · sin(a)`, `vy = -speed · cos(a)`, con `a = maxBounceAngle · (impacto − centro) / (w/2)`. Solo rebota si la bola baja (`vy > 0`).
  - Bloque: se invierte `vx` si el choque es lateral y `vy` si es por arriba o abajo (eje de menor penetración). Si toca dos bloques en el mismo paso, solo se rompe el primero.
  - Tras cada rebote el módulo de la velocidad vuelve a ser `speed`, y la bola nunca queda con `vy` casi 0 (ángulo mínimo respecto a la horizontal).
- Los valores de `CONFIG` son iniciales y se pueden ajustar al jugar, siempre sin romper los criterios de aceptación.

## Plan de implementación

1. Cambiar la ruta del PNG en `assets/assets/spritesheet.js` (línea `rawImg.src`) a `assets/assets/spritesheet-breakout.png`. Crear `index.html` y `style.css` con el canvas y cargar `spritesheet.js` y `game.js`. Prueba manual: la página abre sin errores en la consola.
2. En `game.js`, arrancar con `loadSpritesheet(...)` y dibujar pala, bola y los 60 bloques con `drawSprite`. Prueba manual: se ve la cuadrícula de 6 colores.
3. Añadir el bucle con `requestAnimationFrame` y `dt`, el movimiento de la pala con teclado y ratón (limitada a los bordes) y la bola pegada a la pala. Prueba manual: la pala se mueve con ambos controles.
4. Añadir el lanzamiento (espacio o clic), el movimiento de la bola y el rebote en paredes y techo. Prueba manual: la bola rebota en los tres bordes.
5. Añadir el rebote en la pala con la fórmula de ángulo de la sección Modelo de datos y la pérdida de vida cuando la bola cae por abajo, con vuelta a `ready`. Prueba manual: el ángulo cambia según dónde toque la pala, y al caer se pierde una vida.
6. Añadir la colisión bola-bloque (rebote, `alive = false`, +10 puntos) y el HUD con puntos y vidas. Prueba manual: los bloques se rompen y el marcador sube.
7. Añadir el overlay de victoria y de game over sobre el canvas, con reinicio. Prueba manual: se llega a ambos y se puede volver a jugar.
8. Añadir los sonidos. Prueba manual: suena cada evento.

## Criterios de aceptación

- [ ] Abrir `index.html` (o servir la raíz con un servidor estático) carga el juego sin errores en la consola.
- [ ] No existe ninguna dependencia externa: no hay `npm`, CDN ni librerías.
- [ ] Se dibujan 60 bloques en 6 filas × 10 columnas de colores distintos, usando el spritesheet.
- [ ] La pala se mueve con las flechas, con A/D y con el ratón, y no sale del canvas.
- [ ] La bola empieza pegada a la pala y solo se lanza con espacio o clic.
- [ ] La bola rebota en paredes laterales, techo y pala, y mantiene la misma velocidad en todo momento.
- [ ] El rebote es determinista: el mismo lanzamiento y las mismas posiciones de pala producen siempre la misma trayectoria. Un golpe al centro de la pala sale en vertical y un golpe de lado a un bloque invierte solo `vx`.
- [ ] Al golpear la pala cerca del borde izquierdo la bola sale hacia la izquierda, y cerca del borde derecho hacia la derecha.
- [ ] Romper un bloque suma exactamente 10 puntos y el bloque deja de colisionar.
- [ ] Si la bola cae por abajo se pierde una vida, el HUD lo refleja y la bola vuelve a la pala.
- [ ] Con 0 vidas aparece un overlay "Game Over" sobre el canvas, y espacio o clic reinicia la partida con 3 vidas, 0 puntos y los 60 bloques.
- [ ] Al romper los 60 bloques aparece un overlay de victoria con 600 puntos, y espacio o clic reinicia la partida.
- [ ] Todo el juego ocurre en una única página y un único canvas, sin navegar ni mostrar otras pantallas.
- [ ] Suena `ball-bounce.mp3` en cada rebote y `break-sound.mp3` en cada bloque roto.
- [ ] Cada bloque roto desaparece al instante, sin animación.
- [ ] La única modificación en `assets/` es la línea de la ruta del PNG en `spritesheet.js`.

## Decisiones

- **Sí:** `index.html` en la raíz y una línea cambiada en `spritesheet.js`. Es el cambio mínimo y evita mover assets.
- **No:** mover los assets a otra carpeta. Rompería la estructura entregada.
- **Sí:** tres archivos (`index.html`, `style.css`, `game.js`). Es simple y cumple el requisito de no tener build.
- **Sí:** un nivel, 3 vidas y 10 puntos fijos por bloque. Es lo mínimo para que se sienta un juego completo.
- **Sí:** teclado y ratón a la vez. No cuesta casi nada y cualquiera puede jugar.
- **Sí:** ángulo de rebote según el punto de impacto en la pala y velocidad constante. Es el rebote clásico y es predecible.
- **Sí:** rebote especular simple (invertir un eje) en paredes y bloques, sin efectos de giro ni aleatoriedad.
- **Sí:** bloques de 80×40 sobre canvas de 800×600. Mantienen la proporción 2:1 del sprite (32×16) y cubren el ancho sin huecos.
- **No:** velocidad creciente. Complica el ajuste de dificultad y no hace falta para un MVP.
- **No:** animación de explosión. Para el MVP basta con que el bloque desaparezca; se puede añadir después con `EXPLOSION_FRAMES`.
- **No:** bloques `gray` ni de varios golpes. El spritesheet no tiene frames de explosión propios para el gris.
- **Sí:** `dt` en segundos en el bucle, para que la velocidad no dependa de los Hz del monitor.
- **Sí:** overlay sobre el canvas para victoria y game over. Con una sola pantalla basta y evita gestionar escenas.
- **No:** pantallas separadas de victoria o game over. Son más código sin aportar al MVP.
- **No:** persistencia ni menú. Van en otras specs.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Abrir `index.html` con `file://` puede bloquear la carga del PNG por la copia a canvas de `spritesheet.js` (canvas contaminado en algunos navegadores) | Documentar en el README cómo servir la raíz con un servidor estático (p. ej. `python -m http.server`). El juego solo dibuja, no lee píxeles, así que suele funcionar igual. |
| Los navegadores bloquean el audio hasta la primera interacción | Los sonidos se reproducen solo tras el primer clic o tecla, que ya es necesario para lanzar la bola. |
| Con velocidad alta la bola puede atravesar un bloque o la pala (tunneling) | Velocidad moderada (400 px/s) y movimiento en subpasos de como máximo 4 px por frame. |
| Varios sonidos solapados cortan el anterior | Clonar el `Audio` en cada reproducción o reiniciar `currentTime`. |

## Lo que **no** está en esta spec

- Varios niveles y progresión.
- Power-ups y bloques especiales.
- Récords y persistencia.
- Pantallas separadas (menú, victoria, game over), pausa y opciones de sonido.
- Controles táctiles y versión móvil.
- Multijugador.

Cada uno, si se hace, va en su propia spec.
