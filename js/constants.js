// ============================================================================
// 1. PERK VFX CONFIGURATION (Drop your .png spritesheets in these paths)
// ============================================================================
const PERK_VFX_CONFIG = {
    heal: {
        imageSrc: './img/VFX/Perks/HealBurst.png',
        framesMax: 8, framesHold: 4, scale: 2.2,
        size: { x: 90, y: 90 }, offset: { x: 20, y: 20 },
        color: '#2ecc71', fallbackType: 'ring'
    },
    demonSlash: {
        imageSrc: './img/VFX/Perks/DemonSlash.png',
        framesMax: 6, framesHold: 3, scale: 2.5,
        size: { x: 140, y: 100 }, offset: { x: 30, y: 20 },
        color: '#ff1e00', fallbackType: 'slash'
    },
    magicCast: {
        imageSrc: './img/VFX/Perks/MagicCastMuzzle.png',
        framesMax: 6, framesHold: 3, scale: 2.0,
        size: { x: 80, y: 80 }, offset: { x: 20, y: 20 },
        color: '#a855f7', fallbackType: 'burst'
    },
    vampireDrain: {
        imageSrc: './img/VFX/Perks/BloodDrain.png',
        framesMax: 8, framesHold: 4, scale: 2.0,
        size: { x: 85, y: 85 }, offset: { x: 15, y: 15 },
        color: '#dc2626', fallbackType: 'siphon'
    },
    windStep: {
        imageSrc: './img/VFX/Perks/WindStep.png',
        framesMax: 6, framesHold: 3, scale: 1.8,
        size: { x: 60, y: 40 }, offset: { x: 10, y: 5 },
        color: '#38bdf8', fallbackType: 'wind'
    },
    jumpWind: {
        imageSrc: './img/VFX/Perks/JumpWind.png',
        framesMax: 6, framesHold: 3, scale: 2.2,
        size: { x: 90, y: 45 }, offset: { x: 15, y: 10 },
        color: '#7dd3fc', fallbackType: 'ring'
    },
    titanPulse: {
        imageSrc: './img/VFX/Perks/TitanPulse.png',
        framesMax: 8, framesHold: 4, scale: 2.6,
        size: { x: 120, y: 120 }, offset: { x: 25, y: 25 },
        color: '#f59e0b', fallbackType: 'ring'
    },
    ricochetSpark: {
        imageSrc: './img/VFX/Perks/RicochetSpark.png',
        framesMax: 5, framesHold: 2, scale: 2.0,
        size: { x: 70, y: 70 }, offset: { x: 15, y: 15 },
        color: '#facc15', fallbackType: 'burst'
    },
    toxicPuddle: {
        imageSrc: './img/VFX/Perks/ToxicPuddle.png',
        framesMax: 8, framesHold: 6, scale: 2.0,
        size: { x: 75, y: 28 }, offset: { x: 10, y: 8 },
        color: 'rgba(57, 255, 20, 0.75)', fallbackType: 'poison'
    },
    toxicHit: {
        imageSrc: './img/VFX/Perks/ToxicHit.png',
        framesMax: 6, framesHold: 4, scale: 1.8,
        size: { x: 65, y: 65 }, offset: { x: 10, y: 10 },
        color: '#39ff14', fallbackType: 'burst'
    },
    executionerMark: {
        imageSrc: './img/VFX/Perks/ExecutionerMark.png',
        framesMax: 6, framesHold: 6, scale: 1.5,
        size: { x: 44, y: 44 }, offset: { x: 0, y: 0 },
        color: '#ef4444', fallbackType: 'mark'
    },
    executionerSlash: {
        imageSrc: './img/VFX/Perks/ExecutionerSlash.png',
        framesMax: 8, framesHold: 3, scale: 3.0,
        size: { x: 150, y: 150 }, offset: { x: 35, y: 35 },
        color: '#b91c1c', fallbackType: 'crossSlash'
    },
    staticShieldLoop: {
        imageSrc: './img/VFX/Perks/StaticShieldLoop.png',
        framesMax: 8, framesHold: 5, scale: 2.2,
        size: { x: 110, y: 140 }, offset: { x: 15, y: 10 },
        color: '#38bdf8', fallbackType: 'shield'
    },
    staticBurst: {
        imageSrc: './img/VFX/Perks/StaticBurst.png',
        framesMax: 8, framesHold: 3, scale: 3.0,
        size: { x: 160, y: 160 }, offset: { x: 40, y: 40 },
        color: '#00f2fe', fallbackType: 'ring'
    },
    soulOrb: {
        imageSrc: './img/VFX/Perks/SoulOrb.png',
        framesMax: 6, framesHold: 4, scale: 1.8,
        size: { x: 36, y: 36 }, offset: { x: 8, y: 8 },
        color: '#c084fc', fallbackType: 'orb'
    },
    soulLevelUp: {
        imageSrc: './img/VFX/Perks/SoulLevelUp.png',
        framesMax: 8, framesHold: 4, scale: 2.5,
        size: { x: 110, y: 110 }, offset: { x: 20, y: 20 },
        color: '#9333ea', fallbackType: 'ring'
    },
    splitShotBurst: {
        imageSrc: './img/VFX/Perks/SplitShotBurst.png',
        framesMax: 6, framesHold: 3, scale: 2.2,
        size: { x: 90, y: 90 }, offset: { x: 20, y: 20 },
        color: '#f43f5e', fallbackType: 'burst'
    },
    combatPortal: {
        imageSrc: './img/VFX/Perks/CombatPortal.png',
        framesMax: 8, framesHold: 4, scale: 2.5,
        size: { x: 120, y: 120 }, offset: { x: 25, y: 25 },
        color: '#fbbf24', fallbackType: 'ring'
    },
    blueJumpOrb: {
        imageSrc: './img/VFX/Boss/BlueJumpOrb.png',
        framesMax: 6, framesHold: 5, scale: 2.0,
        size: { x: 70, y: 70 }, offset: { x: 10, y: 10 },
        color: '#00e5ff', fallbackType: 'ring'
    }
};

