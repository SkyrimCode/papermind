import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
            status: 'completed',
            attemptedAt: new Date().toISOString(),
          });
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
  }, []);

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
