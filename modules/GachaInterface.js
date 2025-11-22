import { GachaSystem } from './GachaSystem.js';
import { ITEMS, RARITY_TIERS, ITEM_CATEGORIES, CRATE_TYPES } from './Items.js';
import { Assets } from './Assets.js';
import { SpriteGenerator } from './SpriteGenerator.js';
import { Persistence } from './Persistence.js';

export class GachaInterface {
    constructor(showScreen) {
        this.system = new GachaSystem();
        this.isAnimating = false;
        this.showScreen = showScreen; // Store showScreen function
        this.revealStarted = false;
        this.revealTimeout = null;

        // UI Elements
        this.layers = {
            gacha: document.getElementById('gacha-layer'),
            inventory: document.getElementById('inventory-layer'),
            reveal: document.getElementById('reveal-overlay')
        };

        this.elements = {
            track: document.getElementById('gacha-track'),
            status: document.getElementById('gacha-status'),
            crateImg: document.getElementById('gacha-crate-img'),
            inventoryGrid: document.getElementById('inventory-grid')
        };

        // Bind buttons
        document.getElementById('reveal-continue-btn').onclick = () => this.finishOpening();

        // Global filter function binding
        window.filterInventory = (category) => this.renderInventory(category);

        // Cache generated icons
        this.icons = SpriteGenerator.generateIcons();
    }

    openCrateUI(crateKey, onComplete) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.onComplete = onComplete;

        // Show Layer
        if (this.layers.gacha) this.layers.gacha.classList.remove('hidden');
        if (this.layers.inventory) this.layers.inventory.classList.add('hidden');
        if (this.layers.reveal) this.layers.reveal.classList.add('hidden');

        // 1. Get Results
        const rewards = this.system.openCrate(crateKey);

        const rarityValue = { COMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4, MYTHIC: 5 };
        const sortedByRarity = [...rewards].sort((a, b) => rarityValue[b.rarity] - rarityValue[a.rarity]);
        const bestDrop = sortedByRarity[0];

        // Queue reveals: best first, then rest in original order (minus best once)
        const bestIndex = rewards.indexOf(bestDrop);
        const remaining = rewards.filter((_, i) => i !== bestIndex);
        this.currentRewards = [bestDrop, ...remaining];
        this.currentRewardIndex = 0;
        this.revealStarted = false;
        if (this.revealTimeout) clearTimeout(this.revealTimeout);

        // If core UI pieces are missing, skip straight to reveal sequence
        if (!this.elements.track || !this.elements.crateImg || !this.elements.status) {
            this.showReveal(this.currentRewards[this.currentRewardIndex]);
            return;
        }

        // 2. Setup Carousel
        this.setupCarousel(bestDrop);

        // 3. Start Animation Sequence
        // Determine correct chest icon
        let chestIcon = this.icons.chest; // fallback
        if (crateKey === 'BASIC_CRATE') chestIcon = this.icons.chest_common;
        else if (crateKey === 'SILVER_CRATE') chestIcon = this.icons.chest_rare;
        else if (crateKey === 'GOLD_CRATE') chestIcon = this.icons.chest_epic;
        else if (crateKey === 'LEGENDARY_CRATE') chestIcon = this.icons.chest_legendary;

        this.elements.crateImg.src = chestIcon || ''; 
        this.elements.crateImg.classList.add('crate-shake');
        this.elements.status.innerText = "OPENING...";

