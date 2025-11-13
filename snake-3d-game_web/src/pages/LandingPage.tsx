import { Box, Typography, Card, CardContent, Container, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RetroButton from '../components/RetroButton';
import ArcadeFrame from '../components/ArcadeFrame';
import '../styles/retro.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🎮',
      title: 'Immersive 3D',
      description: 'Experience Snake like never before in stunning 3D graphics',
    },
    {
      icon: '⚡',
      title: 'Power-Ups',
      description: 'Collect speed boosts, shields, and multipliers to dominate',
    },
    {
      icon: '🏆',
      title: 'Leaderboards',
      description: 'Compete globally and climb the ranks to become legendary',
    },
    {
      icon: '🎯',
      title: 'Challenges',
      description: 'Multiple difficulty levels from Easy to Expert',
    },
  ];

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
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 8,
          }}
        >
          <Typography
            variant="h1"
            className="glow-text"
            sx={{
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
              mb: 2,
              animation: 'glow-pulse 2s ease-in-out infinite',
            }}
          >
            3D SNAKE
          </Typography>

          <Typography
            variant="h3"
            sx={{
              color: '#00FFFF',
              fontSize: { xs: '0.8rem', sm: '1rem', md: '1.5rem' },
              mb: 4,
              letterSpacing: '0.2em',
            }}
          >
            ARCADE EDITION
          </Typography>

          <ArcadeFrame
            sx={{
              maxWidth: '600px',
              margin: '0 auto',
              mb: 4,
            }}
          >
            <Box
              sx={{
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle, #1a0a2a 0%, #0a0520 100%)',
              }}
            >
              <Typography
                variant="h2"
                className="blink-text"
                sx={{
                  color: '#00FF00',
                  fontSize: { xs: '1rem', sm: '2rem' },
                }}
              >
                INSERT COIN
              </Typography>
            </Box>
          </ArcadeFrame>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <RetroButton
              variant="contained"
              size="large"
              glowing
              onClick={() => navigate('/game')}
              sx={{
                fontSize: { xs: '0.8rem', sm: '1rem' },
                px: 4,
                py: 2,
              }}
            >
              START GAME
            </RetroButton>
            <RetroButton
              variant="outlined"
              size="large"
              onClick={() => navigate('/leaderboard')}
              sx={{
                fontSize: { xs: '0.8rem', sm: '1rem' },
                px: 4,
                py: 2,
              }}
            >
              HIGH SCORES
            </RetroButton>
          </Box>
        </Box>

        {/* Features Section */}
        <Typography
          variant="h2"
          align="center"
          sx={{
            color: '#FFD700',
            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
            mb: 4,
          }}
        >
          GAME FEATURES
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                className="pixel-corners"
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, #1a0a2a 0%, #0a0520 100%)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 0 30px rgba(0, 255, 255, 0.6)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography
                    variant="h2"
                    sx={{ fontSize: '3rem', mb: 2 }}
                  >
                    {feature.icon}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#00FFFF',
                      mb: 2,
                      fontSize: { xs: '0.8rem', sm: '1rem' },
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#B0B0B0',
                      fontSize: { xs: '0.6rem', sm: '0.75rem' },
                      lineHeight: 1.8,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* How to Play */}
        <ArcadeFrame sx={{ p: 4 }}>
          <Typography
            variant="h3"
            align="center"
            sx={{
              color: '#FFD700',
              fontSize: { xs: '1rem', sm: '1.5rem' },
              mb: 3,
            }}
          >
            HOW TO PLAY
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="body1"
                sx={{
                  color: '#00FFFF',
                  mb: 1,
                  fontSize: { xs: '0.6rem', sm: '0.75rem' },
                }}
              >
                <strong>KEYBOARD:</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#FFFFFF',
                  mb: 2,
                  fontSize: { xs: '0.55rem', sm: '0.65rem' },
                  lineHeight: 2,
                }}
              >
                • ARROW KEYS or WASD to move<br />
                • SPACE or P to pause
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="body1"
                sx={{
                  color: '#00FFFF',
                  mb: 1,
                  fontSize: { xs: '0.6rem', sm: '0.75rem' },
                }}
              >
                <strong>MOBILE:</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#FFFFFF',
                  mb: 2,
                  fontSize: { xs: '0.55rem', sm: '0.65rem' },
                  lineHeight: 2,
                }}
              >
                • SWIPE to change direction<br />
                • TAP to pause
              </Typography>
            </Grid>
          </Grid>
        </ArcadeFrame>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 6, py: 4 }}>
          <Typography
            variant="body2"
            className="blink-text"
            sx={{
              color: '#00FF00',
              fontSize: { xs: '0.6rem', sm: '0.75rem' },
            }}
          >
            READY PLAYER ONE
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
