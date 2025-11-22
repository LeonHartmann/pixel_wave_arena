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
    }

    startWave() {
        this.waveActive = true;
        this.timer = this.waveTime;

        // Difficulty Scaling
        this.enemiesToSpawn = 5 + Math.floor(this.wave * 3);
        this.totalEnemies = this.enemiesToSpawn;
        this.spawnRate = Math.max(0.5, 1.0 - (this.wave * 0.1));

        // Boss Wave Logic
        this.isBossWave = (this.wave % 5 === 0);
        if (this.isBossWave) {
            this.enemiesToSpawn = 1; // Just the boss (or maybe + minions later)
            console.log(`BOSS WAVE ${this.wave}!`);
        }

        console.log(`Starting Wave ${this.wave}: ${this.enemiesToSpawn} enemies, rate ${this.spawnRate}`);
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

                if (this.isBossWave) {
                    type = 'BOSS';
                } else {
                    // Weighted Random Spawning
                    const rand = Math.random();
                    if (this.wave >= 6 && rand < 0.2) {
                        type = 'TANK';
                    } else if (this.wave >= 4 && rand < 0.4) {
                        type = 'SHOOTER';
                    }
                }

                const enemy = new Enemy(x, y, type);

                // Scale Enemy Stats (Compounding difficulty)
                // HP: +15% per wave
                // Damage: +10% per wave
                const hpMult = Math.pow(1.15, this.wave - 1);
                const dmgMult = Math.pow(1.10, this.wave - 1);

                // Bosses scale slightly harder on HP to remain threatening
                const bossHpMult = this.isBossWave ? 1.5 : 1.0;

                enemy.hp = Math.floor(enemy.hp * hpMult * bossHpMult);
                enemy.damage = Math.floor(enemy.damage * dmgMult);
                
                // Scale Gold/XP reward so player economy keeps up
                enemy.xpValue = Math.floor(enemy.xpValue * (1 + (this.wave * 0.1)));

                enemy.maxHp = enemy.hp;

                this.game.enemies.push(enemy);
                return true;
            }
        }
        return false;
    }

    getRemainingEnemies() {
        return this.enemiesToSpawn + this.game.enemies.length;
    }

    setWorld(world) {
        this.world = world;
        this.difficultyOffset = world.difficultyOffset || 0;
    }

    endWave() {
        this.waveActive = false;
        console.log('Wave Cleared!');

        // Check if world is completed
        if (this.world && this.wave >= this.world.waves) {
            console.log('World Cleared!');
            this.game.onWorldClear();
        } else {
            this.game.onWaveComplete();
        }
    }
}
