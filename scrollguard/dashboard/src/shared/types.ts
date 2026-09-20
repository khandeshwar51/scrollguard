import type { Platform } from '../../../extension/src/shared/types';

export interface DailyAggregate {
  date: string;
  totalVideos: number;
  totalWatchTimeMs: number;
  byPlatform: Record<Platform, { count: number; timeMs: number }>;
  byHour: Record<number, number>;
}

export interface VideoEvent {
  platform: Platform;
  videoId: string;
  startTime: number;
  endTime: number;
  watchDurationMs: number;
  completed: boolean;
  skipped: boolean;
  wasRepeat: boolean;
}

export interface Session {
  sessionId: string;
  platform: Platform;
  startTime: number;
  endTime: number;
  videoEvents: VideoEvent[];
}

export interface BackupData {
  version: string;
  exportedAt: number;
  todayStats: {
    videos: number;
    timeMs: number;
    sessions: number;
  };
  aggregates: Record<string, DailyAggregate>;
  sessions: Session[];
  videoEvents: VideoEvent[];
}
