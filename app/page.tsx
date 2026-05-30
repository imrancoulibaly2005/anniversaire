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
  const [guests, setGuests] = useState(1);
  const [names, setNames] = useState<string[]>([""]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `@keyframes fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(105vh) rotate(360deg);opacity:0}}`;
    document.head.appendChild(style);
  }, []);

  function handleGuestCount(count: number) {
    setGuests(count);
    setNames((prev) => {
      const next = [...prev];
      while (next.length < count) next.push("");
      return next.slice(0, count);
    });
  }

  function updateName(i: number, val: string) {
    setNames((prev) => { const n = [...prev]; n[i] = val; return n; });
  }

  async function handleSubmit(coming: boolean) {
    if (!names[0]?.trim()) { setError("Merci d'indiquer ton prénom 🌸"); return; }
    if (!message?.trim()) { setError("Laisse un petit mot, ça fait plaisir 💕"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: names[0].trim(),
          guests,
          guestNames: names.slice(1).filter(n => n.trim()),
          message,
          coming,
        }),
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
      {/* Branche cerisier haut droite */}
      <svg className="absolute top-0 right-0 pointer-events-none" width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.18 }}>
        <path d="M320 0 C280 40, 240 60, 200 90 C170 115, 150 140, 120 160 C95 178, 70 185, 50 200" stroke="#7c3435" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M200 90 C220 70, 250 55, 270 30" stroke="#7c3435" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M200 90 C185 75, 195 55, 210 40" stroke="#7c3435" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M150 140 C130 125, 125 105, 140 85" stroke="#7c3435" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M120 160 C100 148, 90 130, 105 112" stroke="#7c3435" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M50 200 C35 188, 25 172, 38 155" stroke="#7c3435" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Fleurs */}
        {[
          [270,28],[252,48],[210,38],[195,55],[172,52],[148,83],[138,64],[118,110],[102,110],[98,130],[52,153],[38,153],[28,170],[200,88],[220,68]
        ].map(([cx,cy],i) => (
          <g key={i}>
            {[0,72,144,216,288].map((angle, j) => (
              <ellipse key={j} cx={cx + 7*Math.cos(angle*Math.PI/180)} cy={cy + 7*Math.sin(angle*Math.PI/180)} rx="5" ry="3.5" fill={i%2===0?"#f9a8d4":"#fbcfe8"} transform={`rotate(${angle}, ${cx + 7*Math.cos(angle*Math.PI/180)}, ${cy + 7*Math.sin(angle*Math.PI/180)})`}/>
            ))}
            <circle cx={cx} cy={cy} r="2.5" fill="#fbbf24"/>
          </g>
        ))}
      </svg>

      {/* Branche cerisier bas gauche */}
      <svg className="absolute bottom-0 left-0 pointer-events-none" width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.18, transform: "rotate(180deg)" }}>
        <path d="M280 280 C240 240, 200 220, 160 190 C130 168, 110 145, 80 125 C55 108, 30 100, 10 80" stroke="#7c3435" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M160 190 C180 210, 210 225, 230 250" stroke="#7c3435" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M110 145 C90 160, 85 180, 100 200" stroke="#7c3435" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M80 125 C60 138, 50 158, 65 175" stroke="#7c3435" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {[
          [228,248],[210,228],[178,210],[158,188],[138,168],[112,143],[95,160],[88,178],[78,123],[58,136],[48,156],[12,82],[32,102]
        ].map(([cx,cy],i) => (
          <g key={i}>
            {[0,72,144,216,288].map((angle, j) => (
              <ellipse key={j} cx={cx + 7*Math.cos(angle*Math.PI/180)} cy={cy + 7*Math.sin(angle*Math.PI/180)} rx="5" ry="3.5" fill={i%2===0?"#fda4af":"#f9a8d4"} transform={`rotate(${angle}, ${cx + 7*Math.cos(angle*Math.PI/180)}, ${cy + 7*Math.sin(angle*Math.PI/180)})`}/>
            ))}
            <circle cx={cx} cy={cy} r="2.5" fill="#fbbf24"/>
          </g>
        ))}
      </svg>

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

      <div className="absolute top-8 right-8 w-48 h-48 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #f9a8d4, transparent)" }} />
      <div className="absolute bottom-8 left-8 w-36 h-36 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #fcd34d, transparent)" }} />

      <a
        href="/admin"
        className="fixed bottom-4 right-4 z-50 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        ⚙️
      </a>

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
                Tu es invité·e à
              </p>
              <h1 className="font-display text-2xl font-bold leading-tight" style={{ color: "#881337" }}>
                Un anniversaire{" "}
                <span className="italic" style={{ color: "#e11d48" }}>très spécial</span>
              </h1>
              <p className="font-display text-sm font-semibold leading-snug" style={{ color: "#be123c" }}>
                Fofana Tielema Marietou
                <br />
                <span className="font-normal italic text-xs" style={{ color: "#9f1239" }}>épse Coulibaly Schuber</span>
              </p>
              <div className="mx-auto h-px w-20" style={{ background: "linear-gradient(to right, transparent, #f9a8d4, transparent)" }} />
              <p className="text-gray-500 text-xs leading-relaxed">
                Ta présence nous ferait extrêmement plaisir.
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

              {/* Nombre de personnes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Nombre de personnes
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleGuestCount(n)}
                      className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: guests === n ? "linear-gradient(135deg, #f43f5e, #e11d48)" : "#fff",
                        color: guests === n ? "#fff" : "#9ca3af",
                        border: guests === n ? "2px solid transparent" : "2px solid #e5e7eb",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Un champ par personne */}
              {names.map((n, i) => (
                <div key={i}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    {i === 0 ? "Ton prénom & nom *" : `Personne ${i + 1}`}
                  </label>
                  <input
                    type="text"
                    value={n}
                    onChange={(e) => updateName(i, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-gray-700 text-sm outline-none transition-all"
                    style={{ background: "#fff", border: "2px solid #fecdd3" }}
                    onFocus={(e) => (e.target.style.borderColor = "#f43f5e")}
                    onBlur={(e) => (e.target.style.borderColor = "#fecdd3")}
                  />
                </div>
              ))}

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Un mot ✨ *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
                Merci <strong>{names[0]}</strong> ! Ta présence
                {guests === 2 ? " et celle de ton accompagnant" : guests === 3 ? " et celle de tes 2 accompagnants" : ""} est notée avec bonheur. 🌸
              </p>
            </div>
            <div className="rounded-xl p-3 text-xs text-center"
              style={{ background: "linear-gradient(135deg, #fff0f5, #fce7f3)", border: "1px solid #fecdd3" }}>
              <p className="text-gray-600">On a hâte de te retrouver pour ce moment inoubliable !</p>
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
                On est tristes de ne pas pouvoir t&apos;avoir parmi nous. Merci d&apos;avoir répondu. 💕
              </p>
            </div>
            <div className="rounded-xl p-3 text-xs"
              style={{ background: "linear-gradient(135deg, #fff0f5, #fce7f3)", border: "1px solid #fecdd3" }}>
              <p className="text-gray-600 text-center">Tu seras avec nous en pensée pour cette belle célébration.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
