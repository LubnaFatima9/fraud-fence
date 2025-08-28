'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing URLs for potential fraud using the Google Safe Browsing API.
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
});
export type AnalyzeUrlOutput = z.infer<typeof AnalyzeUrlOutputSchema>;

export async function analyzeUrlForFraud(input: AnalyzeUrlInput): Promise<AnalyzeUrlOutput> {
  return analyzeUrlFlow(input);
}

const googleSafeBrowsingApiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

const analyzeUrlFlow = ai.defineFlow(
  {
    name: 'analyzeUrlFlow',
    inputSchema: AnalyzeUrlInputSchema,
    outputSchema: AnalyzeUrlOutputSchema,
  },
  async input => {
    if (!googleSafeBrowsingApiKey) {
      throw new Error(
        'Google Safe Browsing API key is missing. Set the GOOGLE_SAFE_BROWSING_API_KEY environment variable.'
      );
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
        url: input.url,
        platformType: 'ANY_PLATFORM',
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

    return {
      isSafe: isSafe,
      threatTypes: threatTypes,
    };
  }
);
