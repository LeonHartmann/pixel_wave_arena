import { Enemy } from './Enemy.js';

export class WaveManager {
    constructor(game) {
        this.game = game;
        this.wave = 1;
        this.waveTime = 30; // Seconds per wave
        this.timer = this.waveTime;

        this.enemiesToSpawn = 0;
        this.spawnTimer = 0;
        this.spawnRate = 1.0; // Seconds between spawns

        this.waveActive = false;
        this.waveModifier = null; // Current wave modifier

        // Wave Modifier Types
        this.WAVE_MODIFIERS = {
            SPEED: { name: 'SPEED WAVE', description: 'Enemies move faster.', speedMult: 1.4, hpMult: 1.0, countMult: 1.0 },
            HORDE: { name: 'HORDE WAVE', description: 'More, weaker enemies.', speedMult: 1.0, hpMult: 0.7, countMult: 1.5 },
            ARMORED: { name: 'ARMORED WAVE', description: 'Fewer, tankier enemies.', speedMult: 0.8, hpMult: 1.8, countMult: 1.0 },
            ELITE: { name: 'ELITE WAVE', description: 'Fewer, much stronger enemies.', speedMult: 1.0, hpMult: 2.5, countMult: 0.5 }
        };

        // Wave Challenges
        this.WAVE_CHALLENGES = [
            { id: 'FLAWLESS', label: 'Flawless', description: 'Take no damage this wave.' },
            { id: 'SPEED_CLEAR', label: 'Speed Clear', description: 'Finish with >50% time remaining.' },
            { id: 'PACIFIST_START', label: 'Slow Start', description: 'Don\'t shoot for first 5s (Bonus +100).' }, // A bit complex to track, sticking to simple ones first
            { id: 'HUNTER', label: 'Bounty Hunter', description: 'Clear wave quickly.' } // Redundant with Speed Clear
        ];
        // refined list
        this.CHALLENGES = [
            { id: 'FLAWLESS', label: 'FLAWLESS', description: 'Take NO damage this wave.' },
            { id: 'SPEED', label: 'SPEED RUN', description: 'Finish with > 15s remaining.' },
            { id: 'SURVIVOR', label: 'SURVIVOR', description: 'End wave with > 90% HP.' }
        ];
    }

    startWave() {
        this.waveActive = true;
        this.timer = this.waveTime;

        // Reset / Pick Challenge
        this.currentChallenge = null;
        this.playerHpAtWaveStart = this.game.player ? this.game.player.hp : 100;
        
        // 40% chance for a challenge on waves > 2
        if (this.wave > 2 && Math.random() < 0.4) {
            this.currentChallenge = this.CHALLENGES[Math.floor(Math.random() * this.CHALLENGES.length)];
            console.log(`Wave Challenge: ${this.currentChallenge.label}`);
        }

        // Select Wave Modifier (every 3rd non-boss wave)
        this.waveModifier = null;
        if (this.wave >= 3 && this.wave % 3 === 0 && this.wave % 5 !== 0) {
            const modifiers = Object.values(this.WAVE_MODIFIERS);
            this.waveModifier = modifiers[Math.floor(Math.random() * modifiers.length)];
            console.log(`${this.waveModifier.name}!`);
        }
        
        this.currentModifierName = this.waveModifier ? this.waveModifier.name : null;
        this.currentModifierDescription = this.waveModifier ? this.waveModifier.description : null;

        // Difficulty Scaling
        let baseEnemies = 5 + Math.floor(this.wave * 3);

        // Apply wave modifier to enemy count
        if (this.waveModifier) {
            baseEnemies = Math.floor(baseEnemies * this.waveModifier.countMult);
        }

        this.enemiesToSpawn = baseEnemies;
        this.totalEnemies = this.enemiesToSpawn;
        this.spawnRate = Math.max(0.5, 1.0 - (this.wave * 0.1));
        this.enemiesSpawnedThisWave = 0; // Track spawns for boss wave logic

        // Boss Wave Logic
        this.isBossWave = (this.wave % 5 === 0);
        if (this.isBossWave) {
            // Boss + minions (12-15 regular enemies)
            this.enemiesToSpawn = 1 + (12 + Math.floor(Math.random() * 4));
            this.waveModifier = null; // Bosses don't use modifiers
            console.log(`BOSS WAVE ${this.wave}!`);
        }

        console.log(`Starting Wave ${this.wave}: ${this.enemiesToSpawn} enemies, rate ${this.spawnRate}${this.waveModifier ? ` [${this.waveModifier.name}]` : ''}`);
    }

