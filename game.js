import { InputHandler } from './modules/InputHandler.js';
import { Player } from './modules/Player.js';
import { Enemy } from './modules/Enemy.js';
import { GameMap } from './modules/Map.js';
import { Assets } from './modules/Assets.js';
import { Camera } from './modules/Camera.js';
import { WaveManager } from './modules/WaveManager.js';
import { Persistence } from './modules/Persistence.js';
import { Projectile } from './modules/Projectile.js';
import { Explosion } from './modules/Explosion.js';
import { getWorldById, WORLDS } from './modules/WorldConfig.js';
import { GachaInterface } from './modules/GachaInterface.js';
import { FREE_CRATE_REWARDS, ITEMS } from './modules/Items.js';
import { CharacterScreen } from './modules/CharacterScreen.js';
import { UIManager } from './modules/UIManager.js';
import { StoreUpgradeTree } from './modules/StoreUpgradeTree.js';
import { StoreUI } from './modules/StoreUI.js';

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
let explosions = [];
let camera;
let gameMap;
let waveManager;

// Initialize UI Manager
const uiManager = new UIManager({
    startGame: startGame // Pass startGame for callbacks
});

// Initialize Sub-Screens
// Pass bound showScreen from uiManager
const gachaInterface = new GachaInterface(uiManager.showScreen.bind(uiManager));
const characterScreen = new CharacterScreen(uiManager.showScreen.bind(uiManager));
const storeUI = new StoreUI(uiManager.showScreen.bind(uiManager), gachaInterface);

