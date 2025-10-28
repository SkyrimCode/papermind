import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import './App.css';

// Lazy load all page components for code-splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const UploadQuizPage = lazy(() => import('./pages/UploadQuizPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const ViewResultsPage = lazy(() => import('./pages/ViewResultsPage'));
const AttemptsPage = lazy(() => import('./pages/AttemptsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Checking authentication...
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: '600'
  }}>
    Loading...
  </div>
);

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  const showSidebar = user && !['/quiz', '/results', '/login'].some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <>
      {showSidebar && <Sidebar />}
      <div className={showSidebar ? 'main-content' : ''}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadQuizPage /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            <Route path="/view-results/:attemptId" element={<ProtectedRoute><ViewResultsPage /></ProtectedRoute>} />
            <Route path="/attempts" element={<ProtectedRoute><AttemptsPage /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
