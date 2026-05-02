import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";


const DISTANCES = [
  { key: "1K", label: "1K", km: 1 },
  { key: "3K", label: "3K", km: 3 },
  { key: "5K", label: "5K", km: 5 },
  { key: "10K", label: "10K", km: 10 },
  { key: "half", label: "하프", km: 21.0975 },
  { key: "full", label: "풀코스", km: 42.195 },
];

const UNIT_PRESETS = {
  pace: ["3:30", "4:00", "4:30", "5:00", "5:30", "6:00", "6:30"],
  speed: ["8", "9", "10", "11", "12", "13", "14", "15", "16"],
  m100: ["20", "24", "27", "30", "33", "36", "40"],
  m400: ["1:20", "1:30", "1:40", "1:48", "2:00", "2:12", "2:24"],
  km5: ["20:00", "22:30", "25:00", "27:30", "30:00", "35:00"],
  km10: ["40:00", "45:00", "50:00", "55:00", "1:00:00", "1:10:00"],
  half: ["1:30:00", "1:40:00", "1:50:00", "2:00:00", "2:10:00", "2:30:00"],
  full: ["3:00:00", "3:30:00", "4:00:00", "4:30:00", "5:00:00", "5:30:00"]
};

const INPUT_UNITS = [
  { key: "pace", label: "km당 페이스", unit: "/km", hint: "예: 4:30" },
  { key: "speed", label: "시속", unit: "km/h", hint: "예: 13.3" },
  { key: "m100", label: "100m", unit: "초", hint: "예: 27" },
  { key: "m400", label: "400m", unit: "랩", hint: "예: 1:48" },
  { key: "km5", label: "5K 기록", unit: "기록", hint: "예: 22:30" },
  { key: "km10", label: "10K 기록", unit: "기록", hint: "예: 45:00" },
  { key: "half", label: "하프 기록", unit: "기록", hint: "예: 1:45:00" },
  { key: "full", label: "풀코스 기록", unit: "기록", hint: "예: 4:00:00" }
];

const MARATHON_PRESETS = [
  { label: "서브3", sec: Math.floor((3 * 3600) / 42.195) },
  { label: "서브3.5", sec: Math.floor((3.5 * 3600) / 42.195) },
  { label: "서브4", sec: Math.floor((4 * 3600) / 42.195) },
  { label: "서브5", sec: Math.floor((5 * 3600) / 42.195) },
];

