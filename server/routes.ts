
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users, apiTokens } from "@shared/schema";
import { api, errorSchemas } from "@shared/routes";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import multer from "multer";
import bcrypt from "bcrypt";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === Auth Routes (DB-based) ===
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.json({ success: true, username: user.username });
  });

  app.post("/api/auth/validate-token", async (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const [apiToken] = await db.select().from(apiTokens)
      .where(and(eq(apiTokens.token, token), isNull(apiTokens.revokedAt)));

    if (apiToken) {
      return res.json({ success: true });
    }
    return res.status(403).json({ error: "Invalid access token" });
  });

  // Middleware to check for valid API token from DB
  const requireToken = async (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Invalid or missing API token" });
    }

    const tokenValue = authHeader.split(' ')[1];
    const [apiToken] = await db.select().from(apiTokens)
      .where(and(eq(apiTokens.token, tokenValue), isNull(apiTokens.revokedAt)));

    if (!apiToken) {
      return res.status(401).json({ message: "Invalid or revoked API token" });
    }

    (req as any).token = tokenValue;
    next();
  };

  // === Services List ===
  app.get(api.services.list.path, (req, res) => {
    res.json([
      { id: 'chatterblast', name: 'ChatterBlast', description: 'Advanced AI Chatbot', path: '/chatterblast' },
      { id: 'dreamweaver', name: 'DreamWeaver', description: 'AI Image Generator', path: '/dreamweaver' },
      { id: 'mindreader', name: 'MindReader', description: 'Object Recognition', path: '/mindreader' },
    ]);
  });

  // === ChatterBlast ===
  app.post(api.chatterblast.createConversation.path, requireToken, async (req, res) => {
    const token = (req as any).token;
    const conversation = await storage.createConversation(token);
    // Add welcome message
    await storage.addMessage(conversation.id, 'assistant', "Hello! I am ChatterBlast. How can I help you today?");
    res.status(201).json(conversation);
  });

  app.post(api.chatterblast.sendMessage.path, requireToken, async (req, res) => {
    try {
      const { conversationId, content } = api.chatterblast.sendMessage.input.parse(req.body);
      
      // Save user message
      await storage.addMessage(conversationId, 'user', content);

      // Create placeholder assistant message
      const assistantMsg = await storage.addMessage(conversationId, 'assistant', "", false);

      // Simulate streaming/processing in background
      // In a real app, this might be a job queue. Here we simulate it with setTimeout.
      const responses = [
        "That's an interesting perspective.",
        "I can certainly help with that.",
        "Could you elaborate more on that topic?",
        "Processing your request... done!",
        "Here is some information about what you asked."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      let currentText = "";
      const totalSteps = 10;
      const stepTime = 500; // 0.5s per step -> 5s total

      let step = 0;
      const interval = setInterval(async () => {
        step++;
        const chunk = randomResponse.slice(0, Math.floor((step / totalSteps) * randomResponse.length));
        
        await storage.updateMessage(assistantMsg.id, chunk, step >= totalSteps);

        if (step >= totalSteps) {
          clearInterval(interval);
        }
      }, stepTime);

      res.status(201).json(assistantMsg);
    } catch (error) {
       res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get(api.chatterblast.getMessages.path, requireToken, async (req, res) => {
    const conversationId = Number(req.params.id);
    const messages = await storage.getMessages(conversationId);
    res.json(messages);
  });

  // === DreamWeaver ===
  app.post(api.dreamweaver.generate.path, requireToken, async (req, res) => {
    try {
      const { prompt } = api.dreamweaver.generate.input.parse(req.body);
      const token = (req as any).token;
      
      const job = await storage.createImageJob(token, prompt);

      // Simulate processing
      let progress = 0;
      const interval = setInterval(async () => {
        progress += 10;
        if (progress > 100) progress = 100;

        const status = progress === 100 ? 'completed' : 'processing';
        // Random placeholder image from picsum
        const imageUrl = progress === 100 ? `https://picsum.photos/seed/${job.id}/1024/1024` : undefined;

        await storage.updateImageJob(job.id, { progress, status, imageUrl });

        if (progress === 100) clearInterval(interval);
      }, 1000); // 10 seconds total

      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get(api.dreamweaver.getStatus.path, requireToken, async (req, res) => {
    const job = await storage.getImageJob(Number(req.params.id));
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  });

  // === MindReader ===
  app.post(api.mindreader.analyze.path, requireToken, upload.single('image'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate random bounding boxes
    const width = 800; // Assume standard width for normalization logic if needed, or just %
    const height = 600;
    
    const objects = [];
    const count = Math.floor(Math.random() * 5) + 1; // 1 to 5 objects

    const labels = ["Person", "Cat", "Dog", "Car", "Laptop", "Cup"];

    for (let i = 0; i < count; i++) {
      objects.push({
        label: labels[Math.floor(Math.random() * labels.length)],
        score: 0.8 + Math.random() * 0.2,
        box: {
          x: Math.random() * (width - 100),
          y: Math.random() * (height - 100),
          width: 50 + Math.random() * 100,
          height: 50 + Math.random() * 100,
        }
      });
    }

    res.json({
      objectCount: count,
      objects
    });
  });

  return httpServer;
}
