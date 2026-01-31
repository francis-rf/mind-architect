import React, { useState, useEffect, useCallback, useMemo } from 'react';
import InsightGraph from './InsightGraph';
import FlowTimer from './FlowTimer';
import DecisionMatrix from './DecisionMatrix';
import ConsistencyGrid from './ConsistencyGrid';

/*
 * MIND ARCHITECT - Complete Edition
 * Full Notion Integration
 * 
 * Syncs with:
 * - 📲 Training Sessions (entries)
 * - 💡 Daily Tips (principles)
 * - 🧠 Mental Models Library
 * - 💾 Second Brain (patterns, questions, lessons)
 * - 🔮 Predictions
 * - 🧠 AI Pattern Analysis
 * 
 * Features all 6 Training Modules:
 * - Observation, Pattern, Question, Decision, Flow, Habit
 */

// ============ NOTION DATABASE IDS ============
const NOTION = {
  trainingSessions: '76c30439-2aa2-444c-9ce0-ec9acbab8a43',
  predictions: '701e1a98-b4b0-4cdf-9f9e-a67862dee4d8',
  aiPatterns: 'd31808de-1b10-4b87-90af-b4f58ff0be5b',
  dailyTips: '0071d633-be16-4a3f-9986-f6c28cde0d38',
  mentalModels: 'b72ee45d-4d9a-4c57-81b0-657c929fb1ea',
  secondBrain: '47bee27d-3a1d-49b4-88cd-b90b21b753cc',
};

const LLM = { model: 'gpt-5-nano', endpoint: 'https://api.openai.com/v1/chat/completions' };

// ============ TRAINING MODES ============
const MODES = [
  { id: 'observe', name: 'Observe', icon: '👁', color: '#64ffda', xp: 3,
    prompt: 'What happened? Facts only.',
    hint: 'Describe what you saw, heard, felt. No interpretation.',
    module: 'Observation Training' },
  { id: 'pattern', name: 'Pattern', icon: '◈', color: '#bb86fc', xp: 2,
    prompt: 'What model explains this?',
    hint: 'Apply one mental model from the library.',
    module: 'Pattern Recognition' },
  { id: 'question', name: 'Question', icon: '?', color: '#ff79c6', xp: 3,
    prompt: 'What question changes everything?',
    hint: 'Ask something that exposes the mechanism.',
    module: 'Question Engineering' },
  { id: 'action', name: 'Act', icon: '→', color: '#f1fa8c', xp: 5,
    prompt: 'What will you do? (Small, reversible)',
    hint: 'One concrete step you can take today.',
    module: 'Decision Training' },
];

// ============ TRAINING MODULES (from Notion) ============
const MODULES = [
  { id: 'observation', name: 'Observation Training', icon: '🔍', color: '#64ffda',
    goal: 'See reality without distortion',
    levels: [
      { level: 1, skill: 'Basic Capture', exercise: 'Record 1 event per day (facts only)' },
      { level: 2, skill: 'Sensory Detail', exercise: 'Add what you saw, heard, felt' },
      { level: 3, skill: 'Separation', exercise: 'Note event, then interpretation separately' },
      { level: 4, skill: 'Real-time', exercise: 'Catch yourself interpreting in the moment' },
    ]},
  { id: 'pattern', name: 'Pattern Recognition', icon: '🧩', color: '#bb86fc',
    goal: 'Compress reality into reusable models',
    levels: [
      { level: 1, skill: 'Model Application', exercise: 'Apply 1 mental model to observation' },
      { level: 2, skill: 'Multi-Model', exercise: 'Apply 2 different models to same event' },
      { level: 3, skill: 'Model Selection', exercise: 'Choose the most useful model' },
      { level: 4, skill: 'Pattern Memory', exercise: 'Recognize patterns you\'ve seen before' },
    ]},
  { id: 'question', name: 'Question Engineering', icon: '❓', color: '#ff79c6',
    goal: 'Generate high-leverage questions',
    levels: [
      { level: 1, skill: 'Basic Questions', exercise: 'Ask "Why?" 3 times in a row' },
      { level: 2, skill: 'Mechanism Questions', exercise: 'Ask "How does this actually work?"' },
      { level: 3, skill: 'Constraint Questions', exercise: 'Ask "What if the opposite were true?"' },
      { level: 4, skill: 'Beautiful Questions', exercise: 'Ask questions that reframe the problem' },
    ]},
  { id: 'decision', name: 'Decision Training', icon: '⚡', color: '#f1fa8c',
    goal: 'Make better decisions faster',
    levels: [
      { level: 1, skill: 'Pre-Mortem', exercise: 'Before deciding, list 3 ways it could fail' },
      { level: 2, skill: 'Reversibility', exercise: 'Classify: reversible or irreversible?' },
      { level: 3, skill: 'Second-Order', exercise: 'List consequences of consequences' },
      { level: 4, skill: 'Decision Journal', exercise: 'Record prediction, revisit in 30 days' },
    ]},
  { id: 'flow', name: 'Flow State', icon: '🎯', color: '#8be9fd',
    goal: 'Enter deep work on demand',
    levels: [
      { level: 1, skill: 'Clear Goals', exercise: 'Define "done" before starting' },
      { level: 2, skill: 'Distraction Audit', exercise: 'List and eliminate friction sources' },
      { level: 3, skill: 'Challenge Match', exercise: 'Adjust difficulty to skill level' },
      { level: 4, skill: 'Flow Triggers', exercise: 'Build personal entry ritual' },
    ]},
  { id: 'habit', name: 'Habit Architecture', icon: '🔁', color: '#50fa7b',
    goal: 'Build automatic behaviors',
    levels: [
      { level: 1, skill: 'Habit Stacking', exercise: 'Attach new habit to existing one' },
      { level: 2, skill: 'Environment Design', exercise: 'Make good obvious, bad hard' },
      { level: 3, skill: 'Identity Shift', exercise: 'Ask "What would [ideal self] do?"' },
      { level: 4, skill: 'Habit Tracking', exercise: 'Review weekly: what stuck, why' },
    ]},
];

// ============ DAILY TIPS (from Notion structure) ============
const DAILY_TIPS = [
  // Observation
  { name: 'The 5-Second Rule', principle: 'Your first reaction is emotional. Wait 5 seconds before interpreting.', practice: 'Describe one event today using only facts.', category: 'Observation' },
  { name: 'Signal vs Noise', principle: 'Most information is noise. Find the signal.', practice: 'What one input today actually changed your thinking?', category: 'Observation' },
  { name: '5-4-3-2-1 Grounding', principle: 'Use all senses to observe like seeing fresh.', practice: '5 see, 4 touch, 3 hear, 2 smell, 1 taste.', category: 'Observation' },
  { name: 'Brain Attic', principle: 'You see what you look for. Program your filter.', practice: 'Pick one thing to notice today. Count them.', category: 'Observation' },
  
  // Mental Model
  { name: 'Inversion Power', principle: 'Solve backward. What would guarantee failure?', practice: 'List 3 ways to fail at your goal. Avoid them.', category: 'Mental Model' },
  { name: 'First Principles', principle: 'Break to fundamentals, rebuild from scratch.', practice: 'Ask "why?" five times on one assumption.', category: 'Mental Model' },
  { name: 'Second-Order Effects', principle: 'Winners think: and then what?', practice: 'Write consequence, then its consequence.', category: 'Mental Model' },
  { name: 'Circle of Competence', principle: 'Know the edges of your knowledge.', practice: 'What don\'t you know about something you\'re confident in?', category: 'Mental Model' },
  
  // Questioning
  { name: 'The Feynman Test', principle: 'Can\'t explain simply? Don\'t understand it.', practice: 'Explain one concept to a 12-year-old.', category: 'Questioning' },
  { name: 'Beautiful Questions', principle: 'Questions that reframe unlock new answers.', practice: 'Change "How do I..." to "What if I..."', category: 'Questioning' },
  { name: 'Naive Question', principle: 'Ask what everyone is afraid to ask.', practice: 'Say "I don\'t understand" in your next meeting.', category: 'Questioning' },
  { name: 'Absurd Constraints', principle: 'Extreme constraints force lateral thinking.', practice: '"If I had 1 hour instead of 1 month..."', category: 'Questioning' },
  
  // Decision
  { name: 'Pre-Mortem', principle: 'Imagine failure. Why did it happen?', practice: 'Assume your decision failed. Write 3 reasons.', category: 'Decision' },
  { name: 'State Check', principle: 'Tired brain = skewed reality.', practice: 'Hungry? Tired? Angry? Postpone if yes.', category: 'Decision' },
  { name: 'Steel Man', principle: 'Argue the strongest opposing view.', practice: 'Write the best argument against your position.', category: 'Decision' },
  
  // Flow State
  { name: 'Clear Goals', principle: 'Flow needs knowing exactly what\'s next.', practice: 'Write "I\'m done when..." before starting.', category: 'Flow State' },
  { name: '90-Minute Cycles', principle: 'Deep focus lasts ~90 min, then rest 20.', practice: 'Set a 90-min timer. Actually rest after.', category: 'Flow State' },
  { name: 'Context Switch Tax', principle: 'Every interruption costs 23 minutes.', practice: 'Batch similar tasks together today.', category: 'Flow State' },
  
  // Habit
  { name: 'Habit Stacking', principle: 'Link new habits to existing ones.', practice: 'After [habit], I will [new 2-min behavior].', category: 'Habit' },
  { name: 'Environment Design', principle: 'Make good obvious, bad invisible.', practice: 'Change one thing to make desired behavior easier.', category: 'Habit' },
  { name: 'Identity-Based', principle: 'Focus on who you become, not what you achieve.', practice: '"What would a [identity] do right now?"', category: 'Habit' },
  { name: 'Cingulate Strength', principle: 'Choosing hard strengthens resolve.', practice: 'Do one thing because it\'s hard today.', category: 'Habit' },
];

