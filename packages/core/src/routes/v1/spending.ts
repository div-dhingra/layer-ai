import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { db } from '../../lib/db/postgres.js';
import { cache } from '../../lib/db/redis.js';
import { authenticate } from '../../middleware/auth.js';

const router: RouterType = Router();

router.use(authenticate);

// GET /spending - Get current spending information
router.get('/', async (req: Request, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'unauthorized', message: 'Missing user ID' });
    return;
  }

  try {
    const spendingInfo = await db.getUserSpending(req.userId);

    if (!spendingInfo) {
      res.status(404).json({ error: 'not_found', message: 'User spending data not found' });
      return;
    }

    const { currentSpending, limit, periodStart, status, limitEnforcementType } = spendingInfo;

    res.json({
      currentSpending,
      limit,
      periodStart,
      status,
      limitEnforcementType,
      percentUsed: limit ? Math.round((currentSpending / limit) * 100) : null,
    });
  } catch (error) {
    console.error('Get spending error:', error);
    res.status(500).json({ error: 'internal_error', message: 'Failed to get spending data' });
  }
});

// PUT /spending/limit - Update spending limit
router.put('/limit', async (req: Request, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'unauthorized', message: 'Missing user ID' });
    return;
  }

  try {
    const { limit } = req.body;

    if (limit !== null && (typeof limit !== 'number' || limit < 0)) {
      res.status(400).json({ error: 'bad_request', message: 'Limit must be a positive number or null' });
      return;
    }

    await db.setUserSpendingLimit(req.userId, limit);
    await cache.invalidateUserSpending(req.userId);

    res.json({ success: true, limit });
  } catch (error) {
    console.error('Update spending limit error:', error);
    res.status(500).json({ error: 'internal_error', message: 'Failed to update spending limit' });
  }
});

// PUT /spending/enforcement - Update limit enforcement type
router.put('/enforcement', async (req: Request, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'unauthorized', message: 'Missing user ID' });
    return;
  }

  try {
    const { enforcementType } = req.body;

    if (!['alert_only', 'block'].includes(enforcementType)) {
      res.status(400).json({
        error: 'bad_request',
        message: 'Enforcement type must be "alert_only" or "block"'
      });
      return;
    }

    await db.setUserEnforcementType(req.userId, enforcementType);

    res.json({ success: true, enforcementType });
  } catch (error) {
    console.error('Update enforcement type error:', error);
    res.status(500).json({ error: 'internal_error', message: 'Failed to update enforcement type' });
  }
});

// POST /spending/reset - Manually reset spending period
router.post('/reset', async (req: Request, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'unauthorized', message: 'Missing user ID' });
    return;
  }

  try {
    await db.resetUserSpending(req.userId);
    await cache.invalidateUserSpending(req.userId);

    res.json({ success: true, message: 'Spending period reset successfully' });
  } catch (error) {
    console.error('Reset spending error:', error);
    res.status(500).json({ error: 'internal_error', message: 'Failed to reset spending' });
  }
});

export default router;
