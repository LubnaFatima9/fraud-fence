// Simplified image fraud analysis for debugging
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

// Simple image analysis based on metadata and basic patterns
function simpleImageAnalysis(imageData: string, fileName?: string): AnalyzeImageForFraudOutput {
  console.log('🖼️ Performing simple image analysis...');
  
  let suspiciousScore = 0;
  const detectedThreats: string[] = [];
  
  // Check file extension patterns that are commonly used in scams
  if (fileName) {
    const fileNameLower = fileName.toLowerCase();
    
    // Suspicious file names
    const suspiciousNames = ['invoice', 'receipt', 'payment', 'verification', 'document', 'urgent'];
    if (suspiciousNames.some(name => fileNameLower.includes(name))) {
      suspiciousScore += 0.3;
      detectedThreats.push('Suspicious Filename');
    }
    
    // Check for executable disguised as image
    if (fileNameLower.includes('.exe') || fileNameLower.includes('.scr') || fileNameLower.includes('.bat')) {
      suspiciousScore += 0.8;
      detectedThreats.push('Executable File');
    }
  }
  
  // Check image data size (very small or very large images might be suspicious)
  const imageSizeKB = (imageData.length * 3) / 4 / 1024; // Rough base64 to KB conversion
  
  if (imageSizeKB < 1) {
    suspiciousScore += 0.2;
    detectedThreats.push('Unusually Small File');
  } else if (imageSizeKB > 10000) { // > 10MB
    suspiciousScore += 0.2;
    detectedThreats.push('Unusually Large File');
  }
  
  // Basic content type validation
  if (!imageData.startsWith('data:image/')) {
    suspiciousScore += 0.4;
    detectedThreats.push('Invalid Image Format');
  }
  
  const isFraudulent = suspiciousScore >= 0.6;
  const confidenceScore = Math.min(suspiciousScore, 0.85);
  
  let explanation = "## Image Analysis Complete\n\n";
  
  if (isFraudulent) {
    explanation += "🚨 **HIGH RISK** - This image shows signs of potential security threats.\n\n";
    explanation += "### Detected Issues:\n";
    detectedThreats.forEach(threat => {
      explanation += `- **${threat}**: Commonly associated with malicious content\n`;
    });
    explanation += "\n### Recommendations:\n";
    explanation += "- **Do not** execute or open this file if it's not a standard image\n";
    explanation += "- **Scan** with antivirus software before opening\n";
    explanation += "- **Verify** the source of this image\n";
  } else if (suspiciousScore > 0.3) {
    explanation += "⚠️ **MEDIUM RISK** - Some unusual characteristics detected.\n\n";
    explanation += "### Proceed with Caution:\n";
    explanation += "- Verify the source of this image\n";
    explanation += "- Check file properties before opening\n";
  } else {
    explanation += "✅ **LOW RISK** - Image appears to have normal characteristics.\n\n";
    explanation += "### General Safety Tips:\n";
    explanation += "- Always verify the source of images from unknown senders\n";
    explanation += "- Be cautious of images with suspicious filenames\n";
    explanation += "- Keep your antivirus software updated\n";
  }
  
  return {
    isFraudulent,
    confidenceScore,
    explanation,
    threatTypes: detectedThreats
  };
}

export async function analyzeImageForFraud(input: AnalyzeImageForFraudInput): Promise<AnalyzeImageForFraudOutput> {
  console.log('🔍 Starting simplified image analysis...');
  
  try {
    const result = simpleImageAnalysis(input.imageData, input.fileName);
    console.log('✅ Simple image analysis completed:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Image analysis failed:', error);
    
    return {
      isFraudulent: false,
      confidenceScore: 0.5,
      explanation: "**Analysis Unavailable**\n\nUnable to analyze image at this time. Please try again later.\n\n**General Safety Tips:**\n- Verify image sources\n- Scan files with antivirus\n- Be cautious of suspicious filenames",
      threatTypes: []
    };
  }
}
