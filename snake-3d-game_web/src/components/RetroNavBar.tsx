import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import RetroButton from './RetroButton';
import '../styles/retro.css';

const RetroNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/home', label: 'HOME', icon: '🏠', priority: 1 },
    { path: '/game', label: 'PLAY', icon: '🎮', priority: 1 },
    { path: '/store', label: 'STORE', icon: '🛒', priority: 2 },
    { path: '/challenges', label: 'CHALLENGES', icon: '🎯', priority: 3 },
    { path: '/leaderboard', label: 'SCORES', icon: '🏆', priority: 2 },
    { path: '/settings', label: 'SETTINGS', icon: '⚙️', priority: 3 },
  ];

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    handleMobileMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'linear-gradient(90deg, #1a0a2a 0%, #0a0520 50%, #1a0a2a 100%)',
        borderBottom: '3px solid #00FFFF',
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: { xs: 1, sm: 2 }, py: 1, minHeight: { xs: '56px', sm: '64px' } }}>
        {/* Logo */}
        <Typography
          variant="h6"
          className="glow-text"
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem' },
            cursor: 'pointer',
            flex: '0 0 auto',
            whiteSpace: 'nowrap',
          }}
          onClick={() => navigate('/home')}
        >
          3D SNAKE
        </Typography>

        {/* Desktop Navigation - Show priority 1 & 2 items */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' },
          gap: 1.5,
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          {menuItems.map((item) => (
            <RetroButton
              key={item.path}
              size="small"
              variant={isActive(item.path) ? 'contained' : 'outlined'}
              onClick={() => navigate(item.path)}
              sx={{
                fontSize: 'clamp(0.55rem, 1vw, 0.7rem)',
                padding: '8px 16px',
                minWidth: 'auto',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Box>
            </RetroButton>
          ))}
        </Box>

        {/* Tablet Navigation - Show priority 1 & 2 items */}
        <Box sx={{
          display: { xs: 'none', sm: 'flex', md: 'none' },
          gap: 1,
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          {menuItems.filter(item => item.priority <= 2).map((item) => (
            <RetroButton
              key={item.path}
              size="small"
              variant={isActive(item.path) ? 'contained' : 'outlined'}
              onClick={() => navigate(item.path)}
              sx={{
                fontSize: '0.6rem',
                padding: '6px 12px',
                minWidth: 'auto',
              }}
            >
              <span>{item.icon}</span>
            </RetroButton>
          ))}

          {/* More Menu for tablet */}
          <IconButton
            onClick={handleMobileMenuOpen}
            sx={{
              color: '#00FFFF',
              border: '2px solid #00FFFF',
              borderRadius: '4px',
              padding: '6px',
              '&:hover': {
                background: 'rgba(0, 255, 255, 0.1)',
              },
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>☰</span>
          </IconButton>
        </Box>

        {/* Mobile Navigation - Show only priority 1 items + menu */}
        <Box sx={{
          display: { xs: 'flex', sm: 'none' },
          gap: 0.5,
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          {menuItems.filter(item => item.priority === 1).map((item) => (
            <RetroButton
              key={item.path}
              size="small"
              variant={isActive(item.path) ? 'contained' : 'outlined'}
              onClick={() => navigate(item.path)}
              sx={{
                fontSize: '0.5rem',
                padding: '6px 10px',
                minWidth: 'auto',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            </RetroButton>
          ))}

          {/* Mobile Menu Button */}
          <IconButton
            onClick={handleMobileMenuOpen}
            sx={{
              color: '#00FFFF',
              border: '2px solid #00FFFF',
              borderRadius: '4px',
              padding: '4px',
              '&:hover': {
                background: 'rgba(0, 255, 255, 0.1)',
              },
            }}
          >
            <span style={{ fontSize: '1rem' }}>☰</span>
          </IconButton>
        </Box>

        {/* Mobile/Tablet Dropdown Menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          sx={{
            '& .MuiPaper-root': {
              background: 'linear-gradient(135deg, #1a0a2a 0%, #0a0520 100%)',
              border: '2px solid #00FFFF',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
              marginTop: '8px',
            },
          }}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.path}
              onClick={() => handleMenuClick(item.path)}
              sx={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '0.6rem',
                color: isActive(item.path) ? '#00FFFF' : '#FFFFFF',
                padding: '12px 20px',
                gap: '10px',
                background: isActive(item.path) ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  background: 'rgba(0, 255, 255, 0.2)',
                },
              }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default RetroNavBar;
