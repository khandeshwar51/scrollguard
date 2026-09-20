import { describe, it, expect } from 'vitest';
import { detectDoomscroll, analyzeTriggerPatterns, determineFrictionLadderState } from './behavior';
import type { Session, VideoEvent } from '../types';

describe('Doomscroll Detection Rules', () => {
  const createMockEvent = (
    startTime: number,
    endTime: number,
    keypressCount = 10,
    mousemoveCount = 50,
    tabSwitchCount = 0
  ): VideoEvent => ({
    platform: 'youtube',
    videoId: 'mock_id',
    startTime,
    endTime,
    watchDurationMs: endTime - startTime,
    completed: true,
    skipped: false,
    wasRepeat: false,
    inputEvents: {
      keypressCount,
      mousemoveCount,
      tabSwitchCount,
    },
  });

  it('should evaluate healthy sessions with low confidence', () => {
    const now = Date.now();
    const session: Session = {
      sessionId: 'healthy-s',
      platform: 'youtube',
      startTime: now,
      endTime: now + 5 * 60 * 1000, // 5 mins
      videoEvents: [
        createMockEvent(now, now + 2 * 60 * 1000), // Active input keypress / mouse
        createMockEvent(now + 2 * 60 * 1000 + 2000, now + 5 * 60 * 1000),
      ],
    };

    const res = detectDoomscroll(session);
    // Keypresses > 0, mousemoves > 0, tabswitches = 0 (+0.15)
    // Count <= 40, length <= 45 mins, pause > 1s
    expect(res.confidence).toBe(0.15);
    expect(res.isDoomscrolling).toBe(false);
  });

  it('should flag compulsive doomscrolling with high confidence', () => {
    const now = Date.now();
    // 45 video events, zero keyboard, zero mouse, zero tab switch, short pause
    const events: VideoEvent[] = [];
    let currentTime = now;

    for (let i = 0; i < 42; i++) {
      events.push(createMockEvent(currentTime, currentTime + 5000, 0, 0, 0));
      currentTime += 5500; // 500ms pause
    }

    const session: Session = {
      sessionId: 'doom-s',
      platform: 'youtube',
      startTime: now,
      endTime: currentTime,
      videoEvents: events,
    };

    const res = detectDoomscroll(session);
    // Signals:
    // Video Count > 40 (+0.3)
    // Zero keypress (+0.15)
    // Zero mouse (+0.15)
    // Zero tab switch (+0.15)
    // Avg pause < 1s (+0.15)
    // Continuous length ~ 3.8 mins (not > 45m)
    // Total confidence expected: 0.3 + 0.15 + 0.15 + 0.15 + 0.15 = 0.9
    expect(res.confidence).toBe(0.9);
    expect(res.isDoomscrolling).toBe(true);
  });
});

describe('AI Trigger Pattern Mining', () => {
  const createMockSession = (startTime: number, endTime: number): Session => ({
    sessionId: 'session_id',
    platform: 'youtube',
    startTime,
    endTime,
    videoEvents: [],
  });

  it('should ignore pattern signals if they occur less than 5 times', () => {
    // Generate only 2 late-night sessions
    const now = new Date('2026-07-17T23:50:00').getTime();
    const sessions: Session[] = [
      createMockSession(now, now + 10 * 60 * 1000),
      createMockSession(now + 24 * 60 * 60 * 1000, now + 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
    ];

    const patterns = analyzeTriggerPatterns(sessions);
    expect(patterns.length).toBe(0); // Under min threshold (5 occurrences)
  });

  it('should detect late-night trigger pattern when occurring 5+ times', () => {
    const sessions: Session[] = [];
    const baseTime = new Date('2026-07-17T23:45:00').getTime();

    // Generate 6 late night sessions across 6 different days
    for (let i = 0; i < 6; i++) {
      const start = baseTime + i * 24 * 60 * 60 * 1000;
      sessions.push(createMockSession(start, start + 10 * 60 * 1000));
    }

    const patterns = analyzeTriggerPatterns(sessions);
    expect(patterns.length).toBe(2);
    expect(patterns[0].pattern).toContain('start scrolling late at night');
    expect(patterns[0].occurrences).toBe(6);
  });
});

describe('Focus Lock Friction Ladder Transitions', () => {

  it('should remain idle if limit is not exceeded', () => {
    const state = determineFrictionLadderState({
      isLimitExceeded: false,
      nudgeCleared: false,
      reasonCleared: false,
      breatheCleared: false,
      elapsedMinutes: 0,
      elapsedClips: 0,
    });
    expect(state).toBe('idle');
  });

  it('should transition to nudge when limit is first exceeded', () => {
    const state = determineFrictionLadderState({
      isLimitExceeded: true,
      nudgeCleared: false,
      reasonCleared: false,
      breatheCleared: false,
      elapsedMinutes: 0,
      elapsedClips: 0,
    });
    expect(state).toBe('nudge');
  });

  it('should remain idle after nudge is cleared until trigger limits are reached', () => {
    const state = determineFrictionLadderState({
      isLimitExceeded: true,
      nudgeCleared: true,
      reasonCleared: false,
      breatheCleared: false,
      elapsedMinutes: 4,
      elapsedClips: 2,
    });
    expect(state).toBe('idle');
  });

  it('should trigger reason modal past 10 minutes or 5 clips', () => {
    const stateByTime = determineFrictionLadderState({
      isLimitExceeded: true,
      nudgeCleared: true,
      reasonCleared: false,
      breatheCleared: false,
      elapsedMinutes: 11,
      elapsedClips: 2,
    });
    const stateByClips = determineFrictionLadderState({
      isLimitExceeded: true,
      nudgeCleared: true,
      reasonCleared: false,
      breatheCleared: false,
      elapsedMinutes: 2,
      elapsedClips: 6,
    });
    expect(stateByTime).toBe('reason');
    expect(stateByClips).toBe('reason');
  });

  it('should trigger breathing pause past 15 minutes or 8 clips', () => {
    const state = determineFrictionLadderState({
      isLimitExceeded: true,
      nudgeCleared: true,
      reasonCleared: true,
      breatheCleared: false,
      elapsedMinutes: 16,
      elapsedClips: 9,
    });
    expect(state).toBe('breathe');
  });

  it('should trigger full takeover intervention past 20 minutes or 11 clips', () => {
    const state = determineFrictionLadderState({
      isLimitExceeded: true,
      nudgeCleared: true,
      reasonCleared: true,
      breatheCleared: true,
      elapsedMinutes: 21,
      elapsedClips: 12,
    });
    expect(state).toBe('full');
  });
});
