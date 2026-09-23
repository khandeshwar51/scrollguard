from reportlab.platypus import Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors

def get_synopsis_pages(styles):
    pages = []
    
    sec_hdr = styles['SecHdr']
    subsec_hdr = styles['SubSecHdr']
    body_j = styles['BodyJ']
    table_hdr = styles['TableHdr']
    table_cell = styles['TableCell']
    table_cell_c = styles['TableCellCenter']

    # -------------------------------------------------------------------------
    # PAGE 7: 5.1 Title, 5.2 Introduction, 5.3 Motivation, 5.3.1 Architectural Scope
    # -------------------------------------------------------------------------
    p7 = [
        Paragraph("<u>5. PROJECT SYNOPSIS (PROJECT PROPOSAL)</u>", sec_hdr),
        Spacer(1, 8),
        Paragraph("5.1. Title of the Project", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "<b>Official Project Nomenclature:</b> <b>&ldquo;SCROLLGUARD: REAL-TIME ANTI-DOOMSCROLLING AND "
            "PROGRESSIVE COGNITIVE FRICTION PLATFORM&rdquo;</b>. Engineered as an autonomous, full-stack digital wellbeing ecosystem "
            "designed for high-precision short-form video playback interception, sub-second client-side telemetry analysis, "
            "mathematical dopamine habit-loop formulation, isolated Shadow DOM progressive friction intervention, and "
            "privacy-first local IndexedDB aggregation.",
            body_j
        ),
        Spacer(1, 5),
        Paragraph("5.2. Introduction and Industry Background", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "In modern digital computing ecosystems, algorithmic short-form media platforms&mdash;predominantly YouTube Shorts, "
            "Instagram Reels, Facebook Reels, and TikTok&mdash;have emerged as dominant instruments of behavioral engagement. "
            "These platforms utilize sophisticated multi-armed bandit recommendation algorithms optimized explicitly for continuous "
            "attentional capture and session prolongation. By delivering hyper-personalized, 15-to-60-second video stimuli on a "
            "continuous infinite-scroll layout without natural stopping cues, these platforms trigger repetitive, micro-burst "
            "dopamine spikes.",
            body_j
        ),
        Spacer(1, 3),
        Paragraph(
            "In cognitive neuroscience and behavioral economics, this phenomenon is categorized under <b>Variable-Ratio "
            "Reinforcement Schedules</b> (B.F. Skinner). Because users cannot predict whether the subsequent video swipe will "
            "yield an entertaining, shocking, or neutral cognitive reward, the brain's mesolimbic dopamine pathway remains in a "
            "perpetual state of anticipation. This psychological dynamic precipitates compulsive media overconsumption, commonly "
            "termed <b>&ldquo;Doomscrolling.&rdquo;</b> The consequences include circadian rhythm disruption, attentional fragmentation, "
            "and severe cognitive depletion among students and professionals alike.",
            body_j
        ),
        Spacer(1, 5),
        Paragraph("5.3. Motivation and Academic Rationale", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "The primary motivation for developing <b>ScrollGuard</b> is the urgent necessity for a <b>non-punitive, mathematically "
            "transparent, and psychologically grounded cognitive intervention framework</b>. Commercial screen-time utilities treat "
            "digital devices as adversaries, creating sudden abrupt lockouts that provoke user reactance and immediate uninstallation.",
            body_j
        ),
        Spacer(1, 3),
        Paragraph(
            "Within the academic curriculum of the <b>Bachelor of Science in Computer Science (SEM-V)</b> at <b>Vidyavardhini&rsquo;s "
            "A. V. College of Arts, K. M. College of Commerce, E. S. A. College of Science (Affiliated to the University of Mumbai)</b>, "
            "this project demonstrates the practical convergence of advanced computer science disciplines: asynchronous Chrome Extension "
            "Manifest V3 Service Workers, native <code>IntersectionObserver</code> viewport telemetry, isolated W3C <b>Shadow DOM</b> "
            "rendering, deterministic statistical dopamine modeling, and client-side IndexedDB persistence.",
            body_j
        ),
        Spacer(1, 5),
        Paragraph("5.3.1. Short-Form Video Algorithmic Scope & Interception Boundaries", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "Modern social media feeds operate across distinct single-page application (SPA) architectures with virtualized DOM node "
            "recycling. On YouTube Shorts (<code>/shorts</code>) and Instagram Reels (<code>/reels</code>), media containers are destroyed "
            "and recreated on the fly. ScrollGuard addresses these dynamics through MutationObserver hooks and capture-phase event "
            "interception, providing verifiable, reproducible attentional regulation without modifying host web server assets.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p7)

    # -------------------------------------------------------------------------
    # PAGE 8: 5.4 Problem Statement, 5.5 Objectives, 5.5.1 Cognitive Architecture
    # -------------------------------------------------------------------------
    p8 = [
        Paragraph("5.4. Problem Statement", subsec_hdr),
        Spacer(1, 3),
        Paragraph(
            "Contemporary internet users and students encounter four critical structural hurdles when regulating short-form digital consumption:",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>1. Frictionless Infinite Feed Geometry:</b> Modern feeds eliminate pagination, end-of-page indicators, and navigation "
            "thresholds. Swiping requires sub-100 millisecond physical effort, allowing users to consume dozens of clips without conscious "
            "cognitive awareness.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>2. Binary All-or-Nothing Application Blockers:</b> Existing screen-time blockers terminate access completely when a daily "
            "limit expires. This aggressive approach leads to high abandonment rates, as users require access to communication platforms "
            "(Instagram DMs, YouTube educational channels) without wanting infinite reel rabbit holes.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>3. Absence of Real-Time Attentional Feedback:</b> While doomscrolling, users receive zero ambient signals regarding time "
            "elapsed, clips watched, or pacing velocity. The passage of physical time is masked by immersive full-screen viewports.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>4. Data Privacy Exploitation:</b> Third-party productivity extensions frequently harvest user browsing histories, video URLs, "
            "and personal identifiers, transmitting them to external analytics servers without explicit user consent.",
            body_j
        ),
        Spacer(1, 5),
        Paragraph("5.5. Core Objectives of the Project", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "ScrollGuard is engineered to achieve the following specific, measurable technical objectives:",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "&bull; <b>Multi-Platform Native Interception:</b> Deploy tailored content scripts across YouTube Shorts (<code>/shorts</code>), "
            "Instagram Reels (<code>/reels</code>), Facebook Reels (<code>/reel</code>), TikTok, and X feeds with automated route detection.<br/>"
            "&bull; <b>Sub-Viewport Telemetry Tracking:</b> Utilize <code>IntersectionObserver</code> with a 0.6 threshold to track active, focused "
            "video playback intervals while ignoring background, paused, or off-screen media.<br/>"
            "&bull; <b>Ambient Cognitive Biofeedback:</b> Render a draggable, compact pill badge displaying live video counts and emotional "
            "Brain Avatar states (Happy -&gt; Worried -&gt; Zombie) inside an isolated Shadow DOM container.<br/>"
            "&bull; <b>4-Stage Progressive Escalation Ladder:</b> Automatically transition through calibrated psychological resistance levels "
            "when daily budgets are exceeded: Stage 1 (Soft Nudge), Stage 2 (Intention Wall), Stage 3 (Breathing Space), and Stage 4 (Compulsory Break).<br/>"
            "&bull; <b>Event-Capture Hard Scroll-Locking:</b> Intercept mouse wheel, touch gestures, and keyboard navigation keys during active "
            "modal states, simultaneously enforcing automatic media pause.<br/>"
            "&bull; <b>Mathematical Dopamine Indexing:</b> Evaluate session streams against a 6-factor deterministic scoring model (0 &ndash; 100).<br/>"
            "&bull; <b>Zero-Telemetry Local Persistence:</b> Store all high-frequency video events locally in browser IndexedDB.<br/>"
            "&bull; <b>Interactive Analytics Web Cockpit:</b> Provide a responsive dashboard featuring calendar heatmaps and behavioral coaching.",
            body_j
        ),
        Spacer(1, 5),
        Paragraph("5.5.1. Cognitive Discipline & Behavioral Psychology Foundations", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "Empirical research in dual-process cognitive psychology (Daniel Kahneman) demonstrates that infinite scrolling is mediated by "
            "automatic, unconscious <b>System 1</b> heuristic impulses. By deliberately introducing calibrated physical and temporal friction "
            "(typing an intention, waiting out a somatic breathing cycle), ScrollGuard forces a rapid cognitive shift toward deliberate "
            "<b>System 2</b> reflective reasoning, disrupting the dopamine habit loop at its neurological origin.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p8)

    # -------------------------------------------------------------------------
    # PAGE 9: 5.6 Scope of Project, 5.7 Feasibility Study (Tables 5.1 & 5.1.1)
    # -------------------------------------------------------------------------
    feas_data = [
        [Paragraph("Feasibility Area", table_hdr), Paragraph("Technical Evaluation & Implementation Reality", table_hdr), Paragraph("Verdict", table_hdr)],
        [Paragraph("<b>Technical Feasibility</b>", table_cell), Paragraph("Chrome Manifest V3 provides secure isolated execution sandboxes. Modern W3C APIs (IntersectionObserver, ShadowRoot, IndexedDB) are universally supported across Chromium engines with sub-millisecond execution overhead.", table_cell), Paragraph("<b>FEASIBLE</b><br/>(Risk: Minimal)", table_cell_c)],
        [Paragraph("<b>Operational Feasibility</b>", table_cell), Paragraph("The platform operates through modern web browsers with zero client-side installation. Default limits (40 clips / 30 mins) engage automatically. The UI is embedded directly into the active viewport.", table_cell), Paragraph("<b>FEASIBLE</b><br/>(Risk: Zero)", table_cell_c)],
        [Paragraph("<b>Economic Feasibility</b>", table_cell), Paragraph("The entire technology stack is 100% open-source (React 18, Vite, Lucide, Tailwind CSS, Vitest) under MIT/BSD/Apache licenses. Zero paid API subscriptions are incurred during operation.", table_cell), Paragraph("<b>FEASIBLE</b><br/>(Cost: INR 0.00)", table_cell_c)],
        [Paragraph("<b>Schedule Feasibility</b>", table_cell), Paragraph("Project development was executed across structured academic milestones: Weeks 1-4 (Research), Weeks 5-8 (Core Extension), Weeks 9-12 (Escalation Engine), Weeks 13-16 (Testing & Dashboard).", table_cell), Paragraph("<b>FEASIBLE</b><br/>(On Schedule)", table_cell_c)],
    ]
    feas_table = Table(feas_data, colWidths=[110, 325, 60])
    feas_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#cccccc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    safe_data = [
        [Paragraph("Operational Constraint", table_hdr), Paragraph("Implementation Reality", table_hdr), Paragraph("Architectural Safeguard", table_hdr)],
        [Paragraph("SPA Route Switching", table_cell), Paragraph("Modern feeds switch URLs without full reloads.", table_cell), Paragraph("Coupled listeners across popstate and safety interval maintain reactive state.", table_cell)],
        [Paragraph("Host DOM Contamination", table_cell), Paragraph("Host page CSS styles can break extension modals.", table_cell), Paragraph("Render all UI exclusively inside an open Shadow Root with style resets.", table_cell)],
        [Paragraph("Input Event Bypassing", table_cell), Paragraph("Users press keyboard shortcuts (j, k, Down) to skip.", table_cell), Paragraph("Capture-phase event listeners call stopImmediatePropagation() and preventDefault().", table_cell)],
        [Paragraph("Local Storage Limits", table_cell), Paragraph("Exceeding Chrome Storage 5MB memory quota.", table_cell), Paragraph("Dual-layer storage: lightweight stats in local storage, heavy streams in IndexedDB.", table_cell)],
    ]
    safe_table = Table(safe_data, colWidths=[110, 185, 200])
    safe_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#cccccc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    p9 = [
        Paragraph("5.6. Scope of the Project", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "<b>In-Scope Functional Boundaries:</b> Automated short-form video tracking across YouTube Shorts, Instagram Reels, Facebook "
            "Reels, TikTok web, and X feeds; viewport intersection tracking; local IndexedDB persistence; deterministic mathematical dopamine "
            "calculation; progressive cognitive friction ladder modal rendering; event-capture keyboard and wheel scroll-locking; and reactive midnight counter rollover.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>Out-of-Scope Boundaries:</b> The system strictly excludes remote tracking pixels, third-party cloud data harvesting, "
            "native mobile OS kernel manipulation (restricted to standard desktop Chromium browsers), and content censorship or algorithmic "
            "video filtering (the system regulates <i>behavior and time</i>, not <i>ideology or content</i>).",
            body_j
        ),
        Spacer(1, 4),
        Paragraph("5.7. Comprehensive Feasibility Study", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "A formal four-dimensional feasibility analysis was conducted prior to implementation to establish technical and operational viability:",
            body_j
        ),
        Spacer(1, 3),
        feas_table,
        Spacer(1, 4),
        Paragraph("<b>Table 5.1.1: Operational Constraints & Built-In Software Safeguards</b>", subsec_hdr),
        Spacer(1, 2),
        safe_table,
        Spacer(1, 3),
        Paragraph(
            "<b>In-Memory Cache Coherence & Sub-Millisecond Retrieval:</b> Telemetry persistence decouples high-frequency video events "
            "into local IndexedDB object stores while caching daily totals directly in <code>chrome.storage.local</code>. This keeps memory "
            "consumption under 35 MB, ensuring continuous, smooth 60 FPS viewport scrolling without browser tab degradation.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p9)

    # -------------------------------------------------------------------------
    # PAGE 10: 5.8 Proposed Methodology, 5.9 Formulations Suite
    # -------------------------------------------------------------------------
    p10_data = [
        [Paragraph("Behavioral Metric", table_hdr), Paragraph("Mathematical Formulation", table_hdr), Paragraph("Analysis Window", table_hdr), Paragraph("Interpretive Threshold & Signal Logic", table_hdr)],
        [Paragraph("Average Watch Time", table_cell), Paragraph("S = T_watch / (N_videos * 1000)", table_cell), Paragraph("Active Session", table_cell), Paragraph("S >= 15s: Healthy; S &lt; 4s: Critical rapid doomscroll.", table_cell)],
        [Paragraph("Swipe Frequency", table_cell), Paragraph("F_swipe = N_videos / (T_watch / 60000)", table_cell), Paragraph("Rolling 10-min", table_cell), Paragraph("&gt; 15 clips/min indicates impulsive variable-ratio reward seeking.", table_cell)],
        [Paragraph("Volume Ratio Score", table_cell), Paragraph("S_count = min(25, (N / u_30) * 12.5)", table_cell), Paragraph("Daily Total", table_cell), Paragraph("Normalizes daily volume against 30-day baseline consumption.", table_cell)],
        [Paragraph("Late-Night Penalty", table_cell), Paragraph("S_night = min(15, (T_late / T_watch) * 15)", table_cell), Paragraph("23:00 - 04:00", table_cell), Paragraph("Penalizes blue-light watch intervals disrupting circadian rhythm.", table_cell)],
        [Paragraph("Recovery Bonus", table_cell), Paragraph("B_breaks = min(10, N_breaks * 2)", table_cell), Paragraph("06:00 - 23:00", table_cell), Paragraph("Rewards daytime pauses &gt; 20 mins to encourage offline breaks.", table_cell)],
    ]
    p10_table = Table(p10_data, colWidths=[90, 140, 75, 190])
    p10_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#cccccc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    p10 = [
        Paragraph("5.8. Proposed Methodology & Modular Software Architecture", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "ScrollGuard implements a decoupled, multi-tiered client architecture organized into specialized functional units: "
            "(1) <b>Content Script Detection Engine:</b> Mounts platform-specific observers to track dynamic video DOM viewports; "
            "(2) <b>Service Worker Controller:</b> Manages 90s session timeouts, midnight counter resets, and cross-tab broadcasts; "
            "(3) <b>Isolated Shadow Root UI:</b> Renders draggable brain pills and 4-stage escalation modals without CSS leakage; "
            "(4) <b>Pure Functional Math Engine:</b> Evaluates multi-factor dopamine indices and scroll velocity categories.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph("5.9. Mathematical Formulations of Digital Wellbeing Telemetry Suite", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "All behavioral indicators are computed via deterministic mathematical formulations to ensure transparent, reproducible scoring:",
            body_j
        ),
        Spacer(1, 3),
        p10_table,
        Spacer(1, 3),
        Paragraph(
            "<b>Pacing Velocity Confirmation:</b> When average seconds spent per video drops below 4.0 seconds (S &lt; 4.0s), the system "
            "flags the session as <b>Critical Rapid Doomscroll</b>, immediately elevating the velocity score S_speed to 20 points.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>Exponential Pacing Decay:</b> Rather than computing raw cumulative averages over multi-hour periods, ScrollGuard evaluates "
            "recent swipe bursts using exponential smoothing (alpha = 0.10). This ensures that short bursts of rapid swiping are detected "
            "immediately even within long sessions.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>Circadian Late-Night Penalty Mechanics:</b> Between 11:00 PM and 4:00 AM, melatonin synthesis is most vulnerable to "
            "short-wavelength artificial blue light. The S_night penalty scales proportionally with late-night watch time, applying up to "
            "15 penalty points to the daily dopamine score.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>Numerical Robustness & Zero-Division Safeguards:</b> When videoCount is zero or sessions contain empty playback events, "
            "the mathematical engine falls back gracefully to default zero values, preventing division-by-zero runtime exceptions.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p10)

    # -------------------------------------------------------------------------
    # PAGE 11: 5.10 Dopamine Score Core, 5.11 Behavioral Pattern Mining
    # -------------------------------------------------------------------------
    p11 = [
        Paragraph("5.10. Multi-Factor Dopamine Impact Score Formulation (0 &ndash; 100)", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "The composite Dopamine Score <i>D<sub>total</sub></i> quantifies the neurological intensity of the user's consumption "
            "pattern across six weighted dimensions:",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "&nbsp;&nbsp;&nbsp;&nbsp;<b>D<sub>total</sub> = clamp<sub>[0, 100]</sub> ( S<sub>count</sub> + S<sub>speed</sub> + S<sub>night</sub> + S<sub>rep</sub> + S<sub>binge</sub> &minus; B<sub>breaks</sub> )</b>",
            styles['CoverSub']
        ),
        Spacer(1, 3),
        Paragraph(
            "1. <b>Volume Ratio Score (<i>S<sub>count</sub></i>, Max 25):</b> Normalizes daily consumption against the user's 30-day baseline average:<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;<i>S<sub>count</sub> = min(25, (N<sub>videos</sub> / max(50, u<sub>30</sub>)) &times; 12.5)</i><br/>"
            "2. <b>Velocity Score (<i>S<sub>speed</sub></i>, Max 20):</b> Evaluates swipe pacing (Critical=20, Risky=15, Moderate=10, Healthy=0).<br/>"
            "3. <b>Circadian Late-Night Penalty (<i>S<sub>night</sub></i>, Max 15):</b> Evaluates watch time between 11:00 PM and 4:00 AM:<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;<i>S<sub>night</sub> = min(15, (T<sub>late</sub> / T<sub>watch</sub>) &times; 15)</i><br/>"
            "4. <b>Session Repetition Score (<i>S<sub>rep</sub></i>, Max 15):</b> Penalizes repeated app re-openings (&gt;= 3 sessions = 15 points).<br/>"
            "5. <b>Binge Duration Score (<i>S<sub>binge</sub></i>, Max 15):</b> Flags unbroken sessions exceeding 25 minutes (1.5&times;106 ms).<br/>"
            "6. <b>Waking Recovery Break Bonus (<i>B<sub>breaks</sub></i>, Max -10):</b> Rewards natural pauses &gt;20 minutes during daytime (06:00-23:00):<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;<i>B<sub>breaks</sub> = min(10, N<sub>breaks</sub> &times; 2)</i>",
            body_j
        ),
        Spacer(1, 4),
        Paragraph("5.11. Machine Learning & Empirical Behavioral Pattern Mining", subsec_hdr),
        Spacer(1, 2),
        Paragraph(
            "<b>Heuristic Confidence Metric:</b> The system computes a composite doomscroll confidence metric <i>C in [0, 1.0]</i>. "
            "A doomscrolling event is formally identified when <i>C &gt;= 0.60</i>:<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;<i>C = 0.30&middot;I(N &gt; 40) + 0.15&middot;I(Keys = 0) + 0.15&middot;I(MouseMoves = 0) + 0.15&middot;I(delta_t<sub>pause</sub> &lt; 1s) + 0.25&middot;I(T<sub>session</sub> &gt; 45m)</i>",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>Stage 4 Compulsory Scaling Formula:</b> When repetitive limit overrides occur, the lockout duration expands incrementally:<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;<i>T<sub>break</sub>(k) = 60 seconds (for k = 1), and (k - 1) &times; 300 seconds (for k &gt;= 2)</i><br/>"
            "where <i>k</i> represents the cumulative takeover index, triggering every +5 videos beyond the base threshold.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "<b>Theoretical Justification for Escalation Ladder:</b> Static blockers fail because users experience psychological reactance. "
            "By progressively introducing friction (soft nudge -&gt; written intention -&gt; somatic breathing -&gt; scaled lockout), the user is "
            "given repeated off-ramps, dramatically increasing long-term habit transformation efficacy.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p11)

    return pages
