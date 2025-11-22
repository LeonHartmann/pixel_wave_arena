export const RARITY_TIERS = {
    COMMON: { color: '#95a5a6', chance: 50, goldValue: 50 },
    RARE: { color: '#3498db', chance: 30, goldValue: 150 },
    EPIC: { color: '#9b59b6', chance: 15, goldValue: 500 },
    LEGENDARY: { color: '#f1c40f', chance: 4.5, goldValue: 2000 },
    MYTHIC: { color: '#e74c3c', chance: 0.5, goldValue: 10000, hasSpecialAnimation: true }
};

export const CRATE_TYPES = {
    BASIC_CRATE: {
        name: 'Basic Crate',
        cost: 100,
        guaranteedRarity: 'COMMON',
        items: 1,
        mythicChance: 0.1,
        weights: { COMMON: 70, RARE: 25, EPIC: 4.9, LEGENDARY: 0, MYTHIC: 0.1 }
    },
    SILVER_CRATE: {
        name: 'Silver Crate',
        cost: 500,
        guaranteedRarity: 'RARE',
        items: 3,
        mythicChance: 0.5,
        weights: { COMMON: 40, RARE: 40, EPIC: 15, LEGENDARY: 4.5, MYTHIC: 0.5 }
    },
    GOLD_CRATE: {
        name: 'Gold Crate',
        cost: 2000,
        guaranteedRarity: 'EPIC',
        items: 5,
        mythicChance: 2.0,
        weights: { COMMON: 10, RARE: 30, EPIC: 40, LEGENDARY: 18, MYTHIC: 2.0 }
    },
    LEGENDARY_CRATE: {
        name: 'Legendary Crate',
        cost: 10000,
        guaranteedRarity: 'LEGENDARY',
        items: 5,
        mythicChance: 10.0,
        noDuplicates: false,
        weights: { COMMON: 0, RARE: 0, EPIC: 30, LEGENDARY: 60, MYTHIC: 10 }
    }
};

export const ITEM_CATEGORIES = {
    WEAPON_SKIN: 'WEAPON_SKIN',
    CHARACTER_SKIN: 'CHARACTER_SKIN',
    KILL_EFFECT: 'KILL_EFFECT',
    AURA_EFFECT: 'AURA_EFFECT',
    STAT_GEM: 'STAT_GEM'
};

// Sell Price is roughly 20% of a crate cost equivalent or tier value
const SELL_VALUES = {
    COMMON: 20,
    RARE: 100,
    EPIC: 400,
    LEGENDARY: 1500,
    MYTHIC: 5000
};

