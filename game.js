import { InputHandler } from './modules/InputHandler.js';
import { Player } from './modules/Player.js';
import { Enemy } from './modules/Enemy.js';
import { GameMap } from './modules/Map.js';
import { Assets } from './modules/Assets.js';
import { Camera } from './modules/Camera.js';
import { WaveManager } from './modules/WaveManager.js';
import { Shop } from './modules/Shop.js';
import { Persistence } from './modules/Persistence.js';
import { Projectile } from './modules/Projectile.js';
import { Explosion } from './modules/Explosion.js';
import { PERM_UPGRADES } from './modules/upgrades.js'; 
import { WORLDS, getWorldById } from './modules/WorldConfig.js';

// Game Configuration
const CONFIG = {
    width: 1280,
    height: 720,
    targetFPS: 60
};

// Game State
const STATE = {
    current: 'MENU', // MENU, PLAYING, SHOP, GAMEOVER
    lastTime: 0,
    deltaTime: 0,
    wave: 1,
    gold: 0,
    score: 0,
    time: 0
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize handling
function resizeCanvas() {
    const container = document.getElementById('game-container');
    // We want to keep the internal resolution fixed at 1280x720 for pixel art consistency,
    // but scale it up via CSS.
    canvas.width = CONFIG.width;
    canvas.height = CONFIG.height;

    ctx.imageSmoothingEnabled = false;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Systems
const input = new InputHandler();
let player;
let enemies = [];
let projectiles = [];
let explosions = []; // Added explosions array
let camera;
let gameMap;
let waveManager;

// Input Handling for Game Over and Pause
window.addEventListener('keydown', (e) => {
    if (STATE.current === 'GAMEOVER' && e.key === 'Enter') {
        returnToMenu();
    }

    // ESC to pause/resume
    if (e.key === 'Escape') {
        if (STATE.current === 'PLAYING') {
            pauseGame();
        } else if (STATE.current === 'PAUSED') {
            resumeGame();
        }
    }
});

// Game Loop
function gameLoop(timestamp) {
    if (!STATE.lastTime) STATE.lastTime = timestamp;
    const deltaTime = (timestamp - STATE.lastTime) / 1000;
    STATE.lastTime = timestamp;
    STATE.deltaTime = deltaTime;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    if (STATE.current === 'PLAYING' || STATE.current === 'PAUSED') {
        // Don't update game logic when paused
        if (STATE.current === 'PAUSED') return;
        // Update Time
        STATE.time += dt;
        updateHUD();

        // Wave Manager
        if (waveManager) {
            waveManager.update(dt);
        }

        if (player) {
            // NaN Check for Safety
            if (isNaN(player.x) || isNaN(player.y)) {
                console.error("Player position became NaN! Resetting to 0,0");
                player.x = 0;
                player.y = 0;
            }

            player.update(dt, input, gameMap, enemies, projectiles);
            camera.follow(player);
            gameMap.update(player); // Update active chunks
        }

        // Update Enemies
        enemies.forEach(enemy => {
            enemy.update(dt, player, gameMap, { spawnEnemyProjectile });

            // Collision: Player vs Enemy (Contact Damage)
            if (!enemy.isJumping && checkCollision(player, enemy)) {
                // Frost Shots: Slowed enemies deal -30% damage
                const damageReduction = enemy.slowTimer > 0 ? 0.7 : 1.0;
                player.takeDamage(enemy.damage * dt * damageReduction);

                // Thorns Logic
                if (player.thornsDamage > 0) {
                    enemy.hp -= player.thornsDamage * dt;
                }
            }
        });

        // Update Projectiles
        projectiles.forEach(p => {
            p.update(dt);

            if (p.isEnemy) {
                // Enemy Bullet vs Player
                if (checkCollision(p, player)) {
                    player.takeDamage(p.damage);
                    p.markedForDeletion = true;
                }
                // Enemy Bullet vs Wall
                if (gameMap.checkCollision({ x: p.x, y: p.y, size: 4 })) {
                    p.markedForDeletion = true;
                }
            } else {
                // Player Bullet vs Enemy
                enemies.forEach(enemy => {
                    if (!enemy.isJumping && checkCollision(p, enemy)) {
                        enemy.hp -= p.damage;

                        // Effects
                        if (p.isFrost) enemy.applySlow(2.0);
                        if (p.isExplosive) {
                            // Visual Explosion
                            explosions.push(new Explosion(p.x, p.y));

                            // AoE Damage (buffed: 150px radius, 80% damage)
                            enemies.forEach(nearby => {
                                const dist = Math.hypot(nearby.x - p.x, nearby.y - p.y);
                                if (dist < 150) nearby.hp -= p.damage * 0.8;
                            });
                        }

                        p.markedForDeletion = true;

                        // Check Kill for Lifesteal (optimization: check here if it kills)
                        if (enemy.hp <= 0) {
                            player.onKill();
                        }
                    }
                });
                // Player Bullet vs Wall
                const wall = gameMap.checkCollision({ x: p.x, y: p.y, size: 4 });
                if (wall) {
                    if (!p.bounce(wall)) {
                        p.markedForDeletion = true;
                    }
                }
            }
        });

        // Update Explosions
        explosions.forEach(ex => ex.update(dt));
        explosions = explosions.filter(ex => !ex.markedForDeletion);

        // Remove dead entities (Iterate backwards to safe splice)
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            if (e.hp <= 0) {
                const baseGold = e.xpValue || 1;
                const goldAmount = Math.floor(baseGold * (STATE.goldMultiplier || 1.0));

                STATE.gold += goldAmount; // Update current run gold
                Persistence.addGold(goldAmount); // Save to persistence

                // SPLITTER: Spawn 2 smaller enemies on death
                if (e.type === 'SPLITTER' && e.canSplit) {
                    for (let j = 0; j < 2; j++) {
                        const angle = Math.random() * Math.PI * 2;
                        const dist = 40 + Math.random() * 20;
                        const spawnX = e.x + Math.cos(angle) * dist;
                        const spawnY = e.y + Math.sin(angle) * dist;

                        if (!gameMap.checkCollision({ x: spawnX, y: spawnY, size: 10 })) {
                            const miniEnemy = new Enemy(spawnX, spawnY, 'SWARM');
                            // Mini enemies have half HP/damage of the parent
                            miniEnemy.hp = Math.floor(e.maxHp * 0.3);
                            miniEnemy.maxHp = miniEnemy.hp;
                            miniEnemy.damage = Math.floor(e.damage * 0.5);
                            miniEnemy.xpValue = Math.floor(e.xpValue * 0.2);
                            enemies.push(miniEnemy);
                        }
                    }
                }

                enemies.splice(i, 1);
            }
        }

        projectiles = projectiles.filter(p => !p.markedForDeletion);

        if (player.hp <= 0) {
            gameOver();
        }
    }
}

function checkCollision(a, b) {
    return a.collidesWith(b);
}

function spawnEnemyProjectile(x, y, targetX, targetY, damage) {
    const proj = new Projectile(x, y, targetX, targetY, damage, false, false, true);
    projectiles.push(proj);
}



function draw() {
    // Clear Screen
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (STATE.current === 'PLAYING' || STATE.current === 'PAUSED') {
        ctx.save();
        // Apply Camera Transform
        ctx.translate(-camera.x, -camera.y);

        drawInfiniteFloor();
        
        const world = STATE.currentWorld || getWorldById('tech');
        if (gameMap) gameMap.draw(ctx, camera, world);

        // Draw Entities
        projectiles.forEach(p => p.draw(ctx));
        explosions.forEach(ex => ex.draw(ctx)); // Draw Explosions
        enemies.forEach(e => e.draw(ctx));
        if (player) player.draw(ctx);

        ctx.restore();
    }
}

function drawInfiniteFloor() {
    const tileSize = 32;
    const startCol = Math.floor(camera.x / tileSize);
    const endCol = startCol + (camera.width / tileSize) + 1;
    const startRow = Math.floor(camera.y / tileSize);
    const endRow = startRow + (camera.height / tileSize) + 1;

    const world = STATE.currentWorld || getWorldById('tech');

    // Fill Background
    ctx.fillStyle = world.colors.bg;
    ctx.fillRect(camera.x, camera.y, camera.width, camera.height);

    for (let c = startCol; c <= endCol; c++) {
        for (let r = startRow; r <= endRow; r++) {
            const x = c * tileSize;
            const y = r * tileSize;

            if (Assets.loaded) {
                // Draw Base Floor
                Assets.draw(ctx, Assets.FLOOR, x + 16, y + 16, 32, 32);
                
                // Apply Tint
                ctx.fillStyle = world.colors.floor;
                ctx.globalCompositeOperation = 'multiply';
                ctx.fillRect(x, y, 32, 32);
                ctx.globalCompositeOperation = 'source-over'; // Reset
            } else {
                // Fallback Grid
                ctx.fillStyle = world.colors.floor;
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.strokeStyle = world.colors.grid;
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, tileSize, tileSize);
            }
        }
    }
}

