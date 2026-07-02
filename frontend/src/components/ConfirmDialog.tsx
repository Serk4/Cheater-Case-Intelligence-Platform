import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle sx={{ bgcolor: '#222', color: '#fff', fontWeight: 600 }}>
        {title}
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: '#1e1e1e', color: '#fff' }}>
        <Typography variant="body1">{message}</Typography>
      </DialogContent>

      <DialogActions sx={{ bgcolor: '#1e1e1e' }}>
        <Button sx={{ color: '#aaa' }} onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onConfirm}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
