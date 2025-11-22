import { Persistence } from './Persistence.js';
import { ITEMS, ITEM_CATEGORIES, RARITY_TIERS } from './Items.js';
import { PERM_UPGRADES } from './upgrades.js';
import { Assets } from './Assets.js';
import { SpriteGenerator } from './SpriteGenerator.js';

export class CharacterScreen {
    constructor(showScreenFn) {
        this.showScreen = showScreenFn;
        this.icons = SpriteGenerator.generateIcons();
        
        // Cache elements
        this.layer = document.getElementById('character-layer');
        this.canvas = document.getElementById('paper-doll-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.inventoryGrid = document.getElementById('drag-inventory-grid');
        this.statsContainer = document.getElementById('char-stats-summary');
        
        this.currentFilter = 'ALL';
        
        this.createTooltip();
        this.initEvents();
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.style.position = 'fixed';
        this.tooltip.style.display = 'none';
        this.tooltip.style.background = 'rgba(0, 0, 0, 0.95)';
        this.tooltip.style.border = '2px solid #fff';
        this.tooltip.style.padding = '10px';
        this.tooltip.style.color = '#fff';
        this.tooltip.style.zIndex = '10000';
        this.tooltip.style.pointerEvents = 'none';
        this.tooltip.style.fontFamily = "'Press Start 2P', cursive"; // Assuming this font is used
        this.tooltip.style.fontSize = '10px';
        this.tooltip.style.lineHeight = '1.5';
        this.tooltip.style.maxWidth = '250px';
        this.tooltip.style.whiteSpace = 'pre-wrap';
        document.body.appendChild(this.tooltip);
    }

    initEvents() {
        // Filter Buttons
        document.querySelectorAll('.inventory-filters .filter-btn').forEach(btn => {
            btn.onclick = (e) => {
                document.querySelectorAll('.inventory-filters .filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderInventory();
            };
        });

        // Inventory Grid (Drop target for unequipping)
        this.inventoryGrid.ondragover = (e) => {
            e.preventDefault(); // Allow dropping
            this.inventoryGrid.classList.add('drag-over-area');
        };

        this.inventoryGrid.ondragleave = () => {
            this.inventoryGrid.classList.remove('drag-over-area');
        };

        this.inventoryGrid.ondrop = (e) => {
            e.preventDefault();
            this.inventoryGrid.classList.remove('drag-over-area');
            const sourceType = e.dataTransfer.getData('source-type');
            
            // If dropping an equipped item back to inventory -> Unequip
            if (sourceType === 'equipped') {
                const slotType = e.dataTransfer.getData('source-slot');
                const slotIndex = e.dataTransfer.getData('source-index');
                
                // Create a mock slot element to reuse unequipSlot logic
                const mockSlot = { dataset: { slot: slotType, index: slotIndex } };
                this.unequipSlot(mockSlot);
            }
        };

        // Slots (Drag Over/Drop)
        document.querySelectorAll('.slot').forEach(slot => {
            slot.ondragover = (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            };
            
            slot.ondragleave = () => {
                slot.classList.remove('drag-over');
            };
            
            slot.ondrop = (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                const itemId = e.dataTransfer.getData('text/plain');
                this.equipItem(itemId, slot);
            };
            
            // Click to unequip
            slot.onclick = () => {
                this.unequipSlot(slot);
            };
        });
    }

    open() {
        this.showScreen('character');
        this.renderCharacter();
        this.renderSlots();
        this.renderInventory();
        this.renderStats();
    }

    renderCharacter() {
        // Clear
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, 128, 128);
        
        if (Assets.loaded) {
            // Get current skin
            const data = Persistence.getData();
            const loadout = data.loadout || {};
            let skin = null;
            
            if (loadout.characterSkin) {
                const item = Persistence.getItemByUid(loadout.characterSkin);
                skin = item ? item.id : null; // Get definition ID from item instance
            }
            
            let sprite = Assets.PLAYER; // Default

            if (skin) {
                if (skin === 'c_ninja') {
                    sprite = { x: 0, y: 64, w: 32, h: 32 };
                } else if (skin === 'c_robot') {
                    sprite = { x: 32, y: 64, w: 32, h: 32 };
                } else if (skin === 'c_knight') {
                    sprite = { x: 64, y: 64, w: 32, h: 32 };
                } else if (skin === 'c_voidwalker') {
                    sprite = { x: 96, y: 64, w: 32, h: 32 };
                }
            }
            
            Assets.draw(this.ctx, sprite, 64, 64, 96, 96);
        }
    }

    renderSlots() {
        const data = Persistence.getData();
        const loadout = data.loadout || {};

        document.querySelectorAll('.slot').forEach(slot => {
            const type = slot.dataset.slot;
            let itemUid = null;

            if (type === 'statGems') {
                const index = parseInt(slot.dataset.index);
                itemUid = loadout.statGems ? loadout.statGems[index] : null;
            } else {
                itemUid = loadout[type];
            }

            slot.innerHTML = ''; // Clear
            if (itemUid) {
                const item = Persistence.getItemByUid(itemUid);
                if (item) {
                    const img = document.createElement('img');
                    img.src = this.getItemIcon(item);
                    img.draggable = true; // Make equipped item draggable
                    
                    // Handle dragging OUT of slot (to unequip)
                    img.ondragstart = (e) => {
                        e.dataTransfer.setData('text/plain', item.uid);
                        e.dataTransfer.setData('source-type', 'equipped');
                        e.dataTransfer.setData('source-slot', type);
                        if (type === 'statGems') {
                            e.dataTransfer.setData('source-index', slot.dataset.index);
                        }
                        e.stopPropagation();
                    };

                    slot.appendChild(img);
                    slot.style.borderColor = RARITY_TIERS[item.rarity].color;

                    // Add Unequip Button (X)
                    const unequipBtn = document.createElement('div');
                    unequipBtn.className = 'unequip-btn';
                    unequipBtn.innerHTML = '×';
                    unequipBtn.onclick = (e) => {
                        e.stopPropagation(); // Prevent slot click
                        this.unequipSlot(slot);
                    };
                    slot.appendChild(unequipBtn);

                    // Add hover events
                    slot.onmouseenter = (e) => this.showTooltip(e, item);
                    slot.onmousemove = (e) => this.moveTooltip(e);
                    slot.onmouseleave = () => this.hideTooltip();
                }
            } else {
                slot.style.borderColor = '#666';
                // Clear events
                slot.onmouseenter = null;
                slot.onmousemove = null;
                slot.onmouseleave = null;
            }
        });
    }

    renderInventory() {
        this.inventoryGrid.innerHTML = '';
        
        // Add Sell Area (if not exists)
        if (!document.getElementById('sell-area')) {
            const sellArea = document.createElement('div');
            sellArea.id = 'sell-area';
            sellArea.innerText = 'DRAG HERE TO SELL';
            sellArea.style.cssText = 'margin-top: 10px; padding: 15px; border: 2px dashed #e74c3c; color: #e74c3c; text-align: center; font-size: 10px; cursor: default;';
            
            sellArea.ondragover = (e) => {
                e.preventDefault();
                sellArea.style.background = 'rgba(231, 76, 60, 0.2)';
            };
            sellArea.ondragleave = () => {
                sellArea.style.background = 'transparent';
            };
            sellArea.ondrop = (e) => {
                e.preventDefault();
                sellArea.style.background = 'transparent';
                const itemId = e.dataTransfer.getData('text/plain');
                const sourceType = e.dataTransfer.getData('source-type');
                
                // Can only sell from inventory for now to be safe
                this.sellItem(itemId);
            };
            
            // Append after grid
            this.inventoryGrid.parentElement.appendChild(sellArea);
        }

        const data = Persistence.getData();
        const inventory = data.inventory.items || [];

        const filtered = inventory.filter(i => {
            if (this.currentFilter === 'ALL') return true;
            if (this.currentFilter === 'WEAPON_SKIN' && i.category === 'WEAPON_SKIN') return true;
            if (this.currentFilter === 'STAT_GEM' && i.category === 'STAT_GEM') return true;
            if (this.currentFilter === 'CHARACTER_SKIN' && i.category === 'CHARACTER_SKIN') return true;
            if (this.currentFilter === 'KILL_EFFECT' && i.category === 'KILL_EFFECT') return true;
            if (this.currentFilter === 'AURA_EFFECT' && i.category === 'AURA_EFFECT') return true;
            return false;
        });

        filtered.forEach(item => {
            const div = document.createElement('div');
            div.className = `drag-item ${item.rarity}`;
            div.draggable = true;
            
            div.ondragstart = (e) => {
                e.dataTransfer.setData('text/plain', item.uid); 
                e.dataTransfer.setData('source-type', 'inventory');
                e.dataTransfer.effectAllowed = 'copy';
                
                // Highlight compatible slots
                let targetSlot = '';
                if (item.category === 'WEAPON_SKIN') targetSlot = 'weaponSkin';
                else if (item.category === 'CHARACTER_SKIN') targetSlot = 'characterSkin';
                else if (item.category === 'KILL_EFFECT') targetSlot = 'killEffect';
                else if (item.category === 'AURA_EFFECT') targetSlot = 'auraEffect';
                else if (item.category === 'STAT_GEM') targetSlot = 'statGems';

                document.querySelectorAll(`.slot[data-slot="${targetSlot}"]`).forEach(el => {
                    el.classList.add('compatible');
                });
            };

            div.ondragend = () => {
                document.querySelectorAll('.slot').forEach(el => el.classList.remove('compatible'));
            };

            // Tooltip events
            div.onmouseenter = (e) => this.showTooltip(e, item);
            div.onmousemove = (e) => this.moveTooltip(e);
            div.onmouseleave = () => this.hideTooltip();

            // Rarity Color for Text
            const color = RARITY_TIERS[item.rarity].color;

            let stackBadge = '';
            if (item.count > 1) {
                stackBadge = `<div style="position:absolute; top:2px; right:2px; background:#333; border:1px solid #fff; border-radius:50%; width:16px; height:16px; font-size:8px; display:flex; align-items:center; justify-content:center;">${item.count}</div>`;
            }

            div.innerHTML = `
                ${stackBadge}
                <img src="${this.getItemIcon(item)}">
                <div style="margin-top: auto; font-size: 9px;">${item.name}</div>
                <div class="rarity-tag" style="color: ${color}; font-size: 7px; margin-top: 2px;">${item.rarity}</div>
            `;
            
            this.inventoryGrid.appendChild(div);
        });
    }

    sellItem(itemUid) {
        const data = Persistence.getData();
        if (!data.inventory.items) return;

        // Find item by UID
        const index = data.inventory.items.findIndex(i => i.uid === itemUid);
        if (index === -1) return;

        const item = data.inventory.items[index];
        const sellVal = item.sellPrice || 50;

        // Confirm? (Optional, maybe skip for flow)
        if (confirm(`Sell ${item.name} for ${sellVal} Gold?`)) {
            data.gold += sellVal;
            
            if (item.count > 1) {
                item.count--;
            } else {
                // Check if equipped? If so, unequip first?
                // Logic: If we sell the last item of a stack (or unique item), we must remove it from inventory.
                // AND verify it's not currently equipped.
                // Since we rely on UIDs, if we remove this UID from inventory, the loadout pointer becomes invalid.
                // Let's unequip it first.
                
                this.unequipByUid(itemUid);
                data.inventory.items.splice(index, 1);
            }
            
            Persistence.save();
            this.renderInventory();
            this.renderSlots(); // Update slots if item was equipped and sold
            
            // Update gold display if visible
            if (document.getElementById('shop-gold-display')) {
                document.getElementById('shop-gold-display').innerText = data.gold;
            }
        }
    }

    unequipByUid(uid) {
        const data = Persistence.getData();
        const loadout = data.loadout;
        
        if (loadout.weaponSkin === uid) loadout.weaponSkin = null;
        if (loadout.characterSkin === uid) loadout.characterSkin = null;
        if (loadout.killEffect === uid) loadout.killEffect = null;
        if (loadout.auraEffect === uid) loadout.auraEffect = null;
        if (loadout.statGems) {
            loadout.statGems = loadout.statGems.map(g => g === uid ? null : g);
        }
    }

    showTooltip(e, item) {
        const color = RARITY_TIERS[item.rarity].color;
        let content = `<span style="color: ${color}; font-weight: bold;">${item.name}</span>\n`;
        content += `<span style="color: #aaa; font-size: 8px;">${item.rarity} ${item.category}</span>\n\n`;
        // Description now contains rolled stats
        content += `${item.desc}\n`;
        
        // If it has stats object (it should), desc is enough, but fallback:
        // item.desc handles it now.

        this.tooltip.innerHTML = content;
        this.tooltip.style.display = 'block';
        this.tooltip.style.borderColor = color;
        this.moveTooltip(e);
    }

    moveTooltip(e) {
        const x = e.clientX + 15;
        const y = e.clientY + 15;
        
        // Boundary check
        const rect = this.tooltip.getBoundingClientRect();
        let finalX = x;
        let finalY = y;

        if (x + rect.width > window.innerWidth) finalX = x - rect.width - 15;
        if (y + rect.height > window.innerHeight) finalY = y - rect.height - 15;

        this.tooltip.style.left = `${finalX}px`;
        this.tooltip.style.top = `${finalY}px`;
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }

    renderStats() {
        const data = Persistence.getData();
        const upgrades = data.upgrades || {};
        const loadout = data.loadout || {};

        // Base Stats (Matching Player.js defaults)
        let stats = {
            damage: 10,
            maxHp: 100,
            speed: 200,
            fireRateBonus: 0, // Track bonus separately
            baseFireRate: 0.5,
            regen: 0,
            critChance: 0,
            goldMultiplier: 1.0
        };

        // 1. Add Permanent Upgrades (Additive)
        PERM_UPGRADES.forEach(up => {
            const lvl = upgrades[up.id] || 0;
            if (lvl > 0) {
                const bonus = lvl * up.val;
                if (up.stat === 'gold') stats.goldMultiplier += bonus;
                else if (up.stat === 'fireRate') stats.fireRateBonus += bonus;
                else if (up.stat === 'speed') stats.speed += bonus; // Speed upgrades are additive in Player.js
                else stats[up.stat] += bonus;
            }
        });

        // 2. Add Equipped Stat Gems (Multiplicative for Damage/Speed/Regen, Additive for HP/Crit)
        if (loadout.statGems) {
            loadout.statGems.forEach(gemUid => {
                if (!gemUid) return;
                const gem = Persistence.getItemByUid(gemUid);
                if (gem && gem.stats) {
                    for (const [key, val] of Object.entries(gem.stats)) {
                        if (key === 'damage') stats.damage *= (1 + val / 100);
                        else if (key === 'speed') stats.speed *= (1 + val / 100);
                        else if (key === 'maxHp') stats.maxHp += val;
                        else if (key === 'critChance') stats.critChance += val;
                        else if (key === 'regen') stats.regen *= (1 + val / 100); 
                    }
                }
            });
        }

        // Calculate final fire rate display (Shots per second)
        // Formula: base / (1 + bonus) -> Interval. Rate = 1 / Interval.
        // Rate = (1 + bonus) / base
        const finalFireRate = (1 + stats.fireRateBonus) / stats.baseFireRate;

        // Render
        const iconStyle = 'width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;';
        
        this.statsContainer.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; text-align: left;">
                <div title="Max Health"><img src="${this.icons.health}" style="${iconStyle}"> <span style="color:#e74c3c">HP:</span> ${Math.round(stats.maxHp)}</div>
                <div title="Damage"><img src="${this.icons.damage}" style="${iconStyle}"> <span style="color:#f1c40f">DMG:</span> ${Math.round(stats.damage)}</div>
                <div title="Movement Speed"><img src="${this.icons.speed}" style="${iconStyle}"> <span style="color:#3498db">SPD:</span> ${Math.round(stats.speed)}</div>
                <div title="Fire Rate"><img src="${this.icons.firerate}" style="${iconStyle}"> <span style="color:#2ecc71">ROF:</span> ${(finalFireRate).toFixed(2)}/s</div>
                <div title="Critical Chance"><img src="${this.icons.damage}" style="${iconStyle}"> <span style="color:#9b59b6">CRIT:</span> ${stats.critChance.toFixed(1)}%</div>
                <div title="Gold Multiplier"><img src="${this.icons.coin}" style="${iconStyle}"> <span style="color:#f39c12">GOLD:</span> x${stats.goldMultiplier.toFixed(2)}</div>
                <div title="Health Regen"><img src="${this.icons.regen}" style="${iconStyle}"> <span style="color:#e67e22">RGN:</span> ${stats.regen.toFixed(1)}/s</div>
            </div>
        `;
    }

    equipItem(itemUid, slotElement) {
        const data = Persistence.getData();
        const item = Persistence.getItemByUid(itemUid);
        if (!item) return;

        const slotType = slotElement.dataset.slot;
        
        // Validation
        if (slotType === 'statGems' && item.category !== 'STAT_GEM') return;
        if (slotType === 'weaponSkin' && item.category !== 'WEAPON_SKIN') return;
        if (slotType === 'characterSkin' && item.category !== 'CHARACTER_SKIN') return;
        if (slotType === 'killEffect' && item.category !== 'KILL_EFFECT') return;
        if (slotType === 'auraEffect' && item.category !== 'AURA_EFFECT') return;

        // Equip
        if (slotType === 'statGems') {
            const index = parseInt(slotElement.dataset.index);
            if (!data.loadout.statGems) data.loadout.statGems = [null, null, null];
            data.loadout.statGems[index] = itemUid;
        } else {
            data.loadout[slotType] = itemUid;
        }

        Persistence.save();
        this.renderSlots();
        this.renderCharacter(); 
        this.renderStats(); // Update stats
    }

    unequipSlot(slotElement) {
        const data = Persistence.getData();
        const slotType = slotElement.dataset.slot;

        if (slotType === 'statGems') {
            const index = parseInt(slotElement.dataset.index);
            if (data.loadout.statGems) data.loadout.statGems[index] = null;
        } else {
            data.loadout[slotType] = null;
        }

        Persistence.save();
        this.renderSlots();
        this.renderCharacter();
        this.renderStats(); // Update stats
    }

    getItemIcon(item) {
        // 1. Check for direct ID match (for Skins, Effects, Unique weapons)
        if (this.icons[item.id]) {
            return this.icons[item.id];
        }

        // 2. Fallback logic for categories
        if (item.category === 'STAT_GEM') {
            // Check item.stats object properties
            if (item.stats.damage) return this.icons.damage;
            if (item.stats.speed) return this.icons.speed;
            if (item.stats.maxHp) return this.icons.health;
            if (item.stats.critChance) return this.icons.damage; 
        }
        
        // 3. Default fallback
        return this.icons.coin;
    }
}
