// src/features/auth/FacilitatorSignupPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
  Link,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation, useSignupMutation } from './authApi';
import { useAppDispatch } from '../../hooks/hooks';
import { setCredentials } from './authSlice';

export default function FacilitatorSignupPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Tab state: 0 = Sign Up, 1 = Sign In
  const [currentTab, setCurrentTab] = useState(0);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // API mutations
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  // Handle input changes
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form based on current tab
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Common validations
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    // Sign up specific validations
    if (currentTab === 0) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      let result;
      
      if (currentTab === 0) {
        // Sign Up
        result = await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }).unwrap();
      } else {
        // Sign In
        result = await login({
          email: formData.email,
          password: formData.password,
        }).unwrap();
      }

      // Save user data and token
      dispatch(setCredentials({
        user: result.user,
        token: result.accessToken,
      }));
      
      localStorage.setItem('token', result.accessToken);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Auth error:', error);
      setErrors({ 
        submit: error.data?.message || 'Something went wrong. Please try again.' 
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ 
            color: 'white', 
            mb: 3,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          Back to Home
        </Button>

        {/* Auth Card */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                Facilitator Access
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {currentTab === 0 
                  ? 'Create your account to start facilitating sessions'
                  : 'Sign in to your facilitator account'
                }
              </Typography>
            </Box>

            {/* Tabs */}
            <Tabs 
              value={currentTab} 
              onChange={(_, newValue) => setCurrentTab(newValue)}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab label="Create Account" />
              <Tab label="Sign In" />
            </Tabs>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {/* Error Alert */}
              {errors.submit && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.submit}
                </Alert>
              )}

              {/* Name field (Sign Up only) */}
              {currentTab === 0 && (
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  sx={{ mb: 2 }}
                  placeholder="e.g., John Doe"
                />
              )}

              {/* Email field */}
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 2 }}
                placeholder="e.g., john@company.com"
              />

              {/* Password field */}
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                error={!!errors.password}
                helperText={errors.password || (currentTab === 0 ? 'At least 6 characters' : '')}
                sx={{ mb: 2 }}
              />

              {/* Confirm Password field (Sign Up only) */}
              {currentTab === 0 && (
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  sx={{ mb: 3 }}
                />
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSignupLoading || isLoginLoading}
                sx={{ mb: 2 }}
              >
                {isSignupLoading || isLoginLoading 
                  ? 'Processing...' 
                  : currentTab === 0 ? 'Create Account' : 'Sign In'
                }
              </Button>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {currentTab === 0 
                  ? 'Already have an account? '
                  : "Don't have an account? "
                }
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setCurrentTab(currentTab === 0 ? 1 : 0)}
                  sx={{ textDecoration: 'none' }}
                >
                  {currentTab === 0 ? 'Sign In' : 'Create Account'}
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}