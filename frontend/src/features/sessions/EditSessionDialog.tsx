// frontend/src/features/sessions/EditSessionDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Collapse,
  IconButton,
  CircularProgress,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Close,
  Edit,
  Settings,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useUpdateSessionMutation } from '../../api/sessionApi';
import type { Session } from '../../types';
import styles from './EditSessionDialog.module.css';

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

interface EditSessionDialogProps {
  open: boolean;
  onClose: () => void;
  session: Session;
}

export default function EditSessionDialog({ open, onClose, session }: EditSessionDialogProps) {
  // Form state - COPIED FROM CreateSessionPage with pre-population
  const [formData, setFormData] = useState({
    name: '',
    deckType: 'fibonacci',
    timerDuration: 300,
    maxParticipants: 10,
    password: '',
  });
  
  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // API mutation
  const [updateSession, { isLoading }] = useUpdateSessionMutation();

  // Pre-populate form when session changes - THIS IS NEW!
  useEffect(() => {
    if (session) {
      setFormData({
        name: session.name || '',
        deckType: session.deckType || 'fibonacci',
        timerDuration: session.timerDuration || 300,
        maxParticipants: session.maxParticipants || 10,
        password: '', // Don't show existing password
      });
    }
  }, [session]);

  // Form handlers - COPIED FROM CreateSessionPage
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDeckTypeSelect = (deckType: string, disabled?: boolean) => {
    if (disabled) return;
    setFormData(prev => ({ ...prev, deckType }));
  };

  // Validation logic - COPIED FROM CreateSessionPage
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

  // Submit handler - ADAPTED FOR UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const updates = {
        name: formData.name,
        deckType: formData.deckType,
        timerDuration: formData.timerDuration,
        maxParticipants: formData.maxParticipants,
        // Only include password if it's provided
        ...(formData.password && { password: formData.password }),
      };

      await updateSession({
        sessionId: session.id,
        updates
      }).unwrap();

      // Success - close dialog
      onClose();
      
    } catch (error: any) {
      setErrors({ 
        submit: error.data?.message || 'Failed to update session. Please try again.' 
      });
    }
  };

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if not open
  if (!open) return null;

  return (
    <div className={styles.dialogOverlay} onClick={handleOverlayClick}>
      <div className={styles.dialog}>
        {/* Dialog Header */}
        <div className={styles.dialogHeader}>
          <IconButton
            className={styles.closeButton}
            onClick={onClose}
            size="small"
          >
            <Close />
          </IconButton>
          
          <Typography className={styles.dialogTitle}>
            <Edit fontSize="small" />
            Edit Session
          </Typography>
          
          <Typography className={styles.dialogSubtitle}>
            Update your session settings
          </Typography>
        </div>

        {/* Dialog Content */}
        <div className={styles.dialogContent}>
          <form onSubmit={handleSubmit}>
            {/* Error Alert */}
            {errors.submit && (
              <Alert severity="error" className={styles.errorAlert}>
                {errors.submit}
              </Alert>
            )}

            {/* Basic Settings */}
            <div className={styles.formSection}>
              <Typography className={styles.sectionTitle}>
                Basic Settings
              </Typography>

              <div className={styles.formField}>
                <TextField
                  fullWidth
                  label="Session Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  error={!!errors.name}
                  helperText={errors.name || 'Give your session a memorable name'}
                  className={styles.textField}
                  placeholder="e.g., Sprint 23 Planning"
                />
              </div>

              {/* Deck Type Selection - SIMPLIFIED FOR DIALOG */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#000' }}>
                Estimation Deck
              </Typography>
              <div className={styles.deckTypeContainer}>
                {deckTypes.map((deck) => (
                  <Card
                    key={deck.id}
                    className={`${styles.deckTypeCard} ${
                      formData.deckType === deck.id ? styles.selected : ''
                    } ${deck.disabled ? styles.disabled : ''}`}
                    onClick={() => handleDeckTypeSelect(deck.id, deck.disabled)}
                  >
                    <CardContent sx={{ p: '12px !important' }}>
                      {deck.disabled && (
                        <Chip
                          label="Coming Soon"
                          size="small"
                          className={styles.comingSoonBadge}
                        />
                      )}
                      <Typography className={styles.deckTypeTitle}>
                        {deck.name}
                      </Typography>
                      <Typography className={styles.deckTypeDescription}>
                        {deck.description}
                      </Typography>
                      <Typography className={styles.deckTypeValues}>
                        {deck.values}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className={styles.formSection}>
              <div
                className={styles.advancedToggle}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings className={styles.sectionIcon} />
                <Typography sx={{ fontWeight: 600, color: '#000', flex: 1 }}>
                  Advanced Settings
                </Typography>
                {showAdvanced ? <ExpandLess /> : <ExpandMore />}
              </div>

              <Collapse in={showAdvanced}>
                <div className={styles.advancedContent}>
                  <Grid container spacing={2}>
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
                        size="small"
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
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Session Password (Optional)"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        helperText="Leave empty to keep current password, or enter new password"
                        className={styles.textField}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </div>
              </Collapse>
            </div>
          </form>
        </div>

        {/* Dialog Actions */}
        <div className={styles.dialogActions}>
          <Button
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className={styles.saveButton}
          >
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <CircularProgress size={16} color="inherit" />
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}