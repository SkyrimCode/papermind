import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

const ResultCard = ({ result }) => {
  // Format answer display (handle both single and multiple answers, and numbers)
  const formatAnswer = (answer) => {
    if (answer === null || answer === undefined) return 'Not answered';
    if (typeof answer === 'number') return answer.toString();
    if (Array.isArray(answer)) return answer.join(', ');
    return answer;
  };

  // Format explanation to handle bullet points and numbered lists
  const formatExplanation = (text) => {
    if (!text) return null;
    
    // Split by double newlines (paragraph breaks) first
    const paragraphs = text.split(/\n\n+/);
    
    // If we have clear paragraph breaks, format each paragraph
    if (paragraphs.length > 1) {
      return paragraphs.map((para, index) => {
        const trimmed = para.trim();
        if (!trimmed) return null;
        return (
          <div key={index} style={{ marginBottom: '1rem' }}>
            {trimmed}
          </div>
        );
      }).filter(Boolean);
    }
    
    // No paragraph breaks - check for bullet points (●)
    const bulletLines = text.split(/●/);
    
    if (bulletLines.length > 1) {
      // Has bullet points - format each as a separate line
      return bulletLines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed && index === 0) return null; // Skip empty first element
        return (
          <div key={index} style={{ marginBottom: '0.5rem' }}>
            {index > 0 && trimmed && '● '}{trimmed}
          </div>
        );
      }).filter(Boolean);
    }
    
    // Check for numbered lists that appear on separate lines (newline before number)
    const numberedListMatch = text.match(/\n\d+\.\s+/);
    if (numberedListMatch) {
      // Split by newline followed by number pattern
      const parts = text.split(/\n(?=\d+\.\s+)/);
      const formatted = parts.filter(part => part.trim());
      
      if (formatted.length > 1) {
        return formatted.map((line, index) => (
          <div key={index} style={{ marginBottom: '0.5rem' }}>
            {line.trim()}
          </div>
        ));
      }
    }
    
    // No special formatting - return as-is (this preserves single line text)
    return text;
  };

  return (
    <div className={`result-card ${result.isCorrect ? 'correct' : 'incorrect'}`}>
      <div className="result-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="question-number">Question {result.questionId}</span>
          {result.marks && (
            <span className="marks-badge">{result.marks} {result.marks === 1 ? 'Mark' : 'Marks'}</span>
          )}
          {result.marksAwarded !== undefined && (
            <span 
              className="marks-awarded-badge" 
              style={{ 
                background: result.marksAwarded > 0 ? '#d1fae5' : result.marksAwarded < 0 ? '#fee2e2' : '#f3f4f6',
                color: result.marksAwarded > 0 ? '#059669' : result.marksAwarded < 0 ? '#dc2626' : '#6b7280'
              }}
            >
              {result.marksAwarded > 0 ? '+' : ''}{result.marksAwarded.toFixed(2)}
            </span>
          )}
        </div>
        {result.isCorrect ? (
          <CheckCircle size={24} color="#10b981" />
        ) : (
          <XCircle size={24} color="#ef4444" />
        )}
      </div>
      <div className="result-question">{result.question}</div>
      
      {/* Display all options for MCQ, or indicate NAT question */}
      {result.type === 'NAT' ? (
        <div className="nat-indicator">
          <span className="nat-badge">Numerical Answer Type</span>
        </div>
      ) : result.options && (
        <div className="result-options">
          {Object.entries(result.options)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([key, value]) => (
            <div key={key} className="result-option">
              <span className="option-key">{key})</span>
              <span className="option-text">{value}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="result-answers">
        <div className="answer-row">
          <span className="answer-label">Your Answer:</span>
          <span className={`answer-value ${!result.isCorrect ? 'wrong' : ''}`}>
            {formatAnswer(result.userAnswer)}
          </span>
        </div>
        {!result.isCorrect && (
          <div className="answer-row">
            <span className="answer-label">Correct Answer:</span>
            <span className="answer-value correct">{formatAnswer(result.correctAnswer)}</span>
          </div>
        )}
      </div>
      
      {result.explanation && (
        <div className="explanation-card">
          <div className="explanation-header">
            <Lightbulb size={18} />
            <span>Explanation</span>
          </div>
          <div className="explanation-content">
            {formatExplanation(result.explanation) || result.explanation}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
