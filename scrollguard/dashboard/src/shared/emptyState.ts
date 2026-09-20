import type { BackupData } from './types';

export function createEmptyBackupData(): BackupData {
  return {
    version: '1.0.0',
    exportedAt: Date.now(),
    todayStats: {
      videos: 0,
      timeMs: 0,
      sessions: 0,
    },
    aggregates: {},
    sessions: [],
    videoEvents: [],
  };
}
