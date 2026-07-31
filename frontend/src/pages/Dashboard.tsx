import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { apiClient } from '../api/client';
import type { CaseSummary } from '../api/types/case';
import { renderCaseStatus, renderCasePriority } from '../utils/enums';
import { useAuth } from '../auth/AuthContext';

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ color, fontSize: 40, lineHeight: 1 }}>{icon}</Box>
      <Box>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: cases = [],
    isLoading,
    error,
  } = useQuery<CaseSummary[]>({
    queryKey: ['cases'],
    queryFn: () => apiClient.cases.list(),
  });

  const stats = {
    total: cases.length,
    open: cases.filter((c) => c.status === 'OPEN').length,
    underReview: cases.filter((c) => c.status === 'UNDER_REVIEW').length,
    escalated: cases.filter((c) => c.status === 'ESCALATED').length,
    pendingEvidence: cases.filter((c) => c.status === 'PENDING_EVIDENCE').length,
  };

  // Triage queue: open + under review, sorted by priority then date
  const priorityOrder: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  const triageQueue = cases
    .filter((c) => ['OPEN', 'UNDER_REVIEW', 'ESCALATED', 'PENDING_EVIDENCE'].includes(c.status))
    .sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 9;
      const pb = priorityOrder[b.priority] ?? 9;
      if (pa !== pb) return pa - pb;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    })
    .slice(0, 20);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load dashboard data.
      </Alert>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Dashboard
        </Typography>
        {user && (
          <Typography variant="body2" color="text.secondary">
            Welcome back, {user.displayName ?? user.email}
          </Typography>
        )}
      </Box>

      {/* â”€â”€ Stats Cards â”€â”€ */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AssignmentIcon fontSize="inherit" />}
            label="Total Cases"
            value={stats.total}
            color="#90caf9"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<HourglassEmptyIcon fontSize="inherit" />}
            label="Open"
            value={stats.open}
            color="#ffb74d"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ErrorOutlineIcon fontSize="inherit" />}
            label="Escalated"
            value={stats.escalated}
            color="#ef5350"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            label="Under Review"
            value={stats.underReview}
            color="#66bb6a"
          />
        </Grid>
      </Grid>

      {/* â”€â”€ Triage Queue â”€â”€ */}
      <Typography variant="h6" gutterBottom>
        Triage Queue
      </Typography>
      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Case</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>AI Score</TableCell>
              <TableCell>Created</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {triageQueue.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No active cases in the queue.
                </TableCell>
              </TableRow>
            ) : (
              triageQueue.map((c) => (
                <TableRow
                  key={c.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/cases/${c.id}`)}
                >
                  <TableCell>
                    <Typography fontWeight="bold" variant="body2">
                      {c.caseNumber}
                    </Typography>
                    {c.title && (
                      <Typography variant="caption" color="text.secondary">
                        {c.title}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>{renderCasePriority(c.priority)}</TableCell>
                  <TableCell>{renderCaseStatus(c.status)}</TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {c.assignedTo?.displayName ?? 'â€”'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {c.aiAnalysis ? (
                      <Tooltip
                        title={
                          c.aiAnalysis.suggestedViolationType
                            ? `Suggested: ${c.aiAnalysis.suggestedViolationType}`
                            : 'AI analyzed'
                        }
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
                          <PsychologyIcon sx={{ fontSize: 16, color: '#90caf9' }} />
                          <Box sx={{ flexGrow: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={c.aiAnalysis.confidence * 100}
                              sx={{ height: 6, borderRadius: 3 }}
                              color={
                                c.aiAnalysis.confidence >= 0.7
                                  ? 'error'
                                  : c.aiAnalysis.confidence >= 0.4
                                  ? 'warning'
                                  : 'primary'
                              }
                            />
                          </Box>
                          <Typography variant="caption" sx={{ minWidth: 32 }}>
                            {Math.round(c.aiAnalysis.confidence * 100)}%
                          </Typography>
                        </Box>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        â€”
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="caption">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <ChevronRightIcon color="action" fontSize="small" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}

