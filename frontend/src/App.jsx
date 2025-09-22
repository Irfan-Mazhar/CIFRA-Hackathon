import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Chart from 'chart.js/auto';

// --- Configuration & Helpers ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const REACTION_TEST_ROUNDS = 3;
const MATH_TEST_ROUNDS = 3;
const MEMORY_START_LEVEL = 3;
const BASE_BRAIN_AGE = 20;


// --- Main App Component ---
export default function App() {
    const [currentView, setCurrentView] = useState('dashboard');
    const [userData, setUserData] = useState({
        labels: [],
        reactionScores: [],
        memoryScores: [],
        mathScores: [], // Added math scores
        moodLevels: [],
        stressLevels: [],
    });

    // Load initial mock data
    useEffect(() => {
        const today = new Date();
        const labels = [];
        const reactionScores = [];
        const memoryScores = [];
        const mathScores = [];
        const moodLevels = [];
        const stressLevels = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            reactionScores.push(getRandomInt(250, 400));
            memoryScores.push(getRandomInt(4, 7));
            mathScores.push(getRandomInt(1500, 2500));
            moodLevels.push(getRandomInt(3, 5));
            stressLevels.push(getRandomInt(4, 8));
        }
        setUserData({ labels, reactionScores, memoryScores, mathScores, moodLevels, stressLevels });
    }, []);

    const saveData = (dataType, score) => {
        const todayLabel = (new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        setUserData(prevData => {
            const newData = { ...prevData };
            let todayIndex = newData.labels.indexOf(todayLabel);

            if (todayIndex === -1) {
                if(newData.labels.length >= 7) {
                    Object.keys(newData).forEach(key => newData[key].shift());
                }
                newData.labels.push(todayLabel);
                Object.keys(newData).forEach(key => {
                    if (key !== 'labels') newData[key].push(null);
                });
                todayIndex = newData.labels.length - 1;
            }
            
            // If the score for this data type already exists, average it
            const existingScore = newData[dataType][todayIndex];
            newData[dataType][todayIndex] = existingScore ? Math.round((existingScore + score) / 2) : Math.round(score);
            
            return { ...newData };
        });
    };
    
    const saveJournalData = (mood, stress) => {
         const todayLabel = (new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        setUserData(prevData => {
            const newData = { ...prevData };
            let todayIndex = newData.labels.indexOf(todayLabel);

            if (todayIndex === -1) {
                 if(newData.labels.length >= 7) {
                    Object.keys(newData).forEach(key => newData[key].shift());
                }
                newData.labels.push(todayLabel);
                 Object.keys(newData).forEach(key => {
                    if (key !== 'labels') newData[key].push(null);
                });
                todayIndex = newData.labels.length - 1;
            }
            
            newData.moodLevels[todayIndex] = mood;
            newData.stressLevels[todayIndex] = stress;
            return {...newData};
        });
    };

    const renderView = () => {
        switch (currentView) {
            case 'assessments':
                return <AssessmentsView onSave={saveData} goToDashboard={() => setCurrentView('dashboard')} />;
            case 'journal':
                return <JournalView onSave={saveJournalData} />;
            case 'insights':
                return <InsightsView userData={userData} />;
            case 'dashboard':
            default:
                return <DashboardView userData={userData} />;
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-blue-100 font-sans min-h-screen text-[#3f3d56] antialiased">
            <BackgroundEffects />
            <div className="relative container mx-auto p-4 sm:p-6 lg:p-8 z-10">
                <Header />
                <Navigation currentView={currentView} setCurrentView={setCurrentView} />
                <main id="app-content" className="mt-8">
                    {renderView()}
                </main>
            </div>
        </div>
    );
}

// --- New Background Effects Component ---
const BackgroundEffects = () => (
    <>
        <ul className="background-shapes">
           <li></li>
           <li></li>
           <li></li>
           <li></li>
           <li></li>
           <li></li>
           <li></li>
           <li></li>
           <li></li>
           <li></li>
        </ul>
        <style>{`
            .background-shapes {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 0;
            }

            .background-shapes li {
                position: absolute;
                display: block;
                list-style: none;
                width: 20px;
                height: 20px;
                background: rgba(255, 255, 255, 0.2);
                animation: animate 25s linear infinite;
                bottom: -150px;
                border-radius: 0.25rem;
            }

            .background-shapes li:nth-child(1) { left: 25%; width: 80px; height: 80px; animation-delay: 0s; }
            .background-shapes li:nth-child(2) { left: 10%; width: 20px; height: 20px; animation-delay: 2s; animation-duration: 12s; }
            .background-shapes li:nth-child(3) { left: 70%; width: 20px; height: 20px; animation-delay: 4s; }
            .background-shapes li:nth-child(4) { left: 40%; width: 60px; height: 60px; animation-delay: 0s; animation-duration: 18s; }
            .background-shapes li:nth-child(5) { left: 65%; width: 20px; height: 20px; animation-delay: 0s; }
            .background-shapes li:nth-child(6) { left: 75%; width: 110px; height: 110px; animation-delay: 3s; }
            .background-shapes li:nth-child(7) { left: 35%; width: 150px; height: 150px; animation-delay: 7s; }
            .background-shapes li:nth-child(8) { left: 50%; width: 25px; height: 25px; animation-delay: 15s; animation-duration: 45s; }
            .background-shapes li:nth-child(9) { left: 20%; width: 15px; height: 15px; animation-delay: 2s; animation-duration: 35s; }
            .background-shapes li:nth-child(10) { left: 85%; width: 150px; height: 150px; animation-delay: 0s; animation-duration: 11s; }

            @keyframes animate {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-1000px) rotate(720deg);
                    opacity: 0;
                }
            }
        `}</style>
    </>
);


// --- Layout Components ---
const Header = () => (
    <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Cogni-Flow</h1>
        <p className="text-lg text-gray-500 mt-1">Your Personal Cognitive Well-being Tracker</p>
    </header>
);

const Navigation = ({ currentView, setCurrentView }) => {
    const navItems = ['dashboard', 'assessments', 'journal', 'insights'];
    return (
        <nav className="flex justify-center border-b-2 border-gray-200 bg-white/30 backdrop-blur-sm rounded-t-xl">
            {navItems.map(item => (
                <button
                    key={item}
                    onClick={() => setCurrentView(item)}
                    className={`nav-link text-lg font-semibold py-4 px-6 border-b-2 transition capitalize ${
                        currentView === item
                            ? 'text-blue-600 border-blue-600'
                            : 'border-transparent hover:text-blue-500'
                    }`}
                >
                    {item}
                </button>
            ))}
        </nav>
    );
};

const ViewContainer = ({ title, subtitle, children }) => (
    <section className="fade-in">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
            <p className="text-gray-500">{subtitle}</p>
        </div>
        {children}
    </section>
);


// --- Dashboard View ---
const DashboardView = ({ userData }) => {
    const lastReaction = useMemo(() => userData.reactionScores.filter(s => s !== null).pop(), [userData.reactionScores]);
    const lastMemory = useMemo(() => userData.memoryScores.filter(s => s !== null).pop(), [userData.memoryScores]);
    const lastMath = useMemo(() => userData.mathScores.filter(s => s !== null).pop(), [userData.mathScores]);
    const lastMood = useMemo(() => userData.moodLevels.filter(s => s !== null).pop(), [userData.moodLevels]);
    const moodMap = {1: '😞', 2: '😐', 3: '😊', 4: '😄', 5: '🤩'};

    return (
        <ViewContainer title="Welcome Back!" subtitle="Here's a summary of your cognitive health trends.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-center">
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-500">Last Reaction Time</h3>
                    <p className="text-3xl font-bold text-blue-500 mt-2">{lastReaction ? `${Math.round(lastReaction)} ms` : '-- ms'}</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-500">Last Memory Score</h3>
                    <p className="text-3xl font-bold text-indigo-500 mt-2">{isFinite(lastMemory) ? `${lastMemory} digits` : '--'}</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-500">Last Math Time</h3>
                    <p className="text-3xl font-bold text-amber-500 mt-2">{lastMath ? `${Math.round(lastMath)} ms` : '-- ms'}</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-500">Today's Mood</h3>
                    <p className="text-3xl font-bold text-green-500 mt-2">{moodMap[lastMood] || '--'}</p>
                </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-md mb-8">
                 <h3 className="text-xl font-semibold text-center mb-4">Your Cognitive Fingerprint</h3>
                 <div className="relative h-[350px]">
                    <CognitiveFingerprintChart userData={userData} />
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Cognitive Scores (Last 7 Days)">
                    <CognitiveChart data={userData} />
                </ChartCard>
                <ChartCard title="Well-being Log (Last 7 Days)">
                    <WellbeingChart data={userData} />
                </ChartCard>
            </div>
        </ViewContainer>
    );
};

const ChartCard = ({ title, children }) => (
    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-center mb-4">{title}</h3>
        <div className="relative h-[300px] md:h-[350px]">{children}</div>
    </div>
);

const CognitiveFingerprintChart = ({ userData }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const latestScores = useMemo(() => {
        const reaction = userData.reactionScores.filter(s => s !== null).pop();
        const memory = userData.memoryScores.filter(s => s !== null).pop();
        const math = userData.mathScores.filter(s => s !== null).pop();
        const mood = userData.moodLevels.filter(s => s !== null).pop();
        const stress = userData.stressLevels.filter(s => s !== null).pop();

        if ([reaction, memory, math, mood, stress].some(s => s === undefined)) {
            return null;
        }

        // Normalize scores to a 0-100 scale where higher is better
        const reactionScore = Math.max(0, 100 - ((reaction - 200) / 4)); // Ideal 200ms, score decreases
        const memoryScore = Math.min(100, memory * 12.5); // 8 digits = 100
        const mathScore = Math.max(0, 100 - ((math - 1000) / 50)); // Ideal 1000ms, score decreases
        const wellbeingScore = ((mood / 5) * 50) + (((10 - stress) / 10) * 50);

        return [reactionScore, memoryScore, mathScore, wellbeingScore];

    }, [userData]);

    useEffect(() => {
        if (!chartRef.current || !latestScores) return;
        if (chartInstance.current) chartInstance.current.destroy();
        
        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Reaction', 'Memory', 'Calculation', 'Well-being'],
                datasets: [{
                    label: 'Latest Score',
                    data: latestScores,
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgb(59, 130, 246)',
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(59, 130, 246)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { display: false },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        pointLabels: { font: { size: 14 } }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
        return () => { if(chartInstance.current) chartInstance.current.destroy(); };
    }, [latestScores]);

    if(!latestScores) {
        return <div className="flex items-center justify-center h-full text-gray-500">Play an assessment to see your fingerprint.</div>
    }

    return <canvas ref={chartRef} />;
};

const CognitiveChart = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;
        if (chartInstance.current) chartInstance.current.destroy();
        
        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    { label: 'Reaction (ms)', data: data.reactionScores, borderColor: '#3B82F6', backgroundColor: '#3B82F620', yAxisID: 'y', tension: 0.3, fill: true },
                    { label: 'Memory (digits)', data: data.memoryScores, borderColor: '#8B5CF6', backgroundColor: '#8B5CF620', yAxisID: 'y1', tension: 0.3, fill: true },
                    { label: 'Math (ms)', data: data.mathScores, borderColor: '#F59E0B', backgroundColor: '#F59E0B20', yAxisID: 'y', tension: 0.3, fill: true },
                ],
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                     y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Time (ms)' } },
                     y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Digits Remembered' }, grid: { drawOnChartArea: false } },
                },
            },
        });
        return () => { if(chartInstance.current) chartInstance.current.destroy(); };
    }, [data]);

    return <canvas ref={chartRef} />;
};

