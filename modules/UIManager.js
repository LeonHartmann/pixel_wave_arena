import { Assets } from './Assets.js';
import { Persistence } from './Persistence.js';
import { WORLDS } from './WorldConfig.js';
import { Shop } from './Shop.js';

export class UIManager {
    constructor(gameInstance) {
        this.game = gameInstance; 
        
        // Cache DOM Elements
        this.layers = {
            username: document.getElementById('username-layer'),
            menu: document.getElementById('menu-layer'),
            leaderboard: document.getElementById('leaderboard-layer'),
            shop: document.getElementById('shop-layer'), // In-game shop
            gameover: document.getElementById('gameover-layer'),
            hud: document.getElementById('ui-layer'),
            worldSelect: document.getElementById('world-select-layer'),
            pause: document.getElementById('pause-layer'),
            store: document.getElementById('store-layer'),
            character: document.getElementById('character-layer'),
            gacha: document.getElementById('gacha-layer'),
            reveal: document.getElementById('reveal-overlay')
        };

        this.hudElements = {
            wave: document.getElementById('wave-display'),
            time: document.getElementById('time-display'),
            gold: document.getElementById('gold-display'),
            hp: document.getElementById('hp-display'),
            waveInfo: document.getElementById('hud-wave-info'),
            modifier: document.getElementById('hud-modifier'),
            challenge: document.getElementById('hud-challenge'),
            stats: {
                dmg: document.getElementById('hud-damage'),
                rate: document.getElementById('hud-firerate'),
                hp: document.getElementById('hud-maxhp'),
                regen: document.getElementById('hud-regen'),
                speed: document.getElementById('hud-speed'),
                range: document.getElementById('hud-range'),
                crit: null // To be added
            }
        };

        this.hudIcons = {
            wave: document.getElementById('wave-icon'),
            time: document.getElementById('time-icon'),
            gold: document.getElementById('gold-icon'),
            hp: document.getElementById('hp-icon'),
            stats: {
                dmg: document.getElementById('damage-stat-icon'),
                rate: document.getElementById('firerate-stat-icon'),
                hp: document.getElementById('maxhp-stat-icon'),
                regen: document.getElementById('regen-stat-icon'),
                speed: document.getElementById('speed-stat-icon'),
                range: document.getElementById('range-stat-icon')
            }
        };

        this.menuElements = {
            gold: document.getElementById('menu-gold-display'),
            tokens: document.getElementById('menu-tokens-display'),
            highScore: document.getElementById('menu-highscore-display')
        };

        window.showScreen = this.showScreen.bind(this);
        this.initGlobalEvents();
        
        // Add Crit to HUD if not present in HTML
        this.ensureCritDisplay();
    }

    ensureCritDisplay() {
        // Check if crit row exists in DOM, if not create it
        // Assuming standard structure in index.html
        const statsContainer = document.getElementById('hud-stats');
        if (statsContainer && !document.getElementById('hud-crit')) {
            const row = document.createElement('div');
            row.className = 'hud-stat-row';
            row.innerHTML = `
                <img class="hud-stat-icon" id="crit-stat-icon" alt="">
                <span class="hud-stat-label">CRIT</span>
                <span class="hud-stat-value" id="hud-crit">0%</span>
            `;
            statsContainer.appendChild(row);
            this.hudElements.stats.crit = document.getElementById('hud-crit');
            this.hudIcons.stats.crit = document.getElementById('crit-stat-icon');
        } else {
            this.hudElements.stats.crit = document.getElementById('hud-crit');
            this.hudIcons.stats.crit = document.getElementById('crit-stat-icon');
        }
    }

