// src/types/express.d.ts
import express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: string;
        // Add any other user properties you need
      };
    }
  }
}