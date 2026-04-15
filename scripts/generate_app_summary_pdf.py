import math
import os
from dataclasses import dataclass, field


PAGE_WIDTH = 1280
PAGE_HEIGHT = 720
OUTPUT_PATH = os.path.join("output", "pdf", "Blockchain_Justice_System_App_Summary.pdf")


def pdf_text_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def hex_to_rgb(hex_color: str):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) / 255 for i in (0, 2, 4))


def estimate_text_width(text: str, font_size: float) -> float:
    width = 0.0
    for char in text:
        if char == " ":
            width += font_size * 0.28
        elif char in "il.,:;'|!":
            width += font_size * 0.22
        elif char in "MW@#%&":
            width += font_size * 0.82
        elif char.isupper():
            width += font_size * 0.62
        else:
            width += font_size * 0.54
    return width


def wrap_text(text: str, font_size: float, max_width: float):
    if not text:
        return []
    words = text.split()
    lines = []
    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        if estimate_text_width(candidate, font_size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


class PDFBuilder:
    def __init__(self):
        self.objects = []

    def add_object(self, payload: bytes) -> int:
        self.objects.append(payload)
        return len(self.objects)

    def build(self, page_contents):
        font_helvetica = self.add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        font_bold = self.add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
        font_oblique = self.add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>")
        font_courier = self.add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")

        page_ids = []
        content_ids = []
        for content in page_contents:
            stream = content.encode("latin-1", "replace")
            content_id = self.add_object(
                f"<< /Length {len(stream)} >>\nstream\n".encode("latin-1") + stream + b"\nendstream"
            )
            content_ids.append(content_id)
            page_ids.append(0)

        pages_id = self.add_object(b"")

        for index, content_id in enumerate(content_ids):
            page_payload = (
                f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
                f"/Resources << /Font << /F1 {font_helvetica} 0 R /F2 {font_bold} 0 R /F3 {font_oblique} 0 R /F4 {font_courier} 0 R >> >> "
                f"/Contents {content_id} 0 R >>"
            ).encode("latin-1")
            page_ids[index] = self.add_object(page_payload)

        kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
        self.objects[pages_id - 1] = f"<< /Type /Pages /Count {len(page_ids)} /Kids [{kids}] >>".encode("latin-1")

        catalog_id = self.add_object(f"<< /Type /Catalog /Pages {pages_id} 0 R >>".encode("latin-1"))

        chunks = [b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"]
        offsets = [0]
        current_offset = len(chunks[0])
        for object_id, payload in enumerate(self.objects, start=1):
            offsets.append(current_offset)
            obj_bytes = f"{object_id} 0 obj\n".encode("latin-1") + payload + b"\nendobj\n"
            chunks.append(obj_bytes)
            current_offset += len(obj_bytes)

        xref_offset = current_offset
        xref = [f"xref\n0 {len(self.objects) + 1}\n".encode("latin-1"), b"0000000000 65535 f \n"]
        for offset in offsets[1:]:
            xref.append(f"{offset:010d} 00000 n \n".encode("latin-1"))
        chunks.extend(xref)
        trailer = (
            f"trailer\n<< /Size {len(self.objects) + 1} /Root {catalog_id} 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n"
        ).encode("latin-1")
        chunks.append(trailer)
        return b"".join(chunks)


@dataclass
class Box:
    x: float
    y: float
    w: float
    h: float
    title: str
    lines: list[str]
    accent: str = "#46a5ff"
    fill: str = "#0d2146"
    title_size: int = 21
    body_size: int = 16
    body_font: str = "F1"
    body_color: str = "#dce9ff"


@dataclass
class Slide:
    label: str
    title: str
    subtitle: str = ""
    bullets: list[str] = field(default_factory=list)
    boxes: list[Box] = field(default_factory=list)
    note: str = ""
    footer: str = "Blockchain justice platform"
    emphasis: str = ""


class SlideRenderer:
    def __init__(self):
        self.commands = []

    def add(self, command: str):
        self.commands.append(command)

    def set_fill(self, hex_color: str):
        r, g, b = hex_to_rgb(hex_color)
        self.add(f"{r:.3f} {g:.3f} {b:.3f} rg")

    def set_stroke(self, hex_color: str):
        r, g, b = hex_to_rgb(hex_color)
        self.add(f"{r:.3f} {g:.3f} {b:.3f} RG")

    def rect(self, x, y, w, h, fill=None, stroke=None, line_width=1):
        if fill:
            self.set_fill(fill)
        if stroke:
            self.set_stroke(stroke)
            self.add(f"{line_width} w")
        op = "B" if fill and stroke else "f" if fill else "S"
        self.add(f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re {op}")

    def line(self, x1, y1, x2, y2, stroke, line_width=1):
        self.set_stroke(stroke)
        self.add(f"{line_width} w")
        self.add(f"{x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S")

    def circle(self, cx, cy, r, fill=None, stroke=None, line_width=1):
        c = 0.552284749831 * r
        if fill:
            self.set_fill(fill)
        if stroke:
            self.set_stroke(stroke)
            self.add(f"{line_width} w")
        op = "B" if fill and stroke else "f" if fill else "S"
        self.add(
            f"{cx+r:.2f} {cy:.2f} m "
            f"{cx+r:.2f} {cy+c:.2f} {cx+c:.2f} {cy+r:.2f} {cx:.2f} {cy+r:.2f} c "
            f"{cx-c:.2f} {cy+r:.2f} {cx-r:.2f} {cy+c:.2f} {cx-r:.2f} {cy:.2f} c "
            f"{cx-r:.2f} {cy-c:.2f} {cx-c:.2f} {cy-r:.2f} {cx:.2f} {cy-r:.2f} c "
            f"{cx+c:.2f} {cy-r:.2f} {cx+r:.2f} {cy-c:.2f} {cx+r:.2f} {cy:.2f} c {op}"
        )

    def text(self, x, y, text, size=18, font="F1", color="#ffffff"):
        self.set_fill(color)
        escaped = pdf_text_escape(text)
        self.add(f"BT /{font} {size} Tf 1 0 0 1 {x:.2f} {y:.2f} Tm ({escaped}) Tj ET")

    def paragraph(self, x, y_top, text, width, size=18, font="F1", color="#dfe9ff", leading=None):
        lines = wrap_text(text, size, width)
        if leading is None:
            leading = size * 1.35
        current_y = y_top
        for line in lines:
            self.text(x, current_y, line, size=size, font=font, color=color)
            current_y -= leading
        return current_y

    def bullet_list(self, x, y_top, bullets, width, size=18, color="#eef4ff", bullet_color="#8fd0ff"):
        current_y = y_top
        for bullet in bullets:
            wrapped = wrap_text(bullet, size, width - 28)
            self.circle(x + 7, current_y + 6, 4, fill=bullet_color)
            inner_y = current_y
            for line in wrapped:
                self.text(x + 22, inner_y, line, size=size, font="F1", color=color)
                inner_y -= size * 1.35
            current_y = inner_y - 10
        return current_y

    def draw_background(self, slide_number: int):
        self.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill="#071833")
        self.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill="#0a2347")
        self.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill="#081a36")

        # Network lines and nodes on the right.
        node_fill = "#0a355f"
        node_stroke = "#5fa9d9"
        center_x = 960
        center_y = 420
        positions = [
            (1115, 525, 54),
            (1155, 300, 46),
            (1015, 155, 42),
            (845, 585, 40),
            (845, 280, 52),
        ]
        for x, y, r in positions:
            self.line(center_x, center_y, x, y, "#537fb3", 2)
            self.circle(x, y, r, fill=node_fill, stroke=node_stroke, line_width=2)

        self.circle(center_x, center_y, 94, fill="#0c2d56", stroke="#77b1df", line_width=3)
        self.rect(720, 84, 480, 560, fill="#0b1f41", stroke="#426d9b", line_width=1)
        self.rect(722, 86, 476, 556, fill="#0b1e3c")

        # Soft decorative dots.
        for dx, dy, r in [(84, 655, 4), (148, 618, 3), (330, 660, 4), (386, 604, 3), (1190, 656, 3)]:
            self.circle(dx, dy, r, fill="#8cc9ff")

        self.text(40, 24, "Blockchain justice platform", size=14, font="F2", color="#d6e9ff")
        self.text(1180, 24, str(slide_number), size=14, font="F2", color="#d6e9ff")

    def draw_pill(self, text):
        width = estimate_text_width(text, 18) + 26
        self.rect(96, 610, width, 34, fill="#2f8df3")
        self.text(112, 620, text, size=18, font="F2", color="#ffffff")

    def draw_main_panel(self, slide: Slide, slide_number: int):
        self.draw_background(slide_number)
        self.rect(90, 96, 600, 540, fill="#0d2146", stroke="#4c6f9f", line_width=1)
        self.draw_pill(slide.label)
        self.text(118, 545, slide.title, size=34, font="F2", color="#ffffff")
        body_y = 494
        if slide.subtitle:
            body_y = self.paragraph(118, body_y, slide.subtitle, 520, size=18, font="F1", color="#d7e7ff") - 18
        if slide.emphasis:
            self.rect(118, body_y - 18, 520, 54, fill="#123566", stroke="#4fa0ff", line_width=1)
            self.paragraph(136, body_y + 6, slide.emphasis, 484, size=17, font="F2", color="#ffffff")
            body_y -= 78
        if slide.bullets:
            body_y = self.bullet_list(128, body_y, slide.bullets, 500, size=19)
        if slide.note:
            self.rect(118, 72, 510, 62, fill="#0d2c56", stroke="#67b2ff", line_width=1)
            self.text(136, 111, "Speaker cue", size=15, font="F2", color="#95d2ff")
            self.paragraph(136, 88, slide.note, 474, size=15, font="F3", color="#f2f7ff")
        for box in slide.boxes:
            self.draw_box(box)

    def draw_box(self, box: Box):
        self.rect(box.x, box.y, box.w, box.h, fill=box.fill, stroke="#4a709d", line_width=1)
        self.rect(box.x, box.y + box.h - 7, box.w, 7, fill=box.accent)
        self.text(box.x + 18, box.y + box.h - 34, box.title, size=box.title_size, font="F2", color="#ffffff")
        current_y = box.y + box.h - 62
        for line in box.lines:
            wrapped = wrap_text(line, box.body_size, box.w - 34)
            for wrapped_line in wrapped:
                self.text(box.x + 18, current_y, wrapped_line, size=box.body_size, font=box.body_font, color=box.body_color)
                current_y -= box.body_size * 1.28
            current_y -= 8

    def render(self):
        return "\n".join(self.commands)


