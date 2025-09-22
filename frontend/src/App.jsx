import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- Configuration ---
const BASE_BRAIN_AGE = 20;
const REACTION_TEST_ROUNDS = 5;
const MATH_TEST_ROUNDS = 7;
const MEMORY_START_LEVEL = 3;
const MAX_ASSESSMENTS_SAVED = 5;

// --- Helper Functions & Hooks ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };
    return [storedValue, setValue];
};

const useDarkMode = () => {
    const [isDark, setIsDark] = useLocalStorage('brainAge-darkMode', false);
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.toggle('dark', isDark);
    }, [isDark]);
    return [isDark, setIsDark];
};


// --- SVG Icons ---
const BrainCircuitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0 0-3.54 19.54" /><path d="M12 22a10 10 0 0 1-3.54-19.54" />
        <path d="M2 12h2" /><path d="M20 12h2" /><path d="M12 2v2" /><path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" /><path d="M4.93 19.07l1.41-1.41" />
        <path d="M17.66 6.34l1.41-1.41" /><path d="M12 8a4 4 0 1 0 4 4" />
    </svg>
);
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const SparkleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2z"/></svg>;


// --- Game Components ---

const ReactionTest = ({ onComplete }) => {
    const [status, setStatus] = useState('waiting');
    const [startTime, setStartTime] = useState(0);
    const [results, setResults] = useState([]);

    const runTest = useCallback(() => {
        setStatus('ready');
        setTimeout(() => {
            if (document.visibilityState === 'visible') {
                setStatus('go');
                setStartTime(Date.now());
            }
        }, getRandomInt(1000, 3000));
    }, []);

    useEffect(() => {
        let timer;
        if (results.length < REACTION_TEST_ROUNDS) {
            timer = setTimeout(runTest, 1500);
        } else {
            const validResults = results.filter(r => r > 0);
            const avgTime = validResults.length > 0 ? validResults.reduce((a, b) => a + b, 0) / validResults.length : 0;
            onComplete(avgTime);
        }
        return () => clearTimeout(timer);
    }, [results, runTest, onComplete]);

    const handleClick = () => {
        if (status === 'go') {
            setResults(prev => [...prev, Date.now() - startTime]);
            setStatus('waiting');
        } else if (status === 'ready') {
            setStatus('tooSoon');
            setTimeout(() => {
                setResults(prev => [...prev, -1]); // Penalize for early click
                setStatus('waiting');
            }, 1500);
        }
    };

    const getUIState = () => {
        switch (status) {
            case 'ready': return { className: 'reaction-box-ready', text: '...Wait for Green' };
            case 'go': return { className: 'reaction-box-go', text: 'Click Now!' };
            case 'tooSoon': return { className: 'reaction-box-too-soon', text: 'Too Soon!' };
            default: return { className: 'reaction-box-waiting', text: `Round ${results.length + 1}` };
        }
    };

    const { className, text } = getUIState();

    return (
        <div className="test-container animate-fade-in">
            <h2 className="test-title">⚡️ Reaction Test</h2>
            <div onClick={handleClick} className={`reaction-box ${className}`}>
                {text}
            </div>
            <div className="test-footer">
                <p className="test-footer-label">Your Times:</p>
                <p className="test-footer-value">{results.map(r => r > 0 ? `${r}ms` : 'X').join(', ')}</p>
            </div>
        </div>
    );
};

const MemoryTest = ({ onComplete }) => {
    const [level, setLevel] = useState(MEMORY_START_LEVEL);
    const [sequence, setSequence] = useState('');
    const [userInput, setUserInput] = useState('');
    const [phase, setPhase] = useState('showing');
    const [isWrong, setIsWrong] = useState(false);

    useEffect(() => {
        setPhase('showing');
        setSequence(Array.from({ length: level }, () => getRandomInt(0, 9)).join(''));
        const timer = setTimeout(() => setPhase('entering'), level * 600 + 500);
        return () => clearTimeout(timer);
    }, [level]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userInput === sequence) {
            setUserInput('');
            setLevel(prev => prev + 1);
        } else {
            setIsWrong(true);
            setTimeout(() => {
                setPhase('failed');
                setTimeout(() => onComplete(level - 1), 2000);
            }, 500);
        }
    };

    if (phase === 'failed') {
        return (
            <div className="test-container animate-fade-in">
                <h2 className="test-title">🧠 Number Memory</h2>
                <p className="test-fail-message">Incorrect! The number was {sequence}.</p>
                <p className="test-summary">You remembered <span className="highlight">{level - 1}</span> digits correctly.</p>
            </div>
        );
    }
    
    const inputClasses = `test-input-field ${isWrong ? 'animate-shake' : ''}`;

    return (
        <div className="test-container animate-fade-in">
            <h2 className="test-title">🧠 Number Memory</h2>
            <p className="test-instruction">Remember {level} digits...</p>
            <div className="display-box">
                {phase === 'showing' ? (
                    <p className="sequence-text">{sequence}</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input type="tel" value={userInput} onChange={(e) => setUserInput(e.target.value)} autoFocus className={inputClasses} />
                    </form>
                )}
            </div>
        </div>
    );
};

