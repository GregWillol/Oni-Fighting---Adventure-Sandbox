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
        case g.MaskRandomTime: 
            TriggerAnnouncement(g.maskTitle,true);
            if(typeof Mask1 !== 'undefined') Mask1.Placed = true;
            break;
    }
}




function ReduceAddHP(player){

    
    if (player.HealthPoints <=0) {
        player.HealthPoints = 0;
        player.Dead = true;

    }
    if (player.isAI || player.Player > 2) return;
    
    // - - - DOM - - -
    const HealthBar = document.getElementById("P"+player.Player+"HP")
    if (player.HealthPoints>=100) player.HealthPoints= 100;
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
    player.staminaBar = 0 ;
    if (player.staminaTimer<= 0) {
        player.staminaTimer = 300;
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

function CheckVictory({player1, player2, timerId}) {
    if (g.roundEnded) return;

    let winner = null;

    if (player1.HealthPoints <= 0) {
        winner = "P2";
    } 
    else if (player2.HealthPoints <= 0) {
        winner = "P1";
    }
    if (g.timer === 0) {
        if (player1.HealthPoints > player2.HealthPoints) {
            winner = "P1";
        } else if (player1.HealthPoints < player2.HealthPoints) {
            winner = "P2";
        } else {
            winner = "TIE";
        }
    }
    if (winner) {     
        g.roundEnded= true;
        clearInterval(timerId);
        if (winner === "P1") {
            Player2.Dead = true;  
            Player2.death();      
            
            TriggerAnnouncement((window.P1_NAME || "P1") + " WINS !!!",true);
            SaveStatistics(window.P1_ID, true, player2.HealthPoints);
            SaveStatistics(window.P2_ID, false, player1.HealthPoints);
        } 
        else if (winner === "P2") {
            Player1.Dead = true;  
            Player1.death();    
            const nomeP2 = window.P2_NAME || "P2";
            TriggerAnnouncement(nomeP2 + " WINS !!!",true);
            SaveStatistics(window.P1_ID, false, player2.HealthPoints);
            SaveStatistics(window.P2_ID, true, player1.HealthPoints);
        } 
        else {
            Player1.Dead = true;
            Player1.death();
            Player2.Dead = true;
            Player2.death();
            TriggerAnnouncement("TIE");
        }
        // Death animation need to play
        /*setTimeout(() => {
            g.GameOver = true;
            //console.log("Redirect index.php")
            window.location.replace("index.php") 
        }, 4000);   */
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
            DISAPPEAR : {text : "", color : "orange", offset :{x: player.size.x, y:player.size.y/2},velocity : {x:0 , y: 0},count : 20},};
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
        if (typo === "JUMP" || typo === "DASH" || typo === "DAM" || typo === "DISAPPEAR"){
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


function ApplyKnockback(gotHit,Attacker){
    let force = Attacker.Damage + ( (100 - gotHit.HealthPoints) * 0.8 )*Attacker.KnockBack;
    if (Attacker.Direction.left){
        gotHit.velocity.x -=force;
    }
    else if (Attacker.Direction.right){
        gotHit.velocity.x +=force;
    }
    gotHit.velocity.y -=6; 
    gotHit.OnGround = false; 
    gotHit.HitStun = 20 ;
}




function updateCamera() {
    const activeFighters = g.Fighters.filter(f => f && !f.Dead);
    if (activeFighters.length === 0) return;

    let minX = Infinity, maxX = -Infinity;

    activeFighters.forEach(f => {
        const centerX = f.position.x + f.size.x / 2;
        if (centerX < minX) minX = centerX;
        if (centerX > maxX) maxX = centerX;
    });

    const midX = (minX + maxX) / 2;
    const distMapX = maxX - minX;

    // 1. Zoom più morbido e con un limite massimo più prudente (1000 -> 1200 per allargare un po')
    let targetZoom = g.MAX_WIDTH / (distMapX + 1200); 
    if (targetZoom < 0.75) targetZoom = 0.75;
    if (targetZoom > 0.95) targetZoom = 0.95; // Un pelo meno zoomato da vicino per stabilizzare
    if (!g.Camera.camera.zoom) g.Camera.camera.zoom = 1;

    // 2. Usiamo uno smoothing fisso più lento (es. 0.04) per ammorbidire gli scatti
    const smooth = 0.04; 

    g.Camera.camera.zoom += (targetZoom - g.Camera.camera.zoom) * smooth;
    g.Camera.camera.x += (midX - g.Camera.camera.x) * smooth;
    
    // 3. Fissiamo l'asse Y a una quota fissa (altezza dello stage/2) invece di farla saltare con i bot
    g.Camera.camera.y = g.MAX_HEIGHT / 2 + 100; // Aumenta +100 o +150 per abbassare l'inquadratura
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