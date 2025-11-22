export class Explosion {
    constructor(x, y, size = 50, color = '#e74c3c') {
        this.x = x;
        this.y = y;
        this.size = 10; // Start small
        this.maxSize = size;
        this.color = color;
        this.lifeTime = 0.4; // Duration in seconds
        this.maxLife = 0.4;
        this.markedForDeletion = false;
        
        // Particles
        this.particles = [];
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 100,
                vy: Math.sin(angle) * 100,
                life: 0.5
            });
        }
    }

    update(dt) {
        this.lifeTime -= dt;
        
        // Expand shockwave
        const progress = 1 - (this.lifeTime / this.maxLife);
        this.size = 10 + (this.maxSize - 10) * progress;

        // Update particles
        this.particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
        });

        if (this.lifeTime <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        const progress = 1 - (this.lifeTime / this.maxLife);
        const alpha = 1 - progress;

        ctx.save();
        
        // Draw Shockwave
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha * 0.5;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = alpha;
        ctx.stroke();

        // Draw Particles
        ctx.fillStyle = '#f1c40f';
        this.particles.forEach(p => {
            if (p.life > 0) {
                ctx.globalAlpha = p.life / 0.5;
                ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
            }
        });

        ctx.restore();
    }
}
