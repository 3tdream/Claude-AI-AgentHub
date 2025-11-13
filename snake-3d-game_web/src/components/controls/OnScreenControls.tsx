import { Box, IconButton } from '@mui/material';
import { motion } from 'framer-motion';

export interface OnScreenControlsProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onPause?: () => void;
  visible?: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'bottom-center';
}

const OnScreenControls: React.FC<OnScreenControlsProps> = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  onPause,
  visible = true,
  position = 'bottom-left',
}) => {
  if (!visible) return null;

  const getPositionStyles = () => {
    const base = {
      position: 'fixed' as const,
      bottom: '2rem',
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-left':
        return { ...base, left: '2rem' };
      case 'bottom-right':
        return { ...base, right: '2rem' };
      case 'bottom-center':
        return { ...base, left: '50%', transform: 'translateX(-50%)' };
      default:
        return { ...base, left: '2rem' };
    }
  };

  const buttonStyle = {
    background: 'rgba(139, 0, 139, 0.8)',
    border: '2px solid #00FFFF',
    color: '#FFFFFF',
    width: 'clamp(50px, 12vw, 70px)',
    height: 'clamp(50px, 12vw, 70px)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
    transition: 'all 0.2s',
    '&:hover': {
      background: 'rgba(179, 0, 179, 0.9)',
      boxShadow: '0 0 25px rgba(0, 255, 255, 0.8)',
      transform: 'scale(1.05)',
    },
    '&:active': {
      transform: 'scale(0.95)',
      boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)',
    },
  };

  const arrowStyle = {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: 'bold',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      style={getPositionStyles()}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        {/* Up Button */}
        <IconButton
          onClick={onUp}
          sx={buttonStyle}
          aria-label="up"
        >
          <span style={arrowStyle}>↑</span>
        </IconButton>

        {/* Middle Row: Left, Center, Right */}
        <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <IconButton
            onClick={onLeft}
            sx={buttonStyle}
            aria-label="left"
          >
            <span style={arrowStyle}>←</span>
          </IconButton>

          {/* Center (empty space or pause button) */}
          {onPause && (
            <IconButton
              onClick={onPause}
              sx={{
                ...buttonStyle,
                background: 'rgba(255, 215, 0, 0.8)',
                '&:hover': {
                  background: 'rgba(255, 215, 0, 0.9)',
                },
              }}
              aria-label="pause"
            >
              <span style={arrowStyle}>⏸</span>
            </IconButton>
          )}

          <IconButton
            onClick={onRight}
            sx={buttonStyle}
            aria-label="right"
          >
            <span style={arrowStyle}>→</span>
          </IconButton>
        </Box>

        {/* Down Button */}
        <IconButton
          onClick={onDown}
          sx={buttonStyle}
          aria-label="down"
        >
          <span style={arrowStyle}>↓</span>
        </IconButton>
      </Box>

      {/* Instruction text */}
      <Box
        sx={{
          marginTop: '1rem',
          textAlign: 'center',
          fontSize: 'clamp(0.6rem, 1.5vw, 0.75rem)',
          color: '#00FFFF',
          fontFamily: '"Press Start 2P", monospace',
          textShadow: '0 0 5px #00FFFF',
        }}
      >
        OR USE KEYBOARD
      </Box>
    </motion.div>
  );
};

export default OnScreenControls;
