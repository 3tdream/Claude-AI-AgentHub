import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Constants
const GRID_SIZE = 20;
const POINTS_PER_FOOD = 10;

const DIFFICULTY_LEVELS = {
  EASY: { speed: 250, speedIncrease: 1, label: 'Easy', obstacleChance: 0.02 },
  MEDIUM: { speed: 180, speedIncrease: 2, label: 'Medium', obstacleChance: 0.04 },
  HARD: { speed: 120, speedIncrease: 3, label: 'Hard', obstacleChance: 0.06 },
  EXPERT: { speed: 80, speedIncrease: 4, label: 'Expert', obstacleChance: 0.08 }
};

const POWER_UP_TYPES = {
  SPEED: { color: 0x00ff00, duration: 5000, label: '⚡ Speed Boost' },
  SLOW: { color: 0x0088ff, duration: 5000, label: '🐌 Slow-Mo' },
  SHIELD: { color: 0xffff00, duration: 8000, label: '🛡️ Shield' },
  MULTIPLIER: { color: 0xff00ff, duration: 10000, label: '✖️ 2x Points' }
};

const COLORS = {
  BACKGROUND: 0x0a0e27,
  FLOOR: 0x1a1f3a,
  GRID: 0x2d3561,
  SNAKE: 0x00e5ff,
  SNAKE_EMISSIVE: 0x00b8d4,
  SNAKE_HEAD: 0x00fff7,
  FOOD: 0xff006e,
  FOOD_EMISSIVE: 0xff1744,
  WALL: 0x4a5568,
  WALL_EMISSIVE: 0x2d3748,
  OBSTACLE: 0xff4444,
  OBSTACLE_EMISSIVE: 0xff0000,
  FOG: 0x0a0e27
};

const CAMERA_CONFIG = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: { x: 0, y: 18, z: 12 },
  FOLLOW_SMOOTHNESS: 0.005,
  LOOK_AHEAD: 2,
  LOOK_SMOOTHNESS: 0.008
};

