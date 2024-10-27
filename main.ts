const OBJECT_SIZE = 20;
const PLAYER_INITIAL_SIZE = 20;
const PLAYER_INITIAL_SPEED = 500;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const THEME_MODE = "dark";
const EPS = 10;

type Direction = "left" | "right" | "up" | "down";

type Moving = {
  [key in Direction]: boolean
}

type Vector2 = { x: number, y: number };

const DIRECTION_VECTORS: { [key in Direction]: Vector2 } = {
  "left": { x: -1, y: 0 },
  "right": { x: 1, y: 0 },
  "up": { x: 0, y: -1 },
  "down": { x: 0, y: 1 },
};

const DIRECTION_KEYS: { [key: string]: Direction } = {
  "ArrowLeft": "left",
  "ArrowRight": "right",
  "ArrowUp": "up",
  "ArrowDown": "down",
  "KeyA": "left",
  "KeyD": "right",
  "KeyW": "up",
  "KeyS": "down",
};

interface ITheme {
  canvasFillStyle: string,
  playerFillStyle: string,
  playerStrokeStyle: string,
  objectFillStyle: string,
}

interface ICanvas {
  width: number,
  height: number,
  fillStyle: string,
}

interface IPlayer {
  length: number,
  breadth: number,
  x: number,
  y: number,
  speed: number,
  moving: Moving,
  links: number,
}

interface IObject {
  size: number,
  x: number,
  y: number,
}

let theme: ITheme;
if (THEME_MODE === "dark") {
  theme = {
    canvasFillStyle: "#282828",
    playerFillStyle: "#257180",
    playerStrokeStyle: "#F2E5BF",
    objectFillStyle: "#FD8B51",
  };
} else {
  theme = {
    canvasFillStyle: "",
    playerFillStyle: "",
    playerStrokeStyle: "",
    objectFillStyle: "",
  }
}

const canvas: ICanvas = {
  width: 800,
  height: 600,
  fillStyle: theme.canvasFillStyle,
};

const player: IPlayer = {
  length: PLAYER_INITIAL_SIZE,
  breadth: PLAYER_INITIAL_SIZE,
  speed: PLAYER_INITIAL_SPEED,
  x: Math.random() * CANVAS_WIDTH,
  y: Math.random() * CANVAS_HEIGHT,
  moving: {
    "left": true,
    "right": false,
    "up": false,
    "down": false,
  },
  links: 1,
};

const object: IObject = {
  x: Math.random() * CANVAS_WIDTH,
  y: Math.random() * CANVAS_HEIGHT,
  size: OBJECT_SIZE,
};

function correctMod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

function setPlayerDirection(direction: Direction) {
  player.moving = {
    left: false,
    right: false,
    up: false,
    down: false,
  };
  player.moving[direction] = true;
}

function playerTouchesObject(): boolean {
  if (
    Math.abs(player.x - object.x) <= EPS
    && Math.abs(player.y - object.y) <= EPS
  )
    return true;
  return false;
}

function updateObjectPosition() {
  object.x = Math.random() * canvas.width;
  object.y = Math.random() * canvas.height;
}

function updatePlayer(player: IPlayer, deltaTime: number) {
  let dir: Direction;
  let dx = 0;
  let dy = 0;
  for (dir in DIRECTION_VECTORS) {
    if (player.moving[dir]) {
      dx += DIRECTION_VECTORS[dir].x;
      dy += DIRECTION_VECTORS[dir].y;
    }
  }
  player.x = correctMod(player.x + dx * player.speed * deltaTime, canvas.width);
  player.y = correctMod(player.y + dy * player.speed * deltaTime, canvas.height);

  console.log(`Player: ${player.x}, ${player.y} \nObject x: ${object.x}, y: ${object.y}`);
  if (playerTouchesObject()) {
    updateObjectPosition();
  }
}

(() => {
  const gameCanvas = document.getElementById("game") as HTMLCanvasElement | undefined;
  if (!gameCanvas) throw new Error("No element with id `game` present.");
  gameCanvas.width = canvas.width;
  gameCanvas.height = canvas.height;
  const ctx = gameCanvas.getContext("2d");
  if (!ctx) throw new Error("2d context is not supported.");

  let previousTimestamp = 0;
  const frame = ((timestamp: number) => {
    const deltaTime = (timestamp - previousTimestamp) / 1000;
    previousTimestamp = timestamp;

    // NOTE: drawing canvas
    ctx.fillStyle = theme.canvasFillStyle;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // NOTE: drawing player
    updatePlayer(player, deltaTime);
    ctx.fillStyle = theme.playerFillStyle;
    ctx.fillRect(player.x, player.y, player.length, player.breadth);
    ctx.strokeStyle = theme.playerStrokeStyle;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.strokeRect(player.x, player.y, player.length, player.breadth);
    ctx.stroke();

    // NOTE: drawing object
    ctx.fillStyle = theme.objectFillStyle;
    ctx.fillRect(object.x, object.y, object.size, object.size);

    window.requestAnimationFrame(frame);
  });

  window.requestAnimationFrame((timestamp: number) => {
    previousTimestamp = timestamp;
    window.requestAnimationFrame(frame);
  });

  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (player) {
      if (!e.repeat) {
        setPlayerDirection(DIRECTION_KEYS[e.code]);
      }
    }
  });
})();
