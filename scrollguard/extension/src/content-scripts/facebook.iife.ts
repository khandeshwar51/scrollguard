import { VideoTracker } from '../shared/tracker';

console.log('[ScrollGuard] Facebook detector initialized.');

function getFacebookVideoId(video: HTMLVideoElement): string | null {
  // Option A: Active page URL matches reels path
  const match = location.pathname.match(/\/reels?\/([0-9]+)/);
  if (match) return match[1];

  // Option B: Search parent containers for a reels anchor link
  let parent: HTMLElement | null = video.parentElement;
  for (let i = 0; i < 8 && parent; i++) {
    const anchor = parent.querySelector('a[href*="/reels/"], a[href*="/reel/"]');
    if (anchor) {
      const href = anchor.getAttribute('href');
      const hrefMatch = href?.match(/\/reels?\/([0-9]+)/);
      if (hrefMatch) return hrefMatch[1];
    }
    parent = parent.parentElement;
  }

  // Option C: Fallback to video source hashing ONLY if in Reels context
  if (location.pathname.includes('/reel') && video.src) {
    try {
      return btoa(video.src.split('?')[0]).substring(0, 16);
    } catch (_) {
      return video.src.substring(0, 16);
    }
  }
  return null;
}

const tracker = new VideoTracker({
  platform: 'facebook',
  getVideoId: getFacebookVideoId,
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

function observeFacebookVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach((video) => {
    intersectionObserver.observe(video);
  });
}

const mutations = new MutationObserver(() => observeFacebookVideos());
mutations.observe(document.body, { childList: true, subtree: true });
setInterval(observeFacebookVideos, 2000);
observeFacebookVideos();
