import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// Store active sessions in memory
const activeSessions = new Set<string>();

// Generate a simple session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Middleware to check if request is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

export function login(password: string): string | null {
  const correctPassword = process.env.THE_BOX_PASSWORD || "the-box";

  if (password === correctPassword) {
    const token = generateSessionToken();
    activeSessions.add(token);
    return token;
  }

  return null;
}

// Remove session
export function logout(token: string): void {
  activeSessions.delete(token);
}
