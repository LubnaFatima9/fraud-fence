// Comprehensive API test for all analysis types
const BASE_URL = 'http://localhost:9005';

async function testTextAnalysis() {
    console.log('🧪 Testing Text Analysis API...');
    
    const testText = "URGENT! Your account will be suspended unless you verify immediately. Click here: http://fake-bank.com/verify and enter your password.";
    
    try {
        const response = await fetch(`${BASE_URL}/api/text-detect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: testText }),
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Text Analysis Result:', {
                isFraudulent: result.isFraudulent,
                confidence: result.confidenceScore,
                threatCount: result.threatTypes?.length || 0,
                hasExplanation: !!result.explanation
            });
        } else {
            console.error('❌ Text API failed:', response.status);
        }
    } catch (error) {
        console.error('💥 Text API error:', error.message);
    }
}

async function testUrlAnalysis() {
    console.log('🧪 Testing URL Analysis API...');
    
    const testUrl = "http://secure-paypal-verification.suspicious-domain.tk/login";
    
    try {
        const response = await fetch(`${BASE_URL}/api/url-detect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: testUrl }),
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ URL Analysis Result:', {
                isFraudulent: result.isFraudulent,
                confidence: result.confidenceScore,
                threatCount: result.threatTypes?.length || 0,
                hasExplanation: !!result.explanation
            });
        } else {
            console.error('❌ URL API failed:', response.status);
        }
    } catch (error) {
        console.error('💥 URL API error:', error.message);
    }
}

async function testImageAnalysis() {
    console.log('🧪 Testing Image Analysis API...');
    
    // Simple base64 image data (1x1 pixel)
    const testImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    
    try {
        const response = await fetch(`${BASE_URL}/api/image-detect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                imageData: testImageData,
                fileName: "urgent-payment-invoice.exe" // Suspicious filename
            }),
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Image Analysis Result:', {
                isFraudulent: result.isFraudulent,
                confidence: result.confidenceScore,
                threatCount: result.threatTypes?.length || 0,
                hasExplanation: !!result.explanation
            });
        } else {
            console.error('❌ Image API failed:', response.status);
        }
    } catch (error) {
        console.error('💥 Image API error:', error.message);
    }
}

async function runAllTests() {
    console.log('🚀 Running comprehensive Fraud Fence API tests...\n');
    
    await testTextAnalysis();
    console.log('');
    await testUrlAnalysis();
    console.log('');
    await testImageAnalysis();
    
    console.log('\n✅ All tests completed!');
}

runAllTests();
