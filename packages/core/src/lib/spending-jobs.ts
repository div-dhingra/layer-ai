import * as cron from 'node-cron';
import { db } from './db/postgres.js';
import { cache } from './db/redis.js';
import { spendingTracker } from './spending-tracker.js';

class SpendingWorker {
  private isRunning = false;
  private syncTask: cron.ScheduledTask | null = null;
  private resetTask: cron.ScheduledTask | null = null;

  start() {
    console.log('[Spending Worker] Starting scheduled jobs');

    // Sync Redis to DB every 5 minutes (offset :02 to avoid other workers)
    this.syncTask = cron.schedule('2/5 * * * *', async () => {
      await this.syncSpendingJob();
    });

    // Check for billing period resets every hour at :20
    this.resetTask = cron.schedule('20 * * * *', async () => {
      await this.resetSpendingPeriodsJob();
      await this.resetGateSpendingPeriodsJob();
      await this.resetUsageCountersJob();
    });

    console.log('[Spending Worker] Cron schedules activated');
  }

  stop() {
    if (this.syncTask) {
      this.syncTask.stop();
    }
    if (this.resetTask) {
      this.resetTask.stop();
    }
    console.log('[Spending Worker] Stopped');
  }

  private async syncSpendingJob(): Promise<void> {
    if (this.isRunning) {
      console.log('[Spending Worker] Sync already in progress, skipping');
      return;
    }

    this.isRunning = true;
    try {
      console.log('[Spending Worker] Starting periodic sync...');
      await spendingTracker.syncAllSpending();
    } catch (error) {
      console.error('[Spending Worker] Sync failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async resetSpendingPeriodsJob(): Promise<void> {
    console.log('[Spending Worker] Checking for billing periods to reset...');
    try {
      const usersToReset = await db.getUsersToResetSpending();

      if (usersToReset.length === 0) {
        console.log('[Spending Worker] No users need reset');
        return;
      }

      console.log(`[Spending Worker] Resetting ${usersToReset.length} users`);

      for (const userId of usersToReset) {
        await db.resetUserSpending(userId);
        await cache.invalidateUserSpending(userId);
        console.log(`[Spending Worker] Reset user ${userId}`);
      }

      console.log('[Spending Worker] Reset complete');
    } catch (error) {
      console.error('[Spending Worker] Reset failed:', error);
    }
  }

  private async resetGateSpendingPeriodsJob(): Promise<void> {
    console.log('[Spending Worker] Checking for gate spending periods to reset...');
    try {
      const gatesToReset = await db.getGatesToResetSpending();

      if (gatesToReset.length === 0) {
        console.log('[Spending Worker] No gates need reset');
        return;
      }

      console.log(`[Spending Worker] Resetting ${gatesToReset.length} gates`);

      for (const gateId of gatesToReset) {
        await db.resetGateSpending(gateId);
        console.log(`[Spending Worker] Reset gate ${gateId}`);
      }

      console.log('[Spending Worker] Gate reset complete');
    } catch (error) {
      console.error('[Spending Worker] Gate reset failed:', error);
    }
  }

  private async resetUsageCountersJob(): Promise<void> {
    console.log('[Spending Worker] Checking for usage counters to reset...');
    try {
      await db.resetDailyUsage();
      await db.resetMonthlyUsage();
      console.log('[Spending Worker] Usage counters reset complete');
    } catch (error) {
      console.error('[Spending Worker] Usage counter reset failed:', error);
    }
  }
}

export const spendingWorker = new SpendingWorker();
