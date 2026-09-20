import { useState, useEffect } from 'react';
import { Shield, ChevronRight, AlertTriangle, Minimize2 } from 'lucide-react';

/**
 * Focus Lock State Machine: Escalating Cognitive Friction Ladder
 *
 * Rationale (Psychological Basis):
 * Reactance Theory (Brehm, 1966) states that when people feel their freedom is restricted
 * (e.g., hard site blocks), they exhibit reactance, trying to rebel against the blocker.
 * By implementing escalating friction rather than a hard wall, we bypass the emotional threat
 * response, gently moving the user from autopilot/system 1 thinking to conscious/system 2
 * awareness (Kahneman, 2011) to break the habit loop.
 *
 * 1. Soft Nudge (State: nudge):
 *    - Introduces soft friction by prompting a choice (Continue vs. I'm Done). Breaks automated
 *      swipes by inserting decision checkpoints.
 *
 * 2. Intent Entry (State: reason):
 *    - Interventions force user reflection (System 2 engagement). Exerting active effort (typing
 *      a reason) breaks the stimulus-response scroll cycle.
 *
 * 3. Breathing Pause (State: breathe):
 *    - Restores cognitive control via autonomic nervous system activation (4-7-8 breathing reduces
 *      stress and slows pulse rate, lowering dopamine urgency).
 *
 * 4. Full Interstitial (State: full):
 *    - The ultimate friction step, physically separating the user from content while providing
 *      healthy alternatives (hydrating, stretching) to seek non-digital satisfaction.
 */
import { determineFrictionLadderState } from '../shared/analysis/behavior';
import type { FocusState } from '../shared/analysis/behavior';

// --- Dynamic Brain Character SVGs ---

