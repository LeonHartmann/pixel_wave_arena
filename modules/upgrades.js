export const PERM_UPGRADES = [
    // --- OFFENSE ---
    { id: 'dmg_c', category: 'OFFENSE', name: 'Iron Bullets', rarity: 'COMMON', baseCost: 100, scale: 1.5, stat: 'damage', val: 2, desc: '+2 Damage' },
    { id: 'dmg_r', category: 'OFFENSE', name: 'Steel Slugs', rarity: 'RARE', baseCost: 500, scale: 1.6, stat: 'damage', val: 5, desc: '+5 Damage' },
    { id: 'dmg_e', category: 'OFFENSE', name: 'Plasma Cores', rarity: 'EPIC', baseCost: 2500, scale: 1.7, stat: 'damage', val: 15, desc: '+15 Damage' },
    { id: 'dmg_l', category: 'OFFENSE', name: 'God Killers', rarity: 'LEGENDARY', baseCost: 10000, scale: 2.0, stat: 'damage', val: 40, desc: '+40 Damage' },

    { id: 'spd_c', category: 'OFFENSE', name: 'Greased Trigger', rarity: 'COMMON', baseCost: 150, scale: 1.5, stat: 'fireRate', val: 0.02, desc: '+2% Atk Speed' },
    { id: 'spd_r', category: 'OFFENSE', name: 'Recoil Dampener', rarity: 'RARE', baseCost: 600, scale: 1.6, stat: 'fireRate', val: 0.05, desc: '+5% Atk Speed' },
    { id: 'spd_e', category: 'OFFENSE', name: 'Auto-Loader', rarity: 'EPIC', baseCost: 3000, scale: 1.7, stat: 'fireRate', val: 0.12, desc: '+12% Atk Speed' },
    { id: 'spd_l', category: 'OFFENSE', name: 'Minigun Motor', rarity: 'LEGENDARY', baseCost: 15000, scale: 2.0, stat: 'fireRate', val: 0.30, desc: '+30% Atk Speed' },

    // --- DEFENSE ---
    { id: 'hp_c', category: 'DEFENSE', name: 'Thick Skin', rarity: 'COMMON', baseCost: 100, scale: 1.5, stat: 'maxHp', val: 10, desc: '+10 HP' },
    { id: 'hp_r', category: 'DEFENSE', name: 'Mesh Armor', rarity: 'RARE', baseCost: 500, scale: 1.6, stat: 'maxHp', val: 30, desc: '+30 HP' },
    { id: 'hp_e', category: 'DEFENSE', name: 'Forcefield', rarity: 'EPIC', baseCost: 2000, scale: 1.7, stat: 'maxHp', val: 80, desc: '+80 HP' },
    { id: 'hp_l', category: 'DEFENSE', name: 'Titan Soul', rarity: 'LEGENDARY', baseCost: 10000, scale: 2.0, stat: 'maxHp', val: 250, desc: '+250 HP' },

    { id: 'reg_c', category: 'DEFENSE', name: 'Bandages', rarity: 'COMMON', baseCost: 300, scale: 1.5, stat: 'regen', val: 0.2, desc: '+0.2 HP/s' },
    { id: 'reg_r', category: 'DEFENSE', name: 'Bio-Gel', rarity: 'RARE', baseCost: 1200, scale: 1.6, stat: 'regen', val: 0.5, desc: '+0.5 HP/s' },
    { id: 'reg_e', category: 'DEFENSE', name: 'Nanobots', rarity: 'EPIC', baseCost: 5000, scale: 1.7, stat: 'regen', val: 1.5, desc: '+1.5 HP/s' },
    { id: 'reg_l', category: 'DEFENSE', name: 'Phoenix Blood', rarity: 'LEGENDARY', baseCost: 25000, scale: 2.0, stat: 'regen', val: 5.0, desc: '+5.0 HP/s' },

    // --- UTILITY ---
    { id: 'mov_c', category: 'UTILITY', name: 'Light Shoes', rarity: 'COMMON', baseCost: 150, scale: 1.5, stat: 'speed', val: 5, desc: '+5 Speed' },
    { id: 'mov_r', category: 'UTILITY', name: 'Jet Boots', rarity: 'RARE', baseCost: 800, scale: 1.6, stat: 'speed', val: 15, desc: '+15 Speed' },
    { id: 'mov_e', category: 'UTILITY', name: 'Teleport Module', rarity: 'EPIC', baseCost: 3500, scale: 1.7, stat: 'speed', val: 40, desc: '+40 Speed' },
    { id: 'mov_l', category: 'UTILITY', name: 'Time Warp', rarity: 'LEGENDARY', baseCost: 15000, scale: 2.0, stat: 'speed', val: 100, desc: '+100 Speed' },

    { id: 'gold_c', category: 'UTILITY', name: 'Pocket Change', rarity: 'COMMON', baseCost: 200, scale: 1.5, stat: 'gold', val: 0.05, desc: '+5% Gold' },
    { id: 'gold_r', category: 'UTILITY', name: 'Investment', rarity: 'RARE', baseCost: 1000, scale: 1.6, stat: 'gold', val: 0.15, desc: '+15% Gold' },
    { id: 'gold_e', category: 'UTILITY', name: 'Midas Touch', rarity: 'EPIC', baseCost: 4000, scale: 1.7, stat: 'gold', val: 0.35, desc: '+35% Gold' },
    { id: 'gold_l', category: 'UTILITY', name: 'Banker', rarity: 'LEGENDARY', baseCost: 20000, scale: 2.0, stat: 'gold', val: 1.00, desc: '+100% Gold' },
];