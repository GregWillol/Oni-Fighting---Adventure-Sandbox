function CheckCollisions({rectangle1,rectangle2}){
    return (
        rectangle1.position.x+rectangle1.size.x>=rectangle2.position.x && 
        rectangle1.position.x <= rectangle2.position.x + rectangle2.size.x && 
        rectangle1.position.y + rectangle1.size.y >= rectangle2.position.y && 
        rectangle1.position.y <= rectangle2.position.y + rectangle2.size.y
    );
}
function CircleCollision({ circle, rectangle, lookLeft }) {
    const circleX = circle.position.x+ circle.size.x/2;
    const circleY = circle.position.y+ circle.size.y/2;
    const radius = circle.size.x /2; 
    const rectX = rectangle.position.x;
    const rectY = rectangle.position.y;
    const rectW = rectangle.size.x;
    const rectH = rectangle.size.y;
    const testX = Math.max(rectX, Math.min(circleX, rectX + rectW));
    const testY = Math.max(rectY, Math.min(circleY, rectY + rectH));

    
    if (lookLeft && testX > circleX) return false;
    if (!lookLeft && testX < circleX) return false;

    const distX= circleX-testX;
    const distY= circleY-testY;
    const distance =Math.sqrt((distX*distX)+(distY * distY));
    return distance <= radius;
}


function EllipseCollision({ ellipse, rectangle, lookLeft }) {
    const a = ellipse.size.x / 2; 
    const b = ellipse.size.y / 2; 
    const cx = ellipse.position.x + a;
    const cy = ellipse.position.y + b;

    const rectX = rectangle.position.x;
    const rectY = rectangle.position.y;
    const rectW = rectangle.size.x;
    const rectH = rectangle.size.y;

    const closestX = Math.max(rectX, Math.min(cx, rectX + rectW));
    const closestY = Math.max(rectY, Math.min(cy, rectY + rectH));

    if (lookLeft && closestX > cx) return false;
    if (!lookLeft && closestX < cx) return false;

    const dx = closestX - cx;
    const dy = closestY - cy;
    return ((dx*dx)/ (a*a)) + ((dy*dy) / (b*b)) <= 1;
}
function PlatformCollisions({rectangle1,rectangle2}){
    //Obj is falling
    if (rectangle1.velocity.y>0 && (rectangle1.position.y+rectangle1.size.y-rectangle1.velocity.y)<=rectangle2.position.y){
        rectangle1.velocity.y = 0;
        rectangle1.position.y = rectangle2.position.y-rectangle1.size.y;
        //Checking if obj is a "FIghter" obj or not
        if (rectangle1.OnGround !== "undefined") rectangle1.OnGround = true;
    }
    //collision x-axis
    else if (rectangle1.velocity.x > 0 && rectangle1.position.x + rectangle1.size.x-rectangle1.velocity.x <= rectangle2.position.x){
        rectangle1.velocity.x = 0 ; 
        rectangle1.position.x= rectangle2.position.x -rectangle1.size.x;
    }
    else if (rectangle1.velocity.x < 0 && rectangle1.position.x -rectangle1.velocity.x >= rectangle2.position.x +rectangle2.size.x){
        rectangle1.velocity.x = 0 ; 
        rectangle1.position.x= rectangle2.position.x + rectangle2.size.x;
    }

}
function BouncinessPlatformCollisions({rectangle1,rectangle2}){
    //Obj is falling
    if (rectangle1.velocity.y>0 && (rectangle1.position.y+rectangle1.size.y-rectangle1.velocity.y)<=rectangle2.position.y){
        rectangle1.velocity.y = -rectangle1.velocity.y/1.0;
        rectangle1.position.y = rectangle2.position.y-rectangle1.size.y;
        //Checking if obj is a "FIghter" obj or not
        if (rectangle1.OnGround !== "undefined") rectangle1.OnGround = true;
    }
    //collision x-axis
    else if (rectangle1.velocity.x > 0 && rectangle1.position.x + rectangle1.size.x-rectangle1.velocity.x <= rectangle2.position.x){
        rectangle1.velocity.x = -rectangle1.velocity.x/1.1 ; 
        rectangle1.position.x = rectangle2.position.x -rectangle1.size.x;
    }
    else if (rectangle1.velocity.x < 0 && rectangle1.position.x -rectangle1.velocity.x >= rectangle2.position.x +rectangle2.size.x){
        rectangle1.velocity.x = -rectangle1.velocity.x/2 ; 
        rectangle1.position.x= rectangle2.position.x + rectangle2.size.x;
    }

}
function CheckAttackCollision({ attacker, victim }) {
    
    const AttackBox = attacker.AttackBox;
    const lookLeft = attacker.Direction.left; 

    if (AttackBox.shape === "circle") {
        return CircleCollision({ circle: AttackBox, rectangle: victim, lookLeft: lookLeft });
    } 
    else if (AttackBox.shape === "ellipse") {
        return EllipseCollision({ ellipse: AttackBox, rectangle: victim, lookLeft: lookLeft });
    } 
    else {
        return CheckCollisions({ rectangle1: AttackBox, rectangle2: victim });
    }
}
function reduceTimer(){
    if (g.FlagFight) RemoveAnnouncement() ; 
    if (g.timer > 0) {
        g.timer--;
    }
    if (g.RoomHandler === 'COOLDOWN'){
        Timer.textContent = g.timer+3;
        if (g.timer === 3){
            g.RoomHandler = 'FIGHTING';
            g.startTimer();
        }
    }
    if(g.timer <= 60){
        Timer.textContent = g.timer;
    } else {
        Timer.textContent = 60; 
    }
    switch(g.timer){
        // - - - COUNTDOWN - - -
        case 63: 
            TriggerAnnouncement("3"); 
            
            break;
        case 62: 
            TriggerAnnouncement("2"); 
            break;
        case 61: 
            TriggerAnnouncement("1"); 
            break;
        // - - - FIGHT / MASK announcements - - -
        case 60: 
            TriggerAnnouncement("FIGHT");
            g.FlagFight = true
            break; 
        
    }
}




