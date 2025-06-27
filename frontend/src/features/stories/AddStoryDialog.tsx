import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import NewStoryForm from './NewStoryForm';

interface AddStoryDialogProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
}

export default function AddStoryDialog({
  open,
  onClose,
  sessionId,
}: AddStoryDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add a New Story</DialogTitle>
      <DialogContent dividers>
        {/* onSuccess will close the dialog when the story is added */}
        <NewStoryForm sessionId={sessionId} onSuccess={onClose} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}