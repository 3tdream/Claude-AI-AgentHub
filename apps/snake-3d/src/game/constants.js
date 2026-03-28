// Game Configuration Constants

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 300; // Start at 300ms
export const MIN_SPEED = 50;      // Maximum speed limit
export const SPEED_INCREASE = 2;  // Decrease by 2ms per food
export const POINTS_PER_FOOD = 10;

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: { speed: 200, label: 'Easy' },
  MEDIUM: { speed: 150, label: 'Medium' },
  HARD: { speed: 100, label: 'Hard' },
  EXPERT: { speed: 50, label: 'Expert' }
};

// Modern Clean Color Scheme
export const COLORS = {
  BACKGROUND: 0x0a0e27,      // Deep midnight blue
  FLOOR: 0x1a1f3a,           // Darker blue-gray
  GRID: 0x2d3561,            // Muted blue-purple
  SNAKE: 0x00e5ff,           // Bright cyan
  SNAKE_EMISSIVE: 0x00b8d4,  // Cyan glow
  SNAKE_HEAD: 0x00fff7,      // Bright white-cyan for head
  FOOD: 0xff006e,            // Hot pink/magenta
  FOOD_EMISSIVE: 0xff1744,   // Pink-red glow
  WALL: 0x4a5568,            // Cool gray
  WALL_EMISSIVE: 0x2d3748,   // Darker gray glow
  FOG: 0x0a0e27,             // Matches background
  ACCENT: 0x7c3aed           // Purple accent
};

// Camera Settings
export const CAMERA_CONFIG = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: { x: 0, y: 18, z: 12 },  // Camera will follow snake from this offset
  FOLLOW_SMOOTHNESS: 0.05,            // Ultra smooth camera follow (lower = smoother)
  LOOK_AHEAD: 2,                      // How far ahead of snake to look
  LOOK_SMOOTHNESS: 0.08               // How smoothly camera rotates to look ahead
};

// Enhanced Light Settings
export const LIGHT_CONFIG = {
  AMBIENT_INTENSITY: 0.3,
  DIRECTIONAL_INTENSITY: 1.2,
  DIRECTIONAL_POSITION: { x: 15, y: 25, z: 10 },
  POINT_LIGHT_1: {
    color: 0x00e5ff,
    intensity: 0.8,
    distance: 30,
    position: { x: -8, y: 8, z: -8 }
  },
  POINT_LIGHT_2: {
    color: 0xff006e,
    intensity: 0.6,
    distance: 25,
    position: { x: 8, y: 6, z: 8 }
  }
};

// Controls
export const KEY_BINDINGS = {
  UP: ['ArrowUp', 'w', 'W'],
  DOWN: ['ArrowDown', 's', 'S'],
  LEFT: ['ArrowLeft', 'a', 'A'],
  RIGHT: ['ArrowRight', 'd', 'D'],
  PAUSE: [' ', 'p', 'P']
};

// Initial Game State
export const INITIAL_GAME_STATE = {
  snake: [[0, 0, 0]],
  direction: [1, 0, 0],
  food: [5, 0, 5],
  growing: false,
  speed: INITIAL_SPEED,
  isPaused: false
};
