import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image as RLImage
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

from section_synopsis import get_synopsis_pages
from section_requirements import get_requirements_pages
from section_analysis import get_analysis_pages
from section_design import get_design_pages
from section_implementation import get_implementation_pages
from section_output import get_output_pages

ASSETS_DIR = 'd:/projects/scrollguard/docs/assets'
OUTPUT_PDF = 'd:/projects/scrollguard/docs/ScrollGuard_Project_Report.pdf'
COLLEGE_LOGO = os.path.join(ASSETS_DIR, 'college_logo.png')

def draw_decorations(canv, doc):
    canv.saveState()
    # Outer rectangle border
    canv.setStrokeColor(colors.black)
    canv.setLineWidth(1.0)
    canv.rect(22, 22, 551.28, 797.89, stroke=1, fill=0)
    
    # Inner rectangle border
    canv.setLineWidth(0.5)
    canv.rect(25.5, 25.5, 544.28, 790.89, stroke=1, fill=0)
    
    # Bottom horizontal divider line above footer
    canv.setLineWidth(0.5)
    canv.line(44, 44, 551.28, 44)
    
    # Footer: X | P a g e
    pno = canv.getPageNumber()
    canv.setFont('Times-Roman', 9.5)
    canv.setFillColor(colors.black)
    canv.drawRightString(548, 30, f"{pno} | P a g e")
    canv.restoreState()

