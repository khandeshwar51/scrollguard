from reportlab.platypus import Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors

def get_requirements_pages(styles):
    pages = []
    
    sec_hdr = styles['SecHdr']
    subsec_hdr = styles['SubSecHdr']
    body_j = styles['BodyJ']
    table_hdr = styles['TableHdr']
    table_cell = styles['TableCell']
    table_cell_c = styles['TableCellCenter']

    # -------------------------------------------------------------------------
    # PAGE 12: 6.1 Hardware Requirements, 6.2 Software Requirements Manifest
    # -------------------------------------------------------------------------
    hw_data = [
        [Paragraph("Hardware Component", table_hdr), Paragraph("Minimum Development Specification", table_hdr), Paragraph("Recommended Production Deployment", table_hdr)],
        [Paragraph("Central Processor (CPU)", table_cell), Paragraph("Intel Core i3 / AMD Ryzen 3 (Dual Core @ 2.0 GHz)", table_cell), Paragraph("Intel Core i5 / AMD Ryzen 5 (Quad Core @ 2.5 GHz+)", table_cell)],
        [Paragraph("System Memory (RAM)", table_cell), Paragraph("4 GB DDR4 RAM (2400 MHz)", table_cell), Paragraph("8 GB / 16 GB DDR4/DDR5 RAM", table_cell)],
        [Paragraph("Storage Capacity", table_cell), Paragraph("100 MB available local SSD/HDD space", table_cell), Paragraph("500 MB available local NVMe SSD space", table_cell)],
        [Paragraph("Network Bandwidth", table_cell), Paragraph("10 Mbps dedicated broadband connection", table_cell), Paragraph("100 Mbps low-latency fiber connection", table_cell)],
        [Paragraph("Display Viewport", table_cell), Paragraph("1366 x 768 standard HD display", table_cell), Paragraph("1920 x 1080 Full HD (1080p) or 4K Retina display", table_cell)],
    ]
    hw_table = Table(hw_data, colWidths=[120, 185, 190])
    hw_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#cccccc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    sw_data = [
        [Paragraph("Software Layer", table_hdr), Paragraph("Technology / Framework", table_hdr), Paragraph("Exact Version & Role in Architecture", table_hdr)],
        [Paragraph("Operating System", table_cell), Paragraph("Windows 10/11 / macOS / Linux", table_cell), Paragraph("Cross-platform POSIX and Win32 host execution runtime.", table_cell)],
        [Paragraph("Browser Runtime", table_cell), Paragraph("Google Chrome / Brave / Edge", table_cell), Paragraph("Chromium v110+ supporting Manifest V3 service workers.", table_cell)],
        [Paragraph("UI Framework", table_cell), Paragraph("React 18 & TypeScript", table_cell), Paragraph("React 18.3 / TS 5.4+ with strict compile-time type verification.", table_cell)],
        [Paragraph("Build Engine", table_cell), Paragraph("Vite & @crxjs/vite-plugin", table_cell), Paragraph("Vite 8.1.5 providing lightning-fast HMR and bundle splitting.", table_cell)],
        [Paragraph("Local Storage", table_cell), Paragraph("IndexedDB & Chrome Storage", table_cell), Paragraph("Browser native object stores for video events and daily limits.", table_cell)],
        [Paragraph("Automated Testing", table_cell), Paragraph("Vitest Test Framework", table_cell), Paragraph("Vitest v4.1+ executing 21 automated invariant assertions.", table_cell)],
    ]
    sw_table = Table(sw_data, colWidths=[100, 150, 245])
    sw_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#cccccc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    p12 = [
        Paragraph("<u>6. REQUIREMENT SPECIFICATION</u>", sec_hdr),
        Spacer(1, 6),
        Paragraph("6.1. Hardware Requirements", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "The computational architecture of ScrollGuard is engineered to operate efficiently across modest consumer laptops "
            "as well as high-performance development workstations without degrading host website rendering frame rates:",
            body_j
        ),
        Spacer(1, 3),
        hw_table,
        Spacer(1, 5),
        Paragraph("6.2. Software Requirements & Production Package Manifest", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "The software stack relies exclusively on verified open-source dependencies and standard W3C browser specifications:",
            body_j
        ),
        Spacer(1, 3),
        sw_table,
        Spacer(1, 3),
        Paragraph(
            "<b>Zero-Install Client Architecture:</b> The client extension requires zero third-party drivers or native OS binaries. "
            "All components execute within Chromium's sandboxed renderer process, guaranteeing complete platform independence across "
            "Windows, macOS, and Linux.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>Deterministic Dependency Locking:</b> All core npm packages are strictly locked to exact semantic versions in "
            "<code>package-lock.json</code>, preventing unintended API breaks or upstream supply-chain vulnerabilities during deployment.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p12)

    # -------------------------------------------------------------------------
    # PAGE 13: 6.3 Functional Requirements (Part 1: Ingestion & Telemetry)
    # -------------------------------------------------------------------------
    fr1_data = [
        [Paragraph("Req ID", table_hdr), Paragraph("Functional Capability", table_hdr), Paragraph("Detailed Input, Processing & Verification Specification", table_hdr)],
        [Paragraph("<b>FR-01</b>", table_cell_c), Paragraph("Multi-Platform Feed Hooking", table_cell), Paragraph("System shall inject lightweight content scripts into YouTube Shorts, Instagram Reels, Facebook Reels, TikTok, and X feeds within 100ms of page load.", table_cell)],
        [Paragraph("<b>FR-02</b>", table_cell_c), Paragraph("Dynamic Route Masking", table_cell), Paragraph("System shall monitor window.location.pathname. On standard homepages (youtube.com/, instagram.com/), the widget shall unmount and remain hidden.", table_cell)],
        [Paragraph("<b>FR-03</b>", table_cell_c), Paragraph("Active Viewport Detection", table_cell), Paragraph("System shall track video visibility using IntersectionObserver. Only videos intersecting >= 60% of viewport with paused==false shall increment counters.", table_cell)],
        [Paragraph("<b>FR-04</b>", table_cell_c), Paragraph("Brain Health Badge Display", table_cell), Paragraph("System shall render a draggable Shadow DOM badge displaying live clip counts and Avatar emotion (Happy for &lt;50%, Worried for 50-99%, Zombie for >=100%).", table_cell)],
        [Paragraph("<b>FR-05</b>", table_cell_c), Paragraph("Exact Limit Interception", table_cell), Paragraph("When totalVideosWatched >= videoLimit, system shall immediately trigger Stage 1 (Soft Nudge Modal), halting momentum and auto-pausing media.", table_cell)],
        [Paragraph("<b>FR-06</b>", table_cell_c), Paragraph("Friction Ladder Escalation", table_cell), Paragraph("If user overrides limits, system shall transition sequentially: Stage 2 Intention Entry (+5 clips), Stage 3 Breathing (+8 clips), Stage 4 Break (+11 clips).", table_cell)],
        [Paragraph("<b>FR-07</b>", table_cell_c), Paragraph("Event-Capture Hard Scroll-Lock", table_cell), Paragraph("During active modal states, system shall intercept wheel, touchmove, and keyboard keys (Down, Up, Space, j, k) using capture: true.", table_cell)],
        [Paragraph("<b>FR-08</b>", table_cell_c), Paragraph("Session Inactivity & Rollover", table_cell), Paragraph("System shall finalize and flush sessions to IndexedDB after 90 seconds of inactivity. Daily counters shall reset upon detecting midnight rollover.", table_cell)],
    ]
    fr1_table = Table(fr1_data, colWidths=[45, 140, 310])
    fr1_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#cccccc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    p13 = [
        Paragraph("6.3. Functional Requirements Specification (Part 1: Ingestion & Telemetry)", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "The functional capabilities of ScrollGuard are enumerated below. Part 1 defines data ingestion, active viewport "
            "detection, and real-time state interception:",
            body_j
        ),
        Spacer(1, 3),
        fr1_table,
        Spacer(1, 3),
        Paragraph(
            "<b>Verification Contract:</b> Requirements FR-01 through FR-08 are unit-tested with Vitest fixtures simulating DOM "
            "mutations, route changes, timer expirations, and boundary watch sessions to verify 100% deterministic execution.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>Architectural Workflow for FR-01 through FR-04:</b> When a user navigates to a short-form video endpoint, the content "
            "script evaluates the route, creates an open Shadow Root, and mounts the React root. As videos enter the center of the screen, "
            "<code>IntersectionObserver</code> triggers <code>VideoTracker.track()</code>, establishing a 1-second active playback heartbeat.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>In-Memory Cache Validation (FR-05 & FR-08):</b> Daily limits and clip aggregates cached in <code>chrome.storage.local</code> "
            "are verified across browser tabs. Inactivity timers evaluate <code>Date.now() - lastActivity > 90000</code> to flush completed "
            "sessions atomically into browser IndexedDB.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p13)

    # -------------------------------------------------------------------------
    # PAGE 14: 6.3 Functional Requirements (Part 2: Escalation & Machine Learning)
    # -------------------------------------------------------------------------
    fr2_data = [
        [Paragraph("Req ID", table_hdr), Paragraph("Functional Capability", table_hdr), Paragraph("Detailed Input, Processing & Verification Specification", table_hdr)],
        [Paragraph("<b>FR-09</b>", table_cell_c), Paragraph("Stage 1 Mindful Choice Modal", table_cell), Paragraph("System shall present a glassmorphic choice dialog: 'I am done' (closes feed) or 'Continue' (+5 clip temporary override).", table_cell)],
        [Paragraph("<b>FR-10</b>", table_cell_c), Paragraph("Stage 2 Written Intention Wall", table_cell), Paragraph("System shall enforce a mandatory text input requirement: user must type >= 5 characters explaining purpose to unlock continue button.", table_cell)],
        [Paragraph("<b>FR-11</b>", table_cell_c), Paragraph("Stage 3 60s Breathing Reset", table_cell), Paragraph("System shall execute a non-skippable 60-second 4-7-8 cyclic somatic breathing loop with animated SVG pacing visualization.", table_cell)],
        [Paragraph("<b>FR-12</b>", table_cell_c), Paragraph("Stage 4 Fullscreen Lockout", table_cell), Paragraph("System shall render a full-screen takeover lockout screen. Lockout duration scales: 60s for 1st break, increasing by +5 mins per 5 clips.", table_cell)],
        [Paragraph("<b>FR-13</b>", table_cell_c), Paragraph("Dopamine Scoring Core", table_cell), Paragraph("System shall compute composite Dopamine Score (0-100) combining volume, velocity, late-night binging, repetition, and waking recovery breaks.", table_cell)],
        [Paragraph("<b>FR-14</b>", table_cell_c), Paragraph("Scroll Speed Pace Categorization", table_cell), Paragraph("System shall classify pacing into 4 discrete step functions: Healthy (>=15s), Moderate (8-15s), Risky (4-8s), and Critical (&lt;4s).", table_cell)],
        [Paragraph("<b>FR-15</b>", table_cell_c), Paragraph("Heuristic Doomscroll Detection", table_cell), Paragraph("System shall compute confidence metric C in [0, 1.0]. A confidence score C >= 0.60 shall trigger active doomscroll warnings.", table_cell)],
        [Paragraph("<b>FR-16</b>", table_cell_c), Paragraph("Web Cockpit Heatmap Analytics", table_cell), Paragraph("System shall provide a 7x24 calendar activity heatmap and Groq AI coaching recommendations based on historical session distributions.", table_cell)],
    ]
    fr2_table = Table(fr2_data, colWidths=[45, 140, 310])
    fr2_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#cccccc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    p14 = [
        Paragraph("6.3. Functional Requirements Specification (Part 2: Escalation & Analytics)", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "Part 2 defines progressive friction escalation, mathematical scoring formulations, and analytics cockpit capabilities:",
            body_j
        ),
        Spacer(1, 3),
        fr2_table,
        Spacer(1, 3),
        Paragraph(
            "<b>Predictive Integrity Guarantee:</b> Requirement FR-15 mandates that doomscroll confidence calculations are based strictly "
            "on client-side telemetry invariants without heuristic guessing or probabilistic black-box assumptions.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>Consensus Escalation Bounds (FR-09 to FR-12):</b> The escalation ladder enforces strict deterministic progression. Once "
            "a stage is completed, the user is granted temporary scrolling until the next threshold (+5 clips for Stage 2, +8 clips for "
            "Stage 3, and +11 clips for Stage 4) is reached.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>Automated Telemetry Polling (FR-16):</b> The standalone web dashboard queries local IndexedDB or the local Express "
            "synchronization server (<code>localhost:5000/api/stats</code>) every 10 seconds, updating calendar heatmaps and metrics dynamically.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p14)

    # -------------------------------------------------------------------------
    # PAGE 15: 6.4 Non-Functional Requirements (NFR-01 to NFR-10)
    # -------------------------------------------------------------------------
    nfr_data = [
        [Paragraph("NFR ID", table_hdr), Paragraph("Quality Dimension", table_hdr), Paragraph("Quantitative Target & Engineering Implementation Verification", table_hdr)],
        [Paragraph("<b>NFR-01</b>", table_cell_c), Paragraph("Sub-Second Latency", table_cell), Paragraph("Viewport video tracking checks execute in &lt; 5 ms; modal injection latency &lt; 15 ms, ensuring zero dropped frames.", table_cell)],
        [Paragraph("<b>NFR-02</b>", table_cell_c), Paragraph("Zero-Telemetry Privacy", table_cell), Paragraph("All telemetry logs and session records reside strictly within client browser IndexedDB with zero external server transmission.", table_cell)],
        [Paragraph("<b>NFR-03</b>", table_cell_c), Paragraph("DOM & Style Isolation", table_cell), Paragraph("All UI elements are mounted inside an open Shadow Root with encapsulated CSS resets, preventing host stylesheet leakage.", table_cell)],
        [Paragraph("<b>NFR-04</b>", table_cell_c), Paragraph("Fault Tolerance & Recovery", table_cell), Paragraph("Automatic state recovery from chrome.storage.local if background service worker is suspended during idle periods.", table_cell)],
        [Paragraph("<b>NFR-05</b>", table_cell_c), Paragraph("Memory Footprint", table_cell), Paragraph("Total memory consumption bounded &lt; 35 MB across 10 active tabs; automatic 90s session finalization prevents leaks.", table_cell)],
        [Paragraph("<b>NFR-06</b>", table_cell_c), Paragraph("Visual Hierarchy & Design", table_cell), Paragraph("Dark glassmorphic aesthetic with high-contrast typography, color-coded Brain Avatar emotion badges, and smooth CSS easing.", table_cell)],
        [Paragraph("<b>NFR-07</b>", table_cell_c), Paragraph("Cross-Platform Portability", table_cell), Paragraph("Identical execution behavior across Google Chrome, Brave, MS Edge on Windows 10/11, macOS, and Linux.", table_cell)],
        [Paragraph("<b>NFR-08</b>", table_cell_c), Paragraph("Test Suite Coverage", table_cell), Paragraph("100% test pass rate maintained across all 21 Vitest specification assertions covering dopamine math and state transitions.", table_cell)],
        [Paragraph("<b>NFR-09</b>", table_cell_c), Paragraph("Input Sanitization", table_cell), Paragraph("Whitelisted regex character matching on user text inputs to prevent XSS attacks at the Shadow DOM boundary.", table_cell)],
        [Paragraph("<b>NFR-10</b>", table_cell_c), Paragraph("Operational Availability", table_cell), Paragraph("Achieve 99.9% uptime across active browsing sessions, resilient against host SPA route mutations and tab recycling.", table_cell)],
    ]
    nfr_table = Table(nfr_data, colWidths=[45, 120, 330])
    nfr_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#cccccc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    p15 = [
        Paragraph("6.4. Non-Functional Requirements Specification (NFR-01 to NFR-10)", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "Non-functional requirements specify operational constraints, performance targets, and architectural quality standards enforced across ScrollGuard:",
            body_j
        ),
        Spacer(1, 3),
        nfr_table,
        Spacer(1, 3),
        Paragraph(
            "<b>Architectural Verification:</b> In-memory storage caching satisfies NFR-01 and NFR-05 simultaneously by delivering "
            "sub-millisecond lookups while eliminating the latency of external cloud database calls.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>Security Boundary & Input Sanitization (NFR-09):</b> Written intention inputs in Stage 2 undergo strict string length "
            "and character sanitization, stripping HTML tags and preventing cross-site scripting vulnerabilities.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>Memory Efficiency & Garbage Collection:</b> Event listeners bound to video elements are removed via <code>tracker.stop()</code> "
            "when elements unmount, preventing detached DOM tree memory leaks in long-running browser sessions.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p15)

    return pages
