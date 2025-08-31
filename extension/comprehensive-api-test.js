// Comprehensive API Test Script for Fraud Fence Extension
// Run this in browser console to test all API connections

console.log('🧪 Starting Comprehensive API Test for Fraud Fence Extension');

// API Configuration from extension
const API_BASE_URL = 'https://predict.cogniflow.ai';
const GOOGLE_SAFE_BROWSING_API_KEY = 'AIzaSyD7t6JWpS89dUelr1MXYJHcze2MnLTLmpY';

const API_CONFIG = {
    text: {
        endpoint: `${API_BASE_URL}/text/classification/predict/b7562ba0-a75d-4001-9375-1f06f22e0b13`,
        apiKey: 'cdc872e5-00ae-4d32-936c-a80bf6a889ce',
        type: 'cogniflow'
    },
    image: {
        endpoint: `${API_BASE_URL}/image/llm-classification/predict/ba056844-ddea-47fb-b6f5-9adcf567cbae`,
        apiKey: '764ea05f-f623-4c7f-919b-dac6cf7223f3',
        type: 'cogniflow'
    },
    url: {
        endpoint: `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`,
        apiKey: GOOGLE_SAFE_BROWSING_API_KEY,
        type: 'google-safe-browsing'
    }
};

// Model IDs from blueprint and different files for verification
const MODEL_IDS_CHECK = {
    blueprint_text: '69cd908d-f479-49f2-9984-eb6c5d462417',
    extension_text: 'b7562ba0-a75d-4001-9375-1f06f22e0b13',
    webapp_text: '69cd908d-f479-49f2-9984-eb6c5d462417',
    
    blueprint_image: 'ba056844-ddea-47fb-b6f5-9adcf567cbae',
    extension_image: 'ba056844-ddea-47fb-b6f5-9adcf567cbae',
    webapp_image: 'ba056844-ddea-47fb-b6f5-9adcf567cbae'
};

console.warn('⚠️ Model ID Discrepancy Detected:');
console.log('📄 Blueprint Text Model:', MODEL_IDS_CHECK.blueprint_text);
console.log('🧩 Extension Text Model:', MODEL_IDS_CHECK.extension_text);
console.log('🌐 Web App Text Model:', MODEL_IDS_CHECK.webapp_text);
console.log('');
console.log('Image models are consistent:', MODEL_IDS_CHECK.blueprint_image);

// Test Data
const TEST_DATA = {
    text: {
        safe: 'Hello, how are you today? I hope you are having a great day.',
        suspicious: '🚨 URGENT! You\'ve won $1,000,000! Click this link immediately to claim your prize before it expires in 24 hours! No fees required, 100% guaranteed! Act now!'
    },
    url: {
        safe: 'https://google.com',
        suspicious: 'https://testsafebrowsing.appspot.com/s/malware.html'
    }
};

// Helper function to create a test image
function createTestImage() {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Create a simple test image with text
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('URGENT!', 10, 30);
        ctx.fillText('WIN $$$', 10, 50);
        ctx.fillText('CLICK NOW', 5, 70);
        
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
}

// Test Functions

