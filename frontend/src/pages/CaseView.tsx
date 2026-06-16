import { Box, Typography, Chip } from '@mui/material';
import { useParams } from 'react-router-dom';

// TODO: fetch case details, evidence, and linked reports by ID
// TODO: add evidence viewer (screenshots, video player, log viewer)
// TODO: add AI analysis panel (verdict, confidence, risk score)
// TODO: add case status controls (open → investigating → closed)
// TODO: add timeline / audit log

function CaseView() {
  const { id } = useParams<{ id: string }>();

  // TODO: replace with real API call
  const caseData = {
    id,
    status: 'open',
    targetPlayer: 'placeholder_player',
    riskScore: 0,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Case #{caseData.id}
      </Typography>

      <Chip label={caseData.status} sx={{ mb: 2 }} />

      {/* TODO: replace with real evidence list */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Evidence</Typography>
        <Typography color="text.secondary">No evidence loaded yet.</Typography>
      </Box>

      {/* TODO: replace with real AI analysis output */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">AI Analysis</Typography>
        <Typography color="text.secondary">
          AI verdict pending implementation.
        </Typography>
      </Box>
    </Box>
  );
}

export default CaseView;
