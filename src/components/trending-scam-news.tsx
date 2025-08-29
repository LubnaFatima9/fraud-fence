
import { Rss, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from 'next/link';
import { rewriteHeadline } from "@/ai/flows/rewrite-headline";

type Article = {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
};

const placeholderData: Article[] = [
    {
        title: "Deepfake Scams on the Rise: How to Spot a Fake Video Call",
        description: "Experts warn of a new wave of scams using deepfake technology to impersonate executives and family members.",
        content: "Scammers are now using sophisticated deepfake technology to create realistic video and audio impersonations. In a recent high-profile case, a finance worker was tricked into transferring $25 million after a video call with a deepfaked CFO. To protect yourself, always verify unusual requests through a separate, trusted communication channel.",
        url: "#",
        image: "https://picsum.photos/400/200?random=1",
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: { name: "Tech Chronicle", url: "#" },
    },
    {
        title: "New 'Sextortion' Tactic Uses AI to Generate Fake Compromising Photos",
        description: "A disturbing new trend involves scammers using AI to create fake explicit images of victims and then demanding ransom.",
        content: "Authorities are reporting a surge in 'sextortion' cases where perpetrators use publicly available photos from social media to create convincing but fake compromising images. They then threaten to release these images unless the victim pays a ransom. The FBI advises never to pay, to block all communication with the scammer, and to report the incident immediately.",
        url: "#",
        image: "https://picsum.photos/400/200?random=2",
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: { name: "Cyber Security Today", url: "#" },
    },
    {
        title: "The 'Wrong Number' Fraud: How a Simple Text Can Empty Your Wallet",
        description: "A seemingly innocent 'wrong number' text can be the start of a sophisticated social engineering scam leading to investment fraud.",
        content: "The scam begins with a friendly text, seemingly sent to the wrong person. If you reply, the scammer strikes up a conversation, builds trust over days or weeks, and eventually pivots to suggesting a lucrative cryptocurrency investment. This is a classic 'pig butchering' scam, where the victim is 'fattened up' before being led to a fraudulent investment platform.",
        url: "#",
image: "https://picsum.photos/400/200?random=3",
        publishedAt: new Date(Date.now() - 259200000).toISOString(),
        source: { name: "The Financial Times", url: "#" },
    },
     {
        title: "QR Code Scams: How Fake Stickers on Parking Meters Are Draining Bank Accounts",
        description: "Scammers are placing malicious QR code stickers on public utilities like parking meters to trick users into visiting phishing sites.",
        content: "Next time you scan a QR code to pay for parking, look closely. Scammers are placing their own stickers over the legitimate codes. When scanned, these lead to a convincing but fake payment website designed to steal your credit card information and personal data. Always be cautious of QR codes in public places and double-check the URL before entering any information.",
        url: "#",
        image: "https://picsum.photos/400/200?random=4",
        publishedAt: new Date(Date.now() - 345600000).toISOString(),
        source: { name: "Local News 10", url: "#" },
    },
];


async function getTrendingNews() {
  const apiKey = "c774e589d49654444117203d1395842d";
  const query = "scam OR fraud OR deepfake OR sextortion";
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    query
  )}&lang=en&max=5&sortby=publishedAt&apikey=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Revalidate every hour
    if (!response.ok) {
      console.error("GNews API error:", response.status, response.statusText);
      return { articles: placeholderData, tickerHeadlines: placeholderData.map(a => a.title).join(" • ") };
    }
    const data = await response.json();
    const articles = data.articles || placeholderData;

    // Rewrite headlines for the ticker
    const rewrittenHeadlines = await Promise.all(
        articles.slice(0, 5).map((article: Article) => rewriteHeadline(article.title))
    );
    const tickerHeadlines = rewrittenHeadlines.join(" • ");

    return { articles, tickerHeadlines };
  } catch (error) {
    console.error("Failed to fetch trending news:", error);
    return { articles: placeholderData, tickerHeadlines: placeholderData.map(a => a.title).join(" • ") };
  }
}

export async function TrendingScamNews() {
  const { articles, tickerHeadlines } = await getTrendingNews();

  return (
    <section className="w-full bg-muted/50 py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mb-8 flex items-center gap-2">
            <Rss className="h-6 w-6 text-primary" />
            <h2 className="font-headline text-3xl font-bold tracking-tighter">
                Trending Scam News
            </h2>
        </div>

        {/* News Ticker */}
        <div className="relative mb-8 h-10 w-full overflow-hidden bg-background shadow-inner">
            <div className="absolute inset-0 flex items-center">
                 <div className="animate-marquee-infinite whitespace-nowrap pl-full">
                    <span className="mx-4 font-medium text-muted-foreground">{tickerHeadlines}</span>
                    <span className="mx-4 font-medium text-muted-foreground">{tickerHeadlines}</span>
                 </div>
            </div>
             <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-background to-transparent" />
             <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-background to-transparent" />
        </div>


        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 5).map((article, index) => (
            <Link key={index} href={article.url} target="_blank" rel="noopener noreferrer" className="group block">
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
