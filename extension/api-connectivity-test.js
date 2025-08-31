// Quick API test - Run this in the background script console

console.log('🧪 Starting API connectivity test...');

// Test the text analysis API directly
async function testTextAPI() {
    console.log('📝 Testing text analysis API...');
    
    try {
        const testText = "Congratulations! You have won $1,000,000! Click here to claim your prize now!";
        
        const response = await fetch('https://predict.cogniflow.ai/text/classification/predict/b7562ba0-a75d-4001-9375-1f06f22e0b13', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'cdc872e5-00ae-4d32-936c-a80bf6a889ce'
            },
            body: JSON.stringify({ text: testText })
        });
        
        console.log('📡 Text API Response Status:', response.status, response.statusText);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Text API Response:', result);
        } else {
            const errorText = await response.text();
            console.error('❌ Text API Error:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Text API Test Failed:', error);
    }
}

// Test the image analysis API directly
async function testImageAPI() {
    console.log('🖼️ Testing image analysis API...');
    
    try {
        // Create test FormData
        const formData = new FormData();
        // Using a test image URL
        const imageUrl = 'https://via.placeholder.com/300x200/ff6b6b/ffffff?text=Test+Image';
        
        // Fetch the image and convert to blob
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        
        formData.append('image', imageBlob, 'test-image.png');
        formData.append('prompt', 'Analyze this image for fraudulent or scam content');
        
        const response = await fetch('https://predict.cogniflow.ai/image/llm-classification/predict/ba056844-ddea-47fb-b6f5-9adcf567cbae', {
            method: 'POST',
            headers: {
                'x-api-key': '764ea05f-f623-4c7f-919b-dac6cf7223f3'
            },
            body: formData
        });
        
        console.log('📡 Image API Response Status:', response.status, response.statusText);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Image API Response:', result);
        } else {
            const errorText = await response.text();
            console.error('❌ Image API Error:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Image API Test Failed:', error);
    }
}

// Test the URL safety API directly  
async function testURLAPI() {
    console.log('🔗 Testing URL safety API...');
    
    try {
        const testUrl = 'http://malware.testing.google.test/testing/malware/';
        
        const payload = {
            client: {
                clientId: "fraud-fence-extension",
                clientVersion: "1.0.0"
            },
            threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url: testUrl }]
            }
        };
        
        const response = await fetch('https://safebrowsing.googleapis.com/v4/threatMatches:find?key=AIzaSyD7t6JWpS89dUelr1MXYJHcze2MnLTLmpY', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('📡 URL API Response Status:', response.status, response.statusText);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ URL API Response:', result);
        } else {
            const errorText = await response.text();
            console.error('❌ URL API Error:', errorText);
        }
        
    } catch (error) {
        console.error('❌ URL API Test Failed:', error);
    }
}

// Run all tests
async function runAllAPITests() {
    console.log('🚀 Running all API tests...');
    
    await testTextAPI();
    console.log('---');
    await testImageAPI(); 
    console.log('---');
    await testURLAPI();
    
    console.log('✅ API tests completed. Check results above.');
}

// Auto-run the tests
runAllAPITests();
