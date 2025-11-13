import { Box, Card, CardContent, Typography, Slider, Switch, FormControlLabel, MenuItem, Select, FormControl, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserStore } from '../contexts/UserContext';
import RetroButton from '../components/RetroButton';
import '../styles/retro.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, profile, updateUsername, resetAll } = useUserStore();

  const handleVolumeChange = (type: 'soundVolume' | 'musicVolume' | 'sfxVolume') => (
    _event: Event,
    value: number | number[]
  ) => {
    updateSettings({ [type]: value as number });
  };

  const handleSwitchChange = (field: keyof typeof settings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateSettings({ [field]: event.target.checked });
  };

  const handleSelectChange = (field: keyof typeof settings) => (
    event: SelectChangeEvent<string>
  ) => {
    updateSettings({ [field]: event.target.value });
  };

  const handleUsernameChange = () => {
    const newName = prompt('Enter new username (max 12 characters):', profile.username);
    if (newName && newName.trim() && newName.length <= 12) {
      updateUsername(newName.trim());
    }
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset ALL game data? This cannot be undone!')) {
      resetAll();
      navigate('/home');
    }
  };

  return (
    <Box
      className="crt-effect"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0A0E27 0%, #1a0a2a 100%)',
        padding: 'clamp(1rem, 3vw, 2rem)',
        paddingBottom: 'clamp(3rem, 6vh, 5rem)',
        overflow: 'auto',
      }}
    >
      <div className="scanline" />

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'clamp(1.5rem, 3vh, 2.5rem)',
        }}
      >
        <RetroButton variant="outlined" onClick={() => navigate('/home')}>
          ← BACK
        </RetroButton>

        <Typography
          className="glow-text"
          variant="h1"
          sx={{
            fontSize: 'clamp(1.2rem, 4vw, 2rem)',
            fontFamily: '"Press Start 2P", monospace',
            color: '#00FFFF',
            textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF',
          }}
        >
          SETTINGS
        </Typography>

        <Box sx={{ width: 'clamp(80px, 15vw, 120px)' }} /> {/* Spacer */}
      </Box>

      <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Sound Settings */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1a0a2a 0%, #0a0520 100%)',
              border: '2px solid #00FFFF',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
              marginBottom: '1.5rem',
            }}
          >
            <CardContent sx={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
              <Typography
                sx={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                  color: '#FFD700',
                  marginBottom: '1.5rem',
                }}
              >
                🔊 AUDIO
              </Typography>

              {/* Master Volume */}
              <Box sx={{ marginBottom: '1.5rem' }}>
                <Typography
                  sx={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 'clamp(0.6rem, 1.5vw, 0.8rem)',
                    color: '#FFFFFF',
                    marginBottom: '0.5rem',
                  }}
                >
                  Master Volume: {settings.soundVolume}%
                </Typography>
                <Slider
                  value={settings.soundVolume}
                  onChange={handleVolumeChange('soundVolume')}
                  min={0}
                  max={100}
                  sx={{
                    color: '#00FFFF',
                    '& .MuiSlider-thumb': {
                      border: '2px solid #FFD700',
                    },
                  }}
                />
              </Box>

              {/* Music Volume */}
              <Box sx={{ marginBottom: '1.5rem' }}>
                <Typography
                  sx={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 'clamp(0.6rem, 1.5vw, 0.8rem)',
                    color: '#FFFFFF',
                    marginBottom: '0.5rem',
                  }}
                >
                  Music Volume: {settings.musicVolume}%
                </Typography>
                <Slider
                  value={settings.musicVolume}
                  onChange={handleVolumeChange('musicVolume')}
                  min={0}
                  max={100}
                  sx={{
                    color: '#8B008B',
                    '& .MuiSlider-thumb': {
                      border: '2px solid #FFD700',
                    },
                  }}
                />
              </Box>

              {/* SFX Volume */}
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 'clamp(0.6rem, 1.5vw, 0.8rem)',
                    color: '#FFFFFF',
                    marginBottom: '0.5rem',
                  }}
                >
                  SFX Volume: {settings.sfxVolume}%
                </Typography>
                <Slider
                  value={settings.sfxVolume}
                  onChange={handleVolumeChange('sfxVolume')}
                  min={0}
                  max={100}
                  sx={{
                    color: '#00FF00',
                    '& .MuiSlider-thumb': {
                      border: '2px solid #FFD700',
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls Settings */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1a0a2a 0%, #0a0520 100%)',
              border: '2px solid #00FFFF',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
              marginBottom: '1.5rem',
            }}
          >
            <CardContent sx={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
              <Typography
                sx={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                  color: '#FFD700',
                  marginBottom: '1.5rem',
                }}
              >
                🎮 CONTROLS
              </Typography>

              <Box sx={{ marginBottom: '1.5rem' }}>
                <Typography
                  sx={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 'clamp(0.6rem, 1.5vw, 0.8rem)',
                    color: '#FFFFFF',
                    marginBottom: '0.5rem',
                  }}
                >
                  Control Scheme
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={settings.controlScheme}
                    onChange={handleSelectChange('controlScheme')}
                    sx={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: 'clamp(0.5rem, 1.2vw, 0.7rem)',
                      color: '#00FFFF',
                      background: 'rgba(0, 0, 0, 0.3)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#00FFFF',
                      },
                    }}
                  >
                    <MenuItem value="auto">Auto-Detect</MenuItem>
                    <MenuItem value="touch">Touch (Swipe)</MenuItem>
                    <MenuItem value="keyboard">Keyboard Only</MenuItem>
                    <MenuItem value="onscreen">On-Screen Buttons</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.vibration}
                    onChange={handleSwitchChange('vibration')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#00FFFF',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#00FFFF',
                      },
                    }}
                  />
                }
                label="Vibration (Mobile)"
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 'clamp(0.5rem, 1.2vw, 0.7rem)',
                    color: '#FFFFFF',
                  },
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Graphics Settings */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1a0a2a 0%, #0a0520 100%)',
              border: '2px solid #00FFFF',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
              marginBottom: '1.5rem',
            }}
          >
            <CardContent sx={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
              <Typography
                sx={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                  color: '#FFD700',
                  marginBottom: '1.5rem',
                }}
              >
                🎨 GRAPHICS
              </Typography>

              <Box sx={{ marginBottom: '1.5rem' }}>
                <Typography
                  sx={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 'clamp(0.6rem, 1.5vw, 0.8rem)',
                    color: '#FFFFFF',
                    marginBottom: '0.5rem',
                  }}
                >
                  Particle Quality
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={settings.particleQuality}
                    onChange={handleSelectChange('particleQuality')}
                    sx={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: 'clamp(0.5rem, 1.2vw, 0.7rem)',
                      color: '#00FFFF',
                      background: 'rgba(0, 0, 0, 0.3)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#00FFFF',
                      },
                    }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 'clamp(0.6rem, 1.5vw, 0.8rem)',
                    color: '#FFFFFF',
                    marginBottom: '0.5rem',
                  }}
                >
                  Shadow Quality
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={settings.shadowQuality}
                    onChange={handleSelectChange('shadowQuality')}
                    sx={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: 'clamp(0.5rem, 1.2vw, 0.7rem)',
                      color: '#00FFFF',
                      background: 'rgba(0, 0, 0, 0.3)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#00FFFF',
                      },
                    }}
                  >
                    <MenuItem value="off">Off</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gameplay Settings */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1a0a2a 0%, #0a0520 100%)',
              border: '2px solid #00FFFF',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
              marginBottom: '1.5rem',
            }}
          >
            <CardContent sx={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
              <Typography
                sx={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                  color: '#FFD700',
                  marginBottom: '1.5rem',
                }}
              >
                🎯 GAMEPLAY
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showHints}
                    onChange={handleSwitchChange('showHints')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#00FFFF',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#00FFFF',
                      },
                    }}
                  />
                }
                label="Show Hints"
                sx={{
                  marginBottom: '1rem',
                  '& .MuiFormControlLabel-label': {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 'clamp(0.5rem, 1.2vw, 0.7rem)',
                    color: '#FFFFFF',
                  },
                }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoPause}
                    onChange={handleSwitchChange('autoPause')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#00FFFF',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#00FFFF',
                      },
                    }}
                  />
                }
                label="Auto-Pause on Focus Loss"
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 'clamp(0.5rem, 1.2vw, 0.7rem)',
                    color: '#FFFFFF',
                  },
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1a0a2a 0%, #0a0520 100%)',
              border: '2px solid #00FFFF',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
              marginBottom: '1.5rem',
            }}
          >
            <CardContent sx={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
              <Typography
                sx={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                  color: '#FFD700',
                  marginBottom: '1.5rem',
                }}
              >
                👤 ACCOUNT
              </Typography>

              <Box sx={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <RetroButton variant="outlined" onClick={handleUsernameChange} sx={{ flex: '1 1 auto', minWidth: '150px' }}>
                  Change Username
                </RetroButton>

                <RetroButton
                  variant="outlined"
                  onClick={handleResetData}
                  sx={{
                    flex: '1 1 auto',
                    minWidth: '150px',
                    borderColor: '#FF0000',
                    color: '#FF0000',
                    '&:hover': {
                      borderColor: '#FF0000',
                      background: 'rgba(255, 0, 0, 0.1)',
                    },
                  }}
                >
                  Reset All Data
                </RetroButton>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
};

export default SettingsPage;
