import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer
} from "recharts";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const SEED_EXERCISES = [
  // Chest
  { id:"bench",      name:"Barbell Bench Press",     unit:"kg",        bw:false, group:"Chest",     baseline:[60,75],   t6:[85,95],   t18:[100,110] },
  { id:"incline",    name:"DB Incline Press",        unit:"kg each",   bw:false, group:"Chest",     baseline:[20,25],   t6:[30,35],   t18:[38,42]   },
  { id:"pecfly",     name:"Pec Fly (Machine)",       unit:"kg",        bw:false, group:"Chest",     baseline:[40,55],   t6:[60,75],   t18:[80,95]   },
  { id:"chestpress", name:"Machine Chest Press",     unit:"kg",        bw:false, group:"Chest",     baseline:[50,65],   t6:[75,90],   t18:[95,110]  },
  { id:"cablefly",   name:"Cable Crossover",         unit:"kg",        bw:false, group:"Chest",     baseline:[10,15],   t6:[18,25],   t18:[28,35]   },
  { id:"dbflat",     name:"DB Flat Bench Press",     unit:"kg each",   bw:false, group:"Chest",     baseline:[22,28],   t6:[32,38],   t18:[42,50]   },
  // Back
  { id:"pulldown",   name:"Lat Pulldown",            unit:"kg",        bw:false, group:"Back",      baseline:[70,85],   t6:[90,100],  t18:[110,120] },
  { id:"row",        name:"Cable Row",               unit:"kg",        bw:false, group:"Back",      baseline:[70,85],   t6:[90,100],  t18:[110,120] },
  { id:"seatedrow",  name:"Seated Row (Machine)",    unit:"kg",        bw:false, group:"Back",      baseline:[60,75],   t6:[85,100],  t18:[105,120] },
  { id:"dbrow",      name:"DB Single-Arm Row",       unit:"kg",        bw:false, group:"Back",      baseline:[25,35],   t6:[40,50],   t18:[55,65]   },
  { id:"tbar",       name:"T-Bar Row",               unit:"kg",        bw:false, group:"Back",      baseline:[40,55],   t6:[65,80],   t18:[85,100]  },
  { id:"pullup",     name:"Assisted Pull-Up",        unit:"kg assist", bw:false, group:"Back",      baseline:[30,50],   t6:[15,30],   t18:[0,10]    },
  // Shoulders
  { id:"shoulder",   name:"Seated Shoulder Press",   unit:"kg",        bw:false, group:"Shoulders", baseline:[35,45],   t6:[50,60],   t18:[65,75]   },
  { id:"lateraise",  name:"DB Lateral Raise",        unit:"kg each",   bw:false, group:"Shoulders", baseline:[8,12],    t6:[14,18],   t18:[20,25]   },
  { id:"frontraise", name:"DB Front Raise",          unit:"kg each",   bw:false, group:"Shoulders", baseline:[8,12],    t6:[14,18],   t18:[20,24]   },
  { id:"reardelt",   name:"Rear Delt Fly (Machine)", unit:"kg",        bw:false, group:"Shoulders", baseline:[30,40],   t6:[50,60],   t18:[65,75]   },
  { id:"shrugs",     name:"DB Shrugs",               unit:"kg each",   bw:false, group:"Shoulders", baseline:[25,35],   t6:[40,50],   t18:[55,65]   },
  // Arms
  { id:"triceps",    name:"Triceps Pushdown",        unit:"kg",        bw:false, group:"Arms",      baseline:[20,30],   t6:[35,45],   t18:[50,60]   },
  { id:"skullcrush", name:"Skull Crushers",          unit:"kg",        bw:false, group:"Arms",      baseline:[20,28],   t6:[32,40],   t18:[44,52]   },
  { id:"diptricep",  name:"Tricep Dips (Assisted)",  unit:"kg assist", bw:false, group:"Arms",      baseline:[30,50],   t6:[15,30],   t18:[0,10]    },
  { id:"bicepcurl",  name:"Barbell Bicep Curl",      unit:"kg",        bw:false, group:"Arms",      baseline:[25,35],   t6:[40,50],   t18:[55,65]   },
  { id:"dbcurl",     name:"DB Bicep Curl",           unit:"kg each",   bw:false, group:"Arms",      baseline:[12,16],   t6:[18,22],   t18:[24,30]   },
  { id:"hammer",     name:"Hammer Curl",             unit:"kg each",   bw:false, group:"Arms",      baseline:[12,16],   t6:[18,22],   t18:[24,30]   },
  { id:"preacher",   name:"Preacher Curl (Machine)", unit:"kg",        bw:false, group:"Arms",      baseline:[20,30],   t6:[35,45],   t18:[50,60]   },
  // Legs
  { id:"legpress",   name:"Leg Press",               unit:"kg",        bw:false, group:"Legs",      baseline:[100,140], t6:[160,180], t18:[200,220] },
  { id:"rdl",        name:"Romanian Deadlift",       unit:"kg",        bw:false, group:"Legs",      baseline:[50,65],   t6:[80,90],   t18:[100,110] },
  { id:"legext",     name:"Leg Extension",           unit:"kg",        bw:false, group:"Legs",      baseline:[40,55],   t6:[65,80],   t18:[85,100]  },
  { id:"legcurl",    name:"Lying Leg Curl",          unit:"kg",        bw:false, group:"Legs",      baseline:[35,50],   t6:[60,75],   t18:[80,95]   },
  { id:"calfpress",  name:"Calf Raise (Machine)",    unit:"kg",        bw:false, group:"Legs",      baseline:[60,80],   t6:[90,110],  t18:[120,140] },
  { id:"hipabduct",  name:"Hip Abductor (Machine)",  unit:"kg",        bw:false, group:"Legs",      baseline:[40,55],   t6:[65,80],   t18:[85,100]  },
  { id:"hipadduct",  name:"Hip Adductor (Machine)",  unit:"kg",        bw:false, group:"Legs",      baseline:[40,55],   t6:[65,80],   t18:[85,100]  },
  // Core
  { id:"crunches",   name:"Crunches",                unit:"reps",      bw:true,  group:"Core",      baseline:[15,25],   t6:[35,50],   t18:[60,80]   },
  { id:"plank",      name:"Plank",                   unit:"seconds",   bw:true,  group:"Core",      baseline:[20,40],   t6:[60,90],   t18:[120,180] },
  { id:"legrise",    name:"Hanging Leg Raise",       unit:"reps",      bw:true,  group:"Core",      baseline:[8,12],    t6:[15,20],   t18:[25,30]   },
  { id:"abcrunch",   name:"Ab Crunch (Machine)",     unit:"kg",        bw:false, group:"Core",      baseline:[30,45],   t6:[55,70],   t18:[75,90]   },
  { id:"cabletwist", name:"Cable Wood Chop",         unit:"kg",        bw:false, group:"Core",      baseline:[10,15],   t6:[18,25],   t18:[28,35]   },
];

const DAYS      = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MONTHS    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const GROUPS    = ["Chest","Back","Shoulders","Arms","Legs","Core"];
const TIME_FILTERS = [
  { label:"All", days:null },
  { label:"1M",  days:30   },
  { label:"3M",  days:90   },
  { label:"6M",  days:180  },
];
const GOALS = ["Build muscle/size","General strength & health","Athletic performance","Fat loss + tone"];
const EXP   = ["Complete beginner","Some experience (1-2 yrs)","Intermediate (3-5 yrs)","Advanced (5+ yrs)"];
const EMPTY_PLAN    = Object.fromEntries(DAYS.map(d => [d, []]));
const EMPTY_PROFILE = { name:"", age:"", weight:"", height:"", goal:GOALS[0], experience:EXP[1], email:"", emailConsent:false, emailFrequency:"weekly", trainingDays:{}, };

const GYM_TYPES = [
  { id:"gym",     label:"Commercial gym",  icon:"🏋️", desc:"Full equipment access" },
  { id:"home",    label:"Home gym",        icon:"🏠", desc:"Barbell, dumbbells, rack" },
  { id:"dumbbells",label:"Dumbbells only", icon:"💪", desc:"Limited equipment" },
  { id:"rest",    label:"Rest / off",      icon:"😴", desc:"No training" },
];

// ─────────────────────────────────────────────
// Theme
// ─────────────────────────────────────────────
const C = {
  bg:"#0f0f1a", card:"#1a1a2e", card2:"#13132a",
  border:"#2d2d4a", input:"#1e1e35", inputB:"#3d3d5c",
  text:"#e2e8f0", muted:"#6b7280", dim:"#4b4b6b",
  purple:"#a855f7", indigo:"#6366f1",
  green:"#22c55e", amber:"#f59e0b", red:"#ef4444",
  grad:"linear-gradient(90deg,#6366f1,#a855f7)",
};

