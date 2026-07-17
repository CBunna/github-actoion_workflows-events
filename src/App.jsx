import React, { useState, useEffect } from 'react';
import { levels } from './levels';
import Editor from './Editor';
import JobGraph from './JobGraph';
import Terminal from './Terminal';
import './App.css';

export default function App() {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [code, setCode] = useState('');
  const [completedLevels, setCompletedLevels] = useState([]);
  const [score, setScore] = useState(0);

  // Running simulation state
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState('idle'); // idle, running, success, failed

  // Job visualizer graph state
  const [jobs, setJobs] = useState([]);

  // Feedback card state
  const [feedback, setFeedback] = useState(null);

  const currentLevel = levels.find(l => l.id === currentLevelId);

  // Initialize level code and expected jobs on level load
  useEffect(() => {
    setCode(currentLevel.defaultCode);
    setJobs(currentLevel.expectedJobs.map(job => ({ ...job, status: 'pending' })));
    setLogs([]);
    setRunStatus('idle');
    setFeedback(null);
  }, [currentLevelId]);

  const handleReset = () => {
    setCode(currentLevel.defaultCode);
    setJobs(currentLevel.expectedJobs.map(job => ({ ...job, status: 'pending' })));
    setLogs([]);
    setRunStatus('idle');
    setFeedback(null);
  };

  const runWorkflow = () => {
    if (isRunning) return;

    setIsRunning(true);
    setRunStatus('running');
    setLogs([]);
    setFeedback(null);

    // Reset jobs status to queued/running
    setJobs(currentLevel.expectedJobs.map(job => ({ ...job, status: 'queued' })));

    // Perform verification checks
    const validationResult = currentLevel.validate(code);

    // Start streaming simulated logs line-by-line
    let logIndex = 0;
    const baseLogs = currentLevel.simulatedLogs;
    const activeLogs = [];

    const interval = setInterval(() => {
      if (logIndex < baseLogs.length - 1) {
        const nextLog = baseLogs[logIndex];
        activeLogs.push(nextLog);
        setLogs([...activeLogs]);

        // Dynamically update the status of jobs on the graph during logs streaming
        updateJobStatusesFromLogs(nextLog);

        logIndex++;
      } else {
        clearInterval(interval);

        // Final log checks
        if (validationResult.success) {
          activeLogs.push(baseLogs[baseLogs.length - 1]); // push final success log
          setLogs([...activeLogs]);
          setRunStatus('success');

          // Complete all jobs successfully
          setJobs(prevJobs => prevJobs.map(job => ({ ...job, status: 'success' })));

          // Add score and mark completed if first time
          if (!completedLevels.includes(currentLevel.id)) {
            setCompletedLevels([...completedLevels, currentLevel.id]);
            setScore(prev => prev + currentLevel.points);
          }

          setFeedback({
            success: true,
            title: "🎉 Lab Passed Successfully!",
            message: `Awesome work! You successfully configured the GHA workflow for this lab. You earned ${currentLevel.points} points.`
          });
        } else {
          // If validation failed, trigger an error log output
          activeLogs.push("❌ Runner Error: Action compilation failed due to configuration errors.");
          activeLogs.push(`❌ Error details: ${validationResult.error}`);
          setLogs([...activeLogs]);
          setRunStatus('failed');

          // Turn active jobs red
          setJobs(prevJobs => prevJobs.map(job => ({ ...job, status: 'failed' })));

          setFeedback({
            success: false,
            title: "⚠️ Code Validation Failed",
            message: validationResult.error,
            professorHint: getProfessorCorrectionHint(validationResult.error)
          });
        }

        setIsRunning(false);
      }
    }, 850); // delay step simulations for realism
  };

  // Maps specific logs to job nodes and highlights them dynamically
  const updateJobStatusesFromLogs = (logLine) => {
    if (logLine.includes('Running Job: lint') || logLine.includes('Job: lint (Runner A)')) {
      setJobStatus('lint', 'running');
    } else if (logLine.includes('Running Job: test') || logLine.includes('Job: test (Runner B)')) {
      setJobStatus('test', 'running');
    } else if (logLine.includes('Running Job: build')) {
      setJobStatus('build', 'running');
      setJobStatus('lint', 'success');
      setJobStatus('test', 'success');
    } else if (logLine.includes('Running Job: security')) {
      setJobStatus('security', 'running');
    } else if (logLine.includes('Running Job: release')) {
      setJobStatus('release', 'running');
    }

    // Marking success states
    if (logLine.includes('Job lint completed') || logLine.includes('npm run lint... Success!')) {
      setJobStatus('lint', 'success');
    }
    if (logLine.includes('Job test completed') || logLine.includes('npm test... Success!')) {
      setJobStatus('test', 'success');
    }
  };

  const setJobStatus = (jobId, status) => {
    setJobs(prevJobs => prevJobs.map(job =>
      job.id === jobId ? { ...job, status } : job
    ));
  };

  const getProfessorCorrectionHint = (errorMsg) => {
    if (errorMsg.includes('trigger')) {
      return "Make sure the 'on:' property points to the correct GitHub event name exactly. YAML keys are case-sensitive.";
    }
    if (errorMsg.includes('runs-on')) {
      return "Every job requires a runner VM configuration. Use 'runs-on: ubuntu-latest' to allocate a standard Ubuntu machine.";
    }
    if (errorMsg.includes('needs')) {
      return "Use the 'needs' property at the job level. It expects an array value: needs: [lint, test] or needs: lint.";
    }
    if (errorMsg.includes('permissions')) {
      return "CD pipelines require elevated privileges. Under the job block, configure: permissions: contents: write.";
    }
    if (errorMsg.includes('fetch-depth')) {
      return "By default, checkouts are shallow. For version analysis, fetch all branches by providing 'fetch-depth: 0' under actions/checkout configurations.";
    }
    return "Check your file indentations. Each nested level must be indented with 2 spaces. Never use standard keyboard tabs.";
  };

  return (
    <div className="app-layout">
      {/* Navbar Banner */}
      <header className="app-header glass-panel">
        <div className="header-branding">
          <span className="brand-logo">🎓</span>
          <h1>GHA-Quest</h1>
          <span className="brand-tag">GitHub Actions Simulator</span>
        </div>

        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-label">SCORE</span>
            <span className="stat-value text-cyan">{score} XP</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">LABS</span>
            <span className="stat-value text-green">
              {completedLevels.length} / {levels.length} Done
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="dashboard-grid">
        {/* Left Side: Tasks & Level Selector */}
        <section className="left-sidebar">
          {/* Level selector list */}
          <div className="level-selector-card glass-panel">
            <h2>Select Laboratory Lab</h2>
            <div className="level-buttons-grid">
              {levels.map(level => {
                const isCompleted = completedLevels.includes(level.id);
                const isCurrent = level.id === currentLevelId;

                return (
                  <button
                    key={level.id}
                    onClick={() => setCurrentLevelId(level.id)}
                    className={`level-tab ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    <div className="level-tab-header">
                      <span>Level {level.id}</span>
                      {isCompleted && <span className="completed-check">✔</span>}
                    </div>
                    <div className="level-tab-title">{level.title.split('. ')[1]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructions Box */}
          <div className="instructions-card glass-panel">
            <div className="card-header">
              <h2>{currentLevel.title}</h2>
              <span className="difficulty-badge">{currentLevel.difficulty}</span>
            </div>

            <p className="level-description">{currentLevel.description}</p>

            <div className="tasks-box">
              <h3>Objective Requirements:</h3>
              <ul>
                {currentLevel.instructions.map((inst, index) => (
                  <li key={index}>{inst}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={runWorkflow}
              disabled={isRunning}
              className="glow-btn run-btn"
            >
              {isRunning ? '⏳ Executing Pipeline...' : '▶️ Run Workflow'}
            </button>
          </div>

          {/* Feedback details */}
          {feedback && (
            <div className={`feedback-card glass-panel ${feedback.success ? 'success' : 'error'}`}>
              <h3>{feedback.title}</h3>
              <p className="feedback-message">{feedback.message}</p>
              {feedback.professorHint && (
                <div className="professor-hint">
                  <strong>👨‍🏫 Professor's Hint:</strong>
                  <p>{feedback.professorHint}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right Side: Code Editor and Run visualizer */}
        <section className="editor-section">
          <Editor
            code={code}
            setCode={setCode}
            currentLevel={currentLevel}
            onReset={handleReset}
          />

          <div className="output-row">
            <div className="graph-col">
              <JobGraph jobs={jobs} currentLevel={currentLevel} />
            </div>
            <div className="terminal-col">
              <Terminal logs={logs} isRunning={isRunning} runStatus={runStatus} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
