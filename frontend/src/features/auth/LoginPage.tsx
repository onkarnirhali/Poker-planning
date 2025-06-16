import React from 'react';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useLoginMutation } from './authApi';
import { useAppDispatch } from '../../hooks/hooks';
import { setCredentials } from './authSlice';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [login, { isLoading, error }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user, accessToken } = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user, token: accessToken }));
      localStorage.setItem('token', accessToken);
      navigate('/sessions');
    } catch {
      // error state is shown below
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" gutterBottom>
        Log In
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <Alert severity="error">Login failed</Alert>}
        <TextField
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <TextField
          type="password"
          label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" disabled={isLoading}>
          Log In
        </Button>
      </Box>
    </Container>
  );
}