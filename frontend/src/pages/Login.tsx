import { useState } from 'react';
import { z } from 'zod';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiClient } from '../api/client';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signupSchema = loginSchema.extend({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const schema = tab === 0 ? loginSchema : signupSchema;
    const data = tab === 0 ? { email, password } : { email, password, displayName };
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors: Record<string, string> = {};
        result.error.issues.forEach((err: z.ZodIssue) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const resp =
        tab === 0
          ? await apiClient.auth.login(email, password)
          : await apiClient.auth.signup(email, password, displayName);

      login(resp.access_token, resp.user);
      navigate('/');
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 420 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom align="center">
          Cheater Case Intelligence Platform
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
          <Tab label="Sign In" />
          <Tab label="Create Account" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {tab === 1 && (
            <TextField
              fullWidth
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              error={!!fieldErrors.displayName}
              helperText={fieldErrors.displayName}
              sx={{ mb: 2 }}
              autoComplete="name"
            />
          )}

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            sx={{ mb: 2 }}
            autoComplete="email"
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
            sx={{ mb: 3 }}
            autoComplete={tab === 0 ? 'current-password' : 'new-password'}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : tab === 0 ? 'Sign In' : 'Create Account'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
