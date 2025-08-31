// Test script for API endpoints
const testTextAPI = async () => {
  try {
    const response = await fetch('http://localhost:9002/api/text-detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Congratulations! You\'ve won $1,000,000! Click here to claim your prize!'
      })
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response body:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testTextAPI();
