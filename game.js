// ============================================================
// Neon Virus Purge — game.js
// Credit to Param Sangani | Inspired by Space Invaders
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = 800;
const HEIGHT = 600;
canvas.width = WIDTH;
canvas.height = HEIGHT;

const COLORS = {
    bg: '#0a0a1a',
    cyan: '#00f3ff',
    magenta: '#ff00ff',
    lime: '#39ff14',
    orange: '#ff8c00',
    red: '#ff0044',
    white: '#ffffff'
};

// --- UI Elements ---
const startScreen     = document.getElementById('start-screen');
const gameOverScreen  = document.getElementById('game-over-screen');
const hud             = document.getElementById('hud');
const hudName         = document.getElementById('hud-name');
const hudScore        = document.getElementById('hud-score');
const gameOverTitle   = document.getElementById('game-over-title');
const gameOverSub     = document.getElementById('game-over-subtitle');
const finalScoreEl    = document.getElementById('final-score');
const playerNameInput = document.getElementById('player-name');

// --- State ---
let gameState = 'MENU'; // MENU | PLAYING | GAME_OVER
let score = 0;
let currentPlayer = 'AGENT_X';
let animationId;
let particles = [];

// --- Input ---
const keys = { ArrowLeft: false, ArrowRight: false, Space: false };

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft')  keys.ArrowLeft  = true;
    if (e.code === 'ArrowRight') keys.ArrowRight = true;
    if (e.code === 'Space') {
        keys.Space = true;
        e.preventDefault(); // prevent page scroll
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft')  keys.ArrowLeft  = false;
    if (e.code === 'ArrowRight') keys.ArrowRight = false;
    if (e.code === 'Space')      keys.Space      = false;
});

// Allow Enter to start
playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('start-btn').click();
});

// ============================================================
// Entities
// ============================================================

class Player {
    constructor() {
        this.width  = 30;
        this.height = 20;
        this.x = WIDTH / 2;
        this.y = HEIGHT - 50;
        this.speed = 320; // px/sec
        this.color = COLORS.cyan;
        this.lastShot = 0;
        this.shotCooldown = 400; // ms — snappier shooting
    }

    update(dt) {
        if (keys.ArrowLeft)  this.x -= this.speed * dt;
        if (keys.ArrowRight) this.x += this.speed * dt;
        // Clamp
        this.x = Math.max(20, Math.min(WIDTH - 20, this.x));

        // Auto-fire while space held
        if (keys.Space) this.shoot();
    }

    draw() {
        const x = this.x, y = this.y;
        ctx.save();
        ctx.translate(x, y);

        // Engine glow
        ctx.shadowBlur = 18;
        ctx.shadowColor = this.color;

        // Main body — sharp arrow
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(14, 14);
        ctx.lineTo(5, 8);
        ctx.lineTo(-5, 8);
        ctx.lineTo(-14, 14);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();

        // Cockpit highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.ellipse(0, -4, 3, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot > this.shotCooldown) {
            lasers.push(new Laser(this.x, this.y - 18));
            this.lastShot = now;
        }
    }
}

class Laser {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width  = 4;
        this.height = 16;
        this.speed  = 520;
        this.color  = COLORS.lime;
        this.active = true;
    }

    update(dt) {
        this.y -= this.speed * dt;
        if (this.y < -this.height) this.active = false;
    }

    draw() {
        ctx.save();
        ctx.shadowBlur  = 10;
        ctx.shadowColor = this.color;
        // Core beam
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
        // Bright centre line
        ctx.fillStyle = COLORS.white;
        ctx.fillRect(this.x - 1, this.y + 2, 2, this.height - 4);
        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, row) {
        this.x = x;
        this.y = y;
        this.width  = 26;
        this.height = 26;
        this.active = true;
        this.row    = row;
        // Colour varies by row for visual depth
        this.color = row < 2 ? COLORS.magenta : (row < 3 ? '#ff66ff' : '#cc00cc');
        this.tick   = Math.random() * Math.PI * 2; // phase offset for pulse
    }

    update(dt) {
        this.tick += dt * 3;
    }

    draw() {
        const x = this.x, y = this.y;
        const pulse = 0.7 + 0.3 * Math.sin(this.tick);

        ctx.save();
        ctx.translate(x, y);
        ctx.shadowBlur  = 12 * pulse;
        ctx.shadowColor = this.color;

        // Outer diamond
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(12, 0);
        ctx.lineTo(0, 12);
        ctx.lineTo(-12, 0);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = pulse;
        ctx.fill();

        // Inner square — white glowing core
        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 6;
        ctx.shadowColor = COLORS.white;
        ctx.fillStyle   = COLORS.white;
        ctx.fillRect(-3, -3, 6, 6);

        // Legs / antenna
        ctx.shadowBlur = 0;
        ctx.strokeStyle = this.color;
        ctx.lineWidth   = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(-14, -9); ctx.stroke();
        ctx.beginPath(); ctx.moveTo( 8, -4); ctx.lineTo( 14, -9); ctx.stroke();

        ctx.restore();
    }
}

