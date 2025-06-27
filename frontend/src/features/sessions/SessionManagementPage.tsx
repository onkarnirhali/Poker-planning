import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useGetStoriesQuery } from '../../api/storiesApi';
import AddStoryDialog from '../stories/AddStoryDialog';

export default function SessionManagementPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data: stories, isLoading, error } = useGetStoriesQuery(sessionId!);
  const [openAddModal, setOpenAddModal] = React.useState(false);

  if (!sessionId) {
    return <Alert severity="error">No session ID provided</Alert>;
  }
  if (isLoading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">Error loading stories.</Alert>;
  }

  return (
    <Container maxWidth="lg">
      {/* Header + Action Buttons */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
      >
        <Typography variant="h4" fontWeight={600} mb={{ xs: 2, md: 0 }}>
          Session {sessionId} — Stories
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => setOpenAddModal(true)}
            sx={{ mr: 2 }}
          >
            + Add Story
          </Button>
          <Button
            variant="contained"
            component={RouterLink}
            to={`/sessions/${sessionId}/vote`}
            disabled={!stories || stories.length === 0}
          >
            Start Voting
          </Button>
        </Box>
      </Box>

      {/* Responsive Card Grid of Stories */}
      <Grid container spacing={2}>
        {stories?.map((story) => (
          <Grid item key={story.id} xs={12} sm={6} md={4} lg={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" noWrap>
                  {story.title}
                </Typography>
                {story.description && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {story.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Story Modal */}
      <AddStoryDialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        sessionId={sessionId}
      />
    </Container>
  );
}