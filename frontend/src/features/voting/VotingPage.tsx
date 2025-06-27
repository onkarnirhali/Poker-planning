// src/features/voting/VotingPage.tsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import VotingCard from './VotingCard';
import { useGetStoriesQuery } from '../../api/storiesApi';
import { useSocket } from '../../hooks/useSocket';

const CARD_VALUES = ['1', '2', '3', '5', '8', '13', '20', '?'];

export default function VotingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const socket = useSocket(sessionId!);

  // Data and UI state
  const { data: stories, isLoading, error } = useGetStoriesQuery(sessionId!);
  const currentStory = stories && stories[0];
  const [selected, setSelected] = React.useState<string | null>(null);
  const [reveal, setReveal] = React.useState(false);

  // Real-time state
  const [participants, setParticipants] = React.useState<string[]>([]);
  const [votedUsers, setVotedUsers] = React.useState<Set<string>>(new Set());
  const [allVotes, setAllVotes] = React.useState<{ userId: string; value: string }[]>([]);

  // 1) Join the session room
  useEffect(() => {
    if (socket && sessionId) {
      socket.emit('join_session', { sessionId });
    }
  }, [socket, sessionId]);

  // 2) When someone joins
  useEffect(() => {
    if (!socket) return;
    socket.on('participant_joined', ({ userId }) => {
      setParticipants((prev) => prev.includes(userId) ? prev : [...prev, userId]);
    });
    return () => { socket.off('participant_joined'); };
  }, [socket]);

  // 3) When someone votes
  useEffect(() => {
    if (!socket || !currentStory) return;
    socket.on('participant_voted', ({ userId, storyId }) => {
      if (storyId === currentStory.id) {
        setVotedUsers((prev) => new Set(prev).add(userId));
      }
    });
    return () => { socket.off('participant_voted'); };
  }, [socket, currentStory]);

  // 4) When votes are revealed
  useEffect(() => {
    if (!socket || !currentStory) return;
    socket.on('votes_revealed', ({ votes, storyId }) => {
      if (storyId === currentStory.id) {
        setAllVotes(votes);
        setReveal(true);
      }
    });
    return () => { socket.off('votes_revealed'); };
  }, [socket, currentStory]);

  // 5) When votes are cleared for a revote
  useEffect(() => {
    if (!socket || !currentStory) return;
    socket.on('votes_cleared', ({ storyId }) => {
      if (storyId === currentStory.id) {
        setReveal(false);
        setSelected(null);
        setVotedUsers(new Set());
        setAllVotes([]);
      }
    });
    return () => { socket.off('votes_cleared'); };
  }, [socket, currentStory]);

  const handleSelect = (value: string) => {
    if (!currentStory || !socket) return;
    setSelected(value);
    socket.emit('vote_submit', {
      sessionId,
      storyId: currentStory.id,
      value,
    });
    // Optionally mark “me” as voted; real userId tracked on server
    setVotedUsers((prev) => new Set(prev).add('me'));
  };

  const handleReveal = () => {
    if (!currentStory || !socket) return;
    socket.emit('reveal_votes', {
      sessionId,
      storyId: currentStory.id,
    });
    // Local flip in case server echo is delayed
    setReveal(true);
  };

  if (!sessionId) return <Alert severity="error">No session ID provided.</Alert>;
  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Failed to load stories.</Alert>;
  if (!currentStory) return <Alert severity="info">No stories to vote on.</Alert>;

  return (
    <Container>
      {/* Header */}
      <Box my={2}>
        <Typography variant="h4">{currentStory.title}</Typography>
        {currentStory.description && (
          <Typography color="text.secondary">{currentStory.description}</Typography>
        )}
      </Box>

      {/* Participant & vote status */}
      <Box mb={2}>
        <Typography variant="subtitle1">Participants ({participants.length}):</Typography>
        <List dense>
          {participants.map((uid) => (
            <ListItem key={uid}>
              <ListItemText
                primary={uid === 'me' ? 'You' : uid}
                secondary={votedUsers.has(uid) ? 'Voted' : 'Not voted'}
              />
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>

      {/* Voting cards */}
      <Grid container spacing={2}>
        {CARD_VALUES.map((value) => (
          <Grid item key={value} xs={4} sm={3} md={2}>
            <VotingCard
              value={value}
              isSelected={selected === value}
              onSelect={handleSelect}
              reveal={reveal}
            />
          </Grid>
        ))}
      </Grid>

      {/* Footer controls */}
      <Box mt={4} display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          disabled={!selected || reveal}
          onClick={() => setSelected(null)}
        >
          Clear
        </Button>
        <Button
          variant="contained"
          disabled={reveal}
          onClick={handleReveal}
        >
          Reveal
        </Button>
      </Box>

      {/* Revealed vote results */}
      {reveal && (
        <Box mt={4}>
          <Typography variant="h6">Vote Results</Typography>
          <List>
            {allVotes.map(({ userId, value }) => (
              <ListItem key={userId}>
                <ListItemText primary={`${userId === 'me' ? 'You' : userId}`} secondary={value} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Container>
  );
}