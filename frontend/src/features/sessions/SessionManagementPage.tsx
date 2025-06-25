// src/features/sessions/SessionPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { useGetStoriesQuery } from '../../api/storiesApi';
import StoryList from '../stories/StoryList';
import NewStoryForm from '../stories/NewStoryForm';

export default function SessionManagementPage() {
  // 1. Read the ID from the URL
  const { sessionId } = useParams<{ sessionId: string }>();
  if (!sessionId) {
    return <Alert severity="error">No session ID provided</Alert>;
  }

  // 2. Fetch stories for this session
  const { data: stories, isLoading, error } = useGetStoriesQuery(sessionId);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Session {sessionId} — Stories
      </Typography>

      {isLoading && <CircularProgress />}
      {error && <Alert severity="error">Error loading stories.</Alert>}

      {stories && <StoryList stories={stories} />}

      <Box mt={4}>
        <Typography variant="h6">Add a New Story</Typography>
        <NewStoryForm sessionId={sessionId} />
      </Box>
    </Container>
  );
}