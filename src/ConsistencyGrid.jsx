import React from 'react';

const ConsistencyGrid = ({ entries }) => {
  // Config: Feb 1, 2026 to July 31, 2026
  const startDate = new Date('2026-02-01');
  const endDate = new Date('2026-07-31');

  // Helper to format date key YYYY-MM-DD
  const getDateKey = (date) => date.toISOString().split('T')[0];

  // Map of activity: { '2026-02-01': count, ... }
  const activityMap = entries.reduce((acc, entry) => {
    const key = entry.ts.split('T')[0];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Generate all days
  const months = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const monthName = currentDate.toLocaleString('default', { month: 'short' });
    let monthGroup = months.find(m => m.name === monthName);
    
    if (!monthGroup) {
      monthGroup = { name: monthName, days: [] };
      months.push(monthGroup);
    }
    
    const dateKey = getDateKey(currentDate);
    const count = activityMap[dateKey] || 0;
    
    // Intensity level 0-4
    let level = 0;
    if (count > 0) level = 1;
    if (count > 2) level = 2;
    if (count > 5) level = 3;
    if (count > 8) level = 4;

    monthGroup.days.push({
      date: new Date(currentDate),
      key: dateKey,
      count,
      level
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return (
    <div className="consistency-grid-container">
      <h3>📆 6-Month Focus (Feb - Jul)</h3>
      <div className="months-row">
        {months.map(month => (
          <div key={month.name} className="month-col">
            <span className="month-label">{month.name}</span>
            <div className="days-grid">
              {month.days.map(day => (
                <div 
                  key={day.key} 
                  className={`day-cell level-${day.level}`} 
                  title={`${day.key}: ${day.count} entries`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="grid-legend">
        <span>Less</span>
        <div className="legend-scale">
          <div className="day-cell level-0" />
          <div className="day-cell level-1" />
          <div className="day-cell level-2" />
          <div className="day-cell level-3" />
          <div className="day-cell level-4" />
        </div>
        <span>More</span>
      </div>

      <style>{`
        .consistency-grid-container {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          overflow-x: auto;
        }
        .consistency-grid-container h3 {
          font-size: 14px;
          color: var(--text);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .months-row {
          display: flex;
          gap: 16px;
          min-width: max-content;
        }
        .month-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .month-label {
          font-size: 10px;
          color: var(--text2);
          text-transform: uppercase;
          font-weight: 600;
        }
        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr); /* 7 days a week roughly, or just simple grid */
          grid-auto-flow: column; /* Fill vertically first to look like GitHub? Or simple block? Let's do simple linear block per month 5x6 est */
          grid-template-rows: repeat(5, 1fr);
          gap: 3px;
        }
        .day-cell {
          width: 10px;
          height: 10px;
          background: rgba(255,255,255,0.05);
          border-radius: 2px;
        }
        .day-cell.level-1 { background: rgba(100, 255, 218, 0.25); }
        .day-cell.level-2 { background: rgba(100, 255, 218, 0.5); }
        .day-cell.level-3 { background: rgba(100, 255, 218, 0.75); }
        .day-cell.level-4 { background: #64ffda; box-shadow: 0 0 4px var(--accent); }
        
        .grid-legend { display: flex; align-items: center; gap: 8px; font-size: 10px; color: var(--text2); margin-top: 12px; }
        .legend-scale { display: flex; gap: 3px; }
      `}</style>
    </div>
  );
};

export default ConsistencyGrid;