export const ITEMS = [
    // --- WEAPON SKINS (Cosmetic, no stats variance) ---
    { id: 'w_plasma', name: 'Plasma Blaster', category: ITEM_CATEGORIES.WEAPON_SKIN, rarity: 'COMMON', desc: 'A standard plasma finish.', sellPrice: SELL_VALUES.COMMON },
    { id: 'w_golden', name: 'Golden Gun', category: ITEM_CATEGORIES.WEAPON_SKIN, rarity: 'LEGENDARY', desc: 'Pure gold plating.', sellPrice: SELL_VALUES.LEGENDARY },
    { id: 'w_neon', name: 'Neon Tracer', category: ITEM_CATEGORIES.WEAPON_SKIN, rarity: 'RARE', desc: 'Leaves a bright trail.', sellPrice: SELL_VALUES.RARE },
    { id: 'w_pixel', name: 'Pixel Destroyer', category: ITEM_CATEGORIES.WEAPON_SKIN, rarity: 'EPIC', desc: 'Glitchy visual effects.', sellPrice: SELL_VALUES.EPIC },
    { id: 'w_void', name: 'Void Beam', category: ITEM_CATEGORIES.WEAPON_SKIN, rarity: 'MYTHIC', desc: 'Shoots pure darkness.', sellPrice: SELL_VALUES.MYTHIC },

    // --- CHARACTER SKINS (Cosmetic) ---
    { id: 'c_marine', name: 'Space Marine', category: ITEM_CATEGORIES.CHARACTER_SKIN, rarity: 'COMMON', desc: 'Standard issue armor.', sellPrice: SELL_VALUES.COMMON },
    { id: 'c_ninja', name: 'Cyber Ninja', category: ITEM_CATEGORIES.CHARACTER_SKIN, rarity: 'RARE', desc: 'Stealthy and sleek.', sellPrice: SELL_VALUES.RARE },
    { id: 'c_robot', name: 'Retro Robot', category: ITEM_CATEGORIES.CHARACTER_SKIN, rarity: 'EPIC', desc: 'Beep boop.', sellPrice: SELL_VALUES.EPIC },
    { id: 'c_knight', name: 'Golden Knight', category: ITEM_CATEGORIES.CHARACTER_SKIN, rarity: 'LEGENDARY', desc: 'Shining armor.', sellPrice: SELL_VALUES.LEGENDARY },
    { id: 'c_voidwalker', name: 'Void Walker', category: ITEM_CATEGORIES.CHARACTER_SKIN, rarity: 'MYTHIC', desc: 'One with the abyss.', sellPrice: SELL_VALUES.MYTHIC },

    // --- KILL EFFECTS (Cosmetic) ---
    { id: 'k_pixel', name: 'Pixel Explosion', category: ITEM_CATEGORIES.KILL_EFFECT, rarity: 'COMMON', desc: 'Standard pop.', sellPrice: SELL_VALUES.COMMON },
    { id: 'k_confetti', name: 'Confetti Pop', category: ITEM_CATEGORIES.KILL_EFFECT, rarity: 'RARE', desc: 'Party time!', sellPrice: SELL_VALUES.RARE },
    { id: 'k_gold', name: 'Gold Coins', category: ITEM_CATEGORIES.KILL_EFFECT, rarity: 'LEGENDARY', desc: 'Rains money.', sellPrice: SELL_VALUES.LEGENDARY },
    { id: 'k_blackhole', name: 'Black Hole', category: ITEM_CATEGORIES.KILL_EFFECT, rarity: 'MYTHIC', desc: 'Sucks them into nothingness.', sellPrice: SELL_VALUES.MYTHIC },

    // --- AURA EFFECTS (Cosmetic) ---
    { id: 'a_sparkles', name: 'Rainbow Sparkles', category: ITEM_CATEGORIES.AURA_EFFECT, rarity: 'RARE', desc: 'Fabulous.', sellPrice: SELL_VALUES.RARE },
    { id: 'a_fire', name: 'Fire Ring', category: ITEM_CATEGORIES.AURA_EFFECT, rarity: 'EPIC', desc: 'Burning intensity.', sellPrice: SELL_VALUES.EPIC },
    { id: 'a_void', name: 'Void Particles', category: ITEM_CATEGORIES.AURA_EFFECT, rarity: 'MYTHIC', desc: 'Dark matter floats around you.', sellPrice: SELL_VALUES.MYTHIC },

    // --- STAT GEMS (Random Variance!) ---
    // Variance: 0.2 means stats can roll +/- 20%
    { id: 'g_dmg_s', name: 'Ruby Shard', category: ITEM_CATEGORIES.STAT_GEM, rarity: 'COMMON', stats: { damage: 2 }, variance: 0.2, desc: '+~2% Damage', sellPrice: SELL_VALUES.COMMON },
    { id: 'g_spd_s', name: 'Sapphire Shard', category: ITEM_CATEGORIES.STAT_GEM, rarity: 'COMMON', stats: { speed: 5 }, variance: 0.2, desc: '+~5% Speed', sellPrice: SELL_VALUES.COMMON },
    { id: 'g_hp_s', name: 'Emerald Shard', category: ITEM_CATEGORIES.STAT_GEM, rarity: 'COMMON', stats: { maxHp: 10 }, variance: 0.2, desc: '+~10 HP', sellPrice: SELL_VALUES.COMMON },
    
    { id: 'g_dmg_m', name: 'Ruby Gem', category: ITEM_CATEGORIES.STAT_GEM, rarity: 'RARE', stats: { damage: 5 }, variance: 0.15, desc: '+~5% Damage', sellPrice: SELL_VALUES.RARE },
    { id: 'g_spd_m', name: 'Sapphire Gem', category: ITEM_CATEGORIES.STAT_GEM, rarity: 'RARE', stats: { speed: 10 }, variance: 0.15, desc: '+~10% Speed', sellPrice: SELL_VALUES.RARE },
    
    { id: 'g_dmg_l', name: 'Perfect Ruby', category: ITEM_CATEGORIES.STAT_GEM, rarity: 'EPIC', stats: { damage: 10 }, variance: 0.1, desc: '+~10% Damage', sellPrice: SELL_VALUES.EPIC },
    { id: 'g_crit_l', name: 'Diamond', category: ITEM_CATEGORIES.STAT_GEM, rarity: 'LEGENDARY', stats: { critChance: 5 }, variance: 0.1, desc: '+~5% Crit Chance', sellPrice: SELL_VALUES.LEGENDARY }
];

export const FREE_CRATE_REWARDS = {
    DAILY_PLAY: {
        firstMatch: 'BASIC_CRATE',
        threeMatches: 'SILVER_CRATE',
        fiveMatches: 'GOLD_CRATE'
    },
    WAVES: [
        { wave: 5, crate: 'BASIC_CRATE', chance: 0.3 },
        { wave: 10, crate: 'BASIC_CRATE', chance: 0.5 },
        { wave: 15, crate: 'SILVER_CRATE', chance: 0.3 },
        { wave: 20, crate: 'SILVER_CRATE', chance: 0.5 },
        { wave: 30, crate: 'GOLD_CRATE', chance: 1.0 }
    ]
};