/**
 * StoreUpgradeTree.js
 * Defines the Store Upgrade Tree with 3 branches (Economy, Loot Quality, Services)
 * Each branch has 3 rows, each node has 1-3 levels
 */

import { Persistence } from './Persistence.js';
import { StoreRankManager } from './StoreRankManager.js';

// Branch IDs
export const BRANCHES = {
    ECONOMY: 'ECONOMY',
    LOOT_QUALITY: 'LOOT_QUALITY',
    SERVICES: 'SERVICES'
};

// Store Upgrade Node Definitions
export const STORE_UPGRADES = [
    // ========================
    // ECONOMY BRANCH (Column 1)
    // ========================
    {
        id: 'better_sell_prices',
        branch: BRANCHES.ECONOMY,
        row: 1,
        name: 'Better Sell Prices',
        description: 'Increase gold earned from selling items',
        maxLevel: 3,
        pointCost: 1, // Cost per level
        unlockRank: 2, // Unlocked at Store Rank 2
        conflicts: [], // No conflicts for row 1
        effects: [
            { level: 1, sellPriceBonus: 0.10, desc: '+10% sell price' },
            { level: 2, sellPriceBonus: 0.20, desc: '+20% sell price' },
            { level: 3, sellPriceBonus: 0.30, desc: '+30% sell price' }
        ]
    },
    {
        id: 'crate_discounts',
        branch: BRANCHES.ECONOMY,
        row: 2,
        name: 'Crate Discounts',
        description: 'Reduce the cost of all crates',
        maxLevel: 3,
        pointCost: 1,
        unlockRank: 5, // Unlocked at Store Rank 5 (row 2 unlocks)
        conflicts: ['better_sell_prices'], // Mutually exclusive with max Better Sell Prices
        effects: [
            { level: 1, crateDiscount: 0.03, desc: '-3% crate cost' },
            { level: 2, crateDiscount: 0.06, desc: '-6% crate cost' },
            { level: 3, crateDiscount: 0.10, desc: '-10% crate cost' }
        ]
    },
    {
        id: 'run_dividend',
        branch: BRANCHES.ECONOMY,
        row: 3,
        name: 'Run Dividend',
        description: 'Earn bonus gold after each run',
        maxLevel: 3,
        pointCost: 1,
        unlockRank: 7, // Unlocked at Store Rank 7 (row 3 unlocks)
        conflicts: [],
        effects: [
            { level: 1, runGoldBonus: 0.05, desc: '+5% bonus gold after runs' },
            { level: 2, runGoldBonus: 0.10, desc: '+10% bonus gold after runs' },
            { level: 3, runGoldBonus: 0.15, desc: '+15% bonus gold after runs' }
        ]
    },

    // ========================
    // LOOT QUALITY BRANCH (Column 2)
    // ========================
    {
        id: 'rarity_floor',
        branch: BRANCHES.LOOT_QUALITY,
        row: 1,
        name: 'Rarity Floor',
        description: 'Guarantee minimum rarities in crates',
        maxLevel: 3,
        pointCost: 1,
        unlockRank: 2,
        conflicts: [],
        effects: [
            { level: 1, guaranteedRarity: 'RARE', crateType: 'BASIC_CRATE', desc: 'Basic Crates guarantee ≥1 Rare' },
            { level: 2, guaranteedRarity: 'EPIC', crateType: 'SILVER_CRATE', desc: 'Silver Crates guarantee ≥1 Epic' },
            { level: 3, mythicBoost: 0.01, desc: '+1% Mythic chance in Gold/Legendary Crates' }
        ]
    },
    {
        id: 'stat_stability',
        branch: BRANCHES.LOOT_QUALITY,
        row: 2,
        name: 'Stat Stability',
        description: 'Improve stat roll ranges on gems',
        maxLevel: 2,
        pointCost: 1,
        unlockRank: 5,
        conflicts: [],
        effects: [
            { level: 1, excludeBottomPercent: 0.25, desc: 'Exclude bottom 25% of stat rolls' },
            { level: 2, excludeBottomPercent: 0.40, desc: 'Exclude bottom 40% of stat rolls' }
        ]
    },
    {
        id: 'duplicate_insurance',
        branch: BRANCHES.LOOT_QUALITY,
        row: 3,
        name: 'Duplicate Insurance',
        description: 'Convert excess duplicates into Shop Tokens',
        maxLevel: 3,
        pointCost: 1,
        unlockRank: 7,
        conflicts: [],
        effects: [
            { level: 1, dupeThreshold: 5, tokenPerDupe: 10, desc: 'Dupes beyond 5 stack → 10 tokens each' },
            { level: 2, dupeThreshold: 4, tokenPerDupe: 15, desc: 'Dupes beyond 4 stack → 15 tokens each' },
            { level: 3, dupeThreshold: 3, tokenPerDupe: 25, desc: 'Dupes beyond 3 stack → 25 tokens each' }
        ]
    },

    // ========================
    // SERVICES BRANCH (Column 3)
    // ========================
    {
        id: 'reforge_specialist',
        branch: BRANCHES.SERVICES,
        row: 1,
        name: 'Reforge Specialist',
        description: 'Unlock and enhance the Reforge service',
        maxLevel: 3,
        pointCost: 1,
        unlockRank: 2,
        conflicts: [],
        effects: [
            { level: 1, unlockService: 'REFORGE', baseCost: 100, desc: 'Unlock Reforge service' },
            { level: 2, costReduction: 0.25, desc: '-25% Reforge cost' },
            { level: 3, doubleRoll: true, desc: 'Reforge rolls twice, keeps better result' }
        ]
    },
    {
        id: 'fusion_lab',
        branch: BRANCHES.SERVICES,
        row: 2,
        name: 'Fusion Lab',
        description: 'Unlock and enhance the Fusion service',
        maxLevel: 3,
        pointCost: 1,
        unlockRank: 5,
        conflicts: [],
        effects: [
            { level: 1, unlockService: 'FUSION', fusionCount: 3, desc: 'Combine 3 items into stronger version' },
            { level: 2, rarityUpgradeChance: 0.20, desc: '20% chance to upgrade rarity' },
            { level: 3, mixedRarityFusion: true, desc: 'Can fuse mixed rarities (2 Rare + 1 Epic)' }
        ]
    },
    {
        id: 'rarity_promotion',
        branch: BRANCHES.SERVICES,
        row: 3,
        name: 'Rarity Promotion',
        description: 'Unlock service to upgrade item rarity',
        maxLevel: 2,
        pointCost: 1,
        unlockRank: 7,
        conflicts: [],
        effects: [
            { level: 1, unlockService: 'RARITY_PROMOTION', dailyLimit: 1, baseCost: 500, desc: 'Upgrade 1 item rarity/day (500g)' },
            { level: 2, costReduction: 0.30, dailyLimit: 2, desc: '-30% cost, 2 uses/day' }
        ]
    }
];

