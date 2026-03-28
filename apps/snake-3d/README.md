# 3D Snake Game

A modern, immersive 3D Snake game built with React, Three.js, and Vite. Experience the classic Snake game in stunning 3D graphics with smooth animations, particle effects, and an intuitive control system.

![3D Snake Game](https://img.shields.io/badge/React-18-blue) ![Three.js](https://img.shields.io/badge/Three.js-Latest-green) ![Vite](https://img.shields.io/badge/Vite-5-purple)

## Features

- **Stunning 3D Graphics**: Powered by Three.js with realistic lighting and shadows
- **Smooth Gameplay**: 60 FPS performance with optimized rendering
- **Pause Functionality**: Press SPACE or P to pause/resume the game
- **High Score Tracking**: Automatically saves your best score using localStorage
- **Progressive Difficulty**: Game speed increases as you collect more food
- **Intuitive Controls**: Arrow keys or WASD for movement
- **Responsive Design**: Adapts to different screen sizes
- **Modern UI**: Beautiful gradient backgrounds with Tailwind CSS

## Game Mechanics

- Control a snake on a 3D grid
- Collect red spheres (food) to grow longer and earn points
- Each food collected gives you 10 points
- The game speeds up as you score more points
- Avoid hitting walls or your own tail
- Try to beat your high score!

## Controls

| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move the snake |
| SPACE / P | Pause/Resume game |

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd snake-3d-game
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
snake-3d-game/
├── src/
│   ├── components/
│   │   └── Snake3DGame.jsx    # Main game component
│   ├── game/
│   │   ├── constants.js       # Game configuration constants
│   │   └── gameLogic.js       # Game logic helper functions
│   ├── utils/                 # Utility functions (if needed)
│   ├── App.jsx                # Root component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles with Tailwind
├── public/                    # Static assets
├── index.html                 # HTML template
├── package.json               # Project dependencies
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md                  # This file
```

## Technologies Used

- **React 18**: Modern React with hooks for state management
- **Three.js**: 3D graphics library for WebGL rendering
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Autoprefixer**: Automatic vendor prefixing

## Game Configuration

You can customize the game by modifying values in `src/game/constants.js`:

- `GRID_SIZE`: Size of the playing field
- `INITIAL_SPEED`: Starting game speed
- `MIN_SPEED`: Maximum speed the game can reach
- `SPEED_INCREASE`: How much faster the game gets per food
- `POINTS_PER_FOOD`: Points awarded for each food
- Color schemes, camera settings, and more!

## Performance Tips

- The game is optimized for 60 FPS
- Three.js meshes are properly disposed to prevent memory leaks
- Shadow maps use PCFSoftShadowMap for better quality
- Geometry is reused where possible

## Browser Compatibility

This game works best on modern browsers with WebGL support:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Future Enhancements

Possible features to add:
- Difficulty level selection (Easy, Medium, Hard)
- Camera rotation controls
- Sound effects and background music
- Power-ups (speed boost, invincibility, etc.)
- Obstacles and level variations
- Multiplayer mode
- Mobile touch controls
- Leaderboard system

## License

This project is open source and available for personal and educational use.

## Credits

Created with Claude Code as part of the ai-projects collection.

## Support

If you encounter any issues or have suggestions, please create an issue in the repository.

---

Enjoy playing 3D Snake! Try to beat your high score!
