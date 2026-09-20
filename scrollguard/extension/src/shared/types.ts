export type Platform = 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'x';

export interface VideoEvent {
  platform: Platform;
  videoId: string;
  startTime: number;      // timestamp in ms
  endTime: number;        // timestamp in ms
  watchDurationMs: number;
  completed: boolean;
  skipped: boolean;
  wasRepeat: boolean;
  inputEvents?: {
    keypressCount: number;
    mousemoveCount: number;
    tabSwitchCount: number;
  };
}

export interface Session {
  sessionId: string;
  platform: Platform;
  startTime: number;      // timestamp in ms
  endTime: number;        // timestamp in ms
  videoEvents: VideoEvent[];
}

export interface PlatformAggregate {
  count: number;
  timeMs: number;
}

export interface DailyAggregate {
  date: string;           // YYYY-MM-DD
  totalVideos: number;
  totalWatchTimeMs: number;
  byPlatform: Record<Platform, PlatformAggregate>;
  byHour: Record<number, number>; // key: 0-23, value: watchDurationMs or videoCount
}
