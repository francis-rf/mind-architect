import React, { useState, useEffect, useRef } from 'react';

const FlowTimer = () => {
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // focus | rest
  const [distractions, setDistractions] = useState([]);
  const [distractionInput, setDistractionInput] = useState('');
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound or notify
      if (mode === 'focus') {
        alert("Deep work cycle complete! Time to rest.");
        setMode('rest');
        setTimeLeft(20 * 60); // 20 min rest
      } else {
        alert("Rest complete. Ready for another cycle?");
        setMode('focus');
        setTimeLeft(90 * 60);
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 90 * 60 : 20 * 60);
  };

  const addDistraction = (e) => {
    if (e.key === 'Enter' && distractionInput.trim()) {
      setDistractions(prev => [...prev, { id: Date.now(), text: distractionInput }]);
      setDistractionInput('');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus' 
    ? ((90 * 60 - timeLeft) / (90 * 60)) * 100 
    : ((20 * 60 - timeLeft) / (20 * 60)) * 100;

  return (
    <div className="flow-container">
      <div className={`timer-circle ${isActive ? 'active' : ''} ${mode}`}>
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="bg-ring" />
          <circle cx="50" cy="50" r="45" className="progress-ring" 
            pathLength="100" 
            strokeDasharray="100" 
            strokeDashoffset={100 - progress} 
          />
        </svg>
        <div className="time-display">
          <span className="mode-label">{mode === 'focus' ? 'DEEP WORK' : 'RECHARGE'}</span>
          <span className="time-val">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="controls">
        <button className={`btn-toggle ${isActive ? 'active' : ''}`} onClick={toggleTimer}>
          {isActive ? 'Pause' : 'Start Focus'}
        </button>
        <button className="btn-reset" onClick={resetTimer}>Reset</button>
      </div>

      <div className="distraction-pad">
        <h4>⚡ Distraction Pad</h4>
        <p className="hint">Park stray thoughts here without breaking flow.</p>
        <input 
          type="text" 
          value={distractionInput} 
          onChange={e => setDistractionInput(e.target.value)} 
          onKeyDown={addDistraction}
          placeholder="I need to remember to..." 
        />
        <div className="distraction-list">
          {distractions.map(d => (
            <div key={d.id} className="distraction-item">• {d.text}</div>
          ))}
        </div>
      </div>

      <style>{`
        .flow-container { display: flex; flex-direction: column; align-items: center; gap: 20px; }
        
        .timer-circle { position: relative; width: 220px; height: 220px; }
        .timer-circle svg { width: 100%; height: 100%; transform: rotate(-90deg); }
        .bg-ring { fill: none; stroke: #27272a; stroke-width: 4; }
        .progress-ring { fill: none; stroke: var(--accent); stroke-width: 4; transition: stroke-dashoffset 1s linear; stroke-linecap: round; }
        .timer-circle.rest .progress-ring { stroke: var(--blue); }
        
        .timer-circle.active .progress-ring { filter: drop-shadow(0 0 6px var(--accent)); }
        .timer-circle.active.rest .progress-ring { filter: drop-shadow(0 0 6px var(--blue)); }

        .time-display { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .mode-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: var(--text2); margin-bottom: 4px; }
        .time-val { font-size: 42px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -1px; }

        .controls { display: flex; gap: 10px; width: 100%; }
        .btn-toggle { flex: 1; padding: 14px; background: var(--bg2); border: 1px solid var(--accent); color: var(--accent); border-radius: 8px; font-weight: 600; cursor: pointer; transition: all .2s; }
        .btn-toggle:hover { background: rgba(100, 255, 218, 0.1); }
        .btn-toggle.active { background: var(--accent); color: var(--bg); }
        .btn-reset { padding: 14px; background: none; border: 1px solid var(--border); color: var(--text2); border-radius: 8px; cursor: pointer; }

        .distraction-pad { width: 100%; background: var(--bg2); padding: 16px; border-radius: 12px; border: 1px solid var(--border); }
        .distraction-pad h4 { font-size: 12px; margin-bottom: 4px; color: var(--yellow); }
        .distraction-pad .hint { font-size: 10px; color: var(--text2); margin-bottom: 12px; }
        .distraction-pad input { width: 100%; padding: 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 12px; margin-bottom: 8px; }
        .distraction-pad input:focus { outline: none; border-color: var(--yellow); }
        
        .distraction-list { max-height: 100px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
        .distraction-item { font-size: 11px; color: var(--text2); padding: 4px 0; border-bottom: 1px solid #27272a; }
      `}</style>
    </div>
  );
};

export default FlowTimer;
