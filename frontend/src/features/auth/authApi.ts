import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User } from '../../types';

// 1. Base URL points at your backend on localhost:4000
// 2. prepareHeaders injects the JWT from localStorage into each request
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // POST /auth/login → returns { user, accessToken }
    login: builder.mutation<{ user: User; accessToken: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/api/v1/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    // POST /auth/signup
    signup: builder.mutation<{ user: User; accessToken: string }, { name: string; email: string; password: string }>({
      query: (data) => ({
        url: '/api/v1/auth/signup',
        method: 'POST',
        body: data,
      }),
    }),
    // GET /auth/me (optional)
    me: builder.query<{ user: User }, void>({
      query: () => '/auth/me',
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useMeQuery } = authApi;