import { Request, Response, NextFunction } from 'express'; 
import crypto from 'crypto'; 
import { db } from '../lib/db/postgres.js'; 

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string; 
      apiKeyHash?: string; 
    }
  }
}

/**
 * Auth middleware for api key validation
 * 
 * Expected header format: 
 * Authorization: Bearer layer_abc123...
 */
export async function authenticate(
  req: Request, 
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization; 

    if (!authHeader) {
      res.status(401).json({
        error: 'unauthorized',
        message: 'Missing Authorization header',
      });
      return; 
    }

    // check format: "Bearer layer_..."
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'unauthorized',
        message: 'Invalid Authorization header format. Expected: Bearer <api_key>',
      });
      return
    }

    const apiKey = authHeader.substring(7); // Remove "Bearer "

    if (!apiKey || !apiKey.startsWith('layer_')) {
      res.status(401).json({
        error: 'unauthorized', 
        message: 'Invalid API key format. Must start with "layer_"',
      }); 
      return;
    }

    const keyHash = crypto 
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');

    const apiKeyRecord = await db.getApiKeyByHash(keyHash); 

    if (!apiKeyRecord) {
      res.status(401).json({
        error: 'unauthorized',
        message: 'Invalid api key',
      });
      return;
    }

    if (!apiKeyRecord.isActive) {
      res.status(401).json({
        error: 'unauthorized', 
        message: 'API key has been revoked',
      }); 
      return;
    }

    // Attach userId to request for downstream handlers
    req.userId = apiKeyRecord.userId; 
    req.apiKeyHash = keyHash;

    // Update last_used_at timestamp (async, dont await)
    db.updateApiKeyLastUsed(keyHash).catch((err) => {
      console.error('Failed to update API key last_used_at:', err);
    });

    next(); 
  } catch(error) {
    console.error('Authentication error:', error); 
    res.status(500).json({
      error: 'internal_error',
      message: 'Authentication failed'
    })
  }
}

/**
 * Optional middleware for endpoints that don't require auth
 * like the health check public endpoints etc.
 */
export function optionalAuth(
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  const authHeader = req.headers.authorization; 

  if (!authHeader) {
    // No auth header = proceed without userId
    next(); 
    return; 
  }

  // if auth header exists, validate it 
  authenticate(req, res, next);
}