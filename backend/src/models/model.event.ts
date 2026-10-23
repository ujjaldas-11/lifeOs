export interface Event {
  id: number;
  title: string;
  description?: string | null;
  date: Date;
  time?: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

export interface CreateEventInput {
  title: string;
  description?: string | null | undefined;
  date: Date | string;
  time?: string | null | undefined;
}

export interface UpdateEventInput {
  title?: string | undefined;
  description?: string | null | undefined;
  date?: Date | string | undefined;
  time?: string | null | undefined;
}
