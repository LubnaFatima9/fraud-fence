// Debug logging
console.log('🔧 Loading popup.js...');

// API Configuration - Local Next.js endpoints
const API_BASE_URL = 'http://localhost:9005/api';

const API_CONFIG = {
    text: {
        endpoint: `${API_BASE_URL}/text-detect`,
        type: 'local'
    },
    image: {
        endpoint: `${API_BASE_URL}/image-detect`,
        type: 'local'
    },
    url: {
        endpoint: `${API_BASE_URL}/url-detect`,
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

// Statistics tracking
let analysisCount = 0;
let threatCount = 0;

console.log('🔧 Popup.js loaded, setting up DOM listener...');

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Fraud Fence popup initializing...');
    
    try {
        console.log('📋 Initializing tabs...');
        initializeTabs();
        console.log('🖼️ Initializing image upload...');
        initializeImageUpload();
        console.log('🔍 Initializing analyze buttons...');
        initializeAnalyzeButtons();
        console.log('⚡ Initializing result actions...');
        initializeResultActions();
        console.log('📚 Initializing history...');
        initializeHistory();
        
        console.log('🔄 Setting up async functions...');
        // Initialize async functions with error handling
        setTimeout(() => {
            console.log('📭 Loading context menu...');
            loadFromContextMenu().catch(e => console.log('📭 Context menu load skipped:', e.message));
            console.log('🌐 Checking current URL...');
            checkCurrentPageUrl().catch(e => console.log('📭 URL check skipped:', e.message));
            console.log('📄 Checking page scan results...');
            checkForPageScanResults().catch(e => console.log('📭 Page scan check skipped:', e.message));
            console.log('📊 Loading stats...');
            loadStats().catch(e => console.log('📊 Stats loading skipped:', e.message));
        }, 100);
        
        console.log('📨 Setting up message listeners...');
        setupMessageListeners();
        
        console.log('✅ Fraud Fence popup initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing popup:', error);
    }
});

