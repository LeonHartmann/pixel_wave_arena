import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { Assets } from './Assets.js';
import { Persistence } from './Persistence.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 28, '#0f0'); 
        this.speed = 200;
        this.hp = 100;
        this.maxHp = 100;

        // Combat Stats
        this.baseFireRate = 0.5;
        this.fireRateBonus = 0;
        this.fireRate = 0.5;
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
        this.fireRate = this.baseFireRate / (1 + this.fireRateBonus);
        this.fireRate = Math.max(0.05, this.fireRate);
    }

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return;
        this.hp -= amount;
        this.invincibleTimer = 1.0;
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
            this.isFlashing = Math.floor(this.invincibleTimer * 10) % 2 === 0;
        } else {
            this.isFlashing = false;
        }

        // Regeneration
        if (this.regenRate > 0 && this.hp < this.maxHp) {
            this.hp += this.regenRate * dt;
            if (this.hp > this.maxHp) this.hp = this.maxHp;
        }

        const axis = input.getAxis();

        // Move
        this.x += axis.x * this.speed * dt;
        if (map) map.resolveCollision(this);
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

        // Fire Aura (Upgrade)
        if (this.hasFireAura) {
            this.fireAuraTimer -= dt;
            if (this.fireAuraTimer <= 0) {
                this.fireAuraTimer = 0.5;
                enemies.forEach(enemy => {
                    const dx = enemy.x - this.x;
                    const dy = enemy.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < this.fireAuraRange) {
                        enemy.hp -= this.fireAuraDamage;
                    }
                });
            }
        }
        
        // Orbitals Logic
        if (this.orbitalCount > 0) {
            this.orbitalAngle += 2 * dt;
            const angleStep = (Math.PI * 2) / this.orbitalCount;
            for (let i = 0; i < this.orbitalCount; i++) {
                const angle = this.orbitalAngle + i * angleStep;
                const ox = this.x + Math.cos(angle) * this.orbitalRadius;
                const oy = this.y + Math.sin(angle) * this.orbitalRadius;
                enemies.forEach(enemy => {
                    const dx = enemy.x - ox;
                    const dy = enemy.y - oy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 24) { 
                        enemy.hp -= this.orbitalDamage * dt * 2;
                    }
                });
            }
        }
    }

    draw(ctx) {
        const data = Persistence.getData();
        const loadout = data.loadout || {};

        // Resolve Aura ID from UID
        let auraId = null;
        if (loadout.auraEffect) {
            const item = Persistence.getItemByUid(loadout.auraEffect);
            if (item) auraId = item.id;
        }

        // 1. DRAW COSMETIC AURAS (Behind Player)
        if (auraId) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over'; // Draw behind player
            
            const time = Date.now() / 1000; // Seconds
            
            if (auraId === 'a_sparkles') {
                // Rainbow Sparkles: Floating stars
                const count = 6;
                for (let i = 0; i < count; i++) {
                    const speed = 1.5;
                    const angle = (Math.PI * 2 * i) / count + time * speed;
                    const r = 28 + Math.sin(time * 3 + i) * 3; // Breathe radius
                    const px = this.x + Math.cos(angle) * r;
                    const py = this.y + Math.sin(angle) * r - 10 + Math.sin(time * 2 + i) * 5; // Float Y
                    
                    ctx.save();
                    ctx.translate(px, py);
                    ctx.rotate(time * 2 + i); // Spin star
                    ctx.fillStyle = `hsl(${(i * 60 + time * 100) % 360}, 100%, 60%)`;
                    
                    // Draw diamond shape (star)
                    ctx.beginPath();
                    ctx.moveTo(0, -4);
                    ctx.lineTo(3, 0);
                    ctx.lineTo(0, 4);
                    ctx.lineTo(-3, 0);
                    ctx.fill();
                    ctx.restore();
                }
            } else if (auraId === 'a_fire') {
                // Burning Ring: Rising consistent flames
                const count = 12;
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 * i) / count + time * 0.5;
                    // Vary radius to make it look like organic fire ring
                    const r = 26 + Math.sin(time * 10 + i * 2) * 2; 
                    
                    const px = this.x + Math.cos(angle) * r;
                    const py = this.y + Math.sin(angle) * r * 0.8; // Elliptical perspective

                    // Particles rise up
                    const rise = (Math.sin(time * 5 + i * 3) + 1) * 0.5; // 0 to 1
                    const yOffset = -rise * 15; 
                    
                    const alpha = 1 - rise; // Fade as it rises
                    const size = 4 + (1-rise) * 3; // Shrink as it rises

                    ctx.fillStyle = `rgba(255, ${100 + rise * 100}, 0, ${alpha})`;
                    ctx.fillRect(px - size/2, py + yOffset - size/2, size, size);
                }
            } else if (auraId === 'a_void') {
                // Void: Dark ground portal + spiraling particles
                ctx.save();
                
                // Ground Shadow/Portal
                ctx.translate(this.x, this.y + 10);
                ctx.scale(1, 0.4); // Flatten to ellipse
                ctx.beginPath();
                ctx.arc(0, 0, 35 + Math.sin(time * 2) * 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(20, 0, 40, 0.6)';
                ctx.fill();
                ctx.restore();

                // Spiraling Particles
                const count = 10;
                for (let i = 0; i < count; i++) {
                    const t = (time * 0.5 + i / count) % 1; // 0 to 1 loop
                    const r = 40 * (1 - t); // Spirals in
                    const angle = t * Math.PI * 4 + (i * (Math.PI*2/count)); 
                    
                    const px = this.x + Math.cos(angle) * r;
                    const py = this.y + Math.sin(angle) * r - t * 20; // Rise slightly as they spiral in

                    ctx.fillStyle = `rgba(75, 0, 130, ${t})`; // Fade in as they get closer? Or fade out? Let's keep alpha based on life
                    ctx.fillRect(px - 2, py - 2, 4, 4);
                }
            }
            ctx.restore();
        }

        // Draw Fire Aura (Upgrade Skill)
        if (this.hasFireAura) {
            const particleCount = 30;
            const angleStep = (Math.PI * 2) / particleCount;
            const time = Date.now() / 200;
            for (let i = 0; i < particleCount; i++) {
                const angle = i * angleStep + time;
                const flicker = Math.sin(time * 5 + i) * 5;
                const r = this.fireAuraRange + flicker;
                const px = this.x + Math.cos(angle) * r;
                const py = this.y + Math.sin(angle) * r;
                const colors = ['#e74c3c', '#e67e22', '#f1c40f'];
                const color = colors[Math.floor(Math.abs(Math.sin(i * 13 + time)) * 3)];
                ctx.fillStyle = color;
                ctx.fillRect(px - 2, py - 2, 4, 4);
            }
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
                ctx.rotate(angle);
                ctx.fillStyle = '#9b59b6';
                ctx.fillRect(-6, -6, 12, 12);
                ctx.fillStyle = '#8e44ad';
                ctx.fillRect(-4, -4, 8, 8);
                ctx.restore();
            }
        }
        
        if (this.isFlashing) return;

        // Draw Player Sprite
        if (Assets.loaded) {
            let skinId = null;
            if (loadout.characterSkin) {
                const item = Persistence.getItemByUid(loadout.characterSkin);
                if (item) skinId = item.id;
            }

            let sprite = Assets.PLAYER;
            if (skinId) {
                if (skinId === 'c_ninja') sprite = { x: 0, y: 64, w: 32, h: 32 };
                else if (skinId === 'c_robot') sprite = { x: 32, y: 64, w: 32, h: 32 };
                else if (skinId === 'c_knight') sprite = { x: 64, y: 64, w: 32, h: 32 };
                else if (skinId === 'c_voidwalker') sprite = { x: 96, y: 64, w: 32, h: 32 };
            }
            Assets.draw(ctx, sprite, this.x, this.y, 32, 32);
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
        const spacing = 12;
        const baseAngle = Math.atan2(target.y - this.y, target.x - this.x);
        
        const data = Persistence.getData();
        let weaponSkinId = null;
        if (data.loadout && data.loadout.weaponSkin) {
            const item = Persistence.getItemByUid(data.loadout.weaponSkin);
            if (item) weaponSkinId = item.id;
        }

        // Crit Calculation
        const isCrit = Math.random() * 100 < (this.critChance || 0);
        const finalDamage = this.damage * (isCrit ? 2.0 : 1.0);

        for (let i = 0; i < count; i++) {
            const offset = (i - (count - 1) / 2) * spacing;
            const offsetX = Math.cos(baseAngle + Math.PI / 2) * offset;
            const offsetY = Math.sin(baseAngle + Math.PI / 2) * offset;
            const sx = this.x + offsetX;
            const sy = this.y + offsetY;
            const tx = sx + Math.cos(baseAngle) * 100;
            const ty = sy + Math.sin(baseAngle) * 100;

            const p = new Projectile(sx, sy, tx, ty, finalDamage, this.hasFrostShot, this.hasExplosiveShots, false, weaponSkinId);
            p.ricochetCount = this.ricochetCount; 
            
            // Visual cue for crit
            if (isCrit) {
                p.width = 12; // Bigger
                p.height = 12;
            }

            projectiles.push(p);
        }
    }
}
