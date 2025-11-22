import { SpriteGenerator } from './SpriteGenerator.js';

export const Assets = {
    sprites: null,
    loaded: false,

    // Sprite Definitions (x, y, width, height)
    PLAYER: { x: 0, y: 0, w: 32, h: 32 },
    ENEMY: { x: 32, y: 0, w: 32, h: 32 },
    WALL: { x: 64, y: 0, w: 32, h: 32 },
    FLOOR: { x: 96, y: 0, w: 32, h: 32 },
    BULLET: { x: 128, y: 0, w: 16, h: 16 },
    SHOOTER: { x: 144, y: 0, w: 32, h: 32 }, // Added SHOOTER
    TANK: { x: 176, y: 0, w: 32, h: 32 },   // Added TANK

    async load() { // Changed to async function
        const sheet = SpriteGenerator.generate();
        this.image = new Image();
        this.image.src = sheet.toDataURL();

        const bossCanvas = SpriteGenerator.generateBoss(); 
        this.BOSS_IMAGE = new Image();
        this.BOSS_IMAGE.src = bossCanvas.toDataURL();

        this.icons = SpriteGenerator.generateIcons();
        this.worldPreviews = SpriteGenerator.generateWorldPreviews();

        return new Promise(resolve => {
            let loadedCount = 0;
            const checkLoad = () => {
                loadedCount++;
                if (loadedCount === 2) {
                    this.loaded = true;
                    resolve();
                }
            };
            this.image.onload = checkLoad;
            this.BOSS_IMAGE.onload = checkLoad;
        });
    },

    draw(ctx, sprite, x, y, w, h) {
        if (!this.loaded) return;

        // Use this.image for general sprites
        ctx.drawImage(
            this.image,
            sprite.x, sprite.y, sprite.w || 32, sprite.h || 32,
            x - w / 2, y - h / 2, w, h
        );
    },

    drawBoss(ctx, x, y, w, h) {
        if (!this.loaded) return;
        ctx.drawImage(this.BOSS_IMAGE, 0, 0, 64, 64, x, y, w, h);
    }
};
