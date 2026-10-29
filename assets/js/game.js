'use strict';

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
  lives: CONFIG.lives,
  paddle: { x: 0 },
  ball:   { x: 0, y: 0, vx: 0, vy: 0 },
  blocks: [],       // { x, y, color, alive }
};

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function createBlocks() {
  const { w, h, rows, cols, top } = CONFIG.block;
  const blocks = [];
  rows.forEach((color, r) => {
    for (let c = 0; c < cols; c++) {
      blocks.push({ x: c * w, y: top + r * h, color, alive: true });
    }
  });
  return blocks;
}

function resetGame() {
  state.phase = 'ready';
  state.score = 0;
  state.lives = CONFIG.lives;
  state.paddle.x = (CONFIG.width - CONFIG.paddle.w) / 2;
  state.ball.x = state.paddle.x + (CONFIG.paddle.w - CONFIG.ball.size) / 2;
  state.ball.y = CONFIG.paddle.y - CONFIG.ball.size;
  state.ball.vx = 0;
  state.ball.vy = 0;
  state.blocks = createBlocks();
}

const keys = { left: false, right: false };

function setKey(e, pressed) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = pressed;
  else if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = pressed;
  else return;
  e.preventDefault();
}

const LAUNCH_ANGLE = 20; // grados desde la vertical, siempre hacia la derecha (determinista)
const MAX_STEP = 4;      // px máximos que avanza la bola por subpaso (evita tunneling)

// espacio o clic: lanza la bola en 'ready' y reinicia la partida en 'won' / 'lost'
function launchBall() {
  if (state.phase === 'won' || state.phase === 'lost') {
    resetGame();
    return;
  }
  if (state.phase !== 'ready') return;
  const a = LAUNCH_ANGLE * Math.PI / 180;
  state.ball.vx = CONFIG.ball.speed * Math.sin(a);
  state.ball.vy = -CONFIG.ball.speed * Math.cos(a);
  state.phase = 'playing';
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!e.repeat) launchBall();
    return;
  }
  setKey(e, true);
});
window.addEventListener('keyup', (e) => setKey(e, false));
canvas.addEventListener('mousedown', launchBall);

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) * (CONFIG.width / rect.width);
  state.paddle.x = mouseX - CONFIG.paddle.w / 2;
  clampPaddle();
});

function clampPaddle() {
  state.paddle.x = Math.max(0, Math.min(CONFIG.width - CONFIG.paddle.w, state.paddle.x));
}

function stickBallToPaddle() {
  state.ball.x = state.paddle.x + (CONFIG.paddle.w - CONFIG.ball.size) / 2;
  state.ball.y = CONFIG.paddle.y - CONFIG.ball.size;
}

const SOUND_ENABLED = false; // sonidos desactivados; poner true para reactivarlos

const sounds = {
  bounce: { audio: new Audio('assets/assets/sounds/ball-bounce.mp3'), volume: 1 },
  brick:  { audio: new Audio('assets/assets/sounds/break-sound.mp3'),  volume: 0.25 },
};

// se clona el Audio para que varios sonidos solapados no se corten entre sí
function playSound(sound) {
  if (!SOUND_ENABLED) return;
  const clone = sound.audio.cloneNode();
  clone.volume = sound.volume; // cloneNode no copia el volumen
  clone.play().catch(() => {});
}

function bounceWalls() {
  const ball = state.ball;
  const max = CONFIG.width - CONFIG.ball.size;
  let bounced = false;
  if (ball.x < 0) {
    ball.x = 0;
    ball.vx = Math.abs(ball.vx);
    bounced = true;
  } else if (ball.x > max) {
    ball.x = max;
    ball.vx = -Math.abs(ball.vx);
    bounced = true;
  }
  if (ball.y < 0) {
    ball.y = 0;
    ball.vy = Math.abs(ball.vy);
    bounced = true;
  }
  if (bounced) playSound(sounds.bounce);
}

function bouncePaddle() {
  const ball = state.ball;
  const { w, h, y } = CONFIG.paddle;
  const size = CONFIG.ball.size;
  const px = state.paddle.x;

  const overlaps = ball.vy > 0
    && ball.y + size >= y && ball.y < y + h
    && ball.x + size > px && ball.x < px + w;
  if (!overlaps) return;

  // -1 en el borde izquierdo, 0 en el centro, 1 en el borde derecho
  const offset = Math.max(-1, Math.min(1, (ball.x + size / 2 - (px + w / 2)) / (w / 2)));
  const angle = offset * CONFIG.ball.maxBounceAngle * Math.PI / 180;
  ball.vx = CONFIG.ball.speed * Math.sin(angle);
  ball.vy = -CONFIG.ball.speed * Math.cos(angle);
  ball.y = y - size;
  playSound(sounds.bounce);
}

