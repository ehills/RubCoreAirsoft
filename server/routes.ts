import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertEventSchema, insertPhotoSchema, loginSchema, registerSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import exifr from "exifr";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.verifyPassword(email, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req.session as any).userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      (req.session as any).userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Register error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Event routes
  app.get("/api/events", isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData, userId);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(400).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(id, validatedData, userId);
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(400).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      await storage.deleteEvent(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(400).json({ message: "Failed to delete event" });
    }
  });

  // Event attendance routes
  app.get("/api/events/:id/attendees", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const attendees = await storage.getEventAttendees(eventId);
      res.json(attendees);
    } catch (error) {
      console.error("Error fetching attendees:", error);
      res.status(500).json({ message: "Failed to fetch attendees" });
    }
  });

  app.post("/api/events/:id/attend", isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      
      const isAttending = await storage.isUserAttending(eventId, userId);
      if (isAttending) {
        return res.status(400).json({ message: "Already attending this event" });
      }
      
      const attendee = await storage.addEventAttendee(eventId, userId);
      res.status(201).json(attendee);
    } catch (error) {
      console.error("Error adding attendee:", error);
      res.status(400).json({ message: "Failed to attend event" });
    }
  });

  app.delete("/api/events/:id/attend", isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      await storage.removeEventAttendee(eventId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing attendee:", error);
      res.status(400).json({ message: "Failed to unattend event" });
    }
  });

  app.get("/api/events/:id/attending", isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      const isAttending = await storage.isUserAttending(eventId, userId);
      res.json({ attending: isAttending });
    } catch (error) {
      console.error("Error checking attendance:", error);
      res.status(500).json({ message: "Failed to check attendance" });
    }
  });

  // Photo routes
  app.get("/api/photos", isAuthenticated, async (req, res) => {
    try {
      const photos = await storage.getPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.post("/api/photos", isAuthenticated, upload.single('photo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = (req.session as any).userId;
      const { title, description } = req.body;

      // Extract EXIF data for date taken
      let dateTaken = null;
      try {
        const filePath = path.join(uploadDir, req.file.filename);
        const exifData = await exifr.parse(filePath);
        if (exifData && exifData.DateTimeOriginal) {
          dateTaken = new Date(exifData.DateTimeOriginal);
        } else if (exifData && exifData.DateTime) {
          dateTaken = new Date(exifData.DateTime);
        }
      } catch (exifError) {
        console.log("Could not extract EXIF data:", exifError);
      }

      const photoData = {
        title: title || req.file.originalname,
        description: description || null,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        dateTaken,
      };

      const photo = await storage.createPhoto(photoData, userId);
      res.status(201).json(photo);
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(400).json({ message: "Failed to upload photo" });
    }
  });

  app.put("/api/photos/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      const { title, description } = req.body;
      
      const photo = await storage.updatePhoto(id, { title, description }, userId);
      res.json(photo);
    } catch (error) {
      console.error("Error updating photo:", error);
      res.status(400).json({ message: "Failed to update photo" });
    }
  });

  app.delete("/api/photos/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      
      // Get photo to delete file
      const photo = await storage.getPhoto(id);
      if (photo && photo.uploadedBy === userId) {
        const filePath = path.join(uploadDir, photo.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      await storage.deletePhoto(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(400).json({ message: "Failed to delete photo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
