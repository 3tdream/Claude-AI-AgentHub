import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import retroTheme from './theme/retroTheme';
import './styles/retro.css';

// Pages
import SplashScreen from './pages/SplashScreen';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';

// Components
import RetroNavBar from './components/RetroNavBar';

// Layout component to conditionally show navbar
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideNavbar = location.pathname === '/';

  return (
    <>
      {!hideNavbar && <RetroNavBar />}
      {children}
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={retroTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
          {/* Splash Screen - First screen shown */}
          <Route path="/" element={<SplashScreen />} />

          {/* Main Hub - New home page (mobile game style) */}
          <Route path="/home" element={<HomePage />} />

          {/* Legacy Routes - Keep for backward compatibility */}
          <Route path="/landing" element={<LandingPage />} />

          {/* Game Routes */}
          <Route path="/game" element={<GamePage />} />

          {/* Feature Pages */}
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Placeholder routes for future features */}
          <Route path="/challenges" element={<Navigate to="/home" replace />} />
          <Route path="/multiplayer" element={<Navigate to="/home" replace />} />
          <Route path="/store" element={<Navigate to="/home" replace />} />
          <Route path="/achievements" element={<Navigate to="/home" replace />} />
          <Route path="/daily-reward" element={<Navigate to="/home" replace />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
