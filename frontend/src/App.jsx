import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- Configuration ---
const BASE_BRAIN_AGE = 20;
const REACTION_TEST_ROUNDS = 5;
const MATH_TEST_ROUNDS = 7;
const MEMORY_START_LEVEL = 3;

// --- Helper Functions ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Game Components ---

const WelcomeScreen = ({ onStart }) => (
  <div className="text-center">
    <h2 className="text-3xl font-bold text-gray-800">Brain Age Challenge</h2>
    <p className="mt-4 text-gray-600">
      Test your cognitive skills with three quick challenges:
    </p>
    <ul className="mt-4 space-y-2 text-left inline-block">
        <li className="flex items-center"><span className="text-indigo-500 mr-2">⚡️</span> Reaction Speed</li>
        <li className="flex items-center"><span className="text-teal-500 mr-2">🧠</span> Number Memory</li>
        <li className="flex items-center"><span className="text-amber-500 mr-2">🧮</span> Quick Calculation</li>
    </ul>
    <button
      onClick={onStart}
      className="mt-8 w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
    >
      Start Challenge
    </button>
  </div>
);

const ReactionTest = ({ onComplete }) => {
    const [status, setStatus] = useState('waiting'); // waiting, ready, go, tooSoon
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
            setTimeout(runTest, 1000); // Wait 1 sec between rounds
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
            setTimeout(() => {
                setResults(prev => [...prev]); // Trigger useEffect to restart round
                setStatus('waiting');
            }, 1500);
        }
    };

    const getBackgroundColor = () => {
        switch (status) {
            case 'ready': return 'bg-red-500';
            case 'go': return 'bg-green-500';
            case 'tooSoon': return 'bg-yellow-500';
            default: return 'bg-blue-500';
        }
    };
    
    const getMessage = () => {
        switch (status) {
            case 'ready': return '...Wait for Green';
            case 'go': return 'Click Now!';
            case 'tooSoon': return 'Too Soon!';
            default: return `Get Ready... Round ${results.length + 1}/${REACTION_TEST_ROUNDS}`;
        }
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">⚡️ Reaction Test</h2>
            <div
                onClick={handleClick}
                className={`w-full h-64 rounded-lg flex items-center justify-center text-white text-3xl font-bold cursor-pointer transition-colors ${getBackgroundColor()}`}
            >
                {getMessage()}
            </div>
            <div className="mt-4">
                <p className="font-semibold">Your Times:</p>
                <p className="text-gray-600 h-6">{results.map(r => `${r}ms`).join(', ')}</p>
            </div>
        </div>
    );
};


const MemoryTest = ({ onComplete }) => {
    const [level, setLevel] = useState(MEMORY_START_LEVEL);
    const [sequence, setSequence] = useState('');
    const [userInput, setUserInput] = useState('');
    const [phase, setPhase] = useState('showing'); // showing, entering, failed

    useEffect(() => {
        setPhase('showing');
        let newSequence = '';
        for (let i = 0; i < level; i++) {
            newSequence += getRandomInt(0, 9);
        }
        setSequence(newSequence);

        const timer = setTimeout(() => {
            setPhase('entering');
        }, level * 600); // More time for longer sequences

        return () => clearTimeout(timer);
    }, [level]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userInput === sequence) {
            setUserInput('');
            setLevel(prev => prev + 1); // Next level
        } else {
            setPhase('failed');
            setTimeout(() => onComplete(level - 1), 2000);
        }
    };
    
    if (phase === 'failed') {
        return (
             <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">🧠 Number Memory</h2>
                <p className="text-xl text-red-500">Incorrect! The number was {sequence}.</p>
                <p>You remembered {level - 1} digits correctly.</p>
            </div>
        );
    }

    return (
        <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🧠 Number Memory</h2>
            <p>Remember {level} digits...</p>
            <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                {phase === 'showing' ? (
                     <p className="text-4xl font-mono tracking-widest">{sequence}</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="tel"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            autoFocus
                            className="w-full text-center text-4xl bg-transparent focus:outline-none"
                        />
                    </form>
                )}
            </div>
        </div>
    );
};