const WellbeingChart = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;
        if (chartInstance.current) chartInstance.current.destroy();
        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    { label: 'Mood (1-5)', data: data.moodLevels, backgroundColor: '#10B98190', borderColor: '#10B981', borderWidth: 1 },
                    { label: 'Stress (1-10)', data: data.stressLevels, backgroundColor: '#EF444490', borderColor: '#EF4444', borderWidth: 1 },
                ],
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 10 } } },
        });
        return () => { if(chartInstance.current) chartInstance.current.destroy(); };
    }, [data]);

    return <canvas ref={chartRef} />;
};

// --- Assessments View & Brain Age Game ---
const AssessmentsView = ({ onSave, goToDashboard }) => {
    const handleChallengeComplete = (scores) => {
        onSave('reactionScores', scores.reaction);
        onSave('memoryScores', scores.memory);
        onSave('mathScores', scores.math);
    };

    return (
        <ViewContainer title="Daily Assessments" subtitle="Complete the Brain Age Challenge to track your cognitive performance.">
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-md flex flex-col items-center text-center max-w-lg mx-auto">
                <BrainAgeChallenge onChallengeComplete={handleChallengeComplete} onGoToDashboard={goToDashboard} />
            </div>
        </ViewContainer>
    );
};

const BrainAgeChallenge = ({ onChallengeComplete, onGoToDashboard }) => {
    const [gameState, setGameState] = useState('start'); // start, reaction, memory, math, results
    const [currentScores, setCurrentScores] = useState({ reaction: 0, memory: 0, math: 0 });

    const handleGameStart = () => {
        setCurrentScores({ reaction: 0, memory: 0, math: 0 });
        setGameState('reaction');
    };

    const handleReactionComplete = (reactionTime) => { setCurrentScores(s => ({...s, reaction: reactionTime})); setGameState('memory'); };
    const handleMemoryComplete = (digits) => { setCurrentScores(s => ({...s, memory: digits})); setGameState('math'); };
    const handleMathComplete = (mathTime) => { 
        const finalScores = {...currentScores, math: mathTime, reaction: currentScores.reaction};
        setCurrentScores(finalScores);
        onChallengeComplete(finalScores);
        setGameState('results');
    };
    
    const handlePlayAgain = () => setGameState('start');

    switch(gameState) {
        case 'reaction': return <GameReactionTest onComplete={handleReactionComplete} />;
        case 'memory': return <GameMemoryTest onComplete={handleMemoryComplete} />;
        case 'math': return <GameMathTest onComplete={handleMathComplete} />;
        case 'results': return <GameResultsScreen scores={currentScores} onPlayAgain={handlePlayAgain} onGoToDashboard={onGoToDashboard} />;
        case 'start':
        default: return <GameWelcomeScreen onStart={handleGameStart} />;
    }
};