function ReduceAddHP(player) {
    // Gestione dei limiti base
    if (player.HealthPoints <= 0) {
        player.HealthPoints = 0;
    }
    if (player.HealthPoints >= player.MaxHealthPoints) {
        player.HealthPoints = player.MaxHealthPoints;
    }

    if (player.isAI || player.Player > 2) return;
    
    // - - - DOM - - -
    const HealthBar = document.getElementById("P" + player.Player + "HP");
    if (!HealthBar) return;
    
    const width = Math.floor((player.HealthPoints / player.MaxHealthPoints) * 100);
   console.log("HP attuali:", player.HealthPoints, "Max:", player.MaxHealthPoints, "Width %:", width);
    HealthBar.style.width = width + "%";
}
function ReduceAddStamina(player){

    
    if (player.staminaBar <=0) {
        player.staminaBar = 0;
    }
    if (player.isAI || player.Player > 2) return;
    
    // - - - DOM - - -
    const StaminaBar = document.getElementById("stamina-bar")
    let StaminaBarWidth = 0 ; 
    if (player.staminaBar>=3) {
            player.staminaBar = 3;
            StaminaBarWidth = 100;
    }
    else {
        StaminaBarWidth = player.staminaBar*33;
    }
        StaminaBar.style.width= StaminaBarWidth+"%" 
        
}
function utilStaminaTimer(player){
    player.staminaTimer--;
    
    if (player.staminaTimer<= 0) {
        player.staminaTimer = 300;
        player.staminaBar = 0 ;
        ReduceAddStamina(player);
    }
}

