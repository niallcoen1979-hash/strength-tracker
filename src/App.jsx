/* eslint-disable no-unused-vars, no-undef */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer
} from "recharts";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const SEED_EXERCISES = [
  // ── Chest ──
  { id:"bench",       name:"Barbell Bench Press",       unit:"kg",        bw:false, group:"Chest",     baseline:[60,75],   t6:[85,95],   t18:[100,110],
    desc:"Lie flat on bench, grip bar slightly wider than shoulder width. Lower to chest with control, press explosively. Keep feet flat, arch natural.",
    video:"https://www.youtube.com/watch?v=rT7DgCr-3pg" },
  { id:"incline",     name:"DB Incline Press",          unit:"kg each",   bw:false, group:"Chest",     baseline:[20,25],   t6:[30,35],   t18:[38,42],
    desc:"Set bench to 30-45°. Press dumbbells from shoulder height to arms extended overhead. Controls upper chest development.",
    video:"https://www.youtube.com/watch?v=8iPEnn-ltC8" },
  { id:"pecfly",      name:"Pec Fly (Machine)",         unit:"kg",        bw:false, group:"Chest",     baseline:[40,55],   t6:[60,75],   t18:[80,95],
    desc:"Sit upright, arms out to sides with slight bend. Bring handles together in front of chest squeezing pecs. Slow return.",
    video:"https://www.youtube.com/watch?v=Z57CtFmRMxA" },
  { id:"chestpress",  name:"Machine Chest Press",       unit:"kg",        bw:false, group:"Chest",     baseline:[50,65],   t6:[75,90],   t18:[95,110],
    desc:"Adjust seat so handles are at mid-chest. Press forward until arms extended, return with control. Great for beginners.",
    video:"https://www.youtube.com/watch?v=xUm0BiZCX_I" },
  { id:"cablefly",    name:"Cable Crossover",           unit:"kg",        bw:false, group:"Chest",     baseline:[10,15],   t6:[18,25],   t18:[28,35],
    desc:"Set cables high. Step forward, bring handles down and together in arc motion. Maintains constant tension through full range.",
    video:"https://www.youtube.com/watch?v=taI4XduLpTk" },
  { id:"dbflat",      name:"DB Flat Bench Press",       unit:"kg each",   bw:false, group:"Chest",     baseline:[22,28],   t6:[32,38],   t18:[42,50],
    desc:"Like barbell bench but with dumbbells for greater range of motion. Allows independent arm movement correcting imbalances.",
    video:"https://www.youtube.com/watch?v=VmB1G1K7v94" },
  { id:"decline",     name:"Decline Bench Press",       unit:"kg",        bw:false, group:"Chest",     baseline:[60,80],   t6:[85,100],  t18:[105,120],
    desc:"Bench set to 15-30° decline. Targets lower chest fibres. Grip slightly wider than shoulder width, press from lower chest.",
    video:"https://www.youtube.com/watch?v=LfyQBUKR8SE" },
  // ── Back ──
  { id:"pulldown",    name:"Lat Pulldown",              unit:"kg",        bw:false, group:"Back",      baseline:[70,85],   t6:[90,100],  t18:[110,120],
    desc:"Grip bar wide, pull down to upper chest leading with elbows. Lean back slightly. Focus on squeezing lats at bottom.",
    video:"https://www.youtube.com/watch?v=CAwf7n6Luuc" },
  { id:"row",         name:"Cable Row",                 unit:"kg",        bw:false, group:"Back",      baseline:[70,85],   t6:[90,100],  t18:[110,120],
    desc:"Sit upright, pull handle to lower abdomen keeping elbows close to body. Squeeze shoulder blades together at end of movement.",
    video:"https://www.youtube.com/watch?v=GZbfZ033f74" },
  { id:"seatedrow",   name:"Seated Row (Machine)",      unit:"kg",        bw:false, group:"Back",      baseline:[60,75],   t6:[85,100],  t18:[105,120],
    desc:"Chest against pad, grip handles, retract shoulder blades and pull handles to sides. Great for mid-back thickness.",
    video:"https://www.youtube.com/watch?v=xQNrFHEMhI4" },
  { id:"dbrow",       name:"DB Single-Arm Row",         unit:"kg",        bw:false, group:"Back",      baseline:[25,35],   t6:[40,50],   t18:[55,65],
    desc:"Brace one hand on bench, row dumbbell from floor to hip leading with elbow. Keep back flat. Full stretch at bottom.",
    video:"https://www.youtube.com/watch?v=pYcpY20QaE8" },
  { id:"tbar",        name:"T-Bar Row",                 unit:"kg",        bw:false, group:"Back",      baseline:[40,55],   t6:[65,80],   t18:[85,100],
    desc:"Straddle barbell, grip handle, pull to lower chest with flat back. Excellent for back thickness and overall mass.",
    video:"https://www.youtube.com/watch?v=j3Igk5nyZE4" },
  { id:"pullup",      name:"Assisted Pull-Up",          unit:"kg assist", bw:false, group:"Back",      baseline:[30,50],   t6:[15,30],   t18:[0,10],
    desc:"Use assisted machine to build pull-up strength. Grip wide, pull chest to bar leading with elbows. Lower with control.",
    video:"https://www.youtube.com/watch?v=eGo4IYlbE5g" },
  { id:"facepull",    name:"Face Pull",                 unit:"kg",        bw:false, group:"Back",      baseline:[15,25],   t6:[30,40],   t18:[45,55],
    desc:"Set cable to head height with rope. Pull to face with elbows high and wide. Key for shoulder health and rear delt development.",
    video:"https://www.youtube.com/watch?v=rep-qVOkqgk" },
  { id:"straightarm", name:"Straight Arm Pulldown",     unit:"kg",        bw:false, group:"Back",      baseline:[20,30],   t6:[35,45],   t18:[50,60],
    desc:"Stand at cable, arms straight, push bar from overhead to thighs. Isolates lats without involving biceps.",
    video:"https://www.youtube.com/watch?v=PhhSbHFjKGo" },
  // ── Shoulders ──
  { id:"shoulder",    name:"Seated Shoulder Press",     unit:"kg",        bw:false, group:"Shoulders", baseline:[35,45],   t6:[50,60],   t18:[65,75],
    desc:"Sit upright, press bar or dumbbells overhead from shoulder height. Keep core tight. Don't flare elbows excessively.",
    video:"https://www.youtube.com/watch?v=qEwKCR5JCog" },
  { id:"lateraise",   name:"DB Lateral Raise",          unit:"kg each",   bw:false, group:"Shoulders", baseline:[8,12],    t6:[14,18],   t18:[20,25],
    desc:"Raise dumbbells to sides to shoulder height with slight forward lean and bend in elbow. Slow controlled descent.",
    video:"https://www.youtube.com/watch?v=3VcKaXpzqRo" },
  { id:"frontraise",  name:"DB Front Raise",            unit:"kg each",   bw:false, group:"Shoulders", baseline:[8,12],    t6:[14,18],   t18:[20,24],
    desc:"Raise dumbbell forward to eye height with slight bend in elbow. Alternate arms. Targets anterior deltoid.",
    video:"https://www.youtube.com/watch?v=gkfQMIgFBRk" },
  { id:"reardelt",    name:"Rear Delt Fly (Machine)",   unit:"kg",        bw:false, group:"Shoulders", baseline:[30,40],   t6:[50,60],   t18:[65,75],
    desc:"Face pads, reverse the pec fly motion pushing arms back and out. Essential for balanced shoulder development.",
    video:"https://www.youtube.com/watch?v=b3tHMVsTUQ0" },
  { id:"shrugs",      name:"DB Shrugs",                 unit:"kg each",   bw:false, group:"Shoulders", baseline:[25,35],   t6:[40,50],   t18:[55,65],
    desc:"Hold dumbbells at sides, elevate shoulders straight up as high as possible. Pause at top. Builds upper traps.",
    video:"https://www.youtube.com/watch?v=cJRVVxmytaM" },
  { id:"upright",     name:"Upright Row",               unit:"kg",        bw:false, group:"Shoulders", baseline:[30,40],   t6:[45,55],   t18:[60,70],
    desc:"Pull barbell up along body to chin level, elbows leading and flaring out. Targets lateral delts and traps.",
    video:"https://www.youtube.com/watch?v=amCU-ziHITM" },
  { id:"arnold",      name:"Arnold Press",              unit:"kg each",   bw:false, group:"Shoulders", baseline:[15,20],   t6:[22,28],   t18:[30,38],
    desc:"Start with palms facing you at shoulder height, rotate outward as you press overhead. Named after Arnold Schwarzenegger.",
    video:"https://www.youtube.com/watch?v=6Z15_WdXmVw" },
  // ── Arms ──
  { id:"triceps",     name:"Triceps Pushdown",          unit:"kg",        bw:false, group:"Arms",      baseline:[20,30],   t6:[35,45],   t18:[50,60],
    desc:"Set cable high with bar or rope. Keep elbows at sides, push down until arms fully extended. Squeeze at bottom.",
    video:"https://www.youtube.com/watch?v=2-LAMcpzODU" },
  { id:"skullcrush",  name:"Skull Crushers",            unit:"kg",        bw:false, group:"Arms",      baseline:[20,28],   t6:[32,40],   t18:[44,52],
    desc:"Lie on bench, lower bar to forehead by bending elbows keeping upper arms vertical. Extend back up. EZ bar preferred.",
    video:"https://www.youtube.com/watch?v=d_KZxkY_0cM" },
  { id:"diptricep",   name:"Tricep Dips (Assisted)",    unit:"kg assist", bw:false, group:"Arms",      baseline:[30,50],   t6:[15,30],   t18:[0,10],
    desc:"Use assisted machine. Keep body upright, lower by bending elbows until 90°. Press back up. Lean forward for more chest.",
    video:"https://www.youtube.com/watch?v=0326dy_-CzM" },
  { id:"bicepcurl",   name:"Barbell Bicep Curl",        unit:"kg",        bw:false, group:"Arms",      baseline:[25,35],   t6:[40,50],   t18:[55,65],
    desc:"Stand with underhand grip, curl bar to shoulder height keeping elbows at sides. Squeeze at top. Lower slowly.",
    video:"https://www.youtube.com/watch?v=kwG2ipFRgfo" },
  { id:"dbcurl",      name:"DB Bicep Curl",             unit:"kg each",   bw:false, group:"Arms",      baseline:[12,16],   t6:[18,22],   t18:[24,30],
    desc:"Alternate or simultaneous dumbbell curls. Supinate wrist as you curl for full bicep contraction.",
    video:"https://www.youtube.com/watch?v=sAq_ocpRh_I" },
  { id:"hammer",      name:"Hammer Curl",               unit:"kg each",   bw:false, group:"Arms",      baseline:[12,16],   t6:[18,22],   t18:[24,30],
    desc:"Neutral grip (thumbs up) curl. Works brachialis and brachioradialis in addition to biceps. Great for arm thickness.",
    video:"https://www.youtube.com/watch?v=zC3nLlEvin4" },
  { id:"preacher",    name:"Preacher Curl (Machine)",   unit:"kg",        bw:false, group:"Arms",      baseline:[20,30],   t6:[35,45],   t18:[50,60],
    desc:"Arms braced on pad removing momentum. Full range of motion. Excellent bicep isolation especially for lower fibres.",
    video:"https://www.youtube.com/watch?v=fIWP-FRFNU0" },
  { id:"concentration",name:"Concentration Curl",       unit:"kg each",   bw:false, group:"Arms",      baseline:[10,14],   t6:[16,20],   t18:[22,28],
    desc:"Sit, brace elbow on inner thigh, curl dumbbell to shoulder. Maximum isolation. Great peak contraction for biceps.",
    video:"https://www.youtube.com/watch?v=0AUGkch3tzc" },
  { id:"cabletricep", name:"Cable Overhead Tricep Ext", unit:"kg",        bw:false, group:"Arms",      baseline:[15,22],   t6:[25,35],   t18:[38,48],
    desc:"Face away from cable, extend arms overhead from behind head. Long head tricep emphasis. Keep elbows narrow.",
    video:"https://www.youtube.com/watch?v=YbX7Wd8jQ-Q" },
  // ── Legs ──
  { id:"legpress",    name:"Leg Press",                 unit:"kg",        bw:false, group:"Legs",      baseline:[100,140], t6:[160,180], t18:[200,220],
    desc:"Feet shoulder width on platform. Lower sled until 90° knee angle. Press through heels. Hip-friendly alternative to squats.",
    video:"https://www.youtube.com/watch?v=IZxyjW7MPJQ" },
  { id:"rdl",         name:"Romanian Deadlift",         unit:"kg",        bw:false, group:"Legs",      baseline:[50,65],   t6:[80,90],   t18:[100,110],
    desc:"Hinge at hips pushing them back, bar slides down legs. Feel hamstring stretch, drive hips forward to return. Keep back flat.",
    video:"https://www.youtube.com/watch?v=2SHsk9AzdjA" },
  { id:"legext",      name:"Leg Extension",             unit:"kg",        bw:false, group:"Legs",      baseline:[40,55],   t6:[65,80],   t18:[85,100],
    desc:"Sit in machine, extend legs until straight squeezing quads. Lower slowly. Pure quad isolation. Good for knee rehab.",
    video:"https://www.youtube.com/watch?v=YyvSfVjQeL0" },
  { id:"legcurl",     name:"Lying Leg Curl",            unit:"kg",        bw:false, group:"Legs",      baseline:[35,50],   t6:[60,75],   t18:[80,95],
    desc:"Face down on machine, curl heels to glutes. Pause at top. Lower with control. Isolates hamstrings effectively.",
    video:"https://www.youtube.com/watch?v=1Tq3QdYUuHs" },
  { id:"calfpress",   name:"Calf Raise (Machine)",      unit:"kg",        bw:false, group:"Legs",      baseline:[60,80],   t6:[90,110],  t18:[120,140],
    desc:"Full range of motion — deep stretch at bottom, full contraction at top. Slow tempo essential. Targets gastrocnemius.",
    video:"https://www.youtube.com/watch?v=gwLzBJYoWlI" },
  { id:"hipabduct",   name:"Hip Abductor (Machine)",    unit:"kg",        bw:false, group:"Legs",      baseline:[40,55],   t6:[65,80],   t18:[85,100],
    desc:"Sit in machine, push legs apart against resistance. Targets outer glutes and hip abductors. Good for hip stability.",
    video:"https://www.youtube.com/watch?v=lPt35_O_ZPg" },
  { id:"hipadduct",   name:"Hip Adductor (Machine)",    unit:"kg",        bw:false, group:"Legs",      baseline:[40,55],   t6:[65,80],   t18:[85,100],
    desc:"Sit with legs apart, squeeze legs together against resistance. Targets inner thighs. Keep core engaged.",
    video:"https://www.youtube.com/watch?v=Uli2ZOtZl_s" },
  { id:"hipthrust",   name:"Hip Thrust",                unit:"kg",        bw:false, group:"Legs",      baseline:[40,60],   t6:[80,100],  t18:[120,140],
    desc:"Upper back on bench, barbell across hips. Drive hips up squeezing glutes at top. Hip-safe glute builder — no deep flexion.",
    video:"https://www.youtube.com/watch?v=xDmFkJxPzeM" },
  { id:"goblet",      name:"Goblet Squat",              unit:"kg",        bw:false, group:"Legs",      baseline:[20,30],   t6:[35,45],   t18:[50,60],
    desc:"Hold dumbbell at chest, squat deep with elbows inside knees. Hip-friendly squat variation. Great for mobility.",
    video:"https://www.youtube.com/watch?v=MeIiIdhvXT4" },
  { id:"hipthrust",   name:"Hip Thrust",                unit:"kg",        bw:false, group:"Legs",      baseline:[40,60],   t6:[70,90],   t18:[100,120],
    desc:"Upper back on bench, barbell across hips. Drive hips up squeezing glutes at top. Hip-safe glute builder — no deep flexion under load.",
    video:"https://www.youtube.com/watch?v=LM8XHLYJoYs" },
  { id:"boxsquat",    name:"Box Squat (above 90°)",     unit:"kg",        bw:false, group:"Legs",      baseline:[40,60],   t6:[70,90],   t18:[100,120],
    desc:"Squat back to a box or bench set above parallel. Controls depth to protect hip. Stand up driving through heels.",
    video:"https://www.youtube.com/watch?v=Ml4Nn5Xj1sM" },
  { id:"trapbar",     name:"Trap Bar Deadlift (limited)", unit:"kg",      bw:false, group:"Legs",      baseline:[50,70],   t6:[85,105],  t18:[120,140],
    desc:"Stand inside trap bar, neutral grip. Limited range to protect hip — lift from blocks or rack pins. Safer than floor barbell deadlifts.",
    video:"https://www.youtube.com/watch?v=GptmxRD52vc" },
  { id:"seatedcalf",  name:"Seated Calf Raise",         unit:"kg",        bw:false, group:"Legs",      baseline:[40,55],   t6:[65,80],   t18:[85,100],
    desc:"Weight on knees, raise heels as high as possible. Targets soleus (deeper calf muscle). Essential for full calf development.",
    video:"https://www.youtube.com/watch?v=JbyjNymZOt0" },
  { id:"stiffleg",    name:"Stiff Leg Deadlift",        unit:"kg",        bw:false, group:"Legs",      baseline:[40,55],   t6:[65,80],   t18:[85,100],
    desc:"Minimal knee bend, hinge at hip lowering bar to mid-shin. Greater hamstring stretch than RDL. Keep back neutral.",
    video:"https://www.youtube.com/watch?v=1uDiW5--rAE" },
  // ── Core ──
  { id:"crunches",    name:"Crunches",                  unit:"reps",      bw:true,  group:"Core",      baseline:[15,25],   t6:[35,50],   t18:[60,80],
    desc:"Lie on back, hands by temples, curl shoulders off floor contracting abs. Don't pull neck. Lower with control.",
    video:"https://www.youtube.com/watch?v=Xyd_fa5zoEU" },
  { id:"plank",       name:"Plank",                     unit:"seconds",   bw:true,  group:"Core",      baseline:[20,40],   t6:[60,90],   t18:[120,180],
    desc:"Forearms and toes on floor, body in straight line. Squeeze glutes and abs. Don't let hips sag or pike.",
    video:"https://www.youtube.com/watch?v=ASdvN_XEl_c" },
  { id:"legrise",     name:"Hanging Leg Raise",         unit:"reps",      bw:true,  group:"Core",      baseline:[8,12],    t6:[15,20],   t18:[25,30],
    desc:"Hang from bar, raise legs to parallel (or higher). Control the swing. Targets lower abs and hip flexors.",
    video:"https://www.youtube.com/watch?v=hdng3Nm1x_E" },
  { id:"abcrunch",    name:"Ab Crunch (Machine)",       unit:"kg",        bw:false, group:"Core",      baseline:[30,45],   t6:[55,70],   t18:[75,90],
    desc:"Adjust weight, crunch forward against resistance. More load than bodyweight crunches. Targets rectus abdominis.",
    video:"https://www.youtube.com/watch?v=yprow3BdDxE" },
  { id:"cabletwist",  name:"Cable Wood Chop",           unit:"kg",        bw:false, group:"Core",      baseline:[10,15],   t6:[18,25],   t18:[28,35],
    desc:"Set cable high, pull diagonally across body rotating trunk. Targets obliques and rotational core strength.",
    video:"https://www.youtube.com/watch?v=pAplQXjUOh0" },
  { id:"russian",     name:"Russian Twist",             unit:"reps",      bw:true,  group:"Core",      baseline:[15,20],   t6:[25,35],   t18:[40,50],
    desc:"Sit at 45°, feet off floor, rotate torso side to side. Add weight for progression. Targets obliques.",
    video:"https://www.youtube.com/watch?v=wkD8rjkodUI" },
  { id:"deadbug",     name:"Dead Bug",                  unit:"reps",      bw:true,  group:"Core",      baseline:[8,12],    t6:[15,20],   t18:[25,30],
    desc:"Lie on back, opposite arm and leg extend simultaneously while keeping lower back pressed to floor. Excellent core stability.",
    video:"https://www.youtube.com/watch?v=g_BYB0R-4Ws" },
  { id:"sideplankleft", name:"Side Plank (Left)",       unit:"seconds",   bw:true,  group:"Core",      baseline:[15,25],   t6:[35,50],   t18:[60,90],
    desc:"Lie on side, lift hips off floor supported by forearm and feet. Keep body in straight line. Targets obliques.",
    video:"https://www.youtube.com/watch?v=_6vjo5yFo1U" },
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
// Supabase data helpers
// ─────────────────────────────────────────────

// Convert flat sessions array from DB into { exerciseId: [entries] } map
function sessionsToLogs(sessions) {
  const logs = {};
  (sessions || []).forEach(s => {
    if (!logs[s.exercise_id]) logs[s.exercise_id] = [];
    logs[s.exercise_id].push({
      id:     s.id,
      date:   s.logged_date,
      weight: s.weight_kg,
      sets:   s.sets,
      reps:   s.reps,
      notes:  s.notes,
    });
  });
  return logs;
}

async function loadUserData(userId) {
  const [
    profileRes, sessionsRes, customExRes,
    weightsRes, checkinsRes, planRes, favsRes
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("sessions").select("*").eq("user_id", userId).order("logged_date", { ascending: true }),
    supabase.from("custom_exercises").select("*").eq("user_id", userId),
    supabase.from("body_weights").select("*").eq("user_id", userId).order("logged_date", { ascending: true }),
    supabase.from("checkins").select("*").eq("user_id", userId).order("checkin_date", { ascending: false }),
    supabase.from("weekly_plan").select("*").eq("user_id", userId).single(),
    supabase.from("favourites").select("exercise_id").eq("user_id", userId),
  ]);
  return {
    profile:    profileRes.data,
    logs:       sessionsToLogs(sessionsRes.data),
    customEx:   customExRes.data || [],
    weights:    (weightsRes.data || []).map(w => ({ id:w.id, date:w.logged_date, weight:w.weight_kg })),
    photos:     (checkinsRes.data || []).map(c => ({ id:c.id, date:c.checkin_date, note:c.note })),
    plan:       planRes.data?.plan || EMPTY_PLAN,
    favourites: (favsRes.data || []).map(f => f.exercise_id),
  };
}

