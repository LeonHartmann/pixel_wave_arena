/**
 * StoreRankManager.js
 * Manages Store Rank progression, XP thresholds, and feature unlocks
 */

// Store Rank Configuration
export const STORE_RANK_CONFIG = [
    {
        rank: 1,
        xpRequired: 0,
        name: "Novice Merchant",
        description: "Your journey begins",
        upgradePoints: 0,
        unlocks: [
            { type: 'CRATE', id: 'BASIC_CRATE', name: 'Basic Crate' }
        ]
    },
    {
        rank: 2,
        xpRequired: 100,
        name: "Apprentice Trader",
        description: "Learning the ropes",
        upgradePoints: 1,
        unlocks: [
            { type: 'CRATE', id: 'SILVER_CRATE', name: 'Silver Crate' },
            { type: 'SERVICE', id: 'REFORGE', name: 'Reforge Service' },
            { type: 'UPGRADES', id: 'ROW_1', name: 'First Row of Upgrades' }
        ]
    },
    {
        rank: 3,
        xpRequired: 300,
        name: "Skilled Vendor",
        description: "Building your empire",
        upgradePoints: 1,
        unlocks: [
            { type: 'FEATURE', id: 'ROTATING_DEALS', name: 'Rotating Deals Panel' }
        ]
    },
    {
        rank: 4,
        xpRequired: 600,
        name: "Master Merchant",
        description: "A force in the market",
        upgradePoints: 1,
        unlocks: [
            { type: 'CRATE', id: 'GOLD_CRATE', name: 'Gold Crate' }
        ]
    },
    {
        rank: 5,
        xpRequired: 1000,
        name: "Elite Broker",
        description: "Deals of legend",
        upgradePoints: 2, // Bonus point at rank 5
        unlocks: [
            { type: 'UPGRADES', id: 'ROW_2', name: 'Second Row of Upgrades' }
        ]
    },
    {
        rank: 6,
        xpRequired: 1500,
        name: "Arcane Artisan",
        description: "Crafting the impossible",
        upgradePoints: 1,
        unlocks: [
            { type: 'SERVICE', id: 'FUSION', name: 'Fusion Service' }
        ]
    },
    {
        rank: 7,
        xpRequired: 2100,
        name: "Legendary Dealer",
        description: "Tales are told of your wares",
        upgradePoints: 1,
        unlocks: [
            { type: 'UPGRADES', id: 'ROW_3', name: 'Third Row of Upgrades' }
        ]
    },
    {
        rank: 8,
        xpRequired: 2800,
        name: "Mythic Curator",
        description: "Only the finest for your shop",
        upgradePoints: 1,
        unlocks: [
            { type: 'CRATE', id: 'LEGENDARY_CRATE', name: 'Legendary Crate' }
        ]
    },
    {
        rank: 9,
        xpRequired: 3600,
        name: "Cosmic Merchant",
        description: "Beyond mortal commerce",
        upgradePoints: 1,
        unlocks: []
    },
    {
        rank: 10,
        xpRequired: 4500,
        name: "Transcendent Tycoon",
        description: "Master of all trades",
        upgradePoints: 2, // Bonus point at rank 10
        unlocks: [
            { type: 'BONUS', id: 'TOKEN_BOOST', name: '+5% Shop Token Gain', value: 0.05 }
        ]
    }
];