class Firewall {
    constructor(x, y) {
        this.x      = x;
        this.y      = y;
        this.width  = 20;
        this.height = 20;
        this.color  = COLORS.orange;
        this.active = true;
        this.maxHp  = 3;
        this.hp     = 3;
    }

    draw() {
        const alpha = 0.3 + 0.7 * (this.hp / this.maxHp);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur  = 6;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;
        const hw = this.width / 2, hh = this.height / 2;
        ctx.fillRect(this.x - hw, this.y - hh, this.width, this.height);

        // Grid line
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth   = 1;
        ctx.strokeRect(this.x - hw, this.y - hh, this.width, this.height);

        // Crack overlay for damaged blocks
        if (this.hp < this.maxHp) {
            ctx.strokeStyle = 'rgba(0,0,0,0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x - 5, this.y - 5);
            ctx.lineTo(this.x + 4, this.y + 3);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// ============================================================
// Particle System
// ============================================================
class Particle {
    constructor(x, y, color) {
        this.x     = x;
        this.y     = y;
        this.vx    = (Math.random() - 0.5) * 150;
        this.vy    = (Math.random() - 0.5) * 150;
        this.alpha = 1;
        this.size  = Math.random() * 3 + 1;
        this.color = color;
        this.life  = 0.5 + Math.random() * 0.4;
        this.age   = 0;
    }

    update(dt) {
        this.x   += this.vx * dt;
        this.y   += this.vy * dt;
        this.age += dt;
        this.alpha = 1 - (this.age / this.life);
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle   = this.color;
        ctx.shadowBlur  = 4;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.restore();
    }

    isDead() { return this.age >= this.life; }
}

function spawnExplosion(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// ============================================================
// Globals
// ============================================================
let player;
let lasers   = [];
let enemies  = [];
let firewalls= [];

let enemyMoveTimer    = 0;
let currentEnemyInterval = 0.8;
let enemyDirection    = 1;
const ENEMY_STEP      = 18;
const ENEMY_DROP      = 28;

// Scanline offset for background effect
let scanlineY = 0;

// ============================================================
// Init
// ============================================================
function initGame() {
    player    = new Player();
    lasers    = [];
    enemies   = [];
    firewalls = [];
    particles = [];
    score     = 0;
    updateHUD();

    // Enemies — 4 rows × 10 cols
    const startX = 135, startY = 85;
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 10; col++) {
            enemies.push(new Enemy(startX + col * 55, startY + row * 44, row));
        }
    }

    // Firewalls — 3 bunkers
    const centers = [190, 400, 610];
    centers.forEach(cx => {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 5; col++) {
                if (row === 2 && (col === 0 || col === 4)) continue;
                firewalls.push(new Firewall(cx - 40 + col * 20, HEIGHT - 148 + row * 20));
            }
        }
    });

    currentEnemyInterval = 0.8;
    enemyDirection = 1;
    enemyMoveTimer = 0;
    gameState = 'PLAYING';
    lastTime  = performance.now();

    // Show/hide screens
    startScreen.classList.replace('active', 'hidden');
    gameOverScreen.classList.replace('active', 'hidden');
    hud.classList.remove('hidden');

    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
}