async function saveProfile(userId, profile) {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    name: profile.name || null,
    age: parseInt(profile.age) || null,
    weight_kg: parseFloat(profile.weight || profile.weight_kg) || null,
    height_cm: parseFloat(profile.height || profile.height_cm) || null,
    goal: profile.goal || null,
    experience: profile.experience || null,
    training_days: profile.trainingDays || profile.training_days || {},
    email_consent: profile.emailConsent || profile.email_consent || false,
    email_frequency: profile.emailFrequency || profile.email_frequency || "weekly",
  });
  if (error) console.error("saveProfile error:", error);
}

async function saveSession(userId, exId, entry) {
  const { data } = await supabase.from("sessions").insert({
    user_id: userId, exercise_id: exId,
    logged_date: entry.date.slice(0,10),
    weight_kg: entry.weight || null, sets: entry.sets || null,
    reps: entry.reps || null, notes: entry.notes || null,
  }).select().single();
  return data;
}

async function deleteSession(sessionId) {
  await supabase.from("sessions").delete().eq("id", sessionId);
}

async function saveCustomExercise(userId, ex) {
  await supabase.from("custom_exercises").upsert({
    id: ex.id, user_id: userId, name: ex.name, unit: ex.unit,
    bodyweight: ex.bw || false, exercise_group: ex.group || "Custom",
    baseline: ex.baseline, t6: ex.t6, t18: ex.t18,
  });
}

async function removeCustomExercise(exId) {
  await supabase.from("custom_exercises").delete().eq("id", exId);
}

async function savePlan(userId, plan) {
  await supabase.from("weekly_plan").upsert({ user_id: userId, plan });
}

async function saveBodyWeight(userId, entry) {
  const { data } = await supabase.from("body_weights").insert({
    user_id: userId, weight_kg: entry.weight, logged_date: entry.date.slice(0,10),
  }).select().single();
  return data;
}

async function deleteBodyWeight(id) {
  await supabase.from("body_weights").delete().eq("id", id);
}

async function saveCheckin(userId, photo) {
  const { data } = await supabase.from("checkins").insert({
    user_id: userId, note: photo.note, checkin_date: photo.date.slice(0,10),
  }).select().single();
  return data;
}

async function deleteCheckin(id) {
  await supabase.from("checkins").delete().eq("id", id);
}