function parseClock(input) {
  if (!input) return 0;
  const clean = String(input).trim().replace(/[’']/g, ":").replace(/["초]/g, "").replace(/분/g, ":");
  const parts = clean.split(":").map((v) => Number(v));
  if (parts.some((v) => Number.isNaN(v))) return 0;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function formatTime(sec, showHourWhenZero = false) {
  if (!Number.isFinite(sec) || sec <= 0) return "-";
  const rounded = Math.round(sec);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;
  if (h > 0 || showHourWhenZero) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatPace(sec) {
  if (!Number.isFinite(sec) || sec <= 0) return "-";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}'${String(s).padStart(2, "0")}"`;
}

function paceToInput(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Icon({ children }) {
  return <span className="inline-flex w-5 h-5 items-center justify-center text-base">{children}</span>;
}

function Button({ children, onClick, className = "", variant }) {
  return (
    <button onClick={onClick} className={`px-3 py-2 font-bold transition ${className}`}>
      {children}
    </button>
  );
}

function StatRow({ label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/55">{label}</span>
      <span className={accent ? "font-black text-orange-300" : "font-bold text-white"}>{value}</span>
    </div>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-2xl text-sm font-bold transition ${active ? "bg-emerald-300 text-slate-950" : "bg-white/7 text-white/70"}`}
    >
      {children}
    </button>
  );
}

function AppCard({ children, className = "" }) {
  return (
    <div className={`bg-white/[0.075] border border-white/10 rounded-[28px] shadow-2xl shadow-black/20 backdrop-blur ${className}`}>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function RunPaceMobileApp() {
  const [tab, setTab] = useState("convert");
  const [paceInput, setPaceInput] = useState("4:30");
  const [inputUnit, setInputUnit] = useState("pace");
  const [goalDistance, setGoalDistance] = useState(42.195);
  const [goalTime, setGoalTime] = useState("4:00:00");
  const [intervalDistance, setIntervalDistance] = useState(400);
  const selectedUnit = INPUT_UNITS.find((u) => u.key === inputUnit) || INPUT_UNITS[0];
  const paceSec = parseClock(paceInput);
  const speed = paceSec ? 3600 / paceSec : 0;

  const predictions = useMemo(() => {
    return DISTANCES.map((d) => ({ ...d, seconds: paceSec * d.km }));
  }, [paceSec]);

  const chartData = useMemo(() => {
    return DISTANCES.map((d) => ({ name: d.label, minutes: Math.round((paceSec * d.km) / 60) }));
  }, [paceSec]);

  const goalPace = parseClock(goalTime) / goalDistance;
  const training = useMemo(() => {
    const base = paceSec || 300;
    return [
      { label: "이지런", pace: `${formatPace(base * 1.18)} ~ ${formatPace(base * 1.32)}`, desc: "회복·장거리" },
      { label: "마라톤", pace: formatPace(base * 1.05), desc: "지속주 기준" },
      { label: "템포런", pace: formatPace(base * 0.94), desc: "역치 훈련" },
      { label: "인터벌", pace: formatPace(base * 0.86), desc: "400m 반복" },
    ];
  }, [paceSec]);

  return (
    <div className="min-h-screen bg-[#080d18] text-white flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen relative overflow-hidden px-4 pb-24">
        <div className="absolute -top-32 -right-28 w-72 h-72 bg-emerald-300/20 blur-3xl rounded-full" />
        <div className="absolute top-56 -left-32 w-72 h-72 bg-orange-400/10 blur-3xl rounded-full" />

        <header className="relative pt-6 pb-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-200/80 font-bold tracking-[0.28em]">RUN PACE</div>
            <h1 className="text-3xl font-black tracking-tight">러닝 페이스</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-300 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-300/20">
            🏃
          </div>
        </header>

        <div className="relative grid grid-cols-3 gap-2 p-1 bg-white/7 rounded-3xl mb-4">
          <Pill active={tab === "convert"} onClick={() => setTab("convert")}>변환</Pill>
          <Pill active={tab === "goal"} onClick={() => setTab("goal")}>목표</Pill>
          <Pill active={tab === "interval"} onClick={() => setTab("interval")}>인터벌</Pill>
        </div>

        {tab === "convert" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 relative">
            <AppCard className="bg-gradient-to-br from-white/[0.11] to-white/[0.04]">
              <div className="flex items-center gap-2 text-white/55 text-sm mb-3"><Icon>⚡</Icon> 입력 단위 선택</div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {INPUT_UNITS.map((u) => {
                  // UI용 간단 환산 (정확도 무시)
                  let preview = "-";
                  if (paceSec > 0) {
                    if (u.key === "pace") preview = formatPace(paceSec);
                    if (u.key === "speed") preview = `${(3600 / paceSec).toFixed(1)}`;
                    if (u.key === "m100") preview = `${(paceSec / 10).toFixed(1)}`;
                    if (u.key === "m400") preview = formatTime(paceSec * 0.4);
                    if (u.key === "km5") preview = formatTime(paceSec * 5);
                    if (u.key === "km10") preview = formatTime(paceSec * 10);
                    if (u.key === "half") preview = formatTime(paceSec * 21.0975, true);
                    if (u.key === "full") preview = formatTime(paceSec * 42.195, true);
                  }

                  return (
                    <button
                      key={u.key}
                      onClick={() => { setInputUnit(u.key); setPaceInput(UNIT_PRESETS[u.key][0]); }}
                      className={`rounded-2xl px-3 py-3 text-left transition ${inputUnit === u.key ? "bg-emerald-300 text-slate-950" : "bg-white/7 text-white/75"}`}
                    >
                      <div className="text-sm font-black">{u.label}</div>
                      <div className="text-xs font-bold mt-1">{preview} <span className="opacity-50">{u.unit}</span></div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-end gap-2 bg-black/20 rounded-[24px] p-4">
                <input
                  value={paceInput}
                  onChange={(e) => setPaceInput(e.target.value)}
                  className="w-full bg-transparent outline-none text-5xl font-black tracking-tighter tabular-nums"
                  inputMode="numeric"
                />
                <span className="pb-2 text-lg font-bold text-emerald-200 whitespace-nowrap">{selectedUnit.unit}</span>
              </div>
              <div className="mt-4">
                <div className="text-xs text-white/45 mb-2">자주 쓰는 값</div>
                <div className="flex gap-2 flex-wrap">
                  {UNIT_PRESETS[inputUnit].map((v) => (
                    <button key={v} onClick={() => setPaceInput(v)} className="px-3 py-2 rounded-2xl bg-white/7 text-sm font-bold">{v}</button>
                  ))}
                </div>
              </div>
            </AppCard>

            <div className="grid grid-cols-3 gap-3">
              <AppCard><div className="text-white/45 text-xs">km 페이스</div><div className="text-xl font-black mt-1">{formatPace(paceSec)}</div><div className="text-xs text-white/40">/km</div></AppCard>
              <AppCard><div className="text-white/45 text-xs">시속</div><div className="text-xl font-black mt-1">{speed.toFixed(1)}</div><div className="text-xs text-white/40">km/h</div></AppCard>
              <AppCard><div className="text-white/45 text-xs">100m</div><div className="text-xl font-black mt-1">{(paceSec / 10).toFixed(1)}</div><div className="text-xs text-white/40">sec</div></AppCard>
            </div>

            <AppCard>
              <div className="flex items-center gap-2 font-black mb-2"><Icon>⏱️</Icon> 거리별 예상 기록</div>
              {predictions.map((p) => <StatRow key={p.key} label={p.label} value={formatTime(p.seconds, p.km >= 21)} accent={p.key === "full"} />)}
            </AppCard>

            <AppCard>
              <div className="flex items-center gap-2 font-black mb-3"><Icon>📈</Icon> 예상 기록 그래프</div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 }} />
                    <Line type="monotone" dataKey="minutes" stroke="currentColor" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </AppCard>
          </motion.div>
        )}

        {tab === "goal" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 relative">
            <AppCard>
              <div className="flex items-center gap-2 font-black mb-3"><Icon>🎯</Icon> 목표 기록 계산</div>
              <div className="grid grid-cols-2 gap-3">
                <select value={goalDistance} onChange={(e) => setGoalDistance(Number(e.target.value))} className="bg-white/7 rounded-2xl px-3 py-3 outline-none font-bold">
                  {DISTANCES.slice(2).map((d) => <option key={d.key} value={d.km}>{d.label}</option>)}
                </select>
                <input value={goalTime} onChange={(e) => setGoalTime(e.target.value)} className="bg-white/7 rounded-2xl px-3 py-3 outline-none font-bold tabular-nums" />
              </div>
            </AppCard>
            <AppCard className="bg-gradient-to-br from-emerald-300/20 to-white/[0.05]">
              <div className="text-white/55 text-sm">필요 페이스</div>
              <div className="text-6xl font-black tracking-tighter mt-1 text-emerald-100">{formatPace(goalPace)}</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-black/20 rounded-2xl p-3"><div className="text-xs text-white/45">시속</div><div className="font-black">{(3600 / goalPace).toFixed(2)} km/h</div></div>
                <div className="bg-black/20 rounded-2xl p-3"><div className="text-xs text-white/45">400m</div><div className="font-black">{formatTime(goalPace * 0.4)}</div></div>
              </div>
            </AppCard>
            <AppCard>
              <div className="font-black mb-3">마라톤 프리셋</div>
              <div className="grid grid-cols-2 gap-2">
                {MARATHON_PRESETS.map((p) => <Button key={p.label} onClick={() => { setGoalDistance(42.195); setGoalTime(p.label === "서브3" ? "3:00:00" : p.label === "서브3.5" ? "3:30:00" : p.label === "서브4" ? "4:00:00" : "5:00:00"); }} className="rounded-2xl bg-white/10 hover:bg-white/15">{p.label}</Button>)}
              </div>
            </AppCard>
          </motion.div>
        )}

        {tab === "interval" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 relative">
            <AppCard>
              <div className="flex items-center gap-2 font-black mb-3"><Icon>🔁</Icon> 인터벌 계산</div>
              <div className="grid grid-cols-2 gap-3">
                <input value={paceInput} onChange={(e) => setPaceInput(e.target.value)} className="bg-white/7 rounded-2xl px-3 py-3 outline-none text-xl font-black" />
                <select value={intervalDistance} onChange={(e) => setIntervalDistance(Number(e.target.value))} className="bg-white/7 rounded-2xl px-3 py-3 outline-none font-bold">
                  {[100, 200, 400, 800, 1000, 1600].map((m) => <option key={m} value={m}>{m}m</option>)}
                </select>
              </div>
            </AppCard>
            <AppCard className="bg-gradient-to-br from-orange-300/20 to-white/[0.05]">
              <div className="text-white/55 text-sm">목표 랩타임</div>
              <div className="text-6xl font-black tracking-tighter mt-1 text-orange-200">{formatTime(paceSec * (intervalDistance / 1000))}</div>
              <div className="text-sm text-white/45 mt-1">{intervalDistance}m 기준</div>
            </AppCard>
            <AppCard>
              {[100, 200, 400, 800, 1000, 1600].map((m) => <StatRow key={m} label={`${m}m`} value={formatTime(paceSec * (m / 1000))} accent={m === intervalDistance} />)}
            </AppCard>
            <AppCard>
              <div className="flex items-center gap-2 font-black mb-3"><Icon>💪</Icon> 훈련 페이스 추천</div>
              <div className="grid gap-2">
                {training.map((t) => (
                  <div key={t.label} className="flex items-center justify-between rounded-2xl bg-white/7 p-3">
                    <div><div className="font-black">{t.label}</div><div className="text-xs text-white/45">{t.desc}</div></div>
                    <div className="font-black text-emerald-100">{t.pace}</div>
                  </div>
                ))}
              </div>
            </AppCard>
          </motion.div>
        )}

        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[398px]">
          <div className="grid grid-cols-4 gap-2 bg-slate-950/80 border border-white/10 backdrop-blur rounded-[28px] p-2 shadow-2xl">
            <Button variant="ghost" className="rounded-2xl text-white/80 flex-col h-14 gap-0"><span>⭐</span><span className="text-[10px]">저장</span></Button>
            <Button variant="ghost" className="rounded-2xl text-white/80 flex-col h-14 gap-0"><span>↗️</span><span className="text-[10px]">공유</span></Button>
            <Button variant="ghost" className="rounded-2xl text-white/80 flex-col h-14 gap-0"><span>🌙</span><span className="text-[10px]">다크</span></Button>
            <Button variant="ghost" className="rounded-2xl text-white/80 flex-col h-14 gap-0"><span>📱</span><span className="text-[10px]">PWA</span></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
