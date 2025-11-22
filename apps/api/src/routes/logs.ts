import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { db } from '../lib/db/postgres.js';
import { authenticate } from '../middleware/auth.js';

const router: RouterType = Router();

// All routes require SDK authentication
router.use(authenticate);

// GET /v1/logs/overview - Get logs for api calls
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [statsResult, gatesResult, recentRequestsResult] = await Promise.all([
      // Get aggregate stats
      db.query(
        `SELECT
          COUNT(*) as total_requests,
          COALESCE(SUM(cost_usd), 0) as total_cost,
          COALESCE(AVG(latency_ms), 0) as avg_latency
         FROM requests
         WHERE user_id = $1`,
        [userId]
      ),
      // Get gates count
      db.query(
        `SELECT COUNT(*) as active_gates FROM gates WHERE user_id = $1`,
        [userId]
      ),
      // Get recent requests
      db.query(
        `SELECT
          id,
          gate_name,
          model_used,
          prompt_tokens,
          completion_tokens,
          total_tokens,
          cost_usd,
          latency_ms,
          success,
          created_at
         FROM requests
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [userId]
      ),
    ]);

    const stats = statsResult.rows[0];
    const gatesCount = gatesResult.rows[0];
    const recentRequests = recentRequestsResult.rows;

    res.json({
      totalRequests: parseInt(stats.total_requests),
      totalCost: parseFloat(stats.total_cost),
      avgLatency: Math.round(parseFloat(stats.avg_latency)),
      activeGates: parseInt(gatesCount.active_gates),
      recentRequests: recentRequests.map((req) => ({
        id: req.id,
        gateName: req.gate_name,
        model: req.model_used,
        promptTokens: req.prompt_tokens,
        completionTokens: req.completion_tokens,
        totalTokens: req.total_tokens,
        cost: parseFloat(req.cost_usd),
        latency: req.latency_ms,
        success: req.success,
        createdAt: req.created_at,
      })),
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'internal_error', message: 'Failed to fetch analytics' });
  }
});

export default router;
