export interface Event {
  id: number;
  title: string;
  description?: string | null;
  date: string;
  time?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface CreateEventInput {
  title: string;
  description?: string | null;
  date: string;
  time?: string | null;
}

export interface UpdateEventInput {
  title?: string;
  description?: string | null;
  date?: string;
  time?: string | null;
}
