import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
} from '@mui/material';
import VotingCard from './VotingCard';

const CARD_VALUES = ['1', '2', '3', '5', '8', '13', '20', '?'];

export default function VotingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [selected, setSelected] = React.useState<string | null>(null);
  const [reveal, setReveal] = React.useState(false);

  const handleSelect = (value: string) => {
    setSelected(value);
  };

  const handleReveal = () => {
    setReveal(true);
  };

  return (
    <Container>
      {/* 1) Header */}
      <Box sx={{ my: 2 }}>
        <Typography variant="h4">Current Story Title</Typography>
        <Typography variant="body1" color="text.secondary">
          Here goes the story description or details…
        </Typography>
      </Box>

      {/* 2) Voting cards */}
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

      {/* 3) Footer controls */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          disabled={!selected || reveal}
          onClick={() => setSelected(null)}
        >
          Clear
        </Button>
        <Button
          variant="contained"
          onClick={handleReveal}
          disabled={reveal}
        >
          Reveal
        </Button>
      </Box>
    </Container>
  );
}