import { Box, Typography, TextField, Button, MenuItem } from '@mui/material';
import { useState } from 'react';

// TODO: add form validation (react-hook-form / zod)
// TODO: add file upload for evidence attachments
// TODO: submit to POST /api/reports
// TODO: show success / error feedback

const EVIDENCE_TYPES = ['screenshot', 'video', 'log', 'other'];

function ReportIntake() {
  const [form, setForm] = useState({
    reportedBy: '',
    targetPlayer: '',
    description: '',
    evidenceType: 'screenshot',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // TODO: replace with real API submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('TODO: submit report', form);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h4" gutterBottom>
        Submit a Cheat Report
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Your Username"
          name="reportedBy"
          value={form.reportedBy}
          onChange={handleChange}
          required
        />

        <TextField
          label="Reported Player"
          name="targetPlayer"
          value={form.targetPlayer}
          onChange={handleChange}
          required
        />

        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          multiline
          rows={4}
          required
        />

        <TextField
          select
          label="Evidence Type"
          name="evidenceType"
          value={form.evidenceType}
          onChange={handleChange}
        >
          {EVIDENCE_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        {/* TODO: add file upload input */}

        <Button type="submit" variant="contained">
          Submit Report
        </Button>
      </Box>
    </Box>
  );
}

export default ReportIntake;
