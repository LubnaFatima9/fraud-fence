
'use server';

import { getTrendingNews, type NewsData } from "@/lib/news";

export async function refreshNewsAction(): Promise<NewsData> {
    // This is a server action. It re-fetches and re-processes the news.
    return getTrendingNews();
}
