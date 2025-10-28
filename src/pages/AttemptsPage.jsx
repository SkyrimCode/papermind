import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ClipboardList, User, Calendar, Award, Loader } from 'lucide-react';
import { getGradeColor, GRADE_COLORS } from '../utils/constants';

const AttemptsPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState('all');

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [quizzesSnapshot, attemptsSnapshot] = await Promise.all([
        getDocs(collection(db, 'quizzes')),
        getDocs(query(collection(db, 'attempts'), orderBy('attemptedAt', 'desc')))
      ]);

      const quizzesMap = {};
      quizzesSnapshot.docs.forEach(doc => {
        quizzesMap[doc.id] = doc.data().title;
      });
      setQuizzes(quizzesMap);

      const attemptsList = attemptsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttempts(attemptsList);
    } catch {
      // Error fetching attempts
    } finally {
      setLoading(false);
    }
  };

  const filteredAttempts = selectedQuiz === 'all' 
    ? attempts 
    : attempts.filter(attempt => attempt.quizId === selectedQuiz);

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-content">
          <div className="loading-spinner-container">
            <Loader className="spinner" size={48} />
            <p>Loading attempts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <ClipboardList size={36} />
            <h1>Quiz Attempts</h1>
          </div>
        </div>

        <div className="attempts-filters" style={{ marginBottom: '2rem' }}>
          <label style={{ marginRight: '1rem', fontWeight: 500 }}>Filter by Quiz:</label>
          <select 
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Quizzes</option>
            {Object.entries(quizzes).map(([id, title]) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </select>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} />
            <p>No attempts found</p>
          </div>
        ) : (
          <div className="attempts-list">
            {filteredAttempts.map((attempt) => (
              <div 
                key={attempt.id} 
                className={`attempt-card ${attempt.status === 'completed' ? 'clickable' : ''}`}
                onClick={() => attempt.status === 'completed' && navigate(`/view-results/${attempt.id}`)}
                role={attempt.status === 'completed' ? 'button' : undefined}
                tabIndex={attempt.status === 'completed' ? 0 : undefined}
                onKeyPress={(e) => {
                  if (attempt.status === 'completed' && (e.key === 'Enter' || e.key === ' ')) {
                    navigate(`/view-results/${attempt.id}`);
                  }
                }}
                style={{ cursor: attempt.status === 'completed' ? 'pointer' : 'default' }}
              >
                <div className="attempt-header">
                  <div className="attempt-user">
                    <User size={20} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{attempt.userName}</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {attempt.userEmail}
                      </div>
                    </div>
                  </div>
                  <div className="attempt-actions">
                    <div 
                      className="attempt-score"
                      style={{ 
                        backgroundColor: attempt.status === 'abandoned' 
                          ? GRADE_COLORS.ABANDONED 
                          : getGradeColor(attempt.score.percentage),
                        color: 'white',
                        padding: '0.375rem 0.875rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                      }}
                    >
                      {attempt.status === 'abandoned' 
                        ? 'Abandoned' 
                        : `${attempt.score.percentage.toFixed(1)}%`
                      }
                    </div>
                  </div>
                </div>
                
                <div className="attempt-details">
                  <div className="attempt-detail-item">
                    <ClipboardList size={16} />
                    <span>{quizzes[attempt.quizId] || 'Unknown Quiz'}</span>
                  </div>
                  <div className="attempt-detail-item">
                    <Award size={16} />
                    <span>
                      {attempt.status === 'abandoned' 
                        ? 'Quiz abandoned' 
                        : `${attempt.score.correct} / ${attempt.score.total} correct`
                      }
                    </span>
                  </div>
                  <div className="attempt-detail-item">
                    <Calendar size={16} />
                    <span>
                      {new Date(attempt.attemptedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttemptsPage;
