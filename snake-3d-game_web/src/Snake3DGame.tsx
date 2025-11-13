import { useEffect, useRef, useState } from 'react';
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
  FOLLOW_SMOOTHNESS: 0.005,  // 10x smoother camera follow
  LOOK_AHEAD: 2,
  LOOK_SMOOTHNESS: 0.008     // 10x smoother camera rotation
};

interface Particle extends THREE.Mesh {
  velocity: THREE.Vector3;
  life: number;
}

const Snake3DGame = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [showDifficultySelect, setShowDifficultySelect] = useState(true);
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTY_LEVELS>('MEDIUM');
  const [activePowerUps, setActivePowerUps] = useState<Array<{type: string, id: number, label: string}>>([]);
  const [currentSpeed, setCurrentSpeed] = useState(180);

  const gameStateRef = useRef<{
    snake: number[][];
    direction: number[];
    food: number[];
    powerUp: { position: number[]; type: keyof typeof POWER_UP_TYPES } | null;
    obstacles: number[][];
    speed: number;
    isPaused: boolean;
    hasShield: boolean;
    scoreMultiplier: number;
  }>({
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
  const gameIntervalRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const scoreRef = useRef(0);
  const gradientOffsetRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const headAnimationRef = useRef({ scale: 1.0, eating: false, time: 0 });
  const touchStartRef = useRef({ x: 0, y: 0 });
  const audioContextsRef = useRef<AudioContext[]>([]);

  const stopAllSounds = () => {
    audioContextsRef.current.forEach(ctx => {
      try {
        ctx.close();
      } catch (e) {}
    });
    audioContextsRef.current = [];
  };

  const playSound = (frequencies: number[], durations: number[], type: OscillatorType = 'sine') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextsRef.current.push(audioContext);

      frequencies.forEach((freq: number, i: number) => {
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

      // Auto-cleanup after all sounds finish
      const maxDuration = Math.max(...durations.map((d, i) => (i * 0.1) + d));
      setTimeout(() => {
        try {
          audioContext.close();
          audioContextsRef.current = audioContextsRef.current.filter(ctx => ctx !== audioContext);
        } catch (e) {}
      }, maxDuration * 1000 + 100);
    } catch (e) {}
  };

  const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
    if (Array.isArray(material)) {
      material.forEach(m => m.dispose());
    } else {
      material.dispose();
    }
  };

  const createParticles = (position: number[], color: number) => {
    if (!sceneRef.current) return;
    const particleCount = 15;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color });
      const particle = new THREE.Mesh(geometry, material) as unknown as Particle;

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
        if (sceneRef.current) sceneRef.current.remove(particle);
        particle.geometry.dispose();
        disposeMaterial(particle.material);
        return false;
      }

      particle.position.add(particle.velocity);
      particle.velocity.y -= 0.01;
      const material = particle.material as THREE.MeshBasicMaterial;
      material.opacity = particle.life;
      material.transparent = true;
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
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    // Auto-focus container to ensure keyboard controls work immediately
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.focus();
      }
    }, 100);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(15, 25, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
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
    pointLight1.castShadow = true;
    pointLight1.shadow.mapSize.width = 1024;
    pointLight1.shadow.mapSize.height = 1024;
    pointLight1.shadow.bias = -0.0005;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff006e, 1.0, 30);
    pointLight2.position.set(8, 8, 8);
    pointLight2.castShadow = true;
    pointLight2.shadow.mapSize.width = 1024;
    pointLight2.shadow.mapSize.height = 1024;
    pointLight2.shadow.bias = -0.0005;
    scene.add(pointLight2);

    // Add fill light for softer shadows
    const fillLight = new THREE.DirectionalLight(0x4466ff, 0.3);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    // Add rim light for depth
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

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.WALL,
      emissive: COLORS.WALL_EMISSIVE,
      emissiveIntensity: 0.15,
      metalness: 0.7,
      roughness: 0.3
    });

    const wallGeometry = new THREE.BoxGeometry(0.9, 1.5, 0.9);
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
        wall.position.set(pos[0], pos[1], pos[2]);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
        walls.push(wall);
      });
    }

    // Add corner pieces to complete the border
    const corners = [
      [-(boundarySize + wallOffset), 0.75, -(boundarySize + wallOffset)],
      [boundarySize + wallOffset, 0.75, -(boundarySize + wallOffset)],
      [-(boundarySize + wallOffset), 0.75, boundarySize + wallOffset],
      [boundarySize + wallOffset, 0.75, boundarySize + wallOffset]
    ];
    
    corners.forEach(pos => {
      const cornerWall = new THREE.Mesh(wallGeometry, wallMaterial);
      cornerWall.position.set(pos[0], pos[1], pos[2]);
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

    const snakeMeshes: THREE.Mesh[] = [];
    let foodMesh: THREE.Mesh | undefined;
    let powerUpMesh: THREE.Mesh | undefined;
    const obstacleMeshes: THREE.Mesh[] = [];

    const createSnakeSegment = (pos: number[], isHead = false): THREE.Mesh => {
      const size = isHead ? 1.08 : 0.9;
      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = isHead ? snakeHeadMaterial : snakeMaterial;
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pos[0], 0.5, pos[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    };

    const createFood = (pos: number[]): THREE.Mesh => {
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const mesh = new THREE.Mesh(geometry, foodMaterial);
      mesh.position.set(pos[0], 0.5, pos[2]);
      mesh.castShadow = true;
      scene.add(mesh);
      return mesh;
    };

    const createPowerUp = (pos: number[], type: keyof typeof POWER_UP_TYPES): THREE.Mesh => {
      const geometry = new THREE.OctahedronGeometry(0.5);
      const material = new THREE.MeshStandardMaterial({
        color: POWER_UP_TYPES[type].color,
        emissive: POWER_UP_TYPES[type].color,
        emissiveIntensity: 0.9,
        metalness: 0.9,
        roughness: 0.05
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pos[0], 0.5, pos[2]);
      mesh.castShadow = true;
      mesh.userData.type = type;
      scene.add(mesh);
      return mesh;
    };

    const createObstacle = (pos: number[]): THREE.Mesh => {
      const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
      const mesh = new THREE.Mesh(geometry, obstacleMaterial);
      mesh.position.set(pos[0], 0.45, pos[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    };

    const generatePosition = (avoid: number[][] = []): number[] => {
      const halfGrid = GRID_SIZE / 2;
      let pos: number[];
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
          const adjustedIndex = (i + gradientOffsetRef.current) % snakeLength;
          const gradientFactor = 1.0 - (adjustedIndex / (snakeLength - 1)) * 0.8;

          if (isHead) {
            snakeMeshes[i].material = gameStateRef.current.hasShield ? 
              new THREE.MeshStandardMaterial({
                color: 0xffff00,
                emissive: 0xffff00,
                emissiveIntensity: 0.6,
                metalness: 0.5,
                roughness: 0.2
              }) : snakeHeadMaterial;
            
            // Apply eating animation to head
            const animScale = headAnimationRef.current.scale;
            const baseScale = 1.08 / 0.9;
            snakeMeshes[i].scale.set(baseScale * animScale, baseScale * animScale, baseScale * animScale);
          } else {
            const bodyMaterial = new THREE.MeshStandardMaterial({
              color: new THREE.Color(COLORS.SNAKE).multiplyScalar(gradientFactor),
              emissive: new THREE.Color(COLORS.SNAKE_EMISSIVE).multiplyScalar(gradientFactor),
              emissiveIntensity: 0.3 * gradientFactor,
              metalness: 0.5,
              roughness: 0.2
            });
            if (snakeMeshes[i].material !== snakeHeadMaterial) {
              disposeMaterial(snakeMeshes[i].material);
            }
            snakeMeshes[i].material = bodyMaterial;
            snakeMeshes[i].scale.set(1.0, 1.0, 1.0);
          }
        }
      });

      while (snakeMeshes.length > gameStateRef.current.snake.length) {
        const removed = snakeMeshes.pop();
        if (removed) {
          scene.remove(removed);
          removed.geometry.dispose();
        }
      }
    };

    const updateFood = () => {
      if (foodMesh) {
        scene.remove(foodMesh);
        foodMesh.geometry.dispose();
      }
      foodMesh = createFood(gameStateRef.current.food);
    };

    const spawnPowerUp = () => {
      if (Math.random() < 0.3) {
        const types = Object.keys(POWER_UP_TYPES) as Array<keyof typeof POWER_UP_TYPES>;
        const type = types[Math.floor(Math.random() * types.length)];
        const avoid = [...gameStateRef.current.snake, gameStateRef.current.food, ...gameStateRef.current.obstacles];
        gameStateRef.current.powerUp = {
          position: generatePosition(avoid),
          type
        };
        if (powerUpMesh) {
          scene.remove(powerUpMesh);
          powerUpMesh.geometry.dispose();
          disposeMaterial(powerUpMesh.material);
        }
        if (gameStateRef.current.powerUp) {
          powerUpMesh = createPowerUp(gameStateRef.current.powerUp.position, gameStateRef.current.powerUp.type);
        }
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

    const activatePowerUp = (type: keyof typeof POWER_UP_TYPES) => {
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
        gameIntervalRef.current = setInterval(gameLoop, gameStateRef.current.speed) as unknown as number;
      }

      setTimeout(() => {
        setActivePowerUps(prev => prev.filter(p => p.id !== id));
        if (type === 'SPEED' || type === 'SLOW') {
          gameStateRef.current.speed = diffConfig.speed - Math.floor((scoreRef.current / 10) * diffConfig.speedIncrease);
          gameStateRef.current.speed = Math.max(50, gameStateRef.current.speed);
          setCurrentSpeed(gameStateRef.current.speed);
          if (gameIntervalRef.current) {
            clearInterval(gameIntervalRef.current);
            gameIntervalRef.current = setInterval(gameLoop, gameStateRef.current.speed) as unknown as number;
          }
        } else if (type === 'SHIELD') {
          gameStateRef.current.hasShield = false;
        } else if (type === 'MULTIPLIER') {
          gameStateRef.current.scoreMultiplier = 1;
        }
      }, config.duration);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      const key = e.key;

      // Prevent default for arrow keys to avoid page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
        e.preventDefault();
      }

      if ([' ', 'p', 'P'].includes(key)) {
        setIsPaused(prev => !prev);
        state.isPaused = !state.isPaused;
        return;
      }

      let newDirection: number[] | null = null;
      if (['ArrowUp', 'w', 'W'].includes(key)) newDirection = [0, 0, -1];
      else if (['ArrowDown', 's', 'S'].includes(key)) newDirection = [0, 0, 1];
      else if (['ArrowLeft', 'a', 'A'].includes(key)) newDirection = [-1, 0, 0];
      else if (['ArrowRight', 'd', 'D'].includes(key)) newDirection = [1, 0, 0];

      if (newDirection && !(state.direction[0] === -newDirection[0] && state.direction[2] === -newDirection[2])) {
        state.direction = newDirection;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const state = gameStateRef.current;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      
      // Minimum swipe distance to register
      const minSwipeDistance = 30;
      
      if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
        return; // Not a swipe, might be a tap
      }

      let newDirection: number[] | null = null;

      // Determine swipe direction based on which delta is larger
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          newDirection = [1, 0, 0]; // Right
        } else {
          newDirection = [-1, 0, 0]; // Left
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          newDirection = [0, 0, 1]; // Down
        } else {
          newDirection = [0, 0, -1]; // Up
        }
      }

      // Apply direction if valid (no 180-degree turns)
      if (newDirection && !(state.direction[0] === -newDirection[0] && state.direction[2] === -newDirection[2])) {
        state.direction = newDirection;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
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

      // Wall collision ALWAYS ends the game (shield doesn't protect against walls)
      if (hitWall) {
        stopAllSounds();
        playSound([400, 300, 200], [0.15, 0.15, 0.15], 'square');
        setGameOver(true);
        return;
      }

      // Shield only protects against self-collision and obstacles
      if ((hitSelf || hitObstacle) && !state.hasShield) {
        stopAllSounds();
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

        // Trigger eating animation
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
          gameIntervalRef.current = setInterval(gameLoop, state.speed) as unknown as number;
        }

        spawnPowerUp();
        spawnObstacle();
      } else if (state.powerUp && newHead[0] === state.powerUp.position[0] && newHead[2] === state.powerUp.position[2]) {
        playSound([600, 800, 1000], [0.1, 0.1, 0.1], 'triangle');
        activatePowerUp(state.powerUp.type);
        createParticles(newHead, POWER_UP_TYPES[state.powerUp.type].color);
        if (powerUpMesh) {
          scene.remove(powerUpMesh);
          powerUpMesh.geometry.dispose();
          disposeMaterial(powerUpMesh.material);
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
    gameIntervalRef.current = setInterval(gameLoop, gameStateRef.current.speed) as unknown as number;

    let animationId: number;
    const lookAtTarget = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Update head eating animation
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

      // Dynamic lighting animation
      const time = Date.now() * 0.001;
      pointLight1.intensity = 1.2 + Math.sin(time * 0.5) * 0.2;
      pointLight2.intensity = 1.0 + Math.sin(time * 0.7 + 1) * 0.2;
      
      // Subtle light movement
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

    return () => {
      stopAllSounds();
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      cancelAnimationFrame(animationId);

      snakeMeshes.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry.dispose();
      });
      if (foodMesh) {
        scene.remove(foodMesh);
        foodMesh.geometry.dispose();
      }
      if (powerUpMesh) {
        scene.remove(powerUpMesh);
        powerUpMesh.geometry.dispose();
        disposeMaterial(powerUpMesh.material);
      }
      obstacleMeshes.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry.dispose();
      });

      particlesRef.current.forEach(p => {
        scene.remove(p);
        p.geometry.dispose();
        disposeMaterial(p.material);
      });

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
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setIsNewHighScore(false);
    setActivePowerUps([]);
    scoreRef.current = 0;
    headAnimationRef.current = { scale: 1.0, eating: false, time: 0 };
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
    stopAllSounds();
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
      gradientOffsetRef.current = 0;
      headAnimationRef.current = { scale: 1.0, eating: false, time: 0 };
    }, 100);
  };

  const selectDifficulty = (diff: keyof typeof DIFFICULTY_LEVELS) => {
    setDifficulty(diff);
    setShowDifficultySelect(false);
    setTimeout(() => startGame(), 50);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1024px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          background: '#1e293b',
          borderTopLeftRadius: '0.5rem',
          borderTopRightRadius: '0.5rem',
          padding: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          borderBottom: '2px solid #10b981'
        }}>
          <h1 style={{
            fontSize: 'clamp(1.25rem, 4vw, 1.875rem)',
            fontWeight: 'bold',
            color: '#10b981',
            margin: 0
          }}>3D Snake Enhanced</h1>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(0.5rem, 2vw, 1.5rem)',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
              fontWeight: 'bold',
              color: '#ffffff'
            }}>Score: {score}</div>
            <div style={{
              fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
              fontWeight: 'bold',
              color: '#fbbf24'
            }}>High: {highScore}</div>
            <div style={{
              fontSize: 'clamp(0.75rem, 2vw, 1.125rem)',
              fontWeight: 'bold',
              color: '#22d3ee'
            }}>
              Speed: {((1000 / currentSpeed) + 10).toFixed(1)}x
            </div>
          </div>
        </div>

        {activePowerUps.length > 0 && (
          <div style={{
            background: '#334155',
            padding: '0.5rem',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {activePowerUps.map(pu => (
              <span key={pu.id} style={{
                background: '#9333ea',
                color: '#ffffff',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                fontWeight: 'bold',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}>
                {pu.label}
              </span>
            ))}
          </div>
        )}

        <div
          ref={containerRef}
          tabIndex={0}
          style={{
            width: '100%',
            height: 'clamp(400px, 60vh, 600px)',
            background: '#0f172a',
            position: 'relative',
            touchAction: 'none',
            outline: 'none',
            cursor: 'pointer'
          }}
          onFocus={() => {
            if (containerRef.current) {
              containerRef.current.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';
            }
          }}
          onBlur={() => {
            if (containerRef.current) {
              containerRef.current.style.boxShadow = 'none';
            }
          }}
        >
          {showDifficultySelect && !gameStarted && (
            <div style={{
              position: 'absolute',
              inset: '0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              background: 'linear-gradient(135deg, #1a0a2a 0%, #0a0520 100%)',
              padding: '1rem'
            }}>
              <h2 className="glow-text" style={{
                fontSize: 'clamp(1.25rem, 5vw, 2.5rem)',
                fontFamily: '"Press Start 2P", monospace',
                color: '#00FFFF',
                textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #8B008B',
                marginBottom: 'clamp(1rem, 3vh, 2rem)',
                textAlign: 'center'
              }}>SELECT DIFFICULTY</h2>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'clamp(0.75rem, 2vw, 1.25rem)',
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: '100%',
                padding: '0 1rem'
              }}>
                {Object.entries(DIFFICULTY_LEVELS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => selectDifficulty(key as keyof typeof DIFFICULTY_LEVELS)}
                    className="arcade-button"
                    style={{
                      padding: 'clamp(0.75rem, 2vw, 1.25rem) clamp(1rem, 3vw, 1.875rem)',
                      fontSize: 'clamp(0.75rem, 2vw, 1rem)',
                      fontFamily: '"Press Start 2P", monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      background: 'linear-gradient(180deg, #8B008B 0%, #600060 100%)',
                      border: '3px solid #00FFFF',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      boxShadow: '0 0 10px #00FFFF, 0 5px 0 #4B004B, 0 5px 20px rgba(0, 0, 0, 0.5)',
                      transition: 'all 0.1s',
                      position: 'relative',
                      minWidth: 'clamp(120px, 20vw, 150px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 20px #00FFFF, 0 5px 0 #4B004B, 0 5px 25px rgba(0, 255, 255, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 10px #00FFFF, 0 5px 0 #4B004B, 0 5px 20px rgba(0, 0, 0, 0.5)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 10px #00FFFF, 0 2px 0 #4B004B, 0 2px 10px rgba(0, 0, 0, 0.5)';
                      e.currentTarget.style.transform = 'translateY(3px)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 20px #00FFFF, 0 5px 0 #4B004B, 0 5px 25px rgba(0, 255, 255, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
              <p style={{
                marginTop: 'clamp(1rem, 3vh, 2rem)',
                textAlign: 'center',
                color: '#FFD700',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
                letterSpacing: '0.05em',
                padding: '0 1rem'
              }}>HIGHER DIFFICULTY = FASTER SPEED & MORE OBSTACLES!</p>
              <p className="blink-text" style={{
                marginTop: 'clamp(0.5rem, 2vh, 1rem)',
                textAlign: 'center',
                color: '#00FF00',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 'clamp(0.45rem, 1.25vw, 0.6rem)',
                padding: '0 1rem'
              }}>📱 SWIPE TO CONTROL ON MOBILE</p>
            </div>
          )}

          {isPaused && gameStarted && !gameOver && (
            <div style={{
              position: 'absolute',
              inset: '0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              background: 'rgba(10, 14, 39, 0.9)',
              padding: '1rem'
            }}>
              <h2 className="glow-text" style={{
                fontSize: 'clamp(1.5rem, 6vw, 3rem)',
                fontFamily: '"Press Start 2P", monospace',
                color: '#FFD700',
                textShadow: '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FF8C00',
                marginBottom: 'clamp(1rem, 3vh, 2rem)',
                textAlign: 'center'
              }}>PAUSED</h2>
              <p className="blink-text" style={{
                fontSize: 'clamp(0.7rem, 2.5vw, 1.2rem)',
                fontFamily: '"Press Start 2P", monospace',
                color: '#00FFFF',
                textAlign: 'center',
                padding: '0 1rem'
              }}>PRESS SPACE OR P TO RESUME</p>
            </div>
          )}

          {gameOver && (
            <div style={{
              position: 'absolute',
              inset: '0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              background: 'linear-gradient(135deg, #1a0a2a 0%, #0a0520 100%)',
              padding: '1rem'
            }}>
              <h2 className="glow-text" style={{
                fontSize: 'clamp(1.5rem, 6vw, 3rem)',
                fontFamily: '"Press Start 2P", monospace',
                color: '#FF006E',
                textShadow: '0 0 10px #FF006E, 0 0 20px #FF006E, 0 0 30px #FF1744',
                marginBottom: 'clamp(1rem, 3vh, 2rem)',
                textAlign: 'center'
              }}>GAME OVER</h2>
              {isNewHighScore && (
                <p className="glow-text blink-text" style={{
                  fontSize: 'clamp(0.9rem, 3vw, 1.5rem)',
                  fontFamily: '"Press Start 2P", monospace',
                  color: '#FFD700',
                  textShadow: '0 0 10px #FFD700, 0 0 20px #FFD700',
                  marginBottom: 'clamp(0.75rem, 2vh, 1.5rem)',
                  textAlign: 'center'
                }}>★ NEW HIGH SCORE! ★</p>
              )}
              <div className="led-display" style={{
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2.5rem)',
                fontSize: 'clamp(1.25rem, 4vw, 2rem)',
                marginBottom: 'clamp(0.75rem, 2vh, 1.5rem)'
              }}>{score.toString().padStart(6, '0')}</div>
              <p style={{
                fontSize: 'clamp(0.6rem, 2vw, 0.9rem)',
                fontFamily: '"Press Start 2P", monospace',
                color: '#00FFFF',
                marginBottom: 'clamp(1rem, 3vh, 2rem)',
                textAlign: 'center'
              }}>DIFFICULTY: {DIFFICULTY_LEVELS[difficulty].label.toUpperCase()}</p>
              <button
                onClick={restartGame}
                className="arcade-button"
                style={{
                  padding: 'clamp(0.75rem, 2vw, 1.25rem) clamp(1.5rem, 4vw, 2.5rem)',
                  fontSize: 'clamp(0.8rem, 2.5vw, 1.2rem)',
                  fontFamily: '"Press Start 2P", monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  background: 'linear-gradient(180deg, #8B008B 0%, #600060 100%)',
                  border: '3px solid #00FFFF',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 0 10px #00FFFF, 0 5px 0 #4B004B, 0 5px 20px rgba(0, 0, 0, 0.5)',
                  transition: 'all 0.1s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px #00FFFF, 0 5px 0 #4B004B, 0 5px 25px rgba(0, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 10px #00FFFF, 0 5px 0 #4B004B, 0 5px 20px rgba(0, 0, 0, 0.5)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Play Again
              </button>
              <p className="blink-text" style={{
                fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
                fontFamily: '"Press Start 2P", monospace',
                color: '#00FF00',
                marginTop: 'clamp(0.75rem, 2vh, 1.5rem)',
                textAlign: 'center'
              }}>INSERT COIN TO CONTINUE</p>
            </div>
          )}
        </div>

        <div style={{
          background: '#1e293b',
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
          padding: '1rem',
          color: '#d1d5db',
          fontSize: 'clamp(0.7rem, 1.5vw, 0.875rem)'
        }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Controls:</strong> ⌨️ Arrow Keys / WASD (always active) | 👆 Swipe (Mobile) | SPACE or P to pause
          </p>
          <p style={{ margin: 0 }}>
            <strong>Power-ups:</strong> ⚡Speed Boost | 🐌Slow-Mo | 🛡️Shield | ✖️2x Points |
            <strong style={{ color: '#f87171', marginLeft: '0.5rem' }}>Avoid red obstacles!</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Snake3DGame;