// ============================================================================
// 2. AUDIO CONFIGURATION FOR PERKS, WORLD & SKULL BOSS
// ============================================================================
const PERK_AUDIO_CONFIG = {
    perkPickup:       { src: './audio/perks/perk_pickup.mp3',      volume: 0.6, freq: 587 },
    perkHeal:         { src: './audio/perks/heal.mp3',             volume: 0.6, freq: 523 },
    demonSlash:       { src: './audio/perks/demon_slash.mp3',      volume: 0.5, freq: 140 },
    magicCast:        { src: './audio/perks/magic_cast.mp3',       volume: 0.5, freq: 440 },
    vampireDrain:     { src: './audio/perks/vampire_drain.mp3',    volume: 0.6, freq: 310 },
    windDash:         { src: './audio/perks/wind_dash.mp3',        volume: 0.4, freq: 660 },
    titanPulse:       { src: './audio/perks/titan_pulse.mp3',      volume: 0.7, freq: 110 },
    ricochetBounce:   { src: './audio/perks/ricochet.mp3',         volume: 0.6, freq: 880 },
    toxicBubble:      { src: './audio/perks/toxic_bubble.mp3',     volume: 0.35, freq: 240 },
    toxicTick:        { src: './audio/perks/toxic_tick.mp3',       volume: 0.4, freq: 290 },
    executionerStrike:{ src: './audio/perks/executioner.mp3',      volume: 0.8, freq: 95  },
    staticBreak:      { src: './audio/perks/static_break.mp3',     volume: 0.75, freq: 720 },
    staticRecharge:   { src: './audio/perks/static_recharge.mp3',  volume: 0.5, freq: 620 },
    soulAbsorb:       { src: './audio/perks/soul_absorb.mp3',      volume: 0.5, freq: 493 },
    soulPowerUp:      { src: './audio/perks/soul_powerup.mp3',     volume: 0.75, freq: 784 },
    splitShot:        { src: './audio/perks/split_shot.mp3',       volume: 0.55, freq: 510 },
    warHorn:          { src: './audio/perks/war_horn.mp3',         volume: 0.7, freq: 196 },
    shrineActivate:   { src: './audio/world/shrine_activate.mp3',  volume: 0.65, freq: 659 },
    enemyTelegraph:   { src: './audio/enemies/telegraph_warn.mp3', volume: 0.45, freq: 920 },
    // Skull Boss Audio
    bossBeam:         { src: './audio/boss/skull_beam.mp3',        volume: 0.65, freq: 180 },
    bossMissileLock:  { src: './audio/boss/missile_lock.mp3',      volume: 0.6,  freq: 980 },
    bossStompHit:     { src: './audio/boss/boss_stomp.mp3',        volume: 0.85, freq: 85  },
    blueOrbBounce:    { src: './audio/boss/blue_orb_jump.mp3',     volume: 0.7,  freq: 740 }
};

