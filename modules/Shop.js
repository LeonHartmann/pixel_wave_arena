export const Shop = {
    UPGRADES: [
        // --- DAMAGE ---
        {
            id: 'dmg_common',
            name: 'Damage Boost',
            description: 'Increases damage by 5.',
            rarity: 'COMMON',
            icon: 'damage',
            apply: (player) => { player.damage += 5; }
        },
        {
            id: 'dmg_rare',
            name: 'Heavy Rounds',
            description: 'Increases damage by 12.',
            rarity: 'RARE',
            icon: 'damage',
            apply: (player) => { player.damage += 12; }
        },
        {
            id: 'dmg_epic',
            name: 'High Caliber',
            description: 'Increases damage by 25.',
            rarity: 'EPIC',
            icon: 'damage',
            apply: (player) => { player.damage += 25; }
        },
        {
            id: 'dmg_legendary',
            name: 'God Slayer',
            description: 'Increases damage by 60.',
            rarity: 'LEGENDARY',
            icon: 'damage',
            apply: (player) => { player.damage += 60; }
        },

        // --- ATTACK SPEED ---
        {
            id: 'rate_common',
            name: 'Gloves of Haste',
            description: 'Shoot 10% faster.',
            rarity: 'COMMON',
            icon: 'firerate',
            apply: (player) => {
                player.fireRateBonus += 0.10;
                player.updateFireRate();
            }
        },
        {
            id: 'rate_rare',
            name: 'Rapid Fire',
            description: 'Shoot 20% faster.',
            rarity: 'RARE',
            icon: 'firerate',
            apply: (player) => {
                player.fireRateBonus += 0.20;
                player.updateFireRate();
            }
        },
        {
            id: 'rate_epic',
            name: 'Machine Gun',
            description: 'Shoot 35% faster.',
            rarity: 'EPIC',
            icon: 'firerate',
            apply: (player) => {
                player.fireRateBonus += 0.35;
                player.updateFireRate();
            }
        },
        {
            id: 'rate_legendary',
            name: 'Bullet Storm',
            description: 'Shoot 60% faster!',
            rarity: 'LEGENDARY',
            icon: 'firerate',
            apply: (player) => {
                player.fireRateBonus += 0.60;
                player.updateFireRate();
            }
        },

        // --- HEALTH ---
        {
            id: 'hp_common',
            name: 'Healthy Snack',
            description: '+20 Max HP and Heal.',
            rarity: 'COMMON',
            icon: 'health',
            apply: (player) => { player.maxHp += 20; player.hp += 20; }
        },
        {
            id: 'hp_rare',
            name: 'Hearty Meal',
            description: '+50 Max HP and Heal.',
            rarity: 'RARE',
            icon: 'health',
            apply: (player) => { player.maxHp += 50; player.hp += 50; }
        },
        {
            id: 'hp_epic',
            name: 'Life Elixir',
            description: '+100 Max HP and Full Heal.',
            rarity: 'EPIC',
            icon: 'health',
            apply: (player) => { player.maxHp += 100; player.hp = player.maxHp; }
        },
        {
            id: 'hp_legendary',
            name: 'Titan\'s Blood',
            description: '+250 Max HP and Full Heal.',
            rarity: 'LEGENDARY',
            icon: 'health',
            apply: (player) => { player.maxHp += 250; player.hp = player.maxHp; }
        },

        // --- MOVEMENT SPEED ---
        {
            id: 'speed_common',
            name: 'Light Boots',
            description: 'Move 5% faster.',
            rarity: 'COMMON',
            icon: 'speed',
            apply: (player) => { player.speed *= 1.05; }
        },
        {
            id: 'speed_rare',
            name: 'Running Shoes',
            description: 'Move 12% faster.',
            rarity: 'RARE',
            icon: 'speed',
            apply: (player) => { player.speed *= 1.12; }
        },
        {
            id: 'speed_epic',
            name: 'Turbo Engine',
            description: 'Move 25% faster.',
            rarity: 'EPIC',
            icon: 'speed',
            apply: (player) => { player.speed *= 1.25; }
        },
        {
            id: 'speed_legendary',
            name: 'Teleport Step',
            description: 'Move 50% faster.',
            rarity: 'LEGENDARY',
            icon: 'speed',
            apply: (player) => { player.speed *= 1.50; }
        },

        // --- RANGE ---
        {
            id: 'range_common',
            name: 'Lens',
            description: '+50 Range.',
            rarity: 'COMMON',
            icon: 'range',
            apply: (player) => { player.range += 50; }
        },
        {
            id: 'range_rare',
            name: 'Scope',
            description: '+125 Range.',
            rarity: 'RARE',
            icon: 'range',
            apply: (player) => { player.range += 125; }
        },
        {
            id: 'range_epic',
            name: 'Sniper Kit',
            description: '+250 Range.',
            rarity: 'EPIC',
            icon: 'range',
            apply: (player) => { player.range += 250; }
        },

        // --- CRITICAL HIT ---
        {
            id: 'crit_common',
            name: 'Sharp Lens',
            description: '+5% Crit Chance.',
            rarity: 'COMMON',
            icon: 'hud_crit',
            apply: (player) => { player.critChance = (player.critChance || 0) + 5; }
        },
        {
            id: 'crit_rare',
            name: 'Targeting Sys',
            description: '+10% Crit Chance.',
            rarity: 'RARE',
            icon: 'hud_crit',
            apply: (player) => { player.critChance = (player.critChance || 0) + 10; }
        },
        {
            id: 'crit_epic',
            name: 'Assassin',
            description: '+20% Crit Chance.',
            rarity: 'EPIC',
            icon: 'hud_crit',
            apply: (player) => { player.critChance = (player.critChance || 0) + 20; }
        },

        // --- ECONOMY ---
        {
            id: 'greed_rare',
            name: 'Lucky Coin',
            description: '+20% Gold Gain.',
            rarity: 'RARE',
            icon: 'coin',
            apply: (player) => { player.goldMultiplier = (player.goldMultiplier || 1.0) + 0.2; }
        },
        {
            id: 'greed_epic',
            name: 'Midas Touch',
            description: '+50% Gold Gain.',
            rarity: 'EPIC',
            icon: 'coin',
            apply: (player) => { player.goldMultiplier = (player.goldMultiplier || 1.0) + 0.5; }
        },

        // --- SPECIALS ---
        {
            id: 'ricochet_rare',
            name: 'Bouncy Walls',
            description: 'Bullets bounce +1 time.',
            rarity: 'RARE',
            icon: 'ricochet',
            apply: (player) => { player.ricochetCount = (player.ricochetCount || 0) + 1; }
        },
        {
            id: 'ricochet_epic',
            name: 'Rubber Room',
            description: 'Bullets bounce +3 times.',
            rarity: 'EPIC',
            icon: 'ricochet',
            apply: (player) => { player.ricochetCount = (player.ricochetCount || 0) + 3; }
        },
        {
            id: 'multishot_epic',
            name: 'Twin Shot',
            description: 'Fire +1 projectile.',
            rarity: 'EPIC',
            icon: 'multishot',
            apply: (player) => { player.projectileCount = (player.projectileCount || 1) + 1; }
        },
        {
            id: 'multishot_legendary',
            name: 'Barrage',
            description: 'Fire +2 projectiles.',
            rarity: 'LEGENDARY',
            icon: 'multishot',
            apply: (player) => { player.projectileCount = (player.projectileCount || 1) + 2; }
        },
        {
            id: 'regen_rare',
            name: 'Troll Blood',
            description: '+1 HP/sec regen.',
            rarity: 'RARE',
            icon: 'regen',
            apply: (player) => { player.regenRate = (player.regenRate || 0) + 1; }
        },
        {
            id: 'regen_epic',
            name: 'Hydra Gene',
            description: '+3 HP/sec regen.',
            rarity: 'EPIC',
            icon: 'regen',
            apply: (player) => { player.regenRate = (player.regenRate || 0) + 3; }
        },
        {
            id: 'thorns_rare',
            name: 'Spiked Armor',
            description: 'Deal 15 contact damage.',
            rarity: 'RARE',
            icon: 'thorns',
            apply: (player) => { player.thornsDamage = (player.thornsDamage || 0) + 15; }
        },
        {
            id: 'thorns_epic',
            name: 'Blazing Armor',
            description: 'Deal 40 contact damage.',
            rarity: 'EPIC',
            icon: 'thorns',
            apply: (player) => { player.thornsDamage = (player.thornsDamage || 0) + 40; }
        },
        {
            id: 'vamp_legendary',
            name: 'Vampirism',
            description: '15% chance to heal 1 HP on kill.',
            rarity: 'LEGENDARY',
            icon: 'vampirism',
            apply: (player) => { player.lifestealChance = (player.lifestealChance || 0) + 0.15; }
        },
        {
            id: 'fireaura_epic',
            name: 'Fire Aura',
            description: 'Burn nearby enemies (25 DPS).',
            rarity: 'EPIC',
            icon: 'fireaura',
            apply: (player) => {
                player.hasFireAura = true;
                player.fireAuraDamage = (player.fireAuraDamage || 0) + 25;
            }
        },
        {
            id: 'frost_rare',
            name: 'Frost Shot',
            description: 'Slow enemies on hit. Slowed enemies deal -30% damage.',
            rarity: 'RARE',
            icon: 'frostshot',
            apply: (player) => { player.hasFrostShot = true; }
        },
        {
            id: 'explosive_legendary',
            name: 'Explosive Rounds',
            description: 'Bullets explode on impact.',
            rarity: 'LEGENDARY',
            icon: 'explosive',
            apply: (player) => { player.hasExplosiveShots = true; }
        },
        {
            id: 'orbitals_epic',
            name: 'Orbitals',
            description: 'Spawns 2 defensive shields (60 DPS contact).',
            rarity: 'EPIC',
            icon: 'orbitals',
            apply: (player) => {
                player.orbitalCount = (player.orbitalCount || 0) + 2;
                player.orbitalDamage = 60;
            }
        }
    ],

    generateOptions() {
        // Simple weighted shuffle logic could be added here to make Legendaries rarer
        // For now, purely random to let user see new items easily
        const shuffled = [...this.UPGRADES].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }
};