const Snake3DGame = () => {
  const containerRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [showDifficultySelect, setShowDifficultySelect] = useState(true);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(180);
  const [swipeIndicator, setSwipeIndicator] = useState(null);
  const [playCount, setPlayCount] = useState(0);

  const gameStateRef = useRef({
    snake: [[0, 0, 0]],
    direction: [1, 0, 0],
    food: [5, 0, 5],
    powerUp: null,
    obstacles: [],
    speed: 180,
    isPaused: false,
    hasShield: false,
    scoreMultiplier: 1
  });
  const gameIntervalRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const scoreRef = useRef(0);
  const gradientOffsetRef = useRef(0);
  const particlesRef = useRef([]);
  const headAnimationRef = useRef({ scale: 1.0, eating: false, time: 0 });
  const touchStartRef = useRef({ x: 0, y: 0 });
  const lastSwipeTimeRef = useRef(0);
  const swipeProcessedRef = useRef(false);

  // OPTIMIZATION: Shared refs for reusable resources
  const audioContextRef = useRef(null);
  const materialPoolRef = useRef([]);
  const sharedGeometriesRef = useRef({});
  const shieldMaterialRef = useRef(null);

  // OPTIMIZATION: Initialize AudioContext once
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Audio not supported');
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // OPTIMIZED: Reuse AudioContext
  const playSound = (frequencies, durations, type = 'sine') => {
    if (!audioContextRef.current) return;
    try {
      const audioContext = audioContextRef.current;
      frequencies.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + (i * 0.1));
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + (i * 0.1));
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (i * 0.1) + durations[i]);
        osc.type = type;
        osc.start(audioContext.currentTime + (i * 0.1));
        osc.stop(audioContext.currentTime + (i * 0.1) + durations[i]);
      });
    } catch (e) {}
  };

  const createParticles = (position, color) => {
    if (!sceneRef.current) return;
    const particleCount = 15;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color });
      const particle = new THREE.Mesh(geometry, material);

      particle.position.set(position[0], 0.5, position[2]);
      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        Math.random() * 0.3,
        (Math.random() - 0.5) * 0.3
      );
      particle.life = 1.0;

      sceneRef.current.add(particle);
      particles.push(particle);
    }

    particlesRef.current.push(...particles);
  };

  const updateParticles = () => {
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.life -= 0.02;
      if (particle.life <= 0) {
        sceneRef.current.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
        return false;
      }

      particle.position.add(particle.velocity);
      particle.velocity.y -= 0.01;
      particle.material.opacity = particle.life;
      particle.material.transparent = true;
      return true;
    });
  };

  useEffect(() => {
    if (!containerRef.current || !gameStarted || gameOver) return;

    scoreRef.current = 0;
    const diffConfig = DIFFICULTY_LEVELS[difficulty];

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(COLORS.BACKGROUND);
    scene.fog = new THREE.Fog(COLORS.FOG, 20, 50);

    const camera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.FOV,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      CAMERA_CONFIG.NEAR,
      CAMERA_CONFIG.FAR
    );
    camera.position.set(CAMERA_CONFIG.POSITION.x, CAMERA_CONFIG.POSITION.y, CAMERA_CONFIG.POSITION.z);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // OPTIMIZED: Cap pixel ratio
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(15, 25, 10);
    directionalLight.castShadow = true;
    // OPTIMIZED: Reduced shadow map size for better performance
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 60;
    directionalLight.shadow.bias = -0.0005;
    directionalLight.shadow.normalBias = 0.02;
    directionalLight.shadow.radius = 2;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x00e5ff, 1.2, 35);
    pointLight1.position.set(-8, 10, -8);
    // OPTIMIZED: Disable shadows for point lights
    pointLight1.castShadow = false;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff006e, 1.0, 30);
    pointLight2.position.set(8, 8, 8);
    // OPTIMIZED: Disable shadows for point lights
    pointLight2.castShadow = false;
    scene.add(pointLight2);

    const fillLight = new THREE.DirectionalLight(0x4466ff, 0.3);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff88cc, 0.4);
    rimLight.position.set(0, 5, -15);
    scene.add(rimLight);

    const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, COLORS.GRID, COLORS.GRID);
    scene.add(gridHelper);

    const floorGeometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.FLOOR,
      roughness: 0.9,
      metalness: 0.1,
      envMapIntensity: 0.5
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // OPTIMIZED: Create shared geometries once
    if (!sharedGeometriesRef.current.wall) {
      sharedGeometriesRef.current.wall = new THREE.BoxGeometry(0.9, 1.5, 0.9);
    }
    if (!sharedGeometriesRef.current.snakeSegment) {
      sharedGeometriesRef.current.snakeSegment = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    }
    if (!sharedGeometriesRef.current.snakeHead) {
      sharedGeometriesRef.current.snakeHead = new THREE.BoxGeometry(1.08, 1.08, 1.08);
    }
    if (!sharedGeometriesRef.current.food) {
      sharedGeometriesRef.current.food = new THREE.SphereGeometry(0.5, 16, 16);
    }
    if (!sharedGeometriesRef.current.powerUp) {
      sharedGeometriesRef.current.powerUp = new THREE.OctahedronGeometry(0.5);
    }
    if (!sharedGeometriesRef.current.obstacle) {
      sharedGeometriesRef.current.obstacle = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    }

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.WALL,
      emissive: COLORS.WALL_EMISSIVE,
      emissiveIntensity: 0.15,
      metalness: 0.7,
      roughness: 0.3
    });

    const wallGeometry = sharedGeometriesRef.current.wall;
    const boundarySize = GRID_SIZE / 2;
    const wallOffset = 1.0;
    const walls = [];

    for (let i = -boundarySize; i <= boundarySize; i++) {
      const positions = [
        [i, 0.75, -(boundarySize + wallOffset)],
        [i, 0.75, boundarySize + wallOffset],
        [-(boundarySize + wallOffset), 0.75, i],
        [boundarySize + wallOffset, 0.75, i]
      ];

      positions.forEach(pos => {
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(...pos);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
        walls.push(wall);
      });
    }

    const corners = [
      [-(boundarySize + wallOffset), 0.75, -(boundarySize + wallOffset)],
      [boundarySize + wallOffset, 0.75, -(boundarySize + wallOffset)],
      [-(boundarySize + wallOffset), 0.75, boundarySize + wallOffset],
      [boundarySize + wallOffset, 0.75, boundarySize + wallOffset]
    ];

    corners.forEach(pos => {
      const cornerWall = new THREE.Mesh(wallGeometry, wallMaterial);
      cornerWall.position.set(...pos);
      cornerWall.castShadow = true;
      cornerWall.receiveShadow = true;
      scene.add(cornerWall);
      walls.push(cornerWall);
    });

    const snakeMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.SNAKE,
      emissive: COLORS.SNAKE_EMISSIVE,
      emissiveIntensity: 0.3,
      metalness: 0.5,
      roughness: 0.2
    });

    const snakeHeadMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.SNAKE_HEAD,
      emissive: COLORS.SNAKE_HEAD,
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.15
    });

    // OPTIMIZED: Create shield material once and reuse
    if (!shieldMaterialRef.current) {
      shieldMaterialRef.current = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.6,
        metalness: 0.5,
        roughness: 0.2
      });
    }

    const foodMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.FOOD,
      emissive: COLORS.FOOD_EMISSIVE,
      emissiveIntensity: 0.7,
      metalness: 0.7,
      roughness: 0.15
    });

    const obstacleMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.OBSTACLE,
      emissive: COLORS.OBSTACLE_EMISSIVE,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.2
    });

    // OPTIMIZED: Pre-create material pool for gradient segments
    const MAX_SEGMENTS = 100;
    if (materialPoolRef.current.length === 0) {
      for (let i = 0; i < MAX_SEGMENTS; i++) {
        const gradientFactor = 1.0 - (i / (MAX_SEGMENTS - 1)) * 0.8;
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(COLORS.SNAKE).multiplyScalar(gradientFactor),
          emissive: new THREE.Color(COLORS.SNAKE_EMISSIVE).multiplyScalar(gradientFactor),
          emissiveIntensity: 0.3 * gradientFactor,
          metalness: 0.5,
          roughness: 0.2
        });
        materialPoolRef.current.push(material);
      }
    }

    const snakeMeshes = [];
    let foodMesh;
    let powerUpMesh;
    const obstacleMeshes = [];

    // OPTIMIZED: Use shared geometries
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

    const createFood = (pos) => {
      const mesh = new THREE.Mesh(sharedGeometriesRef.current.food, foodMaterial);
      mesh.position.set(pos[0], 0.5, pos[2]);
      mesh.castShadow = true;
      scene.add(mesh);
      return mesh;
    };

    const createPowerUp = (pos, type) => {
      const material = new THREE.MeshStandardMaterial({
        color: POWER_UP_TYPES[type].color,
        emissive: POWER_UP_TYPES[type].color,
        emissiveIntensity: 0.9,
        metalness: 0.9,
        roughness: 0.05
      });
      const mesh = new THREE.Mesh(sharedGeometriesRef.current.powerUp, material);
      mesh.position.set(pos[0], 0.5, pos[2]);
      mesh.castShadow = true;
      mesh.userData.type = type;
      mesh.userData.material = material; // Store for cleanup
      scene.add(mesh);
      return mesh;
    };

    const createObstacle = (pos) => {
      const mesh = new THREE.Mesh(sharedGeometriesRef.current.obstacle, obstacleMaterial);
      mesh.position.set(pos[0], 0.45, pos[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    };

    const generatePosition = (avoid = []) => {
      const halfGrid = GRID_SIZE / 2;
      let pos;
      let attempts = 0;
      do {
        pos = [
          Math.floor(Math.random() * GRID_SIZE) - halfGrid,
          0,
          Math.floor(Math.random() * GRID_SIZE) - halfGrid
        ];
        attempts++;
      } while (
        attempts < 100 &&
        avoid.some(p => p[0] === pos[0] && p[2] === pos[2])
      );
      return pos;
    };

    // OPTIMIZED: Use material pool instead of creating new materials
    const updateSnakeMeshes = () => {
      while (snakeMeshes.length < gameStateRef.current.snake.length) {
        const index = snakeMeshes.length;
        const pos = gameStateRef.current.snake[index];
        const isHead = index === 0;
        snakeMeshes.push(createSnakeSegment(pos, isHead));
      }

      gameStateRef.current.snake.forEach((pos, i) => {
        if (snakeMeshes[i]) {
          snakeMeshes[i].position.set(pos[0], 0.5, pos[2]);
          const isHead = i === 0;
          const snakeLength = gameStateRef.current.snake.length;

          if (isHead) {
            // OPTIMIZED: Reuse shield material instead of creating new one
            snakeMeshes[i].material = gameStateRef.current.hasShield ?
              shieldMaterialRef.current : snakeHeadMaterial;

            // Apply eating animation to head
            const animScale = headAnimationRef.current.scale;
            const baseScale = 1.08 / 0.9;
            snakeMeshes[i].scale.set(baseScale * animScale, baseScale * animScale, baseScale * animScale);
            snakeMeshes[i].geometry = sharedGeometriesRef.current.snakeHead;
          } else {
            // OPTIMIZED: Use pre-created material from pool
            const adjustedIndex = (i + gradientOffsetRef.current) % snakeLength;
            const materialIndex = Math.min(adjustedIndex, materialPoolRef.current.length - 1);
            snakeMeshes[i].material = materialPoolRef.current[materialIndex];
            snakeMeshes[i].geometry = sharedGeometriesRef.current.snakeSegment;
            snakeMeshes[i].scale.set(1.0, 1.0, 1.0);
          }
        }
      });

      while (snakeMeshes.length > gameStateRef.current.snake.length) {
        const removed = snakeMeshes.pop();
        scene.remove(removed);
        // Don't dispose shared geometries or pooled materials!
      }
    };

    const updateFood = () => {
      if (foodMesh) {
        scene.remove(foodMesh);
        // Don't dispose shared geometry!
      }
      foodMesh = createFood(gameStateRef.current.food);
    };

    const spawnPowerUp = () => {
      if (Math.random() < 0.3) {
        const types = Object.keys(POWER_UP_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];
        const avoid = [...gameStateRef.current.snake, gameStateRef.current.food, ...gameStateRef.current.obstacles];
        gameStateRef.current.powerUp = {
          position: generatePosition(avoid),
          type
        };
        if (powerUpMesh) {
          scene.remove(powerUpMesh);
          // Dispose powerup-specific material
          if (powerUpMesh.userData.material) {
            powerUpMesh.userData.material.dispose();
          }
        }
        powerUpMesh = createPowerUp(gameStateRef.current.powerUp.position, type);
      }
    };

    const spawnObstacle = () => {
      if (Math.random() < diffConfig.obstacleChance && gameStateRef.current.obstacles.length < 15) {
        const avoid = [...gameStateRef.current.snake, gameStateRef.current.food, ...gameStateRef.current.obstacles];
        if (gameStateRef.current.powerUp) avoid.push(gameStateRef.current.powerUp.position);
        const pos = generatePosition(avoid);
        gameStateRef.current.obstacles.push(pos);
        obstacleMeshes.push(createObstacle(pos));
      }
    };

    const activatePowerUp = (type) => {
      const config = POWER_UP_TYPES[type];
      const id = Date.now();

      setActivePowerUps(prev => [...prev, { type, id, label: config.label }]);

      if (type === 'SPEED') {
        gameStateRef.current.speed = Math.max(30, gameStateRef.current.speed * 0.5);
      } else if (type === 'SLOW') {
        gameStateRef.current.speed = gameStateRef.current.speed * 2;
      } else if (type === 'SHIELD') {
        gameStateRef.current.hasShield = true;
      } else if (type === 'MULTIPLIER') {
        gameStateRef.current.scoreMultiplier = 2;
      }

      setCurrentSpeed(gameStateRef.current.speed);

      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = setInterval(gameLoop, gameStateRef.current.speed);
      }

      setTimeout(() => {
        setActivePowerUps(prev => prev.filter(p => p.id !== id));
        if (type === 'SPEED' || type === 'SLOW') {
          gameStateRef.current.speed = diffConfig.speed - Math.floor((scoreRef.current / 10) * diffConfig.speedIncrease);
          gameStateRef.current.speed = Math.max(50, gameStateRef.current.speed);
          setCurrentSpeed(gameStateRef.current.speed);
          if (gameIntervalRef.current) {
            clearInterval(gameIntervalRef.current);
            gameIntervalRef.current = setInterval(gameLoop, gameStateRef.current.speed);
          }
        } else if (type === 'SHIELD') {
          gameStateRef.current.hasShield = false;
        } else if (type === 'MULTIPLIER') {
          gameStateRef.current.scoreMultiplier = 1;
        }
      }, config.duration);
    };

    const handleKeyPress = (e) => {
      const state = gameStateRef.current;
      const key = e.key;

      if ([' ', 'p', 'P'].includes(key)) {
        setIsPaused(prev => !prev);
        state.isPaused = !state.isPaused;
        return;
      }

      let newDirection = null;
      if (['ArrowUp', 'w', 'W'].includes(key)) newDirection = [0, 0, -1];
      else if (['ArrowDown', 's', 'S'].includes(key)) newDirection = [0, 0, 1];
      else if (['ArrowLeft', 'a', 'A'].includes(key)) newDirection = [-1, 0, 0];
      else if (['ArrowRight', 'd', 'D'].includes(key)) newDirection = [1, 0, 0];

      if (newDirection && !(state.direction[0] === -newDirection[0] && state.direction[2] === -newDirection[2])) {
        state.direction = newDirection;
      }
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY
      };
      swipeProcessedRef.current = false;
    };

    const processSwipe = (deltaX, deltaY) => {
      const state = gameStateRef.current;
      const now = Date.now();

      if (now - lastSwipeTimeRef.current < 100) {
        return false;
      }

      const minSwipeDistance = 20;

      if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
        return false;
      }

      let newDirection = null;
      let directionLabel = '';

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          newDirection = [1, 0, 0];
          directionLabel = '→';
        } else {
          newDirection = [-1, 0, 0];
          directionLabel = '←';
        }
      } else {
        if (deltaY > 0) {
          newDirection = [0, 0, 1];
          directionLabel = '↓';
        } else {
          newDirection = [0, 0, -1];
          directionLabel = '↑';
        }
      }

      if (newDirection && !(state.direction[0] === -newDirection[0] && state.direction[2] === -newDirection[2])) {
        state.direction = newDirection;
        lastSwipeTimeRef.current = now;

        setSwipeIndicator(directionLabel);
        setTimeout(() => setSwipeIndicator(null), 300);

        return true;
      }

      return false;
    };

    const handleTouchMove = (e) => {
      if (swipeProcessedRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (processSwipe(deltaX, deltaY)) {
        swipeProcessedRef.current = true;
      }
    };

    const handleTouchEnd = (e) => {
      if (!swipeProcessedRef.current) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        processSwipe(deltaX, deltaY);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    const gameLoop = () => {
      const state = gameStateRef.current;
      if (state.isPaused) return;

      const head = state.snake[0];
      const newHead = [head[0] + state.direction[0], head[1], head[2] + state.direction[2]];

      const halfGrid = GRID_SIZE / 2;
      const hitWall = newHead[0] < -halfGrid || newHead[0] > halfGrid || newHead[2] < -halfGrid || newHead[2] > halfGrid;
      const hitSelf = state.snake.some(s => s[0] === newHead[0] && s[2] === newHead[2]);
      const hitObstacle = state.obstacles.some(o => o[0] === newHead[0] && o[2] === newHead[2]);

      if ((hitWall || hitSelf || hitObstacle) && !state.hasShield) {
        playSound([400, 300, 200], [0.15, 0.15, 0.15], 'square');
        setGameOver(true);
        return;
      }

      state.snake.unshift(newHead);

      if (newHead[0] === state.food[0] && newHead[2] === state.food[2]) {
        const points = POINTS_PER_FOOD * state.scoreMultiplier;
        const newScore = scoreRef.current + points;
        scoreRef.current = newScore;
        setScore(newScore);

        headAnimationRef.current.eating = true;
        headAnimationRef.current.time = 0;

        createParticles(newHead, COLORS.FOOD);
        gradientOffsetRef.current = (gradientOffsetRef.current + 1) % state.snake.length;

        if (newScore > highScore) {
          playSound([523, 659, 784, 1047, 1319], [0.2, 0.2, 0.2, 0.2, 0.2], 'sine');
          setHighScore(newScore);
          setIsNewHighScore(true);
        } else {
          playSound([800, 400], [0.1, 0.1], 'sine');
        }

        const avoid = [...state.snake, ...state.obstacles];
        if (state.powerUp) avoid.push(state.powerUp.position);
        state.food = generatePosition(avoid);
        updateFood();

        state.speed = Math.max(50, diffConfig.speed - Math.floor((scoreRef.current / 10) * diffConfig.speedIncrease));
        setCurrentSpeed(state.speed);

        if (gameIntervalRef.current) {
          clearInterval(gameIntervalRef.current);
          gameIntervalRef.current = setInterval(gameLoop, state.speed);
        }

        spawnPowerUp();
        spawnObstacle();
      } else if (state.powerUp && newHead[0] === state.powerUp.position[0] && newHead[2] === state.powerUp.position[2]) {
        playSound([600, 800, 1000], [0.1, 0.1, 0.1], 'triangle');
        activatePowerUp(state.powerUp.type);
        createParticles(newHead, POWER_UP_TYPES[state.powerUp.type].color);
        if (powerUpMesh) {
          scene.remove(powerUpMesh);
          if (powerUpMesh.userData.material) {
            powerUpMesh.userData.material.dispose();
          }
        }
        state.powerUp = null;
        state.snake.pop();
      } else {
        state.snake.pop();
      }

      updateSnakeMeshes();
    };

    updateSnakeMeshes();
    updateFood();
    gameIntervalRef.current = setInterval(gameLoop, gameStateRef.current.speed);

    let animationId;
    const lookAtTarget = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (headAnimationRef.current.eating) {
        headAnimationRef.current.time += 0.1;
        const t = headAnimationRef.current.time;
        if (t < Math.PI) {
          headAnimationRef.current.scale = 1.0 + Math.sin(t) * 0.3;
        } else {
          headAnimationRef.current.eating = false;
          headAnimationRef.current.scale = 1.0;
          headAnimationRef.current.time = 0;
        }
      }

      const time = Date.now() * 0.001;
      pointLight1.intensity = 1.2 + Math.sin(time * 0.5) * 0.2;
      pointLight2.intensity = 1.0 + Math.sin(time * 0.7 + 1) * 0.2;

      pointLight1.position.x = -8 + Math.sin(time * 0.3) * 2;
      pointLight1.position.z = -8 + Math.cos(time * 0.3) * 2;
      pointLight2.position.x = 8 + Math.sin(time * 0.4 + 2) * 2;
      pointLight2.position.z = 8 + Math.cos(time * 0.4 + 2) * 2;

      if (foodMesh) {
        foodMesh.rotation.y += 0.02;
        foodMesh.position.y = 0.5 + Math.sin(time * 3) * 0.1;
      }

      if (powerUpMesh) {
        powerUpMesh.rotation.x += 0.03;
        powerUpMesh.rotation.y += 0.03;
        powerUpMesh.position.y = 0.5 + Math.sin(Date.now() * 0.004) * 0.15;
      }

      obstacleMeshes.forEach((mesh, i) => {
        mesh.rotation.y = Math.sin(Date.now() * 0.001 + i) * 0.1;
      });

      updateParticles();

      if (gameStateRef.current.snake.length > 0) {
        const head = gameStateRef.current.snake[0];
        const direction = gameStateRef.current.direction;

        const targetLookX = head[0] + direction[0] * CAMERA_CONFIG.LOOK_AHEAD;
        const targetLookZ = head[2] + direction[2] * CAMERA_CONFIG.LOOK_AHEAD;

        const targetCamX = head[0] + CAMERA_CONFIG.POSITION.x;
        const targetCamY = CAMERA_CONFIG.POSITION.y;
        const targetCamZ = head[2] + CAMERA_CONFIG.POSITION.z;

        camera.position.x += (targetCamX - camera.position.x) * CAMERA_CONFIG.FOLLOW_SMOOTHNESS;
        camera.position.y += (targetCamY - camera.position.y) * CAMERA_CONFIG.FOLLOW_SMOOTHNESS;
        camera.position.z += (targetCamZ - camera.position.z) * CAMERA_CONFIG.FOLLOW_SMOOTHNESS;

        lookAtTarget.x += (targetLookX - lookAtTarget.x) * CAMERA_CONFIG.LOOK_SMOOTHNESS;
        lookAtTarget.y += (0 - lookAtTarget.y) * CAMERA_CONFIG.LOOK_SMOOTHNESS;
        lookAtTarget.z += (targetLookZ - lookAtTarget.z) * CAMERA_CONFIG.LOOK_SMOOTHNESS;

        camera.lookAt(lookAtTarget);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // OPTIMIZED: Cleanup without disposing shared resources
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      cancelAnimationFrame(animationId);

      snakeMeshes.forEach(mesh => {
        scene.remove(mesh);
        // Don't dispose shared geometries or pooled materials!
      });
      if (foodMesh) {
        scene.remove(foodMesh);
      }
      if (powerUpMesh) {
        scene.remove(powerUpMesh);
        if (powerUpMesh.userData.material) {
          powerUpMesh.userData.material.dispose();
        }
      }
      obstacleMeshes.forEach(mesh => {
        scene.remove(mesh);
      });

      particlesRef.current.forEach(p => {
        scene.remove(p);
        p.geometry.dispose();
        p.material.dispose();
      });

      // Dispose only non-shared materials
      floorMaterial.dispose();
      floorGeometry.dispose();
      snakeMaterial.dispose();
      snakeHeadMaterial.dispose();
      foodMaterial.dispose();
      wallMaterial.dispose();
      obstacleMaterial.dispose();

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [gameStarted, gameOver, difficulty]);

  const startGame = () => {
    playSound([400, 600, 800], [0.12, 0.12, 0.12], 'triangle');
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }

    setPlayCount(prev => prev + 1);

    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setIsNewHighScore(false);
    setActivePowerUps([]);
    setSwipeIndicator(null);
    scoreRef.current = 0;
    headAnimationRef.current = { scale: 1.0, eating: false, time: 0 };
    lastSwipeTimeRef.current = 0;
    swipeProcessedRef.current = false;
    const diffConfig = DIFFICULTY_LEVELS[difficulty];
    setCurrentSpeed(diffConfig.speed);
    gameStateRef.current = {
      snake: [[0, 0, 0]],
      direction: [1, 0, 0],
      food: [5, 0, 5],
      powerUp: null,
      obstacles: [],
      speed: diffConfig.speed,
      isPaused: false,
      hasShield: false,
      scoreMultiplier: 1
    };
  };

  const restartGame = () => {
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    setGameStarted(false);
    setTimeout(() => {
      setShowDifficultySelect(true);
      setGameOver(false);
      scoreRef.current = 0;
      setScore(0);
      setIsPaused(false);
      setIsNewHighScore(false);
      setActivePowerUps([]);
      setSwipeIndicator(null);
      gradientOffsetRef.current = 0;
      headAnimationRef.current = { scale: 1.0, eating: false, time: 0 };
      lastSwipeTimeRef.current = 0;
      swipeProcessedRef.current = false;
    }, 100);
  };

  const selectDifficulty = (diff) => {
    setDifficulty(diff);
    setShowDifficultySelect(false);
    setTimeout(() => startGame(), 50);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-slate-800 rounded-t-lg p-4 flex justify-between items-center border-b-2 border-emerald-500">
          <h1 className="text-3xl font-bold text-emerald-400">3D Snake Enhanced ⚡</h1>
          <div className="flex gap-6 items-center">
            <div className="text-lg font-bold text-purple-400 flex items-center gap-2">
              <span>🎮</span>
              <span>Plays: {playCount}</span>
            </div>
            <div className="text-xl font-bold text-white">Score: {score}</div>
            <div className="text-xl font-bold text-yellow-400">High: {highScore}</div>
            <div className="text-lg font-bold text-cyan-400">
              Speed: {((1000 / currentSpeed) + 10).toFixed(1)}x
            </div>
          </div>
        </div>

        {activePowerUps.length > 0 && (
          <div className="bg-slate-700 p-2 flex gap-2 flex-wrap">
            {activePowerUps.map(pu => (
              <span key={pu.id} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                {pu.label}
              </span>
            ))}
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full bg-slate-900 relative touch-none"
          style={{ height: '600px' }}
        >
          {swipeIndicator && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 text-6xl text-cyan-400 animate-pulse pointer-events-none">
              {swipeIndicator}
            </div>
          )}

          {showDifficultySelect && !gameStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
              <h2 className="text-4xl font-bold text-white mb-2">Select Difficulty</h2>
              {playCount > 0 && (
                <p className="text-purple-400 mb-6">🎮 Session Plays: {playCount}</p>
              )}
              {playCount === 0 && (
                <p className="text-gray-400 mb-6 text-lg">Welcome! Choose your challenge 🎮</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(DIFFICULTY_LEVELS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => selectDifficulty(key)}
                    className="px-8 py-6 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-bold rounded-lg text-xl transition-all transform hover:scale-105"
                  >
                    {val.label}
                  </button>
                ))}
              </div>
              <p className="text-gray-400 mt-6 text-center">Higher difficulty = faster speed & more obstacles!</p>
              <p className="text-cyan-400 mt-2 text-center text-sm">📱 Quick swipe for instant response on mobile</p>
              <p className="text-green-400 mt-2 text-center text-xs">⚡ OPTIMIZED VERSION - Smooth 60 FPS!</p>
            </div>
          )}

          {isPaused && gameStarted && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10">
              <h2 className="text-5xl font-bold text-yellow-400 mb-4">PAUSED</h2>
              <p className="text-2xl text-white">Press SPACE or P to resume</p>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
              <h2 className="text-5xl font-bold text-red-500 mb-4">Game Over!</h2>
              {isNewHighScore && (
                <p className="text-3xl text-yellow-400 mb-2 animate-pulse">🏆 NEW HIGH SCORE! 🏆</p>
              )}
              <p className="text-3xl text-white mb-2">Final Score: {score}</p>
              <p className="text-xl text-gray-400 mb-2">Difficulty: {DIFFICULTY_LEVELS[difficulty].label}</p>
              <p className="text-lg text-purple-400 mb-6">Session Plays: {playCount}</p>
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
          <p className="mb-2">
            <strong>Controls:</strong> Arrow Keys / WASD / Quick Swipe (Mobile) to move | SPACE or P to pause
          </p>
          <p>
            <strong>Power-ups:</strong> ⚡Speed Boost | 🐌Slow-Mo | 🛡️Shield | ✖️2x Points |
            <strong className="text-red-400 ml-2">Avoid red obstacles!</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Snake3DGame;
