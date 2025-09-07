// Utility functions for handling user feedback on fraud analysis

export type FeedbackType = 'not-scam' | 'report-fraud';

export interface UserFeedback {
  id: string;
  timestamp: number;
  type: FeedbackType;
  analysisResult: {
    type: 'text' | 'image' | 'url';
    isFraudulent?: boolean;
    isSafe?: boolean;
    confidenceScore?: number;
    threatTypes?: string[];
    inputValue: string;
    explanation?: string;
  };
  userComment?: string;
}

/**
 * Save user feedback to localStorage
 */
export function saveFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp'>): string {
  const feedbackData: UserFeedback = {
    ...feedback,
    id: generateFeedbackId(),
    timestamp: Date.now(),
  };

  try {
    const existingFeedback = getAllFeedback();
    const updatedFeedback = [...existingFeedback, feedbackData];
    
    localStorage.setItem('fraud-fence-feedback', JSON.stringify(updatedFeedback));
    
    console.log('✅ Feedback saved:', feedbackData);
    return feedbackData.id;
  } catch (error) {
    console.error('❌ Failed to save feedback:', error);
    throw new Error('Failed to save feedback');
  }
}

/**
 * Get all feedback from localStorage
 */
export function getAllFeedback(): UserFeedback[] {
  try {
    const stored = localStorage.getItem('fraud-fence-feedback');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ Failed to retrieve feedback:', error);
    return [];
  }
}

/**
 * Get feedback statistics
 */
export function getFeedbackStats() {
  const feedback = getAllFeedback();
  
  const stats = {
    total: feedback.length,
    notScamReports: feedback.filter(f => f.type === 'not-scam').length,
    fraudReports: feedback.filter(f => f.type === 'report-fraud').length,
    byType: {
      text: feedback.filter(f => f.analysisResult.type === 'text').length,
      image: feedback.filter(f => f.analysisResult.type === 'image').length,
      url: feedback.filter(f => f.analysisResult.type === 'url').length,
    },
    recent: feedback.filter(f => Date.now() - f.timestamp < 24 * 60 * 60 * 1000).length, // Last 24 hours
  };
  
  return stats;
}

/**
 * Clear all feedback (for testing or privacy)
 */
export function clearAllFeedback(): void {
  try {
    localStorage.removeItem('fraud-fence-feedback');
    console.log('✅ All feedback cleared');
  } catch (error) {
    console.error('❌ Failed to clear feedback:', error);
  }
}

/**
 * Generate a unique feedback ID
 */
function generateFeedbackId(): string {
  return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Export feedback data (for future migration to database)
 */
export function exportFeedbackData(): string {
  const feedback = getAllFeedback();
  return JSON.stringify(feedback, null, 2);
}

/**
 * Check if user has already provided feedback for similar content
 */
export function hasSimilarFeedback(inputValue: string, type: 'text' | 'image' | 'url'): boolean {
  const feedback = getAllFeedback();
  return feedback.some(f => 
    f.analysisResult.type === type && 
    f.analysisResult.inputValue === inputValue
  );
}
