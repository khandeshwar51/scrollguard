import { VideoTracker } from '../shared/tracker';

console.log('[ScrollGuard] Instagram detector initialized.');

function getInstagramVideoId(video: HTMLVideoElement): string | null {
  // Option A: Active page is a direct reel URL
  const match = location.pathname.match(/\/reels?\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  // Option B: Search parent cards for a reel link anchor
  let parent: HTMLElement | null = video.parentElement;
  for (let i = 0; i < 8 && parent; i++) {
    const anchor = parent.querySelector('a[href*="/reels/"], a[href*="/reel/"]');
    if (anchor) {
      const href = anchor.getAttribute('href');
      const hrefMatch = href?.match(/\/reels?\/([a-zA-Z0-9_-]+)/);
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
  platform: 'instagram',
  getVideoId: getInstagramVideoId,
});

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// Intersection observer with a 60% visibility threshold
const intersectionObserver = new IntersectionObserver(
  (entries) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          const video = entry.target as HTMLVideoElement;
          tracker.track(video);
          break; // Focus on the main intersecting reel
        }
      }
    }, 150);
  },
  { threshold: 0.6 }
);

function observeInstagramVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach((video) => {
    intersectionObserver.observe(video);
  });
}

// Observe modifications and poll for dynamic feeds
const mutations = new MutationObserver(() => observeInstagramVideos());
mutations.observe(document.body, { childList: true, subtree: true });
setInterval(observeInstagramVideos, 2000);
observeInstagramVideos();