const MathTest = ({ onComplete }) => {
    const [problems, setProblems] = useState([]);
    const [currentProblem, setCurrentProblem] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [startTime, setStartTime] = useState(0);
    const [times, setTimes] = useState([]);

    useEffect(() => {
        const generatedProblems = [];
        for (let i = 0; i < MATH_TEST_ROUNDS; i++) {
            const num1 = getRandomInt(5, 20);
            const num2 = getRandomInt(5, num1); // Ensure result is positive
            generatedProblems.push({ num1, num2, answer: num1 + num2 });
        }
        setProblems(generatedProblems);
        setStartTime(Date.now());
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const problem = problems[currentProblem];
        if (parseInt(userInput) === problem.answer) {
            const newTimes = [...times, Date.now() - startTime];
            setTimes(newTimes);
            setUserInput('');
            if (currentProblem + 1 < MATH_TEST_ROUNDS) {
                setCurrentProblem(prev => prev + 1);
                setStartTime(Date.now());
            } else {
                const avgTime = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
                onComplete(avgTime);
            }
        } else {
            // Shake animation on wrong answer
        }
    };

    if (problems.length === 0) return <div>Loading...</div>;

    const problem = problems[currentProblem];

    return (
        <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🧮 Quick Calculation</h2>
            <p>Problem {currentProblem + 1} of {MATH_TEST_ROUNDS}</p>
            <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                 <p className="text-5xl font-mono">{problem.num1} + {problem.num2}</p>
            </div>
             <form onSubmit={handleSubmit}>
                <input
                    type="tel"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    autoFocus
                    className="w-full text-center text-4xl p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </form>
        </div>
    );
};

const ResultsScreen = ({ scores, onRestart }) => {
    const brainAge = useMemo(() => {
        // Fun, non-scientific formula
        const reactionScore = (scores.reaction - 250) / 10; // Baseline 250ms
        const memoryScore = (6 - scores.memory) * 3; // Baseline 6 digits
        const mathScore = (scores.math - 2000) / 200; // Baseline 2 seconds
        
        const finalAge = BASE_BRAIN_AGE + reactionScore + memoryScore + mathScore;
        return Math.max(18, Math.round(finalAge)); // Don't go below 18
    }, [scores]);

    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Your Results</h2>
            <div className="mt-6 text-5xl font-bold text-indigo-600">{brainAge}</div>
            <p className="text-lg text-gray-600">is your estimated Brain Age!</p>
            
            <div className="mt-8 space-y-4 text-left">
                <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="font-semibold">⚡️ Avg. Reaction Time:</p>
                    <p className="text-lg">{scores.reaction.toFixed(0)} ms</p>
                </div>
                 <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="font-semibold">🧠 Digits Remembered:</p>
                    <p className="text-lg">{scores.memory}</p>
                </div>
                 <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="font-semibold">🧮 Avg. Calculation Speed:</p>
                    <p className="text-lg">{(scores.math / 1000).toFixed(2)} seconds</p>
                </div>
            </div>
             <p className="mt-6 text-xs text-gray-500">Disclaimer: This is a game for entertainment and not a scientific or medical measurement.</p>
            <button
              onClick={onRestart}
              className="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none"
            >
              Play Again
            </button>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
  const [gameState, setGameState] = useState('start'); // start, reaction, memory, math, results
  const [scores, setScores] = useState({ reaction: 0, memory: 0, math: 0 });

  const handleReactionComplete = (reactionTime) => {
    setScores(prev => ({ ...prev, reaction: reactionTime }));
    setGameState('memory');
  };

  const handleMemoryComplete = (digitsRemembered) => {
    setScores(prev => ({ ...prev, memory: digitsRemembered }));
    setGameState('math');
  };

  const handleMathComplete = (avgMathTime) => {
    setScores(prev => ({ ...prev, math: avgMathTime }));
    setGameState('results');
  };
  
  const handleRestart = () => {
    setScores({ reaction: 0, memory: 0, math: 0 });
    setGameState('start');
  };

  const renderGame = () => {
    switch(gameState) {
        case 'reaction':
            return <ReactionTest onComplete={handleReactionComplete} />;
        case 'memory':
            return <MemoryTest onComplete={handleMemoryComplete} />;
        case 'math':
            return <MathTest onComplete={handleMathComplete} />;
        case 'results':
            return <ResultsScreen scores={scores} onRestart={handleRestart} />;
        case 'start':
        default:
            return <WelcomeScreen onStart={() => setGameState('reaction')} />;
    }
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex items-center justify-center p-4">
       <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-xl">
        {renderGame()}
      </div>
    </div>
  );
}

