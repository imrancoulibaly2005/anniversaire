import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquante");
  return neon(url);
}

async function ensureTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS rsvps (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      guest_names TEXT,
      coming BOOLEAN NOT NULL,
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { name, guests, guestNames, coming, message } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    await ensureTable();
    const sql = getDb();

    const guestCount = parseInt(guests) || 1;
    if (guestCount < 1 || guestCount > 3) {
      return NextResponse.json({ error: "Maximum 3 personnes" }, { status: 400 });
    }

    const cleanGuests = Array.isArray(guestNames)
      ? guestNames.filter((n: string) => typeof n === "string" && n.trim()).map((n: string) => n.trim())
      : [];

    await sql`
      INSERT INTO rsvps (name, guests, guest_names, coming, message)
      VALUES (
        ${name.trim()},
        ${guestCount},
        ${cleanGuests.length > 0 ? JSON.stringify(cleanGuests) : null},
        ${!!coming},
        ${message?.trim() || null}
      )
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const adminKey = req.nextUrl.searchParams.get("key");
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    await ensureTable();
    const sql = getDb();
    const rows = await sql`SELECT * FROM rsvps ORDER BY created_at DESC`;

    const rsvps = rows.map((r) => ({
      ...r,
      guest_names: r.guest_names ? JSON.parse(r.guest_names) : [],
    }));

    return NextResponse.json({ rsvps });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
