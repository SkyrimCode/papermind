/**
 * Application-wide constants
 */

// Grade color thresholds
export const GRADE_COLORS = {
  HIGH: '#10b981',    // Green - 80%+
  MEDIUM: '#3b82f6',  // Blue - 60-79%
  LOW: '#f59e0b',     // Orange - 40-59%
  FAIL: '#ef4444',    // Red - Below 40%
  ABANDONED: '#6b7280', // Gray - Abandoned attempts
};

// Quiz status
export const QUIZ_STATUS = {
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
};

// Tab names
export const TABS = {
  NOT_ATTEMPTED: 'not-attempted',
  ATTEMPTED: 'attempted',
};

/**
 * Get color based on percentage score
 * @param {number} percentage - Score percentage
 * @returns {string} Color hex code
 */
export const getGradeColor = (percentage) => {
  if (percentage >= 80) return GRADE_COLORS.HIGH;
  if (percentage >= 60) return GRADE_COLORS.MEDIUM;
  if (percentage >= 40) return GRADE_COLORS.LOW;
  return GRADE_COLORS.FAIL;
};

/**
 * Get grade letter based on percentage
 * @param {number} percentage - Score percentage
 * @returns {object} Grade object with letter and color
 */
export const getGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'A+', color: GRADE_COLORS.HIGH };
  if (percentage >= 80) return { grade: 'A', color: GRADE_COLORS.HIGH };
  if (percentage >= 70) return { grade: 'B', color: GRADE_COLORS.MEDIUM };
  if (percentage >= 60) return { grade: 'C', color: GRADE_COLORS.MEDIUM };
  if (percentage >= 50) return { grade: 'D', color: GRADE_COLORS.LOW };
  return { grade: 'F', color: GRADE_COLORS.FAIL };
};