// ─────────────────────────────────────────────
// Pure helpers
// ─────────────────────────────────────────────
const uid        = () => Math.random().toString(36).slice(2, 9);
const avg        = ([a, b]) => (a + b) / 2;
const fmtDate    = iso => { const d = new Date(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`; };
const daysSince  = iso  => iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null;
const todayName  = ()   => DAYS[(new Date().getDay() + 6) % 7];
const filterTime = (entries, days) => days ? entries.filter(e => Date.now() - new Date(e.date) < days * 86400000) : entries;
const calcBMI    = (w, h) => (w && h) ? (w / ((h / 100) ** 2)).toFixed(1) : null;
const bmiMeta    = bmi => {
  if (!bmi) return null;
  if (bmi < 18.5) return { label:"Underweight", color:"#60a5fa" };
  if (bmi < 25)   return { label:"Healthy",     color:C.green   };
  if (bmi < 30)   return { label:"Overweight",  color:C.amber   };
  return               { label:"Obese",         color:C.red     };
};
const progressPct = (entry, ex) => {
  if (!entry) return 0;
  const v = ex.bw ? entry.reps : entry.weight;
  if (!v) return 0;
  const base = avg(ex.baseline), peak = avg(ex.t18);
  if (v <= base) return 0;
  if (v >= peak) return 100;
  return Math.round(((v - base) / (peak - base)) * 100);
};
const barColor = pct => pct >= 80 ? C.green : pct >= 40 ? C.purple : C.amber;
const daysLabel = d => {
  if (d === null) return { text:"Never",     color:C.dim   };
  if (d === 0)    return { text:"Today",     color:C.green };
  if (d === 1)    return { text:"Yesterday", color:C.green };
  if (d <= 7)     return { text:`${d}d ago`, color:C.amber };
  return               { text:`${d}d ago`, color:C.red   };
};

// ─────────────────────────────────────────────
// Storage — single-pass bulk load avoids race conditions
// ─────────────────────────────────────────────
const STORAGE_KEYS = ["strength_profile","strength_exercises","strength_logs","strength_plan","strength_favs","strength_bodyweights","strength_photos"];

async function loadAllStorage() {
  const results = {};
  await Promise.all(STORAGE_KEYS.map(async key => {
    try {
      const r = await window.storage.get(key);
      if (r?.value) results[key] = JSON.parse(r.value);
    } catch {}
  }));
  return results;
}

async function saveToStorage(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); } catch {}
}

// ─────────────────────────────────────────────
// Primitive components
// ─────────────────────────────────────────────
const ProgressBar = ({ pct, color = C.purple }) => (
  <div style={{ background:"#1e1e2e", borderRadius:6, height:7, overflow:"hidden", width:"100%" }}>
    <div style={{ height:"100%", width:`${Math.min(100,pct)}%`, background:color, borderRadius:6, transition:"width .4s ease" }} />
  </div>
);

const Chip = ({ children, bg = C.input, color = C.text }) => (
  <span style={{ fontSize:11, background:bg, borderRadius:6, padding:"3px 8px", color, fontWeight:600, display:"inline-block" }}>{children}</span>
);

const Badge = ({ label, color, textColor = "#fff" }) => (
  <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.05em", background:color, color:textColor, borderRadius:4, padding:"2px 7px", textTransform:"uppercase", whiteSpace:"nowrap" }}>{label}</span>
);

const Btn = ({ onClick, children, variant = "primary", small = false, disabled = false, danger = false }) => {
  const bg = danger ? C.red : variant === "primary" ? C.grad : variant === "ghost" ? "none" : C.input;
  const border = variant === "ghost" ? `1px solid ${C.border}` : "none";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:bg, border, borderRadius:8, padding:small ? "6px 12px" : "11px 20px", color:"#fff", fontWeight:700, fontSize:small ? 12 : 14, cursor:disabled ? "default" : "pointer", opacity:disabled ? 0.4 : 1, width: variant === "primary" ? "100%" : "auto", transition:"opacity .15s" }}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:5, display:"block" }}>{label}</label>}
    <input {...props} style={{ width:"100%", background:C.input, border:`1px solid ${C.inputB}`, borderRadius:8, padding:"10px 12px", color:C.text, fontSize:14, outline:"none", boxSizing:"border-box", ...(props.style||{}) }} />
  </div>
);

const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:14, marginBottom:10, ...(onClick ? { cursor:"pointer" } : {}), ...style }}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, marginTop:2 }}>{children}</div>
);

const Toggle = ({ on, onToggle }) => (
  <div onClick={onToggle} role="switch" aria-checked={on}
    style={{ width:44, height:26, borderRadius:13, background:on ? C.indigo : C.inputB, cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}>
    <div style={{ position:"absolute", top:3, left:on ? 21 : 3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.3)" }} />
  </div>
);

// ─────────────────────────────────────────────
// Chart
// ─────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:C.input, border:`1px solid ${C.inputB}`, borderRadius:8, padding:"8px 12px", fontSize:13 }}>
      <div style={{ color:C.muted, marginBottom:4, fontWeight:600 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color:p.color, fontWeight:700 }}>{p.name}: {p.value}{unit}</div>)}
    </div>
  );
};

const ExChart = ({ ex, entries, chartType }) => {
  const unit = ex.bw ? ` ${ex.unit}` : "kg";
  const getValue = e => ex.bw ? e.reps : e.weight;
  const t6 = avg(ex.t6), t18 = avg(ex.t18);
  const data = entries.map(e => ({ label:fmtDate(e.date), value:getValue(e) }));
  if (!data.length) return <div style={{ textAlign:"center", padding:"28px 0", color:C.dim, fontSize:13 }}>No sessions yet — log one below.</div>;
  const vals = data.map(d => d.value).filter(Boolean);
  const minV = Math.max(0, Math.min(...vals) - 10), maxV = Math.max(...vals, t18) + 10;
  const cm = { data, margin:{ top:6, right:20, left:-14, bottom:0 } };
  const shared = [
    <XAxis key="x" dataKey="label" tick={{ fill:C.muted, fontSize:10 }} axisLine={false} tickLine={false} />,
    <YAxis key="y" domain={[minV, maxV]} tick={{ fill:C.muted, fontSize:10 }} axisLine={false} tickLine={false} />,
    <CartesianGrid key="g" stroke={C.border} strokeDasharray="3 3" vertical={false} />,
    <Tooltip key="t" content={<ChartTooltip unit={unit} />} />,
    <ReferenceLine key="r6"  y={t6}  stroke={C.amber} strokeDasharray="4 3" label={{ value:"6mo",  fill:C.amber, fontSize:9, position:"right" }} />,
    <ReferenceLine key="r18" y={t18} stroke={C.green} strokeDasharray="4 3" label={{ value:"Peak", fill:C.green, fontSize:9, position:"right" }} />,
  ];
  return (
    <ResponsiveContainer width="100%" height={185}>
      {chartType === "bar"
        ? <BarChart {...cm}>{shared}<Bar dataKey="value" name={ex.bw ? "Reps" : "Weight"} fill={C.indigo} radius={[4,4,0,0]} maxBarSize={36} /></BarChart>
        : <LineChart {...cm}>{shared}<Line type="monotone" dataKey="value" name={ex.bw ? "Reps" : "Weight"} stroke={C.purple} strokeWidth={2.5} dot={{ fill:C.purple, r:4 }} activeDot={{ r:6 }} /></LineChart>
      }
    </ResponsiveContainer>
  );
};

// ─────────────────────────────────────────────
// Modals
// ─────────────────────────────────────────────
const ModalSheet = ({ children, onClose, title }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background:C.card, borderRadius:"18px 18px 0 0", padding:"20px 20px 40px", width:"100%", maxWidth:540, maxHeight:"92vh", overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div style={{ fontSize:16, fontWeight:700 }}>{title}</div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const ConfirmModal = ({ name, body, confirmLabel = "Remove", onConfirm, onClose }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.8)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"28px 24px", width:"100%", maxWidth:360 }}>
      <div style={{ fontSize:16, fontWeight:700, marginBottom:10 }}>{name}</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:24, lineHeight:1.6 }}>{body}</div>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onClose}   style={{ flex:1, background:C.input, border:"none", borderRadius:8, padding:12, color:C.text,  fontWeight:600, fontSize:14, cursor:"pointer" }}>Cancel</button>
        <button onClick={onConfirm} style={{ flex:1, background:C.red,   border:"none", borderRadius:8, padding:12, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Add Exercise Modal
// ─────────────────────────────────────────────
const AddExerciseModal = ({ onSave, onClose }) => {
  const [form, setForm] = useState({ name:"", bw:false, g0:"", g1:"", t60:"", t61:"", t180:"", t181:"" });
  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));
  const unit = form.bw ? "reps / secs" : "kg";
  const valid = form.name.trim() && form.g0 && form.g1 && form.t60 && form.t61 && form.t180 && form.t181;
  return (
    <ModalSheet title="Add New Exercise" onClose={onClose}>
      <Input label="Exercise name" placeholder="e.g. Hammer Curls" value={form.name} onChange={e => set("name", e.target.value)} />
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <span style={{ fontSize:13, color:C.muted, fontWeight:600 }}>Bodyweight / reps only</span>
        <Toggle on={form.bw} onToggle={() => set("bw", !form.bw)} />
      </div>
      <SectionLabel>Benchmarks ({unit})</SectionLabel>
      {[["Baseline (now)", "g0","g1"], ["6-month target","t60","t61"], ["18-month peak","t180","t181"]].map(([lbl, k0, k1]) => (
        <div key={k0} style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:6, display:"block" }}>{lbl}</label>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input type="number" placeholder="Low" value={form[k0]} onChange={e => set(k0, e.target.value)}
              style={{ flex:1, background:C.input, border:`1px solid ${C.inputB}`, borderRadius:8, padding:"10px 12px", color:C.text, fontSize:14, outline:"none" }} />
            <span style={{ color:C.muted }}>–</span>
            <input type="number" placeholder="High" value={form[k1]} onChange={e => set(k1, e.target.value)}
              style={{ flex:1, background:C.input, border:`1px solid ${C.inputB}`, borderRadius:8, padding:"10px 12px", color:C.text, fontSize:14, outline:"none" }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop:8 }}>
        <Btn disabled={!valid} onClick={() => {
          if (!valid) return;
          onSave({ id:uid(), name:form.name.trim(), unit:form.bw ? "reps" : "kg", bw:form.bw, group:"Custom",
            baseline:[+form.g0,+form.g1], t6:[+form.t60,+form.t61], t18:[+form.t180,+form.t181], custom:true });
        }}>Add Exercise</Btn>
      </div>
    </ModalSheet>
  );
};

// ─────────────────────────────────────────────
// Onboarding
// ─────────────────────────────────────────────
const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [emailError, setEmailError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const ok1 = form.name.trim().length > 0;
  const ok2 = form.age && form.weight && form.height;
  // trainingDays: { Monday: "gym", Tuesday: "rest", ... }
  const setDayType = (day, type) => setForm(f => ({ ...f, trainingDays:{ ...f.trainingDays, [day]:type } }));
  const trainCount = Object.values(form.trainingDays || {}).filter(v => v && v !== "rest").length;
  const ok4 = trainCount >= 1; // at least 1 training day
  const TOTAL_STEPS = 5;

  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleStep5Continue = () => {
    if (form.email && !validateEmail(form.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    const finalForm = form.email ? form : { ...form, emailConsent:false, emailFrequency:"weekly" };
    onComplete(finalForm);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", justifyContent:"center", padding:"32px 24px", fontFamily:"'Inter',system-ui,sans-serif", maxWidth:480, margin:"0 auto" }}>
      <div style={{ fontSize:20, fontWeight:800, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:6 }}>Strength Tracker</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:28 }}>Built for you. Let's set up your profile.</div>

      {/* Step progress */}
      <div style={{ display:"flex", gap:6, marginBottom:32 }}>
        {Array.from({ length:TOTAL_STEPS }, (_,i) => (
          <div key={i} style={{ flex:1, height:4, borderRadius:2, background:i+1 <= step ? C.indigo : C.border, transition:"background .3s" }} />
        ))}
      </div>

      {step === 1 && <>
        <div style={{ fontSize:16, fontWeight:800, marginBottom:4 }}>What's your name?</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>We'll personalise your experience.</div>
        <Input label="First name" placeholder="e.g. Niall" value={form.name} onChange={e => set("name", e.target.value)} style={{ fontSize:18 }} autoFocus />
        <Btn disabled={!ok1} onClick={() => setStep(2)}>Continue →</Btn>
      </>}

      {step === 2 && <>
        <div style={{ fontSize:16, fontWeight:800, marginBottom:4 }}>Your stats</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Used to calculate your BMI and personalise benchmarks.</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          <Input label="Age" type="number" placeholder="46" value={form.age} onChange={e => set("age", e.target.value)} />
          <Input label="Weight (kg)" type="number" placeholder="90" value={form.weight} onChange={e => set("weight", e.target.value)} />
          <Input label="Height (cm)" type="number" placeholder="178" value={form.height} onChange={e => set("height", e.target.value)} />
        </div>
        <Btn disabled={!ok2} onClick={() => setStep(3)}>Continue →</Btn>
      </>}

      {step === 3 && <>
        <div style={{ fontSize:16, fontWeight:800, marginBottom:4 }}>Your goal</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:16 }}>This helps us set the right targets.</div>
        <label style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:8, display:"block" }}>Main goal</label>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:18 }}>
          {GOALS.map(g => (
            <button key={g} onClick={() => set("goal", g)}
              style={{ background:form.goal === g ? C.indigo : C.input, border:`1px solid ${form.goal === g ? C.indigo : C.border}`, borderRadius:8, padding:"11px 14px", color:form.goal === g ? "#fff" : C.text, fontWeight:600, fontSize:13, cursor:"pointer", textAlign:"left", transition:"all .15s" }}>
              {g}
            </button>
          ))}
        </div>
        <label style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:8, display:"block" }}>Experience level</label>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
          {EXP.map(e => (
            <button key={e} onClick={() => set("experience", e)}
              style={{ background:form.experience === e ? C.indigo : C.input, border:`1px solid ${form.experience === e ? C.indigo : C.border}`, borderRadius:8, padding:"11px 14px", color:form.experience === e ? "#fff" : C.text, fontWeight:600, fontSize:13, cursor:"pointer", textAlign:"left", transition:"all .15s" }}>
              {e}
            </button>
          ))}
        </div>
        <Btn onClick={() => setStep(4)}>Continue →</Btn>
      </>}

      {step === 4 && <>
        <div style={{ fontSize:16, fontWeight:800, marginBottom:4 }}>Your training schedule</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:20, lineHeight:1.6 }}>
          Tell us which days you train and where. We'll build your plan around this.
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:8 }}>
          {DAYS.map(day => {
            const current = form.trainingDays?.[day] || "rest";
            return (
              <div key={day} style={{ background:C.card, border:`1px solid ${current !== "rest" ? C.indigo+"55" : C.border}`, borderRadius:10, padding:"10px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: current !== "rest" ? 8 : 0 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:current !== "rest" ? C.text : C.muted, minWidth:90 }}>{day}</span>
                  {current !== "rest" && (
                    <span style={{ fontSize:11, color:C.indigo, fontWeight:600 }}>
                      {GYM_TYPES.find(g => g.id === current)?.icon} {GYM_TYPES.find(g => g.id === current)?.label}
                    </span>
                  )}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5 }}>
                  {GYM_TYPES.map(g => (
                    <button key={g.id} onClick={() => setDayType(day, g.id)}
                      style={{ padding:"6px 2px", borderRadius:7, border:`1px solid ${current===g.id ? C.indigo : C.border}`, background:current===g.id ? C.indigo : C.input, color:current===g.id ? "#fff" : C.muted, fontSize:10, fontWeight:600, cursor:"pointer", textAlign:"center", lineHeight:1.4, transition:"all .15s" }}>
                      <div style={{ fontSize:14 }}>{g.icon}</div>
                      <div style={{ fontSize:9, marginTop:1 }}>{g.id === "rest" ? "Rest" : g.id === "gym" ? "Gym" : g.id === "home" ? "Home" : "DBs"}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize:11, color:C.muted, marginBottom:16, textAlign:"center" }}>
          {trainCount} training day{trainCount !== 1 ? "s" : ""} selected
        </div>

        <div style={{ background:C.input, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", marginBottom:14, fontSize:11, color:C.muted, lineHeight:1.5 }}>
          ✨ We'll build your plan around these days, using exercises suited to each location.
        </div>
        <Btn disabled={!ok4} onClick={() => setStep(5)}>Continue →</Btn>
      </>}

      {step === 5 && <>
        <div style={{ fontSize:16, fontWeight:800, marginBottom:4 }}>Progress summaries</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:20, lineHeight:1.6 }}>
          Get a weekly or monthly summary of your training sent to your inbox. This is completely optional.
        </div>

        {/* Email input */}
        <div style={{ marginBottom:4 }}>
          <Input
            label="Email address (optional)"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => { set("email", e.target.value); setEmailError(""); }}
          />
          {emailError && <div style={{ fontSize:11, color:C.red, marginTop:-10, marginBottom:10 }}>{emailError}</div>}
        </div>

        {/* Only show consent + frequency if they've typed an email */}
        {form.email.length > 0 && (
          <>
            {/* Explicit opt-in checkbox */}
            <div onClick={() => set("emailConsent", !form.emailConsent)}
              style={{ display:"flex", alignItems:"flex-start", gap:12, background:form.emailConsent ? "#1a2a1a" : C.input, border:`1px solid ${form.emailConsent ? C.green+"66" : C.border}`, borderRadius:10, padding:"12px 14px", cursor:"pointer", marginBottom:12, transition:"all .2s" }}>
              <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${form.emailConsent ? C.green : C.inputB}`, background:form.emailConsent ? C.green : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, transition:"all .2s" }}>
                {form.emailConsent && <span style={{ color:"#fff", fontSize:13, fontWeight:800, lineHeight:1 }}>✓</span>}
              </div>
              <div style={{ fontSize:12, color:form.emailConsent ? C.text : C.muted, lineHeight:1.6 }}>
                I agree to receive progress summary emails. I understand I can unsubscribe at any time from my profile settings.
              </div>
            </div>

            {/* Frequency selector — only enabled after consent */}
            {form.emailConsent && (
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:8, display:"block" }}>Summary frequency</label>
                <div style={{ display:"flex", gap:8 }}>
                  {["weekly","monthly"].map(f => (
                    <button key={f} onClick={() => set("emailFrequency", f)}
                      style={{ flex:1, padding:"10px 0", borderRadius:8, border:`1px solid ${form.emailFrequency===f ? C.indigo : C.border}`, background:form.emailFrequency===f ? C.indigo : C.input, color:form.emailFrequency===f ? "#fff" : C.muted, fontWeight:600, fontSize:12, cursor:"pointer", textTransform:"capitalize", transition:"all .15s" }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Privacy note */}
        <div style={{ background:C.input, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", marginBottom:20, fontSize:11, color:C.muted, lineHeight:1.6 }}>
          🔒 Your email is stored only on this device and used solely for training summaries. We never share it with third parties. You can delete it at any time in your profile settings.
        </div>

        <Btn onClick={handleStep5Continue}>
          {form.email && form.emailConsent ? "Finish & subscribe 💪" : "Skip & finish 💪"}
        </Btn>
      </>}
    </div>
  );
};

// ─────────────────────────────────────────────
// Exercise card (reused in lists)
// ─────────────────────────────────────────────
const ExerciseCard = ({ ex, latestEntry, logCount, scheduledDays, isFav, onTap, onFavToggle, actionSlot }) => {
  const pct = progressPct(latestEntry, ex);
  const bc  = barColor(pct);
  const val = latestEntry ? (ex.bw ? latestEntry.reps : latestEntry.weight) : null;
  const unit = ex.bw ? ` ${ex.unit}` : "kg";
  const ds  = daysSince(latestEntry?.date);
  const dl  = daysLabel(ds);

  return (
    <Card onClick={onTap} style={{ position:"relative" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <div style={{ flex:1, minWidth:0, paddingRight:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{ex.name}</span>
            {ex.custom && <Chip bg={C.input} color={C.purple}>custom</Chip>}
          </div>
          <div style={{ fontSize:11, color:C.muted, display:"flex", gap:6, flexWrap:"wrap" }}>
            {logCount > 0 && <span>{logCount} session{logCount !== 1 ? "s" : ""}</span>}
            {ds !== null && <span style={{ color:dl.color }}>{dl.text}</span>}
            {scheduledDays?.length > 0 && <span style={{ color:C.purple }}>{scheduledDays.map(d => DAY_SHORT[DAYS.indexOf(d)]).join(" · ")}</span>}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          {val !== null
            ? <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:17, fontWeight:800, color:C.text }}>{val}{unit}</div>
                <div style={{ fontSize:10, color:bc }}>{pct}%</div>
              </div>
            : <Badge label="Not started" color={C.input} textColor={C.muted} />
          }
          {onFavToggle && (
            <button onClick={e => { e.stopPropagation(); onFavToggle(); }}
              style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", padding:"2px 0", lineHeight:1, color:isFav ? C.amber : C.dim }}>
              {isFav ? "★" : "☆"}
            </button>
          )}
          {actionSlot}
        </div>
      </div>
      <ProgressBar pct={pct} color={bc} />
    </Card>
  );
};

// ─────────────────────────────────────────────
// Exercise Detail
// ─────────────────────────────────────────────
const ExerciseDetail = ({ ex, entries, plan, isFav, isPB, pbValue, onBack, onLog, onDeleteEntry, onRemove, onPlanChange, onFavToggle, profile }) => {
  const todayStr = () => new Date().toISOString().slice(0,10); // YYYY-MM-DD
  const [form, setForm]         = useState({ weight:"", sets:"", reps:"", notes:"", date:todayStr() });
  const [dateMode, setDateMode] = useState("today"); // "today" | "custom"
  const [saved, setSaved]       = useState(false);
  const [chartType, setChartType] = useState("line");
  const [timeFilter, setTimeFilter] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const filtered = filterTime(entries, timeFilter);
  const latest   = entries.length ? entries[entries.length - 1] : null;
  const pct      = progressPct(latest, ex);
  const bc       = barColor(pct);
  const unit     = ex.bw ? ` ${ex.unit}` : "kg";
  const scheduled = DAYS.filter(d => (plan[d] || []).includes(ex.id));

  const handleLog = async () => {
    if (ex.bw ? !form.reps : !form.weight) return;
    // Build ISO date: use chosen date at noon to avoid timezone edge cases
    const isoDate = dateMode === "today"
      ? new Date().toISOString()
      : new Date(form.date + "T12:00:00").toISOString();
    await onLog({ date:isoDate, weight:ex.bw ? null : parseFloat(form.weight), sets:parseInt(form.sets)||null, reps:parseInt(form.reps)||null, notes:form.notes });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setForm({ weight:"", sets:"", reps:"", notes:"", date:todayStr() });
    setDateMode("today");
  };

  const toggleDay = (day) => {
    const updated = { ...plan };
    DAYS.forEach(d => { updated[d] = (updated[d]||[]).filter(id => id !== ex.id); });
    const newDays = scheduled.includes(day) ? scheduled.filter(d => d !== day) : [...scheduled, day];
    newDays.forEach(d => { if (!(updated[d]||[]).includes(ex.id)) updated[d] = [...(updated[d]||[]), ex.id]; });
    onPlanChange(updated);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={onBack} style={{ background:C.input, border:"none", borderRadius:6, padding:"5px 10px", color:C.muted, cursor:"pointer", fontSize:11, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
            ← Back
          </button>
          <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{ex.name}</span>
          {ex.custom && <Chip bg={C.input} color={C.purple}>custom</Chip>}
          {isPB && pbValue && <Chip bg="#2a2000" color={C.amber}>🏆 PB {pbValue}{ex.bw?` ${ex.unit}`:"kg"}</Chip>}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={onFavToggle} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:isFav ? C.amber : C.dim, lineHeight:1 }}>
            {isFav ? "★" : "☆"}
          </button>
          <Btn small danger onClick={() => setConfirmRemove(true)}>Remove</Btn>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:12 }}>
        {[
          { label:"Latest",   value:latest ? `${ex.bw ? latest.reps : latest.weight}${unit}` : "–" },
          { label:"Sessions", value:entries.length },
          { label:"To peak",  value:`${pct}%`, color:bc },
        ].map(s => (
          <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px" }}>
            <div style={{ fontSize:9, color:C.muted, marginBottom:3, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{s.label}</div>
            <div style={{ fontSize:16, fontWeight:800, color:s.color || C.text }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Benchmarks */}
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 }}>
        <Chip bg="#1e2a1e">📍 {ex.baseline[0]}–{ex.baseline[1]}{unit}</Chip>
        <Chip bg="#2a2420">🎯 {ex.t6[0]}–{ex.t6[1]}{unit}</Chip>
        <Chip bg="#22203a">🏆 {ex.t18[0]}–{ex.t18[1]}{unit}</Chip>
      </div>

      {/* Schedule days — inline toggles */}
      <Card style={{ marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Scheduled days</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5 }}>
          {DAYS.map((d, i) => {
            const on = scheduled.includes(d);
            return (
              <button key={d} onClick={() => toggleDay(d)}
                style={{ padding:"9px 0", borderRadius:8, border:`1px solid ${on ? C.indigo : C.border}`, background:on ? C.indigo : C.input, color:on ? "#fff" : C.muted, fontWeight:700, fontSize:10, cursor:"pointer", transition:"all .15s" }}>
                {DAY_SHORT[i]}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Chart */}
      <Card style={{ marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, flexWrap:"wrap", gap:8 }}>
          <span style={{ fontSize:13, fontWeight:700 }}>Progress</span>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {["line","bar"].map(t => (
              <button key={t} onClick={() => setChartType(t)}
                style={{ padding:"5px 10px", borderRadius:6, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, background:chartType===t ? C.indigo : C.input, color:chartType===t ? "#fff" : C.muted }}>
                {t === "line" ? "📈 Line" : "📊 Bar"}
              </button>
            ))}
            {TIME_FILTERS.map(f => (
              <button key={f.label} onClick={() => setTimeFilter(f.days)}
                style={{ padding:"5px 10px", borderRadius:6, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, background:timeFilter===f.days ? C.indigo : C.input, color:timeFilter===f.days ? "#fff" : C.muted }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <ExChart ex={ex} entries={filtered} chartType={chartType} />
        <div style={{ display:"flex", gap:14, marginTop:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:C.amber }}><div style={{ width:16, height:2, background:C.amber, borderRadius:2 }} /> 6-month</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:C.green }}><div style={{ width:16, height:2, background:C.green, borderRadius:2 }} /> Peak</div>
        </div>
      </Card>

      {/* AI Coaching */}
      <CoachingSuggestion ex={ex} entries={entries} profile={profile} />

      {/* Log form */}
      <Card style={{ marginBottom:14 }}>
        <div style={{ fontSize:12, fontWeight:700, marginBottom:12, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>Log a session</div>

        {/* Date selector */}
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:6, display:"block" }}>Date</label>
          <div style={{ display:"flex", gap:6, marginBottom: dateMode === "custom" ? 8 : 0 }}>
            <button onClick={() => setDateMode("today")}
              style={{ flex:1, padding:"7px 0", borderRadius:7, border:`1px solid ${dateMode==="today" ? C.indigo : C.border}`, background:dateMode==="today" ? C.indigo : C.input, color:dateMode==="today" ? "#fff" : C.muted, fontSize:11, fontWeight:600, cursor:"pointer" }}>
              Today
            </button>
            <button onClick={() => setDateMode("custom")}
              style={{ flex:1, padding:"7px 0", borderRadius:7, border:`1px solid ${dateMode==="custom" ? C.indigo : C.border}`, background:dateMode==="custom" ? C.indigo : C.input, color:dateMode==="custom" ? "#fff" : C.muted, fontSize:11, fontWeight:600, cursor:"pointer" }}>
              Past date
            </button>
          </div>
          {dateMode === "custom" && (
            <input type="date" value={form.date}
              max={new Date().toISOString().slice(0,10)}
              onChange={e => setForm(f => ({ ...f, date:e.target.value }))}
              style={{ width:"100%", background:C.input, border:`1px solid ${C.inputB}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:13, outline:"none", boxSizing:"border-box" }} />
          )}
        </div>

        {/* Weight / sets / reps */}
        <div style={{ display:"grid", gridTemplateColumns:ex.bw ? "1fr 1fr" : "1fr 1fr 1fr", gap:10 }}>
          {!ex.bw && (
            <Input label="Weight (kg)" type="number" placeholder="e.g. 80" value={form.weight} onChange={e => setForm(f => ({ ...f, weight:e.target.value }))} style={{ marginBottom:0 }} />
          )}
          <Input label="Sets" type="number" placeholder="e.g. 3" value={form.sets} onChange={e => setForm(f => ({ ...f, sets:e.target.value }))} style={{ marginBottom:0 }} />
          <Input label="Reps" type="number" placeholder="e.g. 10" value={form.reps} onChange={e => setForm(f => ({ ...f, reps:e.target.value }))} style={{ marginBottom:0 }} />
        </div>
        <div style={{ marginTop:10 }}>
          <Input label="Notes (optional)" placeholder="e.g. felt strong" value={form.notes} onChange={e => setForm(f => ({ ...f, notes:e.target.value }))} />
        </div>
        <Btn onClick={handleLog}>Save Session</Btn>
        {saved && (
          <div style={{ textAlign:"center", color:C.green, fontSize:12, fontWeight:600, marginTop:8 }}>
            ✓ Saved{dateMode === "custom" ? ` for ${new Date(form.date + "T12:00:00").toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}` : ""}!
          </div>
        )}
      </Card>

      {/* History */}
      {entries.length > 0 && (
        <Card>
          <div style={{ fontSize:12, fontWeight:700, marginBottom:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>History</div>
          {[...entries].sort((a,b) => new Date(b.date) - new Date(a.date)).map((entry, i) => {
            const realIdx = entries.length - 1 - i;
            const p = progressPct(entry, ex);
            const main = ex.bw ? `${entry.reps ?? "–"} ${ex.unit}` : `${entry.weight ?? "–"}kg`;
            return (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom: i < entries.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700 }}>
                    {main}
                    {entry.sets && <span style={{ fontSize:12, color:C.purple, fontWeight:400 }}> · {entry.sets} sets</span>}
                    {entry.reps && !ex.bw && <span style={{ fontSize:12, color:C.muted, fontWeight:400 }}> × {entry.reps} reps</span>}
                  </div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{fmtDate(entry.date)}</div>
                  {entry.notes && <div style={{ fontSize:11, color:C.purple, marginTop:2 }}>"{entry.notes}"</div>}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Badge label={p >= 80 ? "🏆 Peak" : p >= 40 ? "On track" : "Building"} color={p >= 80 ? "#14401e" : p >= 40 ? "#22203a" : "#2a2215"} textColor={p >= 80 ? C.green : p >= 40 ? C.purple : C.amber} />
                  <button onClick={() => { const idx = entries.findIndex(e => e.date === entry.date && e.weight === entry.weight && e.reps === entry.reps); if (idx !== -1) onDeleteEntry(idx); }} style={{ background:"none", border:"none", color:C.dim, cursor:"pointer", fontSize:16, lineHeight:1 }}>×</button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {confirmRemove && (
        <ConfirmModal
          name="Remove exercise?"
          body={<><strong style={{ color:C.text }}>{ex.name}</strong> will be removed along with all its logged sessions. This can't be undone.</>}
          onConfirm={() => { setConfirmRemove(false); onRemove(); }}
          onClose={() => setConfirmRemove(false)}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Weekly Planner
// ─────────────────────────────────────────────
const WeeklyPlanner = ({ exercises, plan, onPlanChange, onOpenExercise, logs }) => {
  const [activeDay, setActiveDay]     = useState(todayName());
  const [showPicker, setShowPicker]   = useState(false);
  const [pickerGroup, setPickerGroup] = useState("All");
  const exMap = Object.fromEntries(exercises.map(e => [e.id, e]));

  const dayList = plan[activeDay] || [];

  const move = (idx, dir) => {
    const list = [...dayList];
    const ni = idx + dir;
    if (ni < 0 || ni >= list.length) return;
    [list[idx], list[ni]] = [list[ni], list[idx]];
    onPlanChange({ ...plan, [activeDay]:list });
  };

  const removeFromDay = id => onPlanChange({ ...plan, [activeDay]:dayList.filter(x => x !== id) });

  const addToDay = id => {
    if (dayList.includes(id)) return;
    onPlanChange({ ...plan, [activeDay]:[...dayList, id] });
    setShowPicker(false);
  };

  const pickable = exercises.filter(ex =>
    !dayList.includes(ex.id) &&
    (pickerGroup === "All" || (ex.group || "Custom") === pickerGroup)
  );

  return (
    <div>
      {/* Day selector */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:16 }}>
        {DAYS.map((d, i) => {
          const isToday = d === todayName();
          const active  = d === activeDay;
          const count   = (plan[d]||[]).length;
          return (
            <button key={d} onClick={() => setActiveDay(d)}
              style={{ padding:"8px 2px", borderRadius:8, border:`1px solid ${active ? C.purple : isToday ? C.indigo+"55" : C.border}`, background:active ? C.purple+"22" : isToday ? C.indigo+"11" : C.input, color:active ? C.purple : isToday ? C.indigo : C.muted, cursor:"pointer", textAlign:"center" }}>
              <div style={{ fontSize:10, fontWeight:700 }}>{DAY_SHORT[i]}</div>
              {count > 0 && <div style={{ fontSize:9, color:active ? C.purple : C.dim, marginTop:2 }}>{count}</div>}
              {isToday && <div style={{ width:4, height:4, borderRadius:"50%", background:active ? C.purple : C.indigo, margin:"3px auto 0" }} />}
            </button>
          );
        })}
      </div>

      {/* Day heading */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, marginTop:4 }}>
        <div style={{ fontSize:14, fontWeight:800 }}>
          {activeDay}
          {activeDay === todayName() && <span style={{ fontSize:10, color:C.green, fontWeight:600, marginLeft:8 }}>Today</span>}
        </div>
        <button onClick={() => setShowPicker(true)}
          style={{ background:C.input, border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", color:C.muted, fontSize:10, fontWeight:600, cursor:"pointer" }}>
          + Add
        </button>
      </div>

      {/* Exercises for this day */}
      {dayList.length === 0 ? (
        <Card style={{ textAlign:"center", color:C.dim, padding:"28px 16px" }}>
          Rest day — nothing scheduled.<br/>
          <span style={{ fontSize:12 }}>Tap "+ Add exercise" to build this session.</span>
        </Card>
      ) : (
        dayList.map((exId, idx) => {
          const ex = exMap[exId]; if (!ex) return null;
          const latest = (logs[exId]||[]).length ? (logs[exId])[(logs[exId]).length - 1] : null;
          const doneToday = latest && daysSince(latest.date) === 0;
          return (
            <div key={exId} style={{ background:C.card, border:`1px solid ${doneToday ? C.green+"44" : C.border}`, borderRadius:12, padding:"12px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:10 }}>
              {/* Order controls */}
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <button onClick={() => move(idx, -1)} disabled={idx === 0}
                  style={{ background:"none", border:"none", color:idx === 0 ? C.dim : C.purple, cursor:idx === 0 ? "default" : "pointer", fontSize:16, lineHeight:1, padding:"2px 5px" }}>▲</button>
                <button onClick={() => move(idx, 1)} disabled={idx === dayList.length - 1}
                  style={{ background:"none", border:"none", color:idx === dayList.length - 1 ? C.dim : C.purple, cursor:idx === dayList.length - 1 ? "default" : "pointer", fontSize:16, lineHeight:1, padding:"2px 5px" }}>▼</button>
              </div>
              {/* Info */}
              <div style={{ flex:1, cursor:"pointer" }} onClick={() => onOpenExercise(exId)}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  {doneToday && <span style={{ fontSize:14, color:C.green }}>✓</span>}
                  <span style={{ fontSize:12, fontWeight:700, color:doneToday ? C.green : C.text }}>{ex.name}</span>
                </div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{ex.unit} · tap to view & log</div>
              </div>
              <button onClick={() => removeFromDay(exId)}
                style={{ background:"none", border:"none", color:C.dim, cursor:"pointer", fontSize:18, lineHeight:1, padding:"4px" }}>×</button>
            </div>
          );
        })
      )}

      {/* Exercise Picker Sheet */}
      {showPicker && (
        <ModalSheet title={`Add to ${activeDay}`} onClose={() => setShowPicker(false)}>
          {/* Group filter */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
            {["All", "Favourites", ...GROUPS, "Custom"].map(g => (
              <button key={g} onClick={() => setPickerGroup(g)}
                style={{ padding:"5px 11px", borderRadius:6, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, background:pickerGroup===g ? C.indigo : C.input, color:pickerGroup===g ? "#fff" : C.muted }}>
                {g}
              </button>
            ))}
          </div>
          {/* List */}
          {pickable.length === 0 ? (
            <div style={{ textAlign:"center", color:C.dim, padding:"20px 0", fontSize:13 }}>
              All exercises in this group are already added.
            </div>
          ) : (
            pickable.map(ex => (
              <div key={ex.id} onClick={() => addToDay(ex.id)}
                style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.border}`, cursor:"pointer" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{ex.name}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{ex.group} · {ex.unit}</div>
                </div>
                <span style={{ fontSize:20, color:C.purple, fontWeight:700 }}>+</span>
              </div>
            ))
          )}
        </ModalSheet>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
const Dashboard = ({ exercises, logs, plan, onOpenExercise, favourites, streakData }) => {
  const today = todayName();
  const todayPlan = plan[today] || [];
  const exMap = Object.fromEntries(exercises.map(e => [e.id, e]));

  const allSessions = exercises
    .flatMap(ex => (logs[ex.id]||[]).map(e => ({ ...e, ex })))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const now = Date.now();
  const totalSessions = allSessions.length;
  const last7  = allSessions.filter(s => now - new Date(s.date) < 7  * 86400000).length;
  const last30 = allSessions.filter(s => now - new Date(s.date) < 30 * 86400000).length;
  const exercisedToday = allSessions.length && daysSince(allSessions[0]?.date) === 0;

  const recency = exercises.map(ex => {
    const exLogs = logs[ex.id] || [];
    const last   = exLogs.length ? exLogs[exLogs.length - 1] : null;
    return { ex, last, days:daysSince(last?.date) };
  }).sort((a, b) => {
    if (a.days === null && b.days === null) return 0;
    if (a.days === null) return 1;
    if (b.days === null) return -1;
    return a.days - b.days;
  });

  return (
    <div>
      {/* Stat tiles */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:12 }}>
        {[
          { label:"Total",   value:totalSessions, color:C.purple },
          { label:"7 days",  value:last7,         color:C.indigo },
          { label:"30 days", value:last30,        color:C.amber  },
        ].map(s => (
          <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 8px" }}>
            <div style={{ fontSize:9, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:3 }}>{s.label}</div>
            <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Streak row on dashboard */}
      {(streakData.currentStreak > 0 || streakData.weeksCompleted > 0) && (
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          {streakData.currentStreak > 0 && (
            <div style={{ flex:1, background:"#0f2a1a", border:"1px solid #1a4a2a", borderRadius:8, padding:"8px 10px", display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:16 }}>🔥</span>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.green }}>{streakData.currentStreak}</div>
                <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase" }}>day streak</div>
              </div>
            </div>
          )}
          {streakData.weeksCompleted > 0 && (
            <div style={{ flex:1, background:"#1a1a2e", border:`1px solid ${C.indigo}44`, borderRadius:8, padding:"8px 10px", display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:16 }}>📅</span>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.indigo }}>{streakData.weeksCompleted}</div>
                <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase" }}>full week{streakData.weeksCompleted!==1?"s":""}</div>
              </div>
            </div>
          )}
        </div>
      )}
      {streakData.muscleGroupWarnings.length > 0 && (
        <div style={{ background:"#2a1a0a", border:"1px solid #4a3a0a", borderRadius:8, padding:"8px 12px", marginBottom:10, fontSize:11, color:C.amber }}>
          ⚠️ Recovery: {streakData.muscleGroupWarnings.join(", ")} hit 3+ days running — rest these groups today.
        </div>
      )}

      {exercisedToday && (
        <div style={{ background:"#0f2a1a", border:"1px solid #1a4a2a", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13, color:C.green, fontWeight:600 }}>
          💪 Session logged today. Keep it up!
        </div>
      )}

      {/* Today's plan */}
      <SectionLabel>Today — {today}</SectionLabel>
      {todayPlan.length === 0 ? (
        <Card style={{ textAlign:"center", color:C.dim, padding:"20px", marginBottom:14 }}>
          Rest day. Set up your plan in 📅 Plan.
        </Card>
      ) : (
        <Card style={{ marginBottom:14 }}>
          {todayPlan.map((exId, i) => {
            const ex = exMap[exId]; if (!ex) return null;
            const latest = (logs[exId]||[]).length ? logs[exId][logs[exId].length - 1] : null;
            const done   = latest && daysSince(latest.date) === 0;
            const val    = latest ? (ex.bw ? `${latest.reps} ${ex.unit}` : `${latest.weight}kg`) : null;
            return (
              <div key={exId} onClick={() => onOpenExercise(exId)}
                style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:i < todayPlan.length-1 ? `1px solid ${C.border}` : "none", cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:24, height:24, borderRadius:"50%", border:`2px solid ${done ? C.green : C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:done ? C.green : C.dim, flexShrink:0 }}>
                    {done ? "✓" : i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:done ? C.green : C.text }}>{ex.name}</div>
                    {val && <div style={{ fontSize:11, color:C.muted }}>Last: {val}</div>}
                  </div>
                </div>
                <span style={{ fontSize:11, color:C.muted }}>tap →</span>
              </div>
            );
          })}
        </Card>
      )}

      {/* Favourites */}
      {favourites.length > 0 && <>
        <SectionLabel>Favourites</SectionLabel>
        {favourites.map(ex => {
          const latest = (logs[ex.id]||[]).length ? logs[ex.id][logs[ex.id].length - 1] : null;
          return (
            <ExerciseCard key={ex.id} ex={ex} latestEntry={latest} logCount={(logs[ex.id]||[]).length}
              scheduledDays={DAYS.filter(d => (plan[d]||[]).includes(ex.id))} isFav={true}
              onTap={() => onOpenExercise(ex.id)} onFavToggle={null} />
          );
        })}
      </>}

      {/* Days since */}
      <SectionLabel>Days since last session</SectionLabel>
      <Card>
        {recency.map(({ ex, last, days }, i) => {
          const dl  = daysLabel(days);
          const latest = last;
          const val = latest ? (ex.bw ? `${latest.reps} ${ex.unit}` : `${latest.weight}kg`) : null;
          return (
            <div key={ex.id} onClick={() => onOpenExercise(ex.id)}
              style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:i < recency.length - 1 ? `1px solid ${C.border}` : "none", cursor:"pointer" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:dl.color, flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:12, fontWeight:600 }}>{ex.name}</div>
                  {val && <div style={{ fontSize:11, color:C.muted }}>Last: {val}</div>}
                </div>
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:dl.color }}>{dl.text}</div>
            </div>
          );
        })}
      </Card>

      {/* Recent sessions */}
      {allSessions.length > 0 && <>
        <SectionLabel>Recent sessions</SectionLabel>
        <Card>
          {allSessions.slice(0, 8).map((s, i) => {
            const val = s.ex.bw ? `${s.reps} ${s.ex.unit}` : `${s.weight}kg`;
            return (
              <div key={i} onClick={() => onOpenExercise(s.ex.id)}
                style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:i < 7 ? `1px solid ${C.border}` : "none", cursor:"pointer" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{s.ex.name}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{fmtDate(s.date)}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:14, fontWeight:700 }}>{val}</div>
                  {s.sets && <div style={{ fontSize:11, color:C.purple }}>{s.sets} sets</div>}
                </div>
              </div>
            );
          })}
        </Card>
      </>}
    </div>
  );
};

// ─────────────────────────────────────────────
// Profile Tab
// ─────────────────────────────────────────────
const ProfileTab = ({ profile, onUpdate }) => {
  const [form, setForm] = useState({ ...EMPTY_PROFILE, ...profile });
  const [saved, setSaved] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));
  const bmi  = calcBMI(form.weight, form.height);
  const bl   = bmiMeta(bmi);

  const save = () => { onUpdate(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <div style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>Your Profile</div>
      {bmi && (
        <Card style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>BMI</div>
            <div style={{ fontSize:28, fontWeight:800, color:bl.color }}>{bmi}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:15, fontWeight:700, color:bl.color }}>{bl.label}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{form.weight}kg · {form.height}cm</div>
          </div>
        </Card>
      )}
      <Card>
        <Input label="Name" placeholder="Your name" value={form.name} onChange={e => set("name", e.target.value)} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
          <Input label="Age" type="number" placeholder="46" value={form.age} onChange={e => set("age", e.target.value)} style={{ marginBottom:0 }} />
          <Input label="Weight (kg)" type="number" placeholder="90" value={form.weight} onChange={e => set("weight", e.target.value)} style={{ marginBottom:0 }} />
          <Input label="Height (cm)" type="number" placeholder="178" value={form.height} onChange={e => set("height", e.target.value)} style={{ marginBottom:0 }} />
        </div>
        <label style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:8, display:"block" }}>Main goal</label>
        <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:16 }}>
          {GOALS.map(g => (
            <button key={g} onClick={() => set("goal", g)}
              style={{ background:form.goal===g ? C.indigo : C.input, border:`1px solid ${form.goal===g ? C.indigo : C.border}`, borderRadius:8, padding:"10px 14px", color:form.goal===g ? "#fff" : C.text, fontWeight:600, fontSize:13, cursor:"pointer", textAlign:"left", transition:"all .15s" }}>{g}</button>
          ))}
        </div>
        <label style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:8, display:"block" }}>Experience</label>
        <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:20 }}>
          {EXP.map(e => (
            <button key={e} onClick={() => set("experience", e)}
              style={{ background:form.experience===e ? C.indigo : C.input, border:`1px solid ${form.experience===e ? C.indigo : C.border}`, borderRadius:8, padding:"10px 14px", color:form.experience===e ? "#fff" : C.text, fontWeight:600, fontSize:13, cursor:"pointer", textAlign:"left", transition:"all .15s" }}>{e}</button>
          ))}
        </div>
        <Btn onClick={save}>Save Profile</Btn>
        {saved && <div style={{ textAlign:"center", color:C.green, fontSize:12, fontWeight:600, marginTop:8 }}>✓ Saved!</div>}
      </Card>

      {/* Training schedule */}
      <Card style={{ marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:700, marginBottom:4, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>Training schedule</div>
        <div style={{ fontSize:11, color:C.dim, marginBottom:12, lineHeight:1.5 }}>Update your training days and gym access.</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {DAYS.map(day => {
            const current = form.trainingDays?.[day] || "rest";
            return (
              <div key={day} style={{ background:C.input, border:`1px solid ${current !== "rest" ? C.indigo+"44" : C.border}`, borderRadius:8, padding:"8px 10px" }}>
                <div style={{ fontSize:12, fontWeight:700, marginBottom:6, color:current !== "rest" ? C.text : C.muted }}>{day}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4 }}>
                  {GYM_TYPES.map(g => (
                    <button key={g.id} onClick={() => set("trainingDays", { ...(form.trainingDays||{}), [day]:g.id })}
                      style={{ padding:"5px 2px", borderRadius:6, border:`1px solid ${current===g.id ? C.indigo : C.border}`, background:current===g.id ? C.indigo : C.card, color:current===g.id ? "#fff" : C.muted, fontSize:9, fontWeight:600, cursor:"pointer", textAlign:"center", lineHeight:1.4, transition:"all .15s" }}>
                      <div style={{ fontSize:13 }}>{g.icon}</div>
                      <div>{g.id === "rest" ? "Rest" : g.id === "gym" ? "Gym" : g.id === "home" ? "Home" : "DBs"}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Email preferences */}
      <Card>
        <div style={{ fontSize:12, fontWeight:700, marginBottom:4, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>Email summaries</div>
        <div style={{ fontSize:11, color:C.dim, marginBottom:14, lineHeight:1.5 }}>
          Receive a summary of your training progress by email.
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={form.email || ""}
          onChange={e => { set("email", e.target.value); setEmailErr(""); }}
          style={{ marginBottom:emailErr ? 4 : 14 }}
        />
        {emailErr && <div style={{ fontSize:11, color:C.red, marginBottom:12 }}>{emailErr}</div>}

        {(form.email || "").length > 0 && (
          <>
            {/* Consent toggle */}
            <div onClick={() => set("emailConsent", !form.emailConsent)}
              style={{ display:"flex", alignItems:"flex-start", gap:12, background:form.emailConsent ? "#1a2a1a" : C.input, border:`1px solid ${form.emailConsent ? C.green+"66" : C.border}`, borderRadius:10, padding:"12px 14px", cursor:"pointer", marginBottom:12, transition:"all .2s" }}>
              <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${form.emailConsent ? C.green : C.inputB}`, background:form.emailConsent ? C.green : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, transition:"all .2s" }}>
                {form.emailConsent && <span style={{ color:"#fff", fontSize:13, fontWeight:800, lineHeight:1 }}>✓</span>}
              </div>
              <div style={{ fontSize:12, color:form.emailConsent ? C.text : C.muted, lineHeight:1.6 }}>
                I agree to receive progress summary emails. I can unsubscribe at any time by unchecking this box.
              </div>
            </div>

            {/* Frequency */}
            {form.emailConsent && (
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:8, display:"block" }}>Summary frequency</label>
                <div style={{ display:"flex", gap:8 }}>
                  {["weekly","monthly"].map(f => (
                    <button key={f} onClick={() => set("emailFrequency", f)}
                      style={{ flex:1, padding:"9px 0", borderRadius:8, border:`1px solid ${form.emailFrequency===f ? C.indigo : C.border}`, background:form.emailFrequency===f ? C.indigo : C.input, color:form.emailFrequency===f ? "#fff" : C.muted, fontWeight:600, fontSize:12, cursor:"pointer", textTransform:"capitalize", transition:"all .15s" }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Unsubscribe / remove email */}
        {form.emailConsent && (
          <button onClick={() => { set("emailConsent", false); set("email", ""); }}
            style={{ background:"none", border:"none", color:C.red, fontSize:11, cursor:"pointer", padding:0, marginBottom:12, textDecoration:"underline" }}>
            Unsubscribe and remove my email
          </button>
        )}

        {/* Privacy note */}
        <div style={{ background:C.input, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", fontSize:10, color:C.dim, lineHeight:1.6 }}>
          🔒 Your email is stored locally on this device only. It is used solely for training summaries and is never shared with third parties.
        </div>

        <div style={{ marginTop:12 }}>
          <Btn onClick={() => {
            if ((form.email||"").length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
              setEmailErr("Please enter a valid email address.");
              return;
            }
            save();
          }}>Save email preferences</Btn>
        </div>
        {saved && <div style={{ textAlign:"center", color:C.green, fontSize:12, fontWeight:600, marginTop:8 }}>✓ Preferences saved!</div>}
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────
// Default plan builder — uses actual training days + gym type from profile
// ─────────────────────────────────────────────
function buildDefaultPlan(profile) {
  const goal         = profile?.goal || "";
  const trainingDays = profile?.trainingDays || {};

  // Exercise pools by location capability
  const GYM_EXERCISES = {
    // Full gym: all exercises available
    gym: {
      push:  ["bench","incline","chestpress","pecfly","cablefly","shoulder","lateraise","frontraise","reardelt","triceps","skullcrush"],
      pull:  ["pulldown","row","seatedrow","dbrow","tbar","bicepcurl","dbcurl","hammer","preacher"],
      legs:  ["legpress","rdl","legext","legcurl","calfpress","hipabduct","hipadduct"],
      core:  ["crunches","abcrunch","cabletwist","legrise","plank"],
    },
    // Home gym (barbell + rack): most compound work
    home: {
      push:  ["bench","incline","shoulder","lateraise","triceps","skullcrush"],
      pull:  ["row","dbrow","bicepcurl","dbcurl","hammer"],
      legs:  ["rdl","legcurl","calfpress","crunches"],
      core:  ["crunches","plank","legrise"],
    },
    // Dumbbells only: limited compound
    dumbbells: {
      push:  ["dbflat","incline","lateraise","frontraise","reardelt","diptricep"],
      pull:  ["dbrow","dbcurl","hammer","preacher"],
      legs:  ["rdl","legcurl","calfpress","hipadduct"],
      core:  ["crunches","plank","legrise"],
    },
  };

  // Determine the session "type" rotation based on goal + number of training days
  const activeDays = DAYS.filter(d => trainingDays[d] && trainingDays[d] !== "rest");
  const n = activeDays.length;

  // Session templates by goal
  const sessionTypes = (() => {
    if (goal.includes("muscle") || goal.includes("size")) {
      // Push / Pull / Legs rotation
      return ["push","pull","legs","push","pull","legs","fullbody"];
    }
    if (goal.includes("strength") || goal.includes("health")) {
      return ["fullbody","fullbody","fullbody","fullbody","fullbody","fullbody","fullbody"];
    }
    if (goal.includes("athletic")) {
      return ["push","legs","pull","fullbody","legs","push","pull"];
    }
    // Fat loss
    return ["fullbody","push","legs","pull","fullbody","push","pull"];
  })();

  // Build exercises for a session type + gym type
  function sessionExercises(type, gymType) {
    const pool = GYM_EXERCISES[gymType] || GYM_EXERCISES.gym;
    const pick = (arr, n) => arr.slice(0, n);
    if (type === "push")     return [...pick(pool.push, 4), ...pick(pool.core, 1)];
    if (type === "pull")     return [...pick(pool.pull, 4), ...pick(pool.core, 1)];
    if (type === "legs")     return [...pick(pool.legs, 4), ...pick(pool.core, 1)];
    // fullbody: mix of push/pull/legs
    return [...pick(pool.push, 2), ...pick(pool.pull, 2), ...pick(pool.legs, 2), ...pick(pool.core, 1)];
  }

  // Assign sessions to active days, cycle through session types
  const plan = Object.fromEntries(DAYS.map(d => [d, []]));
  activeDays.forEach((day, i) => {
    const gymType  = trainingDays[day] || "gym";
    const sessType = sessionTypes[i % sessionTypes.length];
    plan[day] = sessionExercises(sessType, gymType);
  });

  return plan;
}

// ─────────────────────────────────────────────
// AI Coaching Suggestions
// ─────────────────────────────────────────────
const CoachingSuggestion = ({ ex, entries, profile }) => {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const canSuggest = entries.length >= 2;

  const getSuggestion = async () => {
    if (!canSuggest) return;
    setLoading(true);
    setError(null);
    setSuggestion(null);

    const recent = entries.slice(-5).map((e, i) => ({
      session: i + 1,
      date: fmtDate(e.date),
      weight: e.weight,
      reps: e.reps,
      sets: e.sets,
      notes: e.notes || "",
    }));

    const prompt = `You are a concise personal strength coach AI. Based on this data, give a short, specific coaching suggestion for the next session.

Exercise: ${ex.name} (${ex.unit})
User profile: Age ${profile?.age || "unknown"}, ${profile?.weight || "unknown"}kg, Goal: ${profile?.goal || "Build muscle"}, Experience: ${profile?.experience || "Some experience"}
Benchmarks: Baseline ${ex.baseline[0]}-${ex.baseline[1]}kg, 6-month target ${ex.t6[0]}-${ex.t6[1]}kg, Peak target ${ex.t18[0]}-${ex.t18[1]}kg
${ex.bw ? "Note: This is a bodyweight/reps exercise." : ""}

Recent sessions (oldest to newest):
${JSON.stringify(recent, null, 2)}

Give a BRIEF coaching tip (2-3 sentences max) covering:
1. Whether to increase weight, reps, or sets next session and by how much
2. One technique or recovery tip if relevant
3. How they're tracking vs their targets

Be direct and specific with numbers. No fluff. Start with the action e.g. "Next session, try..."`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data?.content?.find(b => b.type === "text")?.text;
      if (text) setSuggestion(text);
      else setError("No suggestion returned.");
    } catch {
      setError("Couldn't load suggestion right now.");
    }
    setLoading(false);
  };

  if (!canSuggest) return (
    <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", marginBottom:12 }}>
      <div style={{ fontSize:11, color:C.dim }}>🤖 Log at least 2 sessions to unlock AI coaching suggestions.</div>
    </div>
  );

  return (
    <div style={{ background:"linear-gradient(135deg,#1a1a2e,#13132a)", border:`1px solid ${C.indigo}44`, borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: suggestion || loading ? 10 : 0 }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.indigo }}>🤖 AI Coach</div>
        {!loading && (
          <button onClick={getSuggestion}
            style={{ background:C.indigo, border:"none", borderRadius:6, padding:"4px 10px", color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer" }}>
            {suggestion ? "Refresh" : "Get suggestion"}
          </button>
        )}
      </div>
      {loading && (
        <div style={{ fontSize:11, color:C.muted, fontStyle:"italic" }}>Analysing your sessions…</div>
      )}
      {suggestion && !loading && (
        <div style={{ fontSize:12, color:C.text, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{suggestion}</div>
      )}
      {error && !loading && (
        <div style={{ fontSize:11, color:C.red }}>{error}</div>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────
// FEATURE: Streak calculator (safe — respects rest days from plan)
// ─────────────────────────────────────────────
function calcStreaks(logs, plan, exercises) {
  // Build a set of dates that had at least one session logged
  const loggedDates = new Set();
  exercises.forEach(ex => {
    (logs[ex.id] || []).forEach(e => {
      loggedDates.add(e.date.slice(0, 10));
    });
  });

  // Build set of planned rest days by day-of-week name
  const restDayNames = new Set(
    DAYS.filter(d => !plan[d] || plan[d].length === 0)
  );

  // Walk backwards from today, counting streak
  // A day counts toward streak if: (a) it had a session, OR (b) it was a planned rest day
  // Streak breaks only when a PLANNED training day has zero sessions
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak    = 0;
  let streakBroken  = false;

  for (let i = 0; i < 365; i++) {
    const d    = new Date(); d.setDate(d.getDate() - i);
    const iso  = d.toISOString().slice(0, 10);
    const name = DAYS[(d.getDay() + 6) % 7];
    const isRest    = restDayNames.has(name);
    const hasSession = loggedDates.has(iso);

    if (isRest) {
      // Rest day — doesn't break streak, doesn't add to it
      continue;
    }

    if (hasSession) {
      tempStreak++;
      if (!streakBroken) currentStreak = tempStreak;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      // Planned training day with no session — breaks streak
      if (!streakBroken && i > 0) streakBroken = true;
      tempStreak = 0;
    }
  }

  // Consecutive training weeks (completed all planned days in a week)
  const weeksCompleted = (() => {
    let weeks = 0;
    for (let w = 1; w <= 12; w++) {
      const weekDays = DAYS.map((name, idx) => {
        const d = new Date();
        const todayDow = (d.getDay() + 6) % 7;
        d.setDate(d.getDate() - todayDow - (w - 1) * 7 + idx);
        return { name, iso: d.toISOString().slice(0, 10) };
      });
      const plannedThisWeek = weekDays.filter(({ name }) => plan[name]?.length > 0);
      if (plannedThisWeek.length === 0) continue;
      const allDone = plannedThisWeek.every(({ iso }) => loggedDates.has(iso));
      if (allDone) weeks++;
      else break;
    }
    return weeks;
  })();

  // Muscle group overuse check — same group hit 3+ days in a row
  const muscleGroupWarnings = (() => {
    const groupMap = {};
    exercises.forEach(ex => {
      const g = ex.group || "Other";
      (logs[ex.id] || []).forEach(e => {
        const date = e.date.slice(0, 10);
        if (!groupMap[g]) groupMap[g] = new Set();
        groupMap[g].add(date);
      });
    });
    const warnings = [];
    Object.entries(groupMap).forEach(([group, dates]) => {
      const sorted = Array.from(dates).sort();
      let run = 1;
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]), curr = new Date(sorted[i]);
        const diff = (curr - prev) / 86400000;
        if (diff === 1) { run++; if (run >= 3) warnings.push(group); break; }
        else run = 1;
      }
    });
    return [...new Set(warnings)];
  })();

  return { currentStreak, longestStreak, weeksCompleted, muscleGroupWarnings };
}

// ─────────────────────────────────────────────
// FEATURE: Body weight tracker
// ─────────────────────────────────────────────
const BodyWeightTracker = ({ bodyWeights, onAdd, onDelete }) => {
  const [val, setVal]   = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mode, setMode] = useState("today");

  const sorted = [...(bodyWeights || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest = sorted.length ? sorted[sorted.length - 1] : null;
  const first  = sorted.length > 1 ? sorted[0] : null;
  const change = (latest && first) ? (latest.weight - first.weight).toFixed(1) : null;
  const data   = sorted.map(e => ({ label: fmtDate(e.date), value: e.weight }));

  const add = () => {
    if (!val) return;
    const isoDate = mode === "today" ? new Date().toISOString() : new Date(date + "T12:00:00").toISOString();
    onAdd({ date: isoDate, weight: parseFloat(val) });
    setVal("");
  };

  return (
    <div>
      <SectionLabel>Body Weight</SectionLabel>
      <Card>
        {/* Summary row */}
        {latest && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
            {[
              { label:"Current",  value:`${latest.weight}kg`,  color:C.text   },
              { label:"Change",   value:change !== null ? `${change > 0 ? "+" : ""}${change}kg` : "–", color:change > 0 ? C.red : change < 0 ? C.green : C.muted },
              { label:"Entries",  value:sorted.length, color:C.purple },
            ].map(s => (
              <div key={s.label} style={{ background:C.input, borderRadius:8, padding:"8px 10px" }}>
                <div style={{ fontSize:9, color:C.muted, fontWeight:600, textTransform:"uppercase", marginBottom:3 }}>{s.label}</div>
                <div style={{ fontSize:16, fontWeight:800, color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        {data.length >= 2 && (
          <div style={{ marginBottom:12 }}>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={data} margin={{ top:4, right:16, left:-14, bottom:0 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill:C.muted, fontSize:9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:C.muted, fontSize:9 }} axisLine={false} tickLine={false} domain={["auto","auto"]} />
                <Tooltip content={<ChartTooltip unit="kg" />} />
                <Line type="monotone" dataKey="value" name="Weight" stroke={C.indigo} strokeWidth={2} dot={{ fill:C.indigo, r:3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Log form */}
        <div style={{ display:"flex", gap:6, marginBottom:8 }}>
          <button onClick={() => setMode("today")} style={{ flex:1, padding:"6px 0", borderRadius:6, border:`1px solid ${mode==="today"?C.indigo:C.border}`, background:mode==="today"?C.indigo:C.input, color:mode==="today"?"#fff":C.muted, fontSize:10, fontWeight:600, cursor:"pointer" }}>Today</button>
          <button onClick={() => setMode("past")}  style={{ flex:1, padding:"6px 0", borderRadius:6, border:`1px solid ${mode==="past"?C.indigo:C.border}`, background:mode==="past"?C.indigo:C.input, color:mode==="past"?"#fff":C.muted, fontSize:10, fontWeight:600, cursor:"pointer" }}>Past date</button>
        </div>
        {mode === "past" && (
          <input type="date" value={date} max={new Date().toISOString().slice(0,10)}
            onChange={e => setDate(e.target.value)}
            style={{ width:"100%", background:C.input, border:`1px solid ${C.inputB}`, borderRadius:7, padding:"8px 10px", color:C.text, fontSize:12, outline:"none", boxSizing:"border-box", marginBottom:8 }} />
        )}
        <div style={{ display:"flex", gap:8 }}>
          <input type="number" placeholder="e.g. 89.5" value={val} onChange={e => setVal(e.target.value)}
            style={{ flex:1, background:C.input, border:`1px solid ${C.inputB}`, borderRadius:7, padding:"9px 12px", color:C.text, fontSize:13, outline:"none" }} />
          <button onClick={add} style={{ background:C.grad, border:"none", borderRadius:7, padding:"9px 16px", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>Log</button>
        </div>

        {/* History */}
        {sorted.length > 0 && (
          <div style={{ marginTop:12 }}>
            {[...sorted].reverse().slice(0, 8).map((e, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:i < Math.min(sorted.length,8)-1?`1px solid ${C.border}`:"none" }}>
                <div>
                  <span style={{ fontSize:13, fontWeight:700 }}>{e.weight}kg</span>
                  <span style={{ fontSize:11, color:C.muted, marginLeft:8 }}>{fmtDate(e.date)}</span>
                </div>
                <button onClick={() => onDelete(i)} style={{ background:"none", border:"none", color:C.dim, cursor:"pointer", fontSize:14 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────
// FEATURE: Personal Records detector
// ─────────────────────────────────────────────
function getPersonalRecords(logs, exercises) {
  const prs = {};
  exercises.forEach(ex => {
    const entries = logs[ex.id] || [];
    if (!entries.length) return;
    const vals = entries.map(e => ex.bw ? (e.reps || 0) : (e.weight || 0)).filter(v => v > 0);
    if (!vals.length) return;
    const best = Math.max(...vals);
    const bestEntry = entries.find(e => (ex.bw ? e.reps : e.weight) === best);
    prs[ex.id] = { best, date: bestEntry?.date };
  });
  return prs;
}

// ─────────────────────────────────────────────
// FEATURE: Rest timer
// ─────────────────────────────────────────────
const RestTimer = () => {
  const PRESETS = [60, 90, 120, 180];
  const [seconds,  setSeconds]  = useState(90);
  const [running,  setRunning]  = useState(false);
  const [remaining,setRemaining]= useState(90);
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) { setRunning(false); setDone(true); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);

  const start  = () => { setRemaining(seconds); setRunning(true); setDone(false); };
  const pause  = () => setRunning(false);
  const reset  = () => { setRunning(false); setRemaining(seconds); setDone(false); };
  const pct    = ((seconds - remaining) / seconds) * 100;
  const mmss   = `${String(Math.floor(remaining/60)).padStart(2,"0")}:${String(remaining%60).padStart(2,"0")}`;

  return (
    <Card style={{ marginBottom:12 }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Rest Timer</div>

      {/* Preset buttons */}
      <div style={{ display:"flex", gap:5, marginBottom:12 }}>
        {PRESETS.map(p => (
          <button key={p} onClick={() => { setSeconds(p); setRemaining(p); setRunning(false); setDone(false); }}
            style={{ flex:1, padding:"6px 0", borderRadius:6, border:`1px solid ${seconds===p?C.indigo:C.border}`, background:seconds===p?C.indigo:C.input, color:seconds===p?"#fff":C.muted, fontSize:10, fontWeight:600, cursor:"pointer" }}>
            {p}s
          </button>
        ))}
      </div>

      {/* Progress ring + time */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", marginBottom:12 }}>
        <div style={{ position:"relative", width:90, height:90 }}>
          <svg width="90" height="90" style={{ transform:"rotate(-90deg)" }}>
            <circle cx="45" cy="45" r="38" fill="none" stroke={C.border} strokeWidth="5" />
            <circle cx="45" cy="45" r="38" fill="none"
              stroke={done ? C.green : running ? C.indigo : C.muted}
              strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition:"stroke-dashoffset .5s linear, stroke .3s" }} />
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
            <div style={{ fontSize:done?11:18, fontWeight:800, color:done?C.green:C.text, lineHeight:1 }}>
              {done ? "Done!" : mmss}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", gap:8 }}>
        {!running
          ? <button onClick={start} style={{ flex:1, background:C.grad, border:"none", borderRadius:7, padding:"9px", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>
              {done ? "Again" : "Start"}
            </button>
          : <button onClick={pause} style={{ flex:1, background:C.input, border:`1px solid ${C.border}`, borderRadius:7, padding:"9px", color:C.text, fontWeight:700, fontSize:12, cursor:"pointer" }}>
              Pause
            </button>
        }
        <button onClick={reset} style={{ background:C.input, border:`1px solid ${C.border}`, borderRadius:7, padding:"9px 14px", color:C.muted, fontWeight:600, fontSize:12, cursor:"pointer" }}>
          Reset
        </button>
      </div>
    </Card>
  );
};

// ─────────────────────────────────────────────
// FEATURE: Progress photos (optional note + date marker)
// ─────────────────────────────────────────────
const ProgressPhotos = ({ photos, onAdd, onDelete }) => {
  const [note, setNote]  = useState("");
  const [date, setDate]  = useState(new Date().toISOString().slice(0, 10));

  const add = () => {
    if (!note.trim()) return;
    onAdd({ id: uid(), date: new Date(date + "T12:00:00").toISOString(), note: note.trim() });
    setNote("");
    setDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <div>
      <SectionLabel>Progress Check-ins</SectionLabel>
      <Card>
        <div style={{ fontSize:11, color:C.dim, marginBottom:12, lineHeight:1.5 }}>
          Log a dated note or milestone. Take a photo separately and reference it here — photos are never uploaded or stored.
        </div>

        {/* Add form */}
        <input type="date" value={date} max={new Date().toISOString().slice(0,10)}
          onChange={e => setDate(e.target.value)}
          style={{ width:"100%", background:C.input, border:`1px solid ${C.inputB}`, borderRadius:7, padding:"8px 10px", color:C.text, fontSize:12, outline:"none", boxSizing:"border-box", marginBottom:8 }} />
        <div style={{ display:"flex", gap:8 }}>
          <input placeholder="Note or milestone, e.g. 'Front progress photo, feeling stronger'" value={note}
            onChange={e => setNote(e.target.value)}
            style={{ flex:1, background:C.input, border:`1px solid ${C.inputB}`, borderRadius:7, padding:"9px 10px", color:C.text, fontSize:12, outline:"none" }} />
          <button onClick={add} style={{ background:C.grad, border:"none", borderRadius:7, padding:"9px 14px", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>Add</button>
        </div>

        {/* List */}
        {(photos || []).length === 0 && (
          <div style={{ textAlign:"center", color:C.dim, fontSize:12, padding:"16px 0 4px" }}>No check-ins yet.</div>
        )}
        {[...(photos||[])].sort((a,b)=>new Date(b.date)-new Date(a.date)).map((p, i) => (
          <div key={p.id||i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"9px 0", borderTop:`1px solid ${C.border}`, marginTop:8 }}>
            <div>
              <div style={{ fontSize:11, color:C.muted }}>{fmtDate(p.date)}</div>
              <div style={{ fontSize:13, color:C.text, marginTop:2 }}>{p.note}</div>
            </div>
            <button onClick={() => onDelete(p.id || i)} style={{ background:"none", border:"none", color:C.dim, cursor:"pointer", fontSize:14, marginLeft:8, flexShrink:0 }}>×</button>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────
// FEATURE: Export data (CSV + JSON)
// ─────────────────────────────────────────────
const ExportData = ({ logs, exercises, bodyWeights, profile }) => {
  const [exported, setExported] = useState(false);

  const exportCSV = () => {
    const rows = ["Exercise,Date,Weight (kg),Sets,Reps,Notes"];
    exercises.forEach(ex => {
      (logs[ex.id] || []).forEach(e => {
        rows.push([
          `"${ex.name}"`,
          fmtDate(e.date),
          e.weight || "",
          e.sets || "",
          e.reps || "",
          `"${(e.notes||"").replace(/"/g,'""')}"`,
        ].join(","));
      });
    });
    const blob = new Blob([rows.join("\n")], { type:"text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `strength-tracker-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  const exportJSON = () => {
    const payload = { profile, logs, bodyWeights, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `strength-tracker-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  // Total sessions across all exercises
  const totalSessions = exercises.reduce((n, ex) => n + (logs[ex.id]||[]).length, 0);

  return (
    <Card>
      <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Export data</div>
      <div style={{ fontSize:11, color:C.dim, marginBottom:14, lineHeight:1.5 }}>{totalSessions} sessions across {exercises.length} exercises.</div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={exportCSV} style={{ flex:1, background:C.input, border:`1px solid ${C.border}`, borderRadius:7, padding:"9px", color:C.text, fontWeight:600, fontSize:11, cursor:"pointer" }}>
          📄 Export CSV
        </button>
        <button onClick={exportJSON} style={{ flex:1, background:C.input, border:`1px solid ${C.border}`, borderRadius:7, padding:"9px", color:C.text, fontWeight:600, fontSize:11, cursor:"pointer" }}>
          💾 Backup JSON
        </button>
      </div>
      {exported && <div style={{ fontSize:11, color:C.green, textAlign:"center", marginTop:8 }}>✓ CSV downloaded!</div>}
    </Card>
  );
};


// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────
export default function App() {
  const [appReady,     setAppReady]     = useState(false);
  const [exercises,    setExercises]    = useState(SEED_EXERCISES);
  const [logs,         setLogs]         = useState({});
  const [plan,         setPlan]         = useState(EMPTY_PLAN);
  const [profile,      setProfile]      = useState(null);
  const [favourites,   setFavourites]   = useState([]);
  const [bodyWeights,  setBodyWeights]  = useState([]);
  const [photos,       setPhotos]       = useState([]);

  const [activeTab,   setActiveTab]   = useState("dashboard");
  const [detailId,    setDetailId]    = useState(null);
  const [navHistory,  setNavHistory]  = useState([]);
  const [showAdd,     setShowAdd]     = useState(false);
  const [groupFilter, setGroupFilter] = useState("All");
  const [chartType,   setChartType]   = useState("line");
  const [timeFilter,  setTimeFilter]  = useState(null);

  // Load all storage in one pass — eliminates race conditions
  useEffect(() => {
    loadAllStorage().then(data => {
      if (data["strength_profile"])      setProfile(data["strength_profile"]);
      if (data["strength_exercises"])    setExercises(data["strength_exercises"]);
      if (data["strength_logs"])         setLogs(data["strength_logs"]);
      if (data["strength_plan"])         setPlan(data["strength_plan"]);
      if (data["strength_favs"])         setFavourites(data["strength_favs"]);
      if (data["strength_bodyweights"])  setBodyWeights(data["strength_bodyweights"]);
      if (data["strength_photos"])       setPhotos(data["strength_photos"]);
      setAppReady(true);
    });
  }, []);

  // Persist helpers
  const persistProfile    = useCallback(v => { setProfile(v);    saveToStorage("strength_profile",   v); }, []);
  const persistExercises  = useCallback(v => { setExercises(v);  saveToStorage("strength_exercises", v); }, []);
  const persistLogs       = useCallback(v => { setLogs(v);       saveToStorage("strength_logs",      v); }, []);
  const persistPlan       = useCallback(v => { setPlan(v);       saveToStorage("strength_plan",      v); }, []);
  const persistFavourites  = useCallback(v => { setFavourites(v);  saveToStorage("strength_favs",         v); }, []);
  const persistBodyWeights = useCallback(v => { setBodyWeights(v); saveToStorage("strength_bodyweights", v); }, []);
  const persistPhotos      = useCallback(v => { setPhotos(v);      saveToStorage("strength_photos",      v); }, []);

  if (!appReady) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',system-ui,sans-serif", gap:14 }}>
        <div style={{ fontSize:20, fontWeight:800, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Strength Tracker</div>
        <div style={{ color:C.muted, fontSize:12 }}>Loading your data…</div>
      </div>
    );
  }

  // Onboarding gate — only shown when profile is genuinely absent from storage
  if (!profile) return <Onboarding onComplete={p => { persistProfile(p); persistPlan(buildDefaultPlan(p)); }} />;

  const getLatest = exId => { const e = logs[exId]; return e?.length ? e[e.length - 1] : null; };
  const streakData = calcStreaks(logs, plan, exercises);
  const personalRecords = getPersonalRecords(logs, exercises);

  const addLog = async (exId, entry) => persistLogs({ ...logs, [exId]:[...(logs[exId]||[]), entry] });
  const deleteEntry = async (exId, idx) => persistLogs({ ...logs, [exId]:(logs[exId]||[]).filter((_, i) => i !== idx) });
  const removeExercise = async id => {
    const newPlan = { ...plan }; DAYS.forEach(d => { newPlan[d] = (newPlan[d]||[]).filter(x => x !== id); });
    const newLogs = { ...logs }; delete newLogs[id];
    await persistExercises(exercises.filter(e => e.id !== id));
    await persistLogs(newLogs);
    await persistPlan(newPlan);
    await persistFavourites(favourites.filter(id2 => id2 !== id));
    setDetailId(null);
  };
  const toggleFav = id => persistFavourites(favourites.includes(id) ? favourites.filter(x => x !== id) : [...favourites, id]);

  const openExercise = (id, fromContext) => {
    setNavHistory(h => [...h, { detailId, tab: activeTab, label: fromContext }]);
    setDetailId(id);
  };

  const goBack = () => {
    if (navHistory.length > 0) {
      const prev = navHistory[navHistory.length - 1];
      setNavHistory(h => h.slice(0, -1));
      setDetailId(prev.detailId);
      if (!prev.detailId) setActiveTab(prev.tab);
    } else {
      setDetailId(null);
    }
  };

  const detailEx   = detailId ? exercises.find(e => e.id === detailId) : null;
  const favExList  = exercises.filter(e => favourites.includes(e.id));

  const TABS = [
    { id:"dashboard", icon:"🏠", label:"Home"      },
    { id:"plan",      icon:"📅", label:"Plan"      },
    { id:"exercises", icon:"💪", label:"Exercises" },
    { id:"overview",  icon:"📈", label:"Overview"  },
    { id:"stats",     icon:"⭐", label:"Stats"     },
    { id:"profile",   icon:"👤", label:"Profile"   },
  ];

  const profileSub = [
    profile.name,
    profile.age ? `Age ${profile.age}` : null,
    profile.weight ? `${profile.weight}kg` : null,
  ].filter(Boolean).join(" · ");

  // Build breadcrumb trail
  const tabLabels = { dashboard:"Home", plan:"Plan", exercises:"Exercises", overview:"Overview", profile:"Profile" };
  const crumbs = [
    { label:"Home", onClick: () => { setDetailId(null); setActiveTab("dashboard"); setNavHistory([]); } },
    ...(detailId ? [
      { label: tabLabels[activeTab] || activeTab, onClick: () => { setDetailId(null); setNavHistory([]); } },
      { label: detailEx?.name || "Exercise", onClick: null }
    ] : activeTab !== "dashboard" ? [
      { label: tabLabels[activeTab], onClick: null }
    ] : [])
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter',system-ui,sans-serif", paddingBottom:72, maxWidth:600, margin:"0 auto" }}>

      {/* Persistent top header with breadcrumbs */}
      <div style={{ background:"linear-gradient(135deg,#1a1a2e,#16162a)", borderBottom:`1px solid ${C.border}`, padding:"12px 16px 10px", position:"sticky", top:0, zIndex:40 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:14, fontWeight:800, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-0.01em" }}>
            ST
          </div>
          <div style={{ fontSize:11, color:C.muted }}>{profileSub}</div>
        </div>
        {/* Breadcrumb trail */}
        <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:6, flexWrap:"nowrap", overflowX:"auto" }}>
          {crumbs.map((c, i) => (
            <span key={i} style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
              {i > 0 && <span style={{ color:C.dim, fontSize:10 }}>›</span>}
              {c.onClick ? (
                <button onClick={c.onClick} style={{ background:"none", border:"none", color:C.muted, fontSize:11, cursor:"pointer", padding:"2px 4px", borderRadius:4, fontWeight:600, textDecoration:"underline", textDecorationColor:C.border }}>
                  {c.label}
                </button>
              ) : (
                <span style={{ fontSize:11, color:C.text, fontWeight:600, padding:"2px 4px" }}>{c.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"14px 14px 0" }}>

        {/* Detail view */}
        {detailId && detailEx && (
          <ExerciseDetail
            ex={detailEx}
            entries={logs[detailId] || []}
            plan={plan}
            profile={profile}
            isFav={favourites.includes(detailId)}
            isPB={!!personalRecords[detailId]}
            pbValue={personalRecords[detailId]?.best}
            onBack={goBack}
            onLog={entry => addLog(detailId, entry)}
            onDeleteEntry={idx => deleteEntry(detailId, idx)}
            onRemove={() => removeExercise(detailId)}
            onPlanChange={persistPlan}
            onFavToggle={() => toggleFav(detailId)}
          />
        )}

        {!detailId && activeTab === "dashboard" && (
          <Dashboard exercises={exercises} logs={logs} plan={plan} onOpenExercise={id => openExercise(id, "Home")} favourites={favExList} streakData={streakData} />
        )}

        {!detailId && activeTab === "plan" && (
          <>
            <div style={{ background:"linear-gradient(135deg,#1a1a2e,#13132a)", border:`1px solid ${C.indigo}44`, borderRadius:10, padding:"10px 14px", marginBottom:12, display:"flex", gap:10, alignItems:"flex-start" }}>
              <span style={{ fontSize:16 }}>📋</span>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:C.indigo, marginBottom:3 }}>Your suggested plan</div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>This plan was built for your goal: <span style={{ color:C.text, fontWeight:600 }}>{profile.goal}</span>. Tap any day to customise — add, remove or reorder exercises freely.</div>
              </div>
            </div>
            <WeeklyPlanner exercises={exercises} plan={plan} onPlanChange={persistPlan} onOpenExercise={id => openExercise(id, "Plan")} logs={logs} />
          </>
        )}

        {!detailId && activeTab === "exercises" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:12, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em" }}>{exercises.length} exercises</span>
              <Btn small onClick={() => setShowAdd(true)}>+ Add</Btn>
            </div>
            {/* Group filter */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14, overflowX:"auto", paddingBottom:4 }}>
              {["All","Favourites",...GROUPS,"Custom"].map(g => (
                <button key={g} onClick={() => setGroupFilter(g)}
                  style={{ padding:"5px 11px", borderRadius:6, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, background:groupFilter===g ? C.indigo : C.input, color:groupFilter===g ? "#fff" : C.muted, whiteSpace:"nowrap", flexShrink:0 }}>
                  {g === "Favourites" ? `★ Favs` : g}
                </button>
              ))}
            </div>
            {exercises
              .filter(ex => {
                if (groupFilter === "All") return true;
                if (groupFilter === "Favourites") return favourites.includes(ex.id);
                if (groupFilter === "Custom") return !!ex.custom;
                return (ex.group || "Custom") === groupFilter;
              })
              .map(ex => (
                <ExerciseCard
                  key={ex.id}
                  ex={ex}
                  latestEntry={getLatest(ex.id)}
                  logCount={(logs[ex.id]||[]).length}
                  scheduledDays={DAYS.filter(d => (plan[d]||[]).includes(ex.id))}
                  isFav={favourites.includes(ex.id)}
                  onTap={() => openExercise(ex.id, "Exercises")}
                  onFavToggle={() => toggleFav(ex.id)}
                />
              ))
            }
          </>
        )}

        {!detailId && activeTab === "overview" && (
          <>
            <Card style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                <div style={{ display:"flex", gap:6 }}>
                  {["line","bar"].map(t => (
                    <button key={t} onClick={() => setChartType(t)}
                      style={{ padding:"6px 13px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:chartType===t ? C.indigo : C.input, color:chartType===t ? "#fff" : C.muted }}>
                      {t === "line" ? "📈 Line" : "📊 Bar"}
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {TIME_FILTERS.map(f => (
                    <button key={f.label} onClick={() => setTimeFilter(f.days)}
                      style={{ padding:"6px 13px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:timeFilter===f.days ? C.indigo : C.input, color:timeFilter===f.days ? "#fff" : C.muted }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
            {exercises.map(ex => {
              const entries = filterTime(logs[ex.id]||[], timeFilter);
              const latest  = getLatest(ex.id);
              const pct     = progressPct(latest, ex);
              const bc      = barColor(pct);
              const vals    = entries.map(e => ex.bw ? e.reps : e.weight).filter(Boolean);
              const gain    = vals.length >= 2 ? vals[vals.length - 1] - vals[0] : null;
              const unit    = ex.bw ? ` ${ex.unit}` : "kg";
              return (
                <Card key={ex.id} onClick={() => openExercise(ex.id, "Overview")}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:700 }}>{ex.name}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {gain !== null && <span style={{ fontSize:11, color:gain >= 0 ? C.green : C.red, fontWeight:700 }}>{gain >= 0 ? "▲" : "▼"}{Math.abs(gain)}{unit}</span>}
                      <span style={{ fontSize:11, color:C.muted }}>tap →</span>
                    </div>
                  </div>
                  <ExChart ex={ex} entries={entries} chartType={chartType} />
                  <div style={{ marginTop:8 }}>
                    <ProgressBar pct={pct} color={bc} />
                    <div style={{ fontSize:11, color:C.muted, marginTop:4, textAlign:"right" }}>{pct}% to peak</div>
                  </div>
                </Card>
              );
            })}
          </>
        )}

        {!detailId && activeTab === "stats" && (
          <div>
            {/* Streak summary */}
            <SectionLabel>Training Streaks</SectionLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10 }}>
              {[
                { label:"Current streak",  value:`${streakData.currentStreak}`, suffix:"days",  color:C.green  },
                { label:"Longest streak",  value:`${streakData.longestStreak}`, suffix:"days",  color:C.purple },
                { label:"Weeks completed", value:`${streakData.weeksCompleted}`,suffix:"weeks", color:C.indigo },
              ].map(s => (
                <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 8px" }}>
                  <div style={{ fontSize:9, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:3 }}>{s.label}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:9, color:C.dim }}>{s.suffix}</div>
                </div>
              ))}
            </div>
            {streakData.muscleGroupWarnings.length > 0 && (
              <div style={{ background:"#2a1a1a", border:"1px solid #4a2a2a", borderRadius:8, padding:"10px 12px", marginBottom:10, fontSize:11, color:C.amber, lineHeight:1.6 }}>
                ⚠️ <strong>Recovery tip:</strong> {streakData.muscleGroupWarnings.join(", ")} trained 3+ days in a row — consider a rest day for these muscle groups.
              </div>
            )}

            {/* Personal Records */}
            <SectionLabel>Personal Records</SectionLabel>
            <Card style={{ marginBottom:10 }}>
              {exercises.filter(ex => personalRecords[ex.id]).map((ex, i, arr) => {
                const pr = personalRecords[ex.id];
                const unit = ex.bw ? ` ${ex.unit}` : "kg";
                return (
                  <div key={ex.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none" }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{ex.name}</div>
                      <div style={{ fontSize:10, color:C.muted }}>{pr.date ? fmtDate(pr.date) : ""}</div>
                    </div>
                    <div style={{ fontSize:15, fontWeight:800, color:C.amber }}>🏆 {pr.best}{unit}</div>
                  </div>
                );
              })}
              {exercises.filter(ex => personalRecords[ex.id]).length === 0 && (
                <div style={{ textAlign:"center", color:C.dim, fontSize:12, padding:"12px 0" }}>Log some sessions to see your records.</div>
              )}
            </Card>

            {/* Body weight */}
            <BodyWeightTracker
              bodyWeights={bodyWeights}
              onAdd={w => persistBodyWeights([...bodyWeights, w])}
              onDelete={id => persistBodyWeights(bodyWeights.filter((_, i) => i !== id))}
            />

            {/* Rest timer */}
            <SectionLabel>Rest Timer</SectionLabel>
            <RestTimer />

            {/* Progress check-ins / photos */}
            <ProgressPhotos
              photos={photos}
              onAdd={p => persistPhotos([...photos, p])}
              onDelete={id => persistPhotos(photos.filter(p => (p.id || photos.indexOf(p)) !== id))}
            />

            {/* Export */}
            <SectionLabel>Data</SectionLabel>
            <ExportData logs={logs} exercises={exercises} bodyWeights={bodyWeights} profile={profile} />
          </div>
        )}

        {!detailId && activeTab === "profile" && (
          <ProfileTab profile={profile} onUpdate={persistProfile} />
        )}
      </div>

      {/* Bottom nav bar */}
      {!detailId && (
        <nav style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:600, background:"linear-gradient(135deg,#1a1a2e,#16162a)", borderTop:`1px solid ${C.border}`, display:"grid", gridTemplateColumns:"repeat(5,1fr)", zIndex:50 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ background:"none", border:"none", padding:"10px 0 12px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              <span style={{ fontSize:18 }}>{t.icon}</span>
              <span style={{ fontSize:9, fontWeight:600, color:activeTab===t.id ? C.purple : C.dim, letterSpacing:"0.02em" }}>{t.label}</span>
              {activeTab === t.id && <div style={{ width:16, height:2, borderRadius:1, background:C.purple }} />}
            </button>
          ))}
        </nav>
      )}

      {showAdd && <AddExerciseModal onSave={ex => { persistExercises([...exercises, ex]); setShowAdd(false); }} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
