import React, { useState } from 'react';

const DecisionMatrix = () => {
  const [problem, setProblem] = useState('');
  const [options, setOptions] = useState([{ id: 1, name: 'Option A' }, { id: 2, name: 'Option B' }]);
  const [criteria, setCriteria] = useState([{ id: 1, name: 'Impact', weight: 5 }, { id: 2, name: 'Ease', weight: 3 }]);
  const [scores, setScores] = useState({}); // { optId_critId: score }

  const addOption = () => {
    const id = Date.now();
    setOptions([...options, { id, name: `Option ${options.length + 1}` }]);
  };

  const addCriteria = () => {
    const id = Date.now();
    setCriteria([...criteria, { id, name: 'Criterion', weight: 1 }]);
  };

  const updateScore = (optId, critId, val) => {
    setScores(prev => ({ ...prev, [`${optId}_${critId}`]: parseInt(val) }));
  };

  const calculateTotal = (optId) => {
    return criteria.reduce((sum, crit) => {
      const score = scores[`${optId}_${crit.id}`] || 0;
      return sum + (score * crit.weight);
    }, 0);
  };

  const getWinner = () => {
    let max = -1;
    let winner = null;
    options.forEach(o => {
      const total = calculateTotal(o.id);
      if (total > max) { max = total; winner = o; }
    });
    return max > 0 ? winner : null;
  };

  const winner = getWinner();

  return (
    <div className="decision-matrix">
      <input 
        className="problem-input" 
        placeholder="What are you deciding? (e.g., Job A vs Job B)" 
        value={problem}
        onChange={e => setProblem(e.target.value)}
      />

      <div className="matrix-scroll">
        <table>
          <thead>
            <tr>
              <th className="corner">Criteria \ Options</th>
              {options.map(o => (
                <th key={o.id}>
                  <input value={o.name} onChange={e => setOptions(options.map(x => x.id === o.id ? { ...x, name: e.target.value } : x))} />
                </th>
              ))}
              <th className="action-col"><button onClick={addOption}>+</button></th>
            </tr>
          </thead>
          <tbody>
            {criteria.map(c => (
              <tr key={c.id}>
                <td className="crit-cell">
                  <input className="crit-name" value={c.name} onChange={e => setCriteria(criteria.map(x => x.id === c.id ? { ...x, name: e.target.value } : x))} />
                  <div className="weight-control">
                    <span>×</span>
                    <input 
                      type="number" 
                      min="1" max="10" 
                      value={c.weight} 
                      onChange={e => setCriteria(criteria.map(x => x.id === c.id ? { ...x, weight: parseInt(e.target.value) || 1 } : x))} 
                    />
                  </div>
                </td>
                {options.map(o => {
                  const val = scores[`${o.id}_${c.id}`] || 0;
                  return (
                    <td key={o.id} className="score-cell">
                      <input 
                        type="number" 
                        min="0" max="10" 
                        value={val} 
                        onChange={e => updateScore(o.id, c.id, e.target.value)} 
                      />
                    </td>
                  );
                })}
                <td></td>
              </tr>
            ))}
            <tr>
              <td className="action-row"><button onClick={addCriteria}>+ Add Criteria</button></td>
              {options.map(o => <td key={o.id}></td>)}
            </tr>
            <tr className="total-row">
              <td>Score</td>
              {options.map(o => (
                <td key={o.id} className={winner?.id === o.id ? 'winner' : ''}>
                  {calculateTotal(o.id)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {winner && winner.name !== 'Option A' && (
        <div className="winner-banner">
          <span>🏆 The math suggests:</span>
          <strong>{winner.name}</strong>
        </div>
      )}

      <style>{`
        .decision-matrix { overflow: hidden; }
        .problem-input { width: 100%; background: var(--bg2); border: 1px solid var(--border); padding: 12px; border-radius: 8px; color: var(--text); font-size: 14px; margin-bottom: 20px; }
        
        .matrix-scroll { overflow-x: auto; padding-bottom: 10px; }
        table { width: 100%; border-collapse: separate; border-spacing: 4px; min-width: 300px; }
        
        th input { width: 100%; background: none; border: none; color: var(--accent); font-weight: 700; text-align: center; }
        .corner { font-size: 10px; color: var(--text2); text-align: left; }
        
        .crit-cell { background: var(--bg2); padding: 8px; border-radius: 6px; min-width: 100px; }
        .crit-name { width: 100%; background: none; border: none; color: var(--text); font-size: 12px; margin-bottom: 4px; }
        .weight-control { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--purple); }
        .weight-control input { width: 30px; background: rgba(187,134,252,0.1); border: none; border-radius: 4px; color: var(--purple); padding: 2px; text-align: center; }
        
        .score-cell input { width: 100%; padding: 12px; background: var(--bg3); border: 1px solid var(--border); border-radius: 6px; color: var(--text); text-align: center; font-size: 14px; }
        .score-cell input:focus { border-color: var(--accent); outline: none; }
        
        button { background: var(--bg2); border: 1px solid var(--border); color: var(--text2); cursor: pointer; padding: 4px 8px; border-radius: 4px; font-size: 10px; }
        .action-col button { width: 100%; }
        .action-row button { width: 100%; text-align: left; padding: 8px; border-style: dashed; }
        
        .total-row td { background: var(--bg2); padding: 12px; text-align: center; font-weight: 700; border-radius: 6px; font-size: 16px; }
        .total-row td:first-child { text-align: left; font-size: 12px; color: var(--text2); }
        .total-row td.winner { background: rgba(100,255,218,0.15); color: var(--accent); border: 1px solid var(--accent); }
        
        .winner-banner { margin-top: 20px; background: linear-gradient(135deg, var(--accent), var(--blue)); color: var(--bg); padding: 16px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .winner-banner span { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 4px; }
        .winner-banner strong { font-size: 18px; }
      `}</style>
    </div>
  );
};

export default DecisionMatrix;
