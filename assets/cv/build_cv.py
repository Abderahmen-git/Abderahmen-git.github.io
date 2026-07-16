"""
Generates Abderahmen-Boudabous-CV.pdf from the same facts used on the site.
Re-run this after editing the content below (or after editing the JSON files
in /data and syncing the changes here).
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT

NAVY = HexColor("#0A1424")
TEAL = HexColor("#0B847F")
MUTED = HexColor("#56657A")
TEXT = HexColor("#101826")

styles = getSampleStyleSheet()
name_style = ParagraphStyle("name", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, textColor=NAVY, spaceAfter=2, alignment=TA_LEFT)
role_style = ParagraphStyle("role", parent=styles["Normal"], fontName="Helvetica", fontSize=12, textColor=TEAL, spaceAfter=10)
section_style = ParagraphStyle("section", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11, textColor=NAVY, spaceBefore=14, spaceAfter=6, letterSpacing=0.5)
body_style = ParagraphStyle("body", parent=styles["Normal"], fontName="Helvetica", fontSize=9.5, textColor=TEXT, leading=13.5)
muted_style = ParagraphStyle("muted", parent=styles["Normal"], fontName="Helvetica", fontSize=9, textColor=MUTED, leading=13)
role_title_style = ParagraphStyle("role_title", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10, textColor=TEXT, spaceAfter=1)

doc = SimpleDocTemplate(
    "Abderahmen-Boudabous-CV.pdf",
    pagesize=A4,
    topMargin=18 * mm,
    bottomMargin=16 * mm,
    leftMargin=18 * mm,
    rightMargin=18 * mm,
    title="Abderahmen Boudabous - Cybersecurity Engineer CV",
)

story = []

story.append(Paragraph("Abderahmen Boudabous", name_style))
story.append(Paragraph("Cybersecurity Engineer &mdash; SOC / Incident Response / Detection Engineering / DevSecOps", role_style))
story.append(Paragraph(
    "Tunisia &middot; Open to remote &middot; abderahmen.boudabous@example.com &middot; "
    "linkedin.com/in/abderahmen-boudabous &middot; github.com/abderahmen-git",
    muted_style,
))
story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#DDE4EE"), spaceBefore=10, spaceAfter=4))

story.append(Paragraph("PROFILE", section_style))
story.append(Paragraph(
    "Cybersecurity engineer with a blue-team core &mdash; SOC monitoring, incident response, and detection "
    "engineering &mdash; extended into DevSecOps and cloud-native security. Comfortable across SIEM platforms, "
    "case management and threat intel tooling, and the CI/CD and Kubernetes stack that ships modern software.",
    body_style,
))

story.append(Paragraph("CORE SKILLS", section_style))
skills_rows = [
    ["Cybersecurity", "SOC Operations, Incident Response, Detection Engineering, Threat Intelligence, Threat Hunting"],
    ["Monitoring / SIEM", "Splunk, QRadar, Wazuh, Security Onion, Prometheus, Grafana, Loki"],
    ["DevSecOps", "GitLab CI/CD, Docker, Kubernetes, Helm, ArgoCD, Vault, Trivy, SonarQube"],
    ["Networking", "Suricata, Snort, pfSense, Nmap, Metasploit"],
    ["Programming", "Python, Bash, JavaScript, PowerShell"],
    ["Systems", "Linux, Windows, Active Directory"],
]
t = Table(
    [[Paragraph(f"<b>{r[0]}</b>", body_style), Paragraph(r[1], body_style)] for r in skills_rows],
    colWidths=[35 * mm, 132 * mm],
)
t.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 2),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
]))
story.append(t)

story.append(Paragraph("EXPERIENCE", section_style))
experience = [
    ("SOC Analyst Intern", "Add employer name", "Add dates",
     "Monitored and triaged security alerts using Wazuh and Splunk, escalated confirmed incidents through "
     "TheHive, and contributed to detection rule tuning to reduce false positives."),
    ("DevSecOps Intern", "Add employer name", "Add dates",
     "Built security checks into GitLab CI/CD pipelines with SonarQube and Trivy, and helped harden Kubernetes "
     "deployments using Helm and network policies."),
    ("Network & Infrastructure Intern", "Add employer name", "Add dates",
     "Supported network monitoring and firewall administration; hands-on exposure to pfSense, intrusion "
     "detection with Suricata, and Linux system administration."),
]
for title, org, dates, desc in experience:
    story.append(Paragraph(f"{title} &mdash; {org}", role_title_style))
    story.append(Paragraph(dates, muted_style))
    story.append(Paragraph(desc, body_style))
    story.append(Spacer(1, 5))

story.append(Paragraph("EDUCATION", section_style))
education = [
    ("Engineering Degree, Cybersecurity Track", "Add institution name", "Add dates"),
    ("Preparatory / Foundation Studies", "Add institution name", "Add dates"),
]
for title, org, dates in education:
    story.append(Paragraph(f"{title} &mdash; {org}", role_title_style))
    story.append(Paragraph(dates, muted_style))
    story.append(Spacer(1, 4))

story.append(Paragraph("CERTIFICATIONS", section_style))
certs = "Cisco CCNA Security &middot; Cisco CyberOps Associate &middot; Certified Ethical Hacker (CEH) &middot; ISO/IEC 27001 &middot; Fortinet NSE 4"
story.append(Paragraph(certs, body_style))

story.append(Paragraph("LANGUAGES", section_style))
story.append(Paragraph("Arabic (Native) &middot; French (Professional) &middot; English (Professional)", body_style))

doc.build(story)
print("CV built.")