function TriggerAnnouncement(text,flag = false){
    RemoveAnnouncement();
    //This permits the browser to restart the animation
    void g.Announcement.offsetWidth;
    g.Announcement.textContent= text;
    if (!flag) g.Announcement.classList.add('fight-announcement');
    else {g.Announcement.classList.add('show-announcement');}
    
    
}
function RemoveAnnouncement(){
    g.Announcement.classList.remove('fight-announcement')
    g.Announcement.classList.remove('show-announcement')
}

function CheckVictory({ player1, timerId }) {
    if (g.roundEnded) return;

    // 1. GESTIONE STATO: Chi ha 0 HP avvia la morte e setta .Dead = true
    g.Fighters.forEach(f => {
        if (f.HealthPoints <= 0 && f.image !== f.sprites.death.image) {
            if (f.death) f.death();
        }
    });

    // 2. SCONFITTA: Scatta SOLO quando P1 ha finito l'animazione (.imploded = true)
    if (player1.HealthPoints <= 0 && player1.imploded) {
        g.roundEnded = true;
        clearInterval(timerId);
        TriggerAnnouncement("YOU DIED", true);
        return; 
    }

    // 3. TIMEOUT: Scade il tempo
    if (g.timer === 0) {
        g.roundEnded = true;
        clearInterval(timerId);
        if (player1.image !== player1.sprites.death.image) {
            if (player1.death) player1.death();
        }
        TriggerAnnouncement("YOU DIED", true);
        return;
    }

    // 4. VITTORIA: Controlliamo che i nemici siano implosi
    const enemies = g.Fighters.filter(f => f.Player !== 1);
    const allEnemiesDefeated = enemies.length > 0 && enemies.every(mob => mob.imploded);

    if (allEnemiesDefeated) {
        g.roundEnded = true;
        clearInterval(timerId);
        
        
        TriggerAnnouncement("Round "+g.difficulty+" completed", true);
        setTimeout(RemoveAnnouncement,5000);
        g.RoomHandler = 'COOLDOWN';
        g.startCountdown();
        g.difficulty++;
    }
}

function HandleMovement(player){
    if (player.Dead) {
        player.switchSprite('death');
        return; 
    }
    let pAction = "idle"
    if(player.Defending){
        pAction = "defence";
    }
    else if(player.isAttacking){
        pAction ="attack"
    }
    else if ((player.keys.left.pressed || player.keys.right.pressed) && player.velocity.y === 0){
        pAction = "run"
    }
    else if (player.velocity.y !== 0){
        pAction="jump";
    }
    player.switchSprite(pAction);
}