// UI Management
const uiLayers = {
    username: document.getElementById('username-layer'),
    menu: document.getElementById('menu-layer'),
    armory: document.getElementById('armory-layer'),
    leaderboard: document.getElementById('leaderboard-layer'),
    shop: document.getElementById('shop-layer'),
    gameover: document.getElementById('gameover-layer'),
    hud: document.getElementById('ui-layer'),
    worldSelect: document.getElementById('world-select-layer'),
    pause: document.getElementById('pause-layer')
};

// Navigation Functions
function showScreen(screenName) {
    Object.values(uiLayers).forEach(layer => {
        if (layer) {
            layer.classList.add('hidden');
            layer.classList.remove('active');
        }
    });

    const target = uiLayers[screenName];
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
}

function initGame() {
    // On load, we don't know the username yet, so we show the username screen
    // unless we want to cache the last username in localStorage for convenience.
    // For now, let's just ask every time or check localStorage for a hint.
    const lastUser = localStorage.getItem('last_username');
    if (lastUser) {
        document.getElementById('username-input').value = lastUser;
    }
    showScreen('username');
}

// Event Listeners
document.getElementById('confirm-username-btn').onclick = async () => {
    const input = document.getElementById('username-input');
    const name = input.value.trim();

    if (!name) {
        alert("Please enter a username!");
        return;
    }

    // Initialize Persistence with the username (loads from server)
    await Persistence.init(name);
    localStorage.setItem('last_username', name); // Remember for next time

    showScreen('menu');
    updateMainMenu();
};

