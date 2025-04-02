import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  coverImage: text("cover_image"),
  isCreator: boolean("is_creator").default(false),
  isVerified: boolean("is_verified").default(false),
  subscriptionPrice: integer("subscription_price"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Character model
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  style: text("style"),
  profilePicture: text("profile_picture"),
  attributes: json("attributes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
});

// Content model
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  characterId: integer("character_id"),
  title: text("title"),
  description: text("description"),
  mediaUrl: text("media_url").notNull(),
  isPremium: boolean("is_premium").default(false),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContentSchema = createInsertSchema(contents).omit({
  id: true,
  createdAt: true,
});

// Subscription model
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  creatorId: integer("creator_id").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  price: integer("price"),
  status: text("status").default("active"),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
});

// Comment model
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