function bounceBlocks() {
  const ball = state.ball;
  const size = CONFIG.ball.size;
  const { w, h } = CONFIG.block;

  for (const b of state.blocks) {
    if (!b.alive) continue;
    const overlapX = Math.min(ball.x + size, b.x + w) - Math.max(ball.x, b.x);
    const overlapY = Math.min(ball.y + size, b.y + h) - Math.max(ball.y, b.y);
    if (overlapX <= 0 || overlapY <= 0) continue;

    // rebote especular en el eje de menor penetración (empate: vertical)
    if (overlapX < overlapY) {
      const fromLeft = ball.x + size / 2 < b.x + w / 2;
      ball.x += fromLeft ? -overlapX : overlapX;
      ball.vx = fromLeft ? -Math.abs(ball.vx) : Math.abs(ball.vx);
    } else {
      const fromTop = ball.y + size / 2 < b.y + h / 2;
      ball.y += fromTop ? -overlapY : overlapY;
      ball.vy = fromTop ? -Math.abs(ball.vy) : Math.abs(ball.vy);
    }

    b.alive = false;
    state.score += CONFIG.pointsPerBlock;
    playSound(sounds.brick);
    if (state.blocks.every((blk) => !blk.alive)) {
      state.phase = 'won';
      ball.vx = 0;
      ball.vy = 0;
    }
    return; // solo se rompe un bloque por subpaso
  }
}

function loseLife() {
  state.lives--;
  state.ball.vx = 0;
  state.ball.vy = 0;
  if (state.lives <= 0) {
    state.phase = 'lost';
  } else {
    state.phase = 'ready';
    stickBallToPaddle();
  }
}

function moveBall(dt) {
  const ball = state.ball;
  const dist = Math.hypot(ball.vx, ball.vy) * dt;
  const steps = Math.max(1, Math.ceil(dist / MAX_STEP));
  const stepDt = dt / steps;
  for (let i = 0; i < steps; i++) {
    ball.x += ball.vx * stepDt;
    ball.y += ball.vy * stepDt;
    bounceWalls();
    bouncePaddle();
    bounceBlocks();
    if (state.phase !== 'playing') return;
    if (ball.y > CONFIG.height) {
      loseLife();
      return;
    }
  }
}

function update(dt) {
  const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  state.paddle.x += dir * CONFIG.paddle.speed * dt;
  clampPaddle();

  if (state.phase === 'ready') stickBallToPaddle();
  else if (state.phase === 'playing') moveBall(dt);
}

let lastTime = 0;

function frame(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

function draw() {
  ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

  for (const b of state.blocks) {
    if (b.alive) drawSprite(ctx, 'block_' + b.color, b.x, b.y, CONFIG.block.w, CONFIG.block.h);
  }
  drawSprite(ctx, 'paddle', state.paddle.x, CONFIG.paddle.y, CONFIG.paddle.w, CONFIG.paddle.h);
  drawSprite(ctx, 'ball', state.ball.x, state.ball.y, CONFIG.ball.size, CONFIG.ball.size);
  drawHud();
  if (state.phase === 'won' || state.phase === 'lost') drawOverlay();
}

function drawOverlay() {
  const won = state.phase === 'won';
  const cx = CONFIG.width / 2;
  const cy = CONFIG.height / 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 56px monospace';
  ctx.fillText(won ? '¡Victoria!' : 'Game Over', cx, cy - 50);
  ctx.font = 'bold 28px monospace';
  ctx.fillText('Puntos: ' + state.score, cx, cy + 10);
  ctx.font = '20px monospace';
  ctx.fillText('Espacio o clic para jugar de nuevo', cx, cy + 60);
}

function drawHud() {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('Puntos: ' + state.score, 16, 40);
  ctx.textAlign = 'right';
  ctx.fillText('Vidas: ' + state.lives, CONFIG.width - 16, 40);
}

loadSpritesheet(() => {
  resetGame();
  requestAnimationFrame((time) => {
    lastTime = time;
    frame(time);
  });
});