// Update Start Game Listener
document.getElementById('start-game-btn').onclick = openWorldSelect;
document.getElementById('armory-btn').onclick = () => {
    showScreen('armory');
    updateArmory();
};
document.getElementById('leaderboard-btn').onclick = () => {
    showScreen('leaderboard');
    updateLeaderboard();
};
document.getElementById('armory-back-btn').onclick = () => showScreen('menu');
document.getElementById('leaderboard-back-btn').onclick = () => showScreen('menu');
document.getElementById('world-back-btn').onclick = () => showScreen('menu');

// Pause menu buttons
document.getElementById('resume-btn').onclick = resumeGame;
document.getElementById('quit-btn').onclick = quitGame;

// Remove Export/Import buttons logic as we are using server sync now
// (Optional: keep them if user wants to manually backup, but user asked for auto sync)
if (document.getElementById('export-btn')) {
    document.getElementById('export-btn').remove();
}
if (document.getElementById('import-btn')) {
    document.getElementById('import-btn').remove();
}



// Update UI Functions
function updateMainMenu() {
    const data = Persistence.getData();
    document.getElementById('menu-gold-display').innerText = data.gold;

    // For leaderboard, we might want to fetch the global leaderboard from server
    // But currently Persistence.getData() only returns the current user's data + their high scores.
    // To show a global leaderboard, we'd need a new API endpoint.
    // For now, let's show the user's personal best.
    const topScore = data.highScores[0] ? data.highScores[0].wave : 0;
    document.getElementById('menu-highscore-display').innerText = topScore;
}

