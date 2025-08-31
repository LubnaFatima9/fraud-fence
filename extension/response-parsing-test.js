// Test the new Cogniflow response parsing - run this in the background console

console.log('🧪 Testing Cogniflow Response Parsing...');

// Simulate the actual API response format we're getting
const testResponse = {
    processing_time: 0.557,
    confidence_score: 0.698,
    result: 'fraud'
};

console.log('📦 Test input (simulated API response):', testResponse);

// Test the response transformation logic
function testCognifloResponse(result) {
    console.log('🧠 Processing Cogniflow response...');
    
    if (result.result !== undefined) {
        // Handle the actual Cogniflow response format: {result: 'fraud', confidence_score: 0.698}
        const prediction = result.result;
        let confidence = (result.confidence_score || result.confidence || 0.05) * 100;
        
        console.log('📊 Cogniflow analysis:', { prediction, confidence, originalConfidence: result.confidence_score });
        
        const transformedResult = {
            isFraud: prediction === 'fraud' || prediction === 'scam',
            confidence: Math.round(confidence),
            riskLevel: confidence > 80 ? 'High Risk' : confidence > 50 ? 'Medium Risk' : 'Low Risk',
            details: prediction === 'fraud' ? `Fraud detected with ${Math.round(confidence)}% confidence` : 
                    prediction === 'scam' ? `Scam detected with ${Math.round(confidence)}% confidence` :
                    `Classified as: ${prediction} (${Math.round(confidence)}% confidence)`,
            source: 'Cogniflow'
        };
        
        console.log('🔧 Final transformed result:', transformedResult);
        return transformedResult;
    }
    
    return null;
}

// Test with our actual API response
const transformedResult = testCognifloResponse(testResponse);

// Test notification formatting
if (transformedResult) {
    const title = transformedResult.isFraud ? '🚨 Fraud Detected!' : 
                  transformedResult.confidence > 50 ? '⚠️ Suspicious Text' : '✅ Text Looks Safe';
    const message = `${Math.round(transformedResult.confidence)}% confidence\n${transformedResult.details || transformedResult.riskLevel}`;
    
    console.log('📢 Expected notification:', { title, message });
    
    // Show what the notification should look like
    console.log('✅ Test completed successfully!');
    console.log(`Expected notification title: "${title}"`);
    console.log(`Expected notification message: "${message}"`);
} else {
    console.error('❌ Response transformation failed');
}

console.log('🎯 Response parsing test complete.');
