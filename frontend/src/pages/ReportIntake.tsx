import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
  Divider,
} from '@mui/material';
import { apiClient } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { CaseSummary } from '../api/types/case';

const reportSchema = z.object({
  caseId: z.string().min(1, 'Please select a case'),
  summary: z.string().min(5, 'Summary must be at least 5 characters'),
  detail: z.string().optional(),
  incidentAt: z.string().optional(),
});

type ReportForm = z.infer<typeof reportSchema>;

export default function ReportIntake() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ReportForm>({
    caseId: '',
    summary: '',
    detail: '',
    incidentAt: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successOpen, setSuccessOpen] = useState(false);

  const { data: cases = [], isLoading: casesLoading } = useQuery<CaseSummary[]>({
    queryKey: ['cases'],
    queryFn: () => apiClient.cases.list(),
  });

  const activeCases = cases.filter((c) =>
    ['OPEN', 'UNDER_REVIEW', 'PENDING_EVIDENCE', 'ESCALATED'].includes(c.status),
  );

  const { mutate: submitReport, isPending, error: submitError } = useMutation({
    mutationFn: async (data: ReportForm) => {
      if (!user) throw new Error('Not authenticated');
      return apiClient.reports.ingest({
        caseId: data.caseId,
        reportedById: user.id,
        summary: data.summary,
        detail: data.detail || undefined,
        incidentAt: data.incidentAt || undefined,
      });
    },
    onSuccess: () => {
      setForm({ caseId: '', summary: '', detail: '', incidentAt: '' });
      setSuccessOpen(true);
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });

  function handleChange(field: keyof ReportForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const result = reportSchema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err: z.ZodIssue) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    submitReport(form);
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Report Intake
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Submit a new report against an existing case. If AI triage is enabled, the
        case will be automatically analyzed after submission.
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 680 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(submitError as Error).message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            select
            fullWidth
            label="Case"
            value={form.caseId}
            onChange={(e) => handleChange('caseId', e.target.value)}
            error={!!fieldErrors.caseId}
            helperText={fieldErrors.caseId ?? 'Select the case to attach this report to'}
            sx={{ mb: 2 }}
            disabled={casesLoading}
          >
            {activeCases.length === 0 ? (
              <MenuItem disabled value="">
                No active cases found
              </MenuItem>
            ) : (
              activeCases.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.caseNumber}{c.title ? ` — ${c.title}` : ''}
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            fullWidth
            label="Summary"
            placeholder="Brief description of the incident"
            value={form.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            error={!!fieldErrors.summary}
            helperText={fieldErrors.summary}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Detail"
            placeholder="Provide as much detail as possible: what happened, when, game mode, map, etc."
            value={form.detail}
            onChange={(e) => handleChange('detail', e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Incident Date/Time"
            type="datetime-local"
            value={form.incidentAt}
            onChange={(e) => handleChange('incidentAt', e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="When did the incident occur?"
            sx={{ mb: 3 }}
          />

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending || casesLoading}
              startIcon={isPending ? <CircularProgress size={16} /> : undefined}
            >
              {isPending ? 'Submitting…' : 'Submit Report'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setForm({ caseId: '', summary: '', detail: '', incidentAt: '' })}
              disabled={isPending}
            >
              Clear
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessOpen(false)}
        message="Report submitted successfully"
      />
    </>
  );
}
