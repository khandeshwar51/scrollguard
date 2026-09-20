import { describe, it, expect } from 'vitest';
import { classifyVideoWatch } from './classification';

describe('Video Classification Rules', () => {
  it('should flag accidental opens and suppress completed/skipped tags', () => {
    const res = classifyVideoWatch({
      watchDurationMs: 800,
      videoDurationMs: 30000,
      wasManualNavigation: false,
      wasRepeat: false,
      isAccidental: true,
    });
    expect(res.accidental).toBe(true);
    expect(res.completed).toBe(false);
    expect(res.skipped).toBe(false);
  });

  it('should identify completed video watch when >= 85% of duration', () => {
    const res = classifyVideoWatch({
      watchDurationMs: 8500,
      videoDurationMs: 10000,
      wasManualNavigation: false,
      wasRepeat: false,
      isAccidental: false,
    });
    expect(res.completed).toBe(true);
  });

  it('should not identify completed video watch when < 85% of duration', () => {
    const res = classifyVideoWatch({
      watchDurationMs: 8400,
      videoDurationMs: 10000,
      wasManualNavigation: false,
      wasRepeat: false,
      isAccidental: false,
    });
    expect(res.completed).toBe(false);
  });

  it('should fallback for completion when duration is null', () => {
    const completeRes = classifyVideoWatch({
      watchDurationMs: 16000,
      videoDurationMs: null,
      wasManualNavigation: false,
      wasRepeat: false,
      isAccidental: false,
    });
    expect(completeRes.completed).toBe(true);

    const incompleteRes = classifyVideoWatch({
      watchDurationMs: 5000,
      videoDurationMs: null,
      wasManualNavigation: false,
      wasRepeat: false,
      isAccidental: false,
    });
    expect(incompleteRes.completed).toBe(false);
  });

  it('should flag skipped watches under 2000ms if manual navigation triggered', () => {
    const res = classifyVideoWatch({
      watchDurationMs: 1500,
      videoDurationMs: 30000,
      wasManualNavigation: true,
      wasRepeat: false,
      isAccidental: false,
    });
    expect(res.skipped).toBe(true);
    expect(res.completed).toBe(false);
  });

  it('should not flag skipped if no manual navigation took place', () => {
    const res = classifyVideoWatch({
      watchDurationMs: 1500,
      videoDurationMs: 30000,
      wasManualNavigation: false,
      wasRepeat: false,
      isAccidental: false,
    });
    expect(res.skipped).toBe(false);
  });

  it('should propagate repeat flag status', () => {
    const res = classifyVideoWatch({
      watchDurationMs: 10000,
      videoDurationMs: 30000,
      wasManualNavigation: false,
      wasRepeat: true,
      isAccidental: false,
    });
    expect(res.repeated).toBe(true);
  });
});
