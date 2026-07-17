import React, { useRef, useEffect } from 'react';
import './Terminal.css';

export default function Terminal({ logs, isRunning, runStatus }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getStatusBadge = () => {
    switch (runStatus) {
      case 'success':
        return <span className="status-badge success">● SUCCESS</span>;
      case 'failed':
        return <span className="status-badge error">● FAILED</span>;
      case 'running':
        return <span className="status-badge active-run">● RUNNING</span>;
      default:
        return <span className="status-badge idle">● IDLE</span>;
    }
  };

  return (
    <div className="terminal-container glass-panel">
      <div className="terminal-header">
        <div className="terminal-header-title">
          <span className="terminal-icon">📟</span> Runner Terminal Log
        </div>
        <div className="terminal-header-status">
          {getStatusBadge()}
        </div>
      </div>
      
      <div className="terminal-body">
        {logs.length === 0 ? (
          <div className="terminal-placeholder">
            <p>Your workflow output will stream here in real time when you click "RUN WORKFLOW".</p>
            <p className="command-hint">$ npm run github-actions --trigger-event push</p>
            <span className="cursor">_</span>
          </div>
        ) : (
          <div className="logs-list">
            {logs.map((log, index) => {
              // Simple highlighting based on characters
              let lineClass = 'log-line';
              if (log.startsWith('🚀') || log.startsWith('🎉') || log.startsWith('✅')) {
                lineClass += ' highlight-green';
              } else if (log.startsWith('❌') || log.includes('Error')) {
                lineClass += ' highlight-red';
              } else if (log.includes('Step:') || log.startsWith('⚙️')) {
                lineClass += ' highlight-blue';
              } else if (log.startsWith('  ↳')) {
                lineClass += ' indent';
              }
              
              return (
                <div key={index} className={lineClass}>
                  {log}
                </div>
              );
            })}
            {isRunning && (
              <div className="log-line loading-indicator">
                <span className="spinner">⌛</span> Streaming actions runner output...
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
