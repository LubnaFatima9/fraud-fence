import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-text-fraud.ts';
import '@/ai/flows/analyze-image-fraud.ts';
import '@/ai/flows/analyze-url-fraud.ts';
import '@/ai/flows/report-fraud.ts';
import '@/ai/flows/rewrite-headline.ts';
import '@/ai/flows/try-with-fallback.ts';
