import os
from reportlab.platypus import Paragraph, Spacer, PageBreak, Table, TableStyle, Image as RLImage
from reportlab.lib import colors

ASSETS_DIR = 'd:/projects/scrollguard/docs/assets'

def get_output_pages(styles):
    pages = []

    sec_hdr      = styles['SecHdr']
    subsec_hdr   = styles['SubSecHdr']
    body_j       = styles['BodyJ']
    table_hdr    = styles['TableHdr']
    table_cell   = styles['TableCell']
    table_cell_c = styles['TableCellCenter']
    fig_caption  = styles['FigCap']

    BW_GRID = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#cccccc')),
        ('GRID',       (0, 0), (-1, -1), 0.6, colors.black),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TOPPADDING',    (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING',   (0, 0), (-1, -1), 5),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 5),
        ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
    ]

    # -------------------------------------------------------------------------
    # PAGE 62: 10.1 Ambient Brain Avatar Pill Badge
    # -------------------------------------------------------------------------
    s1_img = os.path.join(ASSETS_DIR, 'screenshot_1_brain_badge.png')
    p62 = [
        Paragraph("<u>10. OUTPUT (SCREENSHOTS)</u>", sec_hdr),
        Spacer(1, 6),
        Paragraph("10.1. Ambient Brain Avatar Pill Badge & Real-Time Clip Counter", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Shadow DOM Injected Ambient Feedback Layer:</b> The Brain Health Pill Badge is the primary ambient "
            "feedback component of the ScrollGuard system. It renders as a compact, draggable, non-intrusive pill "
            "overlay directly within the active short-form video feed, injected via an isolated W3C Shadow DOM root. "
            "The badge persistently displays the current video clip count against the user-configured daily budget "
            "and dynamically transitions through three affective avatar states to reflect consumption severity.",
            body_j
        ),
        Spacer(1, 5),
        RLImage(s1_img, width=490, height=185),
        Spacer(1, 4),
        Paragraph(
            "<b>Figure 10.1: Ambient Brain Avatar Pill Badge - (Left) Viewport Overlay; (Top-Right) Compact Pill Badge; (Bottom-Right) Expanded Telemetry Card.</b>",
            fig_caption
        ),
        Spacer(1, 5),
        Paragraph(
            "<b>Affective State Transition Design:</b> The badge transitions through three emoji-avatar states: "
            "(1) <b>Happy Brain</b> (cream background, smiling avatar) when clips watched are below 50% of the daily "
            "budget; (2) <b>Worried Brain</b> (amber background, anxious avatar) when clips are between 50% and 99% "
            "of the budget; and (3) <b>Zombie Brain</b> (red background, dazed avatar) when the budget is depleted. "
            "These affective cues leverage the Fogg Behavior Model's 'Trigger' principle -- the emotional valence of "
            "the avatar creates a visceral, pre-conscious signal before the user consciously notices the clip counter.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Minimal Cognitive Intrusion:</b> The badge occupies less than 2% of the visible viewport area and "
            "is hidden on non-feed pages (home, search, profile). Users may drag it to any corner of the screen via "
            "pointer event handlers. This respects the Nielsen Norman Group's usability heuristic of 'Flexibility and "
            "Efficiency of Use': power users can reposition the badge without it ever obstructing video content.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p62)

    # -------------------------------------------------------------------------
    # PAGE 63: 10.2 Stage 1 Soft Nudge Modal
    # -------------------------------------------------------------------------
    s2_img = os.path.join(ASSETS_DIR, 'screenshot_2_soft_nudge.png')
    p63 = [
        Paragraph("10.2. Stage 1 Soft Nudge Mindful Choice Interstitial Modal", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Non-Punitive Behavioral Intervention:</b> The Stage 1 Soft Nudge is the first tier of the Progressive "
            "Friction Ladder, triggered exactly when <code>totalVideosWatched</code> equals the user-configured daily "
            "<code>videoLimit</code>. The modal renders immediately within the same JavaScript event loop tick as "
            "the limit breach detection, darkening the host viewport with a glassmorphic blur overlay while maintaining "
            "full transparency of the underlying video content behind the glass effect.",
            body_j
        ),
        Spacer(1, 5),
        RLImage(s2_img, width=490, height=260),
        Spacer(1, 4),
        Paragraph(
            "<b>Figure 10.2: Stage 1 Soft Nudge Mindful Choice Modal Displaying upon Exact Video Limit Breach.</b>",
            fig_caption
        ),
        Spacer(1, 5),
        Paragraph(
            "<b>Choice Architecture Design:</b> The modal presents two deliberate action paths: 'I'm Done' (primary "
            "action, closes the feed tab and ends the session) and 'Continue (+5)' (secondary action, grants a "
            "temporary 5-clip extension before escalating to Stage 2). This binary choice architecture is derived from "
            "Thaler and Sunstein's Nudge Theory (2008): by making the prosocial behavior (ending the session) the "
            "visually prominent primary action, the system provides gentle libertarian paternalism without removing "
            "user autonomy.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Automated Media Pause & Scroll-Lock:</b> The Stage 1 modal simultaneously: (a) calls "
            "<code>video.pause()</code> on all active host page video elements; (b) attaches capture-phase "
            "<code>keydown</code>, <code>wheel</code>, and <code>touchstart</code> event interceptors to prevent "
            "scroll-driven feed advancement; and (c) mutes ambient media tracks. This prevents users from "
            "accidentally bypassing the intervention through muscle-memory swipe gestures.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p63)

    # -------------------------------------------------------------------------
    # PAGE 64: 10.3 Stage 2 Written Intention Wall
    # -------------------------------------------------------------------------
    s3_img = os.path.join(ASSETS_DIR, 'screenshot_3_intention_wall.png')
    p64 = [
        Paragraph("10.3. Stage 2 Written Intention Wall Friction Modal", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Metacognitive Interruption Through Linguistic Commitment:</b> The Stage 2 Intention Wall activates "
            "when the user overrides the Stage 1 nudge and consumes an additional 5 videos beyond the base limit. "
            "The modal requires the user to explicitly articulate a written justification for continuing media "
            "consumption. The submission button is programmatically disabled until the input field contains a minimum "
            "of 5 non-whitespace characters, enforcing a genuine cognitive commitment act.",
            body_j
        ),
        Spacer(1, 5),
        RLImage(s3_img, width=490, height=260),
        Spacer(1, 4),
        Paragraph(
            "<b>Figure 10.3: Stage 2 Intention Wall Requiring Written Justification Before Continued Browsing.</b>",
            fig_caption
        ),
        Spacer(1, 5),
        Paragraph(
            "<b>Psychological Mechanism - Implementation Intention:</b> The requirement to verbalize a reason for "
            "continued media consumption activates what Gollwitzer (1999) terms an <i>implementation intention</i> "
            "-- the process of forming explicit 'if-then' behavioral plans. Neuroscientific research demonstrates that "
            "articulating a goal in natural language activates the prefrontal cortex's executive control region, "
            "temporarily suppressing the amygdala's impulsive dopamine-seeking drive. This shifts the user's "
            "decision-making from System 1 (fast, habitual) to System 2 (slow, deliberate) cognitive processing.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Technical Implementation:</b> The text <code>&lt;input&gt;</code> element's <code>onInput</code> "
            "handler evaluates <code>value.trim().length &gt;= 5</code> on every keystroke. The Continue button's "
            "<code>disabled</code> attribute is bound reactively to this boolean expression. The submitted reason "
            "string is persisted to <code>escalationState.lastReason</code> in <code>chrome.storage.local</code> "
            "for optional future review in the analytics cockpit.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p64)

    # -------------------------------------------------------------------------
    # PAGE 65: 10.4 Stage 3 60s Breathing Space
    # -------------------------------------------------------------------------
    s4_img = os.path.join(ASSETS_DIR, 'screenshot_4_breathing_space.png')
    p65 = [
        Paragraph("10.4. Stage 3 Compulsory 60-Second Guided 4-7-8 Breathing Space Reset", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Somatic Intervention for Autonomic Regulation:</b> Stage 3 activates when cumulative post-nudge "
            "consumption reaches +8 videos beyond the base limit. The modal delivers a compulsory 60-second guided "
            "breathing session based on the clinically validated 4-7-8 breathing technique developed by Dr. Andrew "
            "Weil, which is documented to activate the parasympathetic nervous system, reduce cortisol levels, and "
            "lower resting heart rates within 60 to 90 seconds of consistent practice.",
            body_j
        ),
        Spacer(1, 5),
        RLImage(s4_img, width=490, height=260),
        Spacer(1, 4),
        Paragraph(
            "<b>Figure 10.4: Stage 3 Guided 4-7-8 Somatic Breathing Reset Modal with Live SVG Countdown Animation.</b>",
            fig_caption
        ),
        Spacer(1, 5),
        Paragraph(
            "<b>SVG Breathing Animation Architecture:</b> The animated breathing orb is implemented as an SVG circle "
            "whose <code>r</code> (radius) attribute is driven by a <code>setInterval</code>-based breathing phase "
            "state machine. The radius oscillates from minimum (inhale phase: 4 seconds, r expands) through maximum "
            "(hold phase: 7 seconds, r static at maximum) to minimum (exhale phase: 8 seconds, r contracts). "
            "A live countdown display subtracts elapsed seconds from 60, providing users with temporal orientation "
            "during the mandated pause.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Neuroscientific Basis:</b> The extended 8-second exhalation phase is specifically designed to "
            "stimulate the vagus nerve via diaphragmatic breathing. Vagal tone activation triggers acetylcholine "
            "release, which directly antagonizes dopamine arousal circuits in the mesolimbic pathway. This creates "
            "a genuine physiological deceleration of the compulsive scrolling urge, not merely a time-delay barrier.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p65)

    # -------------------------------------------------------------------------
    # PAGE 66: 10.5 Stage 4 Compulsory Takeover Lockout
    # -------------------------------------------------------------------------
    s5_img = os.path.join(ASSETS_DIR, 'screenshot_5_takeover_lockout.png')
    p66 = [
        Paragraph("10.5. Stage 4 Compulsory Fullscreen Takeover Break Lockout Screen", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Maximum Friction Intervention - Compulsory Timed Lockout:</b> Stage 4 is the apex of the Progressive "
            "Friction Ladder, activating when cumulative post-nudge consumption reaches +11 videos beyond the base "
            "limit. A fullscreen overlay occupying 100% of the viewport (z-index: 99999999) completely obscures the "
            "social media feed. All scroll, keyboard, touch, and pointer inputs are intercepted in the capture phase. "
            "The lockout cannot be dismissed by the user -- only the timer countdown can release it.",
            body_j
        ),
        Spacer(1, 5),
        RLImage(s5_img, width=490, height=260),
        Spacer(1, 4),
        Paragraph(
            "<b>Figure 10.5: Stage 4 Fullscreen Compulsory Break Lockout Screen with Scaled Duration Countdown.</b>",
            fig_caption
        ),
        Spacer(1, 5),
        Paragraph(
            "<b>Exponential Scaling Formula:</b> The lockout duration follows the formula: "
            "<code>duration_seconds = min(60 + (takeoverCount - 1) * 60, 300)</code>. The first Stage 4 lockout "
            "enforces a 60-second break. Each subsequent Stage 4 trigger within the same calendar day adds an "
            "additional 60 seconds, with a hard ceiling of 300 seconds (5 minutes). This exponential resistance curve "
            "makes sustained compulsive doomscrolling progressively unsustainable without permanently blocking access "
            "to legitimate content consumption.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Session State Preservation:</b> During the Stage 4 lockout, the active browser tab remains open and "
            "the host web page session is not terminated. When the countdown expires, the fullscreen overlay dissolves "
            "and the user may resume browsing with a freshly incremented override threshold (+5 clips before next "
            "escalation). The tab context (video position, feed scroll position) is preserved to prevent frustrating "
            "UX disruption.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p66)

    # -------------------------------------------------------------------------
    # PAGE 67: 10.6 Chrome Extension Popup Analytics
    # -------------------------------------------------------------------------
    s6_img = os.path.join(ASSETS_DIR, 'screenshot_6_popup_telemetry.png')
    p67 = [
        Paragraph("10.6. Chrome Extension Popup Analytics Dashboard & Dopamine Gauge", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Instant Behavioral Telemetry Access:</b> The ScrollGuard browser action popup provides a comprehensive "
            "at-a-glance behavioral telemetry dashboard accessible within one click from the Chrome extension toolbar. "
            "The popup is rendered as a React 18 component tree injected into the Chrome extension's popup HTML context, "
            "and reads real-time data directly from <code>chrome.storage.local</code> via the Chrome Storage API.",
            body_j
        ),
        Spacer(1, 5),
        RLImage(s6_img, width=490, height=195),
        Spacer(1, 4),
        Paragraph(
            "<b>Figure 10.6: Chrome Extension Action Popup - (Left) In-Context Feed Trigger; (Right) High-Resolution Telemetry Cockpit.</b>",
            fig_caption
        ),
        Spacer(1, 5),
        Paragraph(
            "<b>Dopamine Impact Score Visualization:</b> The popup features a prominent circular gauge displaying the "
            "real-time 6-Factor Dopamine Score (range 0-100). The score is computed by <code>DopamineEngine.calculateDopamineScore()</code> "
            "using six independent behavioral signals: (1) daily video count ratio; (2) waking-hours break frequency; "
            "(3) circadian late-night ratio (post-22:00 consumption); (4) average watch duration per clip; (5) skip-to-complete "
            "ratio (impulsive switching indicator); and (6) cross-platform simultaneous usage factor.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Per-Platform Budget Progress Bars:</b> Four platform-specific horizontal progress bars (YouTube, "
            "Instagram, Facebook, TikTok) display each platform's individual clip count against its proportional "
            "daily budget share. Color-coded status indicators (green: healthy, amber: approaching, red: exceeded) "
            "provide immediate spatial comparison of cross-platform usage patterns, enabling users to identify their "
            "primary compulsive consumption channel without navigating to the full analytics cockpit.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p67)

    # -------------------------------------------------------------------------
    # PAGE 68: 10.7 Full-Screen Web Analytics Cockpit
    # -------------------------------------------------------------------------
    s7_img = os.path.join(ASSETS_DIR, 'screenshot_7_web_dashboard.png')
    p68 = [
        Paragraph("10.7. Full-Screen Web Analytics Cockpit & Circadian Activity Heatmaps", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Longitudinal Behavioral Analytics Interface:</b> The standalone Web Analytics Cockpit is a full-screen "
            "React 18 single-page application served from the extension's internal web server. It provides historical "
            "longitudinal behavioral analytics covering up to 90 days of usage data stored in local IndexedDB. "
            "The cockpit features a 7x24 interactive activity heatmap, platform distribution charts, session duration "
            "histograms, and a conversational Groq AI Behavioral Coach interface.",
            body_j
        ),
        Spacer(1, 5),
        RLImage(s7_img, width=490, height=260),
        Spacer(1, 4),
        Paragraph(
            "<b>Figure 10.7: Standalone Web Analytics Cockpit - Circadian Heatmaps, AI Coach & Historical Trends.</b>",
            fig_caption
        ),
        Spacer(1, 5),
        Paragraph(
            "<b>Circadian Activity Heatmap Architecture:</b> The 7x24 calendar heatmap renders a grid where rows "
            "represent days of the week (Monday to Sunday) and columns represent hours of the day (00:00 to 23:00). "
            "Each cell's darkness intensity is mapped logarithmically to the total watch time in that hour-day bucket, "
            "computed by aggregating <code>SESSION_LOG.totalWatchMs</code> values grouped by "
            "<code>Date(startTime).getHours()</code> and <code>Date(startTime).getDay()</code>. This visualization "
            "immediately reveals late-night binging clusters and weekend overconsumption patterns.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Groq AI Behavioral Coach Integration:</b> The cockpit integrates the Groq LLM API (LLaMA 3 backend) "
            "via a locally hosted Node.js Express proxy server on <code>localhost:5000</code>. The AI coach receives "
            "a structured behavioral summary JSON payload containing 14-day aggregate statistics and generates "
            "personalized, empathetic behavioral insights and habit modification recommendations. All AI inference "
            "remains fully optional -- the core doomscrolling prevention functionality operates independently of the "
            "backend server.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p68)

    # -------------------------------------------------------------------------
    # PAGE 69: 10.8 UI Architecture & Workflow Summary Table
    # -------------------------------------------------------------------------
    ui_table_data = [
        [Paragraph("UI Component", table_hdr), Paragraph("DOM Injection Context", table_hdr),
         Paragraph("Trigger / Visibility Rule", table_hdr), Paragraph("Functional Behavior & Modality", table_hdr)],
        [Paragraph("<b>Brain Pill Badge</b>", table_cell), Paragraph("Shadow DOM Root", table_cell),
         Paragraph("Active short-form feed; focusState == 'idle'", table_cell),
         Paragraph("Draggable overlay showing clip count. Three avatar states: Happy (cream) / Worried (amber) / Zombie (red).", table_cell)],
        [Paragraph("<b>Stage 1 Soft Nudge</b>", table_cell), Paragraph("Shadow DOM Interstitial", table_cell),
         Paragraph("clips >= videoLimit (exact threshold)", table_cell),
         Paragraph("Choice modal: 'I'm Done' (closes feed) or 'Continue' (+5 clip temporary override). Video auto-paused.", table_cell)],
        [Paragraph("<b>Stage 2 Intention Wall</b>", table_cell), Paragraph("Shadow DOM Interstitial", table_cell),
         Paragraph("+5 clips beyond base limit (overrideStartClips + 5)", table_cell),
         Paragraph("Text input requiring min. 5 characters written intention to unlock the Continue action.", table_cell)],
        [Paragraph("<b>Stage 3 Breathing Space</b>", table_cell), Paragraph("Shadow DOM Interstitial", table_cell),
         Paragraph("+8 clips beyond base limit (overrideStartClips + 8)", table_cell),
         Paragraph("60-second 4-7-8 guided breathing session with animated pulsating SVG orb and live countdown.", table_cell)],
        [Paragraph("<b>Stage 4 Takeover Screen</b>", table_cell), Paragraph("Fullscreen z: 99999999", table_cell),
         Paragraph("+11 clips; repeats every +5 clips thereafter", table_cell),
         Paragraph("Compulsory break: 60s to 300s scaled. Videos paused, scroll & keyboard hard-locked.", table_cell)],
        [Paragraph("<b>Popup Dashboard</b>", table_cell), Paragraph("Browser Action Popup", table_cell),
         Paragraph("User clicks extension toolbar icon", table_cell),
         Paragraph("Dark telemetry popup: clip count, watch time, Dopamine gauge (0-100), per-platform budget bars.", table_cell)],
        [Paragraph("<b>Web Analytics Cockpit</b>", table_cell), Paragraph("Standalone React SPA", table_cell),
         Paragraph("Navigating to the dashboard endpoint URL", table_cell),
         Paragraph("7x24 circadian heatmaps, platform distributions, session timelines, Groq AI behavioral coach.", table_cell)],
    ]
    ui_table = Table(ui_table_data, colWidths=[95, 90, 115, 195])
    ui_table.setStyle(TableStyle(BW_GRID))

    p69 = [
        Paragraph("10.8. User Interface Architecture & Operational Workflow Summary", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Unified Multi-Layer Interface Ecosystem:</b> The ScrollGuard user interface constitutes a cohesive "
            "multi-layer cognitive intervention ecosystem. Each UI component serves a precisely defined behavioral "
            "purpose within the Progressive Friction Ladder architecture, ensuring that every user interaction -- from "
            "passive ambient awareness to compulsory timed breaks -- is mapped to a specific cognitive science principle. "
            "The complete interface architecture is summarized in Table 10.1 below:",
            body_j
        ),
        Spacer(1, 5),
        ui_table,
        Spacer(1, 5),
        Paragraph(
            "<b>Table 10.1: Complete User Interface Component Architecture, Injection Context, Trigger Rules & Behavioral Modality.</b>",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Cross-Browser Style Isolation:</b> All interactive modal components (Stages 1-4) maintain complete "
            "CSS style isolation within the W3C Shadow DOM sandbox. No style rules from the host social media feed's "
            "CSS stylesheets can penetrate the Shadow Root boundary. This guarantees that ScrollGuard's UI renders "
            "with identical visual fidelity across YouTube Shorts, Instagram Reels, Facebook Reels, TikTok, and X "
            "without any platform-specific CSS override patches.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Accessibility Compliance:</b> All interactive modal elements include ARIA role labels "
            "(<code>role='dialog'</code>, <code>aria-modal='true'</code>, <code>aria-label</code>) and maintain "
            "keyboard navigability through Tab and Enter keys for screen reader compatibility. Focus is automatically "
            "trapped within the active modal container during Stages 1-3, and released upon modal dismissal per "
            "WAI-ARIA 1.2 Dialog Pattern specification.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p69)

    # -------------------------------------------------------------------------
    # -------------------------------------------------------------------------
    # PAGE 70: 11. BIBLIOGRAPHY (12 citations, one page)
    # -------------------------------------------------------------------------
    p70 = [
        Paragraph("<u>11. BIBLIOGRAPHY</u>", sec_hdr),
        Spacer(1, 5),
        Paragraph("<b>Academic References, Industry Standards, Technical Specifications &amp; Research Literature:</b>", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "1. <b>Kahneman, Daniel (2011):</b> <i>Thinking, Fast and Slow.</i> Farrar, Straus and Giroux, New York. "
            "ISBN: 978-0374275631. (Dual-process behavioral economic theory underpinning ScrollGuard's cognitive friction design.)",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "2. <b>Skinner, B. F. (1953):</b> <i>Science and Human Behavior.</i> Macmillan, New York. "
            "(Variable-ratio reinforcement schedule theory underlying infinite scroll feed addiction mechanics.)",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "3. <b>Eyal, Nir (2014):</b> <i>Hooked: How to Build Habit-Forming Products.</i> Portfolio/Penguin, New York. "
            "ISBN: 978-1591847786. (Trigger-Action-Variable Reward habit loop applied in social media feed design.)",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "4. <b>Fogg, B. J. (2009):</b> <i>A Behavior Model for Persuasive Design.</i> Persuasive Technology '09, "
            "ACM, Article 40, pp. 1-7. DOI: 10.1145/1541948.1541999.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "5. <b>Thaler, R. H. &amp; Sunstein, C. R. (2008):</b> <i>Nudge: Improving Decisions About Health, Wealth "
            "and Happiness.</i> Yale University Press. (Choice architecture framework applied to Stage 1 Soft Nudge design.)",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "6. <b>Weil, Andrew (2015):</b> <i>Breathing: The Master Key to Self-Healing.</i> Sounds True Publishing. "
            "(Clinical 4-7-8 breathing technique; vagus nerve activation and dopamine arousal reduction in Stage 3.)",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "7. <b>Google Chrome Team (2024):</b> <i>Manifest V3 Service Worker Architecture &amp; Extension Platform APIs.</i> "
            "Google Developers. Retrieved from: https://developer.chrome.com/docs/extensions/mv3/",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "8. <b>W3C Working Groups (2023):</b> <i>Shadow DOM Level 1 Specification &amp; Intersection Observer API Level 2.</i> "
            "World Wide Web Consortium. https://www.w3.org/TR/shadow-dom/ ; https://www.w3.org/TR/intersection-observer/",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "9. <b>Mozilla Developer Network (2024):</b> <i>IndexedDB API &mdash; Client-Side Storage for Structured Data.</i> "
            "Mozilla Foundation. https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "10. <b>Twenge, J. M. &amp; Campbell, W. K. (2019):</b> <i>Media Use Is Linked to Lower Psychological Well-Being.</i> "
            "Psychiatric Quarterly, 90(2), 311-331. DOI: 10.1007/s11126-019-09630-7.",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "11. <b>Gollwitzer, P. M. (1999):</b> <i>Implementation Intentions: Strong Effects of Simple Plans.</i> "
            "American Psychologist, 54(7), 493-503. DOI: 10.1037/0003-066X.54.7.493. "
            "(Theoretical basis for Stage 2 Intention Wall written commitment requirement.)",
            body_j
        ),
        Spacer(1, 2),
        Paragraph(
            "12. <b>University of Mumbai (2026-2027):</b> <i>B.Sc. Computer Science Curriculum, Mini Project Guidelines "
            "&amp; Assessment Rubric, Semester V.</i> Department of Computer Science, University of Mumbai, Maharashtra.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p70)

    return pages

print("section_output module defined!")
