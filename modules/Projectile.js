import { Entity } from './Entity.js';
import { Assets } from './Assets.js';

export class Projectile extends Entity {
    constructor(x, y, targetX, targetY, damage, isFrost, isExplosive, isEnemy, skin) {
        // Color: Enemy=Orange, Explosive=Red, Frost=Blue, Normal=Yellow
        const color = isEnemy ? '#e67e22' : (isExplosive ? '#e74c3c' : (isFrost ? '#3498db' : '#ff0'));
        super(x, y, 8, color);

        this.speed = isEnemy ? 300 : 600; // Enemy bullets slower
        this.damage = damage || 10;
        this.isFrost = isFrost;
        this.isExplosive = isExplosive;
        this.isEnemy = isEnemy;
        this.skin = skin; // Weapon Skin ID

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
        this.trail = []; // For visual effects
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.lifeTime -= dt;

        // Trail Logic for skins
        if (this.skin && !this.isEnemy) {
            this.trail.push({ x: this.x, y: this.y, life: 0.2 });
            // Limit trail size
            if (this.trail.length > 10) this.trail.shift();
            // Decay trail
            this.trail.forEach(t => t.life -= dt);
            this.trail = this.trail.filter(t => t.life > 0);
        }

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
                // SKIN EFFECTS
                if (this.skin === 'w_golden') {
                    // Gold Trail
                    ctx.save();
                    ctx.lineWidth = 4;
                    this.trail.forEach((t, i) => {
                        ctx.strokeStyle = `rgba(241, 196, 15, ${t.life * 2})`;
                        if (i > 0) {
                            ctx.beginPath();
                            ctx.moveTo(this.trail[i-1].x, this.trail[i-1].y);
                            ctx.lineTo(t.x, t.y);
                            ctx.stroke();
                        }
                    });
                    ctx.restore();
                    // Projectile
                    ctx.fillStyle = '#f1c40f';
                    ctx.fillRect(this.x - 6, this.y - 6, 12, 12);
                    return;
                }
                else if (this.skin === 'w_void') {
                    // Void Trail (Black/Purple)
                    ctx.save();
                    ctx.lineWidth = 6;
                    this.trail.forEach((t, i) => {
                        ctx.strokeStyle = `rgba(75, 0, 130, ${t.life * 3})`;
                        if (i > 0) {
                            ctx.beginPath();
                            ctx.moveTo(this.trail[i-1].x, this.trail[i-1].y);
                            ctx.lineTo(t.x, t.y);
                            ctx.stroke();
                        }
                    });
                    ctx.restore();
                    // Projectile
                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#8e44ad';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    return;
                }
                else if (this.skin === 'w_pixel') {
                    // Glitchy Rects
                    ctx.fillStyle = Math.random() > 0.5 ? '#e74c3c' : '#3498db';
                    ctx.fillRect(this.x - 6, this.y - 6, 12, 12);
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
                    return;
                }
                else if (this.skin === 'w_neon') {
                    // Neon Green Trail
                    ctx.save();
                    ctx.lineWidth = 2;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#0f0';
                    ctx.strokeStyle = '#0f0';
                    ctx.beginPath();
                    if (this.trail.length > 0) ctx.moveTo(this.trail[0].x, this.trail[0].y);
                    this.trail.forEach(t => ctx.lineTo(t.x, t.y));
                    ctx.lineTo(this.x, this.y);
                    ctx.stroke();
                    ctx.restore();
                    
                    ctx.fillStyle = '#0f0';
                    ctx.fillRect(this.x - 4, this.y - 4, 8, 8);
                    return;
                }

                // Default
                Assets.draw(ctx, Assets.BULLET, this.x, this.y, 16, 16);
            }
        } else {
            super.draw(ctx);
        }
    }
}