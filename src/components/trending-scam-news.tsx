
"use client";

import { useState } from "react";
import { Rss, TrendingUp } from "lucide-react";
import { ExtensionSafeExternalLink } from './extension-safe-external-link';

// Update NewsData to expect the formatted date
import type { NewsData as BaseNewsData, Article as BaseArticle } from "@/lib/news";
export type Article = BaseArticle & { formattedDate: string };
export type NewsData = Omit<BaseNewsData, 'articles'> & { articles: Article[] };


export function TrendingScamNews({ initialNews }: { initialNews: NewsData }) {
  const [news] = useState(initialNews);

  const tickerText = news.tickerHeadlines.join(" • ");

  return (
    <section className="w-full bg-muted/50 py-8 sm:py-12 md:py-16 lg:py-24 dark:bg-transparent">
      <div className="container px-4 sm:px-6 md:px-8">
        <div className="mb-6 sm:mb-8 flex flex-col items-start gap-3 sm:gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
                <Rss className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="font-headline text-2xl sm:text-3xl font-bold tracking-tighter">
                    Trending Scam News
                </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
                News automatically updates hourly.
            </p>
        </div>

        {/* News Ticker */}
        <div className="relative mb-6 sm:mb-8 h-8 sm:h-10 w-full overflow-hidden bg-background shadow-inner rounded">
            <div className="absolute inset-0 flex items-center">
                 <div className="animate-marquee-infinite whitespace-nowrap pl-full">
                    <span className="mx-4 font-medium text-muted-foreground text-sm">{tickerText}</span>
                    <span className="mx-4 font-medium text-muted-foreground text-sm">{tickerText}</span>
                 </div>
            </div>
             <div className="absolute left-0 top-0 h-full w-12 sm:w-16 bg-gradient-to-r from-background to-transparent" />
             <div className="absolute right-0 top-0 h-full w-12 sm:w-16 bg-gradient-to-l from-background to-transparent" />
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3" suppressHydrationWarning>
          {news.articles.slice(0, 6).map((article, index) => (
            <ExtensionSafeExternalLink 
              key={article.url + index} 
              href={article.url}
              className="group block"
            >
                <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    <div className="p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="font-headline text-sm sm:text-base lg:text-lg font-bold leading-tight group-hover:text-primary line-clamp-3">
                            {article.title}
                            </h3>
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-green-500 mt-1" />
                        </div>
                        <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">
                            {article.description}
                        </p>
                    </div>
                    <div className="mt-auto border-t p-3 sm:p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="truncate mr-2 font-medium">{article.source.name}</span>
                            <time dateTime={article.publishedAt} className="shrink-0">
                                {article.formattedDate}
                            </time>
                        </div>
                    </div>
                </div>
            </ExtensionSafeExternalLink>
          ))}
        </div>
      </div>
    </section>
  );
}