// New function for World Select
function openWorldSelect() {
    showScreen('worldSelect');
    const container = document.getElementById('world-cards');
    container.innerHTML = '';
    
    const data = Persistence.getData();
    const unlocked = data.unlockedWorlds || ['tech'];

    WORLDS.forEach(world => {
        const isLocked = !unlocked.includes(world.id);
        const div = document.createElement('div');
        div.className = `world-card ${isLocked ? 'locked' : ''}`;

        const isCompleted = unlocked.length > WORLDS.findIndex(w => w.id === world.id) + 1;

        const previewImg = Assets.worldPreviews ? Assets.worldPreviews[world.id] : '';

        div.innerHTML = `
            ${previewImg ? `<img src="${previewImg}" class="world-preview" alt="${world.name}">` : ''}
            <h3>${world.name}</h3>
            <p>${world.waves} Waves</p>
            <div class="world-status ${isLocked ? '' : 'active'}">
                ${isLocked ? 'LOCKED' : (isCompleted ? 'CLEARED' : 'AVAILABLE')}
            </div>
        `;

        if (!isLocked) {
            div.onclick = () => startGame(world.id);
        }

        container.appendChild(div);
    });
}

// Global function for HTML buttons
let currentFilter = 'OFFENSE';
window.filterArmory = (category) => {
    currentFilter = category;
    updateArmory();
};

function calculatePlayerStats() {
    const data = Persistence.getData();
    const u = data.upgrades;

    // Base stats
    let stats = {
        damage: 10,
        baseFireRate: 0.5,
        fireRateBonus: 0,
        fireRate: 0.5, // calculated
        maxHp: 100,
        regen: 0,
        speed: 200,
        goldMultiplier: 1.0
    };

    // Apply upgrades
    PERM_UPGRADES.forEach(up => {
        const level = u[up.id] || 0;
        if (level > 0) {
            const totalBonus = up.val * level;

            if (up.stat === 'damage') stats.damage += totalBonus;
            if (up.stat === 'maxHp') stats.maxHp += totalBonus;
            if (up.stat === 'speed') stats.speed += totalBonus;
            if (up.stat === 'regen') stats.regen += totalBonus;
            if (up.stat === 'gold') stats.goldMultiplier += totalBonus;
            if (up.stat === 'fireRate') {
                stats.fireRateBonus += totalBonus;
            }
        }
    });

    // Calculate effective fire rate
    stats.fireRate = stats.baseFireRate / (1 + stats.fireRateBonus);
    stats.fireRate = Math.max(0.05, stats.fireRate);

    return stats;
}

function drawCharacterPreview() {
    const canvas = document.getElementById('character-canvas');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 128, 128);

    // Draw player sprite scaled up
    if (Assets.loaded) {
        // Center the sprite
        Assets.draw(ctx, Assets.PLAYER, 64, 64, 96, 96);
    } else {
        // Fallback: simple colored square
        ctx.fillStyle = '#0f0';
        ctx.fillRect(40, 40, 48, 48);
    }
}

