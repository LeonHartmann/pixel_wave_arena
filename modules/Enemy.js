import { Entity } from './Entity.js';
import { Assets } from './Assets.js';

export class Enemy extends Entity {
    constructor(x, y, type = 'CHASER') {
        super(x, y, type === 'BOSS' ? 48 : 24, '#f00');
        this.type = type; // CHASER, SHOOTER, TANK, BOSS

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

            // Stop moving if in range (Shooter only, Boss keeps moving slowly)
            if (this.type === 'SHOOTER' && dist < this.range) {
                shouldMove = false;
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
            if (this.type === 'SHOOTER') sprite = Assets.SHOOTER;
            if (this.type === 'TANK') sprite = Assets.TANK;

            if (this.type === 'BOSS') {
                Assets.drawBoss(ctx, this.x - 32, (this.y - this.z) - 32, 64, 64);
            } else {
                Assets.draw(ctx, sprite, this.x, this.y - this.z, 32, 32);
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
    }
}