// ============================================================================
// 3. INTERACTIVE OPEN WORLD OBJECTS
// ============================================================================
const WORLD_OBJECTS_CONFIG = {
    healShrine: {
        name: "Life Shrine",
        prompt: "[E] Heal (+40% HP)",
        imageSrc: './img/World/HealShrine.png',
        framesMax: 6, scale: 2.0, size: { x: 70, y: 110 }, offset: { x: 10, y: 10 },
        color: '#10b981', cooldownMax: 1800
    },
    soulChest: {
        name: "Soul Chest",
        prompt: "[E] Open (+12 🪙)",
        imageSrc: './img/World/SoulChest.png',
        framesMax: 6, scale: 1.8, size: { x: 65, y: 55 }, offset: { x: 8, y: 8 },
        color: '#f59e0b', cooldownMax: 2400
    },
    battleAltar: {
        name: "Blood Altar",
        prompt: "[E] Sacrifice (-15% HP, +20% DMG)",
        imageSrc: './img/World/BattleAltar.png',
        framesMax: 6, scale: 2.0, size: { x: 75, y: 115 }, offset: { x: 10, y: 10 },
        color: '#ef4444', cooldownMax: 2400
    },
    jumpGeyser: {
        name: "Wind Geyser",
        prompt: "",
        imageSrc: './img/World/WindGeyser.png',
        framesMax: 6, scale: 2.0, size: { x: 80, y: 40 }, offset: { x: 10, y: 10 },
        color: '#38bdf8', cooldownMax: 20, isAutoTrigger: true
    }
};

// ============================================================================
// 4. OPEN WORLD & ARENA PLATFORM LAYOUTS
// ============================================================================
const OpenWorldLayout = [
    // Continuous Ground Floor (9000px)
    { x: -100, y: g.MAX_HEIGHT - 600, w: 9200, h: 260, color: "#141722", isGround: true },

    // Biome 1: King's Pass (0 - 3000)
    { x: 280,  y: g.MAX_HEIGHT - 840,  w: 420, h: 22, color: "#3b4252" },
    { x: 850,  y: g.MAX_HEIGHT - 1060, w: 460, h: 22, color: "#434c5e" },
    { x: 1450, y: g.MAX_HEIGHT - 850,  w: 550, h: 22, color: "#3b4252" },
    { x: 1580, y: g.MAX_HEIGHT - 1160, w: 300, h: 22, color: "#4c566a" },
    { x: 2200, y: g.MAX_HEIGHT - 920,  w: 480, h: 22, color: "#3b4252" },
    { x: 2550, y: g.MAX_HEIGHT - 1200, w: 350, h: 22, color: "#4c566a" },

    // Biome 2: Cursed Forest (3000 - 6000)
    { x: 3150, y: g.MAX_HEIGHT - 860,  w: 450, h: 22, color: "#1e3a2f" },
    { x: 3700, y: g.MAX_HEIGHT - 1100, w: 500, h: 22, color: "#274e3e" },
    { x: 4350, y: g.MAX_HEIGHT - 860,  w: 650, h: 22, color: "#1e3a2f" },
    { x: 4500, y: g.MAX_HEIGHT - 1200, w: 350, h: 22, color: "#2d5a47" },
    { x: 5150, y: g.MAX_HEIGHT - 960,  w: 420, h: 22, color: "#1e3a2f" },
    { x: 5600, y: g.MAX_HEIGHT - 1240, w: 320, h: 22, color: "#2d5a47" },

    // Biome 3: Demon Citadel (6000 - 9000)
    { x: 6150, y: g.MAX_HEIGHT - 860,  w: 500, h: 22, color: "#451a1c" },
    { x: 6800, y: g.MAX_HEIGHT - 1120, w: 450, h: 22, color: "#5c2124" },
    { x: 7400, y: g.MAX_HEIGHT - 880,  w: 700, h: 22, color: "#451a1c" },
    { x: 7580, y: g.MAX_HEIGHT - 1220, w: 340, h: 22, color: "#73282c" },
    { x: 8250, y: g.MAX_HEIGHT - 1020, w: 480, h: 22, color: "#5c2124" }
];

