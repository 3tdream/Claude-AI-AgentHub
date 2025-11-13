import { useState } from 'react';
import { Box, Typography, Container, Tabs, Tab } from '@mui/material';
import LeaderboardTable from '../components/LeaderboardTable';
import ArcadeFrame from '../components/ArcadeFrame';
import RetroButton from '../components/RetroButton';
import { useGameStats } from '../hooks/useGameStats';
import '../styles/retro.css';

const LeaderboardPage = () => {
  const { highScores, getHighScoresByDifficulty, clearHighScores } = useGameStats();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  const difficulties = ['ALL', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'];

  const getScoresToDisplay = () => {
    if (selectedDifficulty === 'ALL') {
      return highScores;
    }
    return getHighScoresByDifficulty(selectedDifficulty);
  };

  return (
    <Box
      className="crt-effect"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0A0E27 0%, #1a0a2a 100%)',
        py: 8,
      }}
    >
      <div className="scanline" />

      <Container maxWidth="lg">
        <Typography
          variant="h1"
          className="glow-text"
          align="center"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3rem' },
            mb: 6,
          }}
        >
          HIGH SCORES
        </Typography>

        <ArcadeFrame sx={{ mb: 4 }}>
          <Tabs
            value={selectedDifficulty}
            onChange={(_, newValue) => setSelectedDifficulty(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                color: '#00FFFF',
                fontSize: { xs: '0.6rem', sm: '0.75rem' },
                fontFamily: '"Press Start 2P", monospace',
              },
              '& .Mui-selected': {
                color: '#FFD700 !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFD700',
                height: 3,
              },
            }}
          >
            {difficulties.map((diff) => (
              <Tab key={diff} label={diff} value={diff} />
            ))}
          </Tabs>

          <LeaderboardTable
            scores={getScoresToDisplay()}
            difficulty={selectedDifficulty !== 'ALL' ? selectedDifficulty : undefined}
          />

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <RetroButton
              variant="outlined"
              onClick={clearHighScores}
              sx={{ fontSize: { xs: '0.5rem', sm: '0.65rem' } }}
            >
              Clear Scores
            </RetroButton>
          </Box>
        </ArcadeFrame>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography
            variant="body2"
            className="blink-text"
            sx={{
              color: '#00FF00',
              fontSize: { xs: '0.6rem', sm: '0.75rem' },
            }}
          >
            CAN YOU BEAT THE BEST?
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LeaderboardPage;
