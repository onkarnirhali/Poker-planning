// frontend/src/features/sessions/DeleteSessionDialog.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Close,
  Delete,
  Warning,
  Assignment,
  Group,
  Schedule,
  CalendarToday,
  TrendingUp,
} from '@mui/icons-material';
import { useDeleteSessionMutation } from '../../api/sessionApi';
import type { Session } from '../../types';
import styles from './DeleteSessionDialog.module.css';

interface DeleteSessionDialogProps {
  open: boolean;
  onClose: () => void;
  session: Session;
  onSuccess?: () => void;
}

// Mock function to get session stats (replace with real API data later)
const getSessionStats = (session: Session) => ({
  storyCount: Math.floor(Math.random() * 20),
  participantCount: Math.floor(Math.random() * 15),
  createdDays: Math.floor(Math.random() * 30),
  status: ['Draft', 'Active', 'Completed'][Math.floor(Math.random() * 3)],
});

export default function DeleteSessionDialog({ 
  open, 
  onClose, 
  session, 
  onSuccess 
}: DeleteSessionDialogProps) {
  // State
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string>('');
  
  // API mutation
  const [deleteSession, { isLoading }] = useDeleteSessionMutation();
  
  // Get session stats
  const stats = getSessionStats(session);

  // Handle confirmation checkbox
  const handleConfirmationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsConfirmed(event.target.checked);
    if (error) setError(''); // Clear error when user interacts
  };

  // Handle delete submission
  const handleDelete = async () => {
    if (!isConfirmed) {
      setError('Please confirm that you understand this action cannot be undone.');
      return;
    }

    try {
      await deleteSession(session.id).unwrap();
      
      // Success - close dialog and notify parent
      onClose();
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      setError(error.data?.message || 'Failed to delete session. Please try again.');
    }
  };

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setIsConfirmed(false);
      setError('');
    }
  }, [open]);

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
            disabled={isLoading}
          >
            <Close />
          </IconButton>
          
          <Typography className={styles.dialogTitle}>
            <Delete fontSize="small" />
            Delete Session
          </Typography>
          
          <Typography className={styles.dialogSubtitle}>
            This action cannot be undone
          </Typography>
        </div>

        {/* Dialog Content */}
        <div className={styles.dialogContent}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" className={styles.errorAlert}>
              {error}
            </Alert>
          )}

          {/* Warning Section */}
          <div className={styles.warningSection}>
            <div className={styles.warningIcon}>⚠️</div>
            <Typography className={styles.warningTitle}>
              Are you sure you want to delete this session?
            </Typography>
            <Typography className={styles.warningText}>
              All stories, votes, and participant data will be permanently removed.
            </Typography>
          </div>

          {/* Session Information */}
          <div className={styles.sessionInfo}>
            <Typography className={styles.sessionInfoTitle}>
              📋 Session Details
            </Typography>
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                <Assignment className={styles.infoIcon} />
                Session Name:
              </span>
              <span className={styles.infoValue}>{session.name}</span>
            </div>
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                📚 Stories:
              </span>
              <span className={styles.infoValue}>{stats.storyCount} stories</span>
            </div>
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                <Group className={styles.infoIcon} />
                Participants:
              </span>
              <span className={styles.infoValue}>{stats.participantCount} people</span>
            </div>
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                <CalendarToday className={styles.infoIcon} />
                Created:
              </span>
              <span className={styles.infoValue}>
                {stats.createdDays === 0 ? 'Today' : `${stats.createdDays} days ago`}
              </span>
            </div>
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                <TrendingUp className={styles.infoIcon} />
                Status:
              </span>
              <span className={styles.infoValue}>{stats.status}</span>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className={styles.confirmationSection}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isConfirmed}
                  onChange={handleConfirmationChange}
                  disabled={isLoading}
                  className={styles.checkboxInput}
                  icon={<span className={styles.checkboxCustom} />}
                  checkedIcon={<span className={`${styles.checkboxCustom} ${styles.checked}`} />}
                />
              }
              label={
                <span className={styles.checkboxLabel}>
                  I understand this action cannot be undone and will permanently delete all session data
                </span>
              }
              className={styles.confirmationCheckbox}
            />
            <Typography className={styles.confirmationHelp}>
              Check this box to enable the delete button
            </Typography>
          </div>
        </div>

        {/* Dialog Actions */}
        <div className={styles.dialogActions}>
          <Button
            onClick={onClose}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleDelete}
            disabled={!isConfirmed || isLoading}
            className={styles.deleteButton}
          >
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                Deleting...
              </div>
            ) : (
              'Delete Session'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}