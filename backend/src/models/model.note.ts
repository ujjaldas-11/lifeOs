export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

export interface CreateNoteInput {
  title: string;
  content?: string | undefined;
  tags?: string[] | undefined;
}

export interface UpdateNoteInput {
  title?: string | undefined;
  content?: string | undefined;
  tags?: string[] | undefined;
}
