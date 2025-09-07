// Test script for fraud analyzer API endpoints
async function testFraudAnalyzer() {
  const baseUrl = 'http://localhost:9005';
  
  console.log('🔍 Testing Fraud Analyzer API Endpoints...\n');

  // Test 1: Text Analysis
  console.log('1. Testing Text Analysis API...');
  try {
    const textResponse = await fetch(`${baseUrl}/api/text-detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'URGENT! You have won $1,000,000! Click this link immediately to claim your prize before it expires! Act now!'
      })
    });
    
    if (textResponse.ok) {
      const textResult = await textResponse.json();
      console.log('✅ Text Analysis Response:', JSON.stringify(textResult, null, 2));
    } else {
      console.log('❌ Text Analysis Failed:', textResponse.status, textResponse.statusText);
    }
  } catch (error) {
    console.log('❌ Text Analysis Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: URL Analysis
  console.log('2. Testing URL Analysis API...');
  try {
    const urlResponse = await fetch(`${baseUrl}/api/url-detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://suspicious-bank-login-phishing.example.com/fake-login'
      })
    });
    
    if (urlResponse.ok) {
      const urlResult = await urlResponse.json();
      console.log('✅ URL Analysis Response:', JSON.stringify(urlResult, null, 2));
    } else {
      console.log('❌ URL Analysis Failed:', urlResponse.status, urlResponse.statusText);
    }
  } catch (error) {
    console.log('❌ URL Analysis Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Image Analysis with dummy data
  console.log('3. Testing Image Analysis API...');
  try {
    const dummyImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const imageResponse = await fetch(`${baseUrl}/api/image-detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: dummyImageData
      })
    });
    
    if (imageResponse.ok) {
      const imageResult = await imageResponse.json();
      console.log('✅ Image Analysis Response:', JSON.stringify(imageResult, null, 2));
    } else {
      console.log('❌ Image Analysis Failed:', imageResponse.status, imageResponse.statusText);
    }
  } catch (error) {
    console.log('❌ Image Analysis Error:', error.message);
  }

  console.log('\n🎉 Fraud Analyzer API Test Complete!');
}

// Run the test if this is a Node.js environment
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  testFraudAnalyzer().catch(console.error);
} else {
  console.log('Run this in Node.js environment or browser console');
}
