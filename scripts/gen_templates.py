"""
Generate professional .pptx template files for SlideVantage
Run: python3 scripts/gen_templates.py
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'uploads', 'templates')
os.makedirs(OUT, exist_ok=True)

# Brand colors
NAVY   = RGBColor(0x03, 0x03, 0x29)
GOLD   = RGBColor(0xC9, 0xA2, 0x27)
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
LGRAY  = RGBColor(0xF4, 0xF4, 0xF5)
MGRAY  = RGBColor(0xA1, 0xA1, 0xAA)
DGRAY  = RGBColor(0x3F, 0x3F, 0x46)
GREEN  = RGBColor(0x16, 0xA3, 0x4A)
RED    = RGBColor(0xDC, 0x26, 0x26)
BLUE   = RGBColor(0x1D, 0x4E, 0xD8)

W = Inches(13.33)   # widescreen 16:9
H = Inches(7.5)

def new_prs():
    prs = Presentation()
    prs.slide_width  = W
    prs.slide_height = H
    return prs

def blank(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])  # completely blank

def bg(slide, color: RGBColor):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color

def box(slide, x, y, w, h, color: RGBColor, alpha=None):
    shape = slide.shapes.add_shape(1, x, y, w, h)
    shape.line.fill.background()
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    return shape

def txt(slide, text, x, y, w, h, size, color: RGBColor, bold=False, align=PP_ALIGN.LEFT, wrap=True):
    tf = slide.shapes.add_textbox(x, y, w, h)
    tf.text_frame.word_wrap = wrap
    p  = tf.text_frame.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size  = Pt(size)
    run.font.color.rgb = color
    run.font.bold  = bold
    return tf

def label(slide, text, x, y, w=Inches(4), size=8, color=MGRAY):
    tf = slide.shapes.add_textbox(x, y, w, Pt(20))
    p  = tf.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = text.upper()
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.font.bold = True
    tf.text_frame.word_wrap = False

def divider(slide, x, y, w, color=GOLD):
    box(slide, x, y, w, Pt(2), color)


# ═══════════════════════════════════════════════════════════
# 1. CORPORATE ANNUAL REPORT
# ═══════════════════════════════════════════════════════════
def make_annual_report():
    prs = new_prs()

    # SLIDE 1 — Cover
    s = blank(prs)
    bg(s, NAVY)
    box(s, 0, 0, Inches(0.06), H, GOLD)
    box(s, 0, Inches(6.2), W, Inches(1.3), RGBColor(0x06, 0x06, 0x30))
    txt(s, "ANNUAL REPORT", Inches(0.7), Inches(1.0), Inches(6), Inches(0.5), 10, GOLD, bold=True)
    txt(s, "2025", Inches(0.7), Inches(1.7), Inches(5), Inches(1.8), 96, WHITE, bold=True)
    txt(s, "Financial Performance & Strategic Review", Inches(0.7), Inches(3.2), Inches(7), Inches(0.6), 20, RGBColor(0xA1,0xA1,0xAA))
    divider(s, Inches(0.7), Inches(4.0), Inches(1.2))
    txt(s, "Q1 – Q4 Fiscal Year Overview", Inches(0.7), Inches(4.2), Inches(6), Inches(0.5), 13, RGBColor(0x71,0x71,0x7A))
    txt(s, "© 2025 Company Name. All rights reserved.", Inches(0.7), Inches(6.6), Inches(5), Inches(0.4), 9, RGBColor(0x52,0x52,0x5B))
    # KPI box
    box(s, Inches(9.5), Inches(1.8), Inches(3.2), Inches(3.5), RGBColor(0x07,0x07,0x3D))
    txt(s, "KEY METRICS", Inches(9.7), Inches(2.0), Inches(2.8), Inches(0.4), 8, GOLD, bold=True)
    divider(s, Inches(9.7), Inches(2.5), Inches(2.8))
    for i, (val, lbl) in enumerate([("$4.2M","Net Revenue"),("+24%","YoY Growth"),("89%","Client Retention")]):
        y = Inches(2.7 + i * 0.9)
        txt(s, val, Inches(9.7), y, Inches(2), Inches(0.5), 22, WHITE, bold=True)
        txt(s, lbl, Inches(9.7), Inches(2.7 + i*0.9 + 0.38), Inches(2.8), Inches(0.3), 9, MGRAY)

    # SLIDE 2 — Executive Summary
    s = blank(prs)
    bg(s, WHITE)
    box(s, 0, 0, W, Inches(1.4), NAVY)
    txt(s, "Executive Summary", Inches(0.7), Inches(0.3), Inches(8), Inches(0.7), 28, WHITE, bold=True)
    txt(s, "2025 Annual Report", Inches(0.7), Inches(0.9), Inches(6), Inches(0.4), 11, MGRAY)
    # 4 stat boxes
    colors = [NAVY, RGBColor(0x07,0x07,0x3D), RGBColor(0xC9,0xA2,0x27), RGBColor(0x0A,0x0A,0x5E)]
    stats  = [("$4.2M","Total Revenue"),("2,847","Active Clients"),("+24%","Growth Rate"),("$1.1M","Net Profit")]
    for i, ((val, lbl), col) in enumerate(zip(stats, colors)):
        x = Inches(0.5 + i * 3.2)
        box(s, x, Inches(1.7), Inches(3.0), Inches(1.6), col)
        tc = WHITE if col != GOLD else NAVY
        txt(s, val, x + Inches(0.2), Inches(1.9), Inches(2.6), Inches(0.8), 32, tc, bold=True)
        txt(s, lbl, x + Inches(0.2), Inches(2.8), Inches(2.6), Inches(0.3), 10, RGBColor(0xD4,0xD4,0xD8) if col != GOLD else NAVY)
    # Chart bars
    txt(s, "Quarterly Revenue", Inches(0.5), Inches(3.6), Inches(5), Inches(0.5), 14, NAVY, bold=True)
    bar_data = [("Q1", 0.55, "$890K"), ("Q2", 0.72, "$1.1M"), ("Q3", 0.85, "$1.2M"), ("Q4", 1.0, "$1.4M")]
    for i, (q, h, val) in enumerate(bar_data):
        bh = Inches(h * 2.0)
        x  = Inches(0.7 + i * 1.8)
        y  = Inches(6.0) - bh
        box(s, x, y, Inches(1.2), bh, NAVY if i < 3 else GOLD)
        txt(s, val, x, y - Inches(0.35), Inches(1.4), Inches(0.3), 9, NAVY, bold=True)
        txt(s, q,   x, Inches(6.1), Inches(1.2), Inches(0.3), 10, DGRAY, align=PP_ALIGN.CENTER)
    # Key points
    txt(s, "Key Highlights", Inches(7.5), Inches(3.6), Inches(5), Inches(0.5), 14, NAVY, bold=True)
    for i, point in enumerate(["Revenue exceeded targets by 12%","Expanded to 3 new markets","Launched 5 major product lines","Achieved record client satisfaction"]):
        y = Inches(4.2 + i * 0.5)
        box(s, Inches(7.5), y + Inches(0.1), Inches(0.08), Inches(0.25), GOLD)
        txt(s, point, Inches(7.7), y, Inches(4.8), Inches(0.4), 11, DGRAY)

    # SLIDE 3 — Financial Charts
    s = blank(prs)
    bg(s, RGBColor(0xFA,0xFA,0xFA))
    box(s, 0, 0, W, Inches(0.08), GOLD)
    txt(s, "Financial Performance", Inches(0.7), Inches(0.4), Inches(8), Inches(0.7), 26, NAVY, bold=True)
    txt(s, "Revenue, profit and expense analysis for fiscal year 2025", Inches(0.7), Inches(1.0), Inches(9), Inches(0.4), 12, MGRAY)
    divider(s, Inches(0.7), Inches(1.5), Inches(1.0))
    # Revenue vs Expense line chart simulation
    box(s, Inches(0.5), Inches(1.8), Inches(7.8), Inches(4.5), WHITE)
    months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    rev    = [0.30,0.38,0.45,0.42,0.55,0.62,0.58,0.70,0.75,0.68,0.82,0.95]
    exp    = [0.25,0.28,0.32,0.30,0.38,0.40,0.42,0.44,0.46,0.48,0.50,0.52]
    for i, (r, e, m) in enumerate(zip(rev, exp, months)):
        x = Inches(0.8 + i * 0.6)
        rh = Inches(r * 2.8); eh = Inches(e * 2.8)
        box(s, x, Inches(5.8) - rh, Inches(0.22), rh, NAVY)
        box(s, x + Inches(0.24), Inches(5.8) - eh, Inches(0.22), eh, RGBColor(0xC9,0xA2,0x27))
        txt(s, m, x, Inches(5.85), Inches(0.55), Inches(0.25), 7, MGRAY, align=PP_ALIGN.CENTER)
    txt(s, "■ Revenue", Inches(0.7), Inches(6.3), Inches(1.5), Inches(0.3), 9, NAVY)
    txt(s, "■ Expenses", Inches(2.2), Inches(6.3), Inches(1.5), Inches(0.3), 9, GOLD)
    # KPI sidebar
    for i, (val, lbl, color) in enumerate([("$4.2M","Total Revenue",NAVY),("$2.8M","Total Expenses",GOLD),("$1.4M","Net Profit",GREEN)]):
        y = Inches(2.0 + i * 1.4)
        box(s, Inches(9.0), y, Inches(3.8), Inches(1.1), color)
        tc = WHITE
        txt(s, val, Inches(9.2), y + Inches(0.1), Inches(3), Inches(0.6), 24, tc, bold=True)
        txt(s, lbl, Inches(9.2), y + Inches(0.65), Inches(3), Inches(0.3), 10, RGBColor(0xD4,0xD4,0xD8))

    # SLIDE 4 — Thank You
    s = blank(prs)
    bg(s, NAVY)
    box(s, 0, 0, W, Inches(0.08), GOLD)
    box(s, 0, Inches(7.42), W, Inches(0.08), GOLD)
    txt(s, "Thank You", Inches(0), Inches(2.2), W, Inches(1.2), 72, WHITE, bold=True, align=PP_ALIGN.CENTER)
    txt(s, "For more information, contact us at info@company.com", Inches(0), Inches(3.6), W, Inches(0.5), 14, MGRAY, align=PP_ALIGN.CENTER)
    txt(s, "www.company.com  |  +1 (555) 000-0000", Inches(0), Inches(4.2), W, Inches(0.5), 12, RGBColor(0x52,0x52,0x5B), align=PP_ALIGN.CENTER)

    prs.save(f"{OUT}/annual_report_2025.pptx")
    print("✓ annual_report_2025.pptx")


# ═══════════════════════════════════════════════════════════
# 2. INVESTOR PITCH DECK
# ═══════════════════════════════════════════════════════════
def make_pitch_deck():
    prs = new_prs()

    # SLIDE 1 — Title
    s = blank(prs)
    bg(s, WHITE)
    box(s, 0, 0, Inches(4.8), H, NAVY)
    box(s, 0, 0, Inches(4.8), Inches(0.08), GOLD)
    txt(s, "PITCH DECK", Inches(0.5), Inches(0.9), Inches(3.8), Inches(0.4), 9, GOLD, bold=True)
    txt(s, "Investor\nPresentation", Inches(0.5), Inches(1.5), Inches(4.0), Inches(2.0), 38, WHITE, bold=True)
    txt(s, "Series A Funding Round", Inches(0.5), Inches(3.5), Inches(3.8), Inches(0.4), 13, MGRAY)
    divider(s, Inches(0.5), Inches(4.0), Inches(0.8))
    txt(s, "YourStartup Inc.", Inches(0.5), Inches(4.3), Inches(3.8), Inches(0.4), 13, WHITE, bold=True)
    txt(s, "2025", Inches(0.5), Inches(4.65), Inches(2), Inches(0.3), 11, MGRAY)
    # Right side
    for i, (n, v) in enumerate([("Market Size","$2.4B"),("Target Users","500K+"),("Ask","$5M")]):
        x = Inches(5.5 + (i%2)*3.8)
        y = Inches(1.5 + (i//2)*2.0)
        if i < 2:
            box(s, x, y, Inches(3.5), Inches(1.6), LGRAY)
            txt(s, n, x+Inches(0.2), y+Inches(0.2), Inches(3), Inches(0.3), 9, MGRAY, bold=True)
            txt(s, v, x+Inches(0.2), y+Inches(0.55), Inches(3), Inches(0.8), 28, NAVY, bold=True)
        else:
            box(s, Inches(5.5), Inches(3.5), Inches(7.3), Inches(1.8), NAVY)
            txt(s, "Funding Ask", Inches(5.7), Inches(3.7), Inches(4), Inches(0.4), 11, MGRAY)
            txt(s, "$5,000,000", Inches(5.7), Inches(4.1), Inches(6), Inches(0.9), 36, GOLD, bold=True)

    # SLIDE 2 — Problem
    s = blank(prs)
    bg(s, WHITE)
    box(s, 0, 0, W, Inches(0.08), RED)
    txt(s, "The Problem", Inches(0.7), Inches(0.4), Inches(9), Inches(0.8), 32, NAVY, bold=True)
    divider(s, Inches(0.7), Inches(1.2), Inches(0.8), RED)
    for i, (icon, title, desc) in enumerate([
        ("!", "Inefficient Workflows", "Teams waste 40% of time on manual, repetitive tasks with no clear system."),
        ("$", "High Operational Costs", "Existing solutions cost 3x more than necessary without delivering better results."),
        ("✗", "Poor User Experience", "Current tools have steep learning curves, driving low adoption rates.")
    ]):
        x = Inches(0.5 + i * 4.2)
        box(s, x, Inches(1.8), Inches(3.8), Inches(4.0), LGRAY)
        box(s, x, Inches(1.8), Inches(3.8), Inches(0.8), RED)
        txt(s, icon, x+Inches(0.15), Inches(1.9), Inches(0.6), Inches(0.6), 22, WHITE, bold=True)
        txt(s, title, x+Inches(0.2), Inches(2.8), Inches(3.4), Inches(0.6), 14, NAVY, bold=True)
        txt(s, desc, x+Inches(0.2), Inches(3.5), Inches(3.4), Inches(1.8), 11, DGRAY)

    # SLIDE 3 — Solution
    s = blank(prs)
    bg(s, NAVY)
    txt(s, "Our Solution", Inches(0.7), Inches(0.4), Inches(9), Inches(0.8), 32, WHITE, bold=True)
    txt(s, "How we solve the problem better than anyone else", Inches(0.7), Inches(1.1), Inches(9), Inches(0.4), 14, MGRAY)
    divider(s, Inches(0.7), Inches(1.6), Inches(0.8))
    for i, (num, title, desc) in enumerate([
        ("01","AI-Powered Automation","Our platform automates 80% of repetitive workflows using advanced ML models."),
        ("02","Cost-Effective Pricing","Flat-rate pricing at 60% less than competitors, with no hidden fees."),
        ("03","Intuitive Interface","Designed for non-technical users — onboarding takes under 10 minutes."),
        ("04","Enterprise Security","SOC 2 compliant, end-to-end encryption, and role-based access control."),
    ]):
        x = Inches(0.5 + (i%2)*6.4)
        y = Inches(2.2 + (i//2)*2.4)
        box(s, x, y, Inches(5.8), Inches(2.0), RGBColor(0x07,0x07,0x3D))
        txt(s, num, x+Inches(0.2), y+Inches(0.15), Inches(1), Inches(0.5), 18, GOLD, bold=True)
        txt(s, title, x+Inches(0.2), y+Inches(0.65), Inches(5.2), Inches(0.45), 14, WHITE, bold=True)
        txt(s, desc, x+Inches(0.2), y+Inches(1.1), Inches(5.2), Inches(0.75), 10, MGRAY)

    # SLIDE 4 — Traction
    s = blank(prs)
    bg(s, WHITE)
    box(s, 0, 0, W, Inches(0.08), GOLD)
    txt(s, "Traction & Metrics", Inches(0.7), Inches(0.35), Inches(9), Inches(0.8), 28, NAVY, bold=True)
    metrics = [("12,500","Registered Users"),("$280K","MRR"),("94%","Retention Rate"),("4.8/5","App Rating")]
    for i, (val, lbl) in enumerate(metrics):
        x = Inches(0.5 + i * 3.2)
        col = NAVY if i % 2 == 0 else GOLD
        tc  = WHITE if col == NAVY else NAVY
        box(s, x, Inches(1.5), Inches(3.0), Inches(1.8), col)
        txt(s, val, x+Inches(0.2), Inches(1.7), Inches(2.6), Inches(0.9), 30, tc, bold=True)
        txt(s, lbl, x+Inches(0.2), Inches(2.6), Inches(2.6), Inches(0.4), 10, RGBColor(0xD4,0xD4,0xD8) if col==NAVY else RGBColor(0x52,0x52,0x5B))
    # Growth chart
    txt(s, "Monthly Recurring Revenue Growth", Inches(0.5), Inches(3.6), Inches(6), Inches(0.5), 13, NAVY, bold=True)
    months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"]
    vals   = [0.15,0.22,0.30,0.38,0.48,0.58,0.70,0.82,1.0]
    for i, (m, v) in enumerate(zip(months, vals)):
        x  = Inches(0.6 + i * 0.82)
        bh = Inches(v * 2.0)
        box(s, x, Inches(6.0)-bh, Inches(0.55), bh, NAVY if i < 8 else GOLD)
        txt(s, m, x, Inches(6.05), Inches(0.7), Inches(0.25), 8, MGRAY, align=PP_ALIGN.CENTER)

    # SLIDE 5 — The Ask
    s = blank(prs)
    bg(s, NAVY)
    box(s, 0, 0, W, Inches(0.08), GOLD)
    txt(s, "The Ask", Inches(0), Inches(1.0), W, Inches(0.8), 40, WHITE, bold=True, align=PP_ALIGN.CENTER)
    box(s, Inches(2.5), Inches(2.0), Inches(8.3), Inches(1.4), RGBColor(0x07,0x07,0x3D))
    txt(s, "Raising $5,000,000", Inches(2.5), Inches(2.1), Inches(8.3), Inches(1.2), 36, GOLD, bold=True, align=PP_ALIGN.CENTER)
    allocations = [("Product Development","40% · $2M"),("Sales & Marketing","30% · $1.5M"),("Operations","20% · $1M"),("Reserve","10% · $0.5M")]
    for i, (cat, amt) in enumerate(allocations):
        x = Inches(0.5 + (i%2)*6.4)
        y = Inches(3.8 + (i//2)*1.4)
        box(s, x, y, Inches(5.8), Inches(1.1), RGBColor(0x07,0x07,0x3D))
        txt(s, cat, x+Inches(0.2), y+Inches(0.1), Inches(4), Inches(0.45), 12, WHITE, bold=True)
        txt(s, amt, x+Inches(0.2), y+Inches(0.55), Inches(5), Inches(0.35), 11, GOLD)
    txt(s, "contact@yourstartup.com  ·  www.yourstartup.com", Inches(0), Inches(7.1), W, Inches(0.3), 11, MGRAY, align=PP_ALIGN.CENTER)

    prs.save(f"{OUT}/investor_pitch_deck.pptx")
    print("✓ investor_pitch_deck.pptx")


# ═══════════════════════════════════════════════════════════
# 3. MARKETING STRATEGY
# ═══════════════════════════════════════════════════════════
def make_marketing():
    prs = new_prs()

    s = blank(prs)
    bg(s, WHITE)
    box(s, 0, 0, W, Inches(0.5), GOLD)
    box(s, 0, 0, Inches(0.5), H, GOLD)
    txt(s, "Marketing", Inches(0.8), Inches(1.2), Inches(9), Inches(1.4), 64, NAVY, bold=True)
    txt(s, "Strategy 2025", Inches(0.8), Inches(2.5), Inches(9), Inches(1.0), 40, GOLD, bold=True)
    txt(s, "Brand Growth · Digital Channels · Campaign Planning", Inches(0.8), Inches(3.7), Inches(9), Inches(0.5), 14, MGRAY)
    box(s, Inches(0.8), Inches(4.4), Inches(11.7), Inches(0.08), LGRAY)
    txt(s, "Prepared by Marketing Department  ·  Q1 2025", Inches(0.8), Inches(4.7), Inches(8), Inches(0.4), 11, MGRAY)

    s = blank(prs)
    bg(s, RGBColor(0xFA,0xFA,0xFA))
    box(s, 0, 0, W, Inches(0.08), GOLD)
    box(s, 0, 0, W, Inches(1.1), NAVY)
    txt(s, "Campaign Goals", Inches(0.6), Inches(0.2), Inches(8), Inches(0.7), 24, WHITE, bold=True)
    goals = [
        ("Brand Awareness","Reach 5M impressions across all digital channels in Q1","2M","Current Reach"),
        ("Lead Generation","Generate 10,000 qualified leads through inbound campaigns","3,200","Leads to Date"),
        ("Conversion Rate","Improve landing page conversion from 2.1% to 4.5%","2.1%","Current Rate"),
        ("Customer LTV","Increase average customer lifetime value by 30%","$840","Current LTV"),
    ]
    for i, (title, desc, stat, slbl) in enumerate(goals):
        x = Inches(0.5 + (i%2)*6.5)
        y = Inches(1.4 + (i//2)*2.6)
        box(s, x, y, Inches(6.0), Inches(2.2), WHITE)
        box(s, x, y, Inches(0.08), Inches(2.2), GOLD)
        txt(s, title, x+Inches(0.2), y+Inches(0.15), Inches(5.5), Inches(0.5), 14, NAVY, bold=True)
        txt(s, desc, x+Inches(0.2), y+Inches(0.65), Inches(3.8), Inches(0.9), 10, DGRAY)
        txt(s, stat, x+Inches(4.2), y+Inches(0.25), Inches(1.6), Inches(0.7), 22, NAVY, bold=True, align=PP_ALIGN.RIGHT)
        txt(s, slbl, x+Inches(4.2), y+Inches(0.95), Inches(1.6), Inches(0.3), 8, MGRAY, align=PP_ALIGN.RIGHT)

    s = blank(prs)
    bg(s, NAVY)
    txt(s, "Digital Channel Mix", Inches(0.7), Inches(0.3), Inches(9), Inches(0.7), 28, WHITE, bold=True)
    txt(s, "Budget allocation and expected ROI by channel", Inches(0.7), Inches(0.95), Inches(9), Inches(0.4), 13, MGRAY)
    channels = [
        ("Paid Social","Facebook · Instagram · TikTok","35%","$42,000","4.2x ROI", GOLD),
        ("SEO & Content","Blog · YouTube · Podcast","25%","$30,000","8.1x ROI", RGBColor(0x10,0xB9,0x81)),
        ("Email Marketing","Newsletter · Drip · Re-engage","20%","$24,000","12x ROI", BLUE),
        ("Paid Search","Google · Bing Ads","15%","$18,000","5.6x ROI", RGBColor(0xF5,0x9E,0x0B)),
        ("Influencers","Micro & macro partnerships","5%","$6,000","3.8x ROI", RED),
    ]
    for i, (name, sub, pct, budget, roi, color) in enumerate(channels):
        y = Inches(1.6 + i * 1.0)
        box(s, Inches(0.5), y, Inches(12.3), Inches(0.85), RGBColor(0x07,0x07,0x3D))
        box(s, Inches(0.5), y, Inches(0.1), Inches(0.85), color)
        txt(s, name, Inches(0.8), y+Inches(0.08), Inches(2.5), Inches(0.45), 13, WHITE, bold=True)
        txt(s, sub,  Inches(0.8), y+Inches(0.5), Inches(2.5), Inches(0.28), 9, MGRAY)
        txt(s, pct,  Inches(4.5), y+Inches(0.12), Inches(1.2), Inches(0.6), 20, color, bold=True)
        txt(s, budget, Inches(6.5), y+Inches(0.15), Inches(2), Inches(0.55), 14, WHITE, bold=True)
        txt(s, roi, Inches(10.0), y+Inches(0.15), Inches(2.5), Inches(0.55), 14, RGBColor(0x10,0xB9,0x81), bold=True)

    prs.save(f"{OUT}/marketing_strategy.pptx")
    print("✓ marketing_strategy.pptx")


# ═══════════════════════════════════════════════════════════
# 4. QUARTERLY BUSINESS REVIEW
# ═══════════════════════════════════════════════════════════
def make_qbr():
    prs = new_prs()

    s = blank(prs)
    bg(s, NAVY)
    for i in range(8):
        box(s, 0, Inches(i*0.95), W, Inches(0.02), RGBColor(0x07,0x07,0x3D))
    box(s, Inches(6.5), 0, Inches(6.83), H, RGBColor(0x07,0x07,0x3D))
    box(s, 0, Inches(6.5), W, Inches(1.0), GOLD)
    txt(s, "Q3 2025", Inches(0.7), Inches(1.0), Inches(6), Inches(1.2), 80, WHITE, bold=True)
    txt(s, "Business Review", Inches(0.7), Inches(2.3), Inches(6), Inches(0.8), 32, GOLD)
    txt(s, "Performance · Insights · Outlook", Inches(0.7), Inches(3.2), Inches(6), Inches(0.5), 14, MGRAY)
    txt(s, "Confidential — Internal Use Only", Inches(0.7), Inches(6.65), Inches(5), Inches(0.25), 9, NAVY, bold=True)
    for i, (v, l) in enumerate([("$1.4M","Revenue"),("847","New Deals"),("98%","Uptime")]):
        x = Inches(7.5 + i*1.8)
        txt(s, v, x, Inches(2.0), Inches(1.6), Inches(0.7), 22, WHITE, bold=True, align=PP_ALIGN.CENTER)
        txt(s, l, x, Inches(2.65), Inches(1.6), Inches(0.3), 9, MGRAY, align=PP_ALIGN.CENTER)

    s = blank(prs)
    bg(s, WHITE)
    box(s, 0, 0, W, Inches(0.08), NAVY)
    txt(s, "Q3 Performance Scorecard", Inches(0.7), Inches(0.3), Inches(10), Inches(0.6), 22, NAVY, bold=True)
    headers = ["Metric","Target","Actual","Variance","Status"]
    widths  = [3.5, 1.8, 1.8, 1.8, 1.5]
    rows = [
        ("Revenue","$1.2M","$1.4M","+$200K","✓ Achieved"),
        ("New Customers","600","847","+247","✓ Exceeded"),
        ("Churn Rate","< 3%","2.1%","-0.9%","✓ Achieved"),
        ("NPS Score","> 45","52","+7","✓ Exceeded"),
        ("Support SLA","95%","91%","-4%","⚠ At Risk"),
        ("Cost per Lead","< $85","$78","-$7","✓ Achieved"),
    ]
    box(s, Inches(0.5), Inches(1.1), Inches(12.3), Inches(0.55), NAVY)
    x = Inches(0.6)
    for h, w in zip(headers, widths):
        txt(s, h, x, Inches(1.18), Inches(w), Inches(0.4), 10, WHITE, bold=True)
        x += Inches(w)
    for r_i, row in enumerate(rows):
        y = Inches(1.75 + r_i * 0.72)
        bg_col = LGRAY if r_i % 2 == 0 else WHITE
        box(s, Inches(0.5), y, Inches(12.3), Inches(0.65), bg_col)
        x = Inches(0.6)
        for c_i, (cell, w) in enumerate(zip(row, widths)):
            col = NAVY
            if c_i == 3:
                col = GREEN if "+" in cell or "-0" in cell or "-$" in cell else RED
            elif c_i == 4:
                col = GREEN if "✓" in cell else RGBColor(0xD9,0x77,0x06)
            txt(s, cell, x, y+Inches(0.12), Inches(w), Inches(0.4), 10, col, bold=(c_i==4))
            x += Inches(w)

    prs.save(f"{OUT}/quarterly_business_review.pptx")
    print("✓ quarterly_business_review.pptx")


# ═══════════════════════════════════════════════════════════
# 5. PRODUCT LAUNCH
# ═══════════════════════════════════════════════════════════
def make_product_launch():
    prs = new_prs()

    s = blank(prs)
    bg(s, WHITE)
    box(s, 0, 0, W, H, RGBColor(0xFA,0xFA,0xFB))
    box(s, Inches(6.0), 0, Inches(7.33), H, NAVY)
    txt(s, "NEW", Inches(6.4), Inches(0.5), Inches(5), Inches(0.8), 11, GOLD, bold=True)
    txt(s, "Product\nLaunch", Inches(6.4), Inches(1.2), Inches(6.5), Inches(2.5), 52, WHITE, bold=True)
    txt(s, "2025", Inches(6.4), Inches(3.5), Inches(3), Inches(0.9), 48, GOLD, bold=True)
    txt(s, "Introducing the next generation of\nour flagship platform solution.", Inches(6.4), Inches(4.5), Inches(6.5), Inches(1.0), 12, MGRAY)
    box(s, Inches(6.4), Inches(5.8), Inches(1.2), Inches(0.08), GOLD)
    txt(s, "Product Name", Inches(0.7), Inches(1.5), Inches(5), Inches(0.8), 42, NAVY, bold=True)
    txt(s, "Tagline goes here — clear, concise, compelling.", Inches(0.7), Inches(2.4), Inches(5), Inches(0.6), 14, DGRAY)
    for i, f in enumerate(["⚡ 10x faster","🔒 Enterprise-grade","📊 Real-time data","🌍 Global scale"]):
        txt(s, f, Inches(0.7), Inches(3.4+i*0.55), Inches(5), Inches(0.45), 12, DGRAY)
    box(s, Inches(0.7), Inches(6.2), Inches(1.8), Inches(0.65), NAVY)
    txt(s, "Learn More →", Inches(0.75), Inches(6.3), Inches(1.7), Inches(0.45), 11, WHITE, bold=True)

    s = blank(prs)
    bg(s, NAVY)
    box(s, 0, 0, W, Inches(0.08), GOLD)
    txt(s, "Key Features", Inches(0.7), Inches(0.3), Inches(9), Inches(0.7), 28, WHITE, bold=True)
    features = [
        ("⚡", "Lightning Fast", "10x faster processing with our new architecture. Handle millions of records in seconds."),
        ("🔒", "Bank-Level Security", "SOC 2 Type II, GDPR compliant. Your data is always encrypted at rest and in transit."),
        ("🤖", "AI-Powered Insights", "Machine learning models surface actionable insights automatically — no data science needed."),
        ("📱", "Mobile First", "Native iOS and Android apps with full feature parity. Work from anywhere, on any device."),
        ("🔗", "200+ Integrations", "Connect to your existing stack instantly. Salesforce, Slack, HubSpot, and 200 more."),
        ("📊", "Advanced Analytics", "Real-time dashboards with customisable KPIs. Share reports with one click."),
    ]
    for i, (icon, title, desc) in enumerate(features):
        x = Inches(0.5 + (i%3)*4.3)
        y = Inches(1.4 + (i//3)*2.5)
        box(s, x, y, Inches(4.0), Inches(2.1), RGBColor(0x07,0x07,0x3D))
        txt(s, icon, x+Inches(0.2), y+Inches(0.15), Inches(0.7), Inches(0.6), 22, WHITE)
        txt(s, title, x+Inches(0.2), y+Inches(0.7), Inches(3.5), Inches(0.45), 13, WHITE, bold=True)
        txt(s, desc, x+Inches(0.2), y+Inches(1.15), Inches(3.5), Inches(0.8), 9, MGRAY)

    s = blank(prs)
    bg(s, WHITE)
    box(s, 0, 0, W, Inches(0.08), GOLD)
    txt(s, "Launch Timeline", Inches(0.7), Inches(0.3), Inches(9), Inches(0.7), 28, NAVY, bold=True)
    milestones = [
        ("Jan 2025","Beta Testing","Internal testing with 50 select customers"),
        ("Mar 2025","Soft Launch","Limited release to waitlist — 500 users"),
        ("May 2025","Public Launch","Full public release with marketing blitz"),
        ("Aug 2025","V2 Release","Feature expansion based on user feedback"),
    ]
    box(s, Inches(0.7), Inches(3.75), Inches(11.9), Inches(0.04), LGRAY)
    for i, (date, title, desc) in enumerate(milestones):
        x = Inches(0.7 + i*3.2)
        box(s, x+Inches(1.3), Inches(3.6), Inches(0.3), Inches(0.3), NAVY if i<3 else GOLD)
        box(s, x, Inches(1.3), Inches(0.04), Inches(2.4), LGRAY)
        txt(s, date, x+Inches(0.1), Inches(1.3), Inches(3.0), Inches(0.4), 10, GOLD, bold=True)
        txt(s, title, x+Inches(0.1), Inches(1.75), Inches(3.0), Inches(0.5), 14, NAVY, bold=True)
        txt(s, desc, x+Inches(0.1), Inches(2.3), Inches(3.0), Inches(0.9), 10, DGRAY)

    prs.save(f"{OUT}/product_launch.pptx")
    print("✓ product_launch.pptx")


# ═══════════════════════════════════════════════════════════
# 6. TEAM / HR PRESENTATION
# ═══════════════════════════════════════════════════════════
def make_team_hr():
    prs = new_prs()

    s = blank(prs)
    bg(s, WHITE)
    box(s, 0, 0, W, Inches(3.5), NAVY)
    txt(s, "Our Team", Inches(0.8), Inches(0.6), Inches(10), Inches(1.2), 56, WHITE, bold=True)
    txt(s, "Company Culture, Values & People", Inches(0.8), Inches(1.8), Inches(10), Inches(0.6), 18, GOLD)
    txt(s, "Human Resources · 2025 Presentation", Inches(0.8), Inches(2.4), Inches(10), Inches(0.4), 12, MGRAY)
    for i, (n, v) in enumerate([("124","Employees"),("18","Nationalities"),("4.7/5","Glassdoor"),("92%","Retention")]):
        x = Inches(0.8 + i*3.1)
        box(s, x, Inches(4.0), Inches(2.8), Inches(1.8), LGRAY)
        txt(s, n, x+Inches(0.15), Inches(4.1), Inches(2.5), Inches(0.9), 30, NAVY, bold=True)
        txt(s, v, x+Inches(0.15), Inches(4.95), Inches(2.5), Inches(0.35), 10, MGRAY)

    s = blank(prs)
    bg(s, RGBColor(0xFA,0xFA,0xFA))
    box(s, 0, 0, W, Inches(0.08), NAVY)
    txt(s, "Our Values", Inches(0.7), Inches(0.3), Inches(9), Inches(0.7), 28, NAVY, bold=True)
    values = [
        ("🎯","Customer First","Every decision starts with asking: how does this help our customers succeed?"),
        ("🤝","Radical Honesty","We communicate clearly and directly, even when it's uncomfortable."),
        ("⚡","Bias for Action","We move fast, ship often, and learn from real-world feedback."),
        ("🌱","Grow Together","We invest in each person's growth because our company grows when people grow."),
    ]
    for i, (icon, title, desc) in enumerate(values):
        x = Inches(0.5 + (i%2)*6.4)
        y = Inches(1.4 + (i//2)*2.6)
        box(s, x, y, Inches(6.0), Inches(2.2), WHITE)
        box(s, x, y, Inches(6.0), Inches(0.08), NAVY if i%2==0 else GOLD)
        txt(s, f"{icon}  {title}", x+Inches(0.2), y+Inches(0.25), Inches(5.5), Inches(0.55), 15, NAVY, bold=True)
        txt(s, desc, x+Inches(0.2), y+Inches(0.85), Inches(5.5), Inches(1.1), 11, DGRAY)

    prs.save(f"{OUT}/team_hr_presentation.pptx")
    print("✓ team_hr_presentation.pptx")


# ═══════════════════════════════════════════════════════════
# 7. SALES PROPOSAL
# ═══════════════════════════════════════════════════════════
def make_sales_proposal():
    prs = new_prs()

    s = blank(prs)
    bg(s, NAVY)
    box(s, 0, 0, Inches(0.08), H, GOLD)
    box(s, Inches(13.25), 0, Inches(0.08), H, GOLD)
    txt(s, "Sales Proposal", Inches(0.7), Inches(1.5), Inches(11), Inches(1.4), 52, WHITE, bold=True)
    txt(s, "Prepared exclusively for:", Inches(0.7), Inches(3.1), Inches(8), Inches(0.4), 12, MGRAY)
    txt(s, "Client Company Name", Inches(0.7), Inches(3.6), Inches(8), Inches(0.7), 24, GOLD, bold=True)
    divider(s, Inches(0.7), Inches(4.5), Inches(1.5))
    txt(s, "Your Company  ·  Sales Team  ·  Q1 2025", Inches(0.7), Inches(4.8), Inches(8), Inches(0.4), 12, MGRAY)
    box(s, Inches(9.5), Inches(1.5), Inches(3.3), Inches(4.5), RGBColor(0x07,0x07,0x3D))
    txt(s, "PROPOSAL SUMMARY", Inches(9.7), Inches(1.7), Inches(3), Inches(0.4), 8, GOLD, bold=True)
    for i, (k, v) in enumerate([("Proposed Value","$48,000/yr"),("Contract Length","12 months"),("Start Date","1 Feb 2025"),("Decision By","15 Jan 2025")]):
        y = Inches(2.3 + i*0.85)
        txt(s, k, Inches(9.7), y, Inches(3), Inches(0.3), 9, MGRAY)
        txt(s, v, Inches(9.7), y+Inches(0.28), Inches(3), Inches(0.4), 13, WHITE, bold=True)
        if i < 3: box(s, Inches(9.7), y+Inches(0.72), Inches(2.6), Inches(0.01), RGBColor(0x14,0x14,0x4A))

    s = blank(prs)
    bg(s, WHITE)
    box(s, 0, 0, W, Inches(0.08), GOLD)
    txt(s, "What We're Proposing", Inches(0.7), Inches(0.3), Inches(10), Inches(0.6), 24, NAVY, bold=True)
    packages = [
        ("Starter", "$12,000", "yr", ["Up to 5 users","Core features","Email support","99.5% SLA"], False),
        ("Professional", "$24,000", "yr", ["Up to 25 users","All features","Priority support","99.9% SLA","Custom reports"], False),
        ("Enterprise", "$48,000", "yr", ["Unlimited users","All features","Dedicated CSM","99.99% SLA","Custom integrations","Onboarding"], True),
    ]
    for i, (name, price, per, features, highlight) in enumerate(packages):
        x = Inches(0.5 + i*4.2)
        h_prs = Inches(5.8)
        col = NAVY if highlight else WHITE
        fc  = WHITE if highlight else NAVY
        box(s, x, Inches(1.1), Inches(3.9), h_prs, col)
        if not highlight: 
            box(s, x, Inches(1.1), Inches(3.9), h_prs, WHITE)
            # draw border
            for side_x, side_y, side_w, side_h in [(x,Inches(1.1),Inches(3.9),Inches(0.01)),(x,Inches(6.9),Inches(3.9),Inches(0.01)),(x,Inches(1.1),Inches(0.01),h_prs),(x+Inches(3.89),Inches(1.1),Inches(0.01),h_prs)]:
                box(s, side_x, side_y, side_w, side_h, LGRAY)
        if highlight:
            box(s, x, Inches(1.1), Inches(3.9), Inches(0.4), GOLD)
            txt(s, "RECOMMENDED", x+Inches(0.15), Inches(1.18), Inches(3.6), Inches(0.25), 8, NAVY, bold=True)
        txt(s, name, x+Inches(0.2), Inches(1.65), Inches(3.5), Inches(0.5), 16, fc if highlight else NAVY, bold=True)
        txt(s, price, x+Inches(0.2), Inches(2.2), Inches(3.5), Inches(0.8), 28, GOLD if highlight else NAVY, bold=True)
        txt(s, f"per {per}", x+Inches(0.2), Inches(2.95), Inches(3.5), Inches(0.3), 10, MGRAY)
        for j, feat in enumerate(features):
            txt(s, f"✓  {feat}", x+Inches(0.2), Inches(3.4+j*0.45), Inches(3.5), Inches(0.38), 10, fc if highlight else DGRAY)

    prs.save(f"{OUT}/sales_proposal.pptx")
    print("✓ sales_proposal.pptx")


# ═══════════════════════════════════════════════════════════
# 8. COMPANY PROFILE
# ═══════════════════════════════════════════════════════════
def make_company_profile():
    prs = new_prs()

    s = blank(prs)
    bg(s, NAVY)
    box(s, 0, Inches(5.5), W, Inches(2.0), GOLD)
    txt(s, "Company", Inches(0.8), Inches(0.7), Inches(11), Inches(1.3), 72, WHITE, bold=True)
    txt(s, "Profile", Inches(0.8), Inches(1.9), Inches(11), Inches(1.3), 72, GOLD, bold=True)
    txt(s, "Who We Are · What We Do · Why We Exist", Inches(0.8), Inches(3.3), Inches(11), Inches(0.5), 14, MGRAY)
    txt(s, "Founded 2018  ·  Headquarters: New York  ·  Global Team", Inches(0.8), Inches(5.7), Inches(11), Inches(0.4), 11, NAVY, bold=True)

    s = blank(prs)
    bg(s, WHITE)
    box(s, 0, 0, W, Inches(0.08), NAVY)
    txt(s, "About Us", Inches(0.7), Inches(0.3), Inches(9), Inches(0.6), 26, NAVY, bold=True)
    txt(s, "We help businesses grow through technology", Inches(0.7), Inches(1.0), Inches(10), Inches(0.5), 14, GOLD)
    txt(s, "Founded in 2018, we are a technology company on a mission to make enterprise software accessible to businesses of all sizes. Our platform serves over 2,800 customers across 40 countries, from early-stage startups to Fortune 500 companies.", Inches(0.7), Inches(1.7), Inches(8.5), Inches(1.8), 12, DGRAY)
    box(s, Inches(9.5), Inches(1.0), Inches(3.3), Inches(5.5), LGRAY)
    txt(s, "AT A GLANCE", Inches(9.7), Inches(1.2), Inches(3), Inches(0.35), 8, MGRAY, bold=True)
    for i, (k, v) in enumerate([("Founded","2018"),("Employees","124"),("Countries","40"),("Customers","2,847"),("NPS Score","72")]):
        y = Inches(1.7 + i*0.85)
        txt(s, k, Inches(9.7), y, Inches(1.6), Inches(0.35), 10, MGRAY)
        txt(s, v, Inches(11.2), y, Inches(1.5), Inches(0.35), 10, NAVY, bold=True, align=PP_ALIGN.RIGHT)
        if i < 4: box(s, Inches(9.7), y+Inches(0.42), Inches(2.7), Inches(0.01), RGBColor(0xE4,0xE4,0xE7))
    txt(s, "Our Mission", Inches(0.7), Inches(3.8), Inches(8.5), Inches(0.45), 14, NAVY, bold=True)
    box(s, Inches(0.7), Inches(4.35), Inches(0.06), Inches(1.4), GOLD)
    txt(s, "To democratise access to enterprise-grade technology, enabling businesses of every size to compete and thrive in the digital economy through intuitive, affordable, and powerful software solutions.", Inches(0.9), Inches(4.35), Inches(8.3), Inches(1.5), 12, DGRAY)

    prs.save(f"{OUT}/company_profile.pptx")
    print("✓ company_profile.pptx")


if __name__ == "__main__":
    print("Generating professional PPTX templates...\n")
    make_annual_report()
    make_pitch_deck()
    make_marketing()
    make_qbr()
    make_product_launch()
    make_team_hr()
    make_sales_proposal()
    make_company_profile()
    print(f"\n✓ All templates saved to {OUT}")
