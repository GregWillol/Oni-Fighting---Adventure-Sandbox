const ArenaLayouts = [
    // 0: "Classica" - Piattaforme ai lati, buco in mezzo. Arena bilanciata.
    [
        { x: -50, y: g.MAX_HEIGHT - 600, w: g.MAX_WIDTH + 100, h: 240, color: "#1a1a1a" },
        { x: 400, y: g.MAX_HEIGHT - 860, w: 500, h: 20, color: "#444" },
        { x: g.MAX_WIDTH - 900, y: g.MAX_HEIGHT - 860, w: 500, h: 20, color: "#444" }
    ],
    // 1: "Altare" - Una grande piattaforma centrale, e due piccole rifugio ai bordi in alto.
    [
        { x: -50, y: g.MAX_HEIGHT - 600, w: g.MAX_WIDTH + 100, h: 240, color: "#1a1a1a" },
        { x: g.MAX_WIDTH / 2 - 400, y: g.MAX_HEIGHT - 860, w: 800, h: 20, color: "#444" },
        { x: 100, y: g.MAX_HEIGHT - 1120, w: 250, h: 20, color: "#444" },
        { x: g.MAX_WIDTH - 350, y: g.MAX_HEIGHT - 1120, w: 250, h: 20, color: "#444" }
    ],
    // 2: "Scalinata" - Ottima per saltare in obliquo e scappare dal boss.
    [
        { x: -50, y: g.MAX_HEIGHT - 600, w: g.MAX_WIDTH + 100, h: 240, color: "#1a1a1a" },
        { x: 300, y: g.MAX_HEIGHT - 860, w: 300, h: 20, color: "#444" },
        { x: 1100, y: g.MAX_HEIGHT - 1120, w: 300, h: 20, color: "#444" },
        { x: 1900, y: g.MAX_HEIGHT - 1380, w: 300, h: 20, color: "#444" }
    ],
    // 3: "La Gabbia" - Tante piccole piattaforme in alto, perfetto per i cecchini.
    [
        { x: -50, y: g.MAX_HEIGHT - 600, w: g.MAX_WIDTH + 100, h: 240, color: "#1a1a1a" },
        { x: 500, y: g.MAX_HEIGHT - 860, w: 200, h: 20, color: "#444" },
        { x: 1000, y: g.MAX_HEIGHT - 1120, w: 200, h: 20, color: "#444" },
        { x: 1500, y: g.MAX_HEIGHT - 1380, w: 200, h: 20, color: "#444" },
        { x: 2000, y: g.MAX_HEIGHT - 1120, w: 200, h: 20, color: "#444" },
        { x: 2500, y: g.MAX_HEIGHT - 860, w: 200, h: 20, color: "#444" }
    ],
    // 4: "Muri Gemelli" - Due colonne massicce con un vicolo cieco al centro. Letale per il corpo a corpo.
    [
        { x: -50, y: g.MAX_HEIGHT - 600, w: g.MAX_WIDTH + 100, h: 240, color: "#1a1a1a" },
        { x: 600, y: g.MAX_HEIGHT - 860, w: 400, h: 20, color: "#444" },
        { x: 2000, y: g.MAX_HEIGHT - 860, w: 400, h: 20, color: "#444" },
        { x: 800, y: g.MAX_HEIGHT - 1120, w: 200, h: 20, color: "#444" }, // Rifugio sopra la colonna SX
        { x: 2000, y: g.MAX_HEIGHT - 1120, w: 200, h: 20, color: "#444" } // Rifugio sopra la colonna DX
    ],
    // 5: "Piramidi" - Due formazioni a piramide per scontri verticali molto vicini.
    [
        { x: -50, y: g.MAX_HEIGHT - 600, w: g.MAX_WIDTH + 100, h: 240, color: "#1a1a1a" },
        { x: 400, y: g.MAX_HEIGHT - 860, w: 600, h: 20, color: "#444" }, // Base piramide Sx
        { x: 550, y: g.MAX_HEIGHT - 1120, w: 300, h: 20, color: "#444" }, // Punta piramide Sx
        { x: 1800, y: g.MAX_HEIGHT - 860, w: 600, h: 20, color: "#444" }, // Base piramide Dx
        { x: 1950, y: g.MAX_HEIGHT - 1120, w: 300, h: 20, color: "#444" }  // Punta piramide Dx
    ],
    // 6: "Arena PiPiatta" - Zero piattaforme. Solo un'enorme arena per combattimento duro a terra (alla Smash Bros su Final Destination).
    [
        { x: -50, y: g.MAX_HEIGHT - 600, w: g.MAX_WIDTH + 100, h: 240, color: "#1a1a1a" }
    ],
    // 7: "Le Forche Caudine" - Un tunnel lungo e stretto fatto da piattaforme, ti costringe a passare da sotto o farci il giro.
    [
        { x: -50, y: g.MAX_HEIGHT - 600, w: g.MAX_WIDTH + 100, h: 240, color: "#1a1a1a" },
        { x: 200, y: g.MAX_HEIGHT - 880, w: 2600, h: 20, color: "#444" } // Un po' più alta per farci passare sotto bene
    ]
];
const MAP_CONFIG = {
    1 : {
        background : {
            link : "./img/BackGround/Background1.png",
            framesMax : 1,
            offset : {x:0,y:0},
            scale : 1.4
        },
        StartPos: null,
        Platforms : [
            // Pavimento (Base: -600)
            { position: { x: 0, y: g.MAX_HEIGHT - 600 }, size: { x: g.MAX_WIDTH, y: 240 }, imageSrc: undefined, scale: 1.2, offset: { x: 0, y: 1200 }, color: "blue" },
            
            // Scalino basso (Gap: 400px sopra il pavimento)
            { position: { x: 300, y: g.MAX_HEIGHT - 1000 }, size: { x: 250, y: 20 }, imageSrc: undefined, scale: 1, offset: { x: 0, y: 0 }, color: "green" },
            
            // Impalcatura media (Gap: 350px sopra lo scalino)
            { position: { x: 800, y: g.MAX_HEIGHT - 1350 }, size: { x: 250, y: 20 }, imageSrc: undefined, scale: 1, offset: { x: 0, y: 0 }, color: "yellow" },
            
            // Balcone altissimo
            { position: { x: 1400, y: g.MAX_HEIGHT - 1700 }, size: { x: 250, y: 20 }, imageSrc: undefined, scale: 1, offset: { x: 0, y: 0 }, color: "red" }
        ]
    },

    2:{
        // - - - ANIMATION SPRITES / IMAGES SETTINGS - - -
        background : {
            link : "./img/BackGround/Map2Background.jpg",
            framesMax : 1,
            offset : {x:390,y:190},
            scale : 2
        },
        // - - - PLAYERS POSITIONS - - -
        StartPos: {
            p1 : {x: g.MAX_WIDTH/2-478, y : 0 },
            p2 : {x : g.MAX_WIDTH/2+478-g.Fighter2Width, y : 0}
        },
        // - - - PLATFORMS POSITIONS - - - 
        Platforms : [{ position : {x: g.MAX_WIDTH/2- 478, y: 400},size : {x: 956,y:240},imageSrc:'./img/Platforms/Map2Platform.png',scale : 2 ,offset : {x:800,y:1000},color : "yellow"}]
    }
}
const FIGHTER_STATS={
    Sekiro : {
        // - - - COLOR DEBUG - - -
        color : "red",

        //- - - COMMANDS - - -
        ControlKeys : {
            left : "a",
            right : "d",
            up : "w",
            attack : "s",
            defend: "shift"
        },
        // - - - FIGHTER STATS - - -
        size : {
            x: g.Fighter1Width,
            y: g.Fighter1Height
        },
        Direction : {
            right : true
        },
        AttackBox : {
            position : {
                x : 0 , 
                y : 0 
            },
            size : {
                x : 300, 
                y : 175
            },
            shape : "ellipse"
        },
        Player : 1,

        // - - - ANIMATION SPRITES - - -
        
        scale : 2.6, 
        offset : {x: 220, y:196},
        sprites: {
            idle: {
                imageSrc: './img/MartialHero/Idle.png',
                framesMax: 8 
            },
            run: {
                imageSrc: './img/MartialHero/Run.png', 
                framesMax: 8 
            },
            jump: {
                imageSrc: './img/MartialHero/Jump.png', 
                framesMax: 2 
            },
            attack: {
                imageSrc: './img/MartialHero/Attack1.png', 
                framesMax: 6 
            },
            hurt : {
                imageSrc: './img/MartialHero/TakeHitW.png', 
                framesMax: 4 
            }, 
            death : {
                imageSrc: './img/MartialHero/Death.png', 
                framesMax: 6 
            },
            defence : {
                imageSrc: './img/MartialHero/Defence.png', 
                framesMax: 1 
            }
        },
        attackFrame : 5,
        type : undefined,
        Damage : 100,
        HealthPoints : 3000,
        MaxHealthPoints : 3000,
        
    },
    Night : {
        //- - - COLOR DEBUG - - -
        color : "blue",

        // - - - COMMANDS - - -
        ControlKeys : {
            left : "arrowleft",
            right : "arrowright",
            up : "arrowup",
            attack : "arrowdown",
            defend : "-"
        },

        // - - - FIGHTER STATS - - -
        size : {
            x: g.Fighter2Width,
            y : g.Fighter2Height
        },
        Direction : {
            left : true
        },
        AttackBox : {
            position : {
                x : 0 , 
                y : 0 
            },
            size : {
                x : g.StandardAttBoxWid*2.3, 
                y : g.StandardAttBoxWid*2.3
            },
            shape : "circle"
        },
        Player : 2,
        // - - - GAME SETTINGS - - -
        Damage : 15,
        isAI : AI,
        type : "launcher",

        // - - - ANIMATION SPRITES - - -
        scale : 1.3, 
        offset : {x: 110, y:133},
        sprites: {
            idle: {
                imageSrc: './img/Night/idle.png',
                framesMax: 9 
            },
            run: {
                imageSrc: './img/Night/run.png', 
                framesMax: 6 
            },
             jump: {
                imageSrc: './img/Night/jump.png', 
                framesMax: 5 
            },
            attack: {
                imageSrc: './img/Night/attack.png',
                framesMax: 12
            },
            hurt :{
                imageSrc: './img/Night/hurt.png', 
                framesMax: 5

            },
            death : {
                imageSrc: './img/Night/death.png', 
                framesMax: 23 
            },
            defence : {
                imageSrc: './img/Night/defence.png',
                framesMax: 3 
            },
        },
        attackFrame : 9,
        HealthPoints : 100,
        value : 4
        

    },
    Night2 : {
        //- - - COLOR DEBUG - - -
        color : "blue",

        // - - - COMMANDS - - -
        ControlKeys : {
            left : "arrowleft",
            right : "arrowright",
            up : "arrowup",
            attack : "arrowdown",
            defend : "-"
        },

        // - - - FIGHTER STATS - - -
        size : {
            x: g.Fighter2Width,
            y : g.Fighter2Height+20
        },
        Direction : {
            left : true
        },
        AttackBox : {
            position : {
                x : 0 , 
                y : 0 
            },
            size : {
                x : g.StandardAttBoxWid*2.3, 
                y : g.StandardAttBoxWid*2.3
            },
            shape : "circle"
        },
        Player : 2,
        // - - - GAME SETTINGS - - -
        Damage : 15,
        isAI : AI,
        type : "base",

        // - - - ANIMATION SPRITES - - -
        scale : 3.2, 
        offset : {x: 150, y:70},
        sprites: {
            idle: {
                imageSrc: './img/Knight/knightidle.png',
                framesMax: 8
            },
            run: {
                imageSrc: './img/Knight/knightrun.png', 
                framesMax: 8 
            },
             jump: {
                imageSrc: './img/Knight/knightjump.png', 
                framesMax: 8 
            },
            attack: {
                imageSrc: './img/Knight/knightattack.png',
                framesMax: 6
            },
            hurt :{
                imageSrc: './img/Knight/knighthurt.png', 
                framesMax: 3

            },
            death : {
                imageSrc: './img/Knight/knightdeath.png', 
                framesMax: 4 
            },
            defence : {
                imageSrc: './img/Knight/knightdash.png',
                framesMax: 10 
            },
            slam : {
                imageSrc: './img/Knight/knightplunge.png',
                framesMax: 7 

            }
        },
        attackFrame : 4,
        HealthPoints : 130,
        value : 3
        

    },
    Night3 : {
        //- - - COLOR DEBUG - - -
        color : "blue",

        // - - - COMMANDS - - -
        ControlKeys : {
            left : "arrowleft",
            right : "arrowright",
            up : "arrowup",
            attack : "arrowdown",
            defend : "-"
        },

        // - - - FIGHTER STATS - - -
        size : {
            x: g.Fighter2Width,
            y : g.Fighter2Height
        },
        Direction : {
            left : true
        },
        AttackBox : {
            position : {
                x : 0 , 
                y : 0 
            },
            size : {
                x : g.StandardAttBoxWid*2.3, 
                y : g.StandardAttBoxWid*2.3
            },
            shape : "circle"
        },
        Player : 2,
        // - - - GAME SETTINGS - - -
        Damage : 15,
        isAI : AI,
        type : "BigAhhLauncher",

        // - - - ANIMATION SPRITES - - -
        scale : 1.3, 
        offset : {x: 110, y:133},
        sprites: {
            idle: {
                imageSrc: './img/Night/idle.png',
                framesMax: 9 
            },
            run: {
                imageSrc: './img/Night/run.png', 
                framesMax: 6 
            },
             jump: {
                imageSrc: './img/Night/jump.png', 
                framesMax: 5 
            },
            attack: {
                imageSrc: './img/Night/attack.png',
                framesMax: 12
            },
            hurt :{
                imageSrc: './img/Night/hurt.png', 
                framesMax: 5

            },
            death : {
                imageSrc: './img/Night/death.png', 
                framesMax: 23 
            },
            defence : {
                imageSrc: './img/Night/defence.png',
                framesMax: 3 
            },
        },
        attackFrame : 9,
        HealthPoints : 100,
        value : 6
    }
}
const AURA_STATS={
    1 : {
        // - - - DEBUG COLOR - - -
        color : "red",
        // - - - SIZE - - -
        size : {
        x : g.Fighter1Width,
        y: g.Fighter1Height
        },
        // - - - ANIMATION FRAMES & SETTINGS - - -
        imageSrc : './img/MartialHero/Aura.png',
        framesMax : 16,
        scale : 2.5 ,
        offset : {
            x : 89, 
            y : 48
        }
    },
    2: {
        // - - - DEBUG COLOR - - -
        color : "purple",
        // - - - SIZE - - -
        size : {
        x : g.Fighter2Width,
        y: g.Fighter2Height
        },
        // - - - ANIMATION FRAMES & SETTINGS - - - 
        imageSrc : './img/Night/Aura.png',
        framesMax : 16,
        scale : 3.6 ,
        offset : {
            x : 130, 
            y : 130
        }
    }
}
const MASK_STATS = {
    // 1: LA CURA BASE
    1: {
        name: "Health Potion",
        position: { x: 0, y: 0 },
        size: { x: 40, y: 70 },
        CuringHealth: 50,
        DamageMult: 1,
        KnockBack: 1,
        imageSrc: './img/PowerUp/purpleVial.png',
        framesMax: 22,
        scale: 2,
        offset: { x: 0, y: 0 },
        price : 0
    },
    // 2: IL BERSERKER (Danni e knockback enormi)
    2: {
        name: "Demon Strength",
        position: { x: 0, y: 0 },
        size: { x: 40, y: 70 },
        CuringHealth: 0,
        DamageMult: 2.0,
        KnockBack: 1.8,
        imageSrc: './img/PowerUp/purpleVial.png', // Cambierai sprite poi
        framesMax: 22,
        scale: 2,
        offset: { x: -2, y: 0 },
        price : 10
    },
    // 3: IL TIRATORE SCELTO (Sblocca i proiettili)
    3: {
        name: "Magic Caster",
        position: { x: 0, y: 0 },
        size: { x: 40, y: 70 },
        CuringHealth: 10,
        DamageMult: 1.2,
        KnockBack: 1,
        CanShoot: true, // Quando la raccogli, setti Player1.canShoot = true
        imageSrc: './img/PowerUp/purpleVial.png',
        framesMax: 22,
        scale: 2,
        offset: { x: 0, y: 0 },
        price : 12
    },
    // 4: IL VAMPIRO (Ruba vita a ogni colpo)
    4: {
        name: "Vampire Blood",
        position: { x: 0, y: 0 },
        size: { x: 40, y: 70 },
        CuringHealth: 0,
        DamageMult: 1,
        KnockBack: 1,
        LifeSteal: 0.15, // Il player recupera il 15% del danno che infligge
        imageSrc: './img/PowerUp/purpleVial.png',
        framesMax: 22,
        scale: 2,
        offset: { x: 0, y: 0 }, 
        price : 15
    },
    // 5: IL FULMINE (Velocità di movimento e salto)
    5: {
        name: "Hermes Boots",
        position: { x: 0, y: 0 },
        size: { x: 40, y: 70 },
        CuringHealth: 0,
        DamageMult: 1,
        KnockBack: 1,
        SpeedMult: 1.1, // Moltiplichi la velocity.x del player
        JumpBoost: -1.1,  // Aggiungi potenza al salto
        imageSrc: './img/PowerUp/purpleVial.png',
        framesMax: 22,
        scale: 2,
        offset: { x: 0, y: 0 },
        price : 20
    },
    // 6: IL TANK (Aumenta la salute massima permanentemente)
    6: {
        name: "Titan Heart",
        position: { x: 0, y: 0 },
        size: { x: 40, y: 70 },
        CuringHealth: 100,
        MaxHealthUp: 50, // Aumenta il cap massimo degli HP
        DamageMult: 1,
        KnockBack: 1.2,
        imageSrc: './img/PowerUp/purpleVial.png',
        framesMax: 22,
        scale: 2,
        offset: { x: 0, y: 0 },
        price : 30
    }
}
const BULLET_STATS= {
    1 : {
        position : {
            x : g.MAX_WIDTH/2 , 
            y : g.MAX_HEIGHT/2
        },
        size : {
            x : 40, 
            y : 25 
        }, 
        KnockBack : 20,
        imageSrc : './img/VFX/Bullets/Fireball.png', 
         framesMax :5 ,
        scale : 1.5, 
        offset : {
            x : 35 , 
            y:  10 

        },
        Damage : 10 ,
        caster : undefined,
        color : "orange",
        isUnblockable : false
       
    },
    2 : {
        position : { x : 0, y : 0 },
        size : { x : 80, y : 50 }, // Hitbox raddoppiata
        KnockBack : 40,            // Ti spedisce fuori dalla mappa
        imageSrc : './img/VFX/Bullets/Fireball.png', // Ricicliamo l'immagine per ora
        framesMax : 5,
        scale : 3.5,               // Sprite GIGANTE
        offset : { x : 80, y : 30 }, // Aggiustato per la scala
        Damage : 35,               // Danno devastante
        caster : undefined,
        color : "red",             // Box debug cattivo
        isUnblockable : true       // Niente parate bro
    }

}
