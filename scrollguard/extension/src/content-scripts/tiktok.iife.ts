import { VideoTracker } from '../shared/tracker';

console.log('[ScrollGuard] TikTok detector initialized.');

function getTikTokVideoId(video: HTMLVideoElement): string | null {
  // Option A: Active page URL matches tiktok video path
  const match = location.pathname.match(/\/video\/([0-9]+)/);
  if (match) return match[1];

  // Option B: Search parent elements for video link anchors
  let parent: HTMLElement | null = video.parentElement;
  for (let i = 0; i < 8 && parent; i++) {
    const anchor = parent.querySelector('a[href*="/video/"]');
    if (anchor) {
      const href = anchor.getAttribute('href');
      const hrefMatch = href?.match(/\/video\/([0-9]+)/);
      if (hrefMatch) return hrefMatch[1];
    }
    parent = parent.parentElement;
  }

  // Option C: Fallback to video source hashing
  if (video.src) {
    return btoa(video.src.split('?')[0]).substring(0, 16);
  }
  return null;
}

const tracker = new VideoTracker({
  platform: 'tiktok',
  getVideoId: getTikTokVideoId,
});

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const intersectionObserver = new IntersectionObserver(
  (entries) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          const video = entry.target as HTMLVideoElement;
          tracker.track(video);
          break;
        }
      }
    }, 150);
  },
  { threshold: 0.6 }
);

function observeTikTokVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach((video) => {
    intersectionObserver.observe(video);
  });
}

const mutations = new MutationObserver(() => observeTikTokVideos());
mutations.observe(document.body, { childList: true, subtree: true });
setInterval(observeTikTokVideos, 2000);
observeTikTokVideos();
