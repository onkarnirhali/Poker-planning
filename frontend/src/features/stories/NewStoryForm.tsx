import React from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import { useAddStoryMutation } from '../../api/storiesApi';

interface NewStoryFormProps {
  sessionId: string;
  onSuccess?: () => void;
}

export default function NewStoryForm({
  sessionId,
  onSuccess,
}: NewStoryFormProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [addStory, { isLoading, error }] = useAddStoryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStory({ sessionId, title, description }).unwrap();
      setTitle('');
      setDescription('');
      if (onSuccess) onSuccess();
    } catch {
      // error shown via Alert
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
    >
      {error && <Alert severity="error">Failed to add story.</Alert>}
      <TextField
        label="Story Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={3}
      />
      <Button type="submit" variant="contained" disabled={isLoading}>
        Add Story
      </Button>
    </Box>
  );
}