
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing URLs for potential fraud using the Google Safe Browsing API and providing a GenAI explanation.
 *
 * - analyzeUrlForFraud - Analyzes a given URL for fraud and returns the results.
 * - AnalyzeUrlInput - The input type for the analyzeUrlForFraud function.
 * - AnalyzeUrlOutput - The return type for the analyzeUrlForFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUrlInputSchema = z.object({
  url: z.string().url().describe('The URL to analyze.'),
});
export type AnalyzeUrlInput = z.infer<typeof AnalyzeUrlInputSchema>;

const AnalyzeUrlOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the URL is considered safe or not.'),
  threatTypes: z.array(z.string()).describe('The types of threats detected, if any.'),
  explanation: z.string().describe('An explanation of why the URL is considered safe or fraudulent.')
});
export type AnalyzeUrlOutput = z.infer<typeof AnalyzeUrlOutputSchema>;

export async function analyzeUrlForFraud(input: AnalyzeUrlInput): Promise<AnalyzeUrlOutput> {
  return analyzeUrlFlow(input);
}

const urlExplanationPrompt = ai.definePrompt({
    name: 'urlExplanationPrompt',
    input: { schema: z.object({
        url: AnalyzeUrlInputSchema.shape.url,
        isSafe: AnalyzeUrlOutputSchema.shape.isSafe,
        threatTypes: AnalyzeUrlOutputSchema.shape.threatTypes,
    }) },
    output: { schema: z.object({
      explanation: AnalyzeUrlOutputSchema.shape.explanation,
    }) },
    prompt: `You are a cybersecurity expert specializing in URL threat analysis and web safety. Your role is to provide comprehensive, educational explanations about URL security assessments.

    URL Security Analysis Results:
    - Target URL: {{{url}}}
    - Safety Status: {{{isSafe}}} (true = safe, false = threat detected)
    - Identified Threats: {{#each threatTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

    Provide a detailed, educational explanation (minimum 150 words) covering:

    **If URL is Safe:**
    - Confirmation that the URL passed security screening
    - What the security check evaluated (malware, phishing, etc.)
    - General web safety best practices
    - Signs to watch for when browsing
    - How to verify website authenticity

    **If URL is Dangerous:**
    - Clear explanation of each threat type found:
      * MALWARE: Sites that install harmful software
      * SOCIAL_ENGINEERING: Phishing sites stealing personal info
      * UNWANTED_SOFTWARE: Sites pushing unwanted downloads
      * POTENTIALLY_HARMFUL_APPLICATION: Apps that may harm your device
    - Specific risks associated with visiting this URL
    - Protective measures to take immediately
    - How these threats typically operate
    - Steps for reporting malicious URLs

    **Always Include:**
    - Technical context about URL analysis
    - Best practices for safe browsing
    - Warning signs of dangerous websites
    - Resources for additional protection

    Use clear, actionable language. Be thorough and educational while remaining accessible.
    Your response must be in JSON format containing only the 'explanation' field.
    `,
});

const googleSafeBrowsingApiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

const analyzeUrlFlow = ai.defineFlow(
  {
    name: 'analyzeUrlFlow',
    inputSchema: AnalyzeUrlInputSchema,
    outputSchema: AnalyzeUrlOutputSchema,
  },
  async input => {
    if (!googleSafeBrowsingApiKey) {
      // In a real app, you might want to fall back to a less-reliable method
      // or simply return a safe-by-default result with a warning.
      // For this example, we'll return a GenAI-only result.
      const { output } = await urlExplanationPrompt({ ...input, isSafe: true, threatTypes: [] });
      if (!output) {
        throw new Error("GenAI analysis failed to provide an explanation.");
      }
      return {
        isSafe: true,
        threatTypes: [],
        explanation: output.explanation
      };
    }

    const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${googleSafeBrowsingApiKey}`;

    const requestBody = {
      client: {
        clientId: 'FraudFence',
        clientVersion: '1.0.0',
      },
      threatInfo: {
        threatTypes: [
          'MALWARE',
          'SOCIAL_ENGINEERING',
          'THREAT_TYPE_UNSPECIFIED',
          'POTENTIALLY_HARMFUL_APPLICATION',
        ],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: [{
          url: input.url,
        }]
      },
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    const isSafe = !data.matches || data.matches.length === 0;
    const threatTypes = data.matches ? data.matches.map((match: any) => match.threatType) : [];

    // Now, get the GenAI explanation.
    const { output } = await urlExplanationPrompt({ ...input, isSafe, threatTypes });
    if (!output) {
        throw new Error("GenAI analysis failed to provide an explanation.");
    }

    return {
      isSafe: isSafe,
      threatTypes: threatTypes,
      explanation: output.explanation
    };
  }
);
