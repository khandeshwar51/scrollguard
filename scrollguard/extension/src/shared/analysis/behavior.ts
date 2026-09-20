import type { Session } from '../types';

export interface DoomscrollResult {
  isDoomscrolling: boolean;
  confidence: number;
}

export interface TriggerPattern {
  pattern: string;
  occurrences: number;
  confidence: number; // 0 to 1
}

/**
 * Rule-based Doomscrolling Detector.
 *
 * Edge Cases & Accessibility Disclaimers (in comments as requested):
 *
 * 1. False Positive Risk (Playlist Watching):
 *    - A user might intentionally watch a video playlist for study/research.
 *    - In this case, count > 40 or length > 45m might trigger.
 *    - However, purposeful research usually involves tab switching (note-taking)
 *      or keyboard interaction (pause/seek, typing).
 *      This lowers the confidence score, avoiding a false positive block.
 *
 * 2. Accessibility Accommodations (No mouse/keyboard):
 *    - Users with motor impairments using eye-trackers, speech input, or switch interfaces
 *      may trigger the "zero keyboard" and "zero mouse" signals consistently.
 *    - Developer note: To prevent penalizing accessibility users, a production system
 *      should calibrate a user-specific baseline of input devices during initialization.
 *      If zero-keyboard/mouse is their normal profile, we zero out these metrics.
 */
export function detectDoomscroll(session: Session): DoomscrollResult {
  const events = session.videoEvents;
  if (events.length === 0) {
    return { isDoomscrolling: false, confidence: 0 };
  }

  let confidence = 0;

  // 1. Continuous video count > 40 in one session (+0.3)
  if (events.length > 40) {
    confidence += 0.3;
  }

  // Aggregate input telemetry
  let totalKeypresses = 0;
  let totalMousemoves = 0;
  let totalTabSwitches = 0;

  events.forEach((ev) => {
    if (ev.inputEvents) {
      totalKeypresses += ev.inputEvents.keypressCount || 0;
      totalMousemoves += ev.inputEvents.mousemoveCount || 0;
      totalTabSwitches += ev.inputEvents.tabSwitchCount || 0;
    }
  });

  // 2. Zero keyboard events during session (+0.15)
  if (totalKeypresses === 0) {
    confidence += 0.15;
  }

  // 3. Zero mouse movement besides scroll/swipe gestures (+0.15)
  if (totalMousemoves === 0) {
    confidence += 0.15;
  }

  // 4. Zero tab-switch away and back (+0.15)
  if (totalTabSwitches === 0) {
    confidence += 0.15;
  }

  // 5. Average pause between videos < 1s (+0.15)
  // Shows high momentum, automatic scrolling
  let totalPauseMs = 0;
  let pauseCounts = 0;
  // Sort events chronologically to compute pauses
  const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const pause = sortedEvents[i + 1].startTime - sortedEvents[i].endTime;
    // Gaps should be positive and not span across large tab sleeping/suspensions (>1 hour)
    if (pause >= 0 && pause < 60 * 60 * 1000) {
      totalPauseMs += pause;
      pauseCounts++;
    }
  }
  const avgPauseMs = pauseCounts > 0 ? totalPauseMs / pauseCounts : 0;
  if (events.length > 1 && avgPauseMs < 1000) {
    confidence += 0.15;
  }

  // 6. Session length > 45 minutes uninterrupted (+0.2)
  const sessionDurationMs = session.endTime - session.startTime;
  if (sessionDurationMs > 45 * 60 * 1000) {
    confidence += 0.2;
  }

  // Cap confidence at 1.0
  confidence = Math.min(1.0, Math.round(confidence * 100) / 100);
  const isDoomscrolling = confidence >= 0.6;

  return {
    isDoomscrolling,
    confidence,
  };
}

/**
 * Pattern-mining algorithm over historical session start times and idle gaps.
 */
