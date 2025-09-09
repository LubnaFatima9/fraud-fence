// API Configuration - Local Next.js endpoints
const API_BASE_URL = 'http://localhost:9005/api';

const API_CONFIG = {
    text: {
        endpoint: `${API_BASE_URL}/analyze-text`,
        type: 'local'
    },
    image: {
        endpoint: `${API_BASE_URL}/analyze-image`,
        type: 'local'
    },
    url: {
        endpoint: `${API_BASE_URL}/analyze-url`,
        type: 'local'
    }
};

// Storage keys
const STORAGE_KEYS = {
    HISTORY: 'fraud_check_history',
    SETTINGS: 'fraud_fence_settings'
};

// DOM Elements
let currentTab = 'text';
let selectedImage = null;
let currentUrl = null;

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeImageUpload();
    initializeAnalyzeButtons();
    initializeResultActions();
    initializeHistory();
    loadFromContextMenu();
    checkCurrentPageUrl();
    checkForPageScanResults(); // Check if there are recent page scan results
    setupMessageListeners(); // Listen for context menu results
});

/**
 * Initialize tab switching functionality
 */
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            currentTab = tabName;
            clearResults();
            
            // Load history when history tab is selected
            if (tabName === 'history') {
                loadHistory();
            }
        });
    });
}

/**
 * Check current page URL automatically
 */
async function checkCurrentPageUrl() {
    try {
        // Get current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) return;
        
        currentUrl = tab.url;
        
        // Skip chrome:// and extension pages
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
            document.getElementById('current-url-status').innerHTML = `
                <div class="status-safe">
                    ✅ Chrome internal page
                </div>
            `;
            document.getElementById('current-url-details').innerHTML = `
                <div class="url-text">${tab.url}</div>
                <small>Internal browser pages are safe</small>
            `;
            return;
        }
        
        // Show loading state
        document.getElementById('current-url-status').innerHTML = `
            <div class="status-loading">
                <div class="spinner-small"></div>
                <span>Analyzing current page...</span>
            </div>
        `;
        
        // Analyze the URL
        const result = await analyzeContent('url', tab.url, false); // Don't save to history automatically
        displayCurrentUrlResult(result, tab.url);
        
    } catch (error) {
        console.error('Error checking current URL:', error);
        document.getElementById('current-url-status').innerHTML = `
            <div class="status-loading">
                ❌ Error checking page
            </div>
        `;
    }
}

/**
 * Display result for current URL check
 */
function displayCurrentUrlResult(result, url) {
    const { isFraud, confidence, riskLevel, details } = parseResultData(result);
    const statusDiv = document.getElementById('current-url-status');
    const detailsDiv = document.getElementById('current-url-details');
    
    // Update status
    const statusClass = isFraud ? 'fraud' : (confidence > 50 ? 'suspicious' : 'safe');
    const statusIcon = isFraud ? '🚨' : (confidence > 50 ? '⚠️' : '✅');
    const statusText = isFraud ? 'Fraudulent' : (confidence > 50 ? 'Suspicious' : 'Safe');
    
    statusDiv.innerHTML = `
        <div class="status-${statusClass}">
            ${statusIcon} ${statusText} (${Math.round(confidence)}%)
        </div>
    `;
    
    // Update details
    const domain = new URL(url).hostname;
    detailsDiv.innerHTML = `
        <div class="url-text">${domain}</div>
        <small>${details || 'Analysis complete'}</small>
    `;
}

/**
 * Initialize image upload functionality
 */
function initializeImageUpload() {
    const uploadArea = document.getElementById('image-upload-area');
    const fileInput = document.getElementById('image-input');
    const preview = document.getElementById('image-preview');
    const analyzeBtn = document.getElementById('analyze-image-btn');

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageSelection(file);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageSelection(file);
        }
    });

    function handleImageSelection(file) {
        selectedImage = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Selected image">`;
            preview.style.display = 'block';
            document.querySelector('.upload-placeholder').style.display = 'none';
        };
        reader.readAsDataURL(file);
        
        // Enable analyze button
        analyzeBtn.disabled = false;
    }
}

/**
 * Initialize analyze button functionality
 */
