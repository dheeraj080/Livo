import {
  pgTable,
  text,
  timestamp,
  integer,
  primaryKey,
  uuid,
  jsonb,
  index,
  uniqueIndex,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users table
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('users_email_idx').on(t.email),
  ]
);

// 2. Notebooks table
export const notebooks = pgTable(
  'notebooks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    parentId: uuid('parent_id').references((): AnyPgColumn => notebooks.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('notebooks_user_id_idx').on(t.userId),
    index('notebooks_parent_id_idx').on(t.parentId),
  ]
);

// 3. Notes table (Soft deletion with deleted_at, canonical JSON in content_json, normalized text in content_text)
export const notes = pgTable(
  'notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    notebookId: uuid('notebook_id').references(() => notebooks.id, {
      onDelete: 'set null',
    }),
    title: text('title').notNull().default('Untitled'),
    contentJson: jsonb('content_json').notNull().default({}),
    contentText: text('content_text').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('notes_user_id_idx').on(t.userId),
    index('notes_notebook_id_idx').on(t.notebookId),
    index('notes_deleted_at_idx').on(t.deletedAt),
    index('notes_user_deleted_updated_idx').on(t.userId, t.deletedAt, t.updatedAt),
  ]
);

// 4. Tags table (Unique per user)
export const tags = pgTable(
  'tags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('tags_user_id_idx').on(t.userId),
    uniqueIndex('tags_user_name_unique_idx').on(t.userId, t.name),
  ]
);

// 5. Note Tags junction table
export const noteTags = pgTable(
  'note_tags',
  {
    noteId: uuid('note_id')
      .references(() => notes.id, { onDelete: 'cascade' })
      .notNull(),
    tagId: uuid('tag_id')
      .references(() => tags.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.noteId, t.tagId] }),
    index('note_tags_tag_id_idx').on(t.tagId),
    index('note_tags_note_id_idx').on(t.noteId),
  ]
);

// 6. Attachments table (metadata only, no binary blobs in PostgreSQL)
export const attachments = pgTable(
  'attachments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    noteId: uuid('note_id')
      .references(() => notes.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    storageKey: text('storage_key').notNull(),
    filename: text('filename').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer('size').notNull(),
    status: text('status').notNull().default('UPLOADED'),
    extractedText: text('extracted_text').notNull().default(''),
    processingError: text('processing_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('attachments_note_id_idx').on(t.noteId),
    index('attachments_user_id_idx').on(t.userId),
    index('attachments_status_idx').on(t.status),
  ]
);

// 7. Note Versions table (immutable version history for note drafts)
export const noteVersions = pgTable(
  'note_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    noteId: uuid('note_id')
      .references(() => notes.id, { onDelete: 'cascade' })
      .notNull(),
    contentJson: jsonb('content_json').notNull(),
    contentText: text('content_text').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('note_versions_note_id_idx').on(t.noteId),
    index('note_versions_note_created_idx').on(t.noteId, t.createdAt),
  ]
);

// Relations definitions
export const usersRelations = relations(users, ({ many }) => ({
  notebooks: many(notebooks),
  notes: many(notes),
  tags: many(tags),
  attachments: many(attachments),
}));

export const notebooksRelations = relations(notebooks, ({ one, many }) => ({
  user: one(users, {
    fields: [notebooks.userId],
    references: [users.id],
  }),
  parent: one(notebooks, {
    fields: [notebooks.parentId],
    references: [notebooks.id],
    relationName: 'notebookSubNotebooks',
  }),
  children: many(notebooks, {
    relationName: 'notebookSubNotebooks',
  }),
  notes: many(notes),
}));

export const notesRelations = relations(notes, ({ one, many }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [notes.notebookId],
    references: [notebooks.id],
  }),
  noteTags: many(noteTags),
  attachments: many(attachments),
  versions: many(noteVersions),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  noteTags: many(noteTags),
}));

export const noteTagsRelations = relations(noteTags, ({ one }) => ({
  note: one(notes, {
    fields: [noteTags.noteId],
    references: [notes.id],
  }),
  tag: one(tags, {
    fields: [noteTags.tagId],
    references: [tags.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  note: one(notes, {
    fields: [attachments.noteId],
    references: [notes.id],
  }),
  user: one(users, {
    fields: [attachments.userId],
    references: [users.id],
  }),
}));

export const noteVersionsRelations = relations(noteVersions, ({ one }) => ({
  note: one(notes, {
    fields: [noteVersions.noteId],
    references: [notes.id],
  }),
}));

// Inferred row and insert types
export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;

export type NotebookRow = typeof notebooks.$inferSelect;
export type NewNotebookRow = typeof notebooks.$inferInsert;

export type NoteRow = typeof notes.$inferSelect;
export type NewNoteRow = typeof notes.$inferInsert;

export type TagRow = typeof tags.$inferSelect;
export type NewTagRow = typeof tags.$inferInsert;

export type NoteTagRow = typeof noteTags.$inferSelect;
export type NewNoteTagRow = typeof noteTags.$inferInsert;

export type AttachmentRow = typeof attachments.$inferSelect;
export type NewAttachmentRow = typeof attachments.$inferInsert;

export type NoteVersionRow = typeof noteVersions.$inferSelect;
export type NewNoteVersionRow = typeof noteVersions.$inferInsert;
