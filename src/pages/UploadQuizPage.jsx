import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import Snackbar from '../components/Snackbar';
import useQuizStore from '../store/quizStore';
import { extractTextFromPDF, parseMCQQuestions, parseAnswers } from '../utils/pdfParser';
import { extractTextFromDoc } from '../utils/docParser';
import { BookOpen, Loader, Clock, Upload, ArrowLeft } from 'lucide-react';

const UploadQuizPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    questionFile,
    solutionFile,
    setQuestionFile,
    setSolutionFile,
  } = useQuizStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(2);
  const [quizTitle, setQuizTitle] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleStartQuiz = async () => {
    if (!questionFile || !solutionFile) {
      setError('Please upload both question and solution files');
      return;
    }

    if (!quizTitle.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Parse question file
      let questionText;
      if (questionFile.type === 'application/pdf') {
        questionText = await extractTextFromPDF(questionFile);
      } else {
        questionText = await extractTextFromDoc(questionFile);
      }
      
      const questions = parseMCQQuestions(questionText);

      // Parse solution file
      let solutionText;
      if (solutionFile.type === 'application/pdf') {
        solutionText = await extractTextFromPDF(solutionFile);
      } else {
        solutionText = await extractTextFromDoc(solutionFile);
      }
      
      const solutions = parseAnswers(solutionText);

      if (questions.length === 0) {
        throw new Error('No questions found in the uploaded file. Please check the format (see SAMPLE_FILES.md for examples).');
      }

      if (solutions.length === 0) {
        throw new Error('No answers found in the solution file. Please check the format (see SAMPLE_FILES.md for examples).');
      }

      // Save quiz to Firebase
      try {
        await addDoc(collection(db, 'quizzes'), {
          title: quizTitle.trim(),
          questionCount: questions.length,
          duration: timerMinutes,
          questions: questions,
          solutions: solutions,
          createdBy: user.uid,
          createdAt: new Date().toISOString(),
        });
        
        // Clear the file inputs after successful upload
        setQuestionFile(null);
        setSolutionFile(null);
        setQuizTitle('');
        setTimerMinutes(2);
        
        setShowSnackbar(true);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch {
        setError('Failed to upload quiz to Firebase. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to parse files. Please check the format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="home-content">
        <div className="home-header">
          <div>
            <BookOpen size={48} />
            <h1>PaperMind Quiz App</h1>
            <p>Upload your question and solution files to create a new quiz</p>
            {user && <p className="user-info-small">Logged in as: {user.displayName}</p>}
          </div>
        </div>

        <div className="admin-upload-section">
          <div className="quiz-title-input">
            <label htmlFor="quizTitle">Quiz Title</label>
            <input
              id="quizTitle"
              type="text"
              placeholder="Enter quiz title (e.g., Physics Chapter 1)"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="title-input"
            />
          </div>
        </div>

        <div className="upload-section">
          <FileUpload
            label="Upload Question File (PDF/DOC)"
            acceptedTypes={{
              'application/pdf': ['.pdf'],
              'application/msword': ['.doc'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            }}
            onFileSelect={setQuestionFile}
            uploadedFile={questionFile}
          />

          <FileUpload
            label="Upload Solution File (PDF/DOC)"
            acceptedTypes={{
              'application/pdf': ['.pdf'],
              'application/msword': ['.doc'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            }}
            onFileSelect={setSolutionFile}
            uploadedFile={solutionFile}
          />
        </div>

        <div className="timer-input-section">
          <label htmlFor="timer" className="timer-label">
            <Clock size={20} />
            <span>Quiz Duration (minutes)</span>
          </label>
          <input
            id="timer"
            type="number"
            min="1"
            max="180"
            value={timerMinutes}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                setTimerMinutes('');
              } else {
                const num = parseInt(value);
                if (num >= 1 && num <= 180) {
                  setTimerMinutes(num);
                }
              }
            }}
            onBlur={(e) => {
              if (e.target.value === '' || parseInt(e.target.value) < 1) {
                setTimerMinutes(1);
              }
            }}
            className="timer-input"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button
            className="back-button"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          
          <button
            className="start-button"
            onClick={handleStartQuiz}
            disabled={!questionFile || !solutionFile || loading}
          >
            {loading ? (
              <>
                <Loader className="spinner" size={20} />
                Uploading Quiz...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload Quiz
              </>
            )}
          </button>
        </div>
      </div>

      {showSnackbar && (
        <Snackbar
          message="Quiz uploaded successfully!"
          type="success"
          onClose={() => setShowSnackbar(false)}
        />
      )}
    </div>
  );
};

export default UploadQuizPage;
