"use client";

import { useState } from "react";

type Participant = {
  id: number;
  name: string;
  won: boolean;
  created_at: string;
};

export default function AdminConcoursPage() {
  const [key, setKey] = useState("");
  const [data, setData] = useState<{ participants: Participant[]; maxWinners: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/concours?key=${encodeURIComponent(key)}`);
      if (res.status === 401) { setError("Clé incorrecte"); return; }
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!confirm("Remettre le concours à zéro ? (irréversible)")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/concours", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey: key }),
      });
      if (!res.ok) throw new Error();
      setData(null);
    } catch {
      alert("Erreur lors de la remise à zéro");
    } finally {
      setResetting(false);
    }
  }

  const winners = data?.participants.filter((p) => p.won) ?? [];
  const losers = data?.participants.filter((p) => !p.won) ?? [];

  return (
    <main
      className="min-h-screen p-4"
      style={{ background: "linear-gradient(160deg, #1a0a00 0%, #2d1200 40%, #1a0a00 100%)" }}
    >
      <div className="max-w-lg mx-auto space-y-4">

        <div className="text-center pt-4">
          <div className="text-4xl mb-1">🍕</div>
          <h1 className="text-2xl font-black text-white">Admin Concours</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Les Sentimentales — 9 pizzas à gagner
          </p>
        </div>

        {!data && (
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,107,53,0.3)",
            }}
          >
            <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
              Clé d&apos;accès
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,107,53,0.4)", color: "#fff" }}
            />
            {error && <p className="text-sm" style={{ color: "#ff6b35" }}>{error}</p>}
            <button
              onClick={load}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #ff6b35, #ff1744)" }}
            >
              {loading ? "Chargement..." : "Accéder"}
            </button>
          </div>
        )}

        {data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Gagnants", value: winners.length, icon: "🏆", color: "#ffd700" },
                { label: "Participants", value: data.participants.length, icon: "🎰", color: "#ff6b35" },
                { label: "Places restantes", value: 9 - winners.length, icon: "🍕", color: "#00e676" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-3 text-center"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,107,53,0.2)" }}
                >
                  <div className="text-xl mb-0.5">{s.icon}</div>
                  <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Gagnants */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,215,0,0.3)" }}
            >
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,215,0,0.15)" }}>
                <h2 className="font-bold text-sm" style={{ color: "#ffd700" }}>🏆 Gagnants ({winners.length}/9)</h2>
              </div>
              {winners.length === 0 && (
                <div className="px-4 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Aucun gagnant pour l&apos;instant
                </div>
              )}
              {winners.map((p, i) => (
                <div
                  key={p.id}
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ borderBottom: i < winners.length - 1 ? "1px solid rgba(255,215,0,0.08)" : "none" }}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: "rgba(255,215,0,0.2)", color: "#ffd700" }}
                  >
                    {i + 1}
                  </span>
                  <span className="font-semibold text-sm text-white flex-1">{p.name}</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {new Date(p.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>

            {/* Autres participants */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,107,53,0.2)" }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,107,53,0.1)" }}>
                <h2 className="font-bold text-sm" style={{ color: "#ff6b35" }}>
                  😔 Non gagnants ({losers.length})
                </h2>
              </div>
              {losers.length === 0 && (
                <div className="px-4 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Aucun participant non-gagnant
                </div>
              )}
              {losers.map((p, i) => (
                <div
                  key={p.id}
                  className="px-4 py-2.5 flex items-center gap-3"
                  style={{ borderBottom: i < losers.length - 1 ? "1px solid rgba(255,107,53,0.08)" : "none" }}
                >
                  <span className="text-xs text-white flex-1">{p.name}</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {new Date(p.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setData(null); setKey(""); }}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Se déconnecter
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: "rgba(255,0,0,0.15)", color: "#ff6b35", border: "1px solid rgba(255,0,0,0.3)" }}
              >
                {resetting ? "..." : "🗑️ Remettre à zéro"}
              </button>
            </div>

            <a
              href="/admin"
              className="block text-center text-xs py-2"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              ← Retour admin RSVP
            </a>
          </>
        )}
      </div>
    </main>
  );
}
