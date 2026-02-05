import { db } from './db/postgres.js';
import { cache } from './db/redis.js';

interface SpendingUpdate {
  userId: string;
  cost: number;
  exceeded?: boolean;
  newSpending?: number;
}

export const spendingTracker = {
  async trackSpending(userId: string, cost: number): Promise<SpendingUpdate> {
    try {
      const newSpending = await cache.incrementUserSpending(userId, cost);

      const spendingInfo = await db.getUserSpending(userId);
      if (!spendingInfo) {
        return { userId, cost, newSpending };
      }

      const { limit, status } = spendingInfo;
      const exceeded = limit !== null && newSpending > limit;

      if (exceeded && status === 'active') {
        await db.setUserStatus(userId, 'over_limit');
        console.log(`[Spending] User ${userId} exceeded limit: ${newSpending} > ${limit}`);
      }

      await this.checkAlertThresholds(userId, newSpending, limit);

      return { userId, cost, exceeded, newSpending };
    } catch (error) {
      console.error('[Spending] Redis error, falling back to DB:', error);
      return await this.trackSpendingDB(userId, cost);
    }
  },

  async trackSpendingDB(userId: string, cost: number): Promise<SpendingUpdate> {
    const result = await db.incrementUserSpending(userId, cost);

    if (result.exceeded) {
      await db.setUserStatus(userId, 'over_limit');
      console.log(`[Spending] User ${userId} exceeded limit: ${result.newSpending} > ${result.limit}`);
    }

    await this.checkAlertThresholds(userId, result.newSpending, result.limit);

    return {
      userId,
      cost,
      exceeded: result.exceeded,
      newSpending: result.newSpending,
    };
  },

  async checkAlertThresholds(userId: string, currentSpending: number, limit: number | null): Promise<void> {
    if (!limit || limit === 0) return;

    const percentage = (currentSpending / limit) * 100;
    const thresholds = [50, 80, 95, 100];

    for (const threshold of thresholds) {
      if (percentage >= threshold) {
        await this.sendAlertIfNeeded(userId, threshold, currentSpending, limit);
        break;
      }
    }
  },

  async sendAlertIfNeeded(userId: string, threshold: number, currentSpending: number, limit: number): Promise<void> {
    console.log(`[Spending] Alert: User ${userId} at ${threshold}% of limit ($${currentSpending}/$${limit})`);
    await db.recordSpendingAlert(userId);
  },

  async syncSpendingToDB(userId: string): Promise<void> {
    try {
      const cachedSpending = await cache.getUserSpending(userId);
      if (cachedSpending !== null) {
        await db.updateUserSpending(userId, cachedSpending);
        console.log(`[Spending] Synced user ${userId}: $${cachedSpending}`);
      }
    } catch (error) {
      console.error(`[Spending] Sync error for user ${userId}:`, error);
    }
  },

  async syncAllSpending(): Promise<void> {
    try {
      const userIds = await cache.getAllCachedSpendingUsers();
      console.log(`[Spending] Syncing ${userIds.length} users to DB`);

      await Promise.all(userIds.map(userId => this.syncSpendingToDB(userId)));

      console.log('[Spending] Sync complete');
    } catch (error) {
      console.error('[Spending] Bulk sync error:', error);
    }
  },

  async warmCache(userId: string): Promise<void> {
    try {
      const spendingInfo = await db.getUserSpending(userId);
      if (spendingInfo) {
        await cache.setUserSpending(userId, spendingInfo.currentSpending);
      }
    } catch (error) {
      console.error(`[Spending] Cache warm error for user ${userId}:`, error);
    }
  },
};
