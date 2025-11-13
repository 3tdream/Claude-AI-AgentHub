import { Box, BoxProps } from '@mui/material';
import '../styles/retro.css';

interface ArcadeFrameProps extends BoxProps {
  children: React.ReactNode;
  withCRT?: boolean;
}

const ArcadeFrame = ({ children, withCRT = true, sx, ...props }: ArcadeFrameProps) => {
  return (
    <Box
      {...props}
      className={withCRT ? 'arcade-frame crt-effect' : 'arcade-frame'}
      sx={{
        position: 'relative',
        ...sx,
      }}
    >
      {withCRT && <div className="scanline" />}
      {children}
    </Box>
  );
};

export default ArcadeFrame;
