import { extensionStorage, logStorage } from '../shared/storage';
import type { Session, VideoEvent, DailyAggregate, Platform } from '../shared/types';

console.log('[ScrollGuard] Background service worker loaded.');

// Session references
const activeSessions: Record<Platform, Session | null> = {
  youtube: null,
  instagram: null,
  facebook: null,
  tiktok: null,
  x: null,
};

const sessionTimeoutRefs: Record<Platform, ReturnType<typeof setTimeout> | null> = {
  youtube: null,
  instagram: null,
  facebook: null,
  tiktok: null,
  x: null,
};

function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function checkAndResetDailyStats(force = false) {
  const dateStr = getTodayDateString();
  const stats = await extensionStorage.get<any>('today_stats', null);
  if (force || !stats || stats.date !== dateStr) {
    console.log(`[ScrollGuard] Resetting daily stats (force=${force}, date=${dateStr}).`);
    await extensionStorage.set('today_stats', { date: dateStr, videos: 0, timeMs: 0, sessions: 0 });

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const allData = await chrome.storage.local.get(null);
      const keysToRemove = Object.keys(allData).filter(
        (key) => key.startsWith('session_start_') || key.startsWith('escalation_')
      );
      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
      }
    }
    await syncDataToBackend();
  }
}

function scheduleMidnightAlarm() {
  if (typeof chrome !== 'undefined' && chrome.alarms) {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const timeToMidnight = Math.max(1000, midnight.getTime() - now.getTime());

    chrome.alarms.create('midnight_reset', {
      when: Date.now() + timeToMidnight,
      periodInMinutes: 1440 // Repeat every 24 hours
    });
    console.log(`[ScrollGuard] Scheduled midnight reset alarm at: ${midnight.toString()}`);
  }
}

// Initial storage configurations if not set
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[ScrollGuard] Extension installed.');
  const config = await extensionStorage.get('config', null);
  if (!config) {
    await extensionStorage.set('config', {
      trackingEnabled: true,
      idleTimeoutMinutes: 5,
      dailyWatchLimitMs: 1800000, // 30 minutes
    });
    console.log('[ScrollGuard] Initialized storage default config.');
  }

  // Initialize today_stats if not present or date is mismatched
  await checkAndResetDailyStats();

  // Create an alarm to periodically check status or trigger audits
  chrome.alarms.create('check_aggregates', { periodInMinutes: 30 });
  scheduleMidnightAlarm();
});

// Listener for alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'check_aggregates') {
    console.log('[ScrollGuard] Running periodic aggregation audit.');
    await checkAndResetDailyStats();
  } else if (alarm.name === 'midnight_reset') {
    console.log('[ScrollGuard] Midnight alarm triggered. Resetting daily stats.');
    await checkAndResetDailyStats();
  }
});

/**
 * Incremental updater for daily aggregates.
 */
async function updateDailyAggregate(events: VideoEvent[]) {
  const dateStr = getTodayDateString();
  const aggregateKey = `aggregate_${dateStr}`;

  const defaultAggregate: DailyAggregate = {
    date: dateStr,
    totalVideos: 0,
    totalWatchTimeMs: 0,
    byPlatform: {
      youtube: { count: 0, timeMs: 0 },
      instagram: { count: 0, timeMs: 0 },
      facebook: { count: 0, timeMs: 0 },
      tiktok: { count: 0, timeMs: 0 },
      x: { count: 0, timeMs: 0 },
    },
    byHour: {},
  };

  for (let i = 0; i < 24; i++) {
    defaultAggregate.byHour[i] = 0;
  }

  const currentAggregate = await extensionStorage.get<DailyAggregate>(aggregateKey, defaultAggregate);

  events.forEach((event) => {
    // Skip accidental opens from adding to totals
    if (event.skipped === false && event.completed === false && event.watchDurationMs < 1000) {
      return;
    }

    currentAggregate.totalVideos += 1;
    currentAggregate.totalWatchTimeMs += event.watchDurationMs;

    if (!currentAggregate.byPlatform[event.platform]) {
      currentAggregate.byPlatform[event.platform] = { count: 0, timeMs: 0 };
    }
    currentAggregate.byPlatform[event.platform].count += 1;
    currentAggregate.byPlatform[event.platform].timeMs += event.watchDurationMs;

    const hour = new Date(event.startTime).getHours();
    currentAggregate.byHour[hour] = (currentAggregate.byHour[hour] || 0) + event.watchDurationMs;
  });

  await extensionStorage.set(aggregateKey, currentAggregate);

  // Update todays quick-stats for popup/widgets
  const stats = await extensionStorage.get<any>('today_stats', { date: dateStr, videos: 0, timeMs: 0, sessions: 0 });
  stats.videos = currentAggregate.totalVideos;
  stats.timeMs = currentAggregate.totalWatchTimeMs;
  stats.date = dateStr;
  await extensionStorage.set('today_stats', stats);
}

/**
 * Close active session for a platform and flush to DB.
 */
async function closeSession(platform: Platform) {
  const session = activeSessions[platform];
  if (!session) return;

  if (sessionTimeoutRefs[platform]) {
    clearTimeout(sessionTimeoutRefs[platform]!);
    sessionTimeoutRefs[platform] = null;
  }

  console.log(`[ScrollGuard] Closing session for ${platform}. Events count: ${session.videoEvents.length}`);

  // Flush to IndexedDB
  await logStorage.saveSession(session);

  // Increment session count
  const stats = await extensionStorage.get<any>('today_stats', { date: getTodayDateString(), videos: 0, timeMs: 0, sessions: 0 });
  stats.sessions += 1;
  stats.date = getTodayDateString();
  await extensionStorage.set('today_stats', stats);

  // Clear session start time and escalation state from storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.remove([`session_start_${platform}`, `escalation_${platform}`]);
  } else {
    localStorage.removeItem(`session_start_${platform}`);
    localStorage.removeItem(`escalation_${platform}`);
  }

  activeSessions[platform] = null;
}

