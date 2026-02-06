import { db } from './db/postgres.js';

interface GateSpendingUpdate {
  gateId: string;
  cost: number;
  exceeded?: boolean;
  newSpending?: number;
  blocked?: boolean;
}

export const gateSpendingTracker = {
  async trackSpending(gateId: string, cost: number): Promise<GateSpendingUpdate> {
    try {
      const limitCheck = await db.checkGateSpendingLimit(gateId);

      if (!limitCheck.allowed) {
        return {
          gateId,
          cost,
          blocked: true,
          newSpending: limitCheck.currentSpending,
        };
      }

      await db.trackGateSpending(gateId, cost);

      const spendingInfo = await db.getGateSpending(gateId);
      if (!spendingInfo) {
        return { gateId, cost };
      }

      const { spendingLimit, spendingCurrent, spendingEnforcement } = spendingInfo;
      const exceeded = spendingLimit !== null && spendingCurrent > spendingLimit;

      await this.checkAlertThresholds(gateId, spendingCurrent, spendingLimit);

      return {
        gateId,
        cost,
        exceeded,
        newSpending: spendingCurrent,
      };
    } catch (error) {
      console.error('[Gate Spending] Error tracking spending:', error);
      return { gateId, cost };
    }
  },

  async checkAlertThresholds(
    gateId: string,
    currentSpending: number,
    limit: number | null
  ): Promise<void> {
    if (!limit || limit === 0) return;

    const percentage = (currentSpending / limit) * 100;
    const thresholds = [80, 90, 100];

    for (const threshold of thresholds) {
      if (percentage >= threshold && percentage < threshold + 10) {
        console.log(
          `[Gate Spending] Alert: Gate ${gateId} at ${threshold}% of limit ($${currentSpending}/$${limit})`
        );
        // TODO: Send email/webhook alert
        break;
      }
    }
  },

  async checkBeforeRequest(gateId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const limitCheck = await db.checkGateSpendingLimit(gateId);

    if (!limitCheck.allowed) {
      return {
        allowed: false,
        reason: limitCheck.reason || 'Gate spending limit exceeded',
      };
    }

    return { allowed: true };
  },
};
