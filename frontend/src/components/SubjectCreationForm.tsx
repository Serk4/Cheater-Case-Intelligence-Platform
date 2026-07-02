import { Box, TextField, Button } from '@mui/material';

interface Props {
  displayName: string;
  externalId: string;
  profileUrl: string;
  platformName: string;

  setDisplayName: (v: string) => void;
  setExternalId: (v: string) => void;
  setProfileUrl: (v: string) => void;

  onSubmit: () => void;
}

export default function SubjectCreationForm({
  displayName,
  externalId,
  profileUrl,
  platformName,
  setDisplayName,
  setExternalId,
  setProfileUrl,
  onSubmit,
}: Props) {
  return (
    <Box sx={{ mt: 2, p: 2, border: '1px solid #444', borderRadius: 2 }}>
      <TextField
        label="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="External ID (optional)"
        value={externalId}
        onChange={(e) => setExternalId(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Profile URL (optional)"
        value={profileUrl}
        onChange={(e) => setProfileUrl(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Platform"
        value={platformName}
        fullWidth
        disabled
        sx={{ mb: 2 }}
      />

      <Button variant="contained" onClick={onSubmit}>
        Create Subject
      </Button>
    </Box>
  );
}