const ArenaLayouts = [
    [
        { x: -50, y: g.MAX_HEIGHT - 600, w: 3100, h: 240, color: "#1a1a1a", isGround: true },
        { x: 400, y: g.MAX_HEIGHT - 860, w: 500, h: 20, color: "#444" },
        { x: 2100, y: g.MAX_HEIGHT - 860, w: 500, h: 20, color: "#444" }
    ],
    [
        { x: -50, y: g.MAX_HEIGHT - 600, w: 3100, h: 240, color: "#1a1a1a", isGround: true },
        { x: 1100, y: g.MAX_HEIGHT - 860, w: 800, h: 20, color: "#444" },
        { x: 100, y: g.MAX_HEIGHT - 1120, w: 250, h: 20, color: "#444" },
        { x: 2650, y: g.MAX_HEIGHT - 1120, w: 250, h: 20, color: "#444" }
    ]
];

const MAP_CONFIG = {
    1: {
        background: {
            link: "./img/BackGround/Background1.png",
            framesMax: 1,
            offset: { x: 0, y: 0 },
            scale: 1.4
        },
        StartPos: null,
        Platforms: [
            { position: { x: 0, y: g.MAX_HEIGHT - 600 }, size: { x: g.MAX_WIDTH, y: 240 }, imageSrc: undefined, scale: 1.2, offset: { x: 0, y: 1200 }, color: "#161822" }
        ]
    },
    2: {
        background: {
            link: "./img/BackGround/Map2Background.jpg",
            framesMax: 1,
            offset: { x: 390, y: 190 },
            scale: 2
        },
        StartPos: {
            p1: { x: 1500 - 478, y: 0 },
            p2: { x: 1500 + 478 - g.Fighter2Width, y: 0 }
        },
        Platforms: [
            { position: { x: 1500 - 478, y: 400 }, size: { x: 956, y: 240 }, imageSrc: './img/Platforms/Map2Platform.png', scale: 2, offset: { x: 800, y: 1000 }, color: "yellow" }
        ]
    }
};

