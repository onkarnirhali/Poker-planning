// src/features/sessions/SessionManagementPage.tsx - UPDATED VERSION
import React, { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Groups,
  Schedule,
  Casino,
  Storage,
  ContentCopy,
  PlayArrow,
  Settings,
} from '@mui/icons-material';
import { useGetStoriesQuery } from '../../api/storiesApi';
import { useGetSessionsQuery } from '../../api/sessionApi'; // We'll need to add getSession endpoint
import AddStoryDialog from '../stories/AddStoryDialog';
import styles from './SessionManagementPage.module.css';

// Mock participants data (we'll replace with real data later)
const mockParticipants = [
  { id: '1', name: 'John Doe', role: 'Facilitator', isOnline: true },
  { id: '2', name: 'Sarah Miller', role: 'Developer', isOnline: true },
  { id: '3', name: 'Mike Johnson', role: 'Product Manager', isOnline: true },
  { id: '4', name: 'Anna Lee', role: 'Designer', isOnline: false },
  { id: '5', name: 'Robert Taylor', role: 'QA Engineer', isOnline: true },
];

export default function SessionManagementPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  // API queries
  const { data: stories, isLoading: storiesLoading, error: storiesError } = useGetStoriesQuery(sessionId!);
  
  // Local state
  const [openAddModal, setOpenAddModal] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Mock session data (replace with real API call)
  const sessionData = {
    id: sessionId,
    name: 'Sprint 23 Planning Session',
    deckType: 'Fibonacci',
    timerDuration: 300, // 5 minutes
    maxParticipants: 10,
    createdAt: new Date().toISOString(),
  };

  // Generate session code from ID (first 6 chars)
  const sessionCode = sessionId?.split('-')[0]?.toUpperCase().slice(0, 6) || 'ABC123';

  // Handle copy session code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy session code');
    }
  };

  // Handle story actions
  const handleEditStory = (storyId: string) => {
    console.log('Edit story:', storyId);
    // TODO: Implement edit story functionality
  };

  const handleDeleteStory = (storyId: string) => {
    console.log('Delete story:', storyId);
    // TODO: Implement delete story functionality
  };

  // Error state
  if (!sessionId) {
    return (
      <Container className={styles.container}>
        <Alert severity="error" className={styles.errorAlert}>
          No session ID provided
        </Alert>
      </Container>
    );
  }

  // Loading state
  if (storiesLoading) {
    return (
      <Container className={styles.container}>
        <Box className={styles.loadingContainer}>
          <CircularProgress size={60} className={styles.loadingSpinner} />
          <Typography variant="h6" color="textSecondary">
            Loading session...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error state
  if (storiesError) {
    return (
      <Container className={styles.container}>
        <Box className={styles.errorContainer}>
          <Alert severity="error" className={styles.errorAlert}>
            Failed to load session data. Please try again.
          </Alert>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            className={styles.secondaryButton}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      {/* Header Section */}
      <Box className={styles.header}>
        <Box className={styles.headerContent}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            className={styles.backButton}
          >
            Back to Dashboard
          </Button>
          
          <Typography variant="h4" className={styles.sessionTitle}>
            {sessionData.name}
          </Typography>
          
          <Typography variant="body1" className={styles.sessionSubtitle}>
            Manage stories and participants for your planning session
          </Typography>
          
          {/* Session Info Stats */}
          <Box className={styles.sessionInfo}>
            <Box className={styles.sessionStat}>
              <Storage />
              <span>{stories?.length || 0} Stories</span>
            </Box>
            <Box className={styles.sessionStat}>
              <Groups />
              <span>{mockParticipants.length} Participants</span>
            </Box>
            <Box className={styles.sessionStat}>
              <Schedule />
              <span>{Math.floor(sessionData.timerDuration / 60)} min timer</span>
            </Box>
            <Box className={styles.sessionStat}>
              <Casino />
              <span>{sessionData.deckType} deck</span>
            </Box>
          </Box>
          
          {/* Session Code */}
          <Box className={styles.sessionCode}>
            <span className={styles.codeLabel}>Session Code:</span>
            <span className={styles.codeValue}>{sessionCode}</span>
            <Tooltip title={codeCopied ? 'Copied!' : 'Copy code'}>
              <IconButton 
                onClick={handleCopyCode}
                className={styles.copyButton}
                size="small"
              >
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Grid container className={styles.contentGrid}>
        {/* Stories Section */}
        <Grid item xs={12} md={8}>
          <Card className={styles.storiesSection}>
            {/* Stories Header */}
            <Box className={styles.sectionHeader}>
              <Typography variant="h6" className={styles.sectionTitle}>
                <Storage className={styles.sectionIcon} />
                Stories to Estimate
              </Typography>
              <Button
                startIcon={<Add />}
                onClick={() => setOpenAddModal(true)}
                className={styles.addStoryButton}
              >
                Add Story
              </Button>
            </Box>
            
            {/* Stories Content */}
            <Box className={styles.storiesContainer}>
              {stories && stories.length > 0 ? (
                <Grid container spacing={2} className={styles.storiesGrid}>
                  {stories.map((story) => (
                    <Grid item xs={12} sm={6} lg={4} key={story.id}>
                      <Card className={styles.storyCard}>
                        <CardContent className={styles.storyCardContent}>
                          {/* Story Header */}
                          <Box className={styles.storyHeader}>
                            <Typography 
                              variant="h6" 
                              className={styles.storyTitle}
                              title={story.title}
                            >
                              {story.title}
                            </Typography>
                            <Chip 
                              label="?" 
                              size="small"
                              className={`${styles.storyPoints} ${styles.unestimated}`}
                            />
                          </Box>
                          
                          {/* Story Description */}
                          {story.description && (
                            <Typography 
                              variant="body2" 
                              className={styles.storyDescription}
                              title={story.description}
                            >
                              {story.description}
                            </Typography>
                          )}
                          
                          {/* Story Actions */}
                          <Box className={styles.storyActions}>
                            <Button
                              size="small"
                              onClick={() => handleEditStory(story.id)}
                              className={`${styles.actionButton} ${styles.editButton}`}
                              startIcon={<Edit />}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              onClick={() => handleDeleteStory(story.id)}
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              startIcon={<Delete />}
                            >
                              Delete
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                /* Empty State */
                <Box className={styles.emptyStories}>
                  <Storage className={styles.emptyIcon} />
                  <Typography variant="h6" className={styles.emptyTitle}>
                    No Stories Yet
                  </Typography>
                  <Typography variant="body2" className={styles.emptyDescription}>
                    Add your first story to start planning your sprint
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setOpenAddModal(true)}
                    className={styles.emptyActionButton}
                    startIcon={<Add />}
                  >
                    Add Your First Story
                  </Button>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Participants Section */}
        <Grid item xs={12} md={4}>
          <Card className={styles.participantsSection}>
            {/* Participants Header */}
            <Box className={styles.sectionHeader}>
              <Typography variant="h6" className={styles.sectionTitle}>
                <Groups className={styles.sectionIcon} />
                Participants
              </Typography>
            </Box>
            
            {/* Participants List */}
            <Box className={styles.participantsContainer}>
              {mockParticipants.length > 0 ? (
                <Box className={styles.participantsList}>
                  {mockParticipants.map((participant) => (
                    <Box key={participant.id} className={styles.participantItem}>
                      <Avatar className={styles.participantAvatar}>
                        {participant.name.split(' ').map(n => n.charAt(0)).join('')}
                      </Avatar>
                      <Box className={styles.participantInfo}>
                        <Typography variant="body2" className={styles.participantName}>
                          {participant.name}
                          {participant.id === '1' && ' (You)'}
                        </Typography>
                        <Typography variant="caption" className={styles.participantRole}>
                          {participant.role}
                        </Typography>
                      </Box>
                      <Box 
                        className={`${styles.participantStatus} ${
                          !participant.isOnline ? styles.offline : ''
                        }`}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box className={styles.emptyParticipants}>
                  <Typography variant="body2">
                    No participants yet. Share the session code to invite your team.
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box className={styles.actionButtons}>
        <Button
          variant="outlined"
          startIcon={<Settings />}
          className={styles.secondaryButton}
          onClick={() => console.log('Open session settings')}
        >
          Session Settings
        </Button>
        
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          className={styles.startVotingButton}
          component={RouterLink}
          to={`/sessions/${sessionId}/vote`}
          disabled={!stories || stories.length === 0}
        >
          Start Voting Session
        </Button>
      </Box>

      {/* Add Story Modal */}
      <AddStoryDialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        sessionId={sessionId}
      />
    </Container>
  );
}