"use client";

import { useState } from "react";

type RSVP = {
  id: number;
  name: string;
  guests: number;
  guest_names: string[] | null;
  coming: boolean;
  message: string | null;
  created_at: string;
};

type View = "dashboard" | "liste";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [rsvps, setRsvps] = useState<RSVP[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("dashboard");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/rsvp?key=${encodeURIComponent(key)}`);
      if (res.status === 401) { setError("Clé incorrecte"); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRsvps(data.rsvps);
    } catch {
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  const coming = rsvps?.filter((r) => r.coming) ?? [];
  const notComing = rsvps?.filter((r) => !r.coming) ?? [];
  const totalGuests = coming.reduce((s, r) => s + r.guests, 0);

  // Liste alphabétique complète (invité principal + accompagnants)
  const allNames: string[] = coming
    .flatMap((r) => [r.name, ...(r.guest_names ?? [])])
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

  return (
    <main
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(135deg, #fff0f5, #fce7f3)" }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4">
          <p className="text-2xl mb-1">🌸</p>
          <h1 className="font-display text-3xl font-bold" style={{ color: "#881337" }}>
            Tableau de bord
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestion des réponses RSVP</p>
        </div>

        {/* Auth */}
        {!rsvps && (
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid #fecdd3",
              boxShadow: "0 8px 30px rgba(244,63,94,0.1)",
            }}
          >
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Clé d&apos;accès
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl text-gray-700 text-sm outline-none"
              style={{ background: "#fff", border: "2px solid #fecdd3" }}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={load}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}
            >
              {loading ? "Chargement..." : "Accéder"}
            </button>
          </div>
        )}

        {rsvps && (
          <>
            {/* Onglets */}
            <div className="flex gap-2">
              <button
                onClick={() => setView("dashboard")}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: view === "dashboard" ? "linear-gradient(135deg, #f43f5e, #e11d48)" : "rgba(255,255,255,0.8)",
                  color: view === "dashboard" ? "#fff" : "#9ca3af",
                  border: view === "dashboard" ? "2px solid transparent" : "2px solid #e5e7eb",
                }}
              >
                📊 Tableau de bord
              </button>
              <button
                onClick={() => setView("liste")}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: view === "liste" ? "linear-gradient(135deg, #f43f5e, #e11d48)" : "rgba(255,255,255,0.8)",
                  color: view === "liste" ? "#fff" : "#9ca3af",
                  border: view === "liste" ? "2px solid transparent" : "2px solid #e5e7eb",
                }}
              >
                📋 Liste ({allNames.length})
              </button>
            </div>

            {view === "dashboard" && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Présents", value: coming.length, icon: "🥂", color: "#e11d48" },
                    { label: "Invités", value: totalGuests, icon: "👥", color: "#9333ea" },
                    { label: "Absents", value: notComing.length, icon: "😔", color: "#6b7280" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl p-4 text-center"
                      style={{
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid #fecdd3",
                        boxShadow: "0 4px 12px rgba(244,63,94,0.08)",
                      }}
                    >
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>

                <Section title="🥂 Ils seront là" count={coming.length} color="#e11d48">
                  {coming.map((r) => <RsvpCard key={r.id} r={r} />)}
                  {coming.length === 0 && <EmptyState text="Aucune réponse positive pour l'instant" />}
                </Section>

                <Section title="😔 Absents" count={notComing.length} color="#6b7280">
                  {notComing.map((r) => <RsvpCard key={r.id} r={r} />)}
                  {notComing.length === 0 && <EmptyState text="Personne n'a décliné pour l'instant" />}
                </Section>
              </>
            )}

            {view === "liste" && (
              <>
                <style>{`
                  @media print {
                    body * { visibility: hidden !important; }
                    #print-list, #print-list * { visibility: visible !important; }
                    #print-list { position: fixed; inset: 0; padding: 32px; background: white; }
                  }
                `}</style>

                <div
                  id="print-list"
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid #fecdd3",
                    boxShadow: "0 4px 16px rgba(244,63,94,0.08)",
                  }}
                >
                  <div
                    className="px-5 py-3 flex items-center justify-between"
                    style={{ borderBottom: "1px solid #fce7f3" }}
                  >
                    <div>
                      <h2 className="font-bold text-gray-700">Liste alphabétique des présents</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Anniversaire · 6 juin 2026</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-full text-white"
                        style={{ background: "#e11d48" }}
                      >
                        {allNames.length}
                      </span>
                      <button
                        onClick={() => window.print()}
                        className="no-print text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-all"
                        style={{ background: "linear-gradient(135deg, #9333ea, #7c3aed)" }}
                      >
                        ⬇ PDF
                      </button>
                    </div>
                  </div>
                  {allNames.length === 0 && <EmptyState text="Aucun présent pour l'instant" />}
                  <div className="grid grid-cols-2">
                    {allNames.map((name, i) => (
                      <div
                        key={i}
                        className="px-5 py-3 flex items-center gap-3"
                        style={{ borderBottom: "1px solid #fef2f2", borderRight: i % 2 === 0 ? "1px solid #fef2f2" : "none" }}
                      >
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-gray-800 font-medium text-sm">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => { setRsvps(null); setKey(""); setView("dashboard"); }}
              className="w-full py-3 rounded-xl text-sm text-gray-500 font-medium"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid #e5e7eb" }}
            >
              Se déconnecter
            </button>
          </>
        )}
      </div>
    </main>
  );
}

function Section({
  title, count, color, children,
}: {
  title: string; count: number; color: string; children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.9)",
        border: "1px solid #fecdd3",
        boxShadow: "0 4px 16px rgba(244,63,94,0.08)",
      }}
    >
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid #fce7f3" }}
      >
        <h2 className="font-bold text-gray-700">{title}</h2>
        <span
          className="text-xs font-bold px-2 py-1 rounded-full text-white"
          style={{ background: color }}
        >
          {count}
        </span>
      </div>
      <div className="divide-y divide-rose-50">{children}</div>
    </div>
  );
}

function RsvpCard({ r }: { r: RSVP }) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-800">{r.name}</p>
          {r.guest_names && r.guest_names.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {r.guest_names.map((gn, i) => (
                <p key={i} className="text-xs text-gray-500 flex items-center gap-1">
                  <span style={{ color: "#f9a8d4" }}>+</span> {gn}
                </p>
              ))}
            </div>
          )}
          {r.message && (
            <p className="text-sm text-gray-500 mt-1 italic">&ldquo;{r.message}&rdquo;</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{ background: "#fce7f3", color: "#e11d48" }}
          >
            {r.guests} {r.guests === 1 ? "pers." : "pers."}
          </span>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(r.created_at).toLocaleDateString("fr-FR", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-5 py-8 text-center text-gray-400 text-sm">{text}</div>
  );
}
