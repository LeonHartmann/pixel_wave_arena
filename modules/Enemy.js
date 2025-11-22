import { Entity } from './Entity.js';
import { Assets } from './Assets.js';

export class Enemy extends Entity {
    constructor(x, y, type = 'CHASER') {
        super(x, y, type === 'BOSS' ? 48 : (type === 'SWARM' ? 10 : 24), '#f00');
        this.type = type; // CHASER, SHOOTER, TANK, BOSS, SWARM, HEALER, SPLITTER, TELEPORTER

        // Base Stats
        this.speed = 100;
        this.hp = 30;
        this.damage = 10;
        this.xpValue = 10;

        // Type Specific Stats
        if (this.type === 'SHOOTER') {
            this.hp = 20;
            this.speed = 80;
            this.range = 300;
            this.shootTimer = 2.0;
            this.xpValue = 15;
        } else if (this.type === 'TANK') {
            this.hp = 80;
            this.speed = 50;
            this.damage = 20;
            this.xpValue = 25;
            this.size = 30;
        } else if (this.type === 'BOSS') {
            this.hp = 500;
            this.speed = 60;
            this.damage = 25;
            this.xpValue = 500;
            this.size = 50;
            this.shootTimer = 1.5;
            // Boss phase tracking
            this.phaseThresholds = [0.7, 0.4, 0.1]; // Spawn minions at these HP %
            this.phasesTriggered = [];
            this.isEnraged = false; // Speed boost at 50% HP
        } else if (this.type === 'SWARM') {
            this.hp = 15;
            this.speed = 150;
            this.damage = 8;
            this.xpValue = 8;
            this.size = 10;
        } else if (this.type === 'HEALER') {
            this.hp = 40;
            this.speed = 60;
            this.damage = 5;
            this.xpValue = 30;
            this.healRadius = 200;
            this.healRate = 4.0; // HP per second for nearby enemies
            this.healTimer = 0;
        } else if (this.type === 'SPLITTER') {
            this.hp = 35;
            this.speed = 90;
            this.damage = 10;
            this.xpValue = 20;
            this.canSplit = true;
        } else if (this.type === 'TELEPORTER') {
            this.hp = 25;
            this.speed = 100;
            this.damage = 10;
            this.xpValue = 18;
            this.teleportTimer = 3.0;
            this.teleportCooldown = 3.0;
            this.teleportFlash = 0; // Visual effect timer
        }

        this.maxHp = this.hp;

        // Status Effects
        this.slowTimer = 0;
        this.baseSpeed = this.speed;

        // Jump Mechanics
        this.z = 0;
        this.vz = 0;
        this.isJumping = false;
    }

    applySlow(duration) {
        this.slowTimer = duration;
    }

