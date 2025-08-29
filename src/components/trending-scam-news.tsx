
"use client";

import { useState, useEffect } from "react";
import { Rss, TrendingUp } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from 'next/link';
import { type NewsData } from "@/lib/news";

export function TrendingScamNews({ initialNews }: { initialNews: NewsData }) {
  const [news] = useState(initialNews);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render, to prevent hydration mismatch.
    setIsClient(true);
  }, []);

  const tickerText = news.tickerHeadlines.join(" • ");

  return (
    <section className="w-full bg-muted/50 py-12 md:py-24 dark:bg-gradient-to-br dark:from-blue-950 dark:via-purple-950 dark:to-slate-900">
      <div className="container px-4 md:px-6">
        <div className="mb-8 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
                <Rss className="h-6 w-6 text-primary" />
                <h2 className="font-headline text-3xl font-bold tracking-tighter">
                    Trending Scam News
                </h2>
            </div>
            <p className="text-sm text-muted-foreground">
                News automatically updates hourly.
            </p>
        </div>

        {/* News Ticker */}
        <div className="relative mb-8 h-10 w-full overflow-hidden bg-background shadow-inner">
            <div className="absolute inset-0 flex items-center">
                 <div className="animate-marquee-infinite whitespace-nowrap pl-full">
                    <span className="mx-4 font-medium text-muted-foreground">{tickerText}</span>
                    <span className="mx-4 font-medium text-muted-foreground">{tickerText}</span>
                 </div>
            </div>
             <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-background to-transparent" />
             <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-background to-transparent" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.articles.slice(0, 5).map((article, index) => (
            <Link key={article.url + index} href={article.url} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-headline text-lg font-bold leading-tight group-hover:text-primary">
                            {article.title}
                            </h3>
                            <TrendingUp className="ml-2 h-5 w-5 shrink-0 text-green-500" />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                            {article.description}
                        </p>
                    </div>
                    <div className="mt-auto border-t p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{article.source.name}</span>
                            <time dateTime={article.publishedAt}>
                                {isClient
                                  ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
                                  : format(new Date(article.publishedAt), 'MMM d, yyyy')
                                }
                            </time>
                        </div>
                    </div>
                </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
