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

type View = "dashboard" | "liste" | "messages";

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

  const withMessages = rsvps?.filter((r) => r.message?.trim()) ?? [];

  const allNames: string[] = coming
    .flatMap((r) => [r.name, ...(r.guest_names ?? [])])
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-zone, #print-zone * { visibility: visible !important; }
          #print-zone {
            position: fixed;
            inset: 0;
            background: white;
            font-family: Georgia, serif;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          /* Bandeau haut */
          #print-header {
            background: linear-gradient(135deg, #881337, #e11d48);
            color: white;
            padding: 28px 40px 20px;
            text-align: center;
          }
          #print-header .rose { font-size: 28px; margin-bottom: 6px; }
          #print-header h1 {
            font-size: 26px;
            font-style: italic;
            font-weight: bold;
            margin: 0 0 4px;
            letter-spacing: 1px;
          }
          #print-header .sub {
            font-size: 11px;
            opacity: 0.85;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-family: Arial, sans-serif;
            font-style: normal;
          }

          /* Infos event */
          #print-info {
            display: flex;
            justify-content: center;
            gap: 32px;
            padding: 14px 40px;
            background: #fff0f5;
            border-bottom: 2px solid #fecdd3;
            font-family: Arial, sans-serif;
          }
          #print-info span { font-size: 11px; color: #881337; font-weight: bold; }

          /* Corps */
          #print-body { padding: 24px 40px; flex: 1; }
          #print-body .list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
            padding-bottom: 8px;
            border-bottom: 2px solid #f43f5e;
          }
          #print-body .list-header h2 {
            font-size: 14px;
            color: #881337;
            font-family: Arial, sans-serif;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0;
          }
          #print-body .list-header .total {
            background: #e11d48;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 11px;
            font-weight: bold;
            padding: 3px 10px;
            border-radius: 20px;
          }
          #print-body ul {
            columns: 2;
            column-gap: 32px;
            list-style: none;
            padding: 0;
            margin: 0;
          }
          #print-body li {
            font-size: 12px;
            font-family: Arial, sans-serif;
            color: #374151;
            padding: 7px 4px;
            border-bottom: 1px solid #fce7f3;
            break-inside: avoid;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          #print-body li:nth-child(odd) { background: #fff8f9; }
          #print-body .num {
            background: #e11d48;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: bold;
            flex-shrink: 0;
          }

          /* Pied de page */
          #print-footer {
            text-align: center;
            padding: 12px 40px;
            background: #fff0f5;
            border-top: 1px solid #fecdd3;
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: #9ca3af;
          }
        }

        /* ===== IMPRESSION MESSAGES ===== */
        @media print {
          #print-messages-zone, #print-messages-zone * { visibility: visible !important; }

          #print-messages-zone {
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, #fff0f5 0%, #fce7f3 45%, #fdf2f8 100%);
            font-family: Georgia, serif;
            overflow: hidden;
          }

          /* Double cadre décoratif */
          #pm-frame-outer {
            position: absolute;
            inset: 18px;
            border: 1px solid rgba(244,63,94,0.25);
            border-radius: 4px;
            pointer-events: none;
          }
          #pm-frame-inner {
            position: absolute;
            inset: 24px;
            border: 2px solid rgba(244,63,94,0.18);
            border-radius: 2px;
            pointer-events: none;
          }

          /* Coins ornementaux */
          #pm-corner-tl, #pm-corner-tr, #pm-corner-bl, #pm-corner-br {
            position: absolute;
            width: 28px;
            height: 28px;
            pointer-events: none;
          }
          #pm-corner-tl { top: 14px; left: 14px;
            border-top: 3px solid #f43f5e; border-left: 3px solid #f43f5e; border-radius: 4px 0 0 0; }
          #pm-corner-tr { top: 14px; right: 14px;
            border-top: 3px solid #f43f5e; border-right: 3px solid #f43f5e; border-radius: 0 4px 0 0; }
          #pm-corner-bl { bottom: 14px; left: 14px;
            border-bottom: 3px solid #f43f5e; border-left: 3px solid #f43f5e; border-radius: 0 0 0 4px; }
          #pm-corner-br { bottom: 14px; right: 14px;
            border-bottom: 3px solid #f43f5e; border-right: 3px solid #f43f5e; border-radius: 0 0 4px 0; }

          /* Filigrane central */
          #pm-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-15deg);
            font-size: 96px;
            font-style: italic;
            color: rgba(244, 63, 94, 0.05);
            white-space: nowrap;
            pointer-events: none;
            font-family: Georgia, serif;
            letter-spacing: 8px;
            font-weight: bold;
          }

          /* Titre décoratif centré en haut — intégré comme ornement, pas comme header */
          #pm-title-deco {
            position: absolute;
            top: 36px;
            left: 0;
            right: 0;
            text-align: center;
            pointer-events: none;
          }
          #pm-title-deco .pm-title-text {
            font-size: 13px;
            font-style: italic;
            color: rgba(136, 19, 55, 0.45);
            letter-spacing: 4px;
            font-family: Georgia, serif;
          }
          #pm-title-deco .pm-title-line {
            display: inline-block;
            width: 40px;
            height: 1px;
            background: rgba(244,63,94,0.3);
            vertical-align: middle;
            margin: 0 10px;
          }

          /* Grille des cartes */
          #pm-body {
            position: absolute;
            top: 62px;
            bottom: 44px;
            left: 44px;
            right: 44px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
            align-content: start;
          }

          /* Carte message */
          .pm-card {
            background: rgba(255,255,255,0.82);
            border-radius: 16px;
            padding: 22px 20px 15px 22px;
            position: relative;
            break-inside: avoid;
            box-shadow:
              0 4px 24px rgba(244, 63, 94, 0.10),
              0 1px 4px rgba(0,0,0,0.04),
              inset 0 0 0 1px rgba(255,255,255,0.9);
          }

          /* Bande colorée haut de carte */
          .pm-card-accent {
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            border-radius: 16px 16px 0 0;
            background: linear-gradient(to right, #f43f5e, #fda4af, #f43f5e);
          }

          /* Grand guillemet */
          .pm-card::before {
            content: “””;
            font-size: 80px;
            color: rgba(253,164,175,0.35);
            position: absolute;
            top: -4px;
            left: 10px;
            font-family: Georgia, serif;
            line-height: 1;
          }

          /* Cœur déco bas droite */
          .pm-card::after {
            content: “♥”;
            font-size: 9px;
            color: rgba(244,63,94,0.3);
            position: absolute;
            bottom: 14px;
            right: 16px;
          }

          .pm-card .pm-msg {
            font-size: 11px;
            color: #4b5563;
            font-style: italic;
            line-height: 1.8;
            margin-top: 26px;
            padding-right: 4px;
          }

          .pm-card .pm-divider {
            margin: 11px 0 9px;
            height: 1px;
            background: linear-gradient(to right, #f43f5e, #fecdd3, transparent);
          }

          .pm-card .pm-name {
            font-size: 9.5px;
            font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: bold;
            color: #be123c;
            text-align: right;
            letter-spacing: 1px;
            text-transform: uppercase;
            padding-right: 18px;
          }
          .pm-card .pm-name::before { content: “— “; }
        }
      `}</style>

      <main
        className="min-h-screen p-4"
        style={{ background: "linear-gradient(135deg, #fff0f5, #fce7f3)" }}
      >
        <div className="max-w-lg mx-auto space-y-4">

          {/* Header */}
          <div className="text-center pt-3">
            <p className="text-xl mb-1">🌸</p>
            <h1 className="font-display text-2xl font-bold" style={{ color: "#881337" }}>
              Tableau de bord
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">Gestion des réponses RSVP</p>
          </div>

          {/* Auth */}
          {!rsvps && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid #fecdd3",
                boxShadow: "0 8px 30px rgba(244,63,94,0.1)",
              }}
            >
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
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
                {([
                  { id: "dashboard", label: `📊 Bord` },
                  { id: "liste",     label: `📋 Liste (${allNames.length})` },
                  { id: "messages",  label: `💌 Messages (${withMessages.length})` },
                ] as { id: View; label: string }[]).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: view === v.id ? "linear-gradient(135deg, #f43f5e, #e11d48)" : "rgba(255,255,255,0.8)",
                      color: view === v.id ? "#fff" : "#9ca3af",
                      border: view === v.id ? "2px solid transparent" : "2px solid #e5e7eb",
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {/* Dashboard */}
              {view === "dashboard" && (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Présents", value: coming.length, icon: "🥂", color: "#e11d48" },
                      { label: "Invités", value: totalGuests, icon: "👥", color: "#9333ea" },
                      { label: "Absents", value: notComing.length, icon: "😔", color: "#6b7280" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-2xl p-3 text-center"
                        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #fecdd3" }}
                      >
                        <div className="text-xl mb-0.5">{s.icon}</div>
                        <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
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

              {/* Liste alphabétique */}
              {view === "liste" && (
                <>
                  {/* Zone d'impression — cachée à l'écran, belle en PDF */}
                  <div id="print-zone" style={{ display: "none" }}>

                    {/* Branche haut droite */}
                    <svg style={{ position: "absolute", top: 0, right: 0, width: 280, height: 280, opacity: 0.15, pointerEvents: "none" }} viewBox="0 0 320 320" fill="none">
                      <path d="M320 0 C280 40, 240 60, 200 90 C170 115, 150 140, 120 160 C95 178, 70 185, 50 200" stroke="#7c3435" strokeWidth="5" strokeLinecap="round"/>
                      <path d="M200 90 C220 70, 250 55, 270 30" stroke="#7c3435" strokeWidth="3.5" strokeLinecap="round"/>
                      <path d="M200 90 C185 75, 195 55, 210 40" stroke="#7c3435" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M150 140 C130 125, 125 105, 140 85" stroke="#7c3435" strokeWidth="3" strokeLinecap="round"/>
                      <path d="M120 160 C100 148, 90 130, 105 112" stroke="#7c3435" strokeWidth="2.5" strokeLinecap="round"/>
                      {[[270,28],[252,48],[210,38],[195,55],[172,52],[148,83],[138,64],[118,110],[102,110],[200,88],[220,68]].map(([cx,cy],i) => (
                        <g key={i}>
                          {[0,72,144,216,288].map((angle,j) => (
                            <ellipse key={j} cx={cx+7*Math.cos(angle*Math.PI/180)} cy={cy+7*Math.sin(angle*Math.PI/180)} rx="5" ry="3.5" fill={i%2===0?"#f9a8d4":"#fbcfe8"} transform={`rotate(${angle},${cx+7*Math.cos(angle*Math.PI/180)},${cy+7*Math.sin(angle*Math.PI/180)})`}/>
                          ))}
                          <circle cx={cx} cy={cy} r="2.5" fill="#fbbf24"/>
                        </g>
                      ))}
                    </svg>

                    {/* Branche bas gauche */}
                    <svg style={{ position: "absolute", bottom: 0, left: 0, width: 250, height: 250, opacity: 0.15, pointerEvents: "none", transform: "rotate(180deg)" }} viewBox="0 0 280 280" fill="none">
                      <path d="M280 280 C240 240, 200 220, 160 190 C130 168, 110 145, 80 125 C55 108, 30 100, 10 80" stroke="#7c3435" strokeWidth="5" strokeLinecap="round"/>
                      <path d="M160 190 C180 210, 210 225, 230 250" stroke="#7c3435" strokeWidth="3.5" strokeLinecap="round"/>
                      <path d="M110 145 C90 160, 85 180, 100 200" stroke="#7c3435" strokeWidth="3" strokeLinecap="round"/>
                      <path d="M80 125 C60 138, 50 158, 65 175" stroke="#7c3435" strokeWidth="2.5" strokeLinecap="round"/>
                      {[[228,248],[210,228],[178,210],[158,188],[138,168],[112,143],[95,160],[88,178],[78,123],[58,136],[12,82]].map(([cx,cy],i) => (
                        <g key={i}>
                          {[0,72,144,216,288].map((angle,j) => (
                            <ellipse key={j} cx={cx+7*Math.cos(angle*Math.PI/180)} cy={cy+7*Math.sin(angle*Math.PI/180)} rx="5" ry="3.5" fill={i%2===0?"#fda4af":"#f9a8d4"} transform={`rotate(${angle},${cx+7*Math.cos(angle*Math.PI/180)},${cy+7*Math.sin(angle*Math.PI/180)})`}/>
                          ))}
                          <circle cx={cx} cy={cy} r="2.5" fill="#fbbf24"/>
                        </g>
                      ))}
                    </svg>

                    <div id="print-header">
                      <div className="rose">🌸</div>
                      <h1>Anniversaire — 50 Ans</h1>
                      <div className="sub">Liste officielle des présents</div>
                    </div>
                    <div id="print-info">
                      <span>📅 Samedi 6 juin 2026</span>
                      <span>📍 Salle polyvalente de l&apos;Armée de l&apos;Air</span>
                      <span>🕐 20h00</span>
                    </div>
                    <div id="print-body">
                      <div className="list-header">
                        <h2>Invités confirmés</h2>
                        <span className="total">{allNames.length} personnes</span>
                      </div>
                      <ul>
                        {allNames.map((name, i) => (
                          <li key={i}>
                            <span className="num">{i + 1}</span>
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div id="print-footer">
                      Généré le {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>

                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #fecdd3" }}
                  >
                    {/* Header liste */}
                    <div
                      className="px-4 py-3 flex items-center justify-between gap-2"
                      style={{ borderBottom: "1px solid #fce7f3" }}
                    >
                      <div className="min-w-0">
                        <h2 className="font-bold text-gray-700 text-sm">Liste alphabétique</h2>
                        <p className="text-xs text-gray-400">{allNames.length} personne{allNames.length > 1 ? "s" : ""}</p>
                      </div>
                      <button
                        onClick={() => {
                          const zone = document.getElementById("print-zone");
                          if (zone) zone.style.display = "block";
                          window.print();
                          setTimeout(() => { if (zone) zone.style.display = "none"; }, 500);
                        }}
                        className="shrink-0 text-xs font-bold px-3 py-2 rounded-xl text-white"
                        style={{ background: "linear-gradient(135deg, #9333ea, #7c3aed)" }}
                      >
                        ⬇ PDF
                      </button>
                    </div>

                    {allNames.length === 0 && <EmptyState text="Aucun présent pour l'instant" />}

                    {allNames.map((name, i) => (
                      <div
                        key={i}
                        className="px-4 py-3 flex items-center gap-3"
                        style={{ borderBottom: i < allNames.length - 1 ? "1px solid #fef2f2" : "none" }}
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
                </>
              )}

              {/* ===== VUE MESSAGES ===== */}
              {view === "messages" && (
                <>
                  {/* Zone impression messages — cachée à l'écran */}
                  <div id="print-messages-zone" style={{ display: "none" }}>

                    {/* Double cadre */}
                    <div id="pm-frame-outer" />
                    <div id="pm-frame-inner" />

                    {/* Coins ornementaux */}
                    <div id="pm-corner-tl" />
                    <div id="pm-corner-tr" />
                    <div id="pm-corner-bl" />
                    <div id="pm-corner-br" />

                    {/* Filigrane */}
                    <div id="pm-watermark">Mots d&apos;amour</div>

                    {/* Titre ornement — fine ligne + texte centré, pas un header */}
                    <div id="pm-title-deco">
                      <span className="pm-title-line" />
                      <span className="pm-title-text">Mots d&apos;amour</span>
                      <span className="pm-title-line" />
                    </div>

                    {/* Branche haut droite */}
                    <svg style={{ position: "absolute", top: 0, right: 0, width: 300, height: 300, opacity: 0.16, pointerEvents: "none" }} viewBox="0 0 320 320" fill="none">
                      <path d="M320 0 C280 40, 240 60, 200 90 C170 115, 150 140, 120 160 C95 178, 70 185, 50 200" stroke="#7c3435" strokeWidth="5" strokeLinecap="round"/>
                      <path d="M200 90 C220 70, 250 55, 270 30" stroke="#7c3435" strokeWidth="3.5" strokeLinecap="round"/>
                      <path d="M200 90 C185 75, 195 55, 210 40" stroke="#7c3435" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M150 140 C130 125, 125 105, 140 85" stroke="#7c3435" strokeWidth="3" strokeLinecap="round"/>
                      <path d="M120 160 C100 148, 90 130, 105 112" stroke="#7c3435" strokeWidth="2.5" strokeLinecap="round"/>
                      {[[270,28],[252,48],[210,38],[195,55],[172,52],[148,83],[138,64],[118,110],[102,110],[200,88],[220,68]].map(([cx,cy],i) => (
                        <g key={i}>
                          {[0,72,144,216,288].map((angle,j) => (
                            <ellipse key={j} cx={cx+7*Math.cos(angle*Math.PI/180)} cy={cy+7*Math.sin(angle*Math.PI/180)} rx="5" ry="3.5" fill={i%2===0?"#f9a8d4":"#fbcfe8"} transform={`rotate(${angle},${cx+7*Math.cos(angle*Math.PI/180)},${cy+7*Math.sin(angle*Math.PI/180)})`}/>
                          ))}
                          <circle cx={cx} cy={cy} r="2.5" fill="#fbbf24"/>
                        </g>
                      ))}
                    </svg>

                    {/* Branche bas gauche */}
                    <svg style={{ position: "absolute", bottom: 0, left: 0, width: 270, height: 270, opacity: 0.16, pointerEvents: "none", transform: "rotate(180deg)" }} viewBox="0 0 280 280" fill="none">
                      <path d="M280 280 C240 240, 200 220, 160 190 C130 168, 110 145, 80 125 C55 108, 30 100, 10 80" stroke="#7c3435" strokeWidth="5" strokeLinecap="round"/>
                      <path d="M160 190 C180 210, 210 225, 230 250" stroke="#7c3435" strokeWidth="3.5" strokeLinecap="round"/>
                      <path d="M110 145 C90 160, 85 180, 100 200" stroke="#7c3435" strokeWidth="3" strokeLinecap="round"/>
                      <path d="M80 125 C60 138, 50 158, 65 175" stroke="#7c3435" strokeWidth="2.5" strokeLinecap="round"/>
                      {[[228,248],[210,228],[178,210],[158,188],[138,168],[112,143],[88,178],[78,123],[58,136],[12,82]].map(([cx,cy],i) => (
                        <g key={i}>
                          {[0,72,144,216,288].map((angle,j) => (
                            <ellipse key={j} cx={cx+7*Math.cos(angle*Math.PI/180)} cy={cy+7*Math.sin(angle*Math.PI/180)} rx="5" ry="3.5" fill={i%2===0?"#fda4af":"#f9a8d4"} transform={`rotate(${angle},${cx+7*Math.cos(angle*Math.PI/180)},${cy+7*Math.sin(angle*Math.PI/180)})`}/>
                          ))}
                          <circle cx={cx} cy={cy} r="2.5" fill="#fbbf24"/>
                        </g>
                      ))}
                    </svg>

                    {/* Branche haut gauche (miroir) */}
                    <svg style={{ position: "absolute", top: 0, left: 0, width: 200, height: 200, opacity: 0.10, pointerEvents: "none", transform: "scaleX(-1)" }} viewBox="0 0 320 320" fill="none">
                      <path d="M320 0 C280 40, 240 60, 200 90 C170 115, 150 140, 120 160" stroke="#7c3435" strokeWidth="4" strokeLinecap="round"/>
                      <path d="M200 90 C220 70, 250 55, 270 30" stroke="#7c3435" strokeWidth="3" strokeLinecap="round"/>
                      {[[270,28],[252,48],[210,38],[195,55],[172,52],[200,88]].map(([cx,cy],i) => (
                        <g key={i}>
                          {[0,72,144,216,288].map((angle,j) => (
                            <ellipse key={j} cx={cx+7*Math.cos(angle*Math.PI/180)} cy={cy+7*Math.sin(angle*Math.PI/180)} rx="5" ry="3.5" fill={i%2===0?"#f9a8d4":"#fbcfe8"} transform={`rotate(${angle},${cx+7*Math.cos(angle*Math.PI/180)},${cy+7*Math.sin(angle*Math.PI/180)})`}/>
                          ))}
                          <circle cx={cx} cy={cy} r="2.5" fill="#fbbf24"/>
                        </g>
                      ))}
                    </svg>

                    {/* Cartes */}
                    <div id="pm-body">
                      {withMessages.map((r) => (
                        <div key={r.id} className="pm-card">
                          <div className="pm-card-accent" />
                          <div className="pm-msg">{r.message}</div>
                          <div className="pm-divider" />
                          <div className="pm-name">{r.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Affichage écran */}
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #fecdd3" }}
                  >
                    {/* Header */}
                    <div
                      className="px-4 py-4 flex items-center justify-between gap-2"
                      style={{ background: "linear-gradient(135deg, #fff0f5, #fce7f3)", borderBottom: "1px solid #fecdd3" }}
                    >
                      <div className="min-w-0">
                        <h2 className="font-bold text-sm flex items-center gap-1.5" style={{ color: "#881337" }}>
                          💌 Mots d&apos;amour
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {withMessages.length} message{withMessages.length > 1 ? "s" : ""} reçu{withMessages.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const zone = document.getElementById("print-messages-zone");
                          if (zone) zone.style.display = "block";
                          window.print();
                          setTimeout(() => { if (zone) zone.style.display = "none"; }, 500);
                        }}
                        className="shrink-0 text-xs font-bold px-3 py-2 rounded-xl text-white"
                        style={{ background: "linear-gradient(135deg, #9333ea, #7c3aed)" }}
                      >
                        ⬇ PDF
                      </button>
                    </div>

                    {withMessages.length === 0 && (
                      <div className="px-4 py-10 text-center">
                        <p className="text-3xl mb-2">💬</p>
                        <p className="text-gray-400 text-sm">Aucun message pour l&apos;instant</p>
                      </div>
                    )}

                    <div className="divide-y divide-rose-50">
                      {withMessages.map((r) => (
                        <div key={r.id} className="px-4 py-4">
                          <div className="flex items-start gap-3">
                            {/* Guillemet déco */}
                            <span
                              className="text-3xl leading-none shrink-0 mt-0.5 font-serif"
                              style={{ color: "#fda4af" }}
                            >
                              &ldquo;
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-gray-700 text-sm italic leading-relaxed">{r.message}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span
                                  className="text-xs font-bold"
                                  style={{ color: "#e11d48" }}
                                >
                                  — {r.name}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                </span>
                              </div>
                            </div>
                          </div>
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
    </>
  );
}

function Section({ title, count, color, children }: {
  title: string; count: number; color: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #fecdd3" }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #fce7f3" }}>
        <h2 className="font-bold text-gray-700 text-sm">{title}</h2>
        <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: color }}>
          {count}
        </span>
      </div>
      <div className="divide-y divide-rose-50">{children}</div>
    </div>
  );
}

function RsvpCard({ r }: { r: RSVP }) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
          {r.guest_names && r.guest_names.length > 0 && (
            <div className="mt-0.5 space-y-0.5">
              {r.guest_names.map((gn, i) => (
                <p key={i} className="text-xs text-gray-500 flex items-center gap-1">
                  <span style={{ color: "#f9a8d4" }}>+</span>{gn}
                </p>
              ))}
            </div>
          )}
          {r.message && (
            <p className="text-xs text-gray-400 mt-1 italic leading-relaxed">&ldquo;{r.message}&rdquo;</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: "#fce7f3", color: "#e11d48" }}>
            {r.guests} pers.
          </span>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="px-4 py-8 text-center text-gray-400 text-sm">{text}</div>;
}