    update(dt, player, map, game) { // Added game param for spawning projectiles
        if (!player) return;

        // Handle Slow
        let currentSpeed = this.baseSpeed;
        if (this.slowTimer > 0) {
            this.slowTimer -= dt;
            currentSpeed *= 0.5;
        }
        this.speed = currentSpeed;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // AI Logic
        let shouldMove = true;

        if (this.type === 'SHOOTER' || this.type === 'BOSS') {
            // Shoot logic
            this.shootTimer -= dt;
            if (this.shootTimer <= 0 && dist < 500) { // Only shoot if close enough
                this.shootTimer = this.type === 'BOSS' ? 1.5 : 2.5;
                if (game) {
                    // Import Projectile dynamically or assume it's available globally/passed
                    // Better: game.spawnEnemyProjectile(...)
                    game.spawnEnemyProjectile(this.x, this.y, player.x, player.y, this.damage);
                }
            }

            // Boss-specific phase mechanics
            if (this.type === 'BOSS' && game) {
                const hpPercent = this.hp / this.maxHp;

                // Check for phase transitions (spawn minions)
                this.phaseThresholds.forEach((threshold, index) => {
                    if (hpPercent <= threshold && !this.phasesTriggered.includes(index)) {
                        this.phasesTriggered.push(index);
                        // Spawn 3 minions
                        for (let i = 0; i < 3; i++) {
                            const spawnAngle = Math.random() * Math.PI * 2;
                            const spawnDist = 80 + Math.random() * 40;
                            const spawnX = this.x + Math.cos(spawnAngle) * spawnDist;
                            const spawnY = this.y + Math.sin(spawnAngle) * spawnDist;

                            if (!map.checkCollision({ x: spawnX, y: spawnY, size: 20 })) {
                                const minionType = Math.random() < 0.5 ? 'CHASER' : 'SHOOTER';
                                const minion = new Enemy(spawnX, spawnY, minionType);
                                // Minions inherit scaled stats from current wave
                                minion.hp = Math.floor(minion.hp * (1 + game.waveManager.wave * 0.4) * Math.pow(1.06, game.waveManager.wave - 1));
                                minion.maxHp = minion.hp;
                                minion.damage = Math.floor(minion.damage * Math.pow(1.08, game.waveManager.wave - 1));
                                game.enemies.push(minion);
                            }
                        }
                    }
                });

                // Enrage at 50% HP (speed boost)
                if (hpPercent <= 0.5 && !this.isEnraged) {
                    this.isEnraged = true;
                    this.baseSpeed = Math.floor(this.baseSpeed * 1.2);
                    this.speed = this.baseSpeed;
                }
            }

            // Stop moving if in range (Shooter only, Boss keeps moving slowly)
            if (this.type === 'SHOOTER' && dist < this.range) {
                shouldMove = false;
            }
        } else if (this.type === 'HEALER') {
            // Heal nearby enemies
            this.healTimer += dt;
            if (this.healTimer >= 1.0 && game) {
                this.healTimer = 0;
                // Heal nearby enemies (20% HP regen per second in radius)
                game.enemies.forEach(enemy => {
                    if (enemy !== this && enemy.hp < enemy.maxHp) {
                        const edx = enemy.x - this.x;
                        const edy = enemy.y - this.y;
                        const edist = Math.sqrt(edx * edx + edy * edy);
                        if (edist < this.healRadius) {
                            enemy.hp = Math.min(enemy.maxHp, enemy.hp + this.healRate);
                        }
                    }
                });
            }
            // Healer tries to stay at medium range
            if (dist < 150) {
                shouldMove = false;
            }
        } else if (this.type === 'TELEPORTER') {
            // Teleport toward player periodically
            this.teleportTimer -= dt;
            if (this.teleportFlash > 0) this.teleportFlash -= dt;

            if (this.teleportTimer <= 0 && dist > 100) {
                this.teleportTimer = this.teleportCooldown;
                // Teleport 200-300px closer to player
                const teleportDist = 200 + Math.random() * 100;
                const angle = Math.atan2(dy, dx);
                const newX = this.x + Math.cos(angle) * teleportDist;
                const newY = this.y + Math.sin(angle) * teleportDist;

                // Only teleport if not into a wall
                if (map && !map.checkCollision({ x: newX, y: newY, size: this.size })) {
                    this.x = newX;
                    this.y = newY;
                    this.teleportFlash = 0.3; // Flash for 0.3 seconds
                }
            }
        }

        if (shouldMove && dist > 0) {
            // Predict next position
            const nextX = this.x + (dx / dist) * this.speed * dt;
            const nextY = this.y + (dy / dist) * this.speed * dt;

            // Check if blocked by wall
            if (map && !this.isJumping) {
                const blocked = map.checkCollision({ x: nextX, y: nextY, size: this.size });
                if (blocked) {
                    // Jump!
                    this.isJumping = true;
                    this.vz = 350;
                    this.z = 1;
                }
            }

            this.x = nextX;
            this.y = nextY;

            // Resolve collision only if NOT jumping (or landing)
            if (map && this.z <= 0) {
                map.resolveCollision(this);
            }
        }

        // Jump Physics
        if (this.isJumping) {
            this.z += this.vz * dt;
            this.vz -= 800 * dt; // Gravity

            if (this.z <= 0) {
                this.z = 0;
                this.vz = 0;
                this.isJumping = false;
            }
        }

        this.speed = this.baseSpeed;
    }

