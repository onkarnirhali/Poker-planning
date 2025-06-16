import React from 'react';
import { Container, Typography } from '@mui/material';

export default function HomePage() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Welcome to Poker Planning
      </Typography>
      <Typography>
        Use the sidebar or navigation to create and join your planning sessions.
      </Typography>
    </Container>
  );
}