export const StoreUpgradeTree = {
    /**
     * Get upgrade definition by ID
     */
    getUpgrade(upgradeId) {
        return STORE_UPGRADES.find(u => u.id === upgradeId);
    },

    /**
     * Get all upgrades in a branch
     */
    getUpgradesByBranch(branchId) {
        return STORE_UPGRADES.filter(u => u.branch === branchId);
    },

    /**
     * Get current level of an upgrade from persistence
     */
    getCurrentLevel(upgradeId) {
        const data = Persistence.getData();
        return data.storeUpgrades[upgradeId] || 0;
    },

    /**
     * Check if upgrade is unlocked (based on Store Rank)
     */
    isUnlocked(upgradeId) {
        const upgrade = this.getUpgrade(upgradeId);
        if (!upgrade) return false;

        const data = Persistence.getData();
        const currentRank = data.storeRank;

        return currentRank >= upgrade.unlockRank;
    },

    /**
     * Check if upgrade can be purchased (rank, points, conflicts)
     */
    canPurchase(upgradeId) {
        const upgrade = this.getUpgrade(upgradeId);
        if (!upgrade) return { can: false, reason: 'Upgrade not found' };

        // Check if unlocked
        if (!this.isUnlocked(upgradeId)) {
            return { can: false, reason: `Requires Store Rank ${upgrade.unlockRank}` };
        }

        // Check current level vs max
        const currentLevel = this.getCurrentLevel(upgradeId);
        if (currentLevel >= upgrade.maxLevel) {
            return { can: false, reason: 'Already at max level' };
        }

        // Check if player has enough points
        const data = Persistence.getData();
        if (data.storeUpgradePoints < upgrade.pointCost) {
            return { can: false, reason: 'Not enough Upgrade Points' };
        }

        // Check conflicts
        for (const conflictId of upgrade.conflicts) {
            const conflictUpgrade = this.getUpgrade(conflictId);
            const conflictLevel = this.getCurrentLevel(conflictId);
            if (conflictLevel >= conflictUpgrade.maxLevel) {
                return { can: false, reason: `Conflicts with ${conflictUpgrade.name}` };
            }
        }

        return { can: true };
    },

    /**
     * Purchase an upgrade level
     */
    purchaseUpgrade(upgradeId) {
        const canPurchase = this.canPurchase(upgradeId);
        if (!canPurchase.can) {
            console.log(`Cannot purchase ${upgradeId}: ${canPurchase.reason}`);
            return false;
        }

        const upgrade = this.getUpgrade(upgradeId);
        const success = Persistence.buyStoreUpgrade(upgradeId, upgrade.pointCost);

        if (success) {
            console.log(`Purchased ${upgrade.name} level ${this.getCurrentLevel(upgradeId)}`);
            return true;
        }

        return false;
    },

    /**
     * Get active effect for an upgrade at its current level
     */
    getActiveEffect(upgradeId) {
        const upgrade = this.getUpgrade(upgradeId);
        if (!upgrade) return null;

        const currentLevel = this.getCurrentLevel(upgradeId);
        if (currentLevel === 0) return null;

        return upgrade.effects[currentLevel - 1]; // Effects array is 0-indexed
    },

    /**
     * Get all active effects across all purchased upgrades
     */
    getAllActiveEffects() {
        const effects = {};

        for (const upgrade of STORE_UPGRADES) {
            const effect = this.getActiveEffect(upgrade.id);
            if (effect) {
                effects[upgrade.id] = effect;
            }
        }

        return effects;
    },

    /**
     * Calculate total sell price bonus from upgrades
     */
    getSellPriceBonus() {
        const effect = this.getActiveEffect('better_sell_prices');
        return effect ? effect.sellPriceBonus : 0;
    },

    /**
     * Calculate total crate discount from upgrades
     */
    getCrateDiscount() {
        const effect = this.getActiveEffect('crate_discounts');
        return effect ? effect.crateDiscount : 0;
    },

    /**
     * Calculate run gold bonus from upgrades
     */
    getRunGoldBonus() {
        const effect = this.getActiveEffect('run_dividend');
        return effect ? effect.runGoldBonus : 0;
    },

    /**
     * Get stat stability exclusion percentage
     */
    getStatStabilityExclusion() {
        const effect = this.getActiveEffect('stat_stability');
        return effect ? effect.excludeBottomPercent : 0;
    },

    /**
     * Get duplicate insurance settings
     */
    getDuplicateInsurance() {
        const effect = this.getActiveEffect('duplicate_insurance');
        return effect ? { threshold: effect.dupeThreshold, tokens: effect.tokenPerDupe } : null;
    },

    /**
     * Check if a service is unlocked via upgrades
     */
    isServiceUnlocked(serviceId) {
        const serviceUpgrades = {
            'REFORGE': 'reforge_specialist',
            'FUSION': 'fusion_lab',
            'RARITY_PROMOTION': 'rarity_promotion'
        };

        const upgradeId = serviceUpgrades[serviceId];
        if (!upgradeId) return false;

        return this.getCurrentLevel(upgradeId) >= 1;
    },

    /**
     * Get service enhancement level
     */
    getServiceEnhancements(serviceId) {
        const serviceUpgrades = {
            'REFORGE': 'reforge_specialist',
            'FUSION': 'fusion_lab',
            'RARITY_PROMOTION': 'rarity_promotion'
        };

        const upgradeId = serviceUpgrades[serviceId];
        if (!upgradeId) return null;

        const level = this.getCurrentLevel(upgradeId);
        const upgrade = this.getUpgrade(upgradeId);

        return {
            level,
            effects: upgrade.effects.slice(0, level) // All effects up to current level
        };
    },

    /**
     * Get formatted display for upgrade tree UI
     */
    getUpgradeTreeDisplay() {
        const display = {
            [BRANCHES.ECONOMY]: [],
            [BRANCHES.LOOT_QUALITY]: [],
            [BRANCHES.SERVICES]: []
        };

        for (const upgrade of STORE_UPGRADES) {
            const currentLevel = this.getCurrentLevel(upgrade.id);
            const isUnlocked = this.isUnlocked(upgrade.id);
            const canPurchase = this.canPurchase(upgrade.id);

            display[upgrade.branch].push({
                ...upgrade,
                currentLevel,
                isUnlocked,
                canPurchase: canPurchase.can,
                canPurchaseReason: canPurchase.reason,
                nextEffect: currentLevel < upgrade.maxLevel ? upgrade.effects[currentLevel] : null
            });
        }

        // Sort by row within each branch
        for (const branch in display) {
            display[branch].sort((a, b) => a.row - b.row);
        }

        return display;
    }
};
