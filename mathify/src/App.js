import React, { useState, useEffect, useCallback } from 'react';
import './App.css'; // Your existing Mathify styles

// For Google OAuth UI and credential retrieval
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Firebase imports
import { auth, db } from './Firebase'; // Your Firebase setup
import { GoogleAuthProvider as FirebaseGoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';

// **IMPORTANT**: Replace this with your actual Google Client ID.
// In a production app, use environment variables: process.env.REACT_APP_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = "264702206959-4g7sgjrtg8bj5e958q56j4qmp9qshfs4.apps.googleusercontent.com";

// Your questionsBank (ensure each question has a unique 'id')
const questionsBank = [
    {
        id: "geom_median_perimeter",
        question: "In a triangle ABC, the medians to sides AB, BC, and CA have lengths 5, 6, and 7 respectively. Find the perimeter of the triangle.",
        options: ["12", "16", "24", "30", "36"],
        answer: "24",
        explanation: "For a triangle with medians ma, mb, and mc, the relation between the sides a, b, c is: 4(ma² + mb² + mc²) = 3(a² + b² + c²). Substituting the median values and solving for the perimeter a + b + c = 24."
    },
    {
        id: "circle_chord_radius",
        question: "In a circle, a chord of length 12 is at a distance of 4 from the center. What is the radius of the circle?",
        options: ["5", "6.5", "8", "10", "13"],
        answer: "8",
        explanation: "If d is the distance from the center to the chord, c is the chord length, and r is the radius, then c/2 = √(r² - d²). So 6 = √(r² - 16), therefore r² = 36 + 16 = 64, and r = 8."
    },
    // ... Add all your questions here with unique IDs
    {
        id: "triangle_circumscribed_radius",
        question: "If the sides of a triangle are 8, 15, and 17, what is the radius of its circumscribed circle?",
        options: ["8.5", "7.5", "9", "10", "8"],
        answer: "8.5",
        explanation: "For a triangle with sides a, b, c, the radius R of the circumscribed circle is given by R = abc/(4·Area). The area using Heron's formula is 60, so R = 8·15·17/(4·60) = 8.5"
    }
];


function App() {
    const [user, setUser] = useState(null); // Firebase user object
    const [isAuthenticating, setIsAuthenticating] = useState(true); // To manage initial auth state check
    const [authMessage, setAuthMessage] = useState('');

    const [theme, setTheme] = useState('light');
    const [minutes, setMinutes] = useState(5);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [quizState, setQuizState] = useState('setup'); // 'setup', 'quiz', 'results', 'review'
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [stats, setStats] = useState({
        questionCount: 0,
        correctCount: 0,
        incorrectCount: 0,
    });
    const [usedQuestionIndices, setUsedQuestionIndices] = useState([]); // Stores used question IDs
    const [timerIntervalId, setTimerIntervalId] = useState(null);
    const [reviewData, setReviewData] = useState([]);
    const [isLoadingReview, setIsLoadingReview] = useState(false);

    // Firebase Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthenticating(false);
            if (!currentUser) {
                setQuizState('setup');
                setReviewData([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Theme initialization
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
             document.documentElement.setAttribute('data-theme', 'light'); // Default to light
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        setAuthMessage('Processing sign-in...');
        setIsAuthenticating(true);
        try {
            const idToken = credentialResponse.credential;
            const firebaseCredential = FirebaseGoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, firebaseCredential);
            // onAuthStateChanged will handle setting the user and clearing isAuthenticating
            setAuthMessage('Sign-in successful!');
        } catch (error) {
            console.error("Firebase sign-in error: ", error);
            setAuthMessage(`Sign-in failed: ${error.message}. Ensure your Google Client ID and Firebase setup are correct.`);
            setIsAuthenticating(false);
        }
    };

    const handleGoogleLoginError = () => {
        console.error("Google login error");
        setAuthMessage("Google login failed. Please try again.");
        setIsAuthenticating(false);
    };

    const handleSignOut = async () => {
        try {
            await firebaseSignOut(auth);
            // onAuthStateChanged will set user to null
            setAuthMessage('You have been logged out.');
        } catch (error) {
            console.error("Error signing out: ", error);
            setAuthMessage(`Logout failed: ${error.message}`);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getRandomQuestion = useCallback(() => {
        let availableQuestions = questionsBank.filter(q => !usedQuestionIndices.includes(q.id));
        if (availableQuestions.length === 0) {
            setUsedQuestionIndices([]);
            availableQuestions = questionsBank;
        }
        if (availableQuestions.length === 0) return null; // Should not happen if questionsBank is not empty
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const selectedQuestion = availableQuestions[randomIndex];
        setUsedQuestionIndices(prev => [...prev, selectedQuestion.id]);
        return selectedQuestion;
    }, [usedQuestionIndices]);

    const loadQuestion = useCallback(() => {
        setSelectedOption(null);
        setShowExplanation(false);
        const nextQuestion = getRandomQuestion();
        setCurrentQuestion(nextQuestion);
    }, [getRandomQuestion]);

    useEffect(() => {
        if (quizState === 'quiz' && timeRemaining > 0) {
            const intervalId = setInterval(() => setTimeRemaining(prevTime => prevTime - 1), 1000);
            setTimerIntervalId(intervalId);
            return () => clearInterval(intervalId);
        } else if (timeRemaining <= 0 && quizState === 'quiz') {
            if (timerIntervalId) clearInterval(timerIntervalId);
            setQuizState('results');
        }
    }, [quizState, timeRemaining, timerIntervalId]);

    const startQuiz = () => {
        setTimeRemaining(minutes * 60);
        setStats({ questionCount: 0, correctCount: 0, incorrectCount: 0 });
        setUsedQuestionIndices([]);
        setQuizState('quiz');
        loadQuestion();
    };

    const handleOptionSelect = (option) => {
        if (!showExplanation) setSelectedOption(option);
    };

    const submitAnswer = async () => {
        if (selectedOption === null) {
            alert('Please select an answer!');
            return;
        }
        setShowExplanation(true);
        const isCorrect = selectedOption === currentQuestion.answer;
        setStats(prev => ({
            ...prev,
            questionCount: prev.questionCount + 1,
            correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
            incorrectCount: !isCorrect ? prev.incorrectCount + 1 : prev.incorrectCount,
        }));
        if (user && currentQuestion) {
            try {
                await addDoc(collection(db, "userQuestionHistory"), {
                    userId: user.uid,
                    questionId: currentQuestion.id,
                    questionText: currentQuestion.question,
                    selectedOption: selectedOption,
                    correctAnswer: currentQuestion.answer,
                    isCorrect: isCorrect,
                    explanation: currentQuestion.explanation,
                    timestamp: serverTimestamp()
                });
            } catch (e) { console.error("Error adding document: ", e); }
        }
    };

    const loadNextQuestion = () => {
        if (timeRemaining > 0) loadQuestion();
        else setQuizState('results');
    };

    const restartQuiz = () => {
        setQuizState('setup');
        setTimeRemaining(0);
        if (timerIntervalId) clearInterval(timerIntervalId);
        setCurrentQuestion(null); setSelectedOption(null); setShowExplanation(false);
    };

    const fetchReviewData = async () => {
        if (!user) return;
        setIsLoadingReview(true); setQuizState('review');
        try {
            const q = query(collection(db, "userQuestionHistory"), where("userId", "==", user.uid), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReviewData(history);
        } catch (error) { console.error("Error fetching review data: ", error); setReviewData([]); }
        setIsLoadingReview(false);
    };

    // Render Logic
    if (isAuthenticating && GOOGLE_CLIENT_ID === "264702206959-4g7sgjrtg8bj5e958q56j4qmp9qshfs4.apps.googleusercontent.com") {
         return (
            <div style={{ padding: '20px', textAlign: 'center', background:'#fff3cd', color:'#664d03', border:'1px solid #ffc107', borderRadius:'8px', margin:'20px auto', maxWidth:'600px' }}>
                <h2>Configuration Needed</h2>
                <p>Please replace <code>"264702206959-4g7sgjrtg8bj5e958q56j4qmp9qshfs4.apps.googleusercontent.com"</code> in <code>App.js</code> with your actual Google OAuth Client ID.</p>
                <p>Also, ensure your <code>src/Firebase.js</code> is correctly set up with your Firebase project credentials.</p>
            </div>
        );
    }
    
    if (isAuthenticating) {
        return <div className="loading-fullscreen"><div className="spinner"></div><p>Loading Mathify...</p></div>;
    }

    if (!user) {
        return (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <div className="login-view">
                    <div className="login-card">
                        <h1>Mathify</h1>
                        <h3><i>NJ Math League Practice Tool</i></h3>
                        <p>Please sign in to continue.</p>
                        <GoogleLogin
                            onSuccess={handleGoogleLoginSuccess}
                            onError={handleGoogleLoginError}
                            useOneTap={false}
                            theme="outline"
                            size="large"
                        />
                        {authMessage && <p className="auth-message">{authMessage}</p>}
                    </div>
                </div>
            </GoogleOAuthProvider>
        );
    }

    return (
        // No need to wrap with GoogleOAuthProvider here again if login is the only place it's used.
        // If you plan to use other @react-oauth/google hooks/components deeper, you might wrap the whole app.
        // For now, keeping it simple as login is the entry.
        <div className="App">
            <div className="theme-toggle">
                <button id="themeToggleBtn" className="theme-btn" onClick={toggleTheme}>
                    <span className="light-icon">☀️</span> <span className="dark-icon">🌙</span>
                </button>
            </div>

            <div className="user-controls">
                <span>Welcome, {user.displayName || user.email}!</span>
                <button className="btn btn-secondary" onClick={handleSignOut}>Sign Out</button>
                {quizState !== 'review' && <button className="btn btn-secondary" onClick={fetchReviewData}>Review History</button>}
            </div>

            <h1>Mathify</h1>
            <h3><i>NJ Math League Practice Tool</i></h3>
            {authMessage && user && <p className="auth-message success">{authMessage}</p> /* Show success message after login */}


            {quizState === 'setup' && (
                <div className="container setup-container">
                    <h2>Set Your Timer and Begin</h2>
                    <div className="timer-input">
                        <label htmlFor="minutes">Minutes:</label>
                        <input type="number" id="minutes" min="1" max="60" value={minutes} onChange={(e) => setMinutes(parseInt(e.target.value))} />
                    </div>
                    <button className="btn" onClick={startQuiz}>Start Quiz</button>
                </div>
            )}

            {quizState === 'quiz' && currentQuestion && (
                <div className="container quiz-container">
                    <div className="timer-display">{formatTime(timeRemaining)}</div>
                    <div className="stats">
                        <div>Questions: <span className="stat-value">{stats.questionCount}</span></div>
                        <div>Correct: <span className="stat-value">{stats.correctCount}</span></div>
                        <div>Incorrect: <span className="stat-value">{stats.incorrectCount}</span></div>
                    </div>
                    <div className="question-container">
                        <div className="question">{currentQuestion.question}
                            {showExplanation && <div className="explanation"><strong>Explanation:</strong> {currentQuestion.explanation}</div>}
                        </div>
                        <div className="options">
                            {currentQuestion.options.map((option, index) => (
                                <div key={index}
                                    className={`option ${selectedOption === option ? 'selected' : ''} ${showExplanation && option === currentQuestion.answer ? 'correct' : ''} ${showExplanation && selectedOption === option && option !== currentQuestion.answer ? 'incorrect' : ''}`}
                                    onClick={() => handleOptionSelect(option)}>
                                    {option}
                                </div>
                            ))}
                        </div>
                    </div>
                    {!showExplanation && <button className="btn" onClick={submitAnswer} disabled={selectedOption === null}>Submit Answer</button>}
                    {showExplanation && <button className="btn" onClick={loadNextQuestion}>Next Question</button>}
                </div>
            )}

            {quizState === 'results' && (
                <div className="container results-container">
                    <h2 className="result-title">Quiz Complete!</h2>
                    <div className="results-stats">
                        {/* ... stats display ... */}
                         <div className="result-item">
                            <div className="result-value">{stats.questionCount}</div>
                            <div className="result-label">Total Questions</div>
                        </div>
                        <div className="result-item">
                            <div className="result-value">{stats.correctCount}</div>
                            <div className="result-label">Correct</div>
                        </div>
                        <div className="result-item">
                            <div className="result-value">
                                {stats.questionCount > 0 ? Math.round((stats.correctCount / stats.questionCount) * 100) : 0}%
                            </div>
                            <div className="result-label">Accuracy</div>
                        </div>
                    </div>
                    <button className="btn" onClick={restartQuiz}>Start New Quiz</button>
                    <button className="btn" onClick={fetchReviewData} style={{ marginLeft: '10px' }}>Review My History</button>
                </div>
            )}

            {quizState === 'review' && (
                <div className="container review-container">
                    <h2>Your Question History</h2>
                    <button className="btn" onClick={() => setQuizState('setup')} style={{ marginBottom: '20px' }}>Back to Setup</button>
                    {isLoadingReview && <p>Loading review data...</p>}
                    {!isLoadingReview && reviewData.length === 0 && <p>No question history found.</p>}
                    {!isLoadingReview && reviewData.map(item => (
                        <div key={item.id} className="question-container review-item" style={{ marginBottom: '20px' }}>
                            <p><strong>Question:</strong> {item.questionText}</p>
                            <p><strong>Your Answer:</strong> <span style={{ color: item.isCorrect ? 'var(--correct)' : 'var(--incorrect)' }}>{item.selectedOption}</span></p>
                            {!item.isCorrect && <p><strong>Correct Answer:</strong> {item.correctAnswer}</p>}
                            <div className="explanation" style={{marginTop:'10px'}}><strong>Explanation:</strong> {item.explanation}</div>
                            <p style={{fontSize: '0.8em', color: 'var(--text-light)', marginTop:'5px'}}>
                                Answered on: {item.timestamp?.toDate().toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <div className="footer">
                <p><i>Created by Samuel Asefa</i></p>
            </div>
        </div>
    );
}

export default App;