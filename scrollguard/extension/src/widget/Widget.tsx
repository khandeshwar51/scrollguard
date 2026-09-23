import { useState, useEffect, useRef } from 'react';
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

/** Clean, sharp SVG Brain Avatar for stages 1, 2, and 3 */
function BrainAvatar({ stage, size = 26 }: { stage: 1 | 2 | 3; size?: number }) {
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

const getTodayDateString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getPlatform = (): string => {
  const host = window.location.hostname;
  if (host.includes('youtube.com')) return 'youtube';
  if (host.includes('instagram.com')) return 'instagram';
  if (host.includes('facebook.com')) return 'facebook';
  if (host.includes('tiktok.com')) return 'tiktok';
  if (host.includes('x.com') || host.includes('twitter.com')) return 'x';
  return 'generic';
};

const isShortsRoute = (): boolean => {
  const path = window.location.pathname;
  const host = window.location.hostname;
  if (host.includes('youtube.com')) {
    return path.startsWith('/shorts');
  }
  if (host.includes('instagram.com')) {
    return path.includes('/reels') || path.includes('/reel');
  }
  if (host.includes('facebook.com')) {
    return path.includes('/reel');
  }
  if (host.includes('tiktok.com')) {
    return true;
  }
  if (host.includes('x.com') || host.includes('twitter.com')) {
    return path.includes('/status/');
  }
  return false;
};

const isShortVideoPlaying = (): boolean => {
  if (document.visibilityState !== 'visible') return false;
  if (!isShortsRoute()) return false;

  const host = window.location.hostname;
  if (host.includes('youtube.com')) {
    const activeSlide = document.querySelector('ytd-reel-video-renderer[is-active]');
    const activeVideo = activeSlide
      ? (activeSlide.querySelector('video') as HTMLVideoElement | null)
      : (window.location.pathname.startsWith('/shorts') ? (document.querySelector('video') as HTMLVideoElement | null) : null);
    return !!activeVideo && !activeVideo.paused && !activeVideo.ended && activeVideo.readyState >= 2;
  }
  const videos = Array.from(document.querySelectorAll('video'));
  return videos.some((v) => !v.paused && !v.ended && v.readyState >= 2 && v.offsetWidth > 100);
};

export default function Widget() {
  const platform = getPlatform();

  // Widget visibility/minimize states (default to compact brain pill badge)
  const [minimized, setMinimized] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Stats and limits loaded from local chrome storage
  const [stats, setStats] = useState({ date: getTodayDateString(), videos: 0, timeMs: 0 });
  const [videoLimit, setVideoLimit] = useState(40);
  const [_timeLimit, setTimeLimit] = useState(30);

  // Live session timer in seconds
  const [sessionSecs, setSessionSecs] = useState(0);

  // Track whether user is currently on a short-form video route (Shorts / Reels)
  const [isOnShorts, setIsOnShorts] = useState(() => isShortsRoute());

  useEffect(() => {
    const updateRoute = () => {
      setIsOnShorts(isShortsRoute());
    };

    window.addEventListener('popstate', updateRoute);
    window.addEventListener('hashchange', updateRoute);
    window.addEventListener('yt-navigate-finish', updateRoute);
    window.addEventListener('yt-page-data-updated', updateRoute);

    const interval = setInterval(updateRoute, 500);

    return () => {
      window.removeEventListener('popstate', updateRoute);
      window.removeEventListener('hashchange', updateRoute);
      window.removeEventListener('yt-navigate-finish', updateRoute);
      window.removeEventListener('yt-page-data-updated', updateRoute);
      clearInterval(interval);
    };
  }, []);

  // Refs for tracking in interval without stale closures
  const activeWatchSecsRef = useRef(0);
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const currentDateRef = useRef(getTodayDateString());

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
  const [takeoverCount, setTakeoverCount] = useState(0);
  const [takeoverBaseClips, setTakeoverBaseClips] = useState(0);

  // Helper to update escalation state locally and globally in storage
  const updateEscalationState = async (updates: {
    nudgeCleared?: boolean;
    reasonCleared?: boolean;
    breatheCleared?: boolean;
    overrideStartClips?: number;
    overrideStartTime?: number;
    hasExceededLimits?: boolean;
    takeoverCount?: number;
    takeoverBaseClips?: number;
  }) => {
    const newState = {
      nudgeCleared: updates.nudgeCleared !== undefined ? updates.nudgeCleared : nudgeCleared,
      reasonCleared: updates.reasonCleared !== undefined ? updates.reasonCleared : reasonCleared,
      breatheCleared: updates.breatheCleared !== undefined ? updates.breatheCleared : breatheCleared,
      overrideStartClips: updates.overrideStartClips !== undefined ? updates.overrideStartClips : overrideStartClips,
      overrideStartTime: updates.overrideStartTime !== undefined ? updates.overrideStartTime : overrideStartTime,
      hasExceededLimits: updates.hasExceededLimits !== undefined ? updates.hasExceededLimits : hasExceededLimits,
      takeoverCount: updates.takeoverCount !== undefined ? updates.takeoverCount : takeoverCount,
      takeoverBaseClips: updates.takeoverBaseClips !== undefined ? updates.takeoverBaseClips : takeoverBaseClips,
    };

    if (updates.nudgeCleared !== undefined) setNudgeCleared(updates.nudgeCleared);
    if (updates.reasonCleared !== undefined) setReasonCleared(updates.reasonCleared);
    if (updates.breatheCleared !== undefined) setBreatheCleared(updates.breatheCleared);
    if (updates.overrideStartClips !== undefined) setOverrideStartClips(updates.overrideStartClips);
    if (updates.overrideStartTime !== undefined) setOverrideStartTime(updates.overrideStartTime);
    if (updates.hasExceededLimits !== undefined) setHasExceededLimits(updates.hasExceededLimits);
    if (updates.takeoverCount !== undefined) setTakeoverCount(updates.takeoverCount);
    if (updates.takeoverBaseClips !== undefined) setTakeoverBaseClips(updates.takeoverBaseClips);

    const escKey = `escalation_${platform}`;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [escKey]: newState });
    } else {
      localStorage.setItem(escKey, JSON.stringify(newState));
    }
  };

  // Timers for breathing (60s) and takeover (dynamic: 60s -> 5m -> 10m -> 15m)
  const [breathTimer, setBreathTimer] = useState(60);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [takeoverTimer, setTakeoverTimer] = useState(60);

  // 1. Storage reader & listener
  useEffect(() => {
    const loadStatsAndLimits = async () => {
      const todayStr = getTodayDateString();
      currentDateRef.current = todayStr;

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const stored = (await chrome.storage.local.get([
          'today_stats',
          'daily_video_limit',
          'daily_time_limit_mins',
          `escalation_${platform}`,
          'timer_reset_v3',
        ])) as any;

        // Reset if new day (24hrs) OR if user requested reset (timer_reset_v3)
        if (!stored.timer_reset_v3 || !stored.today_stats || stored.today_stats.date !== todayStr) {
          const freshStats = { date: todayStr, videos: 0, timeMs: 0, sessions: 0 };
          setStats(freshStats);
          setSessionSecs(0);
          activeWatchSecsRef.current = 0;
          await chrome.storage.local.set({
            today_stats: freshStats,
            timer_reset_v3: true,
          });
          const allData = await chrome.storage.local.get(null);
          const legacyKeys = Object.keys(allData).filter((k) => k.startsWith('session_start_') || k.startsWith('escalation_') || k.startsWith('aggregate_'));
          if (legacyKeys.length > 0) {
            await chrome.storage.local.remove(legacyKeys);
          }
        } else {
          setStats(stored.today_stats);
          setSessionSecs(Math.floor((stored.today_stats.timeMs || 0) / 1000));
        }

        if (typeof stored.daily_video_limit === 'number') setVideoLimit(stored.daily_video_limit);
        if (typeof stored.daily_time_limit_mins === 'number') setTimeLimit(stored.daily_time_limit_mins);

        // Load escalation state
        const storedEscalation = stored[`escalation_${platform}`];
        const currentVideos = stored.today_stats?.videos ?? 0;
        const currentLimit = typeof stored.daily_video_limit === 'number' ? stored.daily_video_limit : 40;

        // If user is below limit or videos is 0, any stored escalation is stale and must be cleared!
        if (currentVideos < currentLimit || currentVideos === 0) {
          setNudgeCleared(false);
          setReasonCleared(false);
          setBreatheCleared(false);
          setOverrideStartClips(0);
          setOverrideStartTime(0);
          setHasExceededLimits(false);
          setTakeoverCount(0);
          setTakeoverBaseClips(0);
          if (storedEscalation) {
            await chrome.storage.local.remove(`escalation_${platform}`);
          }
        } else if (storedEscalation) {
          setNudgeCleared(storedEscalation.nudgeCleared ?? false);
          setReasonCleared(storedEscalation.reasonCleared ?? false);
          setBreatheCleared(storedEscalation.breatheCleared ?? false);
          setOverrideStartClips(storedEscalation.overrideStartClips ?? 0);
          setOverrideStartTime(storedEscalation.overrideStartTime ?? 0);
          setHasExceededLimits(storedEscalation.hasExceededLimits ?? false);
          setTakeoverCount(storedEscalation.takeoverCount ?? 0);
          setTakeoverBaseClips(storedEscalation.takeoverBaseClips ?? 0);
        }
      } else {
        const freshStats = { date: todayStr, videos: 0, timeMs: 0, sessions: 0 };
        setStats(freshStats);
        setSessionSecs(0);
      }
    };
    loadStatsAndLimits();

    const handleStorageChange = (changes: Record<string, any>) => {
      if (changes.today_stats && changes.today_stats.newValue) {
        const newStats = changes.today_stats.newValue;
        setStats(newStats);
        activeWatchSecsRef.current = 0;
        setSessionSecs(Math.floor((newStats.timeMs || 0) / 1000));
        // If videos reset to 0, clear all escalation state
        if ((newStats.videos ?? 0) === 0) {
          setHasExceededLimits(false);
          setNudgeCleared(false);
          setReasonCleared(false);
          setBreatheCleared(false);
          setOverrideStartClips(0);
          setOverrideStartTime(0);
          setTakeoverCount(0);
          setTakeoverBaseClips(0);
          setFocusState('idle');
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.remove(`escalation_${platform}`);
          }
        }
      }
      if (changes.daily_video_limit && typeof changes.daily_video_limit.newValue === 'number') {
        const newLimit = changes.daily_video_limit.newValue;
        setVideoLimit(newLimit);
        // If current watched count is now below the new limit, reset escalation
        if ((statsRef.current?.videos ?? 0) < newLimit) {
          setHasExceededLimits(false);
          setNudgeCleared(false);
          setReasonCleared(false);
          setBreatheCleared(false);
          setOverrideStartClips(0);
          setOverrideStartTime(0);
          setTakeoverCount(0);
          setTakeoverBaseClips(0);
          setFocusState('idle');
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.remove(`escalation_${platform}`);
          }
        }
      }
      if (changes.daily_time_limit_mins && typeof changes.daily_time_limit_mins.newValue === 'number') {
        setTimeLimit(changes.daily_time_limit_mins.newValue);
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
          setTakeoverCount(val.takeoverCount ?? 0);
          setTakeoverBaseClips(val.takeoverBaseClips ?? 0);
        } else {
          setNudgeCleared(false);
          setReasonCleared(false);
          setBreatheCleared(false);
          setOverrideStartClips(0);
          setOverrideStartTime(0);
          setHasExceededLimits(false);
          setTakeoverCount(0);
          setTakeoverBaseClips(0);
        }
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, [platform]);

  // 2. Incremental live watch timer - ONLY counts while actively watching a Short/Reel video
  useEffect(() => {
    const timer = setInterval(() => {
      const todayStr = getTodayDateString();

      // 24-Hour / Midnight reset check
      if (todayStr !== currentDateRef.current) {
        console.log(`[ScrollGuard] 24-hour rollover detected (${todayStr}). Resetting timer and reels count.`);
        currentDateRef.current = todayStr;
        activeWatchSecsRef.current = 0;
        const freshStats = { date: todayStr, videos: 0, timeMs: 0, sessions: 0 };
        setStats(freshStats);
        setSessionSecs(0);
        setHasExceededLimits(false);
        setNudgeCleared(false);
        setReasonCleared(false);
        setBreatheCleared(false);
        setTakeoverCount(0);
        setTakeoverBaseClips(0);
        setFocusState('idle');
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ today_stats: freshStats });
          chrome.storage.local.remove([`session_start_${platform}`, `escalation_${platform}`]);
        }
        return;
      }

      // Live counting only when actively playing a short/reel video
      if (isShortVideoPlaying()) {
        activeWatchSecsRef.current += 1;
        const baseSecs = Math.floor((statsRef.current.timeMs || 0) / 1000);
        setSessionSecs(baseSecs + activeWatchSecsRef.current);
      }
      // When not watching (on homepage, regular video, paused): timer stays paused without incrementing
    }, 1000);

    return () => clearInterval(timer);
  }, [platform]);

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
  // Stage 1 (Happy):   0 → 49% of limit (e.g. 0 to 4 for limit 10)
  // Stage 2 (Worried): 50% → 99% of limit (e.g. 5 to 9 for limit 10)
  // Stage 3 (Zombie):  100%+ (limit reached/exceeded) (e.g. 10+ for limit 10)
  const brainStage: 1 | 2 | 3 =
    totalVideosWatched < Math.floor(videoLimit * 0.5)
      ? 1
      : totalVideosWatched < videoLimit
      ? 2
      : 3;

  // Progress goals ratios
  const videoProgress = Math.min(1.0, totalVideosWatched / videoLimit);
  const maxProgressRatio = videoProgress;

  // Trigger limit hit at exactly limit count (e.g. 10th clip)
  const isLimitExceeded = videoLimit > 0 && totalVideosWatched >= videoLimit;

  // Remaining budget calculations
  const remainingClips = Math.max(0, videoLimit - totalVideosWatched);

  // 5. State Machine Transition Engine
  useEffect(() => {
    if (!isOnShorts) {
      if (focusState !== 'idle') {
        setFocusState('idle');
      }
      return;
    }

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

    // Check if user is in recurring Stage 4 loop (1 or more takeovers already triggered)
    let nextState: FocusState;
    if (takeoverCount >= 1) {
      // Every 5+ reels past takeoverBaseClips triggers Stage 4 again!
      if (totalVideosWatched - takeoverBaseClips >= 5) {
        nextState = 'full';
      } else {
        nextState = 'idle';
      }
    } else {
      nextState = determineFrictionLadderState({
        isLimitExceeded,
        nudgeCleared,
        reasonCleared,
        breatheCleared,
        elapsedMinutes,
        elapsedClips
      });
    }

    if (nextState !== focusState) {
      setFocusState(nextState);
      if (nextState === 'breathe') {
        setBreathTimer(60);
      } else if (nextState === 'full') {
        const nextTakeoverCount = takeoverCount + 1;
        setTakeoverCount(nextTakeoverCount);
        // Stage 4 break duration:
        // 1st takeover: 60s (1 min)
        // 2nd takeover (+5 reels): 5 min (300s)
        // 3rd takeover (+5 reels): 10 min (600s)
        // 4th takeover (+5 reels): 15 min (900s)...
        const durationSecs = nextTakeoverCount <= 1 ? 60 : (nextTakeoverCount - 1) * 5 * 60;
        setTakeoverTimer(durationSecs);
      }
    }
  }, [isOnShorts, totalVideosWatched, totalTimeMins, isLimitExceeded, focusState, nudgeCleared, reasonCleared, breatheCleared, hasExceededLimits, overrideStartTime, overrideStartClips, takeoverCount, takeoverBaseClips, platform]);

  // 6. Unified Scroll Lock, Video Pause & Keyboard Interception when any modal is active
  useEffect(() => {
    if (!isOnShorts || focusState === 'idle') return;

    // 1. Lock scrolling on body and documentElement
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // 2. Pause active short/reel video so it doesn't keep running in background
    const pauseActiveVideos = () => {
      const videos = document.querySelectorAll('video');
      videos.forEach((v) => {
        try {
          if (!v.paused) v.pause();
        } catch (_) {}
      });
    };
    pauseActiveVideos();
    const pauseInterval = setInterval(pauseActiveVideos, 400);

    // 3. Block keyboard navigation keys that advance Shorts / Reels
    const blockedKeys = new Set([
      'ArrowDown',
      'ArrowUp',
      'PageDown',
      'PageUp',
      'Space',
      ' ',
      'Home',
      'End',
      'KeyJ',
      'KeyK',
      'j',
      'k',
      'J',
      'K',
    ]);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow typing inside modal inputs/textareas (e.g. reason input)
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if (isInput) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'PageDown' || e.key === 'PageUp') {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }

      if (blockedKeys.has(e.key) || blockedKeys.has(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    // 4. Block mouse wheel and touchmove events from scrolling YouTube Shorts underneath
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('wheel', handleWheel, { capture: true, passive: false });
    window.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });

    return () => {
      clearInterval(pauseInterval);
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
    };
  }, [isOnShorts, focusState]);

  // 7. Breathing and Takeover Interval Countdown Loops
  useEffect(() => {
    if (focusState !== 'breathe') return;

    const timer = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        // 4s inhale, 7s hold, 8s exhale (19s cycle repeating across 60 seconds)
        const left = prev - 1;
        const elapsedInCycle = (60 - left) % 19;
        if (elapsedInCycle < 4) {
          setBreathPhase('Inhale');
        } else if (elapsedInCycle < 11) {
          setBreathPhase('Hold');
        } else {
          setBreathPhase('Exhale');
        }
        return left;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [focusState]);

  useEffect(() => {
    if (focusState !== 'full') return;

    const timer = setInterval(() => {
      setTakeoverTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
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
    // Anchor takeoverBaseClips so that the next Stage 4 triggers after +5 reels
    updateEscalationState({
      takeoverCount: takeoverCount,
      takeoverBaseClips: totalVideosWatched,
      nudgeCleared: true,
      reasonCleared: true,
      breatheCleared: true,
      overrideStartClips: totalVideosWatched,
      overrideStartTime: Date.now(),
    });
    setFocusState('idle');
  };

  // Format times helper (e.g. "3h 32m 7s" if >= 1 hour, or "12m 45s" if under an hour)
  const liveHours = Math.floor(sessionSecs / 3600);
  const liveMins = Math.floor((sessionSecs % 3600) / 60);
  const liveSecs = sessionSecs % 60;
  const formattedLiveTime = liveHours > 0 
    ? `${liveHours}h ${liveMins}m ${liveSecs}s`
    : `${liveMins}m ${liveSecs}s`;

  // Do not render floating badge or any modals if user is NOT on a Shorts/Reels route
  if (!isOnShorts) {
    return null;
  }

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
              Repeated overrides detected in this session. Take{' '}
              {takeoverCount <= 1 ? '60 seconds' : `${(takeoverCount - 1) * 5} minutes`} to
              stand up, roll your shoulders, or drink a glass of water.
            </p>
            
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#6366f1', margin: '10px 0' }}>
              {takeoverTimer > 0
                ? takeoverTimer >= 60
                  ? `${Math.floor(takeoverTimer / 60)}m ${String(takeoverTimer % 60).padStart(2, '0')}s remaining`
                  : `${takeoverTimer}s remaining`
                : 'Break Complete'}
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

      {/* Main Draggable Widget Structure — only in idle state */}
      {focusState === 'idle' && (
        dismissed ? (
          /* Dismissed: show compact brain badge in corner, still clickable to restore */
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
        ) : (
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
                      <span className="scrollguard-status">{formattedLiveTime}</span>
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
                        <span>{remainingClips} clips left</span>
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
        )
      )}
    </>
  );
}