const GameWelcomeScreen = ({ onStart }) => (
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

const GameReactionTest = ({ onComplete }) => {
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
            setResults(prev => [...prev, endTime - startTime]);
            setStatus('waiting');
        } else if (status === 'ready') {
            setStatus('tooSoon');
            setTimeout(() => { setStatus('waiting'); setResults(prev => [...prev]); }, 1500);
        }
    };
    const getBackgroundColor = () => status === 'ready' ? 'bg-red-500' : status === 'go' ? 'bg-green-500' : status === 'tooSoon' ? 'bg-yellow-500' : 'bg-blue-500';
    const getMessage = () => status === 'ready' ? '...Wait for Green' : status === 'go' ? 'Click Now!' : status === 'tooSoon' ? 'Too Soon!' : `Get Ready... Round ${results.length + 1}/${REACTION_TEST_ROUNDS}`;

    return (
        <div className="text-center w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">⚡️ Reaction Test</h2>
            <div onClick={handleClick} className={`w-full h-64 rounded-lg flex items-center justify-center text-white text-3xl font-bold cursor-pointer transition-colors ${getBackgroundColor()}`}>
                {getMessage()}
            </div>
            <div className="mt-4"><p className="font-semibold">Your Times:</p><p className="text-gray-600 h-6">{results.map(r => `${Math.round(r)}ms`).join(', ')}</p></div>
        </div>
    );
};

