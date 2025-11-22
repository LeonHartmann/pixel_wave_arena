# Pixel Wave Arena

Pixel Wave Arena is a browser-based **2D Survival Roguelite** (Bullet Heaven) where you fight off infinite waves of enemies, collect gold, and build a powerful character. 

The game features a completely **procedurally generated asset system** (all graphics are generated via JavaScript code, no external image files) and a robust **RPG-style item economy**.

## 🎮 Features

*   **Survival Gameplay:** Survive increasingly difficult waves of enemies.
*   **Auto-Combat:** Your character automatically targets the nearest enemy. Focus on positioning and dodging.
*   **In-Run Shop:** Buy temporary power-ups (Damage, Speed, Multishot, etc.) between waves.
*   **Persistent Progression:** Gold and High Scores are saved to a local server.
*   **Gacha System:** Open crates (Basic, Silver, Gold, Legendary) to find permanent loot.
*   **RPG Loot Economy:**
    *   **Rarities:** Common, Rare, Epic, Legendary, Mythic.
    *   **Stat Variance:** Stat Gems roll with random variance (e.g., a gem might give +4.8% or +5.2% damage).
    *   **Stacking:** Identical items stack in your inventory.
    *   **Selling:** Sell unwanted items for gold to fund your next crate opening.
*   **Customization:** Equip unique skins and effects:
    *   **Weapon Skins:** Change projectile appearance (Gold trails, Void orbs, Neon squares).
    *   **Character Skins:** Change player appearance (Ninja, Robot, Knight, Voidwalker).
    *   **Aura Effects:** Cosmetic particles around your character (Sparkles, Fire, Void).
    *   **Kill Effects:** Visual explosions when enemies die (Confetti, Black Hole, Gold Coins).

## 🚀 Getting Started

### Prerequisites
*   **Node.js** installed on your machine.

### Installation & Running
1.  Clone or download this repository.
2.  Open a terminal in the project root directory.
3.  Start the local server:
    ```bash
    node server.js
    ```
4.  Open your web browser and navigate to:
    ```
    http://localhost:3000
    ```
5.  Enter a username to create your save file and start playing!

## 🕹️ Controls

*   **Movement:** `WASD` or `Arrow Keys`
*   **Pause:** `ESC`
*   **UI Interaction:** Mouse (Click to buy upgrades, manage inventory, open crates).

## 📂 Project Structure

*   **`game.js`**: Main entry point for the game loop and initialization.
*   **`server.js`**: Simple Node.js HTTP server for serving files and handling data persistence (`data.json`).
*   **`modules/`**: Core game logic.
    *   `UIManager.js`: Handles all screens (Menu, Shop, HUD, Inventory).
    *   `Player.js` / `Enemy.js`: Entity logic and rendering.
    *   `GachaSystem.js` / `GachaInterface.js`: Loot generation, probabilities, and crate animations.
    *   `CharacterScreen.js`: Inventory management, equipping, and paper-doll rendering.
    *   `SpriteGenerator.js`: Creates all 8-bit assets (icons, characters, enemies) programmatically.
    *   `Persistence.js`: Handles saving/loading data to the backend.
    *   `Items.js`: Definitions for all lootable items.
*   **`styles/`**: CSS modules for different UI layers (HUD, Shop, Gacha, etc.).

## 💎 Economy & Stats

*   **Gold:** Earned by defeating enemies. Used to buy upgrades in-run and Crates in the main menu.
*   **Stat Gems:** Can be equipped to permanently boost stats:
    *   **Damage:** Percentage multiplier.
    *   **Speed:** Percentage multiplier.
    *   **Max HP:** Flat addition.
    *   **Crit Chance:** Percentage chance to deal double damage.
    *   **Regen:** Health regenerated per second.

## 🛠️ Technical Details

*   **Engine:** Custom Vanilla JS Engine (Canvas API).
*   **Architecture:** Component-based Entity system with a dedicated UI Manager.
*   **Assets:** No sprite sheets. All visuals are drawn via Canvas 2D Context instructions in `SpriteGenerator.js`, creating a retro 8-bit aesthetic on the fly.

---