function CreateVFX(player,typo,text,bool = true){
    const vfx = {CRIT: {text : "CRITICAL HIT!",color : "#FF3126",offset : {x:player.size.x,y:player.size.y},velocity:{x:0,y:-2},count : 1},
            HIT : {text : "HIT", color :"#fff",offset : {x:player.size.x,y:player.size.y},velocity : {x: 0, y:-0.5},count : 1},
            HP : {text : "+HP", color : player.Player === 1 ? "#FF3126" : "#8f00ff",offset : {x:player.size.x,y:player.size.y},velocity : {x: 0, y:-0.5}, count : 1},
            DEF : {text : "BLOCKED", color : "#6d8df5ff",offset : {x:player.size.x,y:player.size.y},velocity : {x: 0, y:-0.5},count : 1},
            MASK : {text : text || "POWER UP!" , color : player.Player === 1 ? "#FF3126" : "#8f00ff",offset : {x:0,y:player.size.y},velocity : {x: 0, y:-0.5}, count :1},
            RUN : {text : "", color : player.Player === 1 ? "#FF3126" : "#8f00ff",offset : {x:0,y:0},velocity : {x: 0 , y :-Math.random()*2},count :1},
            JUMP : {text : "", color :player.Player === 1 ? "#FF3126" : "#8f00ff", offset: {x: 0, y:0},velocity : {x:0,y:0},count : 2},
            DASH : {text : "", color : player.Player === 1 ? "#FF3126" : "#8f00ff", offset: {x: player.size.x/2 , y:player.size.y/2},velocity: {x:0 , y:0},count : 30},
            DAM : {text : "", color : player.Player !== 1 ? "#FF3126" : "#8f00ff", offset :{x: player.size.x, y:player.size.y/2},velocity : {x:0 , y:0 },count : 10},
            COOLDOWN : {text : text, color : player.Player === 1 ? "#FF3126" : "#8f00ff", offset :{x: player.size.x/2, y:player.size.y},velocity : {x:0 , y:-0.5 },count : 1},
            DISAPPEAR : {text : "", color : "orange", offset :{x: player.size.x, y:player.size.y/2},velocity : {x:0 , y: 0},count : 20},
            UP : {text : "", color : "blue", offset :{x: 0, y:Math.random()*player.size.y},velocity : {x:0 , y: 0},count : 2},
        };
    let Direction = 1;
    if (bool){
        Direction = player.Direction.right ? -1 : 1 ; 
    }        
    const opacity = typo === "COOLDOWN" ? 0.6 : 1 ; 
    
    if (typo === "JUMP" && player.jumpBuffer === 0 )return;
    //Inserting in the Array the new FloatingText so it can be uploaded then removed from this
    //This help to mantain the order of FloatingText playing for each frame  
    for (let i= 0 ; i < vfx[typo].count ;i++){
        //Math.random() is used for make the animation look fuller under the Fighter's feet
        let offsetPlayer = {x: player.position.x+(Math.random()*player.size.x)-vfx[typo].offset.x, 
                        y : player.size.y+player.position.y-vfx[typo].offset.y
        }
        let randVelocity;
        //Need 2 different assets for these vfx
        if (typo === "JUMP" || typo === "DASH" || typo === "DAM" || typo === "DISAPPEAR" || "UP"){
            const randOffset = RandomOffsetVFX(player);
            offsetPlayer.x += randOffset.x-(player.size.x/2); 
            offsetPlayer.y += randOffset.y;
            randVelocity = RandomVelocityVFX(Direction);
        }
        else {
            randVelocity = vfx[typo].velocity;
        }
        g.VisualEffects.push(new FloatingText({
            position : {
                x:offsetPlayer.x,
                y:offsetPlayer.y
            },
            velocity : {
                x:randVelocity.x,
                y:randVelocity.y
            },
            text : i === 0 ? vfx[typo].text : "",
            opacity : opacity,
            color : vfx[typo].color,
            fadeSpeed: typo === "MASK" ? 0.005 : 0.02
        }))
    }
    if (player.jumpBuffer >0 )player.jumpBuffer--;

}
function SaveStatistics(Id, Won, OtherHealth) {
    if (!Id || Id === 0 || Id === "0") {
        return;
    }

    let Damage = 100 - (OtherHealth < 0 ? 0 : OtherHealth);

    fetch('php/update_stats.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id_utente: Id,
            win: Won,
            damage: Damage 
        })
    })
    .catch(err => console.error(err));
}

function ApplyKnockback(gotHit, Attacker) {
    // 1. Calcoliamo la percentuale di vita PERSA (da 0.0 a 1.0)
    // Usiamo MaxHealthPoints per adattarci a qualsiasi nemico (da 100 a 40.000 HP)
    let damagePercent = 1 - (gotHit.HealthPoints / gotHit.MaxHealthPoints);
    if (damagePercent < 0) damagePercent = 0; // Sicurezza per evitare numeri negativi
    
    // 2. Forza base del colpo (indipendente dal Danno numerico!)
    let baseForce = 5 * Attacker.KnockBack;
    
    // 3. Forza extra calcolata in base a quanto è ferito 
    // (Se è quasi morto, damagePercent è ~1, quindi aggiunge 15 di forza alla spinta)
    let extraForce = 15 * damagePercent * Attacker.KnockBack;
    
    let force = baseForce + extraForce;
    
    // 4. Applichiamo la direzione
    if (Attacker.Direction.left) {
        gotHit.velocity.x -= force;
    } 
    else if (Attacker.Direction.right) {
        gotHit.velocity.x += force;
    }
    
    gotHit.velocity.y -= 6; 
    gotHit.OnGround = false; 
    gotHit.HitStun = 20;
}




