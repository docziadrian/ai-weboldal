
import { db } from "./db";
import {
  conversations,
  messages,
  imageJobs,
  type Conversation,
  type Message,
  type ImageJob,
  type RecognitionJob,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // ChatterBlast
  createConversation(token: string): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  addMessage(conversationId: number, role: 'user' | 'assistant', content: string, isComplete?: boolean): Promise<Message>;
  getMessages(conversationId: number): Promise<Message[]>;
  updateMessage(id: number, content: string, isComplete: boolean): Promise<Message>;

  // DreamWeaver
  createImageJob(token: string, prompt: string): Promise<ImageJob>;
  getImageJob(id: number): Promise<ImageJob | undefined>;
  updateImageJob(id: number, updates: Partial<ImageJob>): Promise<ImageJob>;
}

export class DatabaseStorage implements IStorage {
  async createConversation(token: string): Promise<Conversation> {
    const result: any = await db.insert(conversations).values({ token });
    const insertId = result[0]?.insertId;
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, insertId));
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async addMessage(conversationId: number, role: 'user' | 'assistant', content: string, isComplete: boolean = true): Promise<Message> {
    const result: any = await db.insert(messages).values({ conversationId, role, content, isComplete });
    const insertId = result[0]?.insertId;
    const [message] = await db.select().from(messages).where(eq(messages.id, insertId));
    return message;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async updateMessage(id: number, content: string, isComplete: boolean): Promise<Message> {
    await db.update(messages)
      .set({ content, isComplete })
      .where(eq(messages.id, id));
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async createImageJob(token: string, prompt: string): Promise<ImageJob> {
    const result: any = await db.insert(imageJobs).values({
      token,
      prompt,
      status: 'pending',
      progress: 0,
    });
    const insertId = result[0]?.insertId;
    const [job] = await db.select().from(imageJobs).where(eq(imageJobs.id, insertId));
    return job;
  }

  async getImageJob(id: number): Promise<ImageJob | undefined> {
    const [job] = await db.select().from(imageJobs).where(eq(imageJobs.id, id));
    return job;
  }

  async updateImageJob(id: number, updates: Partial<ImageJob>): Promise<ImageJob> {
    await db.update(imageJobs).set(updates).where(eq(imageJobs.id, id));
    const [job] = await db.select().from(imageJobs).where(eq(imageJobs.id, id));
    return job;
  }
}

export const storage = new DatabaseStorage();
