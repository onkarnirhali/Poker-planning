import React from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import { useAddStoryMutation } from '../../api/storiesApi';


interface Props { sessionId: string; }

export default function NewStoryForm({ sessionId }: Props) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [addStory, { isLoading, error }] = useAddStoryMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStory({ sessionId, title, description }).unwrap();
      setTitle(''); setDescription('');
    } catch {
        console.error('Failed to add story');
      /* error shown below */
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">Could not add story.</Alert>}
      <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} multiline rows={3} />
      <Button type="submit" variant="contained" disabled={isLoading}>
        Add Story
      </Button>
    </Box>
  );
}