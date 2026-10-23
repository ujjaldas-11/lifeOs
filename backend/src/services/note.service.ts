import { prisma } from "../lib/prisma.js";
import type { CreateNoteInput, UpdateNoteInput } from "../models/model.note.js";

export const getAllNotes = async (
  userId: number,
  search?: string | undefined,
  tag?: string | undefined
) => {
  const whereClause: any = { userId };

  if (search && search.trim() !== "") {
    const q = search.trim();
    whereClause.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  if (tag && tag.trim() !== "") {
    whereClause.tags = { has: tag.trim() };
  }

  return await prisma.note.findMany({
    where: whereClause,
    orderBy: { updatedAt: "desc" },
  });
};

export const getNoteById = async (id: number, userId: number) => {
  return await prisma.note.findFirst({
    where: { id, userId },
  });
};

export const createNote = async (userId: number, input: CreateNoteInput) => {
  // Normalize tags: trim and remove empty/duplicate
  const cleanTags = input.tags
    ? Array.from(new Set(input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean)))
    : [];

  return await prisma.note.create({
    data: {
      title: input.title.trim(),
      content: input.content ?? "",
      tags: cleanTags,
      userId,
    },
  });
};

export const updateNote = async (
  id: number,
  userId: number,
  input: UpdateNoteInput
) => {
  const existing = await prisma.note.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const data: any = {};
  if (input.title !== undefined) data.title = input.title.trim();
  if (input.content !== undefined) data.content = input.content;
  if (input.tags !== undefined) {
    data.tags = Array.from(
      new Set(input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))
    );
  }

  return await prisma.note.update({
    where: { id },
    data,
  });
};

export const deleteNote = async (id: number, userId: number) => {
  const existing = await prisma.note.findFirst({ where: { id, userId } });
  if (!existing) return false;

  await prisma.note.delete({ where: { id } });
  return true;
};

export const getAllTags = async (userId: number): Promise<string[]> => {
  const notes = await prisma.note.findMany({
    where: { userId },
    select: { tags: true },
  });

  const allTags = new Set<string>();
  for (const n of notes) {
    for (const t of n.tags) {
      if (t) allTags.add(t);
    }
  }

  return Array.from(allTags).sort();
};