export function analyzeTriggerPatterns(allSessions: Session[]): TriggerPattern[] {
  if (allSessions.length < 5) return [];

  // Sort sessions chronologically
  const sorted = [...allSessions].sort((a, b) => a.startTime - b.startTime);

  // Group triggers by weekday + hour ranges
  const triggers = {
    lateNight: { count: 0, dates: new Set<string>() },
    postFocus: { count: 0, dates: new Set<string>() },
    workBreak: { count: 0, dates: new Set<string>() },
  };

  const getDayHourKey = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };

  for (let i = 0; i < sorted.length; i++) {
    const session = sorted[i];
    const sDate = new Date(session.startTime);
    const sHour = sDate.getHours();
    const dateKey = getDayHourKey(session.startTime);

    // Context A: Very Late Hour (11 PM to 4 AM) - Sleep Disruption Proxy
    const isLateNight = sHour >= 23 || sHour < 4;
    if (isLateNight) {
      triggers.lateNight.count++;
      triggers.lateNight.dates.add(dateKey);
    }

    // Gap analysis (requires a preceding session)
    if (i > 0) {
      const prevSession = sorted[i - 1];
      const gapMs = session.startTime - prevSession.endTime;

      // Context B: Post-Focus transition (Long Idle Gap >= 1.5 hours)
      const isLongGap = gapMs >= 1.5 * 60 * 60 * 1000;
      if (isLongGap) {
        triggers.postFocus.count++;
        triggers.postFocus.dates.add(dateKey);
      }

      // Context C: Quick return during task switching (Short Gap between 5 and 20 mins)
      const isShortGap = gapMs >= 5 * 60 * 1000 && gapMs <= 20 * 60 * 1000;
      if (isShortGap) {
        triggers.workBreak.count++;
        triggers.workBreak.dates.add(dateKey);
      }
    }
  }

  const patterns: TriggerPattern[] = [];
  const minOccurrences = 5;

  // Add Late Night Pattern
  if (triggers.lateNight.count >= minOccurrences) {
    const totalDays = triggers.lateNight.dates.size;
    patterns.push({
      pattern: 'You often start scrolling late at night, possibly before sleep.',
      occurrences: triggers.lateNight.count,
      confidence: Math.min(1.0, Math.round((totalDays / 30) * 100) / 100),
    });
  }

  // Add Post-Focus Pattern
  if (triggers.postFocus.count >= minOccurrences) {
    const totalDays = triggers.postFocus.dates.size;
    patterns.push({
      pattern: 'You frequently start scrolling after long offline intervals, possibly as a transition after work or study.',
      occurrences: triggers.postFocus.count,
      confidence: Math.min(1.0, Math.round((totalDays / 30) * 100) / 100),
    });
  }

  // Add Work Break Pattern
  if (triggers.workBreak.count >= minOccurrences) {
    const totalDays = triggers.workBreak.dates.size;
    patterns.push({
      pattern: 'You tend to return for quick scroll sessions after short pauses, possibly during work breaks or task switching.',
      occurrences: triggers.workBreak.count,
      confidence: Math.min(1.0, Math.round((totalDays / 30) * 100) / 100),
    });
  }

  // Sort by occurrence frequency descending
  return patterns.sort((a, b) => b.occurrences - a.occurrences).slice(0, 3);
}

export type FocusState = 'idle' | 'nudge' | 'reason' | 'breathe' | 'full';

export interface FrictionParams {
  isLimitExceeded: boolean;
  nudgeCleared: boolean;
  reasonCleared: boolean;
  breatheCleared: boolean;
  elapsedMinutes: number;
  elapsedClips: number;
}

/**
 * Calculates the next focus lock state based on user limits and override parameters.
 */
export function determineFrictionLadderState(params: FrictionParams): FocusState {
  if (!params.isLimitExceeded) {
    return 'idle';
  }
  
  if (!params.nudgeCleared) {
    return 'nudge';
  }
  
  if (!params.reasonCleared) {
    if (params.elapsedMinutes >= 10 || params.elapsedClips >= 5) {
      return 'reason';
    }
    return 'idle';
  }
  
  if (!params.breatheCleared) {
    if (params.elapsedMinutes >= 15 || params.elapsedClips >= 8) {
      return 'breathe';
    }
    return 'idle';
  }
  
  if (params.elapsedMinutes >= 20 || params.elapsedClips >= 11) {
    return 'full';
  }
  
  return 'idle';
}
