import { useState } from 'react';
import { Box } from '@mui/material';
import Snake3DGame from '../Snake3DGame';
import '../styles/retro.css';

const GamePage = () => {
  const [key] = useState(0);

  return (
    <Box
      className="crt-effect"
      sx={{
        minHeight: '100vh',
        background: '#0A0E27',
      }}
    >
      <div className="scanline" />
      <Snake3DGame key={key} />
    </Box>
  );
};

export default GamePage;