function initializeAnalyzeButtons() {
    document.getElementById('analyze-text-btn').addEventListener('click', () => {
        const text = document.getElementById('text-input').value.trim();
        if (text) {
            analyzeContent('text', text);
        } else {
            showError('Please enter some text to analyze');
        }
    });

    document.getElementById('analyze-image-btn').addEventListener('click', () => {
        if (selectedImage) {
            analyzeContent('image', selectedImage);
        } else {
            showError('Please select an image to analyze');
        }
    });

    document.getElementById('analyze-url-btn').addEventListener('click', () => {
        const url = document.getElementById('url-input').value.trim();
        if (url) {
            if (isValidURL(url)) {
                analyzeContent('url', url);
            } else {
                showError('Please enter a valid URL');
            }
        } else {
            showError('Please enter a URL to analyze');
        }
    });
}

/**
 * Initialize result action buttons
 */
function initializeResultActions() {
    document.getElementById('clear-results').addEventListener('click', clearResults);
    document.getElementById('report-false-positive').addEventListener('click', reportFalsePositive);
}

/**
 * Initialize history functionality
 */
function initializeHistory() {
    document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
}

/**
 * Load and display history
 */
async function loadHistory() {
    try {
        const result = await chrome.storage.local.get([STORAGE_KEYS.HISTORY]);
        const history = result[STORAGE_KEYS.HISTORY] || [];
        
        const historyList = document.getElementById('history-list');
        const historyEmpty = document.getElementById('history-empty');
        
        if (history.length === 0) {
            historyEmpty.style.display = 'block';
            historyList.innerHTML = '';
            historyList.appendChild(historyEmpty);
        } else {
            historyEmpty.style.display = 'none';
            displayHistoryItems(history.reverse()); // Show newest first
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

/**
 * Display history items
 */
function displayHistoryItems(history) {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    
    history.forEach(item => {
        const historyItem = createHistoryItemElement(item);
        historyList.appendChild(historyItem);
    });
}

/**
 * Create history item element
 */
function createHistoryItemElement(item) {
    const div = document.createElement('div');
    div.className = 'history-item';
    
    const { type, input, result, timestamp } = item;
    const { isFraud, confidence, riskLevel, details } = parseResultData(result);
    
    // Format timestamp
    const date = new Date(timestamp);
    const timeString = date.toLocaleString();
    
    // Truncate long inputs
    let displayInput = input;
    const hasLongInput = typeof input === 'string' && input.length > 100;
    if (hasLongInput) {
        displayInput = input.substring(0, 100) + '...';
    } else if (type === 'image') {
        displayInput = 'Image file';
    }
    
    // Status styling
    const statusClass = isFraud ? 'fraud' : (confidence > 50 ? 'suspicious' : 'safe');
    const statusIcon = isFraud ? '🚨' : (confidence > 50 ? '⚠️' : '✅');
    const statusText = isFraud ? 'Fraudulent' : (confidence > 50 ? 'Suspicious' : 'Safe');
    
    // Create unique ID for this item
    const itemId = `history-item-${item.id || Date.now()}`;
    
    div.innerHTML = `
        <div class="history-item-header">
            <span class="history-type ${type}">${type}</span>
            <span class="history-timestamp">${timeString}</span>
        </div>
        <div class="history-content ${hasLongInput ? 'truncated' : ''}">${displayInput}</div>
        <div class="history-result">
            <span class="history-status ${statusClass}">
                ${statusIcon} ${statusText}
            </span>
            <span class="history-confidence">${Math.round(confidence)}%</span>
        </div>
        <div class="history-actions">
            <button class="show-more-btn" data-item-id="${itemId}">Show More</button>
        </div>
    `;
    
    // Add click event for Show More button
    const showMoreBtn = div.querySelector('.show-more-btn');
    showMoreBtn.addEventListener('click', () => {
        showHistoryItemDetails(item);
    });
    
    return div;
}

/**
 * Save analysis to history
 */
async function saveToHistory(type, input, result) {
    try {
        const storageResult = await chrome.storage.local.get([STORAGE_KEYS.HISTORY]);
        const history = storageResult[STORAGE_KEYS.HISTORY] || [];
        
        const historyItem = {
            id: Date.now() + Math.random(),
            type,
            input: typeof input === 'string' ? input : 'File',
            result,
            timestamp: new Date().toISOString()
        };
        
        history.push(historyItem);
        
        // Keep only last 50 items
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
        
        await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: history });
    } catch (error) {
        console.error('Error saving to history:', error);
    }
}

/**
 * Show detailed information for a history item
 */
function showHistoryItemDetails(item) {
    const { type, input, result, timestamp } = item;
    const { isFraud, confidence, riskLevel, details } = parseResultData(result);
    
    // Format timestamp
    const date = new Date(timestamp);
    const timeString = date.toLocaleString();
    
    // Status styling
    const statusClass = isFraud ? 'fraud' : (confidence > 50 ? 'suspicious' : 'safe');
    const statusIcon = isFraud ? '🚨' : (confidence > 50 ? '⚠️' : '✅');
    const statusText = isFraud ? 'Fraudulent' : (confidence > 50 ? 'Suspicious' : 'Safe');
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'history-modal-overlay';
    modal.innerHTML = `
        <div class="history-modal">
            <div class="history-modal-header">
                <h3>Analysis Details</h3>
                <button class="close-modal-btn">&times;</button>
            </div>
            <div class="history-modal-content">
                <div class="detail-section">
                    <label>Type:</label>
                    <span class="history-type ${type}">${type.toUpperCase()}</span>
                </div>
                <div class="detail-section">
                    <label>Date:</label>
                    <span>${timeString}</span>
                </div>
                <div class="detail-section">
                    <label>Result:</label>
                    <span class="history-status ${statusClass}">
                        ${statusIcon} ${statusText} (${Math.round(confidence)}% confidence)
                    </span>
                </div>
                <div class="detail-section">
                    <label>Content:</label>
                    <div class="content-display">${type === 'image' ? 'Image file' : input}</div>
                </div>
                <div class="detail-section">
                    <label>Analysis Details:</label>
                    <div class="analysis-details">${formatDetails(details)}</div>
                </div>
            </div>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close-modal-btn');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

/**
 * Clear all history
 */
async function clearHistory() {
    try {
        await chrome.storage.local.remove([STORAGE_KEYS.HISTORY]);
        
        // Immediately update the UI
        const historyList = document.getElementById('history-list');
        const historyEmpty = document.getElementById('history-empty');
        
        historyList.innerHTML = '';
        historyEmpty.style.display = 'block';
        historyList.appendChild(historyEmpty);
        
        console.log('History cleared successfully');
    } catch (error) {
        console.error('Error clearing history:', error);
    }
}

/**
 * Load content from context menu action (if any)
 */
async function loadFromContextMenu() {
    try {
        const result = await chrome.storage.local.get(['contextMenuData']);
        if (result.contextMenuData) {
            const { type, content } = result.contextMenuData;
            
            // Switch to appropriate tab
            switchToTab(type);
            
            // Populate content
            if (type === 'text') {
                document.getElementById('text-input').value = content;
            } else if (type === 'url') {
                document.getElementById('url-input').value = content;
            }
            
            // Clear the stored data
            await chrome.storage.local.remove(['contextMenuData']);
            
            // Auto-analyze
            setTimeout(() => analyzeContent(type, content), 500);
        }
    } catch (error) {
        console.error('Error loading context menu data:', error);
    }
}

/**
 * Switch to a specific tab
 */
function switchToTab(tabName) {
    document.querySelector('.tab-btn.active').classList.remove('active');
    document.querySelector('.tab-content.active').classList.remove('active');
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    currentTab = tabName;
}

/**
 * Analyze content using the local Next.js API
 */
async function analyzeContent(type, content, saveToHistoryFlag = true) {
    showLoading();
    
    try {
        const config = API_CONFIG[type];
        if (!config) {
            throw new Error(`Unsupported analysis type: ${type}`);
        }

        let response;
        
        if (type === 'image') {
            // Handle image analysis
            const formData = new FormData();
            formData.append('image', content);
            
            response = await fetch(config.endpoint, {
                method: 'POST',
                body: formData
            });
        } else if (type === 'url') {
            // Handle URL analysis
            const payload = { url: content };
            
            response = await fetch(config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } else {
            // Handle text analysis
            const payload = { text: content };
            
            response = await fetch(config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        }
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // The local API already returns the expected format
        // Just ensure we have all required fields
        const processedResult = {
            isFraud: result.isFraud || false,
            confidence: result.confidence || 0,
            riskLevel: result.riskLevel || 'Unknown',
            details: result.explanation || result.details || 'Analysis complete',
            source: 'Fraud Fence AI'
        };
        
        // Save to history if requested
        if (saveToHistoryFlag) {
            await saveToHistory(type, content, processedResult);
        }
        
        showResults(processedResult);
        return processedResult;
        
    } catch (error) {
        console.error('Analysis error:', error);
        showError(`Analysis failed: ${error.message}. Make sure the Fraud Fence server is running at http://localhost:9005`);
        throw error;
    }
}

