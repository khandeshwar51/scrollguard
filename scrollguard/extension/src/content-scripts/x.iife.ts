import { VideoTracker } from '../shared/tracker';

console.log('[ScrollGuard] X detector initialized.');

function getXVideoId(video: HTMLVideoElement): string | null {
  // Option A: Main status post view URL
  const match = location.pathname.match(/\/status\/([0-9]+)/);
  if (match) return match[1];

  // Option B: Search status post card for anchor
  let parent: HTMLElement | null = video.parentElement;
  for (let i = 0; i < 10 && parent; i++) {
    const anchor = parent.querySelector('a[href*="/status/"]');
    if (anchor) {
      const href = anchor.getAttribute('href');
      const hrefMatch = href?.match(/\/status\/([0-9]+)/);
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
  platform: 'x',
  getVideoId: getXVideoId,
  minWatchTimeMs: 1500, // X video plays for >1.5s while majority visible
});

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const intersectionObserver = new IntersectionObserver(
  (entries) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      for (const entry of entries) {
        // majority visible (threshold: 0.5)
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const video = entry.target as HTMLVideoElement;
          // Filter out tiny layout elements/icons
          if (video.offsetWidth > 150 && video.offsetHeight > 150) {
            tracker.track(video);
            break;
          }
        }
      }
    }, 150);
  },
  { threshold: 0.5 }
);

function observeXVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach((video) => {
    intersectionObserver.observe(video);
  });
}

const mutations = new MutationObserver(() => observeXVideos());
mutations.observe(document.body, { childList: true, subtree: true });
setInterval(observeXVideos, 2000);
observeXVideos();
