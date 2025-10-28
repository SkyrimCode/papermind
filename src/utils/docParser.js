import mammoth from 'mammoth';
import { parseMCQQuestions, parseAnswers } from './pdfParser';

/**
 * Extract text from DOC/DOCX file
 * @param {File} file - DOC/DOCX file to parse
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromDoc = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOC file:', error);
    throw new Error('Failed to parse DOC/DOCX file');
  }
};

/**
 * Parse questions from DOC file
 */
export const parseQuestionsFromDoc = async (file) => {
  const text = await extractTextFromDoc(file);
  return parseMCQQuestions(text);
};

/**
 * Parse answers from DOC file
 */
export const parseAnswersFromDoc = async (file) => {
  const text = await extractTextFromDoc(file);
  return parseAnswers(text);
};
