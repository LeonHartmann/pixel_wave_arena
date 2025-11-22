import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { Assets } from './Assets.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 28, '#0f0'); // Slightly smaller hitbox than visual
        this.speed = 200; // Pixels per second
        this.hp = 100;
        this.maxHp = 100;

        // Combat Stats
        this.baseFireRate = 0.5; // Base seconds between shots
        this.fireRateBonus = 0; // Additive bonus (0.10 = 10% faster)
        this.fireRate = 0.5; // Calculated fire rate
        this.fireTimer = 0;
        this.range = 400;
        this.damage = 10;

        // Abilities
        this.hasFireAura = false;
        this.fireAuraDamage = 0;
        this.fireAuraRange = 100;
        this.fireAuraTimer = 0;

        this.orbitalCount = 0;
        this.orbitalDamage = 0;
        this.orbitalAngle = 0;
        this.orbitalRadius = 60;

        // New Stats
        this.ricochetCount = 0;
        this.projectileCount = 1;
        this.regenRate = 0;
        this.thornsDamage = 0;
        this.lifestealChance = 0;

        // Invincibility
        this.invincibleTimer = 0;
        this.isFlashing = false;
    }

    updateFireRate() {
        // Calculate effective fire rate with diminishing returns
        // fireRateBonus is additive (0.10 = 10% faster)
        this.fireRate = this.baseFireRate / (1 + this.fireRateBonus);
        // Cap at minimum 0.05 seconds between shots
        this.fireRate = Math.max(0.05, this.fireRate);
    }

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return;

        this.hp -= amount;
        this.invincibleTimer = 1.0; // 1 second I-frames

        // Visual feedback (screen shake or flash could be triggered here)
    }

    onKill() {
        if (this.lifestealChance > 0) {
            if (Math.random() < this.lifestealChance) {
                this.hp = Math.min(this.hp + 1, this.maxHp);
            }
        }
    }

    update(dt, input, map, enemies, projectiles) {
        // Handle I-frames
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
            this.isFlashing = Math.floor(this.invincibleTimer * 10) % 2 === 0; // Flash effect
        } else {
            this.isFlashing = false;
        }

        // Regeneration
        if (this.regenRate > 0 && this.hp < this.maxHp) {
            this.hp += this.regenRate * dt;
            if (this.hp > this.maxHp) this.hp = this.maxHp;
        }

        const axis = input.getAxis();

        // Move X
        this.x += axis.x * this.speed * dt;
        if (map) map.resolveCollision(this);

        // Move Y
        this.y += axis.y * this.speed * dt;
        if (map) map.resolveCollision(this);

        // Auto-aim and Shoot
        this.fireTimer -= dt;
        if (this.fireTimer <= 0) {
            const target = this.findNearestEnemy(enemies);
            if (target) {
                this.shoot(target, projectiles);
                this.fireTimer = this.fireRate;
            }
        }

        // Fire Aura Logic
        if (this.hasFireAura) {
            this.fireAuraTimer -= dt;
            if (this.fireAuraTimer <= 0) {
                this.fireAuraTimer = 0.5; // Tick every 0.5s
                enemies.forEach(enemy => {
                    const dx = enemy.x - this.x;
                    const dy = enemy.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < this.fireAuraRange) {
                        enemy.hp -= this.fireAuraDamage;
                        // Visual feedback could go here (e.g. enemy flash)
                    }
                });
            }
        }
        
        // Thorns (Handled in Game Loop collision usually, but we can do proximity check here or leave it to game loop)
        // Doing it in game loop is better for "on contact" logic.

        // Orbitals Logic
        if (this.orbitalCount > 0) {
            this.orbitalAngle += 2 * dt; // Rotate speed
            const angleStep = (Math.PI * 2) / this.orbitalCount;

            for (let i = 0; i < this.orbitalCount; i++) {
                const angle = this.orbitalAngle + i * angleStep;
                const ox = this.x + Math.cos(angle) * this.orbitalRadius;
                const oy = this.y + Math.sin(angle) * this.orbitalRadius;

                // Check collision with enemies
                enemies.forEach(enemy => {
                    const dx = enemy.x - ox;
                    const dy = enemy.y - oy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 24) { // Orbital radius + Enemy radius approx
                        enemy.hp -= this.orbitalDamage * dt * 2; // DPS contact damage
                    }
                });
            }
        }
    }

    draw(ctx) {
        // Draw Fire Aura
        if (this.hasFireAura) {
            const particleCount = 30;
            const angleStep = (Math.PI * 2) / particleCount;
            const time = Date.now() / 200;

            for (let i = 0; i < particleCount; i++) {
                const angle = i * angleStep + time; // Rotate slowly
                const flicker = Math.sin(time * 5 + i) * 5; // Flicker effect
                const r = this.fireAuraRange + flicker;

                const px = this.x + Math.cos(angle) * r;
                const py = this.y + Math.sin(angle) * r;

                // Random fire colors
                const colors = ['#e74c3c', '#e67e22', '#f1c40f'];
                const color = colors[Math.floor(Math.abs(Math.sin(i * 13 + time)) * 3)];

                ctx.fillStyle = color;
                ctx.fillRect(px - 2, py - 2, 4, 4); // 4x4 pixel fire particles
            }

            // Inner glow
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.fireAuraRange, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(230, 126, 34, 0.1)';
            ctx.fill();
            ctx.restore();
        }

        // Draw Orbitals
        if (this.orbitalCount > 0) {
            const angleStep = (Math.PI * 2) / this.orbitalCount;
            for (let i = 0; i < this.orbitalCount; i++) {
                const angle = this.orbitalAngle + i * angleStep;
                const ox = this.x + Math.cos(angle) * this.orbitalRadius;
                const oy = this.y + Math.sin(angle) * this.orbitalRadius;

                ctx.save();
                ctx.translate(ox, oy);
                ctx.rotate(angle); // Rotate the shield itself

                // Draw Shield Pixel Art
                ctx.fillStyle = '#9b59b6';
                ctx.fillRect(-6, -6, 12, 12); // Base
                ctx.fillStyle = '#8e44ad';
                ctx.fillRect(-4, -4, 8, 8); // Inner

                ctx.restore();
            }
        }
        if (this.isFlashing) return; // Blink when hit

        if (Assets.loaded) {
            Assets.draw(ctx, Assets.PLAYER, this.x, this.y, 32, 32);
        } else {
            super.draw(ctx);
        }
    }

    findNearestEnemy(enemies) {
        let nearest = null;
        let minDist = this.range;

        for (const enemy of enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        }
        return nearest;
    }

    shoot(target, projectiles) {
        const count = this.projectileCount;
        const spacing = 12; // Distance between parallel shots
        const baseAngle = Math.atan2(target.y - this.y, target.x - this.x);

        for (let i = 0; i < count; i++) {
            // Calculate perpendicular offset for parallel spawning
            // (i - (count - 1) / 2) centers the spread around 0
            // e.g. 2 shots: -0.5, +0.5 -> Offsets -6, +6
            const offset = (i - (count - 1) / 2) * spacing;

            // Perpendicular angle is baseAngle + 90 degrees (PI/2)
            const offsetX = Math.cos(baseAngle + Math.PI / 2) * offset;
            const offsetY = Math.sin(baseAngle + Math.PI / 2) * offset;

            const sx = this.x + offsetX;
            const sy = this.y + offsetY;

            // Projectile target must be projected from the NEW spawn point 
            // to maintain parallel trajectory
            const tx = sx + Math.cos(baseAngle) * 100;
            const ty = sy + Math.sin(baseAngle) * 100;

            const p = new Projectile(sx, sy, tx, ty, this.damage, this.hasFrostShot, this.hasExplosiveShots);
            p.ricochetCount = this.ricochetCount; 
            projectiles.push(p);
        }
    }
}