    initHUDIcons() {
        // Initialize HUD icons with sprites from Assets
        // This should be called after Assets.load() completes
        if (!Assets.icons) return;

        // Top bar icons
        if (this.hudIcons.wave) this.hudIcons.wave.src = Assets.icons.hud_wave;
        if (this.hudIcons.time) this.hudIcons.time.src = Assets.icons.hud_time;
        if (this.hudIcons.gold) this.hudIcons.gold.src = Assets.icons.hud_gold;
        if (this.hudIcons.hp) this.hudIcons.hp.src = Assets.icons.hud_health;

        // Stats panel icons
        if (this.hudIcons.stats.dmg) this.hudIcons.stats.dmg.src = Assets.icons.hud_damage;
        if (this.hudIcons.stats.rate) this.hudIcons.stats.rate.src = Assets.icons.hud_firerate;
        if (this.hudIcons.stats.hp) this.hudIcons.stats.hp.src = Assets.icons.hud_health;
        if (this.hudIcons.stats.regen) this.hudIcons.stats.regen.src = Assets.icons.hud_regen;
        if (this.hudIcons.stats.speed) this.hudIcons.stats.speed.src = Assets.icons.hud_speed;
        if (this.hudIcons.stats.range) this.hudIcons.stats.range.src = Assets.icons.hud_range;
        if (this.hudIcons.stats.crit) this.hudIcons.stats.crit.src = Assets.icons.hud_crit;
    }

    initGlobalEvents() {
        // Back Buttons
        document.getElementById('character-back-btn').onclick = () => this.showScreen('menu');
        document.getElementById('leaderboard-back-btn').onclick = () => this.showScreen('menu');
        document.getElementById('world-back-btn').onclick = () => this.showScreen('menu');
    }

