import { VideoTracker } from '../shared/tracker';

console.log('[ScrollGuard] YouTube detector initialized.');

function getShortsVideoId(video: HTMLVideoElement): string | null {
  // 1. Check parent ytd-reel-video-renderer custom element attribute
  const renderer = video.closest('ytd-reel-video-renderer');
  if (renderer) {
    const id = renderer.getAttribute('video-id');
    if (id) return id;
  }

  // 2. Check current Shorts URL path matching
  const match = location.pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  // 3. Fallback: hash of source source URL string
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
        // Verify it is a valid video in the active viewport area
        if (video.offsetWidth > 150 && video.offsetHeight > 150) {
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
  const videos = document.querySelectorAll('video');
  videos.forEach((video) => {
    intersectionObserver.observe(video);
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
