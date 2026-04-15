import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDbPool } from "@/lib/db";
import { toCanonicalRole } from "@/lib/roles";
import { getRoleRoute } from "@/lib/role-routes";
import { markSuccessfulLogin } from "@/lib/server/users";

type DbUserRow = {
  id: string | number;
  email: string;
  role: string | null;
  name?: string | null;
  fullname?: string | null;
  department?: string | null;
  station?: string | null;
  badge?: string | null;
  isActive?: number | boolean | null;
  passwordHash: string;
};

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

async function readJsonBody(req: NextRequest) {
  // Presentation note: this safely reads login input and prevents the route from crashing on empty or invalid JSON.
  try {
    const text = await req.text();
    if (!text || !text.trim()) {
      return { ok: false as const, reason: "empty" as const, data: null };
    }

    try {
      return { ok: true as const, reason: null, data: JSON.parse(text) };
    } catch {
      return { ok: false as const, reason: "invalid-json" as const, data: null };
    }
  } catch {
    return { ok: false as const, reason: "read-failed" as const, data: null };
  }
}

export async function POST(req: NextRequest) {
  // Presentation note: this login endpoint validates credentials, creates the session cookie, and returns the correct dashboard route for the user role.
  try {
    const parsed = await readJsonBody(req);

    if (!parsed.ok || !parsed.data) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.reason === "empty" ? "Empty request body." : "Invalid JSON body.",
        },
        { status: 400 }
      );
    }

    const email = String(parsed.data.email ?? "").trim().toLowerCase();
    const password = String(parsed.data.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const pool = await getDbPool();
    const [rows] = await pool.query(
      "SELECT id, email, role, name, fullname, department, station, badge, isActive, passwordHash FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    const user = Array.isArray(rows) && rows.length > 0 ? (rows[0] as DbUserRow) : null;

    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    if (user.isActive === 0 || user.isActive === false) {
      return NextResponse.json({ ok: false, error: "This account is inactive." }, { status: 403 });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash || "");
    if (!passwordOk) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    const canonicalRole = toCanonicalRole(user.role);

    const sessionUser = {
      id: user.id,
      email: user.email,
      role: canonicalRole,
      name: user.name ?? null,
      fullname: user.fullname ?? null,
      department: user.department ?? null,
      station: user.station ?? null,
      badge: user.badge ?? null,
    };

    const token = toBase64Url(JSON.stringify(sessionUser));
    const redirectTo = getRoleRoute(canonicalRole);

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || null;
    const userAgent = req.headers.get("user-agent");

    await markSuccessfulLogin({
      userId: String(user.id),
      email: user.email,
      displayName: user.fullname ?? user.name ?? user.email,
      ipAddress,
      userAgent,
    });

    const res = NextResponse.json({
      ok: true,
      user: sessionUser,
      redirectTo,
    });

    res.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("LOGIN_ERROR:", error);
    return NextResponse.json({ ok: false, error: "Server error during login." }, { status: 500 });
  }
}

