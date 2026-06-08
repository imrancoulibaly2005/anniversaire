"use client";

import { useState, useEffect, useRef } from "react";

const REEL_SYMBOLS = ["🍕", "🧀", "🍅", "🫒", "🧅", "🌶️", "🥓"];
const WIN_SYMBOL = "🍕";

const PIZZAS = [
  "Italia", "Délice Amour", "Océane", "Mexico", "Suprême",
  "Tartiflette", "5 Fromages", "Printanière", "Ibère Fort",
];

function useReel(spinning: boolean, finalSymbol: string, delay: number) {
  const [symbol, setSymbol] = useState("🍕");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (spinning) {
      let i = 0;
      intervalRef.current = setInterval(() => {
        setSymbol(REEL_SYMBOLS[i % REEL_SYMBOLS.length]);
        i++;
      }, 80);
      const stop = setTimeout(() => {
        clearInterval(intervalRef.current!);
        setSymbol(finalSymbol);
      }, delay);
      return () => {
        clearInterval(intervalRef.current!);
        clearTimeout(stop);
      };
    }
  }, [spinning, finalSymbol, delay]);

  return symbol;
}

export default function ConcoursPage() {
  const [step, setStep] = useState<"form" | "spinning" | "result">("form");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [won, setWon] = useState(false);
  const [winnersLeft, setWinnersLeft] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPizza] = useState(() => PIZZAS[Math.floor(Math.random() * PIZZAS.length)]);

  const [finals, setFinals] = useState(["🍕", "🍕", "🍕"]);

  const r1 = useReel(isSpinning, finals[0], 900);
  const r2 = useReel(isSpinning, finals[1], 1300);
  const r3 = useReel(isSpinning, finals[2], 1700);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes popIn { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
      @keyframes wiggle { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes confetti { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
      @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      @keyframes slideUp { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
    `;
    document.head.appendChild(style);
  }, []);

  const CONFETTI_COLORS = ["#ff6b35", "#ffd700", "#ff1744", "#00e676", "#2979ff", "#ff4081"];
  const confetti = won && step === "result"
    ? Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${(i * 5.2) % 100}%`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: `${(i * 0.15) % 2}s`,
        size: `${8 + (i % 6)}px`,
        duration: `${2.5 + (i % 3) * 0.5}s`,
      }))
    : [];

  async function handlePlay() {
    if (!name.trim()) { setError("Entre ton prénom pour jouer !"); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/concours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      const isWin = data.won;
      setWon(isWin);
      setWinnersLeft(9 - data.winnersCount);

      if (isWin) {
        setFinals([WIN_SYMBOL, WIN_SYMBOL, WIN_SYMBOL]);
      } else {
        const loseFinals = [
          REEL_SYMBOLS[Math.floor(Math.random() * (REEL_SYMBOLS.length - 1)) + 1],
          WIN_SYMBOL,
          REEL_SYMBOLS[Math.floor(Math.random() * (REEL_SYMBOLS.length - 1)) + 1],
        ];
        setFinals(loseFinals);
      }

      setStep("spinning");
      setIsSpinning(true);

      setTimeout(() => {
        setIsSpinning(false);
        setTimeout(() => setStep("result"), 400);
      }, 1700);
    } catch {
      setError("Une erreur s'est produite, réessaie !");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen relative overflow-x-hidden flex items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(160deg, #1a0a00 0%, #2d1200 40%, #1a0a00 100%)" }}
    >
      {/* Confetti gagnant */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute pointer-events-none rounded-sm"
          style={{
            left: c.left, top: "-10px",
            width: c.size, height: c.size,
            backgroundColor: c.color,
            animation: `confetti ${c.duration} ${c.delay} ease-in infinite`,
          }}
        />
      ))}

      {/* Décor flammes/braises */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${120 + i * 40}px`,
              height: `${120 + i * 40}px`,
              background: `radial-gradient(circle, #ff6b35, transparent)`,
              left: `${(i * 18) % 90}%`,
              top: `${(i * 22) % 80}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm">

        {/* FORMULAIRE */}
        {step === "form" && (
          <div
            className="rounded-3xl p-6 space-y-5"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,107,53,0.3)",
              boxShadow: "0 0 60px rgba(255,107,53,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
              animation: "slideUp 0.5s ease-out",
            }}
          >
            {/* Logo pizzeria */}
            <div className="text-center space-y-1">
              <div className="text-5xl" style={{ animation: "float 3s ease-in-out infinite" }}>🍕</div>
              <div
                className="text-xs uppercase tracking-[0.3em] font-bold"
                style={{ color: "#ff6b35" }}
              >
                Les Sentimentales
              </div>
              <h1
                className="text-2xl font-black leading-tight"
                style={{ color: "#fff", textShadow: "0 2px 20px rgba(255,107,53,0.5)" }}
              >
                Jeu Concours
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                9 pizzas à gagner !
              </p>
            </div>

            {/* Règle du jeu */}
            <div
              className="rounded-2xl px-4 py-3 text-center text-xs leading-relaxed"
              style={{
                background: "rgba(255,107,53,0.12)",
                border: "1px solid rgba(255,107,53,0.25)",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              🎰 Lance les rouleaux et tente de décrocher{" "}
              <span style={{ color: "#ffd700", fontWeight: "bold" }}>3 🍕</span> pour gagner
              une pizza de ton choix taille <strong style={{ color: "#ff6b35" }}>M</strong> !
            </div>

            {/* Champ nom */}
            <div className="space-y-1.5">
              <label
                className="block text-xs font-bold uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Ton prénom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePlay()}
                placeholder="Prénom..."
                className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "2px solid rgba(255,107,53,0.4)",
                  color: "#fff",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#ff6b35")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,107,53,0.4)")}
              />
              {error && (
                <p className="text-xs text-center px-3 py-1.5 rounded-xl"
                  style={{ color: "#ff6b35", background: "rgba(255,107,53,0.15)" }}>
                  {error}
                </p>
              )}
            </div>

            {/* Bouton jouer */}
            <button
              onClick={handlePlay}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-lg tracking-wide transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #ff6b35, #ff1744)",
                color: "#fff",
                boxShadow: "0 8px 30px rgba(255,107,53,0.5)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              {loading ? "⏳ Préparation..." : "🎰 Tenter ma chance !"}
            </button>

            <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              1 participation par personne
            </p>
          </div>
        )}

        {/* MACHINE À SOUS */}
        {(step === "spinning" || step === "result") && (
          <div
            className="rounded-3xl p-6 space-y-5 text-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,107,53,0.3)",
              boxShadow: "0 0 60px rgba(255,107,53,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
              animation: "slideUp 0.3s ease-out",
            }}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: "#ff6b35" }}>
                Les Sentimentales
              </p>
              <h2 className="text-xl font-black text-white mt-1">
                {step === "spinning" ? "🎰 Les rouleaux tournent..." : won ? "🎉 Résultat !" : "😔 Résultat"}
              </h2>
            </div>

            {/* Rouleaux */}
            <div
              className="flex gap-3 justify-center"
            >
              {[r1, r2, r3].map((sym, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width: "72px",
                    height: "72px",
                    background: isSpinning
                      ? "rgba(255,107,53,0.15)"
                      : step === "result" && won
                        ? "rgba(255,215,0,0.2)"
                        : "rgba(255,255,255,0.08)",
                    border: isSpinning
                      ? "2px solid rgba(255,107,53,0.4)"
                      : step === "result" && won
                        ? "2px solid #ffd700"
                        : "2px solid rgba(255,255,255,0.1)",
                    boxShadow: step === "result" && won
                      ? "0 0 20px rgba(255,215,0,0.4)"
                      : "none",
                    transition: "all 0.3s",
                    fontSize: "36px",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      animation: isSpinning
                        ? "wiggle 0.15s linear infinite"
                        : step === "result" && won
                          ? "float 2s ease-in-out infinite"
                          : "none",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  >
                    {sym}
                  </span>
                </div>
              ))}
            </div>

            {/* Résultat */}
            {step === "result" && (
              <div style={{ animation: "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
                {won ? (
                  <div className="space-y-3">
                    <div className="text-5xl">🏆</div>
                    <div>
                      <p className="font-black text-2xl" style={{ color: "#ffd700" }}>
                        FÉLICITATIONS !
                      </p>
                      <p className="font-bold text-white mt-1">
                        {name}, tu as gagné !
                      </p>
                    </div>
                    <div
                      className="rounded-2xl px-4 py-4 space-y-1"
                      style={{
                        background: "rgba(255,215,0,0.12)",
                        border: "1px solid rgba(255,215,0,0.4)",
                      }}
                    >
                      <p className="text-xs uppercase tracking-widest font-bold" style={{ color: "#ffd700" }}>
                        Ton lot
                      </p>
                      <p className="font-black text-white text-lg">
                        🍕 Pizza taille M
                      </p>
                      <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                        Au choix parmi Les Sentimentales
                      </p>
                      <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                        Présente ce message lors de ton passage à la soirée !
                      </p>
                    </div>
                    {winnersLeft !== null && winnersLeft > 0 && (
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Encore {winnersLeft} pizza{winnersLeft > 1 ? "s" : ""} à remporter !
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-5xl">🍅</div>
                    <div>
                      <p className="font-black text-xl text-white">Pas de chance !</p>
                      <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                        Dommage {name}, les rouleaux ne t&apos;ont pas souri cette fois.
                      </p>
                    </div>
                    <div
                      className="rounded-2xl px-4 py-3 text-sm"
                      style={{
                        background: "rgba(255,107,53,0.1)",
                        border: "1px solid rgba(255,107,53,0.2)",
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      Mais tu peux quand même te régaler à la soirée ! 🎉
                    </div>
                    {winnersLeft !== null && winnersLeft > 0 && (
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Il reste encore {winnersLeft} pizza{winnersLeft > 1 ? "s" : ""} à gagner !
                      </p>
                    )}
                    {winnersLeft === 0 && (
                      <p className="text-xs font-bold" style={{ color: "#ff6b35" }}>
                        Toutes les pizzas ont été remportées !
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Retour accueil */}
        <div className="text-center mt-4">
          <a
            href="/"
            className="text-xs transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            ← Retour à l&apos;invitation
          </a>
        </div>
      </div>
    </main>
  );
}
