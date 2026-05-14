import { useState, useEffect } from "react";

const PLAN_START = new Date(2026, 4, 14); // May 14 local time - avoids UTC offset bug
const DAY_SEQUENCE = ["Legs","Push","Pull","Legs","Push","Pull","Rest"];

const phases = [
  { weeks:[1,2,3], name:"Build the Habit", color:"#4ade80" },
  { weeks:[4,5,6], name:"Add Weight", color:"#facc15" },
  { weeks:[7,8,9], name:"Add Volume", color:"#fb923c" },
  { weeks:[10,11,12], name:"Intensity", color:"#f87171" },
  { weeks:[13], name:"Deload", color:"#818cf8" }
];

const getPhase = (w) => phases.find(p => p.weeks.includes(w)) || phases[0];

const pushVars = [
  { weeks:[1,2], chestMain:"Barbell Bench Press", shoulderMain:"Dumbbell Overhead Press", triMain:"Cable Tricep Pushdown" },
  { weeks:[3,4], chestMain:"Incline Barbell Press", shoulderMain:"Arnold Press", triMain:"Skull Crushers" },
  { weeks:[5,6], chestMain:"Dumbbell Bench Press", shoulderMain:"Seated Barbell OHP", triMain:"Overhead Tricep Extension" },
  { weeks:[7,8], chestMain:"Incline Dumbbell Press", shoulderMain:"Cable Lateral Raises", triMain:"Dips" },
  { weeks:[9,10], chestMain:"Barbell Bench Press", shoulderMain:"Dumbbell Overhead Press", triMain:"Cable Tricep Pushdown" },
  { weeks:[11,12], chestMain:"Incline Barbell Press", shoulderMain:"Arnold Press", triMain:"Close Grip Bench Press" },
  { weeks:[13], chestMain:"Dumbbell Bench Press", shoulderMain:"Dumbbell Overhead Press", triMain:"Cable Tricep Pushdown" }
];

const pullVars = [
  { weeks:[1,2], backMain:"Barbell Row", backSecond:"Lat Pulldown", bicepMain:"Dumbbell Curl" },
  { weeks:[3,4], backMain:"Chest Supported Row", backSecond:"Seated Cable Row", bicepMain:"Barbell Curl" },
  { weeks:[5,6], backMain:"Single Arm Dumbbell Row", backSecond:"Lat Pulldown", bicepMain:"Hammer Curl" },
  { weeks:[7,8], backMain:"T-Bar Row", backSecond:"Pull-Ups", bicepMain:"Incline Dumbbell Curl" },
  { weeks:[9,10], backMain:"Deadlift", backSecond:"Barbell Row", bicepMain:"Dumbbell Curl" },
  { weeks:[11,12], backMain:"Weighted Pull-Ups", backSecond:"Chest Supported Row", bicepMain:"Barbell Curl" },
  { weeks:[13], backMain:"Barbell Row", backSecond:"Lat Pulldown", bicepMain:"Hammer Curl" }
];

const legsVars = [
  { weeks:[1,2], quadMain:"Back Squat", hamMain:"Romanian Deadlift", accessory:"Leg Press" },
  { weeks:[3,4], quadMain:"Front Squat", hamMain:"Leg Curl", accessory:"Walking Lunges" },
  { weeks:[5,6], quadMain:"Hack Squat", hamMain:"Romanian Deadlift", accessory:"Leg Press" },
  { weeks:[7,8], quadMain:"Bulgarian Split Squat", hamMain:"Sumo Deadlift", accessory:"Leg Extension" },
  { weeks:[9,10], quadMain:"Back Squat", hamMain:"Nordic Curl", accessory:"Leg Press" },
  { weeks:[11,12], quadMain:"Front Squat", hamMain:"Romanian Deadlift", accessory:"Bulgarian Split Squat" },
  { weeks:[13], quadMain:"Back Squat", hamMain:"Romanian Deadlift", accessory:"Leg Press" }
];