/**
 * Show loading state
 */
function showLoading() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
}

/**
 * Hide loading state
 */
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

/**
 * Show analysis results
 */
function showResults(data, analysisType = null) {
    hideLoading();
    
    const resultsDiv = document.getElementById('results');
    const statusDiv = document.getElementById('result-status');
    const scoreDiv = document.getElementById('result-score');
    const detailsDiv = document.getElementById('result-details');
    
    // Clear any existing page scan details
    const existingPageScanDetails = document.querySelector('.page-scan-details');
    if (existingPageScanDetails) {
        existingPageScanDetails.remove();
    }
    
    // Determine status and styling
    const { isFraud, confidence, details, riskLevel } = parseResultData(data);
    
    // Update status with analysis type if provided
    statusDiv.className = `result-status ${getRiskClass(riskLevel)}`;
    const statusText = analysisType ? `${analysisType}: ${getRiskText(riskLevel)}` : getRiskText(riskLevel);
    statusDiv.innerHTML = `${getRiskIcon(riskLevel)} ${statusText}`;
    
    // Update confidence score
    scoreDiv.textContent = `${Math.round(confidence)}% confidence`;
    
    // Update details
    const formattedDetails = analysisType === 'Page Scan' && data.pageUrl ? 
        `<strong>URL:</strong> ${data.pageUrl}<br><br>${formatDetails(details)}` : 
        formatDetails(details);
    detailsDiv.innerHTML = formattedDetails;
    
    // Show results
    resultsDiv.style.display = 'block';
}

