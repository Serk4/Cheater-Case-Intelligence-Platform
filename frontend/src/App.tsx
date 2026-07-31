import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseView from './pages/CaseView';
import ReportIntake from './pages/ReportIntake';
import NewCase from './pages/NewCase';
import LoginPage from './pages/Login';

const drawerWidth = 260;
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap>
            Cheater Case Intelligence Platform
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {user && (
              <>
                <Avatar sx={{ width: 28, height: 28, fontSize: 13, bgcolor: 'primary.dark' }}>
                  {user.displayName?.[0] ?? user.email[0]}
                </Avatar>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {user.displayName ?? user.email}
                </Typography>
                <Chip label={user.role} size="small" sx={{ opacity: 0.75 }} />
                <Tooltip title="Sign out">
                  <IconButton color="inherit" size="small" onClick={() => { logout(); navigate('/login'); }}>
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItemButton onClick={() => navigate('/')}>
              <ListItemText primary="Dashboard" />
            </ListItemButton>

            <ListItemButton onClick={() => navigate('/cases')}>
              <ListItemText primary="Cases" />
            </ListItemButton>

            <ListItemButton onClick={() => navigate('/reports')}>
              <ListItemText primary="Report Intake" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />

        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/cases" element={<ProtectedRoute><Cases /></ProtectedRoute>} />
          <Route path="/cases/new" element={<ProtectedRoute><NewCase /></ProtectedRoute>} />
          <Route path="/cases/:id" element={<ProtectedRoute><CaseView /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportIntake /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<Layout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