def build_slides():
    return [
        Slide(
            label="Blue theme - hybrid stack",
            title="Blockchain Justice System",
            subtitle="How Next.js, Node.js, TiDB, Hardhat, Hyperledger Fabric, and Docker work together to run the public case-tracking platform.",
            bullets=[
                "Presenters: Lits'ito Ntsooa, Kekeletso Nalane, Mohau Nkhabe, Bokang Kobo",
                "Focus: problem, SMART objectives, architecture, code walkthrough, workflow, and demo",
            ],
            note="This system combines a modern web interface with database storage and blockchain proof so case activity can be traced and defended.",
        ),
        Slide(
            label="Presenter 1 - slide 1",
            title="Problem Statement",
            bullets=[
                "Justice systems struggle to manage case workflows efficiently across police, investigation, commissioner, registry, DPP, and court stages.",
                "Traditional record systems make it hard to prove whether sensitive case data was changed after submission.",
                "Teams also need better visibility into who acted, when they acted, and what happened at each workflow checkpoint.",
            ],
            note="The real problem is not only storage. It is trust, accountability, and being able to defend the history of each case.",
        ),
        Slide(
            label="Presenter 1 - slide 2",
            title="System Objectives (SMART)",
            bullets=[
                "Specific: build a digital justice case management platform for capture, review, assignment, and public tracking.",
                "Measurable: record case actions, audit entries, workflow status, and blockchain anchors for every important event.",
                "Achievable: implement with Next.js, API routes, server logic, TiDB-compatible SQL storage, and blockchain anchoring.",
                "Relevant: improve transparency, traceability, and confidence in case handling.",
                "Time-bound: support real-time updates and demo-ready tracking during the project period.",
            ],
            emphasis="Next.js handles the interface, Node.js handles the logic, TiDB stores the full data, and blockchain provides proof of integrity.",
            note="The objective is practical: capture the full business record in the database, then use blockchain to prove the record was not silently changed.",
        ),
        Slide(
            label="Presenter 1 - slide 3",
            title="Architecture Overview",
            subtitle="The repository shows a layered design with UI, API routes, server services, SQL storage, and blockchain trust services.",
            boxes=[
                Box(720, 395, 220, 172, "Users", ["Police officers", "Investigators", "Commissioner", "Registry and court users", "Public viewers"], accent="#3eb7ff"),
                Box(958, 395, 220, 172, "Next.js App", ["Pages and dashboards", "Route handlers under app/api", "Form submission and navigation"], accent="#2f8df3"),
                Box(720, 182, 220, 172, "Node.js Services", ["Authentication and sessions", "Case workflow methods", "Audit and business rules"], accent="#63c46a"),
                Box(958, 182, 220, 172, "Data + Trust", ["TiDB / MySQL tables", "Hardhat contract anchor", "Fabric chaincode area"], accent="#e8b23d"),
            ],
            note="Requests start at the interface, move through API routes and server logic, then store operational data in SQL while anchoring proof on chain.",
        ),
        Slide(
            label="Presenter 1 - slide 4",
            title="Next.js - User Interface & API Layer",
            bullets=[
                "Handles user interface screens such as forms, dashboards, and role-based pages.",
                "Exposes API routes for login, case submission, and blockchain anchoring.",
                "Manages user interaction, form submission, and request routing to backend logic.",
                "This is the layer the panel sees first during the demo.",
            ],
            boxes=[
                Box(
                    720,
                    210,
                    460,
                    300,
                    "Code to present",
                    [
                        "buildCasePayload() -> app/police/new-case/page.tsx",
                        "POST() -> app/api/auth/login/route.ts",
                        "GET() and POST() -> app/api/cases/route.ts",
                        "POST() -> app/api/blockchain/anchor/route.ts",
                        "",
                        "Talk line: Next.js handles both the pages and the API routes that connect the interface to the backend.",
                    ],
                    accent="#2f8df3",
                    title_size=20,
                    body_size=16,
                ),
                Box(
                    720,
                    96,
                    460,
                    90,
                    "Important line to say",
                    [
                        "Next.js handles the interface, Node.js handles the logic, TiDB stores the full data, and blockchain provides proof of integrity."
                    ],
                    accent="#63c46a",
                    title_size=18,
                    body_size=15,
                ),
            ],
            note="Next.js handles both the user-facing pages and the route handlers that send work into the backend.",
        ),
        Slide(
            label="Presenter 1 - code focus",
            title="Next.js Code Snippets to Explain",
            bullets=[
                "Show short code, then explain what each function does in simple words.",
            ],
            boxes=[
                Box(
                    704,
                    360,
                    490,
                    192,
                    "Snippet 1: buildCasePayload()",
                    [
                        "const buildCasePayload = () => ({",
                        "  caseNumber: makeCaseNumber(),",
                        "  district: currentUser.station || \"UNKNOWN\",",
                        "  charge: allegedCrime || \"UNKNOWN\",",
                        "  description: modusOperandi || \"N/A\",",
                        "  policeSections: { sectionA: { openedByName: currentUser.name } },",
                        "})",
                    ],
                    accent="#2f8df3",
                    body_size=13,
                    body_font="F4",
                    body_color="#cfe5ff",
                ),
                Box(
                    704,
                    118,
                    490,
                    210,
                    "Snippet 2: API routes",
                    [
                        "export async function POST(req: NextRequest) {",
                        "  const parsed = await readJsonBody(req)",
                        "  ...",
                        "  res.cookies.set({ name: \"auth-token\", value: token })",
                        "}",
                        "",
                        "export async function GET(request: NextRequest) {",
                        "  const cases = await listCases()",
                        "  return NextResponse.json({ ok: true, cases })",
                        "}",
                    ],
                    accent="#5ab6ff",
                    body_size=13,
                    body_font="F4",
                    body_color="#cfe5ff",
                ),
            ],
            note="For User 1, focus on how form data is prepared, how login works, and how case routes connect the interface to backend services.",
        ),
        Slide(
            label="Presenter 2 - overview",
            title="Node.js - Server Logic & Workflow Control",
            bullets=[
                "lib/server/auth-session.ts rebuilds the signed-in user from the auth cookie to protect API routes.",
                "lib/server/cases.ts contains the core operations: listCases(), createAndSubmitCase(), checkpointPoliceCaseStep(), and status transitions.",
                "The backend writes to the database inside transactions, adds audit entries, and triggers blockchain anchoring during important actions.",
                "This layer enforces the workflow so every stage change has business meaning and a history trail.",
            ],
            boxes=[
                Box(730, 212, 438, 246, "What happens in createAndSubmitCase()", ["Generate a case id and case number", "Normalize the payload and set status", "Anchor the hash on blockchain", "Insert the case row and audit entry"], accent="#5ab6ff")
            ],
            note="Node.js is where the app becomes a controlled justice workflow rather than just a collection of screens.",
        ),
        Slide(
            label="Presenter 2 - code focus",
            title="Node.js Code Snippets to Explain",
            bullets=[
                "These are the main backend functions Kekeletso can present.",
            ],
            boxes=[
                Box(
                    704,
                    360,
                    490,
                    192,
                    "Snippet 1: session handling",
                    [
                        "const sessionUser = getSessionUserFromRequest(request)",
                        "if (!sessionUser) {",
                        "  return NextResponse.json({ ok: false, error: \"Unauthorized.\" }, { status: 401 })",
                        "}",
                        "",
                        "This protects backend routes by confirming who is making the request.",
                    ],
                    accent="#4db9ff",
                    body_size=13,
                    body_font="F4",
                    body_color="#cfe5ff",
                ),
                Box(
                    704,
                    118,
                    490,
                    210,
                    "Snippet 2: createAndSubmitCase()",
                    [
                        "const anchor = await anchorCaseOnChain({",
                        "  recordId: caseId,",
                        "  caseData: normalized,",
                        "  action: \"CASE_CREATED_SUBMITTED\",",
                        "})",
                        "await conn.query(`INSERT INTO cases ...`)",
                        "await conn.query(`INSERT INTO audit_entries ...`)",
                    ],
                    accent="#63c46a",
                    body_size=13,
                    body_font="F4",
                    body_color="#dff9e5",
                ),
            ],
            note="This slide proves that the backend does more than receive requests. It anchors, stores, and audits each important case action.",
        ),
        Slide(
            label="Presenter 3 - code focus",
            title="TiDB and Blockchain Code Snippets",
            bullets=[
                "Mohau can use this page to show both storage code and smart-contract proof.",
                "Strong line: the database stores the full business record, while blockchain stores proof of integrity and critical action history.",
            ],
            boxes=[
                Box(
                    704,
                    370,
                    490,
                    180,
                    "Snippet 1: getDbPool()",
                    [
                        "global.__mysqlPool = mysql.createPool({",
                        "  host: DB_HOST,",
                        "  port: Number(DB_PORT),",
                        "  user: DB_USER,",
                        "  database: DB_NAME,",
                        "  ssl,",
                        "})",
                    ],
                    accent="#61c978",
                    body_size=13,
                    body_font="F4",
                    body_color="#def8e5",
                ),
                Box(
                    704,
                    118,
                    490,
                    220,
                    "Snippet 2: CaseAnchor.sol",
                    [
                        "function anchor(string calldata recordId, bytes32 contentHash, string calldata action) external onlyWriter {",
                        "  if (latestHashForId[recordId] == contentHash) revert AlreadyAnchored();",
                        "  usedHash[contentHash] = true;",
                        "  latestHashForId[recordId] = contentHash;",
                        "  emit Anchored(recordId, contentHash, prev, msg.sender, block.timestamp, action);",
                        "}",
                    ],
                    accent="#e8b23d",
                    body_size=12,
                    body_font="F4",
                    body_color="#fff2cf",
                ),
            ],
            note="This makes the difference clear: the database stores the record, while the contract stores proof that the record state existed.",
        ),
        Slide(
            label="Presenter 4 - workflow",
            title="Case Workflow & Status Progression",
            bullets=[
                "The workflow begins with draft_police, moves to pending_investigation, and can continue through investigation, commissioner review, DPP stages, registry intake, and court stages.",
                "Commissioner clarification and high-court intake methods in lib/server/cases.ts show that the same record keeps evolving instead of being recreated.",
                "Every important transition updates both the stored payload and the audit history, with an anchor attached to the new state.",
                "This gives the system continuity, accountability, and an inspectable chain of actions.",
            ],
            boxes=[
                Box(742, 214, 410, 250, "Example statuses found in the code", ["draft_police", "pending_investigation", "commissioner_clarification", "approved / rejected", "submitted_to_dpp", "high_court_registry_intake", "closed"], accent="#5fc777")
            ],
            note="Bokang can use this slide to explain how the record moves from office to office while keeping one trusted history.",
        ),
        Slide(
            label="Presenter 4 - functions",
            title="Workflow Functions Bokang Should Present",
            bullets=[
                "These functions show how workflow steps are saved, locked, and moved forward.",
            ],
            boxes=[
                Box(
                    704,
                    358,
                    490,
                    196,
                    "Snippet 1: checkpointPoliceCaseStep()",
                    [
                        "const anchor = await anchorCaseOnChain({",
                        "  recordId: caseId,",
                        "  caseData: merged,",
                        "  action: \"POLICE_STEP_CHECKPOINT\",",
                        "})",
                        "await conn.query(`INSERT INTO audit_entries ...`)",
                    ],
                    accent="#2f8df3",
                    body_size=13,
                    body_font="F4",
                    body_color="#cfe5ff",
                ),
                Box(
                    704,
                    118,
                    490,
                    206,
                    "Snippet 2: finalizePoliceCaseSubmission()",
                    [
                        "const anchor = await anchorCaseOnChain({",
                        "  recordId: input.caseId,",
                        "  caseData: merged,",
                        "  action: \"CASE_SUBMITTED_TO_INVESTIGATION\",",
                        "})",
                        "UPDATE cases SET status = \"pending_investigation\" ...",
                    ],
                    accent="#63c46a",
                    body_size=13,
                    body_font="F4",
                    body_color="#def8e5",
                ),
            ],
            note="This is a strong presentation slide because it shows real workflow code, not only architecture theory.",
        ),
        Slide(
            label="Presenter 4 - structure",
            title="File Structure for Panel Questions",
            boxes=[
                Box(722, 404, 212, 152, "Frontend", ["app/page.tsx", "app/login/page.tsx", "app/police/new-case/page.tsx", "role dashboards"], accent="#2f8df3"),
                Box(948, 404, 212, 152, "Backend", ["app/api/cases/route.ts", "app/api/auth/login/route.ts", "lib/server/cases.ts", "lib/server/auth-session.ts"], accent="#59b6ff"),
                Box(722, 214, 212, 152, "Database", ["lib/db.ts", "lib/db/tidb.ts", "db/init.sql", "db/offchain.sql"], accent="#61c978"),
                Box(948, 214, 212, 152, "Blockchain", ["lib/blockchain/case-anchor.ts", "lib/blockchain.ts", "chain/contracts/CaseAnchor.sol", "fabric/chaincode/caseflow/src/contract.ts"], accent="#e1aa39"),
            ],
            bullets=[
                "This slide helps answer: where exactly is each part implemented in the repository?",
            ],
            note="If the panel asks for proof, open the file listed on this slide and match it to the presenter who explained it.",
        ),
        Slide(
            label="Security and deployment",
            title="Security, Traceability & Environment",
            bullets=[
                "The login route validates credentials, checks account activity, creates an auth-token cookie, and redirects users to role-specific dashboards.",
                "docker-compose.yml binds MySQL to 127.0.0.1 on the host, reducing accidental exposure outside the machine or Docker network.",
                "Checkpoint anchoring and audit entries make unauthorized changes easier to detect and investigate.",
                "Hardhat is used for local blockchain proof, while Fabric files in the repository show an extended enterprise blockchain direction.",
            ],
            note="This slide connects implementation decisions to security and deployment concerns that panels usually ask about.",
        ),
        Slide(
            label="Demo guide",
            title="Suggested Demo Walkthrough",
            bullets=[
                "Log in with a role account and show the role-based redirect from the login route.",
                "Open the police new-case form, explain the step lock/checkpoint behavior, then submit a case.",
                "Show that the case appears in list views and includes blockchain anchor details and audit history.",
                "If time allows, show a later-stage screen such as commissioner review or public tracking to prove the workflow continues beyond capture.",
            ],
            note="A short live demo should follow the same story as the slides: user action, server processing, database storage, then blockchain proof.",
        ),
        Slide(
            label="Final slide",
            title="Conclusion",
            bullets=[
                "The app is a hybrid justice platform: usable web screens, structured SQL storage, and blockchain-backed integrity checks.",
                "Its strength is not any one tool alone, but the way the layers support accountability together.",
                "The 4-user split is now clear: Lits'ito explains problem, objectives, architecture, and Next.js; Kekeletso explains backend logic; Mohau explains TiDB and blockchain; Bokang explains workflow, files, and demo.",
            ],
            emphasis="Final message: full case data stays in the database, while blockchain protects trust in that data over time.",
            note="Close by repeating the architecture in one line and linking it back to transparency, accountability, and tamper detection.",
        ),
    ]


def render_slide(slide: Slide, number: int):
    renderer = SlideRenderer()
    renderer.draw_main_panel(slide, number)
    return renderer.render()


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    slides = build_slides()
    contents = [render_slide(slide, index + 1) for index, slide in enumerate(slides)]
    pdf_data = PDFBuilder().build(contents)
    with open(OUTPUT_PATH, "wb") as handle:
        handle.write(pdf_data)
    print(os.path.abspath(OUTPUT_PATH))


if __name__ == "__main__":
    main()
