export class Camera {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
    }

    follow(target) {
        // Center the target
        this.x = target.x - this.width / 2;
        this.y = target.y - this.height / 2;
    }

    // Convert screen coordinates (e.g. mouse) to world coordinates
    toWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }
}
