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

  async resetGateSpendingPeriodsJob(): Promise<void> {
    console.log('[Spending Job] Checking for gate spending periods to reset...');
    try {
      const gatesToReset = await db.getGatesToResetSpending();

      if (gatesToReset.length === 0) {
        console.log('[Spending Job] No gates need reset');
        return;
      }

      console.log(`[Spending Job] Resetting ${gatesToReset.length} gates`);

      for (const gateId of gatesToReset) {
        await db.resetGateSpending(gateId);
        console.log(`[Spending Job] Reset gate ${gateId}`);
      }

      console.log('[Spending Job] Gate reset complete');
    } catch (error) {
      console.error('[Spending Job] Gate reset failed:', error);
    }
  },

  async resetUsageCountersJob(): Promise<void> {
    console.log('[Spending Job] Checking for usage counters to reset...');
    try {
      await db.resetDailyUsage();
      await db.resetMonthlyUsage();
      console.log('[Spending Job] Usage counters reset complete');
    } catch (error) {
      console.error('[Spending Job] Usage counter reset failed:', error);
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
      this.resetGateSpendingPeriodsJob().catch(err => {
        console.error('[Spending Job] Gate reset interval error:', err);
      });
      this.resetUsageCountersJob().catch(err => {
        console.error('[Spending Job] Usage counter reset interval error:', err);
      });
    }, 60 * 60 * 1000);

    // Run once on startup
    this.syncSpendingJob().catch(err => {
      console.error('[Spending Job] Initial sync error:', err);
    });
    this.resetSpendingPeriodsJob().catch(err => {
      console.error('[Spending Job] Initial reset error:', err);
    });
    this.resetGateSpendingPeriodsJob().catch(err => {
      console.error('[Spending Job] Initial gate reset error:', err);
    });
    this.resetUsageCountersJob().catch(err => {
      console.error('[Spending Job] Initial usage counter reset error:', err);
    });

    console.log('[Spending Job] Scheduled jobs started');
  },
};
