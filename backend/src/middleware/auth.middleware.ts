import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "../models/model.user.js";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || "lifeos-jwt-secret-phase1-dev-key-2026";

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access token required. Please sign in.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired access token.",
    });
  }
};
