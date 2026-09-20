# ScrollGuard Data Model

ScrollGuard is built to run 100% offline-first. To support large volume events (tracking individual video watches, sessions, etc.) without hitting chrome's local storage limits or degrading performance, we use a hybrid storage design:
1. **`chrome.storage.local`**: Stores configuration, extension state, current active session info, and light daily aggregates.
2. **IndexedDB (via `idb`)**: Stores historical event logs, raw video events, and finished sessions.

## Core Schema Types

### 1. VideoEvent
Represents a single viewing instance of a short-form video.
- `platform`: `'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'x'`
- `videoId`: Unique identifier of the video.
- `startTime`: Timestamp (ms) when the video started playing.
- `endTime`: Timestamp (ms) when the user scrolled away or closed the video.
- `watchDurationMs`: Calculated duration of active watch time in milliseconds.
- `completed`: Boolean indicating if the user watched the video to completion (e.g. >90% or reached end loop).
- `skipped`: Boolean indicating if the user skipped the video quickly (e.g., watch duration < 3s).
- `wasRepeat`: Boolean indicating if this video was watched more than once in the current session.

### 2. Session
A continuous stream of video-watching events on a single platform. A session starts when the user opens the shorts/reels feed and ends when they navigate away or go idle for a defined threshold (e.g., 5 minutes).
- `sessionId`: Unique GUID or timestamp-based ID.
- `platform`: The platform of the session.
- `startTime`: Session start timestamp (ms).
- `endTime`: Session end timestamp (ms).
- `videoEvents`: Array of `VideoEvent` objects captured during this session.

### 3. DailyAggregate
Aggregated daily metrics used by the popup and dashboard for fast loading and reporting.
- `date`: Format `YYYY-MM-DD`.
- `totalVideos`: Count of all video events watched.
- `totalWatchTimeMs`: Total watch duration across all platforms for the day.
- `byPlatform`: Dictionary tracking stats per platform (e.g., `{ youtube: { count: 12, timeMs: 450000 }, instagram: ... }`).
- `byHour`: Array of length 24 tracking watch time or video count per hour of the day.

---

## Storage Architecture Detail

```
+---------------------------+       +----------------------------+
|   chrome.storage.local    |       |         IndexedDB          |
+---------------------------+       +----------------------------+
| - Settings & Preferences  |       | - Historic Sessions        |
| - Current active Session  |       | - All past VideoEvents     |
| - Current DailyAggregate  |       | - Long-term raw logs       |
+---------------------------+       +----------------------------+
```
