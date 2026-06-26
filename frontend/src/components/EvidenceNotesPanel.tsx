import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Button,
  TextField,
} from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import LockIcon from '@mui/icons-material/Lock';

interface Note {
  id: string;
  body: string;
  author: {
    displayName: string;
    role: string;
  };
  createdAt: string;
  isPinned: boolean;
  visibility: 'INTERNAL' | 'RESTRICTED';
}

export default function EvidenceNotesPanel({
  caseId,
  evidenceId,
}: {
  caseId?: string;
  evidenceId?: string;
}) {
  if(!caseId || !evidenceId) {
    return <Typography>No evidence selected.</Typography>;
  }
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    setLoading(true);
    const res = await fetch(
      `http://localhost:3000/cases/${caseId}/evidence/${evidenceId}/notes`
    );
    const data = await res.json();
    setNotes(Array.isArray(data) ? data : data.notes ?? []);
    setLoading(false);
  }

  async function createNote() {
    if (!noteText.trim()) return;

    await fetch(
      `http://localhost:3000/cases/${caseId}/evidence/${evidenceId}/notes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: noteText,
          visibility: 'INTERNAL',
        }),
      }
    );

    setNoteText('');
    loadNotes();
  }

  useEffect(() => {
    if (evidenceId) loadNotes();
  }, [evidenceId]);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Evidence Notes
      </Typography>

      {/* New Note Input */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="Add a note about this evidence..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        <Button variant="contained" onClick={createNote}>
          Add
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Notes List */}
      {loading ? (
        <Typography>Loading notes...</Typography>
      ) : notes.length === 0 ? (
        <Typography>No notes for this evidence.</Typography>
      ) : (
        notes
          .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
          .map((note) => (
            <Paper key={note.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">
                  {note.author.displayName} •{' '}
                  {new Date(note.createdAt).toLocaleString()}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {note.isPinned && (
                    <Tooltip title="Pinned">
                      <PushPinIcon fontSize="small" />
                    </Tooltip>
                  )}

                  {note.visibility === 'RESTRICTED' && (
                    <Tooltip title="Restricted">
                      <LockIcon fontSize="small" />
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Typography sx={{ mt: 1 }}>{note.body}</Typography>
            </Paper>
          ))
      )}
    </Paper>
  );
}
