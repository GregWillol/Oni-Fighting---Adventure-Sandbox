// - - - MAP LOADER - - -

const map = localStorage.getItem("MapNumber") === null ? 1: parseInt(localStorage.getItem("MapNumber")) ;
const mode = localStorage.getItem("ModeNumber") === null ? 1: parseInt(localStorage.getItem("ModeNumber")) ;
g.loadMap(map);
//g.loadMode(mode);


// - - - CONSTANTS - - - 
const Player1 = Fighter.createFighters(1)
const Player2 = Fighter.createFighters(2)


g.Fighters = [Player1,Player2];

const Mask1 = Mask.CreateMask(Math.random());
const Aura1 = Sprite.CreateAura(1);
const Aura2 = Sprite.CreateAura(2);


const Lamp1 = new Sprite ({
            position : {
                x:700,
                y:700
            },
            size : {
                x : 50,
                y: 50
            },
            imageSrc : './img/VFX/Lamp/OrangeSilver.png',
            framesMax : 38,
            scale : 1, 
            offset : {
                x:-200,
                y:40
            },
            color : "black"
        }) 
        const Lamp2 = new Sprite ({
            position : {
                x:217,
                y:550
            },
            size : {
                x : 50,
                y: 50
            },
            imageSrc : './img/VFX/Lamp/Lamp2.png',
            framesMax : 38,
            scale : 1.7, 
            offset : {
                x:3,
                y:14
            },
            color : "black"
        }) 



g.Pointers.push(FloatingPointers.createPointers(Player1));
g.Pointers.push(FloatingPointers.createPointers(Player2));


function Gameloop (currentTime){
    if (!g.FlagGame){
        return ; 
    }
    else {
        // Delta Time
        if (!g.lastTime) g.lastTime = currentTime;
            let dt = (currentTime - g.lastTime) / (1000 / 60);
            g.lastTime = currentTime;

            if (isNaN(dt) || dt > 1.5 || dt < 0) dt = 1;
        // - - - CLEANING CANVAS - - -
        c.clearRect(0,0,g.MAX_WIDTH,g.MAX_HEIGHT)
        
        //- - - TELECAMERA SETTINGS - - -
        updateCamera();
        g.cameraMovement();
        
        // - - - PLATFORMS DRAWING - - -
        g.Platforms.forEach(platform=>{
            platform.Draw();
        })
        // Lamp
        Lamp1.update(dt);
        Lamp2.update(dt);

        // - - - AURA UPDATE - - -
        if (Player2.PoweredUp && !Player2.Dead){
            Aura2.update(dt);
        }
        else if (Player1.PoweredUp && !Player1.Dead){
            Aura1.update(dt);
        }

        // - - - MASK UPDATE - - -
        // - - - MASK UPDATE - - -
for (let i = g.Potions.length - 1; i >= 0; i--) {
    const mask = g.Potions[i];
    
    if (mask.Placed && !mask.GotTaken) {
        mask.update(dt);
    } else if (mask.GotTaken) {
        // Se la pozione è stata presa, la polverizziamo dall'array
        g.Potions.splice(i, 1);
    }
}

        
      
        
        // - - - PLAYERS UPDATE - - -
        g.Fighters.forEach(fighter => {
            HandleMovement(fighter);
            if (!fighter.imploded) fighter.update(dt);
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

function initMobileControls() {
    const controls = [
        { id: 'btn-left', key: 'left' },
        { id: 'btn-right', key: 'right' },
        { id: 'btn-up', key: 'up' },
        { id: 'btn-defend', key: 'defend' },
        { 
            id: 'btn-attack', 
            key: 'attack', 
            // FIX: Scatta solo se Player1 NON sta già attaccando
            onPress: () => { 
                if (Player1 && Player1.attack && !Player1.isAttacking) {
                    Player1.attack(); 
                } 
            } 
        }
    ];

    controls.forEach(({ id, key, onPress }) => {
        const btn = document.getElementById(id);
        if (!btn) return;

        const handleStart = (e) => {
            e.preventDefault();
            if (!Player1 || !Player1.keys[key]) return;

            Player1.keys[key].pressed = true;
            
            // FIX: Aggiorniamo LastKeyPressed SOLO se stiamo muovendoci a destra o sinistra.
            // In questo modo, saltare, difendersi o attaccare non fermerà la corsa!
            if ((key === 'left' || key === 'right' || 'defend') && Player1.ControlKeys && Player1.ControlKeys[key]) {
                Player1.LastKeyPressed = Player1.ControlKeys[key];
            }
            
            if (onPress) onPress();
        };

        const handleEnd = (e) => {
            e.preventDefault();
            if (Player1 && Player1.keys[key]) {
                Player1.keys[key].pressed = false;
                if (key === 'defend'){
                    Player1.Defending = false;
                }
            }
        };

        btn.addEventListener('touchstart', handleStart, { passive: false });
        btn.addEventListener('touchend', handleEnd, { passive: false });
        btn.addEventListener('touchcancel', handleEnd, { passive: false });
    });
}

// Invocala all'avvio del gioco
initMobileControls();

const btnFullscreen = document.getElementById('btn-fullscreen');

if (btnFullscreen) {
    const toggleFullscreen = (e) => {
        e.preventDefault(); // Blocca click fantasma
        const gioco = document.getElementById('Gioco');

        if (!document.fullscreenElement) {
            // Entra in Fullscreen
            if (gioco.requestFullscreen) {
                gioco.requestFullscreen();
            } else if (gioco.webkitRequestFullscreen) { 
                gioco.webkitRequestFullscreen(); // Android Chrome
            } else {
                alert("Fullscreen non supportato su questo dispositivo (es. iPhone). Gira il telefono!");
            }
        } else {
            // Esci dal Fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };

    // Ascoltiamo sia il click (PC) che il rilascio del tocco (Mobile)
    btnFullscreen.addEventListener('click', toggleFullscreen);
    btnFullscreen.addEventListener('touchend', toggleFullscreen);
}