// ============================================================================
// 5. FIGHTER & BOSS STATS (Including Skull Monster 128x112)
// ============================================================================
const FIGHTER_STATS = {
    Sekiro: {
        color: "red",
        ControlKeys: { left: "a", right: "d", up: "w", attack: "s", defend: "shift" },
        size: { x: g.Fighter1Width, y: g.Fighter1Height },
        Direction: { right: true },
        AttackBox: { position: { x: 0, y: 0 }, size: { x: 300, y: 175 }, shape: "ellipse" },
        Player: 1,
        scale: 2.6,
        offset: { x: 220, y: 196 },
        sprites: {
            idle:    { imageSrc: './img/MartialHero/Idle.png',    framesMax: 8 },
            run:     { imageSrc: './img/MartialHero/Run.png',     framesMax: 8 },
            jump:    { imageSrc: './img/MartialHero/Jump.png',    framesMax: 2 },
            attack:  { imageSrc: './img/MartialHero/Attack1.png', framesMax: 6 },
            hurt:    { imageSrc: './img/MartialHero/TakeHitW.png',framesMax: 4 },
            death:   { imageSrc: './img/MartialHero/Death.png',   framesMax: 6 },
            defence: { imageSrc: './img/MartialHero/Defence.png', framesMax: 1 }
        },
        attackFrame: 5,
        type: undefined,
        Damage: 100,
        HealthPoints: 3000,
        MaxHealthPoints: 3000
    },
    Night: {
        color: "blue",
        ControlKeys: { left: "arrowleft", right: "arrowright", up: "arrowup", attack: "arrowdown", defend: "-" },
        size: { x: g.Fighter2Width, y: g.Fighter2Height },
        Direction: { left: true },
        AttackBox: { position: { x: 0, y: 0 }, size: { x: g.StandardAttBoxWid * 2.3, y: g.StandardAttBoxWid * 2.3 }, shape: "circle" },
        Player: 2,
        Damage: 15,
        isAI: AI,
        type: "launcher",
        scale: 1.3,
        offset: { x: 110, y: 133 },
        sprites: {
            idle:    { imageSrc: './img/Night/idle.png',    framesMax: 9 },
            run:     { imageSrc: './img/Night/run.png',     framesMax: 6 },
            jump:    { imageSrc: './img/Night/jump.png',    framesMax: 5 },
            attack:  { imageSrc: './img/Night/attack.png',  framesMax: 12 },
            hurt:    { imageSrc: './img/Night/hurt.png',    framesMax: 5 },
            death:   { imageSrc: './img/Night/death.png',   framesMax: 23 },
            defence: { imageSrc: './img/Night/defence.png', framesMax: 3 }
        },
        attackFrame: 9,
        HealthPoints: 100,
        MaxHealthPoints: 100,
        value: 4
    },
    Night2: {
        color: "blue",
        ControlKeys: { left: "arrowleft", right: "arrowright", up: "arrowup", attack: "arrowdown", defend: "-" },
        size: { x: g.Fighter2Width, y: g.Fighter2Height + 20 },
        Direction: { left: true },
        AttackBox: { position: { x: 0, y: 0 }, size: { x: g.StandardAttBoxWid * 2.3, y: g.StandardAttBoxWid * 2.3 }, shape: "circle" },
        Player: 2,
        Damage: 15,
        isAI: AI,
        type: "base",
        scale: 3.2,
        offset: { x: 150, y: 70 },
        sprites: {
            idle:    { imageSrc: './img/Knight/knightidle.png',   framesMax: 8 },
            run:     { imageSrc: './img/Knight/knightrun.png',    framesMax: 8 },
            jump:    { imageSrc: './img/Knight/knightjump.png',   framesMax: 8 },
            attack:  { imageSrc: './img/Knight/knightattack.png', framesMax: 6 },
            hurt:    { imageSrc: './img/Knight/knighthurt.png',   framesMax: 3 },
            death:   { imageSrc: './img/Knight/knightdeath.png',  framesMax: 4 },
            defence: { imageSrc: './img/Knight/knightdash.png',   framesMax: 10 },
            slam:    { imageSrc: './img/Knight/knightplunge.png', framesMax: 7 }
        },
        attackFrame: 4,
        HealthPoints: 130,
        MaxHealthPoints: 130,
        value: 3
    },
    Night3: {
        color: "blue",
        ControlKeys: { left: "arrowleft", right: "arrowright", up: "arrowup", attack: "arrowdown", defend: "-" },
        size: { x: g.Fighter2Width, y: g.Fighter2Height },
        Direction: { left: true },
        AttackBox: { position: { x: 0, y: 0 }, size: { x: g.StandardAttBoxWid * 2.3, y: g.StandardAttBoxWid * 2.3 }, shape: "circle" },
        Player: 2,
        Damage: 15,
        isAI: AI,
        type: "BigAhhLauncher",
        scale: 1.3,
        offset: { x: 110, y: 133 },
        sprites: {
            idle:    { imageSrc: './img/Night/idle.png',    framesMax: 9 },
            run:     { imageSrc: './img/Night/run.png',     framesMax: 6 },
            jump:    { imageSrc: './img/Night/jump.png',    framesMax: 5 },
            attack:  { imageSrc: './img/Night/attack.png',  framesMax: 12 },
            hurt:    { imageSrc: './img/Night/hurt.png',    framesMax: 5 },
            death:   { imageSrc: './img/Night/death.png',   framesMax: 23 },
            defence: { imageSrc: './img/Night/defence.png', framesMax: 3 }
        },
        attackFrame: 9,
        HealthPoints: 100,
        MaxHealthPoints: 100,
        value: 6
    },

    // ========================================================================
    // FLYING BOSS: SKULL MONSTER (128 x 112)
    // Supports BOTH a single combined spritesheet (./img/SkullMonster/SkullMonster.png)
    // via `row`, `frameWidth: 128`, `frameHeight: 112` OR separate files!
    // ========================================================================
    SkullBoss: {
        color: "#dc2626",
        ControlKeys: { left: "arrowleft", right: "arrowright", up: "arrowup", attack: "arrowdown", defend: "-" },
        size: { x: 140, y: 130 },
        Direction: { left: true },
        AttackBox: { position: { x: 0, y: 0 }, size: { x: 180, y: 160 }, shape: "circle" },
        Player: 2,
        Damage: 35,
        isAI: true,
        type: "SkullBoss",
        scale: 4,
        offset: { x: 190, y: 130 },
        sprites: {
            idle: {
                imageSrc: './img/Skeleton/idle8.png',
                framesMax: 8, framesHold: 6,
                row: 0, frameWidth: 120, frameHeight: 120
            },
            run: {
                imageSrc: './img/Skeleton/idle8.png',
                framesMax: 8, framesHold: 6,
                row: 0, frameWidth: 120, frameHeight: 120
            },
            jump: {
                imageSrc: './img/SkullMonster/SkullMonster.png',
                framesMax: 8, framesHold: 6,
                row: 0, frameWidth: 128, frameHeight: 112
            },
            // Attack1 (12 frames): Skull Beam / Fireball Barrage
            attack: {
                imageSrc: './img/Skeleton/attack1.png',
                framesMax: 12, framesHold: 5,
                row: 1, frameWidth: 128, frameHeight: 112
            },
            // Attack2 (12 frames): Predictive Homing Air-to-Ground Missile
            attack2: {
                imageSrc: './img/Skeleton/attack2.png',
                framesMax: 12, framesHold: 5,
                row: 2, frameWidth: 128, frameHeight: 112
            },
            hurt: {
                imageSrc: './img/SkullMonster/SkullMonster.png',
                framesMax: 8, framesHold: 4,
                row: 0, frameWidth: 128, frameHeight: 112
            },
            // Death (9 frames)
            death: {
                imageSrc: './img/Skeleton/death8.png',
                framesMax: 8, framesHold: 12,
                row: 3, frameWidth: 128, frameHeight: 112
            }
        },
        attackFrame: 6,
        HealthPoints: 900,
        MaxHealthPoints: 900,
        value: 25
    }
};

