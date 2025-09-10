// Extension Diagnostic Script
// Run this in the popup console to check for issues

console.log('🔍 Running Fraud Fence Extension Diagnostics...');

// Check Chrome API availability
const diagnostics = {
    chromeRuntime: !!chrome.runtime,
    chromeStorage: !!chrome.storage,
    chromeTabs: !!chrome.tabs,
    extensionId: chrome.runtime?.id || 'Not available',
    manifest: chrome.runtime?.getManifest?.() || 'Not available'
};

console.log('📋 Chrome API Diagnostics:', diagnostics);

// Check DOM elements
const domElements = {
    viewDetailsBtn: !!document.getElementById('view-details'),
    clearResultsBtn: !!document.getElementById('clear-results'),
    reportIssueBtn: !!document.getElementById('report-issue'),
    resultsDiv: !!document.getElementById('results'),
    textInput: !!document.getElementById('text-input')
};

console.log('🏗️ DOM Elements Check:', domElements);

// Check global variables
const globalVars = {
    currentAnalysisData: !!window.currentAnalysisData,
    analysisCount: window.analysisCount || 0,
    threatCount: window.threatCount || 0
};

console.log('🌐 Global Variables:', globalVars);

// Test storage access
async function testStorage() {
    try {
        await chrome.storage.local.set({ diagnosticTest: 'success' });
        const result = await chrome.storage.local.get(['diagnosticTest']);
        console.log('💾 Storage Test:', result.diagnosticTest === 'success' ? '✅ Passed' : '❌ Failed');
        await chrome.storage.local.remove(['diagnosticTest']);
    } catch (error) {
        console.error('❌ Storage Test Failed:', error);
    }
}

// Test tabs access
async function testTabs() {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('📑 Tabs Test:', tabs.length > 0 ? '✅ Passed' : '❌ No active tab found');
    } catch (error) {
        console.error('❌ Tabs Test Failed:', error);
    }
}

// Run tests
testStorage();
testTabs();

// Test event listeners
const eventListeners = {
    viewDetails: !!document.getElementById('view-details')?.onclick,
    clearResults: !!document.getElementById('clear-results')?.onclick,
    reportIssue: !!document.getElementById('report-issue')?.onclick
};

console.log('🎧 Event Listeners:', eventListeners);

console.log('✅ Diagnostic complete. Check the results above for any issues.');