def build_full_report():
    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=A4,
        leftMargin=44,
        rightMargin=44,
        topMargin=44,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()
    
    # Exact academic Times New Roman styles matching StockBot reference
    cover_h1 = ParagraphStyle(
        'CoverH1', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=15, leading=20, alignment=TA_CENTER, textColor=colors.black
    )
    cover_on = ParagraphStyle(
        'CoverOn', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=12, leading=16, alignment=TA_CENTER, textColor=colors.black
    )
    cover_title = ParagraphStyle(
        'CoverTitle', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=15, leading=20, alignment=TA_CENTER, textColor=colors.black
    )
    cover_label = ParagraphStyle(
        'CoverLabel', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=11, leading=15, alignment=TA_CENTER, textColor=colors.black
    )
    cover_name = ParagraphStyle(
        'CoverName', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=13, leading=17, alignment=TA_CENTER, textColor=colors.black
    )
    cover_deg = ParagraphStyle(
        'CoverDeg', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=11.5, leading=16, alignment=TA_CENTER, textColor=colors.black
    )
    cover_college = ParagraphStyle(
        'CoverCollege', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=10.5, leading=15, alignment=TA_CENTER, textColor=colors.black
    )
    cover_sub_college = ParagraphStyle(
        'CoverSubCollege', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=10, leading=14, alignment=TA_CENTER, textColor=colors.black
    )

    # Main chapter heading (Centered & Underlined in reference)
    sec_hdr = ParagraphStyle(
        'SecHdr', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=14, leading=18, alignment=TA_CENTER, textColor=colors.black
    )
    # Section 5.1, 5.2, etc. (Left-aligned bold)
    subsec_hdr = ParagraphStyle(
        'SubSecHdr', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=13, leading=16.5, alignment=TA_LEFT, textColor=colors.black
    )
    # Body paragraphs: 12pt Times-Roman, pure black, justified
    body_j = ParagraphStyle(
        'BodyJ', parent=styles['Normal'],
        fontName='Times-Roman', fontSize=12, leading=15.5, alignment=TA_JUSTIFY, textColor=colors.black
    )
    body_l = ParagraphStyle(
        'BodyL', parent=styles['Normal'],
        fontName='Times-Roman', fontSize=12, leading=15.5, alignment=TA_LEFT, textColor=colors.black
    )
    table_hdr = ParagraphStyle(
        'TableHdr', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=9.5, leading=12, alignment=TA_CENTER, textColor=colors.black
    )
    table_cell = ParagraphStyle(
        'TableCell', parent=styles['Normal'],
        fontName='Times-Roman', fontSize=8.5, leading=11, alignment=TA_LEFT, textColor=colors.black
    )
    table_cell_c = ParagraphStyle(
        'TableCellCenter', parent=styles['Normal'],
        fontName='Times-Roman', fontSize=8.5, leading=11, alignment=TA_CENTER, textColor=colors.black
    )
    fig_caption = ParagraphStyle(
        'FigCap', parent=styles['Normal'],
        fontName='Times-Italic', fontSize=9.5, leading=13, alignment=TA_CENTER, textColor=colors.black
    )

    style_dict = {
        'CoverH1': cover_h1,
        'CoverOn': cover_on,
        'CoverTitle': cover_title,
        'CoverLabel': cover_label,
        'CoverName': cover_name,
        'CoverDeg': cover_deg,
        'CoverCollege': cover_college,
        'CoverSubCollege': cover_sub_college,
        'SecHdr': sec_hdr,
        'SubSecHdr': subsec_hdr,
        'CodeSectionHeader': ParagraphStyle('CodeSecHdr', parent=sec_hdr, alignment=TA_LEFT, fontSize=13),
        'CodeSubPill': ParagraphStyle('CodeSubPill', fontName='Times-Italic', fontSize=9.5, leading=12, alignment=TA_LEFT, textColor=colors.black),
        'CodeFileName': ParagraphStyle('CodeFileName', fontName='Times-Bold', fontSize=11, leading=14, alignment=TA_LEFT, textColor=colors.black),
        'BodyJ': body_j,
        'BodyL': body_l,
        'TableHdr': table_hdr,
        'TableCell': table_cell,
        'TableCellCenter': table_cell_c,
        'FigCap': fig_caption,
        'CoverSub': cover_deg,
        'CoverText': cover_sub_college
    }

    story = []

    # =========================================================================
    # PAGE 1: TITLE PAGE (With Official College Emblem)
    # =========================================================================
    p1 = [
        Spacer(1, 10),
        Paragraph("A MINI PROJECT REPORT", cover_h1),
        Spacer(1, 4),
        Paragraph("ON", cover_on),
        Spacer(1, 8),
        Paragraph("&ldquo;SCROLLGUARD: REAL-TIME ANTI-DOOMSCROLLING AND PREDICTIVE COGNITIVE FRICTION PLATFORM&rdquo;", cover_title),
        Spacer(1, 14),
        Paragraph("SUBMITTED BY", cover_label),
        Spacer(1, 4),
        Paragraph("MR. KHANDESHWAR ANAND SURYAVANSHI", cover_name),
        Spacer(1, 12),
        Paragraph("IN PARTIAL FULFILLMENT FOR THE AWARD OF THE DEGREE OF", cover_label),
        Spacer(1, 4),
        Paragraph("BACHELOR OF SCIENCE IN COMPUTER SCIENCE (SEM-V)", cover_deg),
        Spacer(1, 12),
        Paragraph("UNDER THE GUIDANCE OF", cover_label),
        Spacer(1, 4),
        Paragraph("PROF. PRERNA PATIL", cover_name),
        Spacer(1, 12),
        # College Logo
        RLImage(COLLEGE_LOGO, width=95, height=95),
        Spacer(1, 10),
        Paragraph("VIDYAVARDHINI&rsquo;S A. V. COLLEGE OF ARTS, K. M. COLLEGE OF COMMERCE,", cover_college),
        Paragraph("E. S. A. COLLEGE OF SCIENCE,", cover_college),
        Paragraph("VASAI ROAD (WEST), PALGHAR - 401202, MAHARASHTRA", cover_sub_college),
        Paragraph("(AFFILIATED TO UNIVERSITY OF MUMBAI)", cover_sub_college),
        Spacer(1, 6),
        Paragraph("(SEM-V)", cover_sub_college),
        Paragraph("(2026-2027)", cover_sub_college),
        PageBreak()
    ]
    story.extend(p1)

    # =========================================================================
    # PAGE 2: COLLEGE CERTIFICATE (Centered & Underlined Header)
    # =========================================================================
    p2 = [
        Spacer(1, 15),
        Paragraph("<u>COLLEGE CERTIFICATE</u>", sec_hdr),
        Spacer(1, 20),
        Paragraph(
            "This is to certify that the mini project entitled <b>&ldquo;SCROLLGUARD: REAL-TIME ANTI-DOOMSCROLLING AND "
            "PREDICTIVE COGNITIVE FRICTION PLATFORM&rdquo;</b> is a bonafide work carried out by <b>MR. KHANDESHWAR ANAND "
            "SURYAVANSHI</b> in partial fulfillment of the requirements for the award of the Degree of <b>BACHELOR OF "
            "SCIENCE IN COMPUTER SCIENCE (SEM-V)</b> of <b>University of Mumbai</b> during the academic year <b>2026 &ndash; 2027</b>.",
            body_j
        ),
        Spacer(1, 15),
        Paragraph(
            "This project has been executed under the supervision and guidance of the undersigned faculty member and "
            "has been approved for submission.",
            body_j
        ),
        Spacer(1, 55),
        Table([
            [Paragraph("<b>Prof. Prerna Patil</b><br/>Project Guide", body_l),
             Paragraph("<b>Prof. Srimathi Narayanan</b><br/>Head of Department", ParagraphStyle('TR', parent=body_l, alignment=TA_RIGHT))]
        ], colWidths=[250, 250]),
        Spacer(1, 55),
        Table([
            [Paragraph("___________________<br/><b>Internal Examiner</b>", body_l),
             Paragraph("___________________<br/><b>External Examiner</b>", ParagraphStyle('TR2', parent=body_l, alignment=TA_RIGHT))]
        ], colWidths=[250, 250]),
        Spacer(1, 45),
        Table([
            [Paragraph("<b>Date:</b> 21/09/2026<br/><b>Place:</b> Vasai Road (West)", body_l),
             Paragraph("<b>Dr. Arvind W. Ubale</b><br/>Principal / College Seal", ParagraphStyle('TR3', parent=body_l, alignment=TA_RIGHT))]
        ], colWidths=[250, 250]),
        PageBreak()
    ]
    story.extend(p2)

    # =========================================================================
    # PAGE 3: DECLARATION & ACKNOWLEDGEMENT
    # =========================================================================
    p3 = [
        Spacer(1, 15),
        Paragraph("<u>DECLARATION</u>", sec_hdr),
        Spacer(1, 18),
        Paragraph(
            "I, <b>MR. KHANDESHWAR ANAND SURYAVANSHI</b>, hereby declare that the mini project entitled "
            "<b>&ldquo;SCROLLGUARD: REAL-TIME ANTI-DOOMSCROLLING AND PREDICTIVE COGNITIVE FRICTION PLATFORM&rdquo;</b> "
            "submitted in partial fulfillment for the award of <b>Bachelor of Science in Computer Science (SEM-V)</b> "
            "during the academic year <b>2026 &ndash; 2027</b> is my original work and the project has not formed the basis "
            "for the award of any degree, associateship, fellowship, or any other similar titles in any University or Institution.",
            body_j
        ),
        Spacer(1, 14),
        Paragraph(
            "This project was carried out under the esteemed supervision and guidance of <b>PROF. PRERNA PATIL</b>, "
            "Department of Computer Science, Vidyavardhini&rsquo;s A. V. College of Arts, K. M. College of Commerce, "
            "E. S. A. College of Science, Vasai Road (West).",
            body_j
        ),
        Spacer(1, 22),
        Paragraph("<u>ACKNOWLEDGEMENT</u>", ParagraphStyle('AckHdr', parent=sec_hdr, fontSize=13)),
        Spacer(1, 10),
        Paragraph(
            "I would like to express my sincere gratitude towards our project guide, <b>Prof. Prerna Patil</b>, for her "
            "invaluable guidance, constructive feedback, insightful suggestions, and continuous encouragement throughout "
            "the conceptualization, system architecture, and development phases of this project.",
            body_j
        ),
        Spacer(1, 8),
        Paragraph(
            "I am deeply thankful to <b>Prof. Srimathi Narayanan</b>, Head of the Computer Science Department, for providing "
            "the departmental infrastructure and support that made the successful completion of this project possible.",
            body_j
        ),
        Spacer(1, 40),
        Table([
            [Paragraph("<b>Place:</b> Vasai Road (West)<br/><b>Date:</b> 21/09/2026", body_l),
             Paragraph("<b>Signature of the Student:</b> ___________________<br/><b>Name:</b> MR. KHANDESHWAR ANAND SURYAVANSHI<br/><b>Class:</b> T.Y. B.Sc. Computer Science (SEM-V)", ParagraphStyle('ST', parent=body_l, alignment=TA_RIGHT))]
        ], colWidths=[200, 300]),
        PageBreak()
    ]
    story.extend(p3)

    # =========================================================================
    # PAGE 4: PLAGIARISM REPORT (Header Centered & Underlined, Page Blank)
    # =========================================================================
    p4 = [
        Spacer(1, 15),
        Paragraph("<u>PLAGIARISM REPORT</u>", sec_hdr),
        PageBreak()
    ]
    story.extend(p4)

    # =========================================================================
    # PAGE 5: GANTT CHART (Header Centered & Underlined, Page Blank)
    # =========================================================================
    p5 = [
        Spacer(1, 15),
        Paragraph("<u>GANTT CHART</u>", sec_hdr),
        PageBreak()
    ]
    story.extend(p5)

    # =========================================================================
    # PAGE 6: INDEX (Exact Reference Format)
    # =========================================================================
    index_data = [
        [Paragraph("S.No", table_hdr), Paragraph("CONTENTS", table_hdr), Paragraph("Page No", table_hdr)],
        [Paragraph("1", table_cell_c), Paragraph("College Certificate", table_cell), Paragraph("2", table_cell_c)],
        [Paragraph("2", table_cell_c), Paragraph("Declaration", table_cell), Paragraph("3", table_cell_c)],
        [Paragraph("3", table_cell_c), Paragraph("Plagiarism Report", table_cell), Paragraph("4", table_cell_c)],
        [Paragraph("4", table_cell_c), Paragraph("Gantt Chart", table_cell), Paragraph("5", table_cell_c)],
        [Paragraph("5", table_cell_c), Paragraph("<b>Project Synopsis (Project Proposal)</b>", table_cell), Paragraph("7", table_cell_c)],
        [Paragraph("6", table_cell_c), Paragraph("<b>Requirement Specification</b>", table_cell), Paragraph("12", table_cell_c)],
        [Paragraph("7", table_cell_c), Paragraph("<b>System Analysis</b>", table_cell), Paragraph("16", table_cell_c)],
        [Paragraph("", table_cell_c), Paragraph("&nbsp;&nbsp;Event Table", table_cell), Paragraph("16", table_cell_c)],
        [Paragraph("", table_cell_c), Paragraph("&nbsp;&nbsp;E-R diagram", table_cell), Paragraph("18", table_cell_c)],
        [Paragraph("8", table_cell_c), Paragraph("<b>System Design</b>", table_cell), Paragraph("19", table_cell_c)],
        [Paragraph("", table_cell_c), Paragraph("&nbsp;&nbsp;Class Diagram", table_cell), Paragraph("19", table_cell_c)],
        [Paragraph("", table_cell_c), Paragraph("&nbsp;&nbsp;Use case diagram", table_cell), Paragraph("20", table_cell_c)],
        [Paragraph("", table_cell_c), Paragraph("&nbsp;&nbsp;Database Design", table_cell), Paragraph("21", table_cell_c)],
        [Paragraph("", table_cell_c), Paragraph("&nbsp;&nbsp;Activity Diagram", table_cell), Paragraph("24", table_cell_c)],
        [Paragraph("", table_cell_c), Paragraph("&nbsp;&nbsp;Sequence Diagram", table_cell), Paragraph("25", table_cell_c)],
        [Paragraph("", table_cell_c), Paragraph("&nbsp;&nbsp;Component Diagram", table_cell), Paragraph("26", table_cell_c)],
        [Paragraph("", table_cell_c), Paragraph("&nbsp;&nbsp;Deployment Diagram", table_cell), Paragraph("27", table_cell_c)],
        [Paragraph("9", table_cell_c), Paragraph("<b>System Implementation (Coding & Testing)</b>", table_cell), Paragraph("28", table_cell_c)],
        [Paragraph("10", table_cell_c), Paragraph("<b>Output (Screenshot)</b>", table_cell), Paragraph("62", table_cell_c)],
        [Paragraph("11", table_cell_c), Paragraph("<b>Bibliography</b>", table_cell), Paragraph("70", table_cell_c)],
    ]
    index_table = Table(index_data, colWidths=[40, 395, 60])
    index_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#cccccc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))

    p6 = [
        Spacer(1, 15),
        Paragraph("<u>INDEX</u>", sec_hdr),
        Spacer(1, 15),
        index_table,
        PageBreak()
    ]
    story.extend(p6)

    # =========================================================================
    # CHAPTERS 5 TO 11
    # =========================================================================
    story.extend(get_synopsis_pages(style_dict))
    story.extend(get_requirements_pages(style_dict))
    story.extend(get_analysis_pages(style_dict))
    story.extend(get_design_pages(style_dict))
    story.extend(get_implementation_pages(style_dict))
    story.extend(get_output_pages(style_dict))

    doc.build(story, onFirstPage=draw_decorations, onLaterPages=draw_decorations)
    print("Full report with exact reference styling compiled successfully!")

if __name__ == '__main__':
    build_full_report()