    draw(ctx) {
        // Draw Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        const shadowScale = 1.0 - (this.z / 200);
        ctx.ellipse(this.x, this.y + this.size / 2, (this.size / 2) * shadowScale, (this.size / 4) * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        if (Assets.loaded) {
            // Draw Sprite at y - z
            let sprite = Assets.ENEMY;
            let spriteSize = 32;

            if (this.type === 'SHOOTER') sprite = Assets.SHOOTER;
            if (this.type === 'TANK') sprite = Assets.TANK;
            if (this.type === 'SWARM') {
                sprite = Assets.SWARM;
                spriteSize = 16; // Smaller sprite
            }
            if (this.type === 'HEALER') sprite = Assets.HEALER;
            if (this.type === 'SPLITTER') sprite = Assets.SPLITTER;
            if (this.type === 'TELEPORTER') sprite = Assets.TELEPORTER;

            if (this.type === 'BOSS') {
                Assets.drawBoss(ctx, this.x - 32, (this.y - this.z) - 32, 64, 64);
            } else {
                Assets.draw(ctx, sprite, this.x, this.y - this.z, spriteSize, spriteSize);
            }
        } else {
            super.draw(ctx);
        }

        // Draw Health Bar (follow sprite)
        if (this.hp < this.maxHp) {
            const barWidth = this.size;
            const barHeight = 4;
            const x = this.x - barWidth / 2;
            const y = (this.y - this.z) - (this.size / 2 + 8);

            // Background (Red)
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(x, y, barWidth, barHeight);

            // Foreground (Green)
            const hpPercent = Math.max(0, this.hp / this.maxHp);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(x, y, barWidth * hpPercent, barHeight);
        }

        // Draw Status Effects
        if (this.slowTimer > 0) {
            const x = this.x;
            const y = (this.y - this.z) - (this.size / 2 + 16);

            // Draw Snowflake
            ctx.fillStyle = '#3498db';
            ctx.fillRect(x - 1, y - 4, 2, 8); // Vertical
            ctx.fillRect(x - 4, y - 1, 8, 2); // Horizontal
            ctx.fillRect(x - 2, y - 2, 4, 4); // Center
        }

        // HEALER: Draw healing aura
        if (this.type === 'HEALER') {
            const time = Date.now() / 1000;
            const pulseSize = this.healRadius + Math.sin(time * 3) * 10;

            ctx.strokeStyle = 'rgba(241, 196, 15, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
            ctx.stroke();

            // Draw heal particles
            for (let i = 0; i < 3; i++) {
                const angle = (time + i * 2.1) * 2;
                const dist = 30 + Math.sin(time * 2 + i) * 10;
                const px = this.x + Math.cos(angle) * dist;
                const py = this.y + Math.sin(angle) * dist;
                ctx.fillStyle = 'rgba(241, 196, 15, 0.6)';
                ctx.fillRect(px - 2, py - 2, 4, 4);
            }
        }

        // TELEPORTER: Draw phase effect
        if (this.type === 'TELEPORTER') {
            const time = Date.now() / 1000;
            const alpha = 0.3 + Math.sin(time * 5) * 0.2;

            // Phasing outline
            ctx.strokeStyle = `rgba(155, 89, 182, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.z, this.size / 2 + 5, 0, Math.PI * 2);
            ctx.stroke();

            // Trail particles
            for (let i = 0; i < 4; i++) {
                const offset = i * 8;
                const particleAlpha = 0.4 - (i * 0.1);
                ctx.fillStyle = `rgba(155, 89, 182, ${particleAlpha})`;
                ctx.fillRect(this.x - 3 + Math.sin(time + i) * 5,
                            this.y - this.z + offset, 3, 3);
            }

            // Teleport flash effect
            if (this.teleportFlash > 0) {
                const flashAlpha = this.teleportFlash / 0.3; // Fade from 1 to 0
                ctx.fillStyle = `rgba(155, 89, 182, ${flashAlpha * 0.8})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y - this.z, this.size * 1.5, 0, Math.PI * 2);
                ctx.fill();

                // Particle burst
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 / 8) * i;
                    const dist = 40 * (1 - flashAlpha);
                    const px = this.x + Math.cos(angle) * dist;
                    const py = this.y - this.z + Math.sin(angle) * dist;
                    ctx.fillStyle = `rgba(155, 89, 182, ${flashAlpha})`;
                    ctx.fillRect(px - 3, py - 3, 6, 6);
                }
            }
        }
    }
}
