import { VideoTracker } from '../shared/tracker';

console.log('[ScrollGuard] YouTube detector initialized.');

function isShortsContext(video?: HTMLVideoElement): boolean {
  if (location.pathname.startsWith('/shorts')) return true;
  if (video && video.closest('ytd-reel-video-renderer, ytd-shorts, #shorts-container')) return true;
  return false;
}

function getShortsVideoId(video: HTMLVideoElement): string | null {
  // Only detect Shorts - ignore regular YouTube homepage / watch videos
  if (!isShortsContext(video)) {
    return null;
  }

  // 1. Check parent ytd-reel-video-renderer custom element attribute
  const renderer = video.closest('ytd-reel-video-renderer');
  if (renderer) {
    const id = renderer.getAttribute('video-id');
    if (id) return id;
  }

  // 2. Check current Shorts URL path matching
  const match = location.pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  // 3. Fallback: hash of source source URL string ONLY IF inside shorts context
  if (video.src) {
    try {
      return btoa(video.src.split('?')[0]).substring(0, 16);
    } catch (_) {
      return video.src.substring(0, 16);
    }
  }

  return null;
}

const tracker = new VideoTracker({
  platform: 'youtube',
  getVideoId: getShortsVideoId,
});

let activeIntersectionVideo: HTMLVideoElement | null = null;

// Use IntersectionObserver to track which video is centered/watched
const intersectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        const video = entry.target as HTMLVideoElement;
        // Verify it is a valid video in the active viewport area and in shorts context
        if (isShortsContext(video) && video.offsetWidth > 150 && video.offsetHeight > 150) {
          activeIntersectionVideo = video;
          tracker.track(video);
          break;
        }
      }
    }
  },
  { threshold: 0.5 }
);

function observeYouTubeVideos() {
  // If user navigated away from shorts to homepage or search, stop tracking
  if (!isShortsContext()) {
    if (activeIntersectionVideo) {
      tracker.stop();
      activeIntersectionVideo = null;
    }
    return;
  }

  const videos = document.querySelectorAll('video');
  videos.forEach((video) => {
    if (isShortsContext(video)) {
      intersectionObserver.observe(video);
    }
  });
}

// Observe modifications (new slides/renderer container mounts)
const mutationObserver = new MutationObserver(() => {
  observeYouTubeVideos();
});
mutationObserver.observe(document.body, { childList: true, subtree: true });

// Check regularly in case of layout state anomalies
setInterval(() => {
  observeYouTubeVideos();

  // If there's an active video matching the current url but intersection skipped it
  const urlMatch = location.pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  if (urlMatch) {
    const activeSlide = document.querySelector('ytd-reel-video-renderer[is-active]');
    if (activeSlide) {
      const activeVideo = activeSlide.querySelector('video');
      if (activeVideo && activeVideo !== activeIntersectionVideo) {
        activeIntersectionVideo = activeVideo;
        tracker.track(activeVideo);
      }
    }
  }
}, 1500);

observeYouTubeVideos();
