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
      backdrop-filter: blur(12px);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: rgb(245, 158, 11);
      padding: 14px;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.3s ease;
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
    }
    .scrollguard-toast-close:hover {
      color: #fff;
    }
    .scrollguard-toast-body {
      font-size: 10.5px;
      color: #cbd5e1;
      line-height: 1.4;
      margin: 0;
      font-weight: 400;
    }
    .scrollguard-main-widget {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background-color: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      color: #fff;
      border: 1px solid rgba(51, 65, 85, 0.5);
      padding: 14px;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      width: 200px;
      box-sizing: border-box;
      cursor: grab;
    }
    .scrollguard-main-widget:active {
      cursor: grabbing;
    }
    .scrollguard-widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .scrollguard-minimized-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background-color: rgba(15, 23, 42, 0.95);
      color: #818cf8;
      border: 1px solid rgba(51, 65, 85, 0.5);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .scrollguard-minimized-btn:hover {
      background-color: rgba(30, 41, 59, 0.95);
    }
    .scrollguard-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #10b981;
      position: relative;
    }
    .scrollguard-dot::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background-color: inherit;
      border-radius: 50%;
      animation: scrollguard-ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    @keyframes scrollguard-ping {
      75%, 100% {
        transform: scale(2.5);
        opacity: 0;
      }
    }
    .scrollguard-info {
      display: flex;
      flex-direction: column;
    }
    .scrollguard-label {
      font-size: 8px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 700;
      line-height: 1;
    }
    .scrollguard-status {
      font-size: 11px;
      font-weight: 700;
      margin-top: 3px;
      line-height: 1;
      color: #fff;
    }
    .scrollguard-chevron {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 3px;
      display: flex;
      align-items: center;
      border-radius: 6px;
    }
    .scrollguard-chevron:hover {
      background-color: rgba(30, 41, 59, 0.8);
      color: #fff;
    }
    
    /* Stats and goals layout inside widget */
    .scrollguard-stats-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
      border-top: 1px solid rgba(51, 65, 85, 0.4);
      padding-top: 8px;
      font-size: 10px;
    }
    .scrollguard-stat-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #94a3b8;
    }
    .scrollguard-stat-val {
      color: #fff;
      font-weight: 700;
    }
    .scrollguard-progress-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 2px;
    }
    .scrollguard-progress-bar {
      width: 100%;
      height: 4px;
      background-color: rgba(30, 41, 59, 0.6);
      border-radius: 2px;
      overflow: hidden;
    }
    .scrollguard-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #a855f7);
      border-radius: 2px;
      transition: width 0.3s ease;
    }
    .scrollguard-progress-fill.overlimit {
      background: linear-gradient(90deg, #f59e0b, #ef4444);
    }
    .scrollguard-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .scrollguard-badge.dopamine {
      background-color: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.25);
    }

    /* Modal takeover overlays */
    .scrollguard-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(2, 6, 23, 0.88);
      backdrop-filter: blur(10px);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Outfit', 'Inter', system-ui, sans-serif;
      color: #fff;
    }
    .scrollguard-modal-content {
      background-color: #0f172a;
      border: 1px solid rgba(51, 65, 85, 0.6);
      padding: 26px;
      border-radius: 24px;
      width: 320px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      gap: 16px;
      text-align: center;
      box-sizing: border-box;
    }
    .scrollguard-modal-title {
      font-size: 16px;
      font-weight: 800;
      color: #f59e0b;
      margin: 0;
    }
    .scrollguard-modal-desc {
      font-size: 11.5px;
      color: #cbd5e1;
      line-height: 1.5;
      margin: 0;
    }
    .scrollguard-input {
      background-color: #020617;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 12px;
      padding: 10px 14px;
      color: #fff;
      font-size: 12px;
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      font-family: inherit;
    }
    .scrollguard-input:focus {
      outline: none;
      border-color: #818cf8;
    }
    .scrollguard-btn-group {
      display: flex;
      gap: 10px;
      margin-top: 4px;
    }
    .scrollguard-btn {
      flex: 1;
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      border: none;
      transition: all 0.15s ease;
    }
    .scrollguard-btn-primary {
      background-color: #6366f1;
      color: #fff;
    }
    .scrollguard-btn-primary:hover {
      background-color: #4f46e5;
    }
    .scrollguard-btn-primary:disabled {
      background-color: rgba(99, 102, 241, 0.4);
      cursor: not-allowed;
      color: rgba(255, 255, 255, 0.6);
    }
    .scrollguard-btn-secondary {
      background-color: transparent;
      border: 1px solid rgba(148, 163, 184, 0.25);
      color: #94a3b8;
    }
    .scrollguard-btn-secondary:hover {
      border-color: rgba(148, 163, 184, 0.4);
      color: #fff;
    }

    /* Breathing modal specific style */
    @keyframes scrollguard-breathe {
      0%, 100% {
        transform: scale(1);
        background-color: rgba(99, 102, 241, 0.15);
        box-shadow: 0 0 15px rgba(99, 102, 241, 0.15);
      }
      20%, 55% {
        transform: scale(1.55);
        background-color: rgba(168, 85, 247, 0.35);
        box-shadow: 0 0 35px rgba(168, 85, 247, 0.35);
      }
      95% {
        transform: scale(1);
        background-color: rgba(99, 102, 241, 0.15);
      }
    }
    .scrollguard-breathing-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin: 15px auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      animation: scrollguard-breathe 19s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      transition: all 0.5s ease;
      color: #fff;
    }
    .scrollguard-breathe-phase {
      font-size: 8px;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    
    /* Fullscreen intervention takeover override */
    .scrollguard-fullscreen-takeover {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(2, 6, 23, 0.98);
      backdrop-filter: blur(16px);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Outfit', 'Inter', system-ui, sans-serif;
      color: #fff;
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
    }
    .scrollguard-takeover-title {
      font-size: 20px;
      font-weight: 800;
      background: linear-gradient(135deg, #a855f7, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
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
