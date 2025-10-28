import { create } from 'zustand';

// Helper function to compare answers (handles single, multiple, and numerical answers)
const compareAnswers = (userAnswer, correctAnswer) => {
  if (userAnswer === null || userAnswer === undefined || correctAnswer === null || correctAnswer === undefined) {
    return false;
  }
  
  // If correctAnswer is a number (NAT questions), convert userAnswer to number and compare with tolerance
  if (typeof correctAnswer === 'number') {
    const userNum = typeof userAnswer === 'string' ? parseFloat(userAnswer) : userAnswer;
    if (isNaN(userNum)) return false;
    // Allow very small tolerance (0.0001) for floating-point precision issues only
    const tolerance = 0.0001;
    return Math.abs(userNum - correctAnswer) <= tolerance;
  }
  
  // If both are arrays, compare sorted arrays
  if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
    if (userAnswer.length !== correctAnswer.length) return false;
    const sortedUser = [...userAnswer].sort();
    const sortedCorrect = [...correctAnswer].sort();
    return sortedUser.every((ans, idx) => ans === sortedCorrect[idx]);
  }
  
  // If both are strings, direct comparison
  if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
    return userAnswer === correctAnswer;
  }
  
  // If one is array and other is string, convert string to array
  const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
  const correctArr = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
  
  if (userArr.length !== correctArr.length) return false;
  const sortedUser = [...userArr].sort();
  const sortedCorrect = [...correctArr].sort();
  return sortedUser.every((ans, idx) => ans === sortedCorrect[idx]);
};

const useQuizStore = create((set) => ({
  // Questions and answers
  questions: [],
  solutions: [],
  userAnswers: {},
  
  // File uploads
  questionFile: null,
  solutionFile: null,
  
  // Quiz state
  isQuizStarted: false,
  isQuizSubmitted: false,
  score: null,
  results: null,
  timerDuration: 120, // Default 2 minutes in seconds
  currentQuizId: null, // Track which quiz is being taken
  currentQuizName: '', // Track quiz/paper name
  
  // Actions
  setQuestions: (questions) => set({ questions }),
  setSolutions: (solutions) => set({ solutions }),
  setTimerDuration: (duration) => set({ timerDuration: duration }),
  setCurrentQuizId: (quizId) => set({ currentQuizId: quizId }),
  setCurrentQuizName: (name) => set({ currentQuizName: name }),
  setUserAnswer: (questionId, answer) =>
    set((state) => ({
      userAnswers: { ...state.userAnswers, [questionId]: answer },
    })),
  setQuestionFile: (file) => set({ questionFile: file }),
  setSolutionFile: (file) => set({ solutionFile: file }),
  startQuiz: () => set({ isQuizStarted: true, userAnswers: {} }),
  submitQuiz: () => set({ isQuizSubmitted: true }),
  calculateScore: () =>
    set((state) => {
      let totalMarks = 0;
      let earnedMarks = 0;
      
      const results = state.questions.map((question) => {
        const userAnswer = state.userAnswers[question.id];
        const solution = state.solutions.find(
          (sol) => sol.id === question.id
        );
        const correctAnswer = solution?.answer;
        const explanation = solution?.explanation;
        const questionMarks = question.marks || 1; // Default to 1 mark if not specified
        
        // Add to total marks
        totalMarks += questionMarks;
        
        // Handle both single and multiple answers, and numerical answers
        const isCorrect = compareAnswers(userAnswer, correctAnswer);
        
        // Calculate marks for this question with negative marking
        let marksAwarded = 0;
        const isAttempted = userAnswer !== null && userAnswer !== undefined && userAnswer !== '';
        
        if (isCorrect) {
          marksAwarded = questionMarks;
        } else if (isAttempted) {
          // Negative marking logic:
          // - MCQ (single correct answer, string/single letter): deduct 1/3 of marks for wrong answer
          // - MSQ (multiple correct answers, array): 0 marks for wrong answer (no negative)
          // - NAT (numerical answer type): 0 marks for wrong answer (no negative)
          const isMSQ = Array.isArray(correctAnswer);
          const isNAT = question.type === 'NAT';
          
          if (isMSQ || isNAT) {
            // MSQ or NAT: No negative marking, just 0 marks
            marksAwarded = 0;
          } else {
            // MCQ: Negative marking of 1/3
            marksAwarded = -(questionMarks / 3);
          }
        }
        // If not attempted, marksAwarded remains 0
        
        earnedMarks += marksAwarded;
        
        return {
          questionId: question.id,
          question: question.text,
          options: question.options,
          type: question.type || 'MCQ', // Include question type
          marks: questionMarks,
          marksAwarded: marksAwarded,
          userAnswer,
          correctAnswer,
          explanation,
          isCorrect,
          isAttempted,
        };
      });
      
      const correctCount = results.filter((r) => r.isCorrect).length;
      const totalQuestions = state.questions.length;
      const scorePercentage = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0;
      
      return {
        results,
        score: {
          correct: correctCount,
          total: totalQuestions,
          earnedMarks: parseFloat(earnedMarks.toFixed(2)),
          totalMarks: totalMarks,
          percentage: scorePercentage.toFixed(2),
        },
      };
    }),
  resetQuiz: () =>
    set({
      questions: [],
      solutions: [],
      userAnswers: {},
      questionFile: null,
      solutionFile: null,
      isQuizStarted: false,
      isQuizSubmitted: false,
      score: null,
      results: null,
      timerDuration: 120, // Reset to default
      currentQuizId: null,
      currentQuizName: '',
    }),
}));

export default useQuizStore;
