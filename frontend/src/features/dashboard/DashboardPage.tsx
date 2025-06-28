// src/features/dashboard/DashboardPage.tsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  List,
  Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/hooks';
import { logOut } from '../auth/authSlice';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/');
  };

  const handleCreateSession = () => {
    navigate('/create-session');
  };

  const handleListSessions = () => {
    navigate('/sessions');
  };

  return (
    <Box className={styles.container}>
      {/* Top Navigation Bar */}
      <AppBar position="static" elevation={0} className={styles.appBar}>
        <Toolbar>
          <Typography variant="h6" className={styles.logo}>
            🃏 Planning Poker
          </Typography>
          
          {/* User Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar className={styles.userAvatar}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            {!isMobile && (
              <Box>
                <Typography variant="body2" className={styles.userName}>
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="caption" className={styles.userRole}>
                  Facilitator
                </Typography>
              </Box>
            )}
            <IconButton onClick={handleLogout} className={styles.logoutButton} size="small">
              <Logout fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" className={styles.mainContainer}>
        {/* Welcome Section */}
        <Box className={styles.welcomeSection}>
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            className={styles.welcomeTitle}
          >
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </Typography>
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            className={styles.welcomeSubtitle}
          >
            What would you like to do today?
          </Typography>
        </Box>

        {/* Action Cards */}
        <Box className={styles.cardsContainer}>
          <Grid container spacing={4} justifyContent="center" className={styles.cardsGrid}>
            {/* Create Session Card */}
            <Grid item xs={12} sm={6}>
              <Card className={styles.actionCard} onClick={handleCreateSession}>
                <CardContent className={styles.cardContent}>
                  {/* Card Header */}
                  <Box className={styles.cardHeader}>
                    <Box className={styles.primaryIconContainer}>
                      <Add className={styles.cardIcon} />
                    </Box>
                  </Box>
                  
                  {/* Card Body */}
                  <Box className={styles.cardBody}>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      className={styles.cardTitle}
                    >
                      Create Session
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      className={styles.cardDescription}
                    >
                      Start a new planning poker session for your team
                    </Typography>
                  </Box>

                  {/* Card Footer */}
                  <Box className={styles.cardFooter}>
                    <Button
                      variant="contained"
                      size={isMobile ? "medium" : "large"}
                      fullWidth
                      startIcon={<Add />}
                      className={styles.primaryButton}
                    >
                      Create New Session
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* List Sessions Card */}
            <Grid item xs={12} sm={6}>
              <Card className={styles.actionCard} onClick={handleListSessions}>
                <CardContent className={styles.cardContent}>
                  {/* Card Header */}
                  <Box className={styles.cardHeader}>
                    <Box className={styles.secondaryIconContainer}>
                      <List className={styles.cardIcon} />
                    </Box>
                  </Box>
                  
                  {/* Card Body */}
                  <Box className={styles.cardBody}>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      className={styles.cardTitle}
                    >
                      My Sessions
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      className={styles.cardDescription}
                    >
                      View and manage your existing sessions
                    </Typography>
                  </Box>

                  {/* Card Footer */}
                  <Box className={styles.cardFooter}>
                    <Button
                      variant="contained"
                      size={isMobile ? "medium" : "large"}
                      fullWidth
                      startIcon={<List />}
                      className={styles.secondaryButton}
                    >
                      View Sessions
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Quick Stats */}
        <Box className={styles.statsSection}>
          <Typography variant="h6" className={styles.statsTitle}>
            Quick Stats
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {[
              { number: '12', label: 'Sessions Created' },
              { number: '48', label: 'Stories Estimated' },
              { number: '85%', label: 'Team Consensus' }
            ].map((stat, index) => (
              <Grid item xs={4} key={index}>
                <Box>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    className={styles.statNumber}
                  >
                    {stat.number}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    className={styles.statLabel}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}