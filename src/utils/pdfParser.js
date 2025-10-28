import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker - use local worker file from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Extract text from PDF file
 * @param {File} file - PDF file to parse
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Reconstruct text with better spacing and newlines
      let lastY = null;
      const pageLines = [];
      let currentLine = '';
      
      textContent.items.forEach((item) => {
        // Check if we've moved to a new line (different Y coordinate)
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          if (currentLine.trim()) {
            pageLines.push(currentLine.trim());
          }
          currentLine = item.str;
        } else {
          // Same line, add space if needed
          if (currentLine && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
            currentLine += ' ';
          }
          currentLine += item.str;
        }
        lastY = item.transform[5];
      });
      
      // Add the last line
      if (currentLine.trim()) {
        pageLines.push(currentLine.trim());
      }
      
      fullText += pageLines.join('\n') + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
};

/**
 * Parse MCQ questions from text
 * Supports multiple formats:
 * Format 1: "1. Question text?"
 * Format 2: "Q.1 Question text?"
 * Format 3: "Q1. Question text?"
 * Format 4: Questions with passages (Questions 11-15: Passage...)
 * Format 5: NAT (Numerical Answer Type) questions - Q.7 (NAT, 2 Marks)
 * 
 * Options: (A) or A) format for MCQ
 * For NAT: No options, numerical answer expected
 * 
 * Returns: Array of questions with passage metadata and type (MCQ/NAT)
 */
export const parseMCQQuestions = (text) => {
  const questions = [];
  
  // First, let's try to find all question blocks more carefully
  // Look for patterns like Q.16, Q16, or just 16. at the start of a line
  const lines = text.split('\n');
  let currentQuestion = null;
  let currentBlock = [];
  let inPassage = false;
  let passageText = '';
  let passageStartQuestion = null; // Track which question starts the passage
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check if this is a section header (e.g., "Section 2: Reasoning")
    // This should reset state and NOT be part of a question
    const sectionMatch = line.match(/^Section\s+\d+:/i);
    if (sectionMatch) {
      // Save previous question before starting new section
      if (currentQuestion && currentBlock.length > 0) {
        const parsed = parseQuestionBlock(currentBlock, currentQuestion, passageText, passageStartQuestion);
        if (parsed) questions.push(parsed);
      }
      currentQuestion = null;
      currentBlock = [];
      inPassage = false;
      passageText = '';
      passageStartQuestion = null;
      continue;
    }
    
    // Check if this is marks information line (should be ignored)
    if (line.match(/^\(\d+\s+Questions?\s+x\s+\d+\s+Marks?\s*(?:each)?\s*=\s*\d+\s+Marks?\)/i) ||
        line.match(/^Total:\s*\d+\s+Questions?,\s*\d+\s+Marks?/i)) {
      continue;
    }
    
    // Check if this is a passage header (e.g., "Questions 11 - 15) Read the following passage")
    // This should trigger passage mode
    const passageHeaderMatch = line.match(/^\(?Questions?\s+(\d+)\s*[-–]\s*\d+\s*\)?:?\s*Read/i);
    if (passageHeaderMatch) {
      // Save previous question before starting passage
      if (currentQuestion && currentBlock.length > 0) {
        const parsed = parseQuestionBlock(currentBlock, currentQuestion, '', null);
        if (parsed) questions.push(parsed);
      }
      currentQuestion = null;
      currentBlock = [];
      inPassage = true;
      passageText = '';
      // Remember the starting question number from the passage header
      passageStartQuestion = passageHeaderMatch[1];
      continue;
    }
    
    // Check if line starts with "Passage" (passage content)
    if (line.match(/^Passage\s+\d+:/i)) {
      inPassage = true;
      continue;
    }
    
    // Check if this line starts a new question
    // Questions MUST start with Q or Q. followed by a number
    // Matches: Q.16, Q16, Q.16., Q 16, etc.
    const questionStartMatch = line.match(/^Q\.?\s*(\d+)\.?\s*(?:\([A-Z]+[^)]*\))?\s*(.*)/i);
    
    if (questionStartMatch && questionStartMatch[1]) {
      // Save previous question if exists
      if (currentQuestion && currentBlock.length > 0) {
        const parsed = parseQuestionBlock(currentBlock, currentQuestion, passageText, passageStartQuestion);
        if (parsed) questions.push(parsed);
      }
      
      // End passage mode when we hit a question
      inPassage = false;
      
      // Start new question
      currentQuestion = questionStartMatch[1];
      currentBlock = [line];
    } else if (currentQuestion) {
      // Continue current question block
      currentBlock.push(line);
    } else if (inPassage) {
      // Accumulate passage text
      passageText += line + '\n';
    }
  }
  
  // Don't forget the last question
  if (currentQuestion && currentBlock.length > 0) {
    const parsed = parseQuestionBlock(currentBlock, currentQuestion, passageText, passageStartQuestion);
    if (parsed) questions.push(parsed);
  }
  
  return questions;
};

