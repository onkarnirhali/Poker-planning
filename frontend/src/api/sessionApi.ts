import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Session } from '../../types';

export const sessionsApi = createApi({
  reducerPath: 'sessionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Using token:', token); // Debugging line
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSessions: builder.query<Session[], void>({
      query: () => '/sessions',
    }),
    createSession: builder.mutation<{ id: string }, Omit<Session, 'id'>>({
      query: (body) => ({
        url: '/sessions',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetSessionsQuery, useCreateSessionMutation } = sessionsApi;
