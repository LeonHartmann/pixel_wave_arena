/**
 * RotatingOffers.js
 * Manages the rotating catalog of special deals in the Store
 */

import { Persistence } from './Persistence.js';
import { GachaSystem } from './GachaSystem.js';
import { ITEMS, CRATE_TYPES } from './Items.js';
import { StoreUpgradeTree } from './StoreUpgradeTree.js';

// Offer Pool Definitions
const OFFER_POOL = [
    // Gem Bundles
    {
        id: 'epic_gem_bundle',
        name: 'Epic Gem Bundle',
        description: 'Random Epic-rarity stat gem at a discount',
        type: 'ITEM_BUNDLE',
        cost: { gold: 400 },
        reward: {
            type: 'RANDOM_ITEM',
            rarity: 'EPIC',
            category: 'STAT_GEM',
            count: 1
        },
        weight: 10 // Spawn weight in pool
    },
    {
        id: 'legendary_gem_bundle',
        name: 'Legendary Gem Bundle',
        description: 'Random Legendary-rarity stat gem',
        type: 'ITEM_BUNDLE',
        cost: { gold: 1500 },
        reward: {
            type: 'RANDOM_ITEM',
            rarity: 'LEGENDARY',
            category: 'STAT_GEM',
            count: 1
        },
        weight: 5
    },

    // Specialized Crates
    {
        id: 'damage_focus_crate',
        name: 'Damage Focus Crate',
        description: '3 stat gems focused on damage',
        type: 'SPECIAL_CRATE',
        cost: { gold: 350 },
        reward: {
            type: 'FILTERED_ITEMS',
            category: 'STAT_GEM',
            filter: { statKey: 'damage' },
            count: 3
        },
        weight: 8
    },
    {
        id: 'defense_focus_crate',
        name: 'Defense Focus Crate',
        description: '3 stat gems focused on HP/survivability',
        type: 'SPECIAL_CRATE',
        cost: { gold: 350 },
        reward: {
            type: 'FILTERED_ITEMS',
            category: 'STAT_GEM',
            filter: { statKey: 'maxHp' },
            count: 3
        },
        weight: 8
    },

    // Token/XP Boosters
    {
        id: 'token_boost_pack',
        name: 'Token Boost Pack',
        description: '100 Shop Tokens + 1 Silver Crate',
        type: 'BUNDLE',
        cost: { gold: 600 },
        reward: {
            type: 'BUNDLE',
            items: [
                { type: 'SHOP_TOKENS', amount: 100 },
                { type: 'CRATE', crateType: 'SILVER_CRATE' }
            ]
        },
        weight: 7
    },
    {
        id: 'store_xp_boost',
        name: 'Store XP Boost',
        description: '200 Store XP to rank up faster',
        type: 'XP_BOOST',
        cost: { shopTokens: 50 },
        reward: {
            type: 'STORE_XP',
            amount: 200
        },
        weight: 6
    },

    // Starter Packs
    {
        id: 'starter_pack',
        name: 'Adventurer\'s Starter Pack',
        description: '2 Basic Crates + 50 Shop Tokens',
        type: 'BUNDLE',
        cost: { gold: 150 },
        reward: {
            type: 'BUNDLE',
            items: [
                { type: 'CRATE', crateType: 'BASIC_CRATE' },
                { type: 'CRATE', crateType: 'BASIC_CRATE' },
                { type: 'SHOP_TOKENS', amount: 50 }
            ]
        },
        weight: 12
    },
    {
        id: 'gold_saver_pack',
        name: 'Economy Pack',
        description: '1 Silver Crate + 1 Gold Crate at 15% discount',
        type: 'BUNDLE',
        cost: { gold: 2100 }, // Normal: 2500, discounted to 2100
        reward: {
            type: 'BUNDLE',
            items: [
                { type: 'CRATE', crateType: 'SILVER_CRATE' },
                { type: 'CRATE', crateType: 'GOLD_CRATE' }
            ]
        },
        weight: 9
    },

    // Cosmetic Offers
    {
        id: 'random_cosmetic',
        name: 'Mystery Cosmetic',
        description: 'Random weapon or character skin',
        type: 'COSMETIC_BUNDLE',
        cost: { gold: 300 },
        reward: {
            type: 'RANDOM_ITEM',
            category: ['WEAPON_SKIN', 'CHARACTER_SKIN'],
            rarity: 'RANDOM'
        },
        weight: 10
    },

    // Limited High-Value Offers
    {
        id: 'jackpot_bundle',
        name: 'Jackpot Bundle',
        description: '1 Legendary Crate + 200 Shop Tokens',
        type: 'PREMIUM_BUNDLE',
        cost: { gold: 9500 }, // Slight discount from 10000 + equivalent
        reward: {
            type: 'BUNDLE',
            items: [
                { type: 'CRATE', crateType: 'LEGENDARY_CRATE' },
                { type: 'SHOP_TOKENS', amount: 200 }
            ]
        },
        weight: 3 // Rare
    }
];

