# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado del proyecto

Arkanoid/Breakout en navegador (canvas 2D, JS vanilla). El MVP (`specs/01-mvp-jugable.md`, estado Implementado) está hecho: un nivel de 6×10 bloques en un canvas de 800×600, con pala, bola, vidas, puntos y overlays de victoria y game over. No hay build, linter ni tests.

Requisito del `README.cmd` (es el README del proyecto, pese a la extensión): juego hecho con HTML, CSS y JavaScript, **cero dependencias** (sin npm, frameworks ni librerías externas), jugable por cualquiera en el navegador.

- Para jugar, sirve la raíz con `python -m http.server` y abre `http://localhost:8000`.
- Es un repo git. Rama principal `main`; cada spec se implementa en una rama `spec-NN-slug` (existe `spec-01-mvp-jugable`).

## Estructura

```
index.html                 # canvas #game + carga de scripts (spritesheet.js antes que game.js)
assets/css/style.css
assets/js/game.js          # todo el juego (~290 líneas)
assets/assets/             # sprites, sonidos y spritesheet.js (ver sección Assets)
specs/NN-slug.md           # specs del flujo spec-driven
specs/.spec-config.yml     # configuración de /spec-impl
.claude/skills/engineering/  # skills spec y spec-impl
.agents/skills/            # copia de las skills para otros agentes
```

## Arquitectura de `game.js`

Script global único, sin módulos. Orden del archivo:

- `CONFIG` (constantes de tamaños, velocidades, vidas, puntos) y `state` (`phase`: `'ready' | 'playing' | 'won' | 'lost'`, `score`, `lives`, `paddle`, `ball`, `blocks`). Ajustar números en `CONFIG`, no en la lógica.
- Entrada: `keys` + `setKey` (flechas/A/D), ratón y lanzamiento con espacio o clic (`launchBall`); en `won`/`lost` el mismo gesto reinicia (`resetGame`).
- Física determinista: velocidad constante, rebote especular, ángulo en la pala según el punto de impacto (`bounceWalls`, `bouncePaddle`, `bounceBlocks`). `moveBall(dt)` avanza en subpasos de `MAX_STEP` px para evitar tunneling. `dt` en segundos, velocidades en px/s.
- Bucle: `frame` → `update(dt)` → `draw()` (`drawOverlay`, `drawHud`).
- Sonidos implementados pero desactivados: `SOUND_ENABLED = false` en `game.js`. Todo sonido pasa por `playSound`.

## Assets (`assets/assets/`)

- `spritesheet-breakout.png`: spritesheet único.
- `spritesheet.js`: script global (sin módulos). Define `SPRITES` (paddle, ball, `blocks.<color>`), `EXPLOSION_FRAMES` (4 frames por color, `EXPLOSION_DURATION = 150` ms) y helpers `loadSpritesheet(cb)`, `drawFrame(ctx, frame, x, y, w, h)`, `drawSprite(ctx, name, x, y, w, h)`.
  - Bloques se piden como `'block_<color>'` (colores: gray, red, yellow, cyan, magenta, hotpink, green). Otros nombres: `'paddle'`, `'ball'`.
  - La ruta del PNG está ajustada a `assets/assets/spritesheet-breakout.png` (relativa a la raíz, donde vive `index.html`).
  - Dibujar antes de que cargue es no-op silencioso; envolver el arranque en `loadSpritesheet(...)`.
  - `EXPLOSION_FRAMES.gray` reutiliza los frames de `red` (no hay frames grises propios).
- `sounds/ball-bounce.mp3`, `sounds/break-sound.mp3`: efectos de rebote y rotura de bloque.
- `assets/__MACOSX` y `.DS_Store`: basura de zip de macOS, ignorar.

## Flujo spec-driven (`.claude/skills/engineering/`)

Todo cambio de funcionalidad pasa por una spec en `specs/`: primero se diseña (`/spec`), luego se implementa (`/spec-impl`). No implementar features nuevas sin spec aprobada.

- `/spec <descripción>`: sesión guiada de 4 fases; guarda el resultado en `specs/NN-slug.md` (plantilla en `.claude/skills/engineering/spec/template.md`). No escribe código.
- `/spec-impl <NN|slug>`: implementa una spec solo si su estado significa "Aprobado" (en cualquier idioma). Crea/cambia a la rama `spec-NN-slug` (`AutoCreateBranch` en `specs/.spec-config.yml`, hoy `true`), avanza paso a paso del plan con pausa para revisar el diff, y nunca hace commit por su cuenta. Al terminar, la spec pasa a "Implementado".
- Ciclo de estados: Borrador → En revisión → Aprobado → Implementado (u Obsoleto).

### Convenciones de las specs

- Idioma: **español**. Estados válidos: `Borrador`, `En revisión`, `Aprobado`, `Implementado`, `Obsoleto`. Las specs nuevas deben copiar el idioma y los términos de las existentes (usar `specs/01-mvp-jugable.md` como modelo).
- Cabecera en blockquote: `Estado`, `Depende de`, `Fecha`, `Objetivo` (una sola frase).
- Secciones: Alcance (Dentro / Fuera de alcance), Modelo de datos, Plan de implementación, Criterios de aceptación, Decisiones, Riesgos, "Lo que **no** está en esta spec".
- Nombre de archivo `NN-slug.md` con numeración correlativa; rama `spec-NN-slug`.
- Lo que una spec deja fuera de alcance (explosiones, varios niveles, power-ups, persistencia, pantallas separadas, pausa/opciones, velocidad creciente, táctil, multijugador) son candidatas a specs futuras.

### Mantenimiento de las skills

- `.agents/skills/` duplica `spec` y `spec-impl` para otros agentes; `skills-lock.json` fija su origen (`Klerith/fernando-skills`). Si se edita una skill, mantener ambas copias sincronizadas.
- Las skills asumen git y la carpeta `specs/`, que ya existen.