const MathTest = ({ onComplete }) => {
    const [problems, setProblems] = useState([]);
    const [current, setCurrent] = useState(0);
    const [input, setInput] = useState('');
    const [startTime, setStartTime] = useState(0);
    const [isWrong, setIsWrong] = useState(false);

    useEffect(() => {
        setProblems(Array.from({ length: MATH_TEST_ROUNDS }, () => {
            const num1 = getRandomInt(5, 25);
            const num2 = getRandomInt(5, 25);
            return { num1, num2, answer: num1 + num2 };
        }));
        setStartTime(Date.now());
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (parseInt(input) === problems[current]?.answer) {
            const timeTaken = Date.now() - startTime;
            const nextProblem = current + 1;
            
            const newProblems = [...problems];
            newProblems[current].time = timeTaken;
            setProblems(newProblems);

            if (nextProblem < MATH_TEST_ROUNDS) {
                setCurrent(nextProblem);
                setInput('');
                setStartTime(Date.now());
            } else {
                const totalTime = newProblems.reduce((acc, p) => acc + (p.time || 0), 0);
                onComplete(totalTime / MATH_TEST_ROUNDS);
            }
        } else {
            setIsWrong(true);
            setTimeout(() => setIsWrong(false), 500);
        }
    };
    
    if (problems.length === 0) return <div>Loading...</div>;
    const problem = problems[current];
    const inputClasses = `test-input-bordered ${isWrong ? 'animate-shake' : ''}`;

    return (
        <div className="test-container animate-fade-in">
            <h2 className="test-title">🧮 Quick Calculation</h2>
            <p className="test-instruction">Problem {current + 1} of {MATH_TEST_ROUNDS}</p>
            <div className="display-box">
                <p className="problem-text">{problem.num1} + {problem.num2}</p>
            </div>
            <form onSubmit={handleSubmit}>
                <input type="tel" value={input} onChange={(e) => setInput(e.target.value)} autoFocus className={inputClasses} />
            </form>
        </div>
    );
};

const ResultsScreen = ({ scores, onRestart }) => {
    const [aiFeedback, setAiFeedback] = useState('');
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

    const brainAge = useMemo(() => {
        const reactionScore = Math.max(0, (scores.reaction - 250) / 10);
        const memoryScore = Math.max(0, (6 - scores.memory) * 3);
        const mathScore = Math.max(0, (scores.math - 2000) / 200);
        return Math.max(18, Math.round(BASE_BRAIN_AGE + reactionScore + memoryScore + mathScore));
    }, [scores]);

    useEffect(() => {
        // Save assessment to local storage
        const assessments = JSON.parse(localStorage.getItem('brainAge-assessments')) || [];
        const newAssessment = { ...scores, brainAge, date: new Date().toISOString() };
        const updatedAssessments = [newAssessment, ...assessments].slice(0, MAX_ASSESSMENTS_SAVED);
        localStorage.setItem('brainAge-assessments', JSON.stringify(updatedAssessments));
    }, [scores, brainAge]);

    const generateAiFeedback = useCallback(async () => {
        setIsGeneratingFeedback(true);
        setAiFeedback('');

        const systemPrompt = "You are a friendly and encouraging brain training coach named 'Synapse'. Your goal is to provide positive and actionable feedback.";
        const userQuery = `A user just completed a brain age assessment. Their final calculated Brain Age is ${brainAge}. Here are their detailed scores:
- Average Reaction Time: ${scores.reaction.toFixed(0)} ms (lower is better)
- Digits Remembered: ${scores.memory} (higher is better)
- Average Calculation Speed: ${(scores.math / 1000).toFixed(2)}s (lower is better)

Write a short, personalized, one-paragraph summary (2-3 sentences) of their performance. Start with "Hello from Synapse!". Offer one simple, actionable tip for improvement based on their weakest score. Address the user directly. Be positive and motivating, but keep the analysis concise.`;

        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                setAiFeedback(text);
            } else {
                setAiFeedback("Sorry, I couldn't generate feedback this time. Please try again!");
            }
        } catch (error) {
            console.error("Gemini API call failed:", error);
            setAiFeedback("There was an error getting your feedback. Check the console for details.");
        } finally {
            setIsGeneratingFeedback(false);
        }
    }, [scores, brainAge]);

     useEffect(() => {
        generateAiFeedback();
    }, [generateAiFeedback]);

    return (
        <div className="test-container animate-fade-in">
            <h2 className="results-title">Your Results</h2>
            <div className="results-age">{brainAge}</div>
            <p className="results-subtitle">is your estimated Brain Age!</p>
            
            <div className="results-breakdown">
                {[
                    { label: '⚡️ Avg. Reaction Time', value: `${scores.reaction.toFixed(0)} ms` },
                    { label: '🧠 Digits Remembered', value: scores.memory },
                    { label: '🧮 Avg. Calculation Speed', value: `${(scores.math / 1000).toFixed(2)}s` }
                ].map(item => (
                    <div key={item.label} className="result-item">
                        <p className="result-item-label">{item.label}</p>
                        <p className="result-item-value">{item.value}</p>
                    </div>
                ))}
            </div>

            <div className="ai-feedback-card">
                <h3 className="ai-feedback-title">
                    <SparkleIcon /> Your AI Coach
                </h3>
                {isGeneratingFeedback ? (
                    <div className="skeleton-loader">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line"></div>
                    </div>
                ) : (
                    <p className="ai-feedback-text">{aiFeedback}</p>
                )}
            </div>

            <p className="disclaimer">Disclaimer: This is a game for entertainment purposes only.</p>
            <button onClick={onRestart} className="primary-button">
                Back to Dashboard
            </button>
        </div>
    );
};