/**
 * Parse result data from API response
 */
function parseResultData(data) {
    // Adapt this based on your actual API response format
    return {
        isFraud: data.isFraud || data.fraud || false,
        confidence: data.confidence || data.score || 0,
        details: data.details || data.analysis || 'No additional details available.',
        riskLevel: data.riskLevel || (data.isFraud ? 'fraud' : 'safe')
    };
}

/**
 * Get CSS class for risk level
 */
function getRiskClass(riskLevel) {
    switch (riskLevel.toLowerCase()) {
        case 'fraud':
        case 'high':
            return 'fraud';
        case 'suspicious':
        case 'medium':
            return 'suspicious';
        default:
            return 'safe';
    }
}

/**
 * Get icon for risk level
 */
function getRiskIcon(riskLevel) {
    switch (riskLevel.toLowerCase()) {
        case 'fraud':
        case 'high':
            return '🚨';
        case 'suspicious':
        case 'medium':
            return '⚠️';
        default:
            return '✅';
    }
}

/**
 * Get text for risk level
 */
function getRiskText(riskLevel) {
    switch (riskLevel.toLowerCase()) {
        case 'fraud':
        case 'high':
            return 'Fraud Detected';
        case 'suspicious':
        case 'medium':
            return 'Suspicious Content';
        default:
            return 'Content Looks Safe';
    }
}

/**
 * Format analysis details
 */
function formatDetails(details) {
    if (typeof details === 'string') {
        return `<p>${details}</p>`;
    }
    
    if (Array.isArray(details)) {
        return details.map(item => `<p>• ${item}</p>`).join('');
    }
    
    if (typeof details === 'object') {
        return Object.entries(details)
            .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
            .join('');
    }
    
    return '<p>Analysis complete.</p>';
}

/**
 * Show error message
 */
function showError(message) {
    hideLoading();
    
    const resultsDiv = document.getElementById('results');
    const statusDiv = document.getElementById('result-status');
    const scoreDiv = document.getElementById('result-score');
    const detailsDiv = document.getElementById('result-details');
    
    statusDiv.className = 'result-status';
    statusDiv.innerHTML = '❌ Error';
    scoreDiv.textContent = '';
    detailsDiv.innerHTML = `<p style="color: #dc3545;">${message}</p>`;
    
    resultsDiv.style.display = 'block';
}

/**
 * Clear results and reset form
 */
function clearResults() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('loading').style.display = 'none';
    
    // Reset form fields
    if (currentTab === 'text') {
        document.getElementById('text-input').value = '';
    } else if (currentTab === 'image') {
        document.getElementById('image-input').value = '';
        document.getElementById('image-preview').style.display = 'none';
        document.querySelector('.upload-placeholder').style.display = 'block';
        document.getElementById('analyze-image-btn').disabled = true;
        selectedImage = null;
    } else if (currentTab === 'url') {
        document.getElementById('url-input').value = '';
    }
}

/**
 * Report false positive to improve the system
 */
function reportFalsePositive() {
    // This could send feedback to your API
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Thank you for your feedback!',
        message: 'Your report helps us improve our fraud detection accuracy.'
    });
}

/**
 * Validate URL format
 */
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Check for recent page scan results and display them
 */
