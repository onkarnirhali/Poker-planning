import React from 'react';
import { List, ListItem, ListItemText, Divider } from '@mui/material';
import type { Story } from '../../types';

interface Props { stories: Story[]; }

export default function StoryList({ stories }: Props) {
  if (!stories.length) return <div>No stories yet.</div>;
  return (
    <List>
      {stories.map((s) => (
        <React.Fragment key={s.id}>
          <ListItem>
            <ListItemText primary={s.title} secondary={s.description} />
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
}