const GameMemoryTest = ({ onComplete }) => {
    const [level, setLevel] = useState(MEMORY_START_LEVEL);
    const [sequence, setSequence] = useState('');
    const [userInput, setUserInput] = useState('');
    const [phase, setPhase] = useState('showing'); // showing, entering, failed

    useEffect(() => {
        setPhase('showing');
        let newSequence = Array.from({length: level}, () => getRandomInt(0, 9)).join('');
        setSequence(newSequence);
        const timer = setTimeout(() => setPhase('entering'), level * 600 + 1000);
        return () => clearTimeout(timer);
    }, [level]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userInput === sequence) { setUserInput(''); setLevel(prev => prev + 1); }
        else { setPhase('failed'); setTimeout(() => onComplete(level - 1), 2000); }
    };
    
    if (phase === 'failed') return (<div className="text-center space-y-4"><h2 className="text-2xl font-bold text-gray-800">🧠 Number Memory</h2><p className="text-xl text-red-500">Incorrect! The number was {sequence}.</p><p>You remembered {level - 1} digits correctly.</p></div>);

    return (
        <div className="text-center space-y-4 w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🧠 Number Memory</h2><p>Remember {level} digits...</p>
            <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                {phase === 'showing' ? <p className="text-4xl font-mono tracking-widest">{sequence}</p> : (<form onSubmit={handleSubmit}><input type="tel" value={userInput} onChange={(e) => setUserInput(e.target.value)} autoFocus className="w-full text-center text-4xl bg-transparent focus:outline-none"/></form>)}
            </div>
        </div>
    );
};