async function checkForPageScanResults() {
    try {
        const result = await chrome.storage.local.get(['pageScanResult']);
        const scanResult = result.pageScanResult;
        
        if (scanResult && scanResult.result && scanResult.result.suspiciousElements.length > 0) {
            // Check if the scan is recent (within last 2 minutes)
            const scanAge = Date.now() - scanResult.timestamp;
            if (scanAge < 120000) { // 2 minutes
                const suspiciousCount = scanResult.result.suspiciousElements.length;
                const highSeverityCount = scanResult.result.suspiciousElements.filter(el => el.severity === 'high').length;
                
                // Create a page scan result object that matches our standard format
                const displayResult = {
                    isFraud: suspiciousCount > 0,
                    confidence: highSeverityCount > 0 ? 85 : suspiciousCount > 3 ? 70 : 50,
                    riskLevel: highSeverityCount > 0 ? 'High Risk - Multiple threats detected' : 
                              suspiciousCount > 3 ? 'Medium Risk - Several suspicious elements' : 
                              'Low Risk - Few suspicious elements found',
                    details: `Page scan found ${suspiciousCount} suspicious element(s). ${
                        highSeverityCount > 0 ? `${highSeverityCount} high-severity threats detected.` : 
                        'Mostly low-to-medium severity issues.'
                    }`,
                    source: 'Page Scanner',
                    pageUrl: scanResult.url,
                    scanDetails: scanResult.result.suspiciousElements.slice(0, 5) // Show top 5
                };
                
                // Show the results immediately
                showResults(displayResult, 'Page Scan');
                
                // Add a special note about the page scan
                const resultsDiv = document.getElementById('results');
                const pageScanNote = document.createElement('div');
                pageScanNote.className = 'page-scan-details';
                pageScanNote.style.cssText = `
                    margin-top: 15px;
                    padding: 12px;
                    background: rgba(108, 117, 125, 0.1);
                    border-radius: 6px;
                    font-size: 13px;
                `;
                
                let detailsHtml = '<h4 style="margin: 0 0 8px 0; color: #495057;">Detected Issues:</h4>';
                scanResult.result.suspiciousElements.slice(0, 5).forEach((issue, index) => {
                    const severityColor = issue.severity === 'high' ? '#dc3545' : 
                                         issue.severity === 'medium' ? '#fd7e14' : '#6c757d';
                    detailsHtml += `
                        <div style="margin: 6px 0; padding: 6px; border-left: 3px solid ${severityColor}; background: rgba(255,255,255,0.5);">
                            <strong>${issue.type}</strong> 
                            <span style="font-size: 11px; color: #666;">(${issue.confidence || 50}% confidence)</span><br>
                            <span style="font-size: 12px; color: #555;">${issue.reason || issue.text}</span>
                        </div>
                    `;
                });
                
                if (scanResult.result.suspiciousElements.length > 5) {
                    detailsHtml += `<p style="margin: 8px 0 0 0; font-style: italic; color: #6c757d;">...and ${scanResult.result.suspiciousElements.length - 5} more issues</p>`;
                }
                
                pageScanNote.innerHTML = detailsHtml;
                resultsDiv.appendChild(pageScanNote);
                
                // Clear the stored result since we've shown it
                chrome.storage.local.remove(['pageScanResult']);
            }
        }
    } catch (error) {
        console.log('No recent page scan results to display');
    }
}

/**
 * Setup message listeners for context menu results
 */
function setupMessageListeners() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'context-menu-result') {
            // Display the analysis result immediately
            showResults(message.result, `Context Menu - ${message.type.charAt(0).toUpperCase() + message.type.slice(1)}`);
            sendResponse({ success: true });
        } else if (message.action === 'page-scan-result') {
            // Handle page scan results
            checkForPageScanResults();
            sendResponse({ success: true });
        }
    });
    
    // Also check for stored context results when popup opens
    checkForLatestContextResult();
}

/**
 * Check for latest context menu result when popup opens
 */
async function checkForLatestContextResult() {
    try {
        const result = await chrome.storage.local.get(['latestContextResult']);
        const contextResult = result.latestContextResult;
        
        if (contextResult && contextResult.timestamp) {
            // Check if the result is recent (within last 30 seconds)
            const resultAge = Date.now() - contextResult.timestamp;
            if (resultAge < 30000) { // 30 seconds
                // Show the result
                showResults(contextResult.result, `Context Menu - ${contextResult.type.charAt(0).toUpperCase() + contextResult.type.slice(1)}`);
                
                // Clear the stored result since we've shown it
                chrome.storage.local.remove(['latestContextResult']);
            }
        }
    } catch (error) {
        console.log('No recent context results to display');
    }
}
