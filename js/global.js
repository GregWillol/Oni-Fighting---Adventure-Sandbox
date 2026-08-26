class GameContext {
    constructor(){
        // - - - DOM & UI - - -
        this.canvas =document.getElementById("Game")
        this.c = this.canvas.getContext("2d")
        this.Timer = document.getElementById("Timer")
        this.P2HP = document.getElementById("P2HP")
        this.P1HP = document.getElementById("P1HP")
        this.Announcement = document.getElementById("Announcement")
        this.P1DOM = document.getElementById('P1')
        this.P2DOM =document.getElementById('P2')
        this.PressToStart = document.getElementById('press-to-start');
        this.PerksContainer = document.getElementById('perks');
        this.PerksChoosingContainer = document.getElementById('choosing-perks');
        this.maskTitle = null ; 

        // - - - CAMERA - - -
        this.Camera = {
            camera : {
                x: 0 , 
                y: 0 ,
                zoom : 1 
            },
            MAX_ZOOM :  0.9,
            MIN_ZOOM : 0.5,
            PADDING : 200,
            SMOOTHING :0.05,
            
        }

        // - - - GAME FLAGS - - -
        this.roundEnded = false;
        this.FlagGame = true;
        this.GameOver = false;
        this.FlagFight = false;

        // - - - TIMER - - -
        this.timer = 64 ;
        this.TimerIntervalId = null;
        // this permits that the mask can drop randomly every game from 30 seconds to 50 seconds
        this.MaskRandomTime = Math.floor(Math.random()*20 +30);
        

        // - - - GAME/AMBIENT - - -
        this.MAX_WIDTH = 3000; 
        this.MAX_HEIGHT= 2000;
        this.Gravity_Acceleration = 0.90; 

        // - - - MAP SETTINGS - - -
        this.Platforms = [];
        this.VisualEffects=[];
        this.Background = null;
        
        // - - - PLAYERS STATS - - -
        this.Fighter1Width = 80;
        this.Fighter1Height = 130;
        this.Fighter2Width = 100;
        this.Fighter2Height = 120;
        this.StandardAttBoxWid = 100;
        this.HitHeight = 30 ; 
        this.isPerked = false;

         // - - - PLAYER MAP POSITION - - -
        this.StartingPositionP1 = {x: 0 , y: 0};  
        this.StartingPositionP2 = {x:this.MAX_WIDTH-this.Fighter2Width, y: 0}; 

        // - - - PLAYER NAMES - - -
        this.Fighter1Name = "";
        this.Fighter2Name = "";

        //- - - PLAYER POINTERS / BULLETS / ENEMIES     - - - 
        this.Pointers = [];
        this.Bullets = [];
        this.Fighters = [];
        this.PowerUps = [];


        //- - - GENERAL PURPOSES - - - 
        this.lastTime = 0;
        this.isAdventure = false;
        this.StopFrames = 0;
        this.cameraShake = 0 ;


        // - - - ROOM STATS - - -
        this.difficulty = 1; 
        this.roomState = 'FIGHTING';



        
    }
    loadMap(id){
        const data = MAP_CONFIG[id]; 
        this.Background = new Sprite ({
            size : {
                x : this.MAX_WIDTH,
                y: this.MAX_HEIGHT
            },
            imageSrc : data.background.link,
            framesMax : data.background.framesMax,
            scale : data.background.scale, 
            offset : data.background.offset,
            color : "black"
        }) 
        this.Platforms =data.Platforms.map(p=>{
            return new Platform({
                position: {x: p.position.x, y: p.position.y},
                size : {x: p.size.x, y : p.size.y},
                imageSrc : p.imageSrc,
                scale : p.scale,
                offset : p.offset,
                color : p.color
            })
        })
        if (data.StartPos){
            this.StartingPositionP1=data.StartPos.p1
            this.StartingPositionP2=data.StartPos.p2
        }
    }   
    loadMode(id){
        //missing something
    }  
    loadNames(){
        const Name1 = localStorage.getItem("player1_name")
        const Name2 = localStorage.getItem("player2_name")
        if (Name1 !== null) this.Fighter1Name = Only3(Name1)
        if (Name2 !== null) this.Fighter2Name = Only3(Name2)
        
        this.P1DOM.textContent = this.Fighter1Name
        this.P2DOM.textContent = this.Fighter2Name

        if (this.Pointers.length >= 2) {
        this.Pointers[0].text = this.Fighter1Name; 
        this.Pointers[1].text = this.Fighter2Name; 
        }
    } 
    cameraMovement() {
        c.save();
        
        // 1. Usa le dimensioni VERE dello schermo (canvas.width), non quelle della mappa!
        c.translate(this.canvas.width / 2, this.canvas.height / 2);
        
        // 2. Applica lo Zoom
        c.scale(this.Camera.camera.zoom, this.Camera.camera.zoom);
        
        // 3. Sposta il mondo sulle coordinate calcolate della Camera
        c.translate(-this.Camera.camera.x, -this.Camera.camera.y);
        
        // 4. Disegna lo sfondo
        if (this.Background) this.Background.update();
    }
    startTimer(){
        RoomHandler();
        if (this.TimerIntervalId) clearInterval(this.TimerIntervalId);
        this.timer = 63
        g.FlagFight = false;
        g.roundEnded = false;
        Player1.position.x = g.StartingPositionP1.x;
        Player1.position.y = g.StartingPositionP1.y;
        Player1.Direction.right = true;
        Player1.Direction.left= false;
        this.TimerIntervalId= setInterval(reduceTimer,1000)

    }
    startCountdown(){
        if (this.TimerIntervalId) clearInterval(this.TimerIntervalId);
        this.timer = 10;
        this.TimerIntervalId= setInterval(reduceTimer,1000)
        // Da mettere dove decidi di far finire l'ondata
        let centerX = g.MAX_WIDTH / 2;
        
        ShowPerks();
    }
    
}
const g = new GameContext();
const c = g.c;
//const AI = localStorage.getItem("player2_name") === "CPU" ? true : false;
const AI = true;



