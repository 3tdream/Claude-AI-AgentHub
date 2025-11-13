import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, LinearProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import '../styles/retro.css';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('INITIALIZING');

  useEffect(() => {
    // Simulate loading sequence
    const loadingSteps = [
      { delay: 0, progress: 0, text: 'INITIALIZING' },
      { delay: 500, progress: 20, text: 'LOADING 3D ENGINE' },
      { delay: 1000, progress: 40, text: 'GENERATING WORLD' },
      { delay: 1500, progress: 60, text: 'LOADING ASSETS' },
      { delay: 2000, progress: 80, text: 'PREPARING GAME' },
      { delay: 2500, progress: 100, text: 'READY!' },
    ];

    loadingSteps.forEach((step) => {
      setTimeout(() => {
        setProgress(step.progress);
        setLoadingText(step.text);
      }, step.delay);
    });

    // Navigate to home after loading complete
    setTimeout(() => {
      navigate('/home');
    }, 3000);
  }, [navigate]);

  return (
    <Box
      className="crt-effect"
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0520 0%, #1a0a2a 50%, #0a0520 100%)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div className="scanline" />

      {/* Animated grid background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          background: `
            repeating-linear-gradient(
              0deg,
              #00FFFF 0px,
              transparent 1px,
              transparent 20px
            ),
            repeating-linear-gradient(
              90deg,
              #00FFFF 0px,
              transparent 1px,
              transparent 20px
            )
          `,
          animation: 'gridPulse 4s ease-in-out infinite',
        }}
      />

      {/* Logo/Title */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
          duration: 1,
        }}
      >
        <Typography
          className="glow-text"
          variant="h1"
          sx={{
            fontSize: 'clamp(2rem, 8vw, 5rem)',
            fontFamily: '"Press Start 2P", monospace',
            color: '#00FFFF',
            textShadow: `
              0 0 10px #00FFFF,
              0 0 20px #00FFFF,
              0 0 30px #8B008B,
              0 0 40px #8B008B,
              0 0 50px #8B008B
            `,
            marginBottom: '1rem',
            textAlign: 'center',
            animation: 'glow-pulse 2s ease-in-out infinite',
          }}
        >
          3D SNAKE
        </Typography>
      </motion.div>

      {/* Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
            fontFamily: '"Press Start 2P", monospace',
            color: '#FFD700',
            letterSpacing: '0.2em',
            marginBottom: '4rem',
            textAlign: 'center',
            textShadow: '0 0 10px #FFD700',
          }}
        >
          ARCADE EDITION
        </Typography>
      </motion.div>

      {/* Loading Progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{ width: '80%', maxWidth: '500px' }}
      >
        <Typography
          sx={{
            fontSize: 'clamp(0.6rem, 1.5vw, 0.85rem)',
            fontFamily: '"Press Start 2P", monospace',
            color: '#00FF00',
            marginBottom: '1rem',
            textAlign: 'center',
            textShadow: '0 0 5px #00FF00',
          }}
        >
          {loadingText}...
        </Typography>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: '15px',
            borderRadius: '7px',
            border: '2px solid #00FFFF',
            background: 'rgba(0, 0, 0, 0.5)',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #8B008B 0%, #00FFFF 100%)',
              boxShadow: '0 0 10px #00FFFF',
              borderRadius: '5px',
              transition: 'transform 0.5s ease-in-out',
            },
          }}
        />

        <Typography
          sx={{
            fontSize: 'clamp(0.5rem, 1.2vw, 0.7rem)',
            fontFamily: '"Press Start 2P", monospace',
            color: '#FFFFFF',
            marginTop: '0.5rem',
            textAlign: 'center',
          }}
        >
          {progress}%
        </Typography>
      </motion.div>

      {/* Version number */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        style={{ position: 'absolute', bottom: '2rem' }}
      >
        <Typography
          sx={{
            fontSize: 'clamp(0.5rem, 1vw, 0.65rem)',
            fontFamily: '"Press Start 2P", monospace',
            color: '#888',
          }}
        >
          v1.0.0 | © 2025
        </Typography>
      </motion.div>

      <style>
        {`
          @keyframes gridPulse {
            0%, 100% { opacity: 0.05; }
            50% { opacity: 0.15; }
          }
        `}
      </style>
    </Box>
  );
};

export default SplashScreen;
