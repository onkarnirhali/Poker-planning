// frontend/src/features/sessions/SessionsPage.tsx - FIXED: Removed Duplicate Function
import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
  Snackbar,
} from '@mui/material';
import {
  Add,
  Search,
  ManageAccounts,
  Edit,
  ContentCopy,
  Delete,
  Lock,
  Check,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useGetSessionsQuery } from '../../api/sessionApi';
import EditSessionDialog from './EditSessionDialog';
import DeleteSessionDialog from './DeleteSessionDialog';
import type { Session } from '../../types';
import styles from './SessionsPage.module.css';

// Mock data for demonstration - will be replaced with real API data
const getSessionStatus = (session: Session) => {
  // Simple logic for now - will be enhanced in Phase 3
  const hasStories = Math.random() > 0.5; // Mock
  const hasParticipants = Math.random() > 0.7; // Mock
  
  if (!hasStories) return 'draft';
  if (hasParticipants) return 'active';
  return 'completed';
};

const getSessionStats = (session: Session) => ({
  storyCount: Math.floor(Math.random() * 20),
  participantCount: Math.floor(Math.random() * 15),
  createdDays: Math.floor(Math.random() * 30),
});

export default function SessionsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // API
  const { data: sessions, error, isLoading } = useGetSessionsQuery();
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  
  // Edit Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  
  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  
  // Notification State
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    
    let filtered = sessions.filter(session => {
      const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase());
      const sessionStatus = getSessionStatus(session);
      const matchesStatus = statusFilter === 'all' || sessionStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort sessions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [sessions, searchTerm, statusFilter, sortBy]);

  // Action Handlers
  const handleManageSession = (sessionId: string) => {
    navigate(`/sessions/${sessionId}`);
  };

  const handleEditSession = (session: Session) => {
    setSessionToEdit(session);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSessionToEdit(null);
  };

  // Delete Dialog Handlers
  const handleDeleteSession = (session: Session) => {
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  const handleDeleteSuccess = () => {
    setNotification({
      open: true,
      message: `Session "${sessionToDelete?.name}" has been deleted successfully.`,
      severity: 'success'
    });
  };

  const handleCopySessionCode = async (sessionId: string) => {
    const code = sessionId.split('-')[0].toUpperCase().slice(0, 6);
    try {
      await navigator.clipboard.writeText(code);
      setNotification({
        open: true,
        message: `Session code ${code} copied to clipboard!`,
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to copy session code',
        severity: 'error'
      });
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      draft: { color: '#ff9800', bg: '#fff3e0', label: 'Draft' },
      active: { color: '#4caf50', bg: '#e8f5e8', label: 'Active' },
      completed: { color: '#1976d2', bg: '#e3f2fd', label: 'Completed' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.bg,
          color: config.color,
          fontWeight: 600,
          fontSize: '0.75rem',
        }}
      />
    );
  };

  // Action Buttons Component for Reuse
  const ActionButtons = ({ session, variant = 'desktop' }: { 
    session: Session; 
    variant?: 'desktop' | 'mobile' 
  }) => {
    const baseButtons = [
      {
        key: 'manage',
        label: 'Manage',
        icon: <ManageAccounts fontSize="small" />,
        onClick: () => handleManageSession(session.id),
        className: styles.btnManage,
      },
      {
        key: 'edit',
        label: 'Edit',
        icon: <Edit fontSize="small" />,
        onClick: () => handleEditSession(session),
        className: styles.btnEdit,
      },
      {
        key: 'copy',
        label: variant === 'mobile' ? 'Copy Code' : 'Copy',
        icon: <ContentCopy fontSize="small" />,
        onClick: () => handleCopySessionCode(session.id),
        className: styles.btnCopy,
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <Delete fontSize="small" />,
        onClick: () => handleDeleteSession(session),
        className: styles.btnDelete,
      },
    ];

    if (variant === 'mobile') {
      return (
        <>
          <div className={styles.mobileActions}>
            {baseButtons.slice(0, 2).map((button) => (
              <Button
                key={button.key}
                onClick={button.onClick}
                className={`${styles.actionBtn} ${button.className}`}
                startIcon={button.icon}
              >
                {button.label}
              </Button>
            ))}
          </div>
          <div className={styles.mobileSecondaryActions}>
            {baseButtons.slice(2).map((button) => (
              <Button
                key={button.key}
                onClick={button.onClick}
                className={`${styles.actionBtn} ${button.className}`}
                startIcon={button.icon}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </>
      );
    }

    return (
      <div className={styles.actionsContainer}>
        {baseButtons.map((button) => (
          <Button
            key={button.key}
            onClick={button.onClick}
            className={`${styles.actionBtn} ${button.className}`}
            startIcon={button.icon}
          >
            {button.label}
          </Button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Container className={styles.container}>
        <Box className={styles.loadingContainer}>
          <CircularProgress />
          <Typography>Loading sessions...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={styles.container}>
        <Alert severity="error" className={styles.errorAlert}>
          Error loading sessions. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      {/* Header */}
      <Box className={styles.header}>
        <div className={styles.headerContent}>
          <Typography variant={isMobile ? "h4" : "h3"} className={styles.title}>
            My Sessions
          </Typography>
          <Typography variant="body1" className={styles.subtitle}>
            Manage your planning poker sessions
          </Typography>
        </div>
        
        <Button
          variant="contained"
          component={RouterLink}
          to="/create-session"
          startIcon={<Add />}
          className={styles.createButton}
          size={isMobile ? "medium" : "large"}
        >
          New Session
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box className={styles.filtersContainer}>
        <TextField
          placeholder="Search sessions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className={styles.searchIcon} />
              </InputAdornment>
            ),
          }}
          size="small"
        />
        
        <Box className={styles.filterButtons}>
          {['all', 'draft', 'active', 'completed'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "contained" : "outlined"}
              onClick={() => setStatusFilter(status)}
              className={`${styles.filterButton} ${
                statusFilter === status ? styles.activeFilter : ''
              }`}
              size="small"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Sessions Content */}
      {filteredSessions.length === 0 ? (
        <Box className={styles.emptyState}>
          <Typography variant="h6" className={styles.emptyTitle}>
            {searchTerm || statusFilter !== 'all' ? 'No sessions match your filters' : 'No sessions yet'}
          </Typography>
          <Typography className={styles.emptyDescription}>
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first planning poker session to get started'
            }
          </Typography>
          {!searchTerm && statusFilter === 'all' && (
            <Button
              variant="contained"
              component={RouterLink}
              to="/create-session"
              startIcon={<Add />}
              className={styles.createButton}
            >
              Create First Session
            </Button>
          )}
        </Box>
      ) : (
        <>
          {/* Desktop Table View - Only show on desktop */}
          {!isMobile && (
            <TableContainer component={Paper} className={styles.tableContainer}>
              <Table>
                <TableHead>
                  <TableRow className={styles.tableHeader}>
                    <TableCell className={styles.tableHeaderCell}>Session</TableCell>
                    <TableCell className={styles.tableHeaderCell}>Status</TableCell>
                    <TableCell className={styles.tableHeaderCell}>Stories</TableCell>
                    <TableCell className={styles.tableHeaderCell}>Participants</TableCell>
                    <TableCell className={styles.tableHeaderCell}>Created</TableCell>
                    <TableCell className={styles.tableHeaderCell}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSessions.map((session) => {
                    const status = getSessionStatus(session);
                    const stats = getSessionStats(session);
                    
                    return (
                      <TableRow key={session.id} className={styles.tableRow}>
                        <TableCell>
                          <Box>
                            <Typography className={styles.sessionName}>
                              {session.name}
                            </Typography>
                            <Typography className={styles.sessionDetails}>
                              {session.deckType} • Code: {session.id.split('-')[0].toUpperCase().slice(0, 6)}
                              {session.password && <Lock fontSize="small" sx={{ ml: 1 }} />}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(status)}
                        </TableCell>
                        <TableCell>
                          <Typography className={styles.statValue}>{stats.storyCount}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography className={styles.statValue}>{stats.participantCount}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography className={styles.statValue}>
                            {stats.createdDays === 0 ? 'Today' : `${stats.createdDays} days ago`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <ActionButtons session={session} variant="desktop" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Mobile Card View - Only show on mobile */}
          {isMobile && (
            <Grid container spacing={2} className={styles.mobileGrid}>
              {filteredSessions.map((session) => {
                const status = getSessionStatus(session);
                const stats = getSessionStats(session);
                
                return (
                  <Grid item xs={12} key={session.id}>
                    <Card className={styles.sessionCard}>
                      <CardContent className={styles.cardContent}>
                        <Box className={styles.cardHeader}>
                          <Box className={styles.cardTitleContainer}>
                            <Typography className={styles.cardTitle}>
                              {session.name}
                            </Typography>
                            {getStatusChip(status)}
                          </Box>
                        </Box>
                        
                        <Box className={styles.cardStats}>
                          <Box className={styles.cardStat}>
                            <Typography className={styles.cardStatLabel}>Stories</Typography>
                            <Typography className={styles.cardStatValue}>{stats.storyCount}</Typography>
                          </Box>
                          <Box className={styles.cardStat}>
                            <Typography className={styles.cardStatLabel}>Participants</Typography>
                            <Typography className={styles.cardStatValue}>{stats.participantCount}</Typography>
                          </Box>
                          <Box className={styles.cardStat}>
                            <Typography className={styles.cardStatLabel}>Created</Typography>
                            <Typography className={styles.cardStatValue}>
                              {stats.createdDays === 0 ? 'Today' : `${stats.createdDays}d ago`}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box className={styles.cardFooter}>
                          <Typography className={styles.cardDetails}>
                            {session.deckType} • Code: {session.id.split('-')[0].toUpperCase().slice(0, 6)}
                            {session.password && <Lock fontSize="small" sx={{ ml: 1 }} />}
                          </Typography>
                        </Box>

                        <ActionButtons session={session} variant="mobile" />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {/* Edit Session Dialog */}
      {sessionToEdit && (
        <EditSessionDialog
          open={editDialogOpen}
          onClose={handleEditDialogClose}
          session={sessionToEdit}
        />
      )}

      {/* Delete Session Dialog */}
      {sessionToDelete && (
        <DeleteSessionDialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          session={sessionToDelete}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}