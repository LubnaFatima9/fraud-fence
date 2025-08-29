
"use client";

import { useState, useTransition } from "react";
import { Rss, TrendingUp, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from 'next/link';
import { getTrendingNews, type NewsData } from "@/lib/news";
import { Button } from "./ui/button";

async function refreshNewsAction(): Promise<NewsData> {
    'use server';
    // This is a server action. It re-fetches and re-processes the news.
    return getTrendingNews();
}

export function TrendingScamNews({ initialNews }: { initialNews: NewsData }) {
  const [isPending, startTransition] = useTransition();
  const [news, setNews] = useState(initialNews);

  const handleRefresh = () => {
    startTransition(async () => {
        const freshNews = await refreshNewsAction();
        setNews(freshNews);
    });
  };


  return (
    <section className="w-full bg-muted/50 py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <Rss className="h-6 w-6 text-primary" />
                <h2 className="font-headline text-3xl font-bold tracking-tighter">
                    Trending Scam News
                </h2>
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={isPending}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
                {isPending ? 'Refreshing...' : 'Refresh'}
            </Button>
        </div>

        {/* News Ticker */}
        <div className="relative mb-8 h-10 w-full overflow-hidden bg-background shadow-inner">
            <div className="absolute inset-0 flex items-center">
                 <div className="animate-marquee-infinite whitespace-nowrap pl-full">
                    <span className="mx-4 font-medium text-muted-foreground">{news.tickerHeadlines}</span>
                    <span className="mx-4 font-medium text-muted-foreground">{news.tickerHeadlines}</span>
                 </div>
            </div>
             <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-background to-transparent" />
             <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-background to-transparent" />
        </div>


        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.articles.slice(0, 5).map((article, index) => (
            <Link key={article.url + index} href={article.url} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow duration-300 hover:shadow-lg">
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
                            {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
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
