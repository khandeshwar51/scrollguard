import os
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle

def create_code_page_flowables(page_title, file_subpill, section_subtitle, code_lines, start_line_num, styles):
    flowables = []
    
    # 1. Main Header
    flowables.append(Paragraph(page_title, styles['CodeSectionHeader']))
    flowables.append(Spacer(1, 3))
    
    # 2. File Sub-pill
    flowables.append(Paragraph(f"<b>{file_subpill}</b>", styles['CodeSubPill']))
    flowables.append(Spacer(1, 3))
    
    # 3. Section Subtitle
    flowables.append(Paragraph(f"<b>{section_subtitle}</b>", styles['CodeFileName']))
    flowables.append(Spacer(1, 6))
    
    # 4. Code Table
    table_data = []
    for i, line in enumerate(code_lines):
        line_num = str(start_line_num + i)
        # Escape XML entities for ReportLab Paragraph/Text
        safe_line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        table_data.append([line_num, safe_line])
        
    code_table = Table(
        table_data,
        colWidths=[24, 482],
        rowHeights=[9.8] * len(table_data)
    )
    
    code_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 0.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0.5),
        ('LEFTPADDING', (0, 0), (0, -1), 2),
        ('RIGHTPADDING', (0, 0), (0, -1), 4),
        ('LEFTPADDING', (1, 0), (1, -1), 6),
        ('RIGHTPADDING', (1, 0), (1, -1), 4),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#64748b')),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#0f172a')),
        ('FONTNAME', (0, 0), (-1, -1), 'Courier'),
        ('FONTSIZE', (0, 0), (-1, -1), 7.0),
        ('LINEAFTER', (0, 0), (0, -1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    
    flowables.append(code_table)
    return flowables

print('report_code_pages helper defined!')
