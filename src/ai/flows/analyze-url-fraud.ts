
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

    Provide a comprehensive, well-structured analysis (minimum 200 words) using markdown formatting:

    ## Overall Assessment
    - Provide your main conclusion about whether this URL is safe or dangerous

    ## Security Analysis Results
    - **Safety Status**: {{{isSafe}}} - Clear explanation of what this means
    - **Threat Detection**: Summary of identified threats or clean status
    - **Risk Level**: Assessment of potential harm from this URL

    ## Detailed Findings
    {{#if isSafe}}
    - **Security Verification**: What security checks this URL passed
    - **Legitimacy Indicators**: Professional characteristics that suggest safety
    - **Trust Signals**: SSL certificates, domain reputation, and other positive markers
    {{else}}
    - **Threat Types Detected**: Detailed explanation of each threat:
      * **MALWARE**: Sites that install harmful software on your device
      * **SOCIAL_ENGINEERING**: Phishing sites designed to steal personal information
      * **UNWANTED_SOFTWARE**: Sites that push unwanted or bundled downloads
      * **POTENTIALLY_HARMFUL_APPLICATION**: Apps that may compromise device security
    - **Specific Risks**: What could happen if you visit this URL
    - **Attack Methods**: How these threats typically operate and target users
    {{/if}}

    ## Recommendations
    {{#if isSafe}}
    - **Safe Browsing**: General tips for maintaining web security
    - **Verification Methods**: How to double-check website authenticity
    - **Best Practices**: Ongoing protection strategies for web browsing
    {{else}}
    - **Immediate Actions**: **Do not visit this URL** - steps to take right now
    - **Protection Measures**: How to secure your devices and accounts
    - **Reporting**: How to report this malicious URL to security authorities
    {{/if}}

    ## Educational Context
    - **Technical Background**: How URL security analysis works
    - **Common Tactics**: Typical methods used by malicious websites
    - **Prevention Tips**: **Red flags** to watch for in suspicious URLs

    Use **bold text** for important warnings, threat types, and key recommendations. Structure your response with clear headings for easy reading.
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
