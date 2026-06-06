"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Users,
  Building2,
  Sparkles,
  TrendingUp,
  Shield,
  ArrowRight,
  Star,
  CheckCircle,
} from "lucide-react";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";


export default function Landing() {
  const router = useRouter();
  const { t } = useTranslation();

  const marqueeTags = [
    { key: "tag1", c: "tg-p" },
    { key: "tag2", c: "tg-b" },
    { key: "tag3", c: "tg-p" },
    { key: "tag4", c: "tg-b" },
    { key: "tag5", c: "tg-p" },
    { key: "tag6", c: "tg-b" },
    { key: "tag7", c: "tg-p" },
    { key: "tag8", c: "tg-b" },
    { key: "tag1", c: "tg-p" },
    { key: "tag2", c: "tg-b" },
    { key: "tag3", c: "tg-p" },
    { key: "tag4", c: "tg-b" },
    { key: "tag5", c: "tg-p" },
    { key: "tag6", c: "tg-b" },
    { key: "tag7", c: "tg-p" },
    { key: "tag8", c: "tg-b" },
  ];

  const creatorChecks = ["check1", "check2", "check3"];
  const companyChecks = ["check1", "check2", "check3"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .mc { font-family: 'Plus Jakarta Sans', sans-serif; color: #1F2937; overflow-x: hidden; min-height: 100vh; position: relative; background: linear-gradient(145deg, #f5f3ff 0%, #ede9fe 12%, #e0f2fe 35%, #f0f9ff 55%, #ede9fe 75%, #faf5ff 100%); }
        .bgc { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .blob { position: absolute; border-radius: 50%; pointer-events: none; }
        .bl1 { width:720px;height:720px; background:radial-gradient(circle,rgba(124,58,237,0.2) 0%,rgba(167,139,250,0.09) 45%,transparent 70%); filter:blur(90px); top:-220px;left:-190px; animation:bA 16s ease-in-out infinite; }
        .bl2 { width:600px;height:600px; background:radial-gradient(circle,rgba(56,189,248,0.18) 0%,rgba(14,165,233,0.07) 45%,transparent 70%); filter:blur(90px); top:40px;right:-170px; animation:bB 19s ease-in-out infinite; }
        .bl3 { width:480px;height:480px; background:radial-gradient(circle,rgba(109,40,217,0.15) 0%,rgba(124,58,237,0.06) 45%,transparent 70%); filter:blur(80px); top:44%;left:26%; animation:bA 13s 2s ease-in-out infinite reverse; }
        .bl4 { width:420px;height:420px; background:radial-gradient(circle,rgba(56,189,248,0.17) 0%,rgba(14,165,233,0.06) 45%,transparent 70%); filter:blur(80px); bottom:4%;right:12%; animation:bB 21s 1s ease-in-out infinite reverse; }
        .bl5 { width:340px;height:340px; background:radial-gradient(circle,rgba(167,139,250,0.17) 0%,transparent 70%); filter:blur(70px); bottom:19%;left:1%; animation:bA 15s 3s ease-in-out infinite; }
        .dot-grid { position:absolute;inset:0; background-image:radial-gradient(circle,rgba(124,58,237,0.1) 1.5px,transparent 1.5px); background-size:34px 34px; mask-image:linear-gradient(to bottom,transparent 0%,white 8%,white 92%,transparent 100%); }
        @keyframes bA { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-50px) scale(1.08)} 66%{transform:translate(-22px,32px) scale(0.93)} }
        @keyframes bB { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,32px) scale(1.1)} 66%{transform:translate(26px,-40px) scale(0.92)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fU { 0%,100%{transform:translateY(0) scale(1);opacity:.9} 50%{transform:translateY(-24px) scale(1.12);opacity:1} }
        @keyframes fS { 0%,100%{transform:translate(0,0) scale(1);opacity:.9} 50%{transform:translate(20px,-14px) scale(1.06);opacity:1} }
        @keyframes pls { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(3.4);opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes bdotA { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.6)} }
        @keyframes meshAnim { 0%{opacity:1;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.04) rotate(1deg)} 100%{opacity:1;transform:scale(1)} }

        /* ── Floating shapes animations ── */
        @keyframes floatBox { 0%,100%{transform:translateY(0) rotate(0deg);opacity:0.18} 50%{transform:translateY(-28px) rotate(12deg);opacity:0.32} }
        @keyframes floatBox2 { 0%,100%{transform:translateY(0) rotate(45deg);opacity:0.15} 50%{transform:translateY(-20px) rotate(70deg);opacity:0.28} }
        @keyframes spinSpiral { 0%{transform:rotate(0deg);opacity:0.22} 100%{transform:rotate(360deg);opacity:0.22} }
        @keyframes driftShape { 0%,100%{transform:translate(0,0) rotate(0deg);opacity:0.15} 33%{transform:translate(14px,-18px) rotate(30deg);opacity:0.25} 66%{transform:translate(-10px,12px) rotate(-15deg);opacity:0.2} }
        @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:0.13} 50%{transform:scale(1.18);opacity:0.24} }
        @keyframes floatTri { 0%,100%{transform:translateY(0) rotate(0deg);opacity:0.18} 50%{transform:translateY(-22px) rotate(180deg);opacity:0.3} }

        .hero-shapes { position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden; }
        .cta-shapes  { position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden; }

        .up { position:relative;z-index:1; }
        .mc-nav { position:sticky;top:0;z-index:200; display:flex;justify-content:space-between;align-items:center; padding:0 2.5rem;height:70px; background:rgba(245,243,255,0.88); backdrop-filter:blur(20px); border-bottom:1px solid rgba(124,58,237,0.12); }
        .mc-nav-logo-text { font-size:1.5rem;font-weight:800;background:linear-gradient(135deg,#7C3AED,#38BDF8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .mc-nav-btn { font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.875rem; color:#7C3AED;background:rgba(124,58,237,0.08); border:1.5px solid rgba(124,58,237,0.28);border-radius:12px; padding:0.5rem 1.3rem;cursor:pointer;transition:all 0.2s; }
        .mc-nav-btn:hover { background:rgba(124,58,237,0.15);border-color:#7C3AED;transform:translateY(-1px); }

        .mc-hero { position:relative;overflow:hidden; padding:7rem 2rem 0;text-align:center; background:linear-gradient(135deg,#1e1040 0%,#1a2060 40%,#0c3060 70%,#0f1f4a 100%); min-height:88vh;display:flex;flex-direction:column;align-items:center; }
        .hero-mesh { position:absolute;inset:0;z-index:0;pointer-events:none; background: radial-gradient(ellipse 55% 50% at 18% 40%,rgba(124,58,237,0.55) 0%,transparent 70%), radial-gradient(ellipse 45% 55% at 82% 30%,rgba(56,189,248,0.45) 0%,transparent 70%), radial-gradient(ellipse 38% 38% at 52% 85%,rgba(167,139,250,0.3) 0%,transparent 70%); animation:meshAnim 14s ease-in-out infinite alternate; }
        .hero-grid { position:absolute;inset:0;z-index:0;pointer-events:none; background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px); background-size:48px 48px; }
        .hero-cnt { position:relative;z-index:2;padding-bottom:3.5rem;width:100%;max-width:900px; }

        .mc-badge { display:inline-flex;align-items:center;gap:7px; background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.2);border-radius:100px; padding:6px 18px;font-size:0.78rem;font-weight:700;color:rgba(255,255,255,0.85); letter-spacing:0.08em;text-transform:uppercase;margin-bottom:2rem; animation:fadeUp 0.7s ease both; }
        .bdot { width:7px;height:7px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#38BDF8);animation:bdotA 2s ease-in-out infinite; }
        .mc-h1 { font-weight:800;font-size:clamp(2.8rem,6vw,5rem);line-height:1.07;letter-spacing:-0.04em;color:#fff;margin-bottom:1.4rem;animation:fadeUp 0.7s 0.1s ease both; }
        .h1g { background:linear-gradient(130deg,#7C3AED 0%,#38BDF8 55%,#6D28D9 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .mc-sub { font-size:clamp(1rem,2vw,1.18rem);color:rgba(255,255,255,0.65);max-width:580px;margin:0 auto 2.8rem;line-height:1.75;animation:fadeUp 0.7s 0.2s ease both; }
        .mc-btns { display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;animation:fadeUp 0.7s 0.3s ease both; }

        .btn-p { font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.95rem;display:inline-flex;align-items:center;gap:8px;padding:0.88rem 1.8rem;border-radius:14px;border:none;cursor:pointer;background:linear-gradient(135deg,#7C3AED,#6D28D9);color:white;box-shadow:0 8px 28px rgba(124,58,237,0.38),inset 0 1px 0 rgba(255,255,255,0.15);transition:all 0.22s; }
        .btn-p:hover { transform:translateY(-2px);box-shadow:0 14px 40px rgba(124,58,237,0.5); }
        .btn-b { font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.95rem;display:inline-flex;align-items:center;gap:8px;padding:0.88rem 1.8rem;border-radius:14px;border:none;cursor:pointer;background:linear-gradient(135deg,#38BDF8,#0EA5E9);color:white;box-shadow:0 8px 28px rgba(56,189,248,0.38),inset 0 1px 0 rgba(255,255,255,0.15);transition:all 0.22s; }
        .btn-b:hover { transform:translateY(-2px);box-shadow:0 14px 40px rgba(56,189,248,0.5); }

        .mc-marquee { overflow:hidden;padding:1.25rem 0;mask-image:linear-gradient(to right,transparent,black 8%,black 92%,transparent); }
        .mc-mtrack { display:flex;gap:1rem;animation:marquee 26s linear infinite;width:max-content; }
        .mc-mtag { display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:100px;font-size:0.82rem;font-weight:600;white-space:nowrap;background:rgba(255,255,255,0.75);backdrop-filter:blur(8px);box-shadow:0 2px 12px rgba(0,0,0,0.06); }
        .tg-p { border:1.5px solid rgba(124,58,237,0.2);color:#6D28D9; }
        .tg-b { border:1.5px solid rgba(56,189,248,0.25);color:#0369A1; }

        .mc-feat { max-width:1100px;margin:0 auto;padding:5rem 2rem; }
        .sec-lbl { font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7C3AED;margin-bottom:0.6rem;display:flex;align-items:center;gap:8px; }
        .sec-lbl::before { content:'';width:26px;height:2px;background:linear-gradient(90deg,#7C3AED,#38BDF8);border-radius:2px; }
        .sec-h2 { font-weight:800;font-size:clamp(1.9rem,3.5vw,2.8rem);letter-spacing:-0.03em;color:#1F2937;margin-bottom:0.75rem;line-height:1.15; }
        .sec-sub { font-size:1rem;color:#6B7280;line-height:1.7;max-width:440px;margin-bottom:3.5rem; }
        .feat-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem; }
        .feat-card { background:rgba(255,255,255,0.72);backdrop-filter:blur(14px);border-radius:22px;padding:2rem 2rem 2.25rem;border:1.5px solid rgba(255,255,255,0.9);position:relative;overflow:hidden;transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 4px 20px rgba(0,0,0,0.05); }
        .feat-card::after { content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:22px 22px 0 0; }
        .fc-ai::after { background:linear-gradient(90deg,#7C3AED,#A78BFA); }
        .fc-gr::after { background:linear-gradient(90deg,#38BDF8,#0EA5E9); }
        .fc-sf::after { background:linear-gradient(90deg,#6D28D9,#7C3AED); }
        .feat-card:hover { transform:translateY(-7px) scale(1.01);box-shadow:0 24px 50px rgba(0,0,0,0.1); }
        .feat-num { position:absolute;top:1.5rem;right:1.75rem;font-size:4.5rem;font-weight:900;line-height:1;letter-spacing:-0.05em;opacity:0.04;color:#1F2937; }
        .feat-ico { width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:1.25rem; }
        .fi-a { background:linear-gradient(135deg,rgba(124,58,237,0.13),rgba(167,139,250,0.07)); }
        .fi-b { background:linear-gradient(135deg,rgba(56,189,248,0.15),rgba(14,165,233,0.07)); }
        .fi-c { background:linear-gradient(135deg,rgba(109,40,217,0.13),rgba(124,58,237,0.07)); }
        .feat-title { font-weight:700;font-size:1.12rem;color:#1F2937;margin-bottom:0.6rem; }
        .feat-desc { font-size:0.91rem;color:#6B7280;line-height:1.65; }

        .mc-split { display:grid;grid-template-columns:1fr 1fr; }
        @media(max-width:768px){ .mc-split{grid-template-columns:1fr;} }
        .sh { padding:5rem 3.5rem;position:relative;overflow:hidden;min-height:480px;display:flex;flex-direction:column;justify-content:center; }
        .sh-c { background:linear-gradient(145deg,#f5f3ff 0%,#ede9fe 40%,#ddd6fe 100%); border-right:1px solid rgba(124,58,237,0.1); }
        .sh-e { background:linear-gradient(145deg,#f0f9ff 0%,#e0f2fe 40%,#bae6fd 100%); }
        .sh-blob { position:absolute;border-radius:50%;filter:blur(55px);pointer-events:none; }
        .shb-c { width:270px;height:270px;background:radial-gradient(circle,rgba(124,58,237,0.22),transparent 70%);bottom:-55px;right:-45px;animation:bA 9s ease-in-out infinite; }
        .shb-e { width:270px;height:270px;background:radial-gradient(circle,rgba(56,189,248,0.22),transparent 70%);bottom:-55px;left:-45px;animation:bB 11s ease-in-out infinite; }
        .sh-inner { position:relative;z-index:2; }
        .sh-chip { display:inline-flex;align-items:center;gap:6px;border-radius:100px;padding:5px 14px;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1.25rem; }
        .chip-c { background:rgba(124,58,237,0.1);color:#6D28D9;border:1px solid rgba(124,58,237,0.2); }
        .chip-e { background:rgba(56,189,248,0.12);color:#0369A1;border:1px solid rgba(56,189,248,0.22); }
        .sh-h3 { font-weight:800;font-size:clamp(1.6rem,2.8vw,2.1rem);color:#1F2937;letter-spacing:-0.03em;line-height:1.15;margin-bottom:1rem; }
        .sh-p { font-size:0.95rem;color:#4B5563;line-height:1.7;margin-bottom:1.75rem;max-width:340px; }
        .sh-checks { margin-bottom:2rem;display:flex;flex-direction:column;gap:0.65rem; }
        .sh-check { display:flex;align-items:center;gap:10px;font-size:0.9rem;color:#374151;font-weight:500; }
        .btn-shc { display:inline-flex;align-items:center;gap:8px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.95rem;padding:0.82rem 1.6rem;border-radius:14px;border:none;cursor:pointer;background:linear-gradient(135deg,#7C3AED,#6D28D9);color:white;box-shadow:0 8px 24px rgba(124,58,237,0.35);transition:all 0.22s; }
        .btn-shc:hover { transform:translateY(-2px);box-shadow:0 14px 32px rgba(124,58,237,0.48); }
        .btn-she { display:inline-flex;align-items:center;gap:8px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.95rem;padding:0.82rem 1.6rem;border-radius:14px;border:none;cursor:pointer;background:linear-gradient(135deg,#38BDF8,#0EA5E9);color:white;box-shadow:0 8px 24px rgba(56,189,248,0.35);transition:all 0.22s; }
        .btn-she:hover { transform:translateY(-2px);box-shadow:0 14px 32px rgba(56,189,248,0.48); }

        .mc-cta { position:relative;overflow:hidden;background:linear-gradient(135deg,#ede9fe 0%,#ddd6fe 25%,#bae6fd 65%,#e0f2fe 100%);padding:6rem 2rem;text-align:center;border-top:1px solid rgba(124,58,237,0.1); }
        .cta-inner { position:relative;z-index:1;max-width:700px;margin:0 auto; }
        .cta-badge { display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.65);border:1.5px solid rgba(124,58,237,0.25);border-radius:100px;padding:6px 16px;font-size:0.75rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#7C3AED;margin-bottom:1.5rem;backdrop-filter:blur(8px); }
        .cta-h2 { font-weight:800;font-size:clamp(2rem,4vw,3.2rem);letter-spacing:-0.035em;line-height:1.1;color:#1F2937;margin-bottom:1rem; }
        .cta-sub { font-size:1.05rem;color:#4B5563;line-height:1.7;margin-bottom:2.5rem;max-width:480px;margin-left:auto;margin-right:auto; }
        .cta-btns { display:flex;flex-wrap:wrap;gap:1rem;justify-content:center; }
        .btn-cc { display:inline-flex;align-items:center;gap:8px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.95rem;padding:0.88rem 1.8rem;border-radius:14px;cursor:pointer;background:rgba(255,255,255,0.75);border:2px solid rgba(124,58,237,0.4);color:#7C3AED;transition:all 0.22s;backdrop-filter:blur(8px); }
        .btn-cc:hover { background:rgba(124,58,237,0.1);border-color:#7C3AED;transform:translateY(-2px); }
        .btn-ce { display:inline-flex;align-items:center;gap:8px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.95rem;padding:0.88rem 1.8rem;border-radius:14px;cursor:pointer;background:rgba(255,255,255,0.75);border:2px solid rgba(56,189,248,0.45);color:#0369A1;transition:all 0.22s;backdrop-filter:blur(8px); }
        .btn-ce:hover { background:rgba(56,189,248,0.1);border-color:#38BDF8;transform:translateY(-2px); }

        .mc-footer { background:rgba(255,255,255,0.65);backdrop-filter:blur(14px);padding:2.5rem 2rem;text-align:center;border-top:1px solid rgba(124,58,237,0.1); }
        .mc-footer-logo { font-size:1.2rem;font-weight:800;background:linear-gradient(135deg,#7C3AED,#38BDF8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.75rem; }
        .mc-footer p { font-size:0.82rem;color:#9CA3AF; }

        @media(max-width:640px) {
          .mc-hero{padding:4rem 1.25rem 3rem;}
          .mc-feat{padding:3.5rem 1.25rem;}
          .sh{padding:3rem 1.5rem;}
          .mc-cta{padding:4rem 1.25rem;}
        }
      `}</style>

      <div className="bgc">
        <div className="blob bl1" />
        <div className="blob bl2" />
        <div className="blob bl3" />
        <div className="blob bl4" />
        <div className="blob bl5" />
        <div className="dot-grid" />
      </div>

      <div className="mc">
        {/* NAV */}
        <header className="mc-nav up">
          <img src="/logoma.png" alt="MatchCreator" style={{height: '42px', width: 'auto'}} />
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <LanguageSwitcher />
            <button className="mc-nav-btn" onClick={() => router.push("/login")}>
              {t("common.login")}
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="mc-hero up">
          <div className="hero-mesh" />
          <div className="hero-grid" />

          {/* Floating animated shapes — hero */}
          <div className="hero-shapes">
            {/* Small squares */}
            <svg style={{position:'absolute',top:'12%',left:'8%',animation:'floatBox 7s ease-in-out infinite'}} width="22" height="22" viewBox="0 0 22 22"><rect x="2" y="2" width="18" height="18" rx="3" fill="none" stroke="#A78BFA" strokeWidth="2"/></svg>
            <svg style={{position:'absolute',top:'22%',left:'18%',animation:'floatBox 9s 1.5s ease-in-out infinite'}} width="14" height="14" viewBox="0 0 14 14"><rect x="1" y="1" width="12" height="12" rx="2" fill="rgba(124,58,237,0.25)"/></svg>
            <svg style={{position:'absolute',top:'55%',left:'5%',animation:'floatBox2 8s 0.5s ease-in-out infinite'}} width="18" height="18" viewBox="0 0 18 18"><rect x="1" y="1" width="16" height="16" rx="2" fill="none" stroke="#38BDF8" strokeWidth="1.8"/></svg>
            <svg style={{position:'absolute',top:'70%',left:'14%',animation:'floatBox 11s 2s ease-in-out infinite'}} width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" rx="1" fill="rgba(56,189,248,0.3)"/></svg>
            <svg style={{position:'absolute',top:'38%',left:'10%',animation:'floatBox2 10s 3.5s ease-in-out infinite'}} width="26" height="26" viewBox="0 0 26 26"><rect x="2" y="2" width="22" height="22" rx="4" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="4 3"/></svg>
            <svg style={{position:'absolute',top:'15%',right:'10%',animation:'floatBox2 8.5s 0.8s ease-in-out infinite'}} width="20" height="20" viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" rx="3" fill="none" stroke="#A78BFA" strokeWidth="1.8"/></svg>
            <svg style={{position:'absolute',top:'40%',right:'7%',animation:'floatBox 10s 3s ease-in-out infinite'}} width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" rx="2" fill="rgba(124,58,237,0.2)"/></svg>
            <svg style={{position:'absolute',top:'65%',right:'15%',animation:'floatBox2 7.5s 1s ease-in-out infinite'}} width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="#38BDF8" strokeWidth="1.8"/></svg>
            <svg style={{position:'absolute',top:'80%',right:'5%',animation:'floatBox 9.5s 2.5s ease-in-out infinite'}} width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" rx="1" fill="rgba(56,189,248,0.25)"/></svg>
            <svg style={{position:'absolute',top:'28%',right:'22%',animation:'floatBox2 12s 4s ease-in-out infinite'}} width="28" height="28" viewBox="0 0 28 28"><rect x="2" y="2" width="24" height="24" rx="4" fill="none" stroke="#38BDF8" strokeWidth="1.4" strokeDasharray="5 3"/></svg>

            {/* Spirals */}
            <svg style={{position:'absolute',top:'8%',left:'32%',animation:'spinSpiral 12s linear infinite'}} width="42" height="42" viewBox="0 0 42 42"><path d="M21 21 m-8,0 a8,8 0 1,1 16,0 a12,12 0 1,1 -24,0 a16,16 0 1,1 32,0" fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <svg style={{position:'absolute',bottom:'18%',left:'28%',animation:'spinSpiral 16s 2s linear infinite reverse'}} width="34" height="34" viewBox="0 0 34 34"><path d="M17 17 m-6,0 a6,6 0 1,1 12,0 a10,10 0 1,1 -20,0 a14,14 0 1,1 28,0" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <svg style={{position:'absolute',top:'45%',right:'25%',animation:'spinSpiral 10s 1s linear infinite'}} width="38" height="38" viewBox="0 0 38 38"><path d="M19 19 m-7,0 a7,7 0 1,1 14,0 a11,11 0 1,1 -22,0 a15,15 0 1,1 30,0" fill="none" stroke="#7C3AED" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <svg style={{position:'absolute',top:'72%',right:'38%',animation:'spinSpiral 18s 3s linear infinite reverse'}} width="28" height="28" viewBox="0 0 28 28"><path d="M14 14 m-5,0 a5,5 0 1,1 10,0 a9,9 0 1,1 -18,0" fill="none" stroke="#A78BFA" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <svg style={{position:'absolute',top:'20%',left:'48%',animation:'spinSpiral 14s 0.5s linear infinite'}} width="22" height="22" viewBox="0 0 22 22"><path d="M11 11 m-4,0 a4,4 0 1,1 8,0 a7,7 0 1,1 -14,0" fill="none" stroke="#38BDF8" strokeWidth="1.3" strokeLinecap="round"/></svg>

            {/* Triangles */}
            <svg style={{position:'absolute',top:'30%',left:'3%',animation:'floatTri 9s ease-in-out infinite'}} width="20" height="18" viewBox="0 0 20 18"><polygon points="10,1 19,17 1,17" fill="none" stroke="#A78BFA" strokeWidth="1.8"/></svg>
            <svg style={{position:'absolute',top:'50%',right:'3%',animation:'floatTri 11s 1.5s ease-in-out infinite'}} width="16" height="14" viewBox="0 0 16 14"><polygon points="8,1 15,13 1,13" fill="rgba(56,189,248,0.2)" stroke="#38BDF8" strokeWidth="1.5"/></svg>
            <svg style={{position:'absolute',top:'85%',left:'42%',animation:'floatTri 8s 2.5s ease-in-out infinite'}} width="14" height="12" viewBox="0 0 14 12"><polygon points="7,1 13,11 1,11" fill="none" stroke="#7C3AED" strokeWidth="1.6"/></svg>
            <svg style={{position:'absolute',top:'15%',left:'58%',animation:'floatTri 13s 1s ease-in-out infinite'}} width="18" height="16" viewBox="0 0 18 16"><polygon points="9,1 17,15 1,15" fill="rgba(124,58,237,0.15)" stroke="#A78BFA" strokeWidth="1.4"/></svg>

            {/* Dashed rings / circles */}
            <svg style={{position:'absolute',top:'25%',left:'45%',animation:'pulseRing 6s ease-in-out infinite'}} width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="19" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="4 6"/></svg>
            <svg style={{position:'absolute',bottom:'10%',right:'32%',animation:'pulseRing 8s 2s ease-in-out infinite'}} width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="14" fill="none" stroke="#38BDF8" strokeWidth="1.4" strokeDasharray="3 5"/></svg>
            <svg style={{position:'absolute',top:'60%',left:'40%',animation:'pulseRing 7s 1s ease-in-out infinite'}} width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="10" fill="none" stroke="#A78BFA" strokeWidth="1.3" strokeDasharray="2 4"/></svg>
            <svg style={{position:'absolute',top:'5%',right:'40%',animation:'pulseRing 9s 3s ease-in-out infinite'}} width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="none" stroke="#38BDF8" strokeWidth="1.3" strokeDasharray="3 4"/></svg>

            {/* Plus / crosses */}
            <svg style={{position:'absolute',top:'18%',right:'30%',animation:'driftShape 8s ease-in-out infinite'}} width="18" height="18" viewBox="0 0 18 18"><line x1="9" y1="2" x2="9" y2="16" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round"/><line x1="2" y1="9" x2="16" y2="9" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round"/></svg>
            <svg style={{position:'absolute',top:'75%',left:'22%',animation:'driftShape 10s 2s ease-in-out infinite'}} width="14" height="14" viewBox="0 0 14 14"><line x1="7" y1="1" x2="7" y2="13" stroke="#A78BFA" strokeWidth="1.6" strokeLinecap="round"/><line x1="1" y1="7" x2="13" y2="7" stroke="#A78BFA" strokeWidth="1.6" strokeLinecap="round"/></svg>
            <svg style={{position:'absolute',top:'52%',left:'55%',animation:'driftShape 11s 0.5s ease-in-out infinite'}} width="16" height="16" viewBox="0 0 16 16"><line x1="8" y1="2" x2="8" y2="14" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/><line x1="2" y1="8" x2="14" y2="8" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <svg style={{position:'absolute',top:'88%',right:'22%',animation:'driftShape 7s 3.5s ease-in-out infinite'}} width="12" height="12" viewBox="0 0 12 12"><line x1="6" y1="1" x2="6" y2="11" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round"/><line x1="1" y1="6" x2="11" y2="6" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round"/></svg>

            {/* Diamond */}
            <svg style={{position:'absolute',top:'48%',left:'24%',animation:'floatBox2 9s 2s ease-in-out infinite'}} width="18" height="18" viewBox="0 0 18 18"><polygon points="9,1 17,9 9,17 1,9" fill="none" stroke="#A78BFA" strokeWidth="1.6"/></svg>
            <svg style={{position:'absolute',top:'35%',right:'12%',animation:'floatBox 12s 1s ease-in-out infinite'}} width="14" height="14" viewBox="0 0 14 14"><polygon points="7,1 13,7 7,13 1,7" fill="rgba(124,58,237,0.18)" stroke="#7C3AED" strokeWidth="1.4"/></svg>

            {/* Dots */}
            <svg style={{position:'absolute',top:'35%',left:'12%',animation:'driftShape 6s 0.5s ease-in-out infinite'}} width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3.5" fill="#7C3AED" opacity="0.35"/></svg>
            <svg style={{position:'absolute',top:'42%',right:'18%',animation:'driftShape 7s 1.8s ease-in-out infinite'}} width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="2.5" fill="#38BDF8" opacity="0.4"/></svg>
            <svg style={{position:'absolute',top:'85%',right:'28%',animation:'floatBox 8s 3.5s ease-in-out infinite'}} width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3.5" fill="#A78BFA" opacity="0.3"/></svg>
            <svg style={{position:'absolute',top:'65%',left:'35%',animation:'driftShape 9s 4s ease-in-out infinite'}} width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="2.5" fill="#38BDF8" opacity="0.35"/></svg>
            <svg style={{position:'absolute',top:'10%',right:'18%',animation:'driftShape 5s 1s ease-in-out infinite'}} width="7" height="7" viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3" fill="#7C3AED" opacity="0.3"/></svg>
          </div>

          <div className="hero-cnt">
            <div className="mc-badge">
              <div className="bdot" />
              {t("landing.badge")}
            </div>
            <h1 className="mc-h1">
              {t("landing.title").split("<1>")[0]}
              <span className="h1g">
                {t("landing.title").split("<1>")[1]?.split("</1>")[0]}
              </span>
              {t("landing.title").split("</1>")[1]}
            </h1>
            <p className="mc-sub">{t("landing.subtitle")}</p>
            <div className="mc-btns">
              <button className="btn-p" onClick={() => router.push("/register/creator")}>
                <Users size={18} /> {t("landing.iamCreator")} <ArrowRight size={16} />
              </button>
              <button className="btn-b" onClick={() => router.push("/register/company")}>
                <Building2 size={18} /> {t("landing.iamCompany")} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="mc-marquee up">
          <div className="mc-mtrack">
            {marqueeTags.map((item, i) => (
              <span key={i} className={`mc-mtag ${item.c}`}>
                {t(`landing.marquee.${item.key}`)}
              </span>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <section className="mc-feat up">
          <div className="sec-lbl">{t("landing.features.whyLabel")}</div>
          <h2 className="sec-h2">
            {t("landing.features.title")}
            <br />
            <span style={{ color: "#7C3AED" }}>{t("landing.features.subtitle")}</span>
          </h2>
          <p className="sec-sub">{t("landing.features.whySubtitle")}</p>
          <div className="feat-grid">
            <div className="feat-card fc-ai">
              <span className="feat-num">01</span>
              <div className="feat-ico fi-a"><Sparkles size={24} color="#7C3AED" /></div>
              <div className="feat-title">{t("landing.features.ai.title")}</div>
              <div className="feat-desc">{t("landing.features.ai.description")}</div>
            </div>
            <div className="feat-card fc-gr">
              <span className="feat-num">02</span>
              <div className="feat-ico fi-b"><TrendingUp size={24} color="#38BDF8" /></div>
              <div className="feat-title">{t("landing.features.growth.title")}</div>
              <div className="feat-desc">{t("landing.features.growth.description")}</div>
            </div>
            <div className="feat-card fc-sf">
              <span className="feat-num">03</span>
              <div className="feat-ico fi-c"><Shield size={24} color="#6D28D9" /></div>
              <div className="feat-title">{t("landing.features.secure.title")}</div>
              <div className="feat-desc">{t("landing.features.secure.description")}</div>
            </div>
          </div>
        </section>

        {/* SPLIT */}
        <div className="mc-split up">
          <div className="sh sh-c">
            <div className="sh-blob shb-c" />
            <div className="sh-inner">
              <div className="sh-chip chip-c">
                <Users size={11} /> {t("landing.forCreators.chipLabel")}
              </div>
              <h3 className="sh-h3">{t("landing.forCreators.title")}</h3>
              <p className="sh-p">{t("landing.forCreators.subtitle")}</p>
              <div className="sh-checks">
                {creatorChecks.map((key, i) => (
                  <div key={i} className="sh-check">
                    <CheckCircle size={16} color="#7C3AED" />
                    {t(`landing.forCreators.${key}`)}
                  </div>
                ))}
              </div>
              <button className="btn-shc" onClick={() => router.push("/register/creator")}>
                <Users size={17} /> {t("landing.forCreators.registerBtn")} <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <div className="sh sh-e">
            <div className="sh-blob shb-e" />
            <div className="sh-inner">
              <div className="sh-chip chip-e">
                <Building2 size={11} /> {t("landing.forCompanies.chipLabel")}
              </div>
              <h3 className="sh-h3">{t("landing.forCompanies.title")}</h3>
              <p className="sh-p">{t("landing.forCompanies.subtitle")}</p>
              <div className="sh-checks">
                {companyChecks.map((key, i) => (
                  <div key={i} className="sh-check">
                    <CheckCircle size={16} color="#38BDF8" />
                    {t(`landing.forCompanies.${key}`)}
                  </div>
                ))}
              </div>
              <button className="btn-she" onClick={() => router.push("/register/company")}>
                <Building2 size={17} /> {t("landing.forCompanies.registerBtn")} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <section className="mc-cta up">
          {/* Floating animated shapes — CTA */}
          <div className="cta-shapes">
            {/* Squares */}
            <svg style={{position:'absolute',top:'10%',left:'5%',animation:'floatBox 8s ease-in-out infinite'}} width="22" height="22" viewBox="0 0 22 22"><rect x="2" y="2" width="18" height="18" rx="3" fill="none" stroke="#7C3AED" strokeWidth="2"/></svg>
            <svg style={{position:'absolute',top:'20%',left:'15%',animation:'floatBox2 10s 1s ease-in-out infinite'}} width="14" height="14" viewBox="0 0 14 14"><rect x="1" y="1" width="12" height="12" rx="2" fill="rgba(124,58,237,0.2)"/></svg>
            <svg style={{position:'absolute',bottom:'15%',left:'8%',animation:'floatBox 9s 2s ease-in-out infinite'}} width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="#38BDF8" strokeWidth="1.8"/></svg>
            <svg style={{position:'absolute',top:'50%',left:'2%',animation:'floatBox2 11s 3s ease-in-out infinite'}} width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeDasharray="4 3"/></svg>
            <svg style={{position:'absolute',top:'15%',right:'8%',animation:'floatBox2 7.5s 0.5s ease-in-out infinite'}} width="20" height="20" viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" rx="3" fill="none" stroke="#A78BFA" strokeWidth="1.8"/></svg>
            <svg style={{position:'absolute',bottom:'20%',right:'6%',animation:'floatBox 11s 1.5s ease-in-out infinite'}} width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" rx="2" fill="rgba(56,189,248,0.25)"/></svg>
            <svg style={{position:'absolute',top:'40%',right:'2%',animation:'floatBox2 9s 2.5s ease-in-out infinite'}} width="26" height="26" viewBox="0 0 26 26"><rect x="2" y="2" width="22" height="22" rx="4" fill="none" stroke="#38BDF8" strokeWidth="1.4" strokeDasharray="5 3"/></svg>

            {/* Spirals */}
            <svg style={{position:'absolute',top:'50%',left:'3%',animation:'spinSpiral 13s linear infinite'}} width="38" height="38" viewBox="0 0 38 38"><path d="M19 19 m-7,0 a7,7 0 1,1 14,0 a11,11 0 1,1 -22,0 a15,15 0 1,1 30,0" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <svg style={{position:'absolute',top:'55%',right:'4%',animation:'spinSpiral 11s 2s linear infinite reverse'}} width="32" height="32" viewBox="0 0 32 32"><path d="M16 16 m-5,0 a5,5 0 1,1 10,0 a9,9 0 1,1 -18,0 a13,13 0 1,1 26,0" fill="none" stroke="#38BDF8" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <svg style={{position:'absolute',top:'15%',left:'28%',animation:'spinSpiral 15s 1s linear infinite'}} width="26" height="26" viewBox="0 0 26 26"><path d="M13 13 m-4,0 a4,4 0 1,1 8,0 a8,8 0 1,1 -16,0" fill="none" stroke="#A78BFA" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <svg style={{position:'absolute',bottom:'12%',right:'28%',animation:'spinSpiral 17s 3s linear infinite reverse'}} width="22" height="22" viewBox="0 0 22 22"><path d="M11 11 m-4,0 a4,4 0 1,1 8,0 a7,7 0 1,1 -14,0" fill="none" stroke="#7C3AED" strokeWidth="1.3" strokeLinecap="round"/></svg>

            {/* Rings */}
            <svg style={{position:'absolute',top:'8%',left:'35%',animation:'pulseRing 7s ease-in-out infinite'}} width="42" height="42" viewBox="0 0 42 42"><circle cx="21" cy="21" r="17" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="4 6"/></svg>
            <svg style={{position:'absolute',bottom:'8%',right:'35%',animation:'pulseRing 9s 1.5s ease-in-out infinite'}} width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="13" fill="none" stroke="#38BDF8" strokeWidth="1.4" strokeDasharray="3 5"/></svg>
            <svg style={{position:'absolute',top:'45%',left:'20%',animation:'pulseRing 6s 0.8s ease-in-out infinite'}} width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="8.5" fill="none" stroke="#A78BFA" strokeWidth="1.3" strokeDasharray="2 4"/></svg>
            <svg style={{position:'absolute',top:'45%',right:'20%',animation:'pulseRing 8s 2.5s ease-in-out infinite'}} width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" fill="none" stroke="#7C3AED" strokeWidth="1.3" strokeDasharray="2 3"/></svg>

            {/* Triangles */}
            <svg style={{position:'absolute',top:'35%',left:'22%',animation:'floatTri 8s ease-in-out infinite'}} width="18" height="16" viewBox="0 0 18 16"><polygon points="9,1 17,15 1,15" fill="none" stroke="#A78BFA" strokeWidth="1.8"/></svg>
            <svg style={{position:'absolute',top:'40%',right:'20%',animation:'floatTri 10s 2s ease-in-out infinite'}} width="16" height="14" viewBox="0 0 16 14"><polygon points="8,1 15,13 1,13" fill="rgba(56,189,248,0.18)" stroke="#38BDF8" strokeWidth="1.5"/></svg>
            <svg style={{position:'absolute',top:'80%',left:'40%',animation:'floatTri 12s 1s ease-in-out infinite'}} width="14" height="12" viewBox="0 0 14 12"><polygon points="7,1 13,11 1,11" fill="none" stroke="#7C3AED" strokeWidth="1.6"/></svg>

            {/* Diamonds */}
            <svg style={{position:'absolute',top:'25%',left:'10%',animation:'floatBox2 9s 1.5s ease-in-out infinite'}} width="16" height="16" viewBox="0 0 16 16"><polygon points="8,1 15,8 8,15 1,8" fill="none" stroke="#A78BFA" strokeWidth="1.6"/></svg>
            <svg style={{position:'absolute',bottom:'22%',right:'14%',animation:'floatBox 10s 2s ease-in-out infinite'}} width="14" height="14" viewBox="0 0 14 14"><polygon points="7,1 13,7 7,13 1,7" fill="rgba(124,58,237,0.18)" stroke="#7C3AED" strokeWidth="1.4"/></svg>

            {/* Plus / crosses */}
            <svg style={{position:'absolute',top:'25%',left:'8%',animation:'driftShape 7s ease-in-out infinite'}} width="16" height="16" viewBox="0 0 16 16"><line x1="8" y1="2" x2="8" y2="14" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round"/><line x1="2" y1="8" x2="14" y2="8" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round"/></svg>
            <svg style={{position:'absolute',bottom:'25%',right:'12%',animation:'driftShape 9s 1.5s ease-in-out infinite'}} width="14" height="14" viewBox="0 0 14 14"><line x1="7" y1="2" x2="7" y2="12" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round"/><line x1="2" y1="7" x2="12" y2="7" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round"/></svg>
            <svg style={{position:'absolute',top:'70%',left:'30%',animation:'driftShape 8s 3s ease-in-out infinite'}} width="14" height="14" viewBox="0 0 14 14"><line x1="7" y1="2" x2="7" y2="12" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/><line x1="2" y1="7" x2="12" y2="7" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <svg style={{position:'absolute',top:'65%',right:'30%',animation:'driftShape 6s 0.5s ease-in-out infinite'}} width="12" height="12" viewBox="0 0 12 12"><line x1="6" y1="1" x2="6" y2="11" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round"/><line x1="1" y1="6" x2="11" y2="6" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round"/></svg>

            {/* Dots */}
            <svg style={{position:'absolute',top:'60%',left:'18%',animation:'driftShape 6s 0.8s ease-in-out infinite'}} width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3.5" fill="#7C3AED" opacity="0.3"/></svg>
            <svg style={{position:'absolute',top:'30%',right:'15%',animation:'driftShape 8s 2.5s ease-in-out infinite'}} width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="2.5" fill="#A78BFA" opacity="0.35"/></svg>
            <svg style={{position:'absolute',top:'75%',right:'42%',animation:'driftShape 7s 1.2s ease-in-out infinite'}} width="7" height="7" viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3" fill="#38BDF8" opacity="0.35"/></svg>
            <svg style={{position:'absolute',top:'20%',right:'42%',animation:'floatBox 9s 4s ease-in-out infinite'}} width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="2.5" fill="#7C3AED" opacity="0.3"/></svg>
          </div>

          <div className="cta-inner">
            <div className="cta-badge">
              <Star size={11} /> {t("landing.cta.badge")}
            </div>
            <h2 className="cta-h2">{t("landing.cta.title")}</h2>
            <p className="cta-sub">{t("landing.cta.subtitle")}</p>
            <div className="cta-btns">
              <button className="btn-cc" onClick={() => router.push("/register/creator")}>
                <Users size={17} /> {t("landing.iamCreator")}
              </button>
              <button className="btn-ce" onClick={() => router.push("/register/company")}>
                <Building2 size={17} /> {t("landing.iamCompany")}
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mc-footer up">
          <img src="/logoma.png" alt="MatchCreator" style={{height: '36px', width: 'auto', margin: '0 auto 0.75rem'}} />
          <p>{t("landing.footer")}</p>
        </footer>
      </div>
    </>
  );
}