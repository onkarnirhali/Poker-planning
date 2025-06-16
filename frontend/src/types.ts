export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  timezone: string;
}

export interface Session {
  id: string;
  name: string;
  deckType: string;
  timer: number;
  password?: string;
}