"use client";

import { useState, useEffect } from "react";

const PETALS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${(i * 7.2) % 100}%`,
  delay: `${(i * 0.8) % 6}s`,
  duration: `${7 + (i % 4)}s`,
  color: i % 3 === 0 ? "#fda4af" : i % 3 === 1 ? "#fbcfe8" : "#fecdd3",
  size: `${7 + (i % 5)}px`,
}));

export default function Home() {
  const [step, setStep] = useState<"form" | "success" | "declined">("form");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", guests: "1", message: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `@keyframes fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(105vh) rotate(360deg);opacity:0}}`;
    document.head.appendChild(style);
  }, []);

  async function handleSubmit(coming: boolean) {
    if (!form.name.trim()) { setError("Merci d'indiquer votre prénom 🌸"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, coming }),
      });
      if (!res.ok) throw new Error();
      setStep(coming ? "success" : "declined");
    } catch {
      setError("Une erreur s'est produite, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-3"
      style={{ background: "linear-gradient(135deg, #fff0f5 0%, #fce7f3 40%, #fdf2f8 100%)" }}
    >
      {PETALS.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none rounded-tl-full rounded-br-full"
          style={{
            left: p.left, top: "-20px", width: p.size, height: p.size,
            backgroundColor: p.color,
            animation: `fall ${p.duration} ${p.delay} linear infinite`,
            opacity: 0.6,
          }}
        />
      ))}

      <div
        className="absolute top-8 right-8 w-48 h-48 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #f9a8d4, transparent)" }}
      />
      <div
        className="absolute bottom-8 left-8 w-36 h-36 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #fcd34d, transparent)" }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          boxShadow: "0 20px 50px rgba(244,63,94,0.14), 0 6px 20px rgba(0,0,0,0.05)",
          border: "1px solid rgba(255,255,255,0.9)",
          padding: "1.5rem 1.25rem",
        }}
      >
        {step === "form" && (
          <div className="space-y-3">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="text-3xl">🌸</div>
              <p className="text-xs uppercase tracking-[0.25em] font-bold" style={{ color: "#f43f5e" }}>
                Vous êtes invité·e à
              </p>
              <h1 className="font-display text-2xl font-bold leading-tight" style={{ color: "#881337" }}>
                Un anniversaire{" "}
                <span className="italic" style={{ color: "#e11d48" }}>très spécial</span>
              </h1>
              <div className="mx-auto h-px w-20" style={{ background: "linear-gradient(to right, transparent, #f9a8d4, transparent)" }} />
              <p className="text-gray-500 text-xs leading-relaxed">
                Votre présence nous ferait extrêmement plaisir.
              </p>
            </div>

            {/* Event details */}
            <div
              className="rounded-xl px-3 py-2 space-y-1.5 text-xs"
              style={{ background: "linear-gradient(135deg, #fff0f5, #fce7f3)", border: "1px solid #fecdd3" }}
            >
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span className="font-semibold text-gray-700">Samedi 6 juin 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span className="text-gray-600">Salle polyvalente de l&apos;Armée de l&apos;Air</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🕐</span>
                <span className="font-semibold text-gray-700">20h00</span>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Prénom & nom *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-gray-700 text-sm outline-none transition-all"
                  style={{ background: "#fff", border: "2px solid #fecdd3" }}
                  onFocus={(e) => (e.target.style.borderColor = "#f43f5e")}
                  onBlur={(e) => (e.target.style.borderColor = "#fecdd3")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Nombre de personnes
                </label>
                <select
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-gray-700 text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "#fff", border: "2px solid #fecdd3" }}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "personne" : "personnes"}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Un mot ✨ (optionnel)
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Un petit message..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl text-gray-700 text-sm outline-none resize-none transition-all"
                  style={{ background: "#fff", border: "2px solid #fecdd3" }}
                  onFocus={(e) => (e.target.style.borderColor = "#f43f5e")}
                  onBlur={(e) => (e.target.style.borderColor = "#fecdd3")}
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 text-center bg-red-50 rounded-xl px-3 py-2">{error}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow: "0 6px 20px rgba(244,63,94,0.35)" }}
              >
                {loading ? "..." : "🥂 Je serai là !"}
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
                style={{ background: "#fff", color: "#9ca3af", border: "2px solid #e5e7eb" }}
              >
                {loading ? "..." : "😔 Je ne peux pas"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-4 py-4">
            <div className="text-5xl animate-bounce">🎉</div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-1" style={{ color: "#881337" }}>Magnifique !</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Merci <strong>{form.name}</strong> ! Votre présence
                {parseInt(form.guests) > 1 ? ` et celle de vos ${parseInt(form.guests) - 1} accompagnant(s)` : ""} est notée avec bonheur. 🌸
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-xs text-center"
              style={{ background: "linear-gradient(135deg, #fff0f5, #fce7f3)", border: "1px solid #fecdd3" }}
            >
              <p className="text-gray-600">Nous avons hâte de vous retrouver pour ce moment inoubliable !</p>
            </div>
            <div className="text-2xl space-x-2">🌷✨🥂</div>
          </div>
        )}

        {step === "declined" && (
          <div className="text-center space-y-4 py-4">
            <div className="text-5xl">🌹</div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-1" style={{ color: "#881337" }}>C&apos;est noté</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Nous sommes tristes de ne pas pouvoir vous compter parmi nous. Merci d&apos;avoir répondu. 💕
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-xs"
              style={{ background: "linear-gradient(135deg, #fff0f5, #fce7f3)", border: "1px solid #fecdd3" }}
            >
              <p className="text-gray-600 text-center">Vous serez avec nous en pensée pour cette belle célébration.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
