import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import useQuizStore from '../store/quizStore';
import Snackbar from '../components/Snackbar';
import Modal from '../components/Modal';
import { Upload, BookOpen, User, Trash2, PlayCircle, Loader, ClipboardList } from 'lucide-react';
import { formatDateWithOrdinal } from '../utils/dateHelpers';
import { TABS } from '../utils/constants';

const HomePage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { setQuestions, setSolutions, setTimerDuration, setCurrentQuizId, startQuiz } = useQuizStore();
  const [quizzes, setQuizzes] = useState([]);
  const [attemptedQuizIds, setAttemptedQuizIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS.NOT_ATTEMPTED);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ show: false, quizId: null });

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      // Fetch both quizzes and attempts in parallel
      const [quizzesSnapshot, attemptsSnapshot] = await Promise.all([
        getDocs(collection(db, 'quizzes')),
        getDocs(query(collection(db, 'attempts'), where('userId', '==', user.uid)))
      ]);

      const quizList = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort by createdAt descending (newest first)
      quizList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setQuizzes(quizList);

      const attemptedIds = new Set(attemptsSnapshot.docs.map(doc => doc.data().quizId));
      setAttemptedQuizIds(attemptedIds);
    } catch (error) {
      setSnackbar({ 
        show: true, 
        message: `Error loading quizzes: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setAttemptsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteQuiz = (quizId) => {
    setDeleteModal({ show: true, quizId });
  };

  const confirmDelete = async () => {
    const quizId = deleteModal.quizId;
    setDeleteModal({ show: false, quizId: null });
    
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
      
      const q = query(collection(db, 'attempts'), where('quizId', '==', quizId));
      const attemptsSnapshot = await getDocs(q);
      
      await Promise.all(
        attemptsSnapshot.docs.map(attemptDoc => 
          deleteDoc(doc(db, 'attempts', attemptDoc.id))
        )
      );
      
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      setSnackbar({ 
        show: true, 
        message: 'Quiz and related attempts deleted successfully!', 
        type: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        show: true, 
        message: `Failed to delete quiz: ${error.message}`, 
        type: 'error' 
      });
    }
  };

  const handleStartQuiz = (quiz) => {
    // Collapse sidebar before starting quiz
    localStorage.setItem('sidebarCollapsed', 'true');
    
    setQuestions(quiz.questions);
    setSolutions(quiz.solutions);
    setTimerDuration(quiz.duration * 60);
    setCurrentQuizId(quiz.id);
    startQuiz();
    navigate('/quiz');
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const isAttempted = attemptedQuizIds.has(quiz.id);
    return activeTab === TABS.ATTEMPTED ? isAttempted : !isAttempted;
  });

  const isDataLoading = loading || attemptsLoading;

  return (
    <div className="page-container dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="dashboard-title" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <h1 style={{ margin: 0, lineHeight: 1, fontSize: '2rem' }}>PaperMind</h1>
              <p className="user-info" style={{ justifyContent: 'center' }}>
                <User size={16} />
                {user?.displayName} {isAdmin() && '(admin)'}
              </p>
            </div>
          </div>
        </div>

        {isAdmin() && (
          <div className="admin-section">
            <h2>Admin Actions</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="upload-quiz-button"
                onClick={() => navigate('/upload')}
              >
                <Upload size={20} />
                Upload New Quiz
              </button>
              <button 
                className="upload-quiz-button"
                onClick={() => navigate('/attempts')}
              >
                <ClipboardList size={20} />
                View All Attempts
              </button>
            </div>
          </div>
        )}

        <div className="quizzes-section">
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === TABS.NOT_ATTEMPTED ? 'active' : ''}`}
                onClick={() => setActiveTab(TABS.NOT_ATTEMPTED)}
              >
                Not Attempted
              </button>
              <button 
                className={`tab ${activeTab === TABS.ATTEMPTED ? 'active' : ''}`}
                onClick={() => setActiveTab(TABS.ATTEMPTED)}
              >
                Attempted
              </button>
            </div>
          </div>
          
          {isDataLoading ? (
            <div className="loading-spinner-container">
              <Loader className="spinner" size={48} />
              <p>Loading quizzes...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={48} />
              <p>No {activeTab === TABS.ATTEMPTED ? 'attempted' : 'new'} quizzes available</p>
            </div>
          ) : (
            <div className="quiz-grid">
              {filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className="quiz-card">
                  <div className="quiz-card-header">
                    <h3>{quiz.title}</h3>
                    {isAdmin() && (
                      <button 
                        className="delete-quiz-button"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        aria-label="Delete quiz"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <div className="quiz-card-info">
                    <p className="quiz-questions">{quiz.questionCount} Questions</p>
                    <p className="quiz-duration">{quiz.duration} minutes</p>
                    <p className="quiz-date">
                      Created: {formatDateWithOrdinal(quiz.createdAt)}
                    </p>
                  </div>
                  <button 
                    className="start-quiz-button"
                    onClick={() => handleStartQuiz(quiz)}
                  >
                    <PlayCircle size={20} />
                    Start Quiz
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {snackbar.show && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, show: false })}
        />
      )}

      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, quizId: null })}
        onConfirm={confirmDelete}
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default HomePage;
