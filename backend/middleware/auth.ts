import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/settings';

// Fixed: Using any type for AuthRequest to resolve "Property does not exist" errors in controllers
export type AuthRequest = any;

// Fixed: Changed req, res and next to any to resolve issues where standard properties and signatures were not recognized in this environment
export const authMiddleware = (req: any, res: any, next: any) => {
    const authHeader = req.headers?.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Token de acesso não fornecido." });
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
        req.userId = decoded.userId;
        // Fix: Changed parameter 'next' to any type as NextFunction was reported as not callable in this context.
        return next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }
};