"use client";

import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Chrome } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ExtensionPromo() {
  const { toast } = useToast();
  
  const handleDownloadExtension = () => {
    // In a real application, this would link to the Chrome Web Store
    // For now, we'll show a toast with instructions
    toast({
      title: "Extension Download",
      description: "Extension development is in progress. Check back soon for the Chrome Web Store link!",
    });
    
    // You can also open a link to the extension folder or GitHub repo
    // window.open('https://chrome.google.com/webstore/detail/fraud-fence/extension-id', '_blank');
  };

  return (
    <section 
      id="extension-promo" 
      className="w-full bg-primary/5 backdrop-blur-sm border-t border-b border-primary/10 dark:bg-gradient-to-r dark:from-primary/10 dark:to-secondary/10"
    >
      <div className="container px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-24">
        <div className="grid gap-6 lg:gap-10 items-center text-center lg:text-left lg:grid-cols-2">
          {/* Content Section */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            <div className="space-y-2 sm:space-y-3">
              <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-foreground">
                Take FraudFence With You
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed max-w-[600px] mx-auto lg:mx-0">
                Protect yourself everywhere you go online. Our browser extension provides real-time fraud alerts right in your browser.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={handleDownloadExtension}
                className="flex-1 sm:flex-none hover:scale-105 transition-transform"
              >
                <Chrome className="mr-2 h-5 w-5" />
                Download for Chrome
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 sm:flex-none"
                asChild
              >
                <a 
                  href="https://github.com/LubnaFatima9/fraud-fence" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Source
                </a>
              </Button>
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground/80">
              Coming soon to Firefox and Safari • Free and Open Source
            </p>
          </div>

          {/* Visual/Feature Section */}
          <div className="order-1 lg:order-2">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg border p-4 sm:p-6 md:p-8 shadow-lg">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Real-time fraud detection</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Context menu analysis</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-medium">Page scanning alerts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}