export const RotatingOffers = {
    /**
     * Initialize offers (called on game start or Store entry)
     */
    init() {
        const data = Persistence.getData();

        // If no offers exist or it's been more than a session, refresh
        if (!data.rotatingOffers.currentOffers || data.rotatingOffers.currentOffers.length === 0) {
            this.refreshOffers(true); // Free refresh on init
        }
    },

    /**
     * Refresh the rotating offers
     * @param {boolean} isFree - Whether this refresh is free
     */
    refreshOffers(isFree = false) {
        const data = Persistence.getData();

        // Check if refresh is available
        if (!isFree) {
            const canRefresh = this.canRefresh();
            if (!canRefresh.can) {
                return { success: false, error: canRefresh.reason };
            }

            // Deduct cost
            if (canRefresh.cost.gold) {
                data.gold -= canRefresh.cost.gold;
            }
            if (canRefresh.cost.shopTokens) {
                // Don't use addShopTokens (that adds XP), just deduct
                data.shopTokens -= canRefresh.cost.shopTokens;
            }

            // Mark free refresh as used if it was available
            if (!data.rotatingOffers.freeRefreshUsed) {
                data.rotatingOffers.freeRefreshUsed = true;
            }
        }

        // Select 3 random offers from pool (weighted)
        const selectedOffers = this._selectWeightedOffers(3);

        // Store selected offers
        data.rotatingOffers.currentOffers = selectedOffers;
        data.rotatingOffers.lastRefresh = Date.now();

        Persistence.save();

        return {
            success: true,
            offers: selectedOffers,
            cost: isFree ? null : this.getRefreshCost()
        };
    },

    /**
     * Select weighted random offers from pool
     */
    _selectWeightedOffers(count) {
        const selected = [];
        const pool = [...OFFER_POOL]; // Clone pool

        for (let i = 0; i < count && pool.length > 0; i++) {
            const totalWeight = pool.reduce((sum, offer) => sum + offer.weight, 0);
            let roll = Math.random() * totalWeight;

            let chosen = null;
            for (const offer of pool) {
                roll -= offer.weight;
                if (roll <= 0) {
                    chosen = offer;
                    break;
                }
            }

            if (chosen) {
                selected.push({ ...chosen }); // Clone offer
                // Remove from pool to avoid duplicates
                const index = pool.findIndex(o => o.id === chosen.id);
                if (index !== -1) pool.splice(index, 1);
            }
        }

        return selected;
    },

    /**
     * Check if player can refresh offers
     */
    canRefresh() {
        const data = Persistence.getData();

        // Free refresh available?
        if (!data.rotatingOffers.freeRefreshUsed) {
            return { can: true, isFree: true };
        }

        // Paid refresh cost
        const cost = this.getRefreshCost();

        // Check if player can afford either gold or tokens
        if (data.gold >= cost.gold || data.shopTokens >= cost.shopTokens) {
            return { can: true, isFree: false, cost };
        }

        return {
            can: false,
            reason: `Need ${cost.gold} gold OR ${cost.shopTokens} Shop Tokens to refresh`
        };
    },

    /**
     * Get refresh cost (player can choose gold or tokens)
     */
    getRefreshCost() {
        return {
            gold: 50,
            shopTokens: 20
        };
    },

    /**
     * Purchase an offer
     */
    purchaseOffer(offerId) {
        const data = Persistence.getData();

        // Find offer in current offers
        const offer = data.rotatingOffers.currentOffers.find(o => o.id === offerId);
        if (!offer) {
            return { success: false, error: 'Offer not found or expired' };
        }

        // Check cost
        if (offer.cost.gold && data.gold < offer.cost.gold) {
            return { success: false, error: `Not enough gold. Need ${offer.cost.gold} gold.` };
        }
        if (offer.cost.shopTokens && data.shopTokens < offer.cost.shopTokens) {
            return { success: false, error: `Not enough Shop Tokens. Need ${offer.cost.shopTokens} tokens.` };
        }

        // Deduct cost
        if (offer.cost.gold) data.gold -= offer.cost.gold;
        if (offer.cost.shopTokens) data.shopTokens -= offer.cost.shopTokens;

        // Grant reward
        const rewards = this._grantReward(offer.reward);

        // Remove offer from current offers (single-purchase)
        const index = data.rotatingOffers.currentOffers.findIndex(o => o.id === offerId);
        if (index !== -1) {
            data.rotatingOffers.currentOffers.splice(index, 1);
        }

        Persistence.save();

        return {
            success: true,
            cost: offer.cost,
            rewards
        };
    },

    /**
     * Grant reward from offer
     */
    _grantReward(reward) {
        const grantedItems = [];
        const gacha = new GachaSystem();

        if (reward.type === 'RANDOM_ITEM') {
            // Grant random item of specified rarity/category
            const categories = Array.isArray(reward.category) ? reward.category : [reward.category];
            let pool = ITEMS;

            // Filter by category
            pool = pool.filter(item => categories.includes(item.category));

            // Filter by rarity (if not RANDOM)
            if (reward.rarity !== 'RANDOM') {
                pool = pool.filter(item => item.rarity === reward.rarity);
            }

            if (pool.length > 0) {
                const randomDef = pool[Math.floor(Math.random() * pool.length)];
                const instance = GachaSystem.generateItemInstance(randomDef);
                gacha.addToInventory(instance);
                grantedItems.push(instance);
            }
        } else if (reward.type === 'FILTERED_ITEMS') {
            // Grant items with specific stat
            let pool = ITEMS.filter(item => item.category === reward.category);

            // Filter by stat key
            if (reward.filter && reward.filter.statKey) {
                pool = pool.filter(item => item.stats && item.stats[reward.filter.statKey]);
            }

            for (let i = 0; i < reward.count && pool.length > 0; i++) {
                const randomDef = pool[Math.floor(Math.random() * pool.length)];
                const instance = GachaSystem.generateItemInstance(randomDef);
                gacha.addToInventory(instance);
                grantedItems.push(instance);
            }
        } else if (reward.type === 'BUNDLE') {
            // Grant multiple items
            for (const item of reward.items) {
                if (item.type === 'CRATE') {
                    const rewards = gacha.openCrate(item.crateType);
                    grantedItems.push(...rewards);
                } else if (item.type === 'SHOP_TOKENS') {
                    Persistence.addShopTokens(item.amount);
                    grantedItems.push({ type: 'tokens', amount: item.amount });
                }
            }
        } else if (reward.type === 'STORE_XP') {
            Persistence.addStoreXP(reward.amount);
            grantedItems.push({ type: 'xp', amount: reward.amount });
        }

        return grantedItems;
    },

    /**
     * Get current offers
     */
    getCurrentOffers() {
        const data = Persistence.getData();
        return data.rotatingOffers.currentOffers || [];
    },

    /**
     * Reset free refresh (called on new session/day if needed)
     */
    resetFreeRefresh() {
        const data = Persistence.getData();
        data.rotatingOffers.freeRefreshUsed = false;
        Persistence.save();
    }
};
