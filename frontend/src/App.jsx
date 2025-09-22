import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Configuration ---
const BASE_BRAIN_AGE = 20;
const REACTION_TEST_ROUNDS = 3;
const MATH_TEST_ROUNDS = 3;
const MEMORY_START_LEVEL = 3;
const BASELINE_THRESHOLD = 1; // Min games needed to calculate a baseline
const ALERT_DEVIATION_PERCENT = 0.15; // 15% deviation
const ALERT_CONSECUTIVE_GAMES = 1;

// --- Helper Functions --
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

// ====================================================================================
// --- Game Components (Largely unchanged) ---
// ====================================================================================

const WelcomeScreen = ({ onStart }) => (
  <div className="text-center">
    <h2 className="text-3xl font-bold text-gray-800">Brain Age Challenge</h2>
    <p className="mt-4 text-gray-600">Test your cognitive skills with three quick challenges.</p>
    <button
      onClick={onStart}
      className="mt-8 w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
    >
      Start Challenge
    </button>
  </div>
);

const ReactionTest = ({ onComplete }) => {
    // ... (This component's code is identical to the previous version) ...
    const [status, setStatus] = useState('waiting');
    const [startTime, setStartTime] = useState(0);
    const [results, setResults] = useState([]);

    const runTest = useCallback(() => {
        setStatus('ready');
        setTimeout(() => {
            setStatus('go');
            setStartTime(Date.now());
        }, getRandomInt(1000, 3000));
    }, []);

    useEffect(() => {
        if(results.length < REACTION_TEST_ROUNDS) {
            setTimeout(runTest, 1000);
        } else {
            const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
            onComplete(avgTime);
        }
    }, [results, runTest, onComplete]);

    const handleClick = () => {
        if (status === 'go') {
            const endTime = Date.now();
            const reactionTime = endTime - startTime;
            setResults(prev => [...prev, reactionTime]);
            setStatus('waiting');
        } else if (status === 'ready') {
            setStatus('tooSoon');
            setTimeout(() => { setStatus('waiting'); setResults(prev => [...prev]); }, 1500);
        }
    };
    const getBackgroundColor = () => status === 'ready' ? 'bg-red-500' : status === 'go' ? 'bg-green-500' : status === 'tooSoon' ? 'bg-yellow-500' : 'bg-blue-500';
    const getMessage = () => status === 'ready' ? '...Wait for Green' : status === 'go' ? 'Click Now!' : status === 'tooSoon' ? 'Too Soon!' : `Get Ready... Round ${results.length + 1}/${REACTION_TEST_ROUNDS}`;

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">⚡️ Reaction Test</h2>
            <div onClick={handleClick} className={`w-full h-64 rounded-lg flex items-center justify-center text-white text-3xl font-bold cursor-pointer transition-colors ${getBackgroundColor()}`}>
                {getMessage()}
            </div>
            <div className="mt-4"><p className="font-semibold">Your Times:</p><p className="text-gray-600 h-6">{results.map(r => `${r}ms`).join(', ')}</p></div>
        </div>
    );
};


const MemoryTest = ({ onComplete }) => {
    // ... (This component's code is identical to the previous version) ...
    const [level, setLevel] = useState(MEMORY_START_LEVEL);
    const [sequence, setSequence] = useState('');
    const [userInput, setUserInput] = useState('');
    const [phase, setPhase] = useState('showing');

    useEffect(() => {
        setPhase('showing');
        let newSequence = Array.from({length: level}, () => getRandomInt(0, 9)).join('');
        setSequence(newSequence);
        const timer = setTimeout(() => setPhase('entering'), level * 600);
        return () => clearTimeout(timer);
    }, [level]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userInput === sequence) { setUserInput(''); setLevel(prev => prev + 1); } 
        else { setPhase('failed'); setTimeout(() => onComplete(level - 1), 2000); }
    };
    
    if (phase === 'failed') return (<div className="text-center space-y-4"><h2 className="text-2xl font-bold text-gray-800">🧠 Number Memory</h2><p className="text-xl text-red-500">Incorrect! The number was {sequence}.</p><p>You remembered {level - 1} digits correctly.</p></div>);

    return (
        <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🧠 Number Memory</h2><p>Remember {level} digits...</p>
            <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                {phase === 'showing' ? <p className="text-4xl font-mono tracking-widest">{sequence}</p> : (<form onSubmit={handleSubmit}><input type="tel" value={userInput} onChange={(e) => setUserInput(e.target.value)} autoFocus className="w-full text-center text-4xl bg-transparent focus:outline-none"/></form>)}
            </div>
        </div>
    );
};

