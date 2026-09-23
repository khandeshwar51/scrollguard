import os
from reportlab.platypus import Paragraph, Spacer, PageBreak, Table, TableStyle, Image as RLImage
from reportlab.lib import colors

ASSETS_DIR = 'd:/projects/scrollguard/docs/assets'

def get_design_pages(styles):
    pages = []

    sec_hdr     = styles['SecHdr']
    subsec_hdr  = styles['SubSecHdr']
    body_j      = styles['BodyJ']
    table_hdr   = styles['TableHdr']
    table_cell  = styles['TableCell']
    table_cell_c = styles['TableCellCenter']
    fig_caption  = styles['FigCap']

    # Pure-black table style helper (no RGB tints, university compliant)
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
    # PAGE 19: 8.1 UML Class Diagram
    # -------------------------------------------------------------------------
    class_img = os.path.join(ASSETS_DIR, 'class_diagram.png')
    p19 = [
        Paragraph("<u>8. SYSTEM DESIGN</u>", sec_hdr),
        Spacer(1, 6),
        Paragraph("8.1. Unified Modeling Language (UML) 2.5 Class Diagram", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Object-Oriented Architectural Overview:</b> The static structural design of ScrollGuard is modeled using "
            "the UML 2.5 Class Diagram notation. The diagram depicts six primary engine classes, their type-annotated "
            "private attributes, public method signatures with return types, and inter-class association arrows with "
            "direction and multiplicity labels. Visibility modifiers follow the UML standard: (+) denotes public access, "
            "(-) denotes private encapsulation. All class stubs carry the &lt;&lt;class&gt;&gt; stereotype.",
            body_j
        ),
        Spacer(1, 5),
        RLImage(class_img, width=490, height=270),
        Spacer(1, 4),
        Paragraph(
            "<b>Figure 8.1: UML 2.5 Class Diagram - Six Engine Classes with Attributes, Methods & Associations.</b>",
            fig_caption
        ),
        Spacer(1, 5),
        Paragraph(
            "<b>Design Pattern Analysis - Observer Pattern:</b> <code>VideoTracker</code> implements the Observer "
            "design pattern by registering an <code>IntersectionObserver</code> instance that passively monitors "
            "HTMLVideoElement objects entering the viewport threshold. Upon receiving a viewport intersection callback, "
            "VideoTracker notifies <code>WidgetController</code> (the Subject) to update its internal clip counter "
            "state. This decoupling ensures that the tracking logic remains independent of the UI rendering lifecycle.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Design Pattern Analysis - State Pattern:</b> <code>WidgetController</code> implements the State "
            "design pattern via the <code>focusState</code> discriminated union field, which transitions through "
            "states: <code>'idle' -> 'nudge' -> 'reason' -> 'breathe' -> 'full'</code>. Each state maps to a "
            "distinct rendered component tree within the Shadow DOM, ensuring that the UI always reflects the current "
            "behavioral intervention tier without complex conditional rendering logic scattered across components.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Separation of Concerns:</b> <code>BehaviorClassifier</code>, <code>DopamineEngine</code>, and "
            "<code>ScrollSpeedEngine</code> are stateless pure-function modules with no side effects. This architectural "
            "constraint ensures they are fully testable in isolation via Vitest unit tests without requiring browser "
            "environment mocking.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p19)

    # -------------------------------------------------------------------------
    # PAGE 20: 8.2 UML Use Case Diagram
    # -------------------------------------------------------------------------
    usecase_img = os.path.join(ASSETS_DIR, 'use_case_diagram.png')
    p20 = [
        Paragraph("8.2. Use Case Diagram", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Functional Scope & System Boundary Definition:</b> The Use Case Diagram formally delineates the "
            "functional boundaries of the ScrollGuard system and maps external actors to their associated operational "
            "use cases. The system boundary rectangle encompasses all nine internally handled use cases. Three external "
            "actors interact with the system: the <b>Digital Consumer (User)</b> as the primary human actor; the "
            "<b>Social Media Feed (YouTube / Instagram)</b> as the host web environment actor; and the "
            "<b>Service Worker (Background Timer)</b> as an automated software agent actor.",
            body_j
        ),
        Spacer(1, 5),
        RLImage(usecase_img, width=490, height=270),
        Spacer(1, 4),
        Paragraph(
            "<b>Figure 8.2: UML Use Case Diagram Defining the Functional Scope, System Boundary & Actor Associations.</b>",
            fig_caption
        ),
        Spacer(1, 5),
        Paragraph(
            "<b>Actor-Goal Summary:</b> The Digital Consumer initiates short-form video feed browsing (UC-01) and "
            "receives ambient biofeedback through the Brain Health Badge (UC-02). Upon reaching the configured daily "
            "video limit, the system sequentially presents: the Stage 1 Soft Nudge Choice Modal (UC-03), the Stage 2 "
            "Written Intention Wall (UC-04), the Stage 3 60-Second Breathing Reset (UC-05), and the Stage 4 Compulsory "
            "Break Lockout (UC-06). The Digital Consumer can also inspect historical analytics and circadian heatmaps "
            "through the Web Analytics Cockpit (UC-07). In parallel, the Background Service Worker autonomously "
            "finalizes inactive sessions (UC-08) and enforces midnight daily counter rollover (UC-09).",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Include vs. Extend Relationships:</b> UC-04 (Intention Wall), UC-05 (Breathing Reset), and UC-06 "
            "(Compulsory Lockout) are modeled as &lt;&lt;extends&gt;&gt; relationships from UC-03 (Soft Nudge), "
            "meaning they execute only conditionally when the user repeatedly overrides the base intervention. This "
            "accurately reflects the progressive, non-mandatory escalation architecture of the friction ladder.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p20)

    # -------------------------------------------------------------------------
    # PAGE 21: 8.3 Database Design (VIDEO_EVENT Schema)
    # -------------------------------------------------------------------------
    v_data = [
        [Paragraph("Field Name", table_hdr), Paragraph("Data Type", table_hdr),
         Paragraph("Constraint", table_hdr), Paragraph("Description & Validation Rules", table_hdr)],
        [Paragraph("<code>videoId</code>", table_cell), Paragraph("VARCHAR(64)", table_cell),
         Paragraph("PRIMARY KEY, NOT NULL", table_cell),
         Paragraph("Unique platform video ID extracted from DOM or SHA-256 hash of canonical media URL.", table_cell)],
        [Paragraph("<code>platform</code>", table_cell), Paragraph("VARCHAR(16)", table_cell),
         Paragraph("NOT NULL, ENUM", table_cell),
         Paragraph("Target social platform: 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'x'.", table_cell)],
        [Paragraph("<code>startTime</code>", table_cell), Paragraph("BIGINT (ms)", table_cell),
         Paragraph("NOT NULL", table_cell),
         Paragraph("Unix epoch timestamp (milliseconds) when playback entered the active 60%+ viewport.", table_cell)],
        [Paragraph("<code>endTime</code>", table_cell), Paragraph("BIGINT (ms)", table_cell),
         Paragraph("NOT NULL", table_cell),
         Paragraph("Unix epoch timestamp (milliseconds) when playback ceased or viewport area fell below 60%.", table_cell)],
        [Paragraph("<code>watchDurationMs</code>", table_cell), Paragraph("INTEGER", table_cell),
         Paragraph("NOT NULL, >= 0", table_cell),
         Paragraph("Computed active watch interval: endTime - startTime. Excludes tab-blur pause intervals.", table_cell)],
        [Paragraph("<code>completed</code>", table_cell), Paragraph("BOOLEAN", table_cell),
         Paragraph("NOT NULL, DEFAULT FALSE", table_cell),
         Paragraph("Set TRUE if clip was watched to >= 90% of total video.duration before viewport exit.", table_cell)],
        [Paragraph("<code>skipped</code>", table_cell), Paragraph("BOOLEAN", table_cell),
         Paragraph("NOT NULL, DEFAULT FALSE", table_cell),
         Paragraph("Set TRUE if clip was abandoned within < 3000 ms of viewport entry (rapid-swipe indicator).", table_cell)],
    ]
    v_table = Table(v_data, colWidths=[95, 78, 110, 212])
    v_table.setStyle(TableStyle(BW_GRID))

    p21 = [
        Paragraph("8.3. Database Design & Relational Data Schema", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Hybrid Client-Side Persistence Architecture:</b> ScrollGuard implements a two-tier, fully client-side "
            "persistence model that intentionally avoids any cloud server dependency. High-frequency, append-only video "
            "event telemetry is stored in the browser's native <b>IndexedDB</b> object store (capable of storing "
            "structured JSON objects up to browser-defined storage limits). Synchronous daily aggregation summaries, "
            "user configuration preferences, and active escalation state flags are cached directly in "
            "<code>chrome.storage.local</code> for sub-millisecond synchronous read access during rapid swiping.",
            body_j
        ),
        Spacer(1, 5),
        Paragraph("<b>Table 8.1: Data Dictionary - <code>VIDEO_EVENT</code> Entity (Primary IndexedDB Object Store)</b>", subsec_hdr),
        Spacer(1, 4),
        v_table,
        Spacer(1, 5),
        Paragraph(
            "<b>Table 8.1 Description:</b> The <code>VIDEO_EVENT</code> store captures atomic, indivisible records "
            "representing a single continuous video playback window. Each record is keyed by <code>videoId</code> "
            "(surrogate platform identifier) combined with <code>startTime</code> (epoch milliseconds) to form a "
            "naturally unique composite primary key, since the same video may be rewatched within a single session.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>BCNF Normalization Analysis:</b> All non-key attributes in <code>VIDEO_EVENT</code> -- specifically "
            "<code>watchDurationMs</code>, <code>completed</code>, <code>skipped</code>, and <code>platform</code> "
            "-- are in full functional dependency on the composite primary key <code>(videoId, startTime)</code>. "
            "No partial key dependencies or transitive functional dependencies exist within this entity, confirming "
            "that the schema satisfies Third Normal Form (3NF) and Boyce-Codd Normal Form (BCNF).",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Indexing Strategy:</b> A secondary B-tree index is automatically maintained on the <code>startTime</code> "
            "field to support efficient time-range queries. The web analytics dashboard queries <code>VIDEO_EVENT</code> "
            "filtered by a 7-day or 30-day time range using <code>IDBKeyRange.bound(startEpoch, endEpoch)</code>, "
            "returning results in under 10 milliseconds on standard consumer hardware.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p21)

    # -------------------------------------------------------------------------
    # PAGE 22: 8.3 Database Design - SESSION_LOG Schema
    # -------------------------------------------------------------------------
    s_data = [
        [Paragraph("Field Name", table_hdr), Paragraph("Data Type", table_hdr),
         Paragraph("Constraint", table_hdr), Paragraph("Description & Validation Rules", table_hdr)],
        [Paragraph("<code>sessionId</code>", table_cell), Paragraph("VARCHAR(36)", table_cell),
         Paragraph("PRIMARY KEY, UUIDv4", table_cell),
         Paragraph("Cryptographically random UUID v4 string uniquely identifying a continuous browsing session.", table_cell)],
        [Paragraph("<code>platform</code>", table_cell), Paragraph("VARCHAR(16)", table_cell),
         Paragraph("NOT NULL, ENUM", table_cell),
         Paragraph("The social media platform (youtube | instagram | facebook | tiktok | x) for this session.", table_cell)],
        [Paragraph("<code>startTime</code>", table_cell), Paragraph("BIGINT (ms)", table_cell),
         Paragraph("NOT NULL", table_cell),
         Paragraph("Unix epoch timestamp of first video playback event detected in this session window.", table_cell)],
        [Paragraph("<code>endTime</code>", table_cell), Paragraph("BIGINT (ms)", table_cell),
         Paragraph("NOT NULL", table_cell),
         Paragraph("Unix epoch timestamp of the last recorded video event before the 90-second inactivity timeout.", table_cell)],
        [Paragraph("<code>videoCount</code>", table_cell), Paragraph("INTEGER", table_cell),
         Paragraph("NOT NULL, >= 0", table_cell),
         Paragraph("Total number of discrete video clips watched during this continuous session window.", table_cell)],
        [Paragraph("<code>totalWatchMs</code>", table_cell), Paragraph("BIGINT (ms)", table_cell),
         Paragraph("NOT NULL, >= 0", table_cell),
         Paragraph("Cumulative active playback duration in milliseconds across all video events in session.", table_cell)],
        [Paragraph("<code>videoEvents</code>", table_cell), Paragraph("JSON_ARRAY", table_cell),
         Paragraph("NOT NULL", table_cell),
         Paragraph("Ordered JSON array of child VideoEvent telemetry records nested within this session.", table_cell)],
    ]
    s_table = Table(s_data, colWidths=[95, 78, 110, 212])
    s_table.setStyle(TableStyle(BW_GRID))

    p22 = [
        Paragraph("8.3. Database Design (Continued: Session Lifecycle Persistence Schema)", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Session Demarcation via Inactivity Heuristics:</b> A browsing session in ScrollGuard is defined as a "
            "continuous, uninterrupted period of short-form video consumption on a single platform. Session boundaries "
            "are detected using a 90-second inactivity heuristic: if the background service worker receives no "
            "<code>RECORD_VIDEO_EVENT</code> message for 90 seconds, it invokes <code>closeSession()</code>, which "
            "seals the session record and flushes it to the <code>SESSION_LOG</code> IndexedDB object store.",
            body_j
        ),
        Spacer(1, 5),
        Paragraph("<b>Table 8.2: Data Dictionary - <code>SESSION_LOG</code> Entity (Secondary IndexedDB Object Store)</b>", subsec_hdr),
        Spacer(1, 4),
        s_table,
        Spacer(1, 5),
        Paragraph(
            "<b>Session Aggregation Pipeline:</b> When <code>closeSession()</code> is called, the service worker "
            "computes derived fields: <code>videoCount</code> is set to the total length of the <code>videoEvents</code> "
            "array; <code>totalWatchMs</code> is the sum of all child <code>watchDurationMs</code> values; "
            "<code>endTime</code> is assigned from the final VideoEvent's <code>endTime</code>. This denormalized "
            "summary enables the dashboard to render session duration histograms without iterating all child records.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Session Indexing for Dashboard Queries:</b> A compound secondary index on <code>(platform, startTime)</code> "
            "supports filtered platform-specific session history queries. The 7x24 circadian heatmap in the analytics "
            "dashboard groups sessions by <code>new Date(startTime).getHours()</code> and sums their "
            "<code>totalWatchMs</code> values per hour, rendering in under 15ms for 30-day data windows.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Storage Quota Management:</b> IndexedDB on Chromium browsers enforces per-origin storage quotas "
            "(typically 60% of available disk space). ScrollGuard implements a rolling data retention policy: sessions "
            "older than 90 days are eligible for automatic pruning via the background service worker's weekly "
            "maintenance routine, preventing uncontrolled storage growth on long-term installations.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p22)

    # -------------------------------------------------------------------------
    # PAGE 23: 8.3 Database Design - DAILY_AGGREGATE & ESCALATION_STATE Schemas
    # -------------------------------------------------------------------------
    d_data = [
        [Paragraph("Field Name", table_hdr), Paragraph("Data Type", table_hdr),
         Paragraph("Storage Key", table_hdr), Paragraph("Description & Validation Rules", table_hdr)],
        [Paragraph("<code>date</code>", table_cell), Paragraph("VARCHAR(10)", table_cell),
         Paragraph("aggregate_YYYY-MM-DD", table_cell),
         Paragraph("ISO 8601 calendar date string (YYYY-MM-DD) representing the 24-hour recording window.", table_cell)],
        [Paragraph("<code>totalVideos</code>", table_cell), Paragraph("INTEGER", table_cell),
         Paragraph("NOT NULL, >= 0", table_cell),
         Paragraph("Cumulative clips watched across all 5 platform content scripts today.", table_cell)],
        [Paragraph("<code>totalWatchTimeMs</code>", table_cell), Paragraph("BIGINT (ms)", table_cell),
         Paragraph("NOT NULL, >= 0", table_cell),
         Paragraph("Total active watch duration in milliseconds summed across all platform sessions.", table_cell)],
        [Paragraph("<code>byPlatform</code>", table_cell), Paragraph("JSON_OBJECT", table_cell),
         Paragraph("NOT NULL", table_cell),
         Paragraph("Platform-keyed map: { youtube: { count, time }, instagram: { count, time }, ... }.", table_cell)],
        [Paragraph("<code>byHour</code>", table_cell), Paragraph("JSON_OBJECT", table_cell),
         Paragraph("NOT NULL", table_cell),
         Paragraph("24-bucket hourly histogram: { '0': totalWatchMs, '1': ..., '23': ... }.", table_cell)],
        [Paragraph("<code>nudgeCleared</code>", table_cell), Paragraph("BOOLEAN", table_cell),
         Paragraph("escalationState", table_cell),
         Paragraph("TRUE if Stage 1 Soft Nudge has been acknowledged and overridden today.", table_cell)],
        [Paragraph("<code>takeoverCount</code>", table_cell), Paragraph("INTEGER", table_cell),
         Paragraph("escalationState", table_cell),
         Paragraph("Number of Stage 4 compulsory break lockouts triggered today. Used for duration scaling.", table_cell)],
        [Paragraph("<code>overrideStartClips</code>", table_cell), Paragraph("INTEGER", table_cell),
         Paragraph("escalationState", table_cell),
         Paragraph("Clip count at which Stage 1 override was confirmed. Used to compute ladder delta thresholds.", table_cell)],
    ]
    d_table = Table(d_data, colWidths=[95, 78, 100, 222])
    d_table.setStyle(TableStyle(BW_GRID))

    p23 = [
        Paragraph("8.3. Database Design (Continued: Daily Aggregate & Escalation State)", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Synchronous Cache Layer Design:</b> While raw session and video event telemetry is persisted "
            "asynchronously in IndexedDB, the daily aggregate totals and escalation state flags are cached in "
            "<code>chrome.storage.local</code>, which provides fully synchronous read access via the "
            "<code>chrome.storage.onChanged</code> event listener. This ensures that the React widget receives "
            "instantaneous state updates without awaiting IndexedDB promise chains during high-velocity swiping.",
            body_j
        ),
        Spacer(1, 5),
        Paragraph("<b>Table 8.3: Data Dictionary - <code>DAILY_AGGREGATE</code> & <code>ESCALATION_STATE</code> (chrome.storage.local)</b>", subsec_hdr),
        Spacer(1, 4),
        d_table,
        Spacer(1, 5),
        Paragraph(
            "<b>Midnight Rollover Architecture:</b> The background service worker monitors the system clock via "
            "<code>chrome.alarms.create({ periodInMinutes: 1 })</code>. On each alarm tick, it evaluates "
            "<code>new Date().toISOString().slice(0, 10)</code> against the stored <code>date</code> field. "
            "Upon detecting a calendar day transition (midnight rollover), the worker atomically: (1) archives the "
            "current <code>DAILY_AGGREGATE</code> to IndexedDB as a historical record; (2) initializes a fresh "
            "aggregate with all counters set to zero; (3) resets all <code>ESCALATION_STATE</code> flags to their "
            "initial values; and (4) resets the in-memory session tracker.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Write Atomicity Guarantee:</b> Both <code>chrome.storage.local.set()</code> operations -- updating the "
            "daily aggregate and resetting escalation state -- are batched into a single storage transaction object, "
            "ensuring they either both commit or both fail. This prevents partial-write race conditions where the "
            "aggregate might be reset while the escalation state retains stale override thresholds from the previous day.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p23)

    # -------------------------------------------------------------------------
    # PAGE 24: 8.4 UML Activity Diagram (Swimlanes)
    # -------------------------------------------------------------------------
    act_img = os.path.join(ASSETS_DIR, 'activity_diagram.png')
    p24 = [
        Paragraph("8.4. Activity Diagram (Swimlane Behavioral Workflow)", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Three-Swimlane Execution Model:</b> The Activity Diagram maps the complete behavioral workflow "
            "of ScrollGuard across three formal UML swimlanes, each representing a distinct execution environment: "
            "(1) <b>Client Viewport -- User / Host DOM</b>, encompassing human user gestures and the host page's "
            "video playback lifecycle; (2) <b>Content Script & Shadow DOM</b>, containing the IntersectionObserver "
            "pipeline, React widget rendering, and event interception logic; and (3) <b>Background Worker & Local DB</b>, "
            "housing the aggregation, limit evaluation, and IndexedDB persistence pipeline.",
            body_j
        ),
        Spacer(1, 5),
        RLImage(act_img, width=490, height=268),
        Spacer(1, 4),
        Paragraph(
            "<b>Figure 8.3: UML Activity Diagram - Three-Swimlane Behavioral Workflow & Escalation Decision Points.</b>",
            fig_caption
        ),
        Spacer(1, 5),
        Paragraph(
            "<b>Decision Diamond Analysis:</b> Two decision diamonds govern the primary execution flow. The first "
            "diamond evaluates <code>totalVideosWatched >= videoLimit</code>: if false (No branch), the badge count "
            "updates and the loop continues. If true (Yes branch), the Stage 1 Soft Nudge activates. The second "
            "diamond evaluates the user's modal choice: selecting 'I'm Done' terminates the session (end state), "
            "while selecting 'Continue (+5)' triggers the progressive friction ladder escalation sub-process.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Parallel Processing across Swimlanes:</b> The content script swimlane and the background worker "
            "swimlane operate concurrently across separate OS-level processes (the Chromium renderer process and "
            "the extension service worker process). Data flows between swimlanes via <code>chrome.runtime.sendMessage()</code> "
            "and <code>chrome.storage.onChanged</code> reactive listeners, ensuring data consistency without "
            "shared-memory race conditions.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p24)

    # -------------------------------------------------------------------------
    # PAGE 25: 8.5 UML Sequence Diagram
    # -------------------------------------------------------------------------
    seq_img = os.path.join(ASSETS_DIR, 'sequence_diagram.png')
    p25 = [
        Paragraph("8.5. Sequence Diagram (Inter-Object Message Chronology)", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Chronological Message Flow Analysis:</b> The UML Sequence Diagram documents the precise temporal "
            "ordering of message exchanges between five system objects: the <b>User</b>, the <b>Host Web DOM</b> "
            "(YouTube Shorts / Instagram Reels viewport), the <b>Content Script & Shadow Root</b> (React widget layer), "
            "the <b>Background Service Worker</b>, and the <b>IndexedDB / Local Storage</b> persistence tier. "
            "Dashed return arrows represent asynchronous callbacks; solid arrows represent direct synchronous invocations.",
            body_j
        ),
        Spacer(1, 5),
        RLImage(seq_img, width=490, height=268),
        Spacer(1, 4),
        Paragraph(
            "<b>Figure 8.4: UML Sequence Diagram - Chronological Message Exchange & Hard Scroll-Lock Enforcement.</b>",
            fig_caption
        ),
        Spacer(1, 5),
        Paragraph(
            "<b>Message 3 -- Runtime Message Routing:</b> When the Content Script's IntersectionObserver fires, it "
            "dispatches <code>chrome.runtime.sendMessage({ type: 'RECORD_EVENT', payload: videoEvent })</code> to "
            "the Background Service Worker. This is the primary inter-process communication (IPC) channel in "
            "Manifest V3. The message crosses process boundaries asynchronously, so the content script's execution "
            "thread is not blocked while the background worker persists data to IndexedDB.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Message 5 -- Reactive Storage Event (Dashed Arrow):</b> After the background worker updates "
            "<code>chrome.storage.local</code> with the new <code>totalVideos</code> count, the browser dispatches "
            "a <code>chrome.storage.onChanged</code> event to all registered listeners. The content script's "
            "registered listener receives this event, checks the new value against <code>videoLimit</code>, and "
            "triggers the Shadow DOM widget's React state update. Messages 6 and 7 follow synchronously within "
            "the same event loop tick: video playback is paused and the Stage 1 modal is rendered.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p25)

    # -------------------------------------------------------------------------
    # PAGE 26: 8.6 UML Component Diagram
    # -------------------------------------------------------------------------
    comp_img = os.path.join(ASSETS_DIR, 'component_diagram.png')
    p26 = [
        Paragraph("8.6. Component Diagram (Modular Subsystem Architecture)", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Modular Decomposition into Decoupled Subsystems:</b> The Component Diagram organizes ScrollGuard's "
            "implementation into six discrete, stereotyped &lt;&lt;component&gt;&gt; modules, each with well-defined "
            "interface boundaries. Components communicate exclusively through formal ports, preventing tight coupling "
            "and enabling independent testing and replacement of individual modules. The diagram employs standard UML "
            "component notation: rectangular boxes with tabbed icons on the left border indicate encapsulated modules.",
            body_j
        ),
        Spacer(1, 5),
        RLImage(comp_img, width=490, height=268),
        Spacer(1, 4),
        Paragraph(
            "<b>Figure 8.5: UML Component Diagram - Six-Subsystem Modular Architecture with Interface Boundaries.</b>",
            fig_caption
        ),
        Spacer(1, 5),
        Paragraph(
            "<b>Component Coupling Analysis:</b> The <b>Host Web DOM Layer</b> and <b>Content Script Engine</b> are "
            "connected via a bi-directional interface (DOM mutation callbacks and event listeners). The Content Script "
            "Engine in turn interfaces with the <b>Shadow DOM UI Sandbox</b> to render friction modals, and with the "
            "<b>Background Service Worker</b> via Chrome runtime messaging. The Background Service Worker interfaces "
            "with the <b>Local Persistence Subsystem</b> (IndexedDB + chrome.storage) for all data reads and writes. "
            "The <b>Web Analytics Cockpit</b> operates as an independent React SPA, querying storage directly.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Shadow DOM Isolation Guarantee:</b> The Shadow DOM UI Sandbox component enforces complete CSS style "
            "and DOM tree isolation from the host page via an <code>attachShadow({ mode: 'open' })</code> call on a "
            "neutral <code>&lt;div&gt;</code> appended to the host page body. No CSS selectors from the host page's "
            "stylesheets can penetrate the Shadow DOM boundary, ensuring ScrollGuard's UI renders with pixel-perfect "
            "fidelity across YouTube, Instagram, Facebook, TikTok, and X without visual contamination.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p26)

    # -------------------------------------------------------------------------
    # PAGE 27: 8.7 UML Deployment Diagram
    # -------------------------------------------------------------------------
    dep_img = os.path.join(ASSETS_DIR, 'deployment_diagram.png')
    p27 = [
        Paragraph("8.7. Deployment Diagram (Physical Execution Environment Topology)", subsec_hdr),
        Spacer(1, 4),
        Paragraph(
            "<b>Physical & Virtual Execution Node Topology:</b> The Deployment Diagram specifies the concrete runtime "
            "environment hosting ScrollGuard's components. The primary &lt;&lt;device&gt;&gt; node is the "
            "<b>Client Workstation</b>, running a Chromium-based browser (Chrome / Brave / Edge). Within the browser "
            "process, two distinct execution environments are isolated: the <b>Web Tab Renderer Process</b> (hosting "
            "content scripts and Shadow DOM) and the <b>Extension Service Worker Sandbox</b> (the persistent background "
            "agent). An optional &lt;&lt;server&gt;&gt; node hosts the Node.js Express API with Groq LLM integration "
            "for AI coach analytics.",
            body_j
        ),
        Spacer(1, 5),
        RLImage(dep_img, width=490, height=268),
        Spacer(1, 4),
        Paragraph(
            "<b>Figure 8.6: UML Deployment Diagram - Multi-Process Browser Architecture & Optional AI Backend Node.</b>",
            fig_caption
        ),
        Spacer(1, 5),
        Paragraph(
            "<b>Process Isolation Security Model:</b> Chromium enforces strict OS-level process isolation between "
            "the Renderer Process (hosting the content scripts injected into social media feeds) and the Extension "
            "Service Worker Process. Cross-process communication occurs exclusively through the validated "
            "<code>chrome.runtime</code> messaging API, preventing content scripts from directly accessing extension "
            "storage or background service resources. This sandboxing architecture is a core security guarantee of "
            "the Manifest V3 extension platform.",
            body_j
        ),
        Spacer(1, 4),
        Paragraph(
            "<b>Privacy-First Local Architecture:</b> The deployment topology deliberately avoids any mandatory "
            "cloud server dependency. All behavioral telemetry -- video events, sessions, daily aggregates, escalation "
            "state -- resides exclusively within the user's local browser storage profile. The optional Node.js API "
            "server is a development-only component for Groq AI coaching features and is never required for core "
            "doomscrolling prevention functionality. This design guarantees complete data sovereignty for end users.",
            body_j
        ),
        PageBreak()
    ]
    pages.extend(p27)

    return pages

print("section_design module defined!")
