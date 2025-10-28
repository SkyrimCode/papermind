const QuestionCard = ({ question, selectedAnswer, onAnswerSelect }) => {
  const isNAT = question.type === 'NAT';
  
  // Get marks from question object (extracted during parsing)
  const marks = question.marks || null;
  
  // selectedAnswer can be a string (single), array (multiple), or number (NAT)
  const selectedAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : (selectedAnswer ? [selectedAnswer] : []);
  
  const handleAnswerToggle = (key) => {
    if (selectedAnswers.includes(key)) {
      // Remove if already selected
      const newAnswers = selectedAnswers.filter(a => a !== key);
      onAnswerSelect(question.id, newAnswers.length > 0 ? newAnswers : null);
    } else {
      // Add to selection
      onAnswerSelect(question.id, [...selectedAnswers, key]);
    }
  };

  const handleNATAnswerChange = (e) => {
    const value = e.target.value;
    // Allow empty string or valid numbers (including decimals and negative numbers)
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      onAnswerSelect(question.id, value === '' ? null : value);
    }
  };

  // Format question text to render numbered lists with line breaks
  const formatQuestionText = (text) => {
    // Split by lines and process
    const lines = text.split('\n');
    const formatted = [];
    
    lines.forEach((line, index) => {
      // Check if line starts with a numbered list item (1., 2., etc.)
      if (/^\d+\./.test(line.trim())) {
        // Add line break before numbered items (except first line)
        if (index > 0) formatted.push(<br key={`br-${index}`} />);
        formatted.push(<span key={index}>{line}</span>);
      } else if (line.trim()) {
        // Regular text - add space if not first item
        if (formatted.length > 0) formatted.push(' ');
        formatted.push(<span key={index}>{line}</span>);
      }
    });
    
    return formatted;
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <span className="question-number">Question {question.id}</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {marks && (
            <span className="marks-badge">{marks} {marks === '1' ? 'Mark' : 'Marks'}</span>
          )}
          {isNAT && <span className="question-type-badge">Numerical Answer</span>}
        </div>
      </div>
      
      <div className="question-text" style={{ whiteSpace: 'normal' }}>
        {formatQuestionText(question.text)}
      </div>
      
      {isNAT ? (
        <div className="nat-answer-container">
          <label htmlFor={`nat-${question.id}`} className="nat-label">
            Your Answer:
          </label>
          <input
            id={`nat-${question.id}`}
            type="text"
            className="nat-input"
            value={selectedAnswer || ''}
            onChange={handleNATAnswerChange}
            placeholder="Enter answer"
          />
        </div>
      ) : (
        <div className="options-container">
          {Object.entries(question.options)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([key, value]) => (
            <label key={key} className="option-label">
              <input
                type="checkbox"
                name={`question-${question.id}`}
                value={key}
                checked={selectedAnswers.includes(key)}
                onChange={() => handleAnswerToggle(key)}
              />
              <span className="option-content">
                <span className="option-key">{key})</span>
                <span className="option-text">{value}</span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