    update(dt) {
        if (!this.waveActive) return;

        this.timer -= dt;

        // Spawning Logic
        if (this.enemiesToSpawn > 0) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                if (this.spawnEnemy()) {
                    this.spawnTimer = this.spawnRate;
                    this.enemiesToSpawn--;
                } else {
                    // Failed to spawn (no valid spot), retry soon
                    this.spawnTimer = 0.1;
                }
            }
        }

        // Check for Wave End
        if (this.enemiesToSpawn <= 0 && this.game.enemies.length === 0) {
            this.endWave();
        }
    }

    spawnEnemy() {
        const player = this.game.player;
        if (!player) return false;

        for (let attempt = 0; attempt < 10; attempt++) {
            // Spawn closer: 640 (half screen) + 50 padding
            const angle = Math.random() * Math.PI * 2;
            const distance = 700 + Math.random() * 100;

            const x = player.x + Math.cos(angle) * distance;
            const y = player.y + Math.sin(angle) * distance;

            // Check if inside wall
            if (!this.game.gameMap.checkCollision({ x, y, size: 20 })) {
                 let type = 'CHASER';

                if (this.isBossWave && this.enemiesSpawnedThisWave === 0) {
                    // First enemy in boss wave is the boss
                    type = 'BOSS';
                } else {
                    // Weighted Random Spawning (for minions in boss wave or regular waves)
                    const rand = Math.random();
                    if (this.wave >= 15 && rand < 0.1) {
                        type = 'TELEPORTER';
                    } else if (this.wave >= 12 && rand < 0.25) {
                        type = 'SPLITTER';
                    } else if (this.wave >= 9 && rand < 0.35) {
                        type = 'HEALER';
                    } else if (this.wave >= 7 && rand < 0.5) {
                        type = 'SWARM';
                    } else if (this.wave >= 6 && rand < 0.7) {
                        type = 'TANK';
                    } else if (this.wave >= 4 && rand < 0.85) {
                        type = 'SHOOTER';
                    }
                    // else CHASER (15% of the time at late waves)
                }

                const enemy = new Enemy(x, y, type);

                // Scale Enemy Stats (Hybrid scaling for better balance)
                // HP: Linear base + exponential component for smooth curve
                // Old: 1.15^wave (too harsh late game)
                // New: (1 + wave * 0.4) * 1.06^wave (more manageable)
                const hpMult = (1 + this.wave * 0.4) * Math.pow(1.06, this.wave - 1);

                // Damage: Slightly reduced exponential growth
                const dmgMult = Math.pow(1.08, this.wave - 1);

                // Bosses scale much harder on HP to remain threatening
                const bossHpMult = this.isBossWave ? 3.0 : 1.0;

                enemy.hp = Math.floor(enemy.hp * hpMult * bossHpMult);
                enemy.damage = Math.floor(enemy.damage * dmgMult);

                // Apply Wave Modifier effects
                if (this.waveModifier) {
                    enemy.hp = Math.floor(enemy.hp * this.waveModifier.hpMult);
                    enemy.speed = Math.floor(enemy.speed * this.waveModifier.speedMult);
                    enemy.baseSpeed = enemy.speed;
                }

                // Scale Gold/XP reward exponentially to match difficulty
                // Old: linear +10% per wave
                // New: (1 + wave * 0.15) * 1.05^wave
                enemy.xpValue = Math.floor(enemy.xpValue * (1 + this.wave * 0.15) * Math.pow(1.05, this.wave - 1));

                enemy.maxHp = enemy.hp;

                this.game.enemies.push(enemy);

                // SWARM enemies spawn in groups of 3-5
                if (type === 'SWARM') {
                    const swarmCount = 2 + Math.floor(Math.random() * 3); // 2-4 additional
                    for (let i = 0; i < swarmCount; i++) {
                        const offsetAngle = Math.random() * Math.PI * 2;
                        const offsetDist = 30 + Math.random() * 40;
                        const swarmX = x + Math.cos(offsetAngle) * offsetDist;
                        const swarmY = y + Math.sin(offsetAngle) * offsetDist;

                        if (!this.game.gameMap.checkCollision({ x: swarmX, y: swarmY, size: 10 })) {
                            const swarmEnemy = new Enemy(swarmX, swarmY, 'SWARM');
                            swarmEnemy.hp = Math.floor(swarmEnemy.hp * hpMult);
                            swarmEnemy.damage = Math.floor(swarmEnemy.damage * dmgMult);
                            swarmEnemy.xpValue = Math.floor(swarmEnemy.xpValue * (1 + this.wave * 0.15) * Math.pow(1.05, this.wave - 1));
                            swarmEnemy.maxHp = swarmEnemy.hp;
                            this.game.enemies.push(swarmEnemy);
                        }
                    }
                }

                this.enemiesSpawnedThisWave++;
                return true;
            }
        }
        return false;
    }

    getRemainingEnemies() {
        return this.enemiesToSpawn + this.game.enemies.length;
    }

    getWaveModifierName() {
        return this.waveModifier ? this.waveModifier.name : null;
    }

    setWorld(world) {
        this.world = world;
        this.difficultyOffset = world.difficultyOffset || 0;
    }

    endWave() {
        this.waveActive = false;
        console.log('Wave Cleared!');

        // Check Challenge Success
        let challengeResult = { success: false, challenge: null };
        if (this.currentChallenge) {
            let success = false;
            if (this.currentChallenge.id === 'FLAWLESS') {
                // Simple check: HP shouldn't have dropped below start (ignoring heals for simplicity, or strictly no dmg taken?)
                // Strict "No Damage" is hard to track without event hook, using HP comparison is "good enough" if they heal back up it counts as 'failed' if they dropped? 
                // Actually "Take no damage" usually implies NO hit. 
                // But for simplicity, let's check if current HP >= Start HP. 
                // Better: Player class tracks "tookDamageThisWave" flag? 
                // Let's stick to simple HP comparison for now: If end HP < start HP, failed. 
                // Actually, let's assume Flawless means "Don't lose health net total" for now to be forgiving, 
                // or use game.player.tookDamage flag if we added it.
                // Let's check strictly HP >= Start HP for now.
                success = this.game.player.hp >= this.playerHpAtWaveStart;
            } else if (this.currentChallenge.id === 'SPEED') {
                success = this.timer >= 15;
            } else if (this.currentChallenge.id === 'SURVIVOR') {
                success = this.game.player.hp >= (this.game.player.maxHp * 0.9);
            }
            
            challengeResult = {
                success: success,
                challenge: this.currentChallenge
            };
            console.log(`Challenge ${this.currentChallenge.label}: ${success ? 'COMPLETE' : 'FAILED'}`);
        }

        // Check if world is completed
        if (this.world && this.wave >= this.world.waves) {
            console.log('World Cleared!');
            this.game.onWorldClear();
        } else {
            this.game.onWaveComplete(challengeResult);
        }
    }
}
