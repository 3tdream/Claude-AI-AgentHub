import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  GRID_SIZE,
  COLORS,
  CAMERA_CONFIG,
  LIGHT_CONFIG,
  KEY_BINDINGS,
  INITIAL_GAME_STATE,
  INITIAL_SPEED,
  SPEED_INCREASE,
  MIN_SPEED,
  POINTS_PER_FOOD
} from '../game/constants';
import {
  checkWallCollision,
  checkSelfCollision,
  checkFoodCollision,
  generateFoodPosition,
  getNextHeadPosition,
  isValidDirectionChange,
  getHighScore,
  saveHighScore
} from '../game/gameLogic';

const Snake3DGame = () => {
  const containerRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(INITIAL_SPEED);

  const gameStateRef = useRef({ ...INITIAL_GAME_STATE });
  const gameIntervalRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const scoreRef = useRef(0);
  const eatSoundRef = useRef(null);
  const gradientOffsetRef = useRef(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const audioContextRef = useRef(null);
  const materialPoolRef = useRef([]);
  const sharedGeometriesRef = useRef({});

  // Load high score and initialize audio context on mount
  useEffect(() => {
    setHighScore(getHighScore());
    // Initialize AudioContext once
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.log('Audio not supported:', error);
    }

    // Cleanup on unmount
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Create eat sound using Web Audio API
  const playEatSound = () => {
    if (!audioContextRef.current) return;
    try {
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a pleasant "pop" sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  // Create game over sound using Web Audio API
  const playGameOverSound = () => {
    if (!audioContextRef.current) return;
    try {
      const audioContext = audioContextRef.current;

      // Create three descending tones for a "sad" game over sound
      const times = [0, 0.15, 0.3];
      const frequencies = [400, 300, 200];

      times.forEach((time, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequencies[index], audioContext.currentTime + time);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime + time);
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.15);

        oscillator.type = 'square';
        oscillator.start(audioContext.currentTime + time);
        oscillator.stop(audioContext.currentTime + time + 0.15);
      });
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  // Create start game sound using Web Audio API
  const playStartSound = () => {
    if (!audioContextRef.current) return;
    try {
      const audioContext = audioContextRef.current;

      // Create ascending tones for an uplifting "start" sound
      const times = [0, 0.08, 0.16];
      const frequencies = [400, 600, 800];

      times.forEach((time, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequencies[index], audioContext.currentTime + time);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime + time);
        gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.12);

        oscillator.type = 'triangle';
        oscillator.start(audioContext.currentTime + time);
        oscillator.stop(audioContext.currentTime + time + 0.12);
      });
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  // Handle mobile controls
  const handleDirectionChange = (newDirection) => {
    const state = gameStateRef.current;
    if (gameStarted && !gameOver && !isPaused && isValidDirectionChange(state.direction, newDirection)) {
      state.direction = newDirection;
    }
  };

  // Create high score achievement sound using Web Audio API
  const playHighScoreSound = () => {
    if (!audioContextRef.current) return;
    try {
      const audioContext = audioContextRef.current;

      // Create a celebratory fanfare with rising notes
      const times = [0, 0.1, 0.2, 0.3, 0.4];
      const frequencies = [523, 659, 784, 1047, 1319]; // C, E, G, C, E (major chord arpeggio)

      times.forEach((time, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequencies[index], audioContext.currentTime + time);

        // Longer, more sustained notes for celebration
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + time);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.2);

        oscillator.type = 'sine';
        oscillator.start(audioContext.currentTime + time);
        oscillator.stop(audioContext.currentTime + time + 0.2);
      });
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  useEffect(() => {
    if (!containerRef.current || !gameStarted || gameOver) return;

    // Reset score ref
    scoreRef.current = 0;

    // Setup Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(COLORS.BACKGROUND);
    scene.fog = new THREE.Fog(COLORS.FOG, 20, 50);

    // Setup Camera
    const camera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.FOV,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      CAMERA_CONFIG.NEAR,
      CAMERA_CONFIG.FAR
    );
    camera.position.set(
      CAMERA_CONFIG.POSITION.x,
      CAMERA_CONFIG.POSITION.y,
      CAMERA_CONFIG.POSITION.z
    );
    camera.lookAt(0, 0, 0);

    // Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Enhanced Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, LIGHT_CONFIG.AMBIENT_INTENSITY);
    scene.add(ambientLight);

    // Main directional light (sun-like)
    const directionalLight = new THREE.DirectionalLight(0xffffff, LIGHT_CONFIG.DIRECTIONAL_INTENSITY);
    directionalLight.position.set(
      LIGHT_CONFIG.DIRECTIONAL_POSITION.x,
      LIGHT_CONFIG.DIRECTIONAL_POSITION.y,
      LIGHT_CONFIG.DIRECTIONAL_POSITION.z
    );
    directionalLight.castShadow = true;
    // OPTIMIZED: Reduced shadow map size for better performance
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);

    // Point Light 1 (Cyan accent)
    const pointLight1 = new THREE.PointLight(
      LIGHT_CONFIG.POINT_LIGHT_1.color,
      LIGHT_CONFIG.POINT_LIGHT_1.intensity,
      LIGHT_CONFIG.POINT_LIGHT_1.distance
    );
    pointLight1.position.set(
      LIGHT_CONFIG.POINT_LIGHT_1.position.x,
      LIGHT_CONFIG.POINT_LIGHT_1.position.y,
      LIGHT_CONFIG.POINT_LIGHT_1.position.z
    );
    // OPTIMIZED: Disable shadows for point lights to improve performance
    pointLight1.castShadow = false;
    scene.add(pointLight1);

    // Point Light 2 (Magenta accent)
    const pointLight2 = new THREE.PointLight(
      LIGHT_CONFIG.POINT_LIGHT_2.color,
      LIGHT_CONFIG.POINT_LIGHT_2.intensity,
      LIGHT_CONFIG.POINT_LIGHT_2.distance
    );
    pointLight2.position.set(
      LIGHT_CONFIG.POINT_LIGHT_2.position.x,
      LIGHT_CONFIG.POINT_LIGHT_2.position.y,
      LIGHT_CONFIG.POINT_LIGHT_2.position.z
    );
    // OPTIMIZED: Disable shadows for point lights to improve performance
    pointLight2.castShadow = false;
    scene.add(pointLight2);

    // Grid
    const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, COLORS.GRID, COLORS.GRID);
    scene.add(gridHelper);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.FLOOR,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // OPTIMIZED: Boundary Walls using shared geometry
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.WALL,
      emissive: COLORS.WALL_EMISSIVE,
      emissiveIntensity: 0.1,
      metalness: 0.6,
      roughness: 0.4
    });

    // Create shared wall geometry once
    if (!sharedGeometriesRef.current.wall) {
      sharedGeometriesRef.current.wall = new THREE.BoxGeometry(0.9, 1.5, 0.9);
    }
    const wallGeometry = sharedGeometriesRef.current.wall;

    const boundarySize = GRID_SIZE / 2;
    const wallOffset = 1.0; // Place walls one unit outside the grid
    const walls = [];

    // OPTIMIZED: Create walls more efficiently - only positions that need walls
    for (let i = -boundarySize; i <= boundarySize; i++) {
      // North wall (outside the board)
      const northWall = new THREE.Mesh(wallGeometry, wallMaterial);
      northWall.position.set(i, 0.75, -(boundarySize + wallOffset));
      northWall.castShadow = true;
      northWall.receiveShadow = true;
      scene.add(northWall);
      walls.push(northWall);

      // South wall (outside the board)
      const southWall = new THREE.Mesh(wallGeometry, wallMaterial);
      southWall.position.set(i, 0.75, boundarySize + wallOffset);
      southWall.castShadow = true;
      southWall.receiveShadow = true;
      scene.add(southWall);
      walls.push(southWall);

      // West wall (outside the board)
      const westWall = new THREE.Mesh(wallGeometry, wallMaterial);
      westWall.position.set(-(boundarySize + wallOffset), 0.75, i);
      westWall.castShadow = true;
      westWall.receiveShadow = true;
      scene.add(westWall);
      walls.push(westWall);

      // East wall (outside the board)
      const eastWall = new THREE.Mesh(wallGeometry, wallMaterial);
      eastWall.position.set(boundarySize + wallOffset, 0.75, i);
      eastWall.castShadow = true;
      eastWall.receiveShadow = true;
      scene.add(eastWall);
      walls.push(eastWall);
    }

    // Add corner pieces to completely close the perimeter
    const corners = [
      { x: -(boundarySize + wallOffset), z: -(boundarySize + wallOffset) }, // Northwest
      { x: boundarySize + wallOffset, z: -(boundarySize + wallOffset) },   // Northeast
      { x: -(boundarySize + wallOffset), z: boundarySize + wallOffset },   // Southwest
      { x: boundarySize + wallOffset, z: boundarySize + wallOffset }       // Southeast
    ];

    corners.forEach(corner => {
      const cornerWall = new THREE.Mesh(wallGeometry, wallMaterial);
      cornerWall.position.set(corner.x, 0.75, corner.z);
      cornerWall.castShadow = true;
      cornerWall.receiveShadow = true;
      scene.add(cornerWall);
      walls.push(cornerWall);
    });

    // Shared Geometries - Create once and reuse
    if (!sharedGeometriesRef.current.snakeSegment) {
      sharedGeometriesRef.current.snakeSegment = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    }
    if (!sharedGeometriesRef.current.snakeHead) {
      sharedGeometriesRef.current.snakeHead = new THREE.BoxGeometry(1.08, 1.08, 1.08);
    }
    if (!sharedGeometriesRef.current.food) {
      sharedGeometriesRef.current.food = new THREE.SphereGeometry(0.5, 16, 16);
    }

    // Materials
    const snakeMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.SNAKE,
      emissive: COLORS.SNAKE_EMISSIVE,
      emissiveIntensity: 0.3,
      metalness: 0.4,
      roughness: 0.3
    });

    const snakeHeadMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.SNAKE_HEAD,
      emissive: COLORS.SNAKE_HEAD,
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.2
    });

    const foodMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.FOOD,
      emissive: COLORS.FOOD_EMISSIVE,
      emissiveIntensity: 0.6,
      metalness: 0.6,
      roughness: 0.2
    });

    // Pre-create material pool for gradient segments (max 100 segments)
    const MAX_SEGMENTS = 100;
    if (materialPoolRef.current.length === 0) {
      for (let i = 0; i < MAX_SEGMENTS; i++) {
        const gradientFactor = 1.0 - (i / (MAX_SEGMENTS - 1)) * 0.8;
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(COLORS.SNAKE).multiplyScalar(gradientFactor),
          emissive: new THREE.Color(COLORS.SNAKE_EMISSIVE).multiplyScalar(gradientFactor),
          emissiveIntensity: 0.3 * gradientFactor,
          metalness: 0.4,
          roughness: 0.3
        });
        materialPoolRef.current.push(material);
      }
    }

    const snakeMeshes = [];
    let foodMesh;

    // Create Snake Segment - Using shared geometries
    const createSnakeSegment = (pos, isHead = false) => {
      const geometry = isHead ? sharedGeometriesRef.current.snakeHead : sharedGeometriesRef.current.snakeSegment;
      const material = isHead ? snakeHeadMaterial : snakeMaterial;
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pos[0], 0.5, pos[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    };

    // Create Food - Using shared geometry
    const createFood = (pos) => {
      const mesh = new THREE.Mesh(sharedGeometriesRef.current.food, foodMaterial);
      mesh.position.set(pos[0], 0.5, pos[2]);
      mesh.castShadow = true;
      scene.add(mesh);
      return mesh;
    };

    // Update Snake Meshes - OPTIMIZED with material pool
    const updateSnakeMeshes = () => {
      // Add new segments if needed
      while (snakeMeshes.length < gameStateRef.current.snake.length) {
        const index = snakeMeshes.length;
        const pos = gameStateRef.current.snake[index];
        const isHead = index === 0;
        snakeMeshes.push(createSnakeSegment(pos, isHead));
      }

      // Update positions and materials using pre-created pool
      gameStateRef.current.snake.forEach((pos, i) => {
        if (snakeMeshes[i]) {
          snakeMeshes[i].position.set(pos[0], 0.5, pos[2]);

          const isHead = i === 0;
          const snakeLength = gameStateRef.current.snake.length;

          if (isHead) {
            // Head uses head material and geometry
            if (snakeMeshes[i].material !== snakeHeadMaterial) {
              snakeMeshes[i].material = snakeHeadMaterial;
              snakeMeshes[i].geometry = sharedGeometriesRef.current.snakeHead;
            }
          } else {
            // Body segments use pooled materials - no recreation!
            const adjustedIndex = (i + gradientOffsetRef.current) % snakeLength;
            const materialIndex = Math.min(adjustedIndex, materialPoolRef.current.length - 1);

            // Simply assign from pool - no material creation!
            snakeMeshes[i].material = materialPoolRef.current[materialIndex];
            if (snakeMeshes[i].geometry !== sharedGeometriesRef.current.snakeSegment) {
              snakeMeshes[i].geometry = sharedGeometriesRef.current.snakeSegment;
            }
          }
        }
      });

      // Remove excess segments
      while (snakeMeshes.length > gameStateRef.current.snake.length) {
        const removedMesh = snakeMeshes.pop();
        scene.remove(removedMesh);
        // Don't dispose materials or geometries - they're shared!
      }
    };

    // Update Food - Don't dispose shared geometry
    const updateFood = () => {
      if (foodMesh) {
        scene.remove(foodMesh);
        // Don't dispose geometry - it's shared!
      }
      foodMesh = createFood(gameStateRef.current.food);
    };

    // Handle Key Press
    const handleKeyPress = (e) => {
      const state = gameStateRef.current;
      const key = e.key;

      // Pause/Resume
      if (KEY_BINDINGS.PAUSE.includes(key)) {
        setIsPaused(prev => !prev);
        state.isPaused = !state.isPaused;
        return;
      }

      // Direction changes
      let newDirection = null;

      if (KEY_BINDINGS.UP.includes(key)) {
        newDirection = [0, 0, -1];
      } else if (KEY_BINDINGS.DOWN.includes(key)) {
        newDirection = [0, 0, 1];
      } else if (KEY_BINDINGS.LEFT.includes(key)) {
        newDirection = [-1, 0, 0];
      } else if (KEY_BINDINGS.RIGHT.includes(key)) {
        newDirection = [1, 0, 0];
      }

      if (newDirection && isValidDirectionChange(state.direction, newDirection)) {
        state.direction = newDirection;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Game Loop
    const gameLoop = () => {
      const state = gameStateRef.current;

      // Skip if paused
      if (state.isPaused) {
        return;
      }

      const head = state.snake[0];
      const newHead = getNextHeadPosition(head, state.direction);

      // Check collisions
      if (checkWallCollision(newHead, GRID_SIZE)) {
        playGameOverSound();
        setGameOver(true);
        return;
      }

      if (checkSelfCollision(state.snake, newHead)) {
        playGameOverSound();
        setGameOver(true);
        return;
      }

      // Move snake
      state.snake.unshift(newHead);

      // Check food collision
      if (checkFoodCollision(newHead, state.food)) {
        const newScore = scoreRef.current + POINTS_PER_FOOD;
        scoreRef.current = newScore;
        setScore(newScore);

        // Rotate gradient offset for color reordering effect
        gradientOffsetRef.current = (gradientOffsetRef.current + 1) % state.snake.length;

        // Check for new high score
        if (newScore > highScore) {
          // Play high score sound
          playHighScoreSound();
          setHighScore(newScore);
          saveHighScore(newScore);
          setIsNewHighScore(true);
        } else {
          // Play regular eat sound
          playEatSound();
        }

        // Generate new food
        state.food = generateFoodPosition(GRID_SIZE, state.snake);
        updateFood();

        // Increase speed
        state.speed = Math.max(MIN_SPEED, state.speed - SPEED_INCREASE);
        setCurrentSpeed(state.speed);

        // Restart interval with new speed
        if (gameIntervalRef.current) {
          clearInterval(gameIntervalRef.current);
          gameIntervalRef.current = setInterval(gameLoop, state.speed);
        }
      } else {
        // Remove tail if not growing
        state.snake.pop();
      }

      updateSnakeMeshes();
    };

    // Initialize game visuals
    updateSnakeMeshes();
    updateFood();

    // Start game loop
    gameIntervalRef.current = setInterval(gameLoop, gameStateRef.current.speed);

    // Animation loop for rendering
    let animationId;

    // Smooth look-at target tracking
    const lookAtTarget = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate food
      if (foodMesh) {
        foodMesh.rotation.y += 0.02;
        foodMesh.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.1;
      }

      // Ultra-smooth camera following
      if (gameStateRef.current.snake.length > 0) {
        const head = gameStateRef.current.snake[0];
        const direction = gameStateRef.current.direction;

        // Calculate look-ahead position
        const targetLookX = head[0] + direction[0] * CAMERA_CONFIG.LOOK_AHEAD;
        const targetLookZ = head[2] + direction[2] * CAMERA_CONFIG.LOOK_AHEAD;

        // Target camera position (behind and above the snake)
        const targetCamX = head[0] + CAMERA_CONFIG.POSITION.x;
        const targetCamY = CAMERA_CONFIG.POSITION.y;
        const targetCamZ = head[2] + CAMERA_CONFIG.POSITION.z;

        // Ultra-smooth camera position interpolation (lower = smoother)
        camera.position.x += (targetCamX - camera.position.x) * CAMERA_CONFIG.FOLLOW_SMOOTHNESS;
        camera.position.y += (targetCamY - camera.position.y) * CAMERA_CONFIG.FOLLOW_SMOOTHNESS;
        camera.position.z += (targetCamZ - camera.position.z) * CAMERA_CONFIG.FOLLOW_SMOOTHNESS;

        // Smoothly interpolate look-at target
        lookAtTarget.x += (targetLookX - lookAtTarget.x) * CAMERA_CONFIG.LOOK_SMOOTHNESS;
        lookAtTarget.y += (0 - lookAtTarget.y) * CAMERA_CONFIG.LOOK_SMOOTHNESS;
        lookAtTarget.z += (targetLookZ - lookAtTarget.z) * CAMERA_CONFIG.LOOK_SMOOTHNESS;

        // Camera looks at smoothed target
        camera.lookAt(lookAtTarget);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // OPTIMIZED Cleanup - Don't dispose shared resources
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('resize', handleResize);
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
      cancelAnimationFrame(animationId);

      // Remove meshes from scene (but don't dispose shared geometries)
      snakeMeshes.forEach(mesh => {
        scene.remove(mesh);
        // Geometries are shared - don't dispose!
      });
      if (foodMesh) {
        scene.remove(foodMesh);
        // Geometry is shared - don't dispose!
      }

      // Cleanup walls
      walls.forEach(wall => {
        scene.remove(wall);
        // Wall geometry is shared - don't dispose!
      });

      // Dispose only non-shared materials and geometries
      floorMaterial.dispose();
      floorGeometry.dispose();
      snakeMaterial.dispose();
      snakeHeadMaterial.dispose();
      foodMaterial.dispose();
      wallMaterial.dispose();
      // Don't dispose shared geometries or material pool!

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [gameStarted, gameOver]);

  const startGame = () => {
    // Play start sound
    playStartSound();

    // Clear any existing interval
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }

    // Reset all state
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setIsNewHighScore(false);
    scoreRef.current = 0;
    gameStateRef.current = { ...INITIAL_GAME_STATE };
  };

  const restartGame = () => {
    // Clear the interval immediately
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }

    // Trigger cleanup first by setting gameStarted to false
    setGameStarted(false);

    // Use setTimeout to ensure cleanup completes, then reset and restart
    setTimeout(() => {
      // Play start sound
      playStartSound();

      // Reset all game state AFTER cleanup
      setGameOver(false);
      scoreRef.current = 0;
      setScore(0);
      setIsPaused(false);
      setIsNewHighScore(false);
      setCurrentSpeed(INITIAL_SPEED);
      gradientOffsetRef.current = 0;

      // Create a fresh copy of initial state
      gameStateRef.current = {
        snake: [[0, 0, 0]],
        direction: [1, 0, 0],
        food: [5, 0, 5],
        growing: false,
        speed: INITIAL_SPEED,
        isPaused: false
      };

      // Start the new game
      setGameStarted(true);
    }, 100);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-slate-800 rounded-t-lg p-4 flex justify-between items-center border-b-2 border-emerald-500">
          <h1 className="text-3xl font-bold text-emerald-400">3D Snake</h1>
          <div className="flex gap-6 items-center">
            <div className="text-xl font-bold text-white">Score: {score}</div>
            <div className="text-xl font-bold text-yellow-400">High: {highScore}</div>
            <div className="text-lg font-bold text-cyan-400">
              Speed: {((1000 / currentSpeed) + 10).toFixed(1)}x
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="w-full bg-slate-900 relative"
          style={{ height: '600px' }}
        >
          {!gameStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10">
              <h2 className="text-4xl font-bold text-white mb-4">3D Snake Game</h2>
              <p className="text-gray-300 mb-2 text-center">Use Arrow Keys or WASD to control the snake</p>
              <p className="text-gray-300 mb-6 text-center">Press SPACE or P to pause</p>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xl transition-colors"
              >
                Start Game
              </button>
            </div>
          )}

          {isPaused && gameStarted && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10">
              <h2 className="text-5xl font-bold text-yellow-400 mb-4">PAUSED</h2>
              <p className="text-2xl text-white">Press SPACE or P to resume</p>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10">
              <h2 className="text-5xl font-bold text-red-500 mb-4">Game Over!</h2>
              {isNewHighScore && (
                <p className="text-3xl text-yellow-400 mb-2 animate-pulse">NEW HIGH SCORE!</p>
              )}
              <p className="text-3xl text-white mb-6">Final Score: {score}</p>
              <button
                onClick={restartGame}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xl transition-colors"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-b-lg p-4 text-gray-300 text-sm">
          <p className="hidden md:block">
            <strong>Controls:</strong> Arrow Keys or WASD to move | SPACE or P to pause |
            Eat red spheres to grow | Avoid walls and yourself!
          </p>
          <p className="md:hidden text-center">
            <strong>Mobile:</strong> Use buttons below to control | Tap Pause to pause
          </p>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden mt-4">
          <div className="flex flex-col items-center gap-2">
            {/* Up button */}
            <button
              onClick={() => handleDirectionChange([0, 0, -1])}
              className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-lg text-2xl transition-colors shadow-lg"
            >
              ↑
            </button>

            {/* Left, Pause, Right row */}
            <div className="flex gap-2 items-center">
              <button
                onClick={() => handleDirectionChange([-1, 0, 0])}
                className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-lg text-2xl transition-colors shadow-lg"
              >
                ←
              </button>

              <button
                onClick={() => {
                  if (gameStarted && !gameOver) {
                    setIsPaused(prev => !prev);
                    gameStateRef.current.isPaused = !gameStateRef.current.isPaused;
                  }
                }}
                className="w-16 h-16 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white font-bold rounded-lg text-sm transition-colors shadow-lg"
              >
                {isPaused ? '▶' : '⏸'}
              </button>

              <button
                onClick={() => handleDirectionChange([1, 0, 0])}
                className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-lg text-2xl transition-colors shadow-lg"
              >
                →
              </button>
            </div>

            {/* Down button */}
            <button
              onClick={() => handleDirectionChange([0, 0, 1])}
              className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-lg text-2xl transition-colors shadow-lg"
            >
              ↓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Snake3DGame;