function updateArmory() {
    const data = Persistence.getData();
    document.getElementById('armory-gold-display').innerText = Math.floor(data.gold);

    // Calculate and display stats
    const stats = calculatePlayerStats();
    document.getElementById('stat-damage').innerText = Math.floor(stats.damage);
    document.getElementById('stat-firerate').innerText = (1 / stats.fireRate).toFixed(1) + '/s';
    document.getElementById('stat-hp').innerText = Math.floor(stats.maxHp);
    document.getElementById('stat-regen').innerText = stats.regen.toFixed(1) + '/s';
    document.getElementById('stat-speed').innerText = Math.floor(stats.speed);
    document.getElementById('stat-gold').innerText = '+' + Math.floor((stats.goldMultiplier - 1) * 100) + '%';

    // Draw character
    drawCharacterPreview();

    // Update Filter Buttons Active State
    const buttons = document.querySelectorAll('#armory-filter button');
    buttons.forEach(btn => {
        if (btn.textContent === currentFilter) {
            btn.classList.add('active-filter');
        } else {
            btn.classList.remove('active-filter');
        }
    });

    const container = document.getElementById('armory-upgrades');
    container.innerHTML = '';

    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    container.style.gap = '15px';
    container.style.padding = '10px';
    container.style.overflowY = 'auto';
    container.style.maxHeight = '500px';

    // Filter Upgrades
    const filtered = PERM_UPGRADES.filter(u => currentFilter === 'ALL' || u.category === currentFilter);

    filtered.forEach(up => {
        const level = data.upgrades[up.id] || 0;
        const cost = Math.floor(up.baseCost * Math.pow(up.scale, level));
        const canAfford = data.gold >= cost;

        const div = document.createElement('div');
        div.className = `armory-card ${up.rarity.toLowerCase()} ${canAfford ? '' : 'disabled'}`;

        div.innerHTML = `
            <div class="card-info">
                <div class="card-header">
                    <span class="card-title">${up.name}</span>
                    <span class="card-level">LVL ${level}</span>
                </div>
                <div class="card-desc">${up.desc}</div>
            </div>
            <div class="card-price">
                ${cost}
                <img src="${Assets.icons.coin}" class="coin-icon" alt="G">
            </div>
        `;

        if (canAfford) {
            div.onclick = () => {
                if (Persistence.buyUpgrade(up.id, cost)) {
                    updateArmory(); // Refresh UI
                    updateMainMenu(); // Sync gold
                }
            };
        }

        container.appendChild(div);
    });
}

function startGame(worldId) {
    showScreen('hud');

    // Set World
    STATE.currentWorld = getWorldById(worldId || 'tech');

    // Reset Game State
    STATE.wave = 1;
    STATE.gold = 0;
    STATE.time = 0;
    STATE.goldMultiplier = 1.0; 
    updateHUD();

    // Initialize Entities
    camera = new Camera(CONFIG.width, CONFIG.height);
    gameMap = new GameMap();
    player = new Player(0, 0); 

    // Apply Persistent Upgrades
    const data = Persistence.getData();
    const u = data.upgrades;

    PERM_UPGRADES.forEach(up => {
        const level = u[up.id] || 0;
        if (level > 0) {
            const totalBonus = up.val * level;

            if (up.stat === 'damage') player.damage += totalBonus;
            if (up.stat === 'maxHp') player.maxHp += totalBonus;
            if (up.stat === 'speed') player.speed += totalBonus;
            if (up.stat === 'regen') player.regenRate += totalBonus;
            if (up.stat === 'gold') STATE.goldMultiplier += totalBonus;
            if (up.stat === 'fireRate') {
                player.fireRateBonus += totalBonus;
            }
        }
    });

    // Update fire rate with all bonuses applied
    player.updateFireRate();

    player.hp = player.maxHp;

    enemies = [];
    projectiles = [];
    explosions = [];

    // Initialize in-game stats display
    updateInGameStats();

    const gameInterface = {
        player,
        enemies,
        gameMap,
        onWaveComplete: () => {
            openShop();
        },
        onWorldClear: () => {
            victory();
        }
    };
    waveManager = new WaveManager(gameInterface);
    // Set World Difficulty Offset
    waveManager.setWorld(STATE.currentWorld);

    waveManager.startWave();

    STATE.current = 'PLAYING';
}

