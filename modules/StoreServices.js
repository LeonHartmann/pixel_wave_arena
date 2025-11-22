/**
 * StoreServices.js
 * Implements Store services: Reforge, Fusion, and Rarity Promotion
 */

import { Persistence } from './Persistence.js';
import { StoreUpgradeTree } from './StoreUpgradeTree.js';
import { GachaSystem } from './GachaSystem.js';
import { ITEMS, RARITY_TIERS } from './Items.js';

// Rarity progression order
const RARITY_ORDER = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];

export const StoreServices = {
    /**
     * REFORGE SERVICE
     * Re-roll stats on a stat gem within the same rarity
     */
    reforgeItem(itemUid) {
        // Check if service is unlocked
        if (!StoreUpgradeTree.isServiceUnlocked('REFORGE')) {
            return { success: false, error: 'Reforge service not unlocked. Upgrade Reforge Specialist to unlock.' };
        }

        const data = Persistence.getData();
        const item = Persistence.getItemByUid(itemUid);

        if (!item) {
            return { success: false, error: 'Item not found' };
        }

        // Only stat gems can be reforged
        if (item.category !== 'STAT_GEM') {
            return { success: false, error: 'Only stat gems can be reforged' };
        }

        if (!item.stats) {
            return { success: false, error: 'Item has no stats to reforge' };
        }

        // Get service enhancements
        const enhancements = StoreUpgradeTree.getServiceEnhancements('REFORGE');
        const baseEffect = enhancements.effects[0]; // Level 1 effect has baseCost

        // Calculate cost with upgrades
        let cost = baseEffect.baseCost;
        const costReduction = enhancements.effects.find(e => e.costReduction);
        if (costReduction) {
            cost = Math.floor(cost * (1 - costReduction.costReduction));
        }

        // Check if player has enough gold
        if (data.gold < cost) {
            return { success: false, error: `Not enough gold. Need ${cost} gold.` };
        }

        // Deduct cost
        data.gold -= cost;

        // Find the original item definition to get variance
        const itemDef = ITEMS.find(def => def.id === item.id);
        if (!itemDef || !itemDef.variance) {
            return { success: false, error: 'Item definition not found or has no variance' };
        }

        // Check for double roll enhancement (level 3)
        const doubleRoll = enhancements.effects.find(e => e.doubleRoll);

        let newStats;
        if (doubleRoll && doubleRoll.doubleRoll) {
            // Roll twice, keep better result
            const roll1 = this._rollStats(itemDef);
            const roll2 = this._rollStats(itemDef);

            // Compare total stat values
            const total1 = Object.values(roll1).reduce((sum, val) => sum + val, 0);
            const total2 = Object.values(roll2).reduce((sum, val) => sum + val, 0);

            newStats = total1 >= total2 ? roll1 : roll2;
        } else {
            // Single roll
            newStats = this._rollStats(itemDef);
        }

        // Update item stats
        const oldStats = { ...item.stats };
        item.stats = newStats;

        // Update description
        let statDescriptions = [];
        for (const key in item.stats) {
            let unit = '';
            if (key === 'damage' || key === 'speed' || key === 'critChance') unit = '%';
            else if (key === 'maxHp') unit = ' HP';
            statDescriptions.push(`+${item.stats[key]}${unit} ${key.toUpperCase()}`);
        }
        item.desc = statDescriptions.join(', ');

        Persistence.save();

        return {
            success: true,
            cost,
            oldStats,
            newStats,
            item
        };
    },

    /**
     * Helper: Roll stats for an item using variance (with stat stability applied)
     */
    _rollStats(itemDef) {
        const newStats = {};
        const statStability = StoreUpgradeTree.getStatStabilityExclusion();

        for (const key in itemDef.stats) {
            const base = itemDef.stats[key];

            let randomValue = Math.random();
            if (statStability > 0) {
                randomValue = statStability + (randomValue * (1 - statStability));
            }

            const modifier = 1 + (randomValue * itemDef.variance * 2 - itemDef.variance);
            let val = base * modifier;

            if (val > 10) val = Math.round(val);
            else val = parseFloat(val.toFixed(1));

            newStats[key] = val;
        }

        return newStats;
    },

    /**
     * FUSION SERVICE
     * Combine 3 identical items into 1 stronger version
     */
    fuseItems(itemUids) {
        // Check if service is unlocked
        if (!StoreUpgradeTree.isServiceUnlocked('FUSION')) {
            return { success: false, error: 'Fusion service not unlocked. Upgrade Fusion Lab to unlock.' };
        }

        if (!itemUids || itemUids.length !== 3) {
            return { success: false, error: 'Fusion requires exactly 3 items' };
        }

        const data = Persistence.getData();
        const items = itemUids.map(uid => Persistence.getItemByUid(uid)).filter(i => i);

        if (items.length !== 3) {
            return { success: false, error: 'One or more items not found' };
        }

        // Get service enhancements
        const enhancements = StoreUpgradeTree.getServiceEnhancements('FUSION');

        // Check for mixed rarity fusion (level 3)
        const mixedRarityFusion = enhancements.effects.find(e => e.mixedRarityFusion);

        if (!mixedRarityFusion || !mixedRarityFusion.mixedRarityFusion) {
            // Standard fusion: all 3 items must be identical
            const firstId = items[0].id;
            if (!items.every(i => i.id === firstId)) {
                return { success: false, error: 'All items must be identical for fusion (unlock mixed rarity fusion at level 3)' };
            }
        } else {
            // Mixed rarity allowed: items must be same category
            const firstCategory = items[0].category;
            if (!items.every(i => i.category === firstCategory)) {
                return { success: false, error: 'All items must be of the same category for mixed fusion' };
            }
        }

        // Determine result rarity
        const rarities = items.map(i => i.rarity);
        const rarityIndices = rarities.map(r => RARITY_ORDER.indexOf(r));
        const avgRarityIndex = Math.floor(rarityIndices.reduce((sum, idx) => sum + idx, 0) / rarities.length);
        let resultRarity = RARITY_ORDER[avgRarityIndex];

        // Check for rarity upgrade chance (level 2)
        const rarityUpgrade = enhancements.effects.find(e => e.rarityUpgradeChance);
        if (rarityUpgrade && Math.random() < rarityUpgrade.rarityUpgradeChance) {
            const nextIndex = Math.min(avgRarityIndex + 1, RARITY_ORDER.length - 1);
            resultRarity = RARITY_ORDER[nextIndex];
            console.log(`Fusion rarity upgrade! ${RARITY_ORDER[avgRarityIndex]} -> ${resultRarity}`);
        }

        // Generate result item (random item of result rarity and matching category)
        const resultCategory = items[0].category;
        const possibleResults = ITEMS.filter(def =>
            def.rarity === resultRarity && def.category === resultCategory
        );

        if (possibleResults.length === 0) {
            return { success: false, error: `No items available for rarity ${resultRarity} in category ${resultCategory}` };
        }

        const resultDef = possibleResults[Math.floor(Math.random() * possibleResults.length)];
        const resultInstance = GachaSystem.generateItemInstance(resultDef);

        // Remove the 3 input items from inventory
        for (const uid of itemUids) {
            const index = data.inventory.items.findIndex(i => i.uid === uid);
            if (index !== -1) {
                // Unequip if equipped
                this._unequipByUid(uid);
                // Remove from inventory
                data.inventory.items.splice(index, 1);
            }
        }

        // Add result to inventory
        const gacha = new GachaSystem();
        gacha.addToInventory(resultInstance);

        Persistence.save();

        return {
            success: true,
            consumed: items,
            result: resultInstance
        };
    },

    /**
     * RARITY PROMOTION SERVICE
     * Upgrade an item's rarity by one tier
     */
    promoteRarity(itemUid, materialUids) {
        // Check if service is unlocked
        if (!StoreUpgradeTree.isServiceUnlocked('RARITY_PROMOTION')) {
            return { success: false, error: 'Rarity Promotion not unlocked. Upgrade Rarity Promotion to unlock.' };
        }

        const data = Persistence.getData();
        const item = Persistence.getItemByUid(itemUid);

        if (!item) {
            return { success: false, error: 'Item not found' };
        }

        // Can't promote Mythic (max rarity)
        const currentRarityIndex = RARITY_ORDER.indexOf(item.rarity);
        if (currentRarityIndex === RARITY_ORDER.length - 1) {
            return { success: false, error: 'Item is already maximum rarity (Mythic)' };
        }

        // Get service enhancements
        const enhancements = StoreUpgradeTree.getServiceEnhancements('RARITY_PROMOTION');
        const baseEffect = enhancements.effects[0]; // Level 1 effect

        // Calculate cost
        let cost = baseEffect.baseCost;
        const costReduction = enhancements.effects.find(e => e.costReduction);
        if (costReduction) {
            cost = Math.floor(cost * (1 - costReduction.costReduction));
        }

        // Check daily limit
        const today = new Date().toDateString();
        if (!data.services.lastResetDate || data.services.lastResetDate !== today) {
            // New day, reset counter
            data.services.lastResetDate = today;
            data.services.rarityPromotionsUsed = 0;
        }

        const dailyLimit = costReduction ? costReduction.dailyLimit : baseEffect.dailyLimit;
        if (data.services.rarityPromotionsUsed >= dailyLimit) {
            return { success: false, error: `Daily limit reached (${dailyLimit} promotions per day)` };
        }

        // Check gold
        if (data.gold < cost) {
            return { success: false, error: `Not enough gold. Need ${cost} gold.` };
        }

        // Verify materials (should be items of lower rarity, consumed in the process)
        const materialsRequired = 3;
        if (!materialUids || materialUids.length !== materialsRequired) {
            return { success: false, error: `Requires ${materialsRequired} material items` };
        }

        const materials = materialUids.map(uid => Persistence.getItemByUid(uid)).filter(m => m);
        if (materials.length !== materialsRequired) {
            return { success: false, error: 'One or more material items not found' };
        }

        // Deduct cost
        data.gold -= cost;

        // Remove materials
        for (const uid of materialUids) {
            const index = data.inventory.items.findIndex(i => i.uid === uid);
            if (index !== -1) {
                this._unequipByUid(uid);
                data.inventory.items.splice(index, 1);
            }
        }

        // Upgrade rarity
        const newRarity = RARITY_ORDER[currentRarityIndex + 1];
        const oldRarity = item.rarity;
        item.rarity = newRarity;

        // Update sell price based on new rarity
        const rarityTier = RARITY_TIERS[newRarity];
        item.sellPrice = rarityTier.goldValue;

        // Increment usage counter
        data.services.rarityPromotionsUsed++;

        Persistence.save();

        return {
            success: true,
            cost,
            oldRarity,
            newRarity,
            item,
            materialsConsumed: materials.length,
            remainingUses: dailyLimit - data.services.rarityPromotionsUsed
        };
    },

    /**
     * Helper: Unequip item by UID
     */
    _unequipByUid(uid) {
        const data = Persistence.getData();
        const loadout = data.loadout;

        if (loadout.weaponSkin === uid) loadout.weaponSkin = null;
        if (loadout.characterSkin === uid) loadout.characterSkin = null;
        if (loadout.killEffect === uid) loadout.killEffect = null;
        if (loadout.auraEffect === uid) loadout.auraEffect = null;

        if (loadout.statGems) {
            for (let i = 0; i < loadout.statGems.length; i++) {
                if (loadout.statGems[i] === uid) {
                    loadout.statGems[i] = null;
                }
            }
        }
    },

    /**
     * Get service availability and info
     */
    getServiceInfo(serviceId) {
        const isUnlocked = StoreUpgradeTree.isServiceUnlocked(serviceId);
        const enhancements = StoreUpgradeTree.getServiceEnhancements(serviceId);

        const info = {
            id: serviceId,
            unlocked: isUnlocked,
            level: enhancements ? enhancements.level : 0,
            effects: enhancements ? enhancements.effects : []
        };

        // Add service-specific info
        if (serviceId === 'REFORGE' && isUnlocked) {
            const baseEffect = enhancements.effects[0];
            let cost = baseEffect.baseCost;
            const costReduction = enhancements.effects.find(e => e.costReduction);
            if (costReduction) {
                cost = Math.floor(cost * (1 - costReduction.costReduction));
            }
            info.cost = cost;
            info.hasDoubleRoll = enhancements.effects.some(e => e.doubleRoll);
        }

        if (serviceId === 'RARITY_PROMOTION' && isUnlocked) {
            const baseEffect = enhancements.effects[0];
            let cost = baseEffect.baseCost;
            let dailyLimit = baseEffect.dailyLimit;

            const upgrade = enhancements.effects.find(e => e.costReduction);
            if (upgrade) {
                cost = Math.floor(cost * (1 - upgrade.costReduction));
                dailyLimit = upgrade.dailyLimit;
            }

            const data = Persistence.getData();
            const today = new Date().toDateString();
            let usedToday = 0;

            if (data.services.lastResetDate === today) {
                usedToday = data.services.rarityPromotionsUsed || 0;
            }

            info.cost = cost;
            info.dailyLimit = dailyLimit;
            info.usedToday = usedToday;
            info.remainingUses = dailyLimit - usedToday;
        }

        return info;
    }
};