function updateCamera() {
    if (!Player1 || Player1.Dead) return;

    // Nemici "in gioco" per la camera = solo quelli entro un certo raggio da Player1.
    // Un nemico vivo ma lontano (livello ancora da esplorare) non deve più
    // tirare la camera via dal giocatore principale.
    const CAMERA_ENGAGE_RANGE = 1200; // px — regola in base al tuo level design

    const playerCenterX = Player1.position.x + Player1.size.x / 2;
    const playerCenterY = Player1.position.y + Player1.size.y / 2;

    const enemies = g.Fighters.filter(f => {
        if (f === Player1 || f.Dead) return false;
        const dx = (f.position.x + f.size.x / 2) - playerCenterX;
        const dy = (f.position.y + f.size.y / 2) - playerCenterY;
        return (dx * dx + dy * dy) < CAMERA_ENGAGE_RANGE * CAMERA_ENGAGE_RANGE;
    });

    let targetX = playerCenterX;
    let targetY = Player1.position.y - 100;
    let targetZoom = 1;

    // --- MODALITÀ BATTAGLIA (nemici vicini e vivi) ---
    if (enemies.length > 0) {
        let minX = targetX;
        let maxX = targetX;

        enemies.forEach(mob => {
            const mobX = mob.position.x + mob.size.x / 2;
            if (mobX < minX) minX = mobX;
            if (mobX > maxX) maxX = mobX;
        });

        targetX = (minX + maxX) / 2;
        const spread = maxX - minX;

        targetZoom = g.canvas.width / (spread + 1400);
        if (targetZoom < 0.6) targetZoom = 0.6;
        if (targetZoom > 1.0) targetZoom = 1.7;
    }
    else {
        const lookAheadOffset = Player1.Direction.right ? 150 : -150;
        targetX = playerCenterX + lookAheadOffset;
        targetZoom = 0.9;
    }

    if (!g.Camera.camera.initialized) {
        g.Camera.camera.x = targetX;
        g.Camera.camera.y = targetY;
        g.Camera.camera.zoom = targetZoom;
        g.Camera.camera.initialized = true;
    }

    const WORLD_WIDTH = g.MAX_WIDTH;
    const WORLD_HEIGHT = g.MAX_HEIGHT;

    const halfViewWidth = (g.canvas.width / 2) / g.Camera.camera.zoom;
    const halfViewHeight = (g.canvas.height / 2) / g.Camera.camera.zoom;

    if (halfViewWidth * 2 >= WORLD_WIDTH) {
        targetX = WORLD_WIDTH / 2;
    } else {
        if (targetX - halfViewWidth < 0) targetX = halfViewWidth;
        if (targetX + halfViewWidth > WORLD_WIDTH) targetX = WORLD_WIDTH - halfViewWidth;
    }

    if (halfViewHeight * 2 >= WORLD_HEIGHT) {
        targetY = WORLD_HEIGHT / 1.5;
    } else {
        if (targetY - halfViewHeight < 0) targetY = halfViewHeight;
        if (targetY + halfViewHeight > WORLD_HEIGHT) targetY = WORLD_HEIGHT - halfViewHeight;
    }

    const smooth = 0.04;
    g.Camera.camera.x += (targetX - g.Camera.camera.x) * smooth;
    g.Camera.camera.y += (targetY - g.Camera.camera.y) * smooth;
    g.Camera.camera.zoom += (targetZoom - g.Camera.camera.zoom) * smooth;
}
function RandomOffsetVFX(player){
    return {
        x : Math.random()*player.size.x,
        y : -Math.random()*player.size.y/8
    }
}
function RandomVelocityVFX(direction){
    return {
        x: (Math.random() * 2 )* (-direction),
        y:(Math.random()* 5 * Math.random())-0.5    
    }
}
function Only3(str){
    if (!str || typeof str !== 'string') return ''; //invalid input
    
    if (str.length <= 3){
        return str;
    }
    else {
        return str.substring(0, 3);
    }
}