function updateLeaderboard() {
    const data = Persistence.getData();
    const container = document.getElementById('leaderboard-list');
    container.innerHTML = '';

    if (data.highScores.length === 0) {
        container.innerHTML = `
            <div class="no-scores">
                <div class="no-scores-icon">🏆</div>
                <p>NO RUNS YET</p>
                <p class="no-scores-hint">COMPLETE A RUN TO APPEAR HERE</p>
            </div>
        `;
        return;
    }

    data.highScores.forEach((score, i) => {
        const row = document.createElement('div');
        row.className = `leaderboard-row rank-${i + 1}`;

        // Medal/rank display
        let rankDisplay = '';
        if (i === 0) {
            rankDisplay = '<span class="rank-medal gold">🥇</span>';
        } else if (i === 1) {
            rankDisplay = '<span class="rank-medal silver">🥈</span>';
        } else if (i === 2) {
            rankDisplay = '<span class="rank-medal bronze">🥉</span>';
        } else {
            rankDisplay = `<span class="rank-number">#${i + 1}</span>`;
        }

        // Format date
        const date = new Date(score.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        row.innerHTML = `
            <div class="lb-rank">${rankDisplay}</div>
            <div class="lb-player">${score.name}</div>
            <div class="lb-wave">
                <span class="lb-wave-label">WAVE</span>
                <span class="lb-wave-value">${score.wave}</span>
            </div>
            <div class="lb-date">${formattedDate}</div>
        `;
        container.appendChild(row);
    });
}

    function openShop() {
        STATE.current = 'SHOP';
        uiLayers.shop.classList.remove('hidden');
        uiLayers.shop.classList.add('active');

        const container = document.getElementById('upgrade-cards');
        container.innerHTML = ''; // Clear old cards

        const options = Shop.generateOptions();
        const cards = [];

        options.forEach(opt => {
            const card = document.createElement('div');
            card.className = `upgrade-card ${opt.rarity.toLowerCase()}`;
            const iconSrc = Assets.icons[opt.icon];

            card.innerHTML = `
            <img src="${iconSrc}" class="pixel-icon" alt="${opt.name}">
            <h3>${opt.name}</h3>
            <p>${opt.description}</p>
            <div class="rarity-badge">${opt.rarity}</div>
        `;
            card.onclick = () => {
                opt.apply(player);
                updateInGameStats(); // Update stats display immediately after upgrade
                closeShop();
            };
            container.appendChild(card);
            cards.push({ card, opt });
        });

        // Check if auto-select is enabled
        const autoSelectCheckbox = document.getElementById('auto-select-checkbox');
        if (autoSelectCheckbox && autoSelectCheckbox.checked) {
            // Auto-select a random upgrade after a short delay
            setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * cards.length);
                const selected = cards[randomIndex];

                // Visual feedback - highlight the selected card
                selected.card.style.transform = 'scale(1.1)';
                selected.card.style.boxShadow = '0 0 30px rgba(15, 255, 15, 0.8)';

                // Apply upgrade and close after brief delay
                setTimeout(() => {
                    selected.opt.apply(player);
                    updateInGameStats();
                    closeShop();
                }, 800); // Show selection for 0.8 seconds
            }, 300); // Small delay before auto-selecting
        }
    }

    function closeShop() {
        uiLayers.shop.classList.add('hidden');
        uiLayers.shop.classList.remove('active');
        STATE.current = 'PLAYING';

        STATE.wave++;
        waveManager.wave++;
        waveManager.startWave();
    }

    function pauseGame() {
        STATE.current = 'PAUSED';
        uiLayers.pause.classList.remove('hidden');
        uiLayers.pause.classList.add('active');
    }

    function resumeGame() {
        STATE.current = 'PLAYING';
        uiLayers.pause.classList.add('hidden');
        uiLayers.pause.classList.remove('active');
    }

    function quitGame() {
        // Close pause menu
        uiLayers.pause.classList.add('hidden');
        uiLayers.pause.classList.remove('active');

        // Trigger game over with current progress
        gameOver();
    }

    function gameOver() {
        STATE.current = 'GAMEOVER';
        uiLayers.gameover.classList.remove('hidden');
        uiLayers.gameover.classList.add('active');
        document.getElementById('final-wave').innerText = STATE.wave;
        document.getElementById('run-gold').innerText = STATE.gold;

        // Save Progress
        Persistence.addGold(STATE.gold);
        Persistence.addHighScore(STATE.wave, STATE.score);

        // Update Restart Button
        const btn = document.getElementById('restart-btn');
        btn.onclick = returnToMenu;
    }

    function victory() {
        STATE.current = 'GAMEOVER';
        uiLayers.gameover.classList.remove('hidden');
        uiLayers.gameover.classList.add('active');

        // Update the game over screen to show victory
        document.getElementById('final-wave').innerText = STATE.wave;
        document.getElementById('run-gold').innerText = STATE.gold;

        // Save Progress
        Persistence.addGold(STATE.gold);
        Persistence.addHighScore(STATE.wave, STATE.score);

        // Unlock next world if applicable
        const currentWorldIndex = WORLDS.findIndex(w => w.id === STATE.currentWorld.id);
        if (currentWorldIndex >= 0 && currentWorldIndex < WORLDS.length - 1) {
            const nextWorld = WORLDS[currentWorldIndex + 1];
            const data = Persistence.getData();
            if (!data.unlockedWorlds) data.unlockedWorlds = ['tech'];
            if (!data.unlockedWorlds.includes(nextWorld.id)) {
                data.unlockedWorlds.push(nextWorld.id);
                Persistence.save();
            }
        }

        // Update Restart Button
        const btn = document.getElementById('restart-btn');
        btn.onclick = returnToMenu;
    }

    function returnToMenu() {
        STATE.current = 'MENU';
        uiLayers.gameover.classList.add('hidden');
        uiLayers.gameover.classList.remove('active');
        uiLayers.menu.classList.remove('hidden');
        uiLayers.menu.classList.add('active');
        updateMainMenu();
    }

    function updateInGameStats() {
        if (!player) return;

        document.getElementById('hud-damage').innerText = Math.floor(player.damage);
        document.getElementById('hud-firerate').innerText = (1 / player.fireRate).toFixed(1) + '/s';
        document.getElementById('hud-maxhp').innerText = Math.floor(player.maxHp);
        document.getElementById('hud-regen').innerText = player.regenRate.toFixed(1) + '/s';
        document.getElementById('hud-speed').innerText = Math.floor(player.speed);
        document.getElementById('hud-range').innerText = Math.floor(player.range);
    }

    function updateHUD() {
        document.getElementById('wave-display').innerText = STATE.wave;
        document.getElementById('gold-display').innerText = STATE.gold;

        // Format Time MM:SS
        const minutes = Math.floor(STATE.time / 60);
        const seconds = Math.floor(STATE.time % 60);
        document.getElementById('time-display').innerText =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (player) {
            document.getElementById('hp-display').innerText = `${Math.ceil(player.hp)}/${player.maxHp}`;
        }

        // Show Wave Progress
        if (waveManager && waveManager.waveActive) {
            const remaining = waveManager.getRemainingEnemies();
            // Reuse the time display for now or add a new element.
            // Let's append it to the wave display for clarity.
            document.getElementById('wave-display').innerText = `${STATE.wave} (Left: ${remaining})`;
        }

        // Update in-game stats display
        updateInGameStats();
    }

        // Load Assets immediately

        Assets.load().then(() => {

            console.log('Assets loaded');

            initGame();

        });

    // Auto-select checkbox setup
    const autoSelectCheckbox = document.getElementById('auto-select-checkbox');
    if (autoSelectCheckbox) {
        // Load saved preference
        const savedAutoSelect = localStorage.getItem('autoSelectUpgrade');
        if (savedAutoSelect === 'true') {
            autoSelectCheckbox.checked = true;
        }

        // Save preference when changed
        autoSelectCheckbox.addEventListener('change', (e) => {
            localStorage.setItem('autoSelectUpgrade', e.target.checked);
        });
    }

    // Start the loop
    requestAnimationFrame(gameLoop);