export const StoreRankManager = {
    /**
     * Get configuration for a specific rank
     */
    getRankConfig(rank) {
        return STORE_RANK_CONFIG.find(r => r.rank === rank) || STORE_RANK_CONFIG[0];
    },

    /**
     * Get current rank based on XP
     */
    getCurrentRank(xp) {
        let currentRank = 1;
        for (let i = STORE_RANK_CONFIG.length - 1; i >= 0; i--) {
            if (xp >= STORE_RANK_CONFIG[i].xpRequired) {
                currentRank = STORE_RANK_CONFIG[i].rank;
                break;
            }
        }
        return currentRank;
    },

    /**
     * Get XP required for next rank
     */
    getXPForNextRank(currentRank) {
        if (currentRank >= 10) return null; // Max rank
        const nextRankConfig = STORE_RANK_CONFIG.find(r => r.rank === currentRank + 1);
        return nextRankConfig ? nextRankConfig.xpRequired : null;
    },

    /**
     * Get XP progress percentage for current rank
     */
    getProgressToNextRank(currentXP, currentRank) {
        if (currentRank >= 10) return 100; // Max rank

        const currentRankXP = this.getRankConfig(currentRank).xpRequired;
        const nextRankXP = this.getXPForNextRank(currentRank);

        if (!nextRankXP) return 100;

        const xpIntoRank = currentXP - currentRankXP;
        const xpNeededForRank = nextRankXP - currentRankXP;

        return Math.min(100, (xpIntoRank / xpNeededForRank) * 100);
    },

    /**
     * Get all unlocks up to and including a specific rank
     */
    getUnlocksUpToRank(rank) {
        const unlocks = [];
        for (let i = 0; i < STORE_RANK_CONFIG.length && STORE_RANK_CONFIG[i].rank <= rank; i++) {
            unlocks.push(...STORE_RANK_CONFIG[i].unlocks);
        }
        return unlocks;
    },

    /**
     * Check if a specific feature is unlocked at current rank
     */
    isFeatureUnlocked(currentRank, featureType, featureId) {
        const unlocks = this.getUnlocksUpToRank(currentRank);
        return unlocks.some(u => u.type === featureType && u.id === featureId);
    },

    /**
     * Check if a crate type is unlocked
     */
    isCrateUnlocked(currentRank, crateId) {
        return this.isFeatureUnlocked(currentRank, 'CRATE', crateId);
    },

    /**
     * Check if a service is unlocked
     */
    isServiceUnlocked(currentRank, serviceId) {
        return this.isFeatureUnlocked(currentRank, 'SERVICE', serviceId);
    },

    /**
     * Get rank at which a feature unlocks
     */
    getRankForFeature(featureType, featureId) {
        for (const config of STORE_RANK_CONFIG) {
            const unlock = config.unlocks.find(u => u.type === featureType && u.id === featureId);
            if (unlock) return config.rank;
        }
        return null;
    },

    /**
     * Get total upgrade points earned up to a rank
     */
    getTotalUpgradePoints(rank) {
        let total = 0;
        for (let i = 0; i < STORE_RANK_CONFIG.length && STORE_RANK_CONFIG[i].rank <= rank; i++) {
            total += STORE_RANK_CONFIG[i].upgradePoints;
        }
        return total;
    },

    /**
     * Get Shop Token bonus multiplier based on unlocks
     */
    getTokenBonus(currentRank) {
        const unlocks = this.getUnlocksUpToRank(currentRank);
        const tokenBoost = unlocks.find(u => u.type === 'BONUS' && u.id === 'TOKEN_BOOST');
        return tokenBoost ? tokenBoost.value : 0;
    },

    /**
     * Get all crates unlocked at current rank
     */
    getUnlockedCrates(currentRank) {
        const unlocks = this.getUnlocksUpToRank(currentRank);
        return unlocks.filter(u => u.type === 'CRATE').map(u => u.id);
    },

    /**
     * Get all services unlocked at current rank
     */
    getUnlockedServices(currentRank) {
        const unlocks = this.getUnlocksUpToRank(currentRank);
        return unlocks.filter(u => u.type === 'SERVICE').map(u => u.id);
    },

    /**
     * Get upgrade row unlocks (for upgrade tree)
     */
    getUnlockedUpgradeRows(currentRank) {
        const unlocks = this.getUnlocksUpToRank(currentRank);
        const rows = unlocks.filter(u => u.type === 'UPGRADES').map(u => {
            const match = u.id.match(/ROW_(\d+)/);
            return match ? parseInt(match[1]) : 0;
        });
        return Math.max(0, ...rows);
    },

    /**
     * Format rank display with title and progress
     */
    formatRankDisplay(currentXP, currentRank) {
        const config = this.getRankConfig(currentRank);
        const progress = this.getProgressToNextRank(currentXP, currentRank);
        const nextRankXP = this.getXPForNextRank(currentRank);

        return {
            rank: currentRank,
            name: config.name,
            description: config.description,
            currentXP: currentXP,
            nextRankXP: nextRankXP,
            progress: progress,
            isMaxRank: currentRank >= 10
        };
    }
};
