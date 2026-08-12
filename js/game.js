// - - - MAP LOADER - - -

const map = localStorage.getItem("MapNumber") === null ? 1: parseInt(localStorage.getItem("MapNumber")) ;
const mode = localStorage.getItem("ModeNumber") === null ? 1: parseInt(localStorage.getItem("ModeNumber")) ;
g.loadMap(map);
//g.loadMode(mode);


// - - - CONSTANTS - - - 
const Player1 = Fighter.createFighters(1)
const Player2 = Fighter.createFighters(2)
const Player3 =  Fighter.createFighters(3)
g.Fighters = [Player1,Player2,Player3];

const Mask1 = Mask.CreateMask(Math.random());
const Aura1 = Sprite.CreateAura(1);
const Aura2 = Sprite.CreateAura(2);





g.Pointers.push(FloatingPointers.createPointers(Player1));
g.Pointers.push(FloatingPointers.createPointers(Player2));
g.Pointers.push(FloatingPointers.createPointers(Player3));

function Gameloop (currentTime){
    if (!g.FlagGame){
        return ; 
    }
    else {
        // Delta Time
        if (!g.lastTime) g.lastTime = currentTime;
            let dt = (currentTime - g.lastTime) / (1000 / 60);
            g.lastTime = currentTime;

            if (isNaN(dt) || dt > 2) dt = 1;
        // - - - CLEANING CANVAS - - -
        c.clearRect(0,0,g.MAX_WIDTH,g.MAX_HEIGHT)
        
        //- - - TELECAMERA SETTINGS - - -
        updateCamera();
        g.cameraMovement();
        
        // - - - PLATFORMS DRAWING - - -
        g.Platforms.forEach(platform=>{
            platform.Draw();
        })

        // - - - AURA UPDATE - - -
        if (Player2.PoweredUp && !Player2.Dead){
            Aura2.update(dt);
        }
        else if (Player1.PoweredUp && !Player1.Dead){
            Aura1.update(dt);
        }

        // - - - MASK UPDATE - - -
        if (Mask1.Placed && !Mask1.GotTaken){
            Mask1.update(dt);
        }

      
        
        // - - - PLAYERS UPDATE - - -
        g.Fighters.forEach(fighter => {
            HandleMovement(fighter);
            if (!fighter.Dead) fighter.update(dt);
        });


        // - - - BULLET 1st TRY
        g.Bullets.forEach(c =>{
            if (!c.hasHit){
                c.update(dt);
            }
        })
        
        
        // - - - VICTORY UPDATE - - -
        CheckVictory({player1:Player1 , player2:Player2, timerId : g.TimerIntervalId});

        // --- VISUAL EFFECTS --- 
        // inverted because are inserted in the opposite order
        for (let i = g.VisualEffects.length - 1; i >= 0; i--) {
        const effect = g.VisualEffects[i];
        effect.update();
        
        if (effect.dead) {
            g.VisualEffects.splice(i, 1);
        }
        }
        // - - - PLAYERS POINTERS UPDATE - - -
        g.Pointers.forEach(p=>{
            p.update(dt);
        })

        // - - restoring , the canvas was previously saved in line : 32
        c.restore();

        window.requestAnimationFrame(Gameloop)
    }
}
g.startTimer();

Gameloop();

//- - - COMMANDS - - -
document.addEventListener("keydown",e=>{
    e.preventDefault(); 
    const KeyPressed = e.key.toLowerCase();
    switch (KeyPressed) {
        case 'w': 
            Player1.keys.up.pressed = true; 
            break;
        case 'a': 
            Player1.keys.left.pressed = true; 
            Player1.LastKeyPressed = KeyPressed; 
            break; 
        
        case 's': 
            if(!e.repeat && Player1.attackCooldown === 0 && !Player1.isAttacking){
                Player1.attack();
            }
            break; 
        case 'd': 
            Player1.keys.right.pressed = true; 
            Player1.LastKeyPressed = KeyPressed; 
            break; 
        case 'shift':
            if (!e.repeat){
            Player1.keys.defend.pressed = true ; 
            Player1.LastKeyPressed = KeyPressed;
            }
            break;
        case 'arrowup': 
            Player2.keys.up.pressed = true; 
            break;
        case 'arrowleft': 
            Player2.keys.left.pressed = true; 
            Player2.LastKeyPressed = KeyPressed; 
            break; 
        case 'arrowdown': 
            if(!e.repeat && Player2.attackCooldown === 0 && !Player2.isAttacking){
                Player2.attack();
            }
            break; 
        case 'arrowright': 
            Player2.keys.right.pressed = true; 
            Player2.LastKeyPressed = KeyPressed; 
            break; 
        case '-': 
            if (!e.repeat){
                Player2.keys.defend.pressed = true; 
                Player2.LastKeyPressed = KeyPressed; 
            }
            break; 
    }
})

document.addEventListener("keyup",e=>{
    e.preventDefault();
    const KeyPressed = e.key.toLowerCase();
    switch (KeyPressed) {
        case 'w': 
            Player1.keys.up.pressed = false; 
            break; 
        case 'a': 
            Player1.keys.left.pressed = false; 
            break; 
        case 'd': 
            Player1.keys.right.pressed = false; 
            break; 
        case 'shift':
            Player1.keys.defend.pressed=false;  
            Player1.Defending = false;
            break;

        case 'arrowup': 
            Player2.keys.up.pressed = false; 
            break;
        case 'arrowleft': 
            Player2.keys.left.pressed = false; 
            break;  
        
        case 'arrowright': 
            Player2.keys.right.pressed = false; 
            break; 
        case '-':
            Player2.keys.defend.pressed=false; 
            Player2.Defending = false;
            break;
    }
})
