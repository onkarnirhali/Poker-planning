import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Story } from '../../types';

export const storiesApi = createApi({
  reducerPath: 'storiesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Stories'],
  endpoints: (builder) => ({
    // GET all stories for a session
    getStories: builder.query<Story[], string>({
      query: (sessionId) => `/sessions/${sessionId}/stories`,
      providesTags: (result) =>
        result
          ? [
              ...result.map((story) => ({ type: 'Stories' as const, id: story.id })),
              { type: 'Stories' as const, id: 'LIST' },
            ]
          : [{ type: 'Stories' as const, id: 'LIST' }],
    }),
    // POST a new story
    addStory: builder.mutation<Story, { sessionId: string; title: string; description?: string }>({
      query: ({ sessionId, title, description }) => ({
        url: `/sessions/${sessionId}/stories`,
        method: 'POST',
        body: { title, description },
      }),
      invalidatesTags: [{ type: 'Stories' as const, id: 'LIST' }],
    }),
  }),
});

export const { useGetStoriesQuery, useAddStoryMutation } = storiesApi;