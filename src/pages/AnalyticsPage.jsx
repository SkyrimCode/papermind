import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { TrendingUp, Award, Target, Calendar, Loader, Users } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const AnalyticsPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState({});
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    totalMarksEarned: 0,
    totalMarksPossible: 0
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      // Fetch all quizzes
      const quizzesRef = collection(db, 'quizzes');
      const quizzesSnapshot = await getDocs(quizzesRef);
      const quizzesMap = {};
      quizzesSnapshot.docs.forEach(doc => {
        quizzesMap[doc.id] = doc.data();
      });
      setQuizzes(quizzesMap);

      // If admin, fetch all users for the dropdown
      if (isAdmin()) {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersList = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));
        setAllUsers(usersList);
      }

      // Determine which user's attempts to fetch
      const targetUserId = isAdmin() && selectedUserId ? selectedUserId : user.uid;

      // Fetch user's attempts
      const attemptsRef = collection(db, 'attempts');
      const q = query(
        attemptsRef, 
        where('userId', '==', targetUserId),
        where('status', '==', 'completed')
      );
      const snapshot = await getDocs(q);
      const userAttempts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by attemptedAt in JavaScript instead of Firestore
      userAttempts.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));
      
      setAttempts(userAttempts);
      calculateStats(userAttempts);
    } catch {
      // Error fetching analytics data
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, selectedUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateStats = (attemptsList) => {
    if (attemptsList.length === 0) {
      return;
    }

    const totalAttempts = attemptsList.length;
    const scores = attemptsList.map(a => parseFloat(a.score.percentage));
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
    const bestScore = Math.max(...scores);
    
    const totalMarksEarned = attemptsList.reduce((sum, a) => 
      sum + (a.score.earnedMarks || 0), 0
    );
    const totalMarksPossible = attemptsList.reduce((sum, a) => 
      sum + (a.score.totalMarks || a.score.total), 0
    );

    setStats({
      totalAttempts,
      averageScore: averageScore.toFixed(2),
      bestScore: bestScore.toFixed(2),
      totalMarksEarned: totalMarksEarned.toFixed(2),
      totalMarksPossible
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#3b82f6';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const handleUserSelect = (email) => {
    setSelectedUserEmail(email);
    if (email === '') {
      setSelectedUserId('');
    } else {
      const selectedUser = allUsers.find(u => u.email === email);
      if (selectedUser) {
        setSelectedUserId(selectedUser.uid);
      }
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <Loader className="spinner" size={48} />
        <p>Loading analytics...</p>
      </div>
    );
  }

  const displayName = isAdmin() && selectedUserEmail 
    ? allUsers.find(u => u.email === selectedUserEmail)?.displayName || selectedUserEmail
    : user?.displayName;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>{isAdmin() && selectedUserEmail ? `Analytics - ${displayName}` : 'My Analytics'}</h1>
        <p>Track your learning progress and performance</p>
      </div>

      {/* Admin User Selector */}
      {isAdmin() && (
        <div className="user-selector-section">
          <div className="user-selector">
            <Users size={20} />
            <CustomSelect
              value={selectedUserEmail}
              onChange={handleUserSelect}
              placeholder="My Analytics"
              options={[
                { value: '', label: 'My Analytics' },
                ...allUsers.map(u => ({
                  value: u.email,
                  label: `${u.displayName} (${u.email})`
                }))
              ]}
            />
          </div>
        </div>
      )}

      {attempts.length === 0 ? (
        <div className="empty-state">
          <Award size={64} color="#667eea" />
          <h2>No Quiz Attempts Yet</h2>
          <p>{isAdmin() && selectedUserEmail 
            ? `${displayName} hasn't attempted any quizzes yet.` 
            : 'Start taking quizzes to see your analytics and progress!'}</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e0e7ff' }}>
                <Target size={24} color="#667eea" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Attempts</p>
                <h2 className="stat-value">{stats.totalAttempts}</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#d1fae5' }}>
                <TrendingUp size={24} color="#10b981" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Average Score</p>
                <h2 className="stat-value">{stats.averageScore}%</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7' }}>
                <Award size={24} color="#f59e0b" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Best Score</p>
                <h2 className="stat-value">{stats.bestScore}%</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ddd6fe' }}>
                <Award size={24} color="#7c3aed" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Marks</p>
                <h2 className="stat-value">
                  {stats.totalMarksEarned} / {stats.totalMarksPossible}
                </h2>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="chart-section">
            <h2>Performance Over Time</h2>
            <div className="line-chart-container">
              <svg className="line-chart" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((value) => (
                  <g key={value}>
                    <line
                      x1="50"
                      y1={250 - (value * 2)}
                      x2="750"
                      y2={250 - (value * 2)}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                    <text
                      x="35"
                      y={255 - (value * 2)}
                      fontSize="12"
                      fill="#6b7280"
                      textAnchor="end"
                    >
                      {value}%
                    </text>
                  </g>
                ))}
                
                {/* Line path */}
                {attempts.length > 0 && (
                  <>
                    <polyline
                      points={attempts.map((attempt, index) => {
                        const x = 50 + ((700 / (attempts.length - 1 || 1)) * (attempts.length - 1 - index));
                        const y = 250 - (parseFloat(attempt.score.percentage) * 2);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#667eea"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Data points */}
                    {attempts.map((attempt, index) => {
                      const x = 50 + ((700 / (attempts.length - 1 || 1)) * (attempts.length - 1 - index));
                      const y = 250 - (parseFloat(attempt.score.percentage) * 2);
                      return (
                        <g key={attempt.id}>
                          <circle
                            cx={x}
                            cy={y}
                            r="6"
                            fill="white"
                            stroke={getGradeColor(parseFloat(attempt.score.percentage))}
                            strokeWidth="3"
                          />
                          <text
                            x={x}
                            y={270}
                            fontSize="11"
                            fill="#6b7280"
                            textAnchor="middle"
                          >
                            #{attempts.length - index}
                          </text>
                          <text
                            x={x}
                            y={y - 15}
                            fontSize="12"
                            fill="#1f2937"
                            fontWeight="600"
                            textAnchor="middle"
                          >
                            {attempt.score.percentage}%
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* Detailed Attempts History */}
          <div className="attempts-history">
            <h2>Quiz History</h2>
            <div className="attempts-list">
              {attempts.map((attempt, index) => {
                const quiz = quizzes[attempt.quizId];
                return (
                  <div 
                    key={attempt.id} 
                    className="attempt-history-card clickable"
                    onClick={() => navigate(`/view-results/${attempt.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate(`/view-results/${attempt.id}`);
                      }
                    }}
                  >
                    <div className="attempt-number">#{attempts.length - index}</div>
                    <div className="attempt-details">
                      <h3>{quiz?.title || 'Unknown Quiz'}</h3>
                      <div className="attempt-meta">
                        <span className="attempt-date">
                          <Calendar size={14} />
                          {formatDate(attempt.attemptedAt)}
                        </span>
                      </div>
                      <div className="attempt-scores">
                        <div className="score-item">
                          <span className="label">Score:</span>
                          <span 
                            className="value"
                            style={{ color: getGradeColor(parseFloat(attempt.score.percentage)) }}
                          >
                            {attempt.score.percentage}%
                          </span>
                        </div>
                        <div className="score-item">
                          <span className="label">Marks:</span>
                          <span className="value">
                            {attempt.score.earnedMarks || attempt.score.correct} / {attempt.score.totalMarks || attempt.score.total}
                          </span>
                        </div>
                        <div className="score-item">
                          <span className="label">Correct:</span>
                          <span className="value correct">{attempt.score.correct}</span>
                        </div>
                      </div>
                    </div>
                    <div 
                      className="attempt-percentage"
                      style={{ 
                        background: getGradeColor(parseFloat(attempt.score.percentage)),
                      }}
                    >
                      {attempt.score.percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
