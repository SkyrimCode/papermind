import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, BookOpen } from 'lucide-react';
import { useEffect } from 'react';

const LoginPage = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized. Please add it to Firebase Console > Authentication > Settings > Authorized domains.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups for this site.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Another sign-in popup is already open.';
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="page-container">
      <div className="login-content">
        <div className="login-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '0.75rem'}}>
            <BookOpen size={48} strokeWidth={1.5}/>
            <h1 style={{ margin: 0, lineHeight: 1, fontSize: '2.5rem' }}>PaperMind</h1>
          </div>
          <p>Your Smart Quiz Platform</p>
        </div>

        <div className="login-section">
          <h2>Welcome!</h2>
          <p className="login-description">
            Sign in to access quizzes, track your progress, and improve your knowledge.
          </p>
          
          <button className="google-sign-in-button" onClick={handleGoogleSignIn}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
              <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49L4.405 11.9z" fill="#FBBC05"/>
              <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="login-info">
            <div className="info-item">
              <LogIn size={20} />
              <span>Secure authentication with Google</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