const getExercises = (weekNum, dayType) => {
  const isDeload = weekNum === 13;
  const highVol = weekNum >= 7 && weekNum <= 12;
  const sets = highVol ? 5 : 4;
  const reps = isDeload ? "6" : "10";
  const pv = pushVars.find(v => v.weeks.includes(weekNum));
  const pllv = pullVars.find(v => v.weeks.includes(weekNum));
  const lv = legsVars.find(v => v.weeks.includes(weekNum));

  if (dayType === "Push") return [
    { id:`push-chest-main`, name:pv.chestMain, bodyPart:"Chest", sets:`${sets}`, reps, isMain:true },
    { id:`push-chest-2`, name:"Incline Dumbbell Press", bodyPart:"Chest", sets:"3", reps:"12", isMain:false },
    { id:`push-chest-3`, name:"Cable Flyes", bodyPart:"Chest", sets:"3", reps:"15", isMain:false },
    { id:`push-sho-main`, name:pv.shoulderMain, bodyPart:"Shoulders", sets:`${sets}`, reps, isMain:true },
    { id:`push-sho-2`, name:"Lateral Raises", bodyPart:"Shoulders", sets:"3", reps:"15", isMain:false },
    { id:`push-tri-main`, name:pv.triMain, bodyPart:"Triceps", sets:"3", reps:"12", isMain:true },
    { id:`push-tri-2`, name:"Tricep Overhead Extension", bodyPart:"Triceps", sets:"3", reps:"12", isMain:false }
  ];
  if (dayType === "Pull") return [
    { id:`pull-back-main`, name:pllv.backMain, bodyPart:"Back", sets:`${sets}`, reps, isMain:true },
    { id:`pull-back-2`, name:pllv.backSecond, bodyPart:"Back", sets:"3", reps:"12", isMain:false },
    { id:`pull-back-3`, name:"Seated Cable Row", bodyPart:"Back", sets:"3", reps:"12", isMain:false },
    { id:`pull-back-4`, name:"Face Pulls", bodyPart:"Rear Delts", sets:"3", reps:"15", isMain:false },
    { id:`pull-bi-main`, name:pllv.bicepMain, bodyPart:"Biceps", sets:"3", reps:"12", isMain:true },
    { id:`pull-bi-2`, name:"Hammer Curl", bodyPart:"Biceps", sets:"3", reps:"12", isMain:false }
  ];
  if (dayType === "Legs") return [
    { id:`legs-quad-main`, name:lv.quadMain, bodyPart:"Quads", sets:`${sets}`, reps, isMain:true },
    { id:`legs-quad-2`, name:lv.accessory, bodyPart:"Quads", sets:"3", reps:"15", isMain:false },
    { id:`legs-ham-main`, name:lv.hamMain, bodyPart:"Hamstrings", sets:`${sets}`, reps, isMain:true },
    { id:`legs-ham-2`, name:"Leg Curl", bodyPart:"Hamstrings", sets:"3", reps:"12", isMain:false },
    { id:`legs-calf`, name:"Standing Calf Raise", bodyPart:"Calves", sets:"4", reps:"20", isMain:false },
    { id:`legs-core-1`, name:"Plank", bodyPart:"Core", sets:"3", reps:"45sec", isMain:false },
    { id:`legs-core-2`, name:"Cable Crunch", bodyPart:"Core", sets:"3", reps:"15", isMain:false }
  ];
  return [];
};

const getDaySchedule = (date) => {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  const start = new Date(PLAN_START);
  start.setHours(0,0,0,0);
  const diffDays = Math.floor((d - start) / (1000*60*60*24));
  if (diffDays < 0 || diffDays > 90) return null;
  const weekNum = Math.floor(diffDays / 7) + 1;
  const dayInCycle = diffDays % 7;
  const dayType = DAY_SEQUENCE[dayInCycle];
  if (dayType === "Rest") return { type:"Rest", weekNum, phase:getPhase(weekNum) };
  const exercises = getExercises(weekNum, dayType);
  return { type:dayType, weekNum, phase:getPhase(weekNum), exercises };
};

