# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado del proyecto

Arkanoid/Breakout en navegador (canvas 2D, JS vanilla). El MVP (`specs/01-mvp-jugable.md`, estado Implementado) está hecho: un nivel de 6×10 bloques en un canvas de 800×600, con pala, bola, vidas, puntos y overlays de victoria y game over. No hay build, linter ni tests.

- Estructura: `index.html` en la raíz, `assets/css/style.css`, `assets/js/game.js` (todo el juego) y `assets/assets/spritesheet.js` (con la ruta del PNG ajustada).
- Para jugar, sirve la raíz con `python -m http.server` y abre `http://localhost:8000`.
- Los sonidos están implementados pero desactivados: `SOUND_ENABLED = false` en `game.js`.
- Es un repo git. Las specs se implementan en ramas `spec-NN-slug`.

Requisito del `README.cmd` (es el README del proyecto, pese a la extensión): juego hecho con HTML, CSS y JavaScript, **cero dependencias** (sin npm, frameworks ni librerías externas), jugable por cualquiera en el navegador.

## Assets (`assets/assets/`)

- `spritesheet-breakout.png`: spritesheet único.
- `spritesheet.js`: script global (sin módulos). Define `SPRITES` (paddle, ball, `blocks.<color>`), `EXPLOSION_FRAMES` (4 frames por color, `EXPLOSION_DURATION = 150` ms) y helpers `loadSpritesheet(cb)`, `drawFrame(ctx, frame, x, y, w, h)`, `drawSprite(ctx, name, x, y, w, h)`.
  - Bloques se piden como `'block_<color>'` (colores: gray, red, yellow, cyan, magenta, hotpink, green). Otros nombres: `'paddle'`, `'ball'`.
  - El PNG se carga con ruta relativa `assets/spritesheet-breakout.png`: la página que lo use debe servirse desde `assets/` (la carpeta que contiene `assets/spritesheet-breakout.png`) o ajustar la ruta.
  - Dibujar antes de que cargue es no-op silencioso; envolver el arranque en `loadSpritesheet(...)`.
  - `EXPLOSION_FRAMES.gray` reutiliza los frames de `red` (no hay frames grises propios).
- `sounds/ball-bounce.mp3`, `sounds/break-sound.mp3`: efectos de rebote y rotura de bloque.
- `assets/__MACOSX` y `.DS_Store`: basura de zip de macOS, ignorar.

## Flujo spec-driven (`.claude/skills/engineering/`)

- `/spec <descripción>`: sesión guiada de 4 fases; guarda el resultado en `specs/NN-slug.md` (plantilla en `spec/template.md`). No escribe código.
- `/spec-impl <NN|slug>`: implementa una spec solo si su estado significa "Aprobado" (en cualquier idioma). Crea/cambia a la rama `spec-NN-slug` (configurable con `AutoCreateBranch` en `specs/.spec-config.yml`), avanza paso a paso del plan con pausa para revisar el diff, y nunca hace commit por su cuenta.
- `.agents/skills/` duplica `spec` y `spec-impl` para otros agentes; `skills-lock.json` fija su origen (`Klerith/fernando-skills`). Si se edita una skill, mantener ambas copias sincronizadas.
- Ambas skills asumen git y una carpeta `specs/` (aún no existen aquí). `/spec-impl` falla en la fase de rama porque el directorio no es repo git; hacer `git init` antes.
- Las specs nuevas deben copiar el idioma y los términos de estado de las existentes.
