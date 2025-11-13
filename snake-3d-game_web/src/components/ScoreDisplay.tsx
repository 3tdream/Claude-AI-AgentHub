import { Box, Typography } from '@mui/material';
import '../styles/retro.css';

interface ScoreDisplayProps {
  label: string;
  value: number | string;
  animated?: boolean;
}

const ScoreDisplay = ({ label, value, animated = false }: ScoreDisplayProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: '#00FFFF',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: { xs: '0.6rem', sm: '0.75rem' },
        }}
      >
        {label}
      </Typography>
      <Box
        className={animated ? 'led-display score-animation' : 'led-display'}
        sx={{
          minWidth: { xs: '80px', sm: '120px' },
          textAlign: 'center',
          fontSize: { xs: '1rem !important', sm: '1.5rem !important' },
        }}
      >
        {typeof value === 'number' ? value.toString().padStart(6, '0') : value}
      </Box>
    </Box>
  );
};

export default ScoreDisplay;
