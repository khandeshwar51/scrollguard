import { classifyVideoWatch } from './classification';
import type { Platform, VideoEvent } from './types';

// Tab-local set of seen video IDs
const seenVideoIds = new Set<string>();

// User interaction flags on the active page
let userHasInteracted = false;

if (typeof window !== 'undefined') {
  const markInteracted = () => {
    userHasInteracted = true;
  };
  window.addEventListener('scroll', markInteracted, { passive: true });
  window.addEventListener('click', markInteracted, { passive: true });
  window.addEventListener('keydown', markInteracted, { passive: true });
  window.addEventListener('touchstart', markInteracted, { passive: true });
}

export interface VideoTrackerOptions {
  platform: Platform;
  getVideoId: (video: HTMLVideoElement) => string | null;
  minWatchTimeMs?: number;
}

export class VideoTracker {
  private activeVideo: HTMLVideoElement | null = null;
  private activeVideoId: string | null = null;
  private startTime: number = 0;
  private accumulatedTime: number = 0;
  private lastPlayTimestamp: number | null = null;
  private isTabVisible: boolean = true;
  private platform: Platform;
  private getVideoId: (video: HTMLVideoElement) => string | null;
  private minWatchTimeMs: number;

  // Telemetry event counts
  private keypressCount: number = 0;
  private mousemoveCount: number = 0;
  private tabSwitchCount: number = 0;
  private lastMousemoveTime: number = 0;

  constructor(options: VideoTrackerOptions) {
    this.platform = options.platform;
    this.getVideoId = options.getVideoId;
    this.minWatchTimeMs = options.minWatchTimeMs ?? 100;

    if (typeof document !== 'undefined') {
      this.isTabVisible = document.visibilityState === 'visible';
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      document.addEventListener('keydown', this.handleKeydown);
      document.addEventListener('mousemove', this.handleMousemove);
    }
  }

  private handleKeydown = () => {
    this.keypressCount++;
  };

  private handleMousemove = () => {
    const now = Date.now();
    // Throttle mouse movements to 100ms to avoid DOM blocking
    if (now - this.lastMousemoveTime > 100) {
      this.mousemoveCount++;
      this.lastMousemoveTime = now;
    }
  };

  /**
   * Start tracking a target video element.
   */
  public track(video: HTMLVideoElement) {
    const videoId = this.getVideoId(video);
    if (!videoId) return;

    if (this.activeVideo === video && this.activeVideoId === videoId) {
      return;
    }

    // Stop tracking the old video first
    this.stop();

    this.activeVideo = video;
    this.activeVideoId = videoId;
    this.startTime = Date.now();
    this.accumulatedTime = 0;
    
    // Reset interaction state and telemetry for the new video
    userHasInteracted = false;
    this.keypressCount = 0;
    this.mousemoveCount = 0;
    this.tabSwitchCount = 0;

    if (this.isTabVisible && !video.paused) {
      this.lastPlayTimestamp = Date.now();
    } else {
      this.lastPlayTimestamp = null;
    }

    video.addEventListener('play', this.handlePlay);
    video.addEventListener('pause', this.handlePause);
    video.addEventListener('ended', this.handleEnded);
  }

  /**
   * Stop tracking the current video, compute stats and emit the event.
   */
  public stop() {
    if (!this.activeVideo || !this.activeVideoId) return;

    // Unbind listeners safely
    this.activeVideo.removeEventListener('play', this.handlePlay);
    this.activeVideo.removeEventListener('pause', this.handlePause);
    this.activeVideo.removeEventListener('ended', this.handleEnded);

    if (this.lastPlayTimestamp && this.isTabVisible) {
      this.accumulatedTime += Date.now() - this.lastPlayTimestamp;
    }

    const endTime = Date.now();
    const durationMs = this.activeVideo.duration && isFinite(this.activeVideo.duration)
      ? this.activeVideo.duration * 1000
      : null;

    // Accidental open guard: visible for <1s with no scroll/click interaction
    const isAccidental = (endTime - this.startTime < 1000) && !userHasInteracted;
    const wasRepeat = seenVideoIds.has(this.activeVideoId);

    const metrics = {
      watchDurationMs: this.accumulatedTime,
      videoDurationMs: durationMs,
      wasManualNavigation: true, // Feed transitions are manual
      wasRepeat,
      isAccidental,
    };

    const classification = classifyVideoWatch(metrics);

    // Only record if it is not an accidental open
    if (!classification.accidental && this.accumulatedTime >= this.minWatchTimeMs) {
       const eventPayload: VideoEvent = {
         platform: this.platform,
         videoId: this.activeVideoId,
         startTime: this.startTime,
         endTime,
         watchDurationMs: this.accumulatedTime,
         completed: classification.completed,
         skipped: classification.skipped,
         wasRepeat: classification.repeated,
         inputEvents: {
           keypressCount: this.keypressCount,
           mousemoveCount: this.mousemoveCount,
           tabSwitchCount: this.tabSwitchCount,
         },
       };

       console.log(`[ScrollGuard] Dispatched Event for ${this.platform}:`, eventPayload);

       if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
         chrome.runtime.sendMessage({
           action: 'RECORD_VIDEO_EVENT',
           payload: eventPayload,
         });
       }

       // Record in seen IDs
       seenVideoIds.add(this.activeVideoId);
     }

     this.activeVideo = null;
     this.activeVideoId = null;
     this.lastPlayTimestamp = null;
   }

   private handlePlay = () => {
     if (this.isTabVisible && !this.lastPlayTimestamp) {
       this.lastPlayTimestamp = Date.now();
     }
   };

   private handlePause = () => {
     if (this.lastPlayTimestamp) {
       this.accumulatedTime += Date.now() - this.lastPlayTimestamp;
       this.lastPlayTimestamp = null;
     }
   };

   private handleEnded = () => {
     this.handlePause();
   };

   private handleVisibilityChange = () => {
     const isVisible = document.visibilityState === 'visible';
     if (isVisible === this.isTabVisible) return;

     this.isTabVisible = isVisible;
     this.tabSwitchCount++; // Increment tab switch/blur count
     
     if (isVisible) {
       if (this.activeVideo && !this.activeVideo.paused) {
         this.lastPlayTimestamp = Date.now();
       }
     } else {
       this.handlePause();
     }
   };
}