const AURA_STATS = {
    1: {
        color: "red",
        size: { x: g.Fighter1Width, y: g.Fighter1Height },
        imageSrc: './img/MartialHero/Aura.png',
        framesMax: 16, scale: 2.5, offset: { x: 89, y: 48 }
    },
    2: {
        color: "purple",
        size: { x: g.Fighter2Width, y: g.Fighter2Height },
        imageSrc: './img/Night/Aura.png',
        framesMax: 16, scale: 3.6, offset: { x: 130, y: 130 }
    }
};

const MASK_STATS = {
    1:  { name: "Health Potion",      position: { x: 0, y: 0 }, size: { x: 100, y: 100 }, CuringHealth: 500, DamageMult: 1,    KnockBack: 1,   imageSrc: './img/PowerUp/heal.png',        framesMax: 1, scale: 0.2, offset: { x: -10, y: 0 }, price: 0,  vfxKey: 'heal',             audioKey: 'perkHeal' },
    2:  { name: "Demon Strength",     position: { x: 0, y: 0 }, size: { x: 100, y: 100 }, CuringHealth: 0,   DamageMult: 1.45, KnockBack: 1.35,DemonStrength: true, imageSrc: './img/PowerUp/punch.png', framesMax: 1, scale: 0.2, offset: { x: -10, y: 0 }, price: 5, vfxKey: 'demonSlash', audioKey: 'demonSlash' },
    3:  { name: "Magic Caster",       position: { x: 0, y: 0 }, size: { x: 100, y: 100 }, CuringHealth: 100, DamageMult: 1.15, KnockBack: 1,   CanShoot: true, imageSrc: './img/PowerUp/magicaster.png', framesMax: 1, scale: 0.2, offset: { x: -10, y: 0 }, price: 7, vfxKey: 'magicCast', audioKey: 'magicCast' },
    4:  { name: "Vampire Blood",      position: { x: 0, y: 0 }, size: { x: 100, y: 100 }, CuringHealth: 0,   DamageMult: 1,    KnockBack: 1,   LifeSteal: 0.15, imageSrc: './img/PowerUp/demonblood.png', framesMax: 1, scale: 0.2, offset: { x: -10, y: 0 }, price: 10, vfxKey: 'vampireDrain', audioKey: 'vampireDrain' },
    5:  { name: "Hermes Boots",       position: { x: 0, y: 0 }, size: { x: 100, y: 100 }, CuringHealth: 0,   DamageMult: 1,    KnockBack: 1,   SpeedMult: 0.15, JumpBoost: -3, HermesBoots: true, imageSrc: './img/PowerUp/hermes.png', framesMax: 1, scale: 0.2, offset: { x: -10, y: 0 }, price: 8, vfxKey: 'windStep', audioKey: 'windDash' },
    6:  { name: "Titan Heart",        position: { x: 0, y: 0 }, size: { x: 100, y: 100 }, CuringHealth: 400, MaxHealthUp: 400, DamageMult: 1,  KnockBack: 1.2, TitanHeart: true, imageSrc: './img/PowerUp/titanheart.png', framesMax: 1, scale: 0.2, offset: { x: -10, y: 0 }, price: 12, vfxKey: 'titanPulse', audioKey: 'titanPulse' },
    7:  { name: "Ricochet Master",    position: { x: 0, y: 0 }, size: { x: 100, y: 100 }, Ricochet: true,    imageSrc: './img/PowerUp/bullets.png',     framesMax: 1, scale: 0.2, offset: { x: -10, y: 0 }, price: 10, vfxKey: 'ricochetSpark',    audioKey: 'ricochetBounce' },
    8:  { name: "Toxic Trail",        position: { x: 0, y: 0 }, size: { x: 100, y: 100 }, ToxicTrail: true,  imageSrc: './img/PowerUp/poison.png',      framesMax: 1, scale: 0.2, offset: { x: -10, y: 0 }, price: 8,  vfxKey: 'toxicPuddle',      audioKey: 'toxicBubble' },
    9:  { name: "Executioner's Mark", position: { x: 0, y: 0 }, size: { x: 100, y: 100 }, Executioner: true, imageSrc: './img/PowerUp/executioner.png', framesMax: 1, scale: 0.2, offset: { x: -10, y: 0 }, price: 15, vfxKey: 'executionerSlash', audioKey: 'executionerStrike' },
    10: { name: "Static Shield",      position: { x: 0, y: 0 }, size: { x: 100, y: 100 }, StaticShield: true,imageSrc: './img/PowerUp/shield.png',      framesMax: 1, scale: 0.2, offset: { x: -10, y: 0 }, price: 15, vfxKey: 'staticBurst',      audioKey: 'staticRecharge' },
    11: { name: "Soul Collector",     position: { x: 0, y: 0 }, size: { x: 100, y: 100 }, SoulCollector:true,imageSrc: './img/PowerUp/soul.png',        framesMax: 1, scale: 0.2, offset: { x: -10, y: 0 }, price: 18, vfxKey: 'soulLevelUp',      audioKey: 'soulPowerUp' },
    12: { name: "Split Shot",         position: { x: 0, y: 0 }, size: { x: 100, y: 100 }, SplitShot: true,   imageSrc: './img/PowerUp/doublearrow.png', framesMax: 1, scale: 0.2, offset: { x: -10, y: 0 }, price: 12, vfxKey: 'splitShotBurst',   audioKey: 'splitShot' },
    13: { name: "Return To Combat",   position: { x: 0, y: 0 }, size: { x: 100, y: 100 }, isFightTime: true, imageSrc: './img/PowerUp/doublearrow.png', framesMax: 1, scale: 0.2, offset: { x: -10, y: 0 }, price: 0,  vfxKey: 'combatPortal',     audioKey: 'warHorn' }
};