const MEALS = [
  {
    id:"breakfast", time:"7:00 AM", name:"Omelet + Yogurt Bowl", protein:72, carbs:10,
    items:[
      { name:"4 Scrambled Eggs", protein:24, measure:"4 eggs" },
      { name:"Bacon Crumbles", protein:9, measure:"30g" },
      { name:"Shredded Cheese", protein:7, measure:"30g" },
      { name:"Greek Yogurt", protein:15, measure:"150g" },
      { name:"Nutrail Granola", protein:17, measure:"30g" },
      { name:"Blueberries", protein:0, measure:"50g" }
    ]
  },
  {
    id:"lunch", time:"12:00 PM", name:"Ground Beef Caesar Bowl", protein:48, carbs:8,
    items:[
      { name:"Ground Beef 80/20", protein:46, measure:"200g cooked" },
      { name:"Romaine Lettuce", protein:1, measure:"big handful" },
      { name:"Caesar Dressing", protein:1, measure:"2 tbsp" },
      { name:"Bacon Crumbles", protein:6, measure:"20g" },
      { name:"Shredded Cheese", protein:5, measure:"20g" }
    ]
  },
  {
    id:"snack", time:"3:30 PM", name:"Tuna + Avocado", protein:37, carbs:2,
    items:[
      { name:"Canned Tuna", protein:25, measure:"1 can" },
      { name:"Avocado", protein:2, measure:"½ avocado" },
      { name:"Hot Sauce", protein:0, measure:"to taste" }
    ]
  },
  {
    id:"dinner", time:"6:30 PM", name:"Ground Beef Stir Fry", protein:57, carbs:8,
    items:[
      { name:"Ground Beef 80/20", protein:48, measure:"250g cooked" },
      { name:"Broccoli / Zucchini", protein:3, measure:"1 cup" },
      { name:"Shredded Cheese", protein:6, measure:"20g" },
      { name:"Soy Sauce + Garlic", protein:0, measure:"2 tbsp" }
    ]
  }
];

const BODY_PARTS = ["Chest","Back","Shoulders","Biceps","Triceps","Quads","Hamstrings","Calves","Core","Rear Delts"];