const MathTest = ({ onComplete }) => {
    // ... (This component's code is identical to the previous version) ...
    const [problems, setProblems] = useState([]);
    const [currentProblem, setCurrentProblem] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [startTime, setStartTime] = useState(0);
    const [times, setTimes] = useState([]);

    useEffect(() => {
        const newProblems = Array.from({length: MATH_TEST_ROUNDS}, () => { const num1 = getRandomInt(5, 20); const num2 = getRandomInt(5, num1); return { num1, num2, answer: num1 + num2 }; });
        setProblems(newProblems); setStartTime(Date.now());
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (parseInt(userInput) === problems[currentProblem].answer) {
            const newTimes = [...times, Date.now() - startTime]; setTimes(newTimes); setUserInput('');
            if (currentProblem + 1 < MATH_TEST_ROUNDS) { setCurrentProblem(p => p + 1); setStartTime(Date.now()); } 
            else { onComplete(newTimes.reduce((a, b) => a + b, 0) / newTimes.length); }
        }
    };

    if (problems.length === 0) return <div>Loading...</div>;
    const problem = problems[currentProblem];

    return (
        <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🧮 Quick Calculation</h2><p>Problem {currentProblem + 1} of {MATH_TEST_ROUNDS}</p>
            <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center"><p className="text-5xl font-mono">{problem.num1} + {problem.num2}</p></div>
            <form onSubmit={handleSubmit}><input type="tel" value={userInput} onChange={(e) => setUserInput(e.target.value)} autoFocus className="w-full text-center text-4xl p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/></form>
        </div>
    );
};


const ResultsScreen = ({ scores, onNext }) => {
    const brainAge = useMemo(() => {
        const reactionScore = (scores.reaction - 250) / 10;
        const memoryScore = (6 - scores.memory) * 3;
        const mathScore = (scores.math - 2000) / 200;
        const finalAge = BASE_BRAIN_AGE + reactionScore + memoryScore + mathScore;
        return Math.max(18, Math.round(finalAge));
    }, [scores]);

    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Today's Results</h2>
            <div className="mt-6 text-5xl font-bold text-indigo-600">{brainAge}</div>
            <p className="text-lg text-gray-600">is your estimated Brain Age!</p>
            <button onClick={onNext} className="mt-8 w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700">
              View Health Dashboard
            </button>
        </div>
    );
};

// ====================================================================================
// --- NEW Health Dashboard and Report Components ---
// ====================================================================================

