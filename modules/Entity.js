export class Entity {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.markedForDeletion = false;
    }

    update(dt) {
        // Base update logic
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }

    // Simple AABB Collision
    collidesWith(other) {
        return (
            this.x - this.size / 2 < other.x + other.size / 2 &&
            this.x + this.size / 2 > other.x - other.size / 2 &&
            this.y - this.size / 2 < other.y + other.size / 2 &&
            this.y + this.size / 2 > other.y - other.size / 2
        );
    }
}
