import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Tooltip,
  Button,
  TextField,
  CircularProgress,
  IconButton,
} from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

interface NoteRecord {
  id: string;
  body: string;
  isPinned: boolean;
  visibility: 'INTERNAL' | 'RESTRICTED';
  createdAt: string;
  author?: { displayName: string | null } | null;
}

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('ccip_token') ?? ''}` };
}

export default function NotesPanel({ caseId }: { caseId: string }) {
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState('');

  const { data: notes = [], isLoading } = useQuery<NoteRecord[]>({
    queryKey: ['case-notes', caseId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/cases/${caseId}/notes`, { headers: authHeaders() });
      return res.json();
    },
  });

  const { mutate: addNote, isPending } = useMutation({
    mutationFn: async (body: string) => {
      await fetch(`${API_BASE}/cases/${caseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ body, visibility: 'INTERNAL' }),
      });
    },
    onSuccess: () => {
      setNoteText('');
      queryClient.invalidateQueries({ queryKey: ['case-notes', caseId] });
    },
  });

  const { mutate: deleteNote } = useMutation({
    mutationFn: async (noteId: string) => {
      await fetch(`${API_BASE}/cases/notes/${noteId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['case-notes', caseId] }),
  });

  const sorted = [...notes].sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Notes
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="Add a note..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          disabled={isPending}
        />
        <Button
          variant="contained"
          onClick={() => noteText.trim() && addNote(noteText)}
          disabled={isPending || !noteText.trim()}
        >
          {isPending ? <CircularProgress size={20} /> : 'Add'}
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {isLoading ? (
        <CircularProgress size={24} />
      ) : sorted.length === 0 ? (
        <Typography color="text.secondary">No notes yet.</Typography>
      ) : (
        sorted.map((note) => (
          <Paper key={note.id} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2">
                {note.author?.displayName ?? 'Unknown'} •{' '}
                {new Date(note.createdAt).toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
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
                <Tooltip title="Delete note">
                  <IconButton size="small" onClick={() => deleteNote(note.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Typography sx={{ mt: 1 }}>{note.body}</Typography>
          </Paper>
        ))
      )}
    </Paper>
  );
}