// Flush all active sessions when suspend is triggered
chrome.runtime.onSuspend.addListener(async () => {
  console.log('[ScrollGuard] Extension suspending, flushing active sessions.');
  const platforms: Platform[] = ['youtube', 'instagram', 'facebook', 'tiktok', 'x'];
  for (const plat of platforms) {
    if (activeSessions[plat]) {
      await closeSession(plat);
    }
  }
});

// Listener for messages
chrome.runtime.onMessage.addListener((
  message: any,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  if (message.action === 'GET_STATUS') {
    sendResponse({ active: true, timestamp: Date.now() });
    return false;
  }

  if (message.action === 'RECORD_VIDEO_EVENT') {
    const event = message.payload as VideoEvent;
    const { platform } = event;

    (async () => {
      try {
        // 1. Save raw event to IndexedDB
        await logStorage.saveVideoEvent(event);

        // 2. Load or Create Session
        let session = activeSessions[platform];
        if (!session) {
          session = {
            sessionId: crypto.randomUUID(),
            platform,
            startTime: event.startTime,
            endTime: event.endTime,
            videoEvents: [],
          };
          activeSessions[platform] = session;
          console.log(`[ScrollGuard] Started new session for ${platform}: ${session.sessionId}`);
        }

        // 3. Append event to session
        session.videoEvents.push(event);
        session.endTime = event.endTime;

        // 4. Update Daily Aggregate metrics incrementally
        await updateDailyAggregate([event]);

        // 5. Reset session closing timeout (90 seconds)
        if (sessionTimeoutRefs[platform]) {
          clearTimeout(sessionTimeoutRefs[platform]!);
        }
        sessionTimeoutRefs[platform] = setTimeout(() => {
          closeSession(platform);
        }, 90000);

        sendResponse({ success: true });
        syncDataToBackend();
      } catch (err: any) {
        console.error('[ScrollGuard] Error recording video event:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true; // keeps connection open for async response
  }

  if (message.action === 'RESET_STATS') {
    (async () => {
      try {
        await logStorage.clearLogs();
        const allData = await chrome.storage.local.get(null);
        const keysToRemove = Object.keys(allData).filter(
          key => key.startsWith('aggregate_') || key.startsWith('session_start_') || key.startsWith('escalation_')
        );
        await chrome.storage.local.remove(keysToRemove);
        await extensionStorage.set('today_stats', { date: getTodayDateString(), videos: 0, timeMs: 0, sessions: 0 });

        // Terminate any active sessions without saving
        const platforms: Platform[] = ['youtube', 'instagram', 'facebook', 'tiktok', 'x'];
        for (const plat of platforms) {
          if (sessionTimeoutRefs[plat]) {
            clearTimeout(sessionTimeoutRefs[plat]!);
            sessionTimeoutRefs[plat] = null;
          }
          activeSessions[plat] = null;
        }

        sendResponse({ success: true });
        syncDataToBackend();
      } catch (err: any) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (message.action === 'SYNC_BACKEND') {
    (async () => {
      try {
        await syncDataToBackend();
        sendResponse({ success: true });
      } catch (err: any) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  return false;
});

// Run initial checks on background worker startup
(async () => {
  // User-requested reset of timer and reels count (timer_reset_v3)
  const resetDone = await extensionStorage.get('timer_reset_v3', false);
  if (!resetDone) {
    console.log('[ScrollGuard] Performing user-requested reset of timer and clips count.');
    await checkAndResetDailyStats(true);
    await logStorage.clearLogs();
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const allData = await chrome.storage.local.get(null);
      const keysToRemove = Object.keys(allData).filter(
        (key) => key.startsWith('aggregate_') || key.startsWith('session_start_') || key.startsWith('escalation_')
      );
      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
      }
    }
    await extensionStorage.set('timer_reset_v3', true);
  } else {
    await checkAndResetDailyStats();
  }
  scheduleMidnightAlarm();
  await syncDataToBackend();
})();

async function syncDataToBackend() {
  try {
    let allStorage: Record<string, any> = {};
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      allStorage = await chrome.storage.local.get(null);
    }
    const aggregates: Record<string, any> = {};
    Object.keys(allStorage).forEach((key) => {
      if (key.startsWith('aggregate_')) {
        aggregates[key] = allStorage[key];
      }
    });

    const sessions = await logStorage.getSessions();
    const videoEvents = await logStorage.getVideoEvents();
    const stats = await extensionStorage.get('today_stats', { videos: 0, timeMs: 0, sessions: 0 });

    const backupData = {
      version: '1.0.0',
      exportedAt: Date.now(),
      todayStats: stats,
      aggregates,
      sessions,
      videoEvents,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('http://127.0.0.1:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupData),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      console.log('[ScrollGuard] Synced real-time data to backend.');
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ last_sync_error: null });
      }
    }
  } catch (err: any) {
    // Use console.warn so Chrome doesn't flag normal offline retries as fatal extension errors
    console.warn('[ScrollGuard] Backend sync waiting for server:', err?.message || err);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ last_sync_error: err?.message || String(err) });
    }
  }
}