function IncrementEnemies(ids){
    if (g.roundEnded) return;
    const Player = Fighter.createFighters(ids);
    g.Pointers.push(FloatingPointers.createPointers(Player));
    g.Fighters.push(Player);
}
function DropPotions() {
    const randomValue = Math.random();
    const NewMask = Mask.CreateMask(randomValue);
   
    NewMask.Placed = true;
    g.Potions.push(NewMask);
}

function RoomHandler(){
    const newVal = getDifficultyScaling();

    // --- 1. COSTRUZIONE ARENA RANDOM ---
    const randomMappa = Math.floor(Math.random() * ArenaLayouts.length);
    const layoutScelto = ArenaLayouts[randomMappa];

    g.Platforms = []; 
    layoutScelto.forEach(p => {
        // NOTA: Se usi una classe specifica per le piattaforme (es. new Sprite), mettila qui al posto di questo oggetto
        g.Platforms.push({
            position: { x: p.x, y: p.y },
            size: { x: p.w, y: p.h },
            color: p.color,
            imageSrc: undefined, 
            scale: 1, 
            offset: {x: 0, y: 0},
            Draw() {
                c.fillStyle = this.color;
                c.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
            }
        });
    });

    // --- 2. PULIZIA CADAVERI E PROIETTILI ---
    g.Bullets = []; 
    g.Fighters = g.Fighters.filter(f => f.Player === 1); 
    if (g.Pointers) g.Pointers = g.Pointers.filter(p => !p.isMob); 
    g.VisualEffects = []; 

    // --- 3. SPAWNING NEMICI INTELLIGENTE ---
    for (let i = 0 ; i < newVal.enemyCount ; i++){
        let enemyType = Math.floor(Math.random() * 3) + 2;
        let enemy = Fighter.createFighters(enemyType);
    
        // Buff statistiche
        let baseHealth = enemy.MaxHealthPoints || enemy.HealthPoints;
        enemy.MaxHealthPoints = Math.floor(baseHealth * newVal.hpMult);
        enemy.HealthPoints = enemy.MaxHealthPoints;
        enemy.Damage = Math.floor(enemy.Damage * newVal.dmgMult);
        
        // SMART SPAWN: Se è un cecchino e ci sono piattaforme (oltre al pavimento) lo mettiamo in alto!
        if (enemy.type === "BigAhhLauncher" && g.Platforms.length > 1) {
            // Sceglie una piattaforma a caso (ignorando il pavimento all'indice 0)
            let randomPlatIndex = Math.floor(Math.random() * (g.Platforms.length - 1)) + 1;
            let target = g.Platforms[randomPlatIndex];
            
            // Lo teletrasporta esattamente sopra
            enemy.position.x = target.position.x + (target.size.x / 2) - (enemy.size.x / 2);
            enemy.position.y = target.position.y - enemy.size.y;
        }

        g.Pointers.push(FloatingPointers.createPointers(enemy));
        g.Fighters.push(enemy);
    }
    
    
    g.RoomHandler = 'FIGHTING';
    console.log("Round:", g.difficulty, "- Generata Mappa:", randomMappa);
    g.P1DOM.textContent= g.difficulty;
}
// In util.js o tra le tue funzioni globali
function getDifficultyScaling() {
    const d = g.difficulty;
    return {
        // Quanti nemici spawnare in totale per questa stanza
        enemyCount: 2 + Math.floor(d * 1.5), 
        
        // Moltiplicatori di statistiche
        hpMult: 1 + (d - 1) * 0.20,    // +20% HP a stanza
        dmgMult: 1 + (d - 1) * 0.15,   // +15% Danno a stanza
        
        // Possibilità che spawni un Launcher o un nemico forte
        launcherChance: Math.min(0.1 + (d * 0.05), 0.6) // max 60%
    };
}