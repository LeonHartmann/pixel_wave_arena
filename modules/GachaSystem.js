import { CRATE_TYPES, RARITY_TIERS, ITEMS } from './Items.js';
import { Persistence } from './Persistence.js';

export class GachaSystem {
    constructor() {
        // No special init needed
    }

    openCrate(crateKey) {
        const crate = CRATE_TYPES[crateKey];
        if (!crate) return [];

        const rewards = [];
        for (let i = 0; i < crate.items; i++) {
            const rarity = this.rollRarity(crate.weights, crate.mythicChance);
            const itemDef = this.rollItem(rarity);
            
            // Generate Unique Instance
            const instance = GachaSystem.generateItemInstance(itemDef); // Use static method
            
            // Add to Inventory (Stacking Logic)
            this.addToInventory(instance);
            
            rewards.push(instance);
        }

        Persistence.save();
        return rewards;
    }

    rollRarity(weights, mythicChance) {
        const roll = Math.random() * 100;
        let cumulative = 0;

        // Mythic check separate or integrated? 
        // weights: { COMMON: 70, RARE: 25, ... }
        // Using provided weights directly
        for (const rarity in weights) {
            cumulative += weights[rarity];
            if (roll < cumulative) return rarity;
        }
        return 'COMMON'; // Fallback
    }

    rollItem(rarity) {
        const pool = ITEMS.filter(i => i.rarity === rarity);
        if (pool.length === 0) return ITEMS[0]; // Fallback
        return pool[Math.floor(Math.random() * pool.length)];
    }

    static generateItemInstance(def) { // Made static
        // Create a fresh object
        const instance = {
            id: def.id, // Reference to the definition ID
            uid: crypto.randomUUID(), // Unique ID for this specific item instance
            name: def.name,
            category: def.category,
            rarity: def.rarity,
            desc: def.desc,
            sellPrice: def.sellPrice,
            stats: def.stats ? { ...def.stats } : undefined, // Clone stats if they exist
            isNew: true, // Flag for UI
            count: 1
        };

        // Apply Variance if exists
        if (def.variance && instance.stats) {
            for (const key in instance.stats) {
                const base = instance.stats[key];
                const modifier = 1 + (Math.random() * def.variance * 2 - def.variance);
                let val = base * modifier;
                
                if (val > 10) val = Math.round(val);
                else val = parseFloat(val.toFixed(1));

                instance.stats[key] = val;
            }
            
            // Update description with rolled stats for display
            let statDescriptions = [];
            for(const key in instance.stats) {
                let unit = '';
                if (key === 'damage' || key === 'speed' || key === 'critChance') unit = '%';
                else if (key === 'maxHp') unit = ' HP';

                statDescriptions.push(`+${instance.stats[key]}${unit} ${key.toUpperCase()}`);
            }
            instance.desc = statDescriptions.join(', ');
        }

        return instance;
    }

    addToInventory(newItem) {
        const data = Persistence.getData();
        if (!data.inventory.items) data.inventory.items = [];

        // For stacking, we need to ensure old items don't break comparison.
        // Stack ONLY if:
        // 1. ID matches
        // 2. Stats match EXACTLY (string comparison of the stats object)
        // 3. Category is one that can stack (e.g., not Stat Gems, as their rolled stats make them unique)
        
        // If it's a stat gem, it's always a new instance, so we just add it.
        // Actually, even stat gems should stack if they rolled EXACTLY the same stats (unlikely but possible)
        // So let's use the stat comparison for everything.

        const existing = data.inventory.items.find(i => 
            i.id === newItem.id && 
            JSON.stringify(i.stats) === JSON.stringify(newItem.stats) // Stats will often be undefined or empty here
        );

        if (existing) {
            existing.count += 1;
            newItem.isDuplicate = true; // For UI display
            newItem.count = existing.count; // Reflect current total
        } else {
            data.inventory.items.push(newItem);
            newItem.isDuplicate = false;
        }
    }
}