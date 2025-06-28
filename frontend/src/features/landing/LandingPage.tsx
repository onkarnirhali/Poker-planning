// src/features/landing/LandingPage.tsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Groups, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const facilitatorFeatures = [
    'Create and manage planning sessions',
    'Add stories and set priorities',
    'Facilitate team discussions',
    'Export results and analytics',
  ];

  const participantFeatures = [
    'Join sessions instantly',
    'Vote on story estimates',
    'Participate in discussions',
    'No registration required',
  ];

  const handleFacilitatorClick = () => {
    navigate('/facilitator-signup');
  };

  const handleParticipantClick = () => {
    // For now, navigate to a simple join page
    // TODO: Create ParticipantJoinPage later
    alert('Participant join functionality coming soon!');
  };

  return (
    <Box className={styles.container}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box className={styles.heroSection}>
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h1"
            className={styles.heroTitle}
          >
            🃏 Planning Poker
          </Typography>
          
          <Typography
            variant={isMobile ? "h6" : "h5"}
            component="p"
            className={styles.heroSubtitle}
          >
            Agile estimation made simple for distributed teams
          </Typography>
        </Box>

        {/* Role Selection Section */}
        <Typography
          variant="h4"
          className={styles.roleSelectionTitle}
        >
          How do you want to get started?
        </Typography>

        <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Facilitator Card */}
          <Grid item xs={12} sm={6}>
            <Card className={styles.roleCard} onClick={handleFacilitatorClick}>
              <CardContent className={styles.roleCardContent}>
                {/* Card Header */}
                <Box className={styles.roleCardHeader}>
                  <Box className={styles.roleIconContainer}>
                    <Groups className={styles.roleIcon} />
                  </Box>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    className={styles.roleCardTitle}
                  >
                    Run a Session
                  </Typography>
                  <Typography 
                    variant="body2" 
                    className={styles.roleCardDescription}
                  >
                    Create and facilitate planning sessions for your team
                  </Typography>
                </Box>
                
                {/* Card Body */}
                <Box className={styles.roleCardBody}>
                  <Box className={styles.roleCardFeatures}>
                    {facilitatorFeatures.map((feature, index) => (
                      <Typography 
                        key={index}
                        variant="caption" 
                        className={styles.featureItem}
                      >
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Card Footer */}
                <Box className={styles.roleCardFooter}>
                  <Button
                    variant="contained"
                    size={isMobile ? "medium" : "large"}
                    fullWidth
                    className={styles.facilitatorButton}
                  >
                    Get Started as Facilitator
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Participant Card */}
          <Grid item xs={12} sm={6}>
            <Card className={styles.roleCard} onClick={handleParticipantClick}>
              <CardContent className={styles.roleCardContent}>
                {/* Card Header */}
                <Box className={styles.roleCardHeader}>
                  <Box className={styles.roleIconContainer}>
                    <Person className={styles.roleIcon} />
                  </Box>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    className={styles.roleCardTitle}
                  >
                    Join a Session
                  </Typography>
                  <Typography 
                    variant="body2" 
                    className={styles.roleCardDescription}
                  >
                    Participate in team estimation sessions
                  </Typography>
                </Box>
                
                {/* Card Body */}
                <Box className={styles.roleCardBody}>
                  <Box className={styles.roleCardFeatures}>
                    {participantFeatures.map((feature, index) => (
                      <Typography 
                        key={index}
                        variant="caption" 
                        className={styles.featureItem}
                      >
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Card Footer */}
                <Box className={styles.roleCardFooter}>
                  <Button
                    variant="contained"
                    size={isMobile ? "medium" : "large"}
                    fullWidth
                    className={styles.participantButton}
                  >
                    Join as Participant
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}