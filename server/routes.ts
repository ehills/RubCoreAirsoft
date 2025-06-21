import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertPhotoSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

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
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

      const userId = req.user.claims.sub;
      const { title } = req.body;

      const photoData = {
        title: title || req.file.originalname,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
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
      const userId = req.user.claims.sub;
      const { title } = req.body;
      
      const photo = await storage.updatePhoto(id, { title }, userId);
      res.json(photo);
    } catch (error) {
      console.error("Error updating photo:", error);
      res.status(400).json({ message: "Failed to update photo" });
    }
  });

  app.delete("/api/photos/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
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
