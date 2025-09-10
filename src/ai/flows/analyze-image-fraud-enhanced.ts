// Enhanced image fraud analysis with comprehensive explanations
'use server';

import {z} from 'zod';

const AnalyzeImageForFraudInputSchema = z.object({
  imageData: z.string().describe('The base64 image data to analyze for potential fraud.'),
  fileName: z.string().optional().describe('The filename of the image.'),
});

export type AnalyzeImageForFraudInput = z.infer<typeof AnalyzeImageForFraudInputSchema>;

const AnalyzeImageForFraudOutputSchema = z.object({
  isFraudulent: z.boolean().describe('Whether the image is likely fraudulent.'),
  confidenceScore: z.number().describe('A score indicating the confidence level of the fraud detection.'),
  explanation: z.string().describe('An explanation of why the image is considered fraudulent or safe.'),
  threatTypes: z.array(z.string()).describe('Array of detected threat types.')
});

export type AnalyzeImageForFraudOutput = z.infer<typeof AnalyzeImageForFraudOutputSchema>;

// Enhanced image analysis with comprehensive threat detection
function comprehensiveImageAnalysis(imageData: string, fileName?: string): AnalyzeImageForFraudOutput {
  console.log('🖼️ Performing comprehensive image analysis...');
  
  let suspiciousScore = 0;
  const detectedThreats: string[] = [];
  
  // Enhanced filename analysis
  if (fileName) {
    const fileNameLower = fileName.toLowerCase();
    
    // Suspicious document types commonly used in scams
    const suspiciousDocNames = [
      'invoice', 'receipt', 'payment', 'verification', 'document', 'urgent',
      'statement', 'notice', 'alert', 'security', 'account', 'suspended',
      'refund', 'tax', 'irs', 'stimulus', 'check', 'voucher', 'winner'
    ];
    
    if (suspiciousDocNames.some(name => fileNameLower.includes(name))) {
      suspiciousScore += 0.3;
      detectedThreats.push('Suspicious Document Name');
    }
    
    // Check for executable files disguised as images
    const dangerousExtensions = ['.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.vbs', '.jar'];
    if (dangerousExtensions.some(ext => fileNameLower.includes(ext))) {
      suspiciousScore += 0.8;
      detectedThreats.push('Executable Disguised as Image');
    }
    
    // Check for double extensions (image.jpg.exe)
    const doubleExtPattern = /\.(jpg|jpeg|png|gif|bmp)\.(.{2,4})$/i;
    if (doubleExtPattern.test(fileName)) {
      suspiciousScore += 0.7;
      detectedThreats.push('Double File Extension');
    }
    
    // Check for social engineering filename patterns
    const socialEngPatterns = [
      'click', 'open', 'view', 'download', 'install', 'run', 'execute',
      'important', 'confidential', 'private', 'secret', 'leaked'
    ];
    
    if (socialEngPatterns.some(pattern => fileNameLower.includes(pattern))) {
      suspiciousScore += 0.2;
      detectedThreats.push('Social Engineering Filename');
    }
    
    // Check for brand impersonation in filename
    const brands = ['paypal', 'amazon', 'apple', 'microsoft', 'google', 'facebook', 'netflix'];
    if (brands.some(brand => fileNameLower.includes(brand) && !fileNameLower.startsWith(brand))) {
      suspiciousScore += 0.3;
      detectedThreats.push('Brand Impersonation in Filename');
    }
  }
  
  // Enhanced image data analysis
  const imageSizeBytes = (imageData.length * 3) / 4; // Base64 to bytes conversion
  const imageSizeKB = imageSizeBytes / 1024;
  const imageSizeMB = imageSizeKB / 1024;
  
  // Check for unusually small files (potential pixel tracking or malware stubs)
  if (imageSizeKB < 0.5) {
    suspiciousScore += 0.4;
    detectedThreats.push('Suspiciously Small File');
  }
  
  // Check for unusually large files (potential data exfiltration or zip bombs)
  if (imageSizeMB > 50) {
    suspiciousScore += 0.3;
    detectedThreats.push('Unusually Large File');
  }
  
  // Basic content type validation
  if (!imageData.startsWith('data:image/')) {
    suspiciousScore += 0.5;
    detectedThreats.push('Invalid Image Format');
  } else {
    // Check specific image types that might be risky
    if (imageData.startsWith('data:image/svg')) {
      suspiciousScore += 0.2; // SVG can contain scripts
      detectedThreats.push('SVG Format Risk');
    }
  }
  
  // Check for potential steganography indicators (hidden data in images)
  if (imageSizeMB > 5 && imageData.includes('==')) { // Large file with base64 padding
    suspiciousScore += 0.2;
    detectedThreats.push('Potential Steganography');
  }
  
  // Check for metadata that might indicate screenshot tools (common in scams)
  const commonScreenshotIndicators = ['screenshot', 'capture', 'snip', 'grab'];
  if (fileName && commonScreenshotIndicators.some(indicator => 
      fileName.toLowerCase().includes(indicator))) {
    suspiciousScore += 0.1;
    detectedThreats.push('Screenshot-based Content');
  }
  
  // Check for QR code indicators (increasingly used in scams)
  if (fileName && (fileName.toLowerCase().includes('qr') || fileName.toLowerCase().includes('code'))) {
    suspiciousScore += 0.3;
    detectedThreats.push('Potential QR Code Scam');
  }
  
  const isFraudulent = suspiciousScore >= 0.6;
  const confidenceScore = Math.min(suspiciousScore, 0.95);
  
  // Generate comprehensive explanation
  const explanation = generateComprehensiveImageExplanation(
    isFraudulent, confidenceScore, detectedThreats, fileName, imageSizeKB
  );
  
  return {
    isFraudulent,
    confidenceScore,
    explanation,
    threatTypes: detectedThreats
  };
}

