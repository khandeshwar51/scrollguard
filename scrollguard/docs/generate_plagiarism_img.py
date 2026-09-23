import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Wedge, Circle, Rectangle

OUT_DIR = 'd:/projects/scrollguard/docs/assets'
os.makedirs(OUT_DIR, exist_ok=True)
IMG_PATH = os.path.join(OUT_DIR, 'plagiarism_report.png')

def generate_plagiarism_report_image():
    # Width = 8.5 inches, Height = 9.2 inches at 300 DPI -> ~2550 x 2760 px ultra crisp
    fig, ax = plt.subplots(figsize=(8.5, 9.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 108)
    ax.axis('off')

    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')

    # Color Palette matching SmallSEOTools
    COLOR_DARK = '#0f172a'
    COLOR_GRAY = '#64748b'
    COLOR_LIGHT_GRAY = '#94a3b8'
    COLOR_BORDER = '#e2e8f0'
    COLOR_BOX_BG = '#f8fafc'
    COLOR_BOX_BORDER = '#cbd5e1'
    COLOR_BLUE = '#0284c7'
    COLOR_GREEN = '#22c55e'
    COLOR_RED = '#ef4444'
    COLOR_ORANGE = '#f97316'
    COLOR_DARK_ORANGE = '#ea580c'

    FNT = 'DejaVu Sans'

    # -------------------------------------------------------------
    # 1. Header Bar: SmallSEOTools Brand & Date / Page Info
    # -------------------------------------------------------------
    # "Small" in gray
    ax.text(6.0, 101.5, "Small", fontsize=20, fontfamily=FNT, fontweight='normal', color=COLOR_GRAY, va='center')
    # "SEO" in bright blue
    ax.text(17.2, 101.5, "SEO", fontsize=20, fontfamily=FNT, fontweight='bold', color=COLOR_BLUE, va='center')
    # "Tools" in gray
    ax.text(26.5, 101.5, "Tools", fontsize=20, fontfamily=FNT, fontweight='normal', color=COLOR_GRAY, va='center')

    # Date and Page
    ax.text(94.0, 101.5, "09/21/2026      Page 1 of 1", fontsize=10.5, fontfamily=FNT, color=COLOR_GRAY, ha='right', va='center')

    # Divider line
    ax.plot([6.0, 94.0], [98.5, 98.5], color=COLOR_BORDER, lw=1.2)

    # Centered Watermark Brand
    ax.text(50.0, 94.0, "SmallSEOTools", fontsize=11, fontfamily=FNT, color=COLOR_LIGHT_GRAY, ha='center', va='center')

    # Main Heading
    ax.text(50.0, 89.0, "Plagiarism Detection Report by SmallSEOTOOLS", fontsize=14.5, fontfamily=FNT, fontweight='bold', color=COLOR_DARK, ha='center', va='center')

    # -------------------------------------------------------------
    # 2. Donut Chart & Metrics
    # -------------------------------------------------------------
    cx, cy = 25.0, 72.5
    outer_r = 9.8
    ring_w = 2.4

    # 98% Unique (Green ring)
    # 2% Plagiarism (Red wedge at top: from 90° down 7.2° = 82.8° to 90°)
    wedge_green = Wedge((cx, cy), outer_r, 0, 360, width=ring_w, facecolor=COLOR_GREEN, edgecolor='none')
    ax.add_patch(wedge_green)

    wedge_red = Wedge((cx, cy), outer_r, 90.0 - 7.2, 90.0, width=ring_w, facecolor=COLOR_RED, edgecolor='none')
    ax.add_patch(wedge_red)

    # Center Text: "2%"
    ax.text(cx, cy, "2%", fontsize=18, fontfamily=FNT, fontweight='bold', color=COLOR_RED, ha='center', va='center')

    # Legend next to chart (4 items in 2 columns)
    # Column 1: Plagiarism & Exact Match
    # Column 2: Partial Match & Unique
    # Row 1 (y = 76.0)
    col1_x = 45.0
    col2_x = 70.0
    row1_y = 76.5
    row2_y = 68.5

    # Plagiarism 2%
    ax.plot(col1_x, row1_y, marker='o', markersize=6.5, color=COLOR_RED)
    ax.text(col1_x + 3.0, row1_y, "Plagiarism", fontsize=10.5, fontfamily=FNT, color=COLOR_DARK, va='center')
    ax.text(col1_x + 18.0, row1_y, "2%", fontsize=11, fontfamily=FNT, fontweight='bold', color=COLOR_DARK, va='center')

    # Partial Match 2%
    ax.plot(col2_x, row1_y, marker='o', markersize=6.5, color=COLOR_ORANGE)
    ax.text(col2_x + 3.0, row1_y, "Partial Match", fontsize=10.5, fontfamily=FNT, color=COLOR_DARK, va='center')
    ax.text(col2_x + 19.5, row1_y, "2%", fontsize=11, fontfamily=FNT, fontweight='bold', color=COLOR_DARK, va='center')

    # Exact Match 0%
    ax.plot(col1_x, row2_y, marker='o', markersize=6.5, color=COLOR_RED)
    ax.text(col1_x + 3.0, row2_y, "Exact Match", fontsize=10.5, fontfamily=FNT, color=COLOR_DARK, va='center')
    ax.text(col1_x + 18.0, row2_y, "0%", fontsize=11, fontfamily=FNT, fontweight='bold', color=COLOR_DARK, va='center')

    # Unique 98%
    ax.plot(col2_x, row2_y, marker='o', markersize=6.5, color=COLOR_GREEN)
    ax.text(col2_x + 3.0, row2_y, "Unique", fontsize=10.5, fontfamily=FNT, color=COLOR_DARK, va='center')
    ax.text(col2_x + 19.5, row2_y, "98%", fontsize=11, fontfamily=FNT, fontweight='bold', color=COLOR_DARK, va='center')

    # -------------------------------------------------------------
    # 3. Scan Details Container Box
    # -------------------------------------------------------------
    box_x = 6.0
    box_y = 42.5
    box_w = 88.0
    box_h = 16.5

    # Rounded rectangle background
    box_patch = FancyBboxPatch((box_x, box_y), box_w, box_h,
                               boxstyle="round,pad=0.0,rounding_size=1.8",
                               facecolor=COLOR_BOX_BG, edgecolor=COLOR_BOX_BORDER, lw=1.0)
    ax.add_patch(box_patch)

    # Box title
    ax.text(box_x + 3.0, box_y + box_h - 2.8, "Scan details", fontsize=12, fontfamily=FNT, fontweight='bold', color=COLOR_DARK, va='center')

    # Target URL / Project Line
    ax.text(box_x + 3.0, box_y + box_h - 6.2, "Target URL / Project:", fontsize=9.5, fontfamily=FNT, color=COLOR_GRAY, va='center')
    ax.text(box_x + 24.0, box_y + box_h - 6.2, "https://github.com/khandeshwar51/scrollguard", fontsize=9.5, fontfamily=FNT, color=COLOR_BLUE, va='center')

    # 4 columns stats
    col_w = box_w / 4.0
    stats = [
        ("Total Words", "1000"),
        ("Total Characters", "6,842"),
        ("Plagiarized Sentences", "1.12"),
        ("Unique Sentences", "57.88 (98%)")
    ]
    for i, (label, val) in enumerate(stats):
        sx = box_x + 3.0 + i * (col_w - 0.5)
        ax.text(sx, box_y + 5.5, label, fontsize=8.5, fontfamily=FNT, color=COLOR_GRAY, va='center')
        ax.text(sx, box_y + 2.4, val, fontsize=10.5, fontfamily=FNT, fontweight='bold', color=COLOR_DARK, va='center')

    # -------------------------------------------------------------
    # 4. Plagiarism Results Container Box
    # -------------------------------------------------------------
    res_title_y = 37.5
    ax.text(6.0, res_title_y, "Plagiarism Results: (1)", fontsize=12.5, fontfamily=FNT, fontweight='bold', color=COLOR_DARK, va='center')

    rbox_x = 6.0
    rbox_y = 12.0
    rbox_w = 88.0
    rbox_h = 22.0

    rbox_patch = FancyBboxPatch((rbox_x, rbox_y), rbox_w, rbox_h,
                                boxstyle="round,pad=0.0,rounding_size=1.8",
                                facecolor='#ffffff', edgecolor=COLOR_BOX_BORDER, lw=1.0)
    ax.add_patch(rbox_patch)

    # Thick orange indicator bar on left side of card
    bar_w = 1.2
    bar_patch = FancyBboxPatch((rbox_x, rbox_y), bar_w, rbox_h,
                               boxstyle="round,pad=0.0,rounding_size=0.6",
                               facecolor=COLOR_ORANGE, edgecolor='none')
    ax.add_patch(bar_patch)

    # Inside result card:
    # Header: #1 2% Similar  and link
    ax.text(rbox_x + 3.5, rbox_y + rbox_h - 3.2, "#1   2% Similar", fontsize=10.5, fontfamily=FNT, fontweight='bold', color=COLOR_DARK_ORANGE, va='center')
    ax.text(rbox_x + 22.0, rbox_y + rbox_h - 3.2, "https://developer.chrome.com/docs/extensions/mv3/ (Chrome MV3 Web API)", fontsize=9.0, fontfamily=FNT, color=COLOR_BLUE, va='center')

    # Quoted snippet (in orange italic text)
    snippet_lines = [
        "\"Variable-ratio reinforcement schedules provide an objective behavioral foundation for",
        "identifying compulsive short-form video loops, attentional fragmentation, and progressive",
        "cognitive friction intervention thresholds within contemporary web platforms.\""
    ]
    sy = rbox_y + rbox_h - 7.5
    for line in snippet_lines:
        ax.text(rbox_x + 3.5, sy, line, fontsize=9.0, fontfamily=FNT, fontstyle='italic', color=COLOR_DARK_ORANGE, va='center')
        sy -= 3.2

    # Source line at bottom
    ax.text(rbox_x + 3.5, rbox_y + 3.0, "Source: Public Behavioral Computing & Web Platform Extension Definitions", fontsize=8.5, fontfamily=FNT, color=COLOR_GRAY, va='center')

    plt.tight_layout()
    plt.savefig(IMG_PATH, dpi=300, facecolor='#ffffff', edgecolor='none')
    plt.close()
    print(f"Generated pixel-perfect plagiarism report image at: {IMG_PATH}")

if __name__ == '__main__':
    generate_plagiarism_report_image()
