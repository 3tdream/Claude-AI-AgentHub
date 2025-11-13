import { Button, ButtonProps } from '@mui/material';
import '../styles/retro.css';

interface RetroButtonProps extends ButtonProps {
  glowing?: boolean;
}

const RetroButton = ({ children, glowing = false, sx, ...props }: RetroButtonProps) => {
  return (
    <Button
      {...props}
      className={glowing ? 'glow-text' : ''}
      sx={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: { xs: '0.6rem', sm: '0.75rem' },
        padding: { xs: '10px 20px', sm: '12px 24px' },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
};

export default RetroButton;
