import React, { useRef, useEffect } from 'react';
import './Editor.css';

export default function Editor({ code, setCode, currentLevel, onReset }) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Sync scroll of line numbers with text area
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 15) }, (_, i) => i + 1);

  return (
    <div className="editor-container glass-panel">
      <div className="editor-header">
        <div className="editor-dots">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>
        <div className="editor-title">.github/workflows/main.yml</div>
        <button className="reset-btn" onClick={onReset} title="Reset code to level default">
          🔄 Reset Code
        </button>
      </div>
      
      <div className="editor-body">
        <div className="line-numbers" ref={lineNumbersRef}>
          {lineNumbers.map(num => (
            <div key={num} className="line-number-cell">{num}</div>
          ))}
        </div>
        
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onScroll={handleScroll}
          className="editor-textarea"
          spellCheck="false"
          placeholder="# Write your GitHub Action YAML here..."
        />
      </div>
      
      <div className="editor-footer">
        <span className="footer-status">💬 HINT: Indentation matters in YAML. Use spaces, not tabs!</span>
        <span className="footer-lang">YAML</span>
      </div>
    </div>
  );
}
