

const MAP_CONFIG = {
    1 : {
        // - - - ANIMATION SPRITES / IMAGES SETTINGS - - - 
        background : {
            link : "./img/BackGround/Background1.png",
            framesMax : 1,
            offset : {x:600,y:330},
            scale : 1.1
        },
        // - - - PLAYERS POSITIONS - - -
        StartPos: null,
        //- - - PLATFORMS POSITIONS - - -
        Platforms : [
            
            { position : {x: g.MAX_WIDTH/2- 478, y: g.MAX_HEIGHT},size : {x:956,y:240},imageSrc: "./img/BackGround/tryingSomething.png", scale : 1 , offset : {x: 500 , y: 990}, color : "blue"}
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
        Damage : 50
        
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
        type : "base",

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
const MASK_STATS= {
    1 : {
        // - - - POWER UP POSITION / SIZE - - -
        position: {
            x : 0,
            y : 0
        },
        size: {
            x: 40,
            y:70
        },
        // - - - POWER UP STATS - - -
        CuringHealth: 25,
        DamageMult : 2,
        KnockBack : 1,
        // - - - ANIMATION SPRITES / IMAGES SETTINGS - - -
        imageSrc : './img/PowerUp/purpleVial.png',
        framesMax : 22,
        scale : 2, 
        offset : {x: 0, y:0},        
    },
    2 : {
        // - - - POWER UP POSITION / SIZE - - -
        position: {
            x : 0,
            y : 0
        },
        size: {
            x: 40,
            y:70
        },
        // - - - POWER UP STATS - - -
        CuringHealth: 15,
        DamageMult : 1,
        KnockBack: 2,
        // - - - ANIMATION SPRITES / IMAGES SETTINGS - - -
        imageSrc : './img/PowerUp/purpleVial.png',
        framesMax : 22,
        scale : 2, 
        offset : {x: -2, y:0},        
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
