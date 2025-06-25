// src/features/sessions/SessionsPage.tsx
import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useGetSessionsQuery } from '../../api/sessionApi';
import { useGetStoriesQuery } from '../../api/storiesApi';
import StoryList from '../stories/StoryList';
import NewStoryForm from '../stories/NewStoryForm';

export default function SessionsPage() {
  const { data: sessions, error, isLoading } = useGetSessionsQuery();

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
        <Typography variant="h4">Sessions</Typography>
        <Button variant="contained" component={RouterLink} to="/sessions/new">
          Create New Session
        </Button>
      </Box>

      {isLoading && <CircularProgress />}
      {error && <Alert severity="error">Error loading sessions.</Alert>}

      {sessions && (
        <Grid container spacing={2} mt={2}>
          {sessions.map((session) => (
            <Grid item key={session.id} xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{session.name}</Typography>
                  <Typography variant="body2">Deck: {session.deckType}</Typography>
                  <Typography variant="body2">Timer: {session.timer}s</Typography>
                  {session.password && (
                    <Typography variant="body2">🔒 Password Protected</Typography>
                  )}
                  <Button
                    component={RouterLink}
                    to={`/sessions/${session.id}`}
                    size="small">
                    Join
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}