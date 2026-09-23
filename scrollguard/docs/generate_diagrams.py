"""
generate_diagrams.py  --  ScrollGuard UML & Architectural Diagrams
Ultra-high-definition, pure monochrome (black & white / grayscale), StarUML 2.5 compliant.
100% aligned with ScrollGuard's real code architecture and the university reference report styling.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon, Circle, Rectangle, Ellipse

OUT = 'd:/projects/scrollguard/docs/assets'
os.makedirs(OUT, exist_ok=True)

# Strict monochrome tokens - 100% compliant with university printing guidelines
BLK = '#000000'
WHT = '#ffffff'
GRY_LIGHT = '#f4f4f4'
GRY_MID = '#e2e2e2'
GRY_DARK = '#222222'

LW_OUTER = 1.3
LW_BORDER = 1.0
LW_DIVIDER = 0.7
LW_ARROW = 0.85

FNT = 'DejaVu Sans'
MONO = 'DejaVu Sans Mono'

def create_canvas(w=11.0, h=6.0):
    fig, ax = plt.subplots(figsize=(w, h), dpi=300)
    ax.set_xlim(0, w)
    ax.set_ylim(0, h)
    ax.set_facecolor(WHT)
    fig.patch.set_facecolor(WHT)
    ax.axis('off')
    return fig, ax

def render_title_header(ax, title, subtitle, cx=None, cy_top=None):
    if cx is None:
        cx = ax.get_xlim()[1] / 2.0
    if cy_top is None:
        cy_top = ax.get_ylim()[1] - 0.24
    ax.text(cx, cy_top, title, ha='center', va='center', fontsize=9.2, fontweight='bold', color=BLK, fontfamily=FNT)
    ax.text(cx, cy_top - 0.22, subtitle, ha='center', va='center', fontsize=7.0, fontstyle='italic', color=GRY_DARK, fontfamily=FNT)

# =============================================================================
# 1. ENTITY-RELATIONSHIP (E-R) DIAGRAM (CHEN'S CANONICAL NOTATION)
# =============================================================================
def generate_er_diagram():
    # Wider canvas to prevent all overlaps
    fig, ax = plt.subplots(figsize=(14.0, 8.0), dpi=300)
    ax.set_xlim(0, 14.0)
    ax.set_ylim(0, 8.0)
    ax.set_facecolor(WHT)
    fig.patch.set_facecolor(WHT)
    ax.axis('off')

    # Title block
    ax.text(7.0, 7.72, "FIGURE 7.1: ENTITY-RELATIONSHIP (E-R) DIAGRAM FOR THE SCROLLGUARD PLATFORM",
            ha='center', va='center', fontsize=9.2, fontweight='bold', color=BLK, fontfamily=FNT)
    ax.text(7.0, 7.46, "Chen's Structural Notation Modeling Telemetry Ingestion, Video Event Lifecycle & Escalation Ladders",
            ha='center', va='center', fontsize=7.0, fontstyle='italic', color=GRY_DARK, fontfamily=FNT)

    def draw_entity(cx, cy, w, h, name):
        rect = Rectangle((cx - w/2, cy - h/2), w, h, facecolor=WHT, edgecolor=BLK, linewidth=LW_OUTER, zorder=3)
        ax.add_patch(rect)
        ax.text(cx, cy, name, ha='center', va='center', fontsize=7.8, fontweight='bold', color=BLK, fontfamily=FNT, zorder=4)

    def draw_diamond(cx, cy, w, h, name):
        pts = [[cx, cy + h/2], [cx + w/2, cy], [cx, cy - h/2], [cx - w/2, cy]]
        poly = Polygon(pts, closed=True, facecolor=WHT, edgecolor=BLK, linewidth=LW_BORDER, zorder=3)
        ax.add_patch(poly)
        ax.text(cx, cy, name, ha='center', va='center', fontsize=6.8, fontweight='bold', color=BLK, fontfamily=FNT, zorder=4)

    def draw_attribute(cx, cy, name, is_pk=False, w=1.05, h=0.38):
        ell = Ellipse((cx, cy), w, h, facecolor=WHT, edgecolor=BLK, linewidth=LW_DIVIDER, zorder=3)
        ax.add_patch(ell)
        ax.text(cx, cy, name, ha='center', va='center', fontsize=5.6, fontweight='bold' if is_pk else 'normal', color=BLK, fontfamily=FNT, zorder=4)
        if is_pk:
            tw = len(name) * 0.044
            ax.plot([cx - tw, cx + tw], [cy - 0.09, cy - 0.09], color=BLK, lw=0.7, zorder=5)

    def line(x1, y1, x2, y2, card='', card_xy=None):
        ax.plot([x1, x2], [y1, y2], color=BLK, linewidth=LW_DIVIDER, zorder=2)
        if card and card_xy:
            ax.text(card_xy[0], card_xy[1], card, fontsize=7.2, fontweight='bold', color=BLK, fontfamily=FNT,
                    ha='center', va='center', bbox=dict(boxstyle='square,pad=0.12', facecolor=WHT, edgecolor='none'))

    # =====================================================================
    # LEVEL 1 ENTITIES  (y = 5.40)
    # Attribute y-levels STAGGERED to prevent cross-entity overlap:
    #   USER attrs:            y = 6.85
    #   SESSION attrs:         y = 6.55
    #   DAILY_AGGREGATE attrs: y = 6.85
    # =====================================================================

    # --- USER / CLIENT  (cx=2.2, cy=5.40) ---
    draw_entity(2.2, 5.40, 1.9, 0.55, "USER / CLIENT")
    draw_attribute(0.7,  6.85, "user_id", is_pk=True, w=1.00)
    draw_attribute(2.2,  6.85, "daily_limit_clips", w=1.50)
    draw_attribute(3.8,  6.85, "idle_timeout_min", w=1.45)
    draw_attribute(0.55, 5.40, "tracking_enabled", w=1.35)
    line(0.7,  6.66, 1.65, 5.68)
    line(2.2,  6.66, 2.2,  5.68)
    line(3.8,  6.66, 2.75, 5.68)
    line(1.23, 5.40, 1.25, 5.40)

    # --- SESSION  (cx=7.0, cy=5.40) ---
    draw_entity(7.0, 5.40, 1.7, 0.55, "SESSION")
    draw_attribute(5.5,  6.55, "session_id", is_pk=True, w=1.05)
    draw_attribute(6.75, 6.55, "platform", w=1.00)
    draw_attribute(7.95, 6.55, "start_time", w=1.05)
    draw_attribute(9.15, 6.55, "end_time", w=1.00)
    draw_attribute(8.3,  4.55, "video_count", w=1.10)
    line(5.5,  6.36, 6.5,  5.68)
    line(6.75, 6.36, 6.9,  5.68)
    line(7.95, 6.36, 7.3,  5.68)
    line(9.15, 6.36, 7.5,  5.68)
    line(8.2,  4.74, 7.5,  5.12)

    # --- DAILY_AGGREGATE  (cx=11.8, cy=5.40) ---
    draw_entity(11.8, 5.40, 2.1, 0.55, "DAILY_AGGREGATE")
    draw_attribute(10.4, 6.85, "date", is_pk=True, w=0.85)
    draw_attribute(11.5, 6.85, "total_videos", w=1.20)
    draw_attribute(12.9, 6.85, "total_watch_ms", w=1.35)
    draw_attribute(13.5, 5.40, "by_platform", w=1.15)
    draw_attribute(13.5, 4.65, "by_hour", w=1.00)
    line(10.4, 6.66, 11.2, 5.68)
    line(11.5, 6.66, 11.7, 5.68)
    line(12.9, 6.66, 12.3, 5.68)
    line(12.92, 5.40, 12.85, 5.40)
    line(13.0, 4.82, 12.5, 5.15)

    # =====================================================================
    # LEVEL 2 ENTITIES  (y = 1.85)
    # =====================================================================

    # --- VIDEO_EVENT  (cx=3.5, cy=1.85) ---
    draw_entity(3.5, 1.85, 1.9, 0.55, "VIDEO_EVENT")
    draw_attribute(2.1, 2.95, "video_id", is_pk=True, w=1.00)
    draw_attribute(3.6, 2.95, "start_time", is_pk=True, w=1.05)
    draw_attribute(1.5, 1.85, "watch_duration", w=1.30)
    draw_attribute(2.0, 0.70, "completed", w=1.05)
    draw_attribute(3.4, 0.70, "skipped", w=0.95)
    draw_attribute(4.7, 0.70, "was_repeat", w=1.10)
    line(2.1,  2.76, 2.9,  2.13)
    line(3.6,  2.76, 3.5,  2.13)
    line(2.15, 1.85, 2.55, 1.85)
    line(2.0,  0.89, 2.9,  1.57)
    line(3.4,  0.89, 3.4,  1.57)
    line(4.7,  0.89, 4.0,  1.57)

    # --- ESCALATION_STATE  (cx=9.8, cy=1.85) ---
    draw_entity(9.8, 1.85, 2.2, 0.55, "ESCALATION_STATE")
    draw_attribute(8.2, 2.95, "override_clips", w=1.20)
    draw_attribute(11.4, 2.95, "takeover_count", w=1.30)
    draw_attribute(8.2, 0.70, "platform", is_pk=True, w=1.00)
    draw_attribute(9.8, 0.70, "focus_state", w=1.10)
    draw_attribute(11.4, 0.70, "nudge_cleared", w=1.25)
    line(8.4,  2.76, 9.1,  2.13)
    line(11.2, 2.76, 10.5, 2.13)
    line(8.2,  0.89, 9.1,  1.57)
    line(9.8,  0.89, 9.8,  1.57)
    line(11.4, 0.89, 10.5, 1.57)

    # =====================================================================
    # RELATIONSHIPS (DIAMONDS)
    # =====================================================================

    # USER -> SESSION  (INITIATES)
    draw_diamond(4.60, 5.40, 1.20, 0.50, "INITIATES")
    line(3.15, 5.40, 4.00, 5.40, "1", (3.58, 5.60))
    line(5.20, 5.40, 6.15, 5.40, "N", (5.68, 5.60))

    # SESSION -> DAILY_AGGREGATE  (SUMMARIZES)
    draw_diamond(9.55, 5.40, 1.35, 0.50, "SUMMARIZES")
    line(7.85, 5.40, 8.87, 5.40, "N", (8.35, 5.60))
    line(10.23, 5.40, 10.75, 5.40, "1", (10.48, 5.60))

    # SESSION -> VIDEO_EVENT  (CONTAINS)
    draw_diamond(5.0, 3.65, 1.20, 0.50, "CONTAINS")
    line(6.5, 5.12, 5.0, 3.90, "1", (5.90, 4.60))
    line(5.0, 3.40, 4.0, 2.13, "N", (4.55, 2.85))

    # SESSION -> ESCALATION_STATE  (ENFORCES)
    draw_diamond(8.2, 3.65, 1.20, 0.50, "ENFORCES")
    line(7.3, 5.12, 8.2, 3.90, "1", (7.60, 4.60))
    line(8.2, 3.40, 9.2, 2.13, "1", (8.55, 2.85))

    plt.tight_layout(pad=0.3)
    plt.savefig(f'{OUT}/er_diagram.png', dpi=300, bbox_inches='tight', facecolor=WHT)
    plt.close()
    print("  [OK] er_diagram.png polished successfully.")

# =============================================================================
# 2. UML 2.5 CLASS DIAGRAM
# =============================================================================
def generate_class_diagram():
    fig, ax = create_canvas(11.0, 6.0)
    render_title_header(
        ax,
        "FIGURE 8.1: UML 2.5 CLASS DIAGRAM FOR SCROLLGUARD CORE ARCHITECTURE",
        "Object-Oriented Service Architecture, Telemetry Engine Abstraction & Multi-Tier Escalation"
    )

    def draw_class(x, y, w, name, stereotype, attrs, methods):
        row_h = 0.150
        hdr_h = 0.36 if stereotype else 0.28
        attr_h = max(len(attrs) * row_h + 0.08, 0.24)
        meth_h = max(len(methods) * row_h + 0.08, 0.24)

        # Header
        hdr = Rectangle((x, y + attr_h + meth_h), w, hdr_h, facecolor=GRY_LIGHT, edgecolor=BLK, linewidth=LW_BORDER, zorder=3)
        ax.add_patch(hdr)
        if stereotype:
            ax.text(x + w/2, y + attr_h + meth_h + hdr_h - 0.11, f"<<{stereotype}>>", ha='center', va='center', fontsize=5.8, fontstyle='italic', color=GRY_DARK, fontfamily=FNT, zorder=4)
            ax.text(x + w/2, y + attr_h + meth_h + hdr_h - 0.25, name, ha='center', va='center', fontsize=7.2, fontweight='bold', color=BLK, fontfamily=FNT, zorder=4)
        else:
            ax.text(x + w/2, y + attr_h + meth_h + hdr_h/2, name, ha='center', va='center', fontsize=7.2, fontweight='bold', color=BLK, fontfamily=FNT, zorder=4)

        # Attributes
        arect = Rectangle((x, y + meth_h), w, attr_h, facecolor=WHT, edgecolor=BLK, linewidth=LW_BORDER, zorder=3)
        ax.add_patch(arect)
        for i, a in enumerate(attrs):
            ax.text(x + 0.10, y + meth_h + attr_h - 0.10 - i * row_h, a, ha='left', va='center', fontsize=5.5, color=BLK, fontfamily=MONO, zorder=4)

        # Methods
        mrect = Rectangle((x, y), w, meth_h, facecolor=WHT, edgecolor=BLK, linewidth=LW_BORDER, zorder=3)
        ax.add_patch(mrect)
        for i, m in enumerate(methods):
            ax.text(x + 0.10, y + meth_h - 0.10 - i * row_h, m, ha='left', va='center', fontsize=5.5, color=BLK, fontfamily=MONO, zorder=4)

    # Top Row starts at y = 2.85
    draw_class(
        0.5, 2.85, 3.1, "VideoTracker", "telemetry observer",
        attrs=[
            "- platform : Platform",
            "- activeVideo : HTMLVideoElement",
            "- activeVideoId : string",
            "- startTime : number",
            "- accumulatedTime : number",
            "- keypressCount : number",
            "- mousemoveCount : number",
            "- isTabVisible : boolean"
        ],
        methods=[
            "+ track(video : HTMLVideoElement) : void",
            "+ stop() : void",
            "+ handlePlay() : void",
            "+ handlePause() : void",
            "+ handleVisibilityChange() : void"
        ]
    )

    draw_class(
        4.0, 2.85, 3.2, "WidgetController", "state machine",
        attrs=[
            "- focusState : FocusState",
            "- totalVideosWatched : number",
            "- videoLimit : number",
            "- takeoverCount : number",
            "- currentReason : string",
            "- isScrollLocked : boolean",
            "- countdownTimer : number"
        ],
        methods=[
            "+ handleNudgeDismiss() : void",
            "+ handleIntentionSubmit(r : string) : void",
            "+ handleBreatheFinish() : void",
            "+ enforceHardScrollLock() : void",
            "+ pauseActiveMedia() : void"
        ]
    )

    draw_class(
        7.6, 3.15, 2.9, "BehaviorClassifier", "analytics engine",
        attrs=[
            "+ RAPID_SWIPE_MS : 3000",
            "+ BINGE_THRESHOLD_MS : 1800000",
            "+ MAX_DOPAMINE_SCORE : 100",
            "+ HEALTHY_SPEED : 15.0"
        ],
        methods=[
            "+ classifyVideoWatch(m) : ClassResult",
            "+ calculateDopamineScore(agg) : number",
            "+ calculateScrollSpeed(t, c) : SpeedInfo",
            "+ detectDoomscrolling(s) : boolean"
        ]
    )

    # Bottom Row (y = 0.40)
    draw_class(
        0.5, 0.40, 3.1, "BackgroundServiceWorker", "manifest v3 agent",
        attrs=[
            "- activeSessions : Record<Platform, Session>",
            "- sessionTimeoutRefs : Record<Platform, Timer>",
            "- todayStats : TodayStats"
        ],
        methods=[
            "+ onMessage(action, payload) : Promise",
            "+ updateDailyAggregate(events) : void",
            "+ closeSession(platform) : Promise<void>",
            "+ checkAndResetDailyStats() : void",
            "+ syncDataToBackend() : Promise<void>"
        ]
    )

    draw_class(
        4.0, 0.40, 3.2, "LocalStorageManager", "dual storage repository",
        attrs=[
            "- dbName : string = 'scrollguard_db'",
            "- dbVersion : number = 1",
            "- localCache : chrome.storage.local"
        ],
        methods=[
            "+ saveSession(s : Session) : Promise<void>",
            "+ saveVideoEvent(e : VideoEvent) : Promise<void>",
            "+ getSessions() : Promise<Session[]>",
            "+ getDailyAggregate(d) : Promise<DailyAggregate>",
            "+ setDailyAggregate(d, data) : Promise<void>"
        ]
    )

    draw_class(
        7.6, 0.50, 2.9, "AiCoachService", "express backend",
        attrs=[
            "- groqClient : Groq",
            "- groqModel : string",
            "- expressApp : Express"
        ],
        methods=[
            "+ generateDailyCoach(agg) : Promise<Report>",
            "+ generateWeeklyCoach(aggs) : Promise<Report>",
            "+ predictHabitRisk(p) : Promise<Report>",
            "+ syncData(backupData) : void"
        ]
    )

    def arrow(x1, y1, x2, y2, label='', dashed=False):
        ls = '--' if dashed else '-'
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color=BLK, lw=LW_ARROW, linestyle=ls))
        if label:
            mx, my = (x1 + x2)/2, (y1 + y2)/2
            ax.text(mx, my + 0.08, label, fontsize=5.8, color=GRY_DARK, fontstyle='italic',
                    ha='center', va='bottom', fontfamily=FNT,
                    bbox=dict(boxstyle='square,pad=0.1', facecolor=WHT, edgecolor='none'))

    # VideoTracker -> WidgetController (notifies)
    arrow(3.6, 4.15, 4.0, 4.15, "notifies")
    # WidgetController -> BehaviorClassifier (evaluates)
    arrow(7.2, 4.15, 7.6, 4.15, "evaluates")
    # VideoTracker -> BackgroundServiceWorker (dispatches IPC)
    arrow(2.0, 2.85, 2.0, 2.05, "dispatches IPC", dashed=True)
    # WidgetController -> LocalStorageManager (reads state)
    arrow(5.6, 2.85, 5.6, 2.10, "synchronizes")
    # BackgroundServiceWorker -> LocalStorageManager (persists)
    arrow(3.6, 1.25, 4.0, 1.25, "persists")
    # LocalStorageManager -> AiCoachService (REST /api/sync)
    arrow(7.2, 1.25, 7.6, 1.25, "REST /api/sync", dashed=True)

    plt.tight_layout(pad=0.2)
    plt.savefig(f'{OUT}/class_diagram.png', dpi=300, bbox_inches='tight', facecolor=WHT)
    plt.close()
    print("  [OK] class_diagram.png polished successfully.")

# =============================================================================
# 3. UML 2.5 USE CASE DIAGRAM
# =============================================================================
def generate_use_case_diagram():
    fig, ax = create_canvas(11.0, 6.0)
    render_title_header(
        ax,
        "FIGURE 8.2: UML 2.5 USE CASE DIAGRAM FOR SCROLLGUARD PLATFORM",
        "User Interaction Boundaries, Telemetry Capture, Friction Escalation & AI Behavioral Insights"
    )

    rect = Rectangle((2.3, 0.35), 6.4, 4.95, facecolor=WHT, edgecolor=BLK, linewidth=LW_OUTER, zorder=1)
    ax.add_patch(rect)
    ax.text(5.5, 5.12, "ScrollGuard Platform Boundary", ha='center', va='center', fontsize=8.2, fontweight='bold', color=BLK, fontfamily=FNT)

    def draw_actor(cx, cy, name):
        ax.add_patch(Circle((cx, cy + 0.35), 0.14, facecolor=WHT, edgecolor=BLK, linewidth=LW_BORDER, zorder=3))
        ax.plot([cx, cx], [cy + 0.21, cy - 0.12], color=BLK, linewidth=LW_BORDER, zorder=3)
        ax.plot([cx - 0.22, cx + 0.22], [cy + 0.06, cy + 0.06], color=BLK, linewidth=LW_BORDER, zorder=3)
        ax.plot([cx, cx - 0.18], [cy - 0.12, cy - 0.40], color=BLK, linewidth=LW_BORDER, zorder=3)
        ax.plot([cx, cx + 0.18], [cy - 0.12, cy - 0.40], color=BLK, linewidth=LW_BORDER, zorder=3)
        ax.text(cx, cy - 0.58, name, ha='center', va='top', fontsize=6.6, fontweight='bold', color=BLK, fontfamily=FNT)

    def draw_uc(cx, cy, text, w=2.45, h=0.38):
        ell = Ellipse((cx, cy), w, h, facecolor=WHT, edgecolor=BLK, linewidth=LW_BORDER, zorder=3)
        ax.add_patch(ell)
        ax.text(cx, cy, text, ha='center', va='center', fontsize=6.2, color=BLK, fontfamily=FNT, zorder=4)

    # Actors
    draw_actor(1.15, 3.20, "Digital Consumer\n(User)")
    draw_actor(9.85, 4.45, "Social Media Feed\n(YouTube / IG)")
    draw_actor(9.85, 1.25, "Service Worker\n(Background Timer)")

    # Left Use Cases (Column 1: cx = 3.9)
    draw_uc(3.9, 4.55, "Browse Short-Form Videos")             # UC-01
    draw_uc(3.9, 3.65, "View Brain Health Badge (HUD)")        # UC-02
    draw_uc(3.9, 2.75, "Trigger Stage 1 Soft Nudge")           # UC-03
    draw_uc(3.9, 1.85, "Inspect Circadian Heatmap")            # UC-07
    draw_uc(3.9, 0.95, "Generate AI Coaching Insights")

    # Right Use Cases (Column 2: cx = 7.1)
    draw_uc(7.1, 4.55, "Enforce Viewport Tracking")
    draw_uc(7.1, 3.65, "Submit Reason on Intention Wall")      # UC-04
    draw_uc(7.1, 2.90, "Complete 60s Breathing Reset")         # UC-05
    draw_uc(7.1, 2.15, "Compulsory Takeover Lockout")          # UC-06
    draw_uc(7.1, 1.40, "Automate 90s Inactivity Flush")        # UC-08
    draw_uc(7.1, 0.65, "Automated Midnight Daily Reset")       # UC-09

    # Connectors from User to Column 1 Use Cases
    ax.plot([1.4, 2.68], [3.35, 4.55], color=BLK, lw=LW_DIVIDER)
    ax.plot([1.4, 2.68], [3.25, 3.65], color=BLK, lw=LW_DIVIDER)
    ax.plot([1.4, 2.68], [3.15, 2.75], color=BLK, lw=LW_DIVIDER)
    ax.plot([1.4, 2.68], [3.00, 1.85], color=BLK, lw=LW_DIVIDER)

    # Connector from Social Media Feed to Enforce Viewport Tracking
    ax.plot([9.55, 8.32], [4.45, 4.55], color=BLK, lw=LW_DIVIDER)

    # Connectors from Service Worker to Background Automation
    ax.plot([9.55, 8.32], [1.35, 1.40], color=BLK, lw=LW_DIVIDER)
    ax.plot([9.55, 8.32], [1.15, 0.65], color=BLK, lw=LW_DIVIDER)

    # Include / Extend relationships
    def draw_rel(x1, y1, x2, y2, label, label_pos=None):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color=BLK, lw=0.8, linestyle='--'))
        if label_pos:
            mx, my = label_pos
        else:
            mx, my = (x1 + x2)/2, (y1 + y2)/2
        ax.text(mx, my, label, fontsize=5.5, color=GRY_DARK, fontstyle='italic',
                ha='center', va='center', fontfamily=FNT,
                bbox=dict(boxstyle='square,pad=0.12', facecolor=WHT, edgecolor='none', zorder=5))

    # UC-01 <<include>> Enforce Viewport Tracking
    draw_rel(5.12, 4.55, 5.88, 4.55, "<<include>>", (5.50, 4.70))

    # UC-04, UC-05, UC-06 <<extend>> UC-03
    draw_rel(5.88, 3.65, 5.10, 2.85, "<<extend>>", (5.55, 3.35))
    draw_rel(5.88, 2.90, 5.12, 2.75, "<<extend>>", (5.50, 2.92))
    draw_rel(5.88, 2.15, 5.10, 2.65, "<<extend>>", (5.55, 2.30))

    # UC-07 <<include>> Generate AI Coaching Insights
    draw_rel(3.90, 1.66, 3.90, 1.14, "<<include>>", (4.28, 1.40))

    plt.tight_layout(pad=0.2)
    plt.savefig(f'{OUT}/use_case_diagram.png', dpi=300, bbox_inches='tight', facecolor=WHT)
    plt.close()
    print("  [OK] use_case_diagram.png polished successfully.")

# =============================================================================
# 4. UML 2.5 ACTIVITY DIAGRAM
# =============================================================================
def generate_activity_diagram():
    fig, ax = create_canvas(11.0, 6.0)
    render_title_header(
        ax,
        "FIGURE 8.3: UML 2.5 ACTIVITY WORKFLOW DIAGRAM FOR TELEMETRY & ESCALATION",
        "Three-Swimlane Execution Model: Client Viewport, Content Script & Shadow DOM, Background Worker & Local DB"
    )

    lane_top = 5.25
    lane_bot = 0.25
    lane_hdr = 0.42
    lane_w = 3.30
    lane_starts = [0.45, 3.85, 7.25]

    lane_labels = [
        "Client Viewport —\nUser / Host DOM",
        "Content Script &\nShadow DOM",
        "Background Worker\n& Local DB"
    ]

    for lx, label in zip(lane_starts, lane_labels):
        # Header box
        hdr = Rectangle((lx, lane_top - lane_hdr), lane_w, lane_hdr,
                        facecolor=GRY_LIGHT, edgecolor=BLK, linewidth=LW_BORDER, zorder=2)
        ax.add_patch(hdr)
        ax.text(lx + lane_w/2, lane_top - lane_hdr/2, label,
                ha='center', va='center', fontsize=6.8, fontweight='bold',
                color=BLK, fontfamily=FNT, zorder=3)
        # Body
        body = Rectangle((lx, lane_bot), lane_w, lane_top - lane_hdr - lane_bot,
                         facecolor=WHT, edgecolor=BLK, linewidth=LW_DIVIDER,
                         linestyle='-', zorder=1)
        ax.add_patch(body)

    L1 = lane_starts[0] + lane_w / 2   # 2.10
    L2 = lane_starts[1] + lane_w / 2   # 5.50
    L3 = lane_starts[2] + lane_w / 2   # 8.90

    def draw_action(cx, cy, text, w=2.70, h=0.42):
        rect = FancyBboxPatch((cx - w/2, cy - h/2), w, h,
                              boxstyle="round,pad=0.04", facecolor=WHT,
                              edgecolor=BLK, linewidth=LW_BORDER, zorder=3)
        ax.add_patch(rect)
        ax.text(cx, cy, text, ha='center', va='center', fontsize=5.8,
                color=BLK, fontfamily=FNT, zorder=4)

    def draw_diamond(cx, cy, w, h, text):
        hw, hh = w/2, h/2
        pts = [[cx, cy + hh], [cx + hw, cy], [cx, cy - hh], [cx - hw, cy]]
        ax.add_patch(Polygon(pts, closed=True, facecolor=WHT, edgecolor=BLK,
                             linewidth=LW_BORDER, zorder=3))
        ax.text(cx, cy, text, ha='center', va='center', fontsize=5.5,
                fontweight='bold', color=BLK, fontfamily=FNT, zorder=4)

    def arrow(x1, y1, x2, y2):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color=BLK, lw=LW_ARROW, zorder=5))

    # Initial State (L1, y=4.50)
    ax.add_patch(Circle((L1, 4.50), 0.10, facecolor=BLK, edgecolor=BLK, zorder=3))
    arrow(L1, 4.40, L1, 4.16)

    # 1. User scrolls feed (L1, y=3.95)
    draw_action(L1, 3.95, "User Scrolls Feed\n(Host DOM Mutation)", w=2.60)
    arrow(L1 + 1.30, 3.95, L2 - 1.35, 3.95)

    # 2. IntersectionObserver (L2, y=3.95)
    draw_action(L2, 3.95, "IntersectionObserver Tracks\nViewport Playback (≥60%)", w=2.70)
    arrow(L2 + 1.35, 3.95, L3 - 1.35, 3.95)

    # 3. Record video event (L3, y=3.95)
    draw_action(L3, 3.95, "Record Video Event &\nPersist to IndexedDB", w=2.70)
    arrow(L3, 3.74, L3, 3.42)

    # 4. Update daily aggregate (L3, y=3.22)
    draw_action(L3, 3.22, "Update Daily Aggregate\n(Video Count & Watch ms)", w=2.70)
    arrow(L3, 3.01, L3, 2.76)

    # 5. Decision 1: Daily Limit Exceeded? (L3, y=2.52)
    draw_diamond(L3, 2.52, 1.80, 0.44, "Daily Limit\nExceeded?")

    # Branch [No] -> Back to L2 update badge
    ax.plot([L3 - 0.90, L2 + 1.35], [2.52, 2.52], color=BLK, lw=LW_ARROW)
    ax.text((L3 - 0.90 + L2 + 1.35)/2, 2.62, "[No]", fontsize=5.5, color=BLK, fontfamily=FNT, ha='center')
    draw_action(L2, 2.52, "Update Brain Health\nBadge HUD Count", w=2.70)

    # Feedback bus at x=3.55 (in Lane 1 near border):
    # From Update Badge (L2) left side:
    ax.plot([L2 - 1.35, 3.55], [2.52, 2.52], color=BLK, lw=0.7, linestyle='--')
    ax.plot([3.55, 3.55, 2.10, 2.10], [1.05, 3.55, 3.55, 3.74], color=BLK, lw=0.7, linestyle='--')
    ax.annotate('', xy=(2.10, 3.74), xytext=(2.10, 3.66),
                arrowprops=dict(arrowstyle='->', color=BLK, lw=0.7))

    # Branch [Yes] -> Down in L3 then into L2 Stage 1 Soft Nudge
    ax.plot([L3, L3, L2 + 1.35], [2.30, 1.70, 1.70], color=BLK, lw=LW_ARROW)
    ax.text(L3 + 0.08, 2.05, "[Yes]", fontsize=5.5, color=BLK, fontfamily=FNT, va='center')
    ax.annotate('', xy=(L2 + 1.35, 1.70), xytext=(L2 + 1.45, 1.70),
                arrowprops=dict(arrowstyle='->', color=BLK, lw=LW_ARROW))

    # 6. Stage 1 Soft Nudge (L2, y=1.70)
    draw_action(L2, 1.70, "Stage 1: Soft Nudge Modal\n(Pause Media & Scroll-Lock)", w=2.70)
    arrow(L2 - 1.35, 1.70, L1 + 0.85, 1.70)

    # 7. Decision 2: User Action? (L1, y=1.70)
    draw_diamond(L1, 1.70, 1.70, 0.44, "User Action\non Modal?")

    # Branch [Continue (+5)] -> goes down and right into L2 Friction Ladder
    ax.plot([L1, L1, L2 - 1.35], [1.48, 1.05, 1.05], color=BLK, lw=LW_ARROW)
    ax.text(L1 + 0.10, 1.22, "[Continue (+5)]", fontsize=5.2, color=BLK, fontfamily=FNT)
    ax.annotate('', xy=(L2 - 1.35, 1.05), xytext=(L2 - 1.45, 1.05),
                arrowprops=dict(arrowstyle='->', color=BLK, lw=LW_ARROW))
    draw_action(L2, 1.05, "Escalate Friction Ladder\n(Stage 2-4: Intention/Breathe/Lock)", w=2.70)

    # Loopback from Friction Ladder (L2) into unified feedback bus at x=3.55
    ax.plot([L2 - 1.35, 3.55], [1.05, 1.05], color=BLK, lw=0.7, linestyle='--')

    # Branch [I'm Done] -> Left then Down in Lane 1 to Close Session
    ax.plot([L1 - 0.85, 0.85, 0.85, L1 - 1.10], [1.70, 1.70, 0.65, 0.65], color=BLK, lw=LW_ARROW)
    ax.text(0.85, 1.25, "[I'm Done]", fontsize=5.2, color=BLK, fontfamily=FNT, ha='center',
            bbox=dict(boxstyle='square,pad=0.08', facecolor=WHT, edgecolor='none'))
    ax.annotate('', xy=(L1 - 1.10, 0.65), xytext=(L1 - 1.20, 0.65),
                arrowprops=dict(arrowstyle='->', color=BLK, lw=LW_ARROW))

    draw_action(L1, 0.65, "Close Session &\nPersist Final Telemetry", w=2.20, h=0.38)
    arrow(L1, 0.46, L1, 0.35)

    # Activity Final State (Bullseye)
    ax.add_patch(Circle((L1, 0.30), 0.10, facecolor=WHT, edgecolor=BLK, linewidth=LW_BORDER, zorder=3))
    ax.add_patch(Circle((L1, 0.30), 0.06, facecolor=BLK, edgecolor=BLK, zorder=4))
    ax.text(L1 + 0.20, 0.30, "Session Closed", fontsize=5.2, fontstyle='italic', va='center', color=BLK, fontfamily=FNT)

    plt.tight_layout(pad=0.2)
    plt.savefig(f'{OUT}/activity_diagram.png', dpi=300, bbox_inches='tight', facecolor=WHT)
    plt.close()
    print("  [OK] activity_diagram.png polished successfully.")

# =============================================================================
# 5. UML 2.5 SEQUENCE DIAGRAM
# =============================================================================
def generate_sequence_diagram():
    fig, ax = create_canvas(11.0, 6.0)
    render_title_header(
        ax,
        "FIGURE 8.4: UML 2.5 SEQUENCE DIAGRAM FOR SHORT-FORM VIDEO TRACKING & INTERVENTION",
        "Chronological Message Invocations Across Host DOM, Content Script, Background Worker & AI Backend"
    )

    lifelines = [
        (1.00, "User\n(Consumer)"),
        (2.80, "Host Feed DOM\n(YouTube/Reels)"),
        (4.60, "Content Script\n(VideoTracker)"),
        (6.40, "Shadow Root\n(Widget UI)"),
        (8.20, "Background Worker\n(Manifest V3)"),
        (10.00, "Persistence & AI\n(IDB / :3000)")
    ]

    top_y = 5.25
    bot_y = 0.40
    box_w = 1.45
    box_h = 0.44

    for lx, name in lifelines:
        rect = Rectangle((lx - box_w/2, top_y - box_h), box_w, box_h, facecolor=GRY_LIGHT, edgecolor=BLK, linewidth=LW_BORDER, zorder=3)
        ax.add_patch(rect)
        ax.text(lx, top_y - box_h/2, name, ha='center', va='center', fontsize=6.2, fontweight='bold', color=BLK, fontfamily=FNT, zorder=4)
        ax.plot([lx, lx], [top_y - box_h, bot_y], color=BLK, linewidth=0.7, linestyle='--', zorder=1)

    def draw_act(lx, y1, y2):
        w = 0.12
        rect = Rectangle((lx - w/2, y2), w, y1 - y2, facecolor=WHT, edgecolor=BLK, linewidth=0.6, zorder=2)
        ax.add_patch(rect)

    draw_act(1.00, 4.65, 0.60)
    draw_act(2.80, 4.55, 2.20)
    draw_act(4.60, 4.35, 1.90)
    draw_act(6.40, 3.35, 1.10)
    draw_act(8.20, 3.85, 0.70)
    draw_act(10.00, 3.65, 0.70)

    def msg(x1, x2, y, text, dashed=False):
        ls = '--' if dashed else '-'
        ax.annotate('', xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle='->', color=BLK, lw=0.8, linestyle=ls))
        mx = (x1 + x2)/2
        ax.text(mx, y + 0.05, text, ha='center', va='bottom', fontsize=5.5, color=BLK, fontfamily=FNT,
                bbox=dict(boxstyle='square,pad=0.12', facecolor=WHT, edgecolor='none', zorder=3))

    msg(1.00, 2.80, 4.50, "1: opens short-form feed")
    msg(2.80, 4.60, 4.20, "2: IntersectionObserver fires (>=60%)")
    msg(4.60, 8.20, 3.90, "3: sendMessage(RECORD_VIDEO_EVENT)")
    msg(8.20, 10.00, 3.60, "4: saveVideoEvent() to IndexedDB")
    msg(8.20, 10.00, 3.30, "5: updateDailyAggregate(event)")
    msg(10.00, 6.40, 3.00, "6: storage.onChanged (videos >= limit)", dashed=True)
    msg(6.40, 2.80, 2.70, "7: video.pause() & capture-phase scroll-lock")
    msg(6.40, 1.00, 2.40, "8: renderStageModal(focusState: 'nudge')")
    msg(1.00, 6.40, 2.10, "9: userAction('Continue (+5)')")
    msg(6.40, 8.20, 1.80, "10: updateEscalationState(nextStage)")
    msg(8.20, 10.00, 1.50, "11: storage.set(escalationState)")
    msg(8.20, 10.00, 1.20, "12: syncDataToBackend() POST /api/sync")
    msg(10.00, 8.20, 0.90, "13: HTTP 200 { success: true }", dashed=True)
    msg(8.20, 6.40, 0.65, "14: renderIntentionWall(Stage 2)", dashed=True)

    plt.tight_layout(pad=0.2)
    plt.savefig(f'{OUT}/sequence_diagram.png', dpi=300, bbox_inches='tight', facecolor=WHT)
    plt.close()
    print("  [OK] sequence_diagram.png polished successfully.")

# =============================================================================
# 6. UML 2.5 COMPONENT DIAGRAM
# =============================================================================
def generate_component_diagram():
    fig, ax = create_canvas(11.0, 6.0)
    render_title_header(
        ax,
        "FIGURE 8.5: UML 2.5 COMPONENT DIAGRAM FOR SCROLLGUARD ARCHITECTURE",
        "Six-Subsystem Modular Architecture with Decoupled Interface Boundaries & Formal Ports"
    )

    def draw_pkg(x, y, w, h, title):
        rect = Rectangle((x, y), w, h, facecolor=WHT, edgecolor=BLK, linewidth=LW_BORDER, linestyle='--', zorder=1)
        ax.add_patch(rect)
        tab = Rectangle((x, y + h), 2.4, 0.22, facecolor=GRY_LIGHT, edgecolor=BLK, linewidth=LW_DIVIDER, zorder=2)
        ax.add_patch(tab)
        ax.text(x + 1.2, y + h + 0.11, title, ha='center', va='center', fontsize=6.2, fontweight='bold', color=BLK, fontfamily=FNT, zorder=3)

    def draw_comp(cx, cy, w, h, name, desc=''):
        bx = cx - w/2
        by = cy - h/2
        body = Rectangle((bx, by), w, h, facecolor=WHT, edgecolor=BLK, linewidth=LW_BORDER, zorder=3)
        ax.add_patch(body)
        # UML Component icon: two small tabs on left border
        tab_w, tab_h = 0.20, 0.09
        ax.add_patch(Rectangle((bx - 0.10, by + h - 0.17), tab_w, tab_h, facecolor=WHT, edgecolor=BLK, linewidth=0.6, zorder=4))
        ax.add_patch(Rectangle((bx - 0.10, by + h - 0.31), tab_w, tab_h, facecolor=WHT, edgecolor=BLK, linewidth=0.6, zorder=4))
        # <<component>> stereotype
        ax.text(cx + 0.06, cy + h/2 - 0.16, "<<component>>", ha='center', va='center', fontsize=5.5, fontstyle='italic', color=GRY_DARK, fontfamily=FNT, zorder=5)
        # Name
        ax.text(cx + 0.06, cy + h/2 - 0.33, name, ha='center', va='center', fontsize=6.8, fontweight='bold', color=BLK, fontfamily=FNT, zorder=5)
        # Description
        if desc:
            ax.text(cx + 0.06, cy - h/2 + 0.15, desc, ha='center', va='center', fontsize=5.2, fontstyle='italic', color=GRY_DARK, fontfamily=MONO, zorder=5)

    def draw_port(px, py):
        pw = 0.10
        ax.add_patch(Rectangle((px - pw/2, py - pw/2), pw, pw, facecolor=WHT, edgecolor=BLK, linewidth=0.7, zorder=6))

    # PACKAGE 1: Client Browser Tier (Left) - width 4.50, x in [0.40, 4.90]
    draw_pkg(0.40, 0.25, 4.50, 4.80, "Client Browser Tier")

    # C1: Host Web DOM Layer
    draw_comp(2.65, 4.35, 3.90, 0.72, "Host Web DOM Layer",
              "youtube.iife.js, instagram.iife.js")
    draw_port(2.65, 3.99)

    # C2: Content Script Engine
    draw_comp(2.65, 3.25, 3.90, 0.72, "Content Script Engine",
              "VideoTracker, BehaviorClassifier, Platform Adapters")
    draw_port(2.65, 3.61)
    draw_port(2.65, 2.89)

    # C3: Shadow DOM UI Sandbox
    draw_comp(2.65, 2.15, 3.90, 0.72, "Shadow DOM UI Sandbox",
              "Widget.tsx (Nudge, Intention Wall, Breathe, Lockout)")
    draw_port(2.65, 2.51)
    draw_port(2.65, 1.79)

    # C4: Background Service Worker
    draw_comp(2.65, 0.95, 3.90, 0.72, "Background Service Worker",
              "Sessions, Alarms, Aggregation, Storage Manager")
    draw_port(2.65, 1.31)
    draw_port(4.60, 1.10)
    draw_port(4.60, 0.80)

    # PACKAGE 2: Storage & Analytics Tier (Right) - width 4.50, x in [6.10, 10.60]
    draw_pkg(6.10, 0.25, 4.50, 4.80, "Storage & Analytics Tier")

    # C5: Local Persistence Subsystem
    draw_comp(8.35, 3.60, 3.90, 0.95, "Local Persistence Subsystem",
              "IndexedDB (scrollguard_db) + chrome.storage.local")
    draw_port(8.35, 3.125)
    draw_port(6.40, 3.60)

    # C6: Web Analytics Cockpit
    draw_comp(8.35, 1.65, 3.90, 0.95, "Web Analytics Cockpit",
              "React 18 SPA + Express REST API + Groq AI Coach")
    draw_port(8.35, 2.125)
    draw_port(6.40, 1.65)

    def connect_v(x, y1, y2, label):
        ax.annotate('', xy=(x, y2), xytext=(x, y1),
                    arrowprops=dict(arrowstyle='->', color=BLK, lw=LW_ARROW))
        my = (y1 + y2)/2
        ax.text(x + 0.08, my, label, ha='left', va='center', fontsize=5.4, color=GRY_DARK, fontfamily=FNT,
                bbox=dict(boxstyle='square,pad=0.1', facecolor=WHT, edgecolor='none', zorder=7))

    # C1 -> C2
    connect_v(2.65, 3.99, 3.61, "DOM Events & MutationObserver")

    # C2 -> C3
    connect_v(2.65, 2.89, 2.51, "renderStage(focusState)")

    # C3 -> C4
    connect_v(2.65, 1.79, 1.31, "chrome.runtime.sendMessage()")

    # C5 -> C6
    connect_v(8.35, 3.125, 2.125, "storage.get() & IDB queries")

    # Orthogonal Manhattan Routing: C4 -> C5 (IndexedDB / storage bus)
    ax.plot([4.60, 5.50, 5.50, 6.40], [1.10, 1.10, 3.60, 3.60], color=BLK, lw=LW_ARROW)
    ax.annotate('', xy=(6.40, 3.60), xytext=(6.30, 3.60),
                arrowprops=dict(arrowstyle='->', color=BLK, lw=LW_ARROW))
    ax.text(5.50, 2.65, "IndexedDB &\nchrome.storage", ha='center', va='center', fontsize=5.2,
            color=GRY_DARK, fontfamily=FNT, bbox=dict(boxstyle='square,pad=0.12', facecolor=WHT, edgecolor='none', zorder=7))

    # Orthogonal Manhattan Routing: C4 -> C6 (REST sync bus)
    ax.plot([4.60, 5.50, 5.50, 6.40], [0.80, 0.80, 1.65, 1.65], color=BLK, lw=LW_ARROW)
    ax.annotate('', xy=(6.40, 1.65), xytext=(6.30, 1.65),
                arrowprops=dict(arrowstyle='->', color=BLK, lw=LW_ARROW))
    ax.text(5.50, 1.25, "POST /api/sync\n(:3000)", ha='center', va='center', fontsize=5.2,
            color=GRY_DARK, fontfamily=FNT, bbox=dict(boxstyle='square,pad=0.12', facecolor=WHT, edgecolor='none', zorder=7))

    plt.tight_layout(pad=0.2)
    plt.savefig(f'{OUT}/component_diagram.png', dpi=300, bbox_inches='tight', facecolor=WHT)
    plt.close()
    print("  [OK] component_diagram.png polished successfully.")

# =============================================================================
# 7. UML 2.5 DEPLOYMENT DIAGRAM
# =============================================================================
def generate_deployment_diagram():
    fig, ax = create_canvas(11.0, 6.0)
    render_title_header(
        ax,
        "FIGURE 8.6: UML 2.5 DEPLOYMENT TOPOLOGY DIAGRAM FOR SCROLLGUARD",
        "Physical and Virtual Execution Nodes: Client Web Browser, Node.js Express Server & Cloud Accelerated LPUs"
    )

    def draw_3d_node(x, y, w, h, name, stereotype):
        depth = 0.16
        # Top face
        top_pts = [[x, y + h], [x + depth, y + h + depth], [x + w + depth, y + h + depth], [x + w, y + h]]
        ax.add_patch(Polygon(top_pts, closed=True, facecolor=GRY_LIGHT, edgecolor=BLK, linewidth=LW_BORDER, zorder=2))
        # Right face
        rgt_pts = [[x + w, y], [x + w + depth, y + depth], [x + w + depth, y + h + depth], [x + w, y + h]]
        ax.add_patch(Polygon(rgt_pts, closed=True, facecolor=GRY_MID, edgecolor=BLK, linewidth=LW_BORDER, zorder=2))
        # Front face
        front = Rectangle((x, y), w, h, facecolor=WHT, edgecolor=BLK, linewidth=LW_OUTER, zorder=3)
        ax.add_patch(front)
        ax.text(x + w/2, y + h - 0.20, f"<<{stereotype}>>", ha='center', va='center', fontsize=6.0, fontstyle='italic', color=GRY_DARK, fontfamily=FNT, zorder=4)
        ax.text(x + w/2, y + h - 0.38, name, ha='center', va='center', fontsize=7.6, fontweight='bold', color=BLK, fontfamily=FNT, zorder=4)

    def draw_artifact(x, y, w, h, name, desc):
        rect = Rectangle((x, y), w, h, facecolor=GRY_LIGHT, edgecolor=BLK, linewidth=LW_DIVIDER, zorder=4)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h - 0.13, f"<<artifact>>  {name}", ha='center', va='center', fontsize=6.0, fontweight='bold', color=BLK, fontfamily=FNT, zorder=5)
        ax.text(x + w/2, y + 0.11, desc, ha='center', va='center', fontsize=5.3, fontstyle='italic', color=GRY_DARK, fontfamily=MONO, zorder=5)

    # 1. Device: Client Workstation (Left)
    draw_3d_node(0.4, 1.8, 4.4, 3.4, "Client Terminal / Workstation", "device")
    draw_artifact(0.65, 4.0, 3.9, 0.40, "Modern Web Browser", "Chrome / Brave / Edge / Chromium Engine")
    draw_artifact(0.65, 3.3, 3.9, 0.48, "Web Tab Content Script Bundle", "youtube.iife.js, instagram.iife.js, Shadow DOM UI")
    draw_artifact(0.65, 2.5, 3.9, 0.58, "Manifest V3 Background Service Worker", "background.js (Alarms, Sessions, Inactivity Tracker)")
    draw_artifact(0.65, 1.9, 3.9, 0.40, "Browser Local Persistence", "chrome.storage.local & IndexedDB (scrollguard_db)")

    # 2. Server: Application Server (Right Top)
    draw_3d_node(5.8, 2.8, 4.8, 2.4, "ScrollGuard Application Server", "execution environment")
    draw_artifact(6.05, 4.2, 4.3, 0.40, "Node.js 20+ Runtime Engine", "Express.js REST API Server on Port 3000")
    draw_artifact(6.05, 3.5, 4.3, 0.48, "Real-Time Telemetry Sync Receiver", "POST /api/sync, GET /api/data Data Store")
    draw_artifact(6.05, 2.9, 4.3, 0.40, "React 18 Web Analytics Dashboard", "Vite Production SPA Client on Port 5173")

    # 3. Cloud: Groq Cloud Infrastructure (Bottom Right)
    draw_3d_node(5.8, 0.4, 4.8, 1.9, "Groq Cloud AI Infrastructure", "cloud computing facility")
    draw_artifact(6.05, 1.4, 4.3, 0.40, "Groq LPU Inference Acceleration", "openai/gpt-oss-120b & qwen/qwen3.8-27b")
    draw_artifact(6.05, 0.7, 4.3, 0.46, "Secure HTTPS AI Gateway", "POST /api/coach/daily, /api/predict (TLS 1.3 / Port 443)")

    # Communication Links
    ax.annotate('', xy=(5.8, 4.0), xytext=(4.8, 4.0),
                arrowprops=dict(arrowstyle='<->', color=BLK, lw=LW_ARROW))
    ax.text(5.3, 4.15, "HTTP / CORS\n(:3000)", ha='center', va='bottom', fontsize=6.2, fontweight='bold', color=BLK, fontfamily=FNT,
            bbox=dict(boxstyle='square,pad=0.1', facecolor=WHT, edgecolor='none', zorder=6))

    ax.annotate('', xy=(5.8, 3.1), xytext=(4.8, 3.1),
                arrowprops=dict(arrowstyle='<->', color=BLK, lw=LW_ARROW))
    ax.text(5.3, 2.85, "HTTP\n(:5173)", ha='center', va='top', fontsize=6.2, fontweight='bold', color=BLK, fontfamily=FNT,
            bbox=dict(boxstyle='square,pad=0.1', facecolor=WHT, edgecolor='none', zorder=6))

    # Backend to Groq Cloud (vertical arrow with side text)
    ax.annotate('', xy=(8.2, 2.3), xytext=(8.2, 2.8),
                arrowprops=dict(arrowstyle='<->', color=BLK, lw=LW_ARROW))
    ax.text(8.4, 2.55, "HTTPS / TLS 1.3 (:443)", ha='left', va='center', fontsize=6.2, fontweight='bold', color=BLK, fontfamily=FNT,
            bbox=dict(boxstyle='square,pad=0.1', facecolor=WHT, edgecolor='none', zorder=6))

    plt.tight_layout(pad=0.2)
    plt.savefig(f'{OUT}/deployment_diagram.png', dpi=300, bbox_inches='tight', facecolor=WHT)
    plt.close()
    print("  [OK] deployment_diagram.png polished successfully.")

if __name__ == '__main__':
    print("Generating polished monochrome ScrollGuard UML diagrams...")
    generate_er_diagram()
    generate_class_diagram()
    generate_use_case_diagram()
    generate_activity_diagram()
    generate_sequence_diagram()
    generate_component_diagram()
    generate_deployment_diagram()
    print("All 7 diagrams regenerated successfully.")
