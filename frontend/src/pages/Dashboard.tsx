import { Box, Typography, Button } from '@mui/material';

// TODO: fetch open cases and recent reports from API
// TODO: add summary stat cards (open cases, pending reports, high-risk flags)
// TODO: add recent-activity feed
// TODO: add data table or card list for cases

function Dashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* TODO: replace with real stat cards */}
      <Typography color="text.secondary">
        Summary statistics will appear here.
      </Typography>

      {/* TODO: replace with real cases list */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Recent Cases</Typography>
        <Typography color="text.secondary">No cases loaded yet.</Typography>
      </Box>

      {/* TODO: link to report intake */}
      <Box sx={{ mt: 3 }}>
        <Button variant="contained" href="/report">
          Submit New Report
        </Button>
      </Box>
    </Box>
  );
}

export default Dashboard;