async function toggleFavouriteDB(userId, exId, isFav) {
  if (isFav) {
    await supabase.from("favourites").delete().eq("user_id", userId).eq("exercise_id", exId);
  } else {
    await supabase.from("favourites").insert({ user_id: userId, exercise_id: exId });
  }
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
const ExerciseCard = ({ ex, latestEntry, logCount, scheduledDays, isFav, onTap, onFavToggle, onInfo, actionSlot }) => {
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
            {ex.desc && <button onClick={e=>{e.stopPropagation();onInfo&&onInfo(ex);}} style={{ background:C.indigo+"22", border:`1px solid ${C.indigo}44`, borderRadius:4, color:C.indigo, fontSize:9, cursor:"pointer", padding:"2px 5px", lineHeight:1, fontWeight:700 }} title="Exercise info">INFO</button>}
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
const ExerciseDetail = ({ ex, entries, logs, exercises, plan, isFav, isPB, pbValue, onBack, onLog, onDeleteEntry, onRemove, onPlanChange, onFavToggle, profile }) => {
  const todayStr = () => new Date().toISOString().slice(0,10); // YYYY-MM-DD
  const [form, setForm]         = useState({ weight:"", sets:"", reps:"", notes:"", date:todayStr() });
  const [dateMode, setDateMode] = useState("today"); // "today" | "custom"
  const [saved, setSaved]       = useState(false);
  const [chartType, setChartType] = useState("line");
  const [timeFilter, setTimeFilter] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [showInfo,      setShowInfo]      = useState(false);

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
          {ex.desc && <button onClick={()=>setShowInfo(true)} style={{ background:C.indigo+"22", border:`1px solid ${C.indigo}44`, borderRadius:4, color:C.indigo, fontSize:9, cursor:"pointer", padding:"2px 5px", lineHeight:1, fontWeight:700 }}>INFO</button>}
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

      {/* Muscle map for this exercise */}
      <MuscleMapPanel logs={logs} exercises={[]} highlightEx={ex} />

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
const WeeklyPlanner = ({ exercises, plan, onPlanChange, onOpenExercise, logs, profile, onApplyTemplate }) => {
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
      {/* Templates panel */}
    <TemplatesPanel currentPlan={plan} onApply={onApplyTemplate} trainingDays={profile?.trainingDays} />

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
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ fontSize:14, fontWeight:800 }}>
            {activeDay}
            {activeDay === todayName() && <span style={{ fontSize:10, color:C.green, fontWeight:600, marginLeft:8 }}>Today</span>}
          </div>
          {(() => {
            const gymType = profile?.trainingDays?.[activeDay];
            const gymMeta = GYM_TYPES.find(g=>g.id===gymType);
            return gymMeta && gymType !== "rest" ? (
              <span style={{ fontSize:11, color:C.muted, display:"flex", alignItems:"center", gap:3 }}>
                <span>{gymMeta.icon}</span>
                <span style={{ fontSize:10 }}>{gymMeta.label}</span>
              </span>
            ) : gymType === "rest" ? (
              <span style={{ fontSize:10, color:C.dim }}>😴 Rest</span>
            ) : null;
          })()}
        </div>
        <button onClick={() => setShowPicker(true)}
          style={{ background:C.input, border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 10px", color:C.muted, fontSize:10, fontWeight:600, cursor:"pointer" }}>
          + Add
        </button>
      </div>

      {/* Exercises for this day */}
      {/* Warmup card for this day */}
      <WarmupCard dayExercises={dayList} exercises={exercises} />

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
const Dashboard = ({ exercises, logs, plan, onOpenExercise, favourites, streakData, calories, cardioSessions, profile }) => {
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

      {/* Muscle map */}
      <MuscleMapPanel logs={logs} exercises={exercises} />

      {/* Session summary */}
      <SessionSummary logs={logs} exercises={exercises} calories={calories} cardioSessions={cardioSessions} profile={profile} />

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
const ProfileTab = ({ profile, onUpdate, onRegeneratePlan }) => {
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
        <div style={{ marginTop:12 }}>
          <Btn onClick={() => { onRegeneratePlan && onRegeneratePlan(form); save(); }}>Save & regenerate plan</Btn>
          <div style={{ fontSize:10, color:C.dim, textAlign:"center", marginTop:6 }}>Updates your training schedule and rebuilds your weekly plan</div>
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
          model: "claude-sonnet-4-6",
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
// PERSONAL PROTOCOL — Niall's fat loss + muscle preservation plan
// ─────────────────────────────────────────────
const PROTOCOL = {
  targets: {
    calories: 2200,
    protein: 190,   // grams (35%)
    carbs: 200,     // grams (37%)
    fat: 70,        // grams (28%)
    water: 4,       // litres
    steps: 10000,
    creatine: 5,    // grams
  },
  split: {
    Monday:    { type:"Upper Body",          exercises:["bench","incline","shoulder","bicepcurl","pulldown","abcrunch"] },
    Tuesday:   { type:"Lower Body (hip-safe)", exercises:["legpress","rdl","hipthrust","legext","legcurl","calfpress","abcrunch"] },
    Wednesday: { type:"Rest / Mobility",     exercises:[] },
    Thursday:  { type:"Upper Body",          exercises:["bench","incline","shoulder","bicepcurl","pulldown","abcrunch"] },
    Friday:    { type:"Lower Body (hip-safe)", exercises:["legpress","rdl","hipthrust","legext","legcurl","calfpress","abcrunch"] },
    Saturday:  { type:"Optional / Rest",     exercises:[] },
    Sunday:    { type:"Rest",                exercises:[] },
  },
  setProtocol: [
    "Set 1: 6-9 reps to failure (heavy)",
    "Set 2: -25% weight, to failure",
    "Set 3 (optional): repeat Set 2",
    "Rest: 90 seconds between sets",
    "Post-weights: 15-20 min incline walk/run",
  ],
  postSession: [
    "Plank: 4 × 1 min",
    "Weighted side plank: 4 sets each side",
    "Ab vacuum: 3 × 30 sec",
    "20-30 min yoga / stretch",
  ],
  foodSources: {
    "Protein (GF, egg-free, dairy-free)": ["Chicken","Turkey","Lean beef / steak","Salmon","Cod","Haddock","Pea protein powder"],
    "Carbs": ["Basmati rice (weigh dry)","New / sweet potato","GF rice pasta","GF oats","Quinoa","Fruit"],
    "Fats": ["Olive oil","Avocado","Almonds","Mixed nuts","Peanut / almond butter"],
  },
  notes: [
    "🦴 Hip replacement — avoid deep hip flexion under load, no floor barbell deadlifts",
    "🌾 Gluten-free, egg-free, dairy-free",
    "💊 5g creatine daily",
    "💧 4L water daily",
    "👟 10,000+ steps daily",
  ],
};

// Progress ring component
const ProgressRing = ({ value, target, size = 54, stroke = 5, color, label, unit }) => {
  const pct = Math.min(100, (value / target) * 100);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <div style={{ position:"relative", width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e2e" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct/100)} strokeLinecap="round"
            style={{ transition:"stroke-dashoffset .5s" }} />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:C.text }}>
          {Math.round(pct)}%
        </div>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.text }}>{label}</div>
        <div style={{ fontSize:8, color:C.dim }}>{value}/{target}{unit}</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// PROTOCOL DASHBOARD — daily targets tracker
// ─────────────────────────────────────────────
const ProtocolTracker = ({ dailyLog, calories, cardioSessions, onUpdateLog, profile }) => {
  const [section, setSection] = useState("targets"); // targets | training | food | notes

  const todayStr = new Date().toISOString().slice(0,10);
  const today = dailyLog?.[todayStr] || { water:0, steps:0, creatine:false, protein:0, carbs:0, fat:0 };

  // Pull calorie/macro totals from meals logged today
  const todayMeals = (calories||[]).filter(c => c.date?.slice(0,10) === todayStr);
  const calsIn = todayMeals.reduce((s,c)=>s+(c.cals||0),0);
  const proteinIn = todayMeals.reduce((s,c)=>s+(c.protein||0),0) || today.protein;
  const carbsIn   = todayMeals.reduce((s,c)=>s+(c.carbs||0),0) || today.carbs;
  const fatIn     = todayMeals.reduce((s,c)=>s+(c.fat||0),0) || today.fat;

  const upd = (patch) => onUpdateLog(todayStr, { ...today, ...patch });
  const T = PROTOCOL.targets;
  const dayName = DAYS[(new Date().getDay()+6)%7];
  const todaySplit = PROTOCOL.split[dayName];

  return (
    <div>
      <SectionLabel>My Protocol</SectionLabel>

      {/* Section switcher */}
      <div style={{ display:"flex", gap:5, marginBottom:12, flexWrap:"wrap" }}>
        {[["targets","🎯 Targets"],["training","🏋️ Training"],["food","🍽 Food"],["notes","📋 Notes"]].map(([id,label])=>(
          <button key={id} onClick={()=>setSection(id)}
            style={{ flex:1, minWidth:70, padding:"7px 4px", borderRadius:7, border:"none", cursor:"pointer", fontSize:10, fontWeight:700, background:section===id?C.indigo:C.input, color:section===id?"#fff":C.muted }}>
            {label}
          </button>
        ))}
      </div>

      {/* TARGETS */}
      {section === "targets" && (
        <>
          {/* Macro rings */}
          <Card style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 }}>Daily Macros</div>
            <div style={{ display:"flex", justifyContent:"space-around", marginBottom:8 }}>
              <ProgressRing value={calsIn}    target={T.calories} color={C.indigo} label="Calories" unit="" />
              <ProgressRing value={proteinIn} target={T.protein}  color={C.red}    label="Protein"  unit="g" />
              <ProgressRing value={carbsIn}   target={T.carbs}    color={C.amber}  label="Carbs"    unit="g" />
              <ProgressRing value={fatIn}     target={T.fat}      color={C.green}  label="Fat"      unit="g" />
            </div>
            <div style={{ fontSize:10, color:C.dim, textAlign:"center", marginTop:8 }}>
              Log meals with macros in the Stats → Calories tab to auto-fill these
            </div>
          </Card>

          {/* Manual macro entry */}
          <Card style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Quick macro update</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[["protein","Protein (g)"],["carbs","Carbs (g)"],["fat","Fat (g)"]].map(([k,lbl])=>(
                <div key={k}>
                  <label style={{ fontSize:10, color:C.muted, fontWeight:600, marginBottom:4, display:"block" }}>{lbl}</label>
                  <input type="number" value={today[k]||""} onChange={e=>upd({[k]:parseInt(e.target.value)||0})}
                    style={{ width:"100%", background:C.input, border:`1px solid ${C.inputB}`, borderRadius:6, padding:"7px 8px", color:C.text, fontSize:12, outline:"none", boxSizing:"border-box" }} />
                </div>
              ))}
            </div>
          </Card>

          {/* Water */}
          <Card style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.text }}>💧 Water</div>
              <div style={{ fontSize:12, fontWeight:800, color:C.indigo }}>{today.water||0} / {T.water} L</div>
            </div>
            <div style={{ display:"flex", gap:5 }}>
              {Array.from({length:8},(_,i)=>{
                const filled = (today.water||0) > i*0.5;
                return (
                  <button key={i} onClick={()=>upd({water:(i+1)*0.5})}
                    style={{ flex:1, height:32, borderRadius:5, border:"none", cursor:"pointer", background:filled?C.indigo:C.input, transition:"background .2s", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>
                    {filled?"💧":""}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize:9, color:C.dim, textAlign:"center", marginTop:6 }}>Tap to fill — each block = 500ml</div>
          </Card>

          {/* Steps */}
          <Card style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.text }}>👟 Steps</div>
              <div style={{ fontSize:12, fontWeight:800, color:C.green }}>{(today.steps||0).toLocaleString()} / {T.steps.toLocaleString()}</div>
            </div>
            <input type="number" placeholder="Enter step count" value={today.steps||""} onChange={e=>upd({steps:parseInt(e.target.value)||0})}
              style={{ width:"100%", background:C.input, border:`1px solid ${C.inputB}`, borderRadius:7, padding:"9px 10px", color:C.text, fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:8 }} />
            <div style={{ background:"#1e1e2e", borderRadius:5, height:6, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${Math.min(100,((today.steps||0)/T.steps)*100)}%`, background:C.green, borderRadius:5, transition:"width .4s" }} />
            </div>
          </Card>

          {/* Creatine */}
          <Card>
            <div onClick={()=>upd({creatine:!today.creatine})} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.text }}>💊 Creatine (5g)</div>
              <div style={{ width:44, height:26, borderRadius:13, background:today.creatine?C.green:C.input, position:"relative", transition:"background .2s" }}>
                <div style={{ position:"absolute", top:3, left:today.creatine?21:3, width:20, height:20, borderRadius:10, background:"#fff", transition:"left .2s" }} />
              </div>
            </div>
          </Card>
        </>
      )}

      {/* TRAINING */}
      {section === "training" && (
        <>
          {/* Today's session */}
          <Card style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Today — {dayName}</div>
            <div style={{ fontSize:16, fontWeight:800, color:C.indigo, marginBottom:8 }}>{todaySplit.type}</div>
            {todaySplit.exercises.length > 0 ? (
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {todaySplit.exercises.map(id=>{
                  const ex = SEED_EXERCISES.find(e=>e.id===id);
                  return ex ? <span key={id} style={{ fontSize:11, background:C.input, borderRadius:6, padding:"4px 9px", color:C.text }}>{ex.name}</span> : null;
                })}
              </div>
            ) : <div style={{ fontSize:12, color:C.dim }}>Rest or mobility day 🧘</div>}
          </Card>

          {/* Full week split */}
          <Card style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Weekly Split</div>
            {DAYS.map(d=>(
              <div key={d} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:12, fontWeight:d===dayName?700:400, color:d===dayName?C.indigo:C.text }}>{d}</span>
                <span style={{ fontSize:11, color:C.muted }}>{PROTOCOL.split[d].type}</span>
              </div>
            ))}
          </Card>

          {/* Set protocol */}
          <Card style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Set Protocol (Drop Sets)</div>
            {PROTOCOL.setProtocol.map((s,i)=>(
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"5px 0" }}>
                <span style={{ fontSize:11, color:C.indigo, fontWeight:700, minWidth:16 }}>{i+1}.</span>
                <span style={{ fontSize:12, color:C.text }}>{s}</span>
              </div>
            ))}
          </Card>

          {/* Post session */}
          <Card>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Post-Session (Core + Mobility)</div>
            {PROTOCOL.postSession.map((s,i)=>(
              <div key={i} style={{ fontSize:12, color:C.text, padding:"5px 0", borderBottom:i<PROTOCOL.postSession.length-1?`1px solid ${C.border}`:"none" }}>• {s}</div>
            ))}
          </Card>
        </>
      )}

      {/* FOOD */}
      {section === "food" && (
        <>
          <div style={{ background:"#2a1a0a", border:"1px solid #4a3a1a", borderRadius:10, padding:"12px 14px", marginBottom:10, fontSize:11, color:C.amber, lineHeight:1.6 }}>
            🌾 <strong>Gluten-free, egg-free, dairy-free</strong> — all sources below are compliant
          </div>
          {Object.entries(PROTOCOL.foodSources).map(([cat, foods])=>(
            <Card key={cat} style={{ marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:10 }}>{cat}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {foods.map(f=>(
                  <span key={f} style={{ fontSize:11, background:C.input, borderRadius:6, padding:"5px 10px", color:C.muted }}>{f}</span>
                ))}
              </div>
            </Card>
          ))}
          <Card>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Daily macro split</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                ["Protein","190g","35%",C.red],
                ["Carbs","200g","37%",C.amber],
                ["Fat","70g","28%",C.green],
              ].map(([name,g,pct,col])=>(
                <div key={name} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:12, color:C.text, minWidth:60 }}>{name}</span>
                  <div style={{ flex:1, background:"#1e1e2e", borderRadius:5, height:8, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:pct, background:col, borderRadius:5 }} />
                  </div>
                  <span style={{ fontSize:11, color:C.muted, minWidth:60, textAlign:"right" }}>{g} · {pct}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* NOTES */}
      {section === "notes" && (
        <Card>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 }}>Key Protocol Notes</div>
          {PROTOCOL.notes.map((n,i)=>(
            <div key={i} style={{ fontSize:12, color:C.text, padding:"9px 0", borderBottom:i<PROTOCOL.notes.length-1?`1px solid ${C.border}`:"none", lineHeight:1.5 }}>{n}</div>
          ))}
          <div style={{ marginTop:14, padding:"12px 14px", background:"#1a1a2e", borderRadius:8 }}>
            <div style={{ fontSize:11, color:C.muted, lineHeight:1.7 }}>
              <strong style={{ color:C.text }}>Profile:</strong> 46y, 178cm, ~95kg<br/>
              <strong style={{ color:C.text }}>Goal:</strong> Fat loss + muscle preservation<br/>
              <strong style={{ color:C.text }}>Target:</strong> 2,200 kcal/day
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────
// CARDIO OPTIONS
// ─────────────────────────────────────────────
const CARDIO_TYPES = [
  { id:"crosstrainer", name:"Cross Trainer",    icon:"🏃", cals_per_min:7  },
  { id:"treadmill",    name:"Treadmill",        icon:"🏃", cals_per_min:8  },
  { id:"bike",         name:"Stationary Bike",  icon:"🚴", cals_per_min:6  },
  { id:"rowing",       name:"Rowing Machine",   icon:"🚣", cals_per_min:8  },
  { id:"swimming",     name:"Swimming",         icon:"🏊", cals_per_min:7  },
  { id:"stairmaster",  name:"Stair Master",     icon:"🪜", cals_per_min:9  },
  { id:"hiit",         name:"HIIT",             icon:"⚡", cals_per_min:10 },
  { id:"walk",         name:"Walk",             icon:"🚶", cals_per_min:4  },
  { id:"run",          name:"Outdoor Run",      icon:"🏅", cals_per_min:9  },
  { id:"yoga",         name:"Yoga / Stretch",   icon:"🧘", cals_per_min:3  },
  { id:"cycling",      name:"Outdoor Cycling",  icon:"🚲", cals_per_min:7  },
  { id:"boxing",       name:"Boxing",           icon:"🥊", cals_per_min:9  },
];

// Estimated cals burned from cardio session
function estimateCardioCals(typeId, durationMins, intensity) {
  const type = CARDIO_TYPES.find(t => t.id === typeId);
  if (!type) return 0;
  const intensityMult = 0.6 + (intensity / 10) * 0.8; // 0.6x at 1/10 to 1.4x at 10/10
  return Math.round(type.cals_per_min * durationMins * intensityMult);
}

// ─────────────────────────────────────────────
// CALORIE TRACKER
// ─────────────────────────────────────────────
const CalorieTracker = ({ calories, cardioSessions, profile, onAddMeal, onDeleteMeal, onAddCardio, onDeleteCardio }) => {
  const [mealForm, setMealForm]       = useState({ name:"", cals:"", protein:"", carbs:"", fat:"" });
  const [cardioForm, setCardioForm]   = useState({ type:"crosstrainer", duration:"", intensity:5, notes:"" });
  const [activeSection, setSection]   = useState("log"); // "log" | "cardio" | "history"
  const [saved, setSaved]             = useState(false);

  const todayStr = new Date().toISOString().slice(0,10);
  const todayMeals    = (calories   || []).filter(c => c.date?.slice(0,10) === todayStr);
  const todayCardio   = (cardioSessions || []).filter(c => c.date?.slice(0,10) === todayStr);
  const totalIn       = todayMeals.reduce((s, c) => s + (c.cals || 0), 0);
  const totalBurned   = todayCardio.reduce((s, c) => s + (c.cals_burned || 0), 0);

  // BMR estimate (Mifflin-St Jeor)
  const bmr = (() => {
    const w = parseFloat(profile?.weight) || 85;
    const h = parseFloat(profile?.height) || 175;
    const a = parseInt(profile?.age) || 40;
    return Math.round(10*w + 6.25*h - 5*a + 5); // male
  })();
  const tdee = Math.round(bmr * 1.4); // moderate activity
  const deficit = tdee + totalBurned - totalIn;
  const goal = profile?.goal || "";
  const targetDeficit = goal.includes("Fat loss") || goal.includes("fat") ? 500 : 0;

  const addMeal = () => {
    if (!mealForm.name || !mealForm.cals) return;
    onAddMeal({ id:uid(), date:new Date().toISOString(), name:mealForm.name, cals:parseInt(mealForm.cals), protein:parseInt(mealForm.protein)||0, carbs:parseInt(mealForm.carbs)||0, fat:parseInt(mealForm.fat)||0 });
    setMealForm({ name:"", cals:"", protein:"", carbs:"", fat:"" });
    setSaved(true); setTimeout(()=>setSaved(false), 1500);
  };

  const addCardio = () => {
    if (!cardioForm.duration) return;
    const burned = estimateCardioCals(cardioForm.type, parseInt(cardioForm.duration), cardioForm.intensity);
    const type = CARDIO_TYPES.find(t=>t.id===cardioForm.type);
    onAddCardio({ id:uid(), date:new Date().toISOString(), type:cardioForm.type, name:type?.name, icon:type?.icon, duration:parseInt(cardioForm.duration), intensity:cardioForm.intensity, cals_burned:burned, notes:cardioForm.notes });
    setCardioForm({ type:"crosstrainer", duration:"", intensity:5, notes:"" });
    setSaved(true); setTimeout(()=>setSaved(false), 1500);
  };

  const deficitColor = deficit >= targetDeficit ? C.green : deficit >= 0 ? C.amber : C.red;

  return (
    <div>
      <SectionLabel>Today's Calories</SectionLabel>

      {/* Summary tiles */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:12 }}>
        {[
          { label:"Consumed",  value:totalIn,             unit:"kcal", color:C.amber  },
          { label:"Burned",    value:totalBurned,         unit:"kcal", color:C.green  },
          { label:deficit>=0?"Deficit":"Surplus", value:Math.abs(deficit), unit:"kcal", color:deficitColor },
        ].map(s=>(
          <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px" }}>
            <div style={{ fontSize:9, color:C.muted, fontWeight:600, textTransform:"uppercase", marginBottom:3 }}>{s.label}</div>
            <div style={{ fontSize:16, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:9, color:C.dim }}>{s.unit}</div>
          </div>
        ))}
      </div>

      {/* TDEE bar */}
      <Card style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.muted, marginBottom:6 }}>
          <span>Calories in: {totalIn} kcal</span>
          <span>TDEE target: {tdee} kcal</span>
        </div>
        <div style={{ background:"#1e1e2e", borderRadius:6, height:8, overflow:"hidden", position:"relative" }}>
          <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${Math.min(100,(totalIn/tdee)*100)}%`, background:totalIn>tdee?C.red:C.indigo, borderRadius:6, transition:"width .4s" }} />
          {targetDeficit > 0 && (
            <div style={{ position:"absolute", left:`${((tdee-targetDeficit)/tdee)*100}%`, top:0, width:2, height:"100%", background:C.green }} />
          )}
        </div>
        {targetDeficit > 0 && <div style={{ fontSize:9, color:C.green, marginTop:4 }}>🎯 Fat loss target: {tdee-targetDeficit} kcal/day (500 kcal deficit)</div>}
      </Card>

      {/* Section tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {[["log","🍽 Log meal"],["cardio","🏃 Cardio"],["history","📋 History"]].map(([id,label])=>(
          <button key={id} onClick={()=>setSection(id)}
            style={{ flex:1, padding:"7px 0", borderRadius:7, border:"none", cursor:"pointer", fontSize:10, fontWeight:700, background:activeSection===id?C.indigo:C.input, color:activeSection===id?"#fff":C.muted }}>
            {label}
          </button>
        ))}
      </div>

      {/* Log meal */}
      {activeSection==="log" && (
        <Card>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Add food / meal</div>
          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            <input placeholder="e.g. Chicken & rice" value={mealForm.name} onChange={e=>setMealForm(f=>({...f,name:e.target.value}))}
              style={{ flex:2, background:C.input, border:`1px solid ${C.inputB}`, borderRadius:7, padding:"9px 10px", color:C.text, fontSize:12, outline:"none" }} />
            <input placeholder="kcal" type="number" value={mealForm.cals} onChange={e=>setMealForm(f=>({...f,cals:e.target.value}))}
              style={{ flex:1, background:C.input, border:`1px solid ${C.inputB}`, borderRadius:7, padding:"9px 10px", color:C.text, fontSize:12, outline:"none" }} />
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            <input placeholder="Protein g" type="number" value={mealForm.protein} onChange={e=>setMealForm(f=>({...f,protein:e.target.value}))}
              style={{ flex:1, background:C.input, border:`1px solid ${C.inputB}`, borderRadius:7, padding:"8px 10px", color:C.text, fontSize:11, outline:"none" }} />
            <input placeholder="Carbs g" type="number" value={mealForm.carbs} onChange={e=>setMealForm(f=>({...f,carbs:e.target.value}))}
              style={{ flex:1, background:C.input, border:`1px solid ${C.inputB}`, borderRadius:7, padding:"8px 10px", color:C.text, fontSize:11, outline:"none" }} />
            <input placeholder="Fat g" type="number" value={mealForm.fat} onChange={e=>setMealForm(f=>({...f,fat:e.target.value}))}
              style={{ flex:1, background:C.input, border:`1px solid ${C.inputB}`, borderRadius:7, padding:"8px 10px", color:C.text, fontSize:11, outline:"none" }} />
          </div>
          <button onClick={addMeal} style={{ width:"100%", background:C.grad, border:"none", borderRadius:7, padding:"9px", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>Add meal</button>
          {saved && <div style={{ textAlign:"center", color:C.green, fontSize:11, marginTop:6 }}>✓ Saved!</div>}
          {todayMeals.length > 0 && (
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", marginBottom:6 }}>Today's meals</div>
              {todayMeals.map((m,i)=>(
                <div key={m.id||i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderTop:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:12, color:C.text }}>{m.name}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:C.amber }}>{m.cals} kcal</span>
                    <button onClick={()=>onDeleteMeal(m.id||i)} style={{ background:"none", border:"none", color:C.dim, cursor:"pointer", fontSize:14 }}>×</button>
                  </div>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:`1px solid ${C.border}`, marginTop:4 }}>
                <span style={{ fontSize:11, fontWeight:700, color:C.muted }}>Total</span>
                <span style={{ fontSize:13, fontWeight:800, color:C.amber }}>{totalIn} kcal</span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Log cardio */}
      {activeSection==="cardio" && (
        <Card>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Log cardio session</div>
          <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:6, display:"block" }}>Activity</label>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:12 }}>
            {CARDIO_TYPES.map(t=>(
              <button key={t.id} onClick={()=>setCardioForm(f=>({...f,type:t.id}))}
                style={{ padding:"8px 4px", borderRadius:8, border:`1px solid ${cardioForm.type===t.id?C.indigo:C.border}`, background:cardioForm.type===t.id?C.indigo+"22":C.input, color:cardioForm.type===t.id?C.indigo:C.muted, cursor:"pointer", fontSize:10, fontWeight:600, textAlign:"center" }}>
                <div style={{ fontSize:18, marginBottom:2 }}>{t.icon}</div>
                <div style={{ fontSize:9 }}>{t.name.split(" ")[0]}</div>
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, marginBottom:10 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, display:"block" }}>Duration (mins)</label>
              <input type="number" placeholder="e.g. 25" value={cardioForm.duration} onChange={e=>setCardioForm(f=>({...f,duration:e.target.value}))}
                style={{ width:"100%", background:C.input, border:`1px solid ${C.inputB}`, borderRadius:7, padding:"9px 10px", color:C.text, fontSize:13, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, display:"block" }}>Intensity ({cardioForm.intensity}/10)</label>
              <input type="range" min="1" max="10" value={cardioForm.intensity} onChange={e=>setCardioForm(f=>({...f,intensity:parseInt(e.target.value)}))}
                style={{ width:"100%", marginTop:10, accentColor:C.indigo }} />
            </div>
          </div>
          {cardioForm.duration && (
            <div style={{ background:"#1e2a1e", border:"1px solid #2a4a2a", borderRadius:7, padding:"8px 12px", marginBottom:10, fontSize:11, color:C.green }}>
              Est. calories burned: <strong>{estimateCardioCals(cardioForm.type, parseInt(cardioForm.duration)||0, cardioForm.intensity)} kcal</strong>
            </div>
          )}
          <input placeholder="Notes (optional)" value={cardioForm.notes} onChange={e=>setCardioForm(f=>({...f,notes:e.target.value}))}
            style={{ width:"100%", background:C.input, border:`1px solid ${C.inputB}`, borderRadius:7, padding:"9px 10px", color:C.text, fontSize:12, outline:"none", boxSizing:"border-box", marginBottom:10 }} />
          <button onClick={addCardio} style={{ width:"100%", background:C.grad, border:"none", borderRadius:7, padding:"9px", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>Log session</button>
          {saved && <div style={{ textAlign:"center", color:C.green, fontSize:11, marginTop:6 }}>✓ Saved!</div>}
          {todayCardio.length>0 && (
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", marginBottom:6 }}>Today's cardio</div>
              {todayCardio.map((c,i)=>(
                <div key={c.id||i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderTop:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:12, color:C.text }}>{c.icon} {c.name} · {c.duration}min · {c.intensity}/10</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:C.green }}>{c.cals_burned} kcal</span>
                    <button onClick={()=>onDeleteCardio(c.id||i)} style={{ background:"none", border:"none", color:C.dim, cursor:"pointer", fontSize:14 }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* History — last 7 days */}
      {activeSection==="history" && (
        <Card>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>7-day calorie history</div>
          {Array.from({length:7},(_,i)=>{
            const d = new Date(); d.setDate(d.getDate()-i);
            const ds = d.toISOString().slice(0,10);
            const dayIn     = (calories||[]).filter(c=>c.date?.slice(0,10)===ds).reduce((s,c)=>s+(c.cals||0),0);
            const dayBurned = (cardioSessions||[]).filter(c=>c.date?.slice(0,10)===ds).reduce((s,c)=>s+(c.cals_burned||0),0);
            const dayDef    = tdee + dayBurned - dayIn;
            if (dayIn===0 && dayBurned===0) return null;
            return (
              <div key={ds} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:11, color:C.text }}>{fmtDate(ds+"T12:00:00")}</span>
                <div style={{ display:"flex", gap:12, fontSize:11 }}>
                  <span style={{ color:C.amber }}>{dayIn} in</span>
                  <span style={{ color:C.green }}>{dayBurned} burned</span>
                  <span style={{ color:dayDef>=0?C.green:C.red, fontWeight:700 }}>{dayDef>=0?"-":"+"}{ Math.abs(dayDef)}</span>
                </div>
              </div>
            );
          }).filter(Boolean)}
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// SESSION SUMMARY
// ─────────────────────────────────────────────
const SessionSummary = ({ logs, exercises, calories, cardioSessions, profile }) => {
  const todayStr = new Date().toISOString().slice(0,10);
  const todayEx = exercises.filter(ex => (logs[ex.id]||[]).some(e=>e.date?.slice(0,10)===todayStr));
  const todaySessions = todayEx.map(ex => {
    const s = (logs[ex.id]||[]).filter(e=>e.date?.slice(0,10)===todayStr);
    const best = s.reduce((b,e)=>{ const v=ex.bw?e.reps:e.weight; return v>b?v:b; }, 0);
    return { ex, sessions:s, best };
  });
  const totalSets   = todaySessions.reduce((s,t)=>s+t.sessions.reduce((a,e)=>a+(e.sets||1),0),0);
  const totalReps   = todaySessions.reduce((s,t)=>s+t.sessions.reduce((a,e)=>a+(e.reps||0),0),0);
  const totalWeight = todaySessions.reduce((s,t)=>s+t.sessions.reduce((a,e)=>a+((e.weight||0)*(e.reps||1)*(e.sets||1)),0),0);
  const todayCalIn  = (calories||[]).filter(c=>c.date?.slice(0,10)===todayStr).reduce((s,c)=>s+(c.cals||0),0);
  const todayCardBurned = (cardioSessions||[]).filter(c=>c.date?.slice(0,10)===todayStr).reduce((s,c)=>s+(c.cals_burned||0),0);
  const strengthBurned  = Math.round(totalSets * 5.5); // ~5.5 kcal per set
  const totalBurned     = todayCardBurned + strengthBurned;

  if (todaySessions.length === 0 && todayCalIn === 0) return null;

  return (
    <div>
      <SectionLabel>Today's Summary</SectionLabel>
      <Card style={{ marginBottom:12 }}>
        {/* Effort tiles */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:12 }}>
          {[
            { label:"Exercises", value:todaySessions.length, color:C.purple },
            { label:"Sets",      value:totalSets,            color:C.indigo },
            { label:"Volume",    value:totalWeight>0?`${Math.round(totalWeight/1000)}t`:"–", color:C.amber },
            { label:"Burned",    value:`${totalBurned}`, unit:"kcal", color:C.green },
          ].map(s=>(
            <div key={s.label} style={{ background:C.input, borderRadius:7, padding:"7px 6px", textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:8, color:C.dim, textTransform:"uppercase", fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Personal bests today */}
        {todaySessions.filter(t=>t.best>0).length > 0 && (
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Today's lifts</div>
            {todaySessions.map(({ex,best})=>(
              <div key={ex.id} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:11, color:C.text }}>{ex.name}</span>
                <span style={{ fontSize:11, fontWeight:700, color:C.purple }}>{best}{ex.bw?` ${ex.unit}`:"kg"}</span>
              </div>
            ))}
          </div>
        )}

        {/* Calorie summary */}
        {(todayCalIn > 0 || totalBurned > 0) && (
          <div style={{ background:C.input, borderRadius:8, padding:"10px 12px" }}>
            <div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Calorie balance</div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
              <span style={{ color:C.amber }}>In: {todayCalIn} kcal</span>
              <span style={{ color:C.green }}>Burned: {totalBurned} kcal</span>
              <span style={{ color:todayCalIn-totalBurned<0?C.green:C.amber, fontWeight:700 }}>
                Net: {todayCalIn-totalBurned} kcal
              </span>
            </div>
          </div>
        )}
      </Card>
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
// WARM-UPS per session type
// ─────────────────────────────────────────────
const WARMUPS = {
  push: [
    { name:"Arm Circles",         duration:"30 secs each direction", desc:"Large arm circles forward and backward to mobilise shoulder joints." },
    { name:"Band Pull-Aparts",    duration:"2 × 15 reps",            desc:"Stretch band between hands at chest height, pull apart to sides." },
    { name:"Push-Up to Downdog",  duration:"2 × 8 reps",             desc:"From push-up position, push up then shift to downward dog. Mobilises chest and shoulders." },
    { name:"Light Bench Press",   duration:"2 × 15 reps (empty bar)", desc:"Empty bar or very light weight, full range of motion to warm up pec fibres." },
  ],
  pull: [
    { name:"Shoulder Dislocations", duration:"2 × 10 reps",           desc:"Pass resistance band overhead and behind, wide grip. Mobilises thoracic spine and shoulders." },
    { name:"Cat-Cow Stretch",       duration:"1 min",                  desc:"On all fours, alternate arching and rounding the spine. Warms up spinal erectors." },
    { name:"Band Lat Pulldown",     duration:"2 × 15 reps",            desc:"Light band overhead pull. Activates lats before heavier work." },
    { name:"Dead Hang",             duration:"2 × 20 secs",            desc:"Hang from pull-up bar relaxed. Decompresses spine and stretches lats." },
  ],
  legs: [
    { name:"Leg Swings (front/back)", duration:"20 each leg",        desc:"Hold support, swing leg forward and backward. Hip joint mobilisation." },
    { name:"Leg Swings (side)",       duration:"20 each leg",        desc:"Swing leg across body side to side. Adductor and abductor warm-up." },
    { name:"Bodyweight Squats",       duration:"2 × 15 reps",        desc:"Full range slow squats focusing on form. Activates quads and glutes." },
    { name:"Hip Circles",             duration:"10 each direction",  desc:"Hands on hips, large hip circles each way. Essential pre-leg press." },
    { name:"Light Leg Press",         duration:"1 × 20 reps (light)", desc:"50% of working weight, full range of motion to warm up knee joints." },
  ],
  fullbody: [
    { name:"5 min Light Cardio",    duration:"5 mins",               desc:"Brisk walk, light bike or cross trainer. Elevates heart rate and body temperature." },
    { name:"World's Greatest Stretch", duration:"5 each side",      desc:"Lunge forward, rotate torso and reach overhead. Full body mobility in one move." },
    { name:"Bodyweight Squats",     duration:"15 reps",              desc:"Activates lower body, warms up hip and knee joints." },
    { name:"Push-Up",               duration:"10 reps",              desc:"Upper body activation. Focus on controlled movement." },
    { name:"Band Pull-Aparts",      duration:"15 reps",              desc:"Activates rear delts and rotator cuff before pressing movements." },
  ],
  core: [
    { name:"Cat-Cow",               duration:"1 min",                desc:"Spinal mobility and core activation. Slow and controlled." },
    { name:"Dead Bug",              duration:"2 × 8 each side",      desc:"Lower back stability and core activation before heavy lifts." },
    { name:"Plank Hold",            duration:"30 secs",              desc:"Activates transverse abdominis and stabilisers." },
  ],
};

// Get warmup for a day based on its exercises
function getWarmupForDay(dayExercises, allExercises) {
  if (!dayExercises?.length) return [];
  const exMap = Object.fromEntries(allExercises.map(e => [e.id, e]));
  const groups = dayExercises.map(id => exMap[id]?.group || "").filter(Boolean);
  // Determine dominant session type
  const hasLegs  = groups.some(g => g === "Legs");
  const hasChest = groups.some(g => g === "Chest");
  const hasBack  = groups.some(g => g === "Back");
  const hasCore  = groups.every(g => g === "Core");
  if (hasCore)  return WARMUPS.core;
  if (hasLegs && !hasChest && !hasBack) return WARMUPS.legs;
  if (hasChest && !hasBack) return WARMUPS.push;
  if (hasBack  && !hasChest) return WARMUPS.pull;
  return WARMUPS.fullbody;
}


// ─────────────────────────────────────────────
// MY PLAN — structured personal programme
// ─────────────────────────────────────────────
const MY_PLAN = {
  dailyTargets: {
    calories: 2200,
    protein:  190,
    carbs:    200,
    fat:      70,
    water:    4,     // litres
    steps:    10000,
    creatine: 5,     // grams
  },
  macroSplit: { protein:35, carbs:37, fat:28 },
  medical: "Successful hip replacement — avoid deep hip flexion under load, no floor barbell deadlifts.",
  dietary: ["Gluten-free","Egg-free","Dairy-free"],
  split: {
    Monday:    { type:"Upper Body",         exercises:["bench","incline","shoulder","bicepcurl","pulldown","abcrunch"] },
    Tuesday:   { type:"Lower Body (hip-safe)", exercises:["legpress","rdl","hipthrust","legext","legcurl","calfpress","abcrunch"] },
    Wednesday: { type:"Rest / Mobility",     exercises:[] },
    Thursday:  { type:"Upper Body",         exercises:["bench","incline","shoulder","bicepcurl","pulldown","abcrunch"] },
    Friday:    { type:"Lower Body (hip-safe)", exercises:["legpress","rdl","hipthrust","legext","legcurl","calfpress","abcrunch"] },
    Saturday:  { type:"Optional / Rest",    exercises:[] },
    Sunday:    { type:"Rest",               exercises:[] },
  },
  setProtocol: [
    { set:1, desc:"6–9 reps to failure (heavy)" },
    { set:2, desc:"−25% weight, to failure" },
    { set:3, desc:"Optional — repeat Set 2", optional:true },
  ],
  restBetweenSets: "90 seconds",
  cardioFinisher: "15–20 min incline walk/run post-weights",
  postSession: [
    { name:"Plank",             detail:"4 × 1 min" },
    { name:"Weighted Side Plank", detail:"4 sets each side" },
    { name:"Ab Vacuum",         detail:"3 × 30 sec" },
    { name:"Yoga / Stretch",    detail:"20–30 min" },
  ],
  foodSources: {
    protein: ["Chicken","Turkey","Lean beef / steak","Salmon","Cod","Haddock","Pea protein powder"],
    carbs:   ["Basmati rice (weigh dry)","New / sweet potato","GF rice pasta","GF oats","Quinoa","Fruit"],
    fat:     ["Olive oil","Avocado","Almonds","Mixed nuts","Peanut / almond butter"],
  },
};

// ─────────────────────────────────────────────
// Daily Targets Tracker
// ─────────────────────────────────────────────
const DailyTargetsCard = ({ dailyLog, onUpdate, calories, cardioSessions }) => {
  const t = MY_PLAN.dailyTargets;
  const todayStr = new Date().toISOString().slice(0,10);

  // Calorie/macro totals from logged meals today
  const todayMeals = (calories||[]).filter(c => c.date?.slice(0,10)===todayStr);
  const calsIn  = todayMeals.reduce((s,c)=>s+(c.cals||0),0);
  const protIn  = todayMeals.reduce((s,c)=>s+(c.protein||0),0);

  const log = dailyLog?.[todayStr] || { water:0, steps:0, creatine:false };

  const Ring = ({ value, target, color, label, unit, big }) => {
    const pct = Math.min(100, (value/target)*100);
    const r = big ? 30 : 24, circ = 2*Math.PI*r;
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
        <div style={{ position:"relative", width:big?72:60, height:big?72:60 }}>
          <svg width={big?72:60} height={big?72:60} style={{ transform:"rotate(-90deg)" }}>
            <circle cx={big?36:30} cy={big?36:30} r={r} fill="none" stroke={C.border} strokeWidth="5" />
            <circle cx={big?36:30} cy={big?36:30} r={r} fill="none" stroke={color} strokeWidth="5"
              strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round" style={{ transition:"stroke-dashoffset .5s" }} />
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
            <div style={{ fontSize:big?12:10, fontWeight:800, color:C.text, lineHeight:1 }}>{value}</div>
            <div style={{ fontSize:7, color:C.dim }}>/{target}</div>
          </div>
        </div>
        <div style={{ fontSize:9, color:C.muted, fontWeight:600, textTransform:"uppercase" }}>{label}</div>
      </div>
    );
  };

  return (
    <div>
      <SectionLabel>Daily Targets</SectionLabel>
      <Card style={{ marginBottom:12 }}>
        {/* Nutrition rings */}
        <div style={{ display:"flex", justifyContent:"space-around", marginBottom:16 }}>
          <Ring value={calsIn} target={t.calories} color={C.amber}  label="kcal"    big />
          <Ring value={protIn} target={t.protein}  color={C.indigo} label="protein" big />
        </div>

        {/* Manual trackers */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          {/* Water */}
          <div style={{ background:C.input, borderRadius:10, padding:"12px" }}>
            <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", marginBottom:6 }}>💧 Water</div>
            <div style={{ fontSize:18, fontWeight:800, color:"#3b82f6", marginBottom:8 }}>{log.water}<span style={{ fontSize:11, color:C.dim }}>/{t.water}L</span></div>
            <div style={{ display:"flex", gap:5 }}>
              <button onClick={()=>onUpdate(todayStr, { ...log, water:Math.max(0,+(log.water-0.25).toFixed(2)) })}
                style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:6, padding:"5px", color:C.muted, fontSize:14, cursor:"pointer" }}>−</button>
              <button onClick={()=>onUpdate(todayStr, { ...log, water:+(log.water+0.25).toFixed(2) })}
                style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:6, padding:"5px", color:"#3b82f6", fontSize:14, cursor:"pointer" }}>+</button>
            </div>
          </div>
          {/* Steps */}
          <div style={{ background:C.input, borderRadius:10, padding:"12px" }}>
            <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", marginBottom:6 }}>👟 Steps</div>
            <input type="number" placeholder="0" value={log.steps||""} onChange={e=>onUpdate(todayStr, { ...log, steps:parseInt(e.target.value)||0 })}
              style={{ width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", color:C.text, fontSize:14, fontWeight:700, outline:"none", boxSizing:"border-box" }} />
            <div style={{ fontSize:9, color:log.steps>=t.steps?C.green:C.dim, marginTop:4 }}>{log.steps>=t.steps?"✓ Target hit":`Goal: ${t.steps.toLocaleString()}`}</div>
          </div>
        </div>

        {/* Creatine toggle */}
        <div onClick={()=>onUpdate(todayStr, { ...log, creatine:!log.creatine })}
          style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:log.creatine?"#1a2a1a":C.input, border:`1px solid ${log.creatine?C.green+"55":C.border}`, borderRadius:10, padding:"10px 14px", cursor:"pointer" }}>
          <span style={{ fontSize:12, color:log.creatine?C.text:C.muted }}>💊 Creatine ({t.creatine}g)</span>
          <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${log.creatine?C.green:C.inputB}`, background:log.creatine?C.green:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {log.creatine && <span style={{ color:"#fff", fontSize:12, fontWeight:800 }}>✓</span>}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────
// My Plan Panel (full programme reference)
// ─────────────────────────────────────────────
const MyPlanPanel = ({ exercises, onOpenExercise, onApplySplit }) => {
  const [tab, setTab] = useState("training"); // training | protocol | nutrition
  const exMap = Object.fromEntries(exercises.map(e=>[e.id,e]));
  const todayName = DAYS[(new Date().getDay()+6)%7];

  return (
    <div>
      <SectionLabel>My Programme</SectionLabel>

      {/* Medical + dietary banner */}
      <div style={{ background:"#2a1a1a", border:"1px solid #4a2a2a", borderRadius:10, padding:"10px 14px", marginBottom:10, fontSize:11, color:"#fca5a5", lineHeight:1.5 }}>
        ⚕️ {MY_PLAN.medical}
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
        {MY_PLAN.dietary.map(d=>(
          <span key={d} style={{ fontSize:10, background:C.input, borderRadius:6, padding:"3px 9px", color:C.green, fontWeight:600 }}>🚫 {d}</span>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {[["training","Split"],["protocol","Protocol"],["nutrition","Food"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{ flex:1, padding:"7px 0", borderRadius:7, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, background:tab===id?C.indigo:C.input, color:tab===id?"#fff":C.muted }}>{label}</button>
        ))}
      </div>

      {/* Training split */}
      {tab==="training" && (
        <Card>
          {DAYS.map(day => {
            const d = MY_PLAN.split[day];
            const isToday = day===todayName;
            const isRest = d.exercises.length===0;
            return (
              <div key={day} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:isRest?0:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:isRest?C.dim:C.text }}>{day}</span>
                    {isToday && <span style={{ fontSize:9, color:C.green, fontWeight:700, background:"#1a2a1a", borderRadius:4, padding:"1px 6px" }}>TODAY</span>}
                  </div>
                  <span style={{ fontSize:11, color:isRest?C.dim:C.indigo, fontWeight:600 }}>{d.type}</span>
                </div>
                {!isRest && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {d.exercises.map(id=>{
                      const ex = exMap[id];
                      return ex ? (
                        <button key={id} onClick={()=>onOpenExercise(id)}
                          style={{ fontSize:10, background:C.input, border:`1px solid ${C.border}`, borderRadius:5, padding:"3px 8px", color:C.muted, cursor:"pointer" }}>{ex.name}</button>
                      ) : <span key={id} style={{ fontSize:10, color:C.dim }}>{id}</span>;
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={onApplySplit}
            style={{ width:"100%", marginTop:12, background:C.grad, border:"none", borderRadius:8, padding:"11px", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>
            Apply this split to my weekly plan
          </button>
        </Card>
      )}

      {/* Set protocol */}
      {tab==="protocol" && (
        <Card>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Set protocol</div>
          {MY_PLAN.setProtocol.map(s=>(
            <div key={s.set} style={{ display:"flex", gap:10, alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:C.indigo, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, fontWeight:800, color:"#fff" }}>{s.set}</div>
              <span style={{ fontSize:12, color:C.text }}>{s.desc}{s.optional && <span style={{ color:C.dim, fontSize:10 }}> (optional)</span>}</span>
            </div>
          ))}
          <div style={{ background:C.input, borderRadius:8, padding:"10px 12px", marginTop:12, fontSize:11, color:C.muted, lineHeight:1.6 }}>
            ⏱ <strong style={{ color:C.text }}>Rest:</strong> {MY_PLAN.restBetweenSets} between sets<br/>
            🏃 <strong style={{ color:C.text }}>Finisher:</strong> {MY_PLAN.cardioFinisher}
          </div>

          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", margin:"16px 0 10px" }}>Post-session (both days)</div>
          {MY_PLAN.postSession.map((p,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:12, color:C.text }}>{p.name}</span>
              <span style={{ fontSize:11, color:C.purple, fontWeight:600 }}>{p.detail}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Nutrition sources */}
      {tab==="nutrition" && (
        <Card>
          {/* Macro targets */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:14 }}>
            {[
              { label:"Protein", value:MY_PLAN.dailyTargets.protein, pct:MY_PLAN.macroSplit.protein, color:C.indigo },
              { label:"Carbs",   value:MY_PLAN.dailyTargets.carbs,   pct:MY_PLAN.macroSplit.carbs,   color:C.amber  },
              { label:"Fat",     value:MY_PLAN.dailyTargets.fat,     pct:MY_PLAN.macroSplit.fat,     color:C.green  },
            ].map(m=>(
              <div key={m.label} style={{ background:C.input, borderRadius:8, padding:"8px", textAlign:"center" }}>
                <div style={{ fontSize:16, fontWeight:800, color:m.color }}>{m.value}g</div>
                <div style={{ fontSize:9, color:C.muted, fontWeight:600 }}>{m.label} ({m.pct}%)</div>
              </div>
            ))}
          </div>

          {[
            { key:"protein", label:"🥩 Protein sources", color:C.indigo },
            { key:"carbs",   label:"🍚 Carb sources",    color:C.amber  },
            { key:"fat",     label:"🥑 Fat sources",     color:C.green  },
          ].map(g=>(
            <div key={g.key} style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:g.color, marginBottom:8 }}>{g.label}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {MY_PLAN.foodSources[g.key].map(f=>(
                  <span key={f} style={{ fontSize:11, background:C.input, borderRadius:6, padding:"4px 10px", color:C.text }}>{f}</span>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────
// WORKOUT TEMPLATES
// ─────────────────────────────────────────────
const WORKOUT_TEMPLATES = [
  {
    id:"ppl_3day",
    name:"Push / Pull / Legs",
    desc:"Classic 3-day split. Push on Mon, Pull on Wed, Legs on Fri. Best for building muscle with adequate recovery.",
    tag:"Hypertrophy",
    days:3,
    plan:{
      Monday:    ["bench","incline","chestpress","shoulder","triceps","skullcrush"],
      Tuesday:   [],
      Wednesday: ["pulldown","seatedrow","dbrow","bicepcurl","dbcurl","hammer"],
      Thursday:  [],
      Friday:    ["legpress","rdl","legext","legcurl","calfpress","crunches"],
      Saturday:  [],
      Sunday:    [],
    }
  },
  {
    id:"ppl_6day",
    name:"Push / Pull / Legs ×2",
    desc:"6-day PPL for advanced lifters. Each muscle group hit twice per week. High volume, high frequency.",
    tag:"Advanced",
    days:6,
    plan:{
      Monday:    ["bench","incline","shoulder","lateraise","triceps","skullcrush"],
      Tuesday:   ["pulldown","seatedrow","dbrow","bicepcurl","dbcurl","hammer"],
      Wednesday: ["legpress","rdl","legext","legcurl","calfpress","crunches"],
      Thursday:  ["chestpress","cablefly","reardelt","frontraise","cabletricep","diptricep"],
      Friday:    ["tbar","pullup","facepull","preacher","concentration","hammer"],
      Saturday:  ["goblet","stiffleg","hipabduct","hipadduct","seatedcalf","plank"],
      Sunday:    [],
    }
  },
  {
    id:"upper_lower",
    name:"Upper / Lower Split",
    desc:"4-day split alternating upper and lower body. Good balance of frequency and recovery.",
    tag:"Strength",
    days:4,
    plan:{
      Monday:    ["bench","pulldown","shoulder","row","bicepcurl","triceps"],
      Tuesday:   ["legpress","rdl","legext","legcurl","calfpress","crunches"],
      Wednesday: [],
      Thursday:  ["incline","seatedrow","lateraise","dbrow","preacher","skullcrush"],
      Friday:    ["goblet","stiffleg","hipabduct","hipadduct","seatedcalf","plank"],
      Saturday:  [],
      Sunday:    [],
    }
  },
  {
    id:"fullbody_3day",
    name:"Full Body 3×/Week",
    desc:"Hit every muscle group 3 times per week. Ideal for beginners and those short on time.",
    tag:"Beginner",
    days:3,
    plan:{
      Monday:    ["bench","pulldown","shoulder","legpress","rdl","crunches"],
      Tuesday:   [],
      Wednesday: ["incline","seatedrow","lateraise","goblet","legcurl","plank"],
      Thursday:  [],
      Friday:    ["chestpress","row","shoulder","legpress","stiffleg","legrise"],
      Saturday:  [],
      Sunday:    [],
    }
  },
  {
    id:"bro_split",
    name:"Classic Bro Split",
    desc:"One muscle group per day. Chest Mon, Back Tue, Shoulders Wed, Arms Thu, Legs Fri. High volume per session.",
    tag:"Hypertrophy",
    days:5,
    plan:{
      Monday:    ["bench","incline","chestpress","pecfly","cablefly","dbflat"],
      Tuesday:   ["pulldown","seatedrow","dbrow","tbar","facepull","straightarm"],
      Wednesday: ["shoulder","lateraise","frontraise","reardelt","shrugs","upright"],
      Thursday:  ["bicepcurl","dbcurl","hammer","preacher","triceps","skullcrush"],
      Friday:    ["legpress","rdl","legext","legcurl","calfpress","hipabduct"],
      Saturday:  [],
      Sunday:    [],
    }
  },
  {
    id:"niall_protocol",
    name:"Fat Loss + Muscle Preserve (Hip-Safe)",
    desc:"Upper/Lower split with hip-safe leg work. Drop-set protocol, post-session core and cardio. Built for fat loss while preserving muscle.",
    tag:"Fat Loss",
    days:4,
    plan:{
      Monday:    ["bench","incline","shoulder","bicepcurl","pulldown","abcrunch"],
      Tuesday:   ["legpress","rdl","hipthrust","legext","legcurl","calfpress"],
      Wednesday: [],
      Thursday:  ["bench","incline","shoulder","bicepcurl","pulldown","abcrunch"],
      Friday:    ["legpress","rdl","hipthrust","legext","legcurl","calfpress"],
      Saturday:  [],
      Sunday:    [],
    }
  },
  {
    id:"fatloss",
    name:"Fat Loss Circuit",
    desc:"Higher frequency, shorter sessions with cardio integration. Combines resistance training with HIIT for maximum calorie burn.",
    tag:"Fat Loss",
    days:5,
    plan:{
      Monday:    ["bench","pulldown","legpress","crunches","plank"],
      Tuesday:   ["shoulder","row","rdl","legext","legrise"],
      Wednesday: [],
      Thursday:  ["incline","seatedrow","goblet","legcurl","russian"],
      Friday:    ["chestpress","pullup","stiffleg","hipabduct","deadbug"],
      Saturday:  ["legpress","rdl","crunches","plank","sideplankleft"],
      Sunday:    [],
    }
  },
  {
    id:"home_gym",
    name:"Home Gym Dumbbells",
    desc:"Designed for home gym with dumbbells only. 4 days, full coverage, no machines needed.",
    tag:"Home",
    days:4,
    plan:{
      Monday:    ["dbflat","incline","lateraise","frontraise","hammer","deadbug"],
      Tuesday:   ["dbrow","stiffleg","goblet","seatedcalf","concentration","russian"],
      Wednesday: [],
      Thursday:  ["dbflat","reardelt","arnold","dbcurl","cabletricep","plank"],
      Friday:    ["dbrow","rdl","goblet","hipadduct","hammer","sideplankleft"],
      Saturday:  [],
      Sunday:    [],
    }
  },
];

// ─────────────────────────────────────────────
// Warmup Card Component
// ─────────────────────────────────────────────
const WarmupCard = ({ dayExercises, exercises }) => {
  const [open, setOpen] = useState(false);
  const warmup = getWarmupForDay(dayExercises, exercises);
  if (!warmup.length || !dayExercises?.length) return null;
  return (
    <div style={{ background:"linear-gradient(135deg,#1a2a1a,#131a13)", border:"1px solid #2a4a2a", borderRadius:10, marginBottom:10, overflow:"hidden" }}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", cursor:"pointer" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:16 }}>🔥</span>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"#22c55e" }}>Warm Up</div>
            <div style={{ fontSize:10, color:"#6b7280" }}>{warmup.length} exercises · tap to expand</div>
          </div>
        </div>
        <span style={{ color:"#22c55e", fontSize:14 }}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"0 14px 14px" }}>
          {warmup.map((w,i) => (
            <div key={i} style={{ padding:"8px 0", borderTop:"1px solid #2a4a2a" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>{w.name}</div>
                <div style={{ fontSize:10, color:"#22c55e", fontWeight:600, flexShrink:0, marginLeft:8 }}>{w.duration}</div>
              </div>
              <div style={{ fontSize:11, color:"#6b7280", marginTop:3, lineHeight:1.5 }}>{w.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Exercise Info Modal
// ─────────────────────────────────────────────
const ExerciseInfoModal = ({ ex, onClose }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.8)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
    onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{ background:"#1a1a2e", borderRadius:"16px 16px 0 0", padding:"20px 20px 40px", width:"100%", maxWidth:540 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ fontSize:14, fontWeight:800, color:"#e2e8f0" }}>{ex.name}</div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#6b7280", fontSize:22, cursor:"pointer" }}>×</button>
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
        <span style={{ fontSize:10, background:"#1e1e35", borderRadius:6, padding:"3px 8px", color:"#a855f7", fontWeight:600 }}>{ex.group}</span>
        <span style={{ fontSize:10, background:"#1e1e35", borderRadius:6, padding:"3px 8px", color:"#6b7280", fontWeight:600 }}>{ex.unit}</span>
        {ex.bw && <span style={{ fontSize:10, background:"#1e1e35", borderRadius:6, padding:"3px 8px", color:"#6366f1", fontWeight:600 }}>Bodyweight</span>}
      </div>
      {ex.desc && (
        <div style={{ fontSize:13, color:"#9ca3af", lineHeight:1.7, marginBottom:16, background:"#13132a", borderRadius:8, padding:"12px 14px" }}>
          {ex.desc}
        </div>
      )}
      <div style={{ fontSize:11, fontWeight:700, color:"#6b7280", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>Benchmarks</div>
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        <span style={{ fontSize:11, background:"#1e2a1e", borderRadius:6, padding:"4px 10px", color:"#e2e8f0", fontWeight:600 }}>📍 Base: {ex.baseline[0]}–{ex.baseline[1]}{ex.bw?` ${ex.unit}`:"kg"}</span>
        <span style={{ fontSize:11, background:"#2a2420", borderRadius:6, padding:"4px 10px", color:"#e2e8f0", fontWeight:600 }}>🎯 6mo: {ex.t6[0]}–{ex.t6[1]}{ex.bw?` ${ex.unit}`:"kg"}</span>
        <span style={{ fontSize:11, background:"#22203a", borderRadius:6, padding:"4px 10px", color:"#e2e8f0", fontWeight:600 }}>🏆 Peak: {ex.t18[0]}–{ex.t18[1]}{ex.bw?` ${ex.unit}`:"kg"}</span>
      </div>
      {ex.video && (
        <a href={ex.video} target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", gap:10, background:"#ff000015", border:"1px solid #ff000030", borderRadius:10, padding:"12px 16px", textDecoration:"none" }}>
          <span style={{ fontSize:24 }}>▶️</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>Watch on YouTube</div>
            <div style={{ fontSize:11, color:"#6b7280" }}>See correct form and technique</div>
          </div>
        </a>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Workout Templates Panel
// ─────────────────────────────────────────────
const TemplatesPanel = ({ currentPlan, onApply, trainingDays }) => {
  const [open,      setOpen]      = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const TAG_COLORS = {
    "Hypertrophy":"#6366f1", "Advanced":"#ef4444", "Strength":"#f59e0b",
    "Beginner":"#22c55e", "Home":"#a855f7", "Fat Loss":"#22c55e"
  };
  const previewTemplate = previewId ? WORKOUT_TEMPLATES.find(t => t.id === previewId) : null;

  return (
    <div style={{ background:"#1a1a2e", border:"1px solid #2d2d4a", borderRadius:12, marginBottom:14, overflow:"hidden" }}>
      <div onClick={()=>{ setOpen(o=>!o); setPreviewId(null); setConfirmId(null); }}
        style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", cursor:"pointer" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:16 }}>📋</span>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>Workout Templates</div>
            <div style={{ fontSize:10, color:"#6b7280" }}>{WORKOUT_TEMPLATES.length} plans — tap to browse</div>
          </div>
        </div>
        <span style={{ color:"#6b7280", fontSize:14 }}>{open?"▲":"▼"}</span>
      </div>

      {open && !previewTemplate && (
        <div style={{ borderTop:"1px solid #2d2d4a" }}>
          {WORKOUT_TEMPLATES.map(t => (
            <div key={t.id} style={{ padding:"12px 14px", borderBottom:"1px solid #2d2d4a" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>{t.name}</span>
                <span style={{ fontSize:9, background:TAG_COLORS[t.tag]+"22", color:TAG_COLORS[t.tag], borderRadius:4, padding:"2px 6px", fontWeight:700 }}>{t.tag}</span>
              </div>
              <div style={{ fontSize:11, color:"#6b7280", lineHeight:1.5, marginBottom:4 }}>{t.desc}</div>
              <div style={{ fontSize:10, color:"#4b4b6b", marginBottom:8 }}>{t.days} training days/week</div>
              <div style={{ display:"flex", gap:7 }}>
                <button onClick={()=>setPreviewId(t.id)}
                  style={{ flex:1, background:"#1e1e35", border:"1px solid #3d3d5c", borderRadius:7, padding:"7px 0", color:"#9ca3af", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                  👁 Preview
                </button>
                <button onClick={()=>setConfirmId(confirmId===t.id?null:t.id)}
                  style={{ flex:1, background:"#1e1e35", border:"1px solid #3d3d5c", borderRadius:7, padding:"7px 0", color:"#a78bfa", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                  Use plan →
                </button>
              </div>
              {confirmId === t.id && (
                <div style={{ marginTop:8, background:"#13132a", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:11, color:"#f59e0b", marginBottom:8 }}>⚠️ This will replace your current plan. Are you sure?</div>
                  <div style={{ display:"flex", gap:7 }}>
                    <button onClick={()=>setConfirmId(null)}
                      style={{ flex:1, background:"#1e1e35", border:"none", borderRadius:7, padding:"8px", color:"#e2e8f0", fontSize:11, fontWeight:600, cursor:"pointer" }}>Cancel</button>
                    <button onClick={()=>{ onApply(t.plan); setConfirmId(null); setOpen(false); }}
                      style={{ flex:1, background:"linear-gradient(90deg,#6366f1,#a855f7)", border:"none", borderRadius:7, padding:"8px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>✓ Apply</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview mode */}
      {open && previewTemplate && (
        <div style={{ borderTop:"1px solid #2d2d4a" }}>
          <div style={{ padding:"10px 14px", borderBottom:"1px solid #2d2d4a", display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={()=>setPreviewId(null)}
              style={{ background:"none", border:"none", color:"#a78bfa", fontSize:12, cursor:"pointer", fontWeight:600 }}>← Back</button>
            <span style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>{previewTemplate.name}</span>
          </div>
          {DAYS.map((day, i) => {
            const dayExIds = previewTemplate.plan[day] || [];
            const gymType = trainingDays?.[day];
            const gymIcon = gymType === "gym" ? "🏋️" : gymType === "home" ? "🏠" : gymType === "dumbbells" ? "💪" : null;
            return (
              <div key={day} style={{ padding:"8px 14px", borderBottom:"1px solid #2d2d4a", display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ minWidth:40, fontSize:10, fontWeight:700, color:dayExIds.length ? "#e2e8f0" : "#4b4b6b", paddingTop:2 }}>
                  {DAY_SHORT[i]}{gymIcon && <span style={{ marginLeft:3 }}>{gymIcon}</span>}
                </div>
                <div style={{ flex:1 }}>
                  {dayExIds.length === 0
                    ? <span style={{ fontSize:10, color:"#4b4b6b" }}>Rest day</span>
                    : <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                        {dayExIds.map(id => {
                          const ex = SEED_EXERCISES.find(e=>e.id===id);
                          return ex ? (
                            <span key={id} style={{ fontSize:10, background:"#1e1e35", borderRadius:5, padding:"2px 7px", color:"#9ca3af" }}>{ex.name}</span>
                          ) : null;
                        })}
                      </div>
                  }
                </div>
              </div>
            );
          })}
          <div style={{ padding:"12px 14px" }}>
            <button onClick={()=>{ setConfirmId(previewTemplate.id); setPreviewId(null); }}
              style={{ width:"100%", background:"linear-gradient(90deg,#6366f1,#a855f7)", border:"none", borderRadius:8, padding:"11px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              Use this plan →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────
// MUSCLE MAP — exercise-to-muscle mapping
// ─────────────────────────────────────────────

// Which muscles each exercise works (primary + secondary)
const EXERCISE_MUSCLES = {
  bench:      { primary:["chest"],                    secondary:["shoulders","triceps"] },
  incline:    { primary:["chest"],                    secondary:["shoulders","triceps"] },
  pecfly:     { primary:["chest"],                    secondary:[] },
  chestpress: { primary:["chest"],                    secondary:["shoulders","triceps"] },
  cablefly:   { primary:["chest"],                    secondary:[] },
  dbflat:     { primary:["chest"],                    secondary:["shoulders","triceps"] },
  pulldown:   { primary:["lats"],                     secondary:["biceps","traps"] },
  row:        { primary:["lats","traps"],              secondary:["biceps","lower_back"] },
  seatedrow:  { primary:["lats","traps"],              secondary:["biceps"] },
  dbrow:      { primary:["lats"],                     secondary:["biceps","traps"] },
  tbar:       { primary:["lats","traps"],              secondary:["biceps","lower_back"] },
  pullup:     { primary:["lats"],                     secondary:["biceps","traps"] },
  shoulder:   { primary:["shoulders"],                secondary:["triceps","traps"] },
  lateraise:  { primary:["shoulders"],                secondary:[] },
  frontraise: { primary:["shoulders"],                secondary:[] },
  reardelt:   { primary:["shoulders"],                secondary:["traps"] },
  shrugs:     { primary:["traps"],                    secondary:["shoulders"] },
  triceps:    { primary:["triceps"],                  secondary:[] },
  skullcrush: { primary:["triceps"],                  secondary:[] },
  diptricep:  { primary:["triceps"],                  secondary:["chest","shoulders"] },
  bicepcurl:  { primary:["biceps"],                   secondary:[] },
  dbcurl:     { primary:["biceps"],                   secondary:[] },
  hammer:     { primary:["biceps"],                   secondary:["forearms"] },
  preacher:   { primary:["biceps"],                   secondary:[] },
  legpress:   { primary:["quads","glutes"],            secondary:["hamstrings","calves"] },
  rdl:        { primary:["hamstrings","glutes"],       secondary:["lower_back"] },
  legext:     { primary:["quads"],                    secondary:[] },
  legcurl:    { primary:["hamstrings"],               secondary:[] },
  calfpress:  { primary:["calves"],                   secondary:[] },
  hipabduct:  { primary:["hip_abductor"],             secondary:["glutes"] },
  hipadduct:  { primary:["hip_adductors"],            secondary:[] },
  crunches:   { primary:["abs"],                      secondary:["obliques"] },
  plank:      { primary:["abs","lower_back"],          secondary:["shoulders"] },
  legrise:    { primary:["abs","hip_flexors"],         secondary:["obliques"] },
  abcrunch:   { primary:["abs"],                      secondary:["obliques"] },
  cabletwist: { primary:["obliques"],                 secondary:["abs"] },
};

// All muscle groups with their display names
const ALL_MUSCLES = [
  "chest","shoulders","biceps","triceps","forearms",
  "abs","obliques","hip_flexors","quads",
  "lats","traps","lower_back","glutes","hamstrings",
  "hip_abductor","hip_adductors","calves"
];

// Calculate weekly muscle volume — how many sessions hit each muscle in last 7 days
function calcMuscleVolume(logs, exercises) {
  const cutoff = Date.now() - 7 * 86400000;
  const volume = {};
  ALL_MUSCLES.forEach(m => volume[m] = 0);

  exercises.forEach(ex => {
    const muscles = EXERCISE_MUSCLES[ex.id];
    if (!muscles) return;
    const recentSessions = (logs[ex.id] || []).filter(e => new Date(e.date).getTime() > cutoff);
    recentSessions.forEach(() => {
      muscles.primary.forEach(m => { if (volume[m] !== undefined) volume[m] += 2; });
      muscles.secondary.forEach(m => { if (volume[m] !== undefined) volume[m] += 1; });
    });
  });
  return volume;
}

// Traffic light status for a muscle
function muscleStatus(volume) {
  if (volume >= 4) return "green";
  if (volume >= 2) return "amber";
  if (volume >= 1) return "amber";
  return "none";
}

function muscleColor(status, opacity = 1) {
  if (status === "green") return `rgba(34,197,94,${opacity})`;
  if (status === "amber") return `rgba(245,158,11,${opacity})`;
  return `rgba(45,45,74,${opacity})`;
}

// ─────────────────────────────────────────────
// SVG Body Map Component
// ─────────────────────────────────────────────
const BodyMap = ({ muscleData, highlightPrimary = [], highlightSecondary = [], view = "front", onClick }) => {
  const getColor = (muscle) => {
    if (highlightPrimary.includes(muscle)) return "#6366f1";
    if (highlightSecondary.includes(muscle)) return "#a855f7";
    const vol = muscleData?.[muscle] || 0;
    return muscleColor(muscleStatus(vol), vol > 0 ? 0.85 : 0.25);
  };
  const s = (muscle) => ({ fill: getColor(muscle), cursor: onClick ? "pointer" : "default", transition:"fill .2s" });
  const click = (muscle) => onClick && onClick(muscle);

  if (view === "front") return (
    <svg viewBox="0 0 200 420" style={{ width:"100%", height:"100%" }}>
      {/* Body outline */}
      <ellipse cx="100" cy="38" rx="22" ry="26" fill="#2a2a3e" stroke="#3d3d5c" strokeWidth="1.5"/>
      <rect x="68" y="62" width="64" height="110" rx="8" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>
      <rect x="38" y="65" width="28" height="90" rx="10" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>
      <rect x="134" y="65" width="28" height="90" rx="10" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>
      <rect x="65" y="168" width="32" height="110" rx="8" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>
      <rect x="103" y="168" width="32" height="110" rx="8" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>
      <rect x="66" y="272" width="30" height="110" rx="6" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>
      <rect x="104" y="272" width="30" height="110" rx="6" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>

      {/* CHEST */}
      <path d="M72 68 Q100 80 128 68 L126 110 Q100 118 74 110 Z" {...s("chest")} onClick={()=>click("chest")} />
      {/* SHOULDERS */}
      <ellipse cx="58" cy="75" rx="14" ry="16" {...s("shoulders")} onClick={()=>click("shoulders")} />
      <ellipse cx="142" cy="75" rx="14" ry="16" {...s("shoulders")} onClick={()=>click("shoulders")} />
      {/* BICEPS */}
      <path d="M42 90 Q34 92 36 130 Q44 132 50 128 Q52 92 42 90Z" {...s("biceps")} onClick={()=>click("biceps")} />
      <path d="M158 90 Q166 92 164 130 Q156 132 150 128 Q148 92 158 90Z" {...s("biceps")} onClick={()=>click("biceps")} />
      {/* FOREARMS */}
      <path d="M38 132 Q34 134 36 155 Q42 157 48 154 Q50 132 38 132Z" {...s("forearms")} onClick={()=>click("forearms")} />
      <path d="M162 132 Q166 134 164 155 Q158 157 152 154 Q150 132 162 132Z" {...s("forearms")} onClick={()=>click("forearms")} />
      {/* ABS */}
      <rect x="82" y="112" width="15" height="18" rx="3" {...s("abs")} onClick={()=>click("abs")} />
      <rect x="103" y="112" width="15" height="18" rx="3" {...s("abs")} onClick={()=>click("abs")} />
      <rect x="82" y="133" width="15" height="18" rx="3" {...s("abs")} onClick={()=>click("abs")} />
      <rect x="103" y="133" width="15" height="18" rx="3" {...s("abs")} onClick={()=>click("abs")} />
      <rect x="82" y="154" width="15" height="14" rx="3" {...s("abs")} onClick={()=>click("abs")} />
      <rect x="103" y="154" width="15" height="14" rx="3" {...s("abs")} onClick={()=>click("abs")} />
      {/* OBLIQUES */}
      <path d="M72 115 Q68 135 70 165 L80 162 Q78 135 80 115Z" {...s("obliques")} onClick={()=>click("obliques")} />
      <path d="M128 115 Q132 135 130 165 L120 162 Q122 135 120 115Z" {...s("obliques")} onClick={()=>click("obliques")} />
      {/* HIP FLEXORS */}
      <path d="M80 168 Q90 165 100 168 Q100 182 80 182Z" {...s("hip_flexors")} onClick={()=>click("hip_flexors")} />
      <path d="M120 168 Q110 165 100 168 Q100 182 120 182Z" {...s("hip_flexors")} onClick={()=>click("hip_flexors")} />
      {/* QUADS */}
      <path d="M68 185 Q80 182 88 185 L90 268 Q78 272 66 268Z" {...s("quads")} onClick={()=>click("quads")} />
      <path d="M132 185 Q120 182 112 185 L110 268 Q122 272 134 268Z" {...s("quads")} onClick={()=>click("quads")} />
      {/* CALVES front */}
      <path d="M68 280 Q78 277 86 280 L84 368 Q76 372 68 368Z" {...s("calves")} onClick={()=>click("calves")} />
      <path d="M132 280 Q122 277 114 280 L116 368 Q124 372 132 368Z" {...s("calves")} onClick={()=>click("calves")} />
    </svg>
  );

  // BACK VIEW
  return (
    <svg viewBox="0 0 200 420" style={{ width:"100%", height:"100%" }}>
      <ellipse cx="100" cy="38" rx="22" ry="26" fill="#2a2a3e" stroke="#3d3d5c" strokeWidth="1.5"/>
      <rect x="68" y="62" width="64" height="110" rx="8" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>
      <rect x="38" y="65" width="28" height="90" rx="10" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>
      <rect x="134" y="65" width="28" height="90" rx="10" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>
      <rect x="65" y="168" width="32" height="110" rx="8" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>
      <rect x="103" y="168" width="32" height="110" rx="8" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>
      <rect x="66" y="272" width="30" height="110" rx="6" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>
      <rect x="104" y="272" width="30" height="110" rx="6" fill="#1e1e35" stroke="#3d3d5c" strokeWidth="1"/>

      {/* TRAPS */}
      <path d="M80 62 Q100 72 120 62 L118 88 Q100 96 82 88Z" {...s("traps")} onClick={()=>click("traps")} />
      {/* SHOULDERS back */}
      <ellipse cx="58" cy="75" rx="14" ry="16" {...s("shoulders")} onClick={()=>click("shoulders")} />
      <ellipse cx="142" cy="75" rx="14" ry="16" {...s("shoulders")} onClick={()=>click("shoulders")} />
      {/* LATS */}
      <path d="M72 90 Q68 95 70 145 L88 148 Q86 100 82 90Z" {...s("lats")} onClick={()=>click("lats")} />
      <path d="M128 90 Q132 95 130 145 L112 148 Q114 100 118 90Z" {...s("lats")} onClick={()=>click("lats")} />
      {/* LOWER BACK */}
      <path d="M86 148 Q100 155 114 148 L114 170 Q100 176 86 170Z" {...s("lower_back")} onClick={()=>click("lower_back")} />
      {/* TRICEPS */}
      <path d="M42 90 Q34 92 36 128 Q44 130 50 126 Q52 92 42 90Z" {...s("triceps")} onClick={()=>click("triceps")} />
      <path d="M158 90 Q166 92 164 128 Q156 130 150 126 Q148 92 158 90Z" {...s("triceps")} onClick={()=>click("triceps")} />
      {/* GLUTES */}
      <path d="M72 170 Q86 166 100 170 L100 215 Q86 220 72 215Z" {...s("glutes")} onClick={()=>click("glutes")} />
      <path d="M128 170 Q114 166 100 170 L100 215 Q114 220 128 215Z" {...s("glutes")} onClick={()=>click("glutes")} />
      {/* HAMSTRINGS */}
      <path d="M70 220 Q82 216 90 220 L88 275 Q76 278 68 275Z" {...s("hamstrings")} onClick={()=>click("hamstrings")} />
      <path d="M130 220 Q118 216 110 220 L112 275 Q124 278 132 275Z" {...s("hamstrings")} onClick={()=>click("hamstrings")} />
      {/* HIP ABDUCTOR */}
      <path d="M66 182 Q72 178 76 184 L74 220 Q68 222 64 218Z" {...s("hip_abductor")} onClick={()=>click("hip_abductor")} />
      <path d="M134 182 Q128 178 124 184 L126 220 Q132 222 136 218Z" {...s("hip_abductor")} onClick={()=>click("hip_abductor")} />
      {/* HIP ADDUCTORS (inner thigh, visible from back) */}
      <path d="M92 222 Q100 218 108 222 L106 270 Q100 274 94 270Z" {...s("hip_adductors")} onClick={()=>click("hip_adductors")} />
      {/* CALVES back */}
      <path d="M68 282 Q78 278 86 282 L84 370 Q76 374 68 370Z" {...s("calves")} onClick={()=>click("calves")} />
      <path d="M132 282 Q122 278 114 282 L116 370 Q124 374 132 370Z" {...s("calves")} onClick={()=>click("calves")} />
    </svg>
  );
};

// ─────────────────────────────────────────────
// Muscle Map Panel — used on Dashboard + Exercise Detail
// ─────────────────────────────────────────────
const MuscleMapPanel = ({ logs, exercises, highlightEx = null }) => {
  const [view, setView] = useState("front");
  const [hoveredMuscle, setHoveredMuscle] = useState(null);

  // For dashboard: show weekly volume. For exercise: show what it works
  const muscleData = calcMuscleVolume(logs, exercises);
  const primary   = highlightEx ? (EXERCISE_MUSCLES[highlightEx.id]?.primary   || []) : [];
  const secondary = highlightEx ? (EXERCISE_MUSCLES[highlightEx.id]?.secondary || []) : [];

  const muscleName = (m) => m.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  // Weekly summary stats for dashboard
  const worked  = ALL_MUSCLES.filter(m => muscleData[m] >= 4).length;
  const partial = ALL_MUSCLES.filter(m => muscleData[m] >= 1 && muscleData[m] < 4).length;
  const resting = ALL_MUSCLES.filter(m => muscleData[m] === 0).length;

  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:14, marginBottom:12 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.text }}>
          {highlightEx ? `${highlightEx.name}` : "Weekly muscle coverage"}
        </div>
        <div style={{ display:"flex", gap:5 }}>
          {["front","back"].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding:"4px 10px", borderRadius:5, border:"none", cursor:"pointer", fontSize:10, fontWeight:700, background:view===v?C.indigo:C.input, color:view===v?"#fff":C.muted, textTransform:"capitalize" }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly stats row — only on dashboard */}
      {!highlightEx && (
        <div style={{ display:"flex", gap:6, marginBottom:12 }}>
          {[
            { label:"Worked", count:worked,  color:C.green },
            { label:"Partial", count:partial, color:C.amber },
            { label:"Resting", count:resting, color:C.dim  },
          ].map(s => (
            <div key={s.label} style={{ flex:1, background:C.input, borderRadius:7, padding:"6px 8px", textAlign:"center" }}>
              <div style={{ fontSize:16, fontWeight:800, color:s.color }}>{s.count}</div>
              <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise highlight legend */}
      {highlightEx && (primary.length > 0 || secondary.length > 0) && (
        <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
          {primary.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:C.indigo }}>
              <div style={{ width:10, height:10, borderRadius:2, background:C.indigo }} />
              Primary: {primary.map(muscleName).join(", ")}
            </div>
          )}
          {secondary.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:C.purple }}>
              <div style={{ width:10, height:10, borderRadius:2, background:C.purple }} />
              Secondary: {secondary.map(muscleName).join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Body maps side by side */}
      <div style={{ display:"flex", justifyContent:"center", height:220 }}>
        <BodyMap
          muscleData={highlightEx ? {} : muscleData}
          highlightPrimary={primary}
          highlightSecondary={secondary}
          view={view}
          onClick={m => setHoveredMuscle(hoveredMuscle === m ? null : m)}
        />
      </div>

      {/* Legend — only on dashboard */}
      {!highlightEx && (
        <div style={{ display:"flex", gap:12, marginTop:8, justifyContent:"center" }}>
          {[
            { color:C.green, label:"Well trained" },
            { color:C.amber, label:"Some work" },
            { color:"rgba(45,45,74,0.5)", label:"Needs attention" },
          ].map(l => (
            <div key={l.label} style={{ display:"flex", alignItems:"center", gap:4, fontSize:9, color:C.muted }}>
              <div style={{ width:8, height:8, borderRadius:2, background:l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      )}

      {/* Hovered muscle tooltip */}
      {hoveredMuscle && !highlightEx && (
        <div style={{ marginTop:10, background:C.input, borderRadius:7, padding:"8px 12px", fontSize:11 }}>
          <span style={{ fontWeight:700, color:C.text }}>{muscleName(hoveredMuscle)}</span>
          <span style={{ color:C.muted, marginLeft:6 }}>
            {muscleData[hoveredMuscle] >= 4 ? "✅ Well trained this week" :
             muscleData[hoveredMuscle] >= 1 ? "🟡 Some work this week" :
             "🔴 Not trained this week"}
          </span>
        </div>
      )}
    </div>
  );
};


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
// Google Sign-In Screen
// ─────────────────────────────────────────────
const SignInScreen = ({ onSignIn }) => (
  <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',system-ui,sans-serif", padding:"32px 24px", maxWidth:420, margin:"0 auto" }}>
    <div style={{ fontSize:22, fontWeight:800, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:8 }}>Strength Tracker</div>
    <div style={{ fontSize:13, color:C.muted, marginBottom:40, textAlign:"center", lineHeight:1.6 }}>
      Sign in to save your data across all your devices.
    </div>
    <button onClick={onSignIn}
      style={{ display:"flex", alignItems:"center", gap:12, background:"#fff", border:"1px solid #ddd", borderRadius:10, padding:"14px 24px", cursor:"pointer", fontSize:14, fontWeight:600, color:"#333", width:"100%", justifyContent:"center", boxShadow:"0 1px 3px rgba(0,0,0,.1)" }}>
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
    <div style={{ fontSize:10, color:C.dim, marginTop:24, textAlign:"center", lineHeight:1.6 }}>
      Your data is private and secure. We never share it with third parties.
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────
export default function App() {
  const [appReady,     setAppReady]     = useState(false);
  const [user,         setUser]         = useState(null);
  const [exercises,    setExercises]    = useState(SEED_EXERCISES);
  const [logs,         setLogs]         = useState({});
  const [plan,         setPlan]         = useState(EMPTY_PLAN);
  const [profile,      setProfile]      = useState(null);
  const [favourites,   setFavourites]   = useState([]);
  const [bodyWeights,  setBodyWeights]  = useState([]);
  const [photos,       setPhotos]       = useState([]);
  const [calories,     setCalories]     = useState([]);
  const [cardioSessions, setCardioSessions] = useState([]);
  const [dailyLog,     setDailyLog]     = useState({});
  const [planName,     setPlanName]     = useState("My Plan");
  const [dailyLog,     setDailyLog]     = useState({});

  const [activeTab,   setActiveTab]   = useState("dashboard");
  const [detailId,    setDetailId]    = useState(null);
  const [navHistory,  setNavHistory]  = useState([]);
  const [showAdd,     setShowAdd]     = useState(false);
  const [groupFilter, setGroupFilter] = useState("All");
  const [infoEx,      setInfoEx]      = useState(null);
  const [chartType,   setChartType]   = useState("line");
  const [timeFilter,  setTimeFilter]  = useState(null);

  // Load user session and data on mount
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await loadAndSetData(session.user.id);
      }
      setAppReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadAndSetData(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadAndSetData = async (userId) => {
    const data = await loadUserData(userId);
    if (data.profile) {
      // Map DB column names back to app field names
      const p = data.profile;
      setProfile({
        name:          p.name || "",
        age:           p.age || "",
        weight:        p.weight_kg || "",
        height:        p.height_cm || "",
        goal:          p.goal || GOALS[0],
        experience:    p.experience || EXP[1],
        trainingDays:  p.training_days || {},
        emailConsent:  p.email_consent || false,
        emailFrequency:p.email_frequency || "weekly",
        email:         p.email || "",
      });
    }
    if (data.logs)            setLogs(data.logs);
    if (data.customEx?.length) setExercises([...SEED_EXERCISES, ...data.customEx.map(e => ({ ...e, bw:e.bodyweight, group:e.exercise_group, custom:true }))]);
    if (data.plan)            setPlan(data.plan);
    if (data.favourites)      setFavourites(data.favourites);
    if (data.weights)         setBodyWeights(data.weights);
    if (data.photos)          setPhotos(data.photos);
  };

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
  };

  // Persist helpers — all write to Supabase
  const persistProfile = useCallback(async (v) => {
    setProfile(v);
    if (user) await saveProfile(user.id, v);
  }, [user]);

  const persistPlan = useCallback(async (v) => {
    setPlan(v);
    if (user) await savePlan(user.id, v);
  }, [user]);

  const persistFavourites = useCallback(async (newFavs, changedId) => {
    const wasFav = favourites.includes(changedId);
    setFavourites(newFavs);
    if (user && changedId) await toggleFavouriteDB(user.id, changedId, wasFav);
  }, [user, favourites]);

  if (!appReady) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',system-ui,sans-serif", gap:14 }}>
        <div style={{ fontSize:20, fontWeight:800, background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Strength Tracker</div>
        <div style={{ color:C.muted, fontSize:12 }}>Loading…</div>
      </div>
    );
  }

  if (!user) return <SignInScreen onSignIn={handleSignIn} />;

  if (!profile) return <Onboarding onComplete={async p => {
    await saveProfile(user.id, p);
    setProfile(p);
    const defaultPlan = buildDefaultPlan(p);
    await savePlan(user.id, defaultPlan);
    setPlan(defaultPlan);
  }} />;

  const getLatest = exId => { const e = logs[exId]; return e?.length ? e[e.length - 1] : null; };
  const streakData = calcStreaks(logs, plan, exercises);
  const personalRecords = getPersonalRecords(logs, exercises);

  const addLog = async (exId, entry) => {
    const saved = await saveSession(user.id, exId, entry);
    const newEntry = { ...entry, id: saved?.id };
    setLogs(prev => ({ ...prev, [exId]:[...(prev[exId]||[]), newEntry] }));
  };

  const deleteEntry = async (exId, idx) => {
    const entry = logs[exId]?.[idx];
    if (entry?.id) await deleteSession(entry.id);
    setLogs(prev => ({ ...prev, [exId]:(prev[exId]||[]).filter((_,i) => i !== idx) }));
  };

  const removeExercise = async id => {
    const newPlan = { ...plan }; DAYS.forEach(d => { newPlan[d] = (newPlan[d]||[]).filter(x => x !== id); });
    await removeCustomExercise(id);
    await savePlan(user.id, newPlan);
    setExercises(prev => prev.filter(e => e.id !== id));
    setLogs(prev => { const n = {...prev}; delete n[id]; return n; });
    setPlan(newPlan);
    setFavourites(prev => prev.filter(x => x !== id));
    setDetailId(null);
  };

  const toggleFav = id => {
    const wasFav = favourites.includes(id);
    const newFavs = wasFav ? favourites.filter(x => x !== id) : [...favourites, id];
    persistFavourites(newFavs, id);
  };

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
    { id:"dashboard", icon:"🏠", label:"Home"   },
    { id:"myplan",    icon:"🎯", label:"Plan+"  },
    { id:"plan",      icon:"📅", label:"Week"   },
    { id:"exercises", icon:"💪", label:"Exs"    },
    { id:"overview",  icon:"📈", label:"Charts" },
    { id:"stats",     icon:"⭐", label:"Stats"  },
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
          <button onClick={()=>{ setDetailId(null); setActiveTab("profile"); setNavHistory([]); }}
            style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6, padding:0 }}>
            <span style={{ fontSize:11, color:C.muted }}>{profileSub}</span>
            <span style={{ fontSize:14 }}>👤</span>
          </button>
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
            logs={logs}
            exercises={exercises}
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
          <Dashboard exercises={exercises} logs={logs} plan={plan} onOpenExercise={id => openExercise(id, "Home")} favourites={favExList} streakData={streakData} calories={calories} cardioSessions={cardioSessions} profile={profile} />
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
            <WeeklyPlanner exercises={exercises} plan={plan} onPlanChange={persistPlan} onOpenExercise={id => openExercise(id, "Plan")} logs={logs} profile={profile} onApplyTemplate={async p => { await persistPlan(p); }} />
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
                  onInfo={ex => setInfoEx(ex)}
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

        {!detailId && activeTab === "myplan" && (
          <div>
            <DailyTargetsCard
              dailyLog={dailyLog}
              onUpdate={(date, log) => persistDailyLog({ ...dailyLog, [date]:log })}
              calories={calories}
              cardioSessions={cardioSessions}
            />
            <MyPlanPanel
              exercises={exercises}
              onOpenExercise={id => openExercise(id, "MyPlan")}
              onApplySplit={async () => {
                const newPlan = {};
                DAYS.forEach(d => { newPlan[d] = MY_PLAN.split[d].exercises; });
                await persistPlan(newPlan);
                setActiveTab("plan");
              }}
            />
          </div>
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

            {/* Session summary */}
            <SessionSummary logs={logs} exercises={exercises} calories={calories} cardioSessions={cardioSessions} profile={profile} />

            {/* Calorie tracker */}
            <CalorieTracker
              calories={calories}
              cardioSessions={cardioSessions}
              profile={profile}
              onAddMeal={m => persistCalories([...calories, m])}
              onDeleteMeal={id => persistCalories(calories.filter(c=>(c.id||calories.indexOf(c))!==id))}
              onAddCardio={s => persistCardioSessions([...cardioSessions, s])}
              onDeleteCardio={id => persistCardioSessions(cardioSessions.filter(c=>(c.id||cardioSessions.indexOf(c))!==id))}
            />

            {/* Body weight */}
            <BodyWeightTracker
              bodyWeights={bodyWeights}
              onAdd={async w => { const saved = await saveBodyWeight(user.id, w); setBodyWeights(prev => [...prev, { ...w, id:saved?.id }]); }}
              onDelete={async id => { await deleteBodyWeight(id); setBodyWeights(prev => prev.filter(w => w.id !== id)); }}
            />

            {/* Rest timer */}
            <SectionLabel>Rest Timer</SectionLabel>
            <RestTimer />

            {/* Progress check-ins / photos */}
            <ProgressPhotos
              photos={photos}
              onAdd={async p => { const saved = await saveCheckin(user.id, p); setPhotos(prev => [...prev, { ...p, id:saved?.id }]); }}
              onDelete={async id => { await deleteCheckin(id); setPhotos(prev => prev.filter(p => p.id !== id)); }}
            />

            {/* Export */}
            <SectionLabel>Data</SectionLabel>
            <ExportData logs={logs} exercises={exercises} bodyWeights={bodyWeights} profile={profile} />
          </div>
        )}

        {!detailId && activeTab === "profile" && (
          <ProfileTab profile={profile} onUpdate={persistProfile} onRegeneratePlan={async p => { const newPlan = buildDefaultPlan(p); await persistPlan(newPlan); await persistProfile(p); }} />
        )}
      </div>

      {/* Bottom nav bar — mobile optimised */}
      {!detailId && (
        <nav style={{
          position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
          width:"100%", maxWidth:600,
          background:"linear-gradient(135deg,#1a1a2e,#16162a)",
          borderTop:`1px solid ${C.border}`,
          display:"grid", gridTemplateColumns:"repeat(6,1fr)",
          zIndex:50,
          paddingBottom:"env(safe-area-inset-bottom, 0px)",
        }}>
          {TABS.map(t => {
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{
                  background:"none", border:"none",
                  padding:"8px 2px 10px",
                  cursor:"pointer",
                  display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center",
                  gap:2,
                  position:"relative",
                  minWidth:0,
                }}>
                {/* Active indicator bar at top */}
                <div style={{
                  position:"absolute", top:0, left:"20%", right:"20%",
                  height:2, borderRadius:"0 0 2px 2px",
                  background: active ? C.purple : "transparent",
                  transition:"background .15s",
                }} />
                <span style={{ fontSize:16, lineHeight:1 }}>{t.icon}</span>
                <span style={{
                  fontSize:8, fontWeight:700,
                  color: active ? C.purple : C.dim,
                  letterSpacing:"0.03em",
                  textTransform:"uppercase",
                  lineHeight:1,
                  whiteSpace:"nowrap",
                  overflow:"hidden",
                  textOverflow:"ellipsis",
                  maxWidth:"100%",
                  paddingLeft:2, paddingRight:2,
                }}>{t.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {infoEx && <ExerciseInfoModal ex={infoEx} onClose={() => setInfoEx(null)} />}
      {showAdd && <AddExerciseModal onSave={async ex => {
        await saveCustomExercise(user.id, ex);
        setExercises(prev => [...prev, ex]);
        setShowAdd(false);
      }} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
