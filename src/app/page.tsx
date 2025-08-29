
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { FraudAnalyzer } from '@/components/fraud-analyzer';
import { ExtensionPromo } from '@/components/extension-promo';
import { TrendingScamNews } from '@/components/trending-scam-news';
import { getTrendingNews } from '@/lib/news';
import { format } from 'date-fns';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const newsData = await getTrendingNews();

  const initialNews = {
    ...newsData,
    articles: newsData.articles.map(article => ({
      ...article,
      // Pre-format the date on the server to prevent hydration mismatch
      formattedDate: format(new Date(article.publishedAt), 'MMM d, yyyy'),
    })),
  };


  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden">
         <div 
            className="absolute inset-0 z-[-1] dark:bg-gradient-to-r dark:from-magenta-900 via-purple-900 to-blue-900"
         />
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center animate-fade-in-up">
              <div className="space-y-2">
                <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-foreground dark:text-white">
                  Advanced Fraud Detection
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground dark:text-gray-200 md:text-xl">
                  Leverage AI to analyze text, images, and URLs for potential scams and fraudulent activity. Stay one step ahead of online threats.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-4xl pt-12">
              <FraudAnalyzer />
            </div>
          </div>
        </section>
        <TrendingScamNews initialNews={initialNews} />
        <ExtensionPromo />
      </main>
      <AppFooter />
    </div>
  );
}
