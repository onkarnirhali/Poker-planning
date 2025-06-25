import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';

interface VotingCardProps {
  value: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
  reveal?: boolean;
}

export default function VotingCard({
  value,
  isSelected,
  onSelect,
  reveal = false,
}: VotingCardProps) {
  const handleClick = () => {
    if (!reveal) onSelect(value);
  };

  return (
    <Card
      elevation={isSelected ? 8 : 2}
      sx={{
        border: isSelected ? '2px solid' : 'none',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.2s, border-color 0.2s',
      }}
    >
      <CardActionArea onClick={handleClick} disabled={reveal}>
        <CardContent
          sx={{
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4">
            {reveal ? value : '?'}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}