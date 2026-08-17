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




function ReduceAddHP(player){
    if (player.HealthPoints <=0) {
        player.HealthPoints = 0;
    }
    else if (player.Player !== 1 && player.HealthPoints>=100) player.HealthPoints=100;

    
    if (player.isAI || player.Player > 2) return;
    
    // - - - DOM - - -
    const HealthBar = document.getElementById("P"+player.Player+"HP")
    if (player.HealthPoints>=player.MaxHealthPoints) player.HealthPoints= player.MaxHealthPoints;
        HealthBar.style.width=player.HealthPoints+"%" 
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
            HP : {text : "+HP", color :"#8f00ff",offset : {x:player.size.x,y:player.size.y},velocity : {x: 0, y:-0.5}, count : 1},
            DEF : {text : "BLOCKED", color : "#6d8df5ff",offset : {x:player.size.x,y:player.size.y},velocity : {x: 0, y:-0.5},count : 1},
            MASK : {text : "鬼" , color : player.Player === 1 ? "#FF3126" : "#8f00ff",offset : {x:0,y:player.size.y},velocity : {x: 0, y:-0.5}, count :1},
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

    const enemies = g.Fighters.filter(f => f !== Player1 && !f.Dead);

    let targetX = Player1.position.x + Player1.size.x / 2;
    // 1. IL TARGET Y ORA SEGUE IL GIOCATORE (spostato un po' in su per farti vedere cosa cade dal cielo)
    let targetY = Player1.position.y - 100; 
    let targetZoom = 1;

    // --- MODALITÀ BATTAGLIA (Nemici Vivi) ---
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
        if (targetZoom > 1.0) targetZoom = 1.0;     
    }
    else {
        const lookAheadOffset = Player1.Direction.right ? 150 : -150;
        targetX = Player1.position.x + Player1.size.x / 2 + lookAheadOffset;
        targetZoom = 0.9; 
    }

    // 2. SMOOTHING "SNAPPY" (Ora anche per la Y)
    const smooth = 0.04; 

    if (!g.Camera.camera.x) g.Camera.camera.x = targetX;
    if (!g.Camera.camera.y) g.Camera.camera.y = targetY; // Inizializza Y
    if (!g.Camera.camera.zoom) g.Camera.camera.zoom = targetZoom;

    g.Camera.camera.x += (targetX - g.Camera.camera.x) * smooth;
    g.Camera.camera.y += (targetY - g.Camera.camera.y) * smooth; // Smoothing verticale
    g.Camera.camera.zoom += (targetZoom - g.Camera.camera.zoom) * smooth;

    // 3. LIMITI DELLA MAPPA (Clamping a prova di bomba X e Y)
    const WORLD_WIDTH = g.MAX_WIDTH; 
    const WORLD_HEIGHT = g.MAX_HEIGHT; // Prendiamo l'altezza del mondo

    const halfViewWidth = (g.canvas.width / 2) / g.Camera.camera.zoom;
    const halfViewHeight = (g.canvas.height / 2) / g.Camera.camera.zoom; // Calcoliamo metà schermo verticale

    // --- CLAMPING ASSE X ---
    if (halfViewWidth * 2 >= WORLD_WIDTH) {
        g.Camera.camera.x = WORLD_WIDTH / 2; 
    } 
    else {
        if (g.Camera.camera.x - halfViewWidth < 0) g.Camera.camera.x = halfViewWidth; 
        if (g.Camera.camera.x + halfViewWidth > WORLD_WIDTH) g.Camera.camera.x = WORLD_WIDTH - halfViewWidth; 
    }

    // --- CLAMPING ASSE Y (La novità!) ---
    if (halfViewHeight * 2 >= WORLD_HEIGHT) {
        g.Camera.camera.y = WORLD_HEIGHT / 2; // Se lo zoom inquadra tutto, centrati
    } 
    else {
        if (g.Camera.camera.y - halfViewHeight < 0) {
            g.Camera.camera.y = halfViewHeight; // Non far vedere il vuoto sopra il soffitto
        }
        if (g.Camera.camera.y + halfViewHeight > WORLD_HEIGHT) {
            g.Camera.camera.y = WORLD_HEIGHT - halfViewHeight; // Non far vedere il vuoto sotto il pavimento
        }
    }
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

    // spawning enemies 
    for (let i = 0 ; i < newVal.enemyCount ; i++){
        let enemyType = Math.floor(Math.random() * 3) + 2;
        let enemy = Fighter.createFighters(enemyType)
    
        //new buffs
        enemy.MaxHealthPoints = Math.floor(enemy.MaxHealthPoints * newVal.hpMult);
        enemy.HealthPoints = enemy.MaxHealthPoints;
        enemy.Damage = Math.floor(enemy.Damage * newVal.dmgMult);
        //spawning pointers and pushing new Enemy 
        g.Pointers.push(FloatingPointers.createPointers(enemy));
        g.Fighters.push(enemy);
    }
    g.RoomHandler = 'FIGHTING';
    console.log("check flags:")
    console.log(g.FlagFight)
    console.log(g.FlagGame)
    console.log(g.roundEnded)
    


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