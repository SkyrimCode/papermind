import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import PassageCard from '../components/PassageCard';
import Modal from '../components/Modal';
import useQuizStore from '../store/quizStore';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const QuizPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    questions,
    userAnswers,
    isQuizStarted,
    timerDuration,
    currentQuizId,
    currentQuizName,
    setUserAnswer,
    submitQuiz,
    calculateScore,
  } = useQuizStore();

  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [showWarning, setShowWarning] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);

  useEffect(() => {
    if (!isQuizStarted || questions.length === 0) {
      navigate('/');
    }
  }, [isQuizStarted, questions, navigate]);

  // Enter fullscreen mode when quiz starts
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
          await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE11
          await elem.msRequestFullscreen();
        }
      } catch (error) {
        console.error('Error entering fullscreen:', error);
      }
    };

    enterFullscreen();

    // Monitor fullscreen changes
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && 
          !document.webkitFullscreenElement && 
          !document.msFullscreenElement) {
        // User exited fullscreen - show prompt to re-enter
        setShowFullscreenPrompt(true);
        setTabSwitchCount(prev => prev + 1);
      } else {
        setShowFullscreenPrompt(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      
      // Exit fullscreen on unmount
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    };
  }, []);

  // Detect tab switching and visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        setShowTabWarning(true);
        setTimeout(() => setShowTabWarning(false), 3000);
      }
    };

    const handleBlur = () => {
      setTabSwitchCount(prev => prev + 1);
      setShowTabWarning(true);
      setTimeout(() => setShowTabWarning(false), 3000);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      setShowBackModal(true);
      // Push state back to prevent navigation
      window.history.pushState(null, '', window.location.pathname);
    };

    // Push initial state
    window.history.pushState(null, '', window.location.pathname);
    
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleConfirmBack = async () => {
    // User confirmed they want to leave - mark as failed attempt
    setShowBackModal(false);
    
    // Record the failed attempt
    if (user && currentQuizId) {
      try {
        await addDoc(collection(db, 'attempts'), {
          userId: user.uid,
          userName: user.displayName,
          userEmail: user.email,
          quizId: currentQuizId,
          score: {
            correct: 0,
            total: questions.length,
            percentage: 0,
          },
          status: 'abandoned',
          attemptedAt: new Date().toISOString(),
        });
      } catch {
        // Error recording failed attempt
      }
    }
    
    navigate('/', { replace: true });
  };

  const handleSubmitClick = () => {
    setShowSubmitModal(true);
  };

  const handleSubmit = () => {
    calculateScore();
    submitQuiz();
    // Store violation count in localStorage to be saved with attempt
    localStorage.setItem('quizViolationCount', tabSwitchCount.toString());
    navigate('/results');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        
        // Show warning at 1 minute (60 seconds)
        if (prev === 60) {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = questions.length;

  const handleReenterFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
    } catch (error) {
      console.error('Error re-entering fullscreen:', error);
    }
  };

  return (
    <div className="page-container quiz-page-container">
      {showWarning && (
        <div className="timer-warning">
          <AlertTriangle size={20} />
          <span>Only 1 minute remaining!</span>
        </div>
      )}

      {showTabWarning && (
        <div className="tab-switch-warning">
          <AlertTriangle size={20} />
          <span>⚠️ Warning: Tab switching detected! ({tabSwitchCount} violations)</span>
        </div>
      )}

      {showFullscreenPrompt && (
        <div className="fullscreen-prompt-overlay">
          <div className="fullscreen-prompt">
            <AlertTriangle size={48} color="#ef4444" />
            <h2>⚠️ Fullscreen Mode Required</h2>
            <p>You have exited fullscreen mode. This has been recorded as a violation.</p>
            <p className="violation-count">Violations: {tabSwitchCount}</p>
            <button 
              className="fullscreen-reenter-button"
              onClick={handleReenterFullscreen}
            >
              Return to Fullscreen Mode
            </button>
            <p className="warning-note">You must return to fullscreen to continue the exam</p>
          </div>
        </div>
      )}
      
      <div className="quiz-content">
        <div className="timer-display">
          <Clock size={16} />
          <span>{formatTime(timeLeft)}</span>
          {tabSwitchCount > 0 && (
            <span className="violation-badge">
              ⚠️ {tabSwitchCount}
            </span>
          )}
        </div>
        
        <div className="quiz-header">
          <h1>{currentQuizName || 'Quiz Exam'}</h1>
          <div className="quiz-stats">
            <div className="stat">
              <CheckCircle size={20} />
              <span>
                {answeredCount}/{totalQuestions} Answered
              </span>
            </div>
          </div>
        </div>

        <div className="questions-container">
          {questions.map((question) => (
            <div key={question.id} style={{ width: '100%' }}>
              {question.hasPassage && <PassageCard passage={question.passage} />}
              <QuestionCard
                question={question}
                selectedAnswer={userAnswers[question.id]}
                onAnswerSelect={setUserAnswer}
              />
            </div>
          ))}
        </div>

        <div className="quiz-footer">
          <button className="submit-button" onClick={handleSubmitClick}>
            Submit Quiz
          </button>
          {answeredCount < totalQuestions && (
            <p className="warning-text">
              You have {totalQuestions - answeredCount} unanswered question(s)
            </p>
          )}
        </div>
      </div>

      <Modal
        isOpen={showBackModal}
        onClose={() => setShowBackModal(false)}
        onConfirm={handleConfirmBack}
        title="Leave Quiz?"
        message="Are you sure you want to go back? This will be marked as a failed attempt and you'll lose your progress."
        confirmText="Yes, Leave"
        cancelText="Continue Quiz"
        type="danger"
      />

      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleSubmit}
        title="Submit Quiz?"
        message={
          answeredCount < totalQuestions
            ? `You have ${totalQuestions - answeredCount} unanswered question(s). Are you sure you want to submit?`
            : "Are you sure you want to submit your quiz? You won't be able to change your answers after submission."
        }
        confirmText="Submit"
        cancelText="Review Answers"
        type="primary"
      />
    </div>
  );
};

export default QuizPage;