const BULLET_STATS = {
    1: {
        position: { x: 0, y: 0 },
        size: { x: 40, y: 25 },
        KnockBack: 20,
        imageSrc: './img/VFX/Bullets/Fireball.png',
        framesMax: 5, scale: 1.5, offset: { x: 35, y: 10 },
        Damage: 10, caster: undefined, color: "orange", isUnblockable: false
    },
    2: {
        position: { x: 0, y: 0 },
        size: { x: 80, y: 50 },
        KnockBack: 40,
        imageSrc: './img/VFX/Bullets/Fireball.png',
        framesMax: 5, scale: 3.5, offset: { x: 80, y: 30 },
        Damage: 35, caster: undefined, color: "red", isUnblockable: true
    }
};
// ============================================================================
// SEKIRO / BLASPHEMOUS ENVIRONMENT PROPS (Drop your PNGs in these paths!)
// ============================================================================
const AMBIENT_PROPS_CONFIG = {
    lampOrange: {
        imageSrc: './img/VFX/Lamp/OrangeSilver.png',
        framesMax: 38, framesHold: 4, scale: 1.3,
        size: { x: 60, y: 120 }, offset: { x: 0, y: 0 },
        glowColor: 'rgba(251, 146, 60, 0.22)', fallbackType: 'lantern'
    },
    lampGothic: {
        imageSrc: './img/VFX/Lamp/Lamp2.png',
        framesMax: 38, framesHold: 4, scale: 1.7,
        size: { x: 60, y: 130 }, offset: { x: 0, y: 0 },
        glowColor: 'rgba(239, 68, 68, 0.22)', fallbackType: 'lantern'
    },
    toriiGate: {
        imageSrc: './img/VFX/Env/ToriiGate.png',
        framesMax: 1, framesHold: 10, scale: 2.5,
        size: { x: 260, y: 320 }, offset: { x: 0, y: 0 },
        glowColor: null, fallbackType: 'torii'
    },
    shrineStatue: {
        imageSrc: './img/VFX/Env/SculptorIdol.png',
        framesMax: 6, framesHold: 6, scale: 2.0,
        size: { x: 90, y: 150 }, offset: { x: 0, y: 0 },
        glowColor: 'rgba(56, 189, 248, 0.2)', fallbackType: 'statue'
    },
    hangingCage: {
        imageSrc: './img/VFX/Env/HangingCage.png',
        framesMax: 4, framesHold: 8, scale: 2.0,
        size: { x: 70, y: 160 }, offset: { x: 0, y: 0 },
        glowColor: null, fallbackType: 'cage'
    },
    deadTree: {
        imageSrc: './img/VFX/Env/DeadTree.png',
        framesMax: 1, framesHold: 10, scale: 2.4,
        size: { x: 200, y: 280 }, offset: { x: 0, y: 0 },
        glowColor: null, fallbackType: 'tree'
    }
};

