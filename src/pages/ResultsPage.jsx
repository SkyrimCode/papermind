import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import ResultCard from '../components/ResultCard';
import useQuizStore from '../store/quizStore';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Trophy, RotateCcw } from 'lucide-react';

const ResultsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isQuizSubmitted, score, results, resetQuiz, currentQuizId, userAnswers } = useQuizStore();

  useEffect(() => {
    if (!isQuizSubmitted || !score) {
      navigate('/');
    }
  }, [isQuizSubmitted, score, navigate]);

  useEffect(() => {
    const saveAttempt = async () => {
      if (isQuizSubmitted && score && user && currentQuizId) {
        try {
          // Get violation count from localStorage
          const violationCount = parseInt(localStorage.getItem('quizViolationCount') || '0', 10);
          
          await addDoc(collection(db, 'attempts'), {
            userId: user.uid,
            userName: user.displayName,
            userEmail: user.email,
            quizId: currentQuizId,
            answers: userAnswers,
            score: {
              correct: score.correct,
              total: score.total,
              earnedMarks: score.earnedMarks,
              totalMarks: score.totalMarks,
              percentage: parseFloat(score.percentage),
            },
            violations: violationCount,
            status: 'completed',
            attemptedAt: new Date().toISOString(),
          });
          
          // Clear violation count after saving
          localStorage.removeItem('quizViolationCount');
        } catch {
          // Error saving attempt
        }
      }
    };
    
    saveAttempt();
  }, [isQuizSubmitted, score, user, currentQuizId, userAnswers]);

  useEffect(() => {
    // Scroll to top when results page loads
    window.scrollTo(0, 0);
    
    // Trigger confetti if score is above 90%
    if (score && parseFloat(score.percentage) >= 90) {
      // Advanced gorgeous confetti effect
      const duration = 5000;
      const animationEnd = Date.now() + duration;
      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      // Create custom ribbon shape
      const ribbon = confetti.shapeFromPath({
        path: 'M0 0 L20 0 L18 10 L2 10 Z',
        matrix: [1, 0, 0, 1, -10, -5]
      });

      // Initial burst - Firework style from center with ribbons
      confetti({
        particleCount: 150,
        spread: 360,
        startVelocity: 45,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'],
        shapes: ['circle', 'square', ribbon],
        scalar: 1.2,
        zIndex: 10000,
        flat: false,
      });

      // Side cannons with realistic physics and ribbons
      const shootConfetti = (side) => {
        const angle = side === 'left' ? 60 : 120;
        const x = side === 'left' ? 0 : 1;
        
        confetti({
          particleCount: 80,
          angle: angle,
          spread: 55,
          origin: { x: x, y: 0.8 },
          colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'],
          startVelocity: 55,
          gravity: 1.2,
          scalar: 1.3,
          drift: side === 'left' ? 1 : -1,
          ticks: 200,
          shapes: [ribbon, 'circle', 'square'],
          flat: false,
          zIndex: 10000,
        });
      };

      // Continuous confetti rain with multiple colors
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 30;

        // Rain from top with ribbons
        confetti({
          particleCount,
          startVelocity: 0,
          ticks: 200,
          origin: { x: randomInRange(0.1, 0.9), y: 0 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
          shapes: ['circle', 'square', ribbon],
          gravity: randomInRange(0.4, 0.6),
          scalar: randomInRange(0.8, 1.2),
          drift: randomInRange(-0.5, 0.5),
          flat: false,
          zIndex: 10000,
        });

        // Sparkles
        if (Math.random() > 0.7) {
          confetti({
            particleCount: 20,
            spread: 360,
            startVelocity: randomInRange(15, 25),
            origin: { x: randomInRange(0.2, 0.8), y: randomInRange(0.3, 0.7) },
            colors: ['#FFD700', '#FFF'],
            shapes: ['circle'],
            scalar: 0.6,
            ticks: 100,
            zIndex: 10000,
          });
        }
      }, 150);

      // Side cannons fire multiple times
      setTimeout(() => shootConfetti('left'), 200);
      setTimeout(() => shootConfetti('right'), 200);
      setTimeout(() => shootConfetti('left'), 800);
      setTimeout(() => shootConfetti('right'), 800);
      setTimeout(() => shootConfetti('left'), 1400);
      setTimeout(() => shootConfetti('right'), 1400);

      // Final burst with ribbons
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 180,
          startVelocity: 60,
          origin: { x: 0.5, y: 0.8 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'],
          scalar: 1.5,
          gravity: 0.8,
          ticks: 300,
          shapes: [ribbon, 'circle', 'square'],
          flat: false,
          zIndex: 10000,
        });
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [score]);

  const handleRetakeQuiz = () => {
    resetQuiz();
    navigate('/upload');
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: '#10b981' };
    if (percentage >= 80) return { grade: 'A', color: '#10b981' };
    if (percentage >= 70) return { grade: 'B', color: '#3b82f6' };
    if (percentage >= 60) return { grade: 'C', color: '#f59e0b' };
    if (percentage >= 50) return { grade: 'D', color: '#f97316' };
    return { grade: 'F', color: '#ef4444' };
  };

  if (!score || !results) return null;

  const gradeInfo = getGrade(parseFloat(score.percentage));
  
  // Calculate attempted and not attempted counts
  const notAttemptedCount = results.filter(r => !r.isAttempted).length;
  const incorrectCount = results.filter(r => r.isAttempted && !r.isCorrect).length;

  return (
    <div className="page-container results-page-container">
      <div className="results-content">
        <div className="results-header">
          <Trophy size={48} />
          <h1>Quiz Results</h1>
        </div>

        <div className="score-summary">
          <div className="score-circle" style={{ borderColor: gradeInfo.color }}>
            <div className="grade" style={{ color: gradeInfo.color }}>
              {gradeInfo.grade}
            </div>
            <div className="percentage">{score.percentage}%</div>
          </div>
          <div className="score-details">
            <div className="score-item">
              <span className="label">Marks Obtained:</span>
              <span className="value" style={{ color: score.earnedMarks >= 0 ? '#10b981' : '#ef4444' }}>
                {score.earnedMarks} / {score.totalMarks}
              </span>
            </div>
            <div className="score-item">
              <span className="label">Correct Answers:</span>
              <span className="value correct">{score.correct}</span>
            </div>
            <div className="score-item">
              <span className="label">Incorrect Answers:</span>
              <span className="value incorrect">
                {incorrectCount}
              </span>
            </div>
            <div className="score-item">
              <span className="label">Not Attempted:</span>
              <span className="value" style={{ color: '#f59e0b' }}>
                {notAttemptedCount}
              </span>
            </div>
            <div className="score-item">
              <span className="label">Total Questions:</span>
              <span className="value">{score.total}</span>
            </div>
          </div>
        </div>

        <div className="results-list">
          <h2>Detailed Results</h2>
          {results.map((result) => (
            <ResultCard key={result.questionId} result={result} />
          ))}
        </div>

        <div className="results-actions">
          <button className="action-button secondary" onClick={handleRetakeQuiz}>
            <RotateCcw size={20} />
            Take New Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
