export const SpriteGenerator = {
    generate() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128; // Expanded to fit player skins
        const ctx = canvas.getContext('2d');

        // Helper to draw pixel rects
        const drawRect = (x, y, w, h, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
        };

        // 1. PLAYER (0, 0, 32, 32) - Green Space Marine (Default)
        // Base
        drawRect(0, 0, 32, 32, 'rgba(0,0,0,0)'); // Clear
        drawRect(8, 4, 16, 24, '#2ecc71'); // Body
        drawRect(10, 2, 12, 10, '#27ae60'); // Helmet
        drawRect(12, 4, 8, 4, '#f1c40f'); // Visor
        drawRect(4, 10, 6, 14, '#27ae60'); // Left Arm
        drawRect(22, 10, 6, 14, '#27ae60'); // Right Arm
        drawRect(22, 18, 8, 4, '#95a5a6'); // Gun
        drawRect(8, 28, 6, 4, '#2c3e50'); // Left Leg
        drawRect(18, 28, 6, 4, '#2c3e50'); // Right Leg

        // 2. ENEMY (32, 0, 32, 32) - Red Skull Drone
        drawRect(32, 0, 32, 32, 'rgba(0,0,0,0)');
        drawRect(36, 4, 24, 20, '#c0392b'); // Skull
        drawRect(40, 8, 6, 6, '#000'); // Left Eye
        drawRect(50, 8, 6, 6, '#000'); // Right Eye
        drawRect(42, 9, 2, 2, '#f00'); // Pupil
        drawRect(52, 9, 2, 2, '#f00'); // Pupil
        drawRect(40, 18, 16, 4, '#000'); // Mouth
        drawRect(42, 18, 2, 4, '#fff'); // Tooth
        drawRect(46, 18, 2, 4, '#fff'); // Tooth
        drawRect(50, 18, 2, 4, '#fff'); // Tooth
        drawRect(34, 20, 4, 8, '#7f8c8d'); // Thruster L
        drawRect(58, 20, 4, 8, '#7f8c8d'); // Thruster R

        // 3. WALL (64, 0, 32, 32) - Tech Wall
        drawRect(64, 0, 32, 32, '#34495e'); // Base
        drawRect(64, 0, 32, 2, '#ecf0f1'); // Top Highlight
        drawRect(64, 30, 32, 2, '#2c3e50'); // Bottom Shadow
        drawRect(64, 0, 2, 32, '#2c3e50'); // Left Shadow
        drawRect(94, 0, 2, 32, '#2c3e50'); // Right Shadow
        // Tech details
        drawRect(70, 8, 10, 4, '#2c3e50');
        drawRect(84, 8, 4, 4, '#e74c3c'); // Red light
        drawRect(70, 20, 18, 4, '#2c3e50');

        // 4. FLOOR (96, 0, 32, 32) - Grid Plate
        drawRect(96, 0, 32, 32, '#333'); // Brighter floor
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.strokeRect(97, 1, 30, 30); // Border
        drawRect(100, 4, 2, 2, '#666'); // Rivet
        drawRect(124, 4, 2, 2, '#666');
        drawRect(100, 28, 2, 2, '#666');
        drawRect(124, 28, 2, 2, '#666');

        // 5. BULLET (128, 0, 16, 16) - Plasma Ball
        drawRect(128, 0, 16, 16, 'rgba(0,0,0,0)');
        drawRect(132, 4, 8, 8, '#f1c40f'); // Core
        drawRect(130, 6, 12, 4, '#f39c12'); // Glow H
        drawRect(134, 2, 4, 12, '#f39c12'); // Glow V

        // 6. SHOOTER (144, 0, 32, 32) - Purple Sniper
        drawRect(144, 0, 32, 32, 'rgba(0,0,0,0)');
        drawRect(152, 6, 16, 20, '#8e44ad'); // Body
        drawRect(154, 8, 12, 6, '#000'); // Visor
        drawRect(156, 10, 8, 2, '#f1c40f'); // Eye
        drawRect(160, 18, 12, 4, '#95a5a6'); // Gun Barrel
        drawRect(148, 20, 4, 8, '#8e44ad'); // Arm L
        drawRect(170, 20, 4, 8, '#8e44ad'); // Arm R

        // 7. TANK (176, 0, 32, 32) - Blue Heavy
        drawRect(176, 0, 32, 32, 'rgba(0,0,0,0)');
        drawRect(180, 4, 24, 24, '#2c3e50'); // Armor
        drawRect(184, 8, 16, 16, '#34495e'); // Core
        drawRect(188, 12, 8, 8, '#3498db'); // Light
        drawRect(178, 20, 4, 10, '#7f8c8d'); // Tread L
        drawRect(202, 20, 4, 10, '#7f8c8d'); // Tread R

        // 8. SWARM (208, 0, 16, 16) - Small Green Bug
        drawRect(208, 0, 16, 16, 'rgba(0,0,0,0)');
        drawRect(210, 4, 12, 8, '#27ae60'); // Body
        drawRect(208, 6, 2, 4, '#2ecc71'); // Wing L
        drawRect(222, 6, 2, 4, '#2ecc71'); // Wing R
        drawRect(212, 6, 2, 2, '#000'); // Eye L
        drawRect(218, 6, 2, 2, '#000'); // Eye R
        drawRect(214, 10, 4, 2, '#f1c40f'); // Stinger

        // 9. HEALER (224, 0, 32, 32) - Gold Support Unit
        drawRect(224, 0, 32, 32, 'rgba(0,0,0,0)');
        drawRect(232, 6, 16, 20, '#f39c12'); // Body
        drawRect(234, 10, 12, 12, '#f1c40f'); // Core
        // Cross symbol
        drawRect(238, 12, 4, 8, '#fff'); // Vertical
        drawRect(236, 14, 8, 4, '#fff'); // Horizontal
        drawRect(228, 18, 4, 10, '#f39c12'); // Arm L
        drawRect(248, 18, 4, 10, '#f39c12'); // Arm R
        // Halo/healing aura indicator
        drawRect(230, 4, 2, 2, '#fff');
        drawRect(246, 4, 2, 2, '#fff');

        // 10. SPLITTER (0, 32, 32, 32) - Orange Slime
        drawRect(0, 32, 32, 32, 'rgba(0,0,0,0)');
        drawRect(6, 38, 20, 16, '#e67e22'); // Body
        drawRect(8, 36, 16, 4, '#d35400'); // Top blob
        drawRect(10, 42, 4, 4, '#000'); // Eye L
        drawRect(18, 42, 4, 4, '#000'); // Eye R
        drawRect(11, 43, 2, 2, '#f39c12'); // Pupil L
        drawRect(19, 43, 2, 2, '#f39c12'); // Pupil R
        drawRect(12, 48, 8, 4, '#d35400'); // Mouth
        // Drips
        drawRect(8, 54, 2, 4, '#e67e22');
        drawRect(22, 54, 2, 4, '#e67e22');

        // 11. TELEPORTER (32, 32, 32, 32) - Purple Phantom
        drawRect(32, 32, 32, 32, 'rgba(0,0,0,0)');
        drawRect(40, 36, 16, 20, '#9b59b6'); // Body
        drawRect(42, 38, 12, 16, '#8e44ad'); // Core
        drawRect(44, 42, 4, 4, '#fff'); // Eye L glow
        drawRect(52, 42, 4, 4, '#fff'); // Eye R glow
        drawRect(46, 44, 2, 2, '#e74c3c'); // Pupil L
        drawRect(54, 44, 2, 2, '#e74c3c'); // Pupil R
        // Phasing effect (jagged edges)
        drawRect(38, 40, 2, 2, '#9b59b6');
        drawRect(60, 40, 2, 2, '#9b59b6');
        drawRect(36, 48, 2, 2, '#9b59b6');
        drawRect(62, 48, 2, 2, '#9b59b6');
        // Trail particles
        drawRect(44, 58, 2, 2, '#8e44ad');
        drawRect(54, 58, 2, 2, '#8e44ad');

        // === NEW PLAYER SKINS (Row 3: y=64) ===

        // 12. NINJA (0, 64, 32, 32)
        drawRect(0, 64, 32, 32, 'rgba(0,0,0,0)');
        drawRect(8, 68, 16, 24, '#2c3e50'); // Dark Body
        drawRect(10, 66, 12, 10, '#34495e'); // Hood
        drawRect(12, 70, 8, 2, '#ecf0f1'); // Eyes slit
        drawRect(4, 74, 6, 14, '#2c3e50'); // Arm L
        drawRect(22, 74, 6, 14, '#2c3e50'); // Arm R
        // Scarf/Sash
        drawRect(10, 80, 12, 4, '#c0392b'); 
        drawRect(6, 82, 4, 8, '#c0392b'); // Scarf tail
        // Katana/Gun
        drawRect(24, 78, 4, 16, '#bdc3c7'); // Blade
        drawRect(22, 90, 8, 4, '#95a5a6'); // Handle

        // 13. ROBOT (32, 64, 32, 32)
        drawRect(32, 64, 32, 32, 'rgba(0,0,0,0)');
        drawRect(40, 68, 16, 24, '#7f8c8d'); // Grey Body
        drawRect(42, 66, 12, 10, '#95a5a6'); // Head
        drawRect(44, 70, 2, 2, '#e74c3c'); // Eye L
        drawRect(50, 70, 2, 2, '#e74c3c'); // Eye R
        drawRect(36, 74, 6, 14, '#7f8c8d'); // Arm L
        drawRect(54, 74, 6, 14, '#7f8c8d'); // Arm R
        // Tech details
        drawRect(44, 80, 8, 6, '#3498db'); // Chest core
        drawRect(32, 68, 4, 10, '#95a5a6'); // Antenna L
        drawRect(60, 68, 4, 10, '#95a5a6'); // Antenna R

        // 14. KNIGHT (64, 64, 32, 32)
        drawRect(64, 64, 32, 32, 'rgba(0,0,0,0)');
        drawRect(72, 68, 16, 24, '#f1c40f'); // Gold Armor Body
        drawRect(74, 66, 12, 10, '#f39c12'); // Helm
        // Visor Cross
        drawRect(78, 66, 4, 10, '#000');
        drawRect(74, 70, 12, 2, '#000');
        drawRect(68, 74, 6, 14, '#f1c40f'); // Arm L
        drawRect(86, 74, 6, 14, '#f1c40f'); // Arm R
        drawRect(72, 92, 6, 4, '#e67e22'); // Leg L
        drawRect(82, 92, 6, 4, '#e67e22'); // Leg R
        // Cape
        drawRect(74, 74, 12, 18, '#c0392b'); 

        // 15. VOIDWALKER (96, 64, 32, 32)
        drawRect(96, 64, 32, 32, 'rgba(0,0,0,0)');
        drawRect(104, 68, 16, 24, '#2c3e50'); // Dark Body
        drawRect(106, 66, 12, 10, '#8e44ad'); // Hood
        drawRect(108, 70, 2, 2, '#fff'); // Glowing Eye L
        drawRect(114, 70, 2, 2, '#fff'); // Glowing Eye R
        drawRect(100, 74, 6, 14, '#2c3e50'); // Arm L
        drawRect(118, 74, 6, 14, '#2c3e50'); // Arm R
        // Void Particles
        drawRect(98, 66, 2, 2, '#9b59b6');
        drawRect(124, 80, 2, 2, '#9b59b6');
        drawRect(102, 90, 2, 2, '#9b59b6');
        // Energy Weapon
        drawRect(118, 82, 8, 4, '#9b59b6');

        return canvas;
    },

    generateBoss() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const drawRect = (x, y, w, h, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
        };

        // Big Red Skull
        drawRect(8, 8, 48, 40, '#c0392b'); // Skull
        drawRect(16, 16, 12, 12, '#000'); // Eye L
        drawRect(36, 16, 12, 12, '#000'); // Eye R
        drawRect(20, 20, 4, 4, '#f00'); // Pupil
        drawRect(40, 20, 4, 4, '#f00'); // Pupil

        // Crown
        drawRect(8, 0, 12, 8, '#f1c40f');
        drawRect(26, 0, 12, 8, '#f1c40f');
        drawRect(44, 0, 12, 8, '#f1c40f');
        drawRect(8, 6, 48, 4, '#f1c40f');

        // Mouth
        drawRect(16, 36, 32, 8, '#000');
        drawRect(20, 36, 4, 8, '#fff');
        drawRect(28, 36, 4, 8, '#fff');
        drawRect(36, 36, 4, 8, '#fff');

        return canvas;
    },

    generateIcons() {
        const icons = {};

        const createIcon = (drawFn) => {
            const c = document.createElement('canvas');
            c.width = 64;
            c.height = 64;
            const ctx = c.getContext('2d');
            const drawRect = (x, y, w, h, color) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            };
            drawFn(ctx, drawRect);
            return c.toDataURL();
        };

        icons.damage = createIcon((ctx, drawRect) => {
            // Sword
            drawRect(28, 10, 8, 30, '#bdc3c7'); // Blade
            drawRect(30, 10, 4, 30, '#ecf0f1'); // Shine
            drawRect(20, 40, 24, 6, '#f1c40f'); // Guard
            drawRect(30, 46, 4, 12, '#8e44ad'); // Hilt
        });

        icons.firerate = createIcon((ctx, drawRect) => {
            // Minigun / Bullets
            drawRect(10, 20, 12, 24, '#f1c40f'); // Bullet 1
            drawRect(26, 20, 12, 24, '#f1c40f'); // Bullet 2
            drawRect(42, 20, 12, 24, '#f1c40f'); // Bullet 3
            drawRect(12, 22, 4, 20, '#f39c12'); // Shading
            drawRect(28, 22, 4, 20, '#f39c12');
            drawRect(44, 22, 4, 20, '#f39c12');
        });

        icons.speed = createIcon((ctx, drawRect) => {
            // Winged Boot
            drawRect(10, 30, 30, 20, '#e67e22'); // Boot
            drawRect(30, 10, 24, 20, '#ecf0f1'); // Wing
            drawRect(30, 10, 4, 20, '#bdc3c7'); // Wing detail
        });

        icons.health = createIcon((ctx, drawRect) => {
            // Heart
            drawRect(10, 10, 20, 20, '#e74c3c'); // Left lobe
            drawRect(34, 10, 20, 20, '#e74c3c'); // Right lobe
            drawRect(10, 30, 44, 10, '#e74c3c'); // Body
            drawRect(20, 40, 24, 10, '#e74c3c'); // Tip
            drawRect(28, 50, 8, 8, '#e74c3c'); // Point
            drawRect(14, 14, 6, 6, '#fff'); // Shine
        });

        icons.range = createIcon((ctx, drawRect) => {
            // Scope
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(32, 32, 24, 0, Math.PI * 2);
            ctx.stroke();
            drawRect(30, 4, 4, 12, '#2ecc71'); // Top Tick
            drawRect(30, 48, 4, 12, '#2ecc71'); // Bottom Tick
            drawRect(4, 30, 12, 4, '#2ecc71'); // Left Tick
            drawRect(48, 30, 12, 4, '#2ecc71'); // Right Tick
            drawRect(30, 30, 4, 4, '#e74c3c'); // Dot
        });

        icons.fireaura = createIcon((ctx, drawRect) => {
            // Fire Ring
            ctx.strokeStyle = '#e67e22';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(32, 32, 20, 0, Math.PI * 2);
            ctx.stroke();

            // Flames
            drawRect(30, 8, 4, 12, '#f1c40f'); // Top
            drawRect(30, 44, 4, 12, '#f1c40f'); // Bottom
            drawRect(8, 30, 12, 4, '#f1c40f'); // Left
            drawRect(44, 30, 12, 4, '#f1c40f'); // Right

            // Core
            drawRect(28, 28, 8, 8, '#e74c3c');
        });

        icons.frostshot = createIcon((ctx, drawRect) => {
            // Snowflake / Ice Crystal
            drawRect(28, 4, 8, 56, '#3498db'); // Vertical
            drawRect(4, 28, 56, 8, '#3498db'); // Horizontal

            // Diagonals (simulated with rects)
            drawRect(16, 16, 8, 8, '#85c1e9');
            drawRect(40, 16, 8, 8, '#85c1e9');
            drawRect(16, 40, 8, 8, '#85c1e9');
            drawRect(40, 40, 8, 8, '#85c1e9');

            // Center
            drawRect(24, 24, 16, 16, '#ecf0f1');
        });

        icons.orbitals = createIcon((ctx, drawRect) => {
            // Central dot
            drawRect(28, 28, 8, 8, '#2ecc71');

            // Orbiting shields
            ctx.strokeStyle = '#9b59b6';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(32, 32, 20, 0, Math.PI * 2);
            ctx.stroke();

            drawRect(30, 8, 4, 8, '#8e44ad'); // Top
            drawRect(30, 48, 4, 8, '#8e44ad'); // Bottom
            drawRect(8, 30, 8, 4, '#8e44ad'); // Left
            drawRect(48, 30, 8, 4, '#8e44ad'); // Right
        });

        icons.explosive = createIcon((ctx, drawRect) => {
            // Bomb / Explosion
            drawRect(20, 20, 24, 24, '#2c3e50'); // Bomb body
            drawRect(24, 16, 16, 4, '#2c3e50'); // Top
            drawRect(28, 12, 8, 4, '#95a5a6'); // Cap

            // Fuse
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(32, 12);
            ctx.quadraticCurveTo(40, 4, 48, 8);
            ctx.stroke();

            // Spark
            drawRect(48, 6, 4, 4, '#f1c40f');

            // "Boom" marks
            drawRect(10, 30, 6, 4, '#e74c3c');
            drawRect(48, 30, 6, 4, '#e74c3c');
            drawRect(28, 48, 8, 4, '#e74c3c');
        });

        icons.ricochet = createIcon((ctx, drawRect) => {
            // Bouncing Arrow
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(10, 50);
            ctx.lineTo(30, 50);
            ctx.lineTo(50, 20);
            ctx.stroke();
            
            drawRect(46, 16, 8, 8, '#2ecc71'); // Arrowhead
        });

        icons.multishot = createIcon((ctx, drawRect) => {
            // Triple Shot
            drawRect(28, 30, 8, 20, '#f1c40f'); // Center
            drawRect(10, 30, 8, 20, '#f1c40f'); // Left
            drawRect(46, 30, 8, 20, '#f1c40f'); // Right
        });

        icons.regen = createIcon((ctx, drawRect) => {
            // Heart with +
            drawRect(16, 16, 32, 32, '#e74c3c'); // Heart box
            drawRect(28, 20, 8, 24, '#fff'); // Vertical
            drawRect(20, 28, 24, 8, '#fff'); // Horizontal
        });

        icons.thorns = createIcon((ctx, drawRect) => {
            // Spiky Ball
            drawRect(24, 24, 16, 16, '#7f8c8d'); // Core
            drawRect(28, 8, 8, 16, '#95a5a6'); // Top Spike
            drawRect(28, 40, 8, 16, '#95a5a6'); // Bottom Spike
            drawRect(8, 28, 16, 8, '#95a5a6'); // Left Spike
            drawRect(40, 28, 16, 8, '#95a5a6'); // Right Spike
        });

        icons.vampirism = createIcon((ctx, drawRect) => {
            // Fangs
            drawRect(16, 20, 32, 10, '#fff'); // Gums/Teeth base
            drawRect(20, 30, 6, 12, '#c0392b'); // Left Fang
            drawRect(38, 30, 6, 12, '#c0392b'); // Right Fang
        });

        icons.coin = createIcon((ctx, drawRect) => {
            // Gold Coin
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(32, 32, 24, 0, Math.PI * 2);
            ctx.fill();

            // Inner Ring
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Dollar Sign / Symbol
            drawRect(28, 16, 8, 32, '#d35400'); // Vertical
            drawRect(20, 20, 24, 6, '#d35400'); // Top bar
            drawRect(20, 38, 24, 6, '#d35400'); // Bottom bar
        });

        // --- SPECIFIC CHESTS ---
        icons.chest = createIcon((ctx, drawRect) => {
            // Chest (Default/Fallback)
            drawRect(8, 20, 48, 32, '#d35400'); 
            drawRect(8, 12, 48, 8, '#e67e22'); 
            drawRect(12, 12, 4, 40, '#95a5a6'); 
            drawRect(48, 12, 4, 40, '#95a5a6'); 
            drawRect(28, 24, 8, 8, '#f1c40f'); 
        });

        icons.chest_common = createIcon((ctx, drawRect) => {
            // Basic Wooden Crate
            drawRect(10, 18, 44, 34, '#8e44ad'); // Shadow
            drawRect(8, 16, 48, 32, '#d35400'); // Wood Body
            drawRect(8, 12, 48, 8, '#e67e22'); // Lid
            // Iron bands
            drawRect(12, 12, 6, 36, '#7f8c8d');
            drawRect(46, 12, 6, 36, '#7f8c8d');
            drawRect(28, 26, 8, 10, '#bdc3c7'); // Iron Lock
        });

        icons.chest_rare = createIcon((ctx, drawRect) => {
            // Silver / Steel Crate
            drawRect(10, 18, 44, 34, '#2c3e50'); // Shadow
            drawRect(8, 16, 48, 32, '#95a5a6'); // Silver Body
            drawRect(8, 12, 48, 8, '#bdc3c7'); // Lid
            // Blue Neon bands
            drawRect(12, 12, 6, 36, '#3498db');
            drawRect(46, 12, 6, 36, '#3498db');
            drawRect(28, 26, 8, 10, '#f1c40f'); // Gold Lock
            // Glow
            drawRect(14, 30, 4, 4, '#3498db');
            drawRect(46, 30, 4, 4, '#3498db');
        });

        icons.chest_epic = createIcon((ctx, drawRect) => {
            // Gold / Royal Crate
            drawRect(10, 18, 44, 34, '#d35400'); // Shadow
            drawRect(8, 16, 48, 32, '#f1c40f'); // Gold Body
            drawRect(8, 12, 48, 8, '#f39c12'); // Lid
            // Purple Gem bands
            drawRect(12, 12, 6, 36, '#8e44ad');
            drawRect(46, 12, 6, 36, '#8e44ad');
            drawRect(28, 26, 8, 10, '#9b59b6'); // Gem Lock
            // Sparkles
            drawRect(10, 10, 4, 4, '#fff');
            drawRect(50, 40, 4, 4, '#fff');
        });

        icons.chest_legendary = createIcon((ctx, drawRect) => {
            // Void / Mythic Crate
            drawRect(10, 18, 44, 34, '#000'); // Shadow
            drawRect(8, 16, 48, 32, '#2c3e50'); // Dark Body
            drawRect(8, 12, 48, 8, '#34495e'); // Lid
            // Glowing Red/Magma bands
            drawRect(12, 12, 6, 36, '#c0392b');
            drawRect(46, 12, 6, 36, '#c0392b');
            // Eye Lock
            drawRect(26, 24, 12, 12, '#000'); 
            drawRect(30, 28, 4, 4, '#e74c3c'); // Red Eye
            // Runes
            drawRect(16, 36, 4, 4, '#e74c3c');
            drawRect(44, 36, 4, 4, '#e74c3c');
            drawRect(30, 14, 4, 4, '#e74c3c');
        });

        // --- WEAPON SKINS ---
        icons.w_plasma = createIcon((ctx, drawRect) => {
            // Standard Plasma (Purple/Blue)
            drawRect(10, 20, 44, 24, '#2c3e50'); // Body
            drawRect(40, 24, 14, 8, '#3498db'); // Barrel
            drawRect(14, 24, 12, 12, '#34495e'); // Grip area
            drawRect(42, 26, 10, 4, '#ecf0f1'); // Shine
        });
        icons.w_golden = createIcon((ctx, drawRect) => {
            // Golden Gun
            drawRect(10, 20, 44, 24, '#f1c40f'); // Gold Body
            drawRect(40, 24, 14, 8, '#f39c12'); // Barrel shade
            drawRect(14, 24, 12, 12, '#d35400'); // Grip
            drawRect(10, 20, 44, 4, '#f39c12'); // Top shade
        });
        icons.w_neon = createIcon((ctx, drawRect) => {
            // Neon Tracer (Dark with bright lines)
            drawRect(10, 20, 44, 24, '#111'); // Dark Body
            drawRect(10, 30, 44, 4, '#0f0'); // Neon Line
            drawRect(40, 24, 14, 8, '#0f0'); // Neon Tip
        });
        icons.w_pixel = createIcon((ctx, drawRect) => {
            // Glitchy (Random colored blocks)
            drawRect(10, 20, 44, 24, '#bdc3c7'); 
            drawRect(14, 22, 4, 4, '#e74c3c'); // Red pixel
            drawRect(24, 34, 4, 4, '#3498db'); // Blue pixel
            drawRect(34, 26, 4, 4, '#2ecc71'); // Green pixel
            drawRect(44, 30, 4, 4, '#f1c40f'); // Yellow pixel
        });
        icons.w_void = createIcon((ctx, drawRect) => {
            // Void Beam (Dark purple/black)
            drawRect(10, 20, 44, 24, '#2c3e50'); 
            drawRect(12, 22, 40, 20, '#000'); // Inner void
            drawRect(40, 24, 14, 8, '#8e44ad'); // Purple glow tip
        });

        // --- CHARACTER SKINS (Heads/Helmets) ---
        icons.c_marine = createIcon((ctx, drawRect) => {
            // Marine Helmet
            drawRect(16, 16, 32, 32, '#27ae60'); 
            drawRect(20, 24, 24, 8, '#f1c40f'); // Visor
        });
        icons.c_ninja = createIcon((ctx, drawRect) => {
            // Ninja Hood
            drawRect(16, 16, 32, 32, '#2c3e50');
            drawRect(20, 24, 24, 6, '#ecf0f1'); // Eye slit
            drawRect(32, 20, 20, 20, 'rgba(0,0,0,0.2)'); // Shade
        });
        icons.c_robot = createIcon((ctx, drawRect) => {
            // Robot Head
            drawRect(16, 16, 32, 32, '#95a5a6');
            drawRect(22, 24, 8, 8, '#e74c3c'); // Eye L
            drawRect(34, 24, 8, 8, '#e74c3c'); // Eye R
            drawRect(14, 24, 4, 12, '#7f8c8d'); // Ear L
            drawRect(46, 24, 4, 12, '#7f8c8d'); // Ear R
        });
        icons.c_knight = createIcon((ctx, drawRect) => {
            // Knight Helm
            drawRect(16, 16, 32, 32, '#f1c40f'); // Gold
            drawRect(28, 16, 8, 32, '#d35400'); // Cross vertical
            drawRect(16, 26, 32, 6, '#d35400'); // Cross horizontal
        });
        icons.c_voidwalker = createIcon((ctx, drawRect) => {
            // Void Hood
            drawRect(16, 16, 32, 32, '#4b0082');
            drawRect(24, 24, 8, 8, '#fff'); // Glowing Eye L
            drawRect(36, 24, 8, 8, '#fff'); // Glowing Eye R
            drawRect(20, 40, 24, 8, '#000'); // Shadow mouth
        });

        // --- KILL EFFECTS ---
        icons.k_pixel = createIcon((ctx, drawRect) => {
            // Simple pixel burst
            drawRect(28, 28, 8, 8, '#e74c3c');
            drawRect(16, 16, 4, 4, '#c0392b');
            drawRect(44, 16, 4, 4, '#c0392b');
            drawRect(16, 44, 4, 4, '#c0392b');
            drawRect(44, 44, 4, 4, '#c0392b');
        });
        icons.k_confetti = createIcon((ctx, drawRect) => {
            // Multi-colored specks
            drawRect(20, 20, 4, 8, '#e74c3c');
            drawRect(40, 15, 8, 4, '#3498db');
            drawRect(15, 40, 4, 4, '#2ecc71');
            drawRect(45, 45, 6, 6, '#f1c40f');
            drawRect(30, 30, 4, 4, '#9b59b6');
        });
        icons.k_gold = createIcon((ctx, drawRect) => {
            // Coins flying
            drawRect(24, 16, 6, 6, '#f1c40f');
            drawRect(40, 24, 6, 6, '#f1c40f');
            drawRect(20, 40, 6, 6, '#f1c40f');
            drawRect(44, 36, 6, 6, '#f1c40f');
        });
        icons.k_blackhole = createIcon((ctx, drawRect) => {
            // Swirl
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(32, 32, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#8e44ad';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(32, 32, 22, 0, Math.PI * 2);
            ctx.stroke();
        });

        // --- AURA EFFECTS ---
        icons.a_sparkles = createIcon((ctx, drawRect) => {
            // Stars
            drawRect(30, 10, 4, 4, '#fff');
            drawRect(10, 30, 4, 4, '#fff');
            drawRect(50, 30, 4, 4, '#fff');
            drawRect(30, 50, 4, 4, '#fff');
            drawRect(28, 28, 8, 8, '#f1c40f'); // Center star
        });
        icons.a_fire = createIcon((ctx, drawRect) => {
            // Fire ring (smaller version of fireaura icon essentially)
            drawRect(28, 40, 8, 12, '#e74c3c');
            drawRect(24, 32, 16, 12, '#e67e22');
            drawRect(28, 24, 8, 12, '#f39c12');
            drawRect(30, 16, 4, 8, '#f1c40f');
        });
        icons.a_void = createIcon((ctx, drawRect) => {
            // Dark particles
            drawRect(20, 20, 6, 6, '#4b0082');
            drawRect(40, 40, 6, 6, '#4b0082');
            drawRect(40, 20, 6, 6, '#000');
            drawRect(20, 40, 6, 6, '#000');
        });

        return icons;
    },

    generateWorldPreviews() {
        const previews = {};

        const createPreview = (drawFn) => {
            const c = document.createElement('canvas');
            c.width = 160;
            c.height = 160;
            const ctx = c.getContext('2d');
            const drawRect = (x, y, w, h, color) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            };
            drawFn(ctx, drawRect);
            return c.toDataURL();
        };

        // CYBER SECTOR - Tech/Circuit theme
        previews.tech = createPreview((ctx, drawRect) => {
            // Background
            drawRect(0, 0, 160, 160, '#111');

            // Grid floor
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            for (let i = 0; i < 160; i += 20) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, 160);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(160, i);
                ctx.stroke();
            }

            // Tech blocks/buildings
            drawRect(20, 40, 40, 60, '#34495e');
            drawRect(20, 40, 40, 4, '#ecf0f1'); // Top highlight
            drawRect(30, 50, 8, 8, '#e74c3c'); // Red light
            drawRect(30, 70, 8, 8, '#3498db'); // Blue light

            drawRect(100, 60, 40, 80, '#34495e');
            drawRect(100, 60, 40, 4, '#ecf0f1');
            drawRect(110, 80, 8, 8, '#2ecc71'); // Green light
            drawRect(110, 100, 8, 8, '#e74c3c');

            drawRect(70, 100, 20, 40, '#34495e');
            drawRect(70, 100, 20, 4, '#ecf0f1');
            drawRect(75, 110, 8, 8, '#f1c40f'); // Yellow light
        });

        // MAGMA CORE - Lava/Fire theme
        previews.magma = createPreview((ctx, drawRect) => {
            // Dark red background
            drawRect(0, 0, 160, 160, '#1a0505');

            // Lava floor glow
            drawRect(0, 120, 160, 40, '#2c0e0e');

            // Lava pools
            drawRect(20, 130, 40, 20, '#e74c3c');
            drawRect(24, 132, 32, 16, '#f39c12');
            drawRect(28, 134, 24, 12, '#f1c40f');

            drawRect(100, 125, 40, 25, '#e74c3c');
            drawRect(104, 128, 32, 19, '#f39c12');
            drawRect(108, 131, 24, 13, '#f1c40f');

            // Volcanic rocks
            drawRect(30, 60, 30, 30, '#c0392b');
            drawRect(34, 64, 22, 22, '#7f2c2c');

            drawRect(90, 40, 40, 40, '#c0392b');
            drawRect(94, 44, 32, 32, '#7f2c2c');
            drawRect(100, 50, 20, 20, '#e67e22'); // Glow

            // Fire particles
            drawRect(50, 20, 4, 8, '#f1c40f');
            drawRect(70, 30, 4, 8, '#f39c12');
            drawRect(110, 15, 4, 8, '#f1c40f');
        });

        // FROZEN WASTE - Ice/Snow theme
        previews.ice = createPreview((ctx, drawRect) => {
            // Dark blue background
            drawRect(0, 0, 160, 160, '#05101a');

            // Snow floor
            drawRect(0, 130, 160, 30, '#0e1a2c');

            // Ice crystals/formations
            drawRect(40, 80, 20, 60, '#2980b9');
            drawRect(44, 84, 12, 52, '#3498db');
            drawRect(48, 88, 4, 44, '#ecf0f1'); // Shine

            drawRect(100, 60, 30, 80, '#2980b9');
            drawRect(104, 64, 22, 72, '#3498db');
            drawRect(110, 70, 10, 60, '#ecf0f1');

            drawRect(20, 100, 15, 40, '#2980b9');
            drawRect(23, 103, 9, 34, '#3498db');

            drawRect(130, 90, 15, 50, '#2980b9');
            drawRect(133, 93, 9, 44, '#3498db');

            // Snowflakes
            drawRect(50, 20, 2, 8, '#ecf0f1');
            drawRect(46, 24, 10, 2, '#ecf0f1');

            drawRect(90, 35, 2, 8, '#ecf0f1');
            drawRect(86, 39, 10, 2, '#ecf0f1');

            drawRect(120, 25, 2, 8, '#ecf0f1');
            drawRect(116, 29, 10, 2, '#ecf0f1');
        });

        // THE VOID - Purple/Dark theme
        previews.void = createPreview((ctx, drawRect) => {
            // Very dark purple background
            drawRect(0, 0, 160, 160, '#05000a');

            // Void floor
            drawRect(0, 140, 160, 20, '#0a0014');

            // Purple energy crystals
            drawRect(30, 70, 25, 70, '#4b0082');
            drawRect(34, 74, 17, 62, '#8e44ad');
            drawRect(38, 78, 9, 54, '#9b59b6'); // Bright glow

            drawRect(90, 50, 35, 90, '#4b0082');
            drawRect(94, 54, 27, 82, '#8e44ad');
            drawRect(100, 60, 15, 70, '#9b59b6');

            drawRect(130, 90, 20, 50, '#4b0082');
            drawRect(133, 93, 14, 44, '#8e44ad');

            // Floating void particles
            drawRect(40, 20, 3, 3, '#9b59b6');
            drawRect(70, 30, 3, 3, '#9b59b6');
            drawRect(100, 25, 3, 3, '#9b59b6');
            drawRect(120, 35, 3, 3, '#9b59b6');
            drawRect(50, 40, 3, 3, '#8e44ad');
            drawRect(110, 45, 3, 3, '#8e44ad');

            // Portal effect
            ctx.strokeStyle = '#9b59b6';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(80, 80, 30, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#8e44ad';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(80, 80, 20, 0, Math.PI * 2);
            ctx.stroke();
        });

        return previews;
    }
};