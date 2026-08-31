// - - - MAP LOADER - - -

const map = localStorage.getItem("MapNumber") === null ? 1: parseInt(localStorage.getItem("MapNumber")) ;
const mode = localStorage.getItem("ModeNumber") === null ? 1: parseInt(localStorage.getItem("ModeNumber")) ;
g.loadMap(map);
//g.loadMode(mode);


// - - - CONSTANTS - - - 
const Player1 = Fighter.createFighters(1)



g.Fighters = [Player1];

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



function Gameloop (currentTime){
    if (!g.FlagGame){
        return ; 
    }
    else {
        // Delta Time
        if(g.roomState === "RESTART" && g.roundEnded && g.isPerked){
            g.roomState = "FIGHTING"
            g.isPerked = false;
            g.startTimer();
        }
        if (!g.lastTime) g.lastTime = currentTime;
            let dt = (currentTime - g.lastTime) / (1000 / 60);
            g.lastTime = currentTime;

        if (isNaN(dt) || dt > 1.5 || dt < 0) dt = 1;

        if (g.hitStopFrames > 0) {
            g.hitStopFrames--; // Scala un frame di blocco
            dt = 0;            // Congela il tempo per tutto il gioco!
        }
        
        // - - - CLEANING CANVAS - - -
        c.clearRect(0,0,g.MAX_WIDTH,g.MAX_HEIGHT)
        // --- APPLICA LO SCREEN SHAKE ---
        c.save(); // Salva lo stato pulito del canvas
        if (g.cameraShake > 0) {
            // Genera un offset casuale piccolissimo (es. tra -3 e 3 pixel)
            const shakeX = (Math.random() - 0.5) * g.cameraShake;
            const shakeY = (Math.random() - 0.5) * g.cameraShake;
            c.translate(shakeX, shakeY);
            
            g.cameraShake *= 0.9; // Fa scemare la scossa dolcemente frame dopo frame
            if (g.cameraShake < 0.2) g.cameraShake = 0; // La spegne quando è quasi zero
        }
        // Aggiorna la UI delle monete
    const coinUI = document.getElementById('coin-counter');
    if (coinUI && Player1) {
        coinUI.innerText = `🪙 ${Player1.coins}`;
    }
            
        
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
        
         if (Player1.PoweredUp && !Player1.Dead){
            Aura1.update(dt);
        }

        
        // - - - MASK UPDATE - - -
for (let i = g.PowerUps.length - 1; i >= 0; i--) {
    const mask = g.PowerUps[i];
    
    // Se l'array è stato svuotato durante l'update, interrompe subito il ciclo
    if (!mask) continue; 
    
    if (mask.Placed && !mask.GotTaken) {
        mask.update(dt);
    } else if (mask.GotTaken) {
        g.PowerUps.splice(i, 1);
    }
}

        
      
        
        // - - - PLAYERS UPDATE - - -
        g.Fighters.forEach(fighter => {
            HandleMovement(fighter);
            if (!fighter.imploded) {
                fighter.update(dt);
            }
        });


        // - - - BULLET 1st TRY
        g.Bullets.forEach(c =>{
            if (!c.hasHit){
                c.update(dt);
            }
        })
        
        
        // - - - VICTORY UPDATE - - -
        CheckVictory({player1:Player1 ,timerId : g.TimerIntervalId});

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



SoundManager.init();

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
        case 'q': 
            if(!e.repeat && Player1.attackCooldown === 0 && !Player1.isAttacking){
                Player1.keys.slam.pressed = true;
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
        case 'e':
            if (!Player1.keys.interact) Player1.keys.interact = { pressed: false };
                Player1.keys.interact.pressed = true;
                Player1.LastKeyPressed = KeyPressed;

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
            if (Player1.keys.right.pressed) {
                Player1.LastKeyPressed = Player1.ControlKeys.right; // destra ancora premuta, riprendi da lì
            }
            break; 
        case 'd': 
            Player1.keys.right.pressed = false; 
            if (Player1.keys.left.pressed) {
                Player1.LastKeyPressed = Player1.ControlKeys.left;
            }
            break;
        case 'shift':
            Player1.keys.defend.pressed=false;  
            Player1.Defending = false;
            break;
        case 'e':
            if (Player1.keys.interact.pressed) Player1.keys.interact.pressed = false;
            break;
        case 'q': 
            if (Player1.keys.slam.pressed) Player1.keys.slam.pressed = false;
            break; 

    }
    
})

