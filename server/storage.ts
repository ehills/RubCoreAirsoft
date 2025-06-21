import {
  users,
  events,
  eventAttendees,
  photos,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type EventAttendee,
  type Photo,
  type InsertPhoto,
  type RegisterData,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: RegisterData): Promise<User>;
  verifyPassword(email: string, password: string): Promise<User | null>;
  
  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent, createdBy: number): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>, userId: number): Promise<Event>;
  deleteEvent(id: number, userId: number): Promise<void>;
  
  // Event attendance operations
  getEventAttendees(eventId: number): Promise<(EventAttendee & { user: User })[]>;
  addEventAttendee(eventId: number, userId: number): Promise<EventAttendee>;
  removeEventAttendee(eventId: number, userId: number): Promise<void>;
  isUserAttending(eventId: number, userId: number): Promise<boolean>;
  
  // Photo operations
  getPhotos(): Promise<(Photo & { uploadedBy: User })[]>;
  getPhoto(id: number): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto, uploadedBy: number): Promise<Photo>;
  updatePhoto(id: number, photo: Partial<InsertPhoto>, userId: number): Promise<Photo>;
  deletePhoto(id: number, userId: number): Promise<void>;
  getUserPhotos(userId: number): Promise<Photo[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: RegisterData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.date));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent, createdBy: number): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values({ ...event, createdBy })
      .returning();
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>, userId: number): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(and(eq(events.id, id), eq(events.createdBy, userId)))
      .returning();
    if (!updatedEvent) {
      throw new Error("Event not found or not authorized");
    }
    return updatedEvent;
  }

  async deleteEvent(id: number, userId: number): Promise<void> {
    const result = await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.createdBy, userId)));
  }

  // Event attendance operations
  async getEventAttendees(eventId: number): Promise<(EventAttendee & { user: User })[]> {
    return await db
      .select({
        id: eventAttendees.id,
        eventId: eventAttendees.eventId,
        userId: eventAttendees.userId,
        createdAt: eventAttendees.createdAt,
        user: users,
      })
      .from(eventAttendees)
      .innerJoin(users, eq(eventAttendees.userId, users.id))
      .where(eq(eventAttendees.eventId, eventId));
  }

  async addEventAttendee(eventId: number, userId: number): Promise<EventAttendee> {
    const [attendee] = await db
      .insert(eventAttendees)
      .values({ eventId, userId })
      .returning();
    return attendee;
  }

  async removeEventAttendee(eventId: number, userId: number): Promise<void> {
    await db
      .delete(eventAttendees)
      .where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.userId, userId)));
  }

  async isUserAttending(eventId: number, userId: number): Promise<boolean> {
    const [attendee] = await db
      .select()
      .from(eventAttendees)
      .where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.userId, userId)));
    return !!attendee;
  }

  // Photo operations
  async getPhotos(): Promise<(Photo & { uploadedBy: User })[]> {
    const results = await db
      .select({
        id: photos.id,
        title: photos.title,
        filename: photos.filename,
        originalName: photos.originalName,
        mimeType: photos.mimeType,
        size: photos.size,
        uploadedBy: photos.uploadedBy,
        createdAt: photos.createdAt,
        updatedAt: photos.updatedAt,
        user: users,
      })
      .from(photos)
      .innerJoin(users, eq(photos.uploadedBy, users.id))
      .orderBy(desc(photos.createdAt));
    
    return results.map(result => ({
      id: result.id,
      title: result.title,
      filename: result.filename,
      originalName: result.originalName,
      mimeType: result.mimeType,
      size: result.size,
      uploadedBy: result.user,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    })) as (Photo & { uploadedBy: User })[];
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));
    return photo;
  }

  async createPhoto(photo: InsertPhoto, uploadedBy: number): Promise<Photo> {
    const [newPhoto] = await db
      .insert(photos)
      .values({ ...photo, uploadedBy })
      .returning();
    return newPhoto;
  }

  async updatePhoto(id: number, photo: Partial<InsertPhoto>, userId: number): Promise<Photo> {
    const [updatedPhoto] = await db
      .update(photos)
      .set({ ...photo, updatedAt: new Date() })
      .where(and(eq(photos.id, id), eq(photos.uploadedBy, userId)))
      .returning();
    if (!updatedPhoto) {
      throw new Error("Photo not found or not authorized");
    }
    return updatedPhoto;
  }

  async deletePhoto(id: number, userId: number): Promise<void> {
    await db
      .delete(photos)
      .where(and(eq(photos.id, id), eq(photos.uploadedBy, userId)));
  }

  async getUserPhotos(userId: number): Promise<Photo[]> {
    return await db.select().from(photos).where(eq(photos.uploadedBy, userId));
  }
}

export const storage = new DatabaseStorage();
