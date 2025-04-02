import { 
  users, type User, type InsertUser,
  characters, type Character, type InsertCharacter,
  contents, type Content, type InsertContent,
  subscriptions, type Subscription, type InsertSubscription,
  comments, type Comment, type InsertComment
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Character operations
  getCharacter(id: number): Promise<Character | undefined>;
  getCharactersByUser(userId: number): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined>;
  
  // Content operations
  getContent(id: number): Promise<Content | undefined>;
  getContentsByUser(userId: number): Promise<Content[]>;
  getFeaturedContent(): Promise<Content[]>;
  getTrendingContent(): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: Partial<InsertContent>): Promise<Content | undefined>;
  likeContent(id: number): Promise<Content | undefined>;
  
  // Subscription operations
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByUserAndCreator(userId: number, creatorId: number): Promise<Subscription | undefined>;
  getSubscriptionsByUser(userId: number): Promise<Subscription[]>;
  getSubscriptionsByCreator(creatorId: number): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  
  // Comment operations
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByContent(contentId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Featured creators
  getFeaturedCreators(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  private contents: Map<number, Content>;
  private subscriptions: Map<number, Subscription>;
  private comments: Map<number, Comment>;
  
  private userId: number = 1;
  private characterId: number = 1;
  private contentId: number = 1;
  private subscriptionId: number = 1;
  private commentId: number = 1;
  
  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.contents = new Map();
    this.subscriptions = new Map();
    this.comments = new Map();
    
    // Initialize with some sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Create sample users
    const user1 = this.createUserInternal({
      username: "lilithverse",
      password: "password123",
      email: "lilith@example.com",
      displayName: "Lilith AI",
      bio: "Your AI fantasy girlfriend. I love creating unique experiences just for you.",
      profilePicture: "https://randomuser.me/api/portraits/women/44.jpg",
      coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
      isCreator: true,
      isVerified: true,
      subscriptionPrice: 999
    });
    
    const user2 = this.createUserInternal({
      username: "mianova",
      password: "password123",
      email: "mia@example.com",
      displayName: "Mia Nova",
      bio: "AI character that loves adventures and fun times!",
      profilePicture: "https://randomuser.me/api/portraits/women/68.jpg",
      coverImage: "https://images.unsplash.com/photo-1557682250-33bd709cbe85",
      isCreator: true,
      isVerified: true,
      subscriptionPrice: 799
    });
    
    const user3 = this.createUserInternal({
      username: "emmarose",
      password: "password123",
      email: "emma@example.com",
      displayName: "Emma Rose",
      bio: "Fitness model AI character. Let's work out together!",
      profilePicture: "https://randomuser.me/api/portraits/women/90.jpg",
      coverImage: "https://images.unsplash.com/photo-1545389336-cf090694435e",
      isCreator: true,
      isVerified: true,
      subscriptionPrice: 1299
    });
    
    // Create sample characters
    const char1 = this.createCharacterInternal({
      userId: user1.id,
      name: "Lilith - Goth Style",
      description: "Dark and mysterious character with a gothic style",
      style: "realistic",
      profilePicture: "https://randomuser.me/api/portraits/women/44.jpg",
      attributes: {}
    });
    
    const char2 = this.createCharacterInternal({
      userId: user2.id,
      name: "Mia - Casual Style",
      description: "Casual and friendly character",
      style: "realistic",
      profilePicture: "https://randomuser.me/api/portraits/women/68.jpg",
      attributes: {}
    });
    
    // Create sample content
    this.createContentInternal({
      userId: user1.id,
      characterId: char1.id,
      title: "New gothic photoshoot",
      description: "Just created this new look! What do you think? 💕 #AIcreator #virtual #digitalart",
      mediaUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      isPremium: false,
      likes: 832,
      comments: 42
    });
    
    this.createContentInternal({
      userId: user1.id,
      characterId: char1.id,
      title: "Exclusive content",
      description: "Subscribe to see this exclusive content...",
      mediaUrl: "https://randomuser.me/api/portraits/women/43.jpg",
      isPremium: true,
      likes: 1240,
      comments: 98
    });
    
    this.createContentInternal({
      userId: user2.id,
      characterId: char2.id,
      title: "Beach day",
      description: "Perfect day at the beach! What's your favorite beach activity?",
      mediaUrl: "https://randomuser.me/api/portraits/women/67.jpg",
      isPremium: false,
      likes: 756,
      comments: 38
    });
  }
  
  private createUserInternal(userData: InsertUser): User {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { id, ...userData, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  private createCharacterInternal(charData: InsertCharacter): Character {
    const id = this.characterId++;
    const createdAt = new Date();
    const character: Character = { id, ...charData, createdAt };
    this.characters.set(id, character);
    return character;
  }
  
  private createContentInternal(contentData: InsertContent): Content {
    const id = this.contentId++;
    const createdAt = new Date();
    const content: Content = { id, ...contentData, createdAt };
    this.contents.set(id, content);
    return content;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    return this.createUserInternal(userData);
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Character operations
  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }
  
  async getCharactersByUser(userId: number): Promise<Character[]> {
    return Array.from(this.characters.values()).filter(
      (character) => character.userId === userId
    );
  }
  
  async createCharacter(characterData: InsertCharacter): Promise<Character> {
    return this.createCharacterInternal(characterData);
  }
  
  async updateCharacter(id: number, characterData: Partial<InsertCharacter>): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (!character) return undefined;
    
    const updatedCharacter = { ...character, ...characterData };
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }
  
  // Content operations
  async getContent(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }
  
  async getContentsByUser(userId: number): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      (content) => content.userId === userId
    );
  }
  
  async getFeaturedContent(): Promise<Content[]> {
    // For the MVP, just return random content
    return Array.from(this.contents.values()).slice(0, 6);
  }
  
  async getTrendingContent(): Promise<Content[]> {
    // For the MVP, return content sorted by likes
    return Array.from(this.contents.values())
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 6);
  }
  
  async createContent(contentData: InsertContent): Promise<Content> {
    const id = this.contentId++;
    const createdAt = new Date();
    const content: Content = { id, ...contentData, createdAt };
    this.contents.set(id, content);
    return content;
  }
  
  async updateContent(id: number, contentData: Partial<InsertContent>): Promise<Content | undefined> {
    const content = this.contents.get(id);
    if (!content) return undefined;
    
    const updatedContent = { ...content, ...contentData };
    this.contents.set(id, updatedContent);
    return updatedContent;
  }
  
  async likeContent(id: number): Promise<Content | undefined> {
    const content = this.contents.get(id);
    if (!content) return undefined;
    
    const updatedContent = { ...content, likes: content.likes + 1 };
    this.contents.set(id, updatedContent);
    return updatedContent;
  }
  
  // Subscription operations
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }
  
  async getSubscriptionByUserAndCreator(userId: number, creatorId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (sub) => sub.userId === userId && sub.creatorId === creatorId
    );
  }
  
  async getSubscriptionsByUser(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.userId === userId
    );
  }
  
  async getSubscriptionsByCreator(creatorId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.creatorId === creatorId
    );
  }
  
  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionId++;
    const subscription: Subscription = { id, ...subscriptionData };
    this.subscriptions.set(id, subscription);
    return subscription;
  }
  
  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }
  
  async getCommentsByContent(contentId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.contentId === contentId
    );
  }
  
  async createComment(commentData: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const createdAt = new Date();
    const comment: Comment = { id, ...commentData, createdAt };
    this.comments.set(id, comment);
    return comment;
  }
  
  // Featured creators
  async getFeaturedCreators(): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.isCreator)
      .slice(0, 5);
  }
}

export const storage = new MemStorage();
