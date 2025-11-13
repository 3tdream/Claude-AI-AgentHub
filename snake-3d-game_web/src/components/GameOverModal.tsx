import { Dialog, DialogContent, DialogTitle, Box, Typography, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import RetroButton from './RetroButton';
import ScoreDisplay from './ScoreDisplay';
import '../styles/retro.css';

interface GameOverModalProps {
  open: boolean;
  score: number;
  isNewHighScore: boolean;
  difficulty: string;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onSubmitName?: (name: string) => void;
}

const GameOverModal = ({
  open,
  score,
  isNewHighScore,
  difficulty,
  onPlayAgain,
  onGoHome,
  onSubmitName,
}: GameOverModalProps) => {
  const [playerName, setPlayerName] = useState('AAA');
  const [nameSubmitted, setNameSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setNameSubmitted(false);
    }
  }, [open]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 3);
    setPlayerName(value);
  };

  const handleSubmit = () => {
    if (onSubmitName && playerName.length === 3) {
      onSubmitName(playerName);
      setNameSubmitted(true);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1a0a2a 0%, #0a0520 100%)',
          padding: 3,
        },
      }}
    >
      <DialogTitle>
        <Typography
          className="glow-text"
          variant="h2"
          align="center"
          sx={{
            color: '#FF006E',
            fontSize: { xs: '1.5rem', sm: '2rem' },
            mb: 2,
          }}
        >
          GAME OVER
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {isNewHighScore && (
            <Typography
              className="glow-text blink-text"
              variant="h4"
              sx={{
                color: '#FFD700',
                fontSize: { xs: '0.8rem', sm: '1rem' },
                textAlign: 'center',
              }}
            >
              ★ NEW HIGH SCORE! ★
            </Typography>
          )}

          <ScoreDisplay label="Final Score" value={score} animated />

          <Typography
            variant="body1"
            sx={{
              color: '#00FFFF',
              fontSize: { xs: '0.6rem', sm: '0.75rem' },
            }}
          >
            Difficulty: {difficulty}
          </Typography>

          {isNewHighScore && !nameSubmitted && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                width: '100%',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#FFD700',
                  fontSize: { xs: '0.6rem', sm: '0.75rem' },
                  textAlign: 'center',
                }}
              >
                Enter Your Name (3 Letters):
              </Typography>
              <TextField
                value={playerName}
                onChange={handleNameChange}
                inputProps={{
                  maxLength: 3,
                  style: {
                    textAlign: 'center',
                    fontSize: '2rem',
                    fontFamily: '"Press Start 2P", monospace',
                    letterSpacing: '1em',
                    textTransform: 'uppercase',
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#000',
                    border: '3px solid #FFD700',
                    boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#FFD700',
                    textShadow: '0 0 10px #FFD700',
                  },
                }}
              />
              <RetroButton
                variant="contained"
                onClick={handleSubmit}
                disabled={playerName.length !== 3}
                glowing
              >
                Submit
              </RetroButton>
            </Box>
          )}

          {(nameSubmitted || !isNewHighScore) && (
            <Typography
              className="blink-text"
              variant="body1"
              sx={{
                color: '#00FF00',
                fontSize: { xs: '0.6rem', sm: '0.75rem' },
                mt: 2,
              }}
            >
              INSERT COIN TO CONTINUE
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mt: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              width: '100%',
            }}
          >
            <RetroButton
              variant="contained"
              fullWidth
              onClick={onPlayAgain}
            >
              Play Again
            </RetroButton>
            <RetroButton
              variant="outlined"
              fullWidth
              onClick={onGoHome}
            >
              Main Menu
            </RetroButton>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GameOverModal;
