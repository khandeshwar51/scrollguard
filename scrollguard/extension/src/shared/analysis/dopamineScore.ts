import type { DailyAggregate, Session } from '../types';
import { calculateScrollSpeed } from './scrollSpeed';

/**
 * Psychological Weighting System & Rationale:
 *
 * 1. Video Count Score (Max 25 points):
 *    - Rationale: High quantity of video clips exposed to the user triggers frequent novelty impulses.
 *    - Calculation: Normalized against the user's 30-day average to reward individual rhythm adjustments.
 *
 * 2. Scroll Speed Score (Max 20 points):
 *    - Rationale: Extremely fast swipe speeds (<4s/video) align with search for instant gratification.
 *      This high swipe frequency triggers quick, micro-bursts of dopamine (variable-ratio reinforcement).
 *
 * 3. Late Night Score (Max 15 points):
 *    - Rationale: Circadian/sleep disruption. Binging between 11 PM and 4 AM suppresses melatonin release,
 *      reinforcing nocturnal habit loops.
 *
 * 4. Session Repetition Score (Max 15 points):
 *    - Rationale: Habit-loop returning. Re-opening short-form feeds 3+ times a day indicates
 *      compulsive trigger-action loops.
 *
 * 5. Binge Score (Max 15 points):
 *    - Rationale: Single continuous sessions >25 minutes show deep absorption and poor boundary self-control,
 *      driven by the variable-ratio reinforcement schedules of feed algorithms.
 *
 * 6. Breaks Taken Bonus (Max -10 points):
 *    - Rationale: Rewarding self-regulation. Natural gaps >20 minutes during waking hours (6 AM - 11 PM)
 *      allow dopamine baseline levels to recover, breaking the instant-gratification circuit.
 */

export interface DopamineScoreBreakdown {
  total: number;
  videoCountScore: number;
  scrollSpeedScore: number;
  lateNightScore: number;
  repetitionScore: number;
  bingeScore: number;
  breaksBonus: number;
}

/**
 * Calculate the number of waking breaks (>20 minutes) between sessions today.
 * Waking hours defined as 6:00 AM to 11:00 PM.
 */
export function countWakingBreaks(sessions: Session[]): number {
  if (sessions.length <= 1) return 0;

  // Sort sessions chronologically
  const sorted = [...sessions].sort((a, b) => a.startTime - b.startTime);
  let breaks = 0;

  for (let i = 0; i < sorted.length - 1; i++) {
    const end = sorted[i].endTime;
    const startNext = sorted[i + 1].startTime;
    const gapMs = startNext - end;

    // Check if the gap is greater than 20 minutes (1200000ms)
    if (gapMs >= 20 * 60 * 1000) {
      const endDate = new Date(end);
      const endHour = endDate.getHours();

      // Check if the gap occurred within waking hours (6:00 AM to 11:00 PM)
      if (endHour >= 6 && endHour < 23) {
        breaks++;
      }
    }
  }

  return breaks;
}

/**
 * Pure function to calculate a user's dopamine score (0 - 100).
 */
export function calculateDopamineScore(
  dailyAggregate: DailyAggregate,
  rolling30DayAvgVideos: number,
  sessions: Session[]
): DopamineScoreBreakdown {
  const baselineVideos = rolling30DayAvgVideos > 0 ? rolling30DayAvgVideos : 50;

  // 1. Video Count Score (Max 25)
  // Normalized: reaching twice the baseline count gives full 25 points
  const countRatio = dailyAggregate.totalVideos / baselineVideos;
  const videoCountScore = Math.min(25, Math.round(countRatio * 12.5 * 10) / 10);

  // 2. Scroll Speed Score (Max 20)
  const speedInfo = calculateScrollSpeed(
    dailyAggregate.totalWatchTimeMs,
    dailyAggregate.totalVideos
  );
  let scrollSpeedScore = 0;
  if (speedInfo.level === 'Critical') scrollSpeedScore = 20;
  else if (speedInfo.level === 'Risky') scrollSpeedScore = 15;
  else if (speedInfo.level === 'Moderate') scrollSpeedScore = 10;

  // 3. Late Night Score (Max 15)
  // Late night defined as 11 PM (23) to 4 AM (4) inclusive
  const lateNightHours = [23, 0, 1, 2, 3];
  let lateNightTimeMs = 0;
  lateNightHours.forEach((h) => {
    lateNightTimeMs += dailyAggregate.byHour[h] || 0;
  });

  const lateNightRatio =
    dailyAggregate.totalWatchTimeMs > 0
      ? lateNightTimeMs / dailyAggregate.totalWatchTimeMs
      : 0;
  const lateNightScore = Math.min(15, Math.round(lateNightRatio * 15 * 10) / 10);

  // 4. Session Repetition Score (Max 15)
  // Returning 3+ times in a single day
  const repetitionScore = sessions.length >= 3 ? 15 : 0;

  // 5. Binge Score (Max 15)
  // Reaching a single continuous session of >25 minutes
  let hasBinge = false;
  for (const session of sessions) {
    if (session.endTime - session.startTime > 25 * 60 * 1000) {
      hasBinge = true;
      break;
    }
  }
  const bingeScore = hasBinge ? 15 : 0;

  // 6. Breaks Taken Bonus (Max -10)
  // Natural gaps >20 minutes during waking hours. Subtracts 2 points per break.
  const breaksCount = countWakingBreaks(sessions);
  const breaksBonus = Math.min(10, breaksCount * 2);

  // Compile total
  const rawTotal =
    videoCountScore +
    scrollSpeedScore +
    lateNightScore +
    repetitionScore +
    bingeScore -
    breaksBonus;

  const total = Math.max(0, Math.min(100, Math.round(rawTotal)));

  return {
    total,
    videoCountScore,
    scrollSpeedScore,
    lateNightScore,
    repetitionScore,
    bingeScore,
    breaksBonus,
  };
}
