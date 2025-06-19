const player = document.getElementById('player');
const goal = document.getElementById('goal');
const message = document.getElementById('message');
const game = document.getElementById('game');
const scoreBox = document.getElementById('scoreBox');

const gridSize = 60;
const gridCount = 10;
let x = 0, y = 0;
let score = 0;
let gameLoop;
let gameRunning = true; // continuous collision detection

const obstacles = [];
const bombCount = 20; 

function updateScore() {
  scoreBox.textContent = `Score: ${score}`;
}

// Collision detection (grid-based)
function isColliding(ax, ay, bx, by) {
  return ax === bx && ay === by;
}

function movePlayer(incrementScore = true) {
  player.style.transform = `translate(${x * gridSize}px, ${y * gridSize}px)`;
  if (incrementScore) {
    score++;
  }
  updateScore();

  for (const obs of obstacles) {
    if (isColliding(obs.x, obs.y, x, y)) return endGame(false);
  }

  const gx = parseInt(goal.dataset.x);
  const gy = parseInt(goal.dataset.y);
  if (isColliding(x, y, gx, gy)) return endGame(true);
}

function moveObstacles() {
  const gx = parseInt(goal.dataset.x);
  const gy = parseInt(goal.dataset.y);

  for (const obs of obstacles) {
    // Checking collision before movement
    if (isColliding(obs.x, obs.y, x, y)) return endGame(false);

    // Randomisation
    if (Math.random() > 0.5) obs.x = (obs.x + 1) % gridCount;
    else obs.y = (obs.y + 1) % gridCount;

    obs.el.style.transform = `translate(${obs.x * gridSize}px, ${obs.y * gridSize}px)`;

    // Checking collision after movement
    if (isColliding(obs.x, obs.y, x, y)) return endGame(false);
  }

  if (isColliding(x, y, gx, gy)) return endGame(true);
}

// More accurate hit detection 
function checkCollision() {
  if (!gameRunning) return;
  
  const playerRect = player.getBoundingClientRect();
  // Using a shrink factor 
  const shrinkFactor = 0.7;
  const reducedPlayerRect = {
    left: playerRect.left + (playerRect.width * (1 - shrinkFactor)) / 2,
    right: playerRect.right - (playerRect.width * (1 - shrinkFactor)) / 2,
    top: playerRect.top + (playerRect.height * (1 - shrinkFactor)) / 2,
    bottom: playerRect.bottom - (playerRect.height * (1 - shrinkFactor)) / 2
  };

  for (const obs of obstacles) {
    const obsRect = obs.el.getBoundingClientRect();
    const reducedObsRect = {
      left: obsRect.left + (obsRect.width * (1 - shrinkFactor)) / 2,
      right: obsRect.right - (obsRect.width * (1 - shrinkFactor)) / 2,
      top: obsRect.top + (obsRect.height * (1 - shrinkFactor)) / 2,
      bottom: obsRect.bottom - (obsRect.height * (1 - shrinkFactor)) / 2
    };

    if (
      reducedPlayerRect.left < reducedObsRect.right &&
      reducedPlayerRect.right > reducedObsRect.left &&
      reducedPlayerRect.top < reducedObsRect.bottom &&
      reducedPlayerRect.bottom > reducedObsRect.top
    ) {
      return endGame(false);
    }
  }
  requestAnimationFrame(checkCollision);
}

function endGame(won) {
  gameRunning = false;
  message.style.display = 'block';
  message.textContent = won ? 'You Win! 🎉' : 'Game Over 💥';
  clearInterval(gameLoop);
  document.removeEventListener('keydown', handleKey);
  score = 0;
  updateScore();

  setTimeout(() => {
    resetGame();
  }, 2000);
}

function createObstacle(x, y) {
  const el = document.createElement('div');
  el.className = 'obstacle';
  el.textContent = '💣';
  el.style.transform = `translate(${x * gridSize}px, ${y * gridSize}px)`;
  game.appendChild(el);
  obstacles.push({ x, y, el });
}

function handleKey(e) {
  if (e.key === 'ArrowUp' && y > 0) y--;
  if (e.key === 'ArrowDown' && y < gridCount - 1) y++;
  if (e.key === 'ArrowLeft' && x > 0) x--;
  if (e.key === 'ArrowRight' && x < gridCount - 1) x++;
  movePlayer();
}

function setupGame() {
  // Goal position
  const gx = gridCount - 1;
  const gy = gridCount - 1;
  goal.dataset.x = gx;
  goal.dataset.y = gy;
  goal.style.transform = `translate(${gx * gridSize}px, ${gy * gridSize}px)`;

  // No overlapping of start or goal
  for (let i = 0; i < bombCount; i++) {
    let ox, oy;
    do {
      ox = Math.floor(Math.random() * gridCount);
      oy = Math.floor(Math.random() * gridCount);
    } while ((ox === 0 && oy === 0) || (ox === gx && oy === gy));
    createObstacle(ox, oy);
  }

  // Initial player position
  player.style.transform = `translate(${x * gridSize}px, ${y * gridSize}px)`;
  updateScore();
  document.addEventListener('keydown', handleKey);
}

function resetGame() {
  x = 0;
  y = 0;

  for (const obs of obstacles) {
    game.removeChild(obs.el);
  }
  obstacles.length = 0;

  message.style.display = 'none';

  setupGame();
  gameRunning = true;
  requestAnimationFrame(checkCollision);

  // Faster movement of obstacles
  gameLoop = setInterval(moveObstacles, 500);
}

setupGame();
gameLoop = setInterval(moveObstacles, 500);
requestAnimationFrame(checkCollision);