        setTimeout(() => {
            this.elements.crateImg.classList.remove('crate-shake');
            this.spinCarousel(bestDrop);
        }, 1000);
    }

    setupCarousel(targetItem) {
        const track = this.elements.track;
        track.innerHTML = '';
        track.style.transition = 'none';
        track.style.left = '0px';

        const totalItems = 70;
        const winIndex = 50; // The winner is at index 50

        this.winIndex = winIndex;

        for (let i = 0; i < totalItems; i++) {
            let item;
            if (i === winIndex) {
                item = targetItem;
            } else {
                // Random filler - Need to generate a dummy instance for card creation
                // or update createItemCard to handle raw definitions if passed
                // Ideally, pick a definition
                const def = ITEMS[Math.floor(Math.random() * ITEMS.length)];
                // Create a temp object that looks like an instance
                item = { ...def, count: 1 }; 
            }

            const card = this.createItemCard(item);
            track.appendChild(card);
        }
    }

    createItemCard(item) {
        const div = document.createElement('div');
        div.className = `gacha-item-card ${item.rarity}`;

        let iconSrc = '';

        // 1. Check for direct ID match (Unique Skins/Effects)
        if (this.icons[item.id]) {
            iconSrc = this.icons[item.id];
        }
        // 2. Category Fallback Logic
        else if (item.category === ITEM_CATEGORIES.STAT_GEM) {
            // Use gem icons based on stat keys in item.stats or item definition stats
            // Item instance has 'stats' object
            const s = item.stats || {};
            if (s.damage) iconSrc = this.icons.damage;
            else if (s.speed) iconSrc = this.icons.speed;
            else if (s.maxHp) iconSrc = this.icons.health;
            else iconSrc = this.icons.coin; 
        } else if (item.category === ITEM_CATEGORIES.WEAPON_SKIN) {
            iconSrc = this.icons.multishot; 
        } else {
            iconSrc = this.icons.coin; 
        }

        // Show rolled stat if available in description (for carousel mostly visual)
        // For carousel, we just want name and icon usually.
        
        div.innerHTML = `
            <img src="${iconSrc}" class="gacha-item-icon">
            <div class="gacha-item-name">${item.name}</div>
        `;

        return div;
    }

    spinCarousel(targetItem) {
        const track = this.elements.track;
        const cardWidth = 140; // 120 width + 20 margin
        
        // Center Calculation:
        // TrackLeft = -50 - (N * 140)

        // Add random offset (±30px) to simulate analog stop
        const randomOffset = Math.floor(Math.random() * 60) - 30;
        const targetPos = -((this.winIndex * cardWidth) + 50) + randomOffset;

        // Force reflow
        track.offsetHeight;

        track.style.transition = 'left 5s cubic-bezier(0.1, 0, 0.2, 1)'; // Ease-out
        track.style.left = `${targetPos}px`;

        // Play tick sound? (Optional)

        const finishSpin = () => this.startRevealSequence(track, finishSpin);

        track.addEventListener('transitionend', finishSpin, { once: true });
        this.revealTimeout = setTimeout(finishSpin, 6000); // Fallback in case transitionend doesn’t fire

        // Extra fallback to force reveal even if transition never starts
        setTimeout(() => {
            if (!this.revealStarted) finishSpin();
        }, 7000);
    }

    startRevealSequence(track, handler) {
        if (this.revealStarted) return;
        this.revealStarted = true;
        if (this.revealTimeout) clearTimeout(this.revealTimeout);
        if (track && handler) track.removeEventListener('transitionend', handler);
        const item = this.currentRewards ? this.currentRewards[this.currentRewardIndex] : null;
        this.showReveal(item);
    }

    showReveal(item) {
        if (!item) {
            console.error("showReveal: No item to reveal!");
            return;
        }
        console.log("showReveal: Revealing item", item);
        const overlay = this.layers.reveal;
        const container = document.getElementById('reveal-card-container');

        if (!container) {
            this.finishOpening();
            return;
        }

        // Hide the carousel layer
        if (this.layers.gacha) this.layers.gacha.classList.add('hidden');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.style.display = 'flex';
        }
        container.innerHTML = '';

        const card = this.createItemCard(item);
        // Scale it up naturally
        card.style.width = '300px';
        card.style.height = '420px';
        card.querySelector('.gacha-item-icon').style.width = '192px';
        card.querySelector('.gacha-item-icon').style.height = '192px';
        card.classList.add('reveal-pop');

        // Tags
        const tag = document.createElement('div');
        tag.className = 'reveal-tag';
        tag.style.position = 'absolute';
        tag.style.top = '-20px';
        tag.style.padding = '5px 10px';
        tag.style.fontWeight = 'bold';

        if (item.isNew) {
            tag.innerText = "NEW!";
            tag.style.background = '#f1c40f';
            tag.style.color = '#000';
            card.appendChild(tag);
        } else if (item.count > 1) {
            tag.innerText = `STACKED x${item.count}`;
            tag.style.background = '#3498db';
            tag.style.color = '#fff';
            card.appendChild(tag);
        }

        // Description / Stats
        const desc = document.createElement('div');
        desc.innerHTML = item.desc || ''; 
        desc.style.marginTop = '10px';
        desc.style.fontSize = '14px'; 
        desc.style.textAlign = 'center';
        desc.style.color = '#ddd';
        card.appendChild(desc);

        container.appendChild(card);

        if (this.elements.status && this.currentRewards) {
            this.elements.status.innerText = `REWARD ${this.currentRewardIndex + 1}/${this.currentRewards.length}`;
        }
    }

    finishOpening() {
        // If more rewards remain, show the next one instead of closing
        if (this.currentRewards && this.currentRewardIndex < this.currentRewards.length - 1) {
            this.currentRewardIndex += 1;
            const nextItem = this.currentRewards[this.currentRewardIndex];
            this.showReveal(nextItem);
            return;
        }

        this.isAnimating = false;

        // Hide Gacha Layers
        if (this.layers.reveal) {
            this.layers.reveal.classList.add('hidden');
            this.layers.reveal.style.display = ''; // Reset display style
        }
        if (this.layers.gacha) this.layers.gacha.classList.add('hidden');

        // Execute callback if exists
        try {
            if (this.onComplete) {
                console.log("GachaInterface: Calling onComplete callback");
                this.onComplete();
            } else {
                console.error("GachaInterface: No onComplete callback provided");
                throw new Error("No callback provided");
            }
        } catch (e) {
            console.error("Error in Gacha onComplete or no callback:", e);
            // Fallback navigation
            if (window.showScreen) {
                window.showScreen('menu');
            } else if (this.showScreen) {
                this.showScreen('menu');
            }
        }
    }

    // --- INVENTORY (Now handled by CharacterScreen mostly, but can keep reference or deprecate) ---
    // Since CharacterScreen handles inventory rendering now, we might remove this if unused.
    // But GachaInterface binding might still be used somewhere.
    renderInventory(category) {
        // Deprecated or moved to CharacterScreen? 
        // If used, it needs update. Assuming CharacterScreen is the main view now.
    }

    // --- CRATE SHOP ---
    renderCrateShop(container = null) {
        const grid = container || document.getElementById('crate-shop-grid');
        if (!grid) return;
        grid.innerHTML = ''; // Clear old cards

        const data = Persistence.getData();
        const goldDisplay = document.getElementById('crate-shop-gold-display');
        if (goldDisplay) goldDisplay.innerText = data.gold;

        for (const crateKey in CRATE_TYPES) {
            const crate = CRATE_TYPES[crateKey];
            const canAfford = data.gold >= crate.cost;

            const div = document.createElement('div');
            div.className = `crate-card ${crateKey.replace('_CRATE', '')} ${canAfford ? '' : 'disabled'}`;

            // Specific crate image
            let crateIconSrc = this.icons.chest;
            if (crateKey === 'BASIC_CRATE') crateIconSrc = this.icons.chest_common;
            else if (crateKey === 'SILVER_CRATE') crateIconSrc = this.icons.chest_rare;
            else if (crateKey === 'GOLD_CRATE') crateIconSrc = this.icons.chest_epic;
            else if (crateKey === 'LEGENDARY_CRATE') crateIconSrc = this.icons.chest_legendary;

            div.innerHTML = `
                <img src="${crateIconSrc}" class="crate-icon" alt="${crate.name}">
                <div class="crate-name">${crate.name}</div>
                <div class="crate-desc">${crate.items} Item(s)</div>
                <div class="crate-price">
                    ${crate.cost}
                    <img src="${this.icons.coin}" class="coin-icon" alt="G">
                </div>
            `;

            if (canAfford) {
                div.onclick = () => {
                    if (data.gold >= crate.cost) {
                        data.gold -= crate.cost;
                        Persistence.save();
                        this.openCrateUI(crateKey, () => {
                            // After crate opening animation, re-render shop and go back to menu
                            console.log("GachaInterface: Crate opening complete. Re-rendering shop and switching screen.");
                            this.renderCrateShop(container); // Update gold display and card states

                            // If we are in unified shop, we might need to call openUnifiedShop to refresh gold there too
                            // But for now, let's just rely on the caller handling screen transitions
                            if (!container) {
                                console.log("GachaInterface: No container, switching to menu");
                                this.showScreen('menu');
                            } else {
                                // In unified shop, we want to stay there or go back to it
                                const mainGold = document.getElementById('shop-gold-display');
                                if (mainGold) mainGold.innerText = data.gold;

                                // We need to make sure the unified shop layer is visible if we were there
                                // But openCrateUI switches to gacha layer.
                                // So we need to switch back.
                                console.log("GachaInterface: Switching back to unifiedShop");
                                if (window.showScreen) {
                                    window.showScreen('unifiedShop');
                                } else if (this.showScreen) {
                                    this.showScreen('unifiedShop');
                                } else {
                                    console.error("GachaInterface: showScreen not found!");
                                }
                            }
                        });
                        if (window.showScreen) window.showScreen('gacha');
                        else if (this.showScreen) this.showScreen('gacha');
                    } else {
                        alert("Not enough gold!");
                    }
                };
            }

            grid.appendChild(div);
        }
    }
}