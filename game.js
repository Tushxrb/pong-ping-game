const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Responsive variables
let gameWidth = 800, gameHeight = 500;
let PADDLE_WIDTH = 15, PADDLE_HEIGHT = 100, BALL_SIZE = 16;
let PLAYER_X = 26, AI_X = 800 - 15 - 26;
const PADDLE_SPEED = 7;
const BALL_INITIAL_SPEED = 6;
const BALL_SPEEDUP_FACTOR = 1.035;

// State
let playerY, aiY;
let ballX, ballY, ballVX, ballVY, ballSpeed;
let playerScore = 0;
let aiScore = 0;
let highScores = getHighScores();
let paused = false;
let animationId = null;

// DOM elements
const manualModal = document.getElementById('manualModal');
const manualBtn = document.getElementById('manualBtn');
const closeManual = document.getElementById('closeManual');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

manualBtn.onclick = () => { manualModal.style.display = 'flex'; };
closeManual.onclick = () => { manualModal.style.display = 'none'; };
window.onclick = (e) => {
    if (e.target === manualModal) manualModal.style.display = 'none';
};
pauseBtn.onclick = () => togglePause();
restartBtn.onclick = () => restartGame();

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
    }
});

canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY * (gameHeight / canvas.height) - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(gameHeight - PADDLE_HEIGHT, playerY));
});

function getHighScores() {
    let hs = localStorage.getItem("pongHighScores");
    if (!hs) return [{player:0,ai:0},{player:0,ai:0},{player:0,ai:0}];
    try {
        const parsed = JSON.parse(hs);
        if (Array.isArray(parsed)) return parsed.slice(0,3);
        return [{player:0,ai:0},{player:0,ai:0},{player:0,ai:0}];
    } catch(e) {
        return [{player:0,ai:0},{player:0,ai:0},{player:0,ai:0}];
    }
}
function saveHighScores() {
    localStorage.setItem("pongHighScores", JSON.stringify(highScores));
}
function updateHighScores() {
    if (playerScore === 0 && aiScore === 0) return;
    highScores.push({player: playerScore, ai: aiScore});
    highScores.sort((a, b) => {
        const diffA = a.player - a.ai;
        const diffB = b.player - b.ai;
        if (diffB !== diffA) return diffB - diffA;
        return b.player - a.player;
    });
    highScores = highScores.slice(0, 3);
    saveHighScores();
    renderHighScores();
}
function renderHighScores() {
    const hsList = document.getElementById('highScores');
    hsList.innerHTML = '';
    highScores.forEach(score => {
        const li = document.createElement('li');
        li.textContent = `${score.player} - ${score.ai}`;
        hsList.appendChild(li);
    });
}
function updateScoreDisplay() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('aiScore').textContent = aiScore;
}

// Resizing/canvas fit logic
function fitGameToScreen() {
    // Use 16:10 aspect ratio, but fit to 98vw x 67vh (see CSS), max 1200x800px, min 320x200px
    let ww = window.innerWidth, wh = window.innerHeight;
    let aspect = 16/10;
    let cw = Math.min(ww*0.98, 1200);
    let ch = Math.min(wh*0.67, 800);

    if (cw/aspect > ch) {
        cw = ch * aspect;
    } else {
        ch = cw / aspect;
    }

    if (cw < 320) { cw = 320; ch = 200; }
    if (ch < 200) { ch = 320 / aspect; cw = 320; }

    canvas.width = Math.round(cw);
    canvas.height = Math.round(ch);

    // Game logical size for scaling
    gameWidth = canvas.width;
    gameHeight = canvas.height;
    // sizes proportional to screen size
    PADDLE_WIDTH = Math.round(gameWidth * 0.018);
    PADDLE_HEIGHT = Math.round(gameHeight * 0.2);
    BALL_SIZE = Math.round(gameWidth * 0.02);
    PLAYER_X = Math.round(gameWidth * 0.032);
    AI_X = gameWidth - PADDLE_WIDTH - PLAYER_X;

    // Clamp paddles
    if (typeof playerY === 'undefined') playerY = gameHeight / 2 - PADDLE_HEIGHT / 2;
    if (typeof aiY === 'undefined') aiY = gameHeight / 2 - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(gameHeight - PADDLE_HEIGHT, playerY));
    aiY = Math.max(0, Math.min(gameHeight - PADDLE_HEIGHT, aiY));
    // Clamp ball
    if (typeof ballX === 'undefined') ballX = gameWidth / 2 - BALL_SIZE / 2;
    if (typeof ballY === 'undefined') ballY = gameHeight / 2 - BALL_SIZE / 2;
    ballX = Math.max(0, Math.min(gameWidth - BALL_SIZE, ballX));
    ballY = Math.max(0, Math.min(gameHeight - BALL_SIZE, ballY));
}
window.addEventListener("resize", () => {
    fitGameToScreen();
    draw();
});

