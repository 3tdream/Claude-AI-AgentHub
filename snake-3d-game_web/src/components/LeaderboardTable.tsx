import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { HighScore } from '../utils/statsStorage';
import '../styles/retro.css';

interface LeaderboardTableProps {
  scores: HighScore[];
  difficulty?: string;
}

const LeaderboardTable = ({ scores, difficulty }: LeaderboardTableProps) => {
  const getMedalIcon = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  if (scores.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#00FFFF',
            fontSize: { xs: '0.8rem', sm: '1rem' },
          }}
        >
          NO SCORES YET
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#B0B0B0',
            mt: 2,
            fontSize: { xs: '0.6rem', sm: '0.75rem' },
          }}
        >
          Be the first to set a high score!
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      className="crt-effect"
      sx={{
        background: 'linear-gradient(135deg, #1a0a2a 0%, #0a0520 100%)',
        maxHeight: 600,
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: '80px' }}>
              RANK
            </TableCell>
            <TableCell align="center">PLAYER</TableCell>
            <TableCell align="center">SCORE</TableCell>
            {!difficulty && <TableCell align="center">LEVEL</TableCell>}
            <TableCell align="center">DATE</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {scores.map((score, index) => (
            <TableRow
              key={score.id}
              sx={{
                '&:nth-of-type(odd)': {
                  backgroundColor: 'rgba(139, 0, 139, 0.1)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 255, 255, 0.1)',
                },
              }}
            >
              <TableCell align="center">
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '1rem' },
                    color: index < 3 ? '#FFD700' : '#00FFFF',
                  }}
                >
                  {getMedalIcon(index + 1)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    color: '#FFFFFF',
                    letterSpacing: '0.3em',
                  }}
                >
                  {score.playerName}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Box className="led-display" sx={{ display: 'inline-block', px: 2 }}>
                  {score.score.toString().padStart(6, '0')}
                </Box>
              </TableCell>
              {!difficulty && (
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.6rem', sm: '0.75rem' },
                      color: '#00FFFF',
                    }}
                  >
                    {score.difficulty}
                  </Typography>
                </TableCell>
              )}
              <TableCell align="center">
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.5rem', sm: '0.65rem' },
                    color: '#B0B0B0',
                  }}
                >
                  {score.date}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LeaderboardTable;
