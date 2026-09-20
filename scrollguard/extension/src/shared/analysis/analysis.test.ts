import { describe, it, expect } from 'vitest';
import { calculateScrollSpeed } from './scrollSpeed';
import { calculateDopamineScore } from './dopamineScore';
import type { DailyAggregate, Session } from '../types';

describe('Scroll Speed Calculations', () => {
  it('should classify speeds correctly according to thresholds', () => {
    // Healthy: >= 15s
    expect(calculateScrollSpeed(30000, 2).level).toBe('Healthy');
    // Moderate: 8s to 15s
    expect(calculateScrollSpeed(20000, 2).level).toBe('Moderate');
    // Risky: 4s to 8s
    expect(calculateScrollSpeed(10000, 2).level).toBe('Risky');
    // Critical: < 4s
    expect(calculateScrollSpeed(6000, 2).level).toBe('Critical');
  });
});

describe('Dopamine Score Calculations', () => {
  // Setup standard base daily aggregate template
  const createBaseAggregate = (totalVideos: number, watchTimeMs: number): DailyAggregate => {
    const agg: DailyAggregate = {
      date: '2026-07-17',
      totalVideos,
      totalWatchTimeMs: watchTimeMs,
      byPlatform: {
        youtube: { count: totalVideos, timeMs: watchTimeMs },
        instagram: { count: 0, timeMs: 0 },
        facebook: { count: 0, timeMs: 0 },
        tiktok: { count: 0, timeMs: 0 },
        x: { count: 0, timeMs: 0 },
      },
      byHour: {},
    };
    for (let i = 0; i < 24; i++) agg.byHour[i] = 0;
    return agg;
  };

  it('Scenario 1: Low volume, 6s average speed, before 9pm, single session', () => {
    const watchTimeMs = 12 * 6 * 1000; // 12 videos * 6 seconds each = 72,000ms
    const aggregate = createBaseAggregate(12, watchTimeMs);
    // Watched at 14:00 (2 PM), which is before 9 PM
    aggregate.byHour[14] = watchTimeMs;

    const sessions: Session[] = [
      {
        sessionId: 'session-1',
        platform: 'youtube',
        startTime: Date.now() - watchTimeMs,
        endTime: Date.now(),
        videoEvents: [],
      },
    ];

    const breakdown = calculateDopamineScore(aggregate, 50, sessions);
    
    // Rationale:
    // Video Count Score: 12 / 50 * 12.5 = 3 points
    // Scroll Speed Score: 6s is "Risky" = 15 points
    // Late Night: 0 points
    // Repetition: 1 session = 0 points
    // Binge: 72s = 0 points
    // Breaks: 0 points
    // Total: 3 + 15 = 18 points (Healthy/Low compulsive range)
    expect(breakdown.total).toBe(18);
    expect(breakdown.scrollSpeedScore).toBe(15);
    expect(breakdown.videoCountScore).toBe(3);
    expect(breakdown.lateNightScore).toBe(0);
    expect(breakdown.repetitionScore).toBe(0);
  });

  it('Scenario 2: Moderate compulsive behavior', () => {
    const watchTimeMs = 40 * 10 * 1000; // 40 videos * 10s = 400,000ms (~6.7 mins)
    const aggregate = createBaseAggregate(40, watchTimeMs);
    // Split: 30 videos (300,000ms) at 2 PM, 10 videos (100,000ms) at midnight (late night)
    aggregate.byHour[14] = 300 * 1000;
    aggregate.byHour[0] = 100 * 1000; // late night hours

    // 3 distinct sessions (repetition)
    // natural gap of 3 hours between session 1 and 2 (waking break)
    const sessions: Session[] = [
      {
        sessionId: 's-1',
        platform: 'youtube',
        startTime: new Date('2026-07-17T14:00:00').getTime(),
        endTime: new Date('2026-07-17T14:03:00').getTime(),
        videoEvents: [],
      },
      {
        sessionId: 's-2',
        platform: 'youtube',
        startTime: new Date('2026-07-17T17:00:00').getTime(),
        endTime: new Date('2026-07-17T17:03:00').getTime(),
        videoEvents: [],
      },
      {
        sessionId: 's-3',
        platform: 'youtube',
        startTime: new Date('2026-07-17T23:59:00').getTime(),
        endTime: new Date('2026-07-18T00:01:00').getTime(),
        videoEvents: [],
      },
    ];

    const breakdown = calculateDopamineScore(aggregate, 50, sessions);
    
    // Rationale:
    // Video Count Score: 40 / 50 * 12.5 = 10 points
    // Scroll Speed Score: 10s is "Moderate" = 10 points
    // Late Night: 100k / 400k = 25% * 15 = 3.8 points
    // Repetition: 3 sessions = 15 points
    // Binge: 0 points
    // Breaks: 2 waking breaks (s-1 to s-2, and s-2 to s-3) = -4 points
    // Total expected: 10 + 10 + 3.8 + 15 - 4 = 34.8 -> rounded to 35
    expect(breakdown.total).toBe(35);
    expect(breakdown.scrollSpeedScore).toBe(10);
    expect(breakdown.videoCountScore).toBe(10);
    expect(breakdown.lateNightScore).toBe(3.8);
    expect(breakdown.repetitionScore).toBe(15);
    expect(breakdown.breaksBonus).toBe(4);
  });

  it('Scenario 3: High compulsive / critical doomscrolling behavior', () => {
    // 120 videos watched, extremely fast (3s average watch time)
    const watchTimeMs = 120 * 3 * 1000; // 360,000ms (~6 mins)
    const aggregate = createBaseAggregate(120, watchTimeMs);
    // 60% of videos watched at 1 AM (late night)
    aggregate.byHour[1] = watchTimeMs * 0.6;
    aggregate.byHour[14] = watchTimeMs * 0.4;

    // 4 sessions, one of which is a binge session of 30 minutes
    const sessions: Session[] = [
      {
        sessionId: 's-1',
        platform: 'youtube',
        startTime: Date.now() - 30 * 60 * 1000, // 30 minutes duration
        endTime: Date.now(),
        videoEvents: [],
      },
      {
        sessionId: 's-2',
        platform: 'youtube',
        startTime: Date.now() + 10 * 60 * 1000,
        endTime: Date.now() + 15 * 60 * 1000,
        videoEvents: [],
      },
      {
        sessionId: 's-3',
        platform: 'youtube',
        startTime: Date.now() + 20 * 60 * 1000,
        endTime: Date.now() + 25 * 60 * 1000,
        videoEvents: [],
      },
      {
        sessionId: 's-4',
        platform: 'youtube',
        startTime: Date.now() + 30 * 60 * 1000,
        endTime: Date.now() + 35 * 60 * 1000,
        videoEvents: [],
      },
    ];

    const breakdown = calculateDopamineScore(aggregate, 50, sessions);
    
    // Rationale:
    // Video Count Score: 120 / 50 * 12.5 = 30 -> capped at 25 points
    // Scroll Speed Score: 3s is "Critical" = 20 points
    // Late Night: 60% * 15 = 9 points
    // Repetition: 4 sessions = 15 points
    // Binge: 1 session >25 mins = 15 points
    // Breaks: say gaps are less than 20 minutes (s-2 ends at +15m, s-3 starts at +20m -> 5m gap; s-3 ends at +25m, s-4 starts at +30m -> 5m gap)
    // Total expected: 25 + 20 + 9 + 15 + 15 - 0 = 84 points
    expect(breakdown.total).toBeGreaterThanOrEqual(80);
    expect(breakdown.scrollSpeedScore).toBe(20);
    expect(breakdown.videoCountScore).toBe(25);
    expect(breakdown.lateNightScore).toBe(9);
    expect(breakdown.repetitionScore).toBe(15);
    expect(breakdown.bingeScore).toBe(15);
  });
});