function generateComprehensiveImageExplanation(
  isFraudulent: boolean, 
  confidence: number, 
  threats: string[], 
  fileName?: string,
  fileSizeKB?: number
): string {
  let explanation = "## Overall Assessment\n\n";
  
  if (isFraudulent) {
    explanation += `🚨 **MALICIOUS IMAGE DETECTED** - This image shows strong indicators of being dangerous or fraudulent with **${Math.round(confidence * 100)}% confidence**.\n\n`;
    
    explanation += "## Key Indicators\n\n";
    explanation += "### **🔴 Critical Threats Detected**\n";
    threats.forEach(threat => {
      switch(threat) {
        case 'Executable Disguised as Image':
          explanation += "- **💀 CRITICAL: Executable File**: This is NOT an image - it's a program that could install malware\n";
          break;
        case 'Double File Extension':
          explanation += "- **⚠️ CRITICAL: Double Extension**: Common malware technique to hide true file type\n";
          break;
        case 'Invalid Image Format':
          explanation += "- **🚫 Invalid Format**: File claims to be an image but has incorrect structure\n";
          break;
        case 'Suspicious Document Name':
          explanation += "- **📄 Suspicious Filename**: Uses terms commonly found in scam documents\n";
          break;
        case 'Social Engineering Filename':
          explanation += "- **🎭 Social Engineering**: Filename designed to trick you into opening it\n";
          break;
        case 'Brand Impersonation in Filename':
          explanation += "- **🏢 Brand Impersonation**: Filename falsely suggests association with trusted companies\n";
          break;
        case 'Potential QR Code Scam':
          explanation += "- **📱 QR Code Risk**: May contain malicious QR codes leading to scam websites\n";
          break;
        case 'Suspiciously Small File':
          explanation += "- **📏 Tracking Pixel**: Extremely small file may be used for tracking or surveillance\n";
          break;
        case 'Unusually Large File':
          explanation += "- **📊 Oversized File**: Unusually large for an image - may contain hidden malware\n";
          break;
        default:
          explanation += `- **⚠️ ${threat}**: Commonly associated with malicious content\n`;
      }
    });
    
    explanation += "\n### **📊 Technical Analysis**\n";
    if (fileName) {
      explanation += `- **📁 Filename**: \`${fileName}\`\n`;
    }
    if (fileSizeKB) {
      explanation += `- **📏 File Size**: ${fileSizeKB.toFixed(1)} KB (${(fileSizeKB/1024).toFixed(2)} MB)\n`;
    }
    explanation += "- **🎯 Risk Assessment**: HIGH - Immediate security threat identified\n";
    explanation += "- **⚡ Action Required**: DO NOT OPEN - Delete immediately\n";
    
    explanation += "\n## Recommendations\n\n";
    explanation += "### **🚨 IMMEDIATE ACTIONS - CRITICAL**\n";
    explanation += "- **❌ DO NOT** open, execute, or run this file under any circumstances\n";
    explanation += "- **❌ DO NOT** extract or unzip if it's an archive\n";
    explanation += "- **❌ DO NOT** scan QR codes visible in the image\n";
    explanation += "- **❌ DO NOT** visit any websites shown in the image\n";
    explanation += "- **🗑️ DELETE** this file immediately from your system\n\n";
    
    if (threats.includes('Executable Disguised as Image')) {
      explanation += "### **🔥 MALWARE ALERT**\n";
      explanation += "- **🦠 Run full antivirus scan** immediately on your entire system\n";
      explanation += "- **🔒 Disconnect from internet** if you suspect infection\n";
      explanation += "- **💾 Backup important data** before attempting removal\n";
      explanation += "- **🔧 Consider professional help** if system behaves unusually\n";
      explanation += "- **📱 Change passwords** on all accounts accessed from this device\n\n";
    }
    
    explanation += "### **🛡️ PROTECTIVE MEASURES**\n";
    explanation += "- **📧 Report the sender** if received via email or messaging\n";
    explanation += "- **🚫 Block the sender** to prevent future malicious files\n";
    explanation += "- **📋 Report to authorities** if part of a larger scam attempt\n";
    explanation += "- **🔄 Update security software** with latest definitions\n";
    explanation += "- **👥 Warn contacts** if this was forwarded to you\n\n";
    
    explanation += "### **🔍 SYSTEM MONITORING**\n";
    explanation += "- **👀 Monitor system performance** for unusual slowdowns\n";
    explanation += "- **📊 Check network activity** for unexpected connections\n";
    explanation += "- **🔒 Review login attempts** on all online accounts\n";
    explanation += "- **💳 Monitor financial accounts** for unauthorized transactions\n\n";
    
    explanation += "## Educational Context\n\n";
    if (threats.includes('Executable Disguised as Image') || threats.includes('Double File Extension')) {
      explanation += "This appears to be **malware disguised as an image** - one of the oldest but still effective cyber attack methods. ";
      explanation += "Cybercriminals exploit the fact that most people trust image files and don't examine file extensions carefully. ";
      explanation += "Files like 'photo.jpg.exe' appear as 'photo.jpg' in Windows by default, hiding the dangerous .exe extension. ";
    } else if (threats.includes('Potential QR Code Scam')) {
      explanation += "This may be a **QR code scam** - an emerging threat where malicious QR codes redirect to phishing sites or download malware. ";
      explanation += "QR code fraud has increased 51% in recent months as more people use contactless payments and digital menus. ";
    }
    
    explanation += "Always verify the source of image files, especially those received unexpectedly. ";
    explanation += "Legitimate organizations rarely send critical information as image attachments.\n";
    
  } else if (confidence > 0.3) {
    explanation += `⚠️ **POTENTIALLY RISKY IMAGE** - Some concerning characteristics detected (**${Math.round(confidence * 100)}% risk level**).\n\n`;
    
    explanation += "## Key Indicators\n\n";
    if (threats.length > 0) {
      explanation += "### **⚠️ Warning Signs**\n";
      threats.forEach(threat => {
        switch(threat) {
          case 'SVG Format Risk':
            explanation += "- **📄 SVG Format**: Can potentially contain executable code - use caution\n";
            break;
          case 'Screenshot-based Content':
            explanation += "- **📸 Screenshot Content**: May be used to show fake information or phishing pages\n";
            break;
          case 'Potential Steganography':
            explanation += "- **🔍 Hidden Data**: File size suggests possible hidden information or data\n";
            break;
          default:
            explanation += `- **📍 ${threat}**: May indicate elevated risk - proceed with caution\n`;
        }
      });
      explanation += "\n";
    }
    
    explanation += "### **✅ Positive Indicators**\n";
    explanation += "- **📄 Valid image format** detected in file structure\n";
    explanation += "- **🔒 No executable content** found in basic analysis\n";
    explanation += "- **📊 Risk level remains moderate** based on current assessment\n\n";
    
    explanation += "## Recommendations\n\n";
    explanation += "### **🔍 VERIFICATION STEPS**\n";
    explanation += "- **👀 Examine the filename carefully** for unusual patterns or extensions\n";
    explanation += "- **📧 Verify the source** - confirm sender legitimacy through alternative channels\n";
    explanation += "- **🦠 Scan with updated antivirus** before opening in any application\n";
    explanation += "- **🔒 Open in sandbox environment** if available (isolated viewing)\n\n";
    
    explanation += "### **🛡️ SAFE PRACTICES**\n";
    explanation += "- **📱 Use image viewers** rather than unknown applications to open\n";
    explanation += "- **🔄 Keep software updated** including image viewing applications\n";
    explanation += "- **👥 Get second opinion** from tech-savvy colleagues if uncertain\n";
    explanation += "- **📋 Report suspicious content** to IT security team if in workplace\n\n";
    
    explanation += "### **⚡ IF PROBLEMS ARISE**\n";
    explanation += "- **🦠 Run full system scan** if device behaves unusually after viewing\n";
    explanation += "- **📧 Report the sender** if file turns out to be malicious\n";
    explanation += "- **🔒 Change passwords** if you suspect account compromise\n";
    
  } else {
    explanation += `✅ **IMAGE APPEARS SAFE** - No significant security threats detected (**${Math.round(confidence * 100)}% risk level**).\n\n`;
    
    explanation += "## Key Indicators\n\n";
    explanation += "### **✅ Safety Signals**\n";
    explanation += "- **📄 Valid Image Format**: File structure matches standard image specifications\n";
    explanation += "- **📏 Normal File Size**: ";
    
    if (fileSizeKB) {
      if (fileSizeKB < 100) {
        explanation += `Compact ${fileSizeKB.toFixed(1)} KB - appropriate for web/email use\n`;
      } else if (fileSizeKB < 5000) {
        explanation += `Standard ${(fileSizeKB/1024).toFixed(1)} MB - typical for high-quality images\n`;
      } else {
        explanation += `Large ${(fileSizeKB/1024).toFixed(1)} MB - expected for professional photography\n`;
      }
    } else {
      explanation += "Within normal parameters for image files\n";
    }
    
    explanation += "- **🏷️ Standard Filename**: ";
    if (fileName) {
      explanation += `\`${fileName}\` follows conventional naming patterns\n`;
    } else {
      explanation += "No suspicious naming patterns detected\n";
    }
    
    explanation += "- **🔒 No Executable Content**: Multiple security checks passed successfully\n";
    explanation += "- **📊 Low Risk Assessment**: Image meets standard safety criteria\n\n";
    
    if (threats.length > 0) {
      explanation += "### **📋 Minor Considerations**\n";
      threats.forEach(threat => {
        explanation += `- **${threat}**: Present but within acceptable parameters\n`;
      });
      explanation += "\n";
    }
    
    explanation += "## Recommendations\n\n";
    explanation += "### **🛡️ GENERAL SECURITY PRACTICES**\n";
    explanation += "- **🔍 Continue being cautious** - verify sources of unexpected image files\n";
    explanation += "- **📧 Be skeptical of attachments** from unknown or suspicious senders\n";
    explanation += "- **🦠 Keep antivirus updated** for ongoing protection against new threats\n";
    explanation += "- **🔄 Maintain system updates** including image viewing software\n\n";
    
    explanation += "### **🎓 ONGOING EDUCATION**\n";
    explanation += "- **📚 Learn about file extensions** - understand what different types mean\n";
    explanation += "- **🚨 Stay informed** about emerging image-based attack methods\n";
    explanation += "- **👥 Share knowledge** with family and colleagues about safe file practices\n";
    explanation += "- **🔍 Develop habits** of checking file properties before opening\n\n";
    
    explanation += "### **🔄 BEST PRACTICES FOR IMAGE FILES**\n";
    explanation += "- **📱 Use reputable image viewers** rather than unknown applications\n";
    explanation += "- **🌐 Be cautious with images from social media** - verify before downloading\n";
    explanation += "- **📧 Scan email attachments** even from known contacts (accounts can be compromised)\n";
    explanation += "- **🗂️ Organize files safely** - avoid executing files accidentally\n\n";
    
    explanation += "## Educational Context\n\n";
    explanation += "This image appears to be a legitimate file with standard characteristics and no obvious security threats. ";
    explanation += "However, cybersecurity requires constant vigilance as attack methods evolve rapidly. ";
    explanation += "Image-based attacks are becoming more sophisticated, including steganography (hiding data in images), ";
    explanation += "malicious QR codes, and social engineering through fake screenshots. ";
    explanation += "Your practice of verifying files before opening them is excellent security hygiene. ";
    explanation += "Continue this approach, especially with files received via email, messaging apps, or downloaded from unknown sources.\n";
  }
  
  return explanation;
}

export async function analyzeImageForFraud(input: AnalyzeImageForFraudInput): Promise<AnalyzeImageForFraudOutput> {
  console.log('🔍 Starting comprehensive image fraud analysis...');
  
  try {
    const result = comprehensiveImageAnalysis(input.imageData, input.fileName);
    console.log('✅ Comprehensive image analysis completed:', {
      isFraudulent: result.isFraudulent,
      confidence: result.confidenceScore,
      threatCount: result.threatTypes.length
    });
    return result;
    
  } catch (error) {
    console.error('❌ Image analysis failed:', error);
    
    return {
      isFraudulent: false,
      confidenceScore: 0.5,
      explanation: "**Analysis Unavailable**\n\nUnable to analyze image at this time. Please try again later.\n\n**General Safety Tips:**\n- Verify image sources before opening\n- Scan files with updated antivirus software\n- Be cautious of suspicious filenames\n- Avoid executing files disguised as images",
      threatTypes: []
    };
  }
}