/**
 * Helper function to parse a single question block
 * Supports both MCQ and NAT (Numerical Answer Type) questions
 */
function parseQuestionBlock(lines, questionId, passageText = '', passageStartQuestion = null) {
  const blockText = lines.join('\n');
  
  // Check if this is a NAT (Numerical Answer Type) question
  const isNAT = blockText.match(/\(NAT[^)]*\)/i);
  
  if (isNAT) {
    // For NAT questions, extract everything after the question metadata
    const questionMatch = blockText.match(/^(?:Q\.?\s*)?\d+\.?\s*\(NAT[^)]*\)\s*(.+)/is);
    if (!questionMatch) return null;
    
    let questionText = questionMatch[1].trim();
    
    // Extract marks from the NAT metadata
    const natMarksMatch = blockText.match(/\(NAT,?\s*(\d+)\s*Marks?\)/i);
    const natMarks = natMarksMatch ? parseInt(natMarksMatch[1]) : null;
    
    const questionObj = {
      id: questionId,
      text: questionText,
      type: 'NAT',
      options: {}, // Empty options for NAT questions
    };
    
    // Add marks if extracted
    if (natMarks) {
      questionObj.marks = natMarks;
    }
    
    // Add passage info if this question has an associated passage
    if (passageText.trim() && passageStartQuestion === questionId) {
      questionObj.passage = passageText.trim();
      questionObj.hasPassage = true;
    }
    
    return questionObj;
  }
  
  // MCQ question parsing (existing logic)
  // Extract marks from the full blockText (before we narrow down to questionText)
  const marksMatch = blockText.match(/\((?:MCQ|MSQ|NAT)?,?\s*(\d+)\s*Marks?\)/i);
  const marks = marksMatch ? parseInt(marksMatch[1]) : null;
  
  // Extract question text (everything before the first option)
  // Options must be on their own line starting with (A), (B), (C), or (D) followed by )
  const questionMatch = blockText.match(/^(?:Q\.?\s*)?\d+\.?\s*(?:\([A-Z]+[^)]*\))?\s*(.+?)(?=\n\s*\([A-D]\))/is);
  if (!questionMatch) return null;
  
  let questionText = questionMatch[1].trim();
  
  // Remove any question type metadata like (MCQ, 2 Marks), (MSQ, 2 Marks), etc.
  // But preserve quoted text like "Unreliable Narrator"
  questionText = questionText.replace(/\((?:MCQ|MSQ|NAT|TF)[^)]*\)/gi, '').trim();
  
  // Extract options - support both (A) and A) formats
  const options = {};
  const optionRegex = /(?:^|\n)\s*\(?\s*([A-D])\s*\)\s*(.+?)(?=\n\s*\(?\s*[A-D]\s*\)|$)/gis;
  let match;
  
  while ((match = optionRegex.exec(blockText)) !== null) {
    const optionLetter = match[1].toUpperCase();
    let optionText = match[2].trim();
    // Clean up option text - remove extra newlines within option
    optionText = optionText.replace(/\n+/g, ' ').trim();
    options[optionLetter] = optionText;
  }
  
  // Only return if we have at least 2 options (preferably 4)
  if (Object.keys(options).length >= 2) {
    const questionObj = {
      id: questionId,
      text: questionText,
      type: 'MCQ',
      options: options,
    };
    
    // Add marks if extracted
    if (marks) {
      questionObj.marks = marks;
    }
    
    // Add passage info if this question has an associated passage
    // Only mark as having passage if it's the first question in the passage group
    if (passageText.trim() && passageStartQuestion === questionId) {
      questionObj.passage = passageText.trim();
      questionObj.hasPassage = true;
    }
    
    return questionObj;
  }
  
  return null;
}

