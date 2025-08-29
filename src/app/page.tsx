
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { FraudAnalyzer } from '@/components/fraud-analyzer';
import { ExtensionPromo } from '@/components/extension-promo';
import { TrendingScamNews } from '@/components/trending-scam-news';
import { getTrendingNews } from '@/lib/news';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const initialNews = await getTrendingNews();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden">
         <div 
            className="absolute inset-0 z-[-1]"
            style={{
                backgroundImage: 'linear-gradient(to right, #6d00c2, #001f8a, #000000)',
            }}
         />
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center animate-fade-in-up">
              <div className="space-y-2">
                <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                  Advanced Fraud Detection
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
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
