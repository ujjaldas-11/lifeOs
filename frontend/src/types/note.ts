export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  projectId?: number | null;
  project?: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  tags?: string[];
  projectId?: number | null;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
  projectId?: number | null;
}