async function testTextAnalysis() {
    console.log('\n📝 Testing Text Analysis (Cogniflow)...');
    console.log('Using endpoint:', API_CONFIG.text.endpoint);
    console.log('Using API key:', API_CONFIG.text.apiKey);
    
    const results = [];
    
    for (const [type, text] of Object.entries(TEST_DATA.text)) {
        try {
            console.log(`\n🧪 Testing ${type} text...`);
            const response = await fetch(API_CONFIG.text.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_CONFIG.text.apiKey
                },
                body: JSON.stringify({ text })
            });
            
            console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Error Response:`, errorText);
                results.push({ type, status: 'failed', error: `${response.status}: ${errorText}` });
                continue;
            }
            
            const result = await response.json();
            console.log(`✅ API Response:`, result);
            
            // Transform to expected format
            let transformedResult;
            if (result.result !== undefined) {
                const prediction = result.result;
                const confidence = (result.confidence_score || 0.05) * 100;
                transformedResult = {
                    isFraud: prediction === 'fraud' || prediction === 'scam',
                    confidence: Math.round(confidence),
                    riskLevel: confidence > 80 ? 'High Risk' : confidence > 50 ? 'Medium Risk' : 'Low Risk',
                    details: `Classified as: ${prediction} (${Math.round(confidence)}% confidence)`,
                    source: 'Cogniflow'
                };
            }
            
            console.log(`🔧 Transformed Result:`, transformedResult);
            results.push({ type, status: 'success', raw: result, transformed: transformedResult });
            
        } catch (error) {
            console.error(`❌ Network Error:`, error);
            results.push({ type, status: 'error', error: error.message });
        }
    }
    
    return results;
}

async function testImageAnalysis() {
    console.log('\n🖼️ Testing Image Analysis (Cogniflow)...');
    console.log('Using endpoint:', API_CONFIG.image.endpoint);
    console.log('Using API key:', API_CONFIG.image.apiKey);
    
    try {
        console.log('🎨 Creating test image...');
        const testBlob = await createTestImage();
        
        // Convert to base64
        const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(testBlob);
        });
        
        console.log('📦 Test image created, base64 length:', base64.length);
        
        // Test multiple payload formats
        const payloadVariants = [
            { 
                image_base64: base64, 
                format: 'jpeg', 
                prompt: 'Analyze this image for fraud or scam indicators' 
            },
            { 
                image: base64, 
                format: 'jpeg', 
                prompt: 'Analyze this image for fraud or scam indicators' 
            },
            { 
                image_base64: base64, 
                format: 'jpeg' 
            }
        ];
        
        let success = false;
        let finalResult = null;
        
        for (let i = 0; i < payloadVariants.length; i++) {
            const payload = payloadVariants[i];
            console.log(`\n🧪 Testing payload variant ${i + 1}:`, Object.keys(payload));
            
            try {
                const response = await fetch(API_CONFIG.image.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_CONFIG.image.apiKey
                    },
                    body: JSON.stringify(payload)
                });
                
                console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.warn(`⚠️ Variant ${i + 1} failed:`, errorText.substring(0, 200));
                    continue;
                }
                
                const result = await response.json();
                console.log(`✅ Variant ${i + 1} Success:`, result);
                
                // Transform result
                let transformedResult;
                if (result.result && Array.isArray(result.result)) {
                    const primaryPrediction = result.result.find(r => r.match === true);
                    if (primaryPrediction) {
                        const isFraud = primaryPrediction.name.toLowerCase() === 'scam';
                        const confidence = (primaryPrediction.score || 0.05) * 100;
                        transformedResult = {
                            isFraud,
                            confidence: Math.round(confidence),
                            riskLevel: confidence > 80 ? 'High Risk' : confidence > 50 ? 'Medium Risk' : 'Low Risk',
                            details: `Image classified as: ${primaryPrediction.name} (${Math.round(confidence)}% confidence)`,
                            source: 'Cogniflow'
                        };
                    }
                }
                
                console.log(`🔧 Transformed Result:`, transformedResult);
                finalResult = { status: 'success', raw: result, transformed: transformedResult };
                success = true;
                break;
                
            } catch (error) {
                console.warn(`⚠️ Variant ${i + 1} network error:`, error.message);
            }
        }
        
        if (!success) {
            return { status: 'failed', error: 'All payload variants failed' };
        }
        
        return finalResult;
        
    } catch (error) {
        console.error(`❌ Image Analysis Error:`, error);
        return { status: 'error', error: error.message };
    }
}

async function testUrlAnalysis() {
    console.log('\n🔗 Testing URL Analysis (Google Safe Browsing)...');
    console.log('Using API key:', GOOGLE_SAFE_BROWSING_API_KEY);
    
    const results = [];
    
    for (const [type, url] of Object.entries(TEST_DATA.url)) {
        try {
            console.log(`\n🧪 Testing ${type} URL: ${url}`);
            
            const payload = {
                client: {
                    clientId: "fraud-fence-extension",
                    clientVersion: "1.0.0"
                },
                threatInfo: {
                    threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                    platformTypes: ["ANY_PLATFORM"],
                    threatEntryTypes: ["URL"],
                    threatEntries: [{ url }]
                }
            };
            
            const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Error Response:`, errorText);
                results.push({ type, status: 'failed', error: `${response.status}: ${errorText}` });
                continue;
            }
            
            const result = await response.json();
            console.log(`✅ API Response:`, result);
            
            // Transform result
            const hasThreat = result.matches && result.matches.length > 0;
            const transformedResult = {
                isFraud: hasThreat,
                confidence: hasThreat ? 95 : 5,
                riskLevel: hasThreat ? 'High Risk - Malicious URL detected' : 'Safe - No known threats',
                details: hasThreat ? `Threat detected: ${result.matches[0].threatType}` : 'URL appears safe',
                source: 'Google Safe Browsing'
            };
            
            console.log(`🔧 Transformed Result:`, transformedResult);
            results.push({ type, status: 'success', raw: result, transformed: transformedResult });
            
        } catch (error) {
            console.error(`❌ Network Error:`, error);
            results.push({ type, status: 'error', error: error.message });
        }
    }
    
    return results;
}

