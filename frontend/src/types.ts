// frontend/src/types.ts - UPDATED VERSION
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  id: string;
  name: string;
  deckType: string;
  timerDuration: number; 
  maxParticipants: number; 
  password?: string;
  facilitator_id?: string; 
  isLocked?: boolean; 
  createdAt?: string; 
  updatedAt?: string; 
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  storyType: string;
  priority?: string;
  orderIndex: number;
  isClosed: boolean;
  session_id: string;
  createdAt: string;
  updatedAt: string;
}