    showScreen(screenName) {
        Object.values(this.layers).forEach(layer => {
            if (layer) {
                layer.classList.add('hidden');
                layer.classList.remove('active');
            }
        });

        const target = this.layers[screenName];
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }
    }

    updateHUD(state, player, waveManager) {
        this.hudElements.wave.innerText = state.wave;
        this.hudElements.gold.innerText = state.gold;

        // Format Time
        const minutes = Math.floor(state.time / 60);
        const seconds = Math.floor(state.time % 60);
        this.hudElements.time.innerText = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (player) {
            this.hudElements.hp.innerText = `${Math.ceil(player.hp)}/${Math.ceil(player.maxHp)}`;
            
            // Stats Panel
            this.hudElements.stats.dmg.innerText = Math.floor(player.damage);
            this.hudElements.stats.rate.innerText = (1 / player.fireRate).toFixed(1) + '/s';
            this.hudElements.stats.hp.innerText = Math.floor(player.maxHp);
            this.hudElements.stats.regen.innerText = player.regenRate.toFixed(1) + '/s';
            this.hudElements.stats.speed.innerText = Math.floor(player.speed);
            this.hudElements.stats.range.innerText = Math.floor(player.range);
            
            if (this.hudElements.stats.crit) {
                const crit = player.critChance || 0;
                this.hudElements.stats.crit.innerText = crit.toFixed(1) + '%';
            }
        }

        // Wave Progress
        if (waveManager && waveManager.waveActive) {
            const remaining = waveManager.getRemainingEnemies();
            this.hudElements.wave.innerText = `${state.wave} (Left: ${remaining})`;

            // Update Wave Info Panel
            const modName = waveManager.currentModifierName;
            const challenge = waveManager.currentChallenge;

            if (modName || challenge) {
                this.hudElements.waveInfo.classList.remove('hidden');
                this.hudElements.modifier.innerText = modName ? `⚠️ ${modName}` : '';
                this.hudElements.modifier.style.display = modName ? 'block' : 'none';
                
                this.hudElements.challenge.innerText = challenge ? `🎯 ${challenge.label}` : '';
                this.hudElements.challenge.style.display = challenge ? 'block' : 'none';
            } else {
                this.hudElements.waveInfo.classList.add('hidden');
            }
        }
    }

    updateMainMenu() {
        const data = Persistence.getData();
        if (this.menuElements.gold) this.menuElements.gold.innerText = data.gold;
        if (this.menuElements.tokens) this.menuElements.tokens.innerText = data.shopTokens;
        const topScore = data.highScores[0] ? data.highScores[0].wave : 0;
        if (this.menuElements.highScore) this.menuElements.highScore.innerText = topScore;
    }

    updateLeaderboard() {
        const data = Persistence.getData();
        const container = document.getElementById('leaderboard-list');
        container.innerHTML = '';

        if (data.highScores.length === 0) {
            container.innerHTML = `
                <div class="no-scores">
                    <img src="${Assets.icons.leader_trophy}" class="no-scores-icon pixel-icon" alt="Trophy">
                    <p>NO RUNS YET</p>
                    <p class="no-scores-hint">COMPLETE A RUN TO APPEAR HERE</p>
                </div>
            `;
            return;
        }

        data.highScores.forEach((score, i) => {
            const row = document.createElement('div');
            row.className = `leaderboard-row rank-${i + 1}`;

            let rankDisplay;
            if (i < 3) {
                const medalIcons = [Assets.icons.leader_gold, Assets.icons.leader_silver, Assets.icons.leader_bronze];
                rankDisplay = `<img src="${medalIcons[i]}" class="rank-medal-icon pixel-icon" alt="Rank ${i + 1}">`;
            } else {
                rankDisplay = `<span class="rank-number">#${i + 1}</span>`;
            }

            const date = new Date(score.date);
            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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

    openWorldSelect(onSelectWorld) {
        this.showScreen('worldSelect');
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
            
            const previewHTML = previewImg
                ? `<img src="${previewImg}" class="world-preview" alt="${world.name}">`
                : `<div class="world-preview" style="background: ${world.colors.bg};"></div>`;

            div.innerHTML = `
                ${previewHTML}
                <h3>${world.name}</h3>
                <p>${world.waves} Waves</p>
                <div class="world-status ${isLocked ? '' : 'active'}">
                    ${isLocked ? 'LOCKED' : (isCompleted ? 'CLEARED' : 'AVAILABLE')}
                </div>
            `;

            if (!isLocked) {
                div.onclick = () => onSelectWorld(world.id);
            }

            container.appendChild(div);
        });
    }

    openIngameShop(player, onComplete, lastWaveResult) {
        this.showScreen('shop');
        const container = document.getElementById('upgrade-cards');
        container.innerHTML = '';

        // Show Challenge Result
        const title = document.querySelector('#shop-layer h1');
        if (lastWaveResult && lastWaveResult.challenge) {
            const c = lastWaveResult.challenge;
            const success = lastWaveResult.success;
            const bonusText = success ? '<span style="color:#0f0"> (+50 GOLD)</span>' : '';
            title.innerHTML = `WAVE COMPLETE<br><span style="font-size:0.6em; color:${success ? '#0f0' : '#f00'}">
                CHALLENGE: ${c.label} - ${success ? 'COMPLETE!' : 'FAILED'} ${bonusText}
            </span>`;
        } else {
            title.innerText = 'WAVE COMPLETE!';
        }

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
                this.updateHUD({ wave: 0, gold: 0, time: 0 }, player, null); 
                onComplete();
            };
            container.appendChild(card);
            cards.push({ card, opt });
        });

        const autoSelectCheckbox = document.getElementById('auto-select-checkbox');
        if (autoSelectCheckbox && autoSelectCheckbox.checked) {
            setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * cards.length);
                const selected = cards[randomIndex];
                selected.card.style.transform = 'scale(1.1)';
                selected.card.style.boxShadow = '0 0 30px rgba(15, 255, 15, 0.8)';
                setTimeout(() => {
                    selected.opt.apply(player);
                    onComplete();
                }, 800);
            }, 300);
        }
    }

    showGameOver(state, isVictory, gachaInterface) {
        this.showScreen('gameover');
        const title = document.getElementById('gameover-layer').querySelector('h1');
        title.innerText = isVictory ? "VICTORY!" : "GAME OVER";
        
        document.getElementById('final-wave').innerText = state.wave;
        document.getElementById('run-gold').innerText = state.gold;
    }

    showWaveStartOverlay(wave, modifierName, challenge) {
        const overlay = document.getElementById('wave-start-overlay');
        const title = document.getElementById('ws-title');
        const modText = document.getElementById('ws-modifier');
        const challText = document.getElementById('ws-challenge');

        title.innerText = `WAVE ${wave}`;
        modText.innerText = modifierName || '';
        challText.innerText = challenge ? `🎯 ${challenge.label}: ${challenge.description}` : '';

        overlay.classList.remove('hidden');
        overlay.classList.add('fade-in');

        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.classList.remove('fade-in', 'fade-out');
                overlay.classList.add('hidden');
            }, 500);
        }, 2500);
    }
}