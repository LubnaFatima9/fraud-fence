// Simple test script to debug the text analysis API
const testText = "URGENT! Your PayPal account will be suspended unless you verify your password immediately. Click here: http://fake-paypal.com/verify";

async function testAPI() {
    console.log('🧪 Testing Fraud Fence Text Analysis API...');
    
    try {
        const response = await fetch('http://localhost:9005/api/text-detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: testText }),
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', errorText);
            return;
        }
        
        const result = await response.json();
        console.log('✅ API Response:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('💥 Request failed:', error.message);
    }
}

// Run if this is the main module (for Node.js)
if (typeof window === 'undefined') {
    testAPI();
}