// Input Handling for Game Over and Pause
window.addEventListener('keydown', (e) => {
    if (STATE.current === 'GAMEOVER' && e.key === 'Enter') {
        if (!gachaInterface.isAnimating) {
            returnToMenu();
        }
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
        
        // Update Time & HUD
        STATE.time += dt;
        uiManager.updateHUD(STATE, player, waveManager);

        // Wave Manager
        if (waveManager) {
            waveManager.update(dt);
        }

        if (player) {
            if (isNaN(player.x) || isNaN(player.y)) {
                console.error("Player position became NaN! Resetting to 0,0");
                player.x = 0;
                player.y = 0;
            }

            player.update(dt, input, gameMap, enemies, projectiles);
            camera.follow(player);
            gameMap.update(player);
        }

        // Update Enemies
        enemies.forEach(enemy => {
            enemy.update(dt, player, gameMap, { spawnEnemyProjectile, waveManager, enemies });

            // Collision: Player vs Enemy
            if (!enemy.isJumping && checkCollision(player, enemy)) {
                const damageReduction = enemy.slowTimer > 0 ? 0.7 : 1.0;
                player.takeDamage(enemy.damage * damageReduction);

                if (player.thornsDamage > 0) {
                    enemy.hp -= player.thornsDamage * dt;
                }
            }
        });

        // Update Projectiles
        projectiles.forEach(p => {
            p.update(dt);

            if (p.isEnemy) {
                if (checkCollision(p, player)) {
                    player.takeDamage(p.damage);
                    p.markedForDeletion = true;
                }
                if (gameMap.checkCollision({ x: p.x, y: p.y, size: 4 })) {
                    p.markedForDeletion = true;
                }
            } else {
                enemies.forEach(enemy => {
                    if (!enemy.isJumping && checkCollision(p, enemy)) {
                        enemy.hp -= p.damage;

                        if (p.isFrost) enemy.applySlow(2.0);
                        if (p.isExplosive) {
                            explosions.push(new Explosion(p.x, p.y));
                            enemies.forEach(nearby => {
                                const dist = Math.hypot(nearby.x - p.x, nearby.y - p.y);
                                if (dist < 150) nearby.hp -= p.damage * 0.8;
                            });
                        }

                        p.markedForDeletion = true;

                        if (enemy.hp <= 0) {
                            player.onKill();
                        }
                    }
                });
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

        // Remove dead entities
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            if (e.hp <= 0) {
                const baseGold = e.xpValue || 1;
                const goldAmount = Math.floor(baseGold * (STATE.goldMultiplier || 1.0));

                STATE.gold += goldAmount;
                Persistence.addGold(goldAmount);

                // SPLITTER: Spawn 2 smaller enemies on death
                if (e.type === 'SPLITTER' && e.canSplit) {
                    for (let j = 0; j < 2; j++) {
                        const angle = Math.random() * Math.PI * 2;
                        const dist = 40 + Math.random() * 20;
                        const spawnX = e.x + Math.cos(angle) * dist;
                        const spawnY = e.y + Math.sin(angle) * dist;

                        if (!gameMap.checkCollision({ x: spawnX, y: spawnY, size: 10 })) {
                            const miniEnemy = new Enemy(spawnX, spawnY, 'SWARM');
                            miniEnemy.hp = Math.floor(e.maxHp * 0.3);
                            miniEnemy.maxHp = miniEnemy.hp;
                            miniEnemy.damage = Math.floor(e.damage * 0.5);
                            miniEnemy.xpValue = Math.floor(e.xpValue * 0.2);
                            enemies.push(miniEnemy);
                        }
                    }
                }

                // KILL EFFECT
                const data = Persistence.getData();
                const killEffect = data.loadout ? data.loadout.killEffect : null;
                explosions.push(new Explosion(e.x, e.y, 50, '#fff', killEffect || 'default'));

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
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (STATE.current === 'PLAYING' || STATE.current === 'PAUSED' || STATE.current === 'SHOP') {
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        drawInfiniteFloor();

        const world = STATE.currentWorld || getWorldById('tech');
        if (gameMap) gameMap.draw(ctx, camera, world);

        projectiles.forEach(p => p.draw(ctx));
        explosions.forEach(ex => ex.draw(ctx));
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

    ctx.fillStyle = world.colors.bg;
    ctx.fillRect(camera.x, camera.y, camera.width, camera.height);

    for (let c = startCol; c <= endCol; c++) {
        for (let r = startRow; r <= endRow; r++) {
            const x = c * tileSize;
            const y = r * tileSize;

            if (Assets.loaded) {
                Assets.draw(ctx, Assets.FLOOR, x + 16, y + 16, 32, 32);
                ctx.fillStyle = world.colors.floor;
                ctx.globalCompositeOperation = 'multiply';
                ctx.fillRect(x, y, 32, 32);
                ctx.globalCompositeOperation = 'source-over';
            } else {
                ctx.fillStyle = world.colors.floor;
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.strokeStyle = world.colors.grid;
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, tileSize, tileSize);
            }
        }
    }
}

function initGame() {
    const lastUser = localStorage.getItem('last_username');
    if (lastUser) {
        document.getElementById('username-input').value = lastUser;
    }
    uiManager.showScreen('username');
}

// --- Event Bindings for UI Manager ---
// Note: Some global events are handled by UIManager constructor, but we need to bind specific actions
// that rely on local game state or functions like startGame/openShop.

// Confirm Username
document.getElementById('confirm-username-btn').onclick = async () => {
    const input = document.getElementById('username-input');
    const name = input.value.trim();
    if (!name) {
        alert("Please enter a username!");
        return;
    }
    await Persistence.init(name);
    localStorage.setItem('last_username', name);
    uiManager.showScreen('menu');
    uiManager.updateMainMenu();
};

// Main Menu Buttons
document.getElementById('start-game-btn').onclick = () => {
    uiManager.openWorldSelect((worldId) => startGame(worldId));
};

document.getElementById('store-btn').onclick = () => {
    uiManager.showScreen('store');
    storeUI.open('rank');
};

document.getElementById('character-btn').onclick = () => {
    characterScreen.open();
};

document.getElementById('leaderboard-btn').onclick = () => {
    uiManager.showScreen('leaderboard');
    uiManager.updateLeaderboard();
};

// Pause Buttons
document.getElementById('resume-btn').onclick = resumeGame;
document.getElementById('quit-btn').onclick = quitGame;
document.getElementById('restart-btn').onclick = returnToMenu;


function startGame(worldId) {
    console.log(`Starting game in world: ${worldId}`);
    try {
        uiManager.showScreen('hud');
        
        // Disable upgrade auto-select
        const autoSelectCheckbox = document.getElementById('auto-select-checkbox');
        if (autoSelectCheckbox) {
            autoSelectCheckbox.checked = false;
            localStorage.removeItem('autoSelectUpgrade');
        }

        STATE.currentWorld = getWorldById(worldId || 'tech');
        STATE.wave = 1;
        STATE.gold = 0;
        STATE.time = 0;
        STATE.goldMultiplier = 1.0;
        uiManager.updateHUD(STATE, null, null);

        camera = new Camera(CONFIG.width, CONFIG.height);
        gameMap = new GameMap();
        player = new Player(0, 0);

        // Apply Loadout (Skins/Effects/Gems)
        const data = Persistence.getData();
        if (data.loadout) {
            // Apply Gems
            if (data.loadout.statGems) {
                data.loadout.statGems.forEach(gemUid => {
                    if (gemUid) {
                        const itemInstance = Persistence.getItemByUid(gemUid);
                        if (itemInstance && itemInstance.stats) {
                            if (itemInstance.stats.damage) player.damage *= (1 + itemInstance.stats.damage / 100);
                            if (itemInstance.stats.speed) player.speed *= (1 + itemInstance.stats.speed / 100);
                            if (itemInstance.stats.maxHp) player.maxHp += itemInstance.stats.maxHp;
                            if (itemInstance.stats.critChance) player.critChance = (player.critChance || 0) + itemInstance.stats.critChance;
                        }
                    }
                });
            }
        }

        player.updateFireRate();
        player.hp = player.maxHp;

        enemies = [];
        projectiles = [];
        explosions = [];

        uiManager.updateHUD(STATE, player, null);

        const gameInterface = {
            player,
            enemies,
            gameMap,
            onWaveComplete: (result) => {
                if (result && result.success) {
                    // Bonus Gold for Challenge
                    const bonus = 50;
                    STATE.gold += bonus;
                    Persistence.addGold(bonus);
                    console.log(`Challenge Bonus: +${bonus} Gold`);
                }
                openShop(result);
            },
            onWorldClear: () => {
                victory();
            }
        };
        waveManager = new WaveManager(gameInterface);
        waveManager.setWorld(STATE.currentWorld);
        waveManager.startWave();
        uiManager.showWaveStartOverlay(STATE.wave, waveManager.currentModifierName, waveManager.currentChallenge);

        STATE.current = 'PLAYING';
        console.log('Game started successfully');
    } catch (e) {
        console.error('Error starting game:', e);
        alert('Failed to start game. Check console for details.');
    }
}

function openShop(lastWaveResult) {
    STATE.current = 'SHOP';
    uiManager.openIngameShop(player, () => {
        closeShop();
    }, lastWaveResult);
}

function closeShop() {
    uiManager.showScreen('hud');
    STATE.current = 'PLAYING';
    STATE.wave++;
    waveManager.wave++;
    waveManager.startWave();
    uiManager.showWaveStartOverlay(STATE.wave, waveManager.currentModifierName, waveManager.currentChallenge);
}

function pauseGame() {
    STATE.current = 'PAUSED';
    uiManager.showScreen('pause');
}

function resumeGame() {
    STATE.current = 'PLAYING';
    uiManager.showScreen('hud');
    // Note: hud might hide pause, but checking UI manager layers logic
    // uiManager showScreen hides others. We just want to hide pause and show HUD.
}

function quitGame() {
    gameOver();
}

function checkCrateReward(wave) {
    let earnedCrate = null;
    const waveReward = FREE_CRATE_REWARDS.WAVES.find(w => w.wave === wave);
    if (waveReward) {
        if (Math.random() < waveReward.chance) {
            earnedCrate = waveReward.crate;
        }
    }
    return earnedCrate;
}

function gameOver() {
    STATE.current = 'GAMEOVER';

    // Save Progress with Run Dividend bonus
    const runGoldBonus = StoreUpgradeTree.getRunGoldBonus();
    const bonusGold = Math.floor(STATE.gold * runGoldBonus);
    const totalGold = STATE.gold + bonusGold;

    Persistence.addGold(totalGold);
    Persistence.addHighScore(STATE.wave, STATE.score);

    if (bonusGold > 0) {
        console.log(`Run Dividend: +${bonusGold} bonus gold (${(runGoldBonus * 100).toFixed(0)}%)`);
    }

    // Award Shop Tokens based on wave reached
    const tokensEarned = Math.floor(STATE.wave * 2);
    Persistence.addShopTokens(tokensEarned);
    console.log(`Run complete! Wave ${STATE.wave}: +${tokensEarned} Shop Tokens`);

    uiManager.showGameOver(STATE, false, gachaInterface);

    // Crate Logic
    const earnedCrate = checkCrateReward(STATE.wave);
    if (earnedCrate) {
        setTimeout(() => {
            alert(`You found a ${earnedCrate.replace('_', ' ')}!`);
            gachaInterface.openCrateUI(earnedCrate, () => {});
        }, 1000);
    }
}

function victory() {
    STATE.current = 'GAMEOVER';

    // Save Progress with Run Dividend bonus
    const runGoldBonus = StoreUpgradeTree.getRunGoldBonus();
    const bonusGold = Math.floor(STATE.gold * runGoldBonus);
    const totalGold = STATE.gold + bonusGold;

    Persistence.addGold(totalGold);
    Persistence.addHighScore(STATE.wave, STATE.score);

    if (bonusGold > 0) {
        console.log(`Run Dividend: +${bonusGold} bonus gold (${(runGoldBonus * 100).toFixed(0)}%)`);
    }

    // Award Shop Tokens based on wave reached
    const tokensEarned = Math.floor(STATE.wave * 2);
    Persistence.addShopTokens(tokensEarned);
    console.log(`Victory! Wave ${STATE.wave}: +${tokensEarned} Shop Tokens`);

    // Unlock next world
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

    uiManager.showGameOver(STATE, true, gachaInterface);

    const earnedCrate = checkCrateReward(STATE.wave);
    if (earnedCrate) {
        setTimeout(() => {
            alert(`You found a ${earnedCrate.replace('_', ' ')}!`);
            gachaInterface.openCrateUI(earnedCrate, () => {});
        }, 1000);
    }
}

function returnToMenu() {
    STATE.current = 'MENU';
    uiManager.showScreen('menu');
    uiManager.updateMainMenu();
}

// Load Assets
Assets.load().then(() => {
    console.log('Assets loaded');
    uiManager.initHUDIcons(); // Initialize HUD icons with loaded sprites

    // Initialize other UI icons
    const usernameIcon = document.getElementById('username-id-icon');
    if (usernameIcon) usernameIcon.src = Assets.icons.icon_id_card;

    // Initialize menu icons
    const menuGoldIcon = document.getElementById('menu-gold-icon');
    const menuTokensIcon = document.getElementById('menu-tokens-icon');
    const menuHighscoreIcon = document.getElementById('menu-highscore-icon');
    const startBtnIcon = document.getElementById('start-btn-icon');
    const storeBtnIcon = document.getElementById('store-btn-icon');
    const characterBtnIcon = document.getElementById('character-btn-icon');
    const leaderboardBtnIcon = document.getElementById('leaderboard-btn-icon');

    if (menuGoldIcon) menuGoldIcon.src = Assets.icons.coin;
    if (menuTokensIcon) menuTokensIcon.src = Assets.icons.menu_token;
    if (menuHighscoreIcon) menuHighscoreIcon.src = Assets.icons.menu_highscore;
    if (startBtnIcon) startBtnIcon.src = Assets.icons.menu_start;
    if (storeBtnIcon) storeBtnIcon.src = Assets.icons.menu_store;
    if (characterBtnIcon) characterBtnIcon.src = Assets.icons.menu_character;
    if (leaderboardBtnIcon) leaderboardBtnIcon.src = Assets.icons.menu_leaderboard;

    // Initialize pause and game over icons
    const pauseIcon = document.getElementById('pause-icon');
    const gameoverIcon = document.getElementById('gameover-skull-icon');
    if (pauseIcon) pauseIcon.src = Assets.icons.icon_pause;
    if (gameoverIcon) gameoverIcon.src = Assets.icons.icon_skull;

    initGame();
});

requestAnimationFrame(gameLoop);