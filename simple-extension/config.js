// Configuration file for FraudFence Extension
// Using the main website's API for fraud detection

const CONFIG = {
  // Main website API endpoints (running on localhost during development)
  API_BASE_URL: 'http://localhost:9005/api',
  
  // Production URL (uncomment when deploying)
  // API_BASE_URL: 'https://fraud-fence.vercel.app/api',
  
  // API endpoints
  TEXT_DETECT_URL: '/text-detect',
  URL_DETECT_URL: '/url-detect',
  
  // Fallback to rule-based detection if API fails
  USE_FALLBACK: true,
  
  // API timeout in milliseconds
  API_TIMEOUT: 15000,
  
  // Legacy Gemini API (not used anymore, website API is preferred)
  GEMINI_API_KEY: '',
  GEMINI_API_URL: ''
};

