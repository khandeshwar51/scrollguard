# ScrollGuard Privacy Policy (Draft)

ScrollGuard is designed with a **privacy-first, local-only by default** philosophy. We believe that your digital wellbeing habits are yours alone.

## 1. Data Collection & Storage
- **100% Offline by Default:** All tracked video events, sessions, time logs, and behavior insights are stored directly in your browser.
- **Local Technologies:** We use `chrome.storage.local` and IndexedDB. No analytics, tracking codes, or video statistics ever leave your device.
- **Zero Third-Party APIs:** Version 1.0.0 of the extension operates completely offline. No tracking pixels, remote servers, or telemetries are contacted.

## 2. Platform Tracking
- ScrollGuard only hooks into specific short-form video players on the following domains:
  - `youtube.com/shorts`
  - `instagram.com/reels`
  - `facebook.com/reels`
  - `tiktok.com` (web player)
  - `x.com` (video players in feeds)
- It does **not** capture key logs, passwords, page texts, form inputs, search histories, or tracking cookies. It only monitors playback states (play, pause, duration, active tab focus) to compute duration and completion rates.

## 3. Optional Cloud Sync (Future Updates)
- If you explicitly choose to opt into Cloud Sync in future releases (to sync insights across multiple devices):
  - Data will be encrypted in transit and at rest.
  - Authentication and storage will be handled securely through Supabase/PostgreSQL.
  - You can opt-out and purge all cloud data at any time, returning to 100% local-only storage.