const storageGet = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const storageSet = (key, val) => {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const formatDate = (d) => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

function ExerciseCard({ exercise, weekNum, prBoard, workoutLogs, todayKey, activeExercise, setActiveExercise, onLogSet }) {
  const isOpen = activeExercise === exercise.id;
  const logKey = `${todayKey}-${exercise.id}`;
  const logged = workoutLogs[logKey];
  const pr = prBoard[exercise.name];
  const prevPR = pr ? `PR: ${pr.weight} lbs (Wk ${pr.weekNum})` : null;
  const nextTarget = pr ? `Target: ${Math.round(pr.weight * 1.025 / 2.5) * 2.5} lbs` : null;
  const setsCount = parseInt(exercise.sets);
  const [localSets, setLocalSets] = useState(
    Array.from({length: setsCount}, (_,i) => ({
      weight: logged?.sets?.[i]?.weight || "",
      reps: logged?.sets?.[i]?.reps || exercise.reps
    }))
  );
  const [newPR, setNewPR] = useState(false);

  const handleLog = (setIdx, field, val) => {
    setLocalSets(prev => {
      const updated = [...prev];
      updated[setIdx] = {...updated[setIdx], [field]: val};
      return updated;
    });
  };

  const handleSave = (setIdx) => {
    const s = localSets[setIdx];
    if (!s.weight || !s.reps) return;
    const isPR = onLogSet(exercise.id, exercise.name, exercise.bodyPart, setIdx, s.weight, s.reps);
    if (isPR) setNewPR(true);
  };

  const completedSets = logged?.sets?.filter(Boolean).length || 0;
  const allDone = completedSets >= setsCount;

  return (
    <div style={{
      background: allDone ? "#0d1f0d" : "#111118",
      border:`1px solid ${allDone ? "#4ade8033" : exercise.isMain ? "#333" : "#1a1a2e"}`,
      borderRadius:14, marginBottom:10, overflow:"hidden"
    }}>
      <button onClick={() => setActiveExercise(isOpen ? null : exercise.id)} style={{
        width:"100%", background:"none", border:"none", padding:"14px", cursor:"pointer",
        display:"flex", justifyContent:"space-between", alignItems:"center", textAlign:"left"
      }}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            {exercise.isMain && <span style={{fontSize:9,background:"#facc1522",color:"#facc15",padding:"2px 7px",borderRadius:99,letterSpacing:1,fontWeight:700,textTransform:"uppercase"}}>Main</span>}
            {newPR && <span style={{fontSize:9,background:"#4ade8022",color:"#4ade80",padding:"2px 7px",borderRadius:99,letterSpacing:1,fontWeight:700,textTransform:"uppercase"}}>🏆 NEW PR!</span>}
          </div>
          <div style={{fontSize:15,fontWeight:700,color:"#f0f0f0"}}>{exercise.name}</div>
          <div style={{fontSize:11,color:"#555",marginTop:2}}>{exercise.sets} sets × {exercise.reps} reps · {exercise.bodyPart}</div>
          {prevPR && !isOpen && <div style={{fontSize:10,color:"#4ade8077",marginTop:3}}>{prevPR}</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {allDone && <span style={{fontSize:18}}>✅</span>}
          {!allDone && completedSets > 0 && <span style={{fontSize:11,color:"#facc15"}}>{completedSets}/{setsCount}</span>}
          <span style={{color:"#444",fontSize:18}}>{isOpen?"↑":"↓"}</span>
        </div>
      </button>

      {isOpen && (
        <div style={{padding:"0 14px 14px",borderTop:"1px solid #1a1a2e"}}>
          {prevPR && (
            <div style={{background:"#0d1a0d",border:"1px solid #4ade8022",borderRadius:10,padding:"8px 12px",marginBottom:12,marginTop:10,display:"flex",justifyContent:"space-between",fontSize:11}}>
              <span style={{color:"#4ade80"}}>{prevPR}</span>
              <span style={{color:"#22d3ee"}}>{nextTarget}</span>
            </div>
          )}
          <div style={{display:"flex",gap:6,fontSize:10,color:"#555",marginBottom:8,marginTop:10,padding:"0 4px"}}>
            <span style={{flex:1}}>Set</span>
            <span style={{width:80,textAlign:"center"}}>Weight (lbs)</span>
            <span style={{width:60,textAlign:"center"}}>Reps</span>
            <span style={{width:44}}/>
          </div>
          {localSets.map((s, i) => {
            const savedSet = workoutLogs[logKey]?.sets?.[i];
            return (
              <div key={i} style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
                <div style={{flex:1,fontSize:13,color:savedSet?"#4ade80":"#555",fontWeight:700}}>Set {i+1}{savedSet?" ✓":""}</div>
                <input type="number" value={s.weight} onChange={e=>handleLog(i,"weight",e.target.value)} placeholder="0"
                  style={{width:80,background:"#1a1a2e",border:`1px solid ${savedSet?"#4ade8033":"#2a2a3a"}`,borderRadius:8,padding:"8px",color:"#fff",fontSize:14,textAlign:"center",outline:"none"}}/>
                <input type="number" value={s.reps} onChange={e=>handleLog(i,"reps",e.target.value)} placeholder={exercise.reps}
                  style={{width:60,background:"#1a1a2e",border:`1px solid ${savedSet?"#4ade8033":"#2a2a3a"}`,borderRadius:8,padding:"8px",color:"#fff",fontSize:14,textAlign:"center",outline:"none"}}/>
                <button onClick={() => handleSave(i)} style={{width:44,height:36,background:savedSet?"#4ade8022":"#1a2e1a",border:`1px solid ${savedSet?"#4ade80":"#2a3a2a"}`,borderRadius:8,color:savedSet?"#4ade80":"#4ade8088",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✓</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState("today");
  const [prTab, setPrTab] = useState("Chest");
  const [mounted, setMounted] = useState(false);
  const [weightLog, setWeightLog] = useState({});
  const [prBoard, setPrBoard] = useState({});
  const [workoutLogs, setWorkoutLogs] = useState({});
  const [mealLog, setMealLog] = useState({});
  const [newWeight, setNewWeight] = useState("");
  const [activeExercise, setActiveExercise] = useState(null);

  useEffect(() => {
    setMounted(true);
    setWeightLog(storageGet("weightLog", {}));
    setPrBoard(storageGet("prBoard", {}));
    setWorkoutLogs(storageGet("workoutLogs", {}));
    setMealLog(storageGet("mealLog", {}));
  }, []);

  useEffect(() => { if (mounted) storageSet("weightLog", weightLog); }, [weightLog, mounted]);
  useEffect(() => { if (mounted) storageSet("prBoard", prBoard); }, [prBoard, mounted]);
  useEffect(() => { if (mounted) storageSet("workoutLogs", workoutLogs); }, [workoutLogs, mounted]);
  useEffect(() => { if (mounted) storageSet("mealLog", mealLog); }, [mealLog, mounted]);

  const today = new Date();
  today.setHours(0,0,0,0);
  const todayKey = today.toISOString().split("T")[0];
  const schedule = getDaySchedule(today);
  const start = new Date(PLAN_START);
  start.setHours(0,0,0,0);
  const dayProgress = Math.max(0, Math.min(90, Math.floor((today - start) / (1000*60*60*24))));
  const weekNum = schedule?.weekNum || 1;

  const logWeight = () => {
    if (!newWeight) return;
    setWeightLog(prev => ({ ...prev, [todayKey]: parseFloat(newWeight) }));
    setNewWeight("");
  };

  const logPR = (exerciseName, bodyPart, weight) => {
    const existing = prBoard[exerciseName];
    if (!existing || weight > existing.weight) {
      setPrBoard(prev => ({ ...prev, [exerciseName]: { weight, bodyPart, date: todayKey, weekNum } }));
      return true;
    }
    return false;
  };

  const logSet = (exerciseId, exerciseName, bodyPart, setNum, weight, reps) => {
    const key = `${todayKey}-${exerciseId}`;
    setWorkoutLogs(prev => {
      const existing = prev[key] || { sets: [] };
      const sets = [...existing.sets];
      sets[setNum] = { weight: parseFloat(weight), reps: parseInt(reps) };
      return { ...prev, [key]: { exerciseName, bodyPart, sets } };
    });
    return logPR(exerciseName, bodyPart, parseFloat(weight));
  };

  const toggleMeal = (mealId) => {
    setMealLog(prev => ({ ...prev, [todayKey]: { ...(prev[todayKey] || {}), [mealId]: !(prev[todayKey]?.[mealId]) } }));
  };

  const todayMeals = mealLog[todayKey] || {};
  const proteinEaten = MEALS.filter(m => todayMeals[m.id]).reduce((s, m) => s + m.protein, 0);
  const proteinPct = Math.min(100, Math.round((proteinEaten / 220) * 100));
  const weightEntries = Object.entries(weightLog).sort((a,b) => a[0].localeCompare(b[0]));
  const currentWeight = weightEntries.length ? weightEntries[weightEntries.length-1][1] : 230;
  const lostSoFar = Math.max(0, 230 - currentWeight);

  if (!mounted) return <div style={{background:"#0a0a0f",minHeight:"100vh"}}/>;

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#f0f0f0",fontFamily:"system-ui,sans-serif",maxWidth:430,margin:"0 auto",overflowX:"hidden"}}>
      {/* Header */}
      <div style={{padding:"52px 20px 12px",background:"linear-gradient(180deg,#111118 0%,transparent 100%)",position:"sticky",top:0,zIndex:50,backdropFilter:"blur(12px)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:11,letterSpacing:3,color:"#666",textTransform:"uppercase",marginBottom:2}}>90-Day Plan</div>
            <div style={{fontSize:20,fontWeight:700,color:"#fff"}}>Peter's Tracker 💪</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:22,fontWeight:800,color:"#4ade80"}}>{currentWeight} <span style={{fontSize:13,color:"#666"}}>lbs</span></div>
            <div style={{fontSize:11,color:"#4ade80"}}>-{lostSoFar} lbs lost</div>
          </div>
        </div>
        <div style={{marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#555",marginBottom:4}}>
            <span>Day {dayProgress}/90</span><span>Aug 12 🎯</span>
          </div>
          <div style={{height:4,background:"#1a1a2e",borderRadius:99}}>
            <div style={{height:4,background:"linear-gradient(90deg,#4ade80,#22d3ee)",borderRadius:99,width:`${(dayProgress/90)*100}%`}}/>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{display:"flex",padding:"0 16px",gap:6,marginBottom:16,overflowX:"auto",scrollbarWidth:"none"}}>
        {[{id:"today",icon:"🏋️",label:"Today"},{id:"meals",icon:"🥩",label:"Meals"},{id:"prs",icon:"🏆",label:"PRs"},{id:"weight",icon:"📊",label:"Weight"},{id:"plan",icon:"📅",label:"Plan"}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{flex:"0 0 auto",padding:"8px 14px",borderRadius:99,border:"none",cursor:"pointer",background:tab===t.id?"#4ade80":"#1a1a2e",color:tab===t.id?"#0a0a0f":"#888",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* TODAY */}
      {tab==="today" && (
        <div style={{padding:"0 16px 120px"}}>
          {schedule && (
            <div style={{background:"#111118",border:`1px solid ${schedule.phase?.color||"#333"}33`,borderRadius:16,padding:"16px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:11,color:schedule.phase?.color,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Week {schedule.weekNum} · {schedule.phase?.name}</div>
                  <div style={{fontSize:22,fontWeight:800}}>{schedule.type==="Rest"?"🛌 Rest Day":`${schedule.type} Day`}</div>
                  <div style={{fontSize:12,color:"#666",marginTop:2}}>{formatDate(today)}</div>
                </div>
                <div style={{width:56,height:56,borderRadius:14,background:`${schedule.phase?.color}22`,border:`2px solid ${schedule.phase?.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>
                  {schedule.type==="Push"?"💪":schedule.type==="Pull"?"🔙":schedule.type==="Legs"?"🦵":"😴"}
                </div>
              </div>
            </div>
          )}

          <div style={{background:"#111118",border:"1px solid #222",borderRadius:16,padding:16,marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
            <div style={{position:"relative",width:70,height:70,flexShrink:0}}>
              <svg width="70" height="70" style={{transform:"rotate(-90deg)"}}>
                <circle cx="35" cy="35" r="28" fill="none" stroke="#1a1a2e" strokeWidth="7"/>
                <circle cx="35" cy="35" r="28" fill="none" stroke="#4ade80" strokeWidth="7" strokeDasharray={`${2*Math.PI*28}`} strokeDashoffset={`${2*Math.PI*28*(1-proteinPct/100)}`} strokeLinecap="round"/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:16,fontWeight:800,color:"#4ade80"}}>{proteinPct}%</div>
              </div>
            </div>
            <div>
              <div style={{fontSize:13,color:"#888",marginBottom:4}}>Daily Protein</div>
              <div style={{fontSize:28,fontWeight:800}}>{proteinEaten}<span style={{fontSize:14,color:"#555"}}>/220g</span></div>
              <div style={{fontSize:11,color:"#555"}}>{220-proteinEaten}g remaining</div>
            </div>
          </div>

          {schedule?.exercises && (
            <div>
              <div style={{fontSize:13,color:"#666",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Exercises</div>
              {schedule.exercises.map(ex => (
                <ExerciseCard key={ex.id} exercise={ex} weekNum={weekNum} prBoard={prBoard} workoutLogs={workoutLogs} todayKey={todayKey} activeExercise={activeExercise} setActiveExercise={setActiveExercise} onLogSet={logSet}/>
              ))}
            </div>
          )}

          {schedule?.type==="Rest" && (
            <div style={{textAlign:"center",padding:"40px 20px",color:"#444"}}>
              <div style={{fontSize:48,marginBottom:12}}>😴</div>
              <div style={{fontSize:18,fontWeight:700,color:"#666"}}>Rest day. You earned it.</div>
              <div style={{fontSize:13,marginTop:8}}>Recovery is part of the plan.</div>
            </div>
          )}
        </div>
      )}

      {/* MEALS */}
      {tab==="meals" && (
        <div style={{padding:"0 16px 120px"}}>
          <div style={{background:"#111118",border:"1px solid #222",borderRadius:16,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,color:"#666",marginBottom:4}}>Today's Protein</div>
            <div style={{fontSize:32,fontWeight:800,color:"#4ade80"}}>{proteinEaten}g <span style={{fontSize:14,color:"#555",fontWeight:400}}>/ 220g</span></div>
            <div style={{marginTop:10,height:6,background:"#1a1a2e",borderRadius:99}}>
              <div style={{height:6,background:"linear-gradient(90deg,#4ade80,#22d3ee)",borderRadius:99,width:`${proteinPct}%`}}/>
            </div>
          </div>
          {MEALS.map(meal => (
            <div key={meal.id} style={{background:todayMeals[meal.id]?"#0d1f0d":"#111118",border:`1px solid ${todayMeals[meal.id]?"#4ade8033":"#222"}`,borderRadius:16,padding:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{fontSize:11,color:"#555",marginBottom:2}}>{meal.time}</div>
                  <div style={{fontSize:16,fontWeight:700}}>{meal.name}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:18,fontWeight:800,color:"#4ade80"}}>{meal.protein}g</div>
                    <div style={{fontSize:10,color:"#555"}}>protein</div>
                  </div>
                  <button onClick={() => toggleMeal(meal.id)} style={{width:36,height:36,borderRadius:10,border:`2px solid ${todayMeals[meal.id]?"#4ade80":"#333"}`,background:todayMeals[meal.id]?"#4ade80":"transparent",cursor:"pointer",fontSize:18,color:todayMeals[meal.id]?"#0a0a0f":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>✓</button>
                </div>
              </div>
              <div style={{borderTop:"1px solid #1a1a2e",paddingTop:10,display:"flex",flexDirection:"column",gap:4}}>
                {meal.items.map((item,i) => (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                    <span style={{color:"#888"}}>{item.name}</span>
                    <span style={{color:"#555"}}>{item.measure} {item.protein>0&&<span style={{color:"#4ade8088"}}>+{item.protein}g</span>}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{background:"#111118",border:"1px dashed #222",borderRadius:16,padding:16,textAlign:"center",color:"#444",fontSize:13}}>💧 Drink 100oz water today</div>
        </div>
      )}

      {/* PRs */}
      {tab==="prs" && (
        <div style={{padding:"0 16px 120px"}}>
          <div style={{fontSize:11,color:"#666",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>PR Board — By Body Part</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
            {BODY_PARTS.map(bp => {
              const hasPR = Object.values(prBoard).some(p => p.bodyPart===bp);
              return (
                <button key={bp} onClick={() => setPrTab(bp)} style={{padding:"6px 12px",borderRadius:99,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:prTab===bp?"#4ade80":hasPR?"#1a2e1a":"#1a1a2e",color:prTab===bp?"#0a0a0f":hasPR?"#4ade80":"#555"}}>{bp}</button>
              );
            })}
          </div>
          {Object.entries(prBoard).filter(([,v])=>v.bodyPart===prTab).sort((a,b)=>b[1].weight-a[1].weight).map(([name,data]) => {
            const nextTarget = Math.round(data.weight*1.025/2.5)*2.5;
            return (
              <div key={name} style={{background:"#111118",border:"1px solid #4ade8022",borderRadius:14,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>{name}</div>
                    <div style={{fontSize:11,color:"#555"}}>Week {data.weekNum} · {data.date}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:24,fontWeight:800,color:"#4ade80"}}>{data.weight}<span style={{fontSize:12,color:"#555"}}> lbs</span></div>
                    <div style={{fontSize:10,color:"#22d3ee"}}>→ {nextTarget} lbs next</div>
                  </div>
                </div>
              </div>
            );
          })}
          {Object.values(prBoard).filter(p=>p.bodyPart===prTab).length===0 && (
            <div style={{textAlign:"center",padding:"40px 20px",color:"#333"}}>
              <div style={{fontSize:36,marginBottom:8}}>🏆</div>
              <div style={{fontSize:14}}>No {prTab} PRs yet.</div>
            </div>
          )}
        </div>
      )}

      {/* WEIGHT */}
      {tab==="weight" && (
        <div style={{padding:"0 16px 120px"}}>
          <div style={{background:"#111118",border:"1px solid #222",borderRadius:16,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,color:"#666",marginBottom:8}}>Log Today's Weight</div>
            <div style={{display:"flex",gap:8}}>
              <input type="number" value={newWeight} onChange={e=>setNewWeight(e.target.value)} placeholder="230.0"
                style={{flex:1,background:"#1a1a2e",border:"1px solid #333",borderRadius:10,padding:"10px 14px",color:"#fff",fontSize:16,outline:"none"}}/>
              <button onClick={logWeight} style={{background:"#4ade80",color:"#0a0a0f",border:"none",borderRadius:10,padding:"10px 18px",fontWeight:800,fontSize:14,cursor:"pointer"}}>Log</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[{label:"Start",value:"230 lbs",color:"#666"},{label:"Current",value:`${currentWeight} lbs`,color:"#4ade80"},{label:"Lost",value:`${lostSoFar} lbs`,color:"#22d3ee"},{label:"Goal",value:"200 lbs",color:"#f59e0b"}].map(s => (
              <div key={s.label} style={{background:"#111118",border:"1px solid #222",borderRadius:14,padding:14}}>
                <div style={{fontSize:11,color:"#555",marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:"#666",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Log History</div>
          {weightEntries.length===0 && <div style={{textAlign:"center",padding:"30px",color:"#333",fontSize:13}}>No weigh-ins yet. Log every Monday morning.</div>}
          {weightEntries.map(([date,weight]) => (
            <div key={date} style={{background:"#111118",border:"1px solid #1a1a2e",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:13,color:"#888"}}>{formatDate(new Date(date))}</div>
              <div style={{fontSize:18,fontWeight:700}}>{weight} lbs</div>
            </div>
          ))}
        </div>
      )}

      {/* PLAN */}
      {tab==="plan" && (
        <div style={{padding:"0 16px 120px"}}>
          {phases.map(phase => (
            <div key={phase.name} style={{marginBottom:20}}>
              <div style={{fontSize:11,color:phase.color,letterSpacing:2,textTransform:"uppercase",marginBottom:10,fontWeight:700}}>
                Weeks {phase.weeks[0]}{phase.weeks.length>1?`–${phase.weeks[phase.weeks.length-1]}`:""} · {phase.name}
              </div>
              {phase.weeks.map(w => {
                const pv = pushVars.find(v=>v.weeks.includes(w));
                const pllv = pullVars.find(v=>v.weeks.includes(w));
                const lv = legsVars.find(v=>v.weeks.includes(w));
                const startD = new Date(PLAN_START);
                startD.setDate(startD.getDate()+(w-1)*7);
                return (
                  <div key={w} style={{background:"#111118",border:`1px solid ${phase.color}22`,borderRadius:14,padding:14,marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{fontSize:15,fontWeight:700}}>Week {w}</div>
                      <div style={{fontSize:11,color:"#555"}}>{formatDate(startD)}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {[
                        {icon:"💪",label:`Push · ${pv?.chestMain}`},
                        {icon:"🔙",label:`Pull · ${pllv?.backMain}`},
                        {icon:"🦵",label:`Legs · ${lv?.quadMain}`}
                      ].map(d => (
                        <div key={d.label} style={{display:"flex",gap:10,alignItems:"center"}}>
                          <span style={{fontSize:14}}>{d.icon}</span>
                          <span style={{fontSize:12,color:"#ccc"}}>{d.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
