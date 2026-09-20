export type ScrollSpeedLevel = 'Healthy' | 'Moderate' | 'Risky' | 'Critical';

export interface ScrollSpeedInfo {
  avgSecondsPerVideo: number;
  swipeFrequency: number; // clips per minute
  level: ScrollSpeedLevel;
}

/**
 * Maps average seconds watched per video to a behavioral category.
 */
export function getScrollSpeedLevel(avgSeconds: number): ScrollSpeedLevel {
  if (avgSeconds >= 15) return 'Healthy';
  if (avgSeconds >= 8) return 'Moderate';
  if (avgSeconds >= 4) return 'Risky';
  return 'Critical';
}

/**
 * Pure function to calculate scroll speed metrics for a set of statistics.
 */
export function calculateScrollSpeed(watchTimeMs: number, videoCount: number): ScrollSpeedInfo {
  if (videoCount <= 0) {
    return {
      avgSecondsPerVideo: 0,
      swipeFrequency: 0,
      level: 'Healthy',
    };
  }

  const avgSecondsPerVideo = watchTimeMs / videoCount / 1000;
  const durationMinutes = watchTimeMs / 60000;
  const swipeFrequency = durationMinutes > 0 ? videoCount / durationMinutes : 0;

  return {
    avgSecondsPerVideo,
    swipeFrequency,
    level: getScrollSpeedLevel(avgSecondsPerVideo),
  };
}

/**
 * Calculates a rolling average scroll speed in seconds per video from daily aggregates.
 */
export function calculateRollingSpeedAvg(
  aggregates: { totalWatchTimeMs: number; totalVideos: number }[]
): number {
  let totalTimeMs = 0;
  let totalVideos = 0;

  aggregates.forEach((agg) => {
    totalTimeMs += agg.totalWatchTimeMs;
    totalVideos += agg.totalVideos;
  });

  if (totalVideos <= 0) return 0;
  return totalTimeMs / totalVideos / 1000;
}
