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

function draw() {
  ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

  for (const b of state.blocks) {
    if (b.alive) drawSprite(ctx, 'block_' + b.color, b.x, b.y, CONFIG.block.w, CONFIG.block.h);
  }
  drawSprite(ctx, 'paddle', state.paddle.x, CONFIG.paddle.y, CONFIG.paddle.w, CONFIG.paddle.h);
  drawSprite(ctx, 'ball', state.ball.x, state.ball.y, CONFIG.ball.size, CONFIG.ball.size);
}

loadSpritesheet(() => {
  resetGame();
  draw();
});
