import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check if API key is available
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
console.log('🔑 Gemini API key available:', apiKey ? 'Yes (' + apiKey.substring(0, 10) + '...)' : 'No');

// Model fallback hierarchy - from most powerful to most reliable
export const AI_MODELS = [
  'googleai/gemini-2.0-flash-exp',     // Latest experimental (most powerful)
  'googleai/gemini-1.5-pro',          // Stable pro version  
  'googleai/gemini-1.5-flash',        // Fast and efficient
  'googleai/gemini-pro',              // Original stable version
  'googleai/gemini-1.0-pro'          // Fallback legacy version
];

// Current model selection - can be changed dynamically
let currentModelIndex = 1; // Start with gemini-1.5-pro (stable)

export function getCurrentModel(): string {
  return AI_MODELS[currentModelIndex] || AI_MODELS[1];
}

export function switchToNextModel(): string {
  currentModelIndex = (currentModelIndex + 1) % AI_MODELS.length;
  console.log(`🔄 Switched to model: ${getCurrentModel()}`);
  return getCurrentModel();
}

export function resetToStableModel(): string {
  currentModelIndex = 1; // Back to gemini-1.5-pro
  console.log(`🏠 Reset to stable model: ${getCurrentModel()}`);
  return getCurrentModel();
}

export const ai = genkit({
  plugins: [googleAI()],
  model: getCurrentModel(),
});

// Log current model selection
console.log('🤖 AI Model selected:', getCurrentModel());