console.log('🔧 DOM event listener set up');

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
        // Check if chrome.tabs API is available
        if (!chrome.tabs || !chrome.tabs.query) {
            console.log('📭 Chrome tabs API not available');
            return;
        }
        
        // Get current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) {
            console.log('📭 No active tab found');
            return;
        }
        
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
        
        try {
            // Analyze the URL
            const result = await analyzeContent('url', tab.url, false); // Don't save to history automatically
            displayCurrentUrlResult(result, tab.url);
        } catch (analysisError) {
            // Show safe status if analysis fails
            document.getElementById('current-url-status').innerHTML = `
                <div class="status-safe">
                    ℹ️ Analysis unavailable
                </div>
            `;
            document.getElementById('current-url-details').innerHTML = `
                <div class="url-text">${tab.url}</div>
                <small>Connect to local server for URL analysis</small>
            `;
            console.log('URL analysis skipped - server not available:', analysisError.message);
        }
        
    } catch (error) {
        console.error('Error checking current URL:', error);
        document.getElementById('current-url-status').innerHTML = `
            <div class="status-safe">
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
    document.getElementById('clear-results')?.addEventListener('click', clearResults);
    document.getElementById('report-issue')?.addEventListener('click', () => {
        showCustomNotification('info', 'Report Submitted', 'Thank you for reporting this issue. Our team will review it.');
    });
    document.getElementById('view-details')?.addEventListener('click', openDetailedAnalysis);
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
                        ${statusIcon} ${statusText} (${Math.round(confidence)}% fraud risk)
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
    
    // Clear any existing page scan details
    const existingPageScanDetails = document.querySelector('.page-scan-details');
    if (existingPageScanDetails) {
        existingPageScanDetails.remove();
    }
    
    // Parse result data
    const { isFraud, confidence, details, riskLevel, threatTypes, explanation } = parseResultData(data);
    
    // Update fraud meter
    updateFraudMeter(confidence, riskLevel);
    
    // Update result header
    updateResultHeader(riskLevel, analysisType);
    
    // Update threat types (if available)
    updateThreatTypes(threatTypes || []);
    
    // Update analysis details
    updateAnalysisDetails(explanation || details, data.pageUrl);
    
    // Store analysis data globally for detailed view
    window.currentAnalysisData = {
        confidence,
        riskLevel,
        threatTypes: threatTypes || [],
        explanation: explanation || details,
        contentType: analysisType || 'Content',
        originalContent: data.originalContent || data.content || 'Content analyzed',
        timestamp: new Date().toISOString(),
        ...data
    };
    
    // Update statistics
    const hasThreats = (threatTypes && threatTypes.length > 0) || confidence > 70;
    incrementStats(hasThreats);
    
    // Show results
    resultsDiv.style.display = 'block';
}

function updateFraudMeter(confidence, riskLevel) {
    const percentage = document.querySelector('.percentage');
    const riskLevelSpan = document.querySelector('.risk-level');
    const progressBar = document.querySelector('.progress-bar');
    const meterSection = document.querySelector('.fraud-meter-section');
    
    if (!percentage || !riskLevelSpan || !progressBar || !meterSection) return;
    
    // Update percentage
    percentage.textContent = `${Math.round(confidence)}%`;
    
    // Update risk level text and colors
    const riskClass = getRiskClass(riskLevel);
    meterSection.className = `fraud-meter-section risk-${riskClass}`;
    
    let riskText = '';
    switch (riskClass) {
        case 'high':
            riskText = 'High Risk';
            break;
        case 'medium':
            riskText = 'Suspicious';
            break;
        default:
            riskText = 'Low Risk';
    }
    riskLevelSpan.textContent = riskText;
    
    // Animate progress bar
    setTimeout(() => {
        progressBar.style.width = `${confidence}%`;
    }, 100);
}

function updateResultHeader(riskLevel, analysisType) {
    const resultIcon = document.querySelector('.result-icon');
    const resultTitle = document.querySelector('.result-title');
    const resultSubtitle = document.querySelector('.result-subtitle');
    
    if (!resultIcon || !resultTitle || !resultSubtitle) return;
    
    const icon = getRiskIcon(riskLevel);
    const title = getRiskText(riskLevel);
    const subtitle = analysisType ? `Analysis Type: ${analysisType}` : 'Fraud Detection Analysis';
    
    resultIcon.textContent = icon;
    resultTitle.textContent = title;
    resultSubtitle.textContent = subtitle;
}

function updateThreatTypes(threatTypes) {
    const threatSection = document.querySelector('.threat-types-section');
    const threatBadges = document.querySelector('.threat-badges');
    
    if (!threatSection || !threatBadges) return;
    
    if (threatTypes && threatTypes.length > 0) {
        threatSection.style.display = 'block';
        threatBadges.innerHTML = threatTypes
            .map(threat => `<span class="threat-badge">${threat}</span>`)
            .join('');
    } else {
        threatSection.style.display = 'none';
    }
}

function updateAnalysisDetails(details, pageUrl) {
    const analysisContent = document.querySelector('.analysis-content');
    
    if (!analysisContent) return;
    
    let formattedDetails = '';
    
    if (pageUrl) {
        formattedDetails += `**URL Analyzed:** ${pageUrl}\n\n`;
    }
    
    if (typeof details === 'string') {
        formattedDetails += details;
    } else if (Array.isArray(details)) {
        formattedDetails += details.join('\n\n');
    } else if (typeof details === 'object') {
        formattedDetails += Object.entries(details)
            .map(([key, value]) => `**${key}:** ${value}`)
            .join('\n\n');
    } else {
        formattedDetails += 'Analysis completed successfully.';
    }
    
    // Convert markdown-like formatting to HTML
    const htmlContent = formattedDetails
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    analysisContent.innerHTML = `<p>${htmlContent}</p>`;
}

/**
 * Parse result data from API response
 */
function parseResultData(data) {
    // Handle confidence score - convert from 0-1 to 0-100 if needed
    let confidence = data.confidenceScore || data.confidence || data.score || 0;
    
    // Convert decimal confidence (0-1) to percentage (0-100)
    if (confidence <= 1 && confidence >= 0) {
        confidence = confidence * 100;
    }
    
    const isFraud = data.isFraudulent || data.isFraud || data.fraud || confidence > 70;
    
    // Determine risk level based on confidence
    let riskLevel = 'Low';
    if (confidence > 70) {
        riskLevel = 'High';
    } else if (confidence > 40) {
        riskLevel = 'Medium';
    }
    
    return {
        isFraud,
        confidence: Math.round(confidence), // Ensure it's a whole number
        details: data.details || data.analysis || 'No additional details available.',
        riskLevel: data.riskLevel || riskLevel,
        threatTypes: data.threatTypes || data.threats || [],
        explanation: data.explanation || data.details || data.analysis
    };
}

/**
 * Get CSS class for risk level
 */
function getRiskClass(riskLevel) {
    switch (riskLevel.toLowerCase()) {
        case 'fraud':
        case 'high':
            return 'high';
        case 'suspicious':
        case 'medium':
            return 'medium';
        default:
            return 'low';
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
    
    // Update fraud meter to show error state
    const percentage = document.querySelector('.percentage');
    const riskLevelSpan = document.querySelector('.risk-level');
    const progressBar = document.querySelector('.progress-bar');
    const meterSection = document.querySelector('.fraud-meter-section');
    
    if (percentage) percentage.textContent = '0%';
    if (riskLevelSpan) riskLevelSpan.textContent = 'Error';
    if (progressBar) progressBar.style.width = '0%';
    if (meterSection) meterSection.className = 'fraud-meter-section';
    
    // Update result header for error
    const resultIcon = document.querySelector('.result-icon');
    const resultTitle = document.querySelector('.result-title');
    const resultSubtitle = document.querySelector('.result-subtitle');
    
    if (resultIcon) resultIcon.textContent = '❌';
    if (resultTitle) resultTitle.textContent = 'Analysis Error';
    if (resultSubtitle) resultSubtitle.textContent = 'Unable to complete analysis';
    
    // Hide threat types section
    const threatSection = document.querySelector('.threat-types-section');
    if (threatSection) threatSection.style.display = 'none';
    
    // Update analysis details with error message
    const analysisContent = document.querySelector('.analysis-content');
    if (analysisContent) {
        analysisContent.innerHTML = `<p style="color: #dc2626;"><strong>Error:</strong> ${message}</p>`;
    }
    
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
        console.log('📨 Popup received message:', message);
        
        try {
            if (message.action === 'context-menu-result') {
                // Display the analysis result immediately
                showResults(message.result, `Context Menu - ${message.type.charAt(0).toUpperCase() + message.type.slice(1)}`);
                sendResponse({ success: true });
                return true; // Keep message channel open for async response
            } else if (message.action === 'page-scan-result') {
                // Handle page scan results
                checkForPageScanResults();
                sendResponse({ success: true });
                return true; // Keep message channel open for async response
            }
        } catch (error) {
            console.error('❌ Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
        
        return true; // Keep message channel open
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

/**
 * Open detailed analysis in a new browser tab/window
 */
function openDetailedAnalysis() {
    try {
        console.log('🔍 Opening detailed analysis in new tab...');
        
        if (!window.currentAnalysisData) {
            showNotification('No Data', 'Please run an analysis first before viewing details.');
            return;
        }
        
        // Open analysis in new tab using chrome.tabs API
        openAnalysisInNewTab(window.currentAnalysisData);
        
        console.log('✅ Detailed analysis tab opened');
        
    } catch (error) {
        console.error('❌ Error opening detailed analysis:', error);
        showNotification('Error', `Failed to open detailed analysis: ${error.message}`);
    }
}

/**
 * Create full-screen modal for detailed analysis
 */
function createFullScreenAnalysisModal(analysisData) {
    // Remove existing modal if present
    const existingModal = document.getElementById('full-analysis-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'full-analysis-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px 20px;
        animation: fadeIn 0.3s ease-out;
    `;
    
    // Create modal content container
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 20px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        max-width: 900px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Parse analysis data
    const { isFraud, confidence, riskLevel, details } = parseResultData(analysisData);
    const score = confidence || 0;
    const statusClass = isFraud ? 'fraud' : (confidence > 50 ? 'suspicious' : 'safe');
    const statusIcon = isFraud ? '🚨' : (confidence > 50 ? '⚠️' : '✅');
    const statusText = isFraud ? 'Fraudulent Content Detected' : (confidence > 50 ? 'Suspicious Content' : 'Content Appears Safe');
    
    modalContent.innerHTML = `
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(-50px) scale(0.95); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
            }
            
            .modal-header {
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                color: white;
                padding: 30px 40px;
                border-radius: 20px 20px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-title {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .modal-title h2 {
                font-size: 28px;
                font-weight: 700;
                margin: 0;
            }
            
            .close-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .close-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }
            
            .modal-body {
                padding: 40px;
            }
            
            .status-banner {
                background: ${statusClass === 'fraud' ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' : 
                           statusClass === 'suspicious' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 
                           'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'};
                border: 2px solid ${statusClass === 'fraud' ? '#ef4444' : statusClass === 'suspicious' ? '#f59e0b' : '#10b981'};
                border-radius: 15px;
                padding: 25px;
                margin-bottom: 30px;
                text-align: center;
            }
            
            .status-icon {
                font-size: 48px;
                margin-bottom: 15px;
                display: block;
            }
            
            .status-title {
                font-size: 24px;
                font-weight: 700;
                color: ${statusClass === 'fraud' ? '#dc2626' : statusClass === 'suspicious' ? '#d97706' : '#059669'};
                margin-bottom: 10px;
            }
            
            .confidence-score {
                font-size: 20px;
                font-weight: 600;
                color: #374151;
            }
            
            .analysis-section {
                background: #f8fafc;
                border-radius: 15px;
                padding: 25px;
                margin-bottom: 20px;
                border-left: 4px solid #4f46e5;
            }
            
            .section-title {
                font-size: 20px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .explanation-content {
                line-height: 1.7;
                color: #4b5563;
                font-size: 16px;
            }
            
            .explanation-content h2, .explanation-content h3 {
                color: #1f2937;
                margin: 20px 0 10px 0;
            }
            
            .explanation-content h2 {
                font-size: 22px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 8px;
            }
            
            .explanation-content h3 {
                font-size: 18px;
            }
            
            .explanation-content strong {
                font-weight: 700;
                color: #1f2937;
            }
            
            .explanation-content ul {
                margin: 10px 0 10px 20px;
            }
            
            .explanation-content li {
                margin-bottom: 8px;
            }
            
            .tech-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            
            .tech-item {
                background: white;
                padding: 15px;
                border-radius: 10px;
                border: 1px solid #e5e7eb;
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .tech-label {
                font-size: 14px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .tech-value {
                font-size: 16px;
                font-weight: 700;
                color: #1f2937;
            }
            
            .threat-badges {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 15px;
            }
            
            .threat-badge {
                background: #fee2e2;
                color: #dc2626;
                padding: 8px 16px;
                border-radius: 25px;
                font-weight: 600;
                font-size: 14px;
                border: 1px solid #fecaca;
            }
        </style>
        
        <div class="modal-header">
            <div class="modal-title">
                <span>🛡️</span>
                <h2>Detailed Fraud Analysis</h2>
            </div>
            <button class="close-btn" id="close-modal">×</button>
        </div>
        
        <div class="modal-body">
            <div class="status-banner">
                <span class="status-icon">${statusIcon}</span>
                <div class="status-title">${statusText}</div>
                <div class="confidence-score">Fraud Risk Level: ${Math.round(score)}%</div>
            </div>
            
            <div class="analysis-section">
                <h3 class="section-title">
                    <span>📋</span>
                    Detailed Analysis
                </h3>
                <div class="explanation-content" id="modal-explanation">
                    ${formatAnalysisExplanation(analysisData.explanation || 'No detailed explanation available.')}
                </div>
            </div>
            
            ${analysisData.threatTypes && analysisData.threatTypes.length > 0 ? `
                <div class="analysis-section">
                    <h3 class="section-title">
                        <span>⚠️</span>
                        Detected Threats
                    </h3>
                    <div class="threat-badges">
                        ${analysisData.threatTypes.map(threat => `<span class="threat-badge">${threat}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="analysis-section">
                <h3 class="section-title">
                    <span>🔧</span>
                    Technical Information
                </h3>
                <div class="tech-grid">
                    <div class="tech-item">
                        <span class="tech-label">Analysis Type</span>
                        <span class="tech-value">${analysisData.type || 'General'}</span>
                    </div>
                    <div class="tech-item">
                        <span class="tech-label">Risk Level</span>
                        <span class="tech-value">${riskLevel}</span>
                    </div>
                    <div class="tech-item">
                        <span class="tech-label">Fraud Risk Score</span>
                        <span class="tech-value">${Math.round(score)}%</span>
                    </div>
                    <div class="tech-item">
                        <span class="tech-label">Timestamp</span>
                        <span class="tech-value">${new Date().toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Add close functionality
    const closeBtn = modal.querySelector('#close-modal');
    const closeModal = () => modal.remove();
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // ESC key to close
    document.addEventListener('keydown', function escapeClose(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeClose);
        }
    });
}

/**
 * Open analysis results in a new browser tab
 */
function openAnalysisInNewTab(analysisData) {
    // Parse the analysis data
    const { isFraud, confidence, riskLevel, details } = parseResultData(analysisData);
    const score = confidence || 0;
    const statusClass = isFraud ? 'fraud' : (confidence > 60 ? 'suspicious' : 'safe');
    const statusIcon = isFraud ? '🚨' : (confidence > 60 ? '⚠️' : '✅');
    const statusText = isFraud ? 'Fraudulent Content Detected' : (confidence > 60 ? 'Suspicious Content' : 'Content Appears Safe');
    
    // Create the HTML content for the new tab
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fraud Analysis Results - FraudFence</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
            color: #333;
        }
        
        .analysis-container {
            max-width: 900px;
            margin: 0 auto;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
            from { transform: translateY(-30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .modal-header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .modal-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 10px;
        }
        
        .modal-title h1 {
            font-size: 32px;
            font-weight: 700;
            margin: 0;
        }
        
        .subtitle {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .modal-body {
            padding: 40px;
        }
        
        .status-banner {
            background: ${statusClass === 'fraud' ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' : 
                       statusClass === 'suspicious' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 
                       'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'};
            border: 3px solid ${statusClass === 'fraud' ? '#ef4444' : statusClass === 'suspicious' ? '#f59e0b' : '#10b981'};
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .status-icon {
            font-size: 64px;
            margin-bottom: 20px;
            display: block;
        }
        
        .status-title {
            font-size: 28px;
            font-weight: 700;
            color: ${statusClass === 'fraud' ? '#dc2626' : statusClass === 'suspicious' ? '#d97706' : '#059669'};
            margin-bottom: 15px;
        }
        
        .fraud-score {
            font-size: 24px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 20px;
        }
        
        .fraud-meter {
            width: 100%;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 15px;
        }
        
        .fraud-meter-fill {
            height: 100%;
            background: ${statusClass === 'fraud' ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 
                        statusClass === 'suspicious' ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 
                        'linear-gradient(90deg, #10b981, #059669)'};
            width: ${score}%;
            border-radius: 10px;
            transition: width 1s ease-out;
        }
        
        .meter-labels {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #6b7280;
        }
        
        .analysis-section {
            background: #f8fafc;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 25px;
            border-left: 5px solid #4f46e5;
        }
        
        .section-title {
            font-size: 24px;
            font-weight: 700;
            color: #374151;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .explanation-content {
            line-height: 1.8;
            color: #4b5563;
            font-size: 16px;
        }
        
        .explanation-content h2, .explanation-content h3 {
            color: #1f2937;
            margin: 25px 0 15px 0;
        }
        
        .explanation-content h2 {
            font-size: 24px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        
        .explanation-content h3 {
            font-size: 20px;
        }
        
        .explanation-content strong {
            font-weight: 700;
            color: #1f2937;
        }
        
        .explanation-content ul {
            margin: 15px 0 15px 25px;
        }
        
        .explanation-content li {
            margin-bottom: 10px;
        }
        
        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-top: 25px;
        }
        
        .tech-item {
            background: white;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .tech-label {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
            margin-bottom: 8px;
            display: block;
        }
        
        .tech-value {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
        }
        
        .threat-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 20px;
        }
        
        .threat-badge {
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            color: #dc2626;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
            border: 1px solid #fecaca;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer a {
            color: #4f46e5;
            text-decoration: none;
            font-weight: 600;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="analysis-container">
        <div class="modal-header">
            <div class="modal-title">
                <span>🛡️</span>
                <h1>FraudFence Analysis</h1>
            </div>
            <div class="subtitle">Detailed Fraud Detection Results</div>
        </div>
        
        <div class="modal-body">
            <div class="status-banner">
                <span class="status-icon">${statusIcon}</span>
                <div class="status-title">${statusText}</div>
                <div class="fraud-score">Fraud Risk Level: ${score}%</div>
                <div class="fraud-meter">
                    <div class="fraud-meter-fill"></div>
                </div>
                <div class="meter-labels">
                    <span>Safe (0%)</span>
                    <span>Moderate (50%)</span>
                    <span>High Risk (100%)</span>
                </div>
            </div>
            
            <div class="analysis-section">
                <h3 class="section-title">
                    <span>📋</span>
                    Detailed Analysis Report
                </h3>
                <div class="explanation-content">
                    ${formatAnalysisExplanation(analysisData.explanation || 'No detailed explanation available.')}
                </div>
            </div>
            
            ${analysisData.threatTypes && analysisData.threatTypes.length > 0 ? `
                <div class="analysis-section">
                    <h3 class="section-title">
                        <span>⚠️</span>
                        Detected Threat Categories
                    </h3>
                    <div class="threat-badges">
                        ${analysisData.threatTypes.map(threat => `<span class="threat-badge">${threat}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="analysis-section">
                <h3 class="section-title">
                    <span>🔧</span>
                    Technical Analysis Details
                </h3>
                <div class="tech-grid">
                    <div class="tech-item">
                        <span class="tech-label">Analysis Type</span>
                        <span class="tech-value">${analysisData.type || 'General'}</span>
                    </div>
                    <div class="tech-item">
                        <span class="tech-label">Risk Category</span>
                        <span class="tech-value">${riskLevel}</span>
                    </div>
                    <div class="tech-item">
                        <span class="tech-label">Fraud Risk Score</span>
                        <span class="tech-value">${score}%</span>
                    </div>
                    <div class="tech-item">
                        <span class="tech-label">Analysis Time</span>
                        <span class="tech-value">${new Date().toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Analysis provided by <a href="https://fraud-fence.vercel.app" target="_blank">FraudFence</a> - Advanced Fraud Detection System</p>
        </div>
    </div>
</body>
</html>`;

    // Convert to data URL
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
    
    // Open in new tab
    chrome.tabs.create({
        url: dataUrl,
        active: true
    });
}

/**
 * Format analysis explanation with proper HTML rendering
 */
function formatAnalysisExplanation(explanation) {
    if (!explanation) return 'No detailed explanation available.';
    
    return explanation
        // Convert markdown headers
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        // Convert bold text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Convert bullet points
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        // Wrap consecutive list items in ul
        .replace(/(<li>.*<\/li>\s*)+/gs, (match) => `<ul>${match}</ul>`)
        // Convert line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/^\s*/, '<p>')
        .replace(/\s*$/, '</p>')
        // Clean up empty paragraphs
        .replace(/<p>\s*<\/p>/g, '')
        .replace(/<p>\s*<h/g, '<h')
        .replace(/h>\s*<\/p>/g, 'h>');
}

/**
 * Populate detailed analysis view with data (legacy function - kept for compatibility)
 */
function populateDetailedAnalysis(data) {
    try {
        // Update score and meter
        const score = data.confidence || 0;
        document.getElementById('detailed-score').textContent = `${Math.round(score)}%`;
        
        // Update meter fill based on confidence
        const meterFill = document.getElementById('detailed-meter-fill');
        if (meterFill) {
            const fillPercentage = Math.min(Math.max(score, 0), 100);
            meterFill.style.width = `${fillPercentage}%`;
            
            // Set color based on risk level
            if (score >= 70) {
                meterFill.style.backgroundColor = '#ef4444'; // Red for high risk
            } else if (score >= 30) {
                meterFill.style.backgroundColor = '#f59e0b'; // Yellow for medium risk
            } else {
                meterFill.style.backgroundColor = '#10b981'; // Green for low risk
            }
        }
        
        // Update explanation
        const explanation = data.explanation || 'No detailed explanation available.';
        const explanationElement = document.getElementById('detailed-explanation');
        if (explanationElement) {
            // Convert markdown-like formatting
            const formattedExplanation = explanation
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');
            explanationElement.innerHTML = formattedExplanation;
        }
        
        // Update threats section
        if (data.threats && data.threats.length > 0) {
            const threatsSection = document.getElementById('detailed-threats');
            const threatBadges = document.getElementById('threat-badges');
            
            if (threatBadges) {
                threatBadges.innerHTML = data.threats.map(threat => 
                    `<span class="threat-badge threat-${threat.toLowerCase().replace(/\s+/g, '-')}">${threat}</span>`
                ).join('');
                threatsSection.style.display = 'block';
            }
        }
        
        // Update technical info
        document.getElementById('analysis-type-detail').textContent = data.type || 'Unknown';
        document.getElementById('confidence-detail').textContent = `${Math.round(data.confidence || 0)}%`;
        
        // Determine risk level
        const riskLevel = data.confidence >= 70 ? 'High Risk' : 
                         data.confidence >= 30 ? 'Medium Risk' : 'Low Risk';
        document.getElementById('risk-level-detail').textContent = riskLevel;
        document.getElementById('analysis-time-detail').textContent = new Date().toLocaleString();
        
    } catch (error) {
        console.error('❌ Error populating detailed analysis:', error);
    }
}

/**
 * Download analysis results as JSON
 */
function downloadAnalysisJSON() {
    try {
        if (!window.currentAnalysisData) {
            showNotification('No Data', 'No analysis data available to download.');
            return;
        }
        
        const dataStr = JSON.stringify(window.currentAnalysisData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `fraud-analysis-${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        showNotification('Download Complete', 'Analysis results saved as JSON file.');
        console.log('✅ JSON download completed');
        
    } catch (error) {
        console.error('❌ Error downloading JSON:', error);
        showNotification('Download Error', 'Failed to download analysis results.');
    }
}

/**
 * Chrome-style notification system
 */
function showNotification(title, message, type = 'basic') {
    // Use Chrome notifications API
    if (chrome.notifications) {
        const notificationOptions = {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: title,
            message: message
        };
        
        chrome.notifications.create(notificationOptions, (notificationId) => {
            if (chrome.runtime.lastError) {
                console.log('Notification error:', chrome.runtime.lastError);
                // Fallback to simple alert
                alert(`${title}: ${message}`);
            } else {
                console.log('Notification created:', notificationId);
            }
        });
    } else {
        // Fallback to alert
        alert(`${title}: ${message}`);
    }
}

/**
 * Legacy function name for compatibility
 */
function showCustomNotification(type = 'info', title = '', message = '') {
    showNotification(title, message, type);
}

/**
 * Close notification
 */
function closeNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// Make closeNotification globally available
window.closeNotification = closeNotification;

/**
 * Load statistics from storage
 */
async function loadStats() {
    try {
        // Check if chrome.storage API is available
        if (!chrome.storage || !chrome.storage.local) {
            console.log('📭 Chrome storage API not available');
            return;
        }
        
        const result = await chrome.storage.local.get(['analysisCount', 'threatCount']);
        analysisCount = result.analysisCount || 0;
        threatCount = result.threatCount || 0;
        updateStatsDisplay();
        console.log('📊 Stats loaded:', { analysisCount, threatCount });
    } catch (error) {
        console.error('❌ Error loading stats:', error);
    }
}

/**
 * Update statistics display in header
 */
function updateStatsDisplay() {
    const analysisCountSpan = document.querySelector('.stat-value:first-child');
    const threatCountSpan = document.querySelector('.stat-value:last-child');
    
    if (analysisCountSpan) analysisCountSpan.textContent = analysisCount.toLocaleString();
    if (threatCountSpan) threatCountSpan.textContent = threatCount.toLocaleString();
}

/**
 * Increment analysis statistics
 */
async function incrementStats(isThreats = false) {
    analysisCount++;
    if (isThreats) {
        threatCount++;
    }
    
    // Save to storage
    await chrome.storage.local.set({
        analysisCount: analysisCount,
        threatCount: threatCount
    });
    
    updateStatsDisplay();
}

console.log('🔧 Making functions globally available...');

// Make all functions globally available for debugging
try {
    window.openDetailedAnalysis = openDetailedAnalysis;
    console.log('✅ openDetailedAnalysis assigned');
    window.showCustomNotification = showCustomNotification;
    console.log('✅ showCustomNotification assigned');
    window.incrementStats = incrementStats;
    console.log('✅ incrementStats assigned');
    window.loadStats = loadStats;
    console.log('✅ loadStats assigned');
    
    console.log('✅ Popup.js loaded completely - all functions available');
} catch (error) {
    console.error('❌ Error assigning global functions:', error);
}
