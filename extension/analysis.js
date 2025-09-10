// Analysis page functionality
let analysisData = null;
let notificationCount = 0;

// Initialize analysis page
document.addEventListener('DOMContentLoaded', function() {
    initializeAnalysisPage();
    setupEventListeners();
    loadAnalysisData();
    showCustomNotification('info', 'Analysis Loaded', 'Detailed fraud analysis results are now available.');
});

/**
 * Initialize the analysis page
 */
function initializeAnalysisPage() {
    // Set initial timestamp
    document.getElementById('analysis-timestamp').textContent = new Date().toLocaleString();
    
    // Add loading animations
    animateElements();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Back to extension button
    document.getElementById('back-btn').addEventListener('click', () => {
        window.close();
    });
    
    // New analysis button
    document.getElementById('new-analysis-btn').addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
    });
    
    // Action buttons
    document.getElementById('save-analysis-btn').addEventListener('click', saveAnalysis);
    document.getElementById('share-analysis-btn').addEventListener('click', shareAnalysis);
    document.getElementById('report-false-positive-btn').addEventListener('click', reportFalsePositive);
    
    // Footer links
    document.getElementById('privacy-link').addEventListener('click', (e) => {
        e.preventDefault();
        showCustomNotification('info', 'Privacy Policy', 'Your data is processed locally and never stored on our servers.');
    });
    
    document.getElementById('terms-link').addEventListener('click', (e) => {
        e.preventDefault();
        showCustomNotification('info', 'Terms of Service', 'By using Fraud Fence, you agree to our terms and conditions.');
    });
    
    document.getElementById('support-link').addEventListener('click', (e) => {
        e.preventDefault();
        showCustomNotification('info', 'Support', 'For support, please visit our GitHub repository or contact us through the Chrome Web Store.');
    });
}

/**
 * Load analysis data from storage or URL parameters
 */
async function loadAnalysisData() {
    try {
        // Try to get data from URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const dataParam = urlParams.get('data');
        
        if (dataParam) {
            analysisData = JSON.parse(decodeURIComponent(dataParam));
        } else {
            // Fallback to storage
            const result = await chrome.storage.local.get(['latestAnalysisResult']);
            analysisData = result.latestAnalysisResult;
        }
        
        if (analysisData) {
            displayAnalysisResults(analysisData);
        } else {
            showError('No analysis data found. Please perform a new analysis.');
        }
    } catch (error) {
        console.error('Error loading analysis data:', error);
        showError('Failed to load analysis data. Please try again.');
    }
}

/**
 * Display analysis results
 */
function displayAnalysisResults(data) {
    try {
        const { confidence, riskLevel, threatTypes, explanation, contentType, originalContent } = parseAnalysisData(data);
        
        // Update analysis title and type
        document.getElementById('analysis-title').textContent = `${contentType} Analysis Results`;
        document.getElementById('analysis-type').textContent = `${contentType} Analysis`;
        
        // Update risk meter
        updateRiskMeter(confidence, riskLevel);
        
        // Display analyzed content
        displayAnalyzedContent(originalContent, contentType);
        
        // Display threats (if any)
        displayThreats(threatTypes || []);
        
        // Display detailed explanation
        displayDetailedAnalysis(explanation, confidence);
        
        showCustomNotification('success', 'Analysis Complete', `${contentType} analysis completed with ${Math.round(confidence)}% confidence.`);
        
    } catch (error) {
        console.error('Error displaying results:', error);
        showError('Failed to display analysis results.');
    }
}

/**
 * Parse analysis data
 */
function parseAnalysisData(data) {
    const confidence = data.confidence || data.score || 0;
    
    let riskLevel = 'safe';
    if (confidence > 70) {
        riskLevel = 'high';
    } else if (confidence > 40) {
        riskLevel = 'medium';
    }
    
    return {
        confidence,
        riskLevel: data.riskLevel || riskLevel,
        threatTypes: data.threatTypes || data.threats || [],
        explanation: data.explanation || data.details || data.analysis || 'Analysis completed.',
        contentType: data.contentType || data.type || 'Content',
        originalContent: data.originalContent || data.content || 'Content not available'
    };
}

/**
 * Update risk meter visualization
 */