function draw() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // Net
    ctx.save();
    ctx.strokeStyle = "#202b3e";
    ctx.shadowColor = "#4d9fff";
    ctx.shadowBlur = 14;
    ctx.lineWidth = Math.max(2, Math.round(gameWidth*0.005));
    ctx.beginPath();
    for (let i = 0; i < gameHeight; i += Math.round(gameHeight*0.065)) {
        ctx.moveTo(gameWidth / 2, i);
        ctx.lineTo(gameWidth / 2, i + Math.round(gameHeight*0.04));
    }
    ctx.stroke();
    ctx.restore();

    // Player paddle
    ctx.save();
    ctx.shadowColor = "#00fff7";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#0ff";
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.restore();

    // AI paddle
    ctx.save();
    ctx.shadowColor = "#ff005a";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#f12";
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.restore();

    // Ball
    ctx.save();
    ctx.shadowColor = "#ffe96e";
    ctx.shadowBlur = Math.round(gameWidth * 0.026);
    ctx.fillStyle = "#ffe96e";
    ctx.beginPath();
    ctx.arc(ballX + BALL_SIZE/2, ballY + BALL_SIZE/2, BALL_SIZE/2, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();

    // Draw pause overlay if paused
    if (paused) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "#18181f";
        ctx.fillRect(0, 0, gameWidth, gameHeight);
        ctx.globalAlpha = 1;
        ctx.font = `bold ${Math.round(gameHeight*0.09)}px 'Segoe UI', Arial`;
        ctx.fillStyle = "#ffeea2";
        ctx.textAlign = "center";
        ctx.fillText("Paused", gameWidth/2, gameHeight/2 - gameHeight*0.02);
        ctx.font = `${Math.round(gameHeight*0.035)}px 'Segoe UI', Arial`;
        ctx.fillText("Press Space or Pause to Resume", gameWidth/2, gameHeight/2 + gameHeight*0.07);
        ctx.restore();
    }
}

function updateAI() {
    const aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (aiCenter < ballY + BALL_SIZE / 2 - 12) {
        aiY += PADDLE_SPEED * 0.93 * (gameHeight/500);
    } else if (aiCenter > ballY + BALL_SIZE / 2 + 12) {
        aiY -= PADDLE_SPEED * 0.93 * (gameHeight/500);
    }
    aiY = Math.max(0, Math.min(gameHeight - PADDLE_HEIGHT, aiY));
}

function checkCollisions() {
    // Top and bottom walls
    if (ballY <= 0 || ballY + BALL_SIZE >= gameHeight) {
        ballVY *= -1;
        ballY = Math.max(0, Math.min(gameHeight - BALL_SIZE, ballY));
        accelerateBall();
    }

    // Left paddle
    if (
        ballX <= PLAYER_X + PADDLE_WIDTH &&
        ballY + BALL_SIZE >= playerY &&
        ballY <= playerY + PADDLE_HEIGHT
    ) {
        ballVX = Math.abs(ballVX);
        let collidePoint = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        collidePoint /= PADDLE_HEIGHT / 2;
        let angle = collidePoint * (Math.PI / 4);
        let speed = Math.sqrt(ballVX * ballVX + ballVY * ballVY);
        ballVX = speed * Math.cos(angle);
        ballVY = speed * Math.sin(angle);
        ballX = PLAYER_X + PADDLE_WIDTH + 1;
        accelerateBall();
    }

    // Right paddle (AI)
    if (
        ballX + BALL_SIZE >= AI_X &&
        ballY + BALL_SIZE >= aiY &&
        ballY <= aiY + PADDLE_HEIGHT
    ) {
        ballVX = -Math.abs(ballVX);
        let collidePoint = (ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        collidePoint /= PADDLE_HEIGHT / 2;
        let angle = collidePoint * (Math.PI / 4);
        let speed = Math.sqrt(ballVX * ballVX + ballVY * ballVY);
        ballVX = -speed * Math.cos(angle);
        ballVY = speed * Math.sin(angle);
        ballX = AI_X - BALL_SIZE - 1;
        accelerateBall();
    }

    // Left/right wall (score & reset)
    if (ballX < 0) {
        aiScore += 1;
        updateScoreDisplay();
        updateHighScores();
        resetBall();
    }
    if (ballX + BALL_SIZE > gameWidth) {
        playerScore += 1;
        updateScoreDisplay();
        updateHighScores();
        resetBall();
    }
}
function accelerateBall() {
    let velocity = Math.sqrt(ballVX * ballVX + ballVY * ballVY);
    velocity *= BALL_SPEEDUP_FACTOR;
    let angle = Math.atan2(ballVY, ballVX);
    ballVX = velocity * Math.cos(angle);
    ballVY = velocity * Math.sin(angle);
}
function resetBall() {
    ballX = gameWidth / 2 - BALL_SIZE / 2;
    ballY = gameHeight / 2 - BALL_SIZE / 2;
    let angle = (Math.random() - 0.5) * Math.PI / 3; // -30deg to 30deg
    let dir = (Math.random() > 0.5) ? 1 : -1;
    ballSpeed = BALL_INITIAL_SPEED * (gameWidth/800);
    ballVX = dir * ballSpeed * Math.cos(angle);
    ballVY = ballSpeed * Math.sin(angle);
}
function updateBall() {
    ballX += ballVX;
    ballY += ballVY;
}
function togglePause() {
    paused = !paused;
    pauseBtn.textContent = paused ? "▶ Resume" : "⏸ Pause";
    if (!paused) {
        gameLoop();
    } else {
        draw();
        if (animationId) cancelAnimationFrame(animationId);
    }
}
function restartGame() {
    playerScore = 0;
    aiScore = 0;
    updateScoreDisplay();
    updateHighScores();
    resetBall();
    paused = false;
    pauseBtn.textContent = "⏸ Pause";
    gameLoop();
}
function gameLoop() {
    if (paused) return;
    updateBall();
    updateAI();
    checkCollisions();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// INIT
function startGame() {
    fitGameToScreen();
    renderHighScores();
    updateScoreDisplay();
    resetBall();
    draw();
    gameLoop();
}
window.addEventListener("load", startGame);