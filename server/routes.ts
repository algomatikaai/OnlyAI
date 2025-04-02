import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCharacterSchema, insertContentSchema, insertSubscriptionSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // Authentication routes
  apiRouter.post("/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  apiRouter.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error logging in" });
    }
  });
  
  // User routes
  apiRouter.get("/users/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  
  // Character routes
  apiRouter.post("/characters", async (req, res) => {
    try {
      const characterData = insertCharacterSchema.parse(req.body);
      const character = await storage.createCharacter(characterData);
      
      res.status(201).json(character);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid character data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating character" });
    }
  });
  
  apiRouter.get("/characters/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const characters = await storage.getCharactersByUser(userId);
      
      res.status(200).json(characters);
    } catch (error) {
      res.status(500).json({ message: "Error fetching characters" });
    }
  });
  
  // Content routes
  apiRouter.post("/content", async (req, res) => {
    try {
      const contentData = insertContentSchema.parse(req.body);
      const content = await storage.createContent(contentData);
      
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid content data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating content" });
    }
  });
  
  apiRouter.get("/content/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const contents = await storage.getContentsByUser(userId);
      
      res.status(200).json(contents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching content" });
    }
  });
  
  apiRouter.get("/content/featured", async (req, res) => {
    try {
      const featured = await storage.getFeaturedContent();
      res.status(200).json(featured);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured content" });
    }
  });
  
  apiRouter.get("/content/trending", async (req, res) => {
    try {
      const trending = await storage.getTrendingContent();
      res.status(200).json(trending);
    } catch (error) {
      res.status(500).json({ message: "Error fetching trending content" });
    }
  });
  
  apiRouter.post("/content/:id/like", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const content = await storage.likeContent(id);
      
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.status(200).json(content);
    } catch (error) {
      res.status(500).json({ message: "Error liking content" });
    }
  });
  
  // Subscription routes
  apiRouter.post("/subscriptions", async (req, res) => {
    try {
      const subscriptionData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(subscriptionData);
      
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating subscription" });
    }
  });
  
  apiRouter.get("/subscriptions/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const subscriptions = await storage.getSubscriptionsByUser(userId);
      
      res.status(200).json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subscriptions" });
    }
  });
  
  // Comment routes
  apiRouter.post("/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating comment" });
    }
  });
  
  apiRouter.get("/comments/content/:contentId", async (req, res) => {
    try {
      const contentId = parseInt(req.params.contentId);
      const comments = await storage.getCommentsByContent(contentId);
      
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching comments" });
    }
  });
  
  // Featured creators
  apiRouter.get("/creators/featured", async (req, res) => {
    try {
      const creators = await storage.getFeaturedCreators();
      // Remove passwords from response
      const creatorsWithoutPasswords = creators.map(({ password, ...rest }) => rest);
      
      res.status(200).json(creatorsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured creators" });
    }
  });
  
  // Mount API routes
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