/**
 * Parse answers from solution text
 * Supports multiple formats including answers with explanations
 * Format 1: "1. A" (MCQ)
 * Format 2: "Q.1 Answer: (B) Option\nExplanation: ..." (MCQ)
 * Format 3: "Q.7 Answer: 0.455" (NAT - numerical answer)
 */
export const parseAnswers = (text) => {
  const answers = [];
  const lines = text.split('\n');
  
  let currentQuestion = null;
  let currentAnswer = null;
  let currentExplanation = [];
  let inExplanation = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this is a new question (Q.1, Q.2, etc.)
    const questionMatch = line.match(/^Q\.?\s*(\d+)/i);
    
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion && currentAnswer !== null) {
        answers.push({
          id: currentQuestion,
          answer: currentAnswer,
          explanation: currentExplanation.length > 0 ? currentExplanation.join('\n').trim() : null,
        });
      }
      
      // Start new question
      currentQuestion = questionMatch[1];
      currentAnswer = null;
      currentExplanation = [];
      inExplanation = false;
      continue;
    }
    
    // Check if this is an answer line
    // For MCQ: Answer: A or Answer: (A) or Answer: A, B or Answer: (B), (C)
    // For MCQ with text: Answer: (D) "What the Thunder Said"
    // For NAT: Answer: 0.455 or Answer: 42
    const answerMatch = line.match(/^Answer:\s*(.+)/i);
    
    if (answerMatch && currentQuestion) {
      let answerText = answerMatch[1].trim();
      
      // Stop at "Explanation:" if it's on the same line
      if (answerText.includes('Explanation:')) {
        answerText = answerText.split('Explanation:')[0].trim();
      }
      
      // Check if it's a pure number (NAT answer)
      if (/^\d+(?:\.\d+)?$/.test(answerText)) {
        currentAnswer = parseFloat(answerText);
      } else {
        // It's an MCQ/MSQ answer
        // Extract only the letters in parentheses or standalone at the beginning
        // Pattern: Extract (A), (B), (C) or A, B, C format
        
        // First try to match parentheses format: (A), (B), etc.
        const parenMatches = answerText.match(/\(([A-D])\)/gi);
        if (parenMatches && parenMatches.length > 0) {
          const letters = parenMatches.map(m => m.replace(/[()]/g, '').toUpperCase());
          currentAnswer = letters.length === 1 ? letters[0] : letters;
        } else {
          // Try standalone letter format: A or A, B, C
          // Only match at the start before any other text
          const standaloneMatch = answerText.match(/^([A-D])(?:\s*,\s*([A-D]))*(?:\s|$)/i);
          if (standaloneMatch) {
            const letters = answerText.match(/^[A-D](?:\s*,\s*[A-D])*/i)[0].match(/[A-D]/gi);
            const normalizedAnswers = letters.map(a => a.toUpperCase());
            currentAnswer = normalizedAnswers.length === 1 ? normalizedAnswers[0] : normalizedAnswers;
          }
        }
      }
      continue;
    }
    
    // Check if this is explanation line
    const explanationMatch = line.match(/^Explanation:\s*(.*)/i);
    
    if (explanationMatch && currentQuestion) {
      inExplanation = true;
      if (explanationMatch[1].trim()) {
        currentExplanation.push(explanationMatch[1]);
      }
      continue;
    }
    
    // If we're in explanation mode, accumulate text until next question
    if (inExplanation && currentQuestion) {
      currentExplanation.push(line);
    }
  }
  
  // Don't forget the last question
  if (currentQuestion && currentAnswer !== null) {
    answers.push({
      id: currentQuestion,
      answer: currentAnswer,
      explanation: currentExplanation.length > 0 ? currentExplanation.join('\n').trim() : null,
    });
  }
  
  return answers;
};
