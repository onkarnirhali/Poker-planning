// frontend/src/api/sessionApi.ts - UPDATED VERSION
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Session } from '../../types';

export const sessionsApi = createApi({
  reducerPath: 'sessionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Using token:', token);
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Sessions'], // Add tag types for cache invalidation
  endpoints: (builder) => ({
    // Existing endpoints
    getSessions: builder.query<Session[], void>({
      query: () => '/sessions',
      providesTags: ['Sessions'], // Tag for cache invalidation
    }),
    
    createSession: builder.mutation<{ session: Session; joinCode: string }, Omit<Session, 'id'>>({
      query: (body) => ({
        url: '/sessions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Sessions'], // Refresh sessions list after create
    }),

    // NEW: Get single session
    getSession: builder.query<Session, string>({
      query: (sessionId) => `/sessions/${sessionId}`,
      providesTags: (result, error, sessionId) => [{ type: 'Sessions', id: sessionId }],
    }),

    // NEW: Update session mutation
    updateSession: builder.mutation<
      Session, 
      { sessionId: string; updates: Partial<Session> }
    >({
      query: ({ sessionId, updates }) => ({
        url: `/sessions/${sessionId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Sessions'], // Refresh sessions list after update
    }),

    // NEW: Delete session mutation (for next phase)
    deleteSession: builder.mutation<void, string>({
      query: (sessionId) => ({
        url: `/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'], // Refresh sessions list after delete
    }),
  }),
});

export const { 
  useGetSessionsQuery, 
  useCreateSessionMutation,
  useGetSessionQuery,
  useUpdateSessionMutation,
  useDeleteSessionMutation, // For next phase
} = sessionsApi;