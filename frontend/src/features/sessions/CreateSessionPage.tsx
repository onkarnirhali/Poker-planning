// src/features/sessions/CreateSessionPage.tsx - FIXED VERSION
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Settings,
  Groups,
  Timer,
  Security,
  ExpandMore,
  ExpandLess,
  ContentCopy,
  Check,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCreateSessionMutation } from '../../api/sessionApi';
import styles from './CreateSessionPage.module.css';

interface DeckType {
  id: string;
  name: string;
  description: string;
  values: string;
  disabled?: boolean;
}

const deckTypes: DeckType[] = [
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    description: 'Most popular for story pointing',
    values: '1, 2, 3, 5, 8, 13, 21, ?'
  },
  {
    id: 'tshirt',
    name: 'T-Shirt Sizes',
    description: 'Simple size-based estimation',
    values: 'XS, S, M, L, XL, XXL, ?',
    disabled: true
  },
  {
    id: 'powers',
    name: 'Powers of 2',
    description: 'Binary progression',
    values: '1, 2, 4, 8, 16, 32, ?',
    disabled: true
  }
];

export default function CreateSessionPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    deckType: 'fibonacci',
    timerDuration: 300, // 5 minutes default
    maxParticipants: 10,
    password: '',
  });
  
  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [sessionData, setSessionData] = useState<{
    sessionId: string;
    joinCode: string;
    sessionName: string;
  } | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // API
  const [createSession, { isLoading }] = useCreateSessionMutation();

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDeckTypeSelect = (deckType: string, disabled?: boolean) => {
    if (disabled) return; // Don't allow selection of disabled cards
    setFormData(prev => ({ ...prev, deckType }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Session name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Session name must be under 100 characters';
    }
    
    if (formData.timerDuration < 60 || formData.timerDuration > 1800) {
      newErrors.timerDuration = 'Timer must be between 1-30 minutes';
    }
    
    if (formData.maxParticipants < 2 || formData.maxParticipants > 50) {
      newErrors.maxParticipants = 'Participants must be between 2-50';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await createSession({
        name: formData.name,
        deckType: formData.deckType,
        timerDuration: formData.timerDuration,
        maxParticipants: formData.maxParticipants,
        password: formData.password || undefined,
      }).unwrap();

      // FIXED: Use the actual API response
      console.log('API Response:', result); // Debug log
      
      const sessionId = result.session?.id;
      const joinCode = result.joinCode;
      
      if (!sessionId || !joinCode) {
        throw new Error('Invalid session response from server');
      }

      // Store session data for display
      setSessionData({
        sessionId: sessionId,           // Full UUID for navigation
        joinCode: joinCode,             // 6-char code for sharing
        sessionName: formData.name,
      });
      
      setSessionCreated(true);
      
    } catch (error: any) {
      console.error('Create session error:', error);
      setErrors({ 
        submit: error.data?.message || 'Failed to create session. Please try again.' 
      });
    }
  };

  const copySessionCode = async () => {
    if (!sessionData) return;
    
    try {
      await navigator.clipboard.writeText(sessionData.joinCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code');
    }
  };

  const handleManageSession = () => {
    if (!sessionData) return;
    
    // FIXED: Navigate using the full session ID, not the join code
    console.log('Navigating to session:', sessionData.sessionId);
    navigate(`/sessions/${sessionData.sessionId}`);
  };

  if (sessionCreated && sessionData) {
    return (
      <Box className={styles.container}>
        <Container maxWidth="md">
          <Box className={styles.successMessage}>
            <Typography variant="h4" className={styles.successTitle}>
              🎉 Session Created Successfully!
            </Typography>
            
            <Typography variant="body1" className={styles.successText}>
              Your planning poker session "{sessionData.sessionName}" is ready. Share this code with your team:
            </Typography>

            <Box className={styles.sessionCode}>
              <Typography variant="body2" className={styles.codeLabel}>
                Session Code (Share with team)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Typography variant="h3" className={styles.codeValue}>
                  {sessionData.joinCode}
                </Typography>
                <IconButton onClick={copySessionCode} sx={{ color: '#1976d2' }}>
                  {codeCopied ? <Check /> : <ContentCopy />}
                </IconButton>
              </Box>
              {codeCopied && (
                <Typography variant="caption" sx={{ color: '#4caf50' }}>
                  Copied to clipboard!
                </Typography>
              )}
              
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={handleManageSession}
                className={styles.createButton}
                size="large"
              >
                Manage Session
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                className={styles.cancelButton}
                size="large"
              >
                Back to Dashboard
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box className={styles.container}>
      <Container maxWidth="md">
        {/* Header */}
        <Box className={styles.header}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            className={styles.backButton}
          >
            Back to Dashboard
          </Button>
          
          <Typography variant={isMobile ? "h4" : "h3"} className={styles.title}>
            Create New Session
          </Typography>
          
          <Typography variant="body1" className={styles.subtitle}>
            Set up your planning poker session with custom settings for your team
          </Typography>
        </Box>

        {/* Form */}
        <Box className={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            {/* Error Alert */}
            {errors.submit && (
              <Alert severity="error" className={styles.errorAlert}>
                {errors.submit}
              </Alert>
            )}

            {/* Basic Settings */}
            <Box className={styles.formSection}>
              <Typography variant="h6" className={styles.sectionTitle}>
                <Groups className={styles.sectionIcon} />
                Basic Settings
              </Typography>

              <TextField
                fullWidth
                label="Session Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!!errors.name}
                helperText={errors.name || 'Give your session a memorable name'}
                className={`${styles.textField} ${styles.formField}`}
                placeholder="e.g., Sprint 23 Planning"
              />

              {/* Deck Type Selection */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#000' }}>
                Estimation Deck
              </Typography>
              <Grid container spacing={2} className={styles.deckTypeContainer}>
                {deckTypes.map((deck) => {
                  const CardComponent = (
                    <Card
                      className={`${styles.deckTypeCard} ${
                        formData.deckType === deck.id ? styles.selected : ''
                      } ${deck.disabled ? styles.disabled : ''}`}
                      onClick={() => handleDeckTypeSelect(deck.id, deck.disabled)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        {deck.disabled && (
                          <Chip
                            label="Coming Soon"
                            size="small"
                            className={styles.comingSoonBadge}
                          />
                        )}
                        <Typography 
                          variant="subtitle2" 
                          className={`${styles.deckTypeTitle} ${deck.disabled ? styles.disabled : ''}`}
                        >
                          {deck.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          className={`${styles.deckTypeDescription} ${deck.disabled ? styles.disabled : ''}`}
                        >
                          {deck.description}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          className={`${styles.deckTypeValues} ${deck.disabled ? styles.disabled : ''}`}
                        >
                          {deck.values}
                        </Typography>
                      </CardContent>
                    </Card>
                  );

                  return (
                    <Grid item key={deck.id}>
                      {deck.disabled ? (
                        <Tooltip title="Feature coming soon!" arrow placement="top">
                          {CardComponent}
                        </Tooltip>
                      ) : (
                        CardComponent
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            {/* Advanced Settings */}
            <Box className={styles.formSection}>
              <Box
                className={styles.advancedToggle}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings className={styles.sectionIcon} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#000' }}>
                  Advanced Settings
                </Typography>
                {showAdvanced ? <ExpandLess /> : <ExpandMore />}
              </Box>

              <Collapse in={showAdvanced}>
                <Box className={styles.advancedContent}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Timer Duration (seconds)"
                        type="number"
                        value={formData.timerDuration}
                        onChange={handleInputChange('timerDuration')}
                        error={!!errors.timerDuration}
                        helperText={errors.timerDuration || 'Default: 5 minutes'}
                        className={styles.textField}
                        inputProps={{ min: 60, max: 1800 }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Max Participants"
                        type="number"
                        value={formData.maxParticipants}
                        onChange={handleInputChange('maxParticipants')}
                        error={!!errors.maxParticipants}
                        helperText={errors.maxParticipants || 'Default: 10 people'}
                        className={styles.textField}
                        inputProps={{ min: 2, max: 50 }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Session Password (Optional)"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        helperText="Leave empty for public sessions"
                        className={styles.textField}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </Box>

            {/* Form Actions */}
            <Box className={styles.formActions}>
              <Button
                type="button"
                onClick={() => navigate('/dashboard')}
                className={styles.cancelButton}
                size="large"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading}
                className={styles.createButton}
                size="large"
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Creating...
                  </>
                ) : (
                  'Create Session'
                )}
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </Box>
  );
}