function updateRiskMeter(confidence, riskLevel) {
    const scoreElement = document.getElementById('risk-score');
    const levelElement = document.getElementById('risk-level');
    const gaugeFill = document.getElementById('risk-gauge-fill');
    const confidenceElement = document.getElementById('ai-confidence');
    
    // Update score
    scoreElement.textContent = `${Math.round(confidence)}%`;
    confidenceElement.textContent = `${Math.round(confidence)}%`;
    
    // Update level text and colors
    let levelText = 'Low Risk';
    let scoreColor = '#059669';
    
    switch (riskLevel) {
        case 'high':
            levelText = 'High Risk';
            scoreColor = '#dc2626';
            break;
        case 'medium':
            levelText = 'Suspicious';
            scoreColor = '#d97706';
            break;
        default:
            levelText = 'Low Risk';
            scoreColor = '#059669';
    }
    
    levelElement.textContent = levelText;
    scoreElement.style.color = scoreColor;
    
    // Animate gauge fill
    setTimeout(() => {
        gaugeFill.style.width = `${confidence}%`;
    }, 500);
}

/**
 * Display analyzed content
 */
function displayAnalyzedContent(content, contentType) {
    const contentDisplay = document.getElementById('content-display');
    
    let displayContent = '';
    
    if (contentType.toLowerCase().includes('image')) {
        displayContent = `<div class="image-content">
            <div class="content-type-icon">🖼️</div>
            <div class="content-info">
                <strong>Image Analysis</strong><br>
                <span>Analyzed image content for fraudulent patterns, fake advertisements, and suspicious elements.</span>
            </div>
        </div>`;
    } else if (contentType.toLowerCase().includes('url')) {
        displayContent = `<div class="url-content">
            <div class="content-type-icon">🌐</div>
            <div class="content-info">
                <strong>URL:</strong> ${content}<br>
                <span>Analyzed website structure, content, and security patterns.</span>
            </div>
        </div>`;
    } else {
        // Text content
        const truncatedContent = content.length > 200 ? content.substring(0, 200) + '...' : content;
        displayContent = `<div class="text-content">
            <div class="content-type-icon">📝</div>
            <div class="content-text">${truncatedContent}</div>
        </div>`;
    }
    
    contentDisplay.innerHTML = displayContent;
}

/**
 * Display detected threats
 */
function displayThreats(threatTypes) {
    const threatSection = document.getElementById('threat-section');
    const threatList = document.getElementById('threat-list');
    const threatCount = document.getElementById('threat-count');
    
    if (threatTypes && threatTypes.length > 0) {
        threatSection.style.display = 'block';
        threatCount.textContent = `${threatTypes.length} threat${threatTypes.length > 1 ? 's' : ''} detected`;
        
        const threatItems = threatTypes.map(threat => `
            <div class="threat-item">
                <div class="threat-icon">⚠️</div>
                <div class="threat-info">
                    <div class="threat-name">${threat}</div>
                    <div class="threat-description">${getThreatDescription(threat)}</div>
                </div>
            </div>
        `).join('');
        
        threatList.innerHTML = threatItems;
        
        showCustomNotification('warning', 'Threats Detected', `${threatTypes.length} potential threat${threatTypes.length > 1 ? 's' : ''} identified in the content.`);
    } else {
        threatSection.style.display = 'none';
    }
}

/**
 * Get threat description
 */
function getThreatDescription(threat) {
    const descriptions = {
        'Phishing': 'Attempts to steal personal information through deceptive means',
        'Sextortion': 'Blackmail involving intimate content or images',
        'Romance Scam': 'Fraudulent romantic relationship for financial gain',
        'Investment Fraud': 'Deceptive investment opportunities with false promises',
        'Prize/Lottery Scam': 'Fake prize or lottery winnings requiring upfront payment',
        'Tech Support Scam': 'Fake technical support to gain system access',
        'Employment Scam': 'Fraudulent job opportunities for personal information',
        'Fake Advertisement': 'Misleading promotional content for products or services',
        'Phishing Page': 'Website designed to steal login credentials or personal data',
        'Investment Scam': 'Fraudulent investment platform or opportunity',
        'Fake Product': 'Counterfeit or non-existent product advertisements',
        'Phishing Site': 'Malicious website mimicking legitimate services',
        'Fake E-commerce': 'Fraudulent online shopping platform',
        'Malware Distribution': 'Website distributing malicious software'
    };
    
    return descriptions[threat] || 'Potentially harmful or deceptive content';
}

