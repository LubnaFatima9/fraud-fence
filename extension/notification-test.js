// Test notifications directly - run this in the background console

console.log('🔔 Testing notification system...');

// Test basic notification
chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Test Notification',
    message: 'This is a test notification from Fraud Fence extension.'
}, (notificationId) => {
    if (chrome.runtime.lastError) {
        console.error('❌ Notification creation failed:', chrome.runtime.lastError.message);
    } else {
        console.log('✅ Test notification created with ID:', notificationId);
    }
});

// Test the extension's notification function
setTimeout(() => {
    console.log('🔔 Testing showNotification function...');
    showNotification('Test Title', 'Test message from showNotification function');
}, 2000);

// Test different notification types
setTimeout(() => {
    console.log('🔔 Testing success notification...');
    showNotification('✅ Analysis Complete', 'Text appears safe with 25% confidence');
}, 4000);

setTimeout(() => {
    console.log('🔔 Testing warning notification...');
    showNotification('⚠️ Suspicious Content', 'Potential fraud detected with 75% confidence');
}, 6000);

setTimeout(() => {
    console.log('🔔 Testing fraud alert...');
    showNotification('🚨 Fraud Detected!', 'High confidence fraud pattern found');
}, 8000);

console.log('📋 Notification tests queued. You should see 5 notifications over the next 10 seconds.');
console.log('📋 If no notifications appear, check:');
console.log('  - Chrome notification permissions');
console.log('  - Windows notification settings'); 
console.log('  - Do Not Disturb mode');
console.log('  - Extension notification permissions');
