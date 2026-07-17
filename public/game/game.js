(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const game = document.getElementById("game");
  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");
  const soundButton = document.getElementById("soundButton");
  const attackButton = document.getElementById("attackButton");
  const abandonTaskButton = document.getElementById("abandonTaskButton");

  const W = 450;
  const H = 800;
  const MAP_W = 1600;
  const WORLD_W = MAP_W;
  const GROUND_Y = 748;
  const GRAVITY = 2150;
  const MOVE_SPEED = 250;
  const JUMP_SPEED = 1050;
  const CLIMB_SPEED = 190;
  const AQUARIUM_SWIM_SPEED = 205;
  const AQUARIUM_SURFACE_Y = 185;
  const AQUARIUM_TOP_Y = 277;
  const AQUARIUM_BOTTOM_Y = 684;
  const MUSIC_MASTER_GAIN = 0.72;
  const MUSIC_DUCKED_GAIN = 0.2;
  const MOSES_PROXIMITY = 125;
  const VIVIAN_PROXIMITY = 125;
  const ELIM_PROXIMITY = 125;
  const PETER_PROXIMITY = 125;
  const FU_SIEN_PROXIMITY = 125;
  const KATE_PROXIMITY = 125;
  const DIALOGUE_MIN_VISIBLE_MS = 1000;
  const CRAB_PROXIMITY = 145;
  const CRAB_MAX_HP = 3;
  const CRAB_ESCAPE_DURATION = 1300;
  const MISSION_COMPLETE_DURATION = 2000;
  const PARK_CHAMPION_BANNER_DURATION = 2000;
  const PARK_CHAMPION_CAMERA_X = 885;
  const PARK_CHAMPION_GROUND_Y = 748;
  const GUZHENG_STRING_COUNT = 21;
  const GUZHENG_STRING_LEFT = 105;
  const GUZHENG_STRING_SPACING = 12;
  const GUZHENG_STRING_TOP = 139;
  const GUZHENG_STRING_BOTTOM = 681;
  const GUZHENG_MIDI = [86, 83, 81, 78, 76, 74, 71, 69, 66, 64, 62, 59, 57, 54, 52, 50, 47, 45, 42, 40, 38];
  const PICNIC_POT = { x: 225, y: 250, radiusX: 142, radiusY: 142 };
  const PICNIC_BIN = { x: 324, y: 610, width: 106, height: 142 };
  const PETER_DIALOGUE_LINES = [
    "我春、夏、秋、冬都吃火鍋，對於食材的烹煮時間是有要求的",
    "聽好遊戲規則，待會遊戲中是沒有新手指引的",
    "肉片煮1秒就好，蝦子煮2秒",
    "白蘿蔔、玉米要煮3秒",
    "地瓜葉不是媽媽煮的，我不吃，請丟垃圾桶",
  ];
  const FU_SIEN_DIALOGUE_LINES = [
    "跟你說明一下，目前9局下半，比數8:7，我們領先1分",
    "2人出局、無人上壘，我們要抓最後1個出局數",
    "但我們的投手要回家去看世界盃了，我的天啊！有夠雷！",
    "你能投球嗎？我會告訴你要怎麼投，相信我！",
  ];
  const KATE_DIALOGUE_LINES = [
    "我要去洗澡了",
    "等等！你能陪我去打火蘑菇嗎？",
  ];
  const KATE_MOVE_SPEED = MOVE_SPEED * 1.5;
  const KATE_TASK_PROXIMITY = 135;
  const KATE_SPEECH_DURATION = 2000;
  const KATE_BRIDGE_ROUTE = [
    { x: 600, y: 420 },
    { x: 520, y: 350 },
    { x: 430, y: 418 },
    { x: 410, y: 526 },
    { x: 410, y: 743 },
    { x: 135, y: 743 },
  ];
  const KATE_TREE_ROUTE = [{ x: 1470, y: 743 }];
  const FIRE_MUSHROOM_MAX_HP = 3;
  const FIRE_MUSHROOM_PROXIMITY = 155;
  const FIRE_MUSHROOM_SPEED = 16;
  const FIRE_MUSHROOM_STOP_X = 1080;
  const FIRE_MUSHROOM_SPAWN_X = 1370;
  const FIRE_MUSHROOM_GROUND_Y = 743;
  const FIRE_MUSHROOM_HURT_DURATION = 500;
  const FIRE_MUSHROOM_SINK_DURATION = 900;
  const BASEBALL_GRID = { x: 75, y: 160, size: 300, cell: 100 };
  const BASEBALL_TARGET_ZONES = [
    [0, 1, 3],
    [1, 2, 5],
    [3, 6, 7],
    [5, 7, 8],
  ];
  const BASEBALL_INTRO_DELAY = 2000;
  const BASEBALL_WALK_DURATION = 1000;
  const BASEBALL_PITCH_DURATION = 650;
  const BASEBALL_STRIKE_DURATION = 2000;
  const BASEBALL_MAX_STRIKES = 3;
  // Shared art contract for every NPC added from now onward.
  const NPC_SPRITE_W = 180;
  const NPC_SPRITE_H = 192;
  const NPC_FOOT_OFFSET = 188;
  const NPC_VISIBLE_HEIGHT = 161;
  const NPC_UI_COLORS = {
    Moses: { dark: "#173b68", panel: "#edf6ff", accent: "#5d91c9", text: "#173653", soft: "#b9d8f2" },
    Vivian: { dark: "#559fc4", panel: "#eefaff", accent: "#9bd8ee", text: "#28586f", soft: "#ccecf8" },
    Peter: { dark: "#171a1f", panel: "#f4f5f6", accent: "#5d636c", text: "#171a1f", soft: "#c8ccd1" },
    Kate: { dark: "#28663d", panel: "#eff9e9", accent: "#75b86c", text: "#214f31", soft: "#bfe0b8" },
    Elim: { dark: "#8b6949", panel: "#fff8df", accent: "#d9bd91", text: "#65482e", soft: "#ead8b9" },
    Rollins: { dark: "#b85b21", panel: "#fff3de", accent: "#eda65f", text: "#7b361a", soft: "#f3c58f" },
  };

  ctx.imageSmoothingEnabled = false;

  const background = new Image();
  background.src = "../assets/park-background.png";
  const aquariumBackground = new Image();
  aquariumBackground.src = "../assets/aquarium-background.png";
  const badCrabSprite = new Image();
  badCrabSprite.src = "../assets/bad-crab-npc.png";
  const badCrabHurtSprite = new Image();
  badCrabHurtSprite.src = "../assets/bad-crab-hurt.png";
  const guzhengBody = new Image();
  guzhengBody.src = "../assets/guzheng-body.png";
  const picnicMap = new Image();
  picnicMap.src = "../assets/picnic-map.png";
  const picnicMeat = new Image();
  picnicMeat.src = "../assets/picnic-ingredient-meat.png";
  const picnicSweetPotatoLeaves = new Image();
  picnicSweetPotatoLeaves.src = "../assets/picnic-ingredient-sweet-potato-leaves.png";
  const picnicShrimp = new Image();
  picnicShrimp.src = "../assets/picnic-ingredient-shrimp.png";
  const picnicDaikon = new Image();
  picnicDaikon.src = "../assets/picnic-ingredient-daikon.png";
  const picnicCorn = new Image();
  picnicCorn.src = "../assets/picnic-ingredient-corn.png";
  const baseballFieldMap = new Image();
  baseballFieldMap.src = "../assets/baseball-field-map.png";
  const davidPitcherSprite = new Image();
  davidPitcherSprite.src = "../assets/david-pitcher.png";
  const fuSienCatcherSprite = new Image();
  fuSienCatcherSprite.src = "../assets/rollins-catcher.png";
  const davidSprite = new Image();
  davidSprite.src = "../assets/david-sprite-hd.png";
  const davidAttackSprite = new Image();
  davidAttackSprite.src = "../assets/david-attack-throw.png";
  const mosesSprite = new Image();
  mosesSprite.src = "../assets/moses-npc.png";
  const vivianSprite = new Image();
  vivianSprite.src = "../assets/vivian-npc.png";
  const elimSprite = new Image();
  elimSprite.src = "../assets/elim-npc.png";
  const peterSprite = new Image();
  peterSprite.src = "../assets/peter-npc.png";
  const fuSienSprite = new Image();
  fuSienSprite.src = "../assets/rollins-npc.png";
  const kateSprite = new Image();
  kateSprite.src = "../assets/kate-npc.png";
  const fireMushroomSprite = new Image();
  fireMushroomSprite.src = "../assets/fire-mushroom-npc.png";
  const fireMushroomHurtSprite = new Image();
  fireMushroomHurtSprite.src = "../assets/fire-mushroom-hurt.png";

  // Each ingredient is its own layer so the cooking phase can move it independently.
  const picnicIngredients = [
    { id: "meat", image: picnicMeat, homeX: 86, homeY: 378, x: 86, y: 378, size: 102, minCookMs: 500, maxCookMs: 1500, processed: false },
    { id: "sweet-potato-leaves", image: picnicSweetPotatoLeaves, homeX: 253, homeY: 378, x: 253, y: 378, size: 102, trashOnly: true, processed: false },
    { id: "shrimp", image: picnicShrimp, homeX: 60, homeY: 514, x: 60, y: 514, size: 84, minCookMs: 1500, maxCookMs: 2500, processed: false },
    { id: "daikon", image: picnicDaikon, homeX: 182, homeY: 514, x: 182, y: 514, size: 84, minCookMs: 2500, maxCookMs: 3500, processed: false },
    { id: "corn", image: picnicCorn, homeX: 300, homeY: 516, x: 300, y: 516, size: 84, minCookMs: 2500, maxCookMs: 3500, processed: false },
  ];

  const player = {
    x: 900,
    y: GROUND_Y,
    previousY: GROUND_Y,
    vx: 0,
    vy: 0,
    facing: 1,
    grounded: true,
    walking: false,
    climbing: false,
    ladder: null,
    ladderDetachUntil: 0,
    attacking: false,
    attackUntil: 0,
  };

  let cameraX = Math.max(0, player.x - W * 0.45);
  let scene = "park";
  let gameStarted = false;
  let lastTime = performance.now();
  let elapsed = 0;
  let touchControlHeld = false;
  let touchDirectionX = 0;
  let touchDirectionY = 0;
  let pointerStart = null;
  let audio = null;
  let musicMuted = false;
  let completedNpcTasks = 0;
  let parkChampionActive = false;
  let parkChampionBannerUntil = 0;
  let mosesTaskCompleted = false;
  let aquariumDialogueActive = false;
  let aquariumDialoguePage = 0;
  let aquariumDialoguePageShownAt = 0;
  let crabPromptVisible = false;
  let crabHp = CRAB_MAX_HP;
  let crabHurtUntil = 0;
  let crabEscapeStartedAt = 0;
  let missionCompleteStartedAt = 0;
  let vivianTaskActive = false;
  let vivianPromptVisible = false;
  let vivianTaskCompleted = false;
  let vivianTaskStartedAt = 0;
  let vivianPlayedNoteCount = 0;
  let vivianDialogueTriggered = false;
  let vivianDialogueActive = false;
  let vivianDialoguePage = 0;
  let vivianDialoguePageShownAt = 0;
  let vivianCompletionReady = false;
  let elimTaskActive = false;
  let elimPromptVisible = false;
  let elimTaskCompleted = false;
  let elimQuestionIndex = 0;
  let elimDialogueActive = false;
  let elimDialogueKind = "wrong";
  let elimDialoguePage = 0;
  let elimDialoguePageShownAt = 0;
  let elimMissionCompleteStartedAt = 0;
  let peterPromptVisible = false;
  let peterTaskActive = false;
  let peterTaskCompleted = false;
  let peterGameStarted = false;
  let peterDialogueActive = false;
  let peterDialogueKind = "intro";
  let peterDialoguePage = 0;
  let peterDialoguePageShownAt = 0;
  let peterMissionCompleteStartedAt = 0;
  let picnicActiveIngredient = null;
  let picnicCookStartedAt = 0;
  let fuSienPromptVisible = false;
  let fuSienTaskActive = false;
  let fuSienTaskCompleted = false;
  let fuSienTaskStartedAt = 0;
  let fuSienStage = "idle";
  let fuSienStageStartedAt = 0;
  let fuSienDialogueActive = false;
  let fuSienDialogueKind = "intro";
  let fuSienDialoguePage = 0;
  let fuSienDialoguePageShownAt = 0;
  let fuSienStrikeCount = 0;
  let fuSienTargetCells = BASEBALL_TARGET_ZONES[0];
  let baseballBallX = BASEBALL_GRID.x + BASEBALL_GRID.size / 2;
  let baseballBallY = BASEBALL_GRID.y + BASEBALL_GRID.size / 2;
  let baseballBallStartX = baseballBallX;
  let baseballBallStartY = baseballBallY;
  let baseballBallTargetX = baseballBallX;
  let baseballBallTargetY = baseballBallY;
  let baseballBallMoveStartedAt = 0;
  let baseballBallMoveDuration = 700;
  let katePromptVisible = false;
  let kateTaskActive = false;
  let kateTaskCompleted = false;
  let kateDialogueActive = false;
  let kateDialoguePage = 0;
  let kateDialoguePageShownAt = 0;
  let kateMoving = false;
  let kateRouteIndex = 0;
  let kateFacing = -1;
  let kateRoute = KATE_BRIDGE_ROUTE;
  let kateStage = "idle";
  let kateSpeechText = "";
  let kateSpeechUntil = 0;
  let fireMushroomSpawned = false;
  let fireMushroomHp = FIRE_MUSHROOM_MAX_HP;
  let fireMushroomHurtUntil = 0;
  let fireMushroomDefeatStartedAt = 0;
  let kateMissionCompleteStartedAt = 0;
  const completedNpcNames = new Set();

  const guzhengPointers = new Map();
  const guzhengStringGlowUntil = Array.from({ length: GUZHENG_STRING_COUNT }, () => 0);

  const keys = new Set();
  const particles = [];
  const leaves = Array.from({ length: 22 }, (_, index) => ({
    x: (index * 173 + 91) % W,
    y: (index * 97 + 40) % 610,
    speed: 5 + (index % 4) * 3,
    drift: index % 2 ? 7 : -6,
    size: 2 + (index % 3),
    phase: index * 0.73,
  }));
  const aquariumBubbles = Array.from({ length: 18 }, (_, index) => ({
    x: 24 + ((index * 83) % 404),
    y: 210 + ((index * 97) % 560),
    speed: 15 + (index % 5) * 7,
    radius: 2 + (index % 3),
    phase: index * 0.61,
  }));

  const elimQuestions = [
    {
      category: "國語",
      question: "下列哪一個成語的意思是「比喻做事沒有恆心，時斷時續」？",
      answers: ["一曝十寒", "珍珠奶茶", "揠苗助長", "杯弓蛇影"],
      correct: 1,
    },
    {
      category: "英語",
      question: "A: _____ are you going to do this weekend?\nB: I am going to play basketball.",
      answers: ["Where", "What", "Bubble Tea", "Who"],
      correct: 2,
    },
    {
      category: "數學",
      question: "一輛汽車以時速 60 公里行駛，2.5 小時可以行駛幾公里？",
      answers: ["120 公里", "140 公里", "150 公里", "我答應我的父親不會再把奶茶灑掉"],
      correct: 3,
    },
    {
      category: "自然",
      question: "使用下列哪一種簡單機械，通常「無法」達到省力的效果，但可以改變施力的方向？",
      answers: ["動滑輪", "定滑輪", "奶茶", "螺絲釘"],
      correct: 2,
    },
    {
      category: "社會",
      question: "下列哪一個國際組織，臺灣目前是其正式會員，並經常參與相關的經貿會議？",
      answers: ["聯合國 (UN)", "世界衛生組織 (WHO)", "亞太經濟合作會議 (APEC)", "美國奶茶協會 (ELIM)"],
      correct: 3,
    },
  ];

  // Each visible island has its own top collision surface.
  const basePlatforms = [
    { x: 0, y: 748, w: 1600, h: 52 },
    { x: 0, y: 218, w: 448, h: 34 },
    { x: 605, y: 238, w: 414, h: 32 },
    { x: 1095, y: 236, w: 465, h: 32 },
    { x: 15, y: 418, w: 430, h: 31 },
    { x: 600, y: 420, w: 270, h: 30 },
    { x: 1065, y: 420, w: 405, h: 30 },
  ];

  const platforms = basePlatforms.map((platform) => ({ ...platform }));

  // Coordinates follow the ladders painted into the approved park background.
  const baseLadders = [
    { x: 365, top: 218, bottom: 418 },
    { x: 410, top: 418, bottom: 526 },
    { x: 1425, top: 236, bottom: 420 },
    { x: 1428, top: 420, bottom: 526 },
  ];

  const ladders = baseLadders.map((ladder) => ({ ...ladder }));

  const npcs = [
    { name: "Moses", x: 430, y: 743, sprite: mosesSprite },
    { name: "Vivian", x: 1305, y: 743, sprite: vivianSprite },
    { name: "Elim", x: 105, y: 418, sprite: elimSprite },
    { name: "Peter", x: 865, y: 230, sprite: peterSprite },
    { name: "Rollins", x: 1240, y: 235, sprite: fuSienSprite },
    { name: "Kate", x: 745, y: 420, sprite: kateSprite },
  ];
  const parkMoses = npcs[0];
  const parkVivian = npcs[1];
  const parkElim = npcs[2];
  const parkPeter = npcs[3];
  const parkFuSien = npcs[4];
  const parkKate = npcs[5];
  const fireMushroom = { name: "火蘑菇", x: FIRE_MUSHROOM_SPAWN_X, y: FIRE_MUSHROOM_GROUND_Y };
  const aquariumMoses = { name: "Moses", x: 330, y: 266, sprite: mosesSprite };
  const aquariumBadCrab = { name: "壞壞螃蟹", x: 1510, y: 662, sprite: badCrabSprite };
  let mosesPromptVisible = false;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  function findLadder(direction = 0, maxDistance = 30) {
    return ladders
      .filter((ladder) => {
        const nearX = Math.abs(player.x - ladder.x) <= maxDistance;
        const withinY = player.y >= ladder.top - 16 && player.y <= ladder.bottom + 16;
        const usefulForDirection = direction < 0
          ? ladder.top < player.y - 2
          : direction > 0
            ? ladder.bottom > player.y + 2
            : true;
        return nearX && withinY && usefulForDirection;
      })
      .sort((a, b) => Math.abs(player.x - a.x) - Math.abs(player.x - b.x))[0] || null;
  }

  function findTouchedLadder(maxDistance = 22) {
    const minY = Math.min(player.previousY, player.y) - 6;
    const maxY = Math.max(player.previousY, player.y) + 6;
    return ladders.find((ladder) => (
      Math.abs(player.x - ladder.x) <= maxDistance
      && maxY >= ladder.top
      && minY <= ladder.bottom
    )) || null;
  }

  function hasPlatformSurface(x, y) {
    return platforms.some((platform) => (
      x >= platform.x - 2
      && x <= platform.x + platform.w + 2
      && Math.abs(y - platform.y) <= 4
    ));
  }

  function attachToLadder(ladder) {
    player.climbing = true;
    player.ladder = ladder;
    player.x = ladder.x;
    player.y = Math.max(ladder.top, Math.min(ladder.bottom, player.y));
    player.previousY = player.y;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
  }

  function tryAttachToLadder(direction = 0, maxDistance = 30) {
    const ladder = findLadder(direction, maxDistance);
    if (!ladder) return false;
    attachToLadder(ladder);
    return true;
  }

  function detachFromLadder(now, grounded = false) {
    player.climbing = false;
    player.ladder = null;
    player.grounded = grounded;
    player.ladderDetachUntil = now + 180;
  }

  function spawnDust(direction) {
    for (let i = 0; i < 4; i += 1) {
      particles.push({
        x: player.x - direction * (7 + i * 2),
        y: player.y - 2,
        vx: -direction * (22 + i * 9),
        vy: -18 - i * 7,
        life: 0.38 + i * 0.04,
        maxLife: 0.5,
        size: 2 + (i % 2) * 2,
      });
    }
  }

  function jump() {
    if (!gameStarted || !player.grounded || player.climbing) return;
    player.vy = -JUMP_SPEED;
    player.grounded = false;
    spawnDust(player.facing);
    playJumpSound();
  }

  function attack() {
    const now = performance.now();
    if (!gameStarted || parkChampionActive || aquariumDialogueActive || kateDialogueActive || kateMissionCompleteStartedAt || missionCompleteStartedAt || (scene === "aquarium" && crabHp <= 0)) return;
    if (player.attacking && now < player.attackUntil) return;
    player.attacking = true;
    player.attackUntil = now + 500;
    player.vx *= 0.45;
    attackButton.classList.add("active");
    playAttackSound();
    if (scene === "aquarium" && isPlayerNearBadCrab()) damageBadCrab(now);
    if (scene === "park" && isPlayerNearFireMushroom()) damageFireMushroom(now);
  }

  function markNpcTaskCompleted(npc) {
    if (!npc?.name) return;
    completedNpcNames.add(npc.name);
    completedNpcTasks = Math.min(6, completedNpcNames.size);
  }

  function isNpcTaskCompleted(npc) {
    return Boolean(npc?.name && completedNpcNames.has(npc.name));
  }

  function startParkChampionEnding(now) {
    if (parkChampionActive || completedNpcTasks < 6 || scene !== "park") return;
    parkChampionActive = true;
    parkChampionBannerUntil = now + PARK_CHAMPION_BANNER_DURATION;

    const gathering = [
      [parkMoses, 1145, 420],
      [parkVivian, 1265, 420],
      [parkKate, 1020, PARK_CHAMPION_GROUND_Y],
      [parkFuSien, 1110, PARK_CHAMPION_GROUND_Y],
      [parkElim, 1200, PARK_CHAMPION_GROUND_Y],
      [parkPeter, 1290, PARK_CHAMPION_GROUND_Y],
    ];
    for (const [npc, x, y] of gathering) {
      npc.x = x;
      npc.y = y;
    }
    player.x = 930;
    player.y = PARK_CHAMPION_GROUND_Y;
    player.previousY = PARK_CHAMPION_GROUND_Y;
    player.vx = 0;
    player.vy = 0;
    player.facing = 1;
    player.grounded = true;
    player.walking = false;
    player.climbing = false;
    player.ladder = null;
    player.attacking = false;
    player.attackUntil = 0;
    kateMoving = false;
    fireMushroomSpawned = false;
    cameraX = PARK_CHAMPION_CAMERA_X;
    touchControlHeld = false;
    touchDirectionX = 0;
    touchDirectionY = 0;
    pointerStart = null;
    particles.length = 0;
    keys.clear();
    mosesPromptVisible = false;
    vivianPromptVisible = false;
    elimPromptVisible = false;
    peterPromptVisible = false;
    fuSienPromptVisible = false;
    katePromptVisible = false;
    attackButton.classList.remove("active");
    attackButton.hidden = true;
    abandonTaskButton.hidden = true;
    game.classList.add("champion-mode");
  }

  function canParkNpcSpeak(npc) {
    return scene === "park"
      && !parkChampionActive
      && !isNpcTaskCompleted(npc)
      && !vivianTaskActive
      && !elimTaskActive
      && !kateTaskActive
      && !kateDialogueActive;
  }

  function isPlayerNearMoses() {
    if (!canParkNpcSpeak(parkMoses)) return false;
    const dx = player.x - parkMoses.x;
    const dy = (player.y - parkMoses.y) * 0.55;
    return Math.hypot(dx, dy) <= MOSES_PROXIMITY;
  }

  function isPlayerNearVivian() {
    if (!canParkNpcSpeak(parkVivian)) return false;
    const dx = player.x - parkVivian.x;
    const dy = (player.y - parkVivian.y) * 0.55;
    return Math.hypot(dx, dy) <= VIVIAN_PROXIMITY;
  }

  function isPlayerNearElim() {
    if (!canParkNpcSpeak(parkElim)) return false;
    const dx = player.x - parkElim.x;
    const dy = (player.y - parkElim.y) * 0.55;
    return Math.hypot(dx, dy) <= ELIM_PROXIMITY;
  }

  function isPlayerNearPeter() {
    if (!canParkNpcSpeak(parkPeter) || peterTaskActive) return false;
    const dx = player.x - parkPeter.x;
    const dy = (player.y - parkPeter.y) * 0.55;
    return Math.hypot(dx, dy) <= PETER_PROXIMITY;
  }

  function isPlayerNearFuSien() {
    if (!canParkNpcSpeak(parkFuSien) || peterTaskActive || fuSienTaskActive) return false;
    const dx = player.x - parkFuSien.x;
    const dy = (player.y - parkFuSien.y) * 0.55;
    return Math.hypot(dx, dy) <= FU_SIEN_PROXIMITY;
  }

  function isPlayerNearKate() {
    if (!canParkNpcSpeak(parkKate) || kateTaskActive) return false;
    const dx = player.x - parkKate.x;
    const dy = (player.y - parkKate.y) * 0.55;
    return Math.hypot(dx, dy) <= KATE_PROXIMITY;
  }

  function isPlayerNearBadCrab() {
    if (scene !== "aquarium" || aquariumDialogueActive || crabHp <= 0 || performance.now() < crabHurtUntil) return false;
    const dx = player.x - aquariumBadCrab.x;
    const dy = (player.y - aquariumBadCrab.y) * 0.7;
    return Math.hypot(dx, dy) <= CRAB_PROXIMITY;
  }

  function damageBadCrab(now) {
    crabHp = Math.max(0, crabHp - 1);
    crabHurtUntil = now + 500;
    crabPromptVisible = false;
    if (crabHp === 0) crabEscapeStartedAt = crabHurtUntil;
  }

  function isPlayerNearFireMushroom() {
    if (!fireMushroomSpawned || fireMushroomHp <= 0 || performance.now() < fireMushroomHurtUntil) return false;
    const dx = player.x - fireMushroom.x;
    const dy = (player.y - fireMushroom.y) * 0.65;
    return Math.hypot(dx, dy) <= FIRE_MUSHROOM_PROXIMITY;
  }

  function damageFireMushroom(now) {
    if (!isPlayerNearFireMushroom()) return;
    fireMushroomHp = Math.max(0, fireMushroomHp - 1);
    fireMushroomHurtUntil = now + FIRE_MUSHROOM_HURT_DURATION;
    if (fireMushroomHp === 0) fireMushroomDefeatStartedAt = fireMushroomHurtUntil;
  }

  function finishAquariumDialogue() {
    const now = performance.now();
    if (!aquariumDialogueActive || now - aquariumDialoguePageShownAt < DIALOGUE_MIN_VISIBLE_MS) return;
    if (aquariumDialoguePage === 0) {
      aquariumDialoguePage = 1;
      aquariumDialoguePageShownAt = now;
      return;
    }
    aquariumDialogueActive = false;
    game.classList.remove("dialogue-mode");
    keys.clear();
  }

  function returnToPark() {
    mosesTaskCompleted = true;
    markNpcTaskCompleted(parkMoses);
    scene = "park";
    game.classList.remove("aquarium-mode", "dialogue-mode");
    player.x = 520;
    player.y = GROUND_Y;
    player.previousY = GROUND_Y;
    player.vx = 0;
    player.vy = 0;
    player.facing = 1;
    player.grounded = true;
    player.walking = false;
    player.climbing = false;
    player.ladder = null;
    player.attacking = false;
    player.attackUntil = 0;
    cameraX = Math.max(0, Math.min(WORLD_W - W, player.x - W * 0.46));
    crabPromptVisible = false;
    aquariumDialogueActive = false;
    missionCompleteStartedAt = 0;
    particles.length = 0;
    keys.clear();
    attackButton.classList.remove("active");
  }

  function enterAquarium() {
    if (scene !== "park" || !mosesPromptVisible || mosesTaskCompleted) return;
    scene = "aquarium";
    mosesPromptVisible = false;
    aquariumDialogueActive = true;
    aquariumDialoguePage = 0;
    aquariumDialoguePageShownAt = performance.now();
    crabPromptVisible = false;
    crabHp = CRAB_MAX_HP;
    crabHurtUntil = 0;
    crabEscapeStartedAt = 0;
    missionCompleteStartedAt = 0;
    game.classList.add("aquarium-mode", "dialogue-mode");
    player.x = 145;
    player.y = AQUARIUM_TOP_Y;
    player.previousY = player.y;
    player.vx = 0;
    player.vy = 0;
    player.facing = 1;
    player.grounded = false;
    player.walking = false;
    player.climbing = false;
    player.ladder = null;
    player.attacking = false;
    player.attackUntil = 0;
    cameraX = 0;
    particles.length = 0;
    keys.clear();
    attackButton.classList.remove("active");
  }

  function startVivianTask() {
    if (scene !== "park" || !vivianPromptVisible || vivianTaskActive || vivianTaskCompleted) return;
    vivianTaskActive = true;
    vivianTaskStartedAt = performance.now();
    vivianPlayedNoteCount = 0;
    vivianDialogueTriggered = false;
    vivianDialogueActive = false;
    vivianDialoguePage = 0;
    vivianCompletionReady = false;
    vivianPromptVisible = false;
    mosesPromptVisible = false;
    game.classList.add("vivian-task-mode");
    player.vx = 0;
    player.vy = 0;
    player.walking = false;
    player.attacking = false;
    player.attackUntil = 0;
    touchControlHeld = false;
    touchDirectionX = 0;
    touchDirectionY = 0;
    keys.clear();
    attackButton.classList.remove("active");
    if (audio && !musicMuted) audio.master.gain.setTargetAtTime(MUSIC_DUCKED_GAIN, audio.context.currentTime, 0.12);
  }

  function updateVivianTask(now) {
    if (
      !vivianDialogueTriggered
      && vivianPlayedNoteCount >= 5
      && now - vivianTaskStartedAt >= 5000
    ) {
      vivianDialogueTriggered = true;
      vivianDialogueActive = true;
      vivianDialoguePage = 0;
      vivianDialoguePageShownAt = now;
      guzhengPointers.clear();
      game.classList.add("dialogue-mode");
    }
  }

  function advanceVivianDialogue() {
    const now = performance.now();
    if (!vivianDialogueActive || now - vivianDialoguePageShownAt < DIALOGUE_MIN_VISIBLE_MS) return;
    if (vivianDialoguePage === 0) {
      vivianDialoguePage = 1;
      vivianDialoguePageShownAt = now;
      return;
    }
    vivianDialogueActive = false;
    vivianCompletionReady = true;
    guzhengPointers.clear();
    game.classList.remove("dialogue-mode");
  }

  function finishVivianTask() {
    if (!vivianTaskActive || !vivianCompletionReady) return;
    vivianTaskCompleted = true;
    markNpcTaskCompleted(parkVivian);
    vivianTaskActive = false;
    vivianCompletionReady = false;
    vivianDialogueActive = false;
    vivianPromptVisible = false;
    game.classList.remove("vivian-task-mode", "dialogue-mode");
    guzhengPointers.clear();
    pointerStart = null;
    keys.clear();
    if (audio && !musicMuted) audio.master.gain.setTargetAtTime(MUSIC_MASTER_GAIN, audio.context.currentTime, 0.12);
  }

  function startKateTask() {
    if (scene !== "park" || !katePromptVisible || kateTaskActive || kateTaskCompleted) return;
    kateTaskActive = true;
    kateDialogueActive = true;
    kateDialoguePage = 0;
    kateDialoguePageShownAt = performance.now();
    kateMoving = false;
    kateRouteIndex = 0;
    kateRoute = KATE_BRIDGE_ROUTE;
    kateStage = "intro-dialogue";
    kateSpeechText = "";
    kateSpeechUntil = 0;
    fireMushroomSpawned = false;
    fireMushroomHp = FIRE_MUSHROOM_MAX_HP;
    fireMushroomHurtUntil = 0;
    fireMushroomDefeatStartedAt = 0;
    kateMissionCompleteStartedAt = 0;
    katePromptVisible = false;
    mosesPromptVisible = false;
    vivianPromptVisible = false;
    elimPromptVisible = false;
    peterPromptVisible = false;
    fuSienPromptVisible = false;
    player.vx = 0;
    player.vy = 0;
    player.walking = false;
    player.attacking = false;
    player.attackUntil = 0;
    touchControlHeld = false;
    touchDirectionX = 0;
    touchDirectionY = 0;
    pointerStart = null;
    keys.clear();
    game.classList.add("kate-task-mode", "dialogue-mode");
    attackButton.classList.remove("active");
    if (audio && !musicMuted) audio.master.gain.setTargetAtTime(MUSIC_DUCKED_GAIN, audio.context.currentTime, 0.12);
  }

  function advanceKateDialogue() {
    const now = performance.now();
    if (!kateDialogueActive || now - kateDialoguePageShownAt < DIALOGUE_MIN_VISIBLE_MS) return;
    if (kateDialoguePage < KATE_DIALOGUE_LINES.length - 1) {
      kateDialoguePage += 1;
      kateDialoguePageShownAt = now;
      return;
    }
    kateDialogueActive = false;
    startKateRoute(KATE_BRIDGE_ROUTE, "to-bridge");
    game.classList.remove("kate-task-mode", "dialogue-mode");
    if (audio && !musicMuted) audio.master.gain.setTargetAtTime(MUSIC_MASTER_GAIN, audio.context.currentTime, 0.12);
  }

  function startKateRoute(route, stage) {
    kateRoute = route;
    kateRouteIndex = 0;
    kateMoving = true;
    kateStage = stage;
  }

  function updateKateMovement(dt) {
    if (!kateMoving || kateRouteIndex >= kateRoute.length) return;
    const target = kateRoute[kateRouteIndex];
    const dx = target.x - parkKate.x;
    const dy = target.y - parkKate.y;
    const distance = Math.hypot(dx, dy);
    if (Math.abs(dx) > 1) kateFacing = Math.sign(dx);
    if (distance <= KATE_MOVE_SPEED * dt) {
      parkKate.x = target.x;
      parkKate.y = target.y;
      kateRouteIndex += 1;
      if (kateRouteIndex >= kateRoute.length) {
        kateMoving = false;
        if (kateStage === "to-bridge") kateStage = "bridge-wait";
        else if (kateStage === "to-tree") kateStage = "tree-wait";
      }
      return;
    }
    parkKate.x += (dx / distance) * KATE_MOVE_SPEED * dt;
    parkKate.y += (dy / distance) * KATE_MOVE_SPEED * dt;
  }

  function isPlayerNearKateTaskPosition() {
    const dx = player.x - parkKate.x;
    const dy = (player.y - parkKate.y) * 0.55;
    return Math.hypot(dx, dy) <= KATE_TASK_PROXIMITY;
  }

  function startKateTimedSpeech(text, nextStage, now) {
    kateSpeechText = text;
    kateSpeechUntil = now + KATE_SPEECH_DURATION;
    kateStage = nextStage;
  }

  function spawnFireMushroom() {
    fireMushroom.x = FIRE_MUSHROOM_SPAWN_X;
    fireMushroom.y = FIRE_MUSHROOM_GROUND_Y;
    fireMushroomSpawned = true;
    fireMushroomHp = FIRE_MUSHROOM_MAX_HP;
    fireMushroomHurtUntil = 0;
    fireMushroomDefeatStartedAt = 0;
    kateStage = "mushroom-active";
  }

  function finishKateTask() {
    if (!kateTaskActive || !kateMissionCompleteStartedAt) return;
    kateTaskCompleted = true;
    markNpcTaskCompleted(parkKate);
    kateTaskActive = false;
    kateDialogueActive = false;
    kateMoving = false;
    kateStage = "complete";
    kateSpeechText = "";
    kateSpeechUntil = 0;
    fireMushroomSpawned = false;
    kateMissionCompleteStartedAt = 0;
    pointerStart = null;
    keys.clear();
    game.classList.remove("kate-task-mode", "dialogue-mode");
  }

  function updateKateTask(dt, now) {
    if (!kateTaskActive || scene !== "park" || kateDialogueActive) return;
    updateKateMovement(dt);

    if (kateStage === "bridge-wait" && isPlayerNearKateTaskPosition()) {
      startKateTimedSpeech("好像走錯了", "bridge-speaking", now);
      return;
    }
    if (kateStage === "bridge-speaking" && now >= kateSpeechUntil) {
      kateSpeechText = "";
      kateSpeechUntil = 0;
      startKateRoute(KATE_TREE_ROUTE, "to-tree");
      return;
    }
    if (kateStage === "tree-wait" && isPlayerNearKateTaskPosition()) {
      startKateTimedSpeech("是火～蘑～菇！", "tree-speaking", now);
      return;
    }
    if (kateStage === "tree-speaking" && now >= kateSpeechUntil) {
      kateSpeechText = "";
      kateSpeechUntil = 0;
      spawnFireMushroom();
      return;
    }
    if (kateStage !== "mushroom-active") return;

    if (fireMushroomHp > 0) {
      fireMushroom.x = Math.max(FIRE_MUSHROOM_STOP_X, fireMushroom.x - FIRE_MUSHROOM_SPEED * dt);
      return;
    }
    if (fireMushroomDefeatStartedAt && now - fireMushroomDefeatStartedAt >= FIRE_MUSHROOM_SINK_DURATION) {
      if (!kateMissionCompleteStartedAt) kateMissionCompleteStartedAt = now;
      if (now - kateMissionCompleteStartedAt >= MISSION_COMPLETE_DURATION) finishKateTask();
    }
  }

  function startElimTask() {
    if (scene !== "park" || !elimPromptVisible || elimTaskActive || elimTaskCompleted) return;
    elimTaskActive = true;
    elimPromptVisible = false;
    mosesPromptVisible = false;
    vivianPromptVisible = false;
    elimQuestionIndex = 0;
    elimDialogueActive = false;
    elimDialogueKind = "wrong";
    elimDialoguePage = 0;
    elimMissionCompleteStartedAt = 0;
    game.classList.add("elim-task-mode");
    player.vx = 0;
    player.vy = 0;
    player.walking = false;
    player.attacking = false;
    player.attackUntil = 0;
    touchControlHeld = false;
    touchDirectionX = 0;
    touchDirectionY = 0;
    pointerStart = null;
    keys.clear();
    attackButton.classList.remove("active");
    if (audio && !musicMuted) audio.master.gain.setTargetAtTime(MUSIC_DUCKED_GAIN, audio.context.currentTime, 0.12);
  }

  function startElimDialogue(kind) {
    elimDialogueKind = kind;
    elimDialoguePage = 0;
    elimDialogueActive = true;
    elimDialoguePageShownAt = performance.now();
    game.classList.add("dialogue-mode");
  }

  function answerElimQuestion(index) {
    if (!elimTaskActive || elimDialogueActive || elimMissionCompleteStartedAt) return;
    const question = elimQuestions[elimQuestionIndex];
    if (!question || index < 0 || index > 3) return;
    if (index !== question.correct) {
      startElimDialogue("wrong");
      return;
    }
    if (elimQuestionIndex < elimQuestions.length - 1) {
      elimQuestionIndex += 1;
      return;
    }
    startElimDialogue("final");
  }

  function advanceElimDialogue() {
    const now = performance.now();
    if (!elimDialogueActive || now - elimDialoguePageShownAt < DIALOGUE_MIN_VISIBLE_MS) return;
    if (elimDialoguePage === 0) {
      elimDialoguePage = 1;
      elimDialoguePageShownAt = now;
      return;
    }
    elimDialogueActive = false;
    game.classList.remove("dialogue-mode");
    if (elimDialogueKind === "final") elimMissionCompleteStartedAt = now;
  }

  function finishElimTask() {
    if (!elimTaskActive || !elimMissionCompleteStartedAt) return;
    elimTaskCompleted = true;
    markNpcTaskCompleted(parkElim);
    elimTaskActive = false;
    elimPromptVisible = false;
    elimDialogueActive = false;
    elimMissionCompleteStartedAt = 0;
    pointerStart = null;
    keys.clear();
    game.classList.remove("elim-task-mode", "dialogue-mode");
    if (audio && !musicMuted) audio.master.gain.setTargetAtTime(MUSIC_MASTER_GAIN, audio.context.currentTime, 0.12);
  }

  function startPeterTask() {
    if (scene !== "park" || !peterPromptVisible || peterTaskActive || peterTaskCompleted) return;
    scene = "picnic";
    peterTaskActive = true;
    peterGameStarted = false;
    peterDialogueActive = true;
    peterDialogueKind = "intro";
    peterDialoguePage = 0;
    peterDialoguePageShownAt = performance.now();
    peterMissionCompleteStartedAt = 0;
    picnicActiveIngredient = null;
    picnicCookStartedAt = 0;
    for (const ingredient of picnicIngredients) {
      ingredient.x = ingredient.homeX;
      ingredient.y = ingredient.homeY;
      ingredient.processed = false;
    }
    peterPromptVisible = false;
    mosesPromptVisible = false;
    vivianPromptVisible = false;
    elimPromptVisible = false;
    player.vx = 0;
    player.vy = 0;
    player.walking = false;
    player.attacking = false;
    player.attackUntil = 0;
    touchControlHeld = false;
    touchDirectionX = 0;
    touchDirectionY = 0;
    pointerStart = null;
    keys.clear();
    game.classList.add("picnic-mode", "dialogue-mode");
    attackButton.classList.remove("active");
    abandonTaskButton.hidden = true;
  }

  function startPeterDialogue(kind) {
    peterDialogueKind = kind;
    peterDialoguePage = 0;
    peterDialogueActive = true;
    peterDialoguePageShownAt = performance.now();
    picnicActiveIngredient = null;
    picnicCookStartedAt = 0;
    game.classList.add("dialogue-mode");
    abandonTaskButton.hidden = true;
  }

  function advancePeterDialogue() {
    const now = performance.now();
    if (!peterDialogueActive || now - peterDialoguePageShownAt < DIALOGUE_MIN_VISIBLE_MS) return;
    if (peterDialogueKind === "intro") {
      if (peterDialoguePage < PETER_DIALOGUE_LINES.length - 1) {
        peterDialoguePage += 1;
        peterDialoguePageShownAt = now;
      }
      return;
    }
    peterDialogueActive = false;
    game.classList.remove("dialogue-mode");
    if (picnicIngredients.every((ingredient) => ingredient.processed)) {
      peterMissionCompleteStartedAt = now;
      abandonTaskButton.hidden = true;
    } else {
      abandonTaskButton.hidden = false;
    }
  }

  function repeatPeterRules() {
    if (!peterDialogueActive || peterDialogueKind !== "intro" || peterDialoguePage !== PETER_DIALOGUE_LINES.length - 1) return;
    peterDialoguePage = 0;
    peterDialoguePageShownAt = performance.now();
  }

  function beginPeterCookingGame() {
    if (!peterDialogueActive || peterDialogueKind !== "intro" || peterDialoguePage !== PETER_DIALOGUE_LINES.length - 1) return;
    peterDialogueActive = false;
    peterGameStarted = true;
    picnicActiveIngredient = null;
    picnicCookStartedAt = 0;
    pointerStart = null;
    game.classList.remove("dialogue-mode");
    abandonTaskButton.hidden = false;
  }

  function resetPicnicIngredient(ingredient) {
    if (!ingredient) return;
    ingredient.x = ingredient.homeX;
    ingredient.y = ingredient.homeY;
    picnicCookStartedAt = 0;
  }

  function abandonPeterTask() {
    if (scene !== "picnic" || !peterTaskActive || !peterGameStarted || peterDialogueActive || peterMissionCompleteStartedAt) return;
    peterTaskActive = false;
    peterGameStarted = false;
    peterDialogueActive = false;
    peterDialogueKind = "intro";
    peterDialoguePage = 0;
    peterDialoguePageShownAt = 0;
    picnicActiveIngredient = null;
    picnicCookStartedAt = 0;
    pointerStart = null;
    keys.clear();
    for (const ingredient of picnicIngredients) {
      ingredient.x = ingredient.homeX;
      ingredient.y = ingredient.homeY;
      ingredient.processed = false;
    }
    scene = "park";
    player.x = 980;
    player.y = 230;
    player.previousY = 230;
    player.vx = 0;
    player.vy = 0;
    player.grounded = true;
    player.walking = false;
    cameraX = Math.max(0, Math.min(WORLD_W - W, player.x - W * 0.46));
    abandonTaskButton.hidden = true;
    game.classList.remove("picnic-mode", "dialogue-mode");
    if (audio && !musicMuted) audio.master.gain.setTargetAtTime(MUSIC_MASTER_GAIN, audio.context.currentTime, 0.12);
  }

  function startFuSienTask() {
    if (scene !== "park" || !fuSienPromptVisible || fuSienTaskActive || fuSienTaskCompleted) return;
    const now = performance.now();
    scene = "baseball";
    fuSienTaskActive = true;
    fuSienTaskStartedAt = now;
    fuSienStage = "waiting";
    fuSienStageStartedAt = now;
    fuSienDialogueActive = false;
    fuSienDialogueKind = "intro";
    fuSienDialoguePage = 0;
    fuSienDialoguePageShownAt = 0;
    fuSienStrikeCount = 0;
    fuSienPromptVisible = false;
    mosesPromptVisible = false;
    vivianPromptVisible = false;
    elimPromptVisible = false;
    peterPromptVisible = false;
    player.vx = 0;
    player.vy = 0;
    player.walking = false;
    player.attacking = false;
    player.attackUntil = 0;
    touchControlHeld = false;
    touchDirectionX = 0;
    touchDirectionY = 0;
    pointerStart = null;
    keys.clear();
    abandonTaskButton.hidden = true;
    game.classList.add("baseball-mode");
    attackButton.classList.remove("active");
  }

  function startFuSienDialogue(kind) {
    fuSienDialogueKind = kind;
    fuSienDialoguePage = 0;
    fuSienDialogueActive = true;
    fuSienDialoguePageShownAt = performance.now();
    fuSienStage = `${kind}-dialogue`;
    game.classList.add("dialogue-mode");
  }

  function chooseBaseballBallDestination(now) {
    const padding = 24;
    baseballBallStartX = baseballBallX;
    baseballBallStartY = baseballBallY;
    baseballBallTargetX = BASEBALL_GRID.x + padding + Math.random() * (BASEBALL_GRID.size - padding * 2);
    baseballBallTargetY = BASEBALL_GRID.y + padding + Math.random() * (BASEBALL_GRID.size - padding * 2);
    baseballBallMoveStartedAt = now;
    baseballBallMoveDuration = 520 + Math.random() * 480;
  }

  function beginFuSienPitching() {
    const now = performance.now();
    fuSienDialogueActive = false;
    game.classList.remove("dialogue-mode");
    fuSienStage = "pitching";
    fuSienStageStartedAt = now;
    fuSienTargetCells = BASEBALL_TARGET_ZONES[Math.floor(Math.random() * BASEBALL_TARGET_ZONES.length)];
    baseballBallX = BASEBALL_GRID.x + 30 + Math.random() * (BASEBALL_GRID.size - 60);
    baseballBallY = BASEBALL_GRID.y + 30 + Math.random() * (BASEBALL_GRID.size - 60);
    chooseBaseballBallDestination(now);
  }

  function chooseFuSienIntroAnswer() {
    if (!fuSienDialogueActive || fuSienDialogueKind !== "intro" || fuSienDialoguePage !== FU_SIEN_DIALOGUE_LINES.length - 1) return;
    beginFuSienPitching();
  }

  function advanceFuSienDialogue() {
    const now = performance.now();
    if (!fuSienDialogueActive || now - fuSienDialoguePageShownAt < DIALOGUE_MIN_VISIBLE_MS) return;
    if (fuSienDialogueKind === "intro") {
      if (fuSienDialoguePage < FU_SIEN_DIALOGUE_LINES.length - 1) {
        fuSienDialoguePage += 1;
        fuSienDialoguePageShownAt = now;
      }
      return;
    }
    fuSienDialogueActive = false;
    game.classList.remove("dialogue-mode");
    if (fuSienDialogueKind === "miss") {
      fuSienStage = "coach-walk-in";
      fuSienStageStartedAt = now;
    } else if (fuSienDialogueKind === "coach") {
      fuSienStage = "coach-walk-back";
      fuSienStageStartedAt = now;
    }
  }

  function getBaseballBallCell() {
    const column = Math.max(0, Math.min(2, Math.floor((baseballBallX - BASEBALL_GRID.x) / BASEBALL_GRID.cell)));
    const row = Math.max(0, Math.min(2, Math.floor((baseballBallY - BASEBALL_GRID.y) / BASEBALL_GRID.cell)));
    return row * 3 + column;
  }

  function throwFuSienPitch() {
    if (fuSienStage !== "pitching" || fuSienDialogueActive) return;
    const now = performance.now();
    if (fuSienTargetCells.includes(getBaseballBallCell())) {
      fuSienStrikeCount += 1;
      fuSienStage = "pitch-flight";
      fuSienStageStartedAt = now;
      playBaseballPitchSound();
    } else {
      startFuSienDialogue("miss");
    }
  }

  function finishFuSienTask() {
    if (!fuSienTaskActive || fuSienStage !== "mission-complete") return;
    fuSienTaskCompleted = true;
    markNpcTaskCompleted(parkFuSien);
    fuSienTaskActive = false;
    fuSienDialogueActive = false;
    fuSienStage = "idle";
    pointerStart = null;
    keys.clear();
    scene = "park";
    player.x = 1150;
    player.y = 235;
    player.previousY = 235;
    player.vx = 0;
    player.vy = 0;
    player.grounded = true;
    player.walking = false;
    cameraX = Math.max(0, Math.min(WORLD_W - W, player.x - W * 0.46));
    game.classList.remove("baseball-mode", "dialogue-mode");
  }

  function finishPeterTask() {
    if (!peterTaskActive || !peterMissionCompleteStartedAt) return;
    peterTaskCompleted = true;
    markNpcTaskCompleted(parkPeter);
    peterTaskActive = false;
    peterGameStarted = false;
    peterDialogueActive = false;
    peterMissionCompleteStartedAt = 0;
    picnicActiveIngredient = null;
    picnicCookStartedAt = 0;
    pointerStart = null;
    keys.clear();
    scene = "park";
    player.x = 1010;
    player.y = 230;
    player.previousY = 230;
    player.vx = 0;
    player.vy = 0;
    player.grounded = true;
    player.walking = false;
    cameraX = Math.max(0, Math.min(WORLD_W - W, player.x - W * 0.46));
    game.classList.remove("picnic-mode", "dialogue-mode");
    abandonTaskButton.hidden = true;
    if (audio && !musicMuted) audio.master.gain.setTargetAtTime(MUSIC_MASTER_GAIN, audio.context.currentTime, 0.12);
  }

  function updateAquariumQuest(now) {
    if (!crabEscapeStartedAt || missionCompleteStartedAt) return;
    if (now >= crabEscapeStartedAt + CRAB_ESCAPE_DURATION) {
      missionCompleteStartedAt = now;
      crabPromptVisible = false;
    }
  }

  function updateAquariumPlayer(dt, now) {
    let directionX = 0;
    let directionY = 0;
    if (keys.has("ArrowLeft") || keys.has("KeyA")) directionX -= 1;
    if (keys.has("ArrowRight") || keys.has("KeyD")) directionX += 1;
    if (keys.has("ArrowUp") || keys.has("KeyW")) directionY -= 1;
    if (keys.has("ArrowDown") || keys.has("KeyS")) directionY += 1;

    if (!directionX && !directionY && touchControlHeld) {
      directionX = touchDirectionX;
      directionY = touchDirectionY;
    }

    if (directionX && directionY) {
      directionX *= Math.SQRT1_2;
      directionY *= Math.SQRT1_2;
    }

    player.previousY = player.y;
    player.walking = directionX !== 0 || directionY !== 0;
    player.grounded = false;
    player.climbing = false;
    player.ladder = null;
    player.vx += (directionX * AQUARIUM_SWIM_SPEED - player.vx) * Math.min(1, dt * 8);
    player.vy += (directionY * AQUARIUM_SWIM_SPEED - player.vy) * Math.min(1, dt * 8);
    if (!directionX) player.vx *= Math.pow(0.001, dt);
    if (!directionY) player.vy *= Math.pow(0.001, dt);
    if (directionX) player.facing = Math.sign(directionX);

    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.x = Math.max(38, Math.min(WORLD_W - 38, player.x));
    player.y = Math.max(AQUARIUM_TOP_Y, Math.min(AQUARIUM_BOTTOM_Y, player.y));
    if (player.y === AQUARIUM_TOP_Y && player.vy < 0) player.vy = 0;
    if (player.y === AQUARIUM_BOTTOM_Y && player.vy > 0) player.vy = 0;
  }

  function updatePlayer(dt, now) {
    let direction = 0;
    if (keys.has("ArrowLeft") || keys.has("KeyA")) direction -= 1;
    if (keys.has("ArrowRight") || keys.has("KeyD")) direction += 1;
    if (!direction && touchControlHeld) direction = touchDirectionX;

    let climbDirection = 0;
    if (keys.has("ArrowUp") || keys.has("KeyW")) climbDirection -= 1;
    if (keys.has("ArrowDown") || keys.has("KeyS")) climbDirection += 1;
    if (!climbDirection && touchControlHeld) climbDirection = touchDirectionY;

    if (player.climbing && player.ladder) {
      if (direction) {
        detachFromLadder(now, false);
        player.vx = direction * MOVE_SPEED * 0.72;
      } else {
        player.walking = climbDirection !== 0;
        player.x = player.ladder.x;
        player.previousY = player.y;
        player.vx = 0;
        player.vy = 0;
        player.y += climbDirection * CLIMB_SPEED * dt;

        if (climbDirection < 0 && player.y <= player.ladder.top) {
          player.y = player.ladder.top;
          detachFromLadder(now, true);
        } else if (climbDirection > 0 && player.y >= player.ladder.bottom) {
          player.y = player.ladder.bottom;
          const onPlatform = hasPlatformSurface(player.x, player.y);
          detachFromLadder(now, onPlatform);
          if (!onPlatform) player.vy = 65;
        }
        return;
      }
    }

    player.walking = direction !== 0;
    player.vx += (direction * MOVE_SPEED - player.vx) * Math.min(1, dt * 11);
    if (!direction) player.vx *= Math.pow(0.0008, dt);
    if (direction) player.facing = direction;

    const wasGrounded = player.grounded;
    player.x += player.vx * dt;
    player.x = Math.max(24, Math.min(WORLD_W - 24, player.x));

    player.previousY = player.y;
    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;
    player.grounded = false;

    if (!wasGrounded && now >= player.ladderDetachUntil) {
      const touchedLadder = findTouchedLadder();
      if (touchedLadder) {
        attachToLadder(touchedLadder);
        return;
      }
    }

    let landingY = Infinity;
    if (player.vy >= 0) {
      for (const platform of platforms) {
        const withinX = player.x + 16 > platform.x && player.x - 16 < platform.x + platform.w;
        const crossedTop = player.previousY <= platform.y + 2 && player.y >= platform.y;
        if (withinX && crossedTop && platform.y < landingY) landingY = platform.y;
      }
    }

    if (landingY < Infinity) {
      player.y = landingY;
      player.vy = 0;
      player.grounded = true;
      if (!wasGrounded) spawnDust(player.facing);
    }

    if (player.y > H + 120) {
      player.y = GROUND_Y;
      player.previousY = GROUND_Y;
      player.vy = 0;
      player.x = Math.max(40, Math.min(WORLD_W - 40, player.x));
      player.grounded = true;
      player.climbing = false;
      player.ladder = null;
    }
  }

  function updateFuSienTask(now) {
    if (!fuSienTaskActive || scene !== "baseball") return;
    if (fuSienStage === "waiting" && now - fuSienTaskStartedAt >= BASEBALL_INTRO_DELAY) {
      startFuSienDialogue("intro");
      return;
    }
    if (fuSienStage === "pitching") {
      const progress = Math.min(1, (now - baseballBallMoveStartedAt) / baseballBallMoveDuration);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      baseballBallX = baseballBallStartX + (baseballBallTargetX - baseballBallStartX) * eased;
      baseballBallY = baseballBallStartY + (baseballBallTargetY - baseballBallStartY) * eased;
      if (progress >= 1) chooseBaseballBallDestination(now);
      return;
    }
    if (fuSienStage === "coach-walk-in" && now - fuSienStageStartedAt >= BASEBALL_WALK_DURATION) {
      startFuSienDialogue("coach");
      return;
    }
    if (fuSienStage === "coach-walk-back" && now - fuSienStageStartedAt >= BASEBALL_WALK_DURATION) {
      beginFuSienPitching();
      return;
    }
    if (fuSienStage === "pitch-flight" && now - fuSienStageStartedAt >= BASEBALL_PITCH_DURATION) {
      fuSienStage = "strike-effect";
      fuSienStageStartedAt = now;
      return;
    }
    if (fuSienStage === "strike-effect" && now - fuSienStageStartedAt >= BASEBALL_STRIKE_DURATION) {
      if (fuSienStrikeCount >= BASEBALL_MAX_STRIKES) {
        fuSienStage = "mission-complete";
        fuSienStageStartedAt = now;
      } else {
        beginFuSienPitching();
      }
      return;
    }
    if (fuSienStage === "mission-complete" && now - fuSienStageStartedAt >= MISSION_COMPLETE_DURATION) {
      finishFuSienTask();
    }
  }

  function update(dt, now) {
    if (!gameStarted) return;
    if (!parkChampionActive && completedNpcTasks >= 6 && scene === "park"
      && !vivianTaskActive && !elimTaskActive && !kateTaskActive
      && !peterTaskActive && !fuSienTaskActive && !aquariumDialogueActive) {
      startParkChampionEnding(now);
    }
    if (parkChampionActive) {
      player.vx = 0;
      player.vy = 0;
      player.walking = false;
      player.attacking = false;
      return;
    }
    if (player.attacking && now >= player.attackUntil) {
      player.attacking = false;
      attackButton.classList.remove("active");
    }
    if (scene === "baseball") {
      updateFuSienTask(now);
      player.walking = false;
      player.vx = 0;
      player.vy = 0;
      mosesPromptVisible = false;
      vivianPromptVisible = false;
      elimPromptVisible = false;
      peterPromptVisible = false;
      fuSienPromptVisible = false;
      katePromptVisible = false;
      return;
    }
    if (scene === "picnic") {
      player.walking = false;
      player.vx = 0;
      player.vy = 0;
      mosesPromptVisible = false;
      vivianPromptVisible = false;
      elimPromptVisible = false;
      peterPromptVisible = false;
      fuSienPromptVisible = false;
      katePromptVisible = false;
      if (peterMissionCompleteStartedAt && now - peterMissionCompleteStartedAt >= MISSION_COMPLETE_DURATION) {
        finishPeterTask();
      }
      return;
    }
    if (vivianTaskActive) {
      updateVivianTask(now);
      player.walking = false;
      player.vx = 0;
      player.vy = 0;
      mosesPromptVisible = false;
      vivianPromptVisible = false;
      elimPromptVisible = false;
      peterPromptVisible = false;
      katePromptVisible = false;
      return;
    }
    if (elimTaskActive) {
      player.walking = false;
      player.vx = 0;
      player.vy = 0;
      mosesPromptVisible = false;
      vivianPromptVisible = false;
      elimPromptVisible = false;
      peterPromptVisible = false;
      katePromptVisible = false;
      if (elimMissionCompleteStartedAt && now - elimMissionCompleteStartedAt >= MISSION_COMPLETE_DURATION) {
        finishElimTask();
      }
      return;
    }
    if (kateDialogueActive) {
      player.walking = false;
      player.vx = 0;
      player.vy = 0;
      mosesPromptVisible = false;
      vivianPromptVisible = false;
      elimPromptVisible = false;
      peterPromptVisible = false;
      fuSienPromptVisible = false;
      katePromptVisible = false;
      return;
    }
    if (scene === "aquarium") {
      updateAquariumQuest(now);
      if (aquariumDialogueActive || crabHp <= 0 || missionCompleteStartedAt) {
        player.walking = false;
        player.vx *= Math.pow(0.001, dt);
        player.vy *= Math.pow(0.001, dt);
      } else {
        updateAquariumPlayer(dt, now);
      }
      crabPromptVisible = isPlayerNearBadCrab();
      if (missionCompleteStartedAt && now - missionCompleteStartedAt >= MISSION_COMPLETE_DURATION) {
        returnToPark();
      }
    } else {
      updatePlayer(dt, now);
      updateKateTask(dt, now);
    }

    mosesPromptVisible = isPlayerNearMoses();
    vivianPromptVisible = isPlayerNearVivian();
    elimPromptVisible = isPlayerNearElim();
    peterPromptVisible = isPlayerNearPeter();
    fuSienPromptVisible = isPlayerNearFuSien();
    katePromptVisible = isPlayerNearKate();

    if (scene === "park" && player.walking && player.grounded && Math.abs(player.vx) > 140 && Math.floor(elapsed * 7) !== Math.floor((elapsed - dt) * 7)) {
      spawnDust(player.facing);
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 85 * dt;
      particle.life -= dt;
      if (particle.life <= 0) particles.splice(i, 1);
    }

    const targetCamera = Math.max(0, Math.min(WORLD_W - W, player.x - W * 0.46));
    cameraX += (targetCamera - cameraX) * Math.min(1, dt * 5.5);
  }

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#3dc6ee");
    sky.addColorStop(1, "#a7e6cf");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    if (background.complete && background.naturalWidth) {
      ctx.drawImage(background, -cameraX, 0, MAP_W, H);
    }

    const light = ctx.createLinearGradient(0, 0, 120, 210);
    light.addColorStop(0, "rgba(255,251,188,.30)");
    light.addColorStop(1, "rgba(255,251,188,0)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, 160, 250);
  }

  function drawStoneText() {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 17px 'Microsoft JhengHei', sans-serif";
    for (const worldX of [1004]) {
      const screenX = Math.round(worldX - cameraX);
      if (screenX < -130 || screenX > W + 130) continue;
      ctx.fillStyle = "rgba(52,39,24,.34)";
      ctx.fillText("大林運動公園", screenX + 2, 647);
      ctx.fillStyle = "#4a3f2c";
      ctx.fillText("大林運動公園", screenX, 645);
      ctx.font = "700 8px monospace";
      ctx.fillStyle = "rgba(66,54,36,.78)";
      ctx.fillText("DALIN SPORTS PARK", screenX, 663);
      ctx.font = "900 17px 'Microsoft JhengHei', sans-serif";
    }
    ctx.restore();
  }

  function drawLeaves() {
    for (const leaf of leaves) {
      const x = (leaf.x + elapsed * leaf.drift + Math.sin(elapsed + leaf.phase) * 8 + W * 3) % W;
      const y = (leaf.y + elapsed * leaf.speed) % 625;
      ctx.fillStyle = leaf.phase % 2 > 1 ? "rgba(255,231,112,.72)" : "rgba(116,203,97,.75)";
      ctx.fillRect(Math.round(x), Math.round(y), leaf.size, Math.max(2, leaf.size - 1));
    }
  }

  function drawParticles() {
    for (const particle of particles) {
      const alpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = `rgba(235,218,144,${alpha * 0.8})`;
      ctx.fillRect(Math.round(particle.x - cameraX), Math.round(particle.y), particle.size, particle.size);
    }
  }

  function drawAquariumArea() {
    const x = Math.round(248 - cameraX);
    const y = 642;
    if (x < -170 || x > W + 40) return;

    ctx.save();
    ctx.fillStyle = "#342c25";
    ctx.fillRect(x - 5, y + 73, 130, 8);
    ctx.fillRect(x + 3, y + 81, 9, 25);
    ctx.fillRect(x + 108, y + 81, 9, 25);
    ctx.fillStyle = "#694b31";
    ctx.fillRect(x, y + 77, 120, 5);

    ctx.fillStyle = "#183948";
    ctx.fillRect(x - 3, y - 3, 126, 79);
    ctx.fillStyle = "#8de9ef";
    ctx.fillRect(x + 3, y + 4, 114, 65);
    ctx.fillStyle = "#4ec4dc";
    ctx.fillRect(x + 3, y + 21, 114, 48);
    ctx.fillStyle = "rgba(220,255,255,.72)";
    ctx.fillRect(x + 9, y + 8, 4, 36);
    ctx.fillRect(x + 17, y + 8, 2, 23);
    ctx.fillStyle = "#d4bd79";
    ctx.fillRect(x + 3, y + 62, 114, 7);
    ctx.fillStyle = "#4f8e47";
    ctx.fillRect(x + 24, y + 43, 4, 19);
    ctx.fillRect(x + 29, y + 48, 3, 14);
    ctx.fillRect(x + 91, y + 39, 4, 23);
    ctx.fillRect(x + 96, y + 47, 3, 15);

    for (const fish of [{ x: 48, y: 38, c: "#ffbf3f" }, { x: 77, y: 53, c: "#ef7450" }]) {
      ctx.fillStyle = fish.c;
      ctx.fillRect(x + fish.x, y + fish.y, 12, 6);
      ctx.beginPath();
      ctx.moveTo(x + fish.x, y + fish.y + 3);
      ctx.lineTo(x + fish.x - 6, y + fish.y - 1);
      ctx.lineTo(x + fish.x - 6, y + fish.y + 7);
      ctx.fill();
      ctx.fillStyle = "#24313a";
      ctx.fillRect(x + fish.x + 8, y + fish.y + 2, 2, 2);
    }

    const tx = x + 130;
    ctx.fillStyle = "#80532e";
    ctx.fillRect(tx, y + 79, 38, 20);
    ctx.fillStyle = "#c5813e";
    ctx.fillRect(tx + 3, y + 83, 32, 13);
    ctx.fillStyle = "#d9e1e0";
    ctx.fillRect(tx + 8, y + 67, 4, 17);
    ctx.fillRect(tx + 23, y + 69, 4, 14);
    ctx.fillStyle = "#d44b3d";
    ctx.fillRect(tx + 7, y + 64, 6, 5);
    ctx.fillStyle = "#f1bf3a";
    ctx.fillRect(tx + 22, y + 66, 6, 5);
    ctx.restore();
  }

  function drawGuzhengArea() {
    const x = Math.round(1090 - cameraX);
    const y = 674;
    if (x < -190 || x > W + 60) return;

    ctx.save();
    ctx.fillStyle = "#4b2617";
    ctx.fillRect(x + 12, y + 34, 132, 9);
    ctx.fillRect(x + 19, y + 43, 8, 35);
    ctx.fillRect(x + 129, y + 43, 8, 35);
    ctx.fillStyle = "#9d5a2e";
    ctx.fillRect(x, y + 13, 156, 22);
    ctx.fillStyle = "#d38a43";
    ctx.fillRect(x + 7, y + 8, 142, 18);
    ctx.fillStyle = "#f3c66d";
    for (let i = 0; i < 7; i += 1) ctx.fillRect(x + 13, y + 10 + i * 2, 126, 1);
    ctx.fillStyle = "#5b311d";
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 35 + i * 17, y + 11);
      ctx.lineTo(x + 39 + i * 17, y + 25);
      ctx.lineTo(x + 31 + i * 17, y + 25);
      ctx.fill();
    }

    const chairX = x + 166;
    ctx.fillStyle = "#54301d";
    ctx.fillRect(chairX, y + 34, 39, 8);
    ctx.fillRect(chairX + 4, y + 42, 6, 33);
    ctx.fillRect(chairX + 29, y + 42, 6, 33);
    ctx.fillStyle = "#ad6737";
    ctx.fillRect(chairX + 4, y + 29, 31, 8);
    ctx.restore();
  }

  function drawElimClassroomArea() {
    const x = Math.round(198 - cameraX);
    const surfaceY = 442;
    if (x < -160 || x > W + 60) return;

    ctx.save();
    // Rolling blackboard frame and four caster legs.
    ctx.fillStyle = "#5a3b25";
    ctx.fillRect(x + 7, surfaceY - 133, 132, 8);
    ctx.fillRect(x + 7, surfaceY - 133, 8, 91);
    ctx.fillRect(x + 131, surfaceY - 133, 8, 91);
    ctx.fillStyle = "#183c32";
    ctx.fillRect(x + 15, surfaceY - 125, 116, 74);
    ctx.fillStyle = "#275846";
    ctx.fillRect(x + 20, surfaceY - 120, 106, 64);
    ctx.strokeStyle = "rgba(230,244,211,.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 25, surfaceY - 114, 94, 50);

    ctx.font = "900 25px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f7f0d2";
    ctx.fillText("8+7=", x + 73, surfaceY - 89);

    ctx.fillStyle = "#765133";
    ctx.fillRect(x + 9, surfaceY - 50, 128, 7);
    ctx.fillRect(x + 25, surfaceY - 43, 7, 34);
    ctx.fillRect(x + 114, surfaceY - 43, 7, 34);
    ctx.fillRect(x + 14, surfaceY - 12, 24, 4);
    ctx.fillRect(x + 108, surfaceY - 12, 24, 4);
    ctx.fillStyle = "#2f3840";
    ctx.beginPath();
    ctx.arc(x + 20, surfaceY - 5, 5, 0, Math.PI * 2);
    ctx.arc(x + 126, surfaceY - 5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Chalk tray, felt eraser, and spare chalk.
    ctx.fillStyle = "#b88551";
    ctx.fillRect(x + 37, surfaceY - 47, 72, 5);
    ctx.fillStyle = "#e7c58e";
    ctx.fillRect(x + 49, surfaceY - 54, 28, 7);
    ctx.fillStyle = "#57504a";
    ctx.fillRect(x + 51, surfaceY - 58, 24, 5);
    ctx.fillStyle = "#f5e8c7";
    ctx.fillRect(x + 84, surfaceY - 52, 18, 3);
    ctx.restore();
  }

  function drawPeterPicnicArea() {
    const x = Math.round(625 - cameraX);
    const surfaceY = 238;
    if (x < -180 || x > W + 80) return;

    ctx.save();
    // Folded-edge picnic mat sits directly on the floating island.
    ctx.fillStyle = "rgba(70,41,32,.22)";
    ctx.beginPath();
    ctx.ellipse(x + 95, surfaceY - 4, 88, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#df765f";
    ctx.beginPath();
    ctx.moveTo(x + 3, surfaceY - 12);
    ctx.lineTo(x + 153, surfaceY - 12);
    ctx.lineTo(x + 173, surfaceY - 1);
    ctx.lineTo(x + 20, surfaceY - 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#f7d6a2";
    ctx.lineWidth = 3;
    for (let stripe = 28; stripe < 155; stripe += 32) {
      ctx.beginPath();
      ctx.moveTo(x + stripe, surfaceY - 12);
      ctx.lineTo(x + stripe + 16, surfaceY - 1);
      ctx.stroke();
    }

    // Hot pot, steaming broth, bowls, chopsticks, and shared utensils.
    const potX = x + 78;
    const potY = surfaceY - 47;
    ctx.fillStyle = "#6d2522";
    ctx.fillRect(potX - 3, potY + 10, 59, 25);
    ctx.fillStyle = "#bf5542";
    ctx.beginPath();
    ctx.ellipse(potX + 26, potY + 11, 30, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f2b34d";
    ctx.beginPath();
    ctx.ellipse(potX + 26, potY + 10, 23, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#64a451";
    ctx.fillRect(potX + 12, potY + 7, 8, 4);
    ctx.fillRect(potX + 35, potY + 11, 7, 3);
    ctx.strokeStyle = "#4f2923";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(potX - 3, potY + 20);
    ctx.lineTo(potX - 12, potY + 17);
    ctx.moveTo(potX + 56, potY + 20);
    ctx.lineTo(potX + 65, potY + 17);
    ctx.stroke();
    ctx.fillStyle = "#49332c";
    ctx.fillRect(potX + 7, potY + 35, 39, 5);

    ctx.strokeStyle = "rgba(255,255,233,.7)";
    ctx.lineWidth = 2;
    for (let steam = 0; steam < 3; steam += 1) {
      ctx.beginPath();
      ctx.moveTo(potX + 15 + steam * 12, potY + 2);
      ctx.quadraticCurveTo(potX + 9 + steam * 12, potY - 7, potX + 16 + steam * 12, potY - 14);
      ctx.stroke();
    }

    ctx.fillStyle = "#fff4da";
    ctx.beginPath();
    ctx.ellipse(x + 30, surfaceY - 23, 13, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 153, surfaceY - 24, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#744935";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 17, surfaceY - 37);
    ctx.lineTo(x + 49, surfaceY - 20);
    ctx.moveTo(x + 21, surfaceY - 40);
    ctx.lineTo(x + 53, surfaceY - 23);
    ctx.moveTo(x + 143, surfaceY - 19);
    ctx.lineTo(x + 171, surfaceY - 40);
    ctx.moveTo(x + 147, surfaceY - 17);
    ctx.lineTo(x + 175, surfaceY - 38);
    ctx.stroke();
    ctx.restore();
  }

  function getNpcUiColors(name) {
    if (name === "壞壞螃蟹") return NPC_UI_COLORS.Moses;
    if (name === "火蘑菇") return NPC_UI_COLORS.Kate;
    return NPC_UI_COLORS[name] || NPC_UI_COLORS.Kate;
  }

  function drawNpcName(name, screenX, topY, ownerName = name) {
    const colors = getNpcUiColors(ownerName);
    ctx.save();
    ctx.font = "900 11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const width = Math.ceil(ctx.measureText(name).width) + 18;
    ctx.fillStyle = colors.dark;
    ctx.fillRect(Math.round(screenX - width / 2), topY, width, 22);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(Math.round(screenX - width / 2) + 1, topY + 1, width - 2, 20);
    ctx.fillStyle = colors.panel;
    ctx.fillText(name, screenX, topY + 11);
    ctx.restore();
  }

  function drawNpcs() {
    for (const npc of npcs) {
      const screenX = Math.round(npc.x - cameraX);
      if (screenX < -100 || screenX > W + 100) continue;
      const kateRunBob = npc === parkKate && kateMoving
        ? -Math.round(Math.abs(Math.sin(elapsed * 15)) * 4)
        : 0;

      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = "#16341f";
      ctx.beginPath();
      ctx.ellipse(screenX, npc.y + 3, 25, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (npc.sprite.complete && npc.sprite.naturalWidth) {
        ctx.save();
        ctx.translate(screenX, npc.y - NPC_FOOT_OFFSET + kateRunBob);
        if (npc === parkKate && kateFacing > 0) ctx.scale(-1, 1);
        ctx.drawImage(npc.sprite, -NPC_SPRITE_W / 2, 0, NPC_SPRITE_W, NPC_SPRITE_H);
        ctx.restore();
      }
      const nameTopY = npc === parkPeter || npc === parkFuSien
        ? npc.y + 8
        : npc.y - NPC_VISIBLE_HEIGHT - 28;
      drawNpcName(npc.name, screenX, nameTopY);
    }
  }

  function drawParkChampionGathering() {
    const members = [
      { sprite: mosesSprite, x: parkMoses.x, y: parkMoses.y, david: false },
      { sprite: vivianSprite, x: parkVivian.x, y: parkVivian.y, david: false },
      { sprite: davidSprite, x: player.x, y: player.y, david: true },
      { sprite: kateSprite, x: parkKate.x, y: parkKate.y, david: false },
      { sprite: fuSienSprite, x: parkFuSien.x, y: parkFuSien.y, david: false },
      { sprite: peterSprite, x: parkPeter.x, y: parkPeter.y, david: false },
      { sprite: elimSprite, x: parkElim.x, y: parkElim.y, david: false },
    ];

    for (const member of members) {
      const screenX = Math.round(member.x - cameraX);
      const drawH = 192;
      const drawW = member.david ? 144 : NPC_SPRITE_W;
      const footOffset = member.david
        ? (171 / 192) * drawH
        : (NPC_FOOT_OFFSET / NPC_SPRITE_H) * drawH;

      ctx.save();
      ctx.fillStyle = "rgba(22,52,31,.24)";
      ctx.beginPath();
      ctx.ellipse(screenX, member.y + 3, 28, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      if (member.sprite.complete && member.sprite.naturalWidth) {
        ctx.drawImage(
          member.sprite,
          Math.round(screenX - drawW / 2),
          Math.round(member.y - footOffset),
          drawW,
          drawH,
        );
      }
      ctx.restore();
    }
  }

  function drawFireMushroom() {
    if (!fireMushroomSpawned) return;
    const now = performance.now();
    const screenX = Math.round(fireMushroom.x - cameraX);
    if (screenX < -130 || screenX > W + 130) return;
    const sinkProgress = fireMushroomDefeatStartedAt && now >= fireMushroomDefeatStartedAt
      ? Math.min(1, (now - fireMushroomDefeatStartedAt) / FIRE_MUSHROOM_SINK_DURATION)
      : 0;
    const bob = fireMushroomHp > 0 ? -Math.round(Math.abs(Math.sin(elapsed * 4)) * 2) : 0;
    const drawY = fireMushroom.y - 184 + bob + sinkProgress * 165;
    const sprite = now < fireMushroomHurtUntil || fireMushroomHp <= 0
      ? fireMushroomHurtSprite
      : fireMushroomSprite;

    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - sinkProgress);
    if (!sinkProgress) {
      ctx.fillStyle = "rgba(40,28,18,.22)";
      ctx.beginPath();
      ctx.ellipse(screenX, fireMushroom.y + 3, 31, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (sprite.complete && sprite.naturalWidth) {
      ctx.drawImage(sprite, screenX - 96, drawY, 192, 192);
    }
    ctx.restore();

    if (fireMushroomHp > 0) drawNpcName(fireMushroom.name, screenX, fireMushroom.y - 194, "Kate");
  }

  function roundedRectPath(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function drawMosesPrompt() {
    if (!mosesPromptVisible || scene !== "park") return;
    const colors = NPC_UI_COLORS.Moses;
    const screenX = Math.round(parkMoses.x - cameraX);
    const bounce = Math.round(Math.sin(elapsed * 4.8) * 2);
    const width = 112;
    const height = 46;
    const x = Math.round(screenX - width / 2);
    const y = Math.round(parkMoses.y - NPC_VISIBLE_HEIGHT - 95 + bounce);

    ctx.save();
    ctx.fillStyle = "rgba(28,35,42,.3)";
    roundedRectPath(x + 4, y + 5, width, height, 9);
    ctx.fill();

    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    roundedRectPath(x, y, width, height, 9);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    roundedRectPath(x + 5, y + 5, width - 10, height - 10, 5);
    ctx.stroke();

    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(screenX - 10, y + height - 2);
    ctx.lineTo(screenX, y + height + 12);
    ctx.lineTo(screenX + 10, y + height - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = colors.text;
    ctx.font = "900 15px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("需要幫忙", screenX, y + 23);
    ctx.restore();
  }

  function drawVivianPrompt() {
    if (!vivianPromptVisible || scene !== "park" || vivianTaskActive) return;
    const colors = NPC_UI_COLORS.Vivian;
    const screenX = Math.round(parkVivian.x - cameraX);
    const bounce = Math.round(Math.sin(elapsed * 4.8 + 1.1) * 2);
    const width = 208;
    const height = 46;
    const x = Math.round(screenX - width / 2);
    const y = Math.round(parkVivian.y - NPC_VISIBLE_HEIGHT - 95 + bounce);

    ctx.save();
    ctx.fillStyle = "rgba(28,35,42,.3)";
    roundedRectPath(x + 4, y + 5, width, height, 9);
    ctx.fill();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    roundedRectPath(x, y, width, height, 9);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    roundedRectPath(x + 5, y + 5, width - 10, height - 10, 5);
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(screenX - 10, y + height - 2);
    ctx.lineTo(screenX, y + height + 12);
    ctx.lineTo(screenX + 10, y + height - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.text;
    ctx.font = "900 15px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("想彈彈看古箏嗎？", screenX, y + 23);
    ctx.restore();
  }

  function drawElimPrompt() {
    if (!elimPromptVisible || scene !== "park" || elimTaskActive) return;
    const colors = NPC_UI_COLORS.Elim;
    const screenX = Math.round(parkElim.x - cameraX);
    const bounce = Math.round(Math.sin(elapsed * 4.8 + 2.2) * 2);
    const width = 170;
    const height = 46;
    const x = Math.round(screenX - width / 2);
    const y = Math.round(parkElim.y - NPC_VISIBLE_HEIGHT - 95 + bounce);

    ctx.save();
    ctx.fillStyle = "rgba(28,35,42,.3)";
    roundedRectPath(x + 4, y + 5, width, height, 9);
    ctx.fill();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    roundedRectPath(x, y, width, height, 9);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    roundedRectPath(x + 5, y + 5, width - 10, height - 10, 5);
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(screenX - 10, y + height - 2);
    ctx.lineTo(screenX, y + height + 12);
    ctx.lineTo(screenX + 10, y + height - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.text;
    ctx.font = "900 15px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("麻～湊格欺負我！", screenX, y + 23);
    ctx.restore();
  }

  function drawPeterPrompt() {
    if (!peterPromptVisible || scene !== "park" || peterTaskActive) return;
    const colors = NPC_UI_COLORS.Peter;
    const screenX = Math.round(parkPeter.x - cameraX);
    const bounce = Math.round(Math.sin(elapsed * 4.8 + 3.1) * 2);
    const width = 158;
    const height = 46;
    const x = Math.round(screenX - width / 2);
    const y = parkPeter.y + 39 + bounce;

    ctx.save();
    ctx.fillStyle = "rgba(28,35,42,.3)";
    roundedRectPath(x + 4, y + 5, width, height, 9);
    ctx.fill();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    roundedRectPath(x, y, width, height, 9);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    roundedRectPath(x + 5, y + 5, width - 10, height - 10, 5);
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(screenX - 10, y + 2);
    ctx.lineTo(screenX, y - 12);
    ctx.lineTo(screenX + 10, y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.text;
    ctx.font = "900 15px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("白癡，怎麼了？", screenX, y + 23);
    ctx.restore();
  }

  function drawFuSienPrompt() {
    if (!fuSienPromptVisible || scene !== "park" || fuSienTaskActive) return;
    const colors = NPC_UI_COLORS.Rollins;
    const screenX = Math.round(parkFuSien.x - cameraX);
    const bounce = Math.round(Math.sin(elapsed * 4.8 + 4) * 2);
    const width = 264;
    const height = 46;
    const x = Math.round(screenX - width / 2);
    const y = parkFuSien.y + 39 + bounce;

    ctx.save();
    ctx.fillStyle = "rgba(28,35,42,.3)";
    roundedRectPath(x + 4, y + 5, width, height, 9);
    ctx.fill();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    roundedRectPath(x, y, width, height, 9);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    roundedRectPath(x + 5, y + 5, width - 10, height - 10, 5);
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(screenX - 10, y + 2);
    ctx.lineTo(screenX, y - 12);
    ctx.lineTo(screenX + 10, y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.text;
    ctx.font = "900 14px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("吼吼吼吼吼吼吼～吼吼吼吼吼～", screenX, y + 23);
    ctx.restore();
  }

  function drawKatePrompt() {
    if (!katePromptVisible || scene !== "park" || kateTaskActive) return;
    const colors = NPC_UI_COLORS.Kate;
    const screenX = Math.round(parkKate.x - cameraX);
    const bounce = Math.round(Math.sin(elapsed * 4.8 + 5.1) * 2);
    const width = 154;
    const height = 46;
    const x = Math.round(screenX - width / 2);
    const y = Math.round(parkKate.y - NPC_VISIBLE_HEIGHT - 95 + bounce);

    ctx.save();
    ctx.fillStyle = "rgba(28,35,42,.3)";
    roundedRectPath(x + 4, y + 5, width, height, 9);
    ctx.fill();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    roundedRectPath(x, y, width, height, 9);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    roundedRectPath(x + 5, y + 5, width - 10, height - 10, 5);
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(screenX - 10, y + height - 2);
    ctx.lineTo(screenX, y + height + 12);
    ctx.lineTo(screenX + 10, y + height - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.text;
    ctx.font = "900 15px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("我要去洗澡了", screenX, y + 23);
    ctx.restore();
  }

  function drawKateTaskSpeech() {
    if (!kateSpeechText || performance.now() >= kateSpeechUntil || scene !== "park") return;
    const colors = NPC_UI_COLORS.Kate;
    const screenX = Math.round(parkKate.x - cameraX);
    const width = kateSpeechText.includes("～") ? 188 : 150;
    const height = 48;
    const x = Math.max(8, Math.min(W - width - 8, Math.round(screenX - width / 2)));
    const y = Math.round(parkKate.y - NPC_VISIBLE_HEIGHT - 95);
    const tailX = Math.max(x + 20, Math.min(x + width - 20, screenX));

    ctx.save();
    ctx.fillStyle = "rgba(28,35,42,.3)";
    roundedRectPath(x + 4, y + 5, width, height, 9);
    ctx.fill();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    roundedRectPath(x, y, width, height, 9);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    roundedRectPath(x + 5, y + 5, width - 10, height - 10, 5);
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(tailX - 9, y + height - 2);
    ctx.lineTo(tailX, y + height + 12);
    ctx.lineTo(tailX + 9, y + height - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.text;
    ctx.font = "900 15px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(kateSpeechText, x + width / 2, y + 24);
    ctx.restore();
  }

  function drawAquariumBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#8de7f5");
    gradient.addColorStop(0.2, "#20badd");
    gradient.addColorStop(1, "#063f79");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    if (aquariumBackground.complete && aquariumBackground.naturalWidth) {
      ctx.drawImage(aquariumBackground, -cameraX, 0, MAP_W, H);
    }
  }

  function drawAquariumMoses() {
    const bob = Math.round(Math.sin(elapsed * 2.2 + 1.4) * 2);
    const x = Math.round(aquariumMoses.x - cameraX);
    const y = aquariumMoses.y + bob;
    if (x < -100 || x > W + 100) return;
    if (aquariumMoses.sprite.complete && aquariumMoses.sprite.naturalWidth) {
      ctx.drawImage(
        aquariumMoses.sprite,
        x - NPC_SPRITE_W / 2,
        y - NPC_FOOT_OFFSET,
        NPC_SPRITE_W,
        NPC_SPRITE_H,
      );
    }
    drawNpcName(aquariumMoses.name, x, y - NPC_VISIBLE_HEIGHT - 28);
  }

  function drawAquariumBadCrab() {
    const now = performance.now();
    const bob = Math.round(Math.sin(elapsed * 2.7 + 0.8) * 1.5);
    let worldX = aquariumBadCrab.x;
    let worldY = aquariumBadCrab.y + bob;
    let escaping = false;
    if (crabEscapeStartedAt && now >= crabEscapeStartedAt) {
      const progress = Math.min(1, (now - crabEscapeStartedAt) / CRAB_ESCAPE_DURATION);
      if (progress >= 1) return;
      const eased = progress * progress * (3 - 2 * progress);
      escaping = true;
      worldX += Math.sin(progress * Math.PI * 6) * 12;
      worldY -= eased * (aquariumBadCrab.y + 125);
    }
    const x = Math.round(worldX - cameraX);
    const y = Math.round(worldY);
    if (x < -110 || x > W + 110) return;

    if (!escaping) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = "#102f36";
      ctx.beginPath();
      ctx.ellipse(x, y + 1, 42, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const sprite = now < crabHurtUntil || crabHp <= 0 ? badCrabHurtSprite : aquariumBadCrab.sprite;
    if (sprite.complete && sprite.naturalWidth) {
      ctx.save();
      ctx.translate(x, y - NPC_FOOT_OFFSET);
      if (escaping) ctx.rotate(Math.sin((now - crabEscapeStartedAt) * 0.024) * 0.035);
      ctx.drawImage(
        sprite,
        -NPC_SPRITE_W / 2,
        0,
        NPC_SPRITE_W,
        NPC_SPRITE_H,
      );
      ctx.restore();
    }
    if (crabHp > 0) drawNpcName(aquariumBadCrab.name, x, y - 124);
  }

  function drawAquariumForeground() {
    ctx.save();
    ctx.fillStyle = "rgba(7,139,196,.09)";
    ctx.fillRect(0, AQUARIUM_SURFACE_Y, W, H - AQUARIUM_SURFACE_Y);

    ctx.strokeStyle = "rgba(221,252,255,.86)";
    ctx.lineWidth = 2;
    for (let segment = -1; segment < 9; segment += 1) {
      const x = segment * 62 + ((elapsed * 15) % 62);
      const wave = Math.sin(elapsed * 2.6 + segment) * 2;
      ctx.beginPath();
      ctx.moveTo(x, AQUARIUM_SURFACE_Y + wave);
      ctx.lineTo(x + 31, AQUARIUM_SURFACE_Y - 1 - wave);
      ctx.stroke();
    }

    for (const bubble of aquariumBubbles) {
      const y = AQUARIUM_SURFACE_Y + ((bubble.y - AQUARIUM_SURFACE_Y - elapsed * bubble.speed + H * 4) % (H - AQUARIUM_SURFACE_Y));
      const x = bubble.x + Math.sin(elapsed * 1.8 + bubble.phase) * 5;
      ctx.strokeStyle = "rgba(223,251,255,.62)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, bubble.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.45)";
      ctx.fillRect(Math.round(x - 1), Math.round(y - bubble.radius + 1), 1, 1);
    }
    ctx.restore();
  }

  function drawTopProgressBar(label, current, maximum, fillColor, options = {}) {
    const colors = options.colors || null;
    const width = 266;
    const height = 50;
    const x = Math.round((W - width) / 2);
    const y = options.y ?? 17;
    const fraction = Math.max(0, Math.min(1, current / maximum));

    ctx.save();
    ctx.globalAlpha = colors ? 0.76 : 1;
    ctx.fillStyle = colors ? colors.dark : "rgba(14,34,42,.58)";
    ctx.strokeStyle = colors ? colors.accent : "rgba(255,240,162,.82)";
    ctx.lineWidth = 3;
    roundedRectPath(x, y, width, height, 8);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.font = "900 14px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = colors ? colors.panel : "#fffbe1";
    ctx.fillText(label, W / 2, y + 17);

    const trackX = x + 12;
    const trackY = y + 31;
    const trackW = width - 24;
    const trackH = 10;
    ctx.fillStyle = "rgba(24,39,41,.58)";
    ctx.fillRect(trackX, trackY, trackW, trackH);
    if (fraction > 0) {
      ctx.globalAlpha = 0.78;
      ctx.fillStyle = fillColor;
      ctx.fillRect(trackX + 2, trackY + 2, Math.round((trackW - 4) * fraction), trackH - 4);
      ctx.fillStyle = "rgba(255,255,255,.42)";
      ctx.fillRect(trackX + 2, trackY + 2, Math.round((trackW - 4) * fraction), 2);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = colors ? colors.soft : "rgba(120,155,135,.78)";
    ctx.lineWidth = 2;
    ctx.strokeRect(trackX, trackY, trackW, trackH);
    ctx.restore();
  }

  function drawParkMissionProgress() {
    drawTopProgressBar(`打敗怪人${completedNpcTasks}/6`, completedNpcTasks, 6, "#f1b53c");
  }

  function drawParkChampionBanner() {
    if (!parkChampionActive || performance.now() >= parkChampionBannerUntil) return;
    const pulse = 1 + Math.sin(elapsed * 8) * 0.012;
    ctx.save();
    ctx.fillStyle = "rgba(20,45,28,.24)";
    ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2, H * 0.43);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "rgba(37,94,54,.94)";
    ctx.strokeStyle = "#ffe36c";
    ctx.lineWidth = 5;
    roundedRectPath(-194, -52, 388, 104, 13);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff9d8";
    ctx.font = "900 25px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("恭喜你成為公園之王！", 0, 0);
    ctx.restore();
  }

  function drawCrabHpBar() {
    if (aquariumDialogueActive || missionCompleteStartedAt) return;
    drawTopProgressBar(`壞壞螃蟹 HP ${crabHp}/${CRAB_MAX_HP}`, crabHp, CRAB_MAX_HP, NPC_UI_COLORS.Moses.accent, { colors: NPC_UI_COLORS.Moses });
  }

  function drawFireMushroomHpBar() {
    if (!fireMushroomSpawned || kateMissionCompleteStartedAt) return;
    drawTopProgressBar(
      `火蘑菇 HP ${fireMushroomHp}/${FIRE_MUSHROOM_MAX_HP}`,
      fireMushroomHp,
      FIRE_MUSHROOM_MAX_HP,
      NPC_UI_COLORS.Kate.accent,
      { colors: NPC_UI_COLORS.Kate, y: 73 },
    );
  }

  function drawKateMissionComplete() {
    if (!kateMissionCompleteStartedAt) return;
    const colors = NPC_UI_COLORS.Kate;
    const pulse = 1 + Math.sin(elapsed * 7) * 0.015;
    ctx.save();
    ctx.fillStyle = "rgba(18,45,28,.28)";
    ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2, H * 0.45);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = colors.dark;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 5;
    roundedRectPath(-138, -50, 276, 100, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.font = "900 30px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("完成任務", 0, 0);
    ctx.restore();
  }

  function drawCrabPrompt() {
    if (!crabPromptVisible || aquariumDialogueActive || crabHp <= 0) return;
    const colors = NPC_UI_COLORS.Moses;
    const screenX = Math.round(aquariumBadCrab.x - cameraX);
    const width = 154;
    const height = 48;
    const x = Math.max(8, Math.min(W - width - 8, Math.round(screenX - width / 2)));
    const y = aquariumBadCrab.y - 184;
    const tailX = Math.max(x + 20, Math.min(x + width - 20, screenX));

    ctx.save();
    ctx.fillStyle = "rgba(20,30,38,.28)";
    roundedRectPath(x + 4, y + 5, width, height, 9);
    ctx.fill();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 4;
    roundedRectPath(x, y, width, height, 9);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tailX - 9, y + height - 2);
    ctx.lineTo(tailX, y + height + 12);
    ctx.lineTo(tailX + 9, y + height - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.text;
    ctx.font = "900 15px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("這些魚真新鮮！", x + width / 2, y + 24);
    ctx.restore();
  }

  function drawAquariumDialogue() {
    if (!aquariumDialogueActive) return;
    const colors = NPC_UI_COLORS.Moses;
    const x = 20;
    const y = 540;
    const width = 410;
    const height = 215;

    ctx.save();
    ctx.fillStyle = "rgba(3,18,29,.28)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(20,31,38,.42)";
    roundedRectPath(x + 5, y + 7, width, height, 12);
    ctx.fill();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 5;
    roundedRectPath(x, y, width, height, 12);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    roundedRectPath(x + 7, y + 7, width - 14, height - 14, 7);
    ctx.stroke();

    if (mosesSprite.complete && mosesSprite.naturalWidth) {
      ctx.drawImage(mosesSprite, x + 4, y + 61, 132, 141);
    }
    ctx.fillStyle = colors.text;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "900 18px 'Microsoft JhengHei', sans-serif";
    ctx.fillText("Moses", x + 136, y + 35);
    ctx.font = "900 16px 'Microsoft JhengHei', sans-serif";
    const dialogueLines = aquariumDialoguePage === 0
      ? ["最近川普、早苗一直找我，", "比較沒時間照顧魚"]
      : ["搞得魚都怪怪的，", "你幫我到處看看、", "檢查一下好嗎？"];
    const firstLineY = aquariumDialoguePage === 0 ? y + 88 : y + 77;
    dialogueLines.forEach((line, index) => ctx.fillText(line, x + 136, firstLineY + index * 33));

    ctx.textAlign = "right";
    ctx.font = "700 12px 'Microsoft JhengHei', sans-serif";
    ctx.fillStyle = colors.dark;
    ctx.fillText("繼續 ▶", x + width - 18, y + height - 21);
    ctx.restore();
  }

  function drawMissionComplete() {
    if (!missionCompleteStartedAt) return;
    const colors = NPC_UI_COLORS.Moses;
    const pulse = 1 + Math.sin(elapsed * 7) * 0.015;
    ctx.save();
    ctx.translate(W / 2, H * 0.45);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = colors.dark;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 5;
    roundedRectPath(-138, -50, 276, 100, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.font = "900 30px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("完成任務", 0, 0);
    ctx.restore();
  }

  function getGuzhengStringIndex(point) {
    if (!vivianTaskActive || vivianDialogueActive || point.y < GUZHENG_STRING_TOP || point.y > GUZHENG_STRING_BOTTOM) return -1;
    const index = Math.round((point.x - GUZHENG_STRING_LEFT) / GUZHENG_STRING_SPACING);
    if (index < 0 || index >= GUZHENG_STRING_COUNT) return -1;
    const stringX = GUZHENG_STRING_LEFT + index * GUZHENG_STRING_SPACING;
    return Math.abs(point.x - stringX) <= GUZHENG_STRING_SPACING * 0.58 ? index : -1;
  }

  function isPointOnVivianCompleteButton(point) {
    return vivianCompletionReady
      && point.x >= 142
      && point.x <= 308
      && point.y >= 680
      && point.y <= 728;
  }

  function drawVivianCompletionButton() {
    if (!vivianCompletionReady) return;
    const colors = NPC_UI_COLORS.Vivian;
    const pulse = 1 + Math.sin(elapsed * 5.5) * 0.012;
    ctx.save();
    ctx.translate(W / 2, 704);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = colors.dark;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 4;
    roundedRectPath(-83, -24, 166, 48, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.font = "900 20px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("完成任務", 0, 0);
    ctx.restore();
  }

  function drawVivianTaskOverlay() {
    if (!vivianTaskActive) return;
    const colors = NPC_UI_COLORS.Vivian;
    const now = performance.now();
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.78)";
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.88;
    ctx.fillStyle = colors.dark;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    roundedRectPath(76, 18, 298, 56, 9);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.panel;
    ctx.font = "900 23px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Vivian的古箏", W / 2, 46);

    if (guzhengBody.complete && guzhengBody.naturalWidth) {
      ctx.save();
      ctx.translate(W / 2, 410);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(guzhengBody, -305, -145, 610, 290);
      ctx.restore();
    }

    for (let index = 0; index < GUZHENG_STRING_COUNT; index += 1) {
      const x = GUZHENG_STRING_LEFT + index * GUZHENG_STRING_SPACING;
      const glowing = now < guzhengStringGlowUntil[index];
      const vibration = glowing ? Math.sin(elapsed * 70 + index) * 1.8 : 0;
      const bridgeY = 455 + Math.sin(index * 0.83) * 38;

      ctx.strokeStyle = glowing ? "rgba(255,249,184,.98)" : index % 5 === 0 ? "rgba(255,228,127,.95)" : "rgba(238,224,183,.9)";
      ctx.lineWidth = glowing ? 3 : 1.35;
      ctx.beginPath();
      ctx.moveTo(x, GUZHENG_STRING_TOP);
      ctx.quadraticCurveTo(x + vibration, bridgeY, x, GUZHENG_STRING_BOTTOM);
      ctx.stroke();

      ctx.fillStyle = glowing ? "#fffbd0" : "#7b341e";
      ctx.strokeStyle = "#3d2117";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 5, bridgeY + 7);
      ctx.lineTo(x, bridgeY - 7);
      ctx.lineTo(x + 5, bridgeY + 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    drawVivianCompletionButton();

    ctx.globalAlpha = 0.88;
    ctx.fillStyle = colors.dark;
    roundedRectPath(62, vivianCompletionReady ? 738 : 724, 326, vivianCompletionReady ? 40 : 48, 8);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.panel;
    ctx.font = "900 13px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("觸碰琴弦即可演奏", W / 2, vivianCompletionReady ? 758 : 748);
    ctx.restore();
  }

  function drawVivianDialogue() {
    if (!vivianDialogueActive) return;
    const colors = NPC_UI_COLORS.Vivian;
    const x = 20;
    const y = 555;
    const width = 410;
    const height = 200;

    ctx.save();
    ctx.fillStyle = "rgba(40,88,111,.24)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(85,159,196,.38)";
    roundedRectPath(x + 5, y + 7, width, height, 12);
    ctx.fill();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 5;
    roundedRectPath(x, y, width, height, 12);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    roundedRectPath(x + 7, y + 7, width - 14, height - 14, 7);
    ctx.stroke();

    if (vivianSprite.complete && vivianSprite.naturalWidth) {
      ctx.drawImage(vivianSprite, x + 3, y + 52, 132, 141);
    }
    ctx.fillStyle = colors.text;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "900 18px 'Microsoft JhengHei', sans-serif";
    ctx.fillText("Vivian", x + 136, y + 36);
    ctx.font = "900 17px 'Microsoft JhengHei', sans-serif";
    const dialogue = vivianDialoguePage === 0
      ? "你彈得真是太棒了！"
      : "耶穌愛你！我也愛你！";
    ctx.fillText(dialogue, x + 136, y + 91);

    ctx.textAlign = "right";
    ctx.font = "700 12px 'Microsoft JhengHei', sans-serif";
    ctx.fillStyle = colors.dark;
    ctx.fillText("繼續 ▶", x + width - 18, y + height - 21);
    ctx.restore();
  }

  function drawKateTaskOverlay() {
    if (!kateDialogueActive) return;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.78)";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function drawKateDialogue() {
    if (!kateDialogueActive) return;
    const colors = NPC_UI_COLORS.Kate;
    const x = 20;
    const y = 555;
    const width = 410;
    const height = 200;

    ctx.save();
    ctx.fillStyle = "rgba(33,79,49,.24)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(40,102,61,.38)";
    roundedRectPath(x + 5, y + 7, width, height, 12);
    ctx.fill();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 5;
    roundedRectPath(x, y, width, height, 12);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    roundedRectPath(x + 7, y + 7, width - 14, height - 14, 7);
    ctx.stroke();

    if (kateSprite.complete && kateSprite.naturalWidth) {
      ctx.drawImage(kateSprite, x + 3, y + 52, 132, 141);
    }
    ctx.fillStyle = colors.text;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "900 18px 'Microsoft JhengHei', sans-serif";
    ctx.fillText("Kate", x + 136, y + 36);
    ctx.font = "900 16px 'Microsoft JhengHei', sans-serif";
    ctx.textBaseline = "top";
    drawWrappedText(KATE_DIALOGUE_LINES[kateDialoguePage], x + 136, y + 76, 246, 28, 3);

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = "700 12px 'Microsoft JhengHei', sans-serif";
    ctx.fillStyle = colors.dark;
    ctx.fillText("繼續 ▶", x + width - 18, y + height - 21);
    ctx.restore();
  }

  function drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines = 5) {
    const lines = [];
    for (const paragraph of String(text).split("\n")) {
      let line = "";
      for (const character of paragraph) {
        const candidate = line + character;
        if (line && ctx.measureText(candidate).width > maxWidth) {
          lines.push(line);
          line = character;
        } else {
          line = candidate;
        }
      }
      if (line) lines.push(line);
    }
    lines.slice(0, maxLines).forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
    return Math.min(lines.length, maxLines);
  }

  function getElimAnswerIndex(point) {
    if (!elimTaskActive || elimDialogueActive || elimMissionCompleteStartedAt) return -1;
    if (point.x < 38 || point.x > 412) return -1;
    for (let index = 0; index < 4; index += 1) {
      const y = 345 + index * 82;
      if (point.y >= y && point.y <= y + 68) return index;
    }
    return -1;
  }

  function drawElimTaskOverlay() {
    if (!elimTaskActive) return;
    const colors = NPC_UI_COLORS.Elim;
    const question = elimQuestions[elimQuestionIndex];
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.8)";
    ctx.fillRect(0, 0, W, H);

    const headerGradient = ctx.createLinearGradient(32, 0, 418, 0);
    headerGradient.addColorStop(0, "#9b7957");
    headerGradient.addColorStop(0.5, colors.dark);
    headerGradient.addColorStop(1, "#9b7957");
    ctx.fillStyle = headerGradient;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 4;
    roundedRectPath(32, 18, 386, 70, 13);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.font = "900 22px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("百萬富翁大挑戰", W / 2, 44);
    ctx.font = "800 13px 'Microsoft JhengHei', sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(`第 ${elimQuestionIndex + 1} / ${elimQuestions.length} 題`, W / 2, 70);

    ctx.fillStyle = "rgba(101,72,46,.94)";
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    roundedRectPath(22, 104, 406, 220, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.font = "900 18px 'Microsoft JhengHei', sans-serif";
    ctx.fillText(question.category, W / 2, 132);
    ctx.fillStyle = "#fff";
    ctx.font = "900 16px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    drawWrappedText(question.question, 46, 166, 358, 28, 5);

    question.answers.forEach((answer, index) => {
      const y = 345 + index * 82;
      const optionGradient = ctx.createLinearGradient(38, y, 412, y);
      optionGradient.addColorStop(0, "rgba(139,105,73,.96)");
      optionGradient.addColorStop(0.5, "rgba(101,72,46,.96)");
      optionGradient.addColorStop(1, "rgba(139,105,73,.96)");
      ctx.fillStyle = optionGradient;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 3;
      roundedRectPath(38, y, 374, 68, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.panel;
      ctx.font = "900 18px 'Microsoft JhengHei', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`(${String.fromCharCode(65 + index)})`, 66, y + 34);
      ctx.fillStyle = "#fff";
      ctx.font = "800 14px 'Microsoft JhengHei', sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const answerLines = answer.length > 22 ? 2 : 1;
      drawWrappedText(answer, 92, y + (answerLines === 2 ? 14 : 25), 296, 22, 2);
    });
    ctx.restore();
  }

  function drawElimDialogue() {
    if (!elimDialogueActive) return;
    const colors = NPC_UI_COLORS.Elim;
    const x = 20;
    const y = 540;
    const width = 410;
    const height = 215;
    const lines = elimDialogueKind === "final"
      ? ["讀書的小朋友最可愛了！", "機會是留給喜歡奶茶色的人！"]
      : ["你沒有讀書！", "再給你一次機會！"];

    ctx.save();
    ctx.fillStyle = "rgba(35,24,47,.28)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(73,52,38,.42)";
    roundedRectPath(x + 5, y + 7, width, height, 12);
    ctx.fill();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 5;
    roundedRectPath(x, y, width, height, 12);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    roundedRectPath(x + 7, y + 7, width - 14, height - 14, 7);
    ctx.stroke();
    if (elimSprite.complete && elimSprite.naturalWidth) ctx.drawImage(elimSprite, x + 3, y + 64, 132, 141);
    ctx.fillStyle = colors.text;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "900 18px 'Microsoft JhengHei', sans-serif";
    ctx.fillText("Elim", x + 136, y + 38);
    ctx.font = "900 16px 'Microsoft JhengHei', sans-serif";
    drawWrappedText(lines[elimDialoguePage], x + 136, y + 84, 250, 30, 3);
    ctx.textAlign = "right";
    ctx.font = "700 12px 'Microsoft JhengHei', sans-serif";
    ctx.fillStyle = colors.dark;
    ctx.fillText("繼續 ▶", x + width - 18, y + height - 21);
    ctx.restore();
  }

  function drawElimMissionComplete() {
    if (!elimMissionCompleteStartedAt) return;
    const colors = NPC_UI_COLORS.Elim;
    const pulse = 1 + Math.sin(elapsed * 7) * 0.015;
    ctx.save();
    ctx.fillStyle = "rgba(73,52,38,.3)";
    ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2, H * 0.45);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = colors.dark;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 5;
    roundedRectPath(-138, -50, 276, 100, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.font = "900 30px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("完成任務", 0, 0);
    ctx.restore();
  }

  function drawPicnicBoilingEffect() {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(225, 250, 151, 151, 0, 0, Math.PI * 2);
    ctx.clip();
    for (let index = 0; index < 20; index += 1) {
      const phase = elapsed * (1.7 + (index % 4) * 0.24) + index * 1.73;
      const orbit = 26 + (index % 6) * 20;
      const x = 225 + Math.cos(phase * 0.83) * orbit;
      const y = 250 + Math.sin(phase) * orbit * 0.72;
      const radius = 2.5 + ((index * 7) % 8) + Math.sin(phase * 2.4) * 1.3;
      ctx.strokeStyle = `rgba(255,247,191,${0.38 + (index % 4) * 0.1})`;
      ctx.lineWidth = 1.5 + (index % 3) * 0.6;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.5, radius), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,224,.25)";
      ctx.beginPath();
      ctx.arc(x - radius * 0.28, y - radius * 0.3, Math.max(1, radius * 0.22), 0, Math.PI * 2);
      ctx.fill();
    }
    const shimmer = ctx.createRadialGradient(225, 250, 20, 225, 250, 148);
    shimmer.addColorStop(0, `rgba(255,224,100,${0.05 + Math.sin(elapsed * 3) * 0.025})`);
    shimmer.addColorStop(1, "rgba(255,170,30,0)");
    ctx.fillStyle = shimmer;
    ctx.fillRect(70, 95, 310, 310);
    ctx.restore();
  }

  function drawPicnicTimerBar() {
    const colors = NPC_UI_COLORS.Peter;
    const x = 69;
    const y = 16;
    const width = 312;
    const height = 58;
    const cookElapsedMs = picnicCookStartedAt ? Math.max(0, performance.now() - picnicCookStartedAt) : 0;
    const displayedSeconds = (Math.floor(cookElapsedMs / 100) / 10).toFixed(1);
    const timerProgress = Math.min(1, cookElapsedMs / 3500);
    ctx.save();
    ctx.fillStyle = colors.dark;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 4;
    roundedRectPath(x, y, width, height, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.font = "900 16px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("計時", x + 16, y + 21);
    ctx.textAlign = "right";
    ctx.font = "900 17px 'Microsoft JhengHei', monospace";
    ctx.fillText(`${displayedSeconds}秒`, x + width - 16, y + 21);
    ctx.fillStyle = "rgba(21,17,15,.72)";
    roundedRectPath(x + 14, y + 38, width - 28, 9, 4);
    ctx.fill();
    if (timerProgress > 0) {
      ctx.fillStyle = timerProgress >= 1 ? "#8d949d" : colors.accent;
      roundedRectPath(x + 14, y + 38, (width - 28) * timerProgress, 9, 4);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255,242,180,.55)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawPicnicIngredients() {
    for (const ingredient of picnicIngredients) {
      if (ingredient.processed) continue;
      if (!ingredient.image.complete || !ingredient.image.naturalWidth) continue;
      ctx.save();
      const isActive = picnicActiveIngredient === ingredient;
      ctx.shadowColor = isActive ? "rgba(255,239,123,.9)" : "rgba(82,43,12,.34)";
      ctx.shadowBlur = isActive ? 12 : 5;
      ctx.shadowOffsetY = isActive ? 0 : 3;
      ctx.drawImage(ingredient.image, ingredient.x, ingredient.y, ingredient.size, ingredient.size);
      ctx.restore();
    }
  }

  function drawPeterDialogueButton(x, y, width, label, accent) {
    ctx.fillStyle = accent;
    ctx.strokeStyle = NPC_UI_COLORS.Peter.accent;
    ctx.lineWidth = 3;
    roundedRectPath(x, y, width, 48, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = NPC_UI_COLORS.Peter.panel;
    ctx.font = "900 16px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + width / 2, y + 24);
  }

  function drawPeterDialogue() {
    if (!peterDialogueActive) return;
    const colors = NPC_UI_COLORS.Peter;
    const x = 20;
    const y = 520;
    const width = 410;
    const height = 235;
    const isIntroChoice = peterDialogueKind === "intro" && peterDialoguePage === PETER_DIALOGUE_LINES.length - 1;
    const message = peterDialogueKind === "intro"
      ? PETER_DIALOGUE_LINES[peterDialoguePage]
      : peterDialogueKind === "success"
        ? "好吃！"
        : peterDialogueKind === "retry"
          ? "請重煮一遍！"
          : "地瓜葉不是媽媽煮的，我不吃，請丟垃圾桶";

    ctx.save();
    ctx.fillStyle = "rgba(5,7,9,.48)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 5;
    roundedRectPath(x, y, width, height, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.soft;
    roundedRectPath(x + 14, y + 15, 108, 128, 10);
    ctx.fill();
    if (peterSprite.complete && peterSprite.naturalWidth) {
      ctx.save();
      ctx.beginPath();
      roundedRectPath(x + 18, y + 18, 100, 122, 8);
      ctx.clip();
      ctx.drawImage(peterSprite, x + 17, y + 8, 102, 128);
      ctx.restore();
    }
    ctx.fillStyle = colors.text;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "900 19px 'Microsoft JhengHei', sans-serif";
    ctx.fillText("Peter", x + 140, y + 34);
    ctx.font = "900 16px 'Microsoft JhengHei', sans-serif";
    drawWrappedText(message, x + 140, y + 72, 245, 29, isIntroChoice ? 3 : 4);

    if (isIntroChoice) {
      drawPeterDialogueButton(45, y + 166, 165, "再說一次", "#343941");
      drawPeterDialogueButton(240, y + 166, 165, "開始遊戲", "#111318");
    } else {
      ctx.textAlign = "right";
      ctx.font = "700 12px 'Microsoft JhengHei', sans-serif";
      ctx.fillStyle = colors.dark;
      ctx.fillText("繼續 ▶", x + width - 18, y + height - 20);
    }
    ctx.restore();
  }

  function drawPeterMissionComplete() {
    if (!peterMissionCompleteStartedAt) return;
    const colors = NPC_UI_COLORS.Peter;
    const pulse = 1 + Math.sin(elapsed * 7) * 0.015;
    ctx.save();
    ctx.fillStyle = "rgba(5,7,9,.35)";
    ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2, H * 0.45);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = colors.dark;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 5;
    roundedRectPath(-138, -50, 276, 100, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.font = "900 30px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("完成任務", 0, 0);
    ctx.restore();
  }

  function drawPicnicScene() {
    ctx.fillStyle = "#4d9b28";
    ctx.fillRect(0, 0, W, H);
    if (picnicMap.complete && picnicMap.naturalWidth) ctx.drawImage(picnicMap, 0, 0, W, H);
    drawPicnicIngredients();
    drawPicnicBoilingEffect();
    drawPicnicTimerBar();
  }

  function drawBaseballScene() {
    ctx.fillStyle = "#84cfea";
    ctx.fillRect(0, 0, W, H);
    if (baseballFieldMap.complete && baseballFieldMap.naturalWidth) {
      ctx.drawImage(baseballFieldMap, 0, 0, W, H);
    }

    const now = performance.now();
    let catcherOffsetX = 0;
    if (fuSienStage === "coach-walk-in") {
      catcherOffsetX = 170 * Math.min(1, (now - fuSienStageStartedAt) / BASEBALL_WALK_DURATION);
    } else if (fuSienStage === "coach-dialogue") {
      catcherOffsetX = 170;
    } else if (fuSienStage === "coach-walk-back") {
      catcherOffsetX = 170 * (1 - Math.min(1, (now - fuSienStageStartedAt) / BASEBALL_WALK_DURATION));
    }

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#2a351c";
    ctx.beginPath();
    ctx.ellipse(116 + catcherOffsetX, 548, 48, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(355, 504, 29, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (fuSienCatcherSprite.complete && fuSienCatcherSprite.naturalWidth) {
      ctx.drawImage(fuSienCatcherSprite, 6 + catcherOffsetX, 335, 220, 220);
    }
    if (davidPitcherSprite.complete && davidPitcherSprite.naturalWidth) {
      ctx.drawImage(davidPitcherSprite, 265, 330, 180, 180);
    }
  }

  function drawBaseballBall(x, y, radius, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = "#fffaf0";
    ctx.strokeStyle = "#493329";
    ctx.lineWidth = Math.max(1.5, radius * 0.12);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#d84b3b";
    ctx.lineWidth = Math.max(1.2, radius * 0.1);
    ctx.beginPath();
    ctx.arc(-radius * 0.72, 0, radius * 0.72, -1.05, 1.05);
    ctx.arc(radius * 0.72, 0, radius * 0.72, Math.PI - 1.05, Math.PI + 1.05);
    ctx.stroke();
    ctx.restore();
  }

  function drawBroadcastBaseballScoreboard() {
    const x = 12;
    const y = 12;
    const width = 330;
    const height = 96;
    ctx.save();
    ctx.fillStyle = "rgba(8,15,20,.92)";
    ctx.strokeStyle = "#f08a2e";
    ctx.lineWidth = 3;
    roundedRectPath(x, y, width, height, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f08a2e";
    ctx.fillRect(x + 2, y + 2, 96, height - 4);
    ctx.fillStyle = "#fff7dc";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 50px 'Arial Black', sans-serif";
    ctx.fillText("9", x + 38, y + 49);
    ctx.fillStyle = "rgba(112,52,16,.56)";
    ctx.beginPath();
    ctx.moveTo(x + 76, y + 35);
    ctx.lineTo(x + 88, y + 35);
    ctx.lineTo(x + 82, y + 24);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff4bf";
    ctx.beginPath();
    ctx.moveTo(x + 76, y + 61);
    ctx.lineTo(x + 88, y + 61);
    ctx.lineTo(x + 82, y + 72);
    ctx.closePath();
    ctx.fill();

    ctx.textAlign = "left";
    ctx.font = "900 15px 'Microsoft JhengHei', sans-serif";
    ctx.fillStyle = "#d7e3e8";
    ctx.fillText("大象隊", x + 110, y + 22);
    ctx.fillStyle = "#ffbd70";
    ctx.fillText("獅子隊", x + 110, y + 47);
    ctx.textAlign = "right";
    ctx.font = "900 20px monospace";
    ctx.fillStyle = "#f7fbff";
    ctx.fillText("7", x + 222, y + 22);
    ctx.fillStyle = "#ffbd70";
    ctx.fillText("8", x + 222, y + 47);

    ctx.textAlign = "left";
    ctx.font = "900 12px monospace";
    ctx.fillStyle = "#a9bbc3";
    ctx.fillText("B", x + 242, y + 20);
    ctx.fillText("S", x + 242, y + 45);
    ctx.fillText("O", x + 242, y + 70);
    for (let index = 0; index < 3; index += 1) {
      ctx.fillStyle = "rgba(71,159,88,.24)";
      ctx.strokeStyle = "#3b7449";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x + 268 + index * 18, y + 16, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    for (let index = 0; index < 2; index += 1) {
      ctx.fillStyle = index < Math.min(2, fuSienStrikeCount) ? "#ffd44f" : "rgba(255,212,79,.2)";
      ctx.strokeStyle = "#9d8022";
      ctx.beginPath();
      ctx.arc(x + 268 + index * 18, y + 41, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ef5555";
      ctx.strokeStyle = "#8e2d2d";
      ctx.beginPath();
      ctx.arc(x + 268 + index * 18, y + 66, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFuSienPitchingPanel() {
    if (fuSienStage !== "pitching") return;
    const flash = 0.52 + Math.sin(elapsed * 10) * 0.28;
    ctx.save();
    ctx.fillStyle = "rgba(8,16,22,.7)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(24,33,40,.95)";
    ctx.strokeStyle = "#ff9b37";
    ctx.lineWidth = 5;
    roundedRectPath(39, 80, 372, 590, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff1ca";
    ctx.font = "900 25px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Rollins 的配球", W / 2, 130);
    for (const targetCell of fuSienTargetCells) {
      const targetRow = Math.floor(targetCell / 3);
      const targetColumn = targetCell % 3;
      ctx.fillStyle = `rgba(255,129,26,${flash})`;
      ctx.fillRect(
        BASEBALL_GRID.x + targetColumn * BASEBALL_GRID.cell + 4,
        BASEBALL_GRID.y + targetRow * BASEBALL_GRID.cell + 4,
        BASEBALL_GRID.cell - 8,
        BASEBALL_GRID.cell - 8,
      );
      ctx.strokeStyle = `rgba(255,201,91,${0.65 + flash * 0.35})`;
      ctx.lineWidth = 7;
      ctx.strokeRect(
        BASEBALL_GRID.x + targetColumn * BASEBALL_GRID.cell + 5,
        BASEBALL_GRID.y + targetRow * BASEBALL_GRID.cell + 5,
        BASEBALL_GRID.cell - 10,
        BASEBALL_GRID.cell - 10,
      );
    }

    ctx.strokeStyle = "#f6eed8";
    ctx.lineWidth = 5;
    ctx.strokeRect(BASEBALL_GRID.x, BASEBALL_GRID.y, BASEBALL_GRID.size, BASEBALL_GRID.size);
    ctx.lineWidth = 3;
    for (let index = 1; index < 3; index += 1) {
      const offset = index * BASEBALL_GRID.cell;
      ctx.beginPath();
      ctx.moveTo(BASEBALL_GRID.x + offset, BASEBALL_GRID.y);
      ctx.lineTo(BASEBALL_GRID.x + offset, BASEBALL_GRID.y + BASEBALL_GRID.size);
      ctx.moveTo(BASEBALL_GRID.x, BASEBALL_GRID.y + offset);
      ctx.lineTo(BASEBALL_GRID.x + BASEBALL_GRID.size, BASEBALL_GRID.y + offset);
      ctx.stroke();
    }

    ctx.shadowColor = "rgba(0,0,0,.55)";
    ctx.shadowBlur = 8;
    drawBaseballBall(baseballBallX, baseballBallY, 19, elapsed * 9);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#e87523";
    ctx.strokeStyle = "#fff0b0";
    ctx.lineWidth = 4;
    roundedRectPath(110, 540, 230, 72, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fffdf0";
    ctx.font = "900 29px 'Microsoft JhengHei', sans-serif";
    ctx.fillText("投出", W / 2, 576);
    ctx.restore();
  }

  function drawFuSienDialogueButton(x, y, width, label) {
    ctx.fillStyle = "#d76520";
    ctx.strokeStyle = "#ffdd8a";
    ctx.lineWidth = 3;
    roundedRectPath(x, y, width, 48, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fffbea";
    ctx.font = "900 15px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + width / 2, y + 24);
  }

  function drawFuSienWorldCupFlags() {
    const flagY = 665;
    const flagWidth = 64;
    const flagHeight = 36;
    const spainX = 156;
    const argentinaX = 276;
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#7a4a2c";
    ctx.fillStyle = "#c9182b";
    ctx.fillRect(spainX, flagY, flagWidth, flagHeight);
    ctx.fillStyle = "#ffc400";
    ctx.fillRect(spainX, flagY + 9, flagWidth, 18);
    ctx.fillStyle = "#b43135";
    ctx.fillRect(spainX + 17, flagY + 13, 5, 10);
    ctx.strokeRect(spainX, flagY, flagWidth, flagHeight);

    ctx.fillStyle = "#74b9e8";
    ctx.fillRect(argentinaX, flagY, flagWidth, flagHeight);
    ctx.fillStyle = "#fff";
    ctx.fillRect(argentinaX, flagY + 12, flagWidth, 12);
    ctx.fillStyle = "#efb526";
    ctx.beginPath();
    ctx.arc(argentinaX + flagWidth / 2, flagY + flagHeight / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeRect(argentinaX, flagY, flagWidth, flagHeight);

    ctx.fillStyle = "#8d4b24";
    ctx.font = "italic 900 18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VS", 248, flagY + flagHeight / 2);
    ctx.restore();
  }

  function drawFuSienDialogue() {
    if (!fuSienDialogueActive) return;
    const x = 20;
    const y = 515;
    const width = 410;
    const height = 240;
    const isIntroChoice = fuSienDialogueKind === "intro" && fuSienDialoguePage === FU_SIEN_DIALOGUE_LINES.length - 1;
    const message = fuSienDialogueKind === "intro"
      ? FU_SIEN_DIALOGUE_LINES[fuSienDialoguePage]
      : fuSienDialogueKind === "miss"
        ? "老師暫停！"
        : "你看起來很慌，放輕鬆啦！跟著我投，我相信你！";

    ctx.save();
    ctx.fillStyle = "rgba(14,13,12,.48)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,248,220,.98)";
    ctx.strokeStyle = "#a44818";
    ctx.lineWidth = 5;
    roundedRectPath(x, y, width, height, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffd183";
    roundedRectPath(x + 14, y + 15, 108, 132, 10);
    ctx.fill();
    if (fuSienCatcherSprite.complete && fuSienCatcherSprite.naturalWidth) {
      ctx.save();
      ctx.beginPath();
      roundedRectPath(x + 18, y + 18, 100, 126, 8);
      ctx.clip();
      ctx.drawImage(fuSienCatcherSprite, x + 2, y + 12, 132, 132);
      ctx.restore();
    }
    ctx.fillStyle = "#743014";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "900 19px 'Microsoft JhengHei', sans-serif";
    ctx.fillText("Rollins", x + 140, y + 32);
    ctx.font = "900 15px 'Microsoft JhengHei', sans-serif";
    drawWrappedText(message, x + 140, y + 70, 245, 27, isIntroChoice ? 4 : 5);

    if (fuSienDialogueKind === "intro" && fuSienDialoguePage === 2) {
      drawFuSienWorldCupFlags();
    }

    if (isIntroChoice) {
      drawFuSienDialogueButton(45, y + 174, 165, "沒問題");
      drawFuSienDialogueButton(240, y + 174, 165, "當然沒問題");
    } else {
      ctx.textAlign = "right";
      ctx.font = "700 12px 'Microsoft JhengHei', sans-serif";
      ctx.fillStyle = "#9a4a20";
      ctx.fillText("繼續 ▶", x + width - 18, y + height - 19);
    }
    ctx.restore();
  }

  function drawFuSienPitchFlight() {
    if (fuSienStage !== "pitch-flight") return;
    const progress = Math.min(1, (performance.now() - fuSienStageStartedAt) / BASEBALL_PITCH_DURATION);
    const eased = 1 - Math.pow(1 - progress, 3);
    const startX = 350;
    const startY = 408;
    const endX = 125;
    const endY = 438;
    const x = startX + (endX - startX) * eased;
    const y = startY + (endY - startY) * eased - Math.sin(progress * Math.PI) * 18;
    ctx.save();
    ctx.strokeStyle = "rgba(255,247,205,.45)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + 28, y - 2);
    ctx.lineTo(x + 8, y);
    ctx.stroke();
    drawBaseballBall(x, y, 8 + progress * 4, elapsed * 18);
    ctx.restore();
  }

  function drawFuSienStrikeEffect() {
    if (fuSienStage !== "strike-effect") return;
    const progress = Math.min(1, (performance.now() - fuSienStageStartedAt) / BASEBALL_STRIKE_DURATION);
    const pop = Math.min(1, progress * 5);
    const fade = Math.min(1, (1 - progress) * 5);
    const shake = Math.sin(progress * 70) * 4 * (1 - progress);
    ctx.save();
    ctx.fillStyle = `rgba(9,6,18,${0.3 * fade})`;
    ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2 + shake, H * 0.42);
    ctx.rotate(-0.11);
    ctx.scale(pop * (1 + Math.sin(progress * 20) * 0.04), pop);
    ctx.font = "italic 900 66px Impact, 'Arial Black', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#17101f";
    ctx.lineWidth = 16;
    ctx.strokeText("Strike", 0, 0);
    ctx.strokeStyle = "#fff4c5";
    ctx.lineWidth = 7;
    ctx.strokeText("Strike", 0, 0);
    ctx.fillStyle = "#ff7a1a";
    ctx.fillText("Strike", 0, 0);
    ctx.fillStyle = "#fff1a8";
    ctx.font = "900 17px 'Microsoft JhengHei', sans-serif";
    ctx.fillText(`${fuSienStrikeCount} STRIKES`, 0, 58);
    ctx.restore();
  }

  function drawFuSienMissionComplete() {
    if (fuSienStage !== "mission-complete") return;
    const colors = NPC_UI_COLORS.Rollins;
    const pulse = 1 + Math.sin(elapsed * 7) * 0.015;
    ctx.save();
    ctx.fillStyle = "rgba(22,10,5,.38)";
    ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2, H * 0.44);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = colors.dark;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 5;
    roundedRectPath(-138, -50, 276, 100, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.panel;
    ctx.font = "900 30px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("完成任務", 0, 0);
    ctx.restore();
  }

  function drawPlayer() {
    const inAquarium = scene === "aquarium";
    const climbPhase = player.climbing && player.walking ? Math.sin(elapsed * 13) : 0;
    const screenX = Math.round(player.x - cameraX + climbPhase);
    const walkPhase = player.walking && player.grounded ? Math.sin(elapsed * 17) : 0;
    const bob = inAquarium
      ? Math.round(Math.sin(elapsed * 3.1) * 2)
      : player.climbing
        ? Math.round(climbPhase)
        : player.grounded
          ? Math.round(Math.abs(walkPhase) * -2)
          : 0;
    const squash = inAquarium || player.climbing || player.grounded ? 1 : Math.max(0.94, Math.min(1.06, 1 - player.vy / 9000));

    if (!player.climbing && !inAquarium) {
      ctx.save();
      ctx.globalAlpha = 0.24;
      ctx.fillStyle = "#16341f";
      ctx.beginPath();
      ctx.ellipse(screenX, Math.round(player.y + 3), player.grounded ? 25 : 15, player.grounded ? 6 : 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (player.attacking && davidAttackSprite.complete && davidAttackSprite.naturalWidth) {
      ctx.save();
      ctx.translate(screenX, Math.round(player.y - 184));
      if (player.facing < 0) ctx.scale(-1, 1);
      ctx.drawImage(davidAttackSprite, -86, 0, 240, 192);
      ctx.restore();
      return;
    }

    if (!davidSprite.complete || !davidSprite.naturalWidth) return;
    const drawW = 144;
    const drawH = 192 * squash;
    const footOffset = 171 * squash;

    ctx.save();
    ctx.translate(screenX, Math.round(player.y + bob - footOffset));
    if (player.facing < 0) ctx.scale(-1, 1);
    if (inAquarium) ctx.rotate(player.vy * 0.00045 + Math.sin(elapsed * 2.2) * 0.008);
    else if (player.climbing) ctx.rotate(climbPhase * 0.008);
    else if (!player.grounded) ctx.rotate(player.vx * 0.00013);
    else ctx.rotate(walkPhase * 0.012);
    ctx.drawImage(davidSprite, -drawW / 2, 0, drawW, drawH);
    ctx.restore();
  }

  function drawVignette() {
    const vignette = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.5, H * 0.72);
    vignette.addColorStop(0, "rgba(4,24,14,0)");
    vignette.addColorStop(1, "rgba(4,24,14,.16)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  }

  function render() {
    ctx.save();
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (scene === "aquarium") {
      drawAquariumBackground();
      drawAquariumMoses();
      drawAquariumBadCrab();
      drawPlayer();
      drawAquariumForeground();
    } else if (scene === "picnic") {
      drawPicnicScene();
    } else if (scene === "baseball") {
      drawBaseballScene();
    } else {
      drawBackground();
      drawStoneText();
      drawLeaves();
      if (parkChampionActive) {
        drawParkChampionGathering();
      } else {
        drawAquariumArea();
        drawGuzhengArea();
        drawElimClassroomArea();
        drawPeterPicnicArea();
        drawNpcs();
        drawFireMushroom();
        drawMosesPrompt();
        drawVivianPrompt();
        drawElimPrompt();
        drawPeterPrompt();
        drawFuSienPrompt();
        drawKatePrompt();
        drawKateTaskSpeech();
        drawParticles();
        drawPlayer();
      }
    }
    drawVignette();
    if (parkChampionActive) {
      drawParkMissionProgress();
      drawParkChampionBanner();
    } else if (scene === "aquarium") {
      drawCrabPrompt();
      drawCrabHpBar();
      drawAquariumDialogue();
      drawMissionComplete();
    } else if (scene === "picnic") {
      drawPeterDialogue();
      drawPeterMissionComplete();
    } else if (scene === "baseball") {
      drawFuSienPitchFlight();
      drawFuSienPitchingPanel();
      drawBroadcastBaseballScoreboard();
      drawFuSienStrikeEffect();
      drawFuSienDialogue();
      drawFuSienMissionComplete();
    } else if (kateDialogueActive) {
      drawKateTaskOverlay();
      drawKateDialogue();
    } else if (vivianTaskActive) {
      drawVivianTaskOverlay();
      drawVivianDialogue();
    } else if (elimTaskActive) {
      drawElimTaskOverlay();
      drawElimDialogue();
      drawElimMissionComplete();
    } else {
      drawParkMissionProgress();
      drawFireMushroomHpBar();
      drawKateMissionComplete();
    }
    ctx.restore();
  }

  function frame(now) {
    const dt = Math.min(0.033, (now - lastTime) / 1000 || 0);
    lastTime = now;
    elapsed += dt;
    update(dt, now);
    render();
    requestAnimationFrame(frame);
  }

  function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function createAudioEngine() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = MUSIC_MASTER_GAIN;
    master.connect(context.destination);
    return { context, master, step: 0, nextTime: context.currentTime + 0.08, timer: null };
  }

  function scheduleTone(engine, midi, when, duration, type, volume) {
    const oscillator = engine.context.createOscillator();
    const gain = engine.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(midiToFrequency(midi), when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(volume, when + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    oscillator.connect(gain);
    gain.connect(engine.master);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.03);
  }

  function scheduleMusicStep(engine) {
    const melody = [72, 76, 79, 81, 79, 76, 74, 71, 69, 72, 76, 79, 76, 74, 71, 67];
    const bass = [48, 48, 53, 53, 45, 45, 50, 50];
    const step = engine.step;
    const when = engine.nextTime;
    scheduleTone(engine, melody[step % melody.length], when, 0.18, step % 4 === 0 ? "sine" : "triangle", 0.075);
    if (step % 2 === 0) scheduleTone(engine, melody[(step + 5) % melody.length] + 12, when, 0.09, "sine", 0.022);
    if (step % 4 === 0) scheduleTone(engine, bass[Math.floor(step / 4) % bass.length], when, 0.55, "triangle", 0.038);
    engine.step += 1;
    engine.nextTime += 0.205;
  }

  async function startMusic() {
    if (!audio) audio = createAudioEngine();
    if (!audio || musicMuted) return;
    await audio.context.resume();
    if (audio.nextTime < audio.context.currentTime) audio.nextTime = audio.context.currentTime + 0.08;
    const targetGain = vivianTaskActive || elimTaskActive ? MUSIC_DUCKED_GAIN : MUSIC_MASTER_GAIN;
    audio.master.gain.setTargetAtTime(targetGain, audio.context.currentTime, 0.08);
    if (audio.timer) return;
    const scheduler = () => {
      if (!audio || musicMuted) return;
      while (audio.nextTime < audio.context.currentTime + 0.35) scheduleMusicStep(audio);
    };
    scheduler();
    audio.timer = setInterval(scheduler, 80);
  }

  function stopMusic() {
    if (!audio) return;
    clearInterval(audio.timer);
    audio.timer = null;
    audio.master.gain.setTargetAtTime(0.0001, audio.context.currentTime, 0.05);
  }

  function playJumpSound() {
    if (!audio || musicMuted) return;
    const when = audio.context.currentTime;
    scheduleTone(audio, 76, when, 0.09, "square", 0.025);
    scheduleTone(audio, 83, when + 0.07, 0.12, "square", 0.022);
  }

  function playAttackSound() {
    if (!audio || musicMuted) return;
    const when = audio.context.currentTime;
    scheduleTone(audio, 62, when, 0.08, "sawtooth", 0.055);
    scheduleTone(audio, 48, when + 0.045, 0.14, "square", 0.07);
    scheduleTone(audio, 36, when + 0.105, 0.18, "triangle", 0.08);
  }

  function playBaseballPitchSound() {
    if (!audio || musicMuted) return;
    audio.context.resume();
    const when = audio.context.currentTime;
    const whoosh = audio.context.createOscillator();
    const whooshGain = audio.context.createGain();
    whoosh.type = "sine";
    whoosh.frequency.setValueAtTime(680, when);
    whoosh.frequency.exponentialRampToValueAtTime(115, when + 0.46);
    whooshGain.gain.setValueAtTime(0.0001, when);
    whooshGain.gain.exponentialRampToValueAtTime(0.08, when + 0.025);
    whooshGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.48);
    whoosh.connect(whooshGain);
    whooshGain.connect(audio.context.destination);
    whoosh.start(when);
    whoosh.stop(when + 0.5);
    scheduleTone(audio, 56, when + 0.47, 0.1, "square", 0.11);
    scheduleTone(audio, 44, when + 0.5, 0.16, "triangle", 0.095);
  }

  function playGuzhengString(index) {
    if (index < 0 || index >= GUZHENG_STRING_COUNT || vivianDialogueActive) return;
    vivianPlayedNoteCount += 1;
    guzhengStringGlowUntil[index] = performance.now() + 260;
    if (!audio) audio = createAudioEngine();
    if (!audio || musicMuted) return;
    audio.context.resume();
    const when = audio.context.currentTime;
    const frequency = midiToFrequency(GUZHENG_MIDI[index]);
    const output = audio.context.createGain();
    output.gain.setValueAtTime(0.0001, when);
    output.gain.exponentialRampToValueAtTime(0.13, when + 0.008);
    output.gain.exponentialRampToValueAtTime(0.0001, when + 1.35);
    output.connect(audio.context.destination);

    const fundamental = audio.context.createOscillator();
    fundamental.type = "triangle";
    fundamental.frequency.setValueAtTime(frequency, when);
    fundamental.frequency.exponentialRampToValueAtTime(frequency * 0.997, when + 0.9);
    fundamental.connect(output);

    const harmonic = audio.context.createOscillator();
    const harmonicGain = audio.context.createGain();
    harmonic.type = "sine";
    harmonic.frequency.setValueAtTime(frequency * 2.01, when);
    harmonicGain.gain.setValueAtTime(0.34, when);
    harmonicGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.55);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(output);

    fundamental.start(when);
    harmonic.start(when);
    fundamental.stop(when + 1.4);
    harmonic.stop(when + 0.62);
  }

  function beginGame() {
    if (gameStarted) return;
    gameStarted = true;
    game.classList.add("playing");
    startScreen.classList.add("hidden");
    canvas.focus({ preventScroll: true });
    startMusic();
  }

  startButton.addEventListener("click", beginGame);

  function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (W / rect.width),
      y: (event.clientY - rect.top) * (H / rect.height),
    };
  }

  function isPointOnNpcOrPrompt(point, npc, promptVisible, promptWidth, bouncePhase = 0) {
    if (scene !== "park" || !promptVisible) return false;
    const screenX = npc.x - cameraX;
    const npcTop = npc.y - NPC_VISIBLE_HEIGHT - 6;
    const onNpc = point.x >= screenX - 72
      && point.x <= screenX + 72
      && point.y >= npcTop
      && point.y <= npc.y + 8;
    const bounce = Math.round(Math.sin(elapsed * 4.8 + bouncePhase) * 2);
    const promptX = screenX - promptWidth / 2;
    const promptY = npc.y - NPC_VISIBLE_HEIGHT - 95 + bounce;
    const onPrompt = point.x >= promptX - 5
      && point.x <= promptX + promptWidth + 5
      && point.y >= promptY - 5
      && point.y <= promptY + 63;
    return onNpc || onPrompt;
  }

  function isPointOnMoses(point) {
    return isPointOnNpcOrPrompt(point, parkMoses, mosesPromptVisible, 112);
  }

  function isPointOnVivian(point) {
    return isPointOnNpcOrPrompt(point, parkVivian, vivianPromptVisible, 208, 1.1);
  }

  function isPointOnElim(point) {
    return isPointOnNpcOrPrompt(point, parkElim, elimPromptVisible, 170, 2.2);
  }

  function isPointOnPeter(point) {
    if (scene !== "park" || !peterPromptVisible) return false;
    const screenX = parkPeter.x - cameraX;
    const npcTop = parkPeter.y - NPC_VISIBLE_HEIGHT - 6;
    const onNpc = point.x >= screenX - 72
      && point.x <= screenX + 72
      && point.y >= npcTop
      && point.y <= parkPeter.y + 8;
    const bounce = Math.round(Math.sin(elapsed * 4.8 + 3.1) * 2);
    const promptX = screenX - 79;
    const promptY = parkPeter.y + 39 + bounce;
    const onPrompt = point.x >= promptX - 5
      && point.x <= promptX + 163
      && point.y >= promptY - 5
      && point.y <= promptY + 63;
    return onNpc || onPrompt;
  }

  function isPointOnFuSien(point) {
    if (scene !== "park" || !fuSienPromptVisible) return false;
    const screenX = parkFuSien.x - cameraX;
    const npcTop = parkFuSien.y - NPC_VISIBLE_HEIGHT - 6;
    const onNpc = point.x >= screenX - 72
      && point.x <= screenX + 72
      && point.y >= npcTop
      && point.y <= parkFuSien.y + 8;
    const bounce = Math.round(Math.sin(elapsed * 4.8 + 4) * 2);
    const promptX = screenX - 132;
    const promptY = parkFuSien.y + 39 + bounce;
    const onPrompt = point.x >= promptX - 5
      && point.x <= promptX + 269
      && point.y >= promptY - 5
      && point.y <= promptY + 63;
    return onNpc || onPrompt;
  }

  function isPointOnKate(point) {
    return isPointOnNpcOrPrompt(point, parkKate, katePromptVisible, 154, 5.1);
  }

  function isPointInsideDialogue(point, y, height) {
    return point.x >= 20 && point.x <= 430 && point.y >= y && point.y <= y + height;
  }

  function isPointOnAquariumDialogue(point) {
    return aquariumDialogueActive && isPointInsideDialogue(point, 540, 215);
  }

  function isPointOnVivianDialogue(point) {
    return vivianDialogueActive && isPointInsideDialogue(point, 555, 200);
  }

  function isPointOnKateDialogue(point) {
    return kateDialogueActive && isPointInsideDialogue(point, 555, 200);
  }

  function isPointOnElimDialogue(point) {
    return elimDialogueActive && isPointInsideDialogue(point, 540, 215);
  }

  function isPointOnPeterDialogue(point) {
    return peterDialogueActive && isPointInsideDialogue(point, 520, 235);
  }

  function isPointOnFuSienDialogue(point) {
    return fuSienDialogueActive && isPointInsideDialogue(point, 515, 240);
  }

  function getFuSienChoiceAtPoint(point) {
    if (!fuSienDialogueActive || fuSienDialogueKind !== "intro" || fuSienDialoguePage !== FU_SIEN_DIALOGUE_LINES.length - 1) return null;
    const buttonY = 689;
    if (point.y < buttonY || point.y > buttonY + 48) return null;
    if (point.x >= 45 && point.x <= 210) return "yes";
    if (point.x >= 240 && point.x <= 405) return "also-yes";
    return null;
  }

  function isPointOnFuSienThrowButton(point) {
    return fuSienStage === "pitching"
      && point.x >= 110
      && point.x <= 340
      && point.y >= 540
      && point.y <= 612;
  }

  function getPeterChoiceAtPoint(point) {
    if (!peterDialogueActive || peterDialogueKind !== "intro" || peterDialoguePage !== PETER_DIALOGUE_LINES.length - 1) return null;
    const buttonY = 686;
    if (point.y < buttonY || point.y > buttonY + 48) return null;
    if (point.x >= 45 && point.x <= 210) return "repeat";
    if (point.x >= 240 && point.x <= 405) return "start";
    return null;
  }

  function getPicnicIngredientAtPoint(point) {
    if (!peterGameStarted || peterDialogueActive || peterMissionCompleteStartedAt) return null;
    for (let index = picnicIngredients.length - 1; index >= 0; index -= 1) {
      const ingredient = picnicIngredients[index];
      if (ingredient.processed) continue;
      if (
        point.x >= ingredient.x
        && point.x <= ingredient.x + ingredient.size
        && point.y >= ingredient.y
        && point.y <= ingredient.y + ingredient.size
      ) return ingredient;
    }
    return null;
  }

  function isPicnicIngredientInPot(ingredient, touching = false) {
    if (!ingredient) return false;
    const centerX = ingredient.x + ingredient.size / 2;
    const centerY = ingredient.y + ingredient.size / 2;
    const padding = touching ? ingredient.size * 0.34 : 0;
    const dx = (centerX - PICNIC_POT.x) / (PICNIC_POT.radiusX + padding);
    const dy = (centerY - PICNIC_POT.y) / (PICNIC_POT.radiusY + padding);
    return dx * dx + dy * dy <= 1;
  }

  function isPicnicIngredientTouchingBin(ingredient) {
    if (!ingredient) return false;
    return ingredient.x < PICNIC_BIN.x + PICNIC_BIN.width
      && ingredient.x + ingredient.size > PICNIC_BIN.x
      && ingredient.y < PICNIC_BIN.y + PICNIC_BIN.height
      && ingredient.y + ingredient.size > PICNIC_BIN.y;
  }

  function updatePicnicIngredientDrag(event) {
    if (!pointerStart || pointerStart.id !== event.pointerId || pointerStart.mode !== "picnic-ingredient") return;
    const ingredient = pointerStart.ingredient;
    if (!ingredient || ingredient.processed) return;
    const point = getCanvasPoint(event);
    ingredient.x = Math.max(-ingredient.size * 0.2, Math.min(W - ingredient.size * 0.8, point.x - pointerStart.offsetX));
    ingredient.y = Math.max(80 - ingredient.size * 0.5, Math.min(H - ingredient.size * 0.5, point.y - pointerStart.offsetY));

    if (ingredient.trashOnly) {
      if (isPicnicIngredientInPot(ingredient, true)) {
        resetPicnicIngredient(ingredient);
        picnicActiveIngredient = null;
        pointerStart.mode = "picnic-result";
        startPeterDialogue("leaves");
        return;
      }
      if (isPicnicIngredientTouchingBin(ingredient)) {
        ingredient.processed = true;
        picnicActiveIngredient = null;
        picnicCookStartedAt = 0;
        pointerStart.mode = "picnic-result";
        if (picnicIngredients.every((item) => item.processed)) {
          peterMissionCompleteStartedAt = performance.now();
          abandonTaskButton.hidden = true;
        }
      }
      return;
    }

    if (isPicnicIngredientInPot(ingredient)) {
      if (!picnicCookStartedAt) picnicCookStartedAt = performance.now();
    } else {
      picnicCookStartedAt = 0;
    }
  }

  function finishPicnicIngredientDrag(event) {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const drag = pointerStart;
    pointerStart = null;
    if (drag.mode !== "picnic-ingredient") return;
    const ingredient = drag.ingredient;
    if (!ingredient || ingredient.processed) {
      picnicActiveIngredient = null;
      picnicCookStartedAt = 0;
      return;
    }
    if (ingredient.trashOnly) {
      resetPicnicIngredient(ingredient);
      picnicActiveIngredient = null;
      return;
    }

    const inPot = isPicnicIngredientInPot(ingredient);
    const cookElapsedMs = picnicCookStartedAt ? performance.now() - picnicCookStartedAt : 0;
    picnicActiveIngredient = null;
    picnicCookStartedAt = 0;
    if (!inPot) {
      resetPicnicIngredient(ingredient);
      return;
    }
    if (cookElapsedMs >= ingredient.minCookMs && cookElapsedMs <= ingredient.maxCookMs) {
      ingredient.processed = true;
      startPeterDialogue("success");
      return;
    }
    resetPicnicIngredient(ingredient);
    startPeterDialogue("retry");
  }

  function isDialoguePageReady(shownAt) {
    return performance.now() - shownAt >= DIALOGUE_MIN_VISIBLE_MS;
  }

  function isPointOnDavid(point) {
    const screenX = player.x - cameraX;
    const halfWidth = player.attacking ? 92 : 72;
    return point.x >= screenX - halfWidth
      && point.x <= screenX + halfWidth
      && point.y >= player.y - 190
      && point.y <= player.y + 18;
  }

  function stopTouchControl() {
    touchControlHeld = false;
    touchDirectionX = 0;
    touchDirectionY = 0;
    player.vx = 0;
    if (scene === "aquarium" || player.climbing) player.vy = 0;
    player.walking = false;
  }

  function applyTouchDrag(dx, dy) {
    const magnitude = Math.hypot(dx, dy);
    if (magnitude < 16) {
      touchDirectionX = 0;
      touchDirectionY = 0;
      return;
    }

    let directionX = Math.abs(dx) >= magnitude * 0.38 ? Math.sign(dx) : 0;
    let directionY = Math.abs(dy) >= magnitude * 0.38 ? Math.sign(dy) : 0;

    if (scene === "aquarium") {
      touchDirectionX = directionX;
      touchDirectionY = directionY;
      return;
    }

    if (player.climbing) {
      if (directionY) {
        touchDirectionX = 0;
        touchDirectionY = directionY;
      } else {
        touchDirectionX = directionX;
        touchDirectionY = 0;
      }
      return;
    }

    if (directionY > 0) {
      if (tryAttachToLadder(1, 38)) {
        touchDirectionX = 0;
        touchDirectionY = 1;
      } else {
        touchDirectionX = 0;
        touchDirectionY = 0;
      }
      return;
    }

    if (directionY < 0) {
      if (tryAttachToLadder(-1, 38)) {
        touchDirectionX = 0;
        touchDirectionY = -1;
      } else {
        touchDirectionX = directionX;
        touchDirectionY = -1;
        jump();
      }
      return;
    }

    touchDirectionX = directionX;
    touchDirectionY = 0;
  }

  function updateGuzhengPointer(event) {
    const point = getCanvasPoint(event);
    const index = getGuzhengStringIndex(point);
    const previousIndex = guzhengPointers.get(event.pointerId);
    if (index !== previousIndex) {
      guzhengPointers.set(event.pointerId, index);
      if (index >= 0) playGuzhengString(index);
    }
  }

  attackButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    attack();
  });

  abandonTaskButton.addEventListener("click", (event) => {
    event.preventDefault();
    abandonPeterTask();
    canvas.focus({ preventScroll: true });
  });

  soundButton.addEventListener("click", () => {
    musicMuted = !musicMuted;
    soundButton.classList.toggle("muted", musicMuted);
    soundButton.textContent = musicMuted ? "♪" : "♫";
    if (musicMuted) stopMusic();
    else startMusic();
  });

  window.addEventListener("keydown", (event) => {
    const code = event.code;
    // Space is deliberately reserved as a no-op: it never starts, jumps, attacks, or moves.
    if (code === "Space") {
      event.preventDefault();
      return;
    }
    if (parkChampionActive) {
      event.preventDefault();
      return;
    }
    if (scene === "picnic" || scene === "baseball") {
      event.preventDefault();
      return;
    }
    if (vivianTaskActive) {
      event.preventDefault();
      return;
    }
    if (elimTaskActive) {
      event.preventDefault();
      return;
    }
    if (kateDialogueActive) {
      event.preventDefault();
      return;
    }
    if (aquariumDialogueActive) {
      event.preventDefault();
      return;
    }
    const attackCodes = ["Delete", "ShiftLeft", "ShiftRight"];
    const isAttackKey = attackCodes.includes(code) || event.key === "Shift";
    const controlCodes = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS", ...attackCodes];
    if (controlCodes.includes(code) || isAttackKey) event.preventDefault();
    if (!gameStarted && code === "Enter") beginGame();
    keys.add(code);

    if (event.repeat) return;
    if (isAttackKey) {
      attack();
    } else if (scene === "aquarium") {
      return;
    } else if (code === "ArrowUp" || code === "KeyW") {
      if (!player.climbing && !tryAttachToLadder(-1, 34)) jump();
    } else if (code === "ArrowDown" || code === "KeyS") {
      if (!player.climbing) tryAttachToLadder(1, 34);
    }
  });

  window.addEventListener("keyup", (event) => keys.delete(event.code));
  window.addEventListener("blur", () => {
    keys.clear();
    stopTouchControl();
    guzhengPointers.clear();
    pointerStart = null;
  });

  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (!gameStarted) return;
    if (parkChampionActive) return;
    canvas.setPointerCapture?.(event.pointerId);
    const point = getCanvasPoint(event);

    if (scene === "baseball") {
      if (fuSienDialogueActive) {
        if (!isDialoguePageReady(fuSienDialoguePageShownAt)) return;
        const choice = getFuSienChoiceAtPoint(point);
        if (choice) {
          pointerStart = {
            x: event.clientX,
            y: event.clientY,
            time: performance.now(),
            id: event.pointerId,
            mode: `fu-sien-choice-${choice}`,
          };
        } else if (fuSienDialogueKind !== "intro" || fuSienDialoguePage < FU_SIEN_DIALOGUE_LINES.length - 1) {
          if (isPointOnFuSienDialogue(point)) {
            pointerStart = {
              x: event.clientX,
              y: event.clientY,
              time: performance.now(),
              id: event.pointerId,
              mode: "fu-sien-dialogue",
            };
          }
        }
        return;
      }
      if (isPointOnFuSienThrowButton(point)) {
        pointerStart = {
          x: event.clientX,
          y: event.clientY,
          time: performance.now(),
          id: event.pointerId,
          mode: "fu-sien-throw",
        };
      }
      return;
    }

    if (scene === "picnic") {
      if (peterMissionCompleteStartedAt) return;
      if (peterDialogueActive) {
        if (!isDialoguePageReady(peterDialoguePageShownAt)) return;
        const choice = getPeterChoiceAtPoint(point);
        if (choice) {
          pointerStart = {
            x: event.clientX,
            y: event.clientY,
            time: performance.now(),
            id: event.pointerId,
            mode: `peter-choice-${choice}`,
          };
        } else if (peterDialogueKind !== "intro" || peterDialoguePage < PETER_DIALOGUE_LINES.length - 1) {
          if (isPointOnPeterDialogue(point)) {
            pointerStart = {
              x: event.clientX,
              y: event.clientY,
              time: performance.now(),
              id: event.pointerId,
              mode: "peter-dialogue",
            };
          }
        }
        return;
      }
      const ingredient = getPicnicIngredientAtPoint(point);
      if (ingredient) {
        picnicActiveIngredient = ingredient;
        picnicCookStartedAt = 0;
        pointerStart = {
          x: event.clientX,
          y: event.clientY,
          time: performance.now(),
          id: event.pointerId,
          mode: "picnic-ingredient",
          ingredient,
          offsetX: point.x - ingredient.x,
          offsetY: point.y - ingredient.y,
        };
      }
      return;
    }

    if (kateDialogueActive) {
      if (isPointOnKateDialogue(point) && isDialoguePageReady(kateDialoguePageShownAt)) {
        pointerStart = {
          x: event.clientX,
          y: event.clientY,
          time: performance.now(),
          id: event.pointerId,
          mode: "kate-dialogue",
        };
      }
      return;
    }

    if (vivianTaskActive) {
      if (vivianDialogueActive) {
        if (isPointOnVivianDialogue(point) && isDialoguePageReady(vivianDialoguePageShownAt)) {
          pointerStart = {
            x: event.clientX,
            y: event.clientY,
            time: performance.now(),
            id: event.pointerId,
            mode: "vivian-dialogue",
          };
        }
        return;
      }
      if (isPointOnVivianCompleteButton(point)) {
        pointerStart = {
          x: event.clientX,
          y: event.clientY,
          time: performance.now(),
          id: event.pointerId,
          mode: "vivian-complete",
        };
        return;
      }
      guzhengPointers.set(event.pointerId, -1);
      updateGuzhengPointer(event);
      return;
    }

    if (elimTaskActive) {
      if (elimDialogueActive) {
        if (isPointOnElimDialogue(point) && isDialoguePageReady(elimDialoguePageShownAt)) {
          pointerStart = {
            x: event.clientX,
            y: event.clientY,
            time: performance.now(),
            id: event.pointerId,
            mode: "elim-dialogue",
          };
        }
        return;
      }
      const answerIndex = getElimAnswerIndex(point);
      if (answerIndex >= 0) {
        pointerStart = {
          x: event.clientX,
          y: event.clientY,
          time: performance.now(),
          id: event.pointerId,
          mode: "elim-answer",
          answerIndex,
        };
      }
      return;
    }

    if (aquariumDialogueActive) {
      if (isPointOnAquariumDialogue(point) && isDialoguePageReady(aquariumDialoguePageShownAt)) {
        pointerStart = {
          x: event.clientX,
          y: event.clientY,
          time: performance.now(),
          id: event.pointerId,
          mode: "aquarium-dialogue",
        };
      }
      return;
    }

    const controlsLocked = parkChampionActive || aquariumDialogueActive || kateDialogueActive || missionCompleteStartedAt || (scene === "aquarium" && crabHp <= 0);
    const selectedDavid = !controlsLocked && isPointOnDavid(point);
    pointerStart = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      id: event.pointerId,
      selectedDavid,
      moved: false,
    };
    if (selectedDavid) {
      touchControlHeld = true;
      touchDirectionX = 0;
      touchDirectionY = 0;
      player.vx = 0;
      if (scene === "aquarium") player.vy = 0;
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!gameStarted) return;
    if (parkChampionActive) return;
    if (scene === "baseball") return;
    if (scene === "picnic") {
      updatePicnicIngredientDrag(event);
      return;
    }
    if (kateDialogueActive) return;
    if (vivianTaskActive) {
      if (pointerStart?.id === event.pointerId && pointerStart.mode) return;
      if (guzhengPointers.has(event.pointerId)) updateGuzhengPointer(event);
      return;
    }
    if (elimTaskActive) return;
    if (!pointerStart || pointerStart.id !== event.pointerId || !pointerStart.selectedDavid) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    if (Math.hypot(dx, dy) >= 16) pointerStart.moved = true;
    applyTouchDrag(dx, dy);
  });

  canvas.addEventListener("pointerup", (event) => {
    if (parkChampionActive) return;
    if (scene === "baseball") {
      if (!pointerStart || pointerStart.id !== event.pointerId) return;
      const taskPointer = pointerStart;
      pointerStart = null;
      const dx = event.clientX - taskPointer.x;
      const dy = event.clientY - taskPointer.y;
      const duration = performance.now() - taskPointer.time;
      if (Math.abs(dx) >= 18 || Math.abs(dy) >= 18 || duration > 2500) return;
      const point = getCanvasPoint(event);
      if (taskPointer.mode === "fu-sien-dialogue" && isPointOnFuSienDialogue(point)) {
        advanceFuSienDialogue();
      } else if (taskPointer.mode.startsWith("fu-sien-choice-") && getFuSienChoiceAtPoint(point)) {
        chooseFuSienIntroAnswer();
      } else if (taskPointer.mode === "fu-sien-throw" && isPointOnFuSienThrowButton(point)) {
        throwFuSienPitch();
      }
      return;
    }
    if (scene === "picnic") {
      if (!pointerStart || pointerStart.id !== event.pointerId) return;
      const taskPointer = pointerStart;
      if (taskPointer.mode === "picnic-ingredient" || taskPointer.mode === "picnic-result") {
        finishPicnicIngredientDrag(event);
        if (taskPointer.mode === "picnic-result") pointerStart = null;
        return;
      }
      pointerStart = null;
      const dx = event.clientX - taskPointer.x;
      const dy = event.clientY - taskPointer.y;
      const duration = performance.now() - taskPointer.time;
      if (Math.abs(dx) >= 18 || Math.abs(dy) >= 18 || duration > 2500) return;
      const point = getCanvasPoint(event);
      if (taskPointer.mode === "peter-dialogue" && isPointOnPeterDialogue(point)) {
        advancePeterDialogue();
      } else if (taskPointer.mode === "peter-choice-repeat" && getPeterChoiceAtPoint(point) === "repeat") {
        repeatPeterRules();
      } else if (taskPointer.mode === "peter-choice-start" && getPeterChoiceAtPoint(point) === "start") {
        beginPeterCookingGame();
      }
      return;
    }
    if (vivianTaskActive) {
      const taskPointer = pointerStart?.id === event.pointerId ? pointerStart : null;
      if (taskPointer) pointerStart = null;
      guzhengPointers.delete(event.pointerId);
      if (taskPointer) {
        const dx = event.clientX - taskPointer.x;
        const dy = event.clientY - taskPointer.y;
        const duration = performance.now() - taskPointer.time;
        const point = getCanvasPoint(event);
        if (Math.abs(dx) < 18 && Math.abs(dy) < 18 && duration <= 2500) {
          if (taskPointer.mode === "vivian-dialogue" && isPointOnVivianDialogue(point)) advanceVivianDialogue();
          else if (taskPointer.mode === "vivian-complete" && isPointOnVivianCompleteButton(point)) finishVivianTask();
        }
      }
      return;
    }
    if (kateDialogueActive) {
      const taskPointer = pointerStart?.id === event.pointerId ? pointerStart : null;
      if (taskPointer) pointerStart = null;
      if (taskPointer) {
        const dx = event.clientX - taskPointer.x;
        const dy = event.clientY - taskPointer.y;
        const duration = performance.now() - taskPointer.time;
        const point = getCanvasPoint(event);
        if (taskPointer.mode === "kate-dialogue"
          && Math.abs(dx) < 18
          && Math.abs(dy) < 18
          && duration <= 2500
          && isPointOnKateDialogue(point)) {
          advanceKateDialogue();
        }
      }
      return;
    }
    if (elimTaskActive) {
      const taskPointer = pointerStart?.id === event.pointerId ? pointerStart : null;
      if (taskPointer) pointerStart = null;
      if (taskPointer) {
        const dx = event.clientX - taskPointer.x;
        const dy = event.clientY - taskPointer.y;
        const duration = performance.now() - taskPointer.time;
        const point = getCanvasPoint(event);
        if (Math.abs(dx) < 18 && Math.abs(dy) < 18 && duration <= 2500) {
          if (taskPointer.mode === "elim-dialogue" && isPointOnElimDialogue(point)) {
            advanceElimDialogue();
          } else if (taskPointer.mode === "elim-answer" && getElimAnswerIndex(point) === taskPointer.answerIndex) {
            answerElimQuestion(taskPointer.answerIndex);
          }
        }
      }
      return;
    }
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    const duration = performance.now() - pointerStart.time;
    const pointerMode = pointerStart.mode;
    const selectedDavid = pointerStart.selectedDavid;
    const moved = pointerStart.moved;
    pointerStart = null;
    if (selectedDavid) stopTouchControl();
    if (!gameStarted) return;

    if (pointerMode === "aquarium-dialogue") {
      const point = getCanvasPoint(event);
      if (isPointOnAquariumDialogue(point) && Math.abs(dx) < 18 && Math.abs(dy) < 18 && duration <= 2500) {
        finishAquariumDialogue();
      }
      return;
    }

    if (scene === "park" && !moved && Math.abs(dx) < 14 && Math.abs(dy) < 14 && duration <= 1800) {
      const point = getCanvasPoint(event);
      if (isPointOnMoses(point)) {
        enterAquarium();
        return;
      }
      if (isPointOnVivian(point)) startVivianTask();
      else if (isPointOnElim(point)) startElimTask();
      else if (isPointOnPeter(point)) startPeterTask();
      else if (isPointOnFuSien(point)) startFuSienTask();
      else if (isPointOnKate(point)) startKateTask();
    }
  });

  canvas.addEventListener("pointercancel", (event) => {
    guzhengPointers.delete(event.pointerId);
    if (pointerStart?.id === event.pointerId) {
      if (pointerStart.mode === "picnic-ingredient" && pointerStart.ingredient && !pointerStart.ingredient.processed) {
        resetPicnicIngredient(pointerStart.ingredient);
        picnicActiveIngredient = null;
        picnicCookStartedAt = 0;
      }
      if (pointerStart.selectedDavid) stopTouchControl();
      pointerStart = null;
    }
  });
  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();
  requestAnimationFrame(frame);
})();