/**
 * Display detailed analysis
 */
function displayDetailedAnalysis(explanation, confidence) {
    const explanationElement = document.getElementById('analysis-explanation');
    
    // Format explanation with markdown-like styling
    let formattedExplanation = explanation;
    if (typeof explanation === 'string') {
        formattedExplanation = explanation
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }
    
    explanationElement.innerHTML = `
        <div class="analysis-summary">
            <h4>🔍 Analysis Summary</h4>
            <p>Our dual AI system has analyzed the content with <strong>${Math.round(confidence)}% confidence</strong>. 
            The analysis combines pattern recognition, content analysis, and threat detection to provide comprehensive results.</p>
        </div>
        <div class="analysis-details">
            <h4>📊 Detailed Findings</h4>
            <p>${formattedExplanation}</p>
        </div>
    `;
}

/**
 * Show error message
 */
function showError(message) {
    const explanationElement = document.getElementById('analysis-explanation');
    explanationElement.innerHTML = `
        <div class="error-message">
            <h4>❌ Error</h4>
            <p>${message}</p>
        </div>
    `;
    
    showCustomNotification('error', 'Error', message);
}

/**
 * Save analysis results
 */
async function saveAnalysis() {
    try {
        const timestamp = new Date().toISOString();
        const analysisRecord = {
            ...analysisData,
            savedAt: timestamp,
            id: generateId()
        };
        
        // Get existing saved analyses
        const result = await chrome.storage.local.get(['savedAnalyses']);
        const savedAnalyses = result.savedAnalyses || [];
        
        // Add new analysis
        savedAnalyses.unshift(analysisRecord);
        
        // Keep only last 50 analyses
        if (savedAnalyses.length > 50) {
            savedAnalyses.splice(50);
        }
        
        // Save to storage
        await chrome.storage.local.set({ savedAnalyses });
        
        showCustomNotification('success', 'Analysis Saved', 'Analysis results have been saved to your local storage.');
    } catch (error) {
        console.error('Error saving analysis:', error);
        showCustomNotification('error', 'Save Failed', 'Failed to save analysis results.');
    }
}

/**
 * Share analysis results
 */
function shareAnalysis() {
    try {
        const shareData = {
            title: 'Fraud Analysis Results - Fraud Fence',
            text: `Fraud analysis completed with ${Math.round(analysisData.confidence || 0)}% confidence. Check the results for detailed information.`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback: copy to clipboard
            const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                showCustomNotification('success', 'Copied to Clipboard', 'Analysis results have been copied to your clipboard.');
            });
        }
    } catch (error) {
        console.error('Error sharing analysis:', error);
        showCustomNotification('error', 'Share Failed', 'Failed to share analysis results.');
    }
}

/**
 * Report false positive
 */
function reportFalsePositive() {
    showCustomNotification('info', 'Report Submitted', 'Thank you for your feedback. This helps improve our AI models.');
    
    // In a real implementation, this would send data to your backend
    console.log('False positive reported for analysis:', analysisData);
}

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Animate elements on page load
 */
function animateElements() {
    const elements = document.querySelectorAll('.analysis-overview, .content-analysis, .detailed-analysis, .ai-models-info, .action-panel');
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 200 * index);
    });
}

/**
 * Custom notification system
 */
function showCustomNotification(type = 'info', title = '', message = '', duration = 5000) {
    const container = document.getElementById('notification-container');
    const notificationId = `notification-${++notificationCount}`;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.id = notificationId;
    
    const icons = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <div class="notification-header">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-title">${title}</span>
            <button class="notification-close" onclick="closeNotification('${notificationId}')">×</button>
        </div>
        ${message ? `<div class="notification-message">${message}</div>` : ''}
    `;
    
    container.appendChild(notification);
    
    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(notificationId);
        }, duration);
    }
    
    return notificationId;
}

/**
 * Close notification
 */
function closeNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
        notification.classList.add('removing');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// Make closeNotification globally available
window.closeNotification = closeNotification;