// ============================================================
// AABB Collision
// ============================================================
function overlaps(a, b) {
    return (
        Math.abs(a.x - b.x) < (a.width  + b.width)  / 2 &&
        Math.abs(a.y - b.y) < (a.height + b.height) / 2
    );
}

// ============================================================
// Main Loop
// ============================================================
let lastTime = 0;

function gameLoop(time = 0) {
    if (gameState !== 'PLAYING') return;
    const dt = Math.min((time - lastTime) / 1000, 0.05); // cap at 50ms
    lastTime = time;
    update(dt);
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// ============================================================
// Update
// ============================================================
function update(dt) {
    player.update(dt);

    // Lasers
    lasers.forEach(l => l.update(dt));
    lasers = lasers.filter(l => l.active);

    // Particles
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.isDead());

    // Enemy tick
    enemyMoveTimer += dt;
    if (enemyMoveTimer >= currentEnemyInterval) {
        enemyMoveTimer = 0;
        moveEnemies();
    }

    // Update enemy pulse animation
    enemies.forEach(e => { if (e.active) e.update(dt); });

    // Collision — lasers vs enemies
    lasers.forEach(laser => {
        if (!laser.active) return;
        for (const e of enemies) {
            if (e.active && overlaps(laser, e)) {
                e.active  = false;
                laser.active = false;
                score += 10;
                updateHUD();
                spawnExplosion(e.x, e.y, e.color, 14);

                const alive = enemies.filter(en => en.active).length;
                // Accelerate as enemies die — scale from 0.8 → 0.1
                currentEnemyInterval = Math.max(0.1, 0.8 * (alive / 40));
                if (alive === 0) { endGame(true); return; }
                break;
            }
        }

        if (!laser.active) return;

        // Lasers vs firewalls
        for (const fw of firewalls) {
            if (fw.active && overlaps(laser, fw)) {
                fw.hp -= 1;
                if (fw.hp <= 0) { fw.active = false; spawnExplosion(fw.x, fw.y, COLORS.orange, 8); }
                laser.active = false;
                break;
            }
        }
    });

    // Enemies vs firewalls
    enemies.forEach(e => {
        if (!e.active) return;
        firewalls.forEach(fw => {
            if (fw.active && overlaps(e, fw)) {
                fw.active = false;
            }
        });
    });
}

function moveEnemies() {
    const activeEnemies = enemies.filter(e => e.active);
    if (activeEnemies.length === 0) return;

    // Find true bounding box of living enemies
    let minX = Infinity, maxX = -Infinity;
    activeEnemies.forEach(e => {
        minX = Math.min(minX, e.x - e.width / 2);
        maxX = Math.max(maxX, e.x + e.width / 2);
    });

    const nextMinX = minX + ENEMY_STEP * enemyDirection;
    const nextMaxX = maxX + ENEMY_STEP * enemyDirection;

    if (nextMinX < 10 || nextMaxX > WIDTH - 10) {
        // Bounce + drop
        enemyDirection *= -1;
        activeEnemies.forEach(e => {
            e.y += ENEMY_DROP;
            if (e.y + e.height / 2 >= player.y - player.height / 2) {
                endGame(false);
            }
        });
    } else {
        activeEnemies.forEach(e => { e.x += ENEMY_STEP * enemyDirection; });
    }
}

// ============================================================
// Draw
// ============================================================
function drawBackground() {
    // Solid fill
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Subtle scanlines
    ctx.save();
    ctx.globalAlpha = 0.025;
    ctx.fillStyle = '#fff';
    for (let y = 0; y < HEIGHT; y += 4) {
        ctx.fillRect(0, y, WIDTH, 2);
    }
    ctx.restore();

    // Star field
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    // Static stars — deterministic positions
    const stars = [[40,80],[120,30],[200,150],[310,60],[450,100],[560,40],[670,130],[750,70],
                   [80,300],[170,250],[290,350],[420,280],[530,320],[640,260],[740,340],
                   [30,450],[160,500],[270,420],[380,480],[490,440],[600,510],[710,460],[790,500]];
    stars.forEach(([sx, sy]) => ctx.fillRect(sx, sy, 1, 1));
    ctx.restore();
}