// World placements across the 3 Biomes (Floor is at g.MAX_HEIGHT - 600)
const AMBIENT_PLACEMENTS = [
    // Biome 1: King's Pass (Feudal Lamps & Torii Gates)
    { type: 'toriiGate',    x: 420,  y: g.MAX_HEIGHT - 600 - 320 },
    { type: 'lampOrange',   x: 340,  y: g.MAX_HEIGHT - 840 - 120 },
    { type: 'lampGothic',   x: 920,  y: g.MAX_HEIGHT - 1060 - 130 },
    { type: 'shrineStatue', x: 1380, y: g.MAX_HEIGHT - 600 - 150 },
    { type: 'lampOrange',   x: 1680, y: g.MAX_HEIGHT - 850 - 120 },
    { type: 'deadTree',     x: 2100, y: g.MAX_HEIGHT - 600 - 280 },
    { type: 'lampGothic',   x: 2450, y: g.MAX_HEIGHT - 920 - 130 },

    // Biome 2: Cursed Forest (Dead Trees, Cages & Idols)
    { type: 'toriiGate',    x: 3050, y: g.MAX_HEIGHT - 600 - 320 },
    { type: 'hangingCage',  x: 3320, y: g.MAX_HEIGHT - 860 - 160 },
    { type: 'lampOrange',   x: 3850, y: g.MAX_HEIGHT - 1100 - 120 },
    { type: 'deadTree',     x: 4200, y: g.MAX_HEIGHT - 600 - 280 },
    { type: 'shrineStatue', x: 4600, y: g.MAX_HEIGHT - 860 - 150 },
    { type: 'lampGothic',   x: 5280, y: g.MAX_HEIGHT - 960 - 130 },

    // Biome 3: Demon Citadel (Gothic Lamps, Cages & Statues)
    { type: 'toriiGate',    x: 6080, y: g.MAX_HEIGHT - 600 - 320 },
    { type: 'lampGothic',   x: 6350, y: g.MAX_HEIGHT - 860 - 130 },
    { type: 'hangingCage',  x: 6900, y: g.MAX_HEIGHT - 1120 - 160 },
    { type: 'shrineStatue', x: 7550, y: g.MAX_HEIGHT - 880 - 150 },
    { type: 'lampOrange',   x: 7850, y: g.MAX_HEIGHT - 880 - 120 },
    { type: 'lampGothic',   x: 8400, y: g.MAX_HEIGHT - 1020 - 130 }
];