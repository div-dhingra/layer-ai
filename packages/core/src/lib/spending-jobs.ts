import { db } from './db/postgres.js';
import { cache } from './db/redis.js';
import { spendingTracker } from './spending-tracker.js';

export const spendingJobs = {
  async syncSpendingJob(): Promise<void> {
    console.log('[Spending Job] Starting periodic sync...');
    try {
      await spendingTracker.syncAllSpending();
    } catch (error) {
      console.error('[Spending Job] Sync failed:', error);
    }
  },

  async resetSpendingPeriodsJob(): Promise<void> {
    console.log('[Spending Job] Checking for billing periods to reset...');
    try {
      const usersToReset = await db.getUsersToResetSpending();

      if (usersToReset.length === 0) {
        console.log('[Spending Job] No users need reset');
        return;
      }

      console.log(`[Spending Job] Resetting ${usersToReset.length} users`);

      for (const userId of usersToReset) {
        await db.resetUserSpending(userId);
        await cache.invalidateUserSpending(userId);
        console.log(`[Spending Job] Reset user ${userId}`);
      }

      console.log('[Spending Job] Reset complete');
    } catch (error) {
      console.error('[Spending Job] Reset failed:', error);
    }
  },

  startScheduledJobs(): void {
    // Sync Redis to DB every 5 minutes
    setInterval(() => {
      this.syncSpendingJob().catch(err => {
        console.error('[Spending Job] Sync interval error:', err);
      });
    }, 5 * 60 * 1000);

    // Check for billing period resets every hour
    setInterval(() => {
      this.resetSpendingPeriodsJob().catch(err => {
        console.error('[Spending Job] Reset interval error:', err);
      });
    }, 60 * 60 * 1000);

    // Run once on startup
    this.syncSpendingJob().catch(err => {
      console.error('[Spending Job] Initial sync error:', err);
    });
    this.resetSpendingPeriodsJob().catch(err => {
      console.error('[Spending Job] Initial reset error:', err);
    });

    console.log('[Spending Job] Scheduled jobs started');
  },
};