const GameMathTest = ({ onComplete }) => {
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
        <div className="text-center space-y-4 w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🧮 Quick Calculation</h2><p>Problem {currentProblem + 1} of {MATH_TEST_ROUNDS}</p>
            <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center"><p className="text-5xl font-mono">{problem.num1} + {problem.num2}</p></div>
            <form onSubmit={handleSubmit}><input type="tel" value={userInput} onChange={(e) => setUserInput(e.target.value)} autoFocus className="w-full text-center text-4xl p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/></form>
        </div>
    );
};

const GameResultsScreen = ({ scores, onPlayAgain, onGoToDashboard }) => {
    const brainAge = useMemo(() => {
        const reactionScore = (scores.reaction - 250) / 10;
        const memoryScore = (6 - scores.memory) * 3;
        const mathScore = (scores.math - 2000) / 200;
        const finalAge = BASE_BRAIN_AGE + reactionScore + memoryScore + mathScore;
        return Math.max(18, Math.round(finalAge));
    }, [scores]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="assessment-results">
            <div className="text-center printable-content">
                <h2 className="text-3xl font-bold text-gray-800">Today's Results</h2>
                <div className="mt-6 text-5xl font-bold text-indigo-600">{brainAge}</div>
                <p className="text-lg text-gray-600">is your estimated Brain Age!</p>
                <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-2">Recent Assessment Scores:</h3>
                <ul className="text-left list-disc list-inside mt-4 text-gray-600 inline-block">
                    <li>Avg Reaction: {Math.round(scores.reaction)}ms</li>
                    <li>Memory Score: {scores.memory} digits</li>
                    <li>Avg Math Time: {Math.round(scores.math)}ms</li>
                </ul>
            </div>
            <div className="mt-8 flex flex-col gap-3 no-print">
                <button onClick={onGoToDashboard} className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700">
                    Go to Dashboard
                </button>
                <div className="flex gap-3">
                     <button onClick={onPlayAgain} className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700">
                        Play Again
                    </button>
                    <button onClick={handlePrint} className="w-full bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-gray-600">
                        Print PDF
                    </button>
                </div>
            </div>
            <style>{`
              @media print {
                body * { visibility: hidden; }
                .assessment-results, .assessment-results * { visibility: visible; }
                .assessment-results { position: absolute; left: 0; top: 0; width: 100%; padding: 2rem; }
                .no-print, .no-print * { display: none !important; }
              }
            `}</style>
        </div>
    );
};


