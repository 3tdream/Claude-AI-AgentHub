// Game Logic Helper Functions

/**
 * Check if the snake has collided with a wall
 */
export const checkWallCollision = (head, gridSize = 20) => {
  const halfGrid = gridSize / 2;
  return (
    head[0] < -halfGrid ||
    head[0] > halfGrid ||
    head[2] < -halfGrid ||
    head[2] > halfGrid
  );
};

/**
 * Check if the snake has collided with itself
 */
export const checkSelfCollision = (snake, newHead) => {
  return snake.some(segment =>
    segment[0] === newHead[0] && segment[2] === newHead[2]
  );
};

/**
 * Check if the snake has eaten food
 */
export const checkFoodCollision = (head, food) => {
  return head[0] === food[0] && head[2] === food[2];
};

/**
 * Generate a random food position
 */
export const generateFoodPosition = (gridSize = 20, snake = []) => {
  const halfGrid = gridSize / 2;
  let newFood;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    newFood = [
      Math.floor(Math.random() * gridSize) - halfGrid,
      0,
      Math.floor(Math.random() * gridSize) - halfGrid
    ];
    attempts++;
  } while (
    attempts < maxAttempts &&
    snake.some(segment => segment[0] === newFood[0] && segment[2] === newFood[2])
  );

  return newFood;
};

/**
 * Calculate the next head position based on current direction
 */
export const getNextHeadPosition = (head, direction) => {
  return [
    head[0] + direction[0],
    head[1] + direction[1],
    head[2] + direction[2]
  ];
};

/**
 * Validate direction change (prevent 180-degree turns)
 */
export const isValidDirectionChange = (currentDirection, newDirection) => {
  // Can't reverse direction (e.g., can't go left if currently going right)
  return !(
    currentDirection[0] === -newDirection[0] &&
    currentDirection[2] === -newDirection[2]
  );
};

/**
 * Calculate current game speed based on score
 */
export const calculateSpeed = (baseSpeed, scoreMultiplier, minSpeed = 50) => {
  return Math.max(minSpeed, baseSpeed - scoreMultiplier);
};

/**
 * Get high score from local storage
 */
export const getHighScore = () => {
  const stored = localStorage.getItem('snake3d-highscore');
  return stored ? parseInt(stored, 10) : 0;
};

/**
 * Save high score to local storage
 */
export const saveHighScore = (score) => {
  const currentHigh = getHighScore();
  if (score > currentHigh) {
    localStorage.setItem('snake3d-highscore', score.toString());
    return true;
  }
  return false;
};

/**
 * Reset high score
 */
export const resetHighScore = () => {
  localStorage.removeItem('snake3d-highscore');
};