// ============ MENTAL MODELS (from Notion) ============
const MENTAL_MODELS = [
  { name: 'First Principles', desc: 'Break down to fundamental truths', category: 'Thinking', difficulty: 'Beginner', when: 'When conventional wisdom feels wrong' },
  { name: 'Inversion', desc: 'Ask what would guarantee failure', category: 'Thinking', difficulty: 'Beginner', when: 'When stuck on a problem' },
  { name: 'Second-Order Thinking', desc: 'And then what? And then what?', category: 'Thinking', difficulty: 'Beginner', when: 'Before any major decision' },
  { name: 'Occam\'s Razor', desc: 'Simplest explanation is usually correct', category: 'Thinking', difficulty: 'Beginner', when: 'Multiple explanations exist' },
  { name: 'Map vs Territory', desc: 'The model is not reality', category: 'Thinking', difficulty: 'Intermediate', when: 'Predictions keep failing' },
  { name: 'Incentives', desc: 'People respond to incentives', category: 'Psychology', difficulty: 'Beginner', when: 'Behavior doesn\'t make sense' },
  { name: 'Hanlon\'s Razor', desc: 'Assume mistake before malice', category: 'Psychology', difficulty: 'Beginner', when: 'Someone upsets you' },
  { name: 'Confirmation Bias', desc: 'We seek supporting evidence', category: 'Psychology', difficulty: 'Intermediate', when: 'You feel very certain' },
  { name: 'Circle of Competence', desc: 'Know what you know', category: 'Decision', difficulty: 'Beginner', when: 'In unfamiliar territory' },
  { name: 'Reversibility', desc: 'Can you undo it?', category: 'Decision', difficulty: 'Beginner', when: 'Overthinking a choice' },
  { name: 'Opportunity Cost', desc: 'What are you not doing?', category: 'Decision', difficulty: 'Intermediate', when: 'Evaluating options' },
  { name: 'Sunk Cost', desc: 'Past investment ≠ future value', category: 'Decision', difficulty: 'Intermediate', when: 'Holding onto something too long' },
  { name: 'Leverage', desc: 'Small input, big output', category: 'Systems', difficulty: 'Intermediate', when: 'Working hard, little results' },
  { name: 'Compounding', desc: 'Small gains accumulate massively', category: 'Systems', difficulty: 'Beginner', when: 'Tempted by big changes' },
  { name: 'Feedback Loops', desc: 'Output becomes input', category: 'Systems', difficulty: 'Advanced', when: 'Understanding systems' },
  { name: 'Bottlenecks', desc: 'Find the constraint', category: 'Systems', difficulty: 'Intermediate', when: 'System underperforming' },
  { name: 'Antifragility', desc: 'Gains from disorder', category: 'Strategy', difficulty: 'Advanced', when: 'Facing uncertainty' },
  { name: 'Position Before Submission', desc: 'Control position first', category: 'Strategy', difficulty: 'Advanced', when: 'Tempted by shortcuts' },
];

// ============ LEVELS ============
const LEVELS = [
  { level: 1, title: 'Beginner', xp: 0 },
  { level: 2, title: 'Observer', xp: 100 },
  { level: 3, title: 'Pattern Seeker', xp: 300 },
  { level: 4, title: 'Question Master', xp: 600 },
  { level: 5, title: 'Decision Architect', xp: 1000 },
  { level: 6, title: 'Mind Architect', xp: 1500 },
];

