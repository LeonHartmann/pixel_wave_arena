export class Explosion {
    constructor(x, y, size = 50, color = '#e74c3c', type = 'default') {
        this.x = x;
        this.y = y;
        this.size = 10; // Start small
        this.maxSize = size;
        this.color = color;
        this.type = type; // 'default', 'k_gold', 'k_confetti', 'k_blackhole', 'k_pixel'
        this.lifeTime = 0.4; // Duration in seconds
        this.maxLife = 0.4;
        this.markedForDeletion = false;
        
        // Particles
        this.particles = [];
        const pCount = (type === 'k_confetti') ? 20 : 8;
        
        for (let i = 0; i < pCount; i++) {
            const angle = (Math.PI * 2 * i) / pCount;
            const speed = (type === 'k_blackhole') ? -50 : 100; // Black hole sucks in
            this.particles.push({
                x: (type === 'k_blackhole') ? x + Math.cos(angle)*50 : x,
                y: (type === 'k_blackhole') ? y + Math.sin(angle)*50 : y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5,
                color: this.getParticleColor(type)
            });
        }
    }

    getParticleColor(type) {
        if (type === 'k_gold') return '#f1c40f';
        if (type === 'k_confetti') {
            const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        if (type === 'k_blackhole') return '#4b0082';
        if (type === 'k_pixel') return '#fff';
        return '#f1c40f'; // Default spark
    }

    update(dt) {
        this.lifeTime -= dt;
        
        // Expand shockwave
        const progress = 1 - (this.lifeTime / this.maxLife);
        this.size = 10 + (this.maxSize - 10) * progress;

        // Update particles
        this.particles.forEach(p => {
            if (this.type === 'k_blackhole') {
                // Accelerate inwards
                const dx = this.x - p.x;
                const dy = this.y - p.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > 5) {
                    p.x += (dx/dist) * 100 * dt;
                    p.y += (dy/dist) * 100 * dt;
                }
            } else {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
            }
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
        if (this.type !== 'k_blackhole') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha * 0.5;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = alpha;
            ctx.stroke();
        } else {
            // Black hole drawing
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.strokeStyle = '#8e44ad';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw Particles
        this.particles.forEach(p => {
            if (p.life > 0) {
                ctx.globalAlpha = p.life / 0.5;
                ctx.fillStyle = p.color;
                if (this.type === 'k_gold') {
                    // Draw coin shape
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
                }
            }
        });

        ctx.restore();
    }
}