const ChallengeFlow = ({ onComplete }) => {
    const [step, setStep] = useState('reaction');
    const [scores, setScores] = useState({ reaction: 0, memory: 0, math: 0 });

    const components = {
        reaction: <ReactionTest onComplete={r => { setScores(s => ({ ...s, reaction: r })); setStep('memory'); }} />,
        memory: <MemoryTest onComplete={m => { setScores(s => ({ ...s, memory: m })); setStep('math'); }} />,
        math: <MathTest onComplete={m => { setScores(s => ({ ...s, math: m })); setStep('results'); }} />,
        results: <ResultsScreen scores={scores} onRestart={onComplete} />
    };

    return <div className="challenge-flow">{components[step]}</div>;
};

const Dashboard = ({ onStartChallenge }) => {
    const [assessments, setAssessments] = useLocalStorage('brainAge-assessments', []);
    const [isDark, setIsDark] = useDarkMode();

    const formatDate = (isoString) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(isoString));

    return (
        <div className="dashboard animate-fade-in">
            <header className="dashboard-header">
                <div className="header-title-group">
                    <BrainCircuitIcon />
                    <h1 className="header-title">Brain Age</h1>
                </div>
                <button onClick={() => setIsDark(!isDark)} className="dark-mode-toggle">
                    {isDark ? <SunIcon /> : <MoonIcon />}
                </button>
            </header>
            
            <div className="start-challenge-card">
                <h2 className="start-challenge-title">Ready for a mental workout?</h2>
                <p className="start-challenge-subtitle">Test your cognitive skills in just a few minutes.</p>
                <button onClick={onStartChallenge} className="start-challenge-button">
                    Start New Assessment
                </button>
            </div>

            <div>
                <h3 className="section-title">Recent Assessments</h3>
                {assessments.length > 0 ? (
                    <div className="assessment-list">
                        {assessments.map((item, index) => (
                            <div key={index} className="assessment-item">
                                <div>
                                    <p className="assessment-item-label">Brain Age: <span className="highlight">{item.brainAge}</span></p>
                                    <p className="assessment-item-date">{formatDate(item.date)}</p>
                                </div>
                                <div className="assessment-item-age">{item.brainAge}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No assessments yet.</p>
                        <p className="empty-state-subtitle">Complete your first one to see your history!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main App Component ---
export default function App() {
    const [view, setView] = useState('dashboard'); // dashboard, challenge

    return (
        <main>
            <div className="app-container">
                {view === 'dashboard' ? (
                    <Dashboard onStartChallenge={() => setView('challenge')} />
                ) : (
                    <ChallengeFlow onComplete={() => setView('dashboard')} />
                )}
            </div>
            <style>{`
                /* --- Base & Dark Mode --- */
                :root {
                    font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
                    --light-bg: #f9fafb;
                    --dark-bg: #111827;
                    --light-text: #1f2937;
                    --dark-text: #e5e7eb;
                    --light-card: #ffffff;
                    --dark-card: rgba(31, 41, 55, 0.5);
                    --light-card-item: #f3f4f6;
                    --dark-card-item: #1f2937;
                    --light-border: #e5e7eb;
                    --dark-border: #4b5563;
                    --highlight: #6366f1;
                }
                .dark { color-scheme: dark; }
                body { margin: 0; }
                main {
                    background-color: var(--light-bg);
                    color: var(--light-text);
                    font-family: sans-serif;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    transition: background-color 0.3s, color 0.3s;
                }
                .dark main {
                    background-color: var(--dark-bg);
                    color: var(--dark-text);
                }

                /* --- App Container --- */
                .app-container {
                    width: 100%;
                    max-width: 28rem;
                    background-color: var(--light-card);
                    padding: 1.5rem;
                    border-radius: 1rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    border: 1px solid var(--light-border);
                }
                .dark .app-container {
                    background-color: var(--dark-card);
                    border-color: var(--dark-border);
                    backdrop-filter: blur(4px);
                }
                
                /* --- Dashboard --- */
                .dashboard { display: flex; flex-direction: column; gap: 1.5rem; }
                .dashboard-header { display: flex; justify-content: space-between; align-items: center; }
                .header-title-group { display: flex; align-items: center; gap: 0.75rem; }
                .header-title { font-size: 1.5rem; font-weight: bold; }
                .dark-mode-toggle { padding: 0.5rem; border-radius: 9999px; background: none; border: none; cursor: pointer; color: inherit; }
                .dark-mode-toggle:hover { background-color: rgba(0,0,0,0.1); }
                .dark .dark-mode-toggle:hover { background-color: rgba(255,255,255,0.1); }
                .start-challenge-card {
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    background-image: linear-gradient(to bottom right, #6366f1, #8b5cf6);
                    color: white;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                }
                .start-challenge-title { font-size: 1.25rem; font-weight: 600; }
                .start-challenge-subtitle { margin-top: 0.5rem; color: #ddd6fe; }
                .start-challenge-button {
                    margin-top: 1rem;
                    width: 100%;
                    background-color: white;
                    color: var(--highlight);
                    font-weight: bold;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    transition: transform 0.2s;
                }
                .start-challenge-button:hover { transform: scale(1.05); }
                .section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem; }
                .assessment-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .assessment-item {
                    background-color: var(--light-card-item);
                    padding: 1rem;
                    border-radius: 0.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .dark .assessment-item { background-color: var(--dark-card-item); }
                .assessment-item-label { font-weight: 600; }
                .assessment-item-date { font-size: 0.875rem; color: #6b7280; }
                .dark .assessment-item-date { color: #9ca3af; }
                .assessment-item-age { font-size: 1.5rem; font-weight: bold; }
                .empty-state { text-align: center; padding: 2rem 1rem; background-color: var(--light-card-item); border-radius: 0.5rem; }
                .dark .empty-state { background-color: var(--dark-card-item); }
                .empty-state-subtitle { font-size: 0.875rem; color: #6b7280; }

                /* --- Test Components --- */
                .test-container { text-align: center; display: flex; flex-direction: column; gap: 1rem; }
                .test-title { font-size: 1.5rem; font-weight: bold; }
                .test-instruction, .test-summary { color: #6b7280; }
                .dark .test-instruction, .dark .test-summary { color: #9ca3af; }
                .reaction-box {
                    width: 100%;
                    height: 16rem;
                    border-radius: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.875rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .reaction-box-waiting { background-color: #3b82f6; }
                .reaction-box-ready { background-color: #ef4444; }
                .reaction-box-go { background-color: #22c55e; }
                .reaction-box-too-soon { background-color: #f59e0b; color: #1f2937; }
                .test-footer { margin-top: 1rem; height: 2.5rem; }
                .test-footer-label { font-weight: 600; }
                .test-footer-value { color: #6b7280; height: 1.5rem; }
                .dark .test-footer-value { color: #9ca3af; }
                .display-box {
                    width: 100%;
                    height: 6rem;
                    background-color: var(--light-card-item);
                    border-radius: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .dark .display-box { background-color: #374151; }
                .sequence-text { font-size: 2.25rem; font-family: monospace; letter-spacing: 0.1em; animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .problem-text { font-size: 3rem; font-family: monospace; }
                .test-input-field { width: 100%; text-align: center; font-size: 2.25rem; background: transparent; border: none; outline: none; }
                .test-input-bordered {
                    width: 100%;
                    text-align: center;
                    font-size: 2.25rem;
                    padding: 0.75rem;
                    background: transparent;
                    border: 2px solid var(--light-border);
                    border-radius: 0.5rem;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .dark .test-input-bordered { border-color: var(--dark-border); }
                .test-input-bordered:focus { border-color: var(--highlight); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5); }
                .test-fail-message { font-size: 1.25rem; color: #ef4444; }
                .highlight { font-weight: bold; color: var(--highlight); }

                /* --- Results Screen --- */
                .results-title { font-size: 1.875rem; font-weight: bold; }
                .results-age {
                    margin-top: 1.5rem;
                    font-size: 4.5rem;
                    font-weight: bold;
                    background-image: linear-gradient(to right, #6366f1, #8b5cf6);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }
                .results-subtitle { font-size: 1.125rem; color: #6b7280; }
                .dark .results-subtitle { color: #9ca3af; }
                .results-breakdown { margin-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem; text-align: left; }
                .result-item {
                    background-color: var(--light-card-item);
                    padding: 1rem;
                    border-radius: 0.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .dark .result-item { background-color: var(--dark-card-item); }
                .result-item-label { font-weight: 600; }
                .result-item-value { font-size: 1.125rem; font-weight: bold; }
                .disclaimer { margin-top: 1.5rem; font-size: 0.75rem; color: #6b7280; }
                .dark .disclaimer { color: #9ca3af; }
                .primary-button {
                    margin-top: 1.5rem;
                    width: 100%;
                    background-color: var(--highlight);
                    color: white;
                    font-weight: 600;
                    padding: 0.75rem 1rem;
                    border: none;
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    cursor: pointer;
                    transition: background-color 0.2s, transform 0.2s;
                }
                .primary-button:hover { background-color: #4f46e5; transform: scale(1.05); }
                
                /* --- Gemini AI Feedback --- */
                .ai-feedback-card {
                    margin-top: 2rem;
                    padding: 1rem;
                    background-color: var(--light-card-item);
                    border-left: 4px solid var(--highlight);
                    border-radius: 0.5rem;
                }
                .dark .ai-feedback-card { background-color: var(--dark-card-item); }
                .ai-feedback-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    font-size: 1rem;
                    margin-bottom: 0.5rem;
                }
                .ai-feedback-text {
                    font-size: 0.9rem;
                    line-height: 1.5;
                    color: #4b5563;
                }
                .dark .ai-feedback-text { color: #d1d5db; }
                .skeleton-loader {
                    width: 100%;
                }
                .skeleton-line {
                    height: 1em;
                    background-color: #e5e7eb;
                    border-radius: 0.25rem;
                    margin-bottom: 0.5rem;
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .skeleton-line:last-child { width: 80%; }
                .dark .skeleton-line { background-color: #4b5563; }

                /* --- Animations --- */
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                @keyframes shake {
                  10%, 90% { transform: translate3d(-1px, 0, 0); }
                  20%, 80% { transform: translate3d(2px, 0, 0); }
                  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                  40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                .animate-shake {
                    animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes pulse {
                    50% { opacity: .5; }
                }
            `}</style>
        </main>
    );
}

