const API_URL = 'http://localhost:3000/api';
import { GachaSystem } from './GachaSystem.js';
import { ITEMS } from './Items.js';

export const Persistence = {
    data: {
        username: 'Guest',
        gold: 0,
        highScores: [],
        upgrades: {}, // Permanent upgrades
        inventory: { items: [] }, // Collected items
        loadout: {
            weaponSkin: null,
            characterSkin: null,
            killEffect: null,
            auraEffect: null,
            statGems: [null, null, null]
        },
        unlockedWorlds: ['tech']
    },

    async init(username) {
        this.data.username = username;
        console.log(`Persistence: Initializing for user ${username}`);
        await this.load();
    },

    async load() {
        try {
            const res = await fetch(`${API_URL}/load?username=${this.data.username}`);
            if (res.ok) {
                const json = await res.json();
                if (json && json.data) {
                    // Merge loaded data
                    this.data = { ...this.data, ...json.data };
                    
                    // Ensure deep structures exist
                    if (!this.data.inventory) this.data.inventory = { items: [] };
                    if (!this.data.loadout) this.data.loadout = { weaponSkin: null, characterSkin: null, killEffect: null, auraEffect: null, statGems: [null, null, null] };
                    
                    // --- MIGRATION LOGIC ---
                    this.migrateData();
                    
                    console.log('Persistence: Loaded data from server', this.data);
                }
            }
        } catch (e) {
            console.error('Persistence: Failed to load data', e);
        }
    },

    migrateData() {
        let migrated = false;
        
        // 1. Migrate Inventory Items to new Instance Format
        if (this.data.inventory.items.length > 0) {
            // Check if items are old format (missing uid or count)
            const needsMigration = this.data.inventory.items.some(i => !i.uid || i.count === undefined);
            
            if (needsMigration) {
                console.log("Persistence: Migrating inventory to new format...");
                const newInventory = [];
                
                this.data.inventory.items.forEach(oldItem => {
                    // Find definition
                    const def = ITEMS.find(d => d.id === oldItem.id);
                    if (def) {
                        // Generate new instance
                        const instance = GachaSystem.generateItemInstance(def);
                        // Preserve any count if it existed (unlikely in old format but safe)
                        if (oldItem.count) instance.count = oldItem.count;
                        newInventory.push(instance);
                    }
                });
                
                this.data.inventory.items = newInventory;
                migrated = true;
            }
        }

        // 2. Migrate Loadout (ID -> UID)
        // Since we regenerated inventory, the UIDs are new.
        // We need to try and match equipped IDs to available Inventory UIDs.
        const loadout = this.data.loadout;
        const inv = this.data.inventory.items;

        const mapIdToUid = (id) => {
            if (!id) return null;
            // Find an item in inventory with matching base ID
            // Prefer one that isn't already "linked" if we were tracking that, but we aren't.
            // Just pick the first one.
            const match = inv.find(i => i.id === id);
            return match ? match.uid : null;
        };

        // Migrate Weapon Skin
        if (loadout.weaponSkin && !this.getItemByUid(loadout.weaponSkin)) {
            loadout.weaponSkin = mapIdToUid(loadout.weaponSkin);
            migrated = true;
        }
        // Migrate Character Skin
        if (loadout.characterSkin && !this.getItemByUid(loadout.characterSkin)) {
            loadout.characterSkin = mapIdToUid(loadout.characterSkin);
            migrated = true;
        }
        // Migrate Kill Effect
        if (loadout.killEffect && !this.getItemByUid(loadout.killEffect)) {
            loadout.killEffect = mapIdToUid(loadout.killEffect);
            migrated = true;
        }
        // Migrate Aura Effect
        if (loadout.auraEffect && !this.getItemByUid(loadout.auraEffect)) {
            loadout.auraEffect = mapIdToUid(loadout.auraEffect);
            migrated = true;
        }
        // Migrate Gems
        if (loadout.statGems) {
            loadout.statGems = loadout.statGems.map(gemId => {
                if (!gemId) return null;
                if (this.getItemByUid(gemId)) return gemId; // Already UID
                const newUid = mapIdToUid(gemId);
                if (newUid) migrated = true;
                return newUid;
            });
        }

        if (migrated) {
            console.log("Persistence: Migration complete. Saving...");
            this.save();
        }
    },

    getData() {
        return this.data;
    },

    getItemByUid(uid) {
        if (!uid) return null;
        return this.data.inventory.items.find(i => i.uid === uid);
    },

    async save() {
        try {
            // Deep clone to avoid reference issues
            const payload = JSON.parse(JSON.stringify(this.data));
            
            // Send to server
            await fetch(`${API_URL}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log('Persistence: Save successful');
        } catch (e) {
            console.error('Persistence: Failed to save', e);
        }
    },

    addGold(amount) {
        this.data.gold += amount;
        this.save();
    },

    addHighScore(wave, score) {
        this.data.highScores.push({ wave, score, date: Date.now(), name: this.data.username });
        this.data.highScores.sort((a, b) => b.wave - a.wave);
        this.data.highScores = this.data.highScores.slice(0, 10); // Keep top 10
        this.save();
    },

    buyUpgrade(upgradeId, cost) {
        if (this.data.gold >= cost) {
            this.data.gold -= cost;
            this.data.upgrades[upgradeId] = (this.data.upgrades[upgradeId] || 0) + 1;
            this.save();
            return true;
        }
        return false;
    }
};