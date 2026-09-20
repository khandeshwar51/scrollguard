export interface WatchMetrics {
  watchDurationMs: number;
  videoDurationMs: number | null; // in ms
  wasManualNavigation: boolean;
  wasRepeat: boolean;
  isAccidental: boolean;
}

export interface VideoClassification {
  completed: boolean;
  skipped: boolean;
  repeated: boolean;
  accidental: boolean;
}

/**
 * Pure function to classify a video watch event based on behavioral metrics.
 */
export function classifyVideoWatch(metrics: WatchMetrics): VideoClassification {
  const {
    watchDurationMs,
    videoDurationMs,
    wasManualNavigation,
    wasRepeat,
    isAccidental,
  } = metrics;

  // Accidental-open: tab visible <1s with no scroll/click.
  // Do NOT count completed or skipped towards stats.
  if (isAccidental) {
    return {
      completed: false,
      skipped: false,
      repeated: false,
      accidental: true,
    };
  }

  // Completed rule: watchDurationMs >= 85% of videoDurationMs.
  // Fall back if duration is unavailable (e.g. assume completed if played > 15s)
  const completionThreshold = videoDurationMs
    ? videoDurationMs * 0.85
    : 15000;
  const completed = watchDurationMs >= completionThreshold;

  // Skipped rule: watchDurationMs < 2000ms AND manually navigated (not autoplayed / looped)
  const skipped = watchDurationMs < 2000 && wasManualNavigation && !completed;

  return {
    completed,
    skipped,
    repeated: wasRepeat,
    accidental: false,
  };
}
