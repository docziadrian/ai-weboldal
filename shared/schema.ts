
import { mysqlTable, text, int, boolean, timestamp, json, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === AUTH / BACKEND TABLES (from euroskills2023 DB) ===

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiTokens = mysqlTable("api_tokens", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  token: varchar("token", { length: 100 }).notNull(),
  workspaceId: int("workspace_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

// === AI SERVICE TABLES ===

// ChatterBlast tables
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  token: text("token").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  isComplete: boolean("is_complete").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// DreamWeaver tables
export const imageJobs = mysqlTable("image_jobs", {
  id: int("id").autoincrement().primaryKey(),
  token: text("token").notNull(),
  prompt: text("prompt").notNull(),
  status: text("status").notNull(),
  progress: int("progress").default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// MindReader tables
export const recognitionJobs = mysqlTable("recognition_jobs", {
  id: int("id").autoincrement().primaryKey(),
  token: text("token").notNull(),
  imageUrl: text("image_url").notNull(),
  result: json("result"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isComplete: true });
export const insertImageJobSchema = createInsertSchema(imageJobs).omit({ id: true, createdAt: true, status: true, progress: true, imageUrl: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type ApiToken = typeof apiTokens.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ImageJob = typeof imageJobs.$inferSelect;
export type RecognitionJob = typeof recognitionJobs.$inferSelect;

export type BoundingBox = {
  label: string;
  score: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type RecognitionResult = {
  objectCount: number;
  objects: BoundingBox[];
};
