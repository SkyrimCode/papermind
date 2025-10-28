import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Trophy, X, Loader } from 'lucide-react';
import ResultCard from './ResultCard';

const ResultsViewer = ({ attemptId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchAttemptDetails = async () => {
      try {
        // Fetch attempt data
        const attemptDoc = await getDoc(doc(db, 'attempts', attemptId));
        if (!attemptDoc.exists()) {
          return;
        }
        
        const attemptData = { id: attemptDoc.id, ...attemptDoc.data() };
        setAttempt(attemptData);

        // Fetch quiz data
        const quizDoc = await getDoc(doc(db, 'quizzes', attemptData.quizId));
        if (!quizDoc.exists()) {
          return;
        }
        
        const quizData = quizDoc.data();
        setQuiz(quizData);

        // Build results array
        if (attemptData.answers && quizData.questions && quizData.solutions) {
          const resultsArray = quizData.questions.map((question) => {
            const solution = quizData.solutions.find(s => s.id === question.id);
            const userAnswer = attemptData.answers[question.id];
            
            let isCorrect = false;
            let isAttempted = userAnswer !== undefined && userAnswer !== null;

            if (isAttempted && solution) {
              if (Array.isArray(solution.answer)) {
                // MSQ - Multiple Select Question
                if (Array.isArray(userAnswer)) {
                  // Check if arrays are equal (order doesn't matter)
                  const sortedSolution = [...solution.answer].sort();
                  const sortedUser = [...userAnswer].sort();
                  isCorrect = JSON.stringify(sortedSolution) === JSON.stringify(sortedUser);
                } else {
                  isCorrect = false;
                }
              } else if (typeof solution.answer === 'number') {
                // NAT - Numerical Answer Type
                isCorrect = parseFloat(userAnswer) === solution.answer;
              } else {
                // MCQ - Single answer
                isCorrect = userAnswer === solution.answer;
              }
            }

            return {
              questionId: question.id,
              questionText: question.text,
              questionType: question.type,
              options: question.options,
              passage: question.passage,
              hasPassage: question.hasPassage,
              marks: question.marks || 1,
              userAnswer: userAnswer,
              correctAnswer: solution?.answer,
              explanation: solution?.explanation,
              isCorrect,
              isAttempted,
            };
          });

          setResults(resultsArray);
        }
      } catch {
        // Error fetching attempt details
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptDetails();
  }, [attemptId]);

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: '#10b981' };
    if (percentage >= 80) return { grade: 'A', color: '#10b981' };
    if (percentage >= 70) return { grade: 'B', color: '#3b82f6' };
    if (percentage >= 60) return { grade: 'C', color: '#f59e0b' };
    if (percentage >= 50) return { grade: 'D', color: '#f97316' };
    return { grade: 'F', color: '#ef4444' };
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content results-viewer-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading-spinner-container">
            <Loader className="spinner" size={48} />
            <p>Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!attempt || !quiz) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content results-viewer-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
          <div className="empty-state">
            <p>Unable to load results</p>
          </div>
        </div>
      </div>
    );
  }

  const gradeInfo = getGrade(parseFloat(attempt.score.percentage));
  const notAttemptedCount = results.filter(r => !r.isAttempted).length;
  const incorrectCount = results.filter(r => r.isAttempted && !r.isCorrect).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content results-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="results-viewer-content">
          <div className="results-header">
            <Trophy size={48} />
            <h1>Quiz Results</h1>
            <p className="quiz-title">{quiz.title}</p>
            <p className="user-info">{attempt.userName} ({attempt.userEmail})</p>
          </div>

          <div className="score-summary">
            <div className="score-circle" style={{ borderColor: gradeInfo.color }}>
              <div className="grade" style={{ color: gradeInfo.color }}>
                {gradeInfo.grade}
              </div>
              <div className="percentage">{attempt.score.percentage}%</div>
            </div>
            <div className="score-details">
              <div className="score-item">
                <span className="label">Marks Obtained:</span>
                <span className="value" style={{ color: attempt.score.earnedMarks >= 0 ? '#10b981' : '#ef4444' }}>
                  {attempt.score.earnedMarks} / {attempt.score.totalMarks}
                </span>
              </div>
              <div className="score-item">
                <span className="label">Correct Answers:</span>
                <span className="value correct">{attempt.score.correct}</span>
              </div>
              <div className="score-item">
                <span className="label">Incorrect Answers:</span>
                <span className="value incorrect">{incorrectCount}</span>
              </div>
              <div className="score-item">
                <span className="label">Not Attempted:</span>
                <span className="value unattempted">{notAttemptedCount}</span>
              </div>
              <div className="score-item">
                <span className="label">Total Questions:</span>
                <span className="value">{attempt.score.total}</span>
              </div>
            </div>
          </div>

          <div className="results-list">
            <h2>Detailed Results</h2>
            {results.map((result, index) => (
              <ResultCard key={result.questionId} result={result} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsViewer;