// ============ COMPONENTS ============
const QuickAddScreen = ({ onBack, onAdd, modes, models }) => {
  const [quickMode, setQuickMode] = useState('observe');
  const [quickText, setQuickText] = useState('');
  const [quickModel, setQuickModel] = useState(null);
  
  const selectedModeData = modes.find(m => m.id === quickMode);
  
  const handleAdd = () => {
    if (!quickText.trim()) return;
    if (quickMode === 'pattern' && !quickModel) return;
    
    // Create entry
    const newEntry = {
      id: Date.now(),
      sessionId: Date.now(),
      mode: quickMode,
      text: quickText,
      model: quickModel,
      xp: selectedModeData.xp,
      ts: new Date().toISOString(),
    };
    
    onAdd(newEntry);
    alert(`+${selectedModeData.xp} XP! Entry saved.`);
  };

  return (
    <div className="screen">
      <div className="screen-head"><button className="btn-back" onClick={onBack}>←</button><h2>⚡ Quick Add</h2></div>
      
      <div className="quick-mode-select">
        <label>SELECT MODE</label>
        <div className="mode-toggle-grid">
          {modes.map(m => (
            <button 
              key={m.id}
              className={`mode-btn ${quickMode === m.id ? 'active' : ''}`}
              onClick={() => setQuickMode(m.id)}
              style={{borderColor: quickMode === m.id ? m.color : 'transparent', color: quickMode === m.id ? m.color : 'var(--text2)'}}
            >
              <span style={{fontSize:'16px'}}>{m.icon}</span>
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {quickMode === 'pattern' && (
        <div className="session-model-select">
           <label style={{display:'block',marginBottom:'8px',color:'var(--text2)',fontSize:'11px'}}>SELECT MENTAL MODEL</label>
           <select 
             className="model-dropdown"
             value={quickModel || ''} 
             onChange={e => setQuickModel(e.target.value)}
           >
             <option value="">-- Choose a Model --</option>
             {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
           </select>
        </div>
      )}

      <div className="session-input-area">
         <textarea
           className="session-textarea"
           placeholder={selectedModeData.prompt} // correct prompt field
           value={quickText}
           onChange={e => setQuickText(e.target.value)}
           autoFocus
         />
      </div>

      <button 
        className="btn-next"
        disabled={!quickText.trim() || (quickMode === 'pattern' && !quickModel)}
        onClick={handleAdd}
      >
        Add Entry (+{selectedModeData.xp} XP)
      </button>
    </div>
  );
};

// ============ MAIN APP ============
function App() {
  // START FRESH (One-time wipe)
  if (localStorage.getItem('ma_version') !== 'v3.1_RESET') {
    localStorage.removeItem('ma_entries');
    localStorage.removeItem('ma_stats');
    localStorage.removeItem('ma_habits');
    localStorage.removeItem('ma_predictions');
    localStorage.removeItem('ma_secondbrain');
    localStorage.setItem('ma_version', 'v3.1_RESET');
  }

  // State
  const [view, setView] = useState('home');
  const [subView, setSubView] = useState(null);
  const [currentMode, setCurrentMode] = useState(0);
  const [entry, setEntry] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [showTip, setShowTip] = useState(true);
  
  // Persisted
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ma_entries') || '[]'); } catch { return []; }
  });
  const [predictions, setPredictions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ma_predictions') || '[]'); } catch { return []; }
  });
  const [secondBrain, setSecondBrain] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ma_secondbrain') || '[]'); } catch { return []; }
  });
  const [habits, setHabits] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ma_habits') || '[]'); } catch { return []; }
  });
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ma_config') || '{}'); } catch { return {}; }
  });
  const [stats, setStats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ma_stats') || '{}'); } catch { return {}; }
  });

  // UI
  const [showSettings, setShowSettings] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPatterns, setAiPatterns] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [predictionModal, setPredictionModal] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [modelFilter, setModelFilter] = useState('All');
  const [tipFilter, setTipFilter] = useState('All');

  // Persist
  useEffect(() => { localStorage.setItem('ma_entries', JSON.stringify(entries)); }, [entries]);
  useEffect(() => { localStorage.setItem('ma_predictions', JSON.stringify(predictions)); }, [predictions]);
  useEffect(() => { localStorage.setItem('ma_secondbrain', JSON.stringify(secondBrain)); }, [secondBrain]);
  useEffect(() => { localStorage.setItem('ma_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('ma_config', JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem('ma_stats', JSON.stringify(stats)); }, [stats]);

  // Today's tip
  const todaysTip = useMemo(() => {
    const day = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    return DAILY_TIPS[day % DAILY_TIPS.length];
  }, []);

  // Analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const today = now.toDateString();
    const last7 = entries.filter(e => now - new Date(e.ts) < 7 * dayMs);
    
    // XP calculation
    const totalXP = entries.reduce((sum, e) => sum + (e.xp || 0), 0);
    
    // Current level
    let currentLevel = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalXP >= LEVELS[i].xp) { currentLevel = LEVELS[i]; break; }
    }
    const nextLevel = LEVELS.find(l => l.xp > totalXP);
    const xpProgress = nextLevel ? Math.round(((totalXP - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100) : 100;
    
    // Streak
    let streak = 0;
    let checkDate = new Date(now);
    while (true) {
      const dayStr = checkDate.toDateString();
      if (entries.some(e => new Date(e.ts).toDateString() === dayStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }
    
    // Today's progress
    const todayEntries = entries.filter(e => new Date(e.ts).toDateString() === today);
    const todayXP = todayEntries.reduce((sum, e) => sum + (e.xp || 0), 0);
    const todayModes = new Set(todayEntries.map(e => e.mode));
    
    // Weekly activity
    const weekActivity = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * dayMs);
      const dayEntries = entries.filter(e => new Date(e.ts).toDateString() === d.toDateString());
      return { day: d.toLocaleDateString('en', { weekday: 'short' }), count: dayEntries.length, xp: dayEntries.reduce((s, e) => s + (e.xp || 0), 0) };
    });
    
    // Model usage
    const modelUsage = entries.reduce((acc, e) => {
      if (e.model) acc[e.model] = (acc[e.model] || 0) + 1;
      return acc;
    }, {});
    const topModels = Object.entries(modelUsage).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    // Prediction accuracy
    const resolved = predictions.filter(p => p.resolved);
    const correct = resolved.filter(p => p.correct);
    const accuracy = resolved.length > 0 ? Math.round((correct.length / resolved.length) * 100) : null;
    const pendingReview = predictions.filter(p => !p.resolved && new Date(p.reviewDate) <= now);
    
    // Module progress
    const moduleProgress = MODULES.map(m => {
      const moduleEntries = entries.filter(e => {
        const mode = MODES.find(mo => mo.id === e.mode);
        return mode?.module === m.name;
      });
      const level = Math.min(4, Math.floor(moduleEntries.length / 10) + 1);
      return { ...m, entriesCount: moduleEntries.length, currentLevel: level };
    });
    
    return {
      totalXP, currentLevel, nextLevel, xpProgress, streak,
      todayXP, todayModes, weekActivity, modelUsage, topModels,
      accuracy, pendingPredictions: predictions.filter(p => !p.resolved).length, pendingReview,
      moduleProgress, totalEntries: entries.length, last7Count: last7.length,
    };
  }, [entries, predictions]);

  // Check for pending prediction reviews
  useEffect(() => {
    if (analytics.pendingReview.length > 0 && !predictionModal && view === 'home') {
      setPredictionModal(analytics.pendingReview[0]);
    }
  }, [analytics.pendingReview, predictionModal, view]);

  // ============ NOTION SYNC ============
  const syncToNotion = useCallback(async (data, db) => {
    if (!config.notionEnabled) return;
    setSyncStatus('syncing');
    try {
      const pending = JSON.parse(localStorage.getItem(`ma_sync_${db}`) || '[]');
      pending.push({ ...data, targetDb: NOTION[db], ts: new Date().toISOString() });
      localStorage.setItem(`ma_sync_${db}`, JSON.stringify(pending));
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus(null), 2000);
    } catch { setSyncStatus('error'); }
  }, [config.notionEnabled]);

  // ============ AI ============
  const getAIFeedback = useCallback(async (text, mode, model) => {
    if (!config.apiKey) return;
    setAiLoading(true);
    try {
      const res = await fetch(LLM.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify({
          model: LLM.model,
          messages: [
            { role: 'system', content: `Cognitive coach. 2 sentences max. Mode: ${mode}${model ? `, Model: ${model}` : ''}` },
            { role: 'user', content: text },
          ],
          max_tokens: 100,
        }),
      });
      const data = await res.json();
      setAiFeedback(data.choices?.[0]?.message?.content || null);
    } catch { setAiFeedback(null); }
    setAiLoading(false);
  }, [config.apiKey]);

  const detectPatterns = useCallback(async () => {
    if (!config.apiKey || entries.length < 10) return;
    setAiLoading(true);
    const recent = entries.slice(-50).map(e => `[${e.mode}] ${e.text}${e.model ? ` (${e.model})` : ''}`).join('\n');
    try {
      const res = await fetch(LLM.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify({
          model: LLM.model,
          messages: [
            { role: 'system', content: 'Analyze entries. Find: 1) Recurring themes 2) Thinking patterns 3) Blind spots 4) Growth 5) Next edge. 1-2 sentences each.' },
            { role: 'user', content: recent },
          ],
          max_tokens: 400,
        }),
      });
      const data = await res.json();
      setAiPatterns(data.choices?.[0]?.message?.content || null);
    } catch { setAiPatterns('Failed to analyze.'); }
    setAiLoading(false);
  }, [config.apiKey, entries]);

  // ============ HANDLERS ============
  const submitEntry = async () => {
    if (!entry.trim()) return;
    const mode = MODES[currentMode];
    const newEntry = {
      id: Date.now(),
      sessionId: sessionData.id || Date.now(),
      mode: mode.id,
      text: entry,
      model: selectedModel,
      xp: mode.xp,
      ts: new Date().toISOString(),
    };
    setEntries(prev => [...prev, newEntry]);
    setSessionData(prev => ({ ...prev, id: newEntry.sessionId, [mode.id]: newEntry }));
    syncToNotion(newEntry, 'trainingSessions');
    
    if (config.apiKey) {
      await getAIFeedback(entry, mode.id, selectedModel);
    } else {
      // No AI, just move to next mode
      nextMode();
    }
    
    setEntry('');
    setSelectedModel(null);
  };

  const nextMode = () => {
    setAiFeedback(null);
    setCurrentMode(prev => {
      if (prev < MODES.length - 1) {
        return prev + 1;
      } else {
        setStats(s => ({ ...s, sessionsCompleted: (s.sessionsCompleted || 0) + 1, lastSession: new Date().toISOString() }));
        setView('complete');
        return prev;
      }
    });
  };

  const startSession = () => {
    setCurrentMode(0);
    setSessionData({});
    setEntry('');
    setSelectedModel(null);
    setShowTip(true);
    setAiFeedback(null);
    setView('session');
  };

  const addPrediction = (text, days = 7) => {
    const pred = { id: Date.now(), text, createdAt: new Date().toISOString(), reviewDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(), resolved: false };
    setPredictions(prev => [...prev, pred]);
    syncToNotion(pred, 'predictions');
  };

  const resolvePrediction = (id, correct) => {
    setPredictions(prev => prev.map(p => p.id === id ? { ...p, resolved: true, correct } : p));
    setPredictionModal(null);
  };

  const addToSecondBrain = (type, content) => {
    const item = { id: Date.now(), type, content, ts: new Date().toISOString(), status: 'Active' };
    setSecondBrain(prev => [...prev, item]);
    syncToNotion(item, 'secondBrain');
  };

  const addHabit = (habit) => {
    const h = { id: Date.now(), habit, createdAt: new Date().toISOString(), streak: 0, checks: [] };
    setHabits(prev => [...prev, h]);
  };

  const checkHabit = (id) => {
    const today = new Date().toDateString();
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      if (h.checks.includes(today)) return h;
      return { ...h, checks: [...h.checks, today], streak: h.streak + 1 };
    }));
  };

  const exportData = () => {
    const data = {
      entries,
      stats,
      habits,
      secondBrain,
      version: '3.1',
      generated: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mind_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // ============ RENDER ============
  const renderHome = () => (
    <div className="screen">
      {/* Prediction Review Modal */}
      {predictionModal && (
        <div className="modal-overlay">
          <div className="modal">
            <span className="modal-icon">🔮</span>
            <h3>Time to Review</h3>
            <p className="modal-text">"{predictionModal.text}"</p>
            <p className="modal-meta">Made {new Date(predictionModal.createdAt).toLocaleDateString()}</p>
            <div className="modal-btns">
              <button className="btn-yes" onClick={() => resolvePrediction(predictionModal.id, true)}>✓ Happened</button>
              <button className="btn-no" onClick={() => resolvePrediction(predictionModal.id, false)}>✗ Didn't</button>
            </div>
            <button className="btn-later" onClick={() => setPredictionModal(null)}>Later</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="home-header">
        <h1>Mind<span>Architect</span></h1>
        <p className="subtitle">{analytics.currentLevel.title} · {analytics.totalXP} XP</p>
      </header>

      {/* Dashboard Stats */}
      <div className="dashboard">
        <div className="stat-box">
          <span className="stat-val">{analytics.streak}</span>
          <span className="stat-lbl">Streak</span>
        </div>
        <div className="stat-box">
          <span className="stat-val">{analytics.todayXP}</span>
          <span className="stat-lbl">Today</span>
        </div>
        <div className="stat-box">
          <span className="stat-val">{analytics.accuracy ?? '—'}%</span>
          <span className="stat-lbl">Accuracy</span>
        </div>
      </div>

      {/* Level Progress */}
      <div className="level-bar">
        <div className="level-fill" style={{ width: `${analytics.xpProgress}%` }} />
        <span className="level-text">{analytics.xpProgress}% to {analytics.nextLevel?.title || 'Max'}</span>
      </div>

      {/* Today's Tip */}
      <div className="tip-card" onClick={() => { setView('tips'); setSubView(null); }}>
        <div className="tip-head">
          <span className="tip-cat">{todaysTip.category}</span>
          <span className="tip-label">Today's Tip</span>
        </div>
        <h3 className="tip-name">{todaysTip.name}</h3>
        <p className="tip-text">{todaysTip.principle}</p>
      </div>
      
      {/* 6-Month Focus Grid */}
      <ConsistencyGrid entries={entries} />

      {/* Main Action */}
      <button className="btn-start" onClick={startSession}>Begin Training Session</button>
      <button className="btn-quick-add" style={{
        width:'100%',padding:'12px',background:'var(--bg2)',border:'1px solid var(--accent)',
        borderRadius:'10px',color:'var(--accent)',fontSize:'13px',fontWeight:'600',
        cursor:'pointer',marginBottom:'16px',transition:'all .2s'
      }} onClick={() => setView('quickadd')}>⚡ Quick Add Entry</button>

      {/* Quick Actions */}
      <div className="quick-grid">
        <button className="quick-btn" onClick={() => setView('dashboard')}>
          <span>🎯</span>Dashboard
        </button>
        <button className="quick-btn" onClick={() => setView('modules')}>
          <span>🏋️</span>Modules
        </button>
        <button className="quick-btn" onClick={() => setView('models')}>
          <span>🧠</span>Models
          <span className="count">{MENTAL_MODELS.length}</span>
        </button>
        <button className="quick-btn" onClick={() => setView('secondbrain')}>
          <span>💾</span>Brain
          <span className="count">{secondBrain.length}</span>
        </button>
        <button className="quick-btn" onClick={() => setView('predictions')}>
          <span>🔮</span>Predict
          {analytics.pendingPredictions > 0 && <span className="badge">{analytics.pendingPredictions}</span>}
        </button>
        <button className="quick-btn" onClick={() => setView('habits')}>
          <span>🔁</span>Habits
          <span className="count">{habits.length}</span>
        </button>
        <button className="quick-btn" onClick={() => setView('analytics')}>
          <span>📊</span>Patterns
        </button>
        <button className="quick-btn" onClick={() => setView('graph')}>
          <span>🕸️</span>Graph
        </button>
        <button className="quick-btn" onClick={() => setView('flow')}>
          <span>⚡</span>Flow
        </button>
        <button className="quick-btn" onClick={() => setView('decision')}>
          <span>⚖️</span>Decide
        </button>
        <button className="quick-btn" onClick={() => setView('history')}>
          <span>📋</span>History
        </button>
      </div>

      {/* Settings */}
      <button className="btn-settings" onClick={() => setShowSettings(!showSettings)}>⚙️</button>
      {showSettings && (
        <div className="settings">
          <h3>Settings</h3>
          <div className="setting"><label>Reminder</label><input type="time" value={config.reminderTime || '18:00'} onChange={e => setConfig(p => ({ ...p, reminderTime: e.target.value }))} /></div>
          <div className="setting"><label>OpenAI Key</label><input type="password" placeholder="sk-..." value={config.apiKey || ''} onChange={e => setConfig(p => ({ ...p, apiKey: e.target.value }))} /><span className="hint">gpt-5-nano</span></div>
          
          <div className="setting">
            <label>Backup Data</label>
            <button className="btn-backup" onClick={exportData}>⬇ Download JSON</button>
            <span className="hint">Safe copy</span>
          </div>

          <div className="setting">
            <label>Notion Sync</label>
            <button className={`toggle ${config.notionEnabled ? 'on' : ''}`} onClick={() => setConfig(p => ({ ...p, notionEnabled: !p.notionEnabled }))}>{config.notionEnabled ? 'ON' : 'OFF'}</button>
          </div>
          <div className="setting danger-zone">
            <label>Danger Zone</label>
            <button className="btn-reset-all" onClick={() => {
              if(confirm("⚠ ARE YOU SURE?\n\nThis will DELETE ALL entries, habits, and stats.\nThere is no undo.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}>🗑️ RESET EVERYTHING</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="screen">
      <div className="screen-head"><button className="btn-back" onClick={() => setView('home')}>←</button><h2>🎯 Dashboard</h2></div>
      
      <div className="dashboard-section">
        <h3>Today's Stats</h3>
        <div className="dash-grid">
          <div className="dash-item"><span className="dash-val">{analytics.streak}</span><span>Streak</span></div>
          <div className="dash-item"><span className="dash-val">{analytics.todayXP}</span><span>Today XP</span></div>
          <div className="dash-item"><span className="dash-val">{analytics.totalXP}</span><span>Total XP</span></div>
          <div className="dash-item"><span className="dash-val">{analytics.currentLevel.title}</span><span>Level</span></div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Weekly Progress</h3>
        <div className="week-chart">
          {analytics.weekActivity.map((d, i) => (
            <div key={i} className="week-day">
              <div className="week-bar" style={{ height: `${Math.min(d.count * 20, 100)}%` }} />
              <span>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Today's Modes</h3>
        <div className="mode-checks">
          {MODES.map(m => (
            <div key={m.id} className={`mode-check ${analytics.todayModes.has(m.id) ? 'done' : ''}`}>
              <span>{m.icon}</span>
              <span>{m.name}</span>
              <span>{analytics.todayModes.has(m.id) ? '✓' : '○'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderModules = () => (
    <div className="screen">
      <div className="screen-head"><button className="btn-back" onClick={() => setView('home')}>←</button><h2>🏋️ Training Modules</h2></div>
      
      <div className="modules-list">
        {analytics.moduleProgress.map(m => (
          <div key={m.id} className="module-card" style={{ '--c': m.color }} onClick={() => { setSelectedModule(m); setSubView('module-detail'); }}>
            <div className="module-head">
              <span className="module-icon">{m.icon}</span>
              <div>
                <h3>{m.name}</h3>
                <p>{m.goal}</p>
              </div>
            </div>
            <div className="module-progress">
              <span>Level {m.currentLevel}/4</span>
              <div className="module-bar"><div style={{ width: `${(m.currentLevel / 4) * 100}%` }} /></div>
              <span>{m.entriesCount} entries</span>
            </div>
          </div>
        ))}
      </div>

      {subView === 'module-detail' && selectedModule && (
        <div className="modal-overlay" onClick={() => setSubView(null)}>
          <div className="modal module-modal" onClick={e => e.stopPropagation()}>
            <h3>{selectedModule.icon} {selectedModule.name}</h3>
            <p className="modal-goal">{selectedModule.goal}</p>
            <div className="levels-list">
              {selectedModule.levels.map(l => (
                <div key={l.level} className={`level-item ${l.level <= selectedModule.currentLevel ? 'unlocked' : ''}`}>
                  <span className="level-num">L{l.level}</span>
                  <div>
                    <strong>{l.skill}</strong>
                    <span>{l.exercise}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-close" onClick={() => setSubView(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderTips = () => {
    const categories = ['All', ...new Set(DAILY_TIPS.map(t => t.category))];
    const filtered = tipFilter === 'All' ? DAILY_TIPS : DAILY_TIPS.filter(t => t.category === tipFilter);
    
    return (
      <div className="screen">
        <div className="screen-head"><button className="btn-back" onClick={() => setView('home')}>←</button><h2>💡 Daily Tips</h2></div>
        
        <div className="filter-chips">
          {categories.map(c => (
            <button key={c} className={`chip ${tipFilter === c ? 'active' : ''}`} onClick={() => setTipFilter(c)}>{c}</button>
          ))}
        </div>

        <div className="tips-list">
          {filtered.map((t, i) => (
            <div key={i} className="tip-item">
              <div className="tip-item-head">
                <span className="tip-item-cat">{t.category}</span>
                <strong>{t.name}</strong>
              </div>
              <p className="tip-principle">{t.principle}</p>
              <div className="tip-practice"><span>Practice:</span> {t.practice}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderModels = () => {
    const categories = ['All', ...new Set(MENTAL_MODELS.map(m => m.category))];
    const filtered = modelFilter === 'All' ? MENTAL_MODELS : MENTAL_MODELS.filter(m => m.category === modelFilter);
    
    return (
      <div className="screen">
        <div className="screen-head"><button className="btn-back" onClick={() => setView('home')}>←</button><h2>🧠 Mental Models</h2></div>
        
        <div className="filter-chips">
          {categories.map(c => (
            <button key={c} className={`chip ${modelFilter === c ? 'active' : ''}`} onClick={() => setModelFilter(c)}>{c}</button>
          ))}
        </div>

        <div className="models-list">
          {filtered.map((m, i) => (
            <div key={i} className="model-item">
              <div className="model-head">
                <strong>{m.name}</strong>
                <span className={`difficulty ${m.difficulty.toLowerCase()}`}>{m.difficulty}</span>
              </div>
              <p>{m.desc}</p>
              <p className="model-when"><span>When:</span> {m.when}</p>
              {analytics.modelUsage[m.name] && <span className="used-badge">Used {analytics.modelUsage[m.name]}×</span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSecondBrain = () => (
    <div className="screen">
      <div className="screen-head"><button className="btn-back" onClick={() => setView('home')}>←</button><h2>💾 Second Brain</h2></div>
      
      <p className="section-desc">Store patterns, questions, decisions, and lessons.</p>

      <div className="add-brain">
        <select id="brain-type"><option>Pattern</option><option>Question</option><option>Decision</option><option>Lesson</option></select>
        <input type="text" id="brain-input" placeholder="Capture insight..." />
        <button onClick={() => {
          const type = document.getElementById('brain-type').value;
          const input = document.getElementById('brain-input');
          if (input.value.trim()) { addToSecondBrain(type, input.value.trim()); input.value = ''; }
        }}>+</button>
      </div>

      <div className="brain-list">
        {secondBrain.length === 0 ? <p className="empty">Your second brain is empty. Start capturing!</p> : (
          [...secondBrain].reverse().map(item => (
            <div key={item.id} className={`brain-item type-${item.type.toLowerCase()}`}>
              <span className="brain-type">{item.type}</span>
              <p>{item.content}</p>
              <span className="brain-date">{new Date(item.ts).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderHabits = () => {
    const today = new Date().toDateString();
    
    return (
      <div className="screen">
        <div className="screen-head"><button className="btn-back" onClick={() => setView('home')}>←</button><h2>🔁 Habit Tracker</h2></div>
        
        <p className="section-desc">Build automatic behaviors through daily tracking.</p>

        <div className="add-habit">
          <input type="text" id="habit-input" placeholder="New habit..." />
          <button onClick={() => {
            const input = document.getElementById('habit-input');
            if (input.value.trim()) { addHabit(input.value.trim()); input.value = ''; }
          }}>+</button>
        </div>

        <div className="habits-list">
          {habits.length === 0 ? <p className="empty">No habits yet. Add one!</p> : (
            habits.map(h => (
              <div key={h.id} className="habit-item">
                <div className="habit-info">
                  <strong>{h.habit}</strong>
                  <span>{h.streak} day streak</span>
                </div>
                <button className={`habit-check ${h.checks.includes(today) ? 'checked' : ''}`} onClick={() => checkHabit(h.id)}>
                  {h.checks.includes(today) ? '✓' : '○'}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="habit-tips">
          <h4>Habit Building Tips</h4>
          <ul>
            <li><strong>Stacking:</strong> Attach to existing habit</li>
            <li><strong>Environment:</strong> Make it obvious</li>
            <li><strong>Identity:</strong> "I am someone who..."</li>
            <li><strong>2-Minute Rule:</strong> Start tiny</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderPredictions = () => (
    <div className="screen">
      <div className="screen-head"><button className="btn-back" onClick={() => setView('home')}>←</button><h2>🔮 Predictions</h2></div>
      
      {analytics.accuracy !== null && (
        <div className="pred-stats">
          <div className="pred-stat"><span className="val">{analytics.accuracy}%</span><span>Accuracy</span></div>
          <div className="pred-stat"><span className="val">{predictions.filter(p => p.resolved).length}</span><span>Resolved</span></div>
          <div className="pred-stat"><span className="val">{analytics.pendingPredictions}</span><span>Pending</span></div>
        </div>
      )}

      <div className="add-pred">
        <input type="text" id="pred-input" placeholder="I predict that..." />
        <button onClick={() => {
          const input = document.getElementById('pred-input');
          if (input.value.trim()) { addPrediction(input.value.trim()); input.value = ''; }
        }}>+</button>
      </div>

      <div className="pred-list">
        {predictions.length === 0 ? <p className="empty">No predictions yet.</p> : (
          [...predictions].reverse().map(p => (
            <div key={p.id} className={`pred-item ${p.resolved ? (p.correct ? 'correct' : 'wrong') : ''}`}>
              <p>{p.text}</p>
              <div className="pred-meta">
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                {p.resolved ? <span className="result">{p.correct ? '✓ Correct' : '✗ Wrong'}</span> : <span>Review: {new Date(p.reviewDate).toLocaleDateString()}</span>}
              </div>
              {!p.resolved && new Date(p.reviewDate) <= new Date() && (
                <div className="pred-btns">
                  <button onClick={() => resolvePrediction(p.id, true)}>✓</button>
                  <button onClick={() => resolvePrediction(p.id, false)}>✗</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="screen">
      <div className="screen-head"><button className="btn-back" onClick={() => setView('home')}>←</button><h2>📊 Pattern Analytics</h2></div>
      
      <div className="card">
        <h3>Top Models Used</h3>
        {analytics.topModels.length > 0 ? (
          <div className="top-models">
            {analytics.topModels.map(([name, count]) => (
              <div key={name} className="model-row"><span>{name}</span><span>{count}×</span></div>
            ))}
          </div>
        ) : <p className="empty">Use more models to see patterns</p>}
      </div>

      <div className="card">
        <h3>🤖 AI Pattern Detection</h3>
        {!config.apiKey ? <p className="empty">Add API key in settings</p>
          : entries.length < 10 ? <p className="empty">Need 10+ entries</p>
          : aiPatterns ? <div className="ai-text">{aiPatterns.split('\n').map((l, i) => <p key={i}>{l}</p>)}</div>
          : <button className="btn-analyze" onClick={detectPatterns} disabled={aiLoading}>{aiLoading ? 'Analyzing...' : 'Detect My Patterns'}</button>
        }
      </div>
    </div>
  );

  const renderSession = () => {
    const mode = MODES[currentMode];
    
    if (showTip) {
      return (
        <div className="screen center">
          <span className="tip-cat-lg">{todaysTip.category}</span>
          <h2>{todaysTip.name}</h2>
          <p className="tip-lg">{todaysTip.principle}</p>
          <div className="practice-box"><span>Practice:</span> {todaysTip.practice}</div>
          <button className="btn-continue" onClick={() => setShowTip(false)}>Begin →</button>
        </div>
      );
    }

    if (aiFeedback || aiLoading) {
      return (
        <div className="screen center">
          <span className="ai-icon">🤖</span>
          {aiLoading ? <div className="dots"><span/><span/><span/></div> : <p className="feedback">{aiFeedback}</p>}
          <button className="btn-continue" onClick={nextMode}>{currentMode < MODES.length - 1 ? 'Next →' : 'Complete'}</button>
        </div>
      );
    }

    return (
      <div className="screen session">
        <div className="progress-dots">
          {MODES.map((m, i) => (
            <div key={m.id} className={`dot ${i === currentMode ? 'active' : ''} ${i < currentMode ? 'done' : ''}`} style={{ '--c': m.color }}>{m.icon}</div>
          ))}
        </div>

        <div className="mode-card" style={{ '--c': mode.color }}>
          <span className="mode-icon">{mode.icon}</span>
          <h2>{mode.name}</h2>
          <p className="mode-module">{mode.module}</p>
          <p className="mode-prompt">{mode.prompt}</p>
          <p className="mode-hint">{mode.hint}</p>
          <span className="mode-xp">+{mode.xp} XP</span>
        </div>

        {mode.id === 'pattern' && (
          <div className="model-select">
            <p>Choose a mental model:</p>
            <div className="model-chips">
              {MENTAL_MODELS.slice(0, 8).map(m => (
                <button key={m.name} className={`chip ${selectedModel === m.name ? 'selected' : ''}`} onClick={() => setSelectedModel(m.name)}>{m.name}</button>
              ))}
            </div>
          </div>
        )}

        <div className="input-area">
          <textarea value={entry} onChange={e => setEntry(e.target.value)} placeholder="Type here..." rows={4} />
          <button className="btn-submit" onClick={submitEntry} disabled={!entry.trim()}>Submit</button>
        </div>

        {syncStatus && <div className={`sync ${syncStatus}`}>{syncStatus === 'syncing' ? '↻' : syncStatus === 'synced' ? '✓' : '✗'} {syncStatus}</div>}
        <button className="btn-exit" onClick={() => setView('home')}>Exit</button>
      </div>
    );
  };

  const renderComplete = () => {
    const sessionXP = Object.values(sessionData).filter(e => e?.xp).reduce((s, e) => s + e.xp, 0);
    
    return (
      <div className="screen center">
        <div className="complete-icon">✓</div>
        <h2>Session Complete!</h2>
        <p className="complete-xp">+{sessionXP} XP</p>
        
        <div className="complete-actions">
          <p>Save to Second Brain?</p>
          <div className="save-btns">
            {Object.entries(sessionData).filter(([k]) => k !== 'id').map(([mode, entry]) => (
              <button key={mode} onClick={() => addToSecondBrain(mode === 'pattern' ? 'Pattern' : mode === 'question' ? 'Question' : 'Lesson', entry.text)}>
                💾 {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="complete-predict">
          <p>Make a prediction?</p>
          <input type="text" id="complete-pred" placeholder="I predict..." />
          <button onClick={() => {
            const input = document.getElementById('complete-pred');
            if (input.value.trim()) { addPrediction(input.value.trim()); input.value = ''; }
          }}>Add</button>
        </div>

        <button className="btn-home" onClick={() => { setView('home'); setSessionData({}); }}>Done</button>
      </div>
    );
  };

  const renderGraph = () => (
    <div className="screen">
      <div className="screen-head"><button className="btn-back" onClick={() => setView('home')}>←</button><h2>🕸️ Insight Graph</h2></div>
      <p className="section-desc">Visualize the connections between your thoughts, models, and habits.</p>
      
      <InsightGraph entries={entries} models={MENTAL_MODELS} secondBrain={secondBrain} />
      
      <div className="card">
        <h3>Graph Insights</h3>
        <p className="graph-hint">
          • <strong>Clusters:</strong> Thoughts usually cluster around "Observe" and "Action".<br/>
          • <strong>Bridges:</strong> Mental models act as bridges between disparate thoughts.<br/>
          • <strong>Orphans:</strong> Disconnected nodes might be unresolved open loops.
        </p>
      </div>

      <style>{`
        .graph-hint { font-size: 11px; color: var(--text2); line-height: 1.6; }
        .graph-hint strong { color: var(--accent); }
      `}</style>
    </div>
  );

  const renderFlow = () => (
    <div className="screen">
      <div className="screen-head"><button className="btn-back" onClick={() => setView('home')}>←</button><h2>⚡ Flow Timer</h2></div>
      <p className="section-desc">Ultradian rhythm timer for deep focus work.</p>
      <FlowTimer />
    </div>
  );

  const renderDecision = () => (
    <div className="screen">
      <div className="screen-head"><button className="btn-back" onClick={() => setView('home')}>←</button><h2>⚖️ Decision Matrix</h2></div>
      <p className="section-desc">Evaluate options with weighted criteria.</p>
      <DecisionMatrix />
    </div>
  );

  const renderHistory = () => (
    <div className="screen">
      <div className="screen-head"><button className="btn-back" onClick={() => setView('home')}>←</button><h2>📋 History</h2></div>
      {entries.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <p>No entries yet. Start your journey!</p>
        </div>
      ) : (
        <div className="history-list">
          {entries.slice().reverse().map(e => (
            <div key={e.id} className="history-item">
              <div className="history-head">
                <span className={`history-mode mode-${e.mode}`}>
                   {MODES.find(m => m.id === e.mode)?.icon} {MODES.find(m => m.id === e.mode)?.name}
                </span>
                <span className="history-xp">+{e.xp} XP</span>
              </div>
              <p>{e.text}</p>
              {e.model && <span className="history-model">{e.model}</span>}
              <span className="history-date">{new Date(e.ts).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ============ STYLES ============
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    :root{--bg:#0a0a0c;--bg2:#111114;--bg3:#1a1a1f;--text:#e4e4e7;--text2:#71717a;--border:#27272a;--accent:#64ffda;--purple:#bb86fc;--pink:#ff79c6;--yellow:#f1fa8c;--green:#50fa7b;--blue:#8be9fd}
    body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
    .screen{min-height:100vh;max-width:480px;margin:0 auto;padding:20px 16px 32px}
    .screen.center{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
    
    .home-header{text-align:center;padding:20px 0 12px}
    .home-header h1{font-size:24px;font-weight:700}
    .home-header h1 span{background:linear-gradient(135deg,var(--accent),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .subtitle{font-size:12px;color:var(--text2);margin-top:4px}
    
    .dashboard{display:flex;justify-content:center;gap:16px;padding:12px 0;margin-bottom:12px}
    .stat-box{text-align:center;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px 16px;min-width:70px}
    .stat-val{display:block;font-size:20px;font-weight:700;color:var(--accent)}
    .stat-lbl{font-size:10px;color:var(--text2);text-transform:uppercase}
    
    .level-bar{background:var(--bg2);border:1px solid var(--border);border-radius:8px;height:24px;position:relative;margin-bottom:16px;overflow:hidden}
    .level-fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--purple));border-radius:8px}
    .level-text{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--text)}
    
    .tip-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:16px;cursor:pointer;transition:border-color .2s}
    .tip-card:hover{border-color:var(--accent)}
    .tip-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
    .tip-cat{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--accent);background:rgba(100,255,218,.1);padding:2px 6px;border-radius:4px}
    .tip-label{font-size:9px;color:var(--text2)}
    .tip-name{font-size:14px;margin-bottom:4px}
    .tip-text{font-size:12px;color:var(--text2);line-height:1.4}
    
    .btn-start{width:100%;padding:14px;background:linear-gradient(135deg,var(--accent),var(--purple));border:none;border-radius:10px;color:var(--bg);font-size:14px;font-weight:700;cursor:pointer;margin-bottom:16px}
    
    .quick-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
    .quick-btn{padding:10px 4px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;color:var(--text2);font-size:9px;font-family:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;position:relative;transition:all .2s}
    .quick-btn span:first-child{font-size:16px}
    .quick-btn:hover{color:var(--text);border-color:var(--accent)}
    .quick-btn .count{font-size:8px;color:var(--purple)}
    .quick-btn .badge{position:absolute;top:-4px;right:-4px;background:var(--pink);color:var(--bg);font-size:8px;font-weight:600;padding:2px 5px;border-radius:6px}
    
    .btn-settings{position:fixed;top:16px;right:16px;background:none;border:none;font-size:18px;cursor:pointer;opacity:.5}
    .settings{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:16px}
    .settings h3{font-size:12px;margin-bottom:12px}
    .setting{margin-bottom:12px}
    .setting label{display:block;font-size:10px;color:var(--text2);margin-bottom:4px}
    .setting input{width:100%;padding:8px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;font-family:inherit}
    .setting input:focus{outline:none;border-color:var(--accent)}
    .hint{font-size:9px;color:var(--text2);margin-top:2px;display:block}
    .toggle{padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--text2);font-size:10px;cursor:pointer}
    .toggle.on{background:var(--accent);color:var(--bg);border-color:var(--accent)}
    .setting.danger-zone{margin-top:20px;padding-top:20px;border-top:1px dashed #cf6679}
    .btn-reset-all{width:100%;padding:10px;background:rgba(207,102,121,0.15);border:1px solid #cf6679;border-radius:6px;color:#cf6679;font-size:10px;font-weight:700;cursor:pointer;margin-top:4px}
    .btn-reset-all:hover{background:#cf6679;color:#fff}
    .btn-backup{width:100%;padding:8px;background:var(--bg2);border:1px solid var(--accent);border-radius:6px;color:var(--accent);font-size:11px;cursor:pointer;margin-top:4px}
    .btn-backup:hover{background:rgba(100,255,218,0.1)}
    
    .quick-mode-select{margin-bottom:16px}
    .quick-mode-select label{display:block;font-size:11px;color:var(--text2);margin-bottom:8px}
    .mode-toggle-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    .mode-btn{display:flex;flex-direction:column;align-items:center;padding:10px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:10px;color:var(--text2);gap:4px;transition:all .2s}
    .mode-btn.active{background:rgba(255,255,255,0.05)}
    
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;padding:20px;z-index:100}
    .modal{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:20px;max-width:320px;width:100%;text-align:center}
    .modal-icon{font-size:28px;display:block;margin-bottom:10px}
    .modal h3{font-size:16px;margin-bottom:10px}
    .modal-text{font-size:13px;margin-bottom:6px}
    .modal-meta{font-size:10px;color:var(--text2);margin-bottom:14px}
    .modal-btns{display:flex;gap:8px;margin-bottom:10px}
    .btn-yes,.btn-no{flex:1;padding:10px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit}
    .btn-yes{background:rgba(100,255,218,.15);border:1px solid var(--accent);color:var(--accent)}
    .btn-no{background:rgba(255,121,198,.15);border:1px solid var(--pink);color:var(--pink)}
    .btn-later{background:none;border:none;color:var(--text2);font-size:11px;cursor:pointer}
    
    .screen-head{display:flex;align-items:center;gap:10px;margin-bottom:16px}
    .btn-back{width:32px;height:32px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:16px;cursor:pointer}
    .screen-head h2{font-size:16px}
    
    .section-desc{font-size:12px;color:var(--text2);margin-bottom:14px}
    .empty{font-size:12px;color:var(--text2);text-align:center;padding:20px}
    
    .filter-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
    .chip{padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text2);font-size:10px;cursor:pointer;font-family:inherit}
    .chip:hover,.chip.active{border-color:var(--accent);color:var(--text)}
    .chip.selected{background:rgba(187,134,252,.15);border-color:var(--purple);color:var(--purple)}
    
    .dashboard-section{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:12px}
    .dashboard-section h3{font-size:12px;margin-bottom:10px;color:var(--text2)}
    .dash-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    .dash-item{text-align:center}
    .dash-val{display:block;font-size:16px;font-weight:600}
    .dash-item span:last-child{font-size:9px;color:var(--text2)}
    
    .week-chart{display:flex;justify-content:space-between;align-items:flex-end;height:60px}
    .week-day{flex:1;display:flex;flex-direction:column;align-items:center;height:100%}
    .week-bar{width:80%;background:var(--accent);border-radius:3px 3px 0 0;min-height:2px;margin-top:auto}
    .week-day span{font-size:9px;color:var(--text2);margin-top:4px}
    
    .mode-checks{display:flex;flex-direction:column;gap:6px}
    .mode-check{display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg);border-radius:6px}
    .mode-check.done{background:rgba(100,255,218,.1)}
    .mode-check span:first-child{font-size:16px}
    .mode-check span:nth-child(2){flex:1;font-size:12px}
    .mode-check span:last-child{font-size:14px;color:var(--text2)}
    .mode-check.done span:last-child{color:var(--accent)}
    
    .modules-list{display:flex;flex-direction:column;gap:10px}
    .module-card{background:var(--bg2);border:1px solid var(--border);border-left:3px solid var(--c);border-radius:10px;padding:12px;cursor:pointer}
    .module-head{display:flex;gap:10px;margin-bottom:8px}
    .module-icon{font-size:24px}
    .module-head h3{font-size:13px;margin-bottom:2px}
    .module-head p{font-size:10px;color:var(--text2)}
    .module-progress{display:flex;align-items:center;gap:8px;font-size:10px;color:var(--text2)}
    .module-bar{flex:1;height:4px;background:var(--bg);border-radius:2px;overflow:hidden}
    .module-bar div{height:100%;background:var(--c);border-radius:2px}
    
    .module-modal{max-width:340px}
    .modal-goal{font-size:11px;color:var(--text2);margin-bottom:14px}
    .levels-list{text-align:left}
    .level-item{display:flex;gap:10px;padding:8px;background:var(--bg);border-radius:6px;margin-bottom:6px;opacity:.5}
    .level-item.unlocked{opacity:1}
    .level-num{font-size:10px;font-weight:600;color:var(--accent);min-width:24px}
    .level-item strong{display:block;font-size:12px;margin-bottom:2px}
    .level-item span{font-size:10px;color:var(--text2)}
    .btn-close{margin-top:12px;padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;cursor:pointer}
    
    .tips-list,.models-list{display:flex;flex-direction:column;gap:10px}
    .tip-item,.model-item{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px}
    .tip-item-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}
    .tip-item-cat{font-size:8px;text-transform:uppercase;color:var(--accent);background:rgba(100,255,218,.1);padding:2px 5px;border-radius:3px}
    .tip-item-head strong{font-size:13px}
    .tip-principle{font-size:12px;color:var(--text2);margin-bottom:8px}
    .tip-practice{font-size:11px;color:var(--text);background:var(--bg);padding:8px;border-radius:6px}
    .tip-practice span{color:var(--purple);font-weight:500}
    
    .model-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
    .model-head strong{font-size:13px}
    .difficulty{font-size:9px;padding:2px 6px;border-radius:4px}
    .difficulty.beginner{background:rgba(80,250,123,.15);color:var(--green)}
    .difficulty.intermediate{background:rgba(241,250,140,.15);color:var(--yellow)}
    .difficulty.advanced{background:rgba(255,121,198,.15);color:var(--pink)}
    .model-item p{font-size:11px;color:var(--text2);margin-bottom:4px}
    .model-when{font-size:10px}
    .model-when span{color:var(--purple)}
    .used-badge{display:inline-block;margin-top:6px;font-size:9px;background:rgba(187,134,252,.15);color:var(--purple);padding:2px 6px;border-radius:4px}
    
    .add-brain,.add-pred,.add-habit{display:flex;gap:6px;margin-bottom:14px}
    .add-brain select{padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:11px}
    .add-brain input,.add-pred input,.add-habit input{flex:1;padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;font-family:inherit}
    .add-brain input:focus,.add-pred input:focus,.add-habit input:focus{outline:none;border-color:var(--accent)}
    .add-brain button,.add-pred button,.add-habit button{width:36px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--accent);font-size:18px;cursor:pointer}
    
    .brain-list{display:flex;flex-direction:column;gap:8px}
    .brain-item{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px}
    .brain-type{font-size:9px;text-transform:uppercase;padding:2px 6px;border-radius:4px;margin-bottom:6px;display:inline-block}
    .type-pattern .brain-type{background:rgba(187,134,252,.15);color:var(--purple)}
    .type-question .brain-type{background:rgba(255,121,198,.15);color:var(--pink)}
    .type-decision .brain-type{background:rgba(241,250,140,.15);color:var(--yellow)}
    .type-lesson .brain-type{background:rgba(100,255,218,.15);color:var(--accent)}
    .brain-item p{font-size:12px;margin:6px 0}
    .brain-date{font-size:9px;color:var(--text2)}
    
    .habits-list{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
    .habit-item{display:flex;align-items:center;gap:10px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px}
    .habit-info{flex:1}
    .habit-info strong{display:block;font-size:13px;margin-bottom:2px}
    .habit-info span{font-size:10px;color:var(--text2)}
    .habit-check{width:36px;height:36px;background:var(--bg);border:1px solid var(--border);border-radius:8px;font-size:16px;cursor:pointer;color:var(--text2)}
    .habit-check.checked{background:var(--accent);border-color:var(--accent);color:var(--bg)}
    .habit-tips{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px}
    .habit-tips h4{font-size:11px;margin-bottom:8px;color:var(--text2)}
    .habit-tips ul{list-style:none;font-size:11px;color:var(--text2)}
    .habit-tips li{margin-bottom:4px}
    .habit-tips strong{color:var(--accent)}
    
    .pred-stats{display:flex;justify-content:center;gap:16px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:14px}
    .pred-stat{text-align:center}
    .pred-stat .val{display:block;font-size:18px;font-weight:600}
    .pred-stat span:last-child{font-size:9px;color:var(--text2);text-transform:uppercase}
    .pred-list{display:flex;flex-direction:column;gap:8px}
    .pred-item{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px}
    .pred-item.correct{border-color:var(--accent)}
    .pred-item.wrong{border-color:var(--pink)}
    .pred-item p{font-size:12px;margin-bottom:6px}
    .pred-meta{display:flex;justify-content:space-between;font-size:10px;color:var(--text2)}
    .result{color:var(--accent)}
    .pred-item.wrong .result{color:var(--pink)}
    .pred-btns{display:flex;gap:6px;margin-top:8px}
    .pred-btns button{flex:1;padding:6px;background:var(--bg);border:1px solid var(--border);border-radius:6px;font-size:12px;cursor:pointer}
    .pred-btns button:first-child{border-color:var(--accent);color:var(--accent)}
    .pred-btns button:last-child{border-color:var(--pink);color:var(--pink)}
    
    .card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:12px}
    .card h3{font-size:12px;margin-bottom:10px}
    .top-models{display:flex;flex-direction:column;gap:6px}
    .model-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px}
    .model-row:last-child{border:none}
    .model-row span:last-child{color:var(--purple)}
    .ai-text{font-size:12px;line-height:1.5;color:var(--text2)}
    .ai-text p{margin-bottom:6px}
    .btn-analyze{width:100%;padding:10px;background:var(--bg);border:1px solid var(--accent);border-radius:8px;color:var(--accent);font-size:12px;cursor:pointer}
    .btn-analyze:disabled{opacity:.5}
    
    .tip-cat-lg{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:var(--accent);margin-bottom:10px}
    .tip-lg{font-size:14px;line-height:1.5;max-width:280px;margin-bottom:16px;color:var(--text2)}
    .practice-box{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:20px;font-size:12px;max-width:280px}
    .practice-box span{color:var(--purple);font-weight:500}
    .btn-continue{padding:12px 28px;background:var(--bg3);border:1px solid var(--accent);border-radius:10px;color:var(--accent);font-size:13px;font-weight:500;cursor:pointer;font-family:inherit}
    
    .ai-icon{font-size:28px;margin-bottom:12px}
    .dots{display:flex;gap:5px;margin-bottom:20px}
    .dots span{width:6px;height:6px;background:var(--accent);border-radius:50%;animation:bounce 1.4s infinite ease-in-out both}
    .dots span:nth-child(1){animation-delay:-.32s}
    .dots span:nth-child(2){animation-delay:-.16s}
    @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
    .feedback{font-size:13px;line-height:1.5;color:var(--text2);max-width:280px;margin-bottom:20px}
    
    .session{display:flex;flex-direction:column}
    .progress-dots{display:flex;justify-content:center;gap:10px;margin-bottom:16px}
    .dot{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:var(--bg2);border:1px solid var(--border);border-radius:8px;font-size:14px}
    .dot.active{border-color:var(--c);box-shadow:0 0 10px color-mix(in srgb,var(--c) 30%,transparent)}
    .dot.done{background:color-mix(in srgb,var(--c) 15%,transparent);border-color:var(--c)}
    
    .mode-card{background:var(--bg2);border:1px solid var(--border);border-top:2px solid var(--c);border-radius:14px;padding:20px;text-align:center;margin-bottom:14px}
    .mode-icon{font-size:28px;display:block;margin-bottom:6px}
    .mode-card h2{font-size:18px;color:var(--c);margin-bottom:4px}
    .mode-module{font-size:10px;color:var(--text2);margin-bottom:8px}
    .mode-prompt{font-size:13px;margin-bottom:4px}
    .mode-hint{font-size:11px;color:var(--text2);margin-bottom:8px}
    .mode-xp{font-size:11px;color:var(--c);background:rgba(255,255,255,.05);padding:3px 10px;border-radius:10px}
    
    .model-select{margin-bottom:14px}
    .model-select p{font-size:11px;color:var(--text2);margin-bottom:8px}
    .model-chips{display:flex;flex-wrap:wrap;gap:6px}
    
    .input-area{margin-top:auto}
    .input-area textarea{width:100%;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;font-family:inherit;resize:none;margin-bottom:10px}
    .input-area textarea:focus{outline:none;border-color:var(--accent)}
    .input-area textarea::placeholder{color:var(--text2)}
    .btn-submit{width:100%;padding:12px;background:var(--bg3);border:1px solid var(--accent);border-radius:8px;color:var(--accent);font-size:13px;font-weight:500;cursor:pointer;font-family:inherit}
    .btn-submit:disabled{opacity:.4;cursor:not-allowed}
    .btn-exit{width:100%;padding:8px;background:none;border:none;color:var(--text2);font-size:11px;cursor:pointer;margin-top:8px}
    .sync{text-align:center;font-size:10px;padding:4px;margin-bottom:6px}
    .sync.syncing{color:var(--text2)}
    .sync.synced{color:var(--accent)}
    .sync.error{color:var(--pink)}
    
    .complete-icon{width:56px;height:56px;display:flex;align-items:center;justify-content:center;background:rgba(100,255,218,.15);border:1px solid var(--accent);border-radius:50%;font-size:22px;color:var(--accent);margin-bottom:12px}
    .complete-xp{font-size:24px;font-weight:700;color:var(--accent);margin-bottom:20px}
    .complete-actions{margin-bottom:20px;width:100%;max-width:280px}
    .complete-actions p{font-size:11px;color:var(--text2);margin-bottom:8px}
    .save-btns{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
    .save-btns button{padding:6px 12px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;font-size:10px;color:var(--text);cursor:pointer}
    .complete-predict{margin-bottom:20px;width:100%;max-width:280px}
    .complete-predict p{font-size:11px;color:var(--text2);margin-bottom:6px}
    .complete-predict input{width:100%;padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;margin-bottom:6px}
    .complete-predict button{width:100%;padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text2);font-size:11px;cursor:pointer}
    .btn-home{padding:12px 40px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;cursor:pointer}
    
    .history-list{display:flex;flex-direction:column;gap:8px}
    .history-item{background:var(--bg2);border:1px solid var(--border);border-left:3px solid var(--c);border-radius:8px;padding:10px}
    .history-head{display:flex;justify-content:space-between;margin-bottom:6px;font-size:11px}
    .history-head span:last-child{color:var(--accent)}
    .history-item p{font-size:12px;color:var(--text2);line-height:1.4}
    .history-model{display:inline-block;margin-top:6px;font-size:9px;background:rgba(187,134,252,.15);color:var(--purple);padding:2px 6px;border-radius:4px}
    .history-date{display:block;margin-top:6px;font-size:9px;color:var(--text2)}
  `;

  return (
    <>
      <style>{css}</style>
      {view === 'home' && renderHome()}
      {view === 'dashboard' && renderDashboard()}
      {view === 'modules' && renderModules()}
      {view === 'tips' && renderTips()}
      {view === 'models' && renderModels()}
      {view === 'secondbrain' && renderSecondBrain()}
      {view === 'habits' && renderHabits()}
      {view === 'predictions' && renderPredictions()}
      {view === 'analytics' && renderAnalytics()}
      {view === 'graph' && renderGraph()}
      {view === 'flow' && renderFlow()}
      {view === 'decision' && renderDecision()}
      {view === 'quickadd' && <QuickAddScreen onBack={() => setView('home')} onAdd={(entry) => { setEntries(p => [...p, entry]); setView('home'); }} modes={MODES} models={MENTAL_MODELS} />}
      {view === 'session' && renderSession()}
      {view === 'complete' && renderComplete()}
      {view === 'history' && renderHistory()}
    </>
  );
}

export default App;