function initMobileControls() {
    const controls = [
        
        { id: 'btn-up', key: 'up' },
        { id: 'btn-defend', key: 'defend' },
        { 
            id: 'btn-attack', 
            key: 'attack', 
            onPress: () => { 
                // Aggiunto il controllo del cooldown (come da tastiera) per non far laggare i frame
                if (Player1 && Player1.attack && Player1.attackCooldown === 0 && !Player1.isAttacking) {
                    Player1.attack(); 
                } 
            } 
        },
        {
        id: 'btn-slam',
        key: 'slam',
        onPress: () => {
            // Stessa condizione di guardia del tasto 'q' su desktop
            if (Player1 && Player1.keys.slam && Player1.attackCooldown === 0 && !Player1.isAttacking) {
                Player1.keys.slam.pressed = true;
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
            
            // FIX: Ora la sintassi è corretta (key === 'defend')
            // Salto e attacco non fermeranno più la tua corsa!
            if ((key === 'left' || key === 'right' || key === 'defend') && Player1.ControlKeys && Player1.ControlKeys[key]) {
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
function initJoystick() {
    const zone = document.getElementById('joystick-zone');
    const base = document.getElementById('joystick-base');
    const knob = document.getElementById('joystick-knob');
    const maxRadius = 45; // px massimi di escursione dello knob
    const deadzone = 12;  // sotto questa soglia = considerato fermo

    let touchId = null;
    let originX = 0, originY = 0;

    function setDirection(dx) {
        if (dx > deadzone) {
            Player1.keys.right.pressed = true;
            if (Player1.keys.left.pressed) {
                Player1.keys.left.pressed = false;
            }
            Player1.LastKeyPressed = Player1.ControlKeys.right;
        } else if (dx < -deadzone) {
            Player1.keys.left.pressed = true;
            if (Player1.keys.right.pressed) {
                Player1.keys.right.pressed = false;
            }
            Player1.LastKeyPressed = Player1.ControlKeys.left;
        } else {
            Player1.keys.left.pressed = false;
            Player1.keys.right.pressed = false;
        }
    }

    function handleStart(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        touchId = touch.identifier;

        originX = touch.clientX;
        originY = touch.clientY;

        base.style.left = `${originX}px`;
        base.style.top = `${originY}px`;
        base.style.opacity = '1';
        knob.style.transform = 'translate(-50%, -50%)';
    }

    function handleMove(e) {
        if (touchId === null) return;
        const touch = [...e.changedTouches].find(t => t.identifier === touchId);
        if (!touch) return;
        e.preventDefault();

        const dx = touch.clientX - originX;
        const dy = touch.clientY - originY;
        const dist = Math.min(Math.hypot(dx, dy), maxRadius);
        const angle = Math.atan2(dy, dx);

        const knobX = Math.cos(angle) * dist;
        const knobY = Math.sin(angle) * dist;
        knob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;

        setDirection(dx);
    }

    function handleEnd(e) {
        const touch = [...e.changedTouches].find(t => t.identifier === touchId);
        if (!touch) return;

        touchId = null;
        base.style.opacity = '0';
        Player1.keys.left.pressed = false;
        Player1.keys.right.pressed = false;
    }

    zone.addEventListener('touchstart', handleStart, { passive: false });
    zone.addEventListener('touchmove', handleMove, { passive: false });
    zone.addEventListener('touchend', handleEnd, { passive: false });
    zone.addEventListener('touchcancel', handleEnd, { passive: false });
}

initJoystick(); // aggiungila subito dopo initMobileControls();

if (g.PressToStart) {
    const handleStartGame = (e) => {
        e.preventDefault();
        g.startTimer();
        g.PressToStart.style.display = "none";
        SoundManager.playMusic('intro');
    };

    g.PressToStart.addEventListener('touchstart', handleStartGame, { once: true, passive: false });
    g.PressToStart.addEventListener('click', handleStartGame, { once: true });
}

const btnFullscreen = document.getElementById('btn-fullscreen');

if (btnFullscreen) {
    const toggleFullscreen = (e) => {
        e.preventDefault(); // Blocca click fantasma
        e.target.blur();    // Rimuove il focus dal bottone
        
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

    // Reset del delta time al cambio di schermo
    document.addEventListener('fullscreenchange', () => {
        g.lastTime = 0;
    });
    document.addEventListener('webkitfullscreenchange', () => {
        g.lastTime = 0;
    });
}