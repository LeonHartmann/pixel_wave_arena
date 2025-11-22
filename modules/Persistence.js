import { PERM_UPGRADES } from './upgrades.js'; // Import PERM_UPGRADES

export const Persistence = {
    defaultData: {
        username: null,
        gold: 0,
        highScores: [],
        upgrades: {}, // Default to empty object, upgrades handled by PERM_UPGRADES config
        unlockedWorlds: ['tech']
    },

    // Cache current state in memory for synchronous access during gameplay
    _cache: null,

    async init(username) {
        if (!username) {
            this._cache = { ...this.defaultData };
            return this._cache;
        }

        const validUpgradeKeys = new Set(PERM_UPGRADES.map(up => up.id));
        let loadedUpgrades = {};

        try {
            const res = await fetch(`/api/load?username=${encodeURIComponent(username)}`);
            const json = await res.json();

            if (json.data && json.data.upgrades) {
                // Filter out invalid/old upgrade keys
                for (const key in json.data.upgrades) {
                    if (validUpgradeKeys.has(key)) {
                        loadedUpgrades[key] = json.data.upgrades[key];
                    } else {
                        console.warn(`Removed invalid upgrade key from save data: ${key}`);
                    }
                }
            }
            
            // Merge with defaultData
            this._cache = { 
                ...this.defaultData, 
                ...json.data, 
                upgrades: { ...this.defaultData.upgrades, ...loadedUpgrades } 
            };
            
            // Ensure unlockedWorlds exists (migration for old saves)
            if (!this._cache.unlockedWorlds) {
                this._cache.unlockedWorlds = ['tech'];
            }

        } catch (e) {
            console.error('Failed to load from server', e);
            this._cache = { ...this.defaultData, username };
        }
        return this._cache;
    },

    getData() {
        return this._cache || { ...this.defaultData };
    },

    async save() {
        if (!this._cache || !this._cache.username) return;

        try {
            await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this._cache)
            });
        } catch (e) {
            console.error('Failed to save to server', e);
        }
    },

    addHighScore(wave, score) {
        const data = this.getData();
        data.highScores.push({
            wave,
            score,
            date: new Date().toISOString(),
            name: data.username || 'Unknown'
        });
        data.highScores.sort((a, b) => b.wave - a.wave);
        data.highScores = data.highScores.slice(0, 10);
        this.save();
    },

    addGold(amount) {
        const data = this.getData();
        data.gold += amount;
        this.save();
        return data.gold;
    },

    unlockWorld(worldId) {
        const data = this.getData();
        if (!data.unlockedWorlds) data.unlockedWorlds = ['tech'];
        
        if (!data.unlockedWorlds.includes(worldId)) {
            data.unlockedWorlds.push(worldId);
            this.save();
            return true;
        }
        return false;
    },

    buyUpgrade(upgradeKey, cost) {
        const data = this.getData();
        if (data.gold >= cost) {
            data.gold -= cost;
            data.upgrades[upgradeKey] = (data.upgrades[upgradeKey] || 0) + 1;
            this.save();
            return true;
        }
        return false;
    }
};
