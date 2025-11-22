import { Assets } from './Assets.js';

export class GameMap {
    constructor() {
        this.chunkSize = 1000;
        this.chunks = new Map(); // "x,y" -> [walls]
        this.walls = []; // Active walls for collision
    }

    update(player) {
        // Determine current chunk
        const cx = Math.floor(player.x / this.chunkSize);
        const cy = Math.floor(player.y / this.chunkSize);

        // Load/Generate chunks around player (3x3 grid)
        this.walls = [];
        for (let x = cx - 1; x <= cx + 1; x++) {
            for (let y = cy - 1; y <= cy + 1; y++) {
                const key = `${x},${y}`;
                if (!this.chunks.has(key)) {
                    this.chunks.set(key, this.generateChunk(x, y));
                }
                this.walls.push(...this.chunks.get(key));
            }
        }
    }

    generateChunk(cx, cy) {
        const walls = [];
        const baseX = cx * this.chunkSize;
        const baseY = cy * this.chunkSize;

        // Randomly place obstacles
        const count = 5 + Math.floor(Math.random() * 5); // 5-10 obstacles per chunk

        for (let i = 0; i < count; i++) {
            const w = 64 + Math.random() * 128;
            const h = 64 + Math.random() * 128;
            const x = baseX + Math.random() * (this.chunkSize - w);
            const y = baseY + Math.random() * (this.chunkSize - h);

            // Don't spawn on top of origin (0,0) to avoid trapping player at start
            if (Math.abs(x) < 200 && Math.abs(y) < 200) continue;

            walls.push({ x, y, w, h });
        }
        return walls;
    }

    draw(ctx, camera, world) {
        if (!Assets.loaded) return;

        // Only draw walls that are on screen
        const viewX = camera.x;
        const viewY = camera.y;
        const viewW = camera.width;
        const viewH = camera.height;

        // Default fallback if world not passed (prevent crash)
        const wallColor = world ? world.colors.wall : '#34495e';
        const topColor = world ? world.colors.wallTop : '#ecf0f1';

        this.walls.forEach(wall => {
            if (wall.x + wall.w > viewX && wall.x < viewX + viewW &&
                wall.y + wall.h > viewY && wall.y < viewY + viewH) {

                // Tiling logic
                const tileSize = 32;
                for (let x = wall.x; x < wall.x + wall.w; x += tileSize) {
                    for (let y = wall.y; y < wall.y + wall.h; y += tileSize) {
                        const w = Math.min(tileSize, wall.x + wall.w - x);
                        const h = Math.min(tileSize, wall.y + wall.h - y);

                        // Base Sprite
                        ctx.drawImage(
                            Assets.image,
                            Assets.WALL.x, Assets.WALL.y, w, h,
                            x, y, w, h
                        );

                        // Theme Tint
                        ctx.fillStyle = wallColor;
                        ctx.globalCompositeOperation = 'multiply';
                        ctx.fillRect(x, y, w, h);
                        ctx.globalCompositeOperation = 'source-over';

                        // Top Highlight
                        if (y === wall.y) {
                            ctx.fillStyle = topColor;
                            ctx.fillRect(x, y, w, 2);
                        }
                    }
                }
            }
        });
    }

    checkCollision(entity) {
        const halfSize = entity.size / 2;
        const entityLeft = entity.x - halfSize;
        const entityRight = entity.x + halfSize;
        const entityTop = entity.y - halfSize;
        const entityBottom = entity.y + halfSize;

        for (const wall of this.walls) {
            if (entityRight > wall.x &&
                entityLeft < wall.x + wall.w &&
                entityBottom > wall.y &&
                entityTop < wall.y + wall.h) {
                return wall;
            }
        }
        return null;
    }

    resolveCollision(entity) {
        const wall = this.checkCollision(entity);
        if (!wall) return false;

        const halfSize = entity.size / 2;

        const overlapLeft = (entity.x + halfSize) - wall.x;
        const overlapRight = (wall.x + wall.w) - (entity.x - halfSize);
        const overlapTop = (entity.y + halfSize) - wall.y;
        const overlapBottom = (wall.y + wall.h) - (entity.y - halfSize);

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapLeft) entity.x -= overlapLeft;
        else if (minOverlap === overlapRight) entity.x += overlapRight;
        else if (minOverlap === overlapTop) entity.y -= overlapTop;
        else if (minOverlap === overlapBottom) entity.y += overlapBottom;

        return true;
    }
}
