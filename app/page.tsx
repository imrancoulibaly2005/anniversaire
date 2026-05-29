"use client";

import { useState, useEffect } from "react";

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 5.8) % 100}%`,
  delay: `${(i * 0.7) % 6}s`,
  duration: `${6 + (i % 5)}s`,
  color: i % 3 === 0 ? "#fda4af" : i % 3 === 1 ? "#fbcfe8" : "#fecdd3",
  size: `${8 + (i % 6)}px`,
}));

export default function Home() {
  const [step, setStep] = useState<"form" | "success" | "declined">("form");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", guests: "1", message: "", coming: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fall {
        0% { transform: translateY(-30px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(105vh) rotate(400deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  async function handleSubmit(coming: boolean) {
    if (!form.name.trim()) {
      setError("Merci d'indiquer votre prénom 🌸");
      return;
    }
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
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #fff0f5 0%, #fce7f3 30%, #fdf2f8 60%, #fff5f7 100%)",
      }}
    >
      {/* Petals */}
      {PETALS.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none rounded-tl-full rounded-br-full"
          style={{
            left: p.left,
            top: "-20px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `fall ${p.duration} ${p.delay} linear infinite`,
            opacity: 0.7,
          }}
        />
      ))}

      {/* Decorative circles */}
      <div
        className="absolute top-10 right-10 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #f9a8d4, transparent)" }}
      />
      <div
        className="absolute bottom-10 left-10 w-48 h-48 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #fcd34d, transparent)" }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-lg"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderRadius: "28px",
          boxShadow: "0 25px 60px rgba(244, 63, 94, 0.15), 0 8px 24px rgba(0,0,0,0.06)",
          border: "1px solid rgba(255,255,255,0.9)",
          padding: "2.5rem 2rem",
        }}
      >
        {step === "form" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="text-4xl mb-2">🌸</div>
              <p
                className="text-xs uppercase tracking-[0.3em] font-bold"
                style={{ color: "#f43f5e" }}
              >
                Vous êtes invité·e à
              </p>
              <h1
                className="font-display text-4xl font-bold leading-tight"
                style={{ color: "#881337" }}
              >
                Un anniversaire
                <br />
                <span className="italic" style={{ color: "#e11d48" }}>
                  très spécial
                </span>
              </h1>
              <div
                className="mx-auto h-px w-24 my-3"
                style={{ background: "linear-gradient(to right, transparent, #f9a8d4, transparent)" }}
              />
              <p className="text-gray-500 text-sm leading-relaxed">
                Nous célébrons ce moment précieux et votre présence nous
                ferait extrêmement plaisir.
              </p>
            </div>

            {/* Event details */}
            <div
              className="rounded-2xl p-4 space-y-2 text-sm"
              style={{ background: "linear-gradient(135deg, #fff0f5, #fce7f3)", border: "1px solid #fecdd3" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📅</span>
                <div>
                  <span className="font-semibold text-gray-700">Date — </span>
                  <span className="text-gray-600">Samedi 6 juin 2026</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <span className="font-semibold text-gray-700">Lieu — </span>
                  <span className="text-gray-600">à compléter par l'organisateur</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">🕐</span>
                <div>
                  <span className="font-semibold text-gray-700">Heure — </span>
                  <span className="text-gray-600">à compléter par l'organisateur</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Votre prénom & nom *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Marie Dupont"
                  className="w-full px-4 py-3 rounded-xl text-gray-700 text-sm outline-none transition-all"
                  style={{
                    background: "#fff",
                    border: "2px solid #fecdd3",
                    boxShadow: "0 2px 8px rgba(244,63,94,0.06)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f43f5e")}
                  onBlur={(e) => (e.target.style.borderColor = "#fecdd3")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Nombre de personnes
                </label>
                <select
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-gray-700 text-sm outline-none transition-all appearance-none cursor-pointer"
                  style={{
                    background: "#fff",
                    border: "2px solid #fecdd3",
                    boxShadow: "0 2px 8px rgba(244,63,94,0.06)",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "personne" : "personnes"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Un mot pour l'occasion ✨ (optionnel)
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Un petit message de votre part..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-gray-700 text-sm outline-none resize-none transition-all"
                  style={{
                    background: "#fff",
                    border: "2px solid #fecdd3",
                    boxShadow: "0 2px 8px rgba(244,63,94,0.06)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f43f5e")}
                  onBlur={(e) => (e.target.style.borderColor = "#fecdd3")}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center bg-red-50 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="flex-1 py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #f43f5e, #e11d48)",
                  boxShadow: "0 8px 24px rgba(244,63,94,0.35)",
                }}
              >
                {loading ? "..." : "🥂 Je serai là !"}
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
                style={{
                  background: "#fff",
                  color: "#9ca3af",
                  border: "2px solid #e5e7eb",
                }}
              >
                {loading ? "..." : "😔 Je ne peux pas"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-6 py-4">
            <div className="text-6xl animate-bounce">🎉</div>
            <div>
              <h2
                className="font-display text-3xl font-bold mb-2"
                style={{ color: "#881337" }}
              >
                Magnifique !
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Merci{form.name ? `, <strong>${form.name}</strong>` : ""} ! Votre présence{" "}
                {parseInt(form.guests) > 1 ? `et celle de vos ${parseInt(form.guests) - 1} accompagnant(s)` : ""} est notée avec bonheur. 🌸
              </p>
            </div>
            <div
              className="rounded-2xl p-4 text-sm text-center"
              style={{ background: "linear-gradient(135deg, #fff0f5, #fce7f3)", border: "1px solid #fecdd3" }}
            >
              <p className="text-gray-600">
                Nous avons hâte de vous retrouver pour partager ce moment inoubliable !
              </p>
            </div>
            <div className="text-3xl space-x-2">🌷✨🥂</div>
          </div>
        )}

        {step === "declined" && (
          <div className="text-center space-y-6 py-4">
            <div className="text-6xl">🌹</div>
            <div>
              <h2
                className="font-display text-3xl font-bold mb-2"
                style={{ color: "#881337" }}
              >
                C&apos;est noté
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Nous sommes tristes de ne pas pouvoir vous compter parmi nous, mais nous comprenons. Merci d&apos;avoir répondu. 💕
              </p>
            </div>
            <div
              className="rounded-2xl p-4 text-sm"
              style={{ background: "linear-gradient(135deg, #fff0f5, #fce7f3)", border: "1px solid #fecdd3" }}
            >
              <p className="text-gray-600 text-center">
                Vous serez avec nous en pensée pour cette belle célébration.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
