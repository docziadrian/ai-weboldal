
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// ChatterBlast tables
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(), // The API token owning this conversation
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  isComplete: boolean("is_complete").default(true), // For streaming/typewriter simulation
  createdAt: timestamp("created_at").defaultNow(),
});

// DreamWeaver tables
export const imageJobs = pgTable("image_jobs", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  prompt: text("prompt").notNull(),
  status: text("status").notNull(), // 'pending', 'processing', 'completed', 'failed'
  progress: integer("progress").default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// MindReader tables (for history/logging, though not strictly persistent in requirement, it helps)
export const recognitionJobs = pgTable("recognition_jobs", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  imageUrl: text("image_url").notNull(),
  result: jsonb("result"), // Store the recognized objects
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isComplete: true });
export const insertImageJobSchema = createInsertSchema(imageJobs).omit({ id: true, createdAt: true, status: true, progress: true, imageUrl: true });

// === TYPES ===

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
