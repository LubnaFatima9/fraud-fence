// Simple Gemini API test
const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');

async function testGemini() {
    console.log('🧪 Testing basic Gemini API connection...');
    
    try {
        const ai = genkit({
            plugins: [googleAI()],
            model: 'googleai/gemini-1.5-pro',
        });

        const testPrompt = ai.definePrompt({
            name: 'simpleTest',
            input: { schema: { text: 'string' } },
            output: { schema: { result: 'string' } },
            prompt: 'Say "Hello World" in response to: {{{text}}}',
        });

        console.log('🚀 Calling Gemini with simple prompt...');
        const result = await testPrompt({ text: 'test' });
        console.log('✅ Gemini response:', result);
        
    } catch (error) {
        console.error('❌ Gemini test failed:', error.message);
        console.error('Full error:', error);
    }
}

testGemini();