// --- Journal View ---
const JournalView = ({ onSave }) => {
    const [mood, setMood] = useState(3);
    const [stress, setStress] = useState(5);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(mood, stress);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <ViewContainer title="Daily Journal" subtitle="Log your mood and stress to find patterns.">
            <div className="max-w-md mx-auto bg-white/50 backdrop-blur-sm p-8 rounded-xl shadow-md mb-8">
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-lg font-semibold mb-2">How are you feeling today?</label>
                        <div className="flex justify-around text-4xl">
                            {[1, 2, 3, 4, 5].map(val => (
                                <span key={val} onClick={() => setMood(val)} className={`cursor-pointer transition ${mood === val ? 'opacity-100 scale-125' : 'opacity-50 hover:opacity-100'}`}>
                                    { {1: '😞', 2: '😐', 3: '😊', 4: '😄', 5: '🤩'}[val] }
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-lg font-semibold mb-2">Stress Level: <span className="font-bold text-blue-500">{stress}</span></label>
                        <input type="range" min="1" max="10" value={stress} onChange={e => setStress(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div className="text-center">
                        <button type="submit" className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition w-full">Save Today's Log</button>
                        {success && <p className="text-green-500 mt-4 font-semibold">Your log for today has been saved!</p>}
                    </div>
                </form>
            </div>
            <div className="max-w-md mx-auto bg-white/50 backdrop-blur-sm p-8 rounded-xl shadow-md">
                <MindfulMoment />
            </div>
        </ViewContainer>
    );
};

const MindfulMoment = () => {
    const [isActive, setIsActive] = useState(false);

    return (
        <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Mindful Moment</h3>
            <p className="text-gray-600 mb-4">Feeling stressed? Take a moment to focus on your breath.</p>
            <div className="flex justify-center items-center h-48">
                <div className={`breathing-circle ${isActive ? 'active' : ''}`}>
                    <span className="breathing-text">{isActive ? '' : 'Start'}</span>
                </div>
            </div>
            <button 
                onClick={() => setIsActive(!isActive)}
                className="mt-4 w-full bg-teal-500 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-teal-600 transition"
            >
                {isActive ? 'Stop' : 'Begin Breathing Exercise'}
            </button>
            <style>{`
                .breathing-circle {
                    width: 100px;
                    height: 100px;
                    background-color: #14B8A6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 4s ease-in-out;
                    position: relative;
                }
                .breathing-circle.active {
                    animation: breath 8s ease-in-out infinite;
                }
                .breathing-circle .breathing-text {
                     transition: opacity 0.5s;
                }
                .breathing-circle.active .breathing-text {
                    opacity: 0;
                }
                .breathing-circle::before {
                    content: 'Breathe In';
                    position: absolute;
                    opacity: 0;
                    transition: opacity 1s ease-in-out;
                    animation: text-in 8s ease-in-out infinite;
                    animation-play-state: paused;
                }
                 .breathing-circle.active::before {
                    animation-play-state: running;
                 }
                 .breathing-circle::after {
                    content: 'Breathe Out';
                    position: absolute;
                    opacity: 0;
                    transition: opacity 1s ease-in-out 4s;
                    animation: text-out 8s ease-in-out infinite;
                    animation-play-state: paused;
                }
                .breathing-circle.active::after {
                    animation-play-state: running;
                }

                @keyframes breath {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.5); }
                    100% { transform: scale(1); }
                }
                @keyframes text-in {
                    0% { opacity: 0; }
                    25% { opacity: 1; }
                    50% { opacity: 0; }
                    100% { opacity: 0; }
                }
                 @keyframes text-out {
                    0% { opacity: 0; }
                    50% { opacity: 0; }
                    75% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};


// --- Insights View ---
const InsightsView = ({ userData }) => {
    const [report, setReport] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([{ role: 'ai', text: "Hello! I'm your Cognitive Coach. How can I help?" }]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatWindowRef = useRef(null);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const generateReport = async () => {
        setReportLoading(true);
        setReport('');
        const prompt = `Based on the user's recent cognitive and well-being data, provide a concise, single-paragraph summary.
        - Reaction times (ms, lower is better): ${userData.reactionScores.join(', ')}
        - Memory scores (digits, higher is better): ${userData.memoryScores.join(', ')}
        - Math times (ms, lower is better): ${userData.mathScores.join(', ')}
        - Moods (1-5, higher is better): ${userData.moodLevels.join(', ')}
        - Stress levels (1-10, lower is better): ${userData.stressLevels.join(', ')}
        Focus on overall trends and correlations. Offer one actionable piece of advice. Keep the tone calm, professional, and supportive.`;

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                setReport("API Key not found. Please set it up in your environment file.");
                setReportLoading(false);
                return;
            }
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: "Act as a professional data analyst and cognitive health specialist." }] },
            };
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate a report at this time.';
            setReport(generatedText);
        } catch (error) {
            console.error("Error generating report:", error);
            setReport('An error occurred. Please check your connection and try again.');
        } finally {
            setReportLoading(false);
        }
    };

    const handleChatSend = async () => {
        if (!chatInput.trim() || chatLoading) return;

        const newUserMessage = { role: 'user', text: chatInput };
        const updatedChatHistory = [...chatHistory, newUserMessage];

        setChatHistory(updatedChatHistory);
        setChatInput('');
        setChatLoading(true);

        const historyForApi = updatedChatHistory.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                setChatHistory(prev => [...prev, { role: 'ai', text: "API Key not configured. Please ask the developer to set it up." }]);
                setChatLoading(false);
                return;
            }
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = {
                contents: historyForApi,
                systemInstruction: { parts: [{ text: "You are a friendly and supportive Cognitive Coach. Provide helpful tips and answer questions related to brain health, memory, focus, and stress management." }] },
            };
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorResult = await response.json();
                console.error("API Error:", errorResult);
                const aiErrorResponse = errorResult?.error?.message || "Sorry, I encountered an error. Please try again.";
                setChatHistory(prev => [...prev, { role: 'ai', text: aiErrorResponse }]);
            } else {
                 const result = await response.json();
                const aiResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that. Please try again.";
                setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
            }

        } catch (error) {
            console.error("Error with chat API:", error);
            setChatHistory(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting. Please try again later." }]);
        } finally {
            setChatLoading(false);
        }
    };


    return (
        <ViewContainer title="Actionable Insights" subtitle="Personalized recommendations and insights based on your data.">
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4">✨ Personalized Report</h3>
                {reportLoading ? (
                    <p className="text-gray-600">Generating your report...</p>
                ) : (
                    <p className="text-gray-600 mb-4">{report || "Click below to generate a report based on your recent activity."}</p>
                )}
                <button onClick={generateReport} disabled={reportLoading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition w-full disabled:opacity-50">
                    {reportLoading ? "Generating..." : "✨ Generate Report"}
                </button>
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-md">
                 <h3 className="text-xl font-semibold mb-4">✨ Cognitive Coach</h3>
                <div ref={chatWindowRef} className="h-80 overflow-y-scroll flex flex-col p-4 bg-gray-100 rounded-lg mb-4 space-y-2">
                     {chatHistory.map((msg, index) => (
                         <div key={index} className={`chat-message p-3 rounded-lg max-w-[85%] ${msg.role === 'ai' ? 'self-start bg-gray-200 text-gray-800' : 'self-end bg-blue-500 text-white'}`}>
                            {msg.text}
                         </div>
                     ))}
                     {chatLoading && <div className="self-start bg-gray-200 text-gray-800 p-3 rounded-lg">...</div>}
                </div>
                <div className="flex items-center">
                    <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                        placeholder="Ask for cognitive tips..." 
                        className="flex-grow bg-white border border-gray-300 rounded-lg px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleChatSend} disabled={chatLoading} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50">Send</button>
                </div>
            </div>
        </ViewContainer>
    );
};

