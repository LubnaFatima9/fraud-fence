
'use server';

/**
 * @fileOverview Flow for analyzing images for fraud using the Cogniflow AI model and providing a GenAI explanation.
 *
 * - analyzeImageForFraud - Analyzes an image for potential fraud.
 * - AnalyzeImageForFraudInput - The input type for the analyzeImageForFraud function.
 * - AnalyzeImageForFraudOutput - The return type for the analyzeImageForFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageForFraudInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to check for fraud, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type AnalyzeImageForFraudInput = z.infer<typeof AnalyzeImageForFraudInputSchema>;

const AnalyzeImageForFraudOutputSchema = z.object({
  isFraudulent: z
    .boolean()
    .describe('Whether the image is determined to be fraudulent or not.'),
  confidenceScore: z.number().describe('The confidence score of the fraud detection.'),
  explanation: z.string().describe('An explanation of why the image is considered fraudulent or safe, highlighting specific indicators.'),
  threatTypes: z.array(z.string()).describe('Array of detected threat types (e.g., Fake Advertisement, Phishing Page, Investment Scam).'),
});
export type AnalyzeImageForFraudOutput = z.infer<typeof AnalyzeImageForFraudOutputSchema>;

export async function analyzeImageForFraud(input: AnalyzeImageForFraudInput): Promise<AnalyzeImageForFraudOutput> {
  return analyzeImageForFraudFlow(input);
}

const fraudImageAnalysisPrompt = ai.definePrompt({
  name: 'fraudImageAnalysisPrompt',
  input: { schema: z.object({
      photoDataUri: AnalyzeImageForFraudInputSchema.shape.photoDataUri,
  }) },
  output: { schema: z.object({
    isFraudulent: z.boolean(),
    confidenceScore: z.number(),
    explanation: z.string(),
  }) },
  prompt: `You are an expert digital forensics analyst specializing in identifying fraudulent and deceptive visual content. Analyze the provided image for fraud indicators and scam patterns.

  Image to analyze:
  {{media url=photoDataUri}}
  
  Examine this image carefully for:
  - Suspicious text elements (poor grammar, urgency language, unrealistic offers)
  - Visual manipulation signs (inconsistent lighting, artifacts, poor quality edits)
  - Branding inconsistencies (fake logos, unofficial designs, color mismatches)
  - Phishing indicators (fake login forms, suspicious URLs, credential requests)
  - Scam patterns (too-good-to-be-true offers, pyramid schemes, fake testimonials)
  - Technical red flags (low resolution, compression artifacts, watermark removal)
  
  Provide your assessment:
  - isFraudulent: true if you detect fraud indicators, false if it appears legitimate
  - confidenceScore: your confidence level (0.0 to 1.0, where 1.0 is completely certain)
  - explanation: brief analysis of why you classified it this way
  
  Be conservative - mark as fraud if there are clear warning signs, but don't flag legitimate content.`,
});

const fraudImageExplanationPrompt = ai.definePrompt({
  name: 'fraudImageExplanationPrompt',
  input: { schema: z.object({
      photoDataUri: AnalyzeImageForFraudInputSchema.shape.photoDataUri,
      isFraudulent: z.boolean(),
      confidenceScore: z.number(),
  }) },
  output: { schema: z.object({
    explanation: AnalyzeImageForFraudOutputSchema.shape.explanation,
  }) },
  prompt: `You are an expert digital forensics analyst specializing in identifying fraudulent and deceptive visual content. Your expertise includes recognizing manipulated images, fake advertisements, phishing graphics, and other visual scam tactics.

  Analysis from specialized fraud detection model:
  - Classification Result: {{{isFraudulent}}} (fraud detected: true/false)  
  - Model Confidence: {{{confidenceScore}}} (0-1 scale)
  
  Image to analyze:
  {{media url=photoDataUri}}
  
  Provide a comprehensive, well-structured explanation (minimum 200 words) using markdown formatting:

  ## Overall Assessment
  - Provide your main conclusion about whether this image is fraudulent or safe
  
  ## Visual Analysis
  - **Image Quality**: Assess resolution, compression artifacts, and editing signs
  - **Text Elements**: Evaluate fonts, alignment, grammar, and professional appearance
  - **Branding & Design**: Check logos, colors, layout consistency and professionalism
  - **Technical Indicators**: Look for manipulation artifacts, inconsistent lighting, or digital anomalies
  
  ## Key Findings
  - **Red Flags Detected**: List specific suspicious visual elements (use **bold** for emphasis)
  - **Legitimacy Indicators**: Note any professional or authentic aspects if present
  
  ## Detailed Analysis
  - **Psychological Tactics**: How visual elements create urgency or manipulate emotions
  - **Common Scam Patterns**: Typical characteristics of this type of visual fraud
  - **Technical Details**: Specific editing artifacts or inconsistencies found
  
  ## Recommendations
  - **Immediate Actions**: What the user should do with this image
  - **Verification Tips**: How to check if similar images are legitimate
  - **Prevention Advice**: How to spot similar visual scams in the future
  
  ## Educational Context
  - Brief explanation of this type of visual fraud and why it's effective
  - Technical background on image manipulation detection methods
  
  Use **bold text** for important terms, red flags, and key recommendations. Structure your response with clear headings for easy reading.
  Your response must be in JSON format containing only the 'explanation' field.
  Your response must be in JSON format and contain only the 'explanation' field.
  `,
});


const analyzeImageForFraudFlow = ai.defineFlow(
  {
    name: 'analyzeImageForFraudFlow',
    inputSchema: AnalyzeImageForFraudInputSchema,
    outputSchema: AnalyzeImageForFraudOutputSchema,
  },
  async input => {
    // Dual AI Analysis: Analyze using both Cogniflow and Gemini, then average the results
    const cogniflowApiKey = '764ea05f-f623-4c7f-919b-dac6cf7223f3';
    const cogniflowModelId = 'ba056844-ddea-47fb-b6f5-9adcf567cbae';
    const url = `https://predict.cogniflow.ai/image/llm-classification/predict/${cogniflowModelId}`;

    const base64Image = input.photoDataUri.split(',')[1];
    const mimeType = input.photoDataUri.match(/data:(image\/(\w+));base64,/)?.[1] || 'image/jpeg';
    const imageFormat = mimeType.split('/')[1];

    let cogniflowResult = { isFraudulent: false, confidenceScore: 0.5, available: false };
    let geminiResult = { isFraudulent: false, confidenceScore: 0.5, available: false };

    // Parallel analysis - Cogniflow and Gemini
    const [cogniflowResponse, geminiResponse] = await Promise.allSettled([
        // Cogniflow analysis
        fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': cogniflowApiKey,
            },
            body: JSON.stringify({
                base64_image: base64Image,
                format: imageFormat,
            }),
        }),
        // Gemini analysis - using existing visual analysis prompt
        fraudImageAnalysisPrompt({ photoDataUri: input.photoDataUri })
    ]);

    // Process Cogniflow result
    if (cogniflowResponse.status === 'fulfilled' && cogniflowResponse.value.ok) {
        try {
            const result = await cogniflowResponse.value.json();
            console.log('🖼️ Cogniflow Image API Response:', result);
            
            if (result.result && Array.isArray(result.result)) {
                const primaryPrediction = result.result.find((r: any) => r.match === true);
                
                if (primaryPrediction) {
                    console.log('🎯 Cogniflow Primary Image Prediction:', primaryPrediction);
                    
                    const predictionName = (primaryPrediction.name || '').toLowerCase();
                    cogniflowResult.isFraudulent = predictionName === 'scam' || 
                                  predictionName === 'fraud' || 
                                  predictionName === 'fraudulent' ||
                                  predictionName.includes('scam') ||
                                  predictionName.includes('fraud') ||
                                  predictionName.includes('phishing');
                                  
                    cogniflowResult.confidenceScore = primaryPrediction.score || 0;
                    cogniflowResult.available = true;
                    
                    console.log('🔍 Cogniflow Image Analysis Result:', cogniflowResult);
                } else {
                    console.warn('⚠️ No matching prediction found in Cogniflow image results');
                }
            } else {
                console.warn('⚠️ Unexpected Cogniflow image response format:', result);
            }
        } catch (error) {
            console.warn('⚠️ Error parsing Cogniflow image response:', error);
        }
    } else {
        console.warn('⚠️ Cogniflow image API request failed');
    }

    // Process Gemini result
    if (geminiResponse.status === 'fulfilled' && geminiResponse.value.output) {
        const geminiOutput = geminiResponse.value.output;
        geminiResult.isFraudulent = geminiOutput.isFraudulent || false;
        geminiResult.confidenceScore = geminiOutput.confidenceScore || 0.5;
        geminiResult.available = true;
        
        console.log('🤖 Gemini Image Analysis Result:', geminiResult);
    } else {
        console.warn('⚠️ Gemini image analysis failed');
    }

    // Combine results using weighted average (both AI systems contribute equally)
    let isFraudulent, confidenceScore;
    
    if (cogniflowResult.available && geminiResult.available) {
        // Both available - average the confidence scores
        const avgConfidence = (cogniflowResult.confidenceScore + geminiResult.confidenceScore) / 2;
        const fraudVotes = (cogniflowResult.isFraudulent ? 1 : 0) + (geminiResult.isFraudulent ? 1 : 0);
        
        isFraudulent = fraudVotes >= 1; // If either detects fraud, mark as fraud
        confidenceScore = fraudVotes === 2 ? Math.max(avgConfidence, 0.7) : // Both agree on fraud
                         fraudVotes === 1 ? avgConfidence : // Mixed results
                         Math.min(avgConfidence, 0.4); // Both agree it's safe
        
        console.log('🔄 Dual AI Image Analysis - Averaged Result:', { 
            isFraudulent, 
            confidenceScore, 
            cogniflow: cogniflowResult, 
            gemini: geminiResult 
        });
    } else if (cogniflowResult.available) {
        // Only Cogniflow available
        isFraudulent = cogniflowResult.isFraudulent;
        confidenceScore = cogniflowResult.confidenceScore;
        console.log('📱 Using Cogniflow only for images (Gemini unavailable)');
    } else if (geminiResult.available) {
        // Only Gemini available
        isFraudulent = geminiResult.isFraudulent;
        confidenceScore = geminiResult.confidenceScore;
        console.log('🤖 Using Gemini only for images (Cogniflow unavailable)');
    } else {
        // Both failed - fallback
        throw new Error("Both Cogniflow and Gemini image analysis failed.");
    }
    
    let explanation = "An AI explanation could not be generated at this time.";

    try {
      // Now, use a generative model to explain *why*.
      const { output } = await fraudImageExplanationPrompt({
          ...input,
          isFraudulent,
          confidenceScore
      });
      if (output?.explanation) {
        explanation = output.explanation;
      }
    } catch (error) {
      console.error("GenAI explanation for image fraud failed:", error);
      // Fallback to the ault explanation already set
    }


    // Classify threat types based on image analysis results
    const threatTypes: string[] = [];
    
    if (isFraudulent) {
      // Analyze the explanation text for threat indicators
      const explanationLower = explanation.toLowerCase();
      
      // Fake advertisement detection
      if (explanationLower.includes('advertisement') || explanationLower.includes('too good to be true') ||
          explanationLower.includes('unrealistic') && explanationLower.includes('offer')) {
        threatTypes.push('Fake Advertisement');
      }
      
      // Phishing page detection
      if (explanationLower.includes('login') || explanationLower.includes('password') ||
          explanationLower.includes('credential') || explanationLower.includes('phishing')) {
        threatTypes.push('Phishing Page');
      }
      
      // Investment scam detection
      if (explanationLower.includes('investment') || explanationLower.includes('cryptocurrency') ||
          explanationLower.includes('trading') || explanationLower.includes('profit')) {
        threatTypes.push('Investment Scam');
      }
      
      // Fake social media post
      if (explanationLower.includes('social media') || explanationLower.includes('fake profile') ||
          explanationLower.includes('testimonial') || explanationLower.includes('review')) {
        threatTypes.push('Fake Social Media');
      }
      
      // Fake app/software
      if (explanationLower.includes('software') || explanationLower.includes('download') ||
          explanationLower.includes('malware') || explanationLower.includes('virus')) {
        threatTypes.push('Malicious Software');
      }
      
      // Fake document/certificate
      if (explanationLower.includes('document') || explanationLower.includes('certificate') ||
          explanationLower.includes('official') || explanationLower.includes('government')) {
        threatTypes.push('Fake Document');
      }
      
      // Generic if no specific type detected
      if (threatTypes.length === 0) {
        threatTypes.push('Suspicious Image');
      }
    }

    // Combine the results, using the specialized model's verdict and the generative model's explanation.
    return {
      isFraudulent,
      confidenceScore,
      explanation: explanation,
      threatTypes,
    };
  }
);
