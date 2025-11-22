export class InputHandler {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mousedown', () => {
            this.mouse.down = true;
        });

        window.addEventListener('mouseup', () => {
            this.mouse.down = false;
        });
    }

    isKeyDown(code) {
        return !!this.keys[code];
    }

    getMouseWorld(camera) {
        return camera.toWorld(this.mouse.x, this.mouse.y);
    }

    getAxis() {
        const x = (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight') ? 1 : 0) -
            (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft') ? 1 : 0);
        const y = (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown') ? 1 : 0) -
            (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp') ? 1 : 0);

        // Normalize vector to prevent faster diagonal movement
        if (x !== 0 && y !== 0) {
            const invLength = 1 / Math.sqrt(x * x + y * y);
            return { x: x * invLength, y: y * invLength };
        }

        return { x, y };
    }
}