const HealthDashboard = ({ history, onPrint }) => {
    const { baseline, chartData, alert } = useMemo(() => {
        let baseline = null;
        let alert = null;
        
        if (history.length >= BASELINE_THRESHOLD) {
            const baselineHistory = history.slice(0, history.length);
            const totalScores = baselineHistory.reduce((acc, curr) => {
                acc.reaction += curr.scores.reaction;
                acc.memory += curr.scores.memory;
                acc.math += curr.scores.math;
                return acc;
            }, { reaction: 0, memory: 0, math: 0 });

            baseline = {
                reaction: totalScores.reaction / baselineHistory.length,
                memory: totalScores.memory / baselineHistory.length,
                math: totalScores.math / baselineHistory.length,
            };

            // Check for alerts in the last few games
            if(history.length > BASELINE_THRESHOLD + ALERT_CONSECUTIVE_GAMES -1) {
                const recentGames = history.slice(-ALERT_CONSECUTIVE_GAMES);
                const memoryDrop = recentGames.every(game => game.scores.memory < baseline.memory * (1 - ALERT_DEVIATION_PERCENT));
                if (memoryDrop) {
                    alert = "We've noticed your memory scores have been lower than your baseline recently. Factors like sleep or stress can have an impact.";
                }
            }
        }
        
        const chartData = [...history].map(h => ({
            name: formatDate(h.timestamp),
            'Reaction (ms)': h.scores.reaction,
            'Memory (digits)': h.scores.memory,
            'Math (ms)': h.scores.math
        }));

        return { baseline, chartData, alert };
    }, [history]);

    const Chart = ({ dataKey, stroke, unit }) => (
         <div className="mb-8">
            <h3 className="font-semibold text-gray-700 text-center mb-2">{dataKey}</h3>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip formatter={(value) => `${value.toFixed(0)} ${unit}`} />
                    <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-gray-800">Health Dashboard</h2>
                 <button onClick={onPrint} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg">Print Report</button>
            </div>

            {alert && (
                 <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mb-6" role="alert">
                    <p className="font-bold">Insight</p>
                    <p>{alert}</p>
                </div>
            )}
           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Reaction Baseline</h3>
                    <p className="text-2xl font-semibold text-indigo-600">{baseline ? `${baseline.reaction.toFixed(0)}ms` : 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Memory Baseline</h3>
                    <p className="text-2xl font-semibold text-teal-600">{baseline ? `${baseline.memory.toFixed(1)} digits` : 'N/A'}</p>
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Math Baseline</h3>
                    <p className="text-2xl font-semibold text-amber-600">{baseline ? `${(baseline.math/1000).toFixed(2)}s` : 'N/A'}</p>
                </div>
            </div>
            {history.length < 2 && <p className="text-center text-gray-500 my-8">Play a few more games to see your trends here!</p>}
            {history.length >= 2 && (
                <>
                    <Chart dataKey="Reaction (ms)" stroke="#8884d8" unit="ms" />
                    <Chart dataKey="Memory (digits)" stroke="#4db6ac" unit="digits" />
                    <Chart dataKey="Math (ms)" stroke="#ffc658" unit="ms" />
                </>
            )}
        </div>
    );
};

const ReportView = ({ history, onBack }) => (
    <div className="report">
        <div className="flex justify-between items-center mb-6 no-print">
            <h2 className="text-3xl font-bold text-gray-800">Cognitive Health Report</h2>
            <div>
                 <button onClick={onBack} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg mr-2">Back to Dashboard</button>
                 <button onClick={() => window.print()} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">Print</button>
            </div>
        </div>
         <p className="mb-4">Report Generated: {new Date().toLocaleString()}</p>
         <h3 className="text-xl font-bold text-gray-700 mb-2">Performance Summary</h3>
         <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b-2 p-2">Date</th>
                    <th className="border-b-2 p-2">Reaction (ms)</th>
                    <th className="border-b-2 p-2">Memory (digits)</th>
                    <th className="border-b-2 p-2">Math (ms)</th>
                </tr>
            </thead>
            <tbody>
                {history.map(h => (
                    <tr key={h.timestamp}>
                        <td className="border-b p-2">{formatDate(h.timestamp)}</td>
                        <td className="border-b p-2">{h.scores.reaction.toFixed(0)}</td>
                        <td className="border-b p-2">{h.scores.memory.toFixed(1)}</td>
                        <td className="border-b p-2">{h.scores.math.toFixed(0)}</td>
                    </tr>
                ))}
            </tbody>
         </table>
         <style>{`
            @media print {
                body * { visibility: hidden; }
                .report, .report * { visibility: visible; }
                .report { position: absolute; left: 0; top: 0; width: 100%; }
                .no-print { display: none; }
            }
         `}</style>
    </div>
);

// ====================================================================================
// --- Main App Component ---
// ====================================================================================
export default function App() {
  const [history, setHistory] = useState([]);
  const [currentScores, setCurrentScores] = useState(null);
  const [view, setView] = useState('dashboard'); // game, dashboard, report
  const [gameState, setGameState] = useState('start'); // start, reaction, ... results

  // Load and save history from/to localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('brainGameHistory');
    if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('brainGameHistory', JSON.stringify(history));
  }, [history]);

  const handleGameStart = () => {
      setCurrentScores({ reaction: 0, memory: 0, math: 0 });
      setGameState('reaction');
      setView('game');
  }

  const handleGameComplete = (finalScores) => {
    const newHistoryEntry = {
        timestamp: Date.now(),
        scores: finalScores
    };
    setHistory(prev => [...prev, newHistoryEntry]);
    setCurrentScores(finalScores);
    setGameState('results');
  };
  
  const handleReactionComplete = (reactionTime) => { setCurrentScores(s => ({...s, reaction: reactionTime})); setGameState('memory'); };
  const handleMemoryComplete = (digits) => { setCurrentScores(s => ({...s, memory: digits})); setGameState('math'); };
  const handleMathComplete = (mathTime) => { handleGameComplete({...currentScores, math: mathTime}); };

  const GameView = () => {
    switch(gameState) {
        case 'reaction': return <ReactionTest onComplete={handleReactionComplete} />;
        case 'memory': return <MemoryTest onComplete={handleMemoryComplete} />;
        case 'math': return <MathTest onComplete={handleMathComplete} />;
        case 'results': return <ResultsScreen scores={currentScores} onNext={() => setView('dashboard')} />;
        case 'start':
        default: return <WelcomeScreen onStart={handleGameStart} />;
    }
  };
  
  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'game' && (
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto">
                 <GameView />
            </div>
        )}
        {view === 'dashboard' && (
            <div className="bg-white p-6 rounded-lg shadow-xl">
                 <HealthDashboard history={history} onPrint={() => setView('report')} />
                 <button onClick={handleGameStart} className="mt-8 w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700">
                    Play New Game
                 </button>
            </div>
        )}
        {view === 'report' && (
             <div className="bg-white p-6 rounded-lg shadow-xl">
                <ReportView history={history} onBack={() => setView('dashboard')} />
            </div>
        )}
      </div>
    </div>
  );
}

