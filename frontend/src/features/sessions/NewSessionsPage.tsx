// src/features/sessions/NewSessionPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { useCreateSessionMutation } from '../../api/sessionApi';

export default function NewSessionPage() {
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [deckType, setDeckType] = React.useState('fibonacci');
  const [timer, setTimer] = React.useState(60);
  const [password, setPassword] = React.useState('');

  const [createSession, { isLoading, error }] = useCreateSessionMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id: newId } = await createSession({
        name,
        deckType,
        timer,
        password,
      }).unwrap();
      navigate(`/sessions/${newId}`);
    } catch {
      // error state is shown below
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Create New Session
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {error && <Alert severity="error">Failed to create session.</Alert>}

        <TextField
          label="Session Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <TextField
          select
          label="Deck Type"
          value={deckType}
          onChange={(e) => setDeckType(e.target.value)}
          required
        >
          <MenuItem value="fibonacci">Fibonacci</MenuItem>
          <MenuItem value="tshirt">T-Shirt Sizes</MenuItem>
          <MenuItem value="custom">Custom</MenuItem>
        </TextField>

        <TextField
          type="number"
          label="Timer (seconds)"
          value={timer}
          onChange={(e) => setTimer(Number(e.target.value))}
          required
        />

        <TextField
          label="Password (optional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" variant="contained" disabled={isLoading}>
          Create
        </Button>
      </Box>
    </Container>
  );
}