// Test script to diagnose fraud analysis issues
// Run this in Node.js environment or browser console

console.log('🧪 Testing Fraud Analysis Flows...');

// Test data
const TEST_CASES = {
    text: {
        obvious_fraud: "🚨 URGENT! You've won $1,000,000! Click this link immediately to claim your prize before it expires in 24 hours! No fees required, 100% guaranteed! Act now!",
        subtle_scam: "Hi dear, I hope this message finds you well. Due to recent security updates, your account will be suspended unless you verify your information. Please click here to update your details within 48 hours.",
        safe_text: "Hello, thank you for your inquiry about our product. We'd be happy to provide more information. Our customer service team is available Monday through Friday from 9 AM to 5 PM."
    },
    image_urls: [
        // Test images - you'd need to create these or use existing ones
    ]
};

// Function to test Cogniflow Text API directly
async function testCogniflowText(text) {
    console.log('\n📝 Testing Cogniflow Text API...');
    console.log('Text:', text.substring(0, 100) + '...');
    
    try {
        const response = await fetch('https://predict.cogniflow.ai/text/classification/predict/69cd908d-f479-49f2-9984-eb6c5d462417', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'cdc872e5-00ae-4d32-936c-a80bf6a889ce'
            },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            console.error('❌ API Error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            return null;
        }
        
        const result = await response.json();
        console.log('✅ Raw API Response:', result);
        
        // Parse the response as the web app does
        const isFraudulent = result.result && result.result.toLowerCase() === 'fraud';
        const confidenceScore = result.confidence_score || 0;
        
        console.log('📊 Parsed Result:');
        console.log('  - Is Fraudulent:', isFraudulent);
        console.log('  - Confidence Score:', confidenceScore);
        console.log('  - Raw Result:', result.result);
        
        return { isFraudulent, confidenceScore, raw: result };
        
    } catch (error) {
        console.error('❌ Network Error:', error);
        return null;
    }
}

// Function to simulate the web app analysis logic
async function testWebAppLogic() {
    console.log('\n🌐 Testing Web App Analysis Logic...');
    
    for (const [type, text] of Object.entries(TEST_CASES.text)) {
        console.log(`\n🧪 Testing ${type}:`);
        const result = await testCogniflowText(text);
        
        if (result) {
            // Simulate the fraud meter calculation from analysis-result.tsx
            let fraudConfidence = result.isFraudulent ? result.confidenceScore : 1 - result.confidenceScore;
            let fraudConfidencePercentage = Math.round(fraudConfidence * 100);
            fraudConfidencePercentage = Math.max(5, Math.min(95, fraudConfidencePercentage));
            
            console.log('🎯 Final UI Display:');
            console.log('  - Status:', result.isFraudulent ? 'FRAUD' : 'SAFE');
            console.log('  - Fraud Meter:', fraudConfidencePercentage + '%');
            
            // Check if the logic makes sense
            if (type === 'obvious_fraud' && !result.isFraudulent) {
                console.warn('⚠️ ISSUE: Obvious fraud not detected!');
            }
            if (type === 'safe_text' && result.isFraudulent) {
                console.warn('⚠️ ISSUE: Safe text marked as fraud!');
            }
        }
    }
}

// Function to test the explanation generation
async function testExplanationGeneration() {
    console.log('\n🤖 Testing AI Explanation Generation...');
    
    // This would require making a request to the web app's API endpoints
    // Since we can't easily test Genkit flows outside the Next.js environment,
    // we'll focus on the Cogniflow API issues first
    
    console.log('ℹ️ Explanation testing requires the Next.js environment running.');
    console.log('   Check the browser console when testing on localhost:9002');
}

// Run all tests
async function runDiagnostics() {
    console.log('🚀 Starting Fraud Analysis Diagnostics...\n');
    
    await testWebAppLogic();
    await testExplanationGeneration();
    
    console.log('\n📋 DIAGNOSIS COMPLETE');
    console.log('\nCommon Issues to Check:');
    console.log('1. Cogniflow API returning wrong results');
    console.log('2. Confidence score interpretation issues');  
    console.log('3. Fraud meter calculation problems');
    console.log('4. AI explanation generation failures');
    console.log('5. Model ID mismatches between components');
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
    runDiagnostics();
} else {
    console.log('Run runDiagnostics() to start the tests');
}

// Export for Node.js usage
if (typeof module !== 'undefined') {
    module.exports = { runDiagnostics, testCogniflowText, TEST_CASES };
}