// Main test function
async function runComprehensiveTest() {
    console.log('🚀 Starting comprehensive API test...\n');
    
    const testResults = {
        text: await testTextAnalysis(),
        image: await testImageAnalysis(),
        url: await testUrlAnalysis()
    };
    
    // Summary
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('=' .repeat(50));
    
    // Text Analysis Summary
    console.log('\n📝 TEXT ANALYSIS:');
    testResults.text.forEach(result => {
        const status = result.status === 'success' ? '✅' : '❌';
        console.log(`  ${status} ${result.type}: ${result.status}`);
        if (result.error) console.log(`    Error: ${result.error}`);
    });
    
    // Image Analysis Summary
    console.log('\n🖼️ IMAGE ANALYSIS:');
    const imgStatus = testResults.image.status === 'success' ? '✅' : '❌';
    console.log(`  ${imgStatus} Test image: ${testResults.image.status}`);
    if (testResults.image.error) console.log(`    Error: ${testResults.image.error}`);
    
    // URL Analysis Summary
    console.log('\n🔗 URL ANALYSIS:');
    testResults.url.forEach(result => {
        const status = result.status === 'success' ? '✅' : '❌';
        console.log(`  ${status} ${result.type}: ${result.status}`);
        if (result.error) console.log(`    Error: ${result.error}`);
    });
    
    // Issues Found
    console.log('\n🔍 ISSUES IDENTIFIED:');
    
    // Model ID mismatch
    if (MODEL_IDS_CHECK.blueprint_text !== MODEL_IDS_CHECK.extension_text) {
        console.log('⚠️ Model ID Mismatch:');
        console.log(`   Blueprint text model: ${MODEL_IDS_CHECK.blueprint_text}`);
        console.log(`   Extension text model: ${MODEL_IDS_CHECK.extension_text}`);
        console.log('   This may cause inconsistent behavior between web app and extension.');
    }
    
    // API failures
    const failures = [
        ...testResults.text.filter(r => r.status !== 'success'),
        ...(testResults.image.status !== 'success' ? [testResults.image] : []),
        ...testResults.url.filter(r => r.status !== 'success')
    ];
    
    if (failures.length > 0) {
        console.log('❌ API Failures detected:');
        failures.forEach(failure => {
            console.log(`   ${failure.type || 'image'}: ${failure.error}`);
        });
    }
    
    if (failures.length === 0 && MODEL_IDS_CHECK.blueprint_text === MODEL_IDS_CHECK.extension_text) {
        console.log('✅ All tests passed! APIs are working correctly.');
    }
    
    return testResults;
}

// Run the comprehensive test
runComprehensiveTest().catch(error => {
    console.error('💥 Test runner failed:', error);
});
