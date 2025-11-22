import { Entity } from './Entity.js';
import { Assets } from './Assets.js';

export class Projectile extends Entity {
    constructor(x, y, targetX, targetY, damage, isFrost, isExplosive, isEnemy) {
        // Color: Enemy=Orange, Explosive=Red, Frost=Blue, Normal=Yellow
        const color = isEnemy ? '#e67e22' : (isExplosive ? '#e74c3c' : (isFrost ? '#3498db' : '#ff0'));
        super(x, y, 8, color);

        this.speed = isEnemy ? 300 : 600; // Enemy bullets slower
        this.damage = damage || 10;
        this.isFrost = isFrost;
        this.isExplosive = isExplosive;
        this.isEnemy = isEnemy;

        // Calculate direction once
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        } else {
            this.vx = this.speed;
            this.vy = 0;
        }

        this.lifeTime = 2.0; // Seconds to live
        this.ricochetCount = 0;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.lifeTime -= dt;

        if (this.lifeTime <= 0) {
            this.markedForDeletion = true;
        }
    }

    bounce(wall) {
        if (this.ricochetCount <= 0) return false;

        this.ricochetCount--;

        // Simple reflection: determine which face was hit
        // We compare the previous position (approx) to see where we came from
        // But since we are already inside, we use overlap logic like map collision
        const halfSize = 4; // Approx projectile radius
        const overlapLeft = (this.x + halfSize) - wall.x;
        const overlapRight = (wall.x + wall.w) - (this.x - halfSize);
        const overlapTop = (this.y + halfSize) - wall.y;
        const overlapBottom = (wall.y + wall.h) - (this.y - halfSize);

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
            this.vx = -this.vx;
            // Push out
            if (minOverlap === overlapLeft) this.x -= overlapLeft;
            else this.x += overlapRight;
        } else {
            this.vy = -this.vy;
            // Push out
            if (minOverlap === overlapTop) this.y -= overlapTop;
            else this.y += overlapBottom;
        }

        return true;
    }

    draw(ctx) {
        if (Assets.loaded) {
            // Draw enemy bullets as simple circles or different sprite if we had one
            // For now, reuse bullet sprite but maybe tint it? 
            // Actually, let's just draw a circle for enemy bullets to distinguish clearly
            if (this.isEnemy) {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
                ctx.fill();
            } else {
                Assets.draw(ctx, Assets.BULLET, this.x, this.y, 16, 16);
            }
        } else {
            super.draw(ctx);
        }
    }
}
