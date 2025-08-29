
import { rewriteHeadlines } from "@/ai/flows/rewrite-headline";

export type Article = {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url:string;
  };
};

export type NewsData = {
    articles: Article[];
    tickerHeadlines: string[];
}

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

export async function getTrendingNews(): Promise<NewsData> {
  const apiKey = "c774e589d49654444117203d1395842d";
  const query = "scam OR fraud OR deepfake OR sextortion";
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    query
  )}&lang=en&max=5&sortby=publishedAt&apikey=${apiKey}`;

  try {
    // We fetch with no-cache to ensure we get fresh data on every call.
    const response = await fetch(url, { cache: 'no-store' }); 
    if (!response.ok) {
      console.error("GNews API error:", response.status, response.statusText);
      const placeholderHeadlines = placeholderData.map(a => a.title);
      return { articles: placeholderData, tickerHeadlines: placeholderHeadlines };
    }
    const data = await response.json();
    const articles: Article[] = data.articles && data.articles.length > 0 ? data.articles.slice(0, 5) : placeholderData;

    // Rewrite headlines for the ticker
    const originalHeadlines = articles.map((article: Article) => article.title);

    let rewrittenHeadlines: string[];
    try {
        rewrittenHeadlines = await rewriteHeadlines(originalHeadlines);
        if (rewrittenHeadlines.length !== originalHeadlines.length) {
          // If the AI didn't return the same number of headlines, fall back to the originals.
          rewrittenHeadlines = originalHeadlines;
        }
    } catch (rewriteError) {
        console.error("Headline rewrite failed, falling back to original headlines:", rewriteError);
        rewrittenHeadlines = originalHeadlines;
    }

    return { articles, tickerHeadlines: rewrittenHeadlines };
  } catch (error) {
    console.error("Failed to fetch trending news:", error);
    const placeholderHeadlines = placeholderData.map(a => a.title);
    return { articles: placeholderData, tickerHeadlines: placeholderHeadlines };
  }
}