/** Stage 1: Fresh & Happy Cute Brain (Sparkling big anime eyes, cute smile, rosy cheeks) */
function HappyBrainSVG({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 26C6 26 3 22.5 3 18C3 14.5 5.5 11.5 9 10.5C8.5 8 9.5 5 12.5 3.5C15.5 2 19 3 20.5 5.5C22.5 3.5 26 3 28.5 5C31 7 31.5 10 30.5 12C33 13.5 34 16.5 33.5 19.5C33 23 30 26 26 26C24 26 22 25 21 24C20 25.5 17 26.5 14 26C13 26 11 26 10 26Z"
        fill="#FFADC4"
        stroke="#E06C89"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 9C14 10.5 15 13 14.5 15" stroke="#E06C89" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M23 8C22.5 10.5 23 13 24 14.5" stroke="#E06C89" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18 5.5V11" stroke="#E06C89" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="8.5" cy="20" rx="2.5" ry="1.5" fill="#F43F5E" fillOpacity="0.4" />
      <ellipse cx="27.5" cy="20" rx="2.5" ry="1.5" fill="#F43F5E" fillOpacity="0.4" />
      <ellipse cx="12.5" cy="17" rx="3.2" ry="4" fill="#18181B" />
      <circle cx="11.5" cy="15.2" r="1.3" fill="white" />
      <circle cx="13.8" cy="18.2" r="0.7" fill="white" />
      <ellipse cx="23.5" cy="17" rx="3.2" ry="4" fill="#18181B" />
      <circle cx="22.5" cy="15.2" r="1.3" fill="white" />
      <circle cx="24.8" cy="18.2" r="0.7" fill="white" />
      <path d="M16.5 20C17.2 21.2 18.8 21.2 19.5 20" stroke="#7A2238" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Stage 2: Strained / Worried Brain (Drooping sad eyes, worried tilted brows, sweat/tear drop) */
function SadBrainSVG({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 26C6 26 3 22.5 3 18C3 14.5 5.5 11.5 9 10.5C8.5 8 9.5 5 12.5 3.5C15.5 2 19 3 20.5 5.5C22.5 3.5 26 3 28.5 5C31 7 31.5 10 30.5 12C33 13.5 34 16.5 33.5 19.5C33 23 30 26 26 26C24 26 22 25 21 24C20 25.5 17 26.5 14 26C13 26 11 26 10 26Z"
        fill="#FFA4B5"
        stroke="#D95373"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 9C14 10.5 15 13 14.5 15" stroke="#D95373" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M23 8C22.5 10.5 23 13 24 14.5" stroke="#D95373" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.5 12.5C11.5 14 13.5 14.5 14.5 14" stroke="#7A2238" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M26.5 12.5C24.5 14 22.5 14.5 21.5 14" stroke="#7A2238" strokeWidth="1.3" strokeLinecap="round" />
      <ellipse cx="12.5" cy="18" rx="3.4" ry="4.2" fill="#18181B" />
      <circle cx="11.5" cy="16.5" r="1.5" fill="white" />
      <circle cx="13.5" cy="19.5" r="0.6" fill="white" />
      <ellipse cx="23.5" cy="18" rx="3.4" ry="4.2" fill="#18181B" />
      <circle cx="22.5" cy="16.5" r="1.5" fill="white" />
      <circle cx="24.5" cy="19.5" r="0.6" fill="white" />
      <path d="M16 22C17 20.8 19 20.8 20 22" stroke="#7A2238" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 17C29 17 30 18.2 30 19C30 20 29 20.8 28 20.8C27 20.8 26 20 26 19C26 18.2 27 17 28 17Z" fill="#38BDF8" />
    </svg>
  );
}

/** Stage 3: Fried Zombie Brainrot (Withered grey tone, dark sunken eye bags, half-closed sleepy lids) */
function ZombieBrainSVG({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 26C6 26 3 22.5 3 18C3 14.5 5.5 11.5 9 10.5C8.5 8 9.5 5 12.5 3.5C15.5 2 19 3 20.5 5.5C22.5 3.5 26 3 28.5 5C31 7 31.5 10 30.5 12C33 13.5 34 16.5 33.5 19.5C33 23 30 26 26 26C24 26 22 25 21 24C20 25.5 17 26.5 14 26C13 26 11 26 10 26Z"
        fill="#A8A29E"
        stroke="#78716C"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8 8L11 11L10 14" stroke="#57534E" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M28 8L25 11L26 14" stroke="#57534E" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M18 4L18 10" stroke="#57534E" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9 19C10 22 15 22 16 19" stroke="#44403C" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 19C21 22 26 22 27 19" stroke="#44403C" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="12.5" cy="17" rx="3.5" ry="2.2" fill="#292524" />
      <circle cx="12.5" cy="17.2" r="1.1" fill="#DC2626" />
      <ellipse cx="23.5" cy="17" rx="3.5" ry="2.2" fill="#292524" />
      <circle cx="23.5" cy="17.2" r="1.1" fill="#DC2626" />
      <path d="M9 16C11 14.8 14 14.8 16 16" stroke="#57534E" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20 16C22 14.8 25 14.8 27 16" stroke="#57534E" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M15 23.5C16 22.5 17.5 24 18.5 23C19.5 22.5 21 23.5 21.5 23.5" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Component supporting custom animated GIF/PNG files if available in public folder, with fallback to SVGs */
function BrainAvatar({ stage, size = 26 }: { stage: 1 | 2 | 3; size?: number }) {
  const [imgError, setImgError] = useState(false);

  const customSrc = (() => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        return chrome.runtime.getURL(`brain_stage${stage}.gif`);
      }
    } catch (_) {}
    return null;
  })();

  if (customSrc && !imgError) {
    return (
      <img
        src={customSrc}
        alt={`Brain Stage ${stage}`}
        style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
        onError={() => setImgError(true)}
      />
    );
  }

  if (stage === 1) return <HappyBrainSVG size={size} />;
  if (stage === 2) return <SadBrainSVG size={size} />;
  return <ZombieBrainSVG size={size} />;
}

/** Interactive Pill-shaped Brain Badge [🧠 14] matching the user's reference design */
function BrainPillBadge({
  stage,
  count,
  onClick,
  title,
}: {
  stage: 1 | 2 | 3;
  count: number;
  onClick: () => void;
  title?: string;
}) {
  const badgeStyles: React.CSSProperties =
    stage === 1
      ? {
          backgroundColor: '#faecd0',
          borderColor: '#dfc79b',
          color: '#5c2d11',
          boxShadow: '0 4px 14px rgba(0,0,0,0.28)',
        }
      : stage === 2
      ? {
          backgroundColor: '#ffedd5',
          borderColor: '#fdba74',
          color: '#7c2d12',
          boxShadow: '0 4px 14px rgba(249,115,22,0.22)',
        }
      : {
          backgroundColor: '#1c1917',
          borderColor: '#f43f5e',
          color: '#f87171',
          boxShadow: '0 0 16px rgba(244,63,94,0.4)',
        };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title || `ScrollGuard: ${count} clips watched`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        padding: '5px 12px 5px 8px',
        borderRadius: '9999px',
        border: '1.5px solid',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...badgeStyles,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <BrainAvatar stage={stage} size={26} />
      <span
        style={{
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '15px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {count}
      </span>
    </button>
  );
}

const getPlatform = (): string => {
  const host = window.location.hostname;
  if (host.includes('youtube.com')) return 'youtube';
  if (host.includes('instagram.com')) return 'instagram';
  if (host.includes('facebook.com')) return 'facebook';
  if (host.includes('tiktok.com')) return 'tiktok';
  if (host.includes('x.com') || host.includes('twitter.com')) return 'x';
  return 'generic';
};

export default function Widget() {
  const platform = getPlatform();

  // Widget visibility/minimize states (default to compact brain pill badge)
  const [minimized, setMinimized] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Stats and limits loaded from local chrome storage
  const [stats, setStats] = useState({ videos: 0, timeMs: 0 });
  const [videoLimit, setVideoLimit] = useState(40);
  const [_timeLimit, setTimeLimit] = useState(30);

  // Live session timer
  const [sessionSecs, setSessionSecs] = useState(0);

  // Dragging coordinates
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem(`scrollguard_widget_pos_${platform}`);
      return saved
        ? JSON.parse(saved)
        : { x: window.innerWidth - 220, y: window.innerHeight - 180 };
    } catch (_) {
      return { x: window.innerWidth - 220, y: window.innerHeight - 180 };
    }
  });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Focus lock states & override metrics tracking
  const [focusState, setFocusState] = useState<FocusState>('idle');
  const [reasonInput, setReasonInput] = useState('');
  
  // Tracking baseline delta checkpoints since limit was exceeded
  const [overrideStartClips, setOverrideStartClips] = useState(0);
  const [overrideStartTime, setOverrideStartTime] = useState(0);
  const [hasExceededLimits, setHasExceededLimits] = useState(false);
  const [nudgeCleared, setNudgeCleared] = useState(false);
  const [reasonCleared, setReasonCleared] = useState(false);
  const [breatheCleared, setBreatheCleared] = useState(false);

  // Session start time for synchronization
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Helper to ensure session has started and storage contains session_start_time
  const ensureSessionStarted = async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const stored = await chrome.storage.local.get(`session_start_${platform}`);
      const storedStart = stored[`session_start_${platform}`];
      if (typeof storedStart === 'number') {
        setSessionStartTime(storedStart);
        setSessionSecs(Math.max(0, Math.floor((Date.now() - storedStart) / 1000)));
      } else {
        const now = Date.now();
        await chrome.storage.local.set({ [`session_start_${platform}`]: now });
        setSessionStartTime(now);
        setSessionSecs(0);
      }
    } else {
      const startKey = `session_start_${platform}`;
      const storedStartVal = localStorage.getItem(startKey);
      if (storedStartVal) {
        const storedStart = parseInt(storedStartVal, 10);
        setSessionStartTime(storedStart);
        setSessionSecs(Math.max(0, Math.floor((Date.now() - storedStart) / 1000)));
      } else {
        const now = Date.now();
        localStorage.setItem(startKey, now.toString());
        setSessionStartTime(now);
        setSessionSecs(0);
      }
    }
  };

  // Helper to update escalation state locally and globally in storage
  const updateEscalationState = async (updates: {
    nudgeCleared?: boolean;
    reasonCleared?: boolean;
    breatheCleared?: boolean;
    overrideStartClips?: number;
    overrideStartTime?: number;
    hasExceededLimits?: boolean;
  }) => {
    const newState = {
      nudgeCleared: updates.nudgeCleared !== undefined ? updates.nudgeCleared : nudgeCleared,
      reasonCleared: updates.reasonCleared !== undefined ? updates.reasonCleared : reasonCleared,
      breatheCleared: updates.breatheCleared !== undefined ? updates.breatheCleared : breatheCleared,
      overrideStartClips: updates.overrideStartClips !== undefined ? updates.overrideStartClips : overrideStartClips,
      overrideStartTime: updates.overrideStartTime !== undefined ? updates.overrideStartTime : overrideStartTime,
      hasExceededLimits: updates.hasExceededLimits !== undefined ? updates.hasExceededLimits : hasExceededLimits,
    };

    if (updates.nudgeCleared !== undefined) setNudgeCleared(updates.nudgeCleared);
    if (updates.reasonCleared !== undefined) setReasonCleared(updates.reasonCleared);
    if (updates.breatheCleared !== undefined) setBreatheCleared(updates.breatheCleared);
    if (updates.overrideStartClips !== undefined) setOverrideStartClips(updates.overrideStartClips);
    if (updates.overrideStartTime !== undefined) setOverrideStartTime(updates.overrideStartTime);
    if (updates.hasExceededLimits !== undefined) setHasExceededLimits(updates.hasExceededLimits);

    const escKey = `escalation_${platform}`;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [escKey]: newState });
    } else {
      localStorage.setItem(escKey, JSON.stringify(newState));
    }
  };

  // Timers for breathing (20s) and takeover (60s)
  const [breathTimer, setBreathTimer] = useState(20);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [takeoverTimer, setTakeoverTimer] = useState(60);

  // 1. Storage reader & listener
  useEffect(() => {
    const loadStatsAndLimits = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const stored = (await chrome.storage.local.get([
          'today_stats',
          'daily_video_limit',
          'daily_time_limit_mins',
          `session_start_${platform}`,
          `escalation_${platform}`,
        ])) as any;
        if (stored.today_stats) setStats(stored.today_stats as any);
        if (typeof stored.daily_video_limit === 'number') setVideoLimit(stored.daily_video_limit);
        if (typeof stored.daily_time_limit_mins === 'number') setTimeLimit(stored.daily_time_limit_mins);

        // Load escalation state
        const storedEscalation = stored[`escalation_${platform}`];
        if (storedEscalation) {
          setNudgeCleared(storedEscalation.nudgeCleared ?? false);
          setReasonCleared(storedEscalation.reasonCleared ?? false);
          setBreatheCleared(storedEscalation.breatheCleared ?? false);
          setOverrideStartClips(storedEscalation.overrideStartClips ?? 0);
          setOverrideStartTime(storedEscalation.overrideStartTime ?? 0);
          setHasExceededLimits(storedEscalation.hasExceededLimits ?? false);
        }
      } else {
        // Fallback for non-extension environment
        const escKey = `escalation_${platform}`;
        const storedEscalationVal = localStorage.getItem(escKey);
        if (storedEscalationVal) {
          const storedEscalation = JSON.parse(storedEscalationVal);
          setNudgeCleared(storedEscalation.nudgeCleared ?? false);
          setReasonCleared(storedEscalation.reasonCleared ?? false);
          setBreatheCleared(storedEscalation.breatheCleared ?? false);
          setOverrideStartClips(storedEscalation.overrideStartClips ?? 0);
          setOverrideStartTime(storedEscalation.overrideStartTime ?? 0);
          setHasExceededLimits(storedEscalation.hasExceededLimits ?? false);
        }
      }

      // Load or initialize session start time
      await ensureSessionStarted();
    };
    loadStatsAndLimits();

    const handleStorageChange = (changes: Record<string, any>) => {
      if (changes.today_stats && changes.today_stats.newValue) {
        setStats(changes.today_stats.newValue);
      }
      if (changes.daily_video_limit && typeof changes.daily_video_limit.newValue === 'number') {
        setVideoLimit(changes.daily_video_limit.newValue);
      }
      if (changes.daily_time_limit_mins && typeof changes.daily_time_limit_mins.newValue === 'number') {
        setTimeLimit(changes.daily_time_limit_mins.newValue);
      }

      // Sync session start time changes
      const sessionStartChange = changes[`session_start_${platform}`];
      if (sessionStartChange) {
        if (typeof sessionStartChange.newValue === 'number') {
          setSessionStartTime(sessionStartChange.newValue);
          setSessionSecs(Math.max(0, Math.floor((Date.now() - sessionStartChange.newValue) / 1000)));
        } else {
          setSessionStartTime(null);
          setSessionSecs(0);
        }
      }

      // Sync escalation state changes
      const escalationChange = changes[`escalation_${platform}`];
      if (escalationChange) {
        if (escalationChange.newValue) {
          const val = escalationChange.newValue;
          setNudgeCleared(val.nudgeCleared ?? false);
          setReasonCleared(val.reasonCleared ?? false);
          setBreatheCleared(val.breatheCleared ?? false);
          setOverrideStartClips(val.overrideStartClips ?? 0);
          setOverrideStartTime(val.overrideStartTime ?? 0);
          setHasExceededLimits(val.hasExceededLimits ?? false);
        } else {
          setNudgeCleared(false);
          setReasonCleared(false);
          setBreatheCleared(false);
          setOverrideStartClips(0);
          setOverrideStartTime(0);
          setHasExceededLimits(false);
        }
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, [platform]);

  // 1b. Active tab interaction check to restore/start session start time
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const handleInteraction = () => {
      if (debounceTimer) return;
      debounceTimer = setTimeout(() => {
        ensureSessionStarted();
        debounceTimer = null;
      }, 1000); // Debounce to once per second
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        ensureSessionStarted();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('scroll', handleInteraction, { passive: true });
    window.addEventListener('click', handleInteraction, { passive: true });
    window.addEventListener('keydown', handleInteraction, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [platform]);

  // 2. Incremental live session timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (sessionStartTime) {
        setSessionSecs(Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000)));
      } else {
        setSessionSecs(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  // 3. Coordinate Dragging events
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea')) return;
    setDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 220, e.clientX - dragOffset.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 180, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (dragging) {
        setDragging(false);
        try {
          localStorage.setItem(`scrollguard_widget_pos_${platform}`, JSON.stringify(position));
        } catch (_) {}
      }
    };

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, position, dragOffset, platform]);

  // 4. Calculations: current totals
  const totalVideosWatched = stats.videos; 
  const totalWatchTimeMs = stats.timeMs;
  const totalTimeMins = totalWatchTimeMs / 60000;

  // Calculate dynamic brain stage based on daily limit progression
  const brainStage: 1 | 2 | 3 =
    totalVideosWatched <= Math.max(10, Math.floor(videoLimit * 0.5))
      ? 1
      : totalVideosWatched <= videoLimit
      ? 2
      : 3;

  // Progress goals ratios
  const videoProgress = Math.min(1.0, totalVideosWatched / videoLimit);
  const maxProgressRatio = videoProgress;

  const isLimitExceeded = totalVideosWatched > videoLimit;

  // Remaining budget calculations
  const remainingClips = Math.max(0, videoLimit - totalVideosWatched);

  // 5. State Machine Transition Engine
  useEffect(() => {
    if (!isLimitExceeded) {
      if (hasExceededLimits) {
        updateEscalationState({
          hasExceededLimits: false,
          nudgeCleared: false,
          reasonCleared: false,
          breatheCleared: false,
          overrideStartClips: 0,
          overrideStartTime: 0,
        });
      }
      setFocusState('idle');
      return;
    }

    if (!hasExceededLimits) {
      updateEscalationState({
        hasExceededLimits: true,
        nudgeCleared: false,
        reasonCleared: false,
        breatheCleared: false,
        overrideStartClips: totalVideosWatched,
        overrideStartTime: Date.now(),
      });
      setFocusState('nudge');
      return;
    }

    // Checking Escalation Track checkpoints
    const elapsedMinutes = (Date.now() - overrideStartTime) / 60000;
    const elapsedClips = totalVideosWatched - overrideStartClips;

    const nextState = determineFrictionLadderState({
      isLimitExceeded,
      nudgeCleared,
      reasonCleared,
      breatheCleared,
      elapsedMinutes,
      elapsedClips
    });

    if (nextState !== focusState) {
      setFocusState(nextState);
      if (nextState === 'breathe') {
        setBreathTimer(20);
      } else if (nextState === 'full') {
        setTakeoverTimer(60);
      }
    }
  }, [totalVideosWatched, totalTimeMins, isLimitExceeded, focusState, nudgeCleared, reasonCleared, breatheCleared, hasExceededLimits, overrideStartTime, overrideStartClips, platform]);

  // 6. Breathing and Takeover Interval Countdown Loops
  useEffect(() => {
    if (focusState !== 'breathe') return;
    document.body.style.overflow = 'hidden'; // Lock scrolling during breathing cycle

    const timer = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        // 4s inhale, 7s hold, 8s exhale (Total 19-20 seconds)
        const left = prev - 1;
        if (left > 16) {
          setBreathPhase('Inhale');
        } else if (left > 9) {
          setBreathPhase('Hold');
        } else {
          setBreathPhase('Exhale');
        }
        return left;
      });
    }, 1000);

    return () => {
      document.body.style.overflow = '';
      clearInterval(timer);
    };
  }, [focusState]);

  useEffect(() => {
    if (focusState !== 'full') return;
    document.body.style.overflow = 'hidden'; // Lock scrolling during full takeover

    const timer = setInterval(() => {
      setTakeoverTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      document.body.style.overflow = '';
      clearInterval(timer);
    };
  }, [focusState]);

  // Dismiss handlers
  const handleNudgeDismiss = (continueScrolling: boolean) => {
    if (continueScrolling) {
      updateEscalationState({
        nudgeCleared: true,
        overrideStartClips: totalVideosWatched,
        overrideStartTime: Date.now(),
      });
      setFocusState('idle');
    } else {
      // User says "I'm done" - minimize widget and advice navigation
      setMinimized(true);
      setFocusState('idle');
    }
  };

  const handleReasonSubmit = () => {
    if (reasonInput.trim().length < 5) return;
    updateEscalationState({
      reasonCleared: true,
      overrideStartClips: totalVideosWatched,
      overrideStartTime: Date.now(),
    });
    setFocusState('idle');
  };

  const handleBreatheDismiss = () => {
    updateEscalationState({
      breatheCleared: true,
      overrideStartClips: totalVideosWatched,
      overrideStartTime: Date.now(),
    });
    setFocusState('idle');
  };

  const handleFullDismiss = () => {
    // Reset the loop tracker so they can continue for another span before takeover triggers again
    updateEscalationState({
      nudgeCleared: true,
      reasonCleared: false,
      breatheCleared: false,
      overrideStartClips: totalVideosWatched,
      overrideStartTime: Date.now(),
    });
    setFocusState('idle');
  };

  // Render dismissed state as the dynamic Brain Pill Badge [🧠 14]
  if (dismissed) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999999,
        }}
      >
        <BrainPillBadge
          stage={brainStage}
          count={totalVideosWatched}
          onClick={() => setDismissed(false)}
          title="ScrollGuard: Click to expand details"
        />
      </div>
    );
  }

  // Format times helper
  const liveMins = Math.floor(sessionSecs / 60);
  const liveSecs = sessionSecs % 60;

  return (
    <>
      {/* State 1: Soft Nudge Interstitial Modal */}
      {focusState === 'nudge' && (
        <div className="scrollguard-modal-backdrop">
          <div className="scrollguard-modal-content">
            <AlertTriangle style={{ width: '32px', height: '32px', color: '#f59e0b', margin: '0 auto' }} />
            <h3 className="scrollguard-modal-title">Limit Reached</h3>
            <p className="scrollguard-modal-desc">
              You've hit your daily boundary goal of {videoLimit} clips. Would you like to take a mindful break?
            </p>
            <div className="scrollguard-btn-group">
              <button onClick={() => handleNudgeDismiss(false)} className="scrollguard-btn scrollguard-btn-secondary">
                I'm done
              </button>
              <button onClick={() => handleNudgeDismiss(true)} className="scrollguard-btn scrollguard-btn-primary">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State 2: Intention Entry Blocking Modal */}
      {focusState === 'reason' && (
        <div className="scrollguard-modal-backdrop">
          <div className="scrollguard-modal-content">
            <Shield style={{ width: '32px', height: '32px', color: '#6366f1', margin: '0 auto' }} />
            <h3 className="scrollguard-modal-title" style={{ color: '#818cf8' }}>State Intention</h3>
            <p className="scrollguard-modal-desc">
              Please enter your reason for overriding the daily focus goal before playing the next clip:
            </p>
            <input
              type="text"
              placeholder="e.g. Researching recipes, study break"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              onKeyPress={(e) => e.stopPropagation()}
              className="scrollguard-input"
            />
            <div className="scrollguard-btn-group">
              <button
                onClick={handleReasonSubmit}
                disabled={reasonInput.trim().length < 5}
                className="scrollguard-btn scrollguard-btn-primary"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State 3: Forced Breathing Pause Modal */}
      {focusState === 'breathe' && (
        <div className="scrollguard-modal-backdrop">
          <div className="scrollguard-modal-content">
            <h3 className="scrollguard-modal-title" style={{ color: '#a855f7' }}>Breathing Space</h3>
            <p className="scrollguard-modal-desc">
              Pacing pause enabled. Follow the circular guide to reset dopamine baselines:
            </p>
            
            <div className="scrollguard-breathing-circle">
              <span>{breathTimer}s</span>
              <span className="scrollguard-breathe-phase">{breathPhase}</span>
            </div>

            <div className="scrollguard-btn-group">
              <button
                onClick={handleBreatheDismiss}
                disabled={breathTimer > 0}
                className="scrollguard-btn scrollguard-btn-primary"
              >
                {breathTimer > 0 ? `Breathe... (${breathTimer}s)` : 'Resume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State 4: Fullscreen Takeover Interstitial */}
      {focusState === 'full' && (
        <div className="scrollguard-fullscreen-takeover">
          <div className="scrollguard-takeover-content">
            <Shield style={{ width: '48px', height: '48px', color: '#a855f7' }} />
            <h2 className="scrollguard-takeover-title">Hydrate & Stretch</h2>
            <p className="scrollguard-modal-desc" style={{ fontSize: '13px' }}>
              Repeated overrides detected in this session. Take 60 seconds to stand up, roll your shoulders, or drink a glass of water.
            </p>
            
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#6366f1', margin: '10px 0' }}>
              {takeoverTimer > 0 ? `${takeoverTimer}s remaining` : 'Break Complete'}
            </div>

            <button
              onClick={handleFullDismiss}
              disabled={takeoverTimer > 0}
              className="scrollguard-btn scrollguard-btn-primary"
              style={{ width: '200px', margin: '0 auto' }}
            >
              Resume Scrolling
            </button>
          </div>
        </div>
      )}

      {/* Main Draggable Widget Structure */}
      {focusState === 'idle' && (
        <div
          className="scrollguard-container"
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
          onMouseDown={handleMouseDown}
        >
          {minimized ? (
            <BrainPillBadge
              stage={brainStage}
              count={totalVideosWatched}
              onClick={() => setMinimized(false)}
              title="ScrollGuard: Click to expand details"
            />
          ) : (
            <div className="scrollguard-main-widget">
              <div className="scrollguard-widget-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="scrollguard-dot" />
                  <BrainAvatar stage={brainStage} size={20} />
                  <div className="scrollguard-info">
                    <span className="scrollguard-label">ScrollGuard</span>
                    <span className="scrollguard-status">{liveMins}m {liveSecs}s</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => setDismissed(true)}
                    className="scrollguard-chevron"
                    style={{ padding: '2px' }}
                    title="Dismiss widget for this session"
                  >
                    <Minimize2 style={{ width: '12px', height: '12px' }} />
                  </button>
                  <button
                    onClick={() => setMinimized(true)}
                    className="scrollguard-chevron"
                    style={{ padding: '2px' }}
                    title="Minimize details"
                  >
                    <ChevronRight style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>

              {/* Stats & Progress Layout */}
              <div className="scrollguard-stats-grid">
                <div className="scrollguard-stat-row">
                  <span>Clips Viewed:</span>
                  <span className="scrollguard-stat-val">{totalVideosWatched}</span>
                </div>
                
                {/* Progress bar */}
                <div className="scrollguard-progress-container">
                  <div className="scrollguard-progress-bar">
                    <div
                      className={`scrollguard-progress-fill ${isLimitExceeded ? 'overlimit' : ''}`}
                      style={{ width: `${maxProgressRatio * 100}%` }}
                    />
                  </div>
                  <div className="scrollguard-stat-row" style={{ fontSize: '7.5px' }}>
                    {isLimitExceeded ? (
                      <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Limit exceeded</span>
                    ) : (
                      <span>
                        {remainingClips} clips left
                      </span>
                    )}
                  </div>
                </div>

                <div className="scrollguard-stat-row" style={{ marginTop: '2px' }}>
                  <span>Platform Limit:</span>
                  <span className="scrollguard-stat-val">{videoLimit} clips</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
