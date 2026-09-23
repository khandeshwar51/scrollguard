import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import Widget from './Widget';

// Initialize container inside document body
function initWidget() {
  if (!document.body) {
    // Retry if the DOM body is not yet fully parsed
    setTimeout(initWidget, 50);
    return;
  }

  // Prevent double rendering on page SPA transitions
  if (document.getElementById('scrollguard-widget-root')) {
    return;
  }

  console.log('[ScrollGuard] Injecting floating widget overlay...');

  const container = document.createElement('div');
  container.id = 'scrollguard-widget-root';
  
  // Set wrapper styles directly to ensure layout isolation
  container.style.position = 'fixed';
  container.style.bottom = '0';
  container.style.right = '0';
  container.style.width = '0';
  container.style.height = '0';
  container.style.zIndex = '9999999';
  container.style.overflow = 'visible';

  document.body.appendChild(container);

  // Create shadow DOM for style isolation
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // Create inner container for React mounting
  const reactContainer = document.createElement('div');
  reactContainer.id = 'widget-inner';
  shadowRoot.appendChild(reactContainer);

  // Load inline styles directly inside Shadow DOM to guarantee rendering independent of Tailwind compilation
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

    .scrollguard-container {
      position: fixed;
      z-index: 9999999;
      font-family: 'Outfit', 'Inter', system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      user-select: none;
    }
    .scrollguard-toast {
      width: 256px;
      background-color: rgba(9, 13, 22, 0.96);
      backdrop-filter: blur(16px) saturate(1.4);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: rgb(245, 158, 11);
      padding: 14px;
      border-radius: 16px;
      box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(245,158,11,0.08);
      display: flex;
      flex-direction: column;
      gap: 6px;
      animation: scrollguard-slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    .scrollguard-toast-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 700;
      font-size: 12px;
    }
    .scrollguard-toast-title {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .scrollguard-toast-close {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      font-size: 16px;
      font-weight: 900;
      padding: 2px;
      line-height: 1;
      transition: color 0.15s ease, transform 0.15s ease;
    }
    .scrollguard-toast-close:hover {
      color: #fff;
      transform: scale(1.2) rotate(90deg);
    }
    .scrollguard-toast-body {
      font-size: 10.5px;
      color: #cbd5e1;
      line-height: 1.4;
      margin: 0;
      font-weight: 400;
    }

    /* ── Main floating widget ── */
    .scrollguard-main-widget {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: linear-gradient(160deg, rgba(15,23,42,0.97) 0%, rgba(10,15,30,0.97) 100%);
      backdrop-filter: blur(20px) saturate(1.5);
      color: #fff;
      border: 1px solid rgba(99, 102, 241, 0.18);
      padding: 14px;
      border-radius: 20px;
      box-shadow:
        0 30px 60px -12px rgba(0, 0, 0, 0.6),
        0 0 0 1px rgba(99,102,241,0.06),
        inset 0 1px 0 rgba(255,255,255,0.04);
      width: 200px;
      box-sizing: border-box;
      cursor: grab;
      animation: scrollguard-widget-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      will-change: transform;
    }
    .scrollguard-main-widget:active {
      cursor: grabbing;
      transform: scale(0.98);
    }
    .scrollguard-widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* ── Minimized pill button ── */
    .scrollguard-minimized-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(160deg, rgba(15,23,42,0.97), rgba(10,15,30,0.97));
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.2);
      box-shadow: 0 8px 32px -4px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.08);
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, border-color 0.2s ease;
      animation: scrollguard-widget-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      will-change: transform;
    }
    .scrollguard-minimized-btn:hover {
      transform: scale(1.12);
      border-color: rgba(99, 102, 241, 0.45);
      box-shadow: 0 8px 32px -4px rgba(0,0,0,0.5), 0 0 20px rgba(99,102,241,0.2);
    }
    .scrollguard-minimized-btn:active {
      transform: scale(0.94);
    }

    /* ── Live status dot ── */
    .scrollguard-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #10b981;
      position: relative;
      flex-shrink: 0;
    }
    .scrollguard-dot::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background-color: #10b981;
      border-radius: 50%;
      animation: scrollguard-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    /* ── Info text ── */
    .scrollguard-info {
      display: flex;
      flex-direction: column;
    }
    .scrollguard-label {
      font-size: 8px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-weight: 700;
      line-height: 1;
    }
    .scrollguard-status {
      font-size: 11px;
      font-weight: 800;
      margin-top: 3px;
      line-height: 1;
      color: #e2e8f0;
      letter-spacing: -0.01em;
    }

    /* ── Header icon buttons ── */
    .scrollguard-chevron {
      background: none;
      border: none;
      color: #475569;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      border-radius: 8px;
      transition: background 0.15s ease, color 0.15s ease, transform 0.15s cubic-bezier(0.34,1.56,0.64,1);
    }
    .scrollguard-chevron:hover {
      background-color: rgba(99, 102, 241, 0.12);
      color: #818cf8;
      transform: scale(1.15);
    }
    .scrollguard-chevron:active {
      transform: scale(0.9);
    }

    /* ── Stats grid ── */
    .scrollguard-stats-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
      border-top: 1px solid rgba(51, 65, 85, 0.3);
      padding-top: 8px;
      font-size: 10px;
    }
    .scrollguard-stat-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #64748b;
    }
    .scrollguard-stat-val {
      color: #e2e8f0;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }

    /* ── Progress bar ── */
    .scrollguard-progress-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 2px;
    }
    .scrollguard-progress-bar {
      width: 100%;
      height: 4px;
      background-color: rgba(30, 41, 59, 0.8);
      border-radius: 99px;
      overflow: hidden;
    }
    .scrollguard-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #a855f7);
      border-radius: 99px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
      position: relative;
    }
    .scrollguard-progress-fill::after {
      content: '';
      position: absolute;
      top: 0; right: 0;
      width: 12px; height: 100%;
      background: rgba(255,255,255,0.35);
      border-radius: 99px;
      filter: blur(2px);
      animation: scrollguard-shimmer 1.8s ease-in-out infinite;
    }
    .scrollguard-progress-fill.overlimit {
      background: linear-gradient(90deg, #f59e0b, #ef4444);
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.45);
      animation: scrollguard-danger-pulse 1.2s ease-in-out infinite;
    }
    .scrollguard-progress-fill.overlimit::after {
      display: none;
    }

    /* ── Badge ── */
    .scrollguard-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .scrollguard-badge.dopamine {
      background-color: rgba(99, 102, 241, 0.12);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    /* ── Modal backdrop ── */
    .scrollguard-modal-backdrop {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background-color: rgba(2, 6, 23, 0.82);
      backdrop-filter: blur(14px) saturate(1.2);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Outfit', 'Inter', system-ui, sans-serif;
      color: #fff;
      animation: scrollguard-backdrop-in 0.25s ease both;
    }
    .scrollguard-modal-content {
      background: linear-gradient(160deg, #0f172a 0%, #09101f 100%);
      border: 1px solid rgba(99, 102, 241, 0.2);
      padding: 28px;
      border-radius: 28px;
      width: 320px;
      box-shadow:
        0 40px 80px -16px rgba(0, 0, 0, 0.7),
        0 0 0 1px rgba(99,102,241,0.06),
        inset 0 1px 0 rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
      gap: 16px;
      text-align: center;
      box-sizing: border-box;
      animation: scrollguard-modal-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      will-change: transform, opacity;
    }
    .scrollguard-modal-title {
      font-size: 17px;
      font-weight: 800;
      color: #f59e0b;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .scrollguard-modal-desc {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.55;
      margin: 0;
    }

    /* ── Input ── */
    .scrollguard-input {
      background-color: rgba(2, 6, 23, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.15);
      border-radius: 14px;
      padding: 11px 14px;
      color: #fff;
      font-size: 12px;
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      font-family: inherit;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .scrollguard-input:focus {
      outline: none;
      border-color: rgba(99, 102, 241, 0.6);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
    }

    /* ── Buttons ── */
    .scrollguard-btn-group {
      display: flex;
      gap: 10px;
      margin-top: 4px;
    }
    .scrollguard-btn {
      flex: 1;
      padding: 11px 16px;
      border-radius: 14px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      border: none;
      transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s ease, background-color 0.15s ease;
      will-change: transform;
    }
    .scrollguard-btn:hover {
      transform: translateY(-1px);
    }
    .scrollguard-btn:active {
      transform: scale(0.95) translateY(0);
    }
    .scrollguard-btn-primary {
      background: linear-gradient(135deg, #6366f1, #7c3aed);
      color: #fff;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
    }
    .scrollguard-btn-primary:hover {
      background: linear-gradient(135deg, #818cf8, #8b5cf6);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
    }
    .scrollguard-btn-primary:disabled {
      background: rgba(99, 102, 241, 0.3);
      cursor: not-allowed;
      color: rgba(255, 255, 255, 0.45);
      box-shadow: none;
      transform: none;
    }
    .scrollguard-btn-secondary {
      background-color: transparent;
      border: 1px solid rgba(148, 163, 184, 0.18);
      color: #64748b;
    }
    .scrollguard-btn-secondary:hover {
      border-color: rgba(148, 163, 184, 0.35);
      color: #e2e8f0;
      background-color: rgba(30, 41, 59, 0.5);
    }

    /* ── Breathing exercise circle ── */
    .scrollguard-breathing-circle {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      margin: 16px auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 15px;
      color: #fff;
      position: relative;
      animation: scrollguard-breathe 19s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      will-change: transform;
    }
    .scrollguard-breathing-circle::before {
      content: '';
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      border: 2px solid rgba(168, 85, 247, 0.25);
      animation: scrollguard-breathe-ring 19s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .scrollguard-breathing-circle::after {
      content: '';
      position: absolute;
      inset: -18px;
      border-radius: 50%;
      border: 1px solid rgba(99, 102, 241, 0.12);
      animation: scrollguard-breathe-ring 19s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.3s;
    }
    .scrollguard-breathe-phase {
      font-size: 8px;
      color: rgba(255, 255, 255, 0.55);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.1em;
      margin-top: 2px;
    }

    /* ── Fullscreen takeover ── */
    .scrollguard-fullscreen-takeover {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: radial-gradient(ellipse at center, rgba(15,23,42,0.99) 0%, rgba(2,6,23,1) 100%);
      backdrop-filter: blur(20px);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Outfit', 'Inter', system-ui, sans-serif;
      color: #fff;
      animation: scrollguard-backdrop-in 0.3s ease both;
    }
    .scrollguard-takeover-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: center;
      max-width: 360px;
      padding: 30px;
      text-align: center;
      box-sizing: border-box;
      animation: scrollguard-modal-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    .scrollguard-takeover-title {
      font-size: 22px;
      font-weight: 800;
      background: linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      letter-spacing: -0.03em;
    }

    /* ══════════════════════════════
       KEYFRAME ANIMATIONS
    ══════════════════════════════ */

    /* Widget entrance — spring up from bottom-right */
    @keyframes scrollguard-widget-enter {
      from {
        opacity: 0;
        transform: scale(0.75) translateY(16px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* Slide up for toasts */
    @keyframes scrollguard-slide-up {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Backdrop fade in */
    @keyframes scrollguard-backdrop-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* Modal spring-in */
    @keyframes scrollguard-modal-in {
      from {
        opacity: 0;
        transform: scale(0.88) translateY(24px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* Live dot pulse */
    @keyframes scrollguard-ping {
      0%   { transform: scale(1);   opacity: 0.8; }
      70%  { transform: scale(2.8); opacity: 0;   }
      100% { transform: scale(2.8); opacity: 0;   }
    }

    /* Progress bar shimmer */
    @keyframes scrollguard-shimmer {
      0%   { opacity: 0;   transform: translateX(-12px); }
      40%  { opacity: 0.5; }
      100% { opacity: 0;   transform: translateX(4px);  }
    }

    /* Over-limit danger pulse */
    @keyframes scrollguard-danger-pulse {
      0%, 100% { box-shadow: 0 0 6px rgba(239,68,68,0.3);  }
      50%       { box-shadow: 0 0 16px rgba(239,68,68,0.65); }
    }

    /* Breathing circle — 19s 4-7-8 cycle: expand on inhale/hold, contract on exhale */
    @keyframes scrollguard-breathe {
      0%           { transform: scale(1);    background: radial-gradient(circle, rgba(99,102,241,0.18), rgba(99,102,241,0.06)); box-shadow: 0 0 20px rgba(99,102,241,0.15); }
      5%           { transform: scale(1.02); }
      21%          { transform: scale(1.6);  background: radial-gradient(circle, rgba(168,85,247,0.35), rgba(99,102,241,0.12)); box-shadow: 0 0 50px rgba(168,85,247,0.3); }
      58%          { transform: scale(1.6);  background: radial-gradient(circle, rgba(168,85,247,0.38), rgba(99,102,241,0.15)); box-shadow: 0 0 50px rgba(168,85,247,0.3); }
      100%         { transform: scale(1);    background: radial-gradient(circle, rgba(99,102,241,0.18), rgba(99,102,241,0.06)); box-shadow: 0 0 20px rgba(99,102,241,0.15); }
    }

    /* Breathing outer ring — mirrors main circle */
    @keyframes scrollguard-breathe-ring {
      0%    { transform: scale(1);    opacity: 0.35; }
      21%   { transform: scale(1.55); opacity: 0.6;  }
      58%   { transform: scale(1.55); opacity: 0.6;  }
      100%  { transform: scale(1);    opacity: 0.35; }
    }
  `;
  shadowRoot.appendChild(style);

  ReactDOM.createRoot(reactContainer).render(
    <StrictMode>
      <Widget />
    </StrictMode>
  );
  
  console.log('[ScrollGuard] Floating widget overlay rendered successfully.');
}

initWidget();
