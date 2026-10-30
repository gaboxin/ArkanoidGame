# Arkanoid

Juego de Arkanoid/Breakout para el navegador, hecho con HTML, CSS y JavaScript, **sin dependencias** (sin npm, frameworks ni librerías externas). Cualquiera puede jugarlo abriéndolo en el navegador.

## Cómo jugar

No necesitas servidor ni instalar nada: abre `index.html` en tu navegador (doble clic).

Si prefieres servirlo igualmente, también funciona con `python -m http.server` y `http://localhost:8000`.

### Controles

| Acción | Teclado | Ratón |
| --- | --- | --- |
| Mover la pala | Flechas izquierda/derecha o `A` / `D` | Mover el ratón |
| Lanzar la bola | `Espacio` | Clic |
| Reiniciar (victoria o game over) | `Espacio` | Clic |

### Reglas

- Un nivel de 6×10 bloques (60 bloques, 6 colores), cada uno se rompe de 1 golpe.
- 3 vidas: pierdes una cuando la bola cae por debajo de la pala.
- 10 puntos por bloque.
- Ganas al romper todos los bloques; pierdes al quedarte sin vidas.
- La bola rebota de forma determinista: el ángulo de salida en la pala depende del punto de impacto.

## Estado del proyecto

- MVP jugable implementado (`specs/01-mvp-jugable.md`).
- Los efectos de sonido están implementados pero desactivados. Para activarlos, pon `SOUND_ENABLED = true` en `assets/js/game.js`.
- Aún no incluye: animación de explosión, varios niveles, power-ups, récords, pausa ni controles táctiles.

## Estructura

```
index.html                  # página y canvas del juego
assets/css/style.css        # estilos
assets/js/game.js           # lógica del juego
assets/assets/              # spritesheet, sonidos y spritesheet.js
specs/                      # especificaciones (spec-driven design)
```

## Desarrollo

El proyecto sigue un flujo spec-driven: cada funcionalidad se diseña primero como spec en `specs/NN-slug.md` y se implementa después en una rama `spec-NN-slug`. Más detalle en `CLAUDE.md` y `.claude/skills/engineering/`.
