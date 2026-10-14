class GameContext {
    constructor() {
        // - - - DOM & UI REFERENCES - - -
        this.canvas = document.getElementById("Game");
        this.c = this.canvas.getContext("2d", { alpha: false }); // Optimization: disables transparency on backbuffer
        this.Timer = document.getElementById("Timer");
        this.P2HP = document.getElementById("P2HP");
        this.P1HP = document.getElementById("P1HP");
        this.Announcement = document.getElementById("Announcement");
        this.P1DOM = document.getElementById('P1');
        this.P2DOM = document.getElementById('P2');
        this.PressToStart = document.getElementById('press-to-start');
        this.PerksContainer = document.getElementById('perks');
        this.PerksChoosingContainer = document.getElementById('choosing-perks');
        this.maskTitle = null;

        // - - - MOBILE PERFORMANCE DETECTION - - -
        this.isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) ||
                        (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
                        window.innerWidth <= 1024;
        // Lower internal canvas resolution on mobile by 44% to prevent iPhone GPU overheating
        if (this.isMobile && this.canvas) {
            this.canvas.width = 960;
            this.canvas.height = 540;
        }

        // - - - CAMERA SETTINGS - - -
        this.Camera = {
            camera: {
                x: 0,
                y: 0,
                zoom: 1,
                initialized: false
            },
            MAX_ZOOM: 1.0,
            MIN_ZOOM: 0.52,
            PADDING: 200,
            SMOOTHING: 0.06
        };

        // - - - GAME FLAGS - - -
        this.roundEnded = false;
        this.FlagGame = true;
        this.GameOver = false;
        this.FlagFight = false;

        // - - - TIMER - - -
        this.timer = 94;
        this.TimerIntervalId = null;
        this.MaskRandomTime = Math.floor(Math.random() * 20 + 30);

        // - - - OPEN WORLD DIMENSIONS - - -
        this.isOpenWorld = true;
        this.MAX_WIDTH = 9000;
        this.MAX_HEIGHT = 2200;
        this.Gravity_Acceleration = 0.90;

        // - - - WORLD ENTITIES & POOLS - - -
        this.Platforms = [];
        this.VisualEffects = [];
        this.TextPool = [];      // Pre-allocated pool for FloatingText to avoid GC lag
        this.SpriteEffects = []; // Animated Sprite VFX for Perks
        this.SoulOrbs = [];      // Homing orbs for Soul Collector
        this.WorldObjects = [];  // Open World Shrines, Chests & Geysers
        this.BlueOrbs = [];      // Special Blue Jump Orbs to stomp the Skull Boss!
        this.Background = null;

        // - - - PLAYERS STATS - - -
        this.Fighter1Width = 80;
        this.Fighter1Height = 130;
        this.Fighter2Width = 100;
        this.Fighter2Height = 120;
        this.StandardAttBoxWid = 100;
        this.HitHeight = 30;
        this.isPerked = false;

        // - - - STARTING POSITIONS - - -
        this.StartingPositionP1 = { x: 600, y: this.MAX_HEIGHT - 800 };
        this.StartingPositionP2 = { x: 1800, y: this.MAX_HEIGHT - 800 };

        // - - - PLAYER NAMES - - -
        this.Fighter1Name = "";
        this.Fighter2Name = "";

        // - - - ARRAYS - - -
        this.Pointers = [];
        this.Bullets = [];
        this.Fighters = [];
        this.PowerUps = [];

        // - - - RUNTIME STATE - - -
        this.lastTime = 0;
        this.isAdventure = true;
        this.StopFrames = 0;
        this.hitStopFrames = 0;
        this.cameraShake = 0;
        this.currentBiome = "KING'S PASS";
        this.difficulty = 1;
        this.roomState = 'FIGHTING';
    }

    loadMap(id) {
        const data = MAP_CONFIG[id] || MAP_CONFIG[1];
        this.Background = new Sprite({
            size: { x: this.MAX_WIDTH, y: this.MAX_HEIGHT },
            imageSrc: data.background.link,
            framesMax: data.background.framesMax,
            scale: data.background.scale,
            offset: data.background.offset,
            color: null // Null so procedural parallax shows if image is transparent or missing
        });
        this.Platforms = data.Platforms.map(p => {
            return new Platform({
                position: { x: p.position.x, y: p.position.y },
                size: { x: p.size.x, y: p.size.y },
                imageSrc: p.imageSrc,
                scale: p.scale,
                offset: p.offset,
                color: p.color
            });
        });
        if (data.StartPos) {
            this.StartingPositionP1 = data.StartPos.p1;
            this.StartingPositionP2 = data.StartPos.p2;
        }
    }

    loadMode(id) {
        this.isOpenWorld = (id !== 2);
        this.MAX_WIDTH = this.isOpenWorld ? 9000 : 3000;
    }

    loadNames() {
        const Name1 = localStorage.getItem("player1_name");
        const Name2 = localStorage.getItem("player2_name");
        if (Name1 !== null) this.Fighter1Name = Only3(Name1);
        if (Name2 !== null) this.Fighter2Name = Only3(Name2);

        if (this.P1DOM) this.P1DOM.textContent = this.Fighter1Name;
        if (this.P2DOM) this.P2DOM.textContent = this.Fighter2Name;

        if (this.Pointers.length >= 2) {
            this.Pointers[0].text = this.Fighter1Name;
            this.Pointers[1].text = this.Fighter2Name;
        }
    }

    cameraMovement() {
        // 1. Draw procedural parallax background in screen space first (super fast on mobile)
        DrawParallaxBackground();

        // 2. Enter world camera space
        c.save();
        c.translate(this.canvas.width / 2, this.canvas.height / 2);
        c.scale(this.Camera.camera.zoom, this.Camera.camera.zoom);
        c.translate(-this.Camera.camera.x, -this.Camera.camera.y);

        // 3. Draw user's background sprite if loaded
        if (this.Background && this.Background.hasValidImage()) {
            this.Background.update(1);
        }
    }

    startTimer() {
        const isFirstWave = (this.difficulty === 1 && this.Fighters.length <= 1);
        RoomHandler();
        if (this.TimerIntervalId) clearInterval(this.TimerIntervalId);
        this.timer = this.isOpenWorld ? 93 : 63;
        g.FlagFight = false;
        g.roundEnded = false;

        if (!this.isOpenWorld || isFirstWave) {
            Player1.position.x = g.StartingPositionP1.x;
            Player1.position.y = g.StartingPositionP1.y;
            Player1.Direction.right = true;
            Player1.Direction.left = false;
        }
        this.TimerIntervalId = setInterval(reduceTimer, 1000);
    }

    startShop() {
        ShowPerks();
    }
}

const g = new GameContext();
const c = g.c;
const StandardAttBoxWid = g.StandardAttBoxWid;
const AI = true;