function draw() {
    drawBackground();

    // Ground line
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT - 30);
    ctx.lineTo(WIDTH, HEIGHT - 30);
    ctx.stroke();
    ctx.restore();

    player.draw();
    lasers.forEach(l => l.draw());
    enemies.forEach(e => { if (e.active) e.draw(); });
    firewalls.forEach(fw => { if (fw.active) fw.draw(); });
    particles.forEach(p => p.draw());
}

// ============================================================
// HUD
// ============================================================
function updateHUD() {
    hudScore.textContent = score.toString().padStart(4, '0');
}

// ============================================================
// High Scores — localStorage
// ============================================================
const MAX_SCORES = 5;
const LS_KEY = 'neonVirusPurgeScores_v1';

function getHighScores() {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    } catch { return []; }
}

function saveHighScore(name, pts) {
    if (pts <= 0) return;
    const scores = getHighScores();
    scores.push({ name: name || 'GHOST', score: pts });
    scores.sort((a, b) => b.score - a.score);
    scores.splice(MAX_SCORES);
    localStorage.setItem(LS_KEY, JSON.stringify(scores));
}

function renderHighScores(elementId, highlightName = null, highlightScore = null) {
    const list   = document.getElementById(elementId);
    const scores = getHighScores();
    list.innerHTML = '';

    if (scores.length === 0) {
        list.innerHTML = `<li><span style="color:var(--text-muted);font-size:0.75rem">No records yet</span></li>`;
        return;
    }

    scores.forEach((s, idx) => {
        const isNew = highlightName && s.name === highlightName && s.score === highlightScore;
        const li = document.createElement('li');
        if (isNew) li.classList.add('hs-new');
        li.innerHTML = `
            <span><span class="hs-rank">${idx + 1}.</span> ${s.name}</span>
            <span class="${isNew ? '' : 'highlight'}">${String(s.score).padStart(4, '0')}</span>
        `;
        list.appendChild(li);
    });
}

// ============================================================
// End Game
// ============================================================
function endGame(win) {
    if (gameState !== 'PLAYING') return; // guard against double-call
    gameState = 'GAME_OVER';
    cancelAnimationFrame(animationId);

    hud.classList.add('hidden');

    saveHighScore(currentPlayer, score);

    gameOverTitle.textContent = win ? 'SYSTEM PURGED' : 'SYSTEM INFECTED';
    gameOverTitle.style.color = win ? COLORS.cyan : COLORS.red;
    gameOverTitle.setAttribute('data-text', gameOverTitle.textContent);
    gameOverTitle.style.textShadow = `0 0 10px ${win ? COLORS.cyan : COLORS.red}, 0 0 30px ${win ? COLORS.cyan : COLORS.red}`;

    gameOverSub.textContent = win
        ? 'All viruses eliminated. Core secure.'
        : 'The system has been compromised.';

    finalScoreEl.textContent = score.toString().padStart(4, '0');
    renderHighScores('game-over-high-scores', currentPlayer, score);

    gameOverScreen.classList.remove('hidden');
    requestAnimationFrame(() => gameOverScreen.classList.add('active'));
}

// ============================================================
// UI Bindings
// ============================================================
document.getElementById('start-btn').addEventListener('click', () => {
    const raw = playerNameInput.value.trim();
    currentPlayer = (raw || 'AGENT_X').toUpperCase().slice(0, 15);
    hudName.textContent = currentPlayer;
    initGame();
});

document.getElementById('restart-btn').addEventListener('click', () => {
    initGame();
});

document.getElementById('menu-btn').addEventListener('click', () => {
    gameOverScreen.classList.replace('active', 'hidden');
    startScreen.classList.remove('hidden');
    requestAnimationFrame(() => startScreen.classList.add('active'));
    renderHighScores('start-high-scores');
});

// ============================================================
// Boot
// ============================================================
renderHighScores('start-high-scores');

// Draw initial static frame so canvas isn't blank
ctx.fillStyle = COLORS.bg;
ctx.fillRect(0, 0, WIDTH, HEIGHT);
