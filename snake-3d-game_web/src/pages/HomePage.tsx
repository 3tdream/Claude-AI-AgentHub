import { Box, Card, CardContent, Typography, IconButton, Badge, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserStore } from '../contexts/UserContext';
import { platformDetector } from '../utils/platformDetector';
import RetroButton from '../components/RetroButton';
import '../styles/retro.css';
import { useEffect, useRef, useState } from 'react';

const HomePage = () => {
  const navigate = useNavigate();
  const {profile, progress, getLevelProgress } = useUserStore();
  const isMobile = platformDetector.isMobile();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const menuItems = [
    {
      id: 'play',
      title: 'SOLO PLAY',
      icon: '🎮',
      description: 'Classic & Time Attack modes',
      path: '/game',
      color: '#8B008B',
    },
    {
      id: 'challenges',
      title: 'CHALLENGES',
      icon: '🎯',
      description: 'Daily & weekly missions',
      path: '/challenges',
      color: '#FF6B35',
      badge: 3, // Active challenges count
    },
    {
      id: 'multiplayer',
      title: 'MULTIPLAYER',
      icon: '⚔️',
      description: 'Challenge your friends',
      path: '/multiplayer',
      color: '#4ECDC4',
    },
    {
      id: 'store',
      title: 'STORE',
      icon: '🛒',
      description: 'Power-ups, skins & themes',
      path: '/store',
      color: '#FFD700',
      badge: 'NEW',
    },
    {
      id: 'leaderboards',
      title: 'LEADERBOARDS',
      icon: '🏆',
      description: 'Global rankings',
      path: '/leaderboard',
      color: '#FF1744',
    },
    {
      id: 'achievements',
      title: 'ACHIEVEMENTS',
      icon: '⭐',
      description: 'Your trophies',
      path: '/achievements',
      color: '#9C27B0',
    },
  ];

  const levelProgress = getLevelProgress();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Navigate menu items with arrow keys
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % menuItems.length);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Navigate to selected menu item
        navigate(menuItems[selectedIndex].path);
      } else if (e.key === '1') {
        e.preventDefault();
        navigate('/game?mode=web');
      } else if (e.key === '2') {
        e.preventDefault();
        navigate('/game?mode=mobile');
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        navigate('/settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, menuItems, navigate]);

  // Auto-scroll to selected item
  useEffect(() => {
    if (menuItemRefs.current[selectedIndex]) {
      menuItemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  return (
    <Box
      className="crt-effect"
      sx={{
        minHeight: { xs: '100%', md: '100vh' },
        height: { xs: 'auto', md: '100vh' },
        background: 'linear-gradient(180deg, #0A0E27 0%, #1a0a2a 100%)',
        padding: { xs: '0.75rem', sm: '1.5rem', md: '2rem' },
        paddingTop: { xs: '0.75rem', sm: '1rem', md: '1.5rem' },
        paddingBottom: { xs: '1.5rem', sm: '2.5rem', md: '4rem' },
        overflow: 'visible',
        position: 'relative',
      }}
    >
      <div className="scanline" />

      {/* Top Bar with Profile */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'clamp(1.5rem, 3vh, 2.5rem)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Player Profile Card */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ flex: '1 1 auto', minWidth: '250px', maxWidth: '400px', width: '100%' }}
        >
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1a0a2a 0%, #0a0520 100%)',
              border: '2px solid #00FFFF',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
              padding: '1rem',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Avatar */}
              <Box
                sx={{
                  width: 'clamp(50px, 10vw, 70px)',
                  height: 'clamp(50px, 10vw, 70px)',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B008B 0%, #00FFFF 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                  border: '3px solid #FFD700',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)',
                }}
              >
                🐍
              </Box>

              {/* Info */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 'clamp(0.7rem, 2vw, 1rem)',
                    color: '#FFD700',
                    marginBottom: '0.25rem',
                  }}
                >
                  {profile.username}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 'clamp(0.5rem, 1.2vw, 0.65rem)',
                    color: '#00FFFF',
                    marginBottom: '0.5rem',
                  }}
                >
                  Level {profile.level}
                </Typography>

                {/* XP Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={levelProgress * 100}
                  sx={{
                    height: '8px',
                    borderRadius: '4px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #8B008B 0%, #00FFFF 100%)',
                    },
                  }}
                />
              </Box>
            </Box>
          </Card>
        </motion.div>

        {/* Currency Display */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Coins */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 140, 0, 0.2) 100%)',
                padding: '0.5rem 1rem',
                borderRadius: '25px',
                border: '2px solid #FFD700',
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)',
              }}
            >
              <span style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>🪙</span>
              <Typography
                sx={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 'clamp(0.7rem, 1.8vw, 1rem)',
                  color: '#FFD700',
                }}
              >
                {profile.coins}
              </Typography>
            </Box>

            {/* Gems */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, rgba(139, 0, 139, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%)',
                padding: '0.5rem 1rem',
                borderRadius: '25px',
                border: '2px solid #FF00FF',
                boxShadow: '0 0 15px rgba(255, 0, 255, 0.3)',
              }}
            >
              <span style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>💎</span>
              <Typography
                sx={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 'clamp(0.7rem, 1.8vw, 1rem)',
                  color: '#FF00FF',
                }}
              >
                {profile.gems}
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* Settings Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <IconButton
            onClick={() => navigate('/settings')}
            sx={{
              background: 'rgba(139, 0, 139, 0.5)',
              border: '2px solid #00FFFF',
              color: '#00FFFF',
              '&:hover': {
                background: 'rgba(139, 0, 139, 0.8)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
              },
            }}
          >
            <span style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)' }}>⚙️</span>
          </IconButton>
        </motion.div>
      </Box>

      {/* Main Title */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Typography
          className="glow-text"
          variant="h1"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem', lg: '3.5rem' },
            fontFamily: '"Press Start 2P", monospace',
            color: '#00FFFF',
            textAlign: 'center',
            marginBottom: { xs: '1rem', sm: '1.5rem', md: '2rem' },
            textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #8B008B',
            animation: 'glow-pulse 2s ease-in-out infinite',
          }}
        >
          3D SNAKE
        </Typography>
      </motion.div>

      {/* Play Buttons - Web & Mobile */}
      <Box
        sx={{
          marginBottom: { xs: '1.5rem', sm: '2.5rem', md: '3rem' },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Play Web Button */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RetroButton
            variant="contained"
            size="large"
            glowing={!isMobile}
            onClick={() => {
              // Set control scheme to onscreen for web
              navigate('/game?mode=web');
            }}
            sx={{
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' },
              padding: { xs: '1.2rem 2rem', sm: '1.5rem 2.5rem', md: '1.5rem 3rem' },
              background: isMobile
                ? 'linear-gradient(180deg, #4ECDC4 0%, #3BA99C 100%)'
                : 'linear-gradient(180deg, #00FF00 0%, #00AA00 100%)',
              border: '4px solid #FFD700',
              boxShadow: isMobile
                ? '0 0 20px rgba(78, 205, 196, 0.4), 0 8px 0 #2A8B82'
                : '0 0 30px rgba(0, 255, 0, 0.6), 0 10px 0 #006600',
              minWidth: { xs: '100%', sm: '240px', md: '280px' },
              width: { xs: '100%', sm: 'auto' },
              minHeight: { xs: '80px', sm: 'auto' },
              '&:hover': {
                background: isMobile
                  ? 'linear-gradient(180deg, #5EDED6 0%, #4ECDC4 100%)'
                  : 'linear-gradient(180deg, #00FF88 0%, #00CC00 100%)',
                boxShadow: isMobile
                  ? '0 0 30px rgba(78, 205, 196, 0.6), 0 8px 0 #2A8B82'
                  : '0 0 40px rgba(0, 255, 0, 0.8), 0 10px 0 #006600',
              },
              opacity: isMobile ? 0.7 : 1,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Typography sx={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>🖥️</Typography>
              <Typography sx={{ fontSize: 'inherit', fontFamily: 'inherit' }}>
                {isMobile ? 'WEB VERSION' : '▶ PLAY WEB NOW'}
              </Typography>
              <Typography sx={{
                fontSize: 'clamp(0.5rem, 1.2vw, 0.65rem)',
                opacity: 0.8,
                fontFamily: 'inherit'
              }}>
                On-Screen Controls
              </Typography>
            </Box>
          </RetroButton>
        </motion.div>

        {/* Play Mobile Button */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RetroButton
            variant="contained"
            size="large"
            glowing={isMobile}
            onClick={() => {
              // Set control scheme to touch for mobile
              navigate('/game?mode=mobile');
            }}
            sx={{
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' },
              padding: { xs: '1.2rem 2rem', sm: '1.5rem 2.5rem', md: '1.5rem 3rem' },
              background: isMobile
                ? 'linear-gradient(180deg, #00FF00 0%, #00AA00 100%)'
                : 'linear-gradient(180deg, #FF6B35 0%, #CC5529 100%)',
              border: '4px solid #FFD700',
              boxShadow: isMobile
                ? '0 0 30px rgba(0, 255, 0, 0.6), 0 10px 0 #006600'
                : '0 0 20px rgba(255, 107, 53, 0.4), 0 8px 0 #994020',
              minWidth: { xs: '100%', sm: '240px', md: '280px' },
              width: { xs: '100%', sm: 'auto' },
              minHeight: { xs: '80px', sm: 'auto' },
              '&:hover': {
                background: isMobile
                  ? 'linear-gradient(180deg, #00FF88 0%, #00CC00 100%)'
                  : 'linear-gradient(180deg, #FF8555 0%, #FF6B35 100%)',
                boxShadow: isMobile
                  ? '0 0 40px rgba(0, 255, 0, 0.8), 0 10px 0 #006600'
                  : '0 0 30px rgba(255, 107, 53, 0.6), 0 8px 0 #994020',
              },
              opacity: isMobile ? 1 : 0.7,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Typography sx={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>📱</Typography>
              <Typography sx={{ fontSize: 'inherit', fontFamily: 'inherit' }}>
                {isMobile ? '▶ PLAY MOBILE NOW' : 'MOBILE VERSION'}
              </Typography>
              <Typography sx={{
                fontSize: 'clamp(0.5rem, 1.2vw, 0.65rem)',
                opacity: 0.8,
                fontFamily: 'inherit'
              }}>
                Swipe Controls
              </Typography>
            </Box>
          </RetroButton>
        </motion.div>
      </Box>

      {/* Menu Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            ref={(el) => (menuItemRefs.current[index] = el)}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
          >
            <Card
              onClick={() => navigate(item.path)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(item.path);
                }
              }}
              sx={{
                background: `linear-gradient(135deg, ${item.color}33 0%, rgba(10, 5, 32, 0.8) 100%)`,
                border: selectedIndex === index
                  ? `4px solid #00FFFF`
                  : `3px solid ${item.color}`,
                boxShadow: selectedIndex === index
                  ? `0 0 40px #00FFFF, 0 0 20px ${item.color}`
                  : `0 0 20px ${item.color}44`,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.3s',
                outline: 'none',
                transform: selectedIndex === index ? 'translateY(-8px) scale(1.05)' : 'none',
                '&:hover': {
                  border: `3px solid ${item.color}`,
                  boxShadow: `0 0 30px ${item.color}88`,
                  transform: 'translateY(-5px)',
                },
                '&:focus': {
                  border: `4px solid #00FFFF`,
                  boxShadow: `0 0 40px #00FFFF, 0 0 20px ${item.color}`,
                },
              }}
            >
              {item.badge && (
                <Badge
                  badgeContent={item.badge}
                  sx={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    '& .MuiBadge-badge': {
                      background: '#FF0000',
                      color: '#FFFFFF',
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: 'clamp(0.5rem, 1vw, 0.6rem)',
                      padding: '0.5rem',
                      border: '2px solid #FFD700',
                    },
                  }}
                />
              )}

              <CardContent sx={{ padding: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, textAlign: 'center' }}>
                <Box
                  sx={{
                    fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                    marginBottom: '0.5rem',
                    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
                  }}
                >
                  {item.icon}
                </Box>

                <Typography
                  sx={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 'clamp(0.7rem, 1.8vw, 1rem)',
                    color: '#FFFFFF',
                    marginBottom: '0.5rem',
                    textShadow: `0 0 10px ${item.color}`,
                  }}
                >
                  {item.title}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 'clamp(0.45rem, 1.2vw, 0.6rem)',
                    color: '#AAAAAA',
                    lineHeight: 1.6,
                  }}
                >
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* Daily Reward Notification (if available) */}
      {!progress.lastDailyReward || new Date(progress.lastDailyReward).toISOString().split('T')[0] !== new Date().toISOString().split('T')[0] ? (
        <Box
          component={motion.div}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          sx={{
            position: 'fixed',
            bottom: { xs: '1rem', sm: '2rem' },
            right: { xs: '1rem', sm: '2rem' },
            zIndex: 1000,
          }}
        >
          <Card
            onClick={() => navigate('/daily-reward')}
            className="blink-text"
            sx={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
              border: '3px solid #FFFFFF',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
              padding: '1rem',
              cursor: 'pointer',
              animation: 'pulse 2s ease-in-out infinite',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  marginBottom: '0.5rem',
                }}
              >
                🎁
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 'clamp(0.5rem, 1.2vw, 0.7rem)',
                  color: '#000000',
                  fontWeight: 'bold',
                }}
              >
                DAILY REWARD
              </Typography>
            </Box>
          </Card>
        </Box>
      ) : null}

      {/* Keyboard Shortcuts Guide - Hide on mobile */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          marginTop: 'clamp(2rem, 4vh, 3rem)',
          padding: '1rem',
          background: 'rgba(0, 255, 255, 0.1)',
          border: '2px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '2rem auto 0',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(0.6rem, 1.5vw, 0.8rem)',
            color: '#00FFFF',
            textAlign: 'center',
            marginBottom: '0.8rem',
          }}
        >
          ⌨️ KEYBOARD SHORTCUTS
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: '0.8rem',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(0.5rem, 1.2vw, 0.65rem)',
            color: '#FFFFFF',
          }}
        >
          <Box>↑↓←→ Navigate menu</Box>
          <Box>ENTER/SPACE Activate</Box>
          <Box>1 Play Web</Box>
          <Box>2 Play Mobile</Box>
          <Box>S Settings</Box>
          <Box>TAB Cycle items</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
