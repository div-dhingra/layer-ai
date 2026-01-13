import { Router } from 'express';
import { db } from '../../lib/db/postgres.js';

const router: Router = Router();

/**
 * GET /v1/gates/:gateId/history
 * Get history for a gate
 */
router.get('/:gateId/history', async (req, res) => {
  try {
    const { gateId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const gate = await db.getGateById(gateId);
    if (!gate) {
      return res.status(404).json({ error: 'Gate not found' });
    }

    if (gate.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const history = await db.getGateHistory(gateId, limit);
    res.json(history);
  } catch (error: any) {
    console.error('Error fetching gate history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * GET /v1/gates/:gateId/activity
 * Get activity log for a gate
 */
router.get('/:gateId/activity', async (req, res) => {
  try {
    const { gateId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    const gate = await db.getGateById(gateId);
    if (!gate) {
      return res.status(404).json({ error: 'Gate not found' });
    }

    if (gate.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const activity = await db.getActivityLog(gateId, limit);
    res.json(activity);
  } catch (error: any) {
    console.error('Error fetching gate activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

/**
 * POST /v1/gates/:gateId/rollback/:historyId
 * Rollback gate to a previous configuration
 */
router.post('/:gateId/rollback/:historyId', async (req, res) => {
  try {
    const { gateId, historyId } = req.params;

    const gate = await db.getGateById(gateId);
    if (!gate) {
      return res.status(404).json({ error: 'Gate not found' });
    }

    if (gate.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get the history entry to rollback to
    const historyEntry = await db.getGateHistoryById(historyId);
    if (!historyEntry) {
      return res.status(404).json({ error: 'History entry not found' });
    }

    if (historyEntry.gateId !== gateId) {
      return res.status(400).json({ error: 'History entry does not belong to this gate' });
    }

    // Create a snapshot of current state before rollback
    await db.createGateHistory(gateId, gate, 'user');

    // Update gate with historical configuration
    const updatedGate = await db.updateGate(gateId, {
      name: historyEntry.name,
      description: historyEntry.description,
      model: historyEntry.model,
      fallbackModels: historyEntry.fallbackModels,
      routingStrategy: historyEntry.routingStrategy,
      temperature: historyEntry.temperature,
      maxTokens: historyEntry.maxTokens,
      topP: historyEntry.topP,
      costWeight: historyEntry.costWeight,
      latencyWeight: historyEntry.latencyWeight,
      qualityWeight: historyEntry.qualityWeight,
      analysisMethod: historyEntry.analysisMethod,
      taskType: historyEntry.taskType,
      taskAnalysis: historyEntry.taskAnalysis,
      systemPrompt: historyEntry.systemPrompt,
      reanalysisPeriod: historyEntry.reanalysisPeriod,
      autoApplyRecommendations: historyEntry.autoApplyRecommendations,
    });

    // Log the rollback activity
    await db.createActivityLog(
      gateId,
      req.userId!,
      'rollback',
      {
        historyId,
        previousModel: gate.model,
        rolledBackToModel: historyEntry.model,
        appliedAt: historyEntry.appliedAt,
      }
    );

    res.json(updatedGate);
  } catch (error: any) {
    console.error('Error rolling back gate:', error);
    res.status(500).json({ error: 'Failed to rollback gate' });